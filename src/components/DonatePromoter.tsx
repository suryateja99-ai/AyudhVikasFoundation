import React, { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActiveModal } from '../types';

interface DonatePromoterProps {
  activeModal?: ActiveModal;
}

const lines = [
  'A small donation can keep one family close to care.',
  'Your help can become food, medicine, education, or a hospital visit.',
  'Stand with a patient today. Even Rs. 100 can move care forward.',
  'Care beyond boundaries begins with one kind choice.',
];

const POPUP_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const POPUP_LAST_SEEN_KEY = 'ayudh_donate_popup_last_seen';

function hashPath(pathname: string) {
  return pathname.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function canShowGlobalPopup() {
  try {
    const lastSeen = Number(localStorage.getItem(POPUP_LAST_SEEN_KEY) || '0');
    return !lastSeen || Date.now() - lastSeen > POPUP_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markGlobalPopupSeen() {
  try {
    localStorage.setItem(POPUP_LAST_SEEN_KEY, String(Date.now()));
  } catch {
    // Non-critical: private browsing or storage restrictions should not break the app.
  }
}

export const DonatePromoter: React.FC<DonatePromoterProps> = ({ activeModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [closed, setClosed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const disabled = useMemo(() => {
    return (
      location.pathname === '/donate' ||
      location.pathname === '/register' ||
      String(activeModal || '').startsWith('register')
    );
  }, [activeModal, location.pathname]);

  const seed = hashPath(location.pathname || '/');
  const line = lines[seed % lines.length];
  const variant = location.pathname === '/login' ? 'login' : seed % 6 === 0 ? 'banner' : seed % 7 === 0 ? 'rail' : 'quiet';
  const popupEligible = !disabled && location.pathname !== '/' && location.pathname !== '/login' && seed % 11 === 0;
  const isDashboardPath = /^\/(dashboard|patient|doctor|hospital|lab|ambulance|marketing|admin|community|fund360)(\/|$)/.test(location.pathname);

  useEffect(() => {
    setClosed(false);
    setShowPopup(false);
    if (!popupEligible) return;
    if (!canShowGlobalPopup()) return;
    const timer = window.setTimeout(() => {
      markGlobalPopupSeen();
      setShowPopup(true);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [location.pathname, popupEligible]);

  if (disabled || closed) return null;

  const openDonate = () => {
    const from = `${location.pathname}${location.search}${location.hash}`;
    try {
      sessionStorage.setItem('ayudh_donate_from', from);
    } catch {
      /* ignore storage restrictions */
    }
    navigate('/donate', { state: { from } });
  };

  return (
    <>
      {variant === 'banner' && (
        <div className="fixed left-3 right-3 bottom-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-40 max-w-3xl rounded-lg bg-[#0d2547] text-white shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-3 animate-[fadeIn_.35s_ease-out]">
          <HeartHandshake className="w-5 h-5 text-emerald-300 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black truncate">Donate hope today</div>
            <div className="text-xs font-semibold text-slate-200 truncate">{line}</div>
          </div>
          <button onClick={openDonate} className="h-9 px-4 rounded-md bg-emerald-600 text-white text-xs font-black">Donate</button>
          <button onClick={() => setClosed(true)} className="p-1 rounded hover:bg-white/10" aria-label="Close donation message">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {variant === 'login' && (
        <div className="fixed z-40 right-4 top-24 w-[min(310px,calc(100vw-32px))] rounded-lg bg-white border border-emerald-200 shadow-2xl p-4 animate-[slideIn_.35s_ease-out]">
          <button onClick={() => setClosed(true)} className="absolute right-2 top-2 p-1 rounded hover:bg-slate-100" aria-label="Close donation message">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex items-start gap-3 pr-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-950">One kindness can change a day.</div>
              <p className="text-xs font-semibold text-slate-600 mt-1">{line}</p>
            </div>
          </div>
          <button onClick={openDonate} className="mt-3 w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black">
            Donate Now
          </button>
        </div>
      )}

      {variant === 'rail' && (
        <button
          onClick={openDonate}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 rounded-l-lg bg-orange-500 hover:bg-orange-600 text-white shadow-xl px-3 py-4 text-xs font-black [writing-mode:vertical-rl] tracking-wide"
        >
          Donate Hope
        </button>
      )}

      {variant === 'quiet' && (
        <button
          onClick={openDonate}
          className={`fixed bottom-5 z-40 rounded-full bg-white border border-emerald-200 shadow-xl px-4 py-3 text-emerald-800 text-xs font-black flex items-center gap-2 hover:bg-emerald-50 ${
            isDashboardPath ? 'right-4' : 'left-4'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Donate
        </button>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-[fadeIn_.25s_ease-out]">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-emerald-100 p-5 relative">
            <button onClick={() => setShowPopup(false)} className="absolute right-3 top-3 p-1 rounded hover:bg-slate-100" aria-label="Close donation popup">
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-950">Before you continue, help one more person reach care.</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">{line}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={openDonate} className="flex-1 h-11 rounded-lg bg-emerald-700 text-white text-sm font-black">Donate Now</button>
              <button onClick={() => setShowPopup(false)} className="h-11 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-black">Later</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
