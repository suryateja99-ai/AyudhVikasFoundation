import webpush from 'web-push';

const DEFAULT_PUBLIC = 'BEQGaPZX_Z4jFoT40b7M4WBdu6M8ljWf6LYe62mkKcpNADyLseezQ-oK9dcYbBRIYn6_o39BcwwUR35Cq5sgsMU';
const DEFAULT_PRIVATE = 'vbMlyHW3vl7_GhvQuT-XGxoQT4uvr9kSnha9ywxBGDI';

const publicKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_PUBLIC;
const privateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_PRIVATE;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@ayudhvikasfoundation.org';

let configured = false;
try {
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
} catch (err) {
  console.warn('[push] VAPID setup failed:', err.message);
}

export function vapidPublicKey() {
  return configured ? publicKey : '';
}

export function pushConfigured() {
  return configured;
}

function toWebPushSubscription(row) {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.keys?.p256dh || row.p256dh,
      auth: row.keys?.auth || row.auth,
    },
  };
}

export async function savePushSubscription(db, { subscription, userId = '', consent = true }) {
  const endpoint = subscription?.endpoint;
  if (!endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return { error: 'Invalid push subscription.' };
  }
  const existing = (await db.list('push_subscriptions', { endpoint }))[0];
  const payload = {
    endpoint,
    keys: subscription.keys,
    userId: userId || existing?.userId || '',
    consent: Boolean(consent),
    userAgent: '',
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    return db.update('push_subscriptions', existing.id, payload);
  }
  return db.create('push_subscriptions', {
    id: `PUSH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase(),
    ...payload,
    createdAt: new Date().toISOString(),
  });
}

export async function removePushSubscription(db, endpoint) {
  if (!endpoint) return;
  const rows = await db.list('push_subscriptions', { endpoint });
  await Promise.all(rows.map((row) => db.remove('push_subscriptions', row.id)));
}

async function deliver(db, row, payload) {
  if (!configured || !row?.consent) return { skipped: true };
  try {
    await webpush.sendNotification(toWebPushSubscription(row), JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    const status = err.statusCode || err.status;
    if (status === 404 || status === 410) {
      await db.remove('push_subscriptions', row.id);
    } else {
      console.warn('[push] send failed:', status || err.message);
    }
    return { ok: false, status };
  }
}

export async function sendPushToUser(db, userId, notification) {
  if (!configured || !userId) return;
  const all = await db.list('push_subscriptions');
  const rows = all.filter((row) => String(row.userId || '') === String(userId) && row.consent !== false);
  const payload = {
    title: notification.title || 'Ayudh Vikas Foundation',
    body: notification.message || '',
    url: notification.url || notification.data?.url || '/',
    type: notification.type || 'general',
    tag: notification.id || notification.data?.id,
  };
  if (!rows.length) {
    console.warn('[push] No device subscription for user', userId);
    return;
  }
  await Promise.all(rows.map((row) => deliver(db, row, payload)));
}

export async function sendPushToAudience(db, { audience = 'all', notification }) {
  if (!configured) return { sent: 0 };
  const rows = await db.list('push_subscriptions');
  const users = audience === 'all' || audience === 'guests' ? [] : await db.listUsers({});
  const roleWanted = {
    patients: 'patient',
    doctors: 'doctor',
    hospitals: 'hospital',
    all: '',
    guests: '',
  }[String(audience).toLowerCase()] || '';

  const allowedUserIds = new Set(
    users
      .filter((user) => {
        if (!roleWanted) return true;
        const roles = Array.isArray(user.roles) ? user.roles : [user.role, user.primaryRole];
        return roles.includes(roleWanted);
      })
      .map((user) => user.id)
  );

  const payload = {
    title: notification.title || 'Ayudh Vikas Foundation',
    body: notification.message || '',
    url: notification.url || '/',
    type: notification.type || 'promotional',
  };

  let sent = 0;
  for (const row of rows) {
    if (audience === 'guests' && row.userId) continue;
    if (roleWanted && !allowedUserIds.has(row.userId)) continue;
    if (audience === 'all' && !row.userId && !row.consent) continue;
    const result = await deliver(db, row, payload);
    if (result.ok) sent += 1;
  }
  return { sent };
}
