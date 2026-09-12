import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Phone, 
  Clock, 
  Calendar, 
  Stethoscope, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Filter, 
  ChevronRight, 
  X, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  SlidersHorizontal,
  Navigation,
  HeartPulse,
  Activity,
  BedDouble,
  QrCode,
  Printer,
  Download,
  Share2,
  PhoneCall,
  ChevronDown,
  Info,
  Check,
  Plus,
  Loader2
} from 'lucide-react';
import { HospitalPartner, SeniorDoctor, HospitalVisitRequest, SymptomItem, ActiveModal } from '../types';
import { PARTNER_HOSPITALS, SYMPTOMS_LIST, DISTRICTS, SPECIALITIES, INITIAL_HOSPITAL_VISIT_REQUESTS } from '../data/mockData';
import { useLiveData } from '../context/LiveDataContext';
import { api } from '../lib/api';
import { BrandLogo } from './BrandLogo';

interface HospitalSearchVisitSectionProps {
  userProfile?: {
    name: string;
    phone: string;
    patientId?: string;
    age?: string | number;
    gender?: string;
    bloodGroup?: string;
  };
  visitRequests?: HospitalVisitRequest[];
  onAddVisitRequest?: (request: HospitalVisitRequest) => void;
  onOpenModal?: (modal: ActiveModal) => void;
  isDashboardContext?: boolean;
  onBackToDashboard?: () => void;
  isGuest?: boolean;
  pendingHospitalId?: string;
  pendingDoctorId?: string;
  onPendingVisitConsumed?: () => void;
  onRequireRegister?: (hospitalId: string, doctorId?: string) => void;
}

export const HospitalSearchVisitSection: React.FC<HospitalSearchVisitSectionProps> = ({
  userProfile = {
    name: 'Ramesh Kumar',
    phone: '9876543210',
    patientId: 'AVP100245',
    age: 42,
    gender: 'Male',
    bloodGroup: 'B+ve'
  },
  visitRequests,
  onAddVisitRequest,
  onOpenModal,
  isDashboardContext = false,
  onBackToDashboard,
  isGuest = false,
  pendingHospitalId,
  pendingDoctorId,
  onPendingVisitConsumed,
  onRequireRegister
}) => {
  const { collections, create, loading: liveLoading } = useLiveData();
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [searching, setSearching] = useState(false);
  const [apiHospitals, setApiHospitals] = useState<HospitalPartner[] | null>(null);
  const liveHospitals = collections.hospitals.length ? collections.hospitals : PARTNER_HOSPITALS;
  const liveRequests = liveLoading && !collections.visit_requests.length
    ? INITIAL_HOSPITAL_VISIT_REQUESTS
    : collections.visit_requests;

  const allRequests: HospitalVisitRequest[] = ((visitRequests && Array.isArray(visitRequests))
    ? visitRequests
    : liveRequests
  ).filter((request) => !userProfile.patientId || request.patientId === userProfile.patientId || userProfile.patientId === 'GUEST');
  // Location Filter (defaults to Hanamkonda / Warangal - Patient's current location)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Hanamkonda');
  const [userCurrentLocation, setUserCurrentLocation] = useState<string>('Subedari, Hanamkonda (Current Location)');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Search & Symptom Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomItem | null>(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'beds'>('distance');

  // Active View Tab: 'hospitals' | 'my_requests'
  const [activeTab, setActiveTab] = useState<'hospitals' | 'my_requests'>('hospitals');

  // Visit Request Modal State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedHospitalForVisit, setSelectedHospitalForVisit] = useState<HospitalPartner | null>(null);
  const [selectedDoctorForVisit, setSelectedDoctorForVisit] = useState<SeniorDoctor | null>(null);

  // Visit Request Form State
  const [visitPatientName, setVisitPatientName] = useState(userProfile.name);
  const [visitPatientPhone, setVisitPatientPhone] = useState(userProfile.phone);
  const [visitPatientAge, setVisitPatientAge] = useState(userProfile.age ? String(userProfile.age) : '42');
  const [visitPatientGender, setVisitPatientGender] = useState(userProfile.gender || 'Male');
  const [visitDepartment, setVisitDepartment] = useState('');
  const [visitChiefComplaint, setVisitChiefComplaint] = useState('');
  const [visitDate, setVisitDate] = useState('2026-05-30');
  const [visitTimeSlot, setVisitTimeSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [visitType, setVisitType] = useState<HospitalVisitRequest['visitType']>('OP Consultation');
  const [visitFormSuccess, setVisitFormSuccess] = useState<HospitalVisitRequest | null>(null);

  // Digital Visit Pass Modal State
  const [selectedRequestForPass, setSelectedRequestForPass] = useState<HospitalVisitRequest | null>(null);

  // Expanded Doctor list state for card view
  const [expandedHospitalId, setExpandedHospitalId] = useState<string | null>(null);

  // Auto detect location simulation
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setUserCurrentLocation('Hunter Road, Hanamkonda (GPS Accurately Located)');
      setSelectedDistrict('Hanamkonda');
      setIsDetectingLocation(false);
    }, 600);
  };

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.searchHospitals({
          q: searchQuery.trim(),
          district: selectedDistrict === 'All' ? '' : selectedDistrict,
          speciality: selectedSymptom?.speciality || (selectedSpeciality === 'All' ? '' : selectedSpeciality),
          sort: sortBy,
        });
        setApiHospitals(res.items || []);
      } catch {
        setApiHospitals(null);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchQuery, selectedDistrict, selectedSpeciality, selectedSymptom, sortBy]);

  const filteredHospitals = useMemo(() => {
    const source = apiHospitals || liveHospitals;
    return source.filter((hospital) => {
      if (selectedDistrict !== 'All' && hospital.district !== selectedDistrict) return false;
      if (selectedSpeciality !== 'All') {
        const matchesSpec =
          (hospital.specialities || []).some((s) => s.toLowerCase().includes(selectedSpeciality.toLowerCase())) ||
          hospital.seniorDoctors?.some((d) => d.speciality.toLowerCase().includes(selectedSpeciality.toLowerCase()));
        if (!matchesSpec) return false;
      }
      if (selectedSymptom) {
        const matchesSymptomSpec =
          (hospital.specialities || []).some((s) => s.toLowerCase().includes(selectedSymptom.speciality.toLowerCase())) ||
          hospital.seniorDoctors?.some((d) => d.speciality.toLowerCase().includes(selectedSymptom.speciality.toLowerCase()));
        if (!matchesSymptomSpec) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = hospital.name.toLowerCase().includes(q) || hospital.shortName.toLowerCase().includes(q);
        const matchesLocation = hospital.location?.toLowerCase().includes(q) || hospital.address?.toLowerCase().includes(q);
        const matchesDoctor = hospital.seniorDoctors?.some((d) =>
          d.name.toLowerCase().includes(q) || d.speciality.toLowerCase().includes(q) || (d.designation || '').toLowerCase().includes(q)
        );
        const matchesSpec = (hospital.specialities || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesLocation && !matchesDoctor && !matchesSpec) return false;
      }
      return true;
    });
  }, [apiHospitals, liveHospitals, selectedDistrict, selectedSpeciality, selectedSymptom, searchQuery]);

  // Open Visit Request Modal
  const handleOpenVisitModal = (hospital: HospitalPartner, doctor?: SeniorDoctor) => {
    if (isGuest) {
      if (onRequireRegister) {
        onRequireRegister(hospital.id, doctor?.id);
        return;
      }
      onOpenModal?.('register_patient');
      return;
    }
    setSelectedHospitalForVisit(hospital);
    setSelectedDoctorForVisit(doctor || null);
    setVisitDepartment(doctor ? doctor.speciality : (selectedSymptom?.speciality || hospital.specialities?.[0] || 'General Medicine'));
    if (selectedSymptom) {
      setVisitChiefComplaint(`Symptoms: ${selectedSymptom.name} (${selectedSymptom.teluguName || ''}). ${selectedSymptom.description}`);
    } else {
      setVisitChiefComplaint('');
    }
    setVisitFormSuccess(null);
    setIsVisitModalOpen(true);
  };

  useEffect(() => {
    if (!pendingHospitalId || isGuest) return;
    const hospital = liveHospitals.find((item: HospitalPartner) => item.id === pendingHospitalId);
    if (!hospital) return;
    const doctor = pendingDoctorId
      ? hospital.seniorDoctors?.find((d) => d.id === pendingDoctorId)
      : undefined;
    handleOpenVisitModal(hospital, doctor);
    onPendingVisitConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingHospitalId, pendingDoctorId, liveHospitals, isGuest]);

  // Submit Visit Request
  const handleSubmitVisitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalForVisit) return;

    const newRequest: HospitalVisitRequest = {
      id: `HVR-${Date.now()}`,
      requestId: `AV-VISIT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: userProfile.patientId || 'AVP100245',
      patientName: visitPatientName,
      patientPhone: visitPatientPhone,
      patientAge: visitPatientAge,
      patientGender: visitPatientGender,
      bloodGroup: userProfile.bloodGroup || 'B+ve',
      hospitalId: selectedHospitalForVisit.id,
      hospitalName: selectedHospitalForVisit.name,
      hospitalDistrict: selectedHospitalForVisit.district,
      department: visitDepartment || 'General Medicine',
      doctorName: selectedDoctorForVisit ? selectedDoctorForVisit.name : 'Senior Duty Specialist',
      doctorId: selectedDoctorForVisit ? selectedDoctorForVisit.id : undefined,
      symptoms: selectedSymptom ? [selectedSymptom.name] : ['Consultation Required'],
      chiefComplaint: visitChiefComplaint || 'General OPD consultation and checkup',
      preferredDate: visitDate,
      preferredTimeSlot: visitTimeSlot,
      visitType: visitType,
      status: 'Pending',
      requestedAt: 'Just Now',
      hospitalNotes: 'Hospital coordination desk is reviewing your visit request. You will receive an SMS and token confirmation shortly.',
      isAyudhMember: true
    };

    try {
      setSubmittingVisit(true);
      const saved = await create('visit_requests', newRequest);
      if (onAddVisitRequest) {
        onAddVisitRequest(saved);
      }
      setVisitFormSuccess(saved);
    } finally {
      setSubmittingVisit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Location Bar */}
      <div className="bg-gradient-to-r from-[#0a2540] via-[#0f3b6c] to-[#00703c] text-white rounded-2xl p-4 sm:p-6 shadow-md border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Ayudh Empanelled Hospital Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Find Hospitals Around You & Request Visit
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Closest hospitals listed first by default. Search by symptoms, explore senior doctors & specialities, and request instant OP visit with Ayudh Cashless benefits.
            </p>
          </div>

          {/* Location Indicator & Action */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Navigation className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Your Location</div>
                <div className="text-xs font-black text-white">{userCurrentLocation}</div>
              </div>
            </div>

            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="text-[11px] font-bold bg-white text-[#0f2e5a] hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isDetectingLocation ? 'Locating...' : 'Refresh Location'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs: Browse Hospitals vs My Visit Requests */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/15">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hospitals'
                ? 'bg-white text-[#0f2e5a] shadow-md scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Nearby Hospitals & Senior Doctors ({filteredHospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_requests')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'my_requests'
                ? 'bg-white text-[#0f2e5a] shadow-md scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>My Hospital Visit Requests ({(allRequests || []).length})</span>
            {(allRequests || []).filter(r => r?.status === 'Accepted').length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {(allRequests || []).filter(r => r?.status === 'Accepted').length} Accepted
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: HOSPITALS FINDER & SYMPTOM SEARCH */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          {/* SEARCH & SYMPTOM NAVIGATOR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Search Input and Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hospital, doctor, speciality, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                {searching && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-8 top-1/2 -translate-y-1/2" />}
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All Districts</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedSpeciality}
                  onChange={(e) => {
                    setSelectedSpeciality(e.target.value);
                    setSelectedSymptom(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All Specialities</option>
                  {SPECIALITIES.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="distance">Closest first</option>
                  <option value="rating">Top rated</option>
                  <option value="beds">Most beds</option>
                </select>
              </div>
            </div>

            {/* SYMPTOM-BASED GUIDANCE BAR */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-[#0f2e5a] uppercase tracking-wide">
                    Search by Symptoms (లక్షణాల ఆధారంగా వెతకండి)
                  </span>
                </div>
                {selectedSymptom && (
                  <button
                    onClick={() => setSelectedSymptom(null)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Symptom Filter</span>
                  </button>
                )}
              </div>

              {/* Symptom Chips */}
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS_LIST.map((symp) => {
                  const isSelected = selectedSymptom?.id === symp.id;
                  return (
                    <button
                      key={symp.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSymptom(null);
                        } else {
                          setSelectedSymptom(symp);
                          setSelectedSpeciality('All');
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00703c] text-white shadow-sm ring-2 ring-emerald-600 scale-102'
                          : 'bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        symp.urgency === 'Emergency' ? 'bg-red-500' :
                        symp.urgency === 'Urgent' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <div className="font-bold text-[11px] leading-tight">{symp.name}</div>
                        {symp.teluguName && (
                          <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {symp.teluguName}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Symptom Recommendation Banner */}
              {selectedSymptom && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0f2e5a]">
                        Recommended Speciality: <span className="text-emerald-700 font-black">{selectedSymptom.speciality}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {selectedSymptom.description} • Showing partner hospitals with top {selectedSymptom.speciality} doctors sorted by closest distance.
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                    selectedSymptom.urgency === 'Emergency' ? 'bg-red-100 text-red-800 border border-red-200' :
                    selectedSymptom.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {selectedSymptom.urgency} Care Recommended
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* HOSPITALS LISTING (Sorted by Closest Distance First) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>
                {searching ? 'Searching network… ' : ''}
                Showing <strong>{filteredHospitals.length}</strong> hospitals
                {selectedSpeciality !== 'All' ? ` for ${selectedSpeciality}` : ''}
                {selectedDistrict !== 'All' ? ` in ${selectedDistrict}` : ''}
              </span>
              <span className="text-emerald-700 font-bold">✓ Ayudh Cashless Empanelled Facilities</span>
            </div>

            {filteredHospitals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No Hospitals Found Matching Criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your search query, selecting "All Districts", or clearing symptom filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('All');
                    setSelectedSymptom(null);
                    setSelectedSpeciality('All');
                  }}
                  className="bg-[#00703c] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredHospitals.map((hospital, idx) => {
                const isExpanded = expandedHospitalId === hospital.id;

                return (
                  <div 
                    key={hospital.id} 
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all p-5 shadow-xs relative overflow-hidden"
                  >
                    {/* Top Closest Tag */}
                    {idx === 0 && sortBy === 'distance' && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Navigation className="w-3 h-3" />
                        <span>Closest to you</span>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
                      {/* Left: Hospital Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-14 h-14 rounded-2xl ${hospital.logoBg} text-white flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
                            {hospital.logoText}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base sm:text-lg font-black text-[#0f2e5a] leading-tight">
                                {hospital.name}
                              </h2>
                              {hospital.hasAyudhCashless && (
                                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Ayudh Cashless</span>
                                </span>
                              )}
                              {hospital.isOpen24x7 && (
                                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                                  24x7 Emergency
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{hospital.address || hospital.location}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                              {/* Distance Badge */}
                              <span className="font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg">
                                📍 {hospital.distanceKm} km away
                              </span>
                              <span className="flex items-center gap-1 text-slate-700 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{hospital.rating}</span>
                                <span className="text-slate-400 font-normal">({hospital.totalReviews}+ reviews)</span>
                              </span>
                              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                                <span><strong>{hospital.availableBeds}</strong> Beds Available ({hospital.icuBeds} ICU)</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Specialities Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 self-center mr-1">Specialities:</span>
                          {(hospital.specialities || []).map((spec) => {
                            const isMatch = selectedSymptom?.speciality.toLowerCase().includes(spec.toLowerCase()) ||
                                            spec.toLowerCase().includes(selectedSpeciality.toLowerCase());
                            return (
                              <span
                                key={spec}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  isMatch
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {spec}
                              </span>
                            );
                          })}
                        </div>

                        {/* Facilities tags */}
                        {hospital.facilities && (
                          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                            {hospital.facilities.map((fac, fIdx) => (
                              <span key={fIdx} className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                                ✓ {fac}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2.5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto">
                        <button
                          onClick={() => handleOpenVisitModal(hospital)}
                          className="w-full sm:w-auto bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Request Hospital Visit</span>
                        </button>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {hospital.phone && (
                            <a
                              href={`tel:${hospital.emergencyPhone || hospital.phone}`}
                              className="flex-1 sm:flex-initial text-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Call</span>
                            </a>
                          )}
                          <button
                            onClick={() => setExpandedHospitalId(isExpanded ? null : hospital.id)}
                            className="flex-1 sm:flex-initial text-center bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                            <span>{isExpanded ? 'Hide Doctors' : `Senior Doctors (${hospital.seniorDoctors?.length || 0})`}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SENIOR DOCTORS ROSTER (Shown always or expanded) */}
                    {hospital.seniorDoctors && hospital.seniorDoctors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black text-[#0f2e5a] flex items-center gap-1.5 uppercase tracking-wide">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Senior Doctors & Consulting Specialists</span>
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold">
                            OPD Timings & Direct Visit Booking
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {hospital.seniorDoctors.map((doc) => (
                            <div 
                              key={doc.id}
                              className="bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-3 border border-slate-200 flex flex-col justify-between gap-2.5 transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-xs font-black text-[#0f2e5a]">{doc.name}</h5>
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                                      {doc.speciality}
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-semibold text-slate-600 mt-0.5">{doc.designation}</p>
                                  <p className="text-[10px] text-slate-400">{doc.qualification} • {doc.experienceYears} yrs exp</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 justify-end">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    <span>{doc.rating}</span>
                                  </div>
                                  <div className="text-[10px] font-black text-slate-800 mt-0.5">₹{doc.consultationFee || 500}</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{doc.opdTimings}</span>
                                </span>
                                <button
                                  onClick={() => handleOpenVisitModal(hospital, doc)}
                                  className="text-emerald-700 hover:text-emerald-800 font-black cursor-pointer flex items-center gap-1 hover:underline"
                                >
                                  <span>Book with Dr. {doc.name.split(' ')[1] || ''}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MY HOSPITAL VISIT REQUESTS & STATUS TRACKER */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-[#0f2e5a]">My Hospital Visit Requests & Live Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track whether the hospital has accepted your visit request, view allotted OP token number, and generate your Digital Visit Slip.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('hospitals')}
              className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Hospital Visit Request</span>
            </button>
          </div>

          {(!allRequests || allRequests.length === 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No Visit Requests Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore nearby hospitals and request an OPD consultation or specialist visit.
              </p>
              <button
                onClick={() => setActiveTab('hospitals')}
                className="bg-[#00703c] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Browse Nearby Hospitals
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {allRequests.map((req) => {
                const isAccepted = req.status === 'Accepted' || req.status === 'Scheduled';
                const isPending = req.status === 'Pending';
                const isCompleted = req.status === 'Completed';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-xs relative overflow-hidden ${
                      isAccepted ? 'border-emerald-400 ring-1 ring-emerald-400/30' :
                      isPending ? 'border-amber-300' : 'border-slate-200'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                          isAccepted ? 'bg-emerald-600' : isPending ? 'bg-amber-500' : 'bg-slate-600'
                        }`}>
                          {isAccepted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-500">REQUEST #{req.requestId}</span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              isPending ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' :
                              isCompleted ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {isAccepted ? '✓ Request Accepted by Hospital' :
                               isPending ? '⏳ Pending Hospital Confirmation' : req.status}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-[#0f2e5a] mt-0.5">{req.hospitalName}</h3>
                        </div>
                      </div>

                      {/* Right Action: Digital Visit Pass or Status Details */}
                      {isAccepted && (
                        <button
                          onClick={() => setSelectedRequestForPass(req)}
                          className="bg-[#0f2e5a] hover:bg-[#0a2040] text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Digital Visit Pass</span>
                        </button>
                      )}
                    </div>

                    {/* Request Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Department / Doctor</span>
                        <div className="font-bold text-slate-800 mt-0.5">{req.department}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">{req.doctorName || 'Senior Duty Specialist'}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Preferred Date & Slot</span>
                        <div className="font-bold text-slate-800 mt-0.5">{req.preferredDate}</div>
                        <div className="text-[11px] text-slate-500">{req.preferredTimeSlot}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Token / OP Room</span>
                        {req.tokenNumber ? (
                          <>
                            <div className="font-black text-emerald-700 mt-0.5">Token: {req.tokenNumber}</div>
                            <div className="text-[11px] text-slate-600">{req.reportingRoom || 'Main OPD Counter'}</div>
                          </>
                        ) : (
                          <div className="text-slate-400 italic mt-0.5">Assigning by Reception...</div>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient Info</span>
                        <div className="font-bold text-slate-800 mt-0.5">{req.patientName}</div>
                        <div className="text-[11px] text-slate-500">Ph: {req.patientPhone}</div>
                      </div>
                    </div>

                    {/* Chief Complaint / Hospital Notes */}
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-100">
                      <div className="text-slate-700">
                        <strong>Reason / Symptoms:</strong> {req.chiefComplaint || req.symptoms.join(', ')}
                      </div>
                      {req.hospitalNotes && (
                        <div className="text-emerald-800 text-[11px] font-medium flex items-start gap-1.5 pt-1">
                          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Hospital Update:</strong> {req.hospitalNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: REQUEST HOSPITAL VISIT MODAL */}
      {isVisitModalOpen && selectedHospitalForVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedHospitalForVisit.logoBg} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                  {selectedHospitalForVisit.logoText}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0f2e5a]">Request Hospital Visit</h3>
                  <p className="text-xs text-slate-500">{selectedHospitalForVisit.name} • {selectedHospitalForVisit.district}</p>
                </div>
              </div>
              <button
                onClick={() => setIsVisitModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State View */}
            {visitFormSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                    REQUEST SUBMITTED SUCCESSFULLY
                  </span>
                  <h4 className="text-lg font-black text-[#0f2e5a] mt-2">
                    Visit Request #{visitFormSuccess.requestId}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Your visit request has been sent to <strong>{visitFormSuccess.hospitalName}</strong>. The hospital desk is reviewing doctor slots. You can check the live acceptance status under "My Hospital Visit Requests".
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient Name:</span>
                    <span className="font-bold text-slate-800">{visitFormSuccess.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department / Doctor:</span>
                    <span className="font-bold text-emerald-700">{visitFormSuccess.department} ({visitFormSuccess.doctorName})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Date:</span>
                    <span className="font-bold text-slate-800">{visitFormSuccess.preferredDate} ({visitFormSuccess.preferredTimeSlot})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsVisitModalOpen(false);
                      setActiveTab('my_requests');
                    }}
                    className="flex-1 bg-[#00703c] text-white text-xs font-black py-3 rounded-xl hover:bg-[#005830] transition-all shadow-xs cursor-pointer"
                  >
                    View Status in My Requests
                  </button>
                  <button
                    onClick={() => setIsVisitModalOpen(false)}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmitVisitRequest} className="space-y-4 text-xs">
                {/* Doctor Pre-Selection info if any */}
                {selectedDoctorForVisit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-blue-700" />
                      <div>
                        <div className="font-black text-blue-950">{selectedDoctorForVisit.name}</div>
                        <div className="text-[10px] text-blue-700">{selectedDoctorForVisit.designation} • {selectedDoctorForVisit.opdTimings}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                      ₹{selectedDoctorForVisit.consultationFee || 500}
                    </span>
                  </div>
                )}

                {/* Patient Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={visitPatientName}
                      onChange={(e) => setVisitPatientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={visitPatientPhone}
                      onChange={(e) => setVisitPatientPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Department / Speciality *</label>
                    <select
                      value={visitDepartment}
                      onChange={(e) => setVisitDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                    >
                      {selectedHospitalForVisit.specialities.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Visit Type</label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="OP Consultation">OP Consultation (Regular Checkup)</option>
                      <option value="Specialist Review">Senior Specialist Review</option>
                      <option value="Health Checkup">Comprehensive Health Checkup</option>
                      <option value="Second Opinion">Second Opinion on Diagnosis</option>
                      <option value="Emergency">Emergency OPD Visit</option>
                    </select>
                  </div>
                </div>

                {/* Date and Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Preferred Visit Date *</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Preferred Time Slot *</label>
                    <select
                      value={visitTimeSlot}
                      onChange={(e) => setVisitTimeSlot(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                      <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Chief Complaint / Symptoms */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Describe Symptoms / Reason for Visit
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Chest discomfort, severe fever, knee joint pain since 3 days..."
                    value={visitChiefComplaint}
                    onChange={(e) => setVisitChiefComplaint(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Ayudh Foundation Member Perks Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-[11px] text-emerald-950">
                    <strong>Ayudh Cardholder Cashless Privilege:</strong> Show your Ayudh Digital ID at the hospital counter to avail prioritized doctor slot and discounted diagnostic investigations.
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVisitModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVisit}
                    className="bg-[#00703c] hover:bg-[#005830] text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submittingVisit ? 'Submitting...' : 'Submit Visit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: DIGITAL HOSPITAL VISIT PASS */}
      {selectedRequestForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BrandLogo className="w-7 h-7" />
                <span className="text-xs font-black text-[#0f2e5a] uppercase tracking-wider">
                  Ayudh Foundation Visit Pass
                </span>
              </div>
              <button
                onClick={() => setSelectedRequestForPass(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visit Pass Card Printable Style */}
            <div className="bg-gradient-to-br from-[#0a2540] to-[#0052cc] text-white rounded-2xl p-5 shadow-md relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div>
                  <div className="text-[10px] text-emerald-300 font-bold uppercase">OPD Visit Pass</div>
                  <div className="text-sm font-black text-white">{selectedRequestForPass.hospitalName}</div>
                </div>
                <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  CONFIRMED
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-blue-200 uppercase">Patient Name</div>
                  <div className="font-bold">{selectedRequestForPass.patientName}</div>
                  <div className="text-[10px] text-blue-200">ID: {selectedRequestForPass.patientId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-200 uppercase">Token Number</div>
                  <div className="text-base font-black text-amber-300">{selectedRequestForPass.tokenNumber || 'KIMS-08'}</div>
                  <div className="text-[10px] text-emerald-200">{selectedRequestForPass.reportingRoom || 'OPD Suite 102'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-blue-200">Date & Slot</div>
                  <div className="font-bold">{selectedRequestForPass.preferredDate}</div>
                  <div className="text-[10px] text-emerald-300">{selectedRequestForPass.preferredTimeSlot}</div>
                </div>
                <div className="bg-white p-1 rounded-lg">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p>• Please report at the Ayudh Helpdesk Counter 15 minutes before your time slot.</p>
              <p>• Digital Pass valid for priority check-in and doctor consultation.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-[#00703c] text-white text-xs font-black py-2.5 rounded-xl hover:bg-[#005830] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download Slip</span>
              </button>
              <button
                onClick={() => setSelectedRequestForPass(null)}
                className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
