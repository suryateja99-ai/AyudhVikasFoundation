import { beginApiActivity, endApiActivity } from './apiActivity';

const TOKEN_KEY = 'ayudh_token';
const API_BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}
let accessToken: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
})();
let refreshPromise: Promise<any> | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string | null) {
  accessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

function activityLabel(path: string, method = 'GET') {
  const verb = method.toUpperCase();
  if (path.includes('/auth/login')) return 'Signing in';
  if (path.includes('/auth/register')) return 'Registering';
  if (path.includes('/accept')) return 'Accepting request';
  if (path.includes('/reject')) return 'Updating request';
  if (path.includes('/approve')) return 'Approving';
  if (verb === 'POST') return 'Saving';
  if (verb === 'PATCH') return 'Updating';
  if (verb === 'DELETE') return 'Removing';
  if (path.includes('/bootstrap') || path.includes('/records/')) return 'Loading data';
  return 'Loading';
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function doRefreshAccessToken() {
  const res = await fetch(apiUrl('/api/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || 'Unexpected response' };
  }
  if (!res.ok) {
    setToken(null);
    throw new Error(data.error || 'Session expired');
  }
  setToken(data.token || null);
  return data;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const method = String(options.method || 'GET').toUpperCase();
  beginApiActivity(activityLabel(path, method));
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(apiUrl(path), { ...options, headers, credentials: 'include' });
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Unexpected response' };
    }
    if (!res.ok) {
      if (res.status === 401 && retry && !path.includes('/auth/login') && !path.includes('/auth/register') && !path.includes('/auth/refresh')) {
        await refreshAccessToken();
        return request<T>(path, options, false);
      }
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data as T;
  } finally {
    endApiActivity();
  }
}

export const api = {
  health: () => request<{ ok: boolean; mode: string; mongodb: boolean; counts: Record<string, number> }>('/api/health'),
  bootstrap: () =>
    request<{
      mode: string;
      mongodb: boolean;
      hospitals: any[];
      doctors: any[];
      health_camps: any[];
      stats: Record<string, number>;
    }>('/api/bootstrap'),
  login: (identifier: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  refresh: () => refreshAccessToken() as Promise<{ token: string; user: any }>,
  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    }, false),
  register: (payload: any) =>
    request<{ token: string; user: any; patientId?: string; referenceNo?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: any; token?: string }>('/api/auth/me'),
  updateMe: (payload: any) =>
    request<{ user: any; token?: string }>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  users: () => request<{ items: any[] }>('/api/users'),
  createUser: (payload: any) =>
    request<{ item: any }>('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id: string, payload: any) =>
    request<{ item: any }>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  removeUser: (id: string) =>
    request<{ ok: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
  list: <T = any>(collection: string, filter: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    const q = params.toString();
    return request<{ items: T[] }>(`/api/records/${collection}${q ? `?${q}` : ''}`);
  },
  get: <T = any>(collection: string, id: string) =>
    request<{ item: T }>(`/api/records/${collection}/${id}`),
  create: <T = any>(collection: string, payload: any) =>
    request<{ item: T }>(`/api/records/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: <T = any>(collection: string, id: string, payload: any) =>
    request<{ item: T }>(`/api/records/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (collection: string, id: string) =>
    request<{ ok: boolean }>(`/api/records/${collection}/${id}`, { method: 'DELETE' }),
  lookupPatient: (q: string) => request<{ item: any }>(`/api/patients/lookup?q=${encodeURIComponent(q)}`),
  authorizedPatients: () => request<{ items: any[]; sessions: any[] }>('/api/authorized-patients'),
  verifyPatientSession: (payload: any) =>
    request<{ item: any; existing?: boolean }>('/api/authorized-patients/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  patientSessions: (patientId: string) =>
    request<{ items: any[] }>(`/api/patients/${encodeURIComponent(patientId)}/sessions`),
  session: (sessionId: string) =>
    request<{ item: any; reports: any[]; prescriptions: any[]; reminders: any[] }>(`/api/sessions/${encodeURIComponent(sessionId)}`),
  sessionHistory: () =>
    request<{ items: any[] }>('/api/sessions/history'),
  createSessionReport: (sessionId: string, payload: any) =>
    request<{ item: any }>(`/api/sessions/${encodeURIComponent(sessionId)}/reports`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createSessionPrescription: (sessionId: string, payload: any) =>
    request<{ item: any; reminders: any[] }>(`/api/sessions/${encodeURIComponent(sessionId)}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createSessionReminder: (sessionId: string, payload: any) =>
    request<{ item: any }>(`/api/sessions/${encodeURIComponent(sessionId)}/reminders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateReminder: (reminderId: string, payload: any) =>
    request<{ item: any }>(`/api/reminders/${encodeURIComponent(reminderId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  finishSession: (sessionId: string) =>
    request<{ item: any }>(`/api/sessions/${encodeURIComponent(sessionId)}/finish`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  patientMedicalFeed: () =>
    request<{ reports: any[]; prescriptions: any[]; reminders: any[]; sessions: any[] }>('/api/patient/medical-feed'),
  labSummary: () =>
    request<{ lab: any; stats: any; requests: any[]; active: any[]; history: any[] }>('/api/lab/dashboard'),
  labRequests: () => request<{ items: any[] }>('/api/lab/requests'),
  acceptLabBooking: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/lab/bookings/${encodeURIComponent(id)}/accept`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  rejectLabBooking: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/lab/bookings/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  verifyLabPatient: (id: string, payload: any) =>
    request<{ item: any }>(`/api/lab/bookings/${encodeURIComponent(id)}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  createLabReport: (id: string, payload: any) =>
    request<{ item: any; booking: any }>(`/api/lab/bookings/${encodeURIComponent(id)}/report`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  closeLabSession: (id: string) =>
    request<{ item: any; reports: any[] }>(`/api/lab/bookings/${encodeURIComponent(id)}/close`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  ambulanceDrivers: () => request<{ items: any[] }>('/api/ambulance/drivers'),
  ambulanceSummary: () =>
    request<{ driver: any; stats: any; predictions: any; requests: any[]; active: any[]; upcoming: any[]; accepted: any[]; history: any[] }>('/api/ambulance/dashboard'),
  acceptAmbulanceBooking: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/ambulance/bookings/${encodeURIComponent(id)}/accept`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  rejectAmbulanceBooking: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/ambulance/bookings/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  startAmbulanceRide: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/ambulance/bookings/${encodeURIComponent(id)}/start`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  completeAmbulanceRide: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/ambulance/bookings/${encodeURIComponent(id)}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateAmbulanceProfile: (payload: any) =>
    request<{ item: any }>('/api/ambulance/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  fund360Account: () =>
    request<{
      account: any;
      profile: any;
      participation: any;
      participations: any[];
      transactions: any[];
      monthlyPayments: any[];
      milestones: any[];
      benefits: any[];
      serviceParticipations: any[];
      celebrationPreferences: any[];
      eligibilityRecords: any[];
      summary: any;
    }>('/api/fund360/account'),
  startFund360Participation: (payload: any) =>
    request<{ account: any; participation: any; transaction?: any; service?: any }>('/api/fund360/participation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyFund360Transaction: (id: string, payload: any) =>
    request<{ account: any; participation: any; transaction: any }>(`/api/fund360/transactions/${encodeURIComponent(id)}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminFund360: () =>
    request<{ items: any[] }>('/api/admin/fund360'),
  updateAdminFund360: (collection: string, id: string, payload: any) =>
    request<{ item: any }>(`/api/admin/fund360/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  searchHospitals: (filter: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    const q = params.toString();
    return request<{ items: any[]; total: number }>(`/api/search/hospitals${q ? `?${q}` : ''}`);
  },
  searchDoctors: (filter: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    const q = params.toString();
    return request<{ items: any[]; total: number }>(`/api/search/doctors${q ? `?${q}` : ''}`);
  },
  verifyEmail: (token: string) =>
    request<{ ok: boolean; message?: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  notifications: () => request<{ items: any[] }>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ item: any }>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  deleteNotification: (id: string) =>
    request<{ ok: boolean }>(`/api/notifications/${id}`, { method: 'DELETE' }),
  pendingDoctorVerifications: () => request<{ items: any[] }>('/api/admin/verifications/doctors'),
  pendingHospitalVerifications: () => request<{ items: any[] }>('/api/admin/verifications/hospitals'),
  approveDoctor: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/doctors/${id}/approve`, { method: 'PATCH', body: JSON.stringify(payload) }),
  rejectDoctor: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/doctors/${id}/reject`, { method: 'PATCH', body: JSON.stringify(payload) }),
  approveHospital: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/hospitals/${id}/approve`, { method: 'PATCH', body: JSON.stringify(payload) }),
  rejectHospital: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/hospitals/${id}/reject`, { method: 'PATCH', body: JSON.stringify(payload) }),
  acceptVisitRequest: (id: string, payload: any = {}) =>
    request<{ item: any; appointment?: any }>(`/api/visit-requests/${id}/accept`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  rejectVisitRequest: (id: string, payload: any = {}) =>
    request<{ item: any }>(`/api/visit-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  checkInAppointment: (id: string) =>
    request<{ item: any }>(`/api/records/appointments/${id}/check-in`, { method: 'PATCH' }),
  dischargeAppointment: (id: string) =>
    request<{ item: any }>(`/api/records/appointments/${id}/discharge`, { method: 'PATCH' }),
  bedStatus: (hospitalId: string) =>
    request<{ occupancy: any; items: any[] }>(`/api/hospitals/${hospitalId}/beds/status`),
  createDoctorAssignment: (payload: any) =>
    request<{ item: any }>('/api/doctor-assignments', { method: 'POST', body: JSON.stringify(payload) }),
  acceptAssignment: (id: string) =>
    request<{ item: any }>(`/api/doctor-assignments/${id}/accept`, { method: 'PATCH' }),
  rejectAssignment: (id: string) =>
    request<{ item: any }>(`/api/doctor-assignments/${id}/reject`, { method: 'PATCH' }),
};
