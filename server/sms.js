export async function sendSMS(phone, { message } = {}) {
  if (!phone || !message) return { skipped: true };
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('[sms] Twilio not configured. Would send to', phone, ':', message);
    return { skipped: true };
  }
  try {
    const params = new URLSearchParams({
      To: String(phone).startsWith('+') ? String(phone) : `+91${phone}`,
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
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.warn('[sms] Failed:', err.message);
    return { ok: false };
  }
}
