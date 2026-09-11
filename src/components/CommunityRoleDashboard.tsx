import React from 'react';
import { LogOut, Tent, Users, MapPin, CheckCircle2, Handshake } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { UPCOMING_CAMPS } from '../data/mockData';

interface CommunityRoleDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const CommunityRoleDashboard: React.FC<CommunityRoleDashboardProps> = ({
  onLogout,
  onNavigateHome
}) => {
  const { user } = useAuth();
  const isVolunteer = user?.role === 'volunteer';
  const title = isVolunteer ? 'Volunteer Desk' : 'Social Organizer Desk';

  return (
    <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onNavigateHome} className="flex items-center gap-2 cursor-pointer">
            <BrandLogo className="w-10 h-10" />
            <div className="text-left">
              <div className="text-sm font-black text-[#0f2e5a] uppercase">Ayudh Vikas</div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase">{title}</div>
            </div>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-700 border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-gradient-to-r from-[#0a2540] to-[#00703c] text-white rounded-2xl p-5">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Welcome</div>
          <h1 className="text-2xl font-black">{user?.name}</h1>
          <p className="text-sm text-slate-200 mt-1">
            {isVolunteer
              ? 'Support health camps, patient guidance and awareness drives across Telangana.'
              : 'Mobilise your community for screening camps, membership and hospital referrals.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <Handshake className="w-5 h-5 text-emerald-600 mb-2" />
            <div className="text-xs font-black uppercase text-[#0f2e5a]">Role</div>
            <div className="text-sm font-bold text-slate-700 mt-1">{isVolunteer ? 'Volunteer' : 'Social Organizer'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <MapPin className="w-5 h-5 text-sky-600 mb-2" />
            <div className="text-xs font-black uppercase text-[#0f2e5a]">Coverage</div>
            <div className="text-sm font-bold text-slate-700 mt-1">{user?.district || user?.coverageArea || 'Telangana Network'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <Users className="w-5 h-5 text-amber-600 mb-2" />
            <div className="text-xs font-black uppercase text-[#0f2e5a]">Status</div>
            <div className="text-sm font-bold text-emerald-700 mt-1">Active</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-xs font-black uppercase text-[#0f2e5a] flex items-center gap-1.5 mb-3">
            <Tent className="w-4 h-4 text-emerald-600" />
            Upcoming Camps To Support
          </h2>
          <div className="space-y-2">
            {UPCOMING_CAMPS.slice(0, 5).map((camp) => (
              <div key={camp.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                <div>
                  <div className="text-xs font-black text-slate-800">{camp.title}</div>
                  <div className="text-[11px] text-slate-500">{camp.location} · {camp.date}</div>
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Assigned
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
