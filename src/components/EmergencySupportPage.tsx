import React, { useState } from 'react';
import {
  ChevronRight,
  PhoneCall,
  AlertTriangle,
  Ambulance,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Clock,
  HeartPulse,
  CheckCircle2
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';

interface EmergencySupportPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  userProfile?: {
    name: string;
    phone?: string;
  };
}

export const EmergencySupportPage: React.FC<EmergencySupportPageProps> = ({
  onBackToHome,
  onOpenModal,
  userProfile
}) => {
  const { create } = useLiveData();
  const [patientName, setPatientName] = useState(userProfile?.name && userProfile.name !== 'Guest' ? userProfile.name : '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState('');
  const [emergencyType, setEmergencyType] = useState('Medical Emergency');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await create('emergencies', {
        patientName,
        phone,
        location,
        emergencyType,
        details,
        status: 'Open'
      });
      setSubmitted(true);
      setDetails('');
    } catch (err: any) {
      setError(err.message || 'Could not submit emergency request. Please call the helpline.');
    } finally {
      setSubmitting(false);
    }
  };

  const helpItems = [
    { title: 'Accident & Trauma', desc: 'Road accidents, falls and injury dispatch' },
    { title: 'Cardiac Emergency', desc: 'Chest pain, breathlessness, suspected heart attack' },
    { title: 'Stroke Alert', desc: 'Sudden weakness, speech difficulty, facial droop' },
    { title: 'Maternity Support', desc: 'Labour, pregnancy complications, neonatal transfer' },
    { title: 'ICU Ambulance', desc: 'ALS / ventilator-supported inter-hospital transfer' },
    { title: '24x7 Helpline', desc: 'Coordinator guidance until the ambulance arrives' }
  ];

  return (
    <section className="py-6 px-4 sm:px-8 bg-[#f3f5f8]">
      <div className="max-w-7xl mx-auto space-y-6">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Services</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Emergency Support
          </span>
        </nav>

        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white rounded-2xl p-5 sm:p-8 shadow-lg border border-red-800">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-100 mb-2">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>24x7 Emergency SOS Response Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Need Immediate Emergency Help?</h1>
          <p className="text-sm text-red-50 mt-2 max-w-2xl">
            One call connects you to the Ayudh Vikas dispatch unit in Warangal. Paramedic ambulances with ICU life support stay on standby across Telangana.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a
              href="tel:08704210820"
              className="bg-white text-red-700 font-black text-sm px-5 py-3 rounded-xl shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Call 0870 4210820
            </a>
            <a
              href="tel:18001234567"
              className="bg-slate-900 text-white font-black text-sm px-5 py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Toll Free 1800 123 4567
            </a>
            <a
              href="https://wa.me/919000045073"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 text-white font-black text-sm px-5 py-3 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Dispatch
            </a>
            <button
              onClick={() => onOpenModal('ambulance_booking')}
              className="bg-amber-400 text-slate-900 font-black text-sm px-5 py-3 rounded-xl hover:bg-amber-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Ambulance className="w-4 h-4" />
              Book Ambulance Online
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-black text-[#0f2e5a] uppercase tracking-wide flex items-center gap-2 mb-4">
                <HeartPulse className="w-4 h-4 text-red-600" />
                What We Cover
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {helpItems.map((item) => (
                  <div key={item.title} className="border border-slate-200 rounded-xl p-3.5 hover:border-red-300 transition-colors">
                    <div className="text-xs font-black text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Response</div>
                  <div className="text-xs font-black text-slate-800">Average 12–18 mins</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-sky-600" />
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Coverage</div>
                  <div className="text-xs font-black text-slate-800">6 Telangana Districts</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Members</div>
                  <div className="text-xs font-black text-slate-800">Priority dispatch</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-black text-[#0f2e5a] uppercase tracking-wide mb-1">Request Emergency Callback</h2>
              <p className="text-[11px] text-slate-500 mb-4">Share your location and our dispatch desk will call you immediately.</p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Emergency request received. Our 24x7 desk will call {phone || 'you'} shortly. For life-threatening cases please dial 0870 4210820 now.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Caller / Patient Name *</label>
                    <input
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Name"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit phone"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Location / District *</label>
                    <input
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Hunter Road, Hanamkonda"
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Type</label>
                    <select
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option>Medical Emergency</option>
                      <option>Accident / Trauma</option>
                      <option>Cardiac / Chest Pain</option>
                      <option>Stroke Alert</option>
                      <option>Maternity / Labour</option>
                      <option>ICU Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brief Details</label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={3}
                      placeholder="Patient condition, landmarks, number of people..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                    />
                  </div>
                  {error && <p className="text-red-600 font-semibold">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-xs uppercase py-3 rounded-lg shadow-md cursor-pointer transition-colors"
                  >
                    {submitting ? 'Sending...' : 'Dispatch Emergency Support'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
