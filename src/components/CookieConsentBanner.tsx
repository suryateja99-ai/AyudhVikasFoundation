import React, { useEffect, useState } from 'react';
import { Bell, Cookie } from 'lucide-react';
import { enableWebPush, getCookieConsent, setCookieConsent, syncPushSubscription } from '../lib/push';
import { useAuth } from '../context/AuthContext';

export const CookieConsentBanner: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getCookieConsent());
  }, []);

  useEffect(() => {
    if (getCookieConsent() === 'accepted') {
      void syncPushSubscription();
    }
  }, [isLoggedIn]);

  const acceptAll = async () => {
    setCookieConsent('accepted');
    setVisible(false);
    await enableWebPush();
  };

  const necessaryOnly = () => {
    setCookieConsent('necessary');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-700">
          <Cookie className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-slate-900">Cookies & device notifications</h3>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-600">
            Accept cookies to keep you signed in and to send appointment, health camp, report, and admin updates to this device.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void acceptAll()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#152e4d] px-3.5 py-2 text-xs font-black text-white"
            >
              <Bell className="h-3.5 w-3.5" />
              Accept & enable notifications
            </button>
            <button
              type="button"
              onClick={necessaryOnly}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-black text-slate-700"
            >
              Necessary cookies only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
