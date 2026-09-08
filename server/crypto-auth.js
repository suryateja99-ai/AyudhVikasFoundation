import crypto from 'crypto';

const KEY = process.env.JWT_SECRET || 'ayudh-vikas-dev-secret';

export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(plain), salt, 32).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain, stored) {
  if (!stored) return false;
  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$');
    const next = crypto.scryptSync(String(plain), salt, 32).toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(next, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
  return stored === String(plain);
}

export function signToken(payload, expiresInSec = 60 * 60 * 24 * 7) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec })).toString('base64url');
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', KEY).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', KEY).update(`${header}.${body}`).digest('base64url');
  if (expected !== sig) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}
