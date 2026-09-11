import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Menu, 
  Headphones, 
  Bell, 
  ChevronDown, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Stethoscope, 
  FileText, 
  BarChart3, 
  IndianRupee, 
  UserRound, 
  Clock, 
  MessageSquare, 
  LifeBuoy, 
  Settings, 
  ChevronRight, 
  Star, 
  ArrowRight, 
  UserPlus, 
  RefreshCw, 
  FileCheck, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Plus, 
  Download, 
  Share2, 
  Printer, 
  LogOut,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Check,
  Award,
  Hospital,
  Edit3,
  Save,
  CheckCircle,
  XCircle,
  Eye,
  Sliders,
  QrCode,
  User
} from 'lucide-react';
import { DoctorAppointmentsPage, DoctorAppointmentItem } from './DoctorAppointmentsPage';
import { PatientVerificationSection, VerifiedAyudhPatient } from './PatientVerificationSection';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { LiveStatusBadge } from './LiveStatusBadge';
import { BrandLogo } from './BrandLogo';
import { NotificationBell } from './NotificationBell';

export interface DoctorPatientRecord {
  id: string;
  uhid: string;
  memberId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
  avatar: string;
  membershipTier: string;
  status: string;
  lastVisit: string;
  bp: string;
  heartRate: string;
  chronicConditions?: string[];
  allergies?: string[];
  currentMedications?: string[];
  verificationMethod?: string;
  verifiedAt?: string;
}

const INITIAL_REGISTERED_PATIENTS: DoctorPatientRecord[] = [
  {
    id: 'PAT-001',
    uhid: 'UHID-AV-884102',
    memberId: 'AV-2024-8841',
    patientName: 'Ramesh Kumar',
    age: 56,
    gender: 'Male',
    phone: '9876543210',
    bloodGroup: 'O+',
    avatar: '/src/assets/images/patient_avatar_1787229395408.jpg',
    membershipTier: 'Gold Health Care Member',
    status: 'Verified Ayudh Member',
    lastVisit: '10 May 2024',
    bp: '128/82 mmHg',
    heartRate: '72 bpm',
    chronicConditions: ['Hypertension', 'Post-PTCA Stenting (LAD 2023)'],
    allergies: ['Penicillin'],
    currentMedications: ['Tab. Aspirin 75mg', 'Tab. Atorvastatin 20mg'],
    verificationMethod: 'Physical Smart Card QR Scan',
    verifiedAt: '09:15 AM'
  },
  {
    id: 'PAT-002',
    uhid: 'UHID-AV-902145',
    memberId: 'AV-2024-9021',
    patientName: 'Lakshmi Devi',
    age: 48,
    gender: 'Female',
    phone: '9440123456',
    bloodGroup: 'B+',
    avatar: '/src/assets/images/support_agent_female_1785560510481.jpg',
    membershipTier: 'Silver Health Care Member',
    status: 'Verified Ayudh Member',
    lastVisit: '18 May 2024',
    bp: '142/90 mmHg',
    heartRate: '86 bpm',
    chronicConditions: ['Mild Angina Pectoris', 'Grade 1 Fatty Liver'],
    allergies: ['Sulfa drugs'],
    currentMedications: ['Tab. Metoprolol XL 25mg', 'Tab. Sorbitrate 5mg SOS'],
    verificationMethod: 'Physical Smart Card QR Scan',
    verifiedAt: '10:00 AM'
  },
  {
    id: 'PAT-003',
    uhid: 'UHID-AV-551098',
    memberId: 'AV-2024-5510',
    patientName: 'Suresh Babu',
    age: 66,
    gender: 'Male',
    phone: '9848011223',
    bloodGroup: 'AB+',
    avatar: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
    membershipTier: 'Senior Citizen Life Member',
    status: 'Verified Ayudh Member',
    lastVisit: '15 Apr 2024',
    bp: '150/95 mmHg',
    heartRate: '78 bpm',
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Hypertension'],
    allergies: ['NSAIDs'],
    currentMedications: ['Tab. Metformin 500mg', 'Tab. Telmisartan 40mg'],
    verificationMethod: 'Ayudh Vikas Member ID',
    verifiedAt: '11:10 AM'
  },
  {
    id: 'PAT-004',
    uhid: 'UHID-AV-441203',
    memberId: 'AV-2024-4412',
    patientName: 'Anitha Reddy',
    age: 48,
    gender: 'Female',
    phone: '9989012345',
    bloodGroup: 'A+',
    avatar: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
    membershipTier: 'Gold Health Care Member',
    status: 'Verified Ayudh Member',
    lastVisit: '02 May 2024',
    bp: '120/80 mmHg',
    heartRate: '70 bpm',
    chronicConditions: ['Hypothyroidism', 'Mild Cardiac Arrhythmia'],
    allergies: ['Ciprofloxacin'],
    currentMedications: ['Tab. Thyronorm 50mcg', 'Tab. Propranolol 20mg'],
    verificationMethod: 'Clinic Registry',
    verifiedAt: '02 May 2024'
  },
  {
    id: 'PAT-005',
    uhid: 'UHID-AV-773391',
    memberId: 'AV-2024-7733',
    patientName: 'Venkateshwarlu G.',
    age: 59,
    gender: 'Male',
    phone: '9000112244',
    bloodGroup: 'O+',
    avatar: '/src/assets/images/partner_doctor_kims_1787229821989.jpg',
    membershipTier: 'Rural Ayush Member',
    status: 'Verified Ayudh Member',
    lastVisit: '18 Jul 2024',
    bp: '130/85 mmHg',
    heartRate: '74 bpm',
    chronicConditions: ['Severe Hypertension'],
    allergies: ['No known allergies'],
    currentMedications: ['Tab. Cilnidipine 10mg'],
    verificationMethod: 'Ayudh Vikas Member ID',
    verifiedAt: '18 Jul 2024'
  }
];

// Helper to safely read from localStorage
const getSavedState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
  }
  return defaultValue;
};

interface DoctorDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  initialNav?: 'Dashboard' | 'Appointments' | 'Patients' | 'Consultations' | 'Prescriptions' | 'Reports' | 'Earnings' | 'Profile' | 'Availability' | 'Messages' | 'Notifications' | 'Settings';
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  onLogout,
  onNavigateHome,
  initialNav
}) => {
  const [activeNav, setActiveNav] = useState<'Dashboard' | 'Appointments' | 'Patients' | 'Consultations' | 'Prescriptions' | 'Reports' | 'Earnings' | 'Profile' | 'Availability' | 'Messages' | 'Notifications' | 'Settings'>(() => initialNav || getSavedState('ayudh_doc_activeNav', 'Dashboard'));
  const [appointmentsSubTab, setAppointmentsSubTab] = useState<'confirmed' | 'pending' | 'rejected'>(() => getSavedState('ayudh_doc_appointmentsSubTab', 'confirmed'));
  const [patientsSubTab, setPatientsSubTab] = useState<'directory' | 'verify' | 'all'>(() => getSavedState('ayudh_doc_patientsSubTab', 'directory'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState('This Month');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState<any>(null);
  const [selectedConsultationModal, setSelectedConsultationModal] = useState<any>(null);
  const [showAllAppointmentsModal, setShowAllAppointmentsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [walkInToast, setWalkInToast] = useState<string | null>(null);
  const { user } = useAuth();
  const { collections, loading: liveLoading } = useLiveData();
  const liveAppointments = (collections.appointments || []).filter((item: any) =>
    !user?.doctorId || item.doctorId === user.doctorId || String(item.doctorName || '').toLowerCase().includes(String(user?.name || '').toLowerCase())
  );
  const livePatients = (collections.patients || []);
  const unreadLive = (collections.notifications || []).filter((n: any) => n.userId === user?.id && !n.read);

  // Registered Patients List for Dr. Ravi Teja (persisted in localStorage)
  const [registeredPatients, setRegisteredPatients] = useState<DoctorPatientRecord[]>(() =>
    getSavedState('ayudh_doc_registeredPatients', INITIAL_REGISTERED_PATIENTS)
  );
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientFilterTier, setPatientFilterTier] = useState<string>('All');

  // Persist doctor state across page refreshes
  useEffect(() => {
    localStorage.setItem('ayudh_doc_activeNav', JSON.stringify(activeNav));
  }, [activeNav]);

  useEffect(() => {
    if (initialNav) setActiveNav(initialNav);
  }, [initialNav]);

  useEffect(() => {
    localStorage.setItem('ayudh_doc_appointmentsSubTab', JSON.stringify(appointmentsSubTab));
  }, [appointmentsSubTab]);

  useEffect(() => {
    localStorage.setItem('ayudh_doc_patientsSubTab', JSON.stringify(patientsSubTab));
  }, [patientsSubTab]);

  useEffect(() => {
    localStorage.setItem('ayudh_doc_registeredPatients', JSON.stringify(registeredPatients));
  }, [registeredPatients]);

  // Doctor profile details
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Ravi Teja',
    title: 'MD, DM (Cardiology), FACC',
    speciality: 'Senior Interventional Cardiologist',
    regNumber: 'TSMC/2014/84920',
    avatar: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
    hospital: 'Ayudh Vikas Heart Care Centre & MGM Hospital',
    department: 'Department of Cardiology & Cath Lab',
    experience: '12+ Years Clinical & Interventional Experience',
    rating: '4.8 / 5 (384 reviews)',
    consultationFee: '₹ 500',
    phone: '+91 90000 12345',
    email: 'dr.raviteja@ayudhvikas.org',
    opdTimings: 'Mon - Sat: 09:30 AM - 02:00 PM & 05:00 PM - 08:30 PM',
    bio: 'Specialist in Primary Angioplasty, Complex Coronary Interventions, Pacemaker Implantation, Heart Failure Management, and Preventive Cardiology.',
    patientsToday: 18,
    totalPatients: 256,
    consultationsToday: 32,
    thisMonthEarnings: '₹ 48,750'
  });

  // 5 Today's Appointments matching exact image (dynamic state to support direct walk-ins)
  const [todaysAppointments, setTodaysAppointments] = useState([
    {
      id: 'APT-01',
      time: '09:30',
      period: 'AM',
      patientName: 'Ramesh Kumar',
      age: 56,
      gender: 'Male',
      type: 'Follow-up',
      reason: 'ECG Review',
      status: 'Confirmed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      avatar: '/src/assets/images/patient_avatar_1787229395408.jpg',
      phone: '9876543210',
      bp: '128/82 mmHg',
      heartRate: '72 bpm',
      lastVisit: '10 May 2024'
    },
    {
      id: 'APT-02',
      time: '10:30',
      period: 'AM',
      patientName: 'Lakshmi Devi',
      age: 48,
      gender: 'Female',
      type: 'Consultation',
      reason: 'Chest Pain',
      status: 'Arrived',
      statusColor: 'bg-sky-50 text-sky-700 border-sky-300',
      avatar: '/src/assets/images/support_agent_female_1785560510481.jpg',
      phone: '9440123456',
      bp: '142/90 mmHg',
      heartRate: '86 bpm',
      lastVisit: 'First Visit'
    },
    {
      id: 'APT-03',
      time: '11:30',
      period: 'AM',
      patientName: 'Suresh Babu',
      age: 66,
      gender: 'Male',
      type: 'Consultation',
      reason: 'BP & Sugar',
      status: 'Confirmed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      avatar: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
      phone: '9848011223',
      bp: '150/95 mmHg',
      heartRate: '78 bpm',
      lastVisit: '15 Apr 2024'
    },
    {
      id: 'APT-04',
      time: '12:30',
      period: 'PM',
      patientName: 'Anitha Reddy',
      age: 48,
      gender: 'Female',
      type: 'Follow-up',
      reason: 'Medication Review',
      status: 'Pending',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-300',
      avatar: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
      phone: '9989012345',
      bp: '120/80 mmHg',
      heartRate: '70 bpm',
      lastVisit: '02 May 2024'
    },
    {
      id: 'APT-05',
      time: '02:00',
      period: 'PM',
      patientName: 'Venkatesh',
      age: 56,
      gender: 'Male',
      type: 'Consultation',
      reason: 'Heart Checkup',
      status: 'Confirmed',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      avatar: '/src/assets/images/partner_doctor_kims_1787229821989.jpg',
      phone: '9701234567',
      bp: '130/85 mmHg',
      heartRate: '74 bpm',
      lastVisit: 'First Visit'
    }
  ]);

  // Handler: When a patient is verified via QR Code scan or Member ID
  const handlePatientVerified = (patient: VerifiedAyudhPatient, method: string) => {
    setRegisteredPatients(prev => {
      const exists = prev.find(p => p.memberId === patient.memberId || p.phone === patient.phone);
      const newRecord: DoctorPatientRecord = {
        id: exists ? exists.id : `PAT-${Date.now()}`,
        uhid: patient.uhid,
        memberId: patient.memberId,
        patientName: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        avatar: patient.avatar,
        membershipTier: patient.membershipTier,
        status: 'Verified Ayudh Member',
        lastVisit: 'Today (Verified)',
        bp: '128/82 mmHg',
        heartRate: '74 bpm',
        chronicConditions: patient.chronicConditions,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications,
        verificationMethod: method,
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (exists) {
        return [newRecord, ...prev.filter(p => p.memberId !== patient.memberId && p.phone !== patient.phone)];
      }
      return [newRecord, ...prev];
    });

    setWalkInToast(`Patient ${patient.name} (${patient.memberId}) verified via ${method} & listed in your Patients directory!`);
    setTimeout(() => setWalkInToast(null), 5000);
  };

  // Handler: When a direct walk-in patient is verified and token is generated
  const handleWalkInPatientAdded = (patient: VerifiedAyudhPatient, tokenNumber: string) => {
    // Add to registered patients as well
    handlePatientVerified(patient, 'Walk-In OP Token Issue');

    const newWalkIn = {
      id: `APT-WALK-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      period: 'PM',
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      type: 'Direct Walk-in',
      reason: `Verified Ayudh Vikas Member (${patient.membershipTier})`,
      status: 'Arrived',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      avatar: patient.avatar,
      phone: patient.phone,
      bp: '130/85 mmHg',
      heartRate: '76 bpm',
      lastVisit: patient.lastVisitDate
    };

    setTodaysAppointments(prev => [newWalkIn, ...prev]);
    setDoctorInfo(prev => ({
      ...prev,
      patientsToday: prev.patientsToday + 1,
      consultationsToday: prev.consultationsToday + 1
    }));

    setWalkInToast(`Walk-in patient ${patient.name} verified & assigned Token #${tokenNumber}! Listed in Patients registry.`);
    setTimeout(() => setWalkInToast(null), 5000);
  };

  // Upcoming Schedule matching exact image
  const upcomingSchedule = [
    {
      day: '24',
      month: 'May',
      title: 'Health Checkup Camp',
      location: 'Warangal, MGM Hospital',
      time: '09:00 AM - 04:00 PM',
      color: 'bg-blue-600',
      dotColor: 'text-blue-600'
    },
    {
      day: '26',
      month: 'May',
      title: 'Cardiology OP',
      location: 'Ayudh Vikas Health Center',
      time: '10:00 AM - 01:00 PM',
      color: 'bg-emerald-600',
      dotColor: 'text-emerald-600'
    },
    {
      day: '28',
      month: 'May',
      title: 'Awareness Program',
      location: 'Hanamkonda',
      time: '03:00 PM - 05:00 PM',
      color: 'bg-purple-600',
      dotColor: 'text-purple-600'
    }
  ];

  // Recent Consultations matching exact image
  const recentConsultations = [
    {
      id: 'RC-01',
      patientName: 'Ramesh Kumar',
      date: '23 May 2024',
      primaryFinding: 'ECG Normal',
      advice: 'Continue medication',
      avatar: '/src/assets/images/patient_avatar_1787229395408.jpg'
    },
    {
      id: 'RC-02',
      patientName: 'Lakshmi Devi',
      date: '23 May 2024',
      primaryFinding: 'BP Controlled',
      advice: 'Advised regular walk',
      avatar: '/src/assets/images/support_agent_female_1785560510481.jpg'
    },
    {
      id: 'RC-03',
      patientName: 'Suresh Babu',
      date: '23 May 2024',
      primaryFinding: 'Sugar High',
      advice: 'Diet & medication advised',
      avatar: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg'
    }
  ];

  // Notifications list matching exact image
  const notifications = [
    {
      id: 'N-01',
      icon: Clock,
      iconBg: 'bg-emerald-100 text-emerald-700',
      title: 'New appointment booked',
      subtitle: 'by Pradeep Kumar at 04:30 PM',
      time: '10 min ago'
    },
    {
      id: 'N-02',
      icon: Users,
      iconBg: 'bg-purple-100 text-purple-700',
      title: 'Health Camp scheduled',
      subtitle: 'on 26 May 2024',
      time: '1 hour ago'
    },
    {
      id: 'N-03',
      icon: CheckCircle2,
      iconBg: 'bg-blue-100 text-blue-700',
      title: 'Payment received',
      subtitle: '₹1,500 from Ramesh Kumar',
      time: '2 hours ago'
    }
  ];

  // Nav handler
  const handleNavClick = (nav: any, sub: 'confirmed' | 'pending' | 'rejected' = 'confirmed') => {
    setActiveNav(nav);
    if (nav === 'Appointments') {
      setAppointmentsSubTab(sub);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP HEADER BAR: EXACT REPLICA OF THE IMAGE */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-2xs">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Logo & Welcome text */}
          <div className="flex items-center gap-4">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0" 
              onClick={onNavigateHome}
            >
              <BrandLogo className="w-9 h-9 shadow-2xs" />
              <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-black text-[#0f2e5a] tracking-tight leading-none uppercase font-sans">
                  AYUDH VIKAS
                </h1>
                <span className="text-[9px] font-extrabold text-[#006633] tracking-wider uppercase leading-tight">
                  HEALTH CARE NETWORK
                </span>
                <span className="text-[7.5px] font-semibold text-slate-500 tracking-wider">
                  Care Beyond Boundaries
                </span>
              </div>
            </div>

            {/* Hamburger Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer ml-2"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Welcome Greeting */}
            <div className="hidden md:flex flex-col ml-2">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Welcome, {doctorInfo.name}</span>
                <span className="text-base">👋</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                Here's what's happening with your practice today.
                <LiveStatusBadge />
              </p>
            </div>

          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            
            {/* Quick Direct Patient Verification Button */}
            <button
              onClick={() => {
                setActiveNav('Patients');
                setPatientsSubTab('verify');
              }}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs"
              title="Verify unbooked or direct walk-in Ayudh Vikas member"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">Verify Walk-In Patient</span>
            </button>

            {/* Doctor Support Pill Button */}
            <button
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Doctor Support</span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button 
                onClick={() => setActiveNav('Notifications')}
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {unreadLive.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadLive.length}
                </span>
                )}
              </button>
            </div>

            {/* Doctor Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <img 
                    src={doctorInfo.avatar} 
                    alt={doctorInfo.name} 
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800 leading-tight">
                    {doctorInfo.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold leading-tight">
                    Cardiologist
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{doctorInfo.name}</p>
                    <p className="text-[10px] text-slate-500">{doctorInfo.email}</p>
                    <p className="text-[9px] text-emerald-700 font-bold mt-0.5">{doctorInfo.regNumber}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveNav('Profile');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <UserRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Doctor Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleNavClick('Appointments', 'confirmed');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Appointments</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveNav('Availability');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>OP Timings & Roster</span>
                  </button>
                  <button 
                    onClick={() => {
                      setActiveNav('Settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Practice Settings</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* 2. BODY LAYOUT: LEFT SIDEBAR + RIGHT MAIN CONTENT */}
      <div className="max-w-[1700px] mx-auto w-full flex-1 flex p-3 sm:p-4 gap-4 items-start">
        
        {/* LEFT SIDEBAR NAVIGATION: 13 ITEMS */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} shrink-0 transition-all duration-200 space-y-3 sticky top-16`}>
          
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs space-y-1">
            
            {/* 1. Dashboard (Active Navy Pill) */}
            <button
              onClick={() => handleNavClick('Dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Dashboard' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            {/* 2. Appointments (with 3 Sub-pages) */}
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('Appointments', 'confirmed')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeNav === 'Appointments' 
                    ? 'bg-blue-50 text-blue-900 font-black' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 shrink-0 text-blue-700" />
                  {sidebarOpen && <span>Appointments</span>}
                </div>
                {sidebarOpen && (
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center">
                    12
                  </span>
                )}
              </button>

              {/* Sub-links when Appointments is active or sidebar is open */}
              {sidebarOpen && activeNav === 'Appointments' && (
                <div className="pl-6 pr-1 py-1 space-y-1 bg-slate-50/80 rounded-lg border border-slate-200/60 my-1">
                  <button
                    onClick={() => {
                      setActiveNav('Appointments');
                      setAppointmentsSubTab('confirmed');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      appointmentsSubTab === 'confirmed' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>Confirmed</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded-full font-black">5</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Appointments');
                      setAppointmentsSubTab('pending');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      appointmentsSubTab === 'pending' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>Pending</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full font-black animate-pulse">4</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Appointments');
                      setAppointmentsSubTab('rejected');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      appointmentsSubTab === 'rejected' ? 'bg-rose-100 text-rose-900' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>Rejected</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded-full font-black">3</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Patients */}
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('Patients')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeNav === 'Patients' 
                    ? 'bg-[#152e4d] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0 text-slate-500" />
                  {sidebarOpen && <span>Patients</span>}
                </div>
                {sidebarOpen && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-black">
                    Verify
                  </span>
                )}
              </button>

              {/* Patients Sub-Tabs in Sidebar */}
              {activeNav === 'Patients' && sidebarOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-50/80 rounded-lg border border-slate-100 ml-2 animate-fadeIn">
                  <button
                    onClick={() => {
                      setActiveNav('Patients');
                      setPatientsSubTab('directory');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      patientsSubTab === 'directory' ? 'bg-blue-100 text-blue-900' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>Patients Registry</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-black">256</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveNav('Patients');
                      setPatientsSubTab('verify');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      patientsSubTab === 'verify' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verify Ayudh Member</span>
                    </span>
                    <span className="text-[9.5px] px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full font-black">ID/QR</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Consultations */}
            <button
              onClick={() => handleNavClick('Consultations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Consultations' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Consultations</span>}
            </button>

            {/* 5. Prescriptions */}
            <button
              onClick={() => handleNavClick('Prescriptions')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Prescriptions' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Prescriptions</span>}
            </button>

            {/* 6. Reports */}
            <button
              onClick={() => handleNavClick('Reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Reports' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Reports</span>}
            </button>

            {/* 7. Earnings */}
            <button
              onClick={() => handleNavClick('Earnings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Earnings' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <IndianRupee className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Earnings</span>}
            </button>

            {/* 8. Profile */}
            <button
              onClick={() => handleNavClick('Profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Profile' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserRound className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Profile</span>}
            </button>

            {/* 9. Availability */}
            <button
              onClick={() => handleNavClick('Availability')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Availability' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Availability</span>}
            </button>

            {/* 10. Messages (with badge 3) */}
            <button
              onClick={() => handleNavClick('Messages')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Messages' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 shrink-0 text-slate-500" />
                {sidebarOpen && <span>Messages</span>}
              </div>
              {sidebarOpen && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                  3
                </span>
              )}
            </button>

            {/* 11. Notifications (with badge 5) */}
            <button
              onClick={() => handleNavClick('Notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Notifications' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 shrink-0 text-slate-500" />
                {sidebarOpen && <span>Notifications</span>}
              </div>
              {sidebarOpen && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  5
                </span>
              )}
            </button>

            {/* 12. Support */}
            <button
              onClick={() => setShowSupportModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Support</span>}
            </button>

            {/* 13. Settings */}
            <button
              onClick={() => handleNavClick('Settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeNav === 'Settings' 
                  ? 'bg-[#152e4d] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-500" />
              {sidebarOpen && <span>Settings</span>}
            </button>

          </div>

          {/* Need Help? Sidebar Card */}
          {sidebarOpen && (
            <div className="bg-[#12263f] text-white rounded-xl p-3.5 shadow-sm space-y-2.5 text-center">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center mx-auto">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black">Need Help?</h4>
                <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                  We're here to assist you
                </p>
              </div>
              <button
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-1.5 rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Contact Support
              </button>
            </div>
          )}

        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* VIEW ROUTING BASED ON activeNav */}
          {walkInToast && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between text-xs font-black text-emerald-950 shadow-xs animate-slideDown">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{walkInToast}</span>
              </div>
              <button
                onClick={() => setWalkInToast(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 1. APPOINTMENTS MANAGEMENT PAGE (WITH 3 SUB-PAGES: CONFIRMED, PENDING, REJECTED) */}
          {activeNav === 'Appointments' && (
            <DoctorAppointmentsPage 
              initialSubTab={appointmentsSubTab}
              currentSubTab={appointmentsSubTab}
              onSubTabChange={(tab) => setAppointmentsSubTab(tab)}
              onStartConsultation={(pat) => setSelectedPatientModal(pat)}
              onUpdateProfile={() => setActiveNav('Profile')}
            />
          )}

          {/* 2. DOCTOR DASHBOARD MAIN VIEW (MATCHING THE ORIGINAL MOCKUP) */}
          {activeNav === 'Dashboard' && (
            <div className="space-y-4">
              
              {/* 1. TOP STATS ROW (5 CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                
                {/* Card 1: Today's Appointments */}
                <div className="bg-[#edf6ff] border border-blue-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {liveAppointments.length || todaysAppointments.length}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">
                        Today's Appointments
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNavClick('Appointments', 'confirmed')}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 flex items-center justify-between pt-1 border-t border-blue-200/60 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 2: Total Patients */}
                <div className="bg-[#f0fdf4] border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {livePatients.length || 256}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">
                        Total Patients
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNavClick('Patients')}
                    className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 flex items-center justify-between pt-1 border-t border-emerald-200/60 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 3: Consultations Today */}
                <div className="bg-[#f5f3ff] border border-purple-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-full bg-[#9333ea] text-white flex items-center justify-center shadow-xs">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        32
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">
                        Consultations Today
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNavClick('Consultations')}
                    className="text-[10px] font-black text-purple-700 hover:text-purple-900 flex items-center justify-between pt-1 border-t border-purple-200/60 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 4: Patient Rating */}
                <div className="bg-[#fffbeb] border border-amber-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-xs">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        4.8 <span className="text-xs font-semibold text-slate-500">/ 5</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">
                        Patient Rating
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNavClick('Profile')}
                    className="text-[10px] font-black text-amber-700 hover:text-amber-900 flex items-center justify-between pt-1 border-t border-amber-200/60 cursor-pointer"
                  >
                    <span>View Reviews</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card 5: This Month Earnings */}
                <div className="bg-[#eef4ff] border border-blue-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        ₹ 48,750
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 leading-tight">
                        This Month Earnings
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleNavClick('Earnings')}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 flex items-center justify-between pt-1 border-t border-blue-200/60 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>

              {/* 2. MIDDLE SECTION: 3 COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* Col 1 (5 Cols): Today's Appointments */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900">
                      Today's Appointments
                    </h3>
                    <button
                      onClick={() => setShowCalendarModal(true)}
                      className="text-[10px] font-bold text-blue-700 border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      View Calendar
                    </button>
                  </div>

                  {/* 5 Appointments Rows */}
                  <div className="space-y-2 divide-y divide-slate-100">
                    {(liveAppointments.length
                      ? liveAppointments.map((item: any) => ({
                          id: item.id,
                          time: String(item.appointmentTime || item.appointmentDateTime || '10:00').slice(0, 5),
                          period: item.timeSlotPeriod || 'OPD',
                          patientName: item.patientName || 'Patient',
                          age: item.age || '--',
                          gender: item.gender || '',
                          avatar: item.avatar || '/src/assets/images/patient_avatar_1787229395408.jpg',
                          type: item.visitType || item.status,
                          token: item.tokenNumber,
                        }))
                      : todaysAppointments
                    ).map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedPatientModal(item)}
                        className="pt-2 first:pt-0 flex items-center justify-between gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        
                        {/* Time */}
                        <div className="text-left shrink-0 w-12">
                          <div className="text-xs font-black text-slate-900">{item.time}</div>
                          <div className="text-[9px] font-bold text-slate-500">{item.period}</div>
                        </div>

                        {/* Patient Avatar & Name */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <img 
                            src={item.avatar} 
                            alt={item.patientName} 
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0 flex-1 text-left">
                            <div className="text-xs font-black text-slate-900 truncate">
                              {item.patientName}
                            </div>
                            <div className="text-[9px] font-semibold text-slate-500">
                              {item.age} Y / {item.gender}
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="text-left hidden sm:block w-28 shrink-0">
                          <div className="text-[10px] font-bold text-slate-800 leading-tight">
                            {item.type}
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight truncate">
                            {item.reason}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Footer View All Appointments */}
                  <button
                    onClick={() => handleNavClick('Appointments', 'confirmed')}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View All Appointments (Confirmed / Pending / Rejected)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                </div>

                {/* Col 2 (4 Cols): Appointment Overview Donut Chart */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900">
                      Appointment Overview <span className="text-[10px] font-normal text-slate-500">(This Month)</span>
                    </h3>
                    <select
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value)}
                      className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 focus:outline-none"
                    >
                      <option value="This Month">This Month</option>
                      <option value="Last Month">Last Month</option>
                      <option value="This Year">This Year</option>
                    </select>
                  </div>

                  {/* Donut Chart & Legend */}
                  <div className="flex items-center justify-around gap-2 py-2">
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4.5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#1d4ed8" strokeWidth="4.5" strokeDasharray="39.6 88" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#16a34a" strokeWidth="4.5" strokeDasharray="23.7 88" strokeDashoffset="-39.6" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeDasharray="7.04 88" strokeDashoffset="-63.3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="4.5" strokeDasharray="7.04 88" strokeDashoffset="-70.34" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#9333ea" strokeWidth="4.5" strokeDasharray="9.68 88" strokeDashoffset="-77.38" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-base font-black text-slate-900 leading-none">356</span>
                        <span className="text-[9px] font-bold text-slate-500 mt-0.5">Total</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1d4ed8] shrink-0"></span>
                        <span className="text-slate-600 font-semibold w-16">Completed</span>
                        <span className="font-bold text-slate-900">162 (45%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0"></span>
                        <span className="text-slate-600 font-semibold w-16">Confirmed</span>
                        <span className="font-bold text-slate-900">98 (27%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0284c7] shrink-0"></span>
                        <span className="text-slate-600 font-semibold w-16">Cancelled</span>
                        <span className="font-bold text-slate-900">32 (8%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#f97316] shrink-0"></span>
                        <span className="text-slate-600 font-semibold w-16">No Show</span>
                        <span className="font-bold text-slate-900">28 (8%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#9333ea] shrink-0"></span>
                        <span className="text-slate-600 font-semibold w-16">Reschedule</span>
                        <span className="font-bold text-slate-900">36 (11%)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavClick('Reports')}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Full Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                </div>

                {/* Col 3 (3 Cols): Upcoming Schedule */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900">
                      Upcoming Schedule
                    </h3>
                    <button
                      onClick={() => setShowCalendarModal(true)}
                      className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {upcomingSchedule.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-11 rounded-lg border border-slate-200 bg-slate-50 text-center py-1 shrink-0 shadow-2xs">
                          <div className="text-xs font-black text-slate-900 leading-none">{item.day}</div>
                          <div className="text-[9px] font-bold text-slate-500">{item.month}</div>
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`}></span>
                            <h4 className="text-[11px] font-bold text-slate-900 truncate">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[9px] text-slate-600 truncate pl-3">
                            {item.location}
                          </p>
                          <p className="text-[8.5px] text-slate-400 font-medium pl-3">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Full Schedule</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                </div>

              </div>

              {/* 3. BOTTOM SECTION: 3 COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                
                {/* Col 1 (4 Cols): Patients Summary */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900">
                      Patients Summary
                    </h3>
                    <button
                      onClick={() => handleNavClick('Patients')}
                      className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">New Patients (This Month)</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">48</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Returning Patients</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">208</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Total Patients</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">256</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">Last 30 Days Consultations</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">632</span>
                    </div>
                  </div>

                  <div className="pt-2"></div>
                </div>

                {/* Col 2 (4 Cols): Recent Consultations */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900">
                      Recent Consultations
                    </h3>
                    <button
                      onClick={() => handleNavClick('Consultations')}
                      className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5 divide-y divide-slate-100">
                    {recentConsultations.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedConsultationModal(item)}
                        className="pt-2 first:pt-0 flex items-center justify-between gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={item.avatar} 
                            alt={item.patientName} 
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0 text-left">
                            <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                              {item.patientName}
                            </div>
                            <div className="text-[9px] text-slate-500 font-medium leading-tight">
                              {item.date}
                            </div>
                          </div>
                        </div>

                        <div className="text-right min-w-0 flex-1 px-2">
                          <div className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                            {item.primaryFinding}
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight truncate">
                            {item.advice}
                          </div>
                        </div>

                        <div className="shrink-0 text-slate-400 hover:text-blue-600">
                          <FileCheck className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2"></div>
                </div>

                {/* Col 3 (4 Cols): Notifications */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900">
                      Notifications
                    </h3>
                    <button
                      onClick={() => handleNavClick('Notifications')}
                      className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((item) => {
                      const IconC = item.icon;
                      return (
                        <div key={item.id} className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-md ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                              <IconC className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 text-left">
                              <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                                {item.title}
                              </h4>
                              <p className="text-[9.5px] text-slate-500 leading-tight truncate">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <span className="text-[8.5px] font-semibold text-slate-400 shrink-0">
                            {item.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2"></div>
                </div>

              </div>

            </div>
          )}

          {/* 3. PATIENTS DIRECTORY & AYUDH VIKAS PATIENT VERIFICATION VIEW */}
          {activeNav === 'Patients' && (
            <div className="space-y-5">
              
              {/* PATIENTS NAVIGATION SUB-TABS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Patients & Ayudh Vikas Verification Center</h3>
                    <p className="text-[11px] text-slate-500">Registry & Instant Member Check (Direct / Walk-In / Unbooked)</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    onClick={() => setPatientsSubTab('directory')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      patientsSubTab === 'directory'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Patients Registry (256)
                  </button>
                  <button
                    onClick={() => setPatientsSubTab('verify')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      patientsSubTab === 'verify'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verify Member (ID & QR)</span>
                  </button>
                  <button
                    onClick={() => setPatientsSubTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      patientsSubTab === 'all'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    View All
                  </button>
                </div>
              </div>

              {/* AYUDH VIKAS PATIENT VERIFICATION SECTION (ID SEARCH & SMART HEALTH CARD QR SCAN) */}
              {(patientsSubTab === 'verify' || patientsSubTab === 'all') && (
                <PatientVerificationSection 
                  onPatientVerified={handlePatientVerified}
                  onWalkInAddedToQueue={handleWalkInPatientAdded} 
                />
              )}

              {/* REGISTERED PATIENTS DIRECTORY / LIST UNDER THIS DOCTOR */}
              {(patientsSubTab === 'directory' || patientsSubTab === 'all') && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">Registered Patients Registry</h3>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                          {registeredPatients.length} Active Records
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verified Ayudh Vikas Members under Dr. Ravi Teja's Cardiology & OP Clinic
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setPatientsSubTab('verify')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan Patient QR Card</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('Appointments', 'pending')}
                        className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                        <span>Pending Registrations (4)</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        placeholder="Search by Patient Name, Member ID (AV-..), UHID, or Mobile Number..."
                        className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-700 text-slate-900"
                      />
                      {patientSearchTerm && (
                        <button
                          onClick={() => setPatientSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
                      {['All', 'Gold', 'Silver', 'Senior Citizen', 'Rural Ayush'].map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setPatientFilterTier(tier)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            patientFilterTier === tier
                              ? 'bg-blue-700 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registered Patients List */}
                  <div className="divide-y divide-slate-100">
                    {registeredPatients
                      .filter((pat) => {
                        const matchesSearch =
                          !patientSearchTerm ||
                          pat.patientName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                          pat.memberId.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                          pat.uhid.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                          pat.phone.includes(patientSearchTerm);

                        const matchesTier =
                          patientFilterTier === 'All' ||
                          pat.membershipTier.toLowerCase().includes(patientFilterTier.toLowerCase());

                        return matchesSearch && matchesTier;
                      })
                      .map((pat) => (
                        <div key={pat.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-xl transition-colors">
                          
                          {/* Patient Avatar & Details */}
                          <div className="flex items-start sm:items-center gap-3.5">
                            <img
                              src={pat.avatar}
                              alt={pat.patientName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-2xs shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-slate-900">{pat.patientName}</span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  {pat.memberId}
                                </span>
                                {pat.verificationMethod && (
                                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9.5px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                                    <span>{pat.verificationMethod}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {pat.age} Y / {pat.gender} • Blood: <strong className="text-rose-700">{pat.bloodGroup}</strong> • Mobile: <strong className="text-slate-800">{pat.phone}</strong>
                              </div>
                              <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                                🎗️ {pat.membershipTier}
                              </div>
                            </div>
                          </div>

                          {/* Vitals & Action Buttons */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-left sm:text-right">
                              <div className="text-xs font-bold text-slate-800">Last BP: {pat.bp}</div>
                              <div className="text-[10px] text-slate-500">Last visit: {pat.lastVisit}</div>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedPatientModal({
                                  patientName: pat.patientName,
                                  age: pat.age,
                                  gender: pat.gender,
                                  phone: pat.phone,
                                  bp: pat.bp,
                                  heartRate: pat.heartRate,
                                  lastVisit: pat.lastVisit,
                                  avatar: pat.avatar,
                                  memberId: pat.memberId,
                                  membershipTier: pat.membershipTier
                                })}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                              >
                                View Chart
                              </button>

                              <button
                                onClick={() => {
                                  const walkInItem = {
                                    id: `APT-WALK-${Date.now()}`,
                                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    period: 'PM',
                                    patientName: pat.patientName,
                                    age: pat.age,
                                    gender: pat.gender as 'Male' | 'Female' | 'Other',
                                    type: 'Direct Walk-in',
                                    reason: `Ayudh Vikas Member (${pat.membershipTier})`,
                                    status: 'Arrived',
                                    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                                    avatar: pat.avatar,
                                    phone: pat.phone,
                                    bp: pat.bp,
                                    heartRate: pat.heartRate,
                                    lastVisit: pat.lastVisit
                                  };
                                  setTodaysAppointments(prev => [walkInItem, ...prev]);
                                  setWalkInToast(`Walk-in Token issued for ${pat.patientName}! Added to active OPD consultation list.`);
                                  setTimeout(() => setWalkInToast(null), 5000);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>OP Token</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}

                    {registeredPatients.filter((pat) => {
                      const matchesSearch =
                        !patientSearchTerm ||
                        pat.patientName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                        pat.memberId.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                        pat.phone.includes(patientSearchTerm);

                      const matchesTier =
                        patientFilterTier === 'All' ||
                        pat.membershipTier.toLowerCase().includes(patientFilterTier.toLowerCase());

                      return matchesSearch && matchesTier;
                    }).length === 0 && (
                      <div className="py-8 text-center space-y-2">
                        <User className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No patients match your search filter "{patientSearchTerm || patientFilterTier}".</p>
                        <button
                          onClick={() => {
                            setPatientSearchTerm('');
                            setPatientFilterTier('All');
                          }}
                          className="text-xs text-blue-700 font-bold hover:underline"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 4. DOCTOR PROFILE VIEW */}
          {activeNav === 'Profile' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <img src={doctorInfo.avatar} alt={doctorInfo.name} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-xs" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{doctorInfo.name}</h3>
                    <p className="text-xs font-bold text-emerald-700">{doctorInfo.speciality}</p>
                    <p className="text-xs text-slate-500">{doctorInfo.title} • Reg: {doctorInfo.regNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEditModal(true)}
                  className="bg-[#152e4d] hover:bg-[#0d1e33] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Affiliation & Hospital</h4>
                  <p><strong>Primary Hospital:</strong> {doctorInfo.hospital}</p>
                  <p><strong>Department:</strong> {doctorInfo.department}</p>
                  <p><strong>Experience:</strong> {doctorInfo.experience}</p>
                  <p><strong>OPD Consultation Fee:</strong> {doctorInfo.consultationFee}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Contact & Timings</h4>
                  <p><strong>Official Phone:</strong> {doctorInfo.phone}</p>
                  <p><strong>Clinical Email:</strong> {doctorInfo.email}</p>
                  <p><strong>OP Schedule:</strong> {doctorInfo.opdTimings}</p>
                  <p><strong>Rating:</strong> ⭐ {doctorInfo.rating}</p>
                </div>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                <h4 className="font-black text-blue-900 uppercase tracking-wider text-[11px]">Clinical Specializations & Bio</h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{doctorInfo.bio}</p>
              </div>
            </div>
          )}

          {/* 5. CONSULTATIONS / PRESCRIPTIONS / EARNINGS / OTHER VIEWS */}
          {['Consultations', 'Prescriptions', 'Reports', 'Earnings', 'Availability', 'Messages', 'Notifications', 'Settings'].includes(activeNav) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <h3 className="text-base font-black text-slate-900">{activeNav} Center</h3>
                </div>
                <button
                  onClick={() => handleNavClick('Dashboard')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>
              
              {activeNav === 'Consultations' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">Complete clinical records and findings recorded by Dr. Ravi Teja.</p>
                  <div className="divide-y divide-slate-100">
                    {recentConsultations.map(c => (
                      <div key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-slate-900">{c.patientName}</div>
                          <div className="text-[11px] text-slate-500">Date: {c.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-blue-700">{c.primaryFinding}</div>
                          <div className="text-[10px] text-slate-500">{c.advice}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeNav === 'Earnings' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-800 font-bold">Total Earnings This Month</div>
                      <div className="text-2xl font-black text-emerald-900">₹ 48,750</div>
                    </div>
                    <button className="bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg">Download GST Statement</button>
                  </div>
                </div>
              )}

              {activeNav === 'Availability' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600">Weekly OPD Slot Allocation:</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800">Monday - Saturday:</p>
                    <p className="text-slate-600">Morning Session: 09:30 AM - 02:00 PM (MGM Hospital OP)</p>
                    <p className="text-slate-600">Evening Session: 05:00 PM - 08:30 PM (Ayudh Vikas Heart Centre)</p>
                  </div>
                </div>
              )}

              {['Prescriptions', 'Reports', 'Messages', 'Notifications', 'Settings'].includes(activeNav) && (
                <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p>All real-time clinical data and settings for <strong>Dr. Ravi Teja</strong> are synced with Ayudh Vikas Hospital Network.</p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOOTER OF DOCTOR DASHBOARD: EXACT REPLICA OF THE UPLOADED SCREENSHOT */}
          {/* ========================================================================= */}
          <footer className="mt-8 pt-4 pb-4 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Left side copyright text */}
            <div className="text-left text-xs text-slate-500 font-medium leading-tight shrink-0">
              <p className="font-bold text-slate-700">© 2024 Ayudh Vikas</p>
              <p>Health Care Network</p>
              <p>All Rights Reserved.</p>
            </div>

            {/* Right side container: rounded light-blue box with ShieldCheck & Update Profile button */}
            <div className="flex-1 max-w-3xl w-full bg-[#edf4fd] border border-[#d6e5fa] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xs">
              
              {/* Shield Icon + Text */}
              <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#152e4d] leading-tight">
                    Keep Your Profile Updated
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-tight mt-0.5">
                    Complete your profile to help patients know you better.
                  </p>
                </div>
              </div>

              {/* Update Profile Button */}
              <button
                onClick={() => {
                  setActiveNav('Profile');
                  setShowProfileEditModal(true);
                }}
                className="w-full sm:w-auto bg-[#152e4d] hover:bg-[#0f2238] text-white text-xs sm:text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer whitespace-nowrap text-center"
              >
                Update Profile
              </button>

            </div>

          </footer>

        </main>

      </div>

      {/* MODAL 1: PATIENT APPOINTMENT DETAIL MODAL */}
      {selectedPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative space-y-4">
            
            <button
              onClick={() => setSelectedPatientModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img 
                src={selectedPatientModal.avatar} 
                alt={selectedPatientModal.patientName} 
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedPatientModal.patientName}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedPatientModal.age} Years • {selectedPatientModal.gender} • Phone: {selectedPatientModal.phone}
                </p>
                <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md border mt-1 ${selectedPatientModal.statusColor || 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                  {selectedPatientModal.status || 'Confirmed'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Appointment Time:</span>
                <span className="font-bold text-slate-800">{selectedPatientModal.time} {selectedPatientModal.period || ''} Today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visit Type & Reason:</span>
                <span className="font-bold text-blue-700">{selectedPatientModal.type || 'Consultation'} — {selectedPatientModal.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Recorded BP:</span>
                <span className="font-bold text-slate-800">{selectedPatientModal.bp || '128/82 mmHg'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heart Rate:</span>
                <span className="font-bold text-slate-800">{selectedPatientModal.heartRate || '72 bpm'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Visit:</span>
                <span className="font-bold text-slate-800">{selectedPatientModal.lastVisit || 'First Visit'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Starting consultation for ${selectedPatientModal.patientName}...`);
                  setSelectedPatientModal(null);
                }}
                className="flex-1 bg-[#152e4d] hover:bg-[#0f2238] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Start Consultation</span>
              </button>
              <a
                href={`tel:${selectedPatientModal.phone}`}
                className="border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROFILE MODAL */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProfileEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Update Doctor Profile</h3>
                <p className="text-xs text-slate-500">Keep your clinical qualifications & OPD timings updated</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={doctorInfo.name}
                  onChange={(e) => setDoctorInfo({...doctorInfo, name: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specialization & Qualifications</label>
                <input
                  type="text"
                  value={doctorInfo.speciality}
                  onChange={(e) => setDoctorInfo({...doctorInfo, speciality: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">OPD Consultation Fee</label>
                <input
                  type="text"
                  value={doctorInfo.consultationFee}
                  onChange={(e) => setDoctorInfo({...doctorInfo, consultationFee: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">OPD Clinic Timings</label>
                <input
                  type="text"
                  value={doctorInfo.opdTimings}
                  onChange={(e) => setDoctorInfo({...doctorInfo, opdTimings: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Bio & Specialty Description</label>
                <textarea
                  rows={3}
                  value={doctorInfo.bio}
                  onChange={(e) => setDoctorInfo({...doctorInfo, bio: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowProfileEditModal(false);
                  alert('Doctor Profile updated successfully!');
                }}
                className="flex-1 bg-[#152e4d] text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Save Profile Changes
              </button>
              <button
                onClick={() => setShowProfileEditModal(false)}
                className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CALENDAR MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Doctor Monthly Roster & OP Schedule</h3>
                <p className="text-xs text-slate-500">MGM Hospital Warangal & Ayudh Vikas Health Care Clinics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upcomingSchedule.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{item.day} {item.month} 2024</span>
                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                  </div>
                  <div className="font-bold text-slate-800">{item.title}</div>
                  <div className="text-[10px] text-slate-600">{item.location}</div>
                  <div className="text-[9px] text-slate-500 font-semibold">{item.time}</div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 text-blue-900 text-xs p-3 rounded-xl border border-blue-200">
              💡 <strong>Clinic Note:</strong> Regular OPD timings for Dr. Ravi Teja are Monday to Saturday, 09:30 AM to 02:00 PM at MGM Hospital, and 05:00 PM to 08:30 PM at Ayudh Vikas Heart Care Centre.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="bg-[#152e4d] text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DOCTOR SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative space-y-4 text-center">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Headphones className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Doctor Network Support Desk</h3>
              <p className="text-xs text-slate-500 mt-0.5">Priority helpline for registered consultants & hospital partners</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor Helpline:</span>
                <a href="tel:08704210820" className="font-bold text-blue-700">0870-4210820 (Ext 4)</a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency OPD Escort:</span>
                <span className="font-bold text-red-600">9000045073</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor Relationship Manager:</span>
                <span className="font-bold text-slate-800">Mr. Srinivas Rao</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href="https://wa.me/919000045073?text=Hi%20Ayudh%20Vikas,%20I%20am%20Dr.%20Ravi%20Teja%20requesting%20OPD%20support"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp Coordinator</span>
              </a>
              <button
                onClick={() => setShowSupportModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONSULTATION DETAIL MODAL */}
      {selectedConsultationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setSelectedConsultationModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img src={selectedConsultationModal.avatar} alt={selectedConsultationModal.patientName} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedConsultationModal.patientName}</h3>
                <p className="text-xs text-slate-500">Consultation Date: {selectedConsultationModal.date}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-500 block">Clinical Finding:</span>
                <span className="font-bold text-blue-700">{selectedConsultationModal.primaryFinding}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Doctor's Advice / Rx:</span>
                <span className="font-bold text-slate-800">{selectedConsultationModal.advice}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedConsultationModal(null)}
              className="w-full bg-[#152e4d] text-white font-bold text-xs py-2 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
