import { sendAppointmentConfirmationEmail } from './email.js';
import { sendSMS } from './sms.js';
import { sendPushToUser } from './push.js';

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
  try {
    await sendPushToUser(db, userId, {
      title: item.title,
      message: item.message,
      type: item.type,
      url: notification.url || notification.data?.url || '/',
      data: item.data,
    });
  } catch (err) {
    console.warn('[push] in-app notification push failed:', err.message);
  }
  return item;
}

export async function notifyUsersByRole(db, role, notification, broadcast) {
  const users = await db.listUsers({});
  const wanted = String(role || '').toLowerCase();
  const matches = users.filter((user) => {
    if (!wanted || wanted === 'all') return true;
    const roles = Array.isArray(user.roles) ? user.roles : [user.role, user.primaryRole];
    return roles.map((item) => String(item || '').toLowerCase()).includes(wanted);
  });
  for (const user of matches) {
    await createNotification(db, user.id, notification, broadcast);
  }
  return matches.length;
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

async function findUserByDoctorId(db, doctorId) {
  if (!doctorId) return null;
  const users = await db.listUsers({});
  return users.find((user) => user.doctorId === doctorId) || null;
}

export async function notifyAppointmentConfirmed(db, appointmentId, broadcast) {
  const appointment = await db.get('appointments', appointmentId);
  if (!appointment) return;
  const patient = appointment.patientId ? await db.get('patients', appointment.patientId) : null;
  const doctor = appointment.doctorId ? await db.get('doctors', appointment.doctorId) : null;
  const user = appointment.userId
    ? await db.getUser(appointment.userId)
    : await findUserForPatient(db, patient || { phone: appointment.phone, email: appointment.email, id: appointment.patientId, userId: appointment.userId });
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

  const doctorUser = await findUserByDoctorId(db, appointment.doctorId);
  if (doctorUser?.id) {
    await createNotification(db, doctorUser.id, {
      type: 'appointment_assigned',
      title: 'New appointment assigned',
      message: `${appointment.patientName || 'A patient'} is booked with you for ${when}`,
      data: { appointmentId },
    }, broadcast);
  }
}

export async function notifyPatientRecord(db, patient, notification, broadcast) {
  const user = await findUserForPatient(db, patient);
  if (!user && patient?.userId) {
    const byId = await db.getUser(patient.userId);
    if (byId?.id) {
      await createNotification(db, byId.id, notification, broadcast);
      return byId;
    }
  }
  if (user?.id) await createNotification(db, user.id, notification, broadcast);
  return user;
}

export async function notifyDoctorById(db, doctorId, notification, broadcast) {
  const doctorUser = await findUserByDoctorId(db, doctorId);
  if (doctorUser?.id) await createNotification(db, doctorUser.id, notification, broadcast);
  return doctorUser;
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
