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
  PhoneCall
} from 'lucide-react';
import { ActiveModal } from '../types';

interface HeroSectionProps {
  onOpenModal: (modal: ActiveModal) => void;
  onBecomeMemberClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenModal, onBecomeMemberClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden border-b border-slate-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column - Main Copy & Action Buttons (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-300 shadow-xs">
              <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>CARE BEYOND BOUNDARIES</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f2e5a] uppercase leading-tight tracking-tight">
              ONE CALL FOR <br />
              <span className="text-[#0275d8]">COMPLETE HEALTHCARE</span> SUPPORT
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed max-w-2xl">
              We connect you to the <strong className="text-emerald-700">Right Doctor</strong>, <strong className="text-blue-700">Right Hospital</strong>, <strong className="text-slate-900">Right Service</strong> at the Right Time.
            </p>

            {/* 4 Colored Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Button 1: REGISTER AS PATIENT (Green) */}
              <button
                onClick={() => onOpenModal('register_patient')}
                className="bg-[#008a00] hover:bg-[#007000] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg transition-all border border-emerald-800 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white">
                    REGISTER AS PATIENT
                  </div>
                  <div className="text-[11px] font-medium text-emerald-100">
                    Create Your Profile
                  </div>
                </div>
              </button>

              {/* Button 2: BOOK APPOINTMENT (Blue) */}
              <button
                onClick={() => onOpenModal('book_appointment')}
                className="bg-[#0052cc] hover:bg-[#003d99] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg transition-all border border-blue-900 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white">
                    BOOK APPOINTMENT
                  </div>
                  <div className="text-[11px] font-medium text-blue-100">
                    Consult a Doctor
                  </div>
                </div>
              </button>

              {/* Button 3: BECOME A MEMBER (Orange) */}
              <button
                onClick={() => {
                  if (onBecomeMemberClick) {
                    onBecomeMemberClick();
                  } else {
                    onOpenModal('become_member');
                  }
                }}
                className="bg-[#d97706] hover:bg-[#b45309] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg transition-all border border-amber-800 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white">
                    BECOME A MEMBER
                  </div>
                  <div className="text-[11px] font-medium text-amber-100">
                    Enjoy Exclusive Benefits
                  </div>
                </div>
              </button>

              {/* Button 4: EMERGENCY HELP (Red) */}
              <button
                onClick={() => onOpenModal('emergency_help')}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg transition-all border border-red-900 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white">
                    EMERGENCY HELP
                  </div>
                  <div className="text-[11px] font-medium text-red-100">
                    Get Immediate Support
                  </div>
                </div>
              </button>

            </div>

            {/* Features Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs font-bold text-slate-800 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
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
                <Heart className="w-4 h-4 text-teal-600 fill-teal-100" />
                <span>Always With You</span>
              </div>
            </div>

          </div>

          {/* Center/Right - Indian Family Image & "WHY AYUDH VIKAS?" Card Overlay (5 Cols) */}
          <div className="lg:col-span-5 relative flex flex-col justify-center">
            
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 group">
              <img
                src="/src/assets/images/indian_family_hero_1785560495834.jpg"
                alt="Happy Indian Family Healthcare"
                className="w-full h-64 sm:h-80 object-cover object-top opacity-90 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] via-[#0d1b2a]/60 to-transparent"></div>

              {/* Overlay Content Card */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <div className="bg-[#0b1329]/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl space-y-2">
                  <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 border-b border-slate-700 pb-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    WHY AYUDH VIKAS?
                  </h3>
                  <ul className="text-[11px] font-semibold space-y-1.5 text-slate-200">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>Wide Network of Hospitals & Specialists</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>24x7 Call Centre & Emergency Support</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>Easy Appointments & Follow-up</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>Health Camps & Community Outreach</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>Membership with Exclusive Benefits</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>Care with Compassion & Integrity</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </section>
  );
};
