import { apiUrl, getToken } from './api';

const CONSENT_KEY = 'ayudh_cookie_consent';

export function getCookieConsent(): 'accepted' | 'necessary' | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === 'accepted' || value === 'necessary') return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function setCookieConsent(value: 'accepted' | 'necessary') {
  localStorage.setItem(CONSENT_KEY, value);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function registerWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  return navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

const shownNotes = new Set<string>();

export function rememberShownNotification(id?: string) {
  if (id) shownNotes.add(String(id));
}

export async function showDeviceNotification(note: { id?: string; title?: string; message?: string; body?: string; url?: string; type?: string; data?: any }) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const key = String(note.id || `${note.title}:${note.message || note.body}`);
  if (shownNotes.has(key)) return;
  shownNotes.add(key);
  const title = note.title || 'Ayudh Vikas Foundation';
  const body = note.message || note.body || '';
  const options: NotificationOptions = {
    body,
    icon: '/ayudh-vikas-logo.jpg',
    badge: '/ayudh-vikas-logo.jpg',
    tag: note.id || `avf-${Date.now()}`,
    data: { url: note.url || note.data?.url || '/', type: note.type, ...note.data },
  };
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
  } catch {
    try {
      new Notification(title, options);
    } catch {
      /* ignore */
    }
  }
}

export async function enableWebPush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }
  let permission = Notification.permission;
  if (permission === 'default') permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  const registration = await registerWorker();
  if (!registration) return { ok: false, reason: 'no_worker' };
  await navigator.serviceWorker.ready;

  const keyRes = await fetch(apiUrl('/api/push/vapid-public-key'), { credentials: 'include' });
  if (!keyRes.ok) return { ok: false, reason: 'no_vapid' };
  const { publicKey } = await keyRes.json();
  const keyBytes = urlBase64ToUint8Array(publicKey);

  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    try {
      await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes });
    } catch {
      await subscription.unsubscribe().catch(() => undefined);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes,
      });
    }
  } else {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes,
    });
  }

  const token = getToken();
  const save = await fetch(apiUrl('/api/push/subscribe'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ subscription, consent: true }),
  });
  if (!save.ok) return { ok: false, reason: 'subscribe_failed' };
  setCookieConsent('accepted');
  return { ok: true };
}

export async function syncPushSubscription() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'denied') return;
  if (Notification.permission === 'default' && getCookieConsent() === 'necessary') return;
  try {
    await enableWebPush();
  } catch {
    /* ignore */
  }
}
