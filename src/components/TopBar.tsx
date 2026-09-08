import React from 'react';
import { Phone, MessageSquare, Mail, UserCheck, Key, UserPlus, User, LogOut, LayoutDashboard } from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';

interface TopBarProps {
  onOpenModal: (modal: ActiveModal) => void;
  onSignInClick?: () => void;
  isLoggedIn?: boolean;
  userProfile?: {
    name: string;
    displayName: string;
    patientId: string;
    image: string;
  };
  onLogout?: () => void;
  onNavigateDashboard?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onOpenModal, 
  onSignInClick,
  isLoggedIn = false,
  userProfile,
  onLogout,
  onNavigateDashboard
}) => {
  const { connected, postgres, mode } = useLiveData();
  return (
    <div className="bg-[#0f172a] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        {/* Left Side Contact Info */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">24x7 Patient Support</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <a href="tel:08704210820" className="font-bold text-white hover:underline">0870 4210820</a>
          </div>

          <div className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
            <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline">
              9000045073
            </a>
          </div>

          <div className="hidden md:flex items-center gap-1.5 hover:text-sky-400 transition-colors">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <a href="mailto:support@ayudhvikas.com" className="text-slate-300 hover:underline">
              support@ayudhvikas.com
            </a>
          </div>
        </div>

        {/* Right Side Auth Actions */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <span
            className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
              connected
                ? postgres
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-700 text-slate-300'
            }`}
            title={postgres ? 'Connected to PostgreSQL' : 'Local store active. Add DATABASE_URL to use PostgreSQL.'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? (postgres ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-slate-400'}`} />
            {connected ? (postgres ? 'Live DB' : `Live · ${mode}`) : 'Connecting'}
          </span>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateDashboard}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold cursor-pointer"
                title="Go to Patient Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-1.5 text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                  {userProfile?.image ? (
                    <img src={userProfile.image} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                </div>
                <span className="font-bold text-white">{userProfile?.displayName || userProfile?.name || 'Ramesh K.'}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">({userProfile?.patientId || 'AVP100245'})</span>
              </div>

              {onLogout && (
                <>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={() => {
                  if (onSignInClick) {
                    onSignInClick();
                  } else {
                    onOpenModal('patient_portal');
                  }
                }} 
                className="flex items-center gap-1 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign In</span>
              </button>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => onOpenModal('register_patient')} 
                className="flex items-center gap-1 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Register Now</span>
              </button>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => {
                  if (onSignInClick) {
                    onSignInClick();
                  } else {
                    onOpenModal('patient_portal');
                  }
                }} 
                className="flex items-center gap-1 hover:text-sky-400 transition-colors text-slate-400 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Forgot Password?</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
