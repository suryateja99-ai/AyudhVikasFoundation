import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { subscribeApiActivity } from '../lib/apiActivity';

export const GlobalApiSpinner: React.FC = () => {
  const [pending, setPending] = useState(0);
  const [label, setLabel] = useState('Loading');

  useEffect(() => {
    return subscribeApiActivity((count, nextLabel) => {
      setPending(count);
      if (nextLabel) setLabel(nextLabel);
    });
  }, []);

  if (pending <= 0) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[80] h-0.5 bg-emerald-100 overflow-hidden">
        <div className="h-full w-1/3 bg-emerald-600 animate-[api-slide_1s_linear_infinite]" />
      </div>
      <div className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 rounded-full bg-[#0f2e5a] text-white px-3 py-1.5 shadow-lg text-[11px] font-black">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
        <span>{label}{pending > 1 ? ` (${pending})` : ''}</span>
      </div>
    </>
  );
};
