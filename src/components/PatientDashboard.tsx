import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Phone, 
  User, 
  Bell, 
  Menu, 
  X,
  LayoutDashboard,
  UserCheck,
  Calendar,
  FileText,
  CreditCard,
  TestTube,
  FileSpreadsheet,
  Pill,
  RotateCcw,
  Clock,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  MessageSquareQuote,
  Download,
  Settings,
  LogOut,
  Building2,
  Ambulance,
  Tent,
  Headphones,
  ChevronRight,
  MapPin,
  MessageSquare,
  Mail,
  QrCode,
  CheckCircle2,
  CalendarDays,
  Activity,
  HeartHandshake,
  Users,
  Search,
  Plus,
  Upload,
  Star,
  ExternalLink,
  Check,
  ArrowUpRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { ActiveModal } from '../types';
import { AmbulanceBookingPage } from './AmbulanceBookingPage';
import { LabTestsPage } from './LabTestsPage';
import { BookAppointmentPage } from './BookAppointmentPage';
import { HomeServicePage } from './HomeServicePage';
import { PatientInsuranceBookingPage } from './PatientInsuranceBookingPage';
import { HospitalSearchVisitSection } from './HospitalSearchVisitSection';
import { Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface PatientDashboardProps {
  onLogout: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onNavigateHome: () => void;
  activeTab?: string;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  pendingHospitalId?: string;
  pendingDoctorId?: string;
  onPendingVisitConsumed?: () => void;
  onRequireRegister?: (hospitalId: string, doctorId?: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onLogout,
  onOpenModal,
  onNavigateHome,
  activeTab,
  initialTab,
  onTabChange,
  pendingHospitalId,
  pendingDoctorId,
  onPendingVisitConsumed,
  onRequireRegister
}) => {
  const { user, updateProfile, isGuest } = useAuth();
  const { collections, create, loading } = useLiveData();
  const liveNotifications = (collections.notifications || []).filter((n: any) => n.userId === user?.id && !n.read);
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>(activeTab || initialTab || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Profile Edit modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Ramesh Kumar',
    displayName: 'Ramesh K.',
    patientId: 'AVP100245',
    age: '42',
    gender: 'Male',
    bloodGroup: 'B+ve',
    maritalStatus: 'Married',
    occupation: 'Govt Teacher',
    phone: '9876543210',
    email: 'ramesh.kumar@example.com',
    address: 'H.No 2-8-450, Subedari, Hanamkonda, Warangal Urban - 506001',
    emergencyContactName: 'Smt. Rama Devi (Spouse)',
    emergencyContactPhone: '9848012345',
    image: '/src/assets/images/patient_avatar_1787229395408.jpg'
  });

  // Reminders state
  const [reminders, setReminders] = useState([
    { id: 1, title: 'Take Metformin 500mg', time: '08:00 AM (After Breakfast)', type: 'Medication', enabled: true },
    { id: 2, title: 'Blood Pressure Log', time: '02:00 PM (Daily)', type: 'Health Log', enabled: true },
    { id: 3, title: 'Evening Brisk Walk (30 mins)', time: '06:00 PM (Daily)', type: 'Exercise', enabled: true },
    { id: 4, title: 'Take Telmisartan 40mg', time: '09:00 PM (After Dinner)', type: 'Medication', enabled: true }
  ]);
  const [newReminderModal, setNewReminderModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  // Wallet & balance
  const [walletBalance, setWalletBalance] = useState(1250);
  const [addFundsModal, setAddFundsModal] = useState(false);
  const [fundsAmount, setFundsAmount] = useState('500');

  // Support Ticket state
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketsList, setTicketsList] = useState([
    { id: 'AVT-8921', subject: 'Clarification on Gold Card pharmacy discount in Subedari', date: '22 May 2025', status: 'In Progress', priority: 'High' },
    { id: 'AVT-8710', subject: 'Lab report download link expired for lipid profile', date: '18 Apr 2025', status: 'Resolved', priority: 'Medium' }
  ]);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Hospital OPD Consultation');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Upload record state
  const [uploadRecordModal, setUploadRecordModal] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState('Prescription');
  const [recordDoctor, setRecordDoctor] = useState('Dr. Prashanth Reddy');

  // Records list
  const [recordsList, setRecordsList] = useState([
    { id: 1, title: 'Cardiology Consultation Rx & Diet Plan', doctor: 'Dr. Prashanth Reddy', facility: 'CARE Hospitals Warangal', date: '28 Apr 2025', type: 'Prescription', file: 'Rx_Cardiology_28Apr2025.pdf', size: '1.2 MB' },
    { id: 2, title: 'Complete Blood Count (CBC) Diagnostic Report', doctor: 'Dr. S. K. Roy (Pathologist)', facility: 'Vijaya Diagnostic Centre', date: '20 May 2025', type: 'Lab Report', file: 'CBC_Report_AVP100245.pdf', size: '2.4 MB' },
    { id: 3, title: 'Lipid Profile & Liver Function Test (LFT)', doctor: 'Dr. Anusha Reddy', facility: 'Lucid Medical Diagnostics', date: '15 Apr 2025', type: 'Lab Report', file: 'Lipid_LFT_15Apr2025.pdf', size: '3.1 MB' },
    { id: 4, title: 'Chest X-Ray PA View & Report', doctor: 'Dr. Harish Rao (Radiologist)', facility: 'Yashoda Hospitals Hanamkonda', date: '10 Feb 2025', type: 'Scan / X-Ray', file: 'Chest_XRay_10Feb2025.pdf', size: '8.4 MB' },
    { id: 5, title: 'General Physician Review & Medication Chart', doctor: 'Dr. Radhika Sharma', facility: 'Apollo Hospitals Warangal', date: '12 Jan 2025', type: 'Prescription', file: 'General_Physician_12Jan2025.pdf', size: '850 KB' }
  ]);
  const [recordsFilter, setRecordsFilter] = useState('All');

  // Toast notification simulation
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    if (activeTab) {
      setActiveSidebarTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        displayName: user.displayName || prev.displayName,
        patientId: user.patientId || prev.patientId,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        image: user.image || prev.image,
        address: user.address || prev.address,
        age: String(user.age || prev.age),
        gender: user.gender || prev.gender,
        bloodGroup: user.bloodGroup || prev.bloodGroup,
      }));
      if (typeof user.walletBalance === 'number') setWalletBalance(user.walletBalance);
    }
  }, [user]);

  useEffect(() => {
    const pid = user?.patientId || profileData.patientId;
    const mine = (list: any[]) => list.filter((item) => !pid || item.patientId === pid || !item.patientId);
    if (collections.reminders.length) setReminders(mine(collections.reminders));
    if (collections.tickets.length) setTicketsList(mine(collections.tickets));
    if (collections.health_records.length) setRecordsList(mine(collections.health_records));
    const txs = mine(collections.wallet_txns);
    if (txs[0]?.balanceAfter !== undefined) setWalletBalance(txs[0].balanceAfter);
  }, [collections, user, profileData.patientId]);

  const sidebarMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'find_hospitals', label: 'Find Nearby Hospitals', icon: Building2, highlight: true },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'lab_tests', label: 'Book Lab Tests', icon: TestTube, highlight: true },
    { id: 'ambulance_booking', label: 'Ambulance Booking', icon: Ambulance, highlight: true },
    { id: 'home_service', label: 'Home Service', icon: Home, highlight: true },
    { id: 'records', label: 'My Health Records', icon: FileText },
    { id: 'membership', label: 'My Membership', icon: CreditCard },
    { id: 'reports', label: 'Reports & Results', icon: FileSpreadsheet },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'follow_ups', label: 'Follow Ups', icon: RotateCcw },
    { id: 'reminders', label: 'Health Reminders', icon: Clock },
    { id: 'wallet', label: 'Wallet & Payments', icon: Wallet },
    { id: 'insurance', label: 'Insurance Details', icon: ShieldCheck },
    { id: 'emergency', label: 'Emergency Support', icon: AlertTriangle, highlight: true },
    { id: 'tickets', label: 'My Tickets / Queries', icon: HelpCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageSquareQuote },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSidebarClick = (id: string) => {
    setActiveSidebarTab(id);
    if (onTabChange) onTabChange(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
    } catch (err) {
      console.error(err);
    }
    setEditProfileOpen(false);
    showToast('Profile updated successfully!');
  };

  const handleToggleReminder = (id: number) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    showToast('Reminder status updated!');
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderTime) return;
    const newRem = {
      id: Date.now(),
      title: newReminderTitle,
      time: newReminderTime,
      type: 'Medication',
      enabled: true
    };
    setReminders(prev => [newRem, ...prev]);
    create('reminders', { ...newRem, patientId: user?.patientId || profileData.patientId }).catch(console.error);
    setNewReminderTitle('');
    setNewReminderTime('');
    setNewReminderModal(false);
    showToast('New reminder created successfully!');
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const addAmt = parseInt(fundsAmount, 10) || 0;
    if (addAmt <= 0) return;
    try {
      const tx = await create('wallet_txns', {
        patientId: user?.patientId || profileData.patientId,
        amount: addAmt,
        type: 'credit',
        note: 'Wallet top-up',
      });
      setWalletBalance(tx.balanceAfter ?? (walletBalance + addAmt));
    } catch {
      setWalletBalance(prev => prev + addAmt);
    }
    setAddFundsModal(false);
    showToast(`₹${addAmt} added to your Ayudh Vikas Wallet!`);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    const newTk = {
      id: `AVT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      date: 'Today',
      status: 'Submitted',
      priority: 'Normal'
    };
    setTicketsList(prev => [newTk, ...prev]);
    create('tickets', { ...newTk, description: ticketDescription, patientId: user?.patientId || profileData.patientId }).catch(console.error);
    setTicketSubject('');
    setTicketDescription('');
    setTicketModal(false);
    showToast('Support ticket raised. Our care coordinator will contact you shortly!');
  };

  const handleUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle) return;
    const newRec = {
      id: Date.now(),
      title: recordTitle,
      doctor: recordDoctor || 'Self Uploaded',
      facility: 'Warangal Healthcare Unit',
      date: 'Today',
      type: recordCategory,
      file: `${recordTitle.replace(/\s+/g, '_')}.pdf`,
      size: '1.8 MB'
    };
    setRecordsList(prev => [newRec, ...prev]);
    create('health_records', { ...newRec, patientId: user?.patientId || profileData.patientId }).catch(console.error);
    setRecordTitle('');
    setUploadRecordModal(false);
    showToast('Health document uploaded securely to your EHR profile!');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    create('feedback', {
      patientId: user?.patientId || profileData.patientId,
      rating: feedbackRating,
      category: feedbackCategory,
      comments: feedbackComments,
    }).catch(console.error);
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackComments('');
    }, 4000);
    showToast('Thank you! Your feedback helps us improve healthcare access.');
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091b38] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isGuest && (
        <div className="bg-amber-400 text-[#0f2e5a] px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-center gap-2">
          <span>You are browsing as Guest — view only. Register as a patient to book doctors, hospitals, ambulance, labs and home care.</span>
          <button
            onClick={() => onOpenModal('register_patient')}
            className="bg-[#0f2e5a] text-white font-black uppercase px-3 py-1 rounded-lg cursor-pointer"
          >
            Register Now
          </button>
        </div>
      )}

      {/* 1. TOP NAVIGATION HEADER (Matching reference image) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer"
              onClick={onNavigateHome}
              title="Return to Home page"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center p-1.5 text-emerald-600 shadow-2xs">
                <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-black text-[#0f2e5a] tracking-tight leading-none uppercase font-sans">
                  AYUDH VIKAS
                </h1>
                <span className="text-[11px] font-extrabold text-[#006633] tracking-wide uppercase leading-tight">
                  FOUNDATION
                </span>
                <span className="text-[8px] font-bold text-emerald-700 tracking-wider uppercase border-t border-emerald-200 mt-0.5 pt-0.5">
                  — CARE BEYOND BOUNDARIES —
                </span>
              </div>
            </div>

            {/* Subtitle Divider */}
            <div className="hidden xl:block h-8 w-px bg-slate-200 mx-1"></div>

            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-black text-[#0275d8] uppercase tracking-wide">
                HEALTH CARE NETWORK
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                One Call for Complete Healthcare Support
              </span>
            </div>
          </div>

          {/* Right: Helpline Info, Location, Alerts & Patient Profile Pill */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            
            {/* Phone Support */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-left">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[9px] font-semibold text-slate-500">24x7 Patient Support</div>
                <a href="tel:08704210820" className="text-xs font-black text-[#0f2e5a] hover:text-emerald-700">
                  0870 4210820
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200 text-left">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <div className="text-[9px] font-semibold text-emerald-800">WhatsApp Support</div>
                <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="text-xs font-black text-emerald-900 hover:underline">
                  9000045073
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="hidden 2xl:flex items-center gap-1.5 max-w-[280px] text-[10px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate leading-tight">KM Complex, Hunter Road, Warangal</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {liveNotifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {liveNotifications.length}
                </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Notifications ({Math.max(3, liveNotifications.length)})</span>
                    <button onClick={() => setShowNotifications(false)} className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer">Mark all read</button>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {liveNotifications.map((note: any) => (
                      <div key={note.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => setShowNotifications(false)}>
                        <div className="font-bold text-slate-800">{note.title}</div>
                        <div className="text-slate-500 text-[10px]">{note.message}</div>
                      </div>
                    ))}
                    <div 
                      onClick={() => { setShowNotifications(false); handleSidebarClick('appointments'); }}
                      className="px-3 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="font-bold text-slate-800">Appointment Confirmed</div>
                      <div className="text-slate-500 text-[10px]">Dr. Prashanth Reddy on 28 May 2025 at 10:30 AM</div>
                    </div>
                    <div 
                      onClick={() => { setShowNotifications(false); handleSidebarClick('membership'); }}
                      className="px-3 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="font-bold text-slate-800">Free Health Camp</div>
                      <div className="text-slate-500 text-[10px]">Diabetes Screening this Monday at Public Park</div>
                    </div>
                    <div 
                      onClick={() => { setShowNotifications(false); handleSidebarClick('reports'); }}
                      className="px-3 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="font-bold text-slate-800">Lab Results Ready</div>
                      <div className="text-slate-500 text-[10px]">Complete Blood Count report uploaded</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient Profile Pill */}
            <div 
              onClick={() => handleSidebarClick('profile')}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
              title="View Profile"
            >
              <img
                src={profileData.image}
                alt={profileData.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {profileData.displayName}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 leading-tight">
                  Patient ID : {profileData.patientId}
                </span>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* 2. MAIN BODY LAYOUT: PERSISTENT SIDEBAR + DYNAMIC VIEW CONTENT */}
      <div className="flex flex-1 relative max-w-[1700px] w-full mx-auto">
        
        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR NAVIGATION (PERSISTENT ON ALL PAGES) */}
        <aside className={`
          fixed lg:static top-[60px] bottom-0 left-0 z-30
          w-64 bg-[#091b38] text-slate-300 flex flex-col justify-between shrink-0
          transition-transform duration-200 ease-in-out overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none min-h-[calc(100vh-60px)]
        `}>
          <div className="p-3 space-y-1">
            {sidebarMenuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSidebarClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-[#00703c] text-white shadow-sm font-black' 
                      : item.highlight 
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                        : 'text-slate-300 hover:bg-[#12284d] hover:text-white'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${
                    isActive 
                      ? 'text-white' 
                      : item.highlight 
                        ? 'text-red-400' 
                        : 'text-slate-400'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Logout Button */}
          <div className="p-3 border-t border-slate-800/80">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA - SWITCHES SMOOTHLY PER TAB WHILE PRESERVING SIDEBAR */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#f3f5f8]">
          
          {/* TAB 0: FIND NEARBY HOSPITALS & VISIT REQUESTS VIEW */}
          {loading && activeSidebarTab === 'dashboard' && (
            <div className="p-6">
              <LoadingSkeleton count={3} type="card" />
            </div>
          )}

          {activeSidebarTab === 'find_hospitals' && (
            <div className="p-3 sm:p-5 lg:p-6 animate-fadeIn">
              <HospitalSearchVisitSection 
                userProfile={profileData}
                onOpenModal={onOpenModal}
                isDashboardContext={true}
                onBackToDashboard={() => handleSidebarClick('dashboard')}
                isGuest={isGuest}
                pendingHospitalId={pendingHospitalId}
                pendingDoctorId={pendingDoctorId}
                onPendingVisitConsumed={onPendingVisitConsumed}
                onRequireRegister={onRequireRegister}
              />
            </div>
          )}

          {/* TAB 1: LAB TESTS VIEW */}
          {activeSidebarTab === 'lab_tests' && (
            <div className="p-0 animate-fadeIn">
              <LabTestsPage 
                hideHeader={true}
                onBackToHome={() => handleSidebarClick('dashboard')}
                onOpenModal={onOpenModal}
                onSignInClick={() => {}}
                isLoggedIn={true}
                userProfile={profileData}
                onNavigateDashboard={() => handleSidebarClick('dashboard')}
                onLogout={onLogout}
                isDashboardContext={true}
              />
            </div>
          )}

          {/* TAB 2: AMBULANCE BOOKING VIEW */}
          {activeSidebarTab === 'ambulance_booking' && (
            <div className="p-0 animate-fadeIn">
              <AmbulanceBookingPage 
                hideHeader={true}
                onBackToHome={() => handleSidebarClick('dashboard')}
                onOpenModal={onOpenModal}
                onSignInClick={() => {}}
                isLoggedIn={true}
                userProfile={profileData}
                onNavigateDashboard={() => handleSidebarClick('dashboard')}
                onLogout={onLogout}
                isDashboardContext={true}
              />
            </div>
          )}

          {/* TAB 3: DOCTOR APPOINTMENTS VIEW */}
          {activeSidebarTab === 'appointments' && (
            <div className="p-0 animate-fadeIn">
              <BookAppointmentPage 
                hideHeader={true}
                onBackToHome={() => handleSidebarClick('dashboard')}
                onOpenModal={onOpenModal}
                onSignInClick={() => {}}
                isLoggedIn={true}
                userProfile={profileData}
                onNavigateDashboard={() => handleSidebarClick('dashboard')}
                onLogout={onLogout}
              />
            </div>
          )}

          {/* TAB 3B: HOME HEALTHCARE / HOME SERVICE VIEW */}
          {activeSidebarTab === 'home_service' && (
            <div className="p-0 animate-fadeIn">
              <HomeServicePage 
                hideHeader={true}
                onBackToHome={() => handleSidebarClick('dashboard')}
                onOpenModal={onOpenModal}
                onSignInClick={() => {}}
                isLoggedIn={true}
                userProfile={profileData}
                onNavigateDashboard={() => handleSidebarClick('dashboard')}
                onLogout={onLogout}
                isDashboardContext={true}
              />
            </div>
          )}

          {/* TAB 4: MY PROFILE VIEW */}
          {activeSidebarTab === 'profile' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={profileData.image} 
                    alt={profileData.name} 
                    className="w-16 h-16 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-[#0f2e5a]">{profileData.name}</h2>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                        GOLD MEMBER
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Patient ID: <span className="text-emerald-700 font-bold">{profileData.patientId}</span> • Registered Warangal Member
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ayudh Vikas Digital Health ID Card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-[#0a2540] via-[#0f3b6c] to-[#0052cc] rounded-2xl p-5 text-white shadow-lg border border-blue-400/20 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between border-b border-white/20 pb-3">
                      <div>
                        <div className="text-[10px] tracking-widest text-emerald-400 font-black uppercase">Ayudh Vikas Foundation</div>
                        <div className="text-sm font-black tracking-wide">DIGITAL HEALTH CARD</div>
                      </div>
                      <HeartPulse className="w-7 h-7 text-emerald-400" />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <img 
                        src={profileData.image} 
                        alt="Ramesh Kumar" 
                        className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                      />
                      <div>
                        <div className="text-sm font-black">{profileData.name}</div>
                        <div className="text-[10px] text-blue-200">ID: {profileData.patientId}</div>
                        <div className="text-[10px] text-amber-300 font-bold">Blood Group: {profileData.bloodGroup}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-white/15 relative z-10">
                    <div>
                      <div className="text-[8px] text-blue-200 uppercase">Valid Through</div>
                      <div className="text-xs font-bold text-white">31 MAY 2026</div>
                    </div>
                    <div className="bg-white p-1 rounded-lg">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Personal & Medical Info */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-[#0f2e5a] uppercase tracking-wide border-b border-slate-100 pb-2">
                    Patient Profile Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Full Name</span>
                      <span className="font-bold text-slate-800">{profileData.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Age / Gender</span>
                      <span className="font-bold text-slate-800">{profileData.age} Yrs / {profileData.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Blood Group</span>
                      <span className="font-bold text-emerald-700">{profileData.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Phone Number</span>
                      <span className="font-bold text-slate-800">{profileData.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Email Address</span>
                      <span className="font-bold text-slate-800">{profileData.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Emergency Contact</span>
                      <span className="font-bold text-red-600">{profileData.emergencyContactName} ({profileData.emergencyContactPhone})</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Residential Address</span>
                      <span className="font-bold text-slate-800">{profileData.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MY HEALTH RECORDS & DOCUMENTS */}
          {activeSidebarTab === 'records' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-lg font-black text-[#0f2e5a]">My Health Records (EHR)</h2>
                  <p className="text-xs text-slate-500 font-semibold">Secure electronic medical records stored for lifetime access</p>
                </div>
                <button
                  onClick={() => setUploadRecordModal(true)}
                  className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Medical Record</span>
                </button>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['All', 'Prescription', 'Lab Report', 'Scan / X-Ray'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setRecordsFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      recordsFilter === filter 
                        ? 'bg-[#0f2e5a] text-white' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Records List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recordsList
                  .filter(r => recordsFilter === 'All' || r.type === recordsFilter)
                  .map(rec => (
                    <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-1">
                              {rec.type}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 leading-snug">{rec.title}</h4>
                            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{rec.doctor} • {rec.facility}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Date: <strong className="text-slate-700">{rec.date}</strong> ({rec.size})</span>
                        <button 
                          onClick={() => showToast(`Downloading ${rec.file}...`)}
                          className="text-[#00703c] font-black hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: MY MEMBERSHIP & GOLD BENEFITS */}
          {activeSidebarTab === 'membership' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-[#091b38] via-[#103063] to-[#0052cc] rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center lg:text-left">
                  <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AYUDH VIKAS GOLD TIER</span>
                  </div>
                  <h2 className="text-2xl font-black">Ayudh Vikas Healthcare Membership</h2>
                  <p className="text-xs text-blue-200 max-w-xl">
                    Enjoy up to 20% discount on medicines, free emergency ambulance dispatch, priority doctor appointments, and annual full body checkup camps across Warangal & Telangana.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
                  <div className="text-[10px] text-blue-200 uppercase font-bold">Membership Status</div>
                  <div className="text-lg font-black text-emerald-400">ACTIVE & VERIFIED</div>
                  <div className="text-[11px] text-white/80 mt-1">Valid till: <strong>31 May 2026</strong></div>
                </div>
              </div>

              {/* Gold Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <Pill className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">20% Off Medicines</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Flat 20% discount at 150+ partner pharmacies across Warangal & Hanamkonda.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
                    <Ambulance className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Free 24x7 Ambulance</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Instant emergency dispatch with zero upfront cost within Warangal district.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Priority OPD Queue</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Dedicated token reservation at top private & super-speciality hospitals.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <TestTube className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Annual Health Checkup</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Free 65+ parameter master health checkup at community health camps.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS & RESULTS */}
          {activeSidebarTab === 'reports' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#0f2e5a]">Diagnostic Test Reports & Results</h2>
                  <p className="text-xs text-slate-500 font-semibold">Verified NABL-certified diagnostic results with instant PDF downloads</p>
                </div>
                <button
                  onClick={() => handleSidebarClick('lab_tests')}
                  className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  + Book New Lab Test
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { test: 'Complete Blood Count (CBC)', lab: 'Vijaya Diagnostic Centre, Hanamkonda', date: '20 May 2025', status: 'Normal', pdf: 'CBC_Report_20May.pdf' },
                  { test: 'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)', lab: 'Lucid Medical Diagnostics, Warangal', date: '15 Apr 2025', status: 'Borderline', pdf: 'Lipid_15Apr.pdf' },
                  { test: 'Liver Function Test (LFT & Bilirubin)', lab: 'CARE Hospital Diagnostics', date: '10 Jan 2025', status: 'Normal', pdf: 'LFT_10Jan.pdf' },
                  { test: 'Thyroid Profile (Total T3, T4, Ultrasensitive TSH)', lab: 'Tenet Diagnostics, Warangal', date: '10 Jan 2025', status: 'Normal', pdf: 'Thyroid_10Jan.pdf' }
                ].map((rep, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900">{rep.test}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rep.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{rep.lab} • Reported on {rep.date}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => showToast(`Opening ${rep.pdf}...`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => showToast(`Downloaded ${rep.pdf} successfully!`)}
                        className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PRESCRIPTIONS */}
          {activeSidebarTab === 'prescriptions' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-black text-[#0f2e5a]">Active Prescriptions & Dosages</h2>
                <p className="text-xs text-slate-500 font-semibold">Doctor prescribed medication charts and refill orders</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">Dr. Prashanth Reddy (Cardiology)</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">CARE Hospitals Warangal • Issued: 28 Apr 2025</p>
                    </div>
                    <button 
                      onClick={() => showToast('Medicine refill request dispatched to Ayudh Vikas partner pharmacy!')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Order Refill (20% Off)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-black text-slate-900">Tab. Metformin 500mg</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">Dosage: 1 Tab (Morning) - 0 - 1 Tab (Night)</div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-1">Instructions: After Food with warm water</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-black text-slate-900">Tab. Telmisartan 40mg</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">Dosage: 1 Tab (Morning) - 0 - 0</div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-1">Instructions: Daily after breakfast</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FOLLOW UPS */}
          {activeSidebarTab === 'follow_ups' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-black text-[#0f2e5a]">Doctor Follow-Up Consultations</h2>
                <p className="text-xs text-slate-500 font-semibold">Scheduled reviews and tele-consultation check-ins</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Next Upcoming Follow-Up</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Dr. Prashanth Reddy (Cardiologist)</h4>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">CARE Hospitals, Warangal</p>
                    <p className="text-xs font-black text-[#00703c] mt-1">Date: 28 May 2025 at 10:30 AM (In-Person OPD)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => showToast('Follow-up reminder set on your calendar!')}
                      className="bg-[#0f2e5a] text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      Add to Calendar
                    </button>
                    <button 
                      onClick={() => handleSidebarClick('appointments')}
                      className="bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: HEALTH REMINDERS */}
          {activeSidebarTab === 'reminders' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#0f2e5a]">Health & Medication Reminders</h2>
                  <p className="text-xs text-slate-500 font-semibold">Daily medication alarms and vitals tracking schedule</p>
                </div>
                <button
                  onClick={() => setNewReminderModal(true)}
                  className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reminder</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reminders.map(rem => (
                  <div key={rem.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rem.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{rem.title}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold">{rem.time}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${rem.enabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${rem.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: WALLET & PAYMENTS */}
          {activeSidebarTab === 'wallet' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-[#091b38] to-[#123668] text-white p-5 rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-200 font-bold uppercase">Ayudh Vikas Wallet Balance</span>
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">₹{walletBalance}</div>
                  <button
                    onClick={() => setAddFundsModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    + Add Money to Wallet
                  </button>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                    Recent Wallet Transactions
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Lab Test Payment - Vijaya Diagnostics</div>
                        <div className="text-[10px] text-slate-500">20 May 2025 • Transaction ID: AVTX-90214</div>
                      </div>
                      <span className="font-black text-red-600">- ₹450</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Gold Member Cashback Reward</div>
                        <div className="text-[10px] text-slate-500">15 Apr 2025 • Promo Credit</div>
                      </div>
                      <span className="font-black text-emerald-700">+ ₹100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: INSURANCE DETAILS / INSURANCE BOOKING */}
          {activeSidebarTab === 'insurance' && (
            <div className="p-0 animate-fadeIn">
              <PatientInsuranceBookingPage 
                embedded={true}
                onBackToDashboard={() => handleSidebarClick('dashboard')}
                onLogout={onLogout}
                onNavigateTab={(tab) => handleSidebarClick(tab)}
              />
            </div>
          )}

          {/* TAB 13: EMERGENCY SUPPORT */}
          {activeSidebarTab === 'emergency' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                  <span>24x7 Emergency SOS Response Desk</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">Need Immediate Emergency Ambulance?</h2>
                <p className="text-xs text-red-100 max-w-xl">
                  One tap will connect you directly to our Warangal Emergency Dispatch Unit. Paramedic ambulances with ICU life support on standby.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="tel:08704210820"
                    className="bg-white text-red-600 font-black text-sm px-6 py-3 rounded-xl shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 animate-pulse" />
                    <span>Call Emergency: 0870-4210820</span>
                  </a>
                  <button
                    onClick={() => handleSidebarClick('ambulance_booking')}
                    className="bg-slate-900 text-white font-black text-sm px-6 py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Ambulance className="w-4 h-4" />
                    <span>Book Ambulance Online</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: TICKETS & QUERIES */}
          {activeSidebarTab === 'tickets' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#0f2e5a]">My Support Tickets & Queries</h2>
                  <p className="text-xs text-slate-500 font-semibold">Track resolution status with your dedicated care coordinator</p>
                </div>
                <button
                  onClick={() => setTicketModal(true)}
                  className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Raise Support Ticket</span>
                </button>
              </div>

              <div className="space-y-3">
                {ticketsList.map(tk => (
                  <div key={tk.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500">{tk.id}</span>
                        <h4 className="text-xs font-black text-slate-900">{tk.subject}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Raised: {tk.date} • Priority: {tk.priority}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      tk.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 15: FEEDBACK */}
          {activeSidebarTab === 'feedback' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-4">
                <div>
                  <h2 className="text-lg font-black text-[#0f2e5a]">Share Your Healthcare Feedback</h2>
                  <p className="text-xs text-slate-500 font-semibold">Help us refine hospital assistance and doctor appointment services</p>
                </div>

                {feedbackSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your feedback has been registered. Thank you for helping us serve Warangal better!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Service Category</label>
                      <select 
                        value={feedbackCategory} 
                        onChange={e => setFeedbackCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
                      >
                        <option>Hospital OPD Consultation</option>
                        <option>Diagnostic Lab Test Service</option>
                        <option>Emergency Ambulance Dispatch</option>
                        <option>Gold Health Card Benefits</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="cursor-pointer"
                          >
                            <Star className={`w-6 h-6 ${star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Comments</label>
                      <textarea 
                        rows={4}
                        value={feedbackComments}
                        onChange={e => setFeedbackComments(e.target.value)}
                        placeholder="Write your experience with doctors, hospital staff or lab collection..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#00703c] hover:bg-[#005830] text-white font-black px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 16: DOWNLOADS */}
          {activeSidebarTab === 'downloads' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-black text-[#0f2e5a]">Download Center</h2>
                <p className="text-xs text-slate-500 font-semibold">1-click official downloads of your health cards, receipts, and records</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Ayudh Vikas Gold Health ID Card', type: 'PDF • 450 KB', desc: 'Printable PVC size membership health card with QR' },
                  { title: 'Annual Comprehensive Medical Summary', type: 'PDF • 1.8 MB', desc: 'Full electronic health history booklet for 2025' },
                  { title: 'All Diagnostic Lab Reports Archive', type: 'ZIP • 6.2 MB', desc: 'Combined reports of CBC, Lipid, LFT & Thyroid tests' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => showToast(`Downloaded ${item.title} successfully!`)}
                      className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {item.type}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 17: SETTINGS */}
          {activeSidebarTab === 'settings' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-4">
                <h2 className="text-lg font-black text-[#0f2e5a]">Account & Security Settings</h2>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="font-black text-slate-900">WhatsApp Appointment Alerts</div>
                      <div className="text-[10px] text-slate-500">Receive tokens and doctor timing updates directly on WhatsApp</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <div className="font-black text-slate-900">SMS Health Reminders</div>
                      <div className="text-[10px] text-slate-500">Daily dosage notifications to your registered phone</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600" />
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => showToast('Settings saved successfully!')}
                      className="bg-[#00703c] text-white font-black text-xs px-5 py-2 rounded-xl cursor-pointer"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEFAULT TAB: DASHBOARD HOME OVERVIEW (Matching design) */}
          {activeSidebarTab === 'dashboard' && (
            <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
              
              {/* Header Row: Welcome Message + 3 Contact Banners */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
                
                {/* Left Welcome message */}
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0f2e5a]">
                    Welcome Back, {profileData.name}!
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Here is your healthcare network dashboard and patient summary
                  </p>
                </div>

                {/* Right 3 contact banners */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  
                  {/* Banner 1: Call Centre */}
                  <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-3 py-1.5 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                      <Phone className="w-3 h-3" />
                    </div>
                    <div className="text-left">
                      <div className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">Help Desk</div>
                      <div className="text-xs font-black text-[#0f2e5a]">0870 4210820</div>
                    </div>
                  </div>

                  {/* Banner 2: WhatsApp */}
                  <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <MessageSquare className="w-3 h-3 fill-current" />
                    </div>
                    <div className="text-left">
                      <div className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">WhatsApp</div>
                      <div className="text-xs font-black text-emerald-900">9000045073</div>
                    </div>
                  </div>

                  {/* Banner 3: Emergency Red */}
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xs animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                    </div>
                    <div className="text-left">
                      <div className="text-[8px] font-bold text-red-700 uppercase tracking-wider">Emergency 24x7</div>
                      <div className="text-xs font-black text-red-700">0870-4210820</div>
                    </div>
                  </div>

                </div>

              </div>

              {/* 9 QUICK ACTION BUTTONS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
                
                {/* 1. Find Hospitals (NEW) */}
                <button
                  onClick={() => handleSidebarClick('find_hospitals')}
                  className="bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-sky-700 leading-tight">Find Hospitals</span>
                  <span className="text-[9px] text-sky-600 font-bold">Request Visit</span>
                </button>

                {/* 2. Book Appointment */}
                <button
                  onClick={() => handleSidebarClick('appointments')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">Book Doctor</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Specialists</span>
                </button>

                {/* 3. Book Lab Test */}
                <button
                  onClick={() => handleSidebarClick('lab_tests')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <TestTube className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">Book Lab Test</span>
                  <span className="text-[9px] text-emerald-600 font-bold">Home Sample</span>
                </button>

                {/* 4. Ambulance */}
                <button
                  onClick={() => handleSidebarClick('ambulance_booking')}
                  className="bg-white hover:bg-red-50/50 border border-slate-200 hover:border-red-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5 animate-pulse">
                    <Ambulance className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-red-700 leading-tight">Ambulance</span>
                  <span className="text-[9px] text-red-600 font-bold">24x7 SOS</span>
                </button>

                {/* 5. Home Service */}
                <button
                  onClick={() => handleSidebarClick('home_service')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">Home Service</span>
                  <span className="text-[9px] text-emerald-600 font-bold">Doctor & Nurse</span>
                </button>

                {/* 6. My Health Records */}
                <button
                  onClick={() => handleSidebarClick('records')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">My Records</span>
                  <span className="text-[9px] text-slate-400 font-semibold">EHR Vault</span>
                </button>

                {/* 7. Health Camps */}
                <button
                  onClick={() => handleSidebarClick('membership')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <Tent className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">Health Camps</span>
                  <span className="text-[9px] text-teal-600 font-bold">Free Screen</span>
                </button>

                {/* 8. Insurance */}
                <button
                  onClick={() => handleSidebarClick('insurance')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">Insurance</span>
                  <span className="text-[9px] text-slate-400 font-semibold">TPA Desk</span>
                </button>

                {/* 9. Ask for Help */}
                <button
                  onClick={() => handleSidebarClick('tickets')}
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500/80 p-3 rounded-xl shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight">Ask for Help</span>
                  <span className="text-[9px] text-slate-400 font-semibold">Care Desk</span>
                </button>

              </div>

              {/* 3-COLUMN MAIN DASHBOARD GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* LEFT 2 COLUMNS */}
                <div className="lg:col-span-2 space-y-5">
                  
                  {/* UPCOMING APPOINTMENTS WIDGET */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide">
                          Upcoming Doctor Appointments
                        </h3>
                      </div>
                      <button 
                        onClick={() => handleSidebarClick('appointments')}
                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Book New</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Appointment Card */}
                    <div className="bg-gradient-to-r from-emerald-50/70 via-slate-50 to-blue-50/50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img 
                          src="/src/assets/images/doctor_prakash_kumar_1787230378706.jpg" 
                          alt="Dr. Prashanth Reddy" 
                          className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500 shadow-2xs shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900">Dr. Prashanth Reddy</h4>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-emerald-800">Cardiologist (Heart Specialist)</p>
                          <p className="text-[10px] text-slate-500 font-medium">CARE Hospitals, Warangal</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Date & Time</span>
                          <span className="text-xs font-black text-[#0f2e5a]">28 May 2025</span>
                          <span className="text-[10px] font-bold text-emerald-700 block">10:30 AM</span>
                        </div>
                        <button 
                          onClick={() => showToast('Appointment details sent to WhatsApp & SMS!')}
                          className="mt-1 text-[10px] font-black text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          View Token #12
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MY HEALTH SUMMARY */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide">
                          My Health Summary & Vitals
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">Updated 2 days ago</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Pressure</span>
                        <span className="text-sm font-black text-[#0f2e5a]">120 / 80</span>
                        <span className="text-[9px] text-emerald-600 font-bold block">Normal</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Glucose</span>
                        <span className="text-sm font-black text-[#0f2e5a]">95 mg/dL</span>
                        <span className="text-[9px] text-emerald-600 font-bold block">Fasting</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Heart Rate</span>
                        <span className="text-sm font-black text-[#0f2e5a]">72 bpm</span>
                        <span className="text-[9px] text-emerald-600 font-bold block">Resting</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Weight / BMI</span>
                        <span className="text-sm font-black text-[#0f2e5a]">68 kg</span>
                        <span className="text-[9px] text-blue-600 font-bold block">BMI 23.1</span>
                      </div>
                    </div>
                  </div>

                  {/* NEAREST PARTNER HOSPITALS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide">
                          Nearest Partner Hospitals (Warangal Network)
                        </h3>
                      </div>
                      <button 
                        onClick={() => handleSidebarClick('appointments')}
                        className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900">CARE Hospitals</h4>
                          <p className="text-[10px] text-slate-500">Nayeem Nagar, Hanamkonda</p>
                          <span className="text-[9px] font-bold text-emerald-700">ICU & Emergency Available</span>
                        </div>
                        <button 
                          onClick={() => handleSidebarClick('appointments')}
                          className="text-[10px] font-black text-white bg-[#00703c] px-2.5 py-1 rounded-lg cursor-pointer shrink-0"
                        >
                          Book OPD
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Yashoda Hospitals</h4>
                          <p className="text-[10px] text-slate-500">Hunter Road, Warangal</p>
                          <span className="text-[9px] font-bold text-emerald-700">Super Speciality</span>
                        </div>
                        <button 
                          onClick={() => handleSidebarClick('appointments')}
                          className="text-[10px] font-black text-white bg-[#00703c] px-2.5 py-1 rounded-lg cursor-pointer shrink-0"
                        >
                          Book OPD
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN (Widgets) */}
                <div className="space-y-5">
                  
                  {/* PATIENT PROFILE SUMMARY CARD */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={profileData.image} 
                        alt={profileData.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                      />
                      <div>
                        <h4 className="text-sm font-black text-[#0f2e5a]">{profileData.name}</h4>
                        <p className="text-[10px] font-bold text-emerald-700">Patient ID: {profileData.patientId}</p>
                        <span className="inline-block bg-amber-100 text-amber-900 text-[8px] font-black px-2 py-0.5 rounded-full mt-0.5">
                          AYUDH VIKAS GOLD MEMBER
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs pt-1">
                      <div className="py-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Blood Group:</span>
                        <span className="font-bold text-slate-800">{profileData.bloodGroup}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Phone:</span>
                        <span className="font-bold text-slate-800">{profileData.phone}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Location:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[140px]">Hanamkonda, Warangal</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSidebarClick('profile')}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      View Full Profile
                    </button>
                  </div>

                  {/* GOLD MEMBERSHIP CARD */}
                  <div className="bg-gradient-to-br from-[#091b38] via-[#103063] to-[#0052cc] rounded-2xl p-4 text-white shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[8px] tracking-widest text-emerald-400 font-black uppercase">Ayudh Vikas Foundation</div>
                        <div className="text-xs font-black">GOLD HEALTH CARD</div>
                      </div>
                      <HeartPulse className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div className="text-[11px] text-blue-100 space-y-1">
                      <div className="flex items-center gap-1 text-emerald-300 font-bold">
                        <Check className="w-3 h-3" />
                        <span>20% Discount on Diagnostic Tests</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-300 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Free 24x7 Emergency Ambulance</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-300 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Priority Hospital OPD Queue</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/20 text-[10px]">
                      <span>Valid: <strong>31 May 2026</strong></span>
                      <button 
                        onClick={() => handleSidebarClick('membership')}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        View Card
                      </button>
                    </div>
                  </div>

                  {/* 24X7 QUICK HELP */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <h4 className="text-xs font-black text-[#0f2e5a] uppercase">Need Urgent Assistance?</h4>
                    <div className="space-y-2 text-xs">
                      <a 
                        href="tel:08704210820"
                        className="w-full flex items-center justify-between p-2.5 bg-blue-50 text-blue-800 rounded-xl font-black hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>Call: 0870 4210820</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>

                      <a 
                        href="https://wa.me/919000045073" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-900 rounded-xl font-black hover:bg-emerald-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-600 fill-current" />
                          <span>WhatsApp: 9000045073</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                </div>

              </div>

              {/* WHY AYUDH VIKAS HEALTH CARE NETWORK STATS BAR */}
              <div className="bg-gradient-to-r from-[#091b38] via-[#0d2a58] to-[#091b38] rounded-2xl p-4 text-white shadow-lg space-y-3">
                <div className="text-center">
                  <span className="text-xs font-black tracking-wider uppercase text-blue-200">
                    WHY AYUDH VIKAS HEALTH CARE NETWORK?
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-blue-800/80 pt-1">
                  
                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm font-black">100+</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Partner Hospitals</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-sky-400">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm font-black">500+</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Expert Doctors</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-amber-400">
                      <TestTube className="w-4 h-4" />
                      <span className="text-sm font-black">25+</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Diagnostic Labs</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-rose-400">
                      <Headphones className="w-4 h-4" />
                      <span className="text-sm font-black">24x7</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Call Centre Support</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-emerald-300">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-black">10000+</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Happy Members</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-teal-300">
                      <Tent className="w-4 h-4" />
                      <span className="text-xs font-black">Grama Grama</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Health Camps</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1">
                    <div className="flex items-center gap-1 text-pink-400">
                      <HeartHandshake className="w-4 h-4" />
                      <span className="text-xs font-black">Care with</span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-semibold mt-0.5">Compassion</span>
                  </div>

                </div>

                <div className="flex items-center justify-between text-[10px] text-blue-300/80 pt-2 border-t border-blue-900/80">
                  <span>© 2025 Ayudh Vikas Foundation. All Rights Reserved.</span>
                  <div className="flex items-center gap-3">
                    <a href="#privacy" className="hover:text-white">Privacy Policy</a>
                    <span>|</span>
                    <a href="#terms" className="hover:text-white">Terms & Conditions</a>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0f2e5a]">Edit Patient Profile</h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e => setProfileData({ ...profileData, name: e.target.value, displayName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="text"
                    value={profileData.age}
                    onChange={e => setProfileData({ ...profileData, age: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={profileData.bloodGroup}
                    onChange={e => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option>A+ve</option>
                    <option>B+ve</option>
                    <option>O+ve</option>
                    <option>AB+ve</option>
                    <option>A-ve</option>
                    <option>B-ve</option>
                    <option>O-ve</option>
                    <option>AB-ve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={profileData.emergencyContactName}
                  onChange={e => setProfileData({ ...profileData, emergencyContactName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={profileData.address}
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00703c] text-white font-black px-5 py-2 rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD REMINDER MODAL */}
      {newReminderModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0f2e5a]">Add Health Reminder</h3>
              <button onClick={() => setNewReminderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reminder Title / Medicine</label>
                <input
                  type="text"
                  placeholder="e.g. Take Glycomet GP2"
                  value={newReminderTitle}
                  onChange={e => setNewReminderTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Time & Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 PM (After Dinner)"
                  value={newReminderTime}
                  onChange={e => setNewReminderTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewReminderModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00703c] text-white font-black px-5 py-2 rounded-xl cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FUNDS MODAL */}
      {addFundsModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0f2e5a]">Recharge Ayudh Vikas Wallet</h3>
              <button onClick={() => setAddFundsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Enter Amount (₹)</label>
                <input
                  type="number"
                  value={fundsAmount}
                  onChange={e => setFundsAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-lg font-black text-[#0f2e5a]"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                {['200', '500', '1000', '2000'].map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setFundsAmount(amt)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-[#00703c] hover:bg-[#005830] text-white font-black py-2.5 rounded-xl cursor-pointer"
              >
                Pay via UPI / Card / NetBanking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RAISE TICKET MODAL */}
      {ticketModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0f2e5a]">Raise Patient Support Ticket</h3>
              <button onClick={() => setTicketModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Appointment billing clarification"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain your query in detail..."
                  value={ticketDescription}
                  onChange={e => setTicketDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTicketModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00703c] text-white font-black px-5 py-2 rounded-xl cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MEDICAL RECORD MODAL */}
      {uploadRecordModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0f2e5a]">Upload Medical Document</h3>
              <button onClick={() => setUploadRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Thyroid Test Report"
                  value={recordTitle}
                  onChange={e => setRecordTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Type</label>
                <select
                  value={recordCategory}
                  onChange={e => setRecordCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option>Prescription</option>
                  <option>Lab Report</option>
                  <option>Scan / X-Ray</option>
                  <option>Discharge Summary</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor / Lab Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vijaya Diagnostics"
                  value={recordDoctor}
                  onChange={e => setRecordDoctor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50 cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="font-bold text-slate-700">Choose PDF / Image file</span>
                <span className="block text-[10px] text-slate-400">Max size 25MB</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadRecordModal(false)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00703c] text-white font-black px-5 py-2 rounded-xl cursor-pointer"
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
