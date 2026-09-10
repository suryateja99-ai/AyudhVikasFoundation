import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { api } from '../lib/api';

export const NotificationBell: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'dark' }) => {
  const { user, isLoggedIn } = useAuth();
  const { collections, applyChange } = useLiveData();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isLoggedIn || user?.isGuest) return null;

  const notifications = (collections.notifications || []).filter((n: any) => n.userId === user?.id);
  const unreadNotifications = notifications.filter((n: any) => !n.read);

  const markRead = async (id: string) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.item) applyChange('notifications', 'update', res.item);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-1.5 rounded-md cursor-pointer ${variant === 'dark' ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unreadNotifications.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 shadow-lg rounded-lg p-3 max-h-96 overflow-y-auto z-50 border border-slate-200">
          <div className="text-[11px] font-black uppercase text-slate-500 mb-2">Notifications</div>
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((n: any) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-md cursor-pointer"
              >
                <div className="text-xs font-black text-slate-900">{n.title}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{n.message}</div>
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-xs font-semibold px-2 py-3">No new notifications</p>
          )}
        </div>
      )}
    </div>
  );
};
