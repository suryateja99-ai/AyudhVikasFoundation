import { beginApiActivity, endApiActivity } from './apiActivity';

const TOKEN_KEY = 'ayudh_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = String(options.method || 'GET').toUpperCase();
  beginApiActivity(activityLabel(path, method));
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(path, { ...options, headers });
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Unexpected response' };
    }
    if (!res.ok) {
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
  register: (payload: any) =>
    request<{ token: string; user: any; patientId?: string; referenceNo?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: any }>('/api/auth/me'),
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
