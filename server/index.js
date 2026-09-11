import './load-env.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import express from 'express';
import { createDb, COLLECTIONS } from './db.js';
import { seedDatabase } from './seed.js';
import { hashPassword, verifyPassword, signToken as signJwt, verifyToken } from './crypto-auth.js';
import {
  authRequired,
  requireRole,
  applyRoleBasedFilters,
  canModifyRecord,
  userHasRole,
  userRolesOf,
  PUBLIC_READ_COLLECTIONS,
  PUBLIC_CREATE_COLLECTIONS,
} from './rbac.js';
import { schemas, validate, schemaForRole } from './validation.js';
import {
  sendVerificationEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendAppointmentConfirmationEmail,
} from './email.js';
import { createNotification, notifyAppointmentConfirmed, notifyUsersByHospital, qrCodeUrl } from './notifications.js';
import { migrateToNewSchema } from './migrations.js';
import { searchHospitals, searchDoctors } from './search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 4000);

const app = express();
const server = http.createServer(app);
const sseClients = new Set();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '8mb' }));

let db;

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function signToken(user) {
  const roles = userRolesOf(user);
  return signJwt({
    id: user.id,
    role: user.primaryRole || user.role || roles[0],
    roles,
    primaryRole: user.primaryRole || user.role || roles[0],
    name: user.name,
  });
}

function broadcast(event) {
  const payload = `data: ${JSON.stringify({
    event: event.event || 'update',
    collection: event.collection,
    action: event.action,
    id: event.id || event.record?.id || event.data?.id,
    data: event.data || event.record,
    record: event.record || event.data,
    timestamp: new Date().toISOString(),
    ...event,
  })}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

function userData(user) {
  if (!user) return {};
  return {
    patientId: user.patientId || user.data?.patientId,
    doctorId: user.doctorId || user.data?.doctorId,
    hospitalId: user.hospitalId || user.data?.hospitalId,
    ...user,
  };
}

function isVerifiedProvider(record) {
  const status = String(record?.verificationStatus || record?.status || 'VERIFIED').toUpperCase();
  return status !== 'PENDING_VERIFICATION' && status !== 'REJECTED' && status !== 'PENDING';
}

async function authOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = db ? await db.getUser(payload.id) : null;
    req.user = user
      ? {
          ...payload,
          ...user,
          data: userData(user),
          roles: user.roles || payload.roles || [user.role || payload.role],
          primaryRole: user.primaryRole || user.role || payload.primaryRole || payload.role,
        }
      : payload;
  } catch {
    req.user = null;
  }
  next();
}

function adminRequired(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (!userHasRole(req.user, 'admin')) return res.status(403).json({ error: 'Admin access is required.' });
  next();
}

function assertCollection(name) {
  return COLLECTIONS.includes(name);
}

function paginate(items, query) {
  const total = items.length;
  const limit = Number(query.limit || 0);
  const page = Math.max(1, Number(query.page || 1));
  if (!limit) return { items, total, page: 1 };
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, limit };
}

app.use(authOptional);

app.get('/api/health', async (_req, res) => {
  const counts = db ? await db.counts() : {};
  const status = db ? db.status() : { mode: 'starting', mongodb: false, configured: false };
  res.json({
    ok: true,
    ...status,
    mongodb: status.mongodb,
    counts,
    hint: status.mongodb
      ? 'MongoDB is connected and in use.'
      : status.configured
        ? `MongoDB URI is set but the connection failed${status.error ? `: ${status.error}` : ''}. The app is using the local store until it succeeds.`
        : 'Paste MONGODB_URI in .env to connect MongoDB. Until then the app uses a local JSON store.',
  });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { valid, error, data } = validate(schemas.login, req.body || {});
    if (!valid) return res.status(400).json({ error });
    const identifier = String(data.identifier || '').trim();
    const password = String(data.password || '');
    const row = await db.findUserByIdentifier(identifier);
    if (!row) {
      return res.status(401).json({ error: 'No account found for this mobile / email / ID.' });
    }
    const ok = verifyPassword(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
    const user = await db.getUser(row.id);
    res.json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const body = req.body || {};
    const roles = Array.isArray(body.roles) && body.roles.length ? body.roles : [body.role || 'patient'];
    const primaryRole = body.primaryRole || roles[0];
    const role = primaryRole;
    const schema = schemaForRole(role);
    const { valid, error } = validate(schema, body);
    if (!valid) return res.status(400).json({ error });

    const name = body.fullName || body.name || body.hospitalName || body.organizationName || 'New User';
    const email = body.email || body.contactEmail || '';
    const phone = body.mobileNumber || body.mobile || body.phone || body.contactPhone || '';
    const password = String(body.password || '');
    const { password: _omitPassword, confirmPassword: _omitConfirm, ...safeBody } = body;

    if (phone) {
      const existing = await db.findUserByIdentifier(phone);
      if (existing) return res.status(409).json({ error: 'An account already exists with this mobile number.' });
    }
    if (email) {
      const existing = await db.findUserByIdentifier(email);
      if (existing) return res.status(409).json({ error: 'An account already exists with this email.' });
    }

    if (role === 'doctor') {
      const docs = body.verificationDocuments;
      if (!Array.isArray(docs) || docs.length < 3) {
        return res.status(400).json({ error: 'Upload medical degree, council registration, and license certificates' });
      }
      if (!body.speciality) {
        return res.status(400).json({ error: 'Doctor speciality is required so patients can find you in search' });
      }
    }
    if (role === 'hospital') {
      const docs = body.verificationDocuments;
      if (!Array.isArray(docs) || docs.length < 2) {
        return res.status(400).json({ error: 'Upload hospital registration and clinical establishment certificates' });
      }
      const specs = body.specialities || body.keySpecialities || [];
      if (!specs.length && !body.speciality && !body.primarySpeciality) {
        return res.status(400).json({ error: 'Select at least one hospital speciality so patients can find you in search' });
      }
    }

    const patientId = body.patientId || (role === 'patient' ? `AVP${Math.floor(100000 + Math.random() * 900000)}` : undefined);
    const doctorId = role === 'doctor' ? makeId('DOC') : undefined;
    const hospitalId = role === 'hospital' ? makeId('HOSP') : undefined;
    const verificationToken = email ? crypto.randomBytes(32).toString('hex') : null;
    const verificationTokenExpiry = verificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

    const user = await db.createUser({
      id: makeId('USR'),
      role,
      roles,
      primaryRole,
      name,
      email: email || null,
      phone: phone || null,
      password_hash: hashPassword(password),
      emailVerified: !email,
      verificationToken,
      verificationTokenExpiry,
      data: {
        ...safeBody,
        patientId,
        doctorId,
        hospitalId,
        roles,
        primaryRole,
        displayName: name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : ''),
        image: body.photoUrl || body.image || '/src/assets/images/patient_avatar_1787229395408.jpg',
        verificationToken,
        verificationTokenExpiry,
        emailVerified: !email,
      },
    });

    if (role === 'patient') {
      await db.create('patients', {
        id: patientId,
        userId: user.id,
        fullName: name,
        ...safeBody,
        patientId,
        phone,
        email,
        status: email ? 'PENDING_VERIFICATION' : 'APPROVED',
      });
    } else if (role === 'doctor') {
      const doctorSpecialities = Array.from(
        new Set([body.speciality, ...(body.specialities || body.additionalSpecialities || [])].filter(Boolean))
      );
      await db.create('doctors', {
        id: doctorId,
        userId: user.id,
        name: name.startsWith('Dr') ? name : `Dr. ${name}`,
        speciality: body.speciality || doctorSpecialities[0] || 'General Medicine',
        specialities: doctorSpecialities,
        subSpeciality: body.subSpeciality || '',
        qualifications: body.qualification || body.qualifications || 'MBBS',
        qualification: body.qualification || 'MBBS',
        registrationNo: body.registrationNo || '',
        stateMedicalCouncil: body.stateMedicalCouncil || '',
        hospital: body.currentHospital || body.hospital || 'Ayudh Network',
        hospitalId: body.hospitalId || undefined,
        district: body.district || 'Warangal',
        experienceYears: Number(body.experienceYears || 5),
        consultationFee: Number(body.consultationFee || 500),
        phone,
        email,
        status: 'Active',
        verificationStatus: 'PENDING_VERIFICATION',
        verificationDocuments: body.verificationDocuments || [],
        rating: 4.8,
        availableSlots: [{ day: 'Today', date: '29', month: 'Aug', isToday: true, slots: ['10:00 AM', '04:00 PM'] }],
      });
      if (body.hospitalId) {
        await db.create('doctor_hospital_assignments', {
          id: makeId('DHA'),
          doctorId,
          hospitalId: body.hospitalId,
          consultationFee: Number(body.consultationFee || 500),
          department: body.speciality,
          status: 'PENDING_APPROVAL',
        });
      }
    } else if (role === 'hospital') {
      const hospitalSpecialities = Array.from(
        new Set(
          (body.specialities || body.keySpecialities || [body.primarySpeciality || body.speciality || 'General Medicine']).filter(Boolean)
        )
      );
      await db.create('hospitals', {
        id: hospitalId,
        userId: user.id,
        name: body.hospitalName || name,
        shortName: body.hospitalName || name,
        district: body.district || 'Warangal',
        location: body.location || body.city || body.fullAddress || '',
        address: body.fullAddress || '',
        phone,
        email,
        speciality: hospitalSpecialities[0],
        primarySpeciality: hospitalSpecialities[0],
        specialities: hospitalSpecialities,
        logoText: (body.hospitalName || name).slice(0, 6).toUpperCase(),
        logoBg: 'bg-blue-700',
        hasAyudhCashless: true,
        isOpen24x7: true,
        rating: 4.5,
        totalBeds: Number(body.totalBeds || 50),
        availableBeds: Number(body.availableBeds || 10),
        seniorDoctors: [],
        status: 'Active',
        verificationStatus: 'PENDING_VERIFICATION',
        verificationDocuments: body.verificationDocuments || [],
        nabhAccredited: body.nabhAccredited,
        category: body.category,
        subscriptionPlan: body.subscriptionPlan || 'Growth',
        subscriptionAmount: Number(body.subscriptionAmount || 5999),
      });
    } else {
      await db.create('partnerships', {
        id: makeId('PTR'),
        role,
        name,
        phone,
        email,
        status: 'Submitted',
        ...body,
      });
    }

    if (email && verificationToken) {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }

    res.json({
      token: signToken(user),
      user,
      patientId,
      referenceNo: `AV-REG-${Math.floor(100000 + Math.random() * 900000)}`,
      message: email ? 'Verification email sent to your inbox' : 'Registration successful',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  const token = req.body?.token || req.query.token;
  if (!token) return res.status(400).json({ error: 'Token required' });
  const raw = await db.findUserByVerificationToken(token);
  if (!raw) return res.status(404).json({ error: 'Invalid or expired token' });
  const expiry = raw.verificationTokenExpiry || raw.data?.verificationTokenExpiry;
  if (expiry && new Date() > new Date(expiry)) {
    return res.status(400).json({ error: 'Token expired' });
  }
  const user = await db.updateUser(raw.id, {
    emailVerified: true,
    verificationToken: null,
    verificationTokenExpiry: null,
    status: 'APPROVED',
  });
  if (user.patientId) {
    const patient = await db.get('patients', user.patientId);
    if (patient) await db.update('patients', user.patientId, { status: 'APPROVED', emailVerified: true });
  }
  res.json({ ok: true, message: 'Email verified successfully', user });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not signed in.' });
  const user = await db.getUser(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found.' });
  res.json({ user });
});

app.patch('/api/auth/me', authRequired, async (req, res) => {
  const patch = { ...(req.body || {}) };
  if (patch.primaryRole && !userRolesOf(req.user).includes(patch.primaryRole) && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'You do not have that role.' });
  }
  if (patch.primaryRole) patch.role = patch.primaryRole;
  const user = await db.updateUser(req.user.id, patch);
  if (user?.patientId) {
    const existing = await db.get('patients', user.patientId);
    if (existing) {
      await db.update('patients', user.patientId, {
        fullName: user.name,
        phone: user.phone,
        email: user.email,
        ...req.body,
      });
    }
  }
  res.json({ user, token: signToken(user) });
});

app.get('/api/search/hospitals', async (req, res) => {
  try {
    const result = await searchHospitals(db, req.query);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hospital search failed.' });
  }
});

app.get('/api/search/doctors', async (req, res) => {
  try {
    const result = await searchDoctors(db, req.query);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Doctor search failed.' });
  }
});

app.get('/api/bootstrap', async (req, res) => {
  const [hospitals, doctors, health_camps, stats] = await Promise.all([
    db.list('hospitals'),
    db.list('doctors'),
    db.list('health_camps'),
    db.counts(),
  ]);
  const isAdmin = req.user && userHasRole(req.user, 'admin');
  res.json({
    mode: db.mode(),
    mongodb: db.mongoReady(),
    hospitals: isAdmin ? hospitals : hospitals.filter(isVerifiedProvider),
    doctors: isAdmin ? doctors : doctors.filter(isVerifiedProvider),
    health_camps,
    stats,
  });
});

app.get('/api/stats', async (_req, res) => {
  res.json({ mode: db.mode(), mongodb: db.mongoReady(), ...(await db.counts()) });
});

app.get('/api/users', adminRequired, async (req, res) => {
  const { page, limit, ...filter } = req.query;
  const users = await db.listUsers(filter);
  res.json({ items: users, ...paginate(users, req.query) });
});

app.post('/api/users', adminRequired, async (req, res) => {
  try {
    const body = req.body || {};
    const role = body.role || body.primaryRole || 'patient';
    const roles = Array.isArray(body.roles) && body.roles.length ? body.roles : [role];
    const name = body.name || body.fullName || body.hospitalName || 'New User';
    const email = body.email || body.contactEmail || '';
    const phone = body.phone || body.mobile || body.mobileNumber || body.contactPhone || '';
    const password = String(body.password || 'Password@123');
    const user = await db.createUser({
      id: makeId('USR'),
      role,
      roles,
      primaryRole: body.primaryRole || role,
      name,
      email: email || null,
      phone: phone || null,
      password_hash: hashPassword(password),
      emailVerified: true,
      data: {
        ...body,
        displayName: body.displayName || name,
        status: body.status || 'Active',
        roles,
        primaryRole: body.primaryRole || role,
      },
    });
    res.status(201).json({ item: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'User creation failed.' });
  }
});

app.patch('/api/users/:id', adminRequired, async (req, res) => {
  const patch = { ...(req.body || {}) };
  if (patch.password) {
    patch.password_hash = hashPassword(String(patch.password));
    delete patch.password;
  }
  delete patch.confirmPassword;
  if (patch.primaryRole) patch.role = patch.primaryRole;
  const user = await db.updateUser(req.params.id, patch);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ item: user });
});

app.delete('/api/users/:id', adminRequired, async (req, res) => {
  if (req.user?.id === req.params.id) {
    return res.status(400).json({ error: 'You cannot delete your own admin account while signed in.' });
  }
  const user = await db.removeUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ ok: true });
});

app.get('/api/notifications', authRequired, async (req, res) => {
  const notifications = await db.list('notifications', { userId: req.user.id });
  res.json({ items: notifications });
});

app.patch('/api/notifications/:id/read', authRequired, async (req, res) => {
  const existing = await db.get('notifications', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== req.user.id && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const notification = await db.update('notifications', req.params.id, {
    read: true,
    readAt: new Date().toISOString(),
  });
  res.json({ item: notification });
});

app.delete('/api/notifications/:id', authRequired, async (req, res) => {
  const existing = await db.get('notifications', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== req.user.id && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  await db.remove('notifications', req.params.id);
  res.json({ ok: true });
});

app.post('/api/doctor-assignments', requireRole(['hospital', 'admin']), async (req, res) => {
  const hospitalId = req.body.hospitalId || req.user.data?.hospitalId || req.user.hospitalId;
  const { doctorId, consultationFee, department } = req.body || {};
  if (!doctorId || !hospitalId) return res.status(400).json({ error: 'doctorId and hospitalId are required' });
  const assignment = await db.create('doctor_hospital_assignments', {
    id: makeId('DHA'),
    doctorId,
    hospitalId,
    consultationFee,
    department,
    status: 'PENDING_APPROVAL',
  });
  const doctor = await db.get('doctors', doctorId);
  if (doctor?.userId) {
    await createNotification(db, doctor.userId, {
      type: 'assignment_invitation',
      title: 'Hospital assignment invitation',
      message: 'A hospital invited you to join their panel.',
      data: { assignmentId: assignment.id, hospitalId },
    }, broadcast);
  }
  res.json({ item: assignment });
});

app.patch('/api/doctor-assignments/:id/accept', requireRole('doctor'), async (req, res) => {
  const assignment = await db.get('doctor_hospital_assignments', req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  const doctorId = req.user.data?.doctorId || req.user.doctorId;
  if (assignment.doctorId !== doctorId && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const updated = await db.update('doctor_hospital_assignments', req.params.id, { status: 'Active' });
  res.json({ item: updated });
});

app.patch('/api/doctor-assignments/:id/reject', requireRole('doctor'), async (req, res) => {
  const assignment = await db.get('doctor_hospital_assignments', req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  const doctorId = req.user.data?.doctorId || req.user.doctorId;
  if (assignment.doctorId !== doctorId && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const updated = await db.update('doctor_hospital_assignments', req.params.id, { status: 'Rejected' });
  res.json({ ok: true, item: updated });
});

app.patch('/api/doctors/:id/approve', requireRole('admin'), async (req, res) => {
  const doctor = await db.get('doctors', req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Not found' });
  if (doctor.verificationStatus === 'VERIFIED') {
    return res.status(400).json({ error: 'Doctor already verified or rejected' });
  }
  const updated = await db.update('doctors', req.params.id, {
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date().toISOString(),
    verifiedBy: req.user.id,
    rejectionReason: null,
  });
  await db.create('doctor_verification_actions', {
    id: makeId('DVA'),
    doctorId: req.params.id,
    action: 'approved',
    reason: req.body?.reason || 'Credentials verified',
    by: req.user.id,
    at: new Date().toISOString(),
  });
  const email = updated.email || (await db.findUserByIdentifier(updated.email || updated.phone || ''))?.email;
  if (updated.email) await sendVerificationApprovedEmail(updated.email, updated.name);
  else if (email) await sendVerificationApprovedEmail(email, updated.name);
  res.json({ item: updated });
});

app.patch('/api/doctors/:id/reject', requireRole('admin'), async (req, res) => {
  const doctor = await db.get('doctors', req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Not found' });
  const reason = req.body?.reason || req.body?.rejectionReason || 'Documents incomplete';
  const updated = await db.update('doctors', req.params.id, {
    verificationStatus: 'REJECTED',
    rejectionReason: reason,
  });
  await db.create('doctor_verification_actions', {
    id: makeId('DVA'),
    doctorId: req.params.id,
    action: 'rejected',
    reason,
    by: req.user.id,
    at: new Date().toISOString(),
  });
  if (updated.email) await sendVerificationRejectedEmail(updated.email, updated.name, reason);
  res.json({ item: updated });
});

app.get('/api/admin/verifications/doctors', requireRole('admin'), async (_req, res) => {
  const doctors = await db.list('doctors');
  res.json({ items: doctors.filter((d) => (d.verificationStatus || '') === 'PENDING_VERIFICATION') });
});

app.patch('/api/hospitals/:id/approve', requireRole('admin'), async (req, res) => {
  const hospital = await db.get('hospitals', req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Not found' });
  const updated = await db.update('hospitals', req.params.id, {
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date().toISOString(),
    verifiedBy: req.user.id,
    rejectionReason: null,
  });
  await db.create('hospital_verification_actions', {
    id: makeId('HVA'),
    hospitalId: req.params.id,
    action: 'approved',
    reason: req.body?.reason || 'Facility verified',
    by: req.user.id,
    at: new Date().toISOString(),
  });
  if (updated.email) await sendVerificationApprovedEmail(updated.email, updated.name);
  res.json({ item: updated });
});

app.patch('/api/hospitals/:id/reject', requireRole('admin'), async (req, res) => {
  const hospital = await db.get('hospitals', req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Not found' });
  const reason = req.body?.reason || req.body?.rejectionReason || 'Facility details incomplete';
  const updated = await db.update('hospitals', req.params.id, {
    verificationStatus: 'REJECTED',
    rejectionReason: reason,
  });
  await db.create('hospital_verification_actions', {
    id: makeId('HVA'),
    hospitalId: req.params.id,
    action: 'rejected',
    reason,
    by: req.user.id,
    at: new Date().toISOString(),
  });
  if (updated.email) await sendVerificationRejectedEmail(updated.email, updated.name, reason);
  res.json({ item: updated });
});

app.get('/api/admin/verifications/hospitals', requireRole('admin'), async (_req, res) => {
  const hospitals = await db.list('hospitals');
  res.json({ items: hospitals.filter((h) => (h.verificationStatus || '') === 'PENDING_VERIFICATION') });
});

app.get('/api/hospitals/:id/beds/status', requireRole(['hospital', 'admin']), async (req, res) => {
  const hospitalId = req.params.id;
  if (!userHasRole(req.user, 'admin') && (req.user.hospitalId || req.user.data?.hospitalId) !== hospitalId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const beds = await db.list('hospital_beds', { hospitalId });
  const occupancy = {
    total: beds.length,
    occupied: beds.filter((b) => b.status === 'occupied').length,
    available: beds.filter((b) => b.status === 'available').length,
    reserved: beds.filter((b) => b.status === 'reserved').length,
    maintenance: beds.filter((b) => b.status === 'maintenance').length,
    byWard: {},
  };
  for (const ward of ['General', 'ICU', 'HDU', 'Private', 'OPD']) {
    occupancy.byWard[ward] = {
      total: beds.filter((b) => b.wardType === ward).length,
      occupied: beds.filter((b) => b.wardType === ward && b.status === 'occupied').length,
      available: beds.filter((b) => b.wardType === ward && b.status === 'available').length,
    };
  }
  res.json({ occupancy, items: beds });
});

async function acceptVisitRequest(req, res) {
  const visitRequest = await db.get('visit_requests', req.params.id);
  if (!visitRequest) return res.status(404).json({ error: 'Not found' });
  const current = String(visitRequest.status || '').toLowerCase();
  if (current !== 'pending') return res.status(400).json({ error: 'Request already processed' });
  const hospitalId = req.user.hospitalId || req.user.data?.hospitalId;
  if (!userHasRole(req.user, 'admin') && visitRequest.hospitalId !== hospitalId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  if (visitRequest.responseDeadline && new Date() > new Date(visitRequest.responseDeadline)) {
    return res.status(400).json({ error: 'Cannot accept request after 24-hour deadline' });
  }

  const { appointmentDateTime, doctorId, bedId, hospitalNotes } = req.body || {};
  let bed = bedId ? await db.get('hospital_beds', bedId) : null;
  if (bedId && !bed) return res.status(400).json({ error: 'Bed not found' });
  if (bed && bed.status !== 'available') return res.status(400).json({ error: 'Bed not available' });
  if (!bed) {
    const beds = await db.list('hospital_beds', { hospitalId: visitRequest.hospitalId, status: 'available' });
    bed = beds[0] || null;
  }
  if (bed) {
    await db.update('hospital_beds', bed.id, {
      status: 'reserved',
      reservedUntil: appointmentDateTime || visitRequest.preferredDate,
    });
  }

  const updated = await db.update('visit_requests', req.params.id, {
    status: 'Scheduled',
    acceptedAt: new Date().toISOString(),
    appointmentDateTime: appointmentDateTime || `${visitRequest.preferredDate} ${visitRequest.preferredTimeSlot}`,
    assignedDoctorId: doctorId,
    assignedBedId: bed?.id,
    assignedBedNumber: bed?.bedNumber,
    hospitalNotes: hospitalNotes || 'Visit accepted. Please report 15 minutes before the slot.',
    tokenNumber: `${(visitRequest.hospitalName || 'AV').slice(0, 4).toUpperCase()}-OPD-${Math.floor(100 + Math.random() * 899)}`,
  });

  const confirmationCode = `CONF-${visitRequest.hospitalId}-${makeId('APT').slice(0, 8)}`;
  const appointment = await db.create('appointments', {
    id: makeId('APT'),
    visitRequestId: req.params.id,
    patientId: visitRequest.patientId,
    patientName: visitRequest.patientName,
    phone: visitRequest.patientPhone,
    doctorId: doctorId || visitRequest.doctorId,
    doctorName: visitRequest.doctorName,
    hospitalId: visitRequest.hospitalId,
    hospital: visitRequest.hospitalName,
    appointmentDateTime: updated.appointmentDateTime,
    appointmentDate: visitRequest.preferredDate,
    appointmentTime: visitRequest.preferredTimeSlot,
    bedId: bed?.id,
    status: 'Scheduled',
    tokenNumber: updated.tokenNumber,
    confirmationCode,
    qrCode: qrCodeUrl(confirmationCode),
  });

  const patient = visitRequest.patientId ? await db.get('patients', visitRequest.patientId) : null;
  const patientUser = patient?.userId
    ? await db.getUser(patient.userId)
    : (await db.listUsers({})).find((u) => u.patientId === visitRequest.patientId);
  const doctor = doctorId ? await db.get('doctors', doctorId) : null;
  const hospital = await db.get('hospitals', visitRequest.hospitalId);

  if (patientUser?.id) {
    await createNotification(db, patientUser.id, {
      type: 'visit_request_accepted',
      title: 'Visit Request Accepted!',
      message: `Your visit to ${hospital?.name || visitRequest.hospitalName} has been scheduled for ${updated.appointmentDateTime}`,
      data: { visitRequestId: req.params.id, appointmentId: appointment.id },
    }, broadcast);
  }
  if (patientUser?.email || patient?.email) {
    await sendAppointmentConfirmationEmail(patientUser?.email || patient?.email, {
      patient: visitRequest.patientName,
      hospital: hospital?.name || visitRequest.hospitalName,
      doctor: doctor?.name || visitRequest.doctorName,
      appointmentDateTime: updated.appointmentDateTime,
      confirmationCode,
      qrCodeUrl: appointment.qrCode,
      bedNumber: bed?.bedNumber,
    });
  }

  const assignedDoctorId = doctorId || visitRequest.doctorId;
  if (assignedDoctorId) {
    const doctorUser = (await db.listUsers({})).find((u) => u.doctorId === assignedDoctorId);
    if (doctorUser?.id) {
      await createNotification(db, doctorUser.id, {
        type: 'appointment_assigned',
        title: 'New hospital visit assigned',
        message: `${visitRequest.patientName} scheduled at ${visitRequest.hospitalName} for ${updated.appointmentDateTime}`,
        data: { appointmentId: appointment.id, visitRequestId: req.params.id },
      }, broadcast);
    }
  }

  broadcast({ event: 'record_created', collection: 'appointments', action: 'create', id: appointment.id, data: appointment, record: appointment });
  broadcast({ event: 'record_updated', collection: 'visit_requests', action: 'update', id: req.params.id, data: updated, record: updated });
  res.json({ item: updated, appointment, message: 'Request accepted. Confirmation sent to patient.' });
}

async function rejectVisitRequest(req, res) {
  const visitRequest = await db.get('visit_requests', req.params.id);
  if (!visitRequest) return res.status(404).json({ error: 'Not found' });
  if (String(visitRequest.status || '').toLowerCase() !== 'pending') {
    return res.status(400).json({ error: 'Request already processed' });
  }
  const hospitalId = req.user.hospitalId || req.user.data?.hospitalId;
  if (!userHasRole(req.user, 'admin') && visitRequest.hospitalId !== hospitalId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  const rejectionReason = req.body?.rejectionReason || req.body?.reason || 'Slot not available';
  const updated = await db.update('visit_requests', req.params.id, {
    status: 'Rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason,
  });
  const patient = visitRequest.patientId ? await db.get('patients', visitRequest.patientId) : null;
  const patientUser = patient?.userId
    ? await db.getUser(patient.userId)
    : (await db.listUsers({})).find((u) => u.patientId === visitRequest.patientId);
  if (patientUser?.id) {
    await createNotification(db, patientUser.id, {
      type: 'visit_request_rejected',
      title: 'Visit Request Declined',
      message: `Your request to ${visitRequest.hospitalName} has been declined. Reason: ${rejectionReason}`,
      data: { visitRequestId: req.params.id },
    }, broadcast);
  }
  res.json({ item: updated, message: 'Request rejected. Patient has been notified.' });
}

app.patch('/api/records/visit_requests/:id/accept', requireRole(['hospital', 'admin']), acceptVisitRequest);
app.patch('/api/visit-requests/:id/accept', requireRole(['hospital', 'admin']), acceptVisitRequest);
app.patch('/api/records/visit_requests/:id/reject', requireRole(['hospital', 'admin']), rejectVisitRequest);
app.patch('/api/visit-requests/:id/reject', requireRole(['hospital', 'admin']), rejectVisitRequest);

app.patch('/api/records/appointments/:id/check-in', authRequired, async (req, res) => {
  const appointment = await db.get('appointments', req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  if (appointment.bedId) {
    await db.update('hospital_beds', appointment.bedId, {
      status: 'occupied',
      assignedPatientId: appointment.patientId,
    });
  }
  const updated = await db.update('appointments', req.params.id, {
    status: 'CheckedIn',
    checkInTime: new Date().toISOString(),
  });
  if (appointment.visitRequestId) {
    await db.update('visit_requests', appointment.visitRequestId, { status: 'CheckedIn' });
  }
  res.json({ item: updated });
});

app.patch('/api/records/appointments/:id/discharge', authRequired, async (req, res) => {
  const appointment = await db.get('appointments', req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  if (appointment.bedId) {
    await db.update('hospital_beds', appointment.bedId, {
      status: 'available',
      assignedPatientId: null,
      reservedUntil: null,
    });
  }
  const updated = await db.update('appointments', req.params.id, {
    status: 'Completed',
    dischargeTime: new Date().toISOString(),
  });
  if (appointment.visitRequestId) {
    await db.update('visit_requests', appointment.visitRequestId, { status: 'Completed', completedAt: new Date().toISOString() });
  }
  res.json({ item: updated });
});

app.get('/api/records/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const publicRead = PUBLIC_READ_COLLECTIONS.includes(collection);
  if (!publicRead && !req.user) return res.status(401).json({ error: 'Authentication required' });

  const { page, limit, ...filter } = req.query;
  let roleFilter = { ...filter };
  if (req.user) {
    roleFilter = applyRoleBasedFilters(collection, filter, userRolesOf(req.user), req.user.id, userData(req.user));
  }

  let items = await db.list(collection, roleFilter);

  if (collection === 'doctors' && !userHasRole(req.user, 'admin')) {
    items = items.filter(isVerifiedProvider);
  }
  if (collection === 'hospitals' && !userHasRole(req.user, 'admin')) {
    items = items.filter(isVerifiedProvider);
  }
  if (collection === 'patients' && userHasRole(req.user, 'doctor') && !userHasRole(req.user, 'admin')) {
    const doctorId = req.user.doctorId || req.user.data?.doctorId;
    const appts = await db.list('appointments', { doctorId });
    const ids = new Set(appts.map((a) => a.patientId));
    items = items.filter((p) => ids.has(p.id) || ids.has(p.patientId));
  }
  if (collection === 'patients' && userHasRole(req.user, 'patient') && !userHasRole(req.user, 'admin')) {
    const pid = req.user.patientId || req.user.data?.patientId;
    items = items.filter((p) => p.id === pid || p.patientId === pid);
  }

  const paged = paginate(items, req.query);
  res.json({ items: paged.items, total: paged.total, page: paged.page });
});

app.get('/api/records/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const publicRead = PUBLIC_READ_COLLECTIONS.includes(collection);
  if (!publicRead && !req.user) return res.status(401).json({ error: 'Authentication required' });
  const item = await db.get(collection, id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (!publicRead && !canModifyRecord(req.user, collection, item) && !userHasRole(req.user, ['doctor', 'hospital', 'marketing', 'admin'])) {
    return res.status(403).json({ error: 'Cannot access this record' });
  }
  res.json({ item });
});

app.post('/api/records/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const publicCreate = PUBLIC_CREATE_COLLECTIONS.includes(collection);
  if (!publicCreate && !req.user) return res.status(401).json({ error: 'Authentication required' });

  if (collection === 'visit_requests' && req.user && !userHasRole(req.user, ['patient', 'admin'])) {
    return res.status(403).json({ error: 'Only patients can create visit requests' });
  }
  if (collection === 'prescriptions' && req.user && !userHasRole(req.user, ['doctor', 'admin'])) {
    return res.status(403).json({ error: 'Only doctors can create prescriptions' });
  }
  if (collection === 'hospital_beds' && req.user && !userHasRole(req.user, ['hospital', 'admin'])) {
    return res.status(403).json({ error: 'Only hospitals can create beds' });
  }

  const payload = { ...(req.body || {}) };
  if (!payload.id) {
    const prefixes = {
      hospitals: 'HOSP',
      doctors: 'DOC',
      patients: 'AVP',
      health_camps: 'CAMP',
      appointments: 'APT',
      ambulance_bookings: 'AMB',
      lab_bookings: 'LAB',
      home_care_bookings: 'HC',
      visit_requests: 'HVR',
      camp_registrations: 'CRG',
      leads: 'LD',
      partnerships: 'PTR',
      callbacks: 'CB',
      emergencies: 'EMG',
      memberships: 'MEM',
      tickets: 'AVT',
      feedback: 'FB',
      health_records: 'REC',
      reminders: 'REM',
      wallet_txns: 'WAL',
      notifications: 'NTF',
      insurance_applications: 'INS',
      prescriptions: 'RX',
      enquiries: 'ENQ',
      hospital_beds: 'BED',
      doctor_hospital_assignments: 'DHA',
      doctor_verification_actions: 'DVA',
      hospital_verification_actions: 'HVA',
      subscription_plans: 'PLAN',
    };
    payload.id = makeId(prefixes[collection] || 'REC');
  }

  if (req.user) {
    payload.createdBy = req.user.id;
    payload.createdByRole = req.user.primaryRole || req.user.role;
    const me = userData(req.user);
    if (!payload.patientId && userHasRole(req.user, 'patient')) {
      payload.patientId = me.patientId;
      payload.patientName = payload.patientName || req.user.name;
      payload.phone = payload.phone || req.user.phone;
    }
    if (!payload.doctorId && userHasRole(req.user, 'doctor')) payload.doctorId = me.doctorId;
    if (!payload.hospitalId && userHasRole(req.user, 'hospital')) payload.hospitalId = me.hospitalId;
  }

  if (collection === 'appointments' && payload.doctorId && payload.hospitalId) {
    const assignment = await db.list('doctor_hospital_assignments', {
      doctorId: payload.doctorId,
      hospitalId: payload.hospitalId,
      status: 'Active',
    });
    if (!assignment.length) {
      const doctor = await db.get('doctors', payload.doctorId);
      if (doctor?.hospitalId && doctor.hospitalId !== payload.hospitalId) {
        return res.status(400).json({ error: 'Doctor does not work at this hospital' });
      }
    }
  }

  if (!payload.status) {
    if (collection === 'appointments') payload.status = 'Pending';
    if (collection === 'visit_requests') payload.status = 'Pending';
    if (collection === 'ambulance_bookings') payload.status = 'Dispatched';
    if (collection === 'lab_bookings') payload.status = 'Confirmed';
    if (collection === 'home_care_bookings') payload.status = 'Scheduled';
    if (collection === 'leads') payload.status = payload.status || 'New';
    if (collection === 'emergencies') payload.status = 'Open';
    if (collection === 'hospital_beds') payload.status = 'available';
  }

  if (collection === 'visit_requests') {
    if (!payload.requestId) payload.requestId = `AV-VISIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    payload.requestedAt = payload.requestedAt || new Date().toISOString();
    payload.responseDeadline = payload.responseDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  if (collection === 'appointments' && !payload.tokenNumber) {
    payload.tokenNumber = `TK-${Math.floor(10 + Math.random() * 90)}`;
  }
  if (collection === 'ambulance_bookings') {
    payload.driverName = payload.driverName || 'Suresh Varma (Paramedic Driver)';
    payload.driverContact = payload.driverContact || '9000045073';
    payload.eta = payload.eta || '8 - 12 Minutes';
  }
  if (collection === 'wallet_txns' && payload.patientId) {
    const txs = await db.list('wallet_txns', { patientId: payload.patientId });
    const last = txs[0]?.balanceAfter ?? 0;
    const amount = Number(payload.amount || 0);
    payload.balanceAfter = last + amount;
  }

  if (collection === 'hospital_beds' && Array.isArray(req.body?.beds)) {
    const hospitalId = req.user?.hospitalId || req.user?.data?.hospitalId;
    const createdBeds = [];
    for (const bed of req.body.beds) {
      createdBeds.push(await db.create('hospital_beds', {
        id: makeId('BED'),
        hospitalId,
        ...bed,
        status: bed.status || 'available',
      }));
    }
    const totalBeds = await db.list('hospital_beds', { hospitalId });
    const occupiedBeds = totalBeds.filter((b) => b.status === 'occupied').length;
    if (hospitalId) {
      await db.update('hospitals', hospitalId, {
        totalBeds: totalBeds.length,
        availableBeds: totalBeds.length - occupiedBeds,
      });
    }
    return res.status(201).json({ items: createdBeds });
  }

  const item = await db.create(collection, payload);

  if (collection === 'doctors' && payload.hospitalId) {
    const hospital = await db.get('hospitals', payload.hospitalId);
    if (hospital) {
      const seniorDoctors = [payload, ...(hospital.seniorDoctors || [])];
      await db.update('hospitals', payload.hospitalId, { seniorDoctors });
    }
    await db.create('doctor_hospital_assignments', {
      id: makeId('DHA'),
      doctorId: item.id,
      hospitalId: payload.hospitalId,
      consultationFee: payload.consultationFee,
      department: payload.speciality,
      status: 'Active',
    });
  }

  if (collection === 'wallet_txns' && req.user) {
    await db.updateUser(req.user.id, { walletBalance: item.balanceAfter });
  }

  if (collection === 'visit_requests') {
    await notifyUsersByHospital(db, item.hospitalId, {
      type: 'visit_request_received',
      title: 'New Visit Request',
      message: `${item.patientName || 'A patient'} requested a visit to ${item.hospitalName || 'your hospital'}`,
      data: { visitRequestId: item.id },
    }, broadcast);
  }

  if (collection === 'appointments' && ['Confirmed', 'Scheduled', 'Accepted'].includes(item.status)) {
    try { await notifyAppointmentConfirmed(db, item.id, broadcast); } catch (err) { console.warn(err); }
  }

  broadcast({ event: 'record_created', collection, action: 'create', id: item.id, data: item, record: item });
  res.status(201).json({ item });
});

app.patch('/api/records/:collection/:id', authRequired, async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const record = await db.get(collection, id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (!canModifyRecord(req.user, collection, record)) {
    return res.status(403).json({ error: 'Cannot modify this record' });
  }
  const item = await db.update(collection, id, req.body || {});
  if (collection === 'doctors' && item.hospitalId) {
    const hospital = await db.get('hospitals', item.hospitalId);
    if (hospital) {
      const seniorDoctors = (hospital.seniorDoctors || []).map((d) => (d.id === item.id ? { ...d, ...item } : d));
      if (!seniorDoctors.some((d) => d.id === item.id)) seniorDoctors.unshift(item);
      await db.update('hospitals', item.hospitalId, { seniorDoctors });
    }
  }
  broadcast({ event: 'record_updated', collection, action: 'update', id: item.id, data: item, record: item });
  res.json({ item });
});

app.delete('/api/records/:collection/:id', authRequired, async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const record = await db.get(collection, id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (!canModifyRecord(req.user, collection, record)) {
    return res.status(403).json({ error: 'Cannot delete this record' });
  }
  const item = await db.remove(collection, id);
  if (collection === 'doctors' && item?.hospitalId) {
    const hospital = await db.get('hospitals', item.hospitalId);
    if (hospital) {
      await db.update('hospitals', item.hospitalId, {
        seniorDoctors: (hospital.seniorDoctors || []).filter((d) => d.id !== id),
      });
    }
  }
  broadcast({ event: 'record_deleted', collection, action: 'delete', id, data: item, record: item || { id } });
  res.json({ ok: true, item });
});

app.get('/api/patients/lookup', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const q = String(req.query.q || req.query.memberId || req.query.phone || '').trim();
  if (!q) return res.status(400).json({ error: 'Lookup query required' });
  const patients = await db.list('patients');
  const users = await db.listUsers({ role: 'patient' });
  const match =
    patients.find((p) =>
      [p.id, p.patientId, p.memberId, p.uhid, p.phone, p.fullName].some(
        (v) => String(v || '').toLowerCase() === q.toLowerCase()
      )
    ) ||
    users.find((u) =>
      [u.id, u.patientId, u.memberId, u.phone, u.email, u.name].some(
        (v) => String(v || '').toLowerCase() === q.toLowerCase()
      )
    );
  if (!match) return res.status(404).json({ error: 'Patient not found in Ayudh registry.' });
  res.json({ item: match });
});

function sseHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ collection: '_hello', action: 'hello', record: { mode: db?.mode?.() || 'starting' } })}\n\n`);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
}

app.get('/api/stream', sseHandler);
app.get('/api/sse', sseHandler);

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(__dirname, '..', 'src', 'assets');
const VITE_PORT = Number(process.env.VITE_PORT || 3000);

app.use('/src/assets', express.static(assetsDir));
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

function sendIndex(res) {
  const indexFile = path.join(distDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
    return true;
  }
  return false;
}

function proxyToVite(req, res) {
  const opts = {
    hostname: '127.0.0.1',
    port: VITE_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${VITE_PORT}` },
  };
  const upstream = http.request(opts, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });
  upstream.on('error', () => {
    if (sendIndex(res)) return;
    res.status(200).type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ayudh Vikas — starting</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f3f5f8; color: #0f2e5a; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; max-width: 460px; box-shadow: 0 10px 30px rgba(15,46,90,.08); }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 12px; color: #475569; font-size: 14px; line-height: 1.5; }
    code { background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 6px; }
    a { color: #0275d8; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Ayudh Vikas API is running</h1>
    <p>This port serves the backend. Open the website at <a href="http://localhost:${VITE_PORT}">http://localhost:${VITE_PORT}</a></p>
    <p>From the project folder run <code>npm run dev</code> (API + website) or <code>npm run build</code> then refresh this page.</p>
  </div>
</body>
</html>`);
  });
  req.pipe(upstream);
}

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api')) return next();
  proxyToVite(req, res);
});

async function start() {
  db = createDb((event) => {
    broadcast({ ...event, type: 'record:change', event: 'record_updated' });
  });
  await db.connect();
  await seedDatabase(db, async (plain) => hashPassword(plain));
  try {
    await migrateToNewSchema(db);
  } catch (err) {
    console.warn('[migrate] skipped:', err.message);
  }
  db.persistNow();

  server.listen(PORT, '0.0.0.0', () => {
    const status = db.status();
    console.log(`[api] Ayudh Vikas API listening on http://localhost:${PORT}`);
    if (status.mongodb) {
      console.log(`[db] MongoDB connected (${status.target})`);
    } else if (status.configured) {
      console.log(`[db] MongoDB URI is set but connection failed: ${status.error}`);
      console.log('[db] Using local JSON store until MongoDB is reachable.');
    } else {
      console.log('[db] No MONGODB_URI yet - using local JSON store. Paste credentials in .env when ready.');
    }
    console.log(`[web] Open the site at http://localhost:${VITE_PORT}`);
  });
}

start().catch((err) => {
  console.error('[api] Failed to start', err);
  process.exit(1);
});
