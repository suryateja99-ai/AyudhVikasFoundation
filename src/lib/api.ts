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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

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
    request<{ user: any }>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),
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
};
