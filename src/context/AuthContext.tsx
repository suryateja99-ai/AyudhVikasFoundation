import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

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
  name: string;
  email?: string;
  phone?: string;
  displayName?: string;
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
  image?: string;
  isGuest?: boolean;
  [key: string]: any;
}

const GUEST_USER: AuthUser = {
  id: 'guest-user',
  role: 'patient',
  name: 'Guest Visitor',
  displayName: 'Guest',
  patientId: 'GUEST',
  isGuest: true,
  image: '/src/assets/images/patient_avatar_1787229395408.jpg',
  phone: '',
  email: '',
};

const GUEST_FLAG = 'ayudh_guest';

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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        if (!cancelled) setUser(res.user);
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
    setUser(res.user);
    return res.user as AuthUser;
  }, []);

  const loginAsGuest = useCallback(() => {
    setToken(null);
    setTokenState(null);
    localStorage.setItem(GUEST_FLAG, '1');
    setUser(GUEST_USER);
    return GUEST_USER;
  }, []);

  const register = useCallback(async (payload: any) => {
    const res = await api.register(payload);
    localStorage.removeItem(GUEST_FLAG);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return { user: res.user as AuthUser, patientId: res.patientId, referenceNo: res.referenceNo };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(GUEST_FLAG);
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: any) => {
    const res = await api.updateMe(payload);
    setUser(res.user);
    return res.user as AuthUser;
  }, []);

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
    }),
    [user, token, loading, login, loginAsGuest, register, logout, updateProfile]
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
