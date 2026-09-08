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

app.get('/api/health', async (_req, res) => {
  const counts = db ? await db.counts() : {};
  const status = db ? db.status() : { mode: 'starting', postgres: false, configured: false };
  res.json({
    ok: true,
    ...status,
    postgres: status.postgres,
    counts,
    hint: status.postgres
      ? 'PostgreSQL is connected and in use.'
      : status.configured
        ? `PostgreSQL URL is set but the connection failed${status.error ? `: ${status.error}` : ''}. The app is using the local store until it succeeds.`
        : 'Paste DATABASE_URL in .env to connect PostgreSQL. Until then the app uses a local JSON store.',
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
    postgres: db.postgresReady(),
    hospitals,
    doctors,
    health_camps,
    stats,
  });
});

app.get('/api/stats', async (_req, res) => {
  res.json({ mode: db.mode(), postgres: db.postgresReady(), ...(await db.counts()) });
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
  const { page, limit, ...filter } = req.query;
  const items = await db.list(collection, filter);
  res.json({ items });
});

app.get('/api/records/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  const item = await db.get(collection, id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item });
});

app.post('/api/records/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
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
  const item = await db.update(collection, id, req.body || {});
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
    if (status.postgres) {
      console.log(`[db] PostgreSQL connected (${status.target})`);
    } else if (status.configured) {
      console.log(`[db] PostgreSQL URL is set but connection failed: ${status.error}`);
      console.log('[db] Using local JSON store until PostgreSQL is reachable.');
    } else {
      console.log('[db] No DATABASE_URL yet — using local JSON store. Paste credentials in .env when ready.');
    }
    console.log(`[web] Open the site at http://localhost:${VITE_PORT}`);
  });
}

start().catch((err) => {
  console.error('[api] Failed to start', err);
  process.exit(1);
});
