import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../lib/api';
import { roleHome } from '../lib/roleRoutes';

export type UserRole =
  | 'patient'
  | 'doctor'
  | 'hospital'
  | 'marketing'
  | 'admin'
  | 'volunteer'
  | 'social_organizer'
  | 'ambulance'
  | 'lab';

export interface AuthUser {
  id: string;
  role: UserRole;
  roles?: UserRole[];
  primaryRole?: UserRole;
  name: string;
  email?: string;
  phone?: string;
  displayName?: string;
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
  image?: string;
  isGuest?: boolean;
  emailVerified?: boolean;
  [key: string]: any;
}

const GUEST_USER: AuthUser = {
  id: 'guest-user',
  role: 'patient',
  roles: ['patient'],
  primaryRole: 'patient',
  name: 'Guest Visitor',
  displayName: 'Guest',
  patientId: 'GUEST',
  isGuest: true,
  image: '/src/assets/images/patient_avatar_1787229395408.jpg',
  phone: '',
  email: '',
};

const GUEST_FLAG = 'ayudh_guest';
const PRIMARY_ROLE_KEY = 'ayudh_primaryRole';

function normalizeUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;
  const roles = (user.roles && user.roles.length ? user.roles : [user.primaryRole || user.role]) as UserRole[];
  const stored = typeof window !== 'undefined' ? (localStorage.getItem(PRIMARY_ROLE_KEY) as UserRole | null) : null;
  const primaryRole = (stored && roles.includes(stored) ? stored : user.primaryRole || user.role || roles[0]) as UserRole;
  return { ...user, roles, primaryRole, role: primaryRole };
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  isGuest: boolean;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  loginAsGuest: () => AuthUser;
  register: (payload: any) => Promise<{ user: AuthUser; patientId?: string; referenceNo?: string }>;
  logout: () => void;
  updateProfile: (payload: any) => Promise<AuthUser | null>;
  switchRole: (role: UserRole) => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState<boolean>(!!getToken());

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const existing = getToken();
      if (!existing) {
        if (localStorage.getItem(GUEST_FLAG) === '1') {
          if (!cancelled) setUser(GUEST_USER);
        }
        setLoading(false);
        return;
      }
      try {
        const res = await api.me();
        if (!cancelled) setUser(normalizeUser(res.user));
      } catch {
        if (!cancelled) {
          setToken(null);
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await api.login(identifier, password);
    localStorage.removeItem(GUEST_FLAG);
    setToken(res.token);
    setTokenState(res.token);
    const next = normalizeUser(res.user) as AuthUser;
    setUser(next);
    navigate(roleHome(next.primaryRole || next.role), { replace: true });
    return next;
  }, [navigate]);

  const loginAsGuest = useCallback(() => {
    setToken(null);
    setTokenState(null);
    localStorage.setItem(GUEST_FLAG, '1');
    setUser(GUEST_USER);
    navigate('/patient/dashboard', { replace: true });
    return GUEST_USER;
  }, [navigate]);

  const register = useCallback(async (payload: any) => {
    const res = await api.register(payload);
    localStorage.removeItem(GUEST_FLAG);
    setToken(res.token);
    setTokenState(res.token);
    const next = normalizeUser(res.user) as AuthUser;
    setUser(next);
    navigate(roleHome(next.primaryRole || next.role), { replace: true });
    return { user: next, patientId: res.patientId, referenceNo: res.referenceNo };
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(GUEST_FLAG);
    localStorage.removeItem(PRIMARY_ROLE_KEY);
    setToken(null);
    setTokenState(null);
    setUser(null);
    navigate('/', { replace: true });
  }, [navigate]);

  const updateProfile = useCallback(async (payload: any) => {
    const res = await api.updateMe(payload);
    if (res.token) {
      setToken(res.token);
      setTokenState(res.token);
    }
    const next = normalizeUser(res.user);
    setUser(next);
    return next;
  }, []);

  const switchRole = useCallback(async (newRole: UserRole) => {
    localStorage.setItem(PRIMARY_ROLE_KEY, newRole);
    setUser((prev) => (prev ? { ...prev, primaryRole: newRole, role: newRole } : null));
    try {
      const res = await api.updateMe({ primaryRole: newRole, role: newRole });
      if (res.token) {
        setToken(res.token);
        setTokenState(res.token);
      }
      const next = normalizeUser(res.user);
      setUser(next);
      return next;
    } catch {
      return user;
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isLoggedIn: !!user,
      isGuest: !!user?.isGuest,
      login,
      loginAsGuest,
      register,
      logout,
      updateProfile,
      switchRole,
    }),
    [user, token, loading, login, loginAsGuest, register, logout, updateProfile, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
