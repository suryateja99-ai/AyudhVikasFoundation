import React, { useState } from 'react';
import { 
  Tent, 
  MapPin, 
  Users, 
  UserCheck, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  FileText,
  Bell
} from 'lucide-react';
import { UPCOMING_CAMPS, PARTNER_HOSPITALS } from '../data/mockData';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';

interface WidgetsSectionProps {
  onOpenModal: (modal: ActiveModal) => void;
  onSelectCamp?: (campTitle: string) => void;
  onSignInClick?: () => void;
  onBecomePartnerClick?: () => void;
}

export const WidgetsSection: React.FC<WidgetsSectionProps> = ({ onOpenModal, onSelectCamp, onSignInClick, onBecomePartnerClick }) => {
  const { collections } = useLiveData();
  const camps = collections.health_camps.length ? collections.health_camps : UPCOMING_CAMPS;
  const hospitals = collections.hospitals.length ? collections.hospitals : PARTNER_HOSPITALS;
  const [currentHospitalIdx, setCurrentHospitalIdx] = useState(0);

  const prevHospital = () => {
    setCurrentHospitalIdx((prev) => (prev === 0 ? hospitals.length - 1 : prev - 1));
  };

  const nextHospital = () => {
    setCurrentHospitalIdx((prev) => (prev === hospitals.length - 1 ? 0 : prev + 1));
  };

  const districts = [
    'Hanamkonda',
    'Warangal',
    'Mulugu',
    'Bhupalpally',
    'Mahabubabad',
    'Jangaon'
  ];

  return (
    <section className="py-8 px-4 sm:px-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Widget 1: UPCOMING HEALTH CAMPS */}
          <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-200/80 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-3">
                <h3 className="text-xs font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
                  <Tent className="w-4 h-4 text-emerald-600" />
                  UPCOMING HEALTH CAMPS
                </h3>
                <button 
                  onClick={() => onOpenModal('health_camps')} 
                  className="text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {camps.slice(0, 3).map((camp: any) => (
                  <div key={camp.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:border-emerald-500 transition-colors">
                    <div>
                      <div className="font-extrabold text-slate-800 leading-snug">{camp.title || camp.name}</div>
                      <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{camp.location}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-700 text-white font-extrabold text-[10px] px-2 py-1 rounded shrink-0 ml-2">
                      {camp.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (onSelectCamp) onSelectCamp(UPCOMING_CAMPS[0].title);
                onOpenModal('camp_register');
              }}
              className="w-full bg-[#008a00] hover:bg-[#007000] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer mt-4"
            >
              REGISTER FOR CAMP
            </button>
          </div>

          {/* Widget 2: OUR NETWORK */}
          <div id="section-[#section-network]" className="bg-sky-50/40 rounded-xl p-4 border border-sky-200/80 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-sky-200 pb-2 mb-3">
                <h3 className="text-xs font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  OUR NETWORK
                </h3>
                <span className="text-[10px] font-bold text-sky-700">View All</span>
              </div>

              <div className="text-xs font-bold text-sky-900 mb-2">
                Serving in <span className="text-emerald-700 font-black">6 Districts</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold text-slate-700 mb-3">
                {districts.map((dist, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px]">{dist}</span>
                  </div>
                ))}
              </div>

              {/* Map Illustration Placeholder / Vector pins */}
              <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-around text-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-700 font-black text-xs">
                    6
                  </div>
                  <div className="text-left text-[10px] font-bold text-slate-600">
                    <div>Districts Covered</div>
                    <div className="text-emerald-600">Telangana Network</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-center font-bold text-slate-500 mt-4 pt-2 border-t border-sky-100">
              Expanding across Northern Telangana
            </div>
          </div>

          {/* Widget 3: COMMUNITY HEALTH PARTNERS */}
          <div className="bg-amber-50/40 rounded-xl p-4 border border-amber-200/80 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
                <h3 className="text-xs font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  COMMUNITY HEALTH PARTNERS
                </h3>
              </div>

              <p className="text-[11px] font-semibold text-slate-600 mb-2.5">
                Join hands with us to build a healthier community
              </p>

              <div className="space-y-1.5 text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>RMP Doctors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Health Workers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>NGOs & Volunteers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Training & Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onBecomePartnerClick) {
                  onBecomePartnerClick();
                } else {
                  onOpenModal('become_partner');
                }
              }}
              className="w-full bg-[#0052cc] hover:bg-[#003d99] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer mt-4"
            >
              BECOME A PARTNER
            </button>
          </div>

          {/* Widget 4: PATIENT PORTAL */}
          <div className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-200/80 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2 mb-3">
                <h3 className="text-xs font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  PATIENT PORTAL
                </h3>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <button 
                  onClick={() => onOpenModal('patient_portal')}
                  className="w-full flex items-center gap-2 hover:text-indigo-700 hover:bg-white p-1 rounded transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Manage Appointments</span>
                </button>
                <button 
                  onClick={() => onOpenModal('patient_portal')}
                  className="w-full flex items-center gap-2 hover:text-indigo-700 hover:bg-white p-1 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Track Requests</span>
                </button>
                <button 
                  onClick={() => onOpenModal('patient_portal')}
                  className="w-full flex items-center gap-2 hover:text-indigo-700 hover:bg-white p-1 rounded transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Reports</span>
                </button>
                <button 
                  onClick={() => onOpenModal('become_member')}
                  className="w-full flex items-center gap-2 hover:text-indigo-700 hover:bg-white p-1 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download Membership Card</span>
                </button>
                <button 
                  onClick={() => onOpenModal('patient_portal')}
                  className="w-full flex items-center gap-2 hover:text-indigo-700 hover:bg-white p-1 rounded transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Get Notifications</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSignInClick) {
                  onSignInClick();
                } else {
                  onOpenModal('patient_portal');
                }
              }}
              className="w-full bg-[#0a2e1d] hover:bg-slate-900 text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer mt-4"
            >
              LOGIN TO PORTAL
            </button>
          </div>

          {/* Widget 5: OUR PARTNER HOSPITALS */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h3 className="text-xs font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-red-600" />
                  OUR PARTNER HOSPITALS
                </h3>
                <span className="text-[10px] font-bold text-slate-500">View All</span>
              </div>

              {/* Hospital Slider Box */}
              <div className="relative bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center my-2">
                <div className={`w-12 h-12 rounded-full ${hospitals[currentHospitalIdx]?.logoBg || 'bg-blue-700'} text-white font-black text-sm flex items-center justify-center mb-2 shadow-sm uppercase`}>
                  {hospitals[currentHospitalIdx]?.logoText}
                </div>
                <h4 className="font-black text-xs text-slate-900">
                  {hospitals[currentHospitalIdx]?.name}
                </h4>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {hospitals[currentHospitalIdx]?.district} District
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">
                  {(hospitals[currentHospitalIdx]?.specialities || []).join(' • ')}
                </div>

                {/* Carousel controls */}
                <div className="flex items-center justify-between w-full mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={prevHospital}
                    className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-extrabold text-slate-400">
                    {currentHospitalIdx + 1} / {hospitals.length}
                  </span>
                  <button
                    onClick={nextHospital}
                    className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenModal('book_appointment')}
              className="w-full bg-[#0052cc] hover:bg-[#003d99] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer mt-4"
            >
              FIND HOSPITAL
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
