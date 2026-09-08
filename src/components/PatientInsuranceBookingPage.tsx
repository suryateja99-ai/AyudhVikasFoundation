import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FlaskConical,
  Ambulance,
  Home,
  ShieldCheck,
  FileText,
  ClipboardList,
  Users,
  CreditCard,
  MessageSquare,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Plus,
  Search,
  Phone,
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Shield,
  Award,
  Sparkles,
  Zap,
  Headphones,
  Lock,
  ArrowRight,
  X,
  Star,
  DollarSign,
  Download,
  CalendarDays,
  User
} from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';

interface PatientInsuranceBookingPageProps {
  onBackToDashboard?: () => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: string) => void;
  embedded?: boolean;
}

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  tag?: string;
  badgeColor?: string;
  sumInsured: string;
  hospitals: string;
  claimSettlement: string;
  annualPrice: number;
  monthlyPrice: number;
  features: string[];
  coPay: string;
  waitingPeriod: string;
  logoBg: string;
  logoText: string;
  logoIcon: string;
}

export const PatientInsuranceBookingPage: React.FC<PatientInsuranceBookingPageProps> = ({
  onBackToDashboard,
  onLogout,
  onNavigateTab,
  embedded = false
}) => {
  const { create } = useLiveData();
  // Navigation active tab
  const [activeSideNav, setActiveSideNav] = useState('Insurance Booking');
  const [searchQuery, setSearchQuery] = useState('');

  // Stepper state (1: Personal Details, 2: Family Members, 3: Select Plan, 4: Review & Pay, 5: Confirmation)
  const [currentStep, setCurrentStep] = useState(1);
  const [policyType, setPolicyType] = useState<'Individual' | 'Family Floater' | 'Senior Citizen' | 'Top-up Plan'>('Individual');

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: 'Ramesh Kumar',
    dob: '1985-06-15',
    displayDob: '15/06/1985',
    gender: 'Male',
    mobileNumber: '9876543210',
    email: 'ramesh.kumar@gmail.com',
    occupation: 'Private Employee',
    city: 'Warangal',
    pincode: '506001',
    hasPreExistingDisease: false,
    selectedPlanId: 'star-health-comp'
  });

  // Family Members state (for Step 2)
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, relation: 'Self', name: 'Ramesh Kumar', age: 38, gender: 'Male' },
    { id: 2, relation: 'Spouse', name: 'Sunitha Kumar', age: 34, gender: 'Female' },
    { id: 3, relation: 'Child 1', name: 'Aarav Kumar', age: 8, gender: 'Male' }
  ]);

  // Interactive Modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanForView, setSelectedPlanForView] = useState<InsurancePlan | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [showClaimsModal, setShowClaimsModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state for plans
  const [filterSumInsured, setFilterSumInsured] = useState('all');
  const [filterHospitalNetwork, setFilterHospitalNetwork] = useState('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available Insurance Plans (exact match from image + details)
  const plans: InsurancePlan[] = [
    {
      id: 'star-health-comp',
      name: 'Comprehensive Insurance',
      provider: 'Star Health',
      tag: 'Most Popular',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      sumInsured: '₹ 10,00,000',
      hospitals: '10,000+',
      claimSettlement: '98.2%',
      annualPrice: 10882,
      monthlyPrice: 940,
      features: [
        'Zero Co-pay on all network hospitals',
        'Ayurveda, Yoga & Homeopathy covered',
        'Free annual health checkup for all adults',
        'Automatic restoration of basic sum insured 100%'
      ],
      coPay: '0%',
      waitingPeriod: '24 Months for Pre-existing',
      logoBg: 'bg-blue-600',
      logoText: 'Star Health',
      logoIcon: '★'
    },
    {
      id: 'hdfc-ergo-optima',
      name: 'Optima Secure',
      provider: 'HDFC ERGO',
      sumInsured: '₹ 10,00,000',
      hospitals: '8,500+',
      claimSettlement: '96.1%',
      annualPrice: 17782,
      monthlyPrice: 1540,
      features: [
        '4X coverage benefit (₹40 Lakhs effective cover)',
        'Zero deduction on non-medical expenses',
        'Protect benefit covers consumables',
        'Restore benefit with unutilized rollover'
      ],
      coPay: '0%',
      waitingPeriod: '36 Months for Pre-existing',
      logoBg: 'bg-rose-600',
      logoText: 'HDFC ERGO',
      logoIcon: 'H'
    },
    {
      id: 'care-health-supreme',
      name: 'Care Supreme',
      provider: 'Care Health',
      sumInsured: '₹ 10,00,000',
      hospitals: '9,000+',
      claimSettlement: '97.5%',
      annualPrice: 10999,
      monthlyPrice: 955,
      features: [
        'Unlimited automatic recharge',
        'No sub-limit on ICU & Room rent charges',
        'Cumulative bonus up to 500%',
        '60 days pre & 180 days post hospitalization'
      ],
      coPay: '0%',
      waitingPeriod: '30 Months for Pre-existing',
      logoBg: 'bg-red-700',
      logoText: 'Care Health',
      logoIcon: '✚'
    }
  ];

  const handleNavClick = (tabName: string) => {
    setActiveSideNav(tabName);
    if (tabName === 'Dashboard' && onBackToDashboard) {
      onBackToDashboard();
    } else if (onNavigateTab) {
      if (tabName === 'Appointments') onNavigateTab('appointments');
      else if (tabName === 'Lab Bookings') onNavigateTab('lab_tests');
      else if (tabName === 'Ambulance') onNavigateTab('ambulance_booking');
      else if (tabName === 'Home Care Services') onNavigateTab('home_service');
      else if (tabName === 'My Policies' || tabName === 'Insurance Booking') onNavigateTab('insurance');
      else if (tabName === 'Claims') setShowClaimsModal(true);
      else if (tabName === 'My Family') onNavigateTab('profile');
      else if (tabName === 'Payments') onNavigateTab('wallet');
      else if (tabName === 'Messages') onNavigateTab('tickets');
      else if (tabName === 'Notifications') onNavigateTab('reminders');
      else if (tabName === 'Support') onNavigateTab('tickets');
      else if (tabName === 'Settings') onNavigateTab('settings');
      else if (tabName === 'Logout' && onLogout) onLogout();
    }
  };

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
      showToast('Personal details validated! Moving to Plan & Family setup.');
    } else if (currentStep === 2) {
      setCurrentStep(3);
      showToast('Select your preferred insurance coverage.');
    } else if (currentStep === 3) {
      setCurrentStep(4);
      showToast('Review policy quotation and proceed to payment.');
    } else if (currentStep === 4) {
      create('insurance_applications', {
        ...formData,
        familyMembers,
        policyType,
        plan: activeSelectedPlan,
        status: 'Issued',
      }).catch(console.error);
      setCurrentStep(5);
      setShowSuccessModal(true);
      showToast('Payment successful! Policy generated.');
    }
  };

  const activeSelectedPlan = plans.find(p => p.id === formData.selectedPlanId) || plans[0];

  return (
    <div className={`${embedded ? 'bg-transparent' : 'min-h-screen bg-[#f0f4f9]'} font-sans text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Exact match with Logo, Search, Call Support, Profile) - Shown in standalone mode */}
      {/* ========================================================================= */}
      {!embedded && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 shadow-2xs">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
            
            {/* Left: Brand Identity & Breadcrumb */}
            <div className="flex items-center gap-4">
              
              {/* Brand Logo with Hands / Green Emblem */}
              <div 
                onClick={() => handleNavClick('Dashboard')}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-xs flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-1">
                    <div className="relative flex items-center justify-center">
                      <span className="text-emerald-700 text-base font-black">🌿</span>
                      <span className="absolute -bottom-1 text-[8px] font-black text-blue-700">✚</span>
                    </div>
                  </div>
                </div>

                <div className="leading-tight">
                  <div className="text-sm font-black tracking-tight text-[#0a2540] flex items-center gap-1">
                    AYUDH VIKAS
                  </div>
                  <div className="text-[9.5px] font-black text-emerald-600 uppercase tracking-wide -mt-0.5">
                    HEALTH CARE NETWORK
                  </div>
                  <div className="text-[7.5px] font-semibold text-slate-400 italic -mt-0.5">
                    Cure Beyond Boundaries
                  </div>
                </div>
              </div>

              {/* Hamburger Icon */}
              <button 
                onClick={() => showToast('Toggle Navigation')}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors ml-1"
              >
                <span className="text-xl font-bold">≡</span>
              </button>

              {/* Page Title & Breadcrumb */}
              <div className="hidden sm:block pl-2 border-l border-slate-200">
                <h1 className="text-base font-black text-[#0a2540] leading-none">
                  Insurance Booking
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                  <span 
                    onClick={() => handleNavClick('Dashboard')}
                    className="hover:text-blue-600 cursor-pointer"
                  >
                    Dashboard
                  </span>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <span className="text-slate-600 font-bold">Insurance Booking</span>
                </div>
              </div>

            </div>

            {/* Center Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search policies, insurers, plans..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              
              {/* Call Support Pill */}
              <a 
                href="tel:08704210820"
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[9px] font-bold text-slate-500">Call Support</div>
                  <div className="text-xs font-black text-emerald-700">0870-4210820</div>
                </div>
              </a>

              {/* Notification Bell Badge (3) */}
              <button 
                onClick={() => showToast('You have 3 active policy renewal alerts.')}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  3
                </span>
              </button>

              {/* Patient Profile Pill */}
              <div 
                onClick={() => setShowEditDetailsModal(true)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity p-1 rounded-xl hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-blue-100 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" 
                    alt="Ramesh Kumar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-black text-slate-800">Ramesh Kumar</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Patient</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </div>

            </div>

          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: DARK NAVY SIDEBAR + RICH INSURANCE CONTENT */}
      {/* ========================================================================= */}
      <div className={embedded ? 'w-full' : 'flex flex-1 max-w-[1700px] w-full mx-auto'}>
        
        {/* ======================================================================= */}
        {/* LEFT DARK NAVY SIDEBAR (Shown in standalone mode) */}
        {/* ======================================================================= */}
        {!embedded && (
          <aside className="w-60 bg-[#0a2540] text-slate-300 flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-[#143960]">
            
            <div className="p-3 space-y-3">
              
              {/* Green Top Action Button: + New Insurance Booking */}
              <button
                onClick={() => {
                  setCurrentStep(1);
                  showToast('Starting a new insurance proposal workflow');
                }}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-md cursor-pointer hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>New Insurance Booking</span>
              </button>

              {/* Sidebar Navigation Items */}
              <nav className="space-y-0.5 text-xs">
                
                <button
                  onClick={() => handleNavClick('Dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('Appointments')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-slate-400" />
                  <span>Appointments</span>
                </button>

                <button
                  onClick={() => handleNavClick('Lab Bookings')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-amber-400" />
                  <span>Lab Bookings</span>
                </button>

                <button
                  onClick={() => handleNavClick('Ambulance')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <Ambulance className="w-4 h-4 text-rose-400" />
                  <span>Ambulance</span>
                </button>

                <button
                  onClick={() => handleNavClick('Home Care Services')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>Home Care Services</span>
                </button>

                {/* Active Tab: Insurance Booking (Highlighted royal blue pill with check icon) */}
                <button
                  onClick={() => handleNavClick('Insurance Booking')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-black bg-[#1e60d5] text-white shadow-md transition-all cursor-pointer"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                  <span>Insurance Booking</span>
                </button>

                <button
                  onClick={() => {
                    setShowPoliciesModal(true);
                    handleNavClick('My Policies');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>My Policies</span>
                </button>

                <button
                  onClick={() => {
                    setShowClaimsModal(true);
                    handleNavClick('Claims');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-slate-400" />
                  <span>Claims</span>
                </button>

                <button
                  onClick={() => handleNavClick('My Family')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>My Family</span>
                </button>

                <button
                  onClick={() => handleNavClick('Payments')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Payments</span>
                </button>

                <button
                  onClick={() => handleNavClick('Messages')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Messages</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                    3
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('Notifications')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Notifications</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    5
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('Support')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Support</span>
                </button>

                <button
                  onClick={() => handleNavClick('Settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-[#133860] hover:text-white transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    else if (onBackToDashboard) onBackToDashboard();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>

              </nav>

            </div>

            {/* Need Help? Box at bottom of sidebar */}
            <div className="p-3">
              <div className="bg-[#0f345a] border border-[#1b4b7d] rounded-xl p-3 text-center space-y-1.5 shadow-inner">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-xs font-black text-white">Need Help?</div>
                <div className="text-[10px] text-blue-200 font-medium">Talk to our Insurance expert</div>
                <a 
                  href="tel:08704210820"
                  className="block text-sm font-black text-emerald-400 hover:text-emerald-300 tracking-wide"
                >
                  0870-4210820
                </a>
                <div className="text-[9px] text-slate-400 font-medium pt-0.5 border-t border-[#1b4b7d]">
                  Mon - Sat | 5:00 AM - 5:00 PM
                </div>
              </div>
            </div>

          </aside>
        )}

        {/* ======================================================================= */}
        {/* RIGHT MAIN CONTENT AREA */}
        {/* ======================================================================= */}
        <main className={embedded ? 'p-3 sm:p-5 lg:p-6 space-y-4' : 'flex-1 overflow-y-auto p-3 sm:p-5 space-y-4'}>
          
          {/* Subheader when embedded in PatientDashboard (Exact Header styling from image) */}
          {embedded && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-black text-[#0a2540] leading-none">
                  Insurance Booking
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-1">
                  <span 
                    onClick={onBackToDashboard}
                    className="hover:text-blue-600 cursor-pointer"
                  >
                    Dashboard
                  </span>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <span className="text-slate-600 font-bold">Insurance Booking</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search policies, insurers, plans..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Call Support + Action Button */}
              <div className="flex items-center gap-2.5">
                <a 
                  href="tel:08704210820"
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <div className="text-[9px] font-bold text-slate-500">Call Support</div>
                    <div className="text-xs font-black text-emerald-700">0870-4210820</div>
                  </div>
                </a>

                <button
                  onClick={() => {
                    setCurrentStep(1);
                    showToast('Starting new insurance booking proposal');
                  }}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-2 px-3 rounded-xl flex items-center gap-1.5 text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Booking</span>
                </button>
              </div>
            </div>
          )}
          
          {/* ===================================================================== */}
          {/* TOP 4 SUMMARY STAT CARDS (Exact values & layout from image) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Stat 1: 12 Policies Purchased */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">12</div>
                  <div className="text-xs font-black text-slate-800 mt-1">Policies Purchased</div>
                  <div className="text-[10px] text-slate-400 font-medium">Total</div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => setShowPoliciesModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Policies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stat 2: 3 Active Policies */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">3</div>
                  <div className="text-xs font-black text-slate-800 mt-1">Active Policies</div>
                  <div className="text-[10px] text-slate-400 font-medium">Currently Valid</div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => setShowPoliciesModal(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Active</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stat 3: ₹ 2,45,000 Total Sum Insured */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-lg font-black">₹</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">₹ 2,45,000</div>
                  <div className="text-xs font-black text-slate-800 mt-1">Total Sum Insured</div>
                  <div className="text-[10px] text-slate-400 font-medium">Across Policies</div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => setShowPoliciesModal(true)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stat 4: 1 Claims in Process */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">1</div>
                  <div className="text-xs font-black text-slate-800 mt-1">Claims in Process</div>
                  <div className="text-[10px] text-slate-400 font-medium">Under Review</div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => setShowClaimsModal(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Claims</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* MAIN 2-COLUMN SECTION: LEFT FORM & BANNER + RIGHT DETAILS & PLANS */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* =================================================================== */}
            {/* LEFT 8 COLUMNS: BUY NEW HEALTH INSURANCE FORM + BANNERS */}
            {/* =================================================================== */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* BUY NEW HEALTH INSURANCE CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
                
                <h2 className="text-base font-black text-slate-900">
                  Buy New Health Insurance
                </h2>

                {/* 5-STEP STEPPER BAR */}
                <div className="relative pb-2">
                  <div className="flex items-center justify-between relative z-10 text-xs">
                    
                    {/* Step 1 */}
                    <div 
                      onClick={() => setCurrentStep(1)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                        currentStep >= 1 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}>
                        1
                      </div>
                      <span className={`text-[10.5px] mt-1 font-bold ${
                        currentStep === 1 ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        Personal Details
                      </span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                    {/* Step 2 */}
                    <div 
                      onClick={() => setCurrentStep(2)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                        currentStep >= 2 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}>
                        2
                      </div>
                      <span className={`text-[10.5px] mt-1 font-bold ${
                        currentStep === 2 ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        Family Members
                      </span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                    {/* Step 3 */}
                    <div 
                      onClick={() => setCurrentStep(3)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                        currentStep >= 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}>
                        3
                      </div>
                      <span className={`text-[10.5px] mt-1 font-bold ${
                        currentStep === 3 ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        Select Plan
                      </span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                    {/* Step 4 */}
                    <div 
                      onClick={() => setCurrentStep(4)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                        currentStep >= 4 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}>
                        4
                      </div>
                      <span className={`text-[10.5px] mt-1 font-bold ${
                        currentStep === 4 ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        Review & Pay
                      </span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 5 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                    {/* Step 5 */}
                    <div 
                      onClick={() => setCurrentStep(5)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                        currentStep >= 5 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                      }`}>
                        5
                      </div>
                      <span className={`text-[10.5px] mt-1 font-bold ${
                        currentStep === 5 ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        Confirmation
                      </span>
                    </div>

                  </div>
                </div>

                {/* POLICY TYPE SELECTOR PILLS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800">Policy Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    
                    {/* Individual */}
                    <button
                      type="button"
                      onClick={() => setPolicyType('Individual')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        policyType === 'Individual'
                          ? 'border-2 border-emerald-600 bg-emerald-50/50 text-emerald-800 font-black shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Individual</span>
                      {policyType === 'Individual' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>

                    {/* Family Floater */}
                    <button
                      type="button"
                      onClick={() => setPolicyType('Family Floater')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        policyType === 'Family Floater'
                          ? 'border-2 border-emerald-600 bg-emerald-50/50 text-emerald-800 font-black shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Family Floater</span>
                      {policyType === 'Family Floater' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>

                    {/* Senior Citizen */}
                    <button
                      type="button"
                      onClick={() => setPolicyType('Senior Citizen')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        policyType === 'Senior Citizen'
                          ? 'border-2 border-emerald-600 bg-emerald-50/50 text-emerald-800 font-black shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Senior Citizen</span>
                      {policyType === 'Senior Citizen' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>

                    {/* Top-up Plan */}
                    <button
                      type="button"
                      onClick={() => setPolicyType('Top-up Plan')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        policyType === 'Top-up Plan'
                          ? 'border-2 border-emerald-600 bg-emerald-50/50 text-emerald-800 font-black shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Top-up Plan</span>
                      {policyType === 'Top-up Plan' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>

                  </div>
                </div>

                {/* FORM CONTENT (Conditioned on Stepper, matching Step 1 Default from image) */}
                {currentStep === 1 && (
                  <form onSubmit={handleSaveAndContinue} className="space-y-4 pt-1">
                    
                    <div className="text-xs font-black text-slate-800">
                      Personal Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Full Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          placeholder="e.g. Ramesh Kumar"
                          required
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Date of Birth</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.displayDob}
                            onChange={e => setFormData({ ...formData, displayDob: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                            placeholder="DD/MM/YYYY"
                            required
                          />
                          <CalendarDays className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Gender</label>
                        <div className="relative">
                          <select
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-2xs"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          placeholder="10-digit mobile"
                          required
                        />
                      </div>

                      {/* Email ID */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Email ID</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          placeholder="e.g. name@example.com"
                          required
                        />
                      </div>

                      {/* Occupation */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Occupation</label>
                        <div className="relative">
                          <select
                            value={formData.occupation}
                            onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-2xs"
                          >
                            <option value="Private Employee">Private Employee</option>
                            <option value="Govt Employee">Govt Employee</option>
                            <option value="Self Employed / Business">Self Employed / Business</option>
                            <option value="Doctor / Healthcare">Doctor / Healthcare</option>
                            <option value="Student">Student</option>
                            <option value="Retired">Retired</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">City</label>
                        <div className="relative">
                          <select
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-2xs"
                          >
                            <option value="Warangal">Warangal</option>
                            <option value="Hanamkonda">Hanamkonda</option>
                            <option value="Kazipet">Kazipet</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Jangaon">Jangaon</option>
                            <option value="Mulugu">Mulugu</option>
                            <option value="Bhupalpally">Bhupalpally</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                          placeholder="506001"
                          required
                        />
                      </div>

                      {/* Do you have any pre-existing disease? */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Do you have any pre-existing disease?
                        </label>
                        <div className="flex items-center gap-4 pt-1 text-xs font-bold text-slate-700">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="preExisting"
                              checked={formData.hasPreExistingDisease === true}
                              onChange={() => setFormData({ ...formData, hasPreExistingDisease: true })}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="preExisting"
                              checked={formData.hasPreExistingDisease === false}
                              onChange={() => setFormData({ ...formData, hasPreExistingDisease: false })}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Submit Action Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-[#15803d] hover:bg-[#166534] text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer hover:shadow-lg"
                      >
                        <span>Save & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </form>
                )}

                {/* STEP 2: FAMILY MEMBERS */}
                {currentStep === 2 && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black text-slate-800">
                        Insured Members (Floater Group)
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newMember = { id: Date.now(), relation: 'Child 2', name: 'Ananya Kumar', age: 4, gender: 'Female' };
                          setFamilyMembers([...familyMembers, newMember]);
                          showToast('Family member added to floater!');
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Member</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {familyMembers.map(member => (
                        <div key={member.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center">
                              {member.relation[0]}
                            </div>
                            <div>
                              <div className="font-black text-slate-900">{member.name} ({member.relation})</div>
                              <div className="text-[10px] text-slate-500 font-semibold">{member.age} Yrs • {member.gender} • No pre-existing illness</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            Included
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 cursor-pointer"
                      >
                        ← Back to Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(3);
                          showToast('Family configured. Now pick a plan!');
                        }}
                        className="bg-[#15803d] hover:bg-[#166534] text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <span>Select Plan →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: SELECT PLAN */}
                {currentStep === 3 && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="text-xs font-black text-slate-800">
                      Choose Your Preferred Policy
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {plans.map(plan => (
                        <div
                          key={plan.id}
                          onClick={() => setFormData({ ...formData, selectedPlanId: plan.id })}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            formData.selectedPlanId === plan.id
                              ? 'border-2 border-blue-600 bg-blue-50/40 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          {plan.tag && (
                            <span className="absolute -top-2 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                              {plan.tag}
                            </span>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg ${plan.logoBg} text-white flex items-center justify-center text-xs font-black`}>
                                {plan.logoIcon}
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-900">{plan.provider}</div>
                                <div className="text-[10px] text-slate-500 font-semibold">{plan.name}</div>
                              </div>
                            </div>

                            <div className="p-2 bg-slate-50 rounded-xl text-[11px] space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Cover:</span>
                                <span className="font-black text-slate-800">{plan.sumInsured}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Hospitals:</span>
                                <span className="font-bold text-slate-800">{plan.hospitals}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] text-slate-400">Starting from</div>
                              <div className="text-xs font-black text-blue-700">₹ {plan.annualPrice.toLocaleString()} /yr</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              formData.selectedPlanId === plan.id ? 'bg-blue-600 text-white' : 'border border-slate-300'
                            }`}>
                              {formData.selectedPlanId === plan.id && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 cursor-pointer"
                      >
                        ← Back to Members
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(4);
                          showToast('Reviewing quote breakdown');
                        }}
                        className="bg-[#15803d] hover:bg-[#166534] text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <span>Review & Pay →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & PAY */}
                {currentStep === 4 && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="text-xs font-black text-slate-800">
                      Policy Quotation Summary
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <div>
                          <div className="font-black text-slate-900 text-sm">{activeSelectedPlan.provider} {activeSelectedPlan.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Sum Insured: {activeSelectedPlan.sumInsured} • {policyType} Plan</div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                          Instant Cashless
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Primary Insured:</span>
                          <span className="font-bold text-slate-800">{formData.fullName} (38 Yrs)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location & Pincode:</span>
                          <span className="font-bold text-slate-800">{formData.city}, {formData.pincode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Annual Premium:</span>
                          <span className="font-bold text-slate-800">₹ {activeSelectedPlan.annualPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ayudh Vikas Gold Network Discount (10%):</span>
                          <span className="font-bold text-emerald-600">- ₹ {Math.round(activeSelectedPlan.annualPrice * 0.1).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18%):</span>
                          <span className="font-bold text-slate-800">₹ {Math.round(activeSelectedPlan.annualPrice * 0.9 * 0.18).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 text-xs font-black text-slate-900">
                          <span>Total Payable Amount:</span>
                          <span className="text-sm font-black text-emerald-700">
                            ₹ {Math.round(activeSelectedPlan.annualPrice * 0.9 * 1.18).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 cursor-pointer"
                      >
                        ← Back to Plans
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAndContinue}
                        className="bg-[#15803d] hover:bg-[#166534] text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay Securely & Generate Policy</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: CONFIRMATION */}
                {currentStep === 5 && (
                  <div className="space-y-4 pt-2 text-center animate-fadeIn">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Health Insurance Policy Issued Successfully!</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Policy No: <span className="font-black text-slate-800">AVH-98421034-SH</span> • Digital Health Card linked
                      </p>
                    </div>

                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl max-w-md mx-auto text-xs text-emerald-900 space-y-1 text-left">
                      <div className="font-bold">✓ Cashless e-Card generated in Patient Portal</div>
                      <div className="font-bold">✓ Direct TPA desk pre-authorization activated for Warangal hospitals</div>
                      <div className="font-bold">✓ Policy document emailed to {formData.email}</div>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowPoliciesModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Policy PDF</span>
                      </button>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Book Another Policy
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* ================================================================= */}
              {/* TRUST BANNER: SECURE YOUR HEALTH, SECURE YOUR FUTURE */}
              {/* ================================================================= */}
              <div className="bg-gradient-to-r from-[#eef6ff] via-[#f4f9ff] to-[#eaf3fe] border border-[#d6e7fc] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
                
                {/* Illustration with Umbrella + Family + Heart */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/80 border border-blue-100 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                  <div className="relative flex flex-col items-center">
                    {/* Umbrella Graphic */}
                    <div className="w-16 h-8 bg-blue-500 rounded-t-full relative shadow-xs">
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="w-0.5 h-8 bg-blue-400 -mt-1"></div>
                    {/* Family icons */}
                    <div className="flex items-center gap-0.5 -mt-6">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">👨</div>
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">👩</div>
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center shadow-xs">🧒</div>
                    </div>
                    {/* Red Heart */}
                    <div className="absolute -right-2 top-2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                      ♥
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Secure your health, Secure your future
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Choose the best health insurance policy for you and your family
                    </p>
                  </div>

                  {/* 3 Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                    
                    <div className="flex items-center gap-2 bg-white/70 border border-blue-100/60 p-2 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[11px] font-black text-slate-800">Cashless Treatment</div>
                        <div className="text-[9.5px] text-slate-500 font-medium">Network Hospitals</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/70 border border-blue-100/60 p-2 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[11px] font-black text-slate-800">Quick Claim Process</div>
                        <div className="text-[9.5px] text-slate-500 font-medium">Hassle Free</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/70 border border-blue-100/60 p-2 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-[11px] font-black text-slate-800">24/7 Support</div>
                        <div className="text-[9.5px] text-slate-500 font-medium">Always with you</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* ================================================================= */}
              {/* WHY CHOOSE INSURANCE WITH US? BOTTOM STRIP */}
              {/* ================================================================= */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black text-slate-900">
                  Why Choose Insurance with Us?
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                  
                  {/* Feature 1 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10.5px] font-black text-slate-800">Wide Range of Plans</div>
                    <div className="text-[9px] text-slate-400 font-medium leading-tight">Top Insurers & Plans</div>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10.5px] font-black text-slate-800">Best Price Guarantee</div>
                    <div className="text-[9px] text-slate-400 font-medium leading-tight">Get Best Premium</div>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10.5px] font-black text-slate-800">Easy & Quick Buying</div>
                    <div className="text-[9px] text-slate-400 font-medium leading-tight">100% Online Process</div>
                  </div>

                  {/* Feature 4 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <Headphones className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10.5px] font-black text-slate-800">Expert Assistance</div>
                    <div className="text-[9px] text-slate-400 font-medium leading-tight">We're Here to Help</div>
                  </div>

                  {/* Feature 5 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 col-span-2 sm:col-span-1">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10.5px] font-black text-slate-800">Secure & Trusted</div>
                    <div className="text-[9px] text-slate-400 font-medium leading-tight">Your Data is Safe</div>
                  </div>

                </div>
              </div>

            </div>

            {/* =================================================================== */}
            {/* RIGHT 4 COLUMNS: YOUR DETAILS + RECOMMENDED PLANS */}
            {/* =================================================================== */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* YOUR DETAILS CARD (Exact layout from image) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900">Your Details</h3>
                  <button
                    onClick={() => setShowEditDetailsModal(true)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-black text-slate-900">{formData.fullName}</div>
                    <div className="text-[11px] text-slate-600">{formData.mobileNumber}</div>
                    <div className="text-[11px] text-slate-500 truncate">{formData.email}</div>
                  </div>
                  <div className="text-right text-[11px] leading-tight">
                    <div className="text-slate-400 font-semibold">Age</div>
                    <div className="font-bold text-slate-800">38 Yrs</div>
                    <div className="text-slate-400 font-semibold mt-1">City</div>
                    <div className="font-bold text-slate-800">{formData.city}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Members</span>
                  <span className="font-bold text-slate-800">1 Member</span>
                </div>
              </div>

              {/* RECOMMENDED PLANS FOR YOU CARD (Exact Star Health, HDFC ERGO, Care Health) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900">Recommended Plans for You</h3>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Filter</span>
                  </button>
                </div>

                {/* Plan List */}
                <div className="space-y-3">
                  
                  {/* Plan 1: Star Health Comprehensive Insurance (Most Popular) */}
                  <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                          ★
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">Star Health</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Comprehensive Insurance</div>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-200">
                        Most Popular
                      </span>
                    </div>

                    {/* 3 Metric Pills */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Sum Insured</div>
                        <div className="font-black text-slate-800">₹ 10,00,000</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Network Hospitals</div>
                        <div className="font-black text-slate-800">10,000+</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Claim Settlement</div>
                        <div className="font-black text-slate-800">98.2%</div>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] text-slate-400 block leading-none">Starting from</span>
                        <span className="text-xs font-black text-slate-900">₹ 10,882</span>
                        <span className="text-[10px] text-slate-500 font-medium"> / year</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPlanForView(plans[0]);
                          setShowPlanModal(true);
                        }}
                        className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        View Plan & Buy
                      </button>
                    </div>
                  </div>

                  {/* Plan 2: HDFC ERGO Optima Secure */}
                  <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                          H
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">HDFC ERGO</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Optima Secure</div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Metric Pills */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Sum Insured</div>
                        <div className="font-black text-slate-800">₹ 10,00,000</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Network Hospitals</div>
                        <div className="font-black text-slate-800">8,500+</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Claim Settlement</div>
                        <div className="font-black text-slate-800">96.1%</div>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] text-slate-400 block leading-none">Starting from</span>
                        <span className="text-xs font-black text-slate-900">₹ 17,782</span>
                        <span className="text-[10px] text-slate-500 font-medium"> / year</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPlanForView(plans[1]);
                          setShowPlanModal(true);
                        }}
                        className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        View Plan & Buy
                      </button>
                    </div>
                  </div>

                  {/* Plan 3: Care Health Care Supreme */}
                  <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-red-700 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                          ✚
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">Care Health</div>
                          <div className="text-[10px] text-slate-500 font-semibold">Care Supreme</div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Metric Pills */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Sum Insured</div>
                        <div className="font-black text-slate-800">₹ 10,00,000</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Network Hospitals</div>
                        <div className="font-black text-slate-800">9,000+</div>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium">Claim Settlement</div>
                        <div className="font-black text-slate-800">97.5%</div>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] text-slate-400 block leading-none">Starting from</span>
                        <span className="text-xs font-black text-slate-900">₹ 10,999</span>
                        <span className="text-[10px] text-slate-500 font-medium"> / year</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPlanForView(plans[2]);
                          setShowPlanModal(true);
                        }}
                        className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        View Plan & Buy
                      </button>
                    </div>
                  </div>

                </div>

                {/* View More Plans Link */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setCurrentStep(3);
                      showToast('Showing all accredited insurance policies');
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View More Plans →
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* ===================================================================== */}
          {/* BOTTOM FOOTER STRIP (Exact match from image) */}
          {/* ===================================================================== */}
          <footer className="pt-3 pb-2 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              © 2024 Ayudh Vikas Health Care Network. All Rights Reserved.
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <button onClick={() => showToast('Ayudh Vikas Privacy Policy')} className="hover:text-slate-800 cursor-pointer">Privacy Policy</button>
              <span>|</span>
              <button onClick={() => showToast('Terms & Conditions')} className="hover:text-slate-800 cursor-pointer">Terms & Conditions</button>
              <span>|</span>
              <button onClick={() => showToast('Help Center & Insurance Claims Guide')} className="hover:text-slate-800 cursor-pointer">Help</button>
            </div>
          </footer>

        </main>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW PLAN & BUY MODAL */}
      {/* ========================================================================= */}
      {showPlanModal && selectedPlanForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl ${selectedPlanForView.logoBg} text-white flex items-center justify-center font-black`}>
                  {selectedPlanForView.logoIcon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{selectedPlanForView.provider} {selectedPlanForView.name}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Direct Cashless Network Policy</p>
                </div>
              </div>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400">Sum Insured</div>
                  <div className="font-black text-slate-900 text-sm">{selectedPlanForView.sumInsured}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Cashless Network</div>
                  <div className="font-black text-slate-900 text-sm">{selectedPlanForView.hospitals}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Settlement Ratio</div>
                  <div className="font-black text-emerald-700 text-sm">{selectedPlanForView.claimSettlement}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-black text-slate-900">Key Policy Benefits:</div>
                <div className="space-y-1">
                  {selectedPlanForView.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold">Annual Premium (Incl. Taxes)</div>
                  <div className="text-base font-black text-emerald-800">₹ {selectedPlanForView.annualPrice.toLocaleString()} / year</div>
                </div>
                <div className="text-right text-[10px] text-emerald-700 font-bold">
                  or ₹ {selectedPlanForView.monthlyPrice} / mo
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowPlanModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, selectedPlanId: selectedPlanForView.id });
                  setShowPlanModal(false);
                  setCurrentStep(4);
                  showToast(`Selected ${selectedPlanForView.provider} ${selectedPlanForView.name}`);
                }}
                className="w-full py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Select & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MY POLICIES MODAL */}
      {/* ========================================================================= */}
      {showPoliciesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">My Purchased Health Policies</h3>
                <p className="text-xs text-slate-500 font-semibold">Active digital e-cards & renewal schedule</p>
              </div>
              <button onClick={() => setShowPoliciesModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">Star Health Comprehensive</span>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">Policy No: SH-98210344 • Sum Insured: ₹10,00,000</div>
                  <div className="text-[10px] text-slate-500">Valid Till: 24 May 2026 • Insured: Ramesh Kumar (Self)</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => showToast('Downloading e-Card PDF')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>e-Card</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">Care Health Floater</span>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">Policy No: CH-77412980 • Sum Insured: ₹5,00,000</div>
                  <div className="text-[10px] text-slate-500">Valid Till: 18 Oct 2025 • Insured: Family (3 Members)</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => showToast('Downloading Policy Document')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Policy Doc</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPoliciesModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CLAIMS TRACKER MODAL */}
      {/* ========================================================================= */}
      {showClaimsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Cashless Claims Status</h3>
                <p className="text-xs text-slate-500 font-semibold">Direct hospital pre-authorization tracking</p>
              </div>
              <button onClick={() => setShowClaimsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-amber-900">Claim ID: CLM-849201</span>
                <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                  UNDER REVIEW
                </span>
              </div>
              <div className="text-slate-700">
                <strong>Hospital:</strong> CARE Hospitals Warangal (Cardiology Dept)
              </div>
              <div className="text-slate-700">
                <strong>Claim Amount:</strong> ₹ 42,500 (Pre-auth approved ₹ 40,000)
              </div>
              <div className="text-[11px] text-slate-500">
                TPA desk is reviewing the final itemized discharge summary. Expected settlement within 4 hours.
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowClaimsModal(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT DETAILS MODAL */}
      {/* ========================================================================= */}
      {showEditDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Edit Patient Details</h3>
              <button onClick={() => setShowEditDetailsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowEditDetailsModal(false)}
                className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditDetailsModal(false);
                  showToast('Patient details updated!');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST POPUP */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0a2540] text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-tight">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
