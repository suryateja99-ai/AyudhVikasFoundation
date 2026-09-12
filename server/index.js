import './load-env.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createDb, COLLECTIONS } from './db.js';
import { seedDatabase } from './seed.js';
import { hashPassword, verifyPassword, signToken as signJwt, verifyToken } from './crypto-auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 4000);

const app = express();
const server = http.createServer(app);
const sseClients = new Set();
const AUTHORIZED_SESSION_STATUSES = new Set([
  'Accepted',
  'Approved',
  'Confirmed',
  'Scheduled',
  'Arrived',
  'Verified',
  'Active',
  'Completed',
]);
const CLOSED_SESSION_STATUSES = new Set(['Completed', 'SESSION_FINISHED']);
const SENSITIVE_COLLECTIONS = new Set(['health_records', 'prescriptions', 'reminders']);

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
  return signJwt({ id: user.id, role: user.role, name: user.name });
}

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

function authOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    req.user = verifyToken(token);
  } catch {
    req.user = null;
  }
  next();
}

function authRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  next();
}

function adminRequired(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access is required.' });
  next();
}

function assertCollection(name) {
  return COLLECTIONS.includes(name);
}

app.use(authOptional);

function isAuthorizedStatus(status) {
  return AUTHORIZED_SESSION_STATUSES.has(String(status || '').trim());
}

function isCompletedSession(session) {
  return CLOSED_SESSION_STATUSES.has(String(session?.status || '')) ||
    CLOSED_SESSION_STATUSES.has(String(session?.sessionStatus || ''));
}

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function sameText(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function formatDateTime(value = new Date()) {
  return new Date(value).toISOString();
}

async function getActor(req) {
  if (!req.user?.id) return null;
  const user = await db.getUser(req.user.id);
  if (!user) return null;
  let hospital = null;
  let doctor = null;
  if (user.role === 'hospital') {
    const hospitals = await db.list('hospitals');
    hospital = hospitals.find((item) =>
      item.id === user.hospitalId ||
      item.id === user.data?.hospitalId ||
      sameText(item.name, user.hospitalName || user.name) ||
      sameText(item.shortName, user.hospitalName || user.name)
    ) || null;
  }
  if (user.role === 'doctor') {
    const doctors = await db.list('doctors');
    doctor = doctors.find((item) =>
      item.id === user.doctorId ||
      item.id === user.data?.doctorId ||
      sameText(item.name, user.name) ||
      cleanPhone(item.phone) === cleanPhone(user.phone)
    ) || null;
  }
  return {
    user,
    role: user.role,
    patientId: user.patientId,
    hospitalId: user.hospitalId || hospital?.id,
    hospitalName: hospital?.name || user.hospitalName || user.name,
    doctorId: user.doctorId || doctor?.id,
    doctorName: doctor?.name || user.name,
    hospital,
    doctor,
  };
}

function actorOwnsSession(actor, session) {
  if (!actor || !session) return false;
  if (actor.role === 'admin') return true;
  if (actor.role === 'patient') return String(session.patientId || '') === String(actor.patientId || '');
  if (actor.role === 'hospital') {
    return (
      String(session.hospitalId || '') === String(actor.hospitalId || '') ||
      sameText(session.hospitalName, actor.hospitalName)
    );
  }
  if (actor.role === 'doctor') {
    return (
      String(session.doctorId || '') === String(actor.doctorId || '') ||
      sameText(session.doctorName, actor.doctorName)
    );
  }
  return false;
}

function normalizeSession(session, collection) {
  if (!session) return null;
  return {
    ...session,
    sessionId: session.sessionId || session.id,
    sourceCollection: collection,
    sessionStatus: session.sessionStatus || (isCompletedSession(session) ? 'COMPLETED' : isAuthorizedStatus(session.status) ? 'ACTIVE' : 'AUTHORIZED'),
    visitPassStatus: session.visitPassStatus || (isCompletedSession(session) ? 'EXPIRED' : isAuthorizedStatus(session.status) ? 'ACTIVE' : 'PENDING'),
  };
}

async function findSession(sessionId) {
  const visit = await db.get('visit_requests', sessionId);
  if (visit) return normalizeSession(visit, 'visit_requests');
  const appointment = await db.get('appointments', sessionId);
  if (appointment) return normalizeSession(appointment, 'appointments');
  const visits = await db.list('visit_requests');
  const byVisitSession = visits.find((item) => item.sessionId === sessionId || item.requestId === sessionId);
  if (byVisitSession) return normalizeSession(byVisitSession, 'visit_requests');
  const appointments = await db.list('appointments');
  const byAppointmentSession = appointments.find((item) => item.sessionId === sessionId || item.tokenNumber === sessionId);
  if (byAppointmentSession) return normalizeSession(byAppointmentSession, 'appointments');
  return null;
}

async function getPatientRecord(patientId, phone) {
  const patients = await db.list('patients');
  return patients.find((patient) =>
    patient.id === patientId ||
    patient.patientId === patientId ||
    cleanPhone(patient.phone) === cleanPhone(phone)
  ) || null;
}

async function getAuthorizedSessions(actor) {
  const [visits, appointments] = await Promise.all([
    db.list('visit_requests'),
    db.list('appointments'),
  ]);
  return [
    ...visits.map((item) => normalizeSession(item, 'visit_requests')),
    ...appointments.map((item) => normalizeSession(item, 'appointments')),
  ].filter((session) => actorOwnsSession(actor, session) && isAuthorizedStatus(session.status));
}

function canMutateSensitiveCollection(actor, collection, payload = {}, existing = null) {
  if (!SENSITIVE_COLLECTIONS.has(collection)) return true;
  if (!actor) return false;
  if (actor.role === 'admin') return true;
  const target = existing || payload;
  if (actor.role === 'patient') {
    return ['reminders', 'health_records'].includes(collection) &&
      String(target.patientId || actor.patientId || '') === String(actor.patientId || '');
  }
  if (actor.role === 'hospital') {
    return String(target.hospitalId || actor.hospitalId || '') === String(actor.hospitalId || '');
  }
  if (actor.role === 'doctor') {
    return String(target.doctorId || actor.doctorId || '') === String(actor.doctorId || '');
  }
  return false;
}

async function scopedSensitiveList(actor, collection, filter = {}) {
  const rows = await db.list(collection, filter);
  if (!SENSITIVE_COLLECTIONS.has(collection)) return rows;
  if (!actor) return [];
  if (actor.role === 'admin') return rows;
  if (actor.role === 'patient') return rows.filter((item) => String(item.patientId || '') === String(actor.patientId || ''));
  if (actor.role === 'hospital') {
    return rows.filter((item) => String(item.hospitalId || '') === String(actor.hospitalId || '') || sameText(item.hospitalName, actor.hospitalName));
  }
  if (actor.role === 'doctor') {
    return rows.filter((item) => String(item.doctorId || '') === String(actor.doctorId || '') || sameText(item.doctorName, actor.doctorName));
  }
  return [];
}

async function assertSessionAccess(req, res, sessionId, { allowCompleted = false, roles = ['doctor', 'hospital', 'admin'] } = {}) {
  const actor = await getActor(req);
  if (!actor) {
    res.status(401).json({ error: 'Please sign in to continue.' });
    return null;
  }
  if (!roles.includes(actor.role)) {
    res.status(403).json({ error: 'This action is not available for your role.' });
    return null;
  }
  const session = await findSession(sessionId);
  if (!session) {
    res.status(404).json({ error: 'Visit/session not found.' });
    return null;
  }
  if (!actorOwnsSession(actor, session)) {
    res.status(403).json({ error: 'This patient session is not authorized for your account.' });
    return null;
  }
  if (!isAuthorizedStatus(session.status)) {
    res.status(403).json({ error: 'The patient is not authorized for this session yet.' });
    return null;
  }
  if (!allowCompleted && isCompletedSession(session)) {
    res.status(409).json({ error: 'This patient session has already been completed.' });
    return null;
  }
  return { actor, session };
}

function parseMedicineReminderTimes(frequency = '') {
  const text = String(frequency || '').toLowerCase();
  if (text.includes('thrice') || text.includes('three') || text.includes('3')) return ['08:00 AM', '02:00 PM', '08:00 PM'];
  if (text.includes('twice') || text.includes('two') || text.includes('2') || text.includes('morning') && text.includes('night')) return ['08:00 AM', '08:00 PM'];
  if (text.includes('night') || text.includes('dinner')) return ['08:00 PM'];
  if (text.includes('afternoon') || text.includes('lunch')) return ['02:00 PM'];
  return ['08:00 AM'];
}

async function createPrescriptionReminders(prescription, actor, session) {
  const medicines = Array.isArray(prescription.medicines) ? prescription.medicines : [];
  const created = [];
  for (const med of medicines) {
    const medicine = String(med.medicine || med.name || '').trim();
    if (!medicine) continue;
    const times = parseMedicineReminderTimes(`${med.frequency || ''} ${med.instructions || ''}`);
    for (const time of times) {
      created.push(await db.create('reminders', {
        id: makeId('REM'),
        patientId: session.patientId,
        patientName: session.patientName,
        sessionId: session.sessionId || session.id,
        sourceCollection: session.sourceCollection,
        prescriptionId: prescription.id,
        title: `Take ${medicine}`,
        description: med.instructions || prescription.instructions || 'Follow the prescription instructions.',
        time,
        recurrence: med.frequency || 'Daily',
        duration: med.duration || '',
        type: 'Medication',
        category: 'Medicine reminder',
        enabled: true,
        mandatory: true,
        autoGenerated: true,
        sourceType: 'prescription',
        createdBy: actor.user.id,
        createdByRole: actor.role,
        hospitalId: session.hospitalId || actor.hospitalId,
        hospitalName: session.hospitalName || actor.hospitalName,
        doctorId: session.doctorId || actor.doctorId,
        doctorName: session.doctorName || actor.doctorName,
        status: 'Active',
      }));
    }
  }
  return created;
}

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
    const identifier = String(req.body.identifier || '').trim();
    const password = String(req.body.password || '');
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required.' });
    }
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
    const role = body.role || 'patient';
    const name = body.fullName || body.name || body.hospitalName || body.organizationName || 'New User';
    const email = body.email || body.contactEmail || '';
    const phone = body.mobileNumber || body.phone || body.mobile || body.contactPhone || '';
    const password = String(body.password || '');
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const { password: _omitPassword, confirmPassword: _omitConfirm, ...safeBody } = body;

    if (phone) {
      const existing = await db.findUserByIdentifier(phone);
      if (existing) {
        return res.status(409).json({ error: 'An account already exists with this mobile number.' });
      }
    }
    if (email) {
      const existing = await db.findUserByIdentifier(email);
      if (existing) {
        return res.status(409).json({ error: 'An account already exists with this email.' });
      }
    }

    const patientId = body.patientId || (role === 'patient' ? `AVP${Math.floor(100000 + Math.random() * 900000)}` : undefined);
    const doctorId = role === 'doctor' ? makeId('DOC') : undefined;
    const hospitalId = role === 'hospital' ? makeId('HOSP') : undefined;
    const user = await db.createUser({
      id: makeId('USR'),
      role,
      name,
      email: email || null,
      phone: phone || null,
      password_hash: hashPassword(password),
      data: {
        ...safeBody,
        patientId,
        doctorId,
        hospitalId,
        displayName: name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : ''),
        image: body.photoUrl || body.image || '/src/assets/images/patient_avatar_1787229395408.jpg',
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
        status: 'APPROVED',
      });
    } else if (role === 'doctor') {
      await db.create('doctors', {
        id: doctorId,
        name: name.startsWith('Dr') ? name : `Dr. ${name}`,
        speciality: body.speciality || 'General Medicine',
        qualifications: body.qualification || 'MBBS',
        hospital: body.currentHospital || body.hospital || 'Ayudh Network',
        district: body.district || 'Warangal',
        experienceYears: Number(body.experienceYears || 5),
        consultationFee: Number(body.consultationFee || 500),
        phone,
        email,
        status: 'Active',
        rating: 4.8,
        availableSlots: [
          { day: 'Today', date: '29', month: 'Aug', isToday: true, slots: ['10:00 AM', '04:00 PM'] },
        ],
      });
    } else if (role === 'hospital') {
      await db.create('hospitals', {
        id: hospitalId,
        name: body.hospitalName || name,
        shortName: body.hospitalName || name,
        district: body.district || 'Warangal',
        location: body.location || body.city || '',
        phone,
        email,
        specialities: body.specialities || ['General Medicine'],
        logoText: (body.hospitalName || name).slice(0, 6).toUpperCase(),
        logoBg: 'bg-blue-700',
        hasAyudhCashless: true,
        isOpen24x7: true,
        rating: 4.5,
        totalBeds: Number(body.totalBeds || 50),
        availableBeds: Number(body.availableBeds || 10),
        seniorDoctors: [],
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

    res.json({
      token: signToken(user),
      user,
      patientId,
      referenceNo: `AV-REG-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not signed in.' });
  const user = await db.getUser(req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found.' });
  res.json({ user });
});

app.patch('/api/auth/me', authRequired, async (req, res) => {
  const user = await db.updateUser(req.user.id, req.body || {});
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
  res.json({ user });
});

app.get('/api/bootstrap', async (_req, res) => {
  const [hospitals, doctors, health_camps, stats] = await Promise.all([
    db.list('hospitals'),
    db.list('doctors'),
    db.list('health_camps'),
    db.counts(),
  ]);
  res.json({
    mode: db.mode(),
    mongodb: db.mongoReady(),
    hospitals,
    doctors,
    health_camps,
    stats,
  });
});

app.get('/api/stats', async (_req, res) => {
  res.json({ mode: db.mode(), mongodb: db.mongoReady(), ...(await db.counts()) });
});

app.get('/api/authorized-patients', authRequired, async (req, res) => {
  try {
    const actor = await getActor(req);
    if (!['doctor', 'hospital', 'admin'].includes(actor?.role)) {
      return res.status(403).json({ error: 'Only hospital, doctor, or admin users can view authorized patients.' });
    }
    const sessions = (await getAuthorizedSessions(actor)).filter((session) => !isCompletedSession(session));
    const grouped = new Map();
    for (const session of sessions) {
      const key = session.patientId || session.patientPhone || session.phone || session.patientName;
      if (!key) continue;
      const current = grouped.get(key) || {
        patientId: session.patientId,
        patientName: session.patientName || session.name || 'Authorized Patient',
        phone: session.patientPhone || session.phone || '',
        age: session.patientAge || session.age || '',
        gender: session.patientGender || session.gender || '',
        bloodGroup: session.bloodGroup || '',
        sessions: [],
      };
      current.sessions.push(session);
      grouped.set(key, current);
    }
    const patients = [];
    for (const patient of grouped.values()) {
      const registry = await getPatientRecord(patient.patientId, patient.phone);
      const sortedSessions = patient.sessions.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
      if (!sortedSessions.length) continue;
      patients.push({
        ...patient,
        patientId: patient.patientId || registry?.patientId || registry?.id,
        patientName: registry?.fullName || registry?.name || patient.patientName,
        phone: registry?.phone || patient.phone,
        age: registry?.age || patient.age,
        gender: registry?.gender || patient.gender,
        bloodGroup: registry?.bloodGroup || patient.bloodGroup,
        address: registry?.address || '',
        activeSession: sortedSessions[0],
        sessions: sortedSessions,
      });
    }
    res.json({ items: patients, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load authorized patients.' });
  }
});

app.post('/api/authorized-patients/verify', authRequired, async (req, res) => {
  try {
    const actor = await getActor(req);
    if (!['doctor', 'hospital'].includes(actor?.role)) {
      return res.status(403).json({ error: 'Only hospital and doctor users can verify patient sessions.' });
    }
    const body = req.body || {};
    const q = String(body.patientId || body.memberId || body.uhid || body.phone || body.name || '').trim();
    if (!q) return res.status(400).json({ error: 'Patient ID, mobile, or UHID is required.' });
    const patient = await getPatientRecord(q, body.phone || q);
    const patientId = patient?.patientId || patient?.id || body.patientId || body.memberId || body.uhid;
    const patientName = patient?.fullName || patient?.name || body.patientName || body.name || 'Verified Patient';
    const patientPhone = patient?.phone || body.phone || '';
    const sessions = await getAuthorizedSessions(actor);
    const existing = sessions.find((session) =>
      !isCompletedSession(session) &&
      (String(session.patientId || '') === String(patientId || '') || cleanPhone(session.patientPhone || session.phone) === cleanPhone(patientPhone))
    );
    if (existing) return res.json({ item: existing, existing: true });

    const base = {
      patientId,
      patientName,
      patientPhone,
      patientAge: patient?.age || body.age,
      patientGender: patient?.gender || body.gender,
      bloodGroup: patient?.bloodGroup || body.bloodGroup,
      chiefComplaint: body.chiefComplaint || 'Direct patient verification / visit authorization',
      authorizationSource: body.method || 'Patient verification',
      authorizedAt: formatDateTime(),
      authorizedBy: actor.user.id,
      authorizedByRole: actor.role,
      sessionStatus: 'ACTIVE',
      visitPassStatus: 'ACTIVE',
      tokenNumber: body.tokenNumber || `TK-${Math.floor(10 + Math.random() * 90)}`,
      reportingRoom: body.reportingRoom || 'Ayudh Vikas Helpdesk / OPD Counter',
      status: 'Arrived',
    };
    const item = actor.role === 'hospital'
      ? await db.create('visit_requests', {
          id: makeId('HVR'),
          requestId: `AV-VISIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          ...base,
          hospitalId: actor.hospitalId,
          hospitalName: actor.hospitalName,
          department: body.department || 'General Medicine',
          doctorId: body.doctorId,
          doctorName: body.doctorName || 'Senior Duty Specialist',
          preferredDate: body.preferredDate || new Date().toISOString().slice(0, 10),
          preferredTimeSlot: body.preferredTimeSlot || 'Walk-in',
          visitType: body.visitType || 'OP Consultation',
        })
      : await db.create('appointments', {
          id: makeId('APT'),
          ...base,
          doctorId: actor.doctorId,
          doctorName: actor.doctorName,
          hospitalId: body.hospitalId || actor.doctor?.hospitalId,
          hospitalName: body.hospitalName || actor.doctor?.hospitalName || actor.doctor?.hospital || 'Ayudh Network',
          appointmentDate: body.appointmentDate || new Date().toISOString().slice(0, 10),
          appointmentTime: body.appointmentTime || 'Walk-in',
          visitType: body.visitType || 'Consultation',
          reason: body.chiefComplaint || 'Direct walk-in consultation',
        });
    res.status(201).json({ item: normalizeSession(item, actor.role === 'hospital' ? 'visit_requests' : 'appointments') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Patient verification failed.' });
  }
});

app.get('/api/patients/:patientId/sessions', authRequired, async (req, res) => {
  try {
    const actor = await getActor(req);
    const patientId = req.params.patientId;
    if (actor.role === 'patient' && String(actor.patientId) !== String(patientId)) {
      return res.status(403).json({ error: 'You can view only your own sessions.' });
    }
    const sessions = [
      ...(await db.list('visit_requests')).map((item) => normalizeSession(item, 'visit_requests')),
      ...(await db.list('appointments')).map((item) => normalizeSession(item, 'appointments')),
    ].filter((session) =>
      String(session.patientId || '') === String(patientId || '') &&
      (actor.role === 'patient' || actor.role === 'admin' || actorOwnsSession(actor, session))
    );
    res.json({ items: sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load patient sessions.' });
  }
});

app.get('/api/sessions/history', authRequired, async (req, res) => {
  try {
    const actor = await getActor(req);
    if (!['doctor', 'hospital', 'admin'].includes(actor?.role)) {
      return res.status(403).json({ error: 'Only hospital, doctor, or admin users can view session history.' });
    }
    const sessions = (await getAuthorizedSessions(actor))
      .filter((session) => isCompletedSession(session))
      .sort((a, b) => String(b.completedAt || b.updatedAt || b.createdAt || '').localeCompare(String(a.completedAt || a.updatedAt || a.createdAt || '')));

    const items = await Promise.all(sessions.map(async (session) => {
      const [reports, prescriptions, reminders] = await Promise.all([
        db.list('health_records', { sessionId: session.sessionId }),
        db.list('prescriptions', { sessionId: session.sessionId }),
        db.list('reminders', { sessionId: session.sessionId }),
      ]);
      return { ...session, reports, prescriptions, reminders };
    }));
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load session history.' });
  }
});

app.get('/api/sessions/:sessionId', authRequired, async (req, res) => {
  const result = await assertSessionAccess(req, res, req.params.sessionId, {
    allowCompleted: true,
    roles: ['doctor', 'hospital', 'patient', 'admin'],
  });
  if (!result) return;
  const { actor, session } = result;
  const patientOwns = actor.role === 'patient' && String(actor.patientId) === String(session.patientId);
  if (actor.role === 'patient' && !patientOwns) return res.status(403).json({ error: 'This session does not belong to you.' });
  const [reports, prescriptions, reminders] = await Promise.all([
    db.list('health_records', { sessionId: session.sessionId }),
    db.list('prescriptions', { sessionId: session.sessionId }),
    db.list('reminders', { sessionId: session.sessionId }),
  ]);
  res.json({ item: session, reports, prescriptions, reminders });
});

app.post('/api/sessions/:sessionId/reports', authRequired, async (req, res) => {
  const result = await assertSessionAccess(req, res, req.params.sessionId);
  if (!result) return;
  const { actor, session } = result;
  const body = req.body || {};
  const method = body.method || (body.file ? 'file' : body.documentLink ? 'link' : 'manual');
  if (method === 'link') {
    try {
      const url = new URL(body.documentLink);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    } catch {
      return res.status(400).json({ error: 'Please provide a valid http(s) report link.' });
    }
  }
  if (method === 'file' && (!body.file?.name || !body.file?.data)) {
    return res.status(400).json({ error: 'Report file name and data are required.' });
  }
  const report = await db.create('health_records', {
    id: makeId('REC'),
    patientId: session.patientId,
    patientName: session.patientName,
    sessionId: session.sessionId,
    sourceCollection: session.sourceCollection,
    hospitalId: session.hospitalId || actor.hospitalId,
    hospitalName: session.hospitalName || actor.hospitalName,
    doctorId: session.doctorId || actor.doctorId,
    doctorName: session.doctorName || actor.doctorName,
    title: body.title || body.reportType || 'Medical Report',
    type: body.reportType || 'Clinical Report',
    reportMethod: method,
    reportInformation: body.reportInformation || body.manualEntry || '',
    documentLink: method === 'link' ? body.documentLink : '',
    file: method === 'file' ? body.file.name : body.fileName || '',
    fileMeta: method === 'file' ? { name: body.file.name, type: body.file.type, size: body.file.size } : undefined,
    fileData: method === 'file' ? body.file.data : undefined,
    facility: session.hospitalName || actor.hospitalName || 'Ayudh Vikas Network',
    doctor: session.doctorName || actor.doctorName || '',
    date: formatDateTime(),
    status: body.status || 'Submitted',
    uploadedBy: actor.user.id,
    uploadedByRole: actor.role,
  });
  res.status(201).json({ item: report });
});

app.post('/api/sessions/:sessionId/prescriptions', authRequired, async (req, res) => {
  const result = await assertSessionAccess(req, res, req.params.sessionId);
  if (!result) return;
  const { actor, session } = result;
  const body = req.body || {};
  const medicines = Array.isArray(body.medicines) ? body.medicines : [];
  if (!medicines.length && !body.instructions) {
    return res.status(400).json({ error: 'Add at least one medicine or prescription instruction.' });
  }
  const prescription = await db.create('prescriptions', {
    id: makeId('RX'),
    patientId: session.patientId,
    patientName: session.patientName,
    sessionId: session.sessionId,
    sourceCollection: session.sourceCollection,
    hospitalId: session.hospitalId || actor.hospitalId,
    hospitalName: session.hospitalName || actor.hospitalName,
    doctorId: session.doctorId || actor.doctorId,
    doctorName: session.doctorName || actor.doctorName,
    prescriptionDate: formatDateTime(),
    medicines,
    instructions: body.instructions || '',
    followUpDate: body.followUpDate || '',
    status: 'Active',
    createdBy: actor.user.id,
    createdByRole: actor.role,
  });
  const reminders = await createPrescriptionReminders(prescription, actor, session);
  res.status(201).json({ item: prescription, reminders });
});

app.post('/api/sessions/:sessionId/reminders', authRequired, async (req, res) => {
  const result = await assertSessionAccess(req, res, req.params.sessionId);
  if (!result) return;
  const { actor, session } = result;
  const body = req.body || {};
  if (!body.title) return res.status(400).json({ error: 'Reminder title is required.' });
  const reminder = await db.create('reminders', {
    id: makeId('REM'),
    patientId: session.patientId,
    patientName: session.patientName,
    sessionId: session.sessionId,
    sourceCollection: session.sourceCollection,
    hospitalId: session.hospitalId || actor.hospitalId,
    hospitalName: session.hospitalName || actor.hospitalName,
    doctorId: session.doctorId || actor.doctorId,
    doctorName: session.doctorName || actor.doctorName,
    title: body.title,
    description: body.description || body.instructions || '',
    time: body.time || body.dateTime || '',
    recurrence: body.recurrence || '',
    type: body.type || body.category || 'Health Reminder',
    category: body.category || 'Health Reminder',
    mandatory: Boolean(body.mandatory),
    enabled: body.enabled !== false,
    autoGenerated: false,
    sourceType: 'manual',
    status: body.status || 'Active',
    createdBy: actor.user.id,
    createdByRole: actor.role,
  });
  res.status(201).json({ item: reminder });
});

app.patch('/api/reminders/:reminderId', authRequired, async (req, res) => {
  const actor = await getActor(req);
  const reminder = await db.get('reminders', req.params.reminderId);
  if (!reminder) return res.status(404).json({ error: 'Reminder not found.' });
  const patch = req.body || {};
  const patientOwns = actor.role === 'patient' && String(reminder.patientId || '') === String(actor.patientId || '');
  const creatorOwns =
    (actor.role === 'doctor' && (String(reminder.doctorId || '') === String(actor.doctorId || '') || reminder.createdBy === actor.user.id)) ||
    (actor.role === 'hospital' && (String(reminder.hospitalId || '') === String(actor.hospitalId || '') || reminder.createdBy === actor.user.id));
  if (!patientOwns && !creatorOwns && actor.role !== 'admin') {
    return res.status(403).json({ error: 'You are not allowed to update this reminder.' });
  }
  if (patientOwns && reminder.mandatory && patch.enabled === false) {
    return res.status(403).json({ error: 'This reminder is mandatory and can only be changed by the medical team.' });
  }
  if (patientOwns) {
    const item = await db.update('reminders', reminder.id, { enabled: patch.enabled !== false });
    return res.json({ item });
  }
  const item = await db.update('reminders', reminder.id, patch);
  res.json({ item });
});

app.post('/api/sessions/:sessionId/finish', authRequired, async (req, res) => {
  const result = await assertSessionAccess(req, res, req.params.sessionId);
  if (!result) return;
  const { actor, session } = result;
  const completedAt = formatDateTime();
  const item = await db.update(session.sourceCollection, session.id, {
    status: 'Completed',
    sessionStatus: 'COMPLETED',
    completedAt,
    completedBy: actor.user.id,
    completedByRole: actor.role,
    visitPassStatus: 'EXPIRED',
    visitPassExpiredAt: completedAt,
    historyRecorded: true,
  });
  res.json({ item: normalizeSession(item, session.sourceCollection) });
});

app.get('/api/patient/medical-feed', authRequired, async (req, res) => {
  try {
    const actor = await getActor(req);
    if (actor.role !== 'patient') return res.status(403).json({ error: 'Patient access is required.' });
    const patientId = actor.patientId;
    const [reports, prescriptions, reminders, visits, appointments] = await Promise.all([
      db.list('health_records', { patientId }),
      db.list('prescriptions', { patientId }),
      db.list('reminders', { patientId }),
      db.list('visit_requests', { patientId }),
      db.list('appointments', { patientId }),
    ]);
    res.json({
      reports,
      prescriptions,
      reminders,
      sessions: [
        ...visits.map((item) => normalizeSession(item, 'visit_requests')),
        ...appointments.map((item) => normalizeSession(item, 'appointments')),
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load patient medical data.' });
  }
});

app.get('/api/users', adminRequired, async (req, res) => {
  const { page, limit, ...filter } = req.query;
  const users = await db.listUsers(filter);
  res.json({ items: users });
});

app.post('/api/users', adminRequired, async (req, res) => {
  try {
    const body = req.body || {};
    const role = body.role || 'patient';
    const name = body.name || body.fullName || body.hospitalName || 'New User';
    const email = body.email || body.contactEmail || '';
    const phone = body.phone || body.mobile || body.mobileNumber || body.contactPhone || '';
    const password = String(body.password || 'Password@123');
    const user = await db.createUser({
      id: makeId('USR'),
      role,
      name,
      email: email || null,
      phone: phone || null,
      password_hash: hashPassword(password),
      data: {
        ...body,
        displayName: body.displayName || name,
        status: body.status || 'Active',
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

app.get('/api/records/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  if (SENSITIVE_COLLECTIONS.has(collection) && !req.user) {
    return res.status(401).json({ error: 'Please sign in to view medical records.' });
  }
  const { page, limit, ...filter } = req.query;
  const actor = req.user ? await getActor(req) : null;
  const items = SENSITIVE_COLLECTIONS.has(collection)
    ? await scopedSensitiveList(actor, collection, filter)
    : await db.list(collection, filter);
  res.json({ items });
});

app.get('/api/records/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  if (SENSITIVE_COLLECTIONS.has(collection) && !req.user) {
    return res.status(401).json({ error: 'Please sign in to view medical records.' });
  }
  const item = await db.get(collection, id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    const visible = await scopedSensitiveList(actor, collection, {});
    if (!visible.some((record) => record.id === item.id)) {
      return res.status(403).json({ error: 'You are not allowed to view this medical record.' });
    }
  }
  res.json({ item });
});

app.post('/api/records/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  if (SENSITIVE_COLLECTIONS.has(collection) && !req.user) {
    return res.status(401).json({ error: 'Please sign in to create medical records.' });
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
    };
    payload.id = makeId(prefixes[collection] || 'REC');
  }
  if (req.user) {
    payload.createdBy = req.user.id;
    payload.createdByRole = req.user.role;
    if (!payload.patientId && req.user.role === 'patient') {
      const me = await db.getUser(req.user.id);
      payload.patientId = me?.patientId;
      payload.patientName = payload.patientName || me?.name;
      payload.phone = payload.phone || me?.phone;
    }
    if (!payload.doctorId && req.user.role === 'doctor') {
      const me = await db.getUser(req.user.id);
      payload.doctorId = me?.doctorId;
    }
    if (!payload.hospitalId && req.user.role === 'hospital') {
      const me = await db.getUser(req.user.id);
      payload.hospitalId = me?.hospitalId;
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
  }
  if (collection === 'visit_requests' && !payload.requestId) {
    payload.requestId = `AV-VISIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    payload.requestedAt = payload.requestedAt || new Date().toLocaleString('en-IN');
  }
  if (collection === 'appointments' && !payload.tokenNumber) {
    payload.tokenNumber = `TK-${Math.floor(10 + Math.random() * 90)}`;
  }
  if (['visit_requests', 'appointments'].includes(collection) && isAuthorizedStatus(payload.status)) {
    payload.authorizedAt = payload.authorizedAt || formatDateTime();
    payload.sessionStatus = payload.sessionStatus || 'ACTIVE';
    payload.visitPassStatus = payload.visitPassStatus || 'ACTIVE';
    payload.tokenNumber = payload.tokenNumber || `TK-${Math.floor(10 + Math.random() * 90)}`;
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

  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    if (!canMutateSensitiveCollection(actor, collection, payload)) {
      return res.status(403).json({ error: 'Use the authorized session workflow for medical records.' });
    }
  }

  const item = await db.create(collection, payload);

  if (collection === 'doctors' && payload.hospitalId) {
    const hospital = await db.get('hospitals', payload.hospitalId);
    if (hospital) {
      const seniorDoctors = [payload, ...(hospital.seniorDoctors || [])];
      await db.update('hospitals', payload.hospitalId, { seniorDoctors });
    }
  }

  if (collection === 'wallet_txns' && req.user) {
    await db.updateUser(req.user.id, { walletBalance: item.balanceAfter });
  }

  res.status(201).json({ item });
});

app.patch('/api/records/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  if (SENSITIVE_COLLECTIONS.has(collection) && !req.user) {
    return res.status(401).json({ error: 'Please sign in to update medical records.' });
  }
  const patch = { ...(req.body || {}) };
  if (['visit_requests', 'appointments'].includes(collection) && isAuthorizedStatus(patch.status)) {
    patch.authorizedAt = patch.authorizedAt || formatDateTime();
    patch.sessionStatus = patch.sessionStatus || 'ACTIVE';
    patch.visitPassStatus = patch.visitPassStatus || 'ACTIVE';
    patch.tokenNumber = patch.tokenNumber || `TK-${Math.floor(10 + Math.random() * 90)}`;
  }
  const existing = await db.get(collection, id);
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    if (!canMutateSensitiveCollection(actor, collection, patch, existing)) {
      return res.status(403).json({ error: 'You are not allowed to update this medical record.' });
    }
  }
  const item = await db.update(collection, id, patch);
  if (!item) return res.status(404).json({ error: 'Not found' });

  if (collection === 'doctors' && item.hospitalId) {
    const hospital = await db.get('hospitals', item.hospitalId);
    if (hospital) {
      const seniorDoctors = (hospital.seniorDoctors || []).map((d) => (d.id === item.id ? { ...d, ...item } : d));
      if (!seniorDoctors.some((d) => d.id === item.id)) seniorDoctors.unshift(item);
      await db.update('hospitals', item.hospitalId, { seniorDoctors });
    }
  }

  res.json({ item });
});

app.delete('/api/records/:collection/:id', authRequired, async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const existing = await db.get(collection, id);
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    if (!canMutateSensitiveCollection(actor, collection, {}, existing)) {
      return res.status(403).json({ error: 'You are not allowed to delete this medical record.' });
    }
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
  res.json({ ok: true, item });
});

app.get('/api/patients/lookup', async (req, res) => {
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

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ collection: '_hello', action: 'hello', record: { mode: db?.mode?.() || 'starting' } })}\n\n`);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

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
    broadcast({ ...event, type: 'record:change' });
  });
  const info = await db.connect();
  await seedDatabase(db, async (plain) => hashPassword(plain));
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
