import nodemailer from 'nodemailer';

const APP_URL = process.env.APP_URL || process.env.PUBLIC_APP_URL || 'http://localhost:3000';
const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@ayudhvikas.com';

function mailerReady() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

function createTransport() {
  if (!mailerReady()) return null;
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || undefined,
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

async function deliver(options) {
  const transporter = createTransport();
  if (!transporter) {
    console.log('[email] SMTP not configured. Would send:', {
      to: options.to,
      subject: options.subject,
    });
    return { skipped: true };
  }
  return transporter.sendMail({
    from: FROM,
    ...options,
  });
}

export async function sendEmail(to, { subject, html, text, template, data } = {}) {
  if (!to) return { skipped: true };
  const body =
    html ||
    text ||
    `<p>${template || 'Notification'}</p><pre>${JSON.stringify(data || {}, null, 2)}</pre>`;
  return deliver({ to, subject: subject || 'Ayudh Vikas Foundation', html: body, text });
}

export async function sendVerificationEmail(email, token) {
  const verificationLink = `${APP_URL}/verify-email?token=${token}`;
  return sendEmail(email, {
    subject: 'Verify Your Email - Ayudh Vikas Foundation',
    html: `
      <h2>Welcome to Ayudh Vikas Foundation</h2>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendOTPEmail(email, otp) {
  return sendEmail(email, {
    subject: 'Your OTP - Ayudh Vikas Foundation',
    html: `<h2>Your verification code is: <strong>${otp}</strong></h2><p>Valid for 5 minutes.</p>`,
  });
}

export async function sendAppointmentConfirmationEmail(email, details = {}) {
  return sendEmail(email, {
    subject: 'Appointment Confirmed - Ayudh Vikas Foundation',
    html: `
      <h2>Your visit has been scheduled</h2>
      <p>Patient: ${details.patient || ''}</p>
      <p>Hospital: ${details.hospital || ''}</p>
      <p>Doctor: ${details.doctor || ''}</p>
      <p>Date & time: ${details.appointmentDateTime || ''}</p>
      <p>Confirmation code: <strong>${details.confirmationCode || ''}</strong></p>
      ${details.bedNumber ? `<p>Bed / room: ${details.bedNumber}</p>` : ''}
      ${details.qrCodeUrl ? `<p><img alt="QR" src="${details.qrCodeUrl}" /></p>` : ''}
    `,
  });
}

export async function sendVerificationApprovedEmail(email, name) {
  return sendEmail(email, {
    subject: 'Verification approved - Ayudh Vikas Foundation',
    html: `<p>Dear ${name || 'Doctor'}, your credentials have been verified. You now appear in the Ayudh network search.</p>`,
  });
}

export async function sendVerificationRejectedEmail(email, name, reason) {
  return sendEmail(email, {
    subject: 'Verification update - Ayudh Vikas Foundation',
    html: `<p>Dear ${name || 'Applicant'}, your verification was not approved.</p><p>Reason: ${reason || 'Please contact support.'}</p>`,
  });
}

export async function sendVisitRequestAcceptedEmail(email, details = {}) {
  return sendAppointmentConfirmationEmail(email, details);
}
