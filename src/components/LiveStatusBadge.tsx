import React from 'react';
import { useLiveData } from '../context/LiveDataContext';

export const LiveStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { connected, loading } = useLiveData();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
        connected
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-slate-500 border border-slate-200'
      } ${className}`}
      title={connected ? 'Live updates are on' : 'Connecting'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-400 animate-pulse'}`} />
      {loading ? 'Live' : connected ? 'Live' : 'Connecting'}
    </span>
  );
};
