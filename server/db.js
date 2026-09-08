import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_FILE = path.join(__dirname, 'local-data.json');

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
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function matchesFilter(record, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined || value === null || value === '') return true;
    const actual = record[key];
    if (actual === undefined || actual === null) return false;
    return String(actual).toLowerCase() === String(value).toLowerCase();
  });
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

export function buildDatabaseUrl() {
  const direct =
    cleanEnvValue(process.env.DATABASE_URL) ||
    cleanEnvValue(process.env.POSTGRES_URL) ||
    cleanEnvValue(process.env.POSTGRES_PRISMA_URL) ||
    cleanEnvValue(process.env.NEON_DATABASE_URL);
  if (direct) return direct;

  const host = cleanEnvValue(process.env.PGHOST);
  const user = cleanEnvValue(process.env.PGUSER);
  const database = cleanEnvValue(process.env.PGDATABASE);
  if (host && user && database) {
    const password = encodeURIComponent(cleanEnvValue(process.env.PGPASSWORD));
    const port = cleanEnvValue(process.env.PGPORT) || '5432';
    return `postgresql://${encodeURIComponent(user)}:${password}@${host}:${port}/${database}`;
  }
  return '';
}

function sslForUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (process.env.DATABASE_SSL === 'false') return false;
  if (lower.includes('sslmode=disable') || lower.includes('ssl=false')) return false;
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };
  if (lower.includes('localhost') || lower.includes('127.0.0.1')) return false;
  // Hosted Postgres (Neon, Supabase, RDS, Render, Railway) requires SSL.
  return { rejectUnauthorized: false };
}

function redactUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return '(set, but not a valid URL)';
  }
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password_hash TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS users_email_idx ON users ((lower(email)))`,
  `CREATE INDEX IF NOT EXISTS users_phone_idx ON users (phone)`,
  `CREATE INDEX IF NOT EXISTS users_role_idx ON users (role)`,
  `CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS records_collection_idx ON records (collection)`,
  `CREATE INDEX IF NOT EXISTS records_data_gin ON records USING GIN (data)`,
];

export function createDb(onChange) {
  let mode = 'local';
  let pool = null;
  let listenClient = null;
  let store = loadLocal();
  let persistTimer = null;
  let lastError = null;
  let lastTarget = '';

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

  async function applySchema() {
    for (const statement of SCHEMA_STATEMENTS) {
      await pool.query(statement);
    }
  }

  async function importLocalIfPostgresEmpty() {
    if (!(await isEmpty())) return false;
    const localHasData =
      store.users.length > 0 ||
      Object.values(store.collections).some((rows) => rows.length > 0);
    if (!localHasData) return false;

    console.log('[db] Empty PostgreSQL database — importing existing local-data.json…');
    for (const user of store.users) {
      await pool.query(
        `INSERT INTO users (id, role, name, email, phone, password_hash, data)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.role,
          user.name,
          user.email || null,
          user.phone || null,
          user.password_hash,
          JSON.stringify(user.data || {}),
        ]
      );
    }
    for (const [collection, rows] of Object.entries(store.collections)) {
      for (const row of rows) {
        await pool.query(
          `INSERT INTO records (id, collection, data) VALUES ($1,$2,$3::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [row.id, collection, JSON.stringify(row)]
        );
      }
    }
    console.log('[db] Local data imported into PostgreSQL.');
    return true;
  }

  async function connect() {
    const url = buildDatabaseUrl();
    lastError = null;
    lastTarget = url ? redactUrl(url) : '';

    if (!url) {
      mode = 'local';
      console.log('[db] DATABASE_URL not set — using local JSON store until Postgres credentials are provided.');
      return { mode, configured: false };
    }

    try {
      pool = new Pool({
        connectionString: url,
        ssl: sslForUrl(url),
        max: 10,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      });
      await pool.query('SELECT 1 AS ok');
      await applySchema();
      mode = 'postgres';
      await importLocalIfPostgresEmpty();
      console.log(`[db] Connected to PostgreSQL at ${lastTarget}`);
      await startListen(url);
      return { mode, configured: true, target: lastTarget };
    } catch (err) {
      lastError = err.message;
      console.error('[db] PostgreSQL connection failed, falling back to local store:', err.message);
      if (pool) {
        try { await pool.end(); } catch {}
      }
      pool = null;
      mode = 'local';
      return { mode, configured: true, error: err.message, target: lastTarget };
    }
  }

  function status() {
    return {
      mode,
      postgres: mode === 'postgres',
      configured: Boolean(buildDatabaseUrl()),
      target: lastTarget || (buildDatabaseUrl() ? redactUrl(buildDatabaseUrl()) : ''),
      error: lastError,
    };
  }

  async function startListen(url) {
    try {
      listenClient = new pg.Client({
        connectionString: url,
        ssl: sslForUrl(url),
      });
      await listenClient.connect();
      await listenClient.query('LISTEN ayudh_changes');
      listenClient.on('notification', async (msg) => {
        try {
          const payload = JSON.parse(msg.payload || '{}');
          if (payload.collection === 'users') {
            const user = await getUser(payload.id);
            emit({ collection: 'users', action: String(payload.action || 'UPDATE').toLowerCase(), record: user });
            return;
          }
          if (payload.action === 'DELETE') {
            emit({ collection: payload.collection, action: 'delete', record: { id: payload.id } });
            return;
          }
          const record = await get(payload.collection, payload.id);
          emit({
            collection: payload.collection,
            action: String(payload.action || 'UPDATE').toLowerCase() === 'insert' ? 'create' : 'update',
            record,
          });
        } catch (err) {
          console.warn('[db] notify parse failed:', err.message);
        }
      });
      listenClient.on('error', (err) => {
        console.warn('[db] LISTEN client error:', err.message);
      });
    } catch (err) {
      console.warn('[db] LISTEN/NOTIFY not available:', err.message);
    }
  }

  async function isEmpty() {
    if (mode === 'postgres') {
      const users = await pool.query('SELECT COUNT(*)::int AS c FROM users');
      const records = await pool.query('SELECT COUNT(*)::int AS c FROM records');
      return users.rows[0].c === 0 && records.rows[0].c === 0;
    }
    const collectionCount = Object.values(store.collections).reduce((n, arr) => n + arr.length, 0);
    return store.users.length === 0 && collectionCount === 0;
  }

  function publicUser(user) {
    if (!user) return null;
    const { password_hash, passwordHash, ...rest } = user;
    return {
      id: rest.id,
      role: rest.role,
      name: rest.name,
      email: rest.email || rest.data?.email || '',
      phone: rest.phone || rest.data?.phone || '',
      createdAt: rest.created_at || rest.createdAt,
      ...(rest.data || {}),
    };
  }

  async function listUsers(filter = {}) {
    if (mode === 'postgres') {
      const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return rows.map((row) => publicUser({ ...row, ...(row.data || {}) })).filter((u) => matchesFilter(u, filter));
    }
    return store.users.map(publicUser).filter((u) => matchesFilter(u, filter));
  }

  async function findUserByIdentifier(identifier) {
    const raw = String(identifier || '').trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    if (mode === 'postgres') {
      const { rows } = await pool.query(
        `SELECT * FROM users
         WHERE lower(email) = $1
            OR phone = $2
            OR id = $2
            OR data->>'patientId' = $2
            OR lower(data->>'identifier') = $1
         LIMIT 1`,
        [lower, raw]
      );
      return rows[0] || null;
    }
    return (
      store.users.find((u) => {
        const email = String(u.email || '').toLowerCase();
        const phone = String(u.phone || '');
        const patientId = String(u.data?.patientId || '');
        const ident = String(u.data?.identifier || '').toLowerCase();
        return email === lower || phone === raw || u.id === raw || patientId === raw || ident === lower;
      }) || null
    );
  }

  async function getUser(id) {
    if (mode === 'postgres') {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows[0] ? publicUser(rows[0]) : null;
    }
    const found = store.users.find((u) => u.id === id);
    return publicUser(found);
  }

  async function createUser(user) {
    const row = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      password_hash: user.password_hash,
      data: user.data || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (mode === 'postgres') {
      await pool.query(
        `INSERT INTO users (id, role, name, email, phone, password_hash, data)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
        [row.id, row.role, row.name, row.email, row.phone, row.password_hash, JSON.stringify(row.data)]
      );
      await pool.query(`SELECT pg_notify('ayudh_changes', $1)`, [
        JSON.stringify({ collection: 'users', action: 'INSERT', id: row.id }),
      ]);
    } else {
      store.users.unshift(row);
      persistSoon();
    }
    const pub = publicUser(row);
    emit({ collection: 'users', action: 'create', record: pub });
    return pub;
  }

  async function updateUser(id, patch) {
    const current = mode === 'postgres'
      ? (await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0]
      : store.users.find((u) => u.id === id);
    if (!current) return null;
    const data = { ...(current.data || {}), ...(patch.data || patch) };
    const next = {
      ...current,
      name: patch.name ?? current.name,
      email: patch.email ?? current.email,
      phone: patch.phone ?? current.phone,
      role: patch.role ?? current.role,
      password_hash: patch.password_hash ?? current.password_hash,
      data,
      updated_at: new Date().toISOString(),
    };
    if (mode === 'postgres') {
      await pool.query(
        `UPDATE users SET name=$2, email=$3, phone=$4, role=$5, password_hash=$6, data=$7::jsonb, updated_at=NOW()
         WHERE id=$1`,
        [id, next.name, next.email, next.phone, next.role, next.password_hash, JSON.stringify(next.data)]
      );
      await pool.query(`SELECT pg_notify('ayudh_changes', $1)`, [
        JSON.stringify({ collection: 'users', action: 'UPDATE', id }),
      ]);
    } else {
      store.users = store.users.map((u) => (u.id === id ? next : u));
      persistSoon();
    }
    const pub = publicUser(next);
    emit({ collection: 'users', action: 'update', record: pub });
    return pub;
  }

  async function list(collection, filter = {}) {
    if (mode === 'postgres') {
      const { rows } = await pool.query(
        'SELECT id, data, created_at, updated_at FROM records WHERE collection = $1 ORDER BY created_at DESC',
        [collection]
      );
      return rows
        .map((row) => ({ id: row.id, ...row.data, createdAt: row.created_at, updatedAt: row.updated_at }))
        .filter((rec) => matchesFilter(rec, filter));
    }
    return (store.collections[collection] || []).filter((rec) => matchesFilter(rec, filter));
  }

  async function get(collection, id) {
    if (mode === 'postgres') {
      const { rows } = await pool.query(
        'SELECT id, data, created_at, updated_at FROM records WHERE collection = $1 AND id = $2',
        [collection, id]
      );
      if (!rows[0]) return null;
      return { id: rows[0].id, ...rows[0].data, createdAt: rows[0].created_at, updatedAt: rows[0].updated_at };
    }
    return (store.collections[collection] || []).find((rec) => rec.id === id) || null;
  }

  async function create(collection, data) {
    const record = {
      ...data,
      id: data.id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (mode === 'postgres') {
      await pool.query(
        `INSERT INTO records (id, collection, data) VALUES ($1,$2,$3::jsonb)`,
        [record.id, collection, JSON.stringify(record)]
      );
      await pool.query(`SELECT pg_notify('ayudh_changes', $1)`, [
        JSON.stringify({ collection, action: 'INSERT', id: record.id }),
      ]);
    } else {
      store.collections[collection] = [record, ...(store.collections[collection] || [])];
      persistSoon();
    }
    emit({ collection, action: 'create', record });
    return record;
  }

  async function update(collection, id, patch) {
    const current = await get(collection, id);
    if (!current) return null;
    const record = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
    if (mode === 'postgres') {
      await pool.query(
        `UPDATE records SET data=$3::jsonb, updated_at=NOW() WHERE collection=$1 AND id=$2`,
        [collection, id, JSON.stringify(record)]
      );
      await pool.query(`SELECT pg_notify('ayudh_changes', $1)`, [
        JSON.stringify({ collection, action: 'UPDATE', id }),
      ]);
    } else {
      store.collections[collection] = (store.collections[collection] || []).map((rec) =>
        rec.id === id ? record : rec
      );
      persistSoon();
    }
    emit({ collection, action: 'update', record });
    return record;
  }

  async function remove(collection, id) {
    const current = await get(collection, id);
    if (mode === 'postgres') {
      await pool.query('DELETE FROM records WHERE collection = $1 AND id = $2', [collection, id]);
      await pool.query(`SELECT pg_notify('ayudh_changes', $1)`, [
        JSON.stringify({ collection, action: 'DELETE', id }),
      ]);
    } else {
      store.collections[collection] = (store.collections[collection] || []).filter((rec) => rec.id !== id);
      persistSoon();
    }
    emit({ collection, action: 'delete', record: current || { id } });
    return current;
  }

  async function counts() {
    const result = {};
    for (const name of COLLECTIONS) {
      const items = await list(name);
      result[name] = items.length;
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
    postgresReady: () => mode === 'postgres',
    listUsers,
    findUserByIdentifier,
    getUser,
    createUser,
    updateUser,
    list,
    get,
    create,
    update,
    remove,
    counts,
    snapshot,
    persistNow: () => {
      if (mode === 'local') saveLocal(store);
    },
  };
}

export { COLLECTIONS };
