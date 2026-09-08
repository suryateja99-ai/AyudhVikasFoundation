import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  Phone, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Star, 
  ShieldCheck, 
  QrCode, 
  Printer, 
  Download, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  UserCheck, 
  BedDouble, 
  HeartPulse, 
  Sparkles, 
  Pill, 
  Save, 
  Share2, 
  Eye, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Check,
  PhoneCall,
  UserPlus
} from 'lucide-react';
import { HospitalPartner, SeniorDoctor, HospitalVisitRequest, Doctor } from '../types';
import { PARTNER_HOSPITALS, INITIAL_HOSPITAL_VISIT_REQUESTS, SPECIALITIES } from '../data/mockData';
import { PatientVerificationSection, VerifiedAyudhPatient } from './PatientVerificationSection';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';

interface HospitalDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  visitRequests?: HospitalVisitRequest[];
  onUpdateVisitRequestStatus?: (requestId: string, newStatus: HospitalVisitRequest['status'], updateData?: Partial<HospitalVisitRequest>) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  onLogout,
  onNavigateHome,
  visitRequests,
  onUpdateVisitRequestStatus
}) => {
  const { collections, create, update, remove } = useLiveData();
  const { user } = useAuth();
  const liveHospitals = collections.hospitals.length ? collections.hospitals : PARTNER_HOSPITALS;
  // Current logged in hospital (Default to KIMS Hospitals)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(user?.hospitalId || 'hosp-1');
  const currentHospital = liveHospitals.find(h => h.id === selectedHospitalId) || liveHospitals[0];

  const liveVisitRequests = collections.visit_requests.length ? collections.visit_requests : INITIAL_HOSPITAL_VISIT_REQUESTS;
  const allVisitRequests: HospitalVisitRequest[] = (visitRequests && Array.isArray(visitRequests))
    ? visitRequests
    : liveVisitRequests;

  // Active Navigation Tab
  // 'overview' | 'doctors_management' | 'visit_requests' | 'opd_consultations' | 'member_verification' | 'bed_management'
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Doctors Roster State (Initialized from live hospital roster)
  const liveHospitalDoctors = collections.doctors.filter((d: any) => d.hospitalId === currentHospital?.id);
  const [doctorsList, setDoctorsList] = useState<SeniorDoctor[]>(() => {
    return (liveHospitalDoctors.length ? liveHospitalDoctors : currentHospital.seniorDoctors) || [
      {
        id: 'doc-kims-1',
        name: 'Dr. V. Rajeshwar Rao',
        designation: 'Chief Senior Interventional Cardiologist & HOD',
        speciality: 'Cardiologist',
        qualification: 'MBBS, MD (Gen Med), DM (Cardiology), FSCAI',
        experienceYears: 22,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 09:30 AM - 02:30 PM',
        roomNumber: 'OPD Suite 102',
        consultationFee: 700,
        status: 'Active'
      },
      {
        id: 'doc-kims-2',
        name: 'Dr. P. Suresh Reddy',
        designation: 'Senior Consultant Neurologist & Stroke Specialist',
        speciality: 'Neurologist',
        qualification: 'MBBS, MD, DM (Neurology)',
        experienceYears: 18,
        rating: 4.8,
        opdTimings: 'Mon - Fri: 10:00 AM - 03:00 PM',
        roomNumber: 'OPD Suite 108',
        consultationFee: 650,
        status: 'Active'
      },
      {
        id: 'doc-kims-3',
        name: 'Dr. M. Sandhya Rani',
        designation: 'Senior Consultant Gynecologist & High-Risk Pregnancy',
        speciality: 'Gynecologist',
        qualification: 'MBBS, MS (OBG), DGO',
        experienceYears: 16,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 11:00 AM - 04:00 PM',
        roomNumber: 'Women Care OPD 204',
        consultationFee: 600,
        status: 'Active'
      },
      {
        id: 'doc-kims-4',
        name: 'Dr. K. Srinivas Murthy',
        designation: 'Senior General Physician & Diabetologist',
        speciality: 'General Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experienceYears: 20,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 09:00 AM - 01:00 PM, 05:00 PM - 08:00 PM',
        roomNumber: 'OPD Suite 101',
        consultationFee: 500,
        status: 'Active'
      }
    ];
  });

  // Doctor CRUD Modals
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [isEditDoctorModalOpen, setIsEditDoctorModalOpen] = useState(false);
  const [isDeleteDoctorModalOpen, setIsDeleteDoctorModalOpen] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState<SeniorDoctor | null>(null);
  const [selectedDoctorForDelete, setSelectedDoctorForDelete] = useState<SeniorDoctor | null>(null);

  // Doctor Form Fields
  const [docName, setDocName] = useState('');
  const [docDesignation, setDocDesignation] = useState('');
  const [docSpeciality, setDocSpeciality] = useState('Cardiologist');
  const [docQualification, setDocQualification] = useState('');
  const [docExperience, setDocExperience] = useState('10');
  const [docOpdTimings, setDocOpdTimings] = useState('Mon - Sat: 10:00 AM - 02:00 PM');
  const [docRoomNumber, setDocRoomNumber] = useState('OPD Suite 105');
  const [docConsultationFee, setDocConsultationFee] = useState('600');
  const [docStatus, setDocStatus] = useState<SeniorDoctor['status']>('Active');

  // Accept Visit Request Modal State
  const [selectedRequestForAccept, setSelectedRequestForAccept] = useState<HospitalVisitRequest | null>(null);
  const [assignDoctorName, setAssignDoctorName] = useState('');
  const [assignTokenNumber, setAssignTokenNumber] = useState('');
  const [assignRoom, setAssignRoom] = useState('OPD Suite 102');
  const [acceptNotes, setAcceptNotes] = useState('');

  // Prescription Generator State (Doctor OPD feature)
  const [selectedPatientForRx, setSelectedPatientForRx] = useState<any>(null);
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState([
    { name: 'Tab. Telmisartan 40mg', dosage: '1-0-0 (Once daily after breakfast)', duration: '30 Days' },
    { name: 'Tab. Atorvastatin 10mg', dosage: '0-0-1 (Once daily at bedtime)', duration: '30 Days' }
  ]);
  const [rxNewMedName, setRxNewMedName] = useState('');
  const [rxNewMedDosage, setRxNewMedDosage] = useState('');
  const [rxNewMedDuration, setRxNewMedDuration] = useState('15 Days');
  const [rxAdvice, setRxAdvice] = useState('Low salt, low fat diet. Regular 30 min morning walk. Review after 1 month with Serum Lipid Profile.');
  const [isRxGenerated, setIsRxGenerated] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Hospital Visit Requests for current hospital
  const hospitalVisitRequests = (allVisitRequests || []).filter(r => 
    r && (r.hospitalId === selectedHospitalId || r.hospitalName?.toLowerCase().includes(currentHospital.shortName.toLowerCase()))
  );

  useEffect(() => {
    const next = collections.doctors.filter((d: any) => d.hospitalId === currentHospital?.id);
    if (next.length) setDoctorsList(next);
  }, [collections.doctors, currentHospital?.id]);

  // Status Updater with live database persistence
  const handleUpdateStatus = (requestId: string, newStatus: HospitalVisitRequest['status'], updateData?: Partial<HospitalVisitRequest>) => {
    update('visit_requests', requestId, { status: newStatus, ...(updateData || {}) }).catch(console.error);

    if (onUpdateVisitRequestStatus) {
      onUpdateVisitRequestStatus(requestId, newStatus, updateData);
    }
  };

  // Reset Doctor Form
  const resetDoctorForm = () => {
    setDocName('');
    setDocDesignation('');
    setDocSpeciality('Cardiologist');
    setDocQualification('');
    setDocExperience('10');
    setDocOpdTimings('Mon - Sat: 10:00 AM - 02:00 PM');
    setDocRoomNumber('OPD Suite 105');
    setDocConsultationFee('600');
    setDocStatus('Active');
  };

  // Open Edit Doctor Modal
  const handleOpenEditDoctor = (doc: SeniorDoctor) => {
    setSelectedDoctorForEdit(doc);
    setDocName(doc.name);
    setDocDesignation(doc.designation);
    setDocSpeciality(doc.speciality);
    setDocQualification(doc.qualification);
    setDocExperience(String(doc.experienceYears));
    setDocOpdTimings(doc.opdTimings);
    setDocRoomNumber(doc.roomNumber || 'OPD Suite 101');
    setDocConsultationFee(String(doc.consultationFee || 600));
    setDocStatus(doc.status || 'Active');
    setIsEditDoctorModalOpen(true);
  };

  // Save New Doctor
  const handleSaveNewDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const newDoc: SeniorDoctor = {
      id: `doc-${Date.now()}`,
      name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
      designation: docDesignation || 'Senior Consultant',
      speciality: docSpeciality,
      qualification: docQualification || 'MBBS, MD',
      experienceYears: parseInt(docExperience, 10) || 5,
      rating: 4.9,
      opdTimings: docOpdTimings,
      roomNumber: docRoomNumber,
      consultationFee: parseInt(docConsultationFee, 10) || 500,
      status: docStatus || 'Active'
    };

    setDoctorsList(prev => [newDoc, ...prev]);
    create('doctors', { ...newDoc, hospitalId: currentHospital.id, hospital: currentHospital.shortName }).catch(console.error);
    setIsAddDoctorModalOpen(false);
    resetDoctorForm();
    showToast(`Dr. ${newDoc.name} added to Hospital Roster successfully!`);
  };

  // Save Updated Doctor
  const handleSaveUpdatedDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForEdit || !docName.trim()) return;

    setDoctorsList(prev => prev.map(d => {
      if (d.id === selectedDoctorForEdit.id) {
        return {
          ...d,
          name: docName,
          designation: docDesignation,
          speciality: docSpeciality,
          qualification: docQualification,
          experienceYears: parseInt(docExperience, 10) || d.experienceYears,
          opdTimings: docOpdTimings,
          roomNumber: docRoomNumber,
          consultationFee: parseInt(docConsultationFee, 10) || d.consultationFee,
          status: docStatus
        };
      }
      return d;
    }));

    update('doctors', selectedDoctorForEdit.id, {
      name: docName,
      designation: docDesignation,
      speciality: docSpeciality,
      qualification: docQualification,
      experienceYears: parseInt(docExperience, 10),
      opdTimings: docOpdTimings,
      roomNumber: docRoomNumber,
      consultationFee: parseInt(docConsultationFee, 10),
      status: docStatus,
    }).catch(console.error);
    setIsEditDoctorModalOpen(false);
    setSelectedDoctorForEdit(null);
    showToast(`Doctor details updated successfully!`);
  };

  // Delete Doctor
  const handleDeleteDoctor = () => {
    if (!selectedDoctorForDelete) return;
    const id = selectedDoctorForDelete.id;
    setDoctorsList(prev => prev.filter(d => d.id !== id));
    remove('doctors', id).catch(console.error);
    setIsDeleteDoctorModalOpen(false);
    setSelectedDoctorForDelete(null);
    showToast(`Doctor removed from Hospital Roster.`);
  };

  // Quick Toggle Doctor Status
  const handleToggleDoctorStatus = (docId: string) => {
    setDoctorsList(prev => prev.map(d => {
      if (d.id === docId) {
        const nextStatus: SeniorDoctor['status'] = 
          d.status === 'Active' ? 'On Leave' :
          d.status === 'On Leave' ? 'Emergency Only' : 'Active';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
    showToast('Doctor on-duty status updated!');
  };

  // Open Accept Request Modal
  const handleOpenAcceptModal = (req: HospitalVisitRequest) => {
    setSelectedRequestForAccept(req);
    setAssignDoctorName(req.doctorName || doctorsList[0]?.name || 'Dr. V. Rajeshwar Rao');
    setAssignTokenNumber(`KIMS-OPD-${Math.floor(10 + Math.random() * 89)}`);
    setAssignRoom('OPD Suite 102 (1st Floor)');
    setAcceptNotes('Visit Confirmed. Please report to Ayudh Cashless Desk Counter 4 with your Digital ID card 15 minutes before the slot.');
  };

  // Confirm Accept Request
  const handleConfirmAcceptRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForAccept) return;

    handleUpdateStatus(selectedRequestForAccept.id, 'Accepted', {
      doctorName: assignDoctorName,
      tokenNumber: assignTokenNumber,
      reportingRoom: assignRoom,
      hospitalNotes: acceptNotes,
      acceptedAt: 'Today, Just Now'
    });

    setSelectedRequestForAccept(null);
    showToast(`Visit request accepted! Token ${assignTokenNumber} assigned to patient.`);
  };

  // Add medicine to Rx
  const handleAddMedicineToRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxNewMedName) return;
    setRxMedicines(prev => [...prev, { name: rxNewMedName, dosage: rxNewMedDosage || '1-0-1', duration: rxNewMedDuration }]);
    setRxNewMedName('');
    setRxNewMedDosage('');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f2e5a] text-white text-xs font-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / HOSPITAL PORTAL HEADER */}
      <header className="bg-gradient-to-r from-[#0a2540] via-[#0f3b6c] to-[#0052cc] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Hospital Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${currentHospital.logoBg} text-white flex items-center justify-center font-black text-xs shadow-md border border-white/20`}>
              {currentHospital.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                  {currentHospital.name}
                </h1>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/40 uppercase tracking-wider">
                  Partner Hospital Portal
                </span>
              </div>
              <div className="text-[11px] text-blue-200 flex items-center gap-2 mt-0.5">
                <span>📍 {currentHospital.district}</span>
                <span>•</span>
                <span>🛏️ {currentHospital.availableBeds} Beds Free</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">Ayudh Cashless Empanelled</span>
              </div>
            </div>
          </div>

          {/* Right: Hospital Admin User & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                KH
              </div>
              <div className="text-left text-xs">
                <div className="font-black text-white">Hospital Administration</div>
                <div className="text-[10px] text-blue-200">KIMS Warangal Branch</div>
              </div>
            </div>

            <button
              onClick={onNavigateHome}
              className="text-xs bg-white/15 hover:bg-white/25 text-white font-bold px-3 py-2 rounded-xl transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Public Portal</span>
            </button>

            <button
              onClick={onLogout}
              className="text-xs bg-red-500/20 hover:bg-red-600/30 text-red-200 font-bold px-3 py-2 rounded-xl border border-red-400/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-white/15 py-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#0f2e5a] shadow-xs'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hospital Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors_management')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'doctors_management'
                ? 'bg-white text-[#0f2e5a] shadow-xs'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            <span>Manage Doctors ({doctorsList.length})</span>
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
              Add / Update
            </span>
          </button>

          <button
            onClick={() => setActiveTab('visit_requests')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
              activeTab === 'visit_requests'
                ? 'bg-white text-[#0f2e5a] shadow-xs'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Patient Visit Requests ({hospitalVisitRequests.length})</span>
            {hospitalVisitRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {hospitalVisitRequests.filter(r => r.status === 'Pending').length} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('opd_consultations')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'opd_consultations'
                ? 'bg-white text-[#0f2e5a] shadow-xs'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Doctor OPD & Prescriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('member_verification')}
            className={`px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'member_verification'
                ? 'bg-white text-[#0f2e5a] shadow-xs'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ayudh Smart Card Verification</span>
          </button>
        </div>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">

        {/* TAB 1: HOSPITAL OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f2e5a]">{doctorsList.length}</div>
                  <div className="text-xs font-semibold text-slate-500">Active Senior Doctors</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    {doctorsList.filter(d => d.status === 'Active').length} on Duty Today
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f2e5a]">{hospitalVisitRequests.length}</div>
                  <div className="text-xs font-semibold text-slate-500">Visit Requests Today</div>
                  <div className="text-[10px] text-amber-600 font-bold mt-0.5">
                    {hospitalVisitRequests.filter(r => r.status === 'Pending').length} Pending Acceptance
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f2e5a]">{currentHospital.availableBeds} / {currentHospital.totalBeds}</div>
                  <div className="text-xs font-semibold text-slate-500">Beds Available</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{currentHospital.icuBeds} ICU Beds Ready</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0f2e5a]">₹1,48,500</div>
                  <div className="text-xs font-semibold text-slate-500">Ayudh Cashless Settlements</div>
                  <div className="text-[10px] text-purple-600 font-bold mt-0.5">38 Claims Processed</div>
                </div>
              </div>
            </div>

            {/* Hospital Quick Action Banners */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Incoming Visit Requests & Doctor OPD Status */}
              <div className="lg:col-span-2 space-y-6">
                {/* Live Visit Requests Quick Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#0f2e5a]">Patient Visit Requests Queue</h3>
                      <p className="text-xs text-slate-500">Review, accept, and allocate OP tokens to incoming patient visits</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('visit_requests')}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All ({hospitalVisitRequests.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {hospitalVisitRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{req.patientName}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">({req.patientGender}, {req.patientAge}y)</span>
                            <span className={`text-[9px] font-black px-2 py-0.2 rounded-full uppercase ${
                              req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">
                            <strong>Dept:</strong> {req.department} • <strong>Slot:</strong> {req.preferredDate} ({req.preferredTimeSlot})
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            <strong>Symptoms:</strong> {req.chiefComplaint || (req.symptoms ? req.symptoms.join(', ') : 'General OPD Checkup')}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {req.status === 'Pending' ? (
                            <button
                              onClick={() => handleOpenAcceptModal(req)}
                              className="bg-[#00703c] hover:bg-[#005830] text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Request</span>
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-black flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Token: {req.tokenNumber}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctors Live Status Roster */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#0f2e5a]">Hospital Doctors Roster</h3>
                      <p className="text-xs text-slate-500">Live consulting status & schedule</p>
                    </div>
                    <button
                      onClick={() => {
                        resetDoctorForm();
                        setIsAddDoctorModalOpen(true);
                      }}
                      className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Doctor</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctorsList.map((doc) => (
                      <div key={doc.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between gap-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-black text-[#0f2e5a]">{doc.name}</div>
                            <div className="text-[10px] text-emerald-700 font-bold">{doc.speciality}</div>
                            <div className="text-[10px] text-slate-500">{doc.designation}</div>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            doc.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            doc.status === 'On Leave' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.status || 'Active'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{doc.opdTimings}</span>
                          <button
                            onClick={() => handleToggleDoctorStatus(doc.id)}
                            className="text-blue-700 hover:underline font-bold cursor-pointer"
                          >
                            Toggle Status
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Hospital Details & Emergency Hotline */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#0a2540] to-[#0f3b6c] text-white rounded-2xl p-5 shadow-md space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/20 pb-3">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black">{currentHospital.shortName}</h4>
                      <p className="text-[11px] text-blue-200">Registered Empanelled Facility</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-blue-300 uppercase block">Address</span>
                      <p className="font-semibold text-white">{currentHospital.address}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-300 uppercase block">Emergency 24x7 Hotline</span>
                      <p className="font-bold text-amber-300">{currentHospital.emergencyPhone || currentHospital.phone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-300 uppercase block">Ayudh Cashless Desk</span>
                      <p className="font-semibold text-emerald-300">Counter No. 4 (Ground Floor, Main Reception)</p>
                    </div>
                  </div>
                </div>

                {/* Facilities List */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-black text-[#0f2e5a] uppercase tracking-wide">Key Facilities & ICU</h4>
                  <div className="space-y-2 text-xs">
                    {currentHospital.facilities?.map((fac, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCTOR ROSTER MANAGEMENT (ADD / UPDATE / DELETE DOCTORS) */}
        {activeTab === 'doctors_management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#0f2e5a]">Hospital Doctors Roster Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add, update, or remove senior doctors, edit consulting hours, rooms, and consultation fees for {currentHospital.name}.
                </p>
              </div>

              <button
                onClick={() => {
                  resetDoctorForm();
                  setIsAddDoctorModalOpen(true);
                }}
                className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Senior Doctor</span>
              </button>
            </div>

            {/* Doctors Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorsList.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 p-5 shadow-xs space-y-3 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-[#0f2e5a]">{doc.name}</h3>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                          {doc.speciality}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        doc.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        doc.status === 'On Leave' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status || 'Active'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">{doc.designation}</p>
                    <p className="text-[11px] text-slate-500">{doc.qualification} • {doc.experienceYears} yrs experience</p>

                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">OPD Timings:</span>
                        <span className="font-semibold text-slate-700 text-[11px]">{doc.opdTimings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Room No:</span>
                        <span className="font-bold text-emerald-700 text-[11px]">{doc.roomNumber || 'Suite 101'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Consultation Fee:</span>
                        <span className="font-black text-slate-900 text-[11px]">₹{doc.consultationFee || 500}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Card Action Buttons: Edit, Toggle Status, Delete */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleDoctorStatus(doc.id)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Toggle Duty
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditDoctor(doc)}
                        className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDoctorForDelete(doc);
                          setIsDeleteDoctorModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PATIENT VISIT REQUESTS MANAGEMENT */}
        {activeTab === 'visit_requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#0f2e5a]">Hospital Visit Requests Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accept visit requests, assign doctor OPD rooms and token numbers, or reschedule consultations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {hospitalVisitRequests.length} Total Requests
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {hospitalVisitRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-3 ${
                    req.status === 'Accepted' ? 'border-emerald-300' : 'border-amber-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                        req.status === 'Accepted' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}>
                        {req.status === 'Accepted' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-500">REQ #{req.requestId}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#0f2e5a] mt-0.5">
                          {req.patientName} • Ph: {req.patientPhone} (Age: {req.patientAge}, {req.patientGender})
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleOpenAcceptModal(req)}
                          className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept & Issue Token</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPatientForRx({
                              name: req.patientName,
                              phone: req.patientPhone,
                              age: req.patientAge,
                              gender: req.patientGender,
                              token: req.tokenNumber,
                              department: req.department
                            });
                            setActiveTab('opd_consultations');
                          }}
                          className="bg-[#0f2e5a] hover:bg-[#0a2040] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                          <span>Start OPD Consultation</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visit Request Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Requested Department</span>
                      <div className="font-bold text-slate-800 mt-0.5">{req.department}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{req.doctorName || 'Senior Duty Specialist'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Requested Slot</span>
                      <div className="font-bold text-slate-800 mt-0.5">{req.preferredDate}</div>
                      <div className="text-[11px] text-slate-500">{req.preferredTimeSlot}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Token & Room Allotted</span>
                      {req.tokenNumber ? (
                        <>
                          <div className="font-black text-emerald-700 mt-0.5">{req.tokenNumber}</div>
                          <div className="text-[11px] text-slate-600">{req.reportingRoom}</div>
                        </>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Pending Token Generation</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Ayudh Card Privilege</span>
                      <div className="font-bold text-emerald-800 mt-0.5">✓ Cashless Empanelled</div>
                      <div className="text-[10px] text-slate-500">ID: {req.patientId}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border border-slate-100">
                    <strong>Symptoms / Reason:</strong> {req.chiefComplaint || (req.symptoms ? req.symptoms.join(', ') : 'General OPD Consultation')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DOCTOR OPD CONSULTATION & PRESCRIPTIONS (Identical Doctor Functionality) */}
        {activeTab === 'opd_consultations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-[#0f2e5a]">Doctor OPD Consultation & Digital Prescriptions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Write clinical findings, prescribe medications, order lab investigations, and issue official digital Rx slips.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Active Consulting Doctor:</span>
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-xl">
                  {doctorsList[0]?.name || 'Dr. V. Rajeshwar Rao'}
                </span>
              </div>
            </div>

            {/* OPD Consultation Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Patient Info & Vitals */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-[#0f2e5a] uppercase tracking-wide border-b pb-2">
                  Active OP Patient
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                    <span className="text-base font-black text-slate-900">
                      {selectedPatientForRx?.name || 'Ramesh Kumar'}
                    </span>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Ayudh Patient ID: AVP100245 (Gold Member)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Age / Gender</span>
                      <span className="font-bold">42 yrs / Male</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Blood Group</span>
                      <span className="font-bold text-red-600">B+ve</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Blood Pressure</span>
                      <span className="font-bold text-slate-800">128/84 mmHg</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-400 text-[10px] uppercase block">Pulse / SpO2</span>
                      <span className="font-bold text-slate-800">76 bpm / 98%</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900">
                    <strong>Allergies:</strong> Penicillin allergic. No NSAID intolerance noted.
                  </div>
                </div>
              </div>

              {/* Right 2 Cols: Prescription Editor & Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-black text-[#0f2e5a] uppercase tracking-wide border-b pb-2 flex items-center justify-between">
                  <span>Clinical Prescription & Diet Advice</span>
                  <span className="text-emerald-700 font-bold">OP Token: KIMS-CARD-08</span>
                </h3>

                <div className="space-y-4 text-xs">
                  {/* Diagnosis */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Clinical Diagnosis & Findings *</label>
                    <input
                      type="text"
                      placeholder="e.g. Essential Hypertension, Atypical Chest Discomfort, Normal Baseline ECG"
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {/* Medicines List */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Prescribed Medications</label>
                    <div className="space-y-2 mb-3">
                      {rxMedicines.map((med, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-black text-slate-900">{med.name}</div>
                            <div className="text-[10px] text-slate-600">{med.dosage} • Duration: {med.duration}</div>
                          </div>
                          <button
                            onClick={() => setRxMedicines(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Medicine Mini Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Medicine name (e.g. Tab. Telmisartan 40mg)"
                          value={rxNewMedName}
                          onChange={(e) => setRxNewMedName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 1-0-0 After food)"
                          value={rxNewMedDosage}
                          onChange={(e) => setRxNewMedDosage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3 flex gap-1">
                        <button
                          type="button"
                          onClick={handleAddMedicineToRx}
                          className="w-full bg-[#00703c] text-white font-bold py-1.5 rounded-lg text-xs hover:bg-[#005830] transition-all cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Advice & Follow up */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Doctor Advice & Follow-Up</label>
                    <textarea
                      rows={2}
                      value={rxAdvice}
                      onChange={(e) => setRxAdvice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsRxGenerated(true);
                        showToast('Digital Prescription generated and synchronized to Patient Health Records!');
                      }}
                      className="bg-[#00703c] hover:bg-[#005830] text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Issue & Print Digital Rx</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AYUDH SMART CARD VERIFICATION */}
        {activeTab === 'member_verification' && (
          <div className="space-y-6">
            <PatientVerificationSection />
          </div>
        )}

      </main>

      {/* MODAL 1: ADD SENIOR DOCTOR */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-[#0f2e5a]">Add New Senior Doctor to Roster</h3>
              </div>
              <button
                onClick={() => setIsAddDoctorModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDoctor} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. A. Madhava Rao"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Speciality *</label>
                  <select
                    value={docSpeciality}
                    onChange={(e) => setDocSpeciality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    {SPECIALITIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Consultant Cardiologist & HOD"
                    value={docDesignation}
                    onChange={(e) => setDocDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MD, DM, FSCAI"
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Experience (Yrs) *</label>
                  <input
                    type="number"
                    required
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">OPD Room No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OPD Suite 104"
                    value={docRoomNumber}
                    onChange={(e) => setDocRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={docConsultationFee}
                    onChange={(e) => setDocConsultationFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">OPD Consulting Hours *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mon - Sat: 09:30 AM - 02:30 PM"
                  value={docOpdTimings}
                  onChange={(e) => setDocOpdTimings(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Status</label>
                <select
                  value={docStatus}
                  onChange={(e) => setDocStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="Active">Active (On Duty in OPD)</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Emergency Only">Emergency On-Call Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00703c] hover:bg-[#005830] text-white font-black px-6 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT DOCTOR */}
      {isEditDoctorModalOpen && selectedDoctorForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-[#0f2e5a]">Edit Doctor Information</h3>
              </div>
              <button
                onClick={() => setIsEditDoctorModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdatedDoctor} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Speciality *</label>
                  <select
                    value={docSpeciality}
                    onChange={(e) => setDocSpeciality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                  >
                    {SPECIALITIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={docDesignation}
                    onChange={(e) => setDocDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">OPD Room No</label>
                  <input
                    type="text"
                    value={docRoomNumber}
                    onChange={(e) => setDocRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={docConsultationFee}
                    onChange={(e) => setDocConsultationFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">OPD Consulting Hours</label>
                <input
                  type="text"
                  value={docOpdTimings}
                  onChange={(e) => setDocOpdTimings(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={docStatus}
                  onChange={(e) => setDocStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="Active">Active (On Duty)</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Emergency Only">Emergency Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE DOCTOR CONFIRMATION */}
      {isDeleteDoctorModalOpen && selectedDoctorForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Remove Doctor from Roster?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{selectedDoctorForDelete.name}</strong> ({selectedDoctorForDelete.speciality}) from {currentHospital.shortName}?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteDoctorModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
                className="flex-1 bg-red-600 text-white text-xs font-black py-2.5 rounded-xl hover:bg-red-700 cursor-pointer"
              >
                Yes, Remove Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ACCEPT VISIT REQUEST & ALLOT TOKEN */}
      {selectedRequestForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-[#0f2e5a]">Accept Patient Visit Request</h3>
              </div>
              <button
                onClick={() => setSelectedRequestForAccept(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAcceptRequest} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Patient: {selectedRequestForAccept.patientName}</div>
                <div className="text-slate-500">Dept: {selectedRequestForAccept.department} • {selectedRequestForAccept.preferredDate}</div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assign Senior Doctor *</label>
                <select
                  value={assignDoctorName}
                  onChange={(e) => setAssignDoctorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  {doctorsList.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.speciality} - {d.roomNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Generated Token No *</label>
                  <input
                    type="text"
                    required
                    value={assignTokenNumber}
                    onChange={(e) => setAssignTokenNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reporting Room *</label>
                  <input
                    type="text"
                    required
                    value={assignRoom}
                    onChange={(e) => setAssignRoom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instructions for Patient</label>
                <textarea
                  rows={2}
                  value={acceptNotes}
                  onChange={(e) => setAcceptNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForAccept(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00703c] hover:bg-[#005830] text-white font-black px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Confirm & Notify Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
