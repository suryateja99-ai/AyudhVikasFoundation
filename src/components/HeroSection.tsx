import React from 'react';
import {
  UserPlus,
  Calendar,
  Crown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { ActiveModal } from '../types';

interface HeroSectionProps {
  onOpenModal: (modal: ActiveModal) => void;
  onBecomeMemberClick?: () => void;
}

const reasons = [
  'Wide Network of Hospitals & Specialists',
  '24x7 Call Centre & Emergency Support',
  'Easy Appointments & Follow-up',
  'Health Camps & Community Outreach',
  'Membership with Exclusive Benefits',
  'Care with Compassion & Integrity',
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenModal, onBecomeMemberClick }) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="absolute inset-y-0 right-0 hidden lg:block w-[58%]">
        <img
          src="/src/assets/images/indian_family_hero_1785560495834.jpg"
          alt="Happy Indian family at Ayudh Vikas healthcare network"
          className="h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-[48%] to-white/10" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_30%_35%,rgba(16,185,129,0.10),transparent_35%)]" />

      <div className="relative w-full px-4 sm:px-8 lg:px-14 py-10 lg:py-14 min-h-[500px] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
          <div className="lg:col-span-7 xl:col-span-6 space-y-5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-md text-xs font-black uppercase tracking-wide border border-emerald-400 shadow-xs">
              <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Care Beyond Boundaries - Telangana Healthcare Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-[#0f2e5a] uppercase leading-[0.98]">
              ONE CALL FOR <br />
              <span className="text-[#0870cf]">FINGERTIPS</span> SUPPORT
            </h1>

            <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed max-w-2xl">
              Connecting patients with 345+ trusted multi-specialty hospitals, 1,245+ verified specialist doctors,
              24/7 GPS-enabled emergency ambulances, diagnostic lab checkups, and free rural health camps across Telangana.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 pt-2 max-w-5xl">
              <button
                onClick={() => onOpenModal('register_patient')}
                className="bg-[#008a00] hover:bg-[#007000] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border border-emerald-800 text-left group cursor-pointer min-h-[58px]"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-white">Register as Patient</div>
                  <div className="text-[11px] font-medium text-emerald-100">Create Your Profile</div>
                </div>
              </button>

              <button
                onClick={() => onOpenModal('book_appointment')}
                className="bg-[#0052cc] hover:bg-[#003d99] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border border-blue-900 text-left group cursor-pointer min-h-[58px]"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-white">Book Appointment</div>
                  <div className="text-[11px] font-medium text-blue-100">Consult a Doctor</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (onBecomeMemberClick) {
                    onBecomeMemberClick();
                  } else {
                    onOpenModal('become_member');
                  }
                }}
                className="bg-[#d97706] hover:bg-[#b45309] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border border-amber-800 text-left group cursor-pointer min-h-[58px]"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-white">Become a Member</div>
                  <div className="text-[11px] font-medium text-amber-100">Enjoy Exclusive Benefits</div>
                </div>
              </button>

              <button
                onClick={() => onOpenModal('emergency_help')}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border border-red-900 text-left group cursor-pointer min-h-[58px]"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-white">Emergency Help</div>
                  <div className="text-[11px] font-medium text-red-100">Get Immediate Support</div>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs sm:text-sm font-black text-slate-800 border-t border-slate-200/80 max-w-4xl">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Trusted Network</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-800">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>24x7 Support</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <IndianRupee className="w-4 h-4 text-emerald-700" />
                <span>Affordable Care</span>
              </div>
              <div className="flex items-center gap-1.5 text-teal-800">
                <Heart className="w-4 h-4 text-teal-600" />
                <span>Always With You</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-6 relative flex flex-col justify-center min-h-[320px] lg:min-h-[420px]">
            <div className="relative lg:hidden rounded-lg overflow-hidden shadow-xl border-4 border-white bg-slate-900">
              <img
                src="/src/assets/images/indian_family_hero_1785560495834.jpg"
                alt="Happy Indian family at Ayudh Vikas healthcare network"
                className="w-full h-64 sm:h-80 object-cover object-top opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] via-[#0d1b2a]/45 to-transparent" />
            </div>

            <div className="lg:absolute lg:right-0 lg:bottom-0 mt-4 lg:mt-0 w-full max-w-xs text-white">
              <div className="bg-[#0b1329]/95 backdrop-blur-md p-4 rounded-lg border border-slate-700/80 shadow-2xl space-y-2">
                <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 border-b border-slate-700 pb-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Why Ayudh Vikas?
                </h3>
                <ul className="text-[11px] font-semibold space-y-1.5 text-slate-200">
                  {reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
