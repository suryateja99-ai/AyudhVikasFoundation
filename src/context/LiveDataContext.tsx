import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuthOptional } from './AuthContext';

export type CollectionName =
  | 'hospitals'
  | 'doctors'
  | 'patients'
  | 'health_camps'
  | 'appointments'
  | 'ambulance_bookings'
  | 'lab_bookings'
  | 'home_care_bookings'
  | 'visit_requests'
  | 'camp_registrations'
  | 'leads'
  | 'partnerships'
  | 'callbacks'
  | 'emergencies'
  | 'memberships'
  | 'tickets'
  | 'feedback'
  | 'health_records'
  | 'reminders'
  | 'wallet_txns'
  | 'notifications'
  | 'insurance_applications'
  | 'prescriptions'
  | 'enquiries'
  | 'doctor_hospital_assignments'
  | 'hospital_beds'
  | 'doctor_verification_actions'
  | 'hospital_verification_actions';

type Collections = Record<CollectionName, any[]>;

const EMPTY: Collections = {
  hospitals: [],
  doctors: [],
  patients: [],
  health_camps: [],
  appointments: [],
  ambulance_bookings: [],
  lab_bookings: [],
  home_care_bookings: [],
  visit_requests: [],
  camp_registrations: [],
  leads: [],
  partnerships: [],
  callbacks: [],
  emergencies: [],
  memberships: [],
  tickets: [],
  feedback: [],
  health_records: [],
  reminders: [],
  wallet_txns: [],
  notifications: [],
  insurance_applications: [],
  prescriptions: [],
  enquiries: [],
  doctor_hospital_assignments: [],
  hospital_beds: [],
  doctor_verification_actions: [],
  hospital_verification_actions: [],
};

interface LiveDataValue {
  collections: Collections;
  stats: Record<string, number>;
  mode: string;
  mongodb: boolean;
  connected: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (collection: CollectionName, payload: any) => Promise<any>;
  update: (collection: CollectionName, id: string, payload: any) => Promise<any>;
  remove: (collection: CollectionName, id: string) => Promise<void>;
  applyChange: (collection: string, action: string, record: any) => void;
}

const LiveDataContext = createContext<LiveDataValue | null>(null);

function upsert(list: any[], record: any, action: string) {
  if (!record?.id) return list;
  if (action === 'delete' || action === 'deleted') return list.filter((item) => item.id !== record.id);
  const without = list.filter((item) => item.id !== record.id);
  return [record, ...without];
}

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthOptional();
  const token = auth?.token;
  const [collections, setCollections] = useState<Collections>(EMPTY);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [mode, setMode] = useState('connecting');
  const [mongodb, setMongodb] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<EventSource | null>(null);

  const applyChange = useCallback((collection: string, action: string, record: any) => {
    if (!(collection in EMPTY)) return;
    setCollections((prev) => ({
      ...prev,
      [collection]: upsert(prev[collection as CollectionName], record, action),
    }));
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const boot = await api.bootstrap();
      setMode(boot.mode);
      setMongodb(boot.mongodb);
      setStats(boot.stats || {});
      const entries = await Promise.all(
        (Object.keys(EMPTY) as CollectionName[]).map(async (name) => {
          if (name === 'hospitals') return [name, boot.hospitals] as const;
          if (name === 'doctors') return [name, boot.doctors] as const;
          if (name === 'health_camps') return [name, boot.health_camps] as const;
          try {
            const res = await api.list(name);
            return [name, res.items || []] as const;
          } catch {
            return [name, EMPTY[name]] as const;
          }
        })
      );
      const next = { ...EMPTY };
      entries.forEach(([name, items]) => {
        next[name] = [...(items || [])];
      });
      setCollections(next);
    } catch (err: any) {
      console.warn('Failed to load live data', err);
      setError(err?.message || 'Failed to load live data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, token]);

  useEffect(() => {
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      const source = new EventSource('/api/stream');
      streamRef.current = source;
      source.onopen = () => setConnected(true);
      source.onerror = () => {
        setConnected(false);
        source.close();
        if (!closed) retry = setTimeout(connect, 2500);
      };
      source.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.collection === '_hello') {
            if (event.record?.mode) setMode(event.record.mode);
            setConnected(true);
            return;
          }
          const action = event.action || (event.event === 'record_created' ? 'create' : event.event === 'record_deleted' ? 'delete' : 'update');
          const record = event.record || event.data || { id: event.id };
          applyChange(event.collection, action, record);
        } catch (err) {
          console.warn('Bad live event', err);
        }
      };
    };

    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      streamRef.current?.close();
    };
  }, [applyChange]);

  const create = useCallback(async (collection: CollectionName, payload: any) => {
    const res = await api.create(collection, payload);
    applyChange(collection, 'create', res.item);
    return res.item;
  }, [applyChange]);

  const update = useCallback(async (collection: CollectionName, id: string, payload: any) => {
    const res = await api.update(collection, id, payload);
    applyChange(collection, 'update', res.item);
    return res.item;
  }, [applyChange]);

  const remove = useCallback(async (collection: CollectionName, id: string) => {
    await api.remove(collection, id);
    applyChange(collection, 'delete', { id });
  }, [applyChange]);

  const value = useMemo<LiveDataValue>(
    () => ({
      collections,
      stats,
      mode,
      mongodb,
      connected,
      loading,
      error,
      refresh,
      create,
      update,
      remove,
      applyChange,
    }),
    [collections, stats, mode, mongodb, connected, loading, error, refresh, create, update, remove, applyChange]
  );

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
};

export function useLiveData() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error('useLiveData must be used within LiveDataProvider');
  return ctx;
}

export function useCollection<T = any>(name: CollectionName): T[] {
  const { collections } = useLiveData();
  return (collections[name] || []) as T[];
}
