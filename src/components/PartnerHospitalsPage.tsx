import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Building2,
  Heart,
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  BedDouble,
  Calendar,
  Quote,
  CheckCircle2,
  Users,
  Stethoscope
} from 'lucide-react';
import { ActiveModal, HospitalPartner } from '../types';
import { PARTNER_HOSPITALS, HOSPITAL_TESTIMONIALS, HOSPITAL_PHOTOS, DISTRICTS } from '../data/mockData';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';

interface PartnerHospitalsPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onRequestVisit: (hospitalId: string, doctorId?: string) => void;
}

export const PartnerHospitalsPage: React.FC<PartnerHospitalsPageProps> = ({
  onBackToHome,
  onOpenModal,
  onRequestVisit
}) => {
  const { collections } = useLiveData();
  const { isLoggedIn, isGuest, user } = useAuth();
  const [districtFilter, setDistrictFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hospitals: HospitalPartner[] = collections.hospitals.length
    ? collections.hospitals
    : PARTNER_HOSPITALS;

  const filtered = useMemo(() => {
    if (districtFilter === 'All') return hospitals;
    return hospitals.filter((h) => h.district === districtFilter);
  }, [hospitals, districtFilter]);

  const selected = hospitals.find((h) => h.id === selectedId) || filtered[0];
  const totalBeds = hospitals.reduce((sum, h) => sum + (h.totalBeds || 0), 0);
  const avgRating =
    hospitals.length
      ? (hospitals.reduce((sum, h) => sum + (h.rating || 0), 0) / hospitals.length).toFixed(1)
      : '4.8';

  const photoFor = (hospital: HospitalPartner, idx: number) =>
    hospital.image ||
    HOSPITAL_PHOTOS[hospital.id] ||
    Object.values(HOSPITAL_PHOTOS)[idx % Object.values(HOSPITAL_PHOTOS).length];

  const handleVisit = (hospital: HospitalPartner) => {
    onRequestVisit(hospital.id);
  };

  const registeredPatient = isLoggedIn && !isGuest && user?.role === 'patient';

  return (
    <div className="bg-slate-100 font-sans text-slate-800">
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-8">
          <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-5">
            <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Home</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-700">Partner Hospitals</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-300 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>CARE BEYOND BOUNDARIES</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f2e5a] uppercase leading-tight tracking-tight">
                PARTNER HOSPITALS <br />
                <span className="text-[#0275d8]">TIED UP WITH AYUDH VIKAS</span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed max-w-2xl">
                Empanelled multi-speciality hospitals across Telangana. Cashless Ayudh desk, senior doctors, and coordinated admission for every referred patient.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { count: `${hospitals.length}+`, label: 'Hospitals' },
                  { count: `${totalBeds}+`, label: 'Beds' },
                  { count: avgRating, label: 'Avg Rating' },
                  { count: '6', label: 'Districts' }
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                    <div className="text-lg font-black text-[#0275d8]">{stat.count}</div>
                    <div className="text-[10px] font-extrabold uppercase text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md h-56 sm:h-72">
                <img
                  src="/src/assets/images/modern_hospital_facade_1787227836867.jpg"
                  alt="Ayudh partner hospital network"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2e5a]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Verified Network</div>
                  <div className="text-sm font-black">Quality Hospitals. One Coordination Desk.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#0b1b3d] text-white py-3.5 px-4 sm:px-8 border-y-2 border-amber-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
            <Building2 className="w-4 h-4 text-emerald-400" />
            {filtered.length} empanelled hospital{filtered.length === 1 ? '' : 's'}
          </div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded border border-slate-300 cursor-pointer"
          >
            <option value="All">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="py-8 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-5">
          <h2 className="text-sm font-black uppercase text-[#0f2e5a] flex items-center gap-1.5 border-b border-emerald-200 pb-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Hospitals Tied Up With Ayudh Vikas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((hospital, idx) => (
              <article
                key={hospital.id}
                className={`bg-white rounded-xl border shadow-xs overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all ${
                  selected?.id === hospital.id ? 'border-emerald-500' : 'border-slate-200'
                }`}
              >
                <div className="h-36 overflow-hidden relative">
                  <img src={photoFor(hospital, idx)} alt={hospital.shortName} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Ayudh Empanelled
                  </div>
                  {hospital.hasAyudhCashless && (
                    <div className="absolute top-2 right-2 bg-white/95 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-200">
                      Cashless
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-[#0f2e5a] leading-snug">{hospital.name}</h3>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {hospital.location}, {hospital.district}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span className="text-xs font-black text-slate-800">{hospital.rating}</span>
                      <span className="text-[10px] text-slate-500">({hospital.totalReviews})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-sky-600" />{hospital.totalBeds} beds</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />ICU {hospital.icuBeds}</span>
                    <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5 text-indigo-600" />{hospital.seniorDoctors?.length || 0} seniors</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(hospital.specialities || []).slice(0, 4).map((spec) => (
                      <span key={spec} className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleVisit(hospital)}
                      className="flex-1 bg-[#008a00] hover:bg-[#007000] text-white text-xs font-black uppercase py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Request Visit
                    </button>
                    {hospital.phone && (
                      <a
                        href={`tel:${hospital.emergencyPhone || hospital.phone}`}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedId(hospital.id)}
                      className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-900"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <section className="py-8 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-black uppercase text-[#0f2e5a] mb-3">{selected.shortName} — Senior Doctors</h2>
              <p className="text-xs text-slate-600 mb-4">{selected.address}</p>
              <div className="space-y-2">
                {(selected.seniorDoctors || []).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-3">
                    <div>
                      <div className="text-xs font-black text-[#0f2e5a]">{doc.name}</div>
                      <div className="text-[11px] text-slate-500">{doc.designation} · {doc.qualification}</div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">{doc.opdTimings}</div>
                    </div>
                    <button
                      onClick={() => onRequestVisit(selected.id, doc.id)}
                      className="shrink-0 bg-[#0052cc] hover:bg-[#003d99] text-white text-[10px] font-black uppercase px-3 py-2 rounded-lg cursor-pointer"
                    >
                      Request Visit
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-black uppercase text-[#0f2e5a]">Facilities</h2>
              {(selected.facilities || []).map((fac) => (
                <div key={fac} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {fac}
                </div>
              ))}
              <p className="text-[11px] text-slate-500 pt-2">
                {registeredPatient
                  ? 'You are signed in. Request Visit opens your hospital desk to complete the OP request.'
                  : 'Request Visit will ask you to register as a patient, then continue the hospital visit in your patient portal.'}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="py-8 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-5">
          <h2 className="text-sm font-black uppercase text-[#0f2e5a] flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Quote className="w-4 h-4 text-emerald-600" />
            Patient Reviews & Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOSPITAL_TESTIMONIALS.map((item) => (
              <div key={item.id} className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">“{item.quote}”</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#0f2e5a]">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.location} · {item.hospital}</div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[#0a192f] text-white py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase">
            <Users className="w-4 h-4 text-emerald-400" />
            Want your hospital on this network?
          </div>
          <button
            onClick={() => onOpenModal('become_partner')}
            className="bg-[#008a00] hover:bg-[#007000] text-white text-xs font-black uppercase px-4 py-2.5 rounded-lg cursor-pointer"
          >
            Partner With Us
          </button>
        </div>
      </div>
    </div>
  );
};
