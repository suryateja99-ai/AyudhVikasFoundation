import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_FILE = path.join(__dirname, 'local-data.json');
const DEFAULT_DB_NAME = 'ayudh_vikas_db';

const COLLECTIONS = [
  'hospitals',
  'doctors',
  'patients',
  'health_camps',
  'appointments',
  'ambulance_bookings',
  'lab_bookings',
  'home_care_bookings',
  'visit_requests',
  'camp_registrations',
  'leads',
  'partnerships',
  'callbacks',
  'emergencies',
  'memberships',
  'tickets',
  'feedback',
  'health_records',
  'reminders',
  'wallet_txns',
  'notifications',
  'insurance_applications',
  'prescriptions',
  'enquiries',
  'doctor_hospital_assignments',
  'hospital_beds',
  'doctor_verification_actions',
  'hospital_verification_actions',
  'subscription_plans',
];

function emptyStore() {
  const collections = {};
  for (const name of COLLECTIONS) collections[name] = [];
  return { users: [], collections };
}

function loadLocal() {
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
      const base = emptyStore();
      base.users = Array.isArray(parsed.users) ? parsed.users : [];
      for (const name of COLLECTIONS) {
        base.collections[name] = Array.isArray(parsed.collections?.[name])
          ? parsed.collections[name]
          : [];
      }
      return base;
    }
  } catch (err) {
    console.warn('[db] Failed to read local-data.json, starting empty:', err.message);
  }
  return emptyStore();
}

function saveLocal(store) {
  const next = JSON.stringify(store, null, 2);
  try {
    if (fs.existsSync(LOCAL_FILE) && fs.readFileSync(LOCAL_FILE, 'utf8') === next) return;
  } catch {
    /* rewrite */
  }
  fs.writeFileSync(LOCAL_FILE, next, 'utf8');
}

function cleanEnvValue(value) {
  if (value === undefined || value === null) return '';
  let v = String(value).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  if (!v || v === 'undefined' || v === 'null') return '';
  return v;
}

function normalizeMongoUri(uri) {
  const cleaned = cleanEnvValue(uri);
  if (!cleaned) return '';
  if (cleaned.startsWith('mongodb://') || cleaned.startsWith('mongodb+srv://')) return cleaned;
  return '';
}

export function buildMongoUrl() {
  return (
    normalizeMongoUri(process.env.MONGODB_URI) ||
    normalizeMongoUri(process.env.MONGO_URL) ||
    normalizeMongoUri(process.env.MONGO_URI)
  );
}

function databaseNameFromUrl(uri) {
  const configured = cleanEnvValue(process.env.MONGODB_DB || process.env.MONGO_DB || process.env.DB_NAME);
  if (configured) return configured;
  try {
    const parsed = new URL(uri);
    const pathname = decodeURIComponent(parsed.pathname || '').replace(/^\/+/, '').trim();
    return pathname || DEFAULT_DB_NAME;
  } catch {
    return DEFAULT_DB_NAME;
  }
}

function redactUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return '(set, but not a valid MongoDB URL)';
  }
}

function withoutMongoId(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

function matchesFilter(record, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined || value === null || value === '') return true;
    const actual = record[key];
    if (actual === undefined || actual === null) return false;
    return String(actual).toLowerCase() === String(value).toLowerCase();
  });
}

export function createDb(onChange) {
  let mode = 'local';
  let client = null;
  let mongo = null;
  let store = loadLocal();
  let persistTimer = null;
  let lastError = null;
  let lastTarget = '';
  let lastDbName = '';
  const watchers = [];

  const emit = (event) => {
    if (typeof onChange === 'function') onChange(event);
  };

  const persistSoon = () => {
    if (mode !== 'local') return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try {
        saveLocal(store);
      } catch (err) {
        console.error('[db] persist failed:', err.message);
      }
    }, 80);
  };

  function collection(name) {
    if (name === 'users') return mongo.collection('users');
    return mongo.collection(name);
  }

  async function ensureIndexes() {
    await collection('users').createIndex({ id: 1 }, { unique: true });
    await collection('users').createIndex({ role: 1 });
    await collection('users').createIndex({ email: 1 }, { sparse: true });
    await collection('users').createIndex({ phone: 1 }, { sparse: true });
    await collection('users').createIndex({ 'data.patientId': 1 }, { sparse: true });
    await collection('users').createIndex({ 'data.identifier': 1 }, { sparse: true });
    for (const name of COLLECTIONS) {
      await collection(name).createIndex({ id: 1 }, { unique: true });
      await collection(name).createIndex({ createdAt: -1 });
    }
  }

  async function importLocalIfMongoEmpty() {
    if (!(await isEmpty())) return false;
    const localHasData =
      store.users.length > 0 ||
      Object.values(store.collections).some((rows) => rows.length > 0);
    if (!localHasData) return false;

    console.log('[db] Empty MongoDB database - importing existing local-data.json...');
    if (store.users.length) {
      await collection('users').insertMany(store.users, { ordered: false }).catch((err) => {
        if (err.code !== 11000) throw err;
      });
    }
    for (const [name, rows] of Object.entries(store.collections)) {
      if (!rows.length) continue;
      await collection(name).insertMany(rows, { ordered: false }).catch((err) => {
        if (err.code !== 11000) throw err;
      });
    }
    console.log('[db] Local data imported into MongoDB.');
    return true;
  }

  async function startWatchers() {
    if (process.env.MONGODB_WATCH === 'false') return;
    const watchNames = ['users', ...COLLECTIONS];
    for (const name of watchNames) {
      try {
        const stream = collection(name).watch([], { fullDocument: 'updateLookup' });
        stream.on('change', (change) => {
          const actionMap = { insert: 'create', update: 'update', replace: 'update', delete: 'delete' };
          const action = actionMap[change.operationType];
          if (!action) return;
          if (action === 'delete') {
            emit({ collection: name, action, record: { id: change.documentKey?._id?.toString?.() } });
            return;
          }
          const record = withoutMongoId(change.fullDocument);
          if (record) emit({ collection: name, action, record });
        });
        stream.on('error', (err) => {
          console.warn(`[db] MongoDB change stream unavailable for ${name}:`, err.message);
        });
        watchers.push(stream);
      } catch (err) {
        console.warn(`[db] MongoDB change stream unavailable for ${name}:`, err.message);
      }
    }
  }

  async function connect() {
    const url = buildMongoUrl();
    lastError = null;
    lastTarget = url ? redactUrl(url) : '';
    lastDbName = url ? databaseNameFromUrl(url) : '';

    if (!url) {
      mode = 'local';
      console.log('[db] MONGODB_URI not set - using local JSON store until MongoDB credentials are provided.');
      return { mode, configured: false };
    }

    try {
      client = new MongoClient(url, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        tls: true,
        retryWrites: true,
      });
      await client.connect();
      mongo = client.db(lastDbName);
      await mongo.command({ ping: 1 });
      await ensureIndexes();
      mode = 'mongodb';
      await importLocalIfMongoEmpty();
      await startWatchers();
      console.log(`[db] Connected to MongoDB at ${lastTarget} using database ${lastDbName}`);
      return { mode, configured: true, target: lastTarget, database: lastDbName };
    } catch (err) {
      lastError = err.message;
      console.error('[db] MongoDB connection failed, falling back to local store:', err.message);
      if (client) {
        try { await client.close(); } catch {}
      }
      client = null;
      mongo = null;
      mode = 'local';
      return { mode, configured: true, error: err.message, target: lastTarget, database: lastDbName };
    }
  }

  function status() {
    const configuredUrl = buildMongoUrl();
    return {
      mode,
      mongodb: mode === 'mongodb',
      configured: Boolean(configuredUrl),
      target: lastTarget || (configuredUrl ? redactUrl(configuredUrl) : ''),
      database: lastDbName || (configuredUrl ? databaseNameFromUrl(configuredUrl) : ''),
      error: lastError,
    };
  }

  async function isEmpty() {
    if (mode === 'mongodb') {
      const users = await collection('users').estimatedDocumentCount();
      if (users > 0) return false;
      for (const name of COLLECTIONS) {
        if (await collection(name).estimatedDocumentCount()) return false;
      }
      return true;
    }
    const collectionCount = Object.values(store.collections).reduce((n, arr) => n + arr.length, 0);
    return store.users.length === 0 && collectionCount === 0;
  }

  function publicUser(user) {
    if (!user) return null;
    const { password_hash, passwordHash, _id, ...rest } = user;
    const roles = Array.isArray(rest.roles) && rest.roles.length
      ? rest.roles
      : [rest.primaryRole || rest.role || rest.data?.role || 'patient'];
    const primaryRole = rest.primaryRole || rest.role || roles[0];
    return {
      id: rest.id,
      name: rest.name,
      email: rest.email || rest.data?.email || '',
      phone: rest.phone || rest.data?.phone || '',
      emailVerified: rest.emailVerified ?? rest.data?.emailVerified ?? true,
      createdAt: rest.created_at || rest.createdAt,
      ...(rest.data || {}),
      role: primaryRole,
      roles,
      primaryRole,
    };
  }

  async function listUsers(filter = {}) {
    if (mode === 'mongodb') {
      const rows = await collection('users').find({}).sort({ created_at: -1, createdAt: -1 }).toArray();
      return rows.map((row) => publicUser(row)).filter((user) => matchesFilter(user, filter));
    }
    return store.users.map(publicUser).filter((user) => matchesFilter(user, filter));
  }

  async function findUserByIdentifier(identifier) {
    const raw = String(identifier || '').trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    if (mode === 'mongodb') {
      return collection('users').findOne({
        $or: [
          { email: { $regex: `^${escapeRegex(lower)}$`, $options: 'i' } },
          { phone: raw },
          { id: raw },
          { 'data.patientId': raw },
          { 'data.identifier': { $regex: `^${escapeRegex(lower)}$`, $options: 'i' } },
        ],
      });
    }
    return (
      store.users.find((user) => {
        const email = String(user.email || '').toLowerCase();
        const phone = String(user.phone || '');
        const patientId = String(user.data?.patientId || '');
        const ident = String(user.data?.identifier || '').toLowerCase();
        return email === lower || phone === raw || user.id === raw || patientId === raw || ident === lower;
      }) || null
    );
  }

  async function getUser(id) {
    if (mode === 'mongodb') {
      const found = await collection('users').findOne({ id });
      return publicUser(found);
    }
    const found = store.users.find((user) => user.id === id);
    return publicUser(found);
  }

  async function getRawUser(id) {
    if (mode === 'mongodb') {
      return collection('users').findOne({ id });
    }
    return store.users.find((user) => user.id === id) || null;
  }

  async function findUserByVerificationToken(token) {
    const raw = String(token || '').trim();
    if (!raw) return null;
    if (mode === 'mongodb') {
      return collection('users').findOne({
        $or: [{ verificationToken: raw }, { 'data.verificationToken': raw }],
      });
    }
    return (
      store.users.find(
        (user) => user.verificationToken === raw || user.data?.verificationToken === raw
      ) || null
    );
  }

  async function createUser(user) {
    const roles = Array.isArray(user.roles) && user.roles.length ? user.roles : [user.primaryRole || user.role || 'patient'];
    const primaryRole = user.primaryRole || user.role || roles[0];
    const row = {
      id: user.id,
      role: primaryRole,
      roles,
      primaryRole,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      password_hash: user.password_hash,
      emailVerified: user.emailVerified ?? false,
      verificationToken: user.verificationToken || null,
      verificationTokenExpiry: user.verificationTokenExpiry || null,
      data: user.data || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (mode === 'mongodb') {
      await collection('users').insertOne(row);
    } else {
      store.users.unshift(row);
      persistSoon();
    }
    const pub = publicUser(row);
    emit({ collection: 'users', action: 'create', record: pub });
    return pub;
  }

  async function updateUser(id, patch) {
    const current = mode === 'mongodb'
      ? await collection('users').findOne({ id })
      : store.users.find((user) => user.id === id);
    if (!current) return null;
    const data = { ...(current.data || {}), ...(patch.data || patch) };
    const nextRole = patch.primaryRole ?? patch.role ?? current.primaryRole ?? current.role;
    const nextRoles = patch.roles ?? current.roles ?? [nextRole];
    const next = {
      ...current,
      name: patch.name ?? current.name,
      email: patch.email ?? current.email,
      phone: patch.phone ?? current.phone,
      role: nextRole,
      roles: nextRoles,
      primaryRole: nextRole,
      password_hash: patch.password_hash ?? current.password_hash,
      emailVerified: patch.emailVerified ?? current.emailVerified,
      verificationToken: patch.verificationToken === undefined ? current.verificationToken : patch.verificationToken,
      verificationTokenExpiry: patch.verificationTokenExpiry === undefined ? current.verificationTokenExpiry : patch.verificationTokenExpiry,
      data,
      updated_at: new Date().toISOString(),
    };
    if (mode === 'mongodb') {
      const { _id, ...doc } = next;
      await collection('users').replaceOne({ id }, doc);
    } else {
      store.users = store.users.map((user) => (user.id === id ? next : user));
      persistSoon();
    }
    const pub = publicUser(next);
    emit({ collection: 'users', action: 'update', record: pub });
    return pub;
  }

  async function removeUser(id) {
    const current = mode === 'mongodb'
      ? await collection('users').findOne({ id })
      : store.users.find((user) => user.id === id);
    if (!current) return null;
    if (mode === 'mongodb') {
      await collection('users').deleteOne({ id });
    } else {
      store.users = store.users.filter((user) => user.id !== id);
      persistSoon();
    }
    const pub = publicUser(current);
    emit({ collection: 'users', action: 'delete', record: pub || { id } });
    return pub;
  }

  async function list(name, filter = {}) {
    if (mode === 'mongodb') {
      const rows = await collection(name).find({}).sort({ createdAt: -1, created_at: -1 }).toArray();
      return rows.map(withoutMongoId).filter((record) => matchesFilter(record, filter));
    }
    return (store.collections[name] || []).filter((record) => matchesFilter(record, filter));
  }

  async function get(name, id) {
    if (mode === 'mongodb') {
      return withoutMongoId(await collection(name).findOne({ id }));
    }
    return (store.collections[name] || []).find((record) => record.id === id) || null;
  }

  async function create(name, data) {
    const record = {
      ...data,
      id: data.id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (mode === 'mongodb') {
      await collection(name).insertOne(record);
    } else {
      store.collections[name] = [record, ...(store.collections[name] || [])];
      persistSoon();
    }
    emit({ collection: name, action: 'create', record });
    return record;
  }

  async function updateRecord(name, id, patch) {
    const current = await get(name, id);
    if (!current) return null;
    const record = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
    if (mode === 'mongodb') {
      await collection(name).replaceOne({ id }, record);
    } else {
      store.collections[name] = (store.collections[name] || []).map((item) =>
        item.id === id ? record : item
      );
      persistSoon();
    }
    emit({ collection: name, action: 'update', record });
    return record;
  }

  async function removeRecord(name, id) {
    const current = await get(name, id);
    if (mode === 'mongodb') {
      await collection(name).deleteOne({ id });
    } else {
      store.collections[name] = (store.collections[name] || []).filter((item) => item.id !== id);
      persistSoon();
    }
    if (name === 'doctors' || name === 'hospitals') {
      const assignments = await list('doctor_hospital_assignments', name === 'doctors' ? { doctorId: id } : { hospitalId: id });
      for (const assignment of assignments) {
        await removeRecord('doctor_hospital_assignments', assignment.id);
      }
    }
    if (name === 'hospitals') {
      const beds = await list('hospital_beds', { hospitalId: id });
      for (const bed of beds) {
        await removeRecord('hospital_beds', bed.id);
      }
    }
    emit({ collection: name, action: 'delete', record: current || { id } });
    return current;
  }

  async function counts() {
    const result = {};
    if (mode === 'mongodb') {
      for (const name of COLLECTIONS) {
        result[name] = await collection(name).estimatedDocumentCount();
      }
      result.users = await collection('users').estimatedDocumentCount();
      return result;
    }
    for (const name of COLLECTIONS) {
      result[name] = (await list(name)).length;
    }
    result.users = (await listUsers()).length;
    return result;
  }

  async function snapshot() {
    const collections = {};
    for (const name of COLLECTIONS) collections[name] = await list(name);
    return {
      mode,
      users: await listUsers(),
      collections,
    };
  }

  return {
    COLLECTIONS,
    connect,
    isEmpty,
    status,
    mode: () => mode,
    mongoReady: () => mode === 'mongodb',
    listUsers,
    findUserByIdentifier,
    getUser,
    getRawUser,
    findUserByVerificationToken,
    createUser,
    updateUser,
    removeUser,
    list,
    get,
    create,
    update: updateRecord,
    remove: removeRecord,
    counts,
    snapshot,
    persistNow: () => {
      if (mode === 'local') saveLocal(store);
    },
    close: async () => {
      await Promise.all(watchers.map((watcher) => watcher.close().catch(() => {})));
      if (client) await client.close();
    },
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { COLLECTIONS };
