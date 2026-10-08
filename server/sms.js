function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function normalizePhone(phone) {
  const digits = digitsOnly(phone);
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return String(phone || '').startsWith('+') ? String(phone) : `+${digits}`;
}

export function nationalNumber(phone) {
  const e164 = normalizePhone(phone);
  const digits = digitsOnly(e164);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 10) return digits;
  return digits;
}

function renderTemplate(value, data = {}) {
  return String(value || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return data[key] === undefined || data[key] === null ? '' : String(data[key]);
  });
}

function parseHeaders(data = {}) {
  const raw = process.env.SMS_API_HEADERS || '';
  if (!raw.trim()) return {};
  try {
    return JSON.parse(renderTemplate(raw, data));
  } catch (err) {
    console.warn('[sms] SMS_API_HEADERS must be valid JSON:', err.message);
    return {};
  }
}

function selectedProvider() {
  const explicit = String(process.env.SMS_PROVIDER || '').toLowerCase().trim();
  if (explicit) return explicit;
  if (process.env.MSG91_AUTH_KEY) return 'msg91';
  if (process.env.FAST2SMS_API_KEY) return 'fast2sms';
  if (process.env.TEXTLOCAL_API_KEY) return 'textlocal';
  if (process.env.SMS_API_URL) return 'generic';
  if (process.env.TWILIO_ACCOUNT_SID) return 'twilio';
  return 'none';
}

function providerConfigured() {
  const provider = selectedProvider();
  if (provider === 'msg91') return Boolean(process.env.MSG91_AUTH_KEY);
  if (provider === 'fast2sms') return Boolean(process.env.FAST2SMS_API_KEY);
  if (provider === 'textlocal') return Boolean(process.env.TEXTLOCAL_API_KEY);
  if (provider === 'generic') return Boolean(process.env.SMS_API_URL);
  if (provider === 'twilio') {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }
  return Boolean(
    process.env.MSG91_AUTH_KEY ||
    process.env.FAST2SMS_API_KEY ||
    process.env.TEXTLOCAL_API_KEY ||
    process.env.SMS_API_URL ||
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM)
  );
}

export function smsProviderStatus() {
  return {
    configured: providerConfigured(),
    provider: selectedProvider(),
  };
}

async function sendViaMsg91(phone, { message, templateId, data = {} }) {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) return null;
  const mobile = digitsOnly(normalizePhone(phone)).replace(/^0+/, '');
  const template = templateId || process.env.MSG91_TEMPLATE_ID || process.env.SMS_OTP_TEMPLATE_ID || '';
  const sender = process.env.MSG91_SENDER || process.env.SMS_SENDER_ID || 'AYUDHV';
  const url = process.env.MSG91_OTP_URL || 'https://control.msg91.com/api/v5/otp';
  const body = {
    template_id: template,
    mobile,
    sender,
    otp: data.otp || '',
    otp_length: String(data.otp || '').length || 6,
    realTimeResponse: '1',
    message,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.warn('[sms] MSG91 send failed:', res.status, text.slice(0, 500));
    return { ok: false, provider: 'msg91', status: res.status, response: text };
  }
  return { ok: true, provider: 'msg91', status: res.status, response: text };
}

async function sendViaFast2Sms(phone, { message, data = {} }) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return null;
  const numbers = nationalNumber(phone);
  const route = process.env.FAST2SMS_ROUTE || 'otp';
  const params = new URLSearchParams({
    authorization: apiKey,
    route,
    numbers,
    flash: '0',
  });
  if (data.otp) params.set('variables_values', String(data.otp));
  else params.set('message', message);
  if (process.env.FAST2SMS_SENDER_ID) params.set('sender_id', process.env.FAST2SMS_SENDER_ID);
  const res = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
    method: 'GET',
    headers: { authorization: apiKey },
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.warn('[sms] Fast2SMS send failed:', res.status, text.slice(0, 500));
    return { ok: false, provider: 'fast2sms', status: res.status, response: text };
  }
  return { ok: true, provider: 'fast2sms', status: res.status, response: text };
}

async function sendViaTextlocal(phone, { message }) {
  const apiKey = process.env.TEXTLOCAL_API_KEY;
  if (!apiKey) return null;
  const sender = process.env.TEXTLOCAL_SENDER || process.env.SMS_SENDER_ID || 'AYUDHV';
  const params = new URLSearchParams({
    apikey: apiKey,
    numbers: nationalNumber(phone),
    sender,
    message,
  });
  const res = await fetch('https://api.textlocal.in/send/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.warn('[sms] Textlocal send failed:', res.status, text.slice(0, 500));
    return { ok: false, provider: 'textlocal', status: res.status, response: text };
  }
  return { ok: true, provider: 'textlocal', status: res.status, response: text };
}

async function sendViaGeneric(phone, { message, templateId, data = {} }) {
  const url = process.env.SMS_API_URL;
  if (!url) return null;
  const payload = {
    ...data,
    phone,
    mobile: phone,
    to: phone,
    message,
    templateId: templateId || process.env.SMS_TEMPLATE_ID || '',
    sender: process.env.SMS_SENDER_ID || process.env.SMS_FROM || '',
  };
  const renderedUrl = renderTemplate(url, payload);
  const method = String(process.env.SMS_API_METHOD || 'POST').toUpperCase();
  const bodyTemplate = process.env.SMS_API_BODY_TEMPLATE || JSON.stringify({
    to: '{{phone}}',
    message: '{{message}}',
    sender: '{{sender}}',
    templateId: '{{templateId}}',
  });
  const headers = {
    'Content-Type': process.env.SMS_API_CONTENT_TYPE || 'application/json',
    ...parseHeaders(payload),
  };
  const options = { method, headers };
  if (method !== 'GET') options.body = renderTemplate(bodyTemplate, payload);
  const res = await fetch(renderedUrl, options);
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.warn('[sms] Generic SMS send failed:', res.status, text.slice(0, 500));
    return { ok: false, provider: 'generic', status: res.status, response: text };
  }
  return { ok: true, provider: 'generic', status: res.status, response: text };
}

async function sendViaTwilio(phone, { message }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM) return null;
  try {
    const params = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM || '',
      Body: message,
    });
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('[sms] Twilio send failed:', text);
      return { ok: false, provider: 'twilio' };
    }
    return { ok: true, provider: 'twilio' };
  } catch (err) {
    console.warn('[sms] Failed:', err.message);
    return { ok: false, provider: 'twilio' };
  }
}

async function dispatch(phone, payload) {
  const provider = selectedProvider();
  if (provider === 'msg91') return sendViaMsg91(phone, payload);
  if (provider === 'fast2sms') return sendViaFast2Sms(phone, payload);
  if (provider === 'textlocal') return sendViaTextlocal(phone, payload);
  if (provider === 'generic') return sendViaGeneric(phone, payload);
  if (provider === 'twilio') return sendViaTwilio(phone, payload);
  return (
    (await sendViaMsg91(phone, payload)) ||
    (await sendViaFast2Sms(phone, payload)) ||
    (await sendViaTextlocal(phone, payload)) ||
    (await sendViaGeneric(phone, payload)) ||
    (await sendViaTwilio(phone, payload))
  );
}

export async function sendSMS(phone, { message, templateId, data } = {}) {
  if (!phone || !message) return { skipped: true, reason: 'missing_phone_or_message' };
  const normalizedPhone = normalizePhone(phone);
  const payload = { message, templateId, data };
  try {
    const result = await dispatch(normalizedPhone, payload);
    if (result) return result;
  } catch (err) {
    console.warn('[sms] Provider threw:', err.message);
    return { ok: false, provider: selectedProvider(), reason: err.message };
  }
  console.log('[sms] SMS provider not configured. Would send to', normalizedPhone, ':', message);
  return { skipped: true, provider: 'none', reason: 'not_configured' };
}
