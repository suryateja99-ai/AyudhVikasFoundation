import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';

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
  | 'enquiries';

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
};

interface LiveDataValue {
  collections: Collections;
  stats: Record<string, number>;
  mode: string;
  mongodb: boolean;
  connected: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  create: (collection: CollectionName, payload: any) => Promise<any>;
  update: (collection: CollectionName, id: string, payload: any) => Promise<any>;
  remove: (collection: CollectionName, id: string) => Promise<void>;
}

const LiveDataContext = createContext<LiveDataValue | null>(null);

function upsert(list: any[], record: any, action: string) {
  if (!record?.id) return list;
  if (action === 'delete') return list.filter((item) => item.id !== record.id);
  const without = list.filter((item) => item.id !== record.id);
  return [record, ...without];
}

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collections>(EMPTY);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [mode, setMode] = useState('connecting');
  const [mongodb, setMongodb] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
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
      const boot = await api.bootstrap();
      setMode(boot.mode);
      setMongodb(boot.mongodb);
      setStats(boot.stats || {});
      const entries = await Promise.all(
        (Object.keys(EMPTY) as CollectionName[]).map(async (name) => {
          if (name === 'hospitals') return [name, boot.hospitals] as const;
          if (name === 'doctors') return [name, boot.doctors] as const;
          if (name === 'health_camps') return [name, boot.health_camps] as const;
          const res = await api.list(name);
          return [name, res.items] as const;
        })
      );
      const next = { ...EMPTY };
      entries.forEach(([name, items]) => {
        next[name] = items || [];
      });
      setCollections(next);
    } catch (err) {
      console.warn('Failed to load live data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const source = new EventSource('/api/stream');
    streamRef.current = source;
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data);
        if (event.collection === '_hello') {
          if (event.record?.mode) setMode(event.record.mode);
          setConnected(true);
          return;
        }
        applyChange(event.collection, event.action, event.record);
      } catch (err) {
        console.warn('Bad live event', err);
      }
    };
    return () => {
      source.close();
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
      refresh,
      create,
      update,
      remove,
    }),
    [collections, stats, mode, mongodb, connected, loading, refresh, create, update, remove]
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
