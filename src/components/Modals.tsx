import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  UserPlus, 
  Calendar, 
  Crown, 
  AlertTriangle, 
  PhoneCall, 
  Tent, 
  Users, 
  Lock,
  UserCheck
} from 'lucide-react';
import { ActiveModal } from '../types';
import { DISTRICTS, SPECIALITIES } from '../data/mockData';
import { RegistrationModal } from './RegistrationModal';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';

interface ModalsProps {
  activeModal: ActiveModal;
  onClose: () => void;
  selectedCampTitle?: string;
  onCompleteRegistration?: (patientData: any) => void;
  onNavigateToOP?: (patientId: string) => void;
  onNavigateToDashboard?: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ 
  activeModal, 
  onClose, 
  selectedCampTitle,
  onCompleteRegistration,
  onNavigateToOP,
  onNavigateToDashboard
}) => {
  const { create, collections } = useLiveData();
  const { login } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formType, setFormType] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const camps = collections.health_camps.length ? collections.health_camps : [];
  const doctors = collections.doctors;

  if (!activeModal) return null;

  // Render comprehensive Registration Modal with all role toggles when register_patient is triggered
  if (activeModal === 'register_patient') {
    return (
      <RegistrationModal
        isOpen={true}
        onClose={onClose}
        initialRole="patient"
        onCompleteRegistration={onCompleteRegistration}
        onNavigateToOP={onNavigateToOP}
        onNavigateToDashboard={onNavigateToDashboard}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    setSubmitError('');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      if (type === 'Appointment Booking') {
        await create('appointments', {
          ...payload,
          doctorName: payload.doctorOrSpeciality,
          status: 'Pending',
        });
      } else if (type === 'Membership Enrollment') {
        await create('memberships', { ...payload, status: 'Active' });
      } else if (type === 'Emergency Helpline Request') {
        await create('emergencies', { ...payload, status: 'Open' });
      } else if (type === 'Callback Request') {
        await create('callbacks', { ...payload, status: 'Open' });
      } else if (type === 'Health Camp Registration') {
        await create('camp_registrations', { ...payload, status: 'Registered' });
      } else if (type === 'Partner Registration') {
        await create('partnerships', { ...payload, status: 'Submitted' });
      } else if (type === 'Portal Login') {
        const user = await login(String(payload.identifier || ''), String(payload.password || ''));
        if (onNavigateToDashboard && user) onNavigateToDashboard();
        return;
      } else {
        await create('enquiries', { type, ...payload, status: 'New' });
      }
      setFormType(type);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Could not submit. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#0f2e5a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wide">
            {activeModal === 'register_patient' && <><UserPlus className="w-5 h-5 text-emerald-400" /> Patient Registration</>}
            {activeModal === 'book_appointment' && <><Calendar className="w-5 h-5 text-blue-400" /> Book Doctor Appointment</>}
            {activeModal === 'become_member' && <><Crown className="w-5 h-5 text-amber-400" /> Ayudh Vikas Membership</>}
            {activeModal === 'emergency_help' && <><AlertTriangle className="w-5 h-5 text-red-400" /> Emergency Support Request</>}
            {activeModal === 'request_callback' && <><PhoneCall className="w-5 h-5 text-emerald-400" /> Request Call Back</>}
            {activeModal === 'camp_register' && <><Tent className="w-5 h-5 text-emerald-400" /> Health Camp Registration</>}
            {activeModal === 'become_partner' && <><Users className="w-5 h-5 text-sky-400" /> Become a Partner</>}
            {activeModal === 'patient_portal' && <><Lock className="w-5 h-5 text-indigo-400" /> Patient Portal Login</>}
          </div>

          <button 
            onClick={handleResetAndClose}
            className="p-1 rounded-full hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {submitError && (
            <div className="mx-0 mb-3 bg-red-50 text-red-700 text-xs font-semibold p-2.5 rounded-lg border border-red-200">
              {submitError}
            </div>
          )}
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase">
                {formType} Submitted Successfully!
              </h3>
              <p className="text-xs font-semibold text-slate-600 max-w-sm mx-auto">
                Our Ayudh Vikas Healthcare Support team will review your request and get in touch with you shortly. You can also contact us directly at <strong className="text-emerald-700">0870 4210820</strong>.
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-4 bg-[#0f2e5a] hover:bg-slate-900 text-white font-black text-xs uppercase px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Form 1: Patient Registration */}
              {activeModal === 'register_patient' && (
                <form onSubmit={(e) => handleSubmit(e, 'Patient Registration')} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input name="fullName" required type="text" placeholder="e.g. Ramesh Reddy" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                      <input name="mobileNumber" required type="tel" placeholder="10-digit mobile" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Age *</label>
                      <input name="age" required type="number" placeholder="e.g. 42" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">District *</label>
                    <select name="district" required className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                      <option value="">Select District</option>
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Address / Landmark</label>
                    <textarea name="address" rows={2} placeholder="Enter your local address" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-[#008a00] hover:bg-[#007000] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    CREATE PATIENT PROFILE
                  </button>
                </form>
              )}

              {/* Form 2: Book Appointment */}
              {activeModal === 'book_appointment' && (
                <form onSubmit={(e) => handleSubmit(e, 'Appointment Booking')} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Doctor / Speciality *</label>
                    <select name="doctorOrSpeciality" required className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <option value="">Choose Speciality or Doctor</option>
                      {SPECIALITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                      {doctors.map((doc: any) => (
                        <option key={doc.id} value={doc.name}>{doc.name} ({doc.speciality} - {doc.hospital})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                      <input name="patientName" required type="text" placeholder="Full name" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                      <input name="phone" required type="tel" placeholder="10-digit mobile" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Preferred Date *</label>
                      <input name="appointmentDate" required type="date" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">District *</label>
                      <select name="district" required className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Select District</option>
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#0052cc] hover:bg-[#003d99] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    CONFIRM BOOKING REQUEST
                  </button>
                </form>
              )}

              {/* Form 3: Membership */}
              {activeModal === 'become_member' && (
                <form onSubmit={(e) => handleSubmit(e, 'Membership Enrollment')} className="space-y-3 text-xs">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] font-semibold text-amber-900 mb-2">
                    👑 Ayudh Vikas Membership provides free health camp priority, discounts on lab tests, ambulance discounts, and dedicated family care coordination.
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Member Name *</label>
                    <input name="memberName" required type="text" placeholder="Full Name" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input name="phone" required type="tel" placeholder="10-digit mobile" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Family Members Count</label>
                      <select name="familyCount" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none">
                        <option value="1">1 Person (Individual)</option>
                        <option value="2-4">2-4 Persons (Family)</option>
                        <option value="5+">5+ Persons (Extended)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    JOIN MEMBERSHIP NOW
                  </button>
                </form>
              )}

              {/* Form 4: Emergency Help */}
              {activeModal === 'emergency_help' && (
                <form onSubmit={(e) => handleSubmit(e, 'Emergency Helpline Request')} className="space-y-3 text-xs">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-900 font-bold text-xs flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-red-600 animate-pulse shrink-0" />
                    <span>For immediate medical emergency call 1800 123 4567 or 0870 4210820 right away!</span>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Caller / Patient Name *</label>
                    <input name="patientName" required type="text" placeholder="Name" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number (Immediate Callback) *</label>
                    <input name="phone" required type="tel" placeholder="10-digit phone" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Emergency Location / District *</label>
                    <input name="location" required type="text" placeholder="e.g. Hunter Road, Warangal" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    DISPATCH EMERGENCY SUPPORT
                  </button>
                </form>
              )}

              {/* Form 5: Request Callback */}
              {activeModal === 'request_callback' && (
                <form onSubmit={(e) => handleSubmit(e, 'Callback Request')} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                    <input name="name" required type="text" placeholder="Full name" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input name="phone" required type="tel" placeholder="10-digit mobile" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Query / Service Needed</label>
                    <select name="query" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                      <option value="General Query">General Query</option>
                      <option value="Hospital Guidance">Hospital Guidance</option>
                      <option value="Home Care Support">Home Care Support</option>
                      <option value="Lab Test Inquiry">Lab Test Inquiry</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    REQUEST CALL BACK NOW
                  </button>
                </form>
              )}

              {/* Form 6: Health Camp Registration */}
              {activeModal === 'camp_register' && (
                <form onSubmit={(e) => handleSubmit(e, 'Health Camp Registration')} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Health Camp *</label>
                    <select name="campTitle" required defaultValue={selectedCampTitle || ''} className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                      {camps.map((camp: any) => (
                        <option key={camp.id} value={camp.title || camp.name}>
                          {camp.title || camp.name} - {camp.location} ({camp.date})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Participant Name *</label>
                      <input name="participantName" required type="text" placeholder="Name" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input name="phone" required type="tel" placeholder="Mobile" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#008a00] hover:bg-[#007000] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    REGISTER FOR FREE CAMP
                  </button>
                </form>
              )}

              {/* Form 7: Become a Partner */}
              {activeModal === 'become_partner' && (
                <form onSubmit={(e) => handleSubmit(e, 'Partner Registration')} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Partner Type *</label>
                    <select name="partnerType" required className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none">
                      <option value="RMP Doctor">RMP Doctor</option>
                      <option value="Health Worker / ASHA">Health Worker / ASHA</option>
                      <option value="Hospital Partner">Hospital Partner</option>
                      <option value="Diagnostic Lab">Diagnostic Lab</option>
                      <option value="Ambulance Service">Ambulance Service</option>
                      <option value="NGO / Volunteer">NGO / Volunteer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization / Person Name *</label>
                    <input name="organizationName" required type="text" placeholder="Name" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input name="phone" required type="tel" placeholder="Mobile" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">District *</label>
                      <select name="district" required className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none">
                        <option value="">Select District</option>
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#0052cc] hover:bg-[#003d99] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    SUBMIT PARTNER APPLICATION
                  </button>
                </form>
              )}

              {/* Form 8: Patient Portal Login */}
              {activeModal === 'patient_portal' && (
                <form onSubmit={(e) => handleSubmit(e, 'Portal Login')} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number or Member ID *</label>
                    <input name="identifier" required type="text" placeholder="Registered mobile or ID" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Password or OTP *</label>
                    <input name="password" required type="password" placeholder="••••••••" className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-[#0f2e5a] hover:bg-slate-900 text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors mt-2">
                    LOGIN TO PATIENT PORTAL
                  </button>
                </form>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
