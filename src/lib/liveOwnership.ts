export function belongsToPatient(item: any, user: any, extra?: { patientId?: string; phone?: string }) {
  if (!item) return false;
  const pid = String(user?.patientId || extra?.patientId || '').trim();
  const uid = String(user?.id || '').trim();
  const phone = String(user?.phone || extra?.phone || '').replace(/\D/g, '');
  if (!pid && !uid && !phone) return false;
  const itemPid = String(item.patientId || '').trim();
  const itemUid = String(item.userId || item.patientUserId || '').trim();
  const itemPhone = String(item.patientPhone || item.phone || '').replace(/\D/g, '');
  if (pid && itemPid && itemPid === pid) return true;
  if (uid && itemUid && itemUid === uid) return true;
  if (phone && itemPhone && itemPhone === phone) return true;
  if (pid && String(item.id || '') === pid) return true;
  return false;
}

export function belongsToDoctor(item: any, user: any) {
  if (!item || !user) return false;
  const doctorId = String(user.doctorId || '').trim();
  const uid = String(user.id || '').trim();
  const name = String(user.name || '').trim().toLowerCase();
  if (doctorId && String(item.doctorId || '') === doctorId) return true;
  if (uid && String(item.userId || '') === uid) return true;
  if (doctorId && String(item.id || '') === doctorId) return true;
  if (name && String(item.doctorName || '').trim().toLowerCase() === name) return true;
  return false;
}

export function parseRecordDate(item: any): Date | null {
  const raw = item?.appointmentDateTime || item?.appointmentDate || item?.preferredDate || item?.date || item?.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;
  const parsed = Date.parse(String(raw));
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

const CLOSED = new Set(['rejected', 'cancelled', 'completed', 'no-show', 'noshow']);

export function isUpcomingAppointment(item: any) {
  const status = String(item?.status || '').toLowerCase();
  if (CLOSED.has(status)) return false;
  const d = parseRecordDate(item);
  if (!d) return ['pending', 'requested', 'confirmed', 'accepted', 'scheduled', 'arrived'].includes(status);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return d.getTime() >= start.getTime();
}

export function isTodayRecord(item: any) {
  const d = parseRecordDate(item);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function formatApptDate(item: any) {
  const d = parseRecordDate(item);
  if (d) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return item?.appointmentDate || item?.preferredDate || 'Date TBA';
}

export function formatApptTime(item: any) {
  return item?.appointmentTime || item?.slot || item?.preferredTime || '';
}
