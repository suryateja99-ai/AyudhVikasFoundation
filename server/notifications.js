import { sendEmail, sendAppointmentConfirmationEmail } from './email.js';
import { sendSMS } from './sms.js';

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

export async function createNotification(db, userId, notification, broadcast) {
  if (!userId) return null;
  const item = await db.create('notifications', {
    id: makeId('NTF'),
    userId,
    type: notification.type || 'general',
    title: notification.title || 'Notification',
    message: notification.message || '',
    data: notification.data || {},
    read: false,
    createdAt: new Date().toISOString(),
  });
  if (typeof broadcast === 'function') {
    broadcast({
      event: 'notification_created',
      collection: 'notifications',
      action: 'create',
      id: item.id,
      data: item,
      record: item,
      userId,
    });
  }
  return item;
}

async function findUserForPatient(db, patient) {
  if (!patient) return null;
  if (patient.userId) return db.getUser(patient.userId);
  const byEmail = patient.email ? await db.findUserByIdentifier(patient.email) : null;
  if (byEmail) return db.getUser(byEmail.id);
  const byPhone = patient.phone ? await db.findUserByIdentifier(patient.phone) : null;
  if (byPhone) return db.getUser(byPhone.id);
  const byPatientId = patient.id || patient.patientId;
  if (byPatientId) {
    const users = await db.listUsers({});
    return users.find((u) => u.patientId === byPatientId || u.id === patient.userId) || null;
  }
  return null;
}

export async function notifyAppointmentConfirmed(db, appointmentId, broadcast) {
  const appointment = await db.get('appointments', appointmentId);
  if (!appointment) return;
  const patient = appointment.patientId ? await db.get('patients', appointment.patientId) : null;
  const doctor = appointment.doctorId ? await db.get('doctors', appointment.doctorId) : null;
  const user = await findUserForPatient(db, patient || { phone: appointment.phone, email: appointment.email, id: appointment.patientId });
  const when = appointment.appointmentDateTime || `${appointment.appointmentDate || ''} ${appointment.appointmentTime || ''}`.trim();
  const doctorName = doctor?.name || appointment.doctorName || 'your doctor';

  if (user?.id) {
    await createNotification(db, user.id, {
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${doctorName} is confirmed for ${when}`,
      data: { appointmentId },
    }, broadcast);
  }

  const email = user?.email || appointment.email || patient?.email;
  if (email) {
    await sendAppointmentConfirmationEmail(email, {
      patient: appointment.patientName || patient?.fullName,
      hospital: appointment.hospital || appointment.hospitalName,
      doctor: doctorName,
      appointmentDateTime: when,
      confirmationCode: appointment.confirmationCode || appointment.tokenNumber,
      qrCodeUrl: appointment.qrCode,
      bedNumber: appointment.assignedBedNumber || appointment.bedNumber,
    });
  }

  const phone = user?.phone || appointment.phone || patient?.phone;
  if (phone) {
    await sendSMS(phone, {
      message: `Your appointment with ${doctorName} is confirmed for ${when}. Confirmation ID: ${appointment.id}`,
    });
  }
}

export async function notifyUsersByHospital(db, hospitalId, notification, broadcast) {
  const users = await db.listUsers({});
  const hospitalUsers = users.filter(
    (user) =>
      (user.role === 'hospital' || (user.roles || []).includes('hospital')) &&
      (user.hospitalId === hospitalId || user.data?.hospitalId === hospitalId)
  );
  for (const user of hospitalUsers) {
    await createNotification(db, user.id, notification, broadcast);
  }
}

export function qrCodeUrl(value) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(value)}`;
}
