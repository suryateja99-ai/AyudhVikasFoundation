import './load-env.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import express from 'express';
import { createDb, COLLECTIONS } from './db.js';
import { seedDatabase } from './seed.js';
import { hashPassword, verifyPassword, signToken as signJwt, verifyToken, randomToken, sha256 } from './crypto-auth.js';
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
const ACCESS_TOKEN_TTL_SEC = Number(process.env.ACCESS_TOKEN_TTL_SEC || 15 * 60);
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'avf_refresh';
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL;

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
const FUND360_COLLECTIONS = new Set([
  'fund360_accounts',
  'fund360_participations',
  'fund360_transactions',
  'fund360_monthly_payments',
  'fund360_milestones',
  'fund360_benefits',
  'fund360_service_participations',
  'fund360_celebration_preferences',
  'fund360_eligibility_records',
]);
const FUND360_ANNUAL_AMOUNT = 365;
const FUND360_MONTHLY_AMOUNT = 30;
const FUND360_SERVICE_MAX = 365;
const DEFAULT_DRIVER_IMAGE = '/src/assets/images/patient_avatar_1787229395408.jpg';

const FUND360_BENEFIT_DEFINITIONS = [
  { year: 1, code: 'YEAR1_MEMBER_ID', title: 'Active Fund 365 member ID', description: 'Member ID confirming active Ayudh Vikas Fund 365 participation.' },
  { year: 1, code: 'YEAR1_AWARENESS', title: 'Health awareness resources', description: 'Selected health awareness and community care resources.' },
  { year: 2, code: 'YEAR2_CELEBRATION', title: 'Birthday / community appreciation', description: 'Birthday appreciation or community service in the participant name.' },
  { year: 3, code: 'YEAR3_SCREENING', title: 'Preventive health screening eligibility', description: 'Full-body health screening eligibility after the required continuity.' },
  { year: 4, code: 'YEAR4_CERTIFICATE', title: 'Digital participation certificate', description: 'AVF Certificate of Continuous Participation after completing the required continuity and verification.' },
  {
    year: 4,
    code: 'YEAR4_HEALTH_ASSISTANCE',
    title: 'Health insurance / assistance eligibility',
    description: 'Eligible for applicable health insurance / health assistance benefit up to ₹1,00,000, subject to programme eligibility, verification, provider/policy terms, availability and applicable conditions.',
  },
];

function normalizeOrigin(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  try {
    const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    return url.origin;
  } catch {
    return raw;
  }
}

function configuredOrigins() {
  const values = [
    process.env.ALLOWED_ORIGINS,
    process.env.CLIENT_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    process.env.PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    'https://ayudh-vikas-foundation.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  return new Set(
    values
      .flatMap((value) => String(value || '').split(','))
      .map(normalizeOrigin)
      .filter(Boolean),
  );
}

const ALLOWED_ORIGINS = configuredOrigins();
const ALLOW_VERCEL_PREVIEWS = String(process.env.ALLOW_VERCEL_PREVIEWS || 'true').toLowerCase() !== 'false';

function originAllowed(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (ALLOWED_ORIGINS.has(normalized)) return true;
  if (!isProduction && /^http:\/\/localhost:\d+$/.test(normalized)) return true;
  if (ALLOW_VERCEL_PREVIEWS) {
    try {
      const host = new URL(normalized).hostname;
      if (host === 'vercel.app' || host.endsWith('.vercel.app')) return true;
    } catch {
      return false;
    }
  }
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (originAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else if (isProduction) {
    return res.status(403).json({ error: 'Origin is not allowed.' });
  } else {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '8mb' }));

let db;
const loginAttempts = new Map();

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function signToken(user, sessionId = '') {
  const roles = userRolesOf(user);
  return signJwt({
    id: user.id,
    sid: sessionId,
    role: user.primaryRole || user.role || roles[0],
    roles,
    primaryRole: user.primaryRole || user.role || roles[0],
    name: user.name,
  }, ACCESS_TOKEN_TTL_SEC);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    if (index === -1) return null;
    const key = decodeURIComponent(part.slice(0, index).trim());
    const value = decodeURIComponent(part.slice(index + 1).trim());
    return [key, value];
  }).filter(Boolean));
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
}

function setRefreshCookie(res, token) {
  const maxAge = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/api/auth',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (isProduction) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearRefreshCookie(res) {
  const parts = [
    `${REFRESH_COOKIE_NAME}=`,
    'Path=/api/auth',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isProduction) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

async function auditAuth(action, userId, req, details = {}) {
  try {
    await db.create('audit_logs', {
      id: makeId('AUD'),
      area: 'AUTH',
      action,
      actorUserId: userId,
      targetUserId: userId,
      ip: clientIp(req),
      userAgent: req.headers['user-agent'] || '',
      details,
      createdAt: formatDateTime(),
    });
  } catch (err) {
    console.warn('[audit] Auth audit failed:', err.message);
  }
}

function loginKey(req, identifier) {
  return `${clientIp(req)}:${String(identifier || '').trim().toLowerCase()}`;
}

function assertLoginAllowed(req, identifier) {
  const key = loginKey(req, identifier);
  const record = loginAttempts.get(key);
  if (!record) return true;
  if (record.lockedUntil && record.lockedUntil > Date.now()) return false;
  if (record.lockedUntil && record.lockedUntil <= Date.now()) loginAttempts.delete(key);
  return true;
}

function recordLoginFailure(req, identifier) {
  const key = loginKey(req, identifier);
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, firstAt: now, lockedUntil: 0 };
  const withinWindow = now - record.firstAt < 15 * 60 * 1000;
  const next = {
    count: withinWindow ? record.count + 1 : 1,
    firstAt: withinWindow ? record.firstAt : now,
    lockedUntil: 0,
  };
  if (next.count >= 5) next.lockedUntil = now + 15 * 60 * 1000;
  loginAttempts.set(key, next);
}

function clearLoginFailures(req, identifier) {
  loginAttempts.delete(loginKey(req, identifier));
}

async function createAuthSession(user, req) {
  const refreshToken = randomToken(64);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const session = await db.create('auth_sessions', {
    id: makeId('SESS'),
    userId: user.id,
    refreshTokenHash: sha256(refreshToken),
    ip: clientIp(req),
    userAgent: req.headers['user-agent'] || '',
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt,
    revokedAt: '',
    rotatedAt: '',
  });
  return { session, refreshToken };
}

async function getActiveAuthSession(refreshToken) {
  if (!refreshToken) return null;
  const rows = await db.list('auth_sessions', { refreshTokenHash: sha256(refreshToken) });
  const session = rows[0];
  if (!session || session.revokedAt) return null;
  if (session.expiresAt && new Date(session.expiresAt) <= new Date()) return null;
  return session;
}

async function rotateAuthSession(session, req) {
  const refreshToken = randomToken(64);
  const next = await db.update('auth_sessions', session.id, {
    refreshTokenHash: sha256(refreshToken),
    lastUsedAt: formatDateTime(),
    rotatedAt: formatDateTime(),
    ip: clientIp(req),
    userAgent: req.headers['user-agent'] || session.userAgent || '',
  });
  return { session: next, refreshToken };
}

async function revokeAuthSession(sessionId, reason = 'LOGOUT') {
  if (!sessionId) return null;
  const existing = await db.get('auth_sessions', sessionId);
  if (!existing || existing.revokedAt) return existing;
  return db.update('auth_sessions', sessionId, { revokedAt: formatDateTime(), revokeReason: reason });
}

async function revokeAllUserSessions(userId, reason = 'PASSWORD_CHANGED') {
  const sessions = await db.list('auth_sessions', { userId });
  await Promise.all(sessions.filter((session) => !session.revokedAt).map((session) =>
    db.update('auth_sessions', session.id, { revokedAt: formatDateTime(), revokeReason: reason })
  ));
}

async function issueAuthResponse(req, res, user, existingSessionId = '') {
  let sessionId = existingSessionId;
  if (!sessionId) {
    const { session, refreshToken } = await createAuthSession(user, req);
    sessionId = session.id;
    setRefreshCookie(res, refreshToken);
  }
  return { token: signToken(user, sessionId), user };
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
    labId: user.labId || user.data?.labId,
    ambulanceId: user.ambulanceId || user.data?.ambulanceId,
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
    if (payload.sid) {
      const session = await db.get('auth_sessions', payload.sid);
      if (
        !session ||
        session.revokedAt ||
        String(session.userId) !== String(payload.id) ||
        (session.expiresAt && new Date(session.expiresAt) <= new Date())
      ) {
        throw new Error('Session expired');
      }
      req.authSessionId = session.id;
    }
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
  let lab = null;
  let ambulance = null;
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
  if (user.role === 'lab') {
    const partnerships = await db.list('partnerships');
    lab = partnerships.find((item) =>
      item.id === user.labId ||
      item.id === user.data?.labId ||
      item.labId === user.labId ||
      item.labId === user.data?.labId ||
      sameText(item.labName || item.name, user.labName || user.data?.labName || user.name) ||
      cleanPhone(item.phone) === cleanPhone(user.phone)
    ) || null;
  }
  if (user.role === 'ambulance') {
    const partnerships = await db.list('partnerships');
    ambulance = partnerships.find((item) =>
      item.id === user.ambulanceId ||
      item.id === user.data?.ambulanceId ||
      item.ambulanceId === user.ambulanceId ||
      item.ambulanceId === user.data?.ambulanceId ||
      sameText(item.driverName || item.name, user.driverName || user.data?.driverName || user.name) ||
      cleanPhone(item.phone || item.mobile) === cleanPhone(user.phone)
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
    labId: user.labId || user.data?.labId || lab?.labId || lab?.id,
    labName: lab?.labName || lab?.name || user.labName || user.data?.labName || user.name,
    ambulanceId: user.ambulanceId || user.data?.ambulanceId || ambulance?.ambulanceId || ambulance?.id,
    ambulanceName: ambulance?.driverName || ambulance?.name || user.driverName || user.data?.driverName || user.name,
    vehicleNumber: ambulance?.vehicleNumber || user.data?.vehicleNumber || '',
    ambulancePhone: ambulance?.phone || ambulance?.mobile || user.phone || '',
    hospital,
    doctor,
    lab,
    ambulance,
  };
}

async function auditFund360(action, actor, targetUserId, details = {}) {
  try {
    await db.create('audit_logs', {
      id: makeId('AUD'),
      area: 'FUND360',
      action,
      actorUserId: actor?.user?.id || actor?.id || targetUserId,
      actorRole: actor?.role || actor?.primaryRole || actor?.user?.role || '',
      targetUserId,
      details,
      createdAt: formatDateTime(),
    });
  } catch (err) {
    console.warn('[audit] Fund360 audit failed:', err.message);
  }
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthsBetween(start, end = new Date()) {
  if (!start) return 0;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime())) return 0;
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function completedYears(start, end = new Date()) {
  if (!start) return 0;
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime())) return 0;
  let years = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) years -= 1;
  return Math.max(0, years);
}

function publicFund360User(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    role: user.primaryRole || user.role,
    roles: user.roles || [user.primaryRole || user.role],
    patientId: user.patientId || '',
    district: user.district || user.data?.district || '',
    address: user.address || user.data?.address || '',
    dateOfBirth: user.dateOfBirth || user.data?.dateOfBirth || user.data?.dob || '',
  };
}

async function ensureFund360Account(user, actor = null) {
  if (!user?.id) throw new Error('Authenticated user is required for FUND 365.');
  const existing = (await db.list('fund360_accounts', { userId: user.id }))[0];
  if (existing) return existing;
  const now = formatDateTime();
  const account = await db.create('fund360_accounts', {
    id: makeId('F360A'),
    userId: user.id,
    userRole: user.primaryRole || user.role || 'patient',
    status: 'NOT_ENROLLED',
    displayName: user.name,
    phone: user.phone || '',
    email: user.email || '',
    createdAt: now,
    updatedAt: now,
  });
  await auditFund360('ACCOUNT_CREATED', actor || user, user.id, { accountId: account.id });
  return account;
}

async function ensureFund360Milestones(account, participation = null) {
  const existing = await db.list('fund360_milestones', { accountId: account.id });
  const milestoneTitles = {
    1: 'Active Membership / Member ID',
    2: 'Birthday / Community Celebration',
    3: 'Full Body Health Screening',
    4: 'Certificate + Health Assistance Eligibility',
  };
  const normalized = await Promise.all(existing.map((item) => {
    const desiredTitle = milestoneTitles[Number(item.year)];
    if (desiredTitle && item.title !== desiredTitle) {
      return db.update('fund360_milestones', item.id, { title: desiredTitle });
    }
    return item;
  }));
  const existingKeys = new Set(normalized.map((item) => String(item.year)));
  const created = [];
  for (const year of [1, 2, 3, 4]) {
    if (existingKeys.has(String(year))) continue;
    created.push(await db.create('fund360_milestones', {
      id: makeId('F360M'),
      accountId: account.id,
      userId: account.userId,
      participationId: participation?.id || '',
      year,
      title: milestoneTitles[year],
      status: 'LOCKED',
      eligibleAt: '',
      completedAt: '',
      updatedBy: '',
    }));
  }
  return [...normalized, ...created].sort((a, b) => Number(a.year) - Number(b.year));
}

async function ensureFund360Benefits(account, participation = null) {
  const existing = await db.list('fund360_benefits', { accountId: account.id });
  const normalized = await Promise.all(existing.map((item) => {
    if (item.code === 'YEAR1_CERTIFICATE') {
      return db.update('fund360_benefits', item.id, {
        year: 4,
        code: 'YEAR4_CERTIFICATE',
        title: 'Digital participation certificate',
        description: 'AVF Certificate of Continuous Participation after completing the required continuity and verification.',
      });
    }
    return item;
  }));
  const existingCodes = new Set(normalized.map((item) => item.code));
  const created = [];
  for (const definition of FUND360_BENEFIT_DEFINITIONS) {
    if (existingCodes.has(definition.code)) continue;
    created.push(await db.create('fund360_benefits', {
      id: makeId('F360B'),
      accountId: account.id,
      userId: account.userId,
      participationId: participation?.id || '',
      ...definition,
      status: 'LOCKED',
      configurable: true,
      completedAt: '',
      updatedBy: '',
    }));
  }
  return [...normalized, ...created].sort((a, b) => Number(a.year) - Number(b.year));
}

async function getFund360Bundle(user) {
  const account = await ensureFund360Account(user);
  const participations = (await db.list('fund360_participations', { accountId: account.id }))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const activeParticipation = participations.find((item) => item.status === 'ACTIVE') || participations[0] || null;
  const [transactions, monthlyPayments, serviceParticipations, celebrationPreferences, eligibilityRecords] = await Promise.all([
    db.list('fund360_transactions', { accountId: account.id }),
    db.list('fund360_monthly_payments', { accountId: account.id }),
    db.list('fund360_service_participations', { accountId: account.id }),
    db.list('fund360_celebration_preferences', { accountId: account.id }),
    db.list('fund360_eligibility_records', { accountId: account.id }),
  ]);
  let milestones = await ensureFund360Milestones(account, activeParticipation);
  let benefits = await ensureFund360Benefits(account, activeParticipation);
  if (activeParticipation) {
    const completed = completedYears(activeParticipation.startDate);
    milestones = await Promise.all(milestones.map(async (milestone) => {
      const year = Number(milestone.year);
      const nextStatus = completed >= year
        ? (milestone.status === 'COMPLETED' ? 'COMPLETED' : 'ELIGIBLE')
        : activeParticipation.status === 'ACTIVE' && year === completed + 1
          ? 'IN_PROGRESS'
          : 'LOCKED';
      if (milestone.status !== nextStatus || milestone.participationId !== activeParticipation.id) {
        return db.update('fund360_milestones', milestone.id, {
          status: nextStatus,
          participationId: activeParticipation.id,
          eligibleAt: nextStatus === 'ELIGIBLE' && !milestone.eligibleAt ? formatDateTime() : milestone.eligibleAt,
        });
      }
      return milestone;
    }));
    benefits = await Promise.all(benefits.map(async (benefit) => {
      const year = Number(benefit.year);
      const nextStatus = completed >= year ? (benefit.status === 'COMPLETED' ? 'COMPLETED' : 'ELIGIBLE') : 'LOCKED';
      if (benefit.status !== nextStatus || benefit.participationId !== activeParticipation.id) {
        return db.update('fund360_benefits', benefit.id, {
          status: nextStatus,
          participationId: activeParticipation.id,
        });
      }
      return benefit;
    }));
  }
  const successfulTransactions = transactions.filter((txn) => txn.status === 'SUCCESS');
  const totalContributions = successfulTransactions.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
  const currentYear = activeParticipation?.startDate ? Math.min(4, completedYears(activeParticipation.startDate) + 1) : 0;
  return {
    account,
    profile: publicFund360User(user),
    participation: activeParticipation,
    participations,
    transactions: transactions.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))),
    monthlyPayments: monthlyPayments.sort((a, b) => String(b.dueDate || b.createdAt || '').localeCompare(String(a.dueDate || a.createdAt || ''))),
    milestones,
    benefits,
    serviceParticipations,
    celebrationPreferences,
    eligibilityRecords,
    summary: {
      status: account.status || 'NOT_ENROLLED',
      participationType: activeParticipation?.type || '',
      startDate: activeParticipation?.startDate || '',
      currentYear,
      currentStreak: activeParticipation?.currentStreak || 0,
      continuousMonths: activeParticipation?.continuousMonths || 0,
      totalContributions,
      nextDueDate: activeParticipation?.nextDueDate || '',
      successfulPayments: successfulTransactions.length,
      pendingPayments: transactions.filter((txn) => txn.status === 'PROCESSING' || txn.status === 'PENDING_VERIFICATION').length,
    },
  };
}

async function resolveTreatingDoctor(actor, session, body = {}) {
  if (actor.role !== 'hospital') {
    return {
      doctorId: session.doctorId || actor.doctorId,
      doctorName: session.doctorName || actor.doctorName,
    };
  }

  const requestedDoctorId = String(body.doctorId || '').trim();
  const requestedDoctorName = String(body.doctorName || '').trim();
  const sessionDoctorId = String(session.doctorId || '').trim();
  const sessionDoctorName = String(session.doctorName || '').trim();
  const targetDoctorId = requestedDoctorId || sessionDoctorId;
  const targetDoctorName = requestedDoctorName || sessionDoctorName;

  if (!targetDoctorId && !targetDoctorName) {
    return { error: 'Select the treating doctor for this patient session.' };
  }

  const [doctors, assignments] = await Promise.all([
    db.list('doctors'),
    db.list('doctor_hospital_assignments', { hospitalId: actor.hospitalId }),
  ]);
  const activeAssignments = new Set(
    assignments
      .filter((assignment) => !assignment.status || ['Active', 'Accepted', 'Approved'].includes(String(assignment.status)))
      .map((assignment) => String(assignment.doctorId || ''))
  );
  const doctor = doctors.find((item) =>
    (targetDoctorId && String(item.id || item.doctorId || '') === targetDoctorId) ||
    (targetDoctorName && sameText(item.name, targetDoctorName))
  );
  if (!doctor) {
    return { error: 'Selected treating doctor was not found.' };
  }
  const belongsToHospital =
    String(doctor.hospitalId || '') === String(actor.hospitalId || '') ||
    sameText(doctor.hospitalName || doctor.hospital, actor.hospitalName) ||
    activeAssignments.has(String(doctor.id || doctor.doctorId || ''));

  if (!belongsToHospital) {
    return { error: 'Selected doctor is not linked to this hospital.' };
  }

  return {
    doctorId: doctor.id || doctor.doctorId || targetDoctorId,
    doctorName: doctor.name || targetDoctorName,
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
  if (actor.role === 'lab') return labOwnsBooking(actor, session);
  if (actor.role === 'ambulance') return ambulanceOwnsBooking(actor, session, { allowUnassigned: true });
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

function labOwnsBooking(actor, booking) {
  if (!actor || !booking) return false;
  if (actor.role === 'admin') return true;
  if (actor.role === 'patient') return String(booking.patientId || '') === String(actor.patientId || '');
  if (actor.role !== 'lab') return false;
  const bookingLabId = String(booking.labId || '').trim();
  const actorLabId = String(actor.labId || '').trim();
  if (bookingLabId && actorLabId) return bookingLabId === actorLabId;
  if (bookingLabId && !actorLabId) return false;
  const bookingLabName = String(booking.labName || '').trim();
  if (!bookingLabName) return true;
  return sameText(bookingLabName, actor.labName) || /ayudh vikas certified partner lab/i.test(bookingLabName);
}

function normalizeLabBooking(booking) {
  if (!booking) return null;
  const completed = isCompletedSession(booking) || ['Closed', 'Completed'].includes(String(booking.status || ''));
  const accepted = ['Accepted', 'Verified', 'Sample Collected', 'In Progress', 'Report Uploaded', 'Closed', 'Completed'].includes(String(booking.status || ''));
  return {
    ...booking,
    sessionId: booking.sessionId || booking.id,
    sourceCollection: 'lab_bookings',
    testName: booking.testName || booking.packageName || booking.selectedPackage || booking.selectedCategory || 'Lab Test',
    testMode: booking.testMode || (booking.collectionType === 'home' ? 'Home Test' : 'Walk-in'),
    patientPhone: booking.patientPhone || booking.phone || booking.mobileNumber || '',
    sessionStatus: booking.sessionStatus || (completed ? 'COMPLETED' : accepted ? 'ACTIVE' : 'REQUESTED'),
    visitPassStatus: booking.visitPassStatus || (completed ? 'EXPIRED' : accepted ? 'ACTIVE' : 'PENDING'),
  };
}

async function getLabBookingsForActor(actor) {
  const items = (await db.list('lab_bookings')).map(normalizeLabBooking);
  return items.filter((item) => labOwnsBooking(actor, item));
}

function estimateAmbulanceKm(pickup = '', drop = '') {
  const from = String(pickup || '').trim().toLowerCase();
  const to = String(drop || '').trim().toLowerCase();
  if (!from || !to) return 8;
  if (from === to) return 3;
  const sameAreaHints = ['hanamkonda', 'warangal', 'subedari', 'mgm', 'hunter road', 'kazipet'];
  const overlap = sameAreaHints.filter((hint) => from.includes(hint) && to.includes(hint)).length;
  const base = overlap ? 7 : 14;
  const spread = Math.abs(from.length - to.length) % 9;
  return Math.max(3, Math.min(42, base + spread));
}

function normalizeAmbulanceBooking(booking) {
  if (!booking) return null;
  const status = String(booking.status || 'Pending');
  const completed = ['Completed', 'Closed'].includes(status) || isCompletedSession(booking);
  const accepted = ['Accepted', 'Scheduled', 'Ride Started', 'En Route', 'Completed'].includes(status);
  return {
    ...booking,
    sessionId: booking.sessionId || booking.id,
    sourceCollection: 'ambulance_bookings',
    patientPhone: booking.patientPhone || booking.phone || booking.mobileNumber || '',
    requestStatus: status,
    rideStatus: booking.rideStatus || status,
    estimatedKm: Number(booking.estimatedKm || estimateAmbulanceKm(booking.pickupLocation, booking.dropLocation)),
    sessionStatus: booking.sessionStatus || (completed ? 'COMPLETED' : accepted ? 'ACTIVE' : 'REQUESTED'),
    visitPassStatus: booking.visitPassStatus || (completed ? 'EXPIRED' : accepted ? 'ACTIVE' : 'PENDING'),
  };
}

function isAmbulancePending(booking) {
  return ['Pending', 'Requested'].includes(String(booking?.status || 'Pending'));
}

function ambulanceOwnsBooking(actor, booking, { allowUnassigned = false } = {}) {
  if (!actor || !booking) return false;
  if (actor.role === 'admin') return true;
  if (actor.role === 'patient') return String(booking.patientId || '') === String(actor.patientId || '');
  if (actor.role !== 'ambulance') return false;
  const actorAmbulanceId = String(actor.ambulanceId || '').trim();
  const bookingAmbulanceId = String(booking.driverId || booking.ambulanceId || '').trim();
  if (bookingAmbulanceId && actorAmbulanceId) return bookingAmbulanceId === actorAmbulanceId;
  if (cleanPhone(booking.driverContact) && cleanPhone(actor.ambulancePhone)) {
    return cleanPhone(booking.driverContact) === cleanPhone(actor.ambulancePhone);
  }
  return allowUnassigned && !bookingAmbulanceId && isAmbulancePending(booking);
}

async function getAmbulanceBookingsForActor(actor, { includeUnassigned = false } = {}) {
  const items = (await db.list('ambulance_bookings')).map(normalizeAmbulanceBooking);
  return items.filter((item) => ambulanceOwnsBooking(actor, item, { allowUnassigned: includeUnassigned }));
}

async function getAmbulanceDrivers() {
  const [partnerships, users, bookings] = await Promise.all([
    db.list('partnerships'),
    db.listUsers({ role: 'ambulance' }),
    db.list('ambulance_bookings'),
  ]);
  const stats = new Map();
  bookings.forEach((booking) => {
    const key = String(booking.driverId || booking.ambulanceId || '').trim() || cleanPhone(booking.driverContact);
    if (!key) return;
    const current = stats.get(key) || { acceptedRides: 0, completedRides: 0, pendingRides: 0 };
    const status = String(booking.status || '');
    if (['Accepted', 'Scheduled', 'Ride Started', 'En Route', 'Completed'].includes(status)) current.acceptedRides += 1;
    if (['Completed', 'Closed'].includes(status)) current.completedRides += 1;
    if (['Pending', 'Requested'].includes(status)) current.pendingRides += 1;
    stats.set(key, current);
  });
  const byId = new Map();
  partnerships
    .filter((item) => item.role === 'ambulance')
    .forEach((item) => {
      const id = item.ambulanceId || item.id;
      const computed = stats.get(String(id)) || stats.get(cleanPhone(item.phone || item.mobile)) || {};
      byId.set(String(id), {
        id,
        ambulanceId: id,
        userId: item.userId || '',
        driverName: item.driverName || item.name || 'Ambulance Driver',
        name: item.driverName || item.name || 'Ambulance Driver',
        phone: item.phone || item.mobile || '',
        vehicleNumber: item.vehicleNumber || '',
        vehicleType: item.vehicleType || item.ambulanceType || 'Basic Life Support (BLS)',
        district: item.district || 'Warangal',
        baseLocation: item.baseLocation || item.address || 'Ayudh Vikas Dispatch Unit',
        image: item.image || DEFAULT_DRIVER_IMAGE,
        status: item.status || 'Active',
        verificationStatus: item.verificationStatus || 'VERIFIED',
        acceptedRides: Number(item.acceptedRides || computed.acceptedRides || 0),
        completedRides: Number(item.completedRides || computed.completedRides || 0),
        pendingRides: Number(computed.pendingRides || 0),
      });
    });
  users.forEach((user) => {
    const id = user.ambulanceId || user.data?.ambulanceId || user.id;
    if (byId.has(String(id))) return;
    const computed = stats.get(String(id)) || stats.get(cleanPhone(user.phone)) || {};
    byId.set(String(id), {
      id,
      ambulanceId: id,
      userId: user.id,
      driverName: user.data?.driverName || user.name || 'Ambulance Driver',
      name: user.data?.driverName || user.name || 'Ambulance Driver',
      phone: user.phone || '',
      vehicleNumber: user.data?.vehicleNumber || '',
      vehicleType: user.data?.vehicleType || 'Basic Life Support (BLS)',
      district: user.data?.district || 'Warangal',
      baseLocation: user.data?.baseLocation || 'Ayudh Vikas Dispatch Unit',
      image: user.data?.image || DEFAULT_DRIVER_IMAGE,
      status: user.data?.status || 'Active',
      verificationStatus: user.data?.verificationStatus || 'VERIFIED',
      acceptedRides: Number(computed.acceptedRides || 0),
      completedRides: Number(computed.completedRides || 0),
      pendingRides: Number(computed.pendingRides || 0),
    });
  });
  return Array.from(byId.values())
    .filter((driver) => String(driver.status || 'Active') !== 'Inactive')
    .sort((a, b) => (b.completedRides - a.completedRides) || (b.acceptedRides - a.acceptedRides));
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
  if (actor.role === 'lab') {
    return collection === 'health_records' &&
      (
        String(target.labId || actor.labId || '') === String(actor.labId || '') ||
        sameText(target.labName, actor.labName)
      );
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
  if (actor.role === 'lab') {
    return rows.filter((item) =>
      collection === 'health_records' &&
      (
        String(item.labId || '') === String(actor.labId || '') ||
        sameText(item.labName, actor.labName)
      )
    );
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
    const { valid, error, data } = validate(schemas.login, req.body || {});
    if (!valid) return res.status(400).json({ error });
    const identifier = String(data.identifier || '').trim();
    const password = String(data.password || '');
    if (!assertLoginAllowed(req, identifier)) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again after 15 minutes.' });
    }
    const row = await db.findUserByIdentifier(identifier);
    if (!row) {
      recordLoginFailure(req, identifier);
      return res.status(401).json({ error: 'Invalid mobile/email/ID or password.' });
    }
    const ok = verifyPassword(password, row.password_hash);
    if (!ok) {
      recordLoginFailure(req, identifier);
      return res.status(401).json({ error: 'Invalid mobile/email/ID or password.' });
    }
    const user = await db.getUser(row.id);
    clearLoginFailures(req, identifier);
    await auditAuth('LOGIN_SUCCESS', user.id, req);
    res.json(await issueAuthResponse(req, res, user));
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

    const name = body.fullName || body.name || body.hospitalName || body.labName || body.organizationName || 'New User';
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
    const labId = role === 'lab' ? makeId('LAB') : undefined;
    const ambulanceId = role === 'ambulance' ? makeId('AMB') : undefined;
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
        labId,
        ambulanceId,
        roles,
        primaryRole,
        displayName: name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : ''),
        image: body.photoUrl || body.image || '/src/assets/images/patient_avatar_1787229395408.jpg',
        verificationToken,
        verificationTokenExpiry,
        emailVerified: !email,
      },
    });
    await ensureFund360Account(user, user);

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
    } else if (role === 'lab') {
      await db.create('partnerships', {
        id: labId,
        userId: user.id,
        role,
        labId,
        name: body.labName || name,
        labName: body.labName || name,
        licenseNumber: body.licenseNumber || '',
        nablApproved: body.nablApproved || 'No',
        contactPerson: body.contactPerson || name,
        phone,
        email,
        district: body.district || 'Warangal',
        address: body.fullAddress || body.address || '',
        testCategories: body.testCategories || [],
        homeCollectionAvailable: body.homeCollectionAvailable !== false,
        digitalReportsTurnaround: body.digitalReportsTurnaround || 'Within 24 Hours',
        status: 'Active',
        verificationStatus: 'PENDING_VERIFICATION',
        submittedAt: formatDateTime(),
      });
    } else if (role === 'ambulance') {
      await db.create('partnerships', {
        id: ambulanceId,
        userId: user.id,
        role,
        ambulanceId,
        name: body.driverName || name,
        driverName: body.driverName || name,
        licenseNumber: body.licenseNumber || '',
        vehicleNumber: body.vehicleNumber || '',
        vehicleType: body.vehicleType || body.ambulanceType || 'Basic Life Support (BLS)',
        phone,
        email,
        district: body.district || 'Warangal',
        baseLocation: body.baseLocation || body.address || '',
        address: body.baseLocation || body.address || '',
        image: body.photoUrl || body.image || DEFAULT_DRIVER_IMAGE,
        acceptedRides: 0,
        completedRides: 0,
        status: 'Active',
        verificationStatus: 'PENDING_VERIFICATION',
        submittedAt: formatDateTime(),
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

    await auditAuth('REGISTER_SUCCESS', user.id, req, { role });
    res.json({
      ...(await issueAuthResponse(req, res, user)),
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
  if (!req.authSessionId) {
    return res.json(await issueAuthResponse(req, res, user));
  }
  res.json({ user, token: signToken(user, req.authSessionId) });
});

app.patch('/api/auth/me', authRequired, async (req, res) => {
  const patch = { ...(req.body || {}) };
  if (patch.password || patch.password_hash) {
    return res.status(400).json({ error: 'Use the password reset/change-password flow to update passwords.' });
  }
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
  res.json({ user, token: signToken(user, req.authSessionId || '') });
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

app.all('/api/auth/refresh', async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const refreshToken = parseCookies(req)[REFRESH_COOKIE_NAME];
    const session = await getActiveAuthSession(refreshToken);
    if (!session) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    const user = await db.getUser(session.userId);
    if (!user) {
      await revokeAuthSession(session.id, 'USER_NOT_FOUND');
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    const rotated = await rotateAuthSession(session, req);
    setRefreshCookie(res, rotated.refreshToken);
    res.json({ token: signToken(user, rotated.session.id), user });
  } catch (err) {
    console.error(err);
    clearRefreshCookie(res);
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = parseCookies(req)[REFRESH_COOKIE_NAME];
    const session = await getActiveAuthSession(refreshToken);
    if (session) {
      await revokeAuthSession(session.id, 'LOGOUT');
      await auditAuth('LOGOUT', session.userId, req, { sessionId: session.id });
    } else if (req.authSessionId) {
      await revokeAuthSession(req.authSessionId, 'LOGOUT');
      await auditAuth('LOGOUT', req.user?.id, req, { sessionId: req.authSessionId });
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    clearRefreshCookie(res);
    res.json({ ok: true });
  }
});

app.get('/api/fund360/account', authRequired, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found.' });
    const bundle = await getFund360Bundle(user);
    res.json(bundle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load FUND 365 account.' });
  }
});

app.post('/api/fund360/participation', authRequired, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found.' });
    const account = await ensureFund360Account(user, req.user);
    const body = req.body || {};
    const type = String(body.type || '').toUpperCase();
    const validTypes = ['ANNUAL', 'MONTHLY', 'VOLUNTEER', 'SERVICE_CONTRIBUTION'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Select a valid FUND 365 participation option.' });

    const active = (await db.list('fund360_participations', { accountId: account.id })).find((item) => item.status === 'ACTIVE');
    if (active && ['ANNUAL', 'MONTHLY'].includes(type)) {
      return res.status(409).json({ error: 'You already have an active FUND 365 participation.' });
    }

    if (type === 'SERVICE_CONTRIBUTION') {
      const contributionAmount = Number(body.contributionAmount || 0);
      if (Number.isNaN(contributionAmount) || contributionAmount < 0 || contributionAmount > FUND360_SERVICE_MAX) {
        return res.status(400).json({ error: 'Service contribution must be between ₹0 and ₹365.' });
      }
      if (!String(body.serviceType || '').trim()) return res.status(400).json({ error: 'Service type is required.' });
      const participation = await db.create('fund360_participations', {
        id: makeId('F360P'),
        accountId: account.id,
        userId: user.id,
        type,
        status: contributionAmount > 0 ? 'PENDING_PAYMENT' : 'PENDING_REVIEW',
        startDate: '',
        currentYear: 0,
        currentStreak: 0,
        continuousMonths: 0,
        contributionAmount,
        serviceType: body.serviceType,
        serviceDescription: body.serviceDescription || '',
      });
      const service = await db.create('fund360_service_participations', {
        id: makeId('F360S'),
        accountId: account.id,
        userId: user.id,
        participationId: participation.id,
        serviceType: body.serviceType,
        description: body.serviceDescription || '',
        contributionAmount,
        status: contributionAmount > 0 ? 'PENDING_PAYMENT' : 'SUBMITTED_FOR_REVIEW',
        verificationStatus: 'PENDING',
        participationPeriod: new Date().getFullYear(),
      });
      let transaction = null;
      if (contributionAmount > 0) {
        transaction = await db.create('fund360_transactions', {
          id: makeId('F360T'),
          accountId: account.id,
          userId: user.id,
          participationId: participation.id,
          type: 'SERVICE_CONTRIBUTION',
          amount: contributionAmount,
          currency: 'INR',
          status: 'PROCESSING',
          gateway: process.env.FUND360_PAYMENT_GATEWAY || 'internal_manual',
          reference: makeId('F360ORD'),
          idempotencyKey: body.idempotencyKey || makeId('IDEM'),
          description: 'FUND 365 service contribution',
        });
      }
      await db.update('fund360_accounts', account.id, { status: participation.status, lastParticipationId: participation.id });
      await auditFund360('SERVICE_PARTICIPATION_CREATED', req.user, user.id, { participationId: participation.id, serviceId: service.id });
      return res.status(201).json({ participation, service, transaction, account: await db.get('fund360_accounts', account.id) });
    }

    if (type === 'VOLUNTEER') {
      const participation = await db.create('fund360_participations', {
        id: makeId('F360P'),
        accountId: account.id,
        userId: user.id,
        type,
        status: 'PENDING_CONTACT',
        startDate: '',
        currentYear: 0,
        currentStreak: 0,
        continuousMonths: 0,
        contactPreference: body.contactPreference || 'phone',
        notes: body.notes || 'Volunteer interest submitted from FUND 365.',
      });
      await db.create('enquiries', {
        id: makeId('ENQ'),
        type: 'fund360_volunteer',
        userId: user.id,
        fullName: user.name,
        phone: user.phone || '',
        email: user.email || '',
        status: 'New',
        needDescription: body.notes || 'FUND 365 volunteer participation request',
        requestedAt: formatDateTime(),
      });
      const item = await db.update('fund360_accounts', account.id, { status: 'VOLUNTEER_CONTACT_REQUESTED', lastParticipationId: participation.id });
      await auditFund360('VOLUNTEER_INTEREST_SUBMITTED', req.user, user.id, { participationId: participation.id });
      return res.status(201).json({ participation, account: item });
    }

    const amount = type === 'ANNUAL' ? FUND360_ANNUAL_AMOUNT : FUND360_MONTHLY_AMOUNT;
    const participation = await db.create('fund360_participations', {
      id: makeId('F360P'),
      accountId: account.id,
      userId: user.id,
      type,
      status: 'PENDING_PAYMENT',
      startDate: '',
      currentYear: 0,
      currentStreak: 0,
      continuousMonths: 0,
      amount,
      cycleNumber: 1,
      mandateReference: type === 'MONTHLY' ? body.mandateReference || '' : '',
    });
    const transaction = await db.create('fund360_transactions', {
      id: makeId('F360T'),
      accountId: account.id,
      userId: user.id,
      participationId: participation.id,
      type: type === 'ANNUAL' ? 'ANNUAL_PARTICIPATION' : 'MONTHLY_PARTICIPATION',
      amount,
      currency: 'INR',
      status: 'PROCESSING',
      gateway: process.env.FUND360_PAYMENT_GATEWAY || 'internal_manual',
      reference: makeId('F360ORD'),
      idempotencyKey: body.idempotencyKey || makeId('IDEM'),
      description: type === 'ANNUAL' ? '₹365 annual FUND 365 participation' : '₹30 monthly FUND 365 participation',
    });
    const item = await db.update('fund360_accounts', account.id, { status: 'PENDING_PAYMENT', lastParticipationId: participation.id });
    await auditFund360('PARTICIPATION_STARTED', req.user, user.id, { participationId: participation.id, transactionId: transaction.id, type });
    res.status(201).json({ account: item, participation, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to start FUND 365 participation.' });
  }
});

app.post('/api/fund360/transactions/:id/verify', authRequired, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id);
    const transaction = await db.get('fund360_transactions', req.params.id);
    if (!transaction) return res.status(404).json({ error: 'FUND 365 transaction not found.' });
    if (transaction.userId !== req.user.id && !userHasRole(req.user, 'admin')) {
      return res.status(403).json({ error: 'You can verify only your own FUND 365 transactions.' });
    }
    if (transaction.status === 'SUCCESS') {
      return res.json({ transaction, account: (await db.list('fund360_accounts', { userId: transaction.userId }))[0] });
    }
    const body = req.body || {};
    const amount = Number(body.amount || transaction.amount);
    if (amount !== Number(transaction.amount)) return res.status(400).json({ error: 'Payment amount does not match the server order.' });
    const gatewayReference = String(body.gatewayReference || body.reference || transaction.reference || '').trim();
    if (!gatewayReference) return res.status(400).json({ error: 'Payment reference is required for verification.' });

    const now = formatDateTime();
    const updatedTxn = await db.update('fund360_transactions', transaction.id, {
      status: 'SUCCESS',
      verifiedAt: now,
      gatewayReference,
      verificationMode: process.env.FUND360_PAYMENT_GATEWAY ? 'gateway_callback' : 'internal_manual',
    });
    const participation = await db.get('fund360_participations', transaction.participationId);
    const account = await db.get('fund360_accounts', transaction.accountId);
    let updatedParticipation = participation;
    if (participation) {
      const patch = {
        status: 'ACTIVE',
        startDate: participation.startDate || now,
        lastPaymentAt: now,
        totalPaid: Number(participation.totalPaid || 0) + Number(transaction.amount || 0),
      };
      if (participation.type === 'ANNUAL') {
        patch.endDate = addDays(patch.startDate, 365).toISOString();
        patch.currentYear = Math.min(4, completedYears(patch.startDate) + 1);
        patch.currentStreak = Math.max(1, Number(participation.currentStreak || 0), 1);
        patch.continuousMonths = Math.max(12, Number(participation.continuousMonths || 0), 12);
        patch.nextDueDate = patch.endDate;
      }
      if (participation.type === 'MONTHLY') {
        patch.currentYear = Math.min(4, Math.floor((Number(participation.continuousMonths || 0) + 1) / 12) + 1);
        patch.currentStreak = Number(participation.currentStreak || 0) + 1;
        patch.continuousMonths = Number(participation.continuousMonths || 0) + 1;
        patch.nextDueDate = addDays(now, 30).toISOString();
        await db.create('fund360_monthly_payments', {
          id: makeId('F360MP'),
          accountId: transaction.accountId,
          userId: transaction.userId,
          participationId: participation.id,
          transactionId: transaction.id,
          monthNumber: patch.continuousMonths,
          amount: Number(transaction.amount || 0),
          status: 'SUCCESS',
          dueDate: now,
          paidAt: now,
        });
      }
      if (participation.type === 'SERVICE_CONTRIBUTION') {
        patch.status = 'SUBMITTED_FOR_REVIEW';
        const services = await db.list('fund360_service_participations', { participationId: participation.id });
        for (const service of services) {
          await db.update('fund360_service_participations', service.id, { status: 'CONTRIBUTION_VERIFIED', paymentStatus: 'SUCCESS' });
        }
      }
      updatedParticipation = await db.update('fund360_participations', participation.id, patch);
    }
    const updatedAccount = await db.update('fund360_accounts', account.id, {
      status: updatedParticipation?.status === 'ACTIVE' ? 'ENROLLED' : updatedParticipation?.status || 'PAYMENT_VERIFIED',
      enrolledAt: updatedParticipation?.status === 'ACTIVE' ? (account.enrolledAt || now) : account.enrolledAt,
      lastParticipationId: updatedParticipation?.id || account.lastParticipationId,
    });
    await db.create('wallet_txns', {
      id: makeId('WAL'),
      userId: transaction.userId,
      amount: Number(transaction.amount || 0),
      type: 'fund360_contribution',
      note: transaction.description,
      referenceId: transaction.id,
      status: 'SUCCESS',
      balanceAfter: 0,
    });
    await ensureFund360Milestones(updatedAccount, updatedParticipation);
    await ensureFund360Benefits(updatedAccount, updatedParticipation);
    await auditFund360('PAYMENT_SUCCESS', req.user, transaction.userId, { transactionId: transaction.id, participationId: updatedParticipation?.id });
    res.json({ account: updatedAccount, participation: updatedParticipation, transaction: updatedTxn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to verify FUND 365 payment.' });
  }
});

app.get('/api/admin/fund360', requireRole('admin'), async (_req, res) => {
  const [accounts, participations, transactions, milestones, benefits, services, users] = await Promise.all([
    db.list('fund360_accounts'),
    db.list('fund360_participations'),
    db.list('fund360_transactions'),
    db.list('fund360_milestones'),
    db.list('fund360_benefits'),
    db.list('fund360_service_participations'),
    db.listUsers({}),
  ]);
  const userMap = new Map(users.map((user) => [user.id, user]));
  res.json({
    items: accounts.map((account) => ({
      ...account,
      user: publicFund360User(userMap.get(account.userId) || {}),
      participation: participations.find((item) => item.id === account.lastParticipationId || (item.accountId === account.id && item.status === 'ACTIVE')) || null,
      transactions: transactions.filter((item) => item.accountId === account.id),
      milestones: milestones.filter((item) => item.accountId === account.id),
      benefits: benefits.filter((item) => item.accountId === account.id),
      services: services.filter((item) => item.accountId === account.id),
    })),
  });
});

app.patch('/api/admin/fund360/:collection/:id', requireRole('admin'), async (req, res) => {
  const allowed = {
    milestones: 'fund360_milestones',
    benefits: 'fund360_benefits',
    services: 'fund360_service_participations',
    eligibility: 'fund360_eligibility_records',
    celebrations: 'fund360_celebration_preferences',
  };
  const collection = allowed[req.params.collection];
  if (!collection) return res.status(404).json({ error: 'Unknown FUND 365 admin section.' });
  const existing = await db.get(collection, req.params.id);
  if (!existing) return res.status(404).json({ error: 'FUND 365 record not found.' });
  const item = await db.update(collection, req.params.id, {
    ...(req.body || {}),
    updatedBy: req.user.id,
    adminUpdatedAt: formatDateTime(),
  });
  await auditFund360('ADMIN_STATUS_UPDATE', req.user, item.userId, { collection, id: item.id, patch: req.body || {} });
  res.json({ item });
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
  const treatingDoctor = await resolveTreatingDoctor(actor, session, body);
  if (treatingDoctor.error) return res.status(400).json({ error: treatingDoctor.error });
  const prescription = await db.create('prescriptions', {
    id: makeId('RX'),
    patientId: session.patientId,
    patientName: session.patientName,
    sessionId: session.sessionId,
    sourceCollection: session.sourceCollection,
    hospitalId: session.hospitalId || actor.hospitalId,
    hospitalName: session.hospitalName || actor.hospitalName,
    doctorId: treatingDoctor.doctorId,
    doctorName: treatingDoctor.doctorName,
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
    const [reports, prescriptions, reminders, visits, appointments, labBookings] = await Promise.all([
      db.list('health_records', { patientId }),
      db.list('prescriptions', { patientId }),
      db.list('reminders', { patientId }),
      db.list('visit_requests', { patientId }),
      db.list('appointments', { patientId }),
      db.list('lab_bookings', { patientId }),
    ]);
    res.json({
      reports,
      prescriptions,
      reminders,
      sessions: [
        ...visits.map((item) => normalizeSession(item, 'visit_requests')),
        ...appointments.map((item) => normalizeSession(item, 'appointments')),
        ...labBookings.map(normalizeLabBooking),
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load patient medical data.' });
  }
});

app.get('/api/lab/dashboard', requireRole(['lab', 'admin']), async (req, res) => {
  try {
    const actor = await getActor(req);
    const bookings = (await getLabBookingsForActor(actor))
      .sort((a, b) => String(b.updatedAt || b.createdAt || b.preferredDate || '').localeCompare(String(a.updatedAt || a.createdAt || a.preferredDate || '')));
    const requests = bookings.filter((item) => ['Pending', 'Requested'].includes(String(item.status || 'Pending')));
    const active = bookings.filter((item) =>
      ['Accepted', 'Verified', 'Sample Collected', 'In Progress', 'Report Uploaded'].includes(String(item.status || ''))
    );
    const history = bookings.filter((item) => ['Rejected', 'Closed', 'Completed'].includes(String(item.status || '')));
    const reports = await db.list('health_records', actor.role === 'admin' ? {} : { labId: actor.labId });
    res.json({
      lab: { id: actor.labId, name: actor.labName },
      stats: {
        pendingRequests: requests.length,
        activeSessions: active.length,
        completedSessions: bookings.filter((item) => ['Closed', 'Completed'].includes(String(item.status || ''))).length,
        reportsUploaded: reports.filter((item) => item.sourceCollection === 'lab_bookings' || item.labId || item.labName).length,
        homeTests: bookings.filter((item) => item.collectionType === 'home' || /home/i.test(String(item.testMode || ''))).length,
        walkIns: bookings.filter((item) => item.collectionType === 'lab' || /walk/i.test(String(item.testMode || ''))).length,
      },
      requests,
      active,
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load lab dashboard.' });
  }
});

app.get('/api/lab/requests', requireRole(['lab', 'admin']), async (req, res) => {
  try {
    const actor = await getActor(req);
    const items = await getLabBookingsForActor(actor);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load lab test requests.' });
  }
});

async function assertLabBookingAccess(req, res, bookingId, { allowCompleted = false } = {}) {
  const actor = await getActor(req);
  if (!actor || !['lab', 'admin'].includes(actor.role)) {
    res.status(403).json({ error: 'Only lab users can manage lab test sessions.' });
    return null;
  }
  const raw = await db.get('lab_bookings', bookingId);
  if (!raw) {
    res.status(404).json({ error: 'Lab booking not found.' });
    return null;
  }
  const booking = normalizeLabBooking(raw);
  if (!labOwnsBooking(actor, booking)) {
    res.status(403).json({ error: 'This lab booking is not assigned to your lab.' });
    return null;
  }
  if (!allowCompleted && isCompletedSession(booking)) {
    res.status(409).json({ error: 'This lab test session is already closed.' });
    return null;
  }
  return { actor, booking };
}

app.patch('/api/lab/bookings/:id/accept', requireRole(['lab', 'admin']), async (req, res) => {
  const result = await assertLabBookingAccess(req, res, req.params.id);
  if (!result) return;
  const { actor, booking } = result;
  if (!['Pending', 'Requested'].includes(String(booking.status || 'Pending'))) {
    return res.status(400).json({ error: 'This lab request is already processed.' });
  }
  const acceptedAt = formatDateTime();
  const item = await db.update('lab_bookings', booking.id, {
    labId: booking.labId || actor.labId,
    labName: booking.labName || actor.labName,
    status: 'Accepted',
    sessionStatus: 'ACTIVE',
    visitPassStatus: 'ACTIVE',
    acceptedAt,
    acceptedBy: actor.user.id,
    labNotes: req.body?.labNotes || 'Lab request accepted. Patient verification is required before sample collection/testing.',
    tokenNumber: booking.tokenNumber || `LAB-${Math.floor(100 + Math.random() * 900)}`,
  });
  res.json({ item: normalizeLabBooking(item) });
});

app.patch('/api/lab/bookings/:id/reject', requireRole(['lab', 'admin']), async (req, res) => {
  const result = await assertLabBookingAccess(req, res, req.params.id, { allowCompleted: true });
  if (!result) return;
  const { actor, booking } = result;
  const reason = String(req.body?.reason || req.body?.rejectionReason || '').trim();
  if (reason.length < 2) return res.status(400).json({ error: 'Rejection reason is required.' });
  if (isCompletedSession(booking)) return res.status(409).json({ error: 'Completed sessions cannot be rejected.' });
  const item = await db.update('lab_bookings', booking.id, {
    labId: booking.labId || actor.labId,
    labName: booking.labName || actor.labName,
    status: 'Rejected',
    sessionStatus: 'REJECTED',
    rejectedAt: formatDateTime(),
    rejectedBy: actor.user.id,
    rejectionReason: reason,
  });
  res.json({ item: normalizeLabBooking(item) });
});

app.patch('/api/lab/bookings/:id/verify', requireRole(['lab', 'admin']), async (req, res) => {
  const result = await assertLabBookingAccess(req, res, req.params.id);
  if (!result) return;
  const { actor, booking } = result;
  const method = String(req.body?.method || 'mobile').trim();
  const value = String(req.body?.value || '').trim();
  if (!value) return res.status(400).json({ error: 'Enter patient mobile, patient ID, or card value to verify.' });

  const phoneOk = cleanPhone(value) && cleanPhone(booking.phone || booking.patientPhone).endsWith(cleanPhone(value).slice(-10));
  const idOk = String(booking.patientId || '').toLowerCase() === value.toLowerCase();
  const cardOk = value.toUpperCase().includes(String(booking.patientId || '').toUpperCase()) || value.length >= 6;
  if (method === 'mobile' && !phoneOk) return res.status(400).json({ error: 'Mobile number does not match this booking.' });
  if (method === 'patientId' && !idOk) return res.status(400).json({ error: 'Patient ID does not match this booking.' });
  if (method === 'card' && !cardOk) return res.status(400).json({ error: 'Card verification failed for this patient.' });

  const verifiedAt = formatDateTime();
  const item = await db.update('lab_bookings', booking.id, {
    labId: booking.labId || actor.labId,
    labName: booking.labName || actor.labName,
    status: 'Verified',
    sessionStatus: 'ACTIVE',
    visitPassStatus: 'ACTIVE',
    patientVerified: true,
    verifiedAt,
    verifiedBy: actor.user.id,
    verificationMethod: method,
    sampleStatus: booking.collectionType === 'home' ? 'Home sample collection pending' : 'Walk-in sample collection pending',
  });
  res.json({ item: normalizeLabBooking(item) });
});

app.post('/api/lab/bookings/:id/report', requireRole(['lab', 'admin']), async (req, res) => {
  const result = await assertLabBookingAccess(req, res, req.params.id);
  if (!result) return;
  const { actor, booking } = result;
  if (!booking.patientVerified) {
    return res.status(403).json({ error: 'Verify the patient before uploading or writing test results.' });
  }
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
  if (method === 'manual' && !String(body.reportInformation || body.manualEntry || '').trim()) {
    return res.status(400).json({ error: 'Manual report/result text is required.' });
  }

  const report = await db.create('health_records', {
    id: makeId('REC'),
    patientId: booking.patientId,
    patientName: booking.patientName,
    sessionId: booking.sessionId || booking.id,
    sourceCollection: 'lab_bookings',
    labBookingId: booking.id,
    labId: booking.labId || actor.labId,
    labName: booking.labName || actor.labName,
    hospitalName: booking.labName || actor.labName,
    testName: booking.testName,
    title: body.title || `${booking.testName} Results`,
    type: body.reportType || 'Lab Report',
    reportType: body.reportType || booking.testName,
    reportMethod: method,
    reportInformation: body.reportInformation || body.manualEntry || '',
    documentLink: method === 'link' ? body.documentLink : '',
    file: method === 'file' ? body.file.name : body.fileName || '',
    fileMeta: method === 'file' ? { name: body.file.name, type: body.file.type, size: body.file.size } : undefined,
    fileData: method === 'file' ? body.file.data : undefined,
    facility: booking.labName || actor.labName || 'Ayudh Vikas Lab Network',
    date: formatDateTime(),
    status: 'Available',
    uploadedBy: actor.user.id,
    uploadedByRole: actor.role,
  });
  const updated = await db.update('lab_bookings', booking.id, {
    status: 'Report Uploaded',
    reportStatus: 'Uploaded',
    reportId: report.id,
    reportUploadedAt: report.date,
    sampleStatus: 'Report ready',
  });
  res.status(201).json({ item: report, booking: normalizeLabBooking(updated) });
});

app.post('/api/lab/bookings/:id/close', requireRole(['lab', 'admin']), async (req, res) => {
  const result = await assertLabBookingAccess(req, res, req.params.id);
  if (!result) return;
  const { actor, booking } = result;
  const reports = await db.list('health_records', { sessionId: booking.sessionId || booking.id });
  const hasReport = reports.some((item) => item.sourceCollection === 'lab_bookings' || item.labBookingId === booking.id);
  if (!hasReport && !booking.reportId) {
    return res.status(400).json({ error: 'Upload, link, or write the test report before closing this lab session.' });
  }
  const closedAt = formatDateTime();
  const item = await db.update('lab_bookings', booking.id, {
    status: 'Completed',
    sessionStatus: 'COMPLETED',
    completedAt: closedAt,
    completedBy: actor.user.id,
    completedByRole: actor.role,
    closedAt,
    visitPassStatus: 'EXPIRED',
    visitPassExpiredAt: closedAt,
    historyRecorded: true,
  });
  res.json({ item: normalizeLabBooking(item), reports });
});

app.get('/api/ambulance/drivers', authOptional, async (_req, res) => {
  try {
    const items = await getAmbulanceDrivers();
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load ambulance riders.' });
  }
});

app.get('/api/ambulance/dashboard', requireRole(['ambulance', 'admin']), async (req, res) => {
  try {
    const actor = await getActor(req);
    const [visibleBookings, allBookings, drivers] = await Promise.all([
      getAmbulanceBookingsForActor(actor, { includeUnassigned: true }),
      db.list('ambulance_bookings'),
      getAmbulanceDrivers(),
    ]);
    const bookings = visibleBookings
      .map(normalizeAmbulanceBooking)
      .sort((a, b) => String(b.updatedAt || b.requestedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.requestedAt || a.createdAt || '')));
    const requests = bookings.filter((item) => isAmbulancePending(item));
    const active = bookings.filter((item) => ['Accepted', 'Scheduled', 'Ride Started', 'En Route'].includes(String(item.status || '')));
    const history = bookings.filter((item) => ['Completed', 'Closed', 'Rejected', 'Cancelled'].includes(String(item.status || '')));
    const now = Date.now();
    const upcoming = active.filter((item) => {
      const dateText = `${item.preferredDate || ''} ${item.preferredTime || ''}`.trim();
      const parsed = Date.parse(dateText);
      return Number.isNaN(parsed) || parsed >= now || /immediate/i.test(String(item.preferredTime || item.pickupType || ''));
    });
    const allNormalized = allBookings.map(normalizeAmbulanceBooking);
    const hospitalCounts = {};
    allNormalized.forEach((booking) => {
      const key = String(booking.dropLocation || booking.hospitalName || 'Not specified').trim();
      hospitalCounts[key] = (hospitalCounts[key] || 0) + 1;
    });
    const topHospitals = Object.entries(hospitalCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const uniquePatients = new Set(allNormalized.map((item) => item.patientId || cleanPhone(item.phone)).filter(Boolean));
    const driver = drivers.find((item) => String(item.ambulanceId || item.id) === String(actor.ambulanceId || '')) || {
      id: actor.ambulanceId,
      ambulanceId: actor.ambulanceId,
      driverName: actor.ambulanceName,
      name: actor.ambulanceName,
      phone: actor.ambulancePhone,
      vehicleNumber: actor.vehicleNumber,
      vehicleType: actor.ambulance?.vehicleType || 'Basic Life Support (BLS)',
      baseLocation: actor.ambulance?.baseLocation || 'Ayudh Vikas Dispatch Unit',
      district: actor.ambulance?.district || 'Warangal',
      image: actor.user?.data?.image || DEFAULT_DRIVER_IMAGE,
    };
    res.json({
      driver,
      stats: {
        totalBookings: bookings.length,
        pendingBookings: requests.length,
        acceptedBookings: active.length,
        completedBookings: bookings.filter((item) => ['Completed', 'Closed'].includes(String(item.status || ''))).length,
        previousBookings: history.length,
        offlineBookings: bookings.filter((item) => item.source === 'Offline' || item.offlineBooking).length,
      },
      predictions: {
        appUsers: uniquePatients.size,
        totalAyudhAmbulanceBookings: allNormalized.length,
        mostRequestedHospitals: topHospitals,
        averageKm: Math.round(allNormalized.reduce((sum, item) => sum + Number(item.estimatedKm || 0), 0) / Math.max(1, allNormalized.length)),
      },
      requests,
      active,
      upcoming,
      accepted: [...active, ...history.filter((item) => ['Completed', 'Closed'].includes(String(item.status || '')))],
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load ambulance dashboard.' });
  }
});

async function assertAmbulanceBookingAccess(req, res, bookingId, { allowUnassigned = false, allowCompleted = false } = {}) {
  const actor = await getActor(req);
  if (!actor || !['ambulance', 'admin'].includes(actor.role)) {
    res.status(403).json({ error: 'Only ambulance users can manage ambulance bookings.' });
    return null;
  }
  const raw = await db.get('ambulance_bookings', bookingId);
  if (!raw) {
    res.status(404).json({ error: 'Ambulance booking not found.' });
    return null;
  }
  const booking = normalizeAmbulanceBooking(raw);
  if (!ambulanceOwnsBooking(actor, booking, { allowUnassigned })) {
    res.status(403).json({ error: 'This ambulance booking is not assigned to your account.' });
    return null;
  }
  if (!allowCompleted && isCompletedSession(booking)) {
    res.status(409).json({ error: 'This ambulance ride is already completed.' });
    return null;
  }
  return { actor, booking };
}

app.patch('/api/ambulance/bookings/:id/accept', requireRole(['ambulance', 'admin']), async (req, res) => {
  const result = await assertAmbulanceBookingAccess(req, res, req.params.id, { allowUnassigned: true });
  if (!result) return;
  const { actor, booking } = result;
  if (!isAmbulancePending(booking)) {
    return res.status(400).json({ error: 'This ambulance request is already processed.' });
  }
  const acceptedAt = formatDateTime();
  const item = await db.update('ambulance_bookings', booking.id, {
    driverId: booking.driverId || actor.ambulanceId,
    ambulanceId: booking.ambulanceId || actor.ambulanceId,
    driverName: booking.driverName || actor.ambulanceName,
    driverContact: booking.driverContact || actor.ambulancePhone,
    vehicleNumber: booking.vehicleNumber || actor.vehicleNumber,
    vehicleType: booking.vehicleType || actor.ambulance?.vehicleType || booking.ambulanceType || 'Basic Life Support (BLS)',
    status: 'Accepted',
    rideStatus: 'Accepted',
    sessionStatus: 'ACTIVE',
    visitPassStatus: 'ACTIVE',
    acceptedAt,
    acceptedBy: actor.user.id,
    eta: booking.eta || req.body?.eta || '8 - 12 Minutes',
    estimatedKm: booking.estimatedKm || estimateAmbulanceKm(booking.pickupLocation, booking.dropLocation),
    driverNotes: req.body?.driverNotes || booking.driverNotes || 'Ambulance request accepted. Driver will coordinate with the patient.',
  });
  broadcast({ collection: 'ambulance_bookings', action: 'update', record: item });
  res.json({ item: normalizeAmbulanceBooking(item) });
});

app.patch('/api/ambulance/bookings/:id/reject', requireRole(['ambulance', 'admin']), async (req, res) => {
  const result = await assertAmbulanceBookingAccess(req, res, req.params.id, { allowUnassigned: true, allowCompleted: true });
  if (!result) return;
  const { actor, booking } = result;
  const reason = String(req.body?.reason || req.body?.rejectionReason || '').trim();
  if (reason.length < 2) return res.status(400).json({ error: 'Rejection reason is required.' });
  if (isCompletedSession(booking)) return res.status(409).json({ error: 'Completed rides cannot be rejected.' });
  const item = await db.update('ambulance_bookings', booking.id, {
    driverId: booking.driverId || actor.ambulanceId,
    ambulanceId: booking.ambulanceId || actor.ambulanceId,
    driverName: booking.driverName || actor.ambulanceName,
    driverContact: booking.driverContact || actor.ambulancePhone,
    status: 'Rejected',
    rideStatus: 'Rejected',
    sessionStatus: 'REJECTED',
    rejectedAt: formatDateTime(),
    rejectedBy: actor.user.id,
    rejectionReason: reason,
  });
  broadcast({ collection: 'ambulance_bookings', action: 'update', record: item });
  res.json({ item: normalizeAmbulanceBooking(item) });
});

app.patch('/api/ambulance/bookings/:id/start', requireRole(['ambulance', 'admin']), async (req, res) => {
  const result = await assertAmbulanceBookingAccess(req, res, req.params.id);
  if (!result) return;
  const { actor, booking } = result;
  if (!['Accepted', 'Scheduled'].includes(String(booking.status || ''))) {
    return res.status(400).json({ error: 'Only accepted rides can be started.' });
  }
  const item = await db.update('ambulance_bookings', booking.id, {
    status: 'Ride Started',
    rideStatus: 'Ride Started',
    rideStartedAt: formatDateTime(),
    rideStartedBy: actor.user.id,
  });
  broadcast({ collection: 'ambulance_bookings', action: 'update', record: item });
  res.json({ item: normalizeAmbulanceBooking(item) });
});

app.patch('/api/ambulance/bookings/:id/complete', requireRole(['ambulance', 'admin']), async (req, res) => {
  const result = await assertAmbulanceBookingAccess(req, res, req.params.id);
  if (!result) return;
  const { actor, booking } = result;
  if (!['Accepted', 'Scheduled', 'Ride Started', 'En Route'].includes(String(booking.status || ''))) {
    return res.status(400).json({ error: 'Only active ambulance rides can be completed.' });
  }
  const completedAt = formatDateTime();
  const item = await db.update('ambulance_bookings', booking.id, {
    status: 'Completed',
    rideStatus: 'Completed',
    sessionStatus: 'COMPLETED',
    completedAt,
    completedBy: actor.user.id,
    completedByRole: actor.role,
    rideCompletedAt: completedAt,
    actualKm: req.body?.actualKm || booking.estimatedKm,
    visitPassStatus: 'EXPIRED',
    visitPassExpiredAt: completedAt,
    completionNotes: req.body?.completionNotes || '',
    historyRecorded: true,
  });
  broadcast({ collection: 'ambulance_bookings', action: 'update', record: item });
  res.json({ item: normalizeAmbulanceBooking(item) });
});

app.patch('/api/ambulance/profile', requireRole(['ambulance', 'admin']), async (req, res) => {
  try {
    const actor = await getActor(req);
    const patch = req.body || {};
    const profilePatch = {
      driverName: patch.driverName || patch.name || actor.ambulanceName,
      name: patch.driverName || patch.name || actor.ambulanceName,
      phone: patch.phone || patch.mobile || actor.ambulancePhone,
      vehicleNumber: patch.vehicleNumber || actor.vehicleNumber,
      vehicleType: patch.vehicleType || actor.ambulance?.vehicleType || 'Basic Life Support (BLS)',
      district: patch.district || actor.ambulance?.district || 'Warangal',
      baseLocation: patch.baseLocation || actor.ambulance?.baseLocation || '',
      image: patch.image || actor.ambulance?.image || actor.user?.data?.image || '',
      updatedAt: formatDateTime(),
    };
    let item = actor.ambulance;
    if (item?.id) {
      item = await db.update('partnerships', item.id, profilePatch);
    } else {
      item = await db.create('partnerships', {
        id: actor.ambulanceId || makeId('AMB'),
        ambulanceId: actor.ambulanceId || makeId('AMB'),
        userId: actor.user.id,
        role: 'ambulance',
        status: 'Active',
        verificationStatus: 'VERIFIED',
        ...profilePatch,
      });
    }
    await db.updateUser(actor.user.id, {
      name: profilePatch.driverName,
      phone: profilePatch.phone,
      data: {
        ...(actor.user.data || {}),
        ambulanceId: item.ambulanceId || item.id,
        driverName: profilePatch.driverName,
        vehicleNumber: profilePatch.vehicleNumber,
        vehicleType: profilePatch.vehicleType,
        district: profilePatch.district,
        baseLocation: profilePatch.baseLocation,
        image: profilePatch.image,
      },
    });
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update ambulance profile.' });
  }
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
  const passwordChanged = Boolean(patch.password);
  if (patch.password) {
    patch.password_hash = hashPassword(String(patch.password));
    delete patch.password;
  }
  delete patch.confirmPassword;
  if (patch.primaryRole) patch.role = patch.primaryRole;
  const user = await db.updateUser(req.params.id, patch);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (passwordChanged) {
    await revokeAllUserSessions(req.params.id, 'ADMIN_PASSWORD_RESET');
    await auditAuth('ADMIN_PASSWORD_RESET', req.params.id, req, { adminId: req.user.id });
  }
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
  if (FUND360_COLLECTIONS.has(collection) && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Use the FUND 365 API for programme records.' });
  }
  const publicRead = PUBLIC_READ_COLLECTIONS.includes(collection);
  if (!publicRead && !req.user) return res.status(401).json({ error: 'Authentication required' });

  const { page, limit, ...filter } = req.query;
  let items;
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    items = await scopedSensitiveList(actor, collection, filter);
  } else {
    let roleFilter = { ...filter };
    if (req.user) {
      roleFilter = applyRoleBasedFilters(collection, filter, userRolesOf(req.user), req.user.id, userData(req.user));
    }
    items = await db.list(collection, roleFilter);
  }

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
  if (FUND360_COLLECTIONS.has(collection) && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Use the FUND 365 API for programme records.' });
  }
  const publicRead = PUBLIC_READ_COLLECTIONS.includes(collection);
  if (!publicRead && !req.user) return res.status(401).json({ error: 'Authentication required' });
  const item = await db.get(collection, id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    const visible = await scopedSensitiveList(actor, collection, {});
    if (!visible.some((record) => record.id === item.id)) {
      return res.status(403).json({ error: 'You are not allowed to view this medical record.' });
    }
  } else if (!publicRead && !canModifyRecord(req.user, collection, item) && !userHasRole(req.user, ['doctor', 'hospital', 'marketing', 'admin'])) {
    return res.status(403).json({ error: 'Cannot access this record' });
  }
  res.json({ item });
});

app.post('/api/records/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!assertCollection(collection)) return res.status(404).json({ error: 'Unknown collection' });
  if (FUND360_COLLECTIONS.has(collection) && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Use the FUND 365 API for programme records.' });
  }
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
      fund360_accounts: 'F360A',
      fund360_participations: 'F360P',
      fund360_transactions: 'F360T',
      fund360_monthly_payments: 'F360MP',
      fund360_milestones: 'F360M',
      fund360_benefits: 'F360B',
      fund360_service_participations: 'F360S',
      fund360_celebration_preferences: 'F360C',
      fund360_eligibility_records: 'F360E',
      auth_sessions: 'SESS',
      audit_logs: 'AUD',
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
    if (collection === 'ambulance_bookings') payload.status = 'Pending';
    if (collection === 'lab_bookings') payload.status = 'Pending';
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
  if (collection === 'lab_bookings') {
    payload.testName = payload.testName || payload.packageName || payload.selectedPackage || payload.selectedCategory || 'Lab Test';
    payload.testMode = payload.testMode || (payload.collectionType === 'home' ? 'Home Test' : 'Walk-in');
    payload.sessionStatus = payload.sessionStatus || 'REQUESTED';
    payload.visitPassStatus = payload.visitPassStatus || 'PENDING';
    payload.reportStatus = payload.reportStatus || 'Pending';
    payload.requestedAt = payload.requestedAt || formatDateTime();
  }
  if (['visit_requests', 'appointments'].includes(collection) && isAuthorizedStatus(payload.status)) {
    payload.authorizedAt = payload.authorizedAt || formatDateTime();
    payload.sessionStatus = payload.sessionStatus || 'ACTIVE';
    payload.visitPassStatus = payload.visitPassStatus || 'ACTIVE';
    payload.tokenNumber = payload.tokenNumber || `TK-${Math.floor(10 + Math.random() * 90)}`;
  }
  if (collection === 'ambulance_bookings') {
    const drivers = await getAmbulanceDrivers();
    const requestedDriverId = String(payload.driverId || payload.ambulanceId || '').trim();
    const driver = drivers.find((item) =>
      String(item.ambulanceId || item.id || '') === requestedDriverId ||
      cleanPhone(item.phone) === cleanPhone(payload.driverContact)
    );
    payload.requestedAt = payload.requestedAt || formatDateTime();
    payload.sessionStatus = payload.sessionStatus || 'REQUESTED';
    payload.visitPassStatus = payload.visitPassStatus || 'PENDING';
    payload.rideStatus = payload.rideStatus || payload.status || 'Pending';
    payload.requestId = payload.requestId || `AV-AMB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    payload.estimatedKm = payload.estimatedKm || estimateAmbulanceKm(payload.pickupLocation, payload.dropLocation);
    payload.reportStatus = payload.reportStatus || 'Not Required';
    if (driver) {
      payload.driverId = payload.driverId || driver.ambulanceId || driver.id;
      payload.ambulanceId = payload.ambulanceId || driver.ambulanceId || driver.id;
      payload.driverName = payload.driverName || driver.driverName || driver.name;
      payload.driverContact = payload.driverContact || driver.phone;
      payload.vehicleNumber = payload.vehicleNumber || driver.vehicleNumber;
      payload.vehicleType = payload.vehicleType || driver.vehicleType;
      payload.driverBaseLocation = payload.driverBaseLocation || driver.baseLocation;
    }
    payload.eta = payload.eta || (payload.pickupType && /immediate|emergency/i.test(payload.pickupType) ? '8 - 12 Minutes after acceptance' : 'As per scheduled pickup');
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
  if (FUND360_COLLECTIONS.has(collection) && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Use the FUND 365 API for programme records.' });
  }
  const patch = { ...(req.body || {}) };
  if (['visit_requests', 'appointments'].includes(collection) && isAuthorizedStatus(patch.status)) {
    patch.authorizedAt = patch.authorizedAt || formatDateTime();
    patch.sessionStatus = patch.sessionStatus || 'ACTIVE';
    patch.visitPassStatus = patch.visitPassStatus || 'ACTIVE';
    patch.tokenNumber = patch.tokenNumber || `TK-${Math.floor(10 + Math.random() * 90)}`;
  }
  const existing = await db.get(collection, id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    if (!canMutateSensitiveCollection(actor, collection, patch, existing)) {
      return res.status(403).json({ error: 'You are not allowed to update this medical record.' });
    }
  } else if (!canModifyRecord(req.user, collection, existing)) {
    return res.status(403).json({ error: 'Cannot modify this record' });
  }
  const item = await db.update(collection, id, patch);
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
  if (FUND360_COLLECTIONS.has(collection) && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Use the FUND 365 API for programme records.' });
  }
  const existing = await db.get(collection, id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (SENSITIVE_COLLECTIONS.has(collection)) {
    const actor = await getActor(req);
    if (!canMutateSensitiveCollection(actor, collection, {}, existing)) {
      return res.status(403).json({ error: 'You are not allowed to delete this medical record.' });
    }
  } else if (!canModifyRecord(req.user, collection, existing)) {
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

async function ensureDemoLabAccount() {
  const existing = await db.findUserByIdentifier('lab@ayudhvikas.org');
  if (!existing) {
    await db.createUser({
      id: 'user-lab-1',
      role: 'lab',
      roles: ['lab'],
      primaryRole: 'lab',
      name: 'Ayudh Vikas Diagnostic Lab',
      email: 'lab@ayudhvikas.org',
      phone: '9876500002',
      password_hash: hashPassword('lab123'),
      emailVerified: true,
      data: {
        labId: 'LAB-DEMO-1',
        labName: 'Ayudh Vikas Diagnostic Lab',
        identifier: 'lab@ayudhvikas.org',
        district: 'Warangal',
      },
    });
  }

  const labProfile = await db.get('partnerships', 'LAB-DEMO-1');
  if (!labProfile) {
    await db.create('partnerships', {
      id: 'LAB-DEMO-1',
      userId: 'user-lab-1',
      role: 'lab',
      labId: 'LAB-DEMO-1',
      name: 'Ayudh Vikas Diagnostic Lab',
      labName: 'Ayudh Vikas Diagnostic Lab',
      licenseNumber: 'AVF-LAB-2026-001',
      nablApproved: 'Yes',
      contactPerson: 'Lab Operations Team',
      phone: '9876500002',
      email: 'lab@ayudhvikas.org',
      district: 'Warangal',
      address: 'Ayudh Vikas Health Care Network, Warangal',
      testCategories: ['Hematology', 'Biochemistry', 'Microbiology', 'Radiology / X-Ray'],
      homeCollectionAvailable: true,
      digitalReportsTurnaround: 'Within 6 Hours',
      status: 'Active',
      verificationStatus: 'VERIFIED',
    });
  }
}

async function start() {
  db = createDb((event) => {
    broadcast({ ...event, type: 'record:change', event: 'record_updated' });
  });
  await db.connect();
  await seedDatabase(db, async (plain) => hashPassword(plain));
  await ensureDemoLabAccount();
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
