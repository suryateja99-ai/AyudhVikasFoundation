import React, { useState } from 'react';
import { 
  HeartPulse, 
  User, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  Ambulance, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut,
  Calendar,
  X,
  FileCheck,
  Building2,
  Phone,
  MessageSquare,
  Headphones,
  Check,
  Percent,
  FlaskConical,
  Home,
  FileText,
  CreditCard,
  Tag,
  ArrowDownToLine,
  Truck,
  Sparkles,
  Activity
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';

interface LabTestsPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onSignInClick: () => void;
  isLoggedIn?: boolean;
  userProfile?: {
    name: string;
    displayName: string;
    patientId: string;
    image: string;
    phone?: string;
    email?: string;
  };
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
  isDashboardContext?: boolean;
  hideHeader?: boolean;
}

export const LabTestsPage: React.FC<LabTestsPageProps> = ({
  onBackToHome,
  onOpenModal,
  onSignInClick,
  isLoggedIn = false,
  userProfile = {
    name: 'Ramesh Kumar',
    displayName: 'Ramesh K.',
    patientId: 'AVP100245',
    phone: '9876543210',
    email: 'ramesh.kumar@example.com',
    image: '/src/assets/images/patient_avatar_1787229395408.jpg'
  },
  onNavigateDashboard,
  onLogout,
  isDashboardContext = false,
  hideHeader = false
}) => {
  const { create } = useLiveData();
  const { isGuest } = useAuth();
  // Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [patientName, setPatientName] = useState(isLoggedIn ? userProfile.name : '');
  const [age, setAge] = useState(isLoggedIn ? '42' : '');
  const [gender, setGender] = useState(isLoggedIn ? 'Male' : '');
  const [mobileNumber, setMobileNumber] = useState(isLoggedIn ? userProfile.phone || '9876543210' : '');
  const [email, setEmail] = useState(isLoggedIn ? userProfile.email || 'ramesh.kumar@example.com' : '');
  const [address, setAddress] = useState(isLoggedIn ? 'Subedari, Hanamkonda, Warangal - 506001' : '');
  const [cityDistrict, setCityDistrict] = useState('Warangal');
  
  // Sample collection selection: 'home' | 'lab'
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('home');
  const [preferredDate, setPreferredDate] = useState('2026-08-21');
  const [preferredTime, setPreferredTime] = useState('08:30 AM - 10:00 AM');

  // Additional Info
  const [fasting, setFasting] = useState<'Yes' | 'No' | 'Not Required'>('Not Required');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [previousReports, setPreviousReports] = useState<'Yes' | 'No'>('No');
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Dropdown states & UI modal
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    open: boolean;
    bookingId?: string;
    packageName?: string;
    labName?: string;
    collectionType?: string;
    date?: string;
    time?: string;
    totalAmount?: string;
  }>({ open: false });

  // Reset form handler
  const handleReset = () => {
    setSelectedCategory('');
    setSelectedPackage('');
    setSelectedLab('');
    setPatientName('');
    setAge('');
    setGender('');
    setMobileNumber('');
    setEmail('');
    setAddress('');
    setCityDistrict('Warangal');
    setCollectionType('home');
    setPreferredDate('2026-08-21');
    setPreferredTime('08:30 AM - 10:00 AM');
    setFasting('Not Required');
    setMedicalCondition('');
    setPreviousReports('No');
    setTermsAgreed(false);
  };

  // Submit lab booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onOpenModal('register_patient');
      return;
    }
    if (!termsAgreed) {
      alert('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    const testLabel = selectedPackage || selectedCategory || 'Full Body Checkup (70+ Tests)';
    const labLabel = selectedLab || 'Ayudh Vikas Certified Partner Lab';
    const created = await create('lab_bookings', {
      patientName,
      age,
      gender,
      phone: mobileNumber,
      email,
      address,
      cityDistrict,
      collectionType,
      preferredDate,
      preferredTime,
      fasting,
      medicalCondition,
      previousReports,
      packageName: testLabel,
      labName: labLabel,
      totalAmount: '₹1,499',
      patientId: userProfile.patientId,
      status: 'Confirmed',
    });

    setBookingConfirmation({
      open: true,
      bookingId: created.id,
      packageName: testLabel,
      labName: labLabel,
      collectionType: collectionType === 'home' ? 'Free Home Sample Collection' : 'Lab Visit Collection',
      date: preferredDate,
      time: preferredTime,
      totalAmount: '₹1,499'
    });
  };

  const handleSelectPredefinedPackage = (pkgName: string, catName: string) => {
    setSelectedCategory(catName);
    setSelectedPackage(pkgName);
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP HEADER */}
      {!hideHeader && (!isDashboardContext ? (
        <>
          {/* Top Emergency Help Line (Dark Bar) */}
          <div className="bg-[#051124] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
            <div className="max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-2">
              
              {/* Emergency Hotline left */}
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider animate-pulse">
                  Emergency 24/7
                </span>
                <span className="text-slate-300 font-medium">Helpline:</span>
                <a href="tel:08704210820" className="text-amber-300 font-extrabold hover:underline">
                  0870-4210820
                </a>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-300 hidden sm:inline">WhatsApp:</span>
                <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline hidden sm:inline">
                  9000045073
                </a>
              </div>

              {/* Right Side Auth Actions / Patient Profile */}
              <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onNavigateDashboard || onBackToHome}
                      className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold cursor-pointer"
                      title="Go to Patient Dashboard"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>

                    <span className="text-slate-600">|</span>

                    <div className="flex items-center gap-1.5 text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                        <img 
                          src={userProfile.image || "/src/assets/images/patient_avatar_1787229395408.jpg"} 
                          alt={userProfile.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="font-bold text-white">{userProfile.displayName || userProfile.name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">({userProfile.patientId})</span>
                    </div>

                    {onLogout && (
                      <>
                        <span className="text-slate-600">|</span>
                        <button
                          onClick={onLogout}
                          className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={onSignInClick} 
                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sign In</span>
                    </button>
                    <span className="text-slate-600">|</span>
                    <button 
                      onClick={() => onOpenModal('register_patient')} 
                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                    >
                      <span>Register Now</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Main Navigation Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
              
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
                <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center p-1 text-emerald-600 shadow-2xs">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-black text-[#0f2e5a] tracking-tight uppercase leading-none">
                    AYUDH VIKAS
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#0275d8] tracking-wide uppercase leading-tight">
                    HEALTH CARE NETWORK
                  </span>
                  <span className="text-[8px] font-bold text-emerald-700 tracking-wider uppercase border-t border-emerald-200 mt-0.5 pt-0.5">
                    Care Beyond Boundaries
                  </span>
                </div>
              </div>

              {/* Center Navigation Links */}
              <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
                <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">Home</button>
                <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">About Us</button>
                <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">Services</button>
                <button onClick={() => onOpenModal('book_appointment')} className="hover:text-emerald-600 transition-colors cursor-pointer">Doctors</button>
                <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">Hospitals</button>
                <button className="text-emerald-700 font-black cursor-pointer border-b-2 border-emerald-600 pb-0.5 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                  <span>Labs</span>
                </button>
                <button onClick={() => onOpenModal('ambulance_booking')} className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1">
                  <Ambulance className="w-3.5 h-3.5 text-red-600" />
                  <span>Ambulance</span>
                </button>
                <button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-600 transition-colors cursor-pointer">Membership</button>
                <button onClick={() => onOpenModal('emergency_help')} className="hover:text-emerald-600 transition-colors cursor-pointer">Contact Us</button>
              </nav>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={onNavigateDashboard || onBackToHome}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Go to Patient Dashboard"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="hidden sm:inline">My Dashboard</span>
                    </button>

                    {/* Patient Profile Pill */}
                    <div className="relative">
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2 pl-2 sm:pl-3 pr-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <img
                          src={userProfile.image || "/src/assets/images/patient_avatar_1787229395408.jpg"}
                          alt={userProfile.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black text-slate-900 leading-tight">
                            {userProfile.displayName || userProfile.name}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 leading-tight">
                            ID: {userProfile.patientId}
                          </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                      </button>

                      {/* Dropdown menu */}
                      {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                          <div className="px-3.5 py-2 border-b border-slate-100">
                            <p className="text-xs font-black text-slate-800">{userProfile.name}</p>
                            <p className="text-[10px] font-semibold text-slate-500">Patient ID: {userProfile.patientId}</p>
                          </div>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (onNavigateDashboard) onNavigateDashboard();
                              else onBackToHome();
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Patient Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenModal('book_appointment');
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>My Appointments</span>
                          </button>

                          {onLogout && (
                            <div className="border-t border-slate-100 pt-1">
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  onLogout();
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Sign Out</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => onOpenModal('book_appointment')}
                      className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Book Appointment
                    </button>

                    <button 
                      onClick={onSignInClick}
                      className="border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>Login / Register</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </header>
        </>
      ) : (
        /* Dashboard Page Header Style (when inside Patient Dashboard) */
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            
            {/* Left: Brand / Dashboard Link */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateDashboard || onBackToHome}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                <span>← Back to Dashboard</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#0f2e5a] uppercase">
                    Diagnostic Lab Portal
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Accurate & Fast Reports
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Helpline & Patient Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold text-blue-800">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Lab Helpline: 0870-4210820</span>
              </div>

              {/* Patient Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={userProfile.image || "/src/assets/images/patient_avatar_1787229395408.jpg"}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 leading-tight">
                    {userProfile.displayName || userProfile.name}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 leading-tight">
                    ID: {userProfile.patientId}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </header>
      ))}

      {/* 2. HERO BANNER (Exact Match with Image) */}
      <section className="relative w-full bg-[#f0f6ff] border-b border-slate-200 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/lab_tests_banner_1787233112561.jpg" 
            alt="Medical Laboratory Scientist" 
            className="w-full h-full object-cover object-right md:object-center"
          />
          {/* Subtle gradient to ensure flawless text clarity on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0f6ff] via-[#f0f6ff]/95 via-50% to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Content */}
            <div className="max-w-2xl space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0052cc] tracking-tight font-sans">
                Book Lab Tests
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 flex flex-wrap items-center gap-1.5">
                <span className="text-[#0052cc]">Accurate Reports</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-900">Trusted Labs</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 font-extrabold">Affordable Prices</span>
              </p>

              {/* 3 Stat Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6">
                {/* Stat 1: 100+ Labs */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300/80 shadow-2xs">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 leading-tight">100+ Labs</span>
                    <span className="text-[10px] font-semibold text-slate-600">Partner Labs</span>
                  </div>
                </div>

                {/* Stat 2: Home Collection */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-300/80 shadow-2xs">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 leading-tight">Home Collection</span>
                    <span className="text-[10px] font-semibold text-slate-600">Available</span>
                  </div>
                </div>

                {/* Stat 3: Reports Online */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center border border-teal-300/80 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 leading-tight">Reports Online</span>
                    <span className="text-[10px] font-semibold text-slate-600">Fast & Secure</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Floating Badge: Save Up to 30% On Lab Tests */}
            <div className="self-start md:self-center">
              <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-lg flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
                  <Percent className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Save Up to</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">30%</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5">On Lab Tests</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MAIN FORM & SIDEBAR SECTION */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 flex-1 w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: BOOK LAB TEST FORM (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            
            {/* Header with Test Tube Icon */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="text-emerald-700">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#0f2e5a] tracking-tight uppercase">
                BOOK LAB TEST
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ROW 1: Select Test Category, Select Test / Package, Select Lab */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Select Test Category */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Select Test Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Full Body Packages">Full Body Packages</option>
                      <option value="Diabetes / Blood Sugar">Diabetes / Blood Sugar</option>
                      <option value="Thyroid Profile">Thyroid Profile</option>
                      <option value="Heart Care / Cardiac">Heart Care / Cardiac</option>
                      <option value="Kidney Function (KFT)">Kidney Function (KFT)</option>
                      <option value="Liver Function (LFT)">Liver Function (LFT)</option>
                      <option value="Complete Hemogram (CBC)">Complete Hemogram (CBC)</option>
                      <option value="Vitamin Tests (B12 / D3)">Vitamin Tests (B12 / D3)</option>
                      <option value="Fever & Infection Panel">Fever & Infection Panel</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Select Test / Package */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Select Test / Package <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="">Search tests or packages</option>
                      <option value="Full Body Checkup (70+ Tests) - ₹1,499">Full Body Checkup (70+ Tests)</option>
                      <option value="Diabetes Profile (15 Tests) - ₹599">Diabetes Profile (15 Tests)</option>
                      <option value="Thyroid Profile Total (7 Tests) - ₹399">Thyroid Profile (7 Tests)</option>
                      <option value="Heart Care Package (20 Tests) - ₹999">Heart Care Package (20 Tests)</option>
                      <option value="Complete Blood Count (CBC) - ₹299">Complete Blood Count (CBC)</option>
                      <option value="Liver Function Test (LFT) - ₹499">Liver Function Test (LFT)</option>
                      <option value="Kidney Function Test (KFT) - ₹499">Kidney Function Test (KFT)</option>
                      <option value="Vitamin D & B12 Combo - ₹899">Vitamin D & B12 Combo</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Select Lab */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Select Lab <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedLab}
                      onChange={(e) => setSelectedLab(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="">Select Lab</option>
                      <option value="Thyrocare Technologies">Thyrocare</option>
                      <option value="SRL Diagnostics">SRL Diagnostics</option>
                      <option value="Metropolis Healthcare">Metropolis</option>
                      <option value="Dr Lal PathLabs">Dr Lal PathLabs</option>
                      <option value="Max Lab Diagnostics">Max Lab</option>
                      <option value="Ayudh Vikas Diagnostic Network">Ayudh Vikas Network Lab</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* ROW 2: Patient Name, Age, Gender, Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* ROW 3: Email (Optional), Address, City / District */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    City / District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={cityDistrict}
                      onChange={(e) => setCityDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="Warangal">Warangal</option>
                      <option value="Hanamkonda">Hanamkonda</option>
                      <option value="Kazipet">Kazipet</option>
                      <option value="Mulugu">Mulugu</option>
                      <option value="Bhupalpally">Bhupalpally</option>
                      <option value="Mahabubabad">Mahabubabad</option>
                      <option value="Jangaon">Jangaon</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* SECTION: SAMPLE COLLECTION */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase">
                    Sample Collection
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  
                  {/* Option 1: Home Collection (sm:col-span-4) */}
                  <button
                    type="button"
                    onClick={() => setCollectionType('home')}
                    className={`sm:col-span-4 p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      collectionType === 'home'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      collectionType === 'home' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 leading-tight">
                        Home Collection
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                        We will collect sample from your address
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Visit Lab (sm:col-span-4) */}
                  <button
                    type="button"
                    onClick={() => setCollectionType('lab')}
                    className={`sm:col-span-4 p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      collectionType === 'lab'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      collectionType === 'lab' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 leading-tight">
                        Visit Lab
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                        I will visit the lab myself
                      </div>
                    </div>
                  </button>

                  {/* Preferred Date & Preferred Time (sm:col-span-4) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-800 block">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-2 pr-6 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-800 block">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        placeholder="Select Time"
                        className="w-full pl-2 pr-6 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION: ADDITIONAL INFORMATION */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase">
                    Additional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Fasting Radio */}
                  <div className="sm:col-span-4 space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">Fasting</span>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-800">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="fasting"
                          value="Yes"
                          checked={fasting === 'Yes'}
                          onChange={() => setFasting('Yes')}
                          className="accent-emerald-600"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="fasting"
                          value="No"
                          checked={fasting === 'No'}
                          onChange={() => setFasting('No')}
                          className="accent-emerald-600"
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="fasting"
                          value="Not Required"
                          checked={fasting === 'Not Required'}
                          onChange={() => setFasting('Not Required')}
                          className="accent-emerald-600"
                        />
                        <span>Not Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Any Medical Condition (Optional) */}
                  <div className="sm:col-span-4 space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">Any Medical Condition (Optional)</span>
                    <input
                      type="text"
                      value={medicalCondition}
                      onChange={(e) => setMedicalCondition(e.target.value)}
                      placeholder="Please specify"
                      className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Do you have previous reports? */}
                  <div className="sm:col-span-4 space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">Do you have previous reports?</span>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="previousReports"
                          value="Yes"
                          checked={previousReports === 'Yes'}
                          onChange={() => setPreviousReports('Yes')}
                          className="accent-emerald-600"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="previousReports"
                          value="No"
                          checked={previousReports === 'No'}
                          onChange={() => setPreviousReports('No')}
                          className="accent-emerald-600"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <span>
                    I agree to the <span className="font-bold text-emerald-700 hover:underline">Terms & Conditions</span> and <span className="font-bold text-emerald-700 hover:underline">Privacy Policy</span>
                  </span>
                </label>
              </div>

              {/* ACTION BUTTONS: BOOK LAB TEST + RESET FORM */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <button
                  type="submit"
                  className="sm:col-span-8 bg-[#00703c] hover:bg-[#005830] active:bg-[#004224] text-white text-xs sm:text-sm font-black uppercase py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>BOOK LAB TEST</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="sm:col-span-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold uppercase py-3.5 px-4 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>RESET FORM</span>
                </button>
              </div>

            </form>

          </div>

          {/* RIGHT COLUMN: WHY BOOK WITH US, PACKAGES, PARTNER LABS, NEED HELP (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* 1. WHY BOOK WITH US? Card with Lab Report Graphic */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3.5">
              <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-tight pb-1.5 border-b border-slate-100">
                WHY BOOK WITH US?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                
                {/* 5 Points (sm:col-span-7) */}
                <div className="sm:col-span-7 space-y-2.5">
                  
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">Trusted Labs</h4>
                      <p className="text-[10px] font-medium text-slate-500">100+ certified partner labs</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">Affordable Prices</h4>
                      <p className="text-[10px] font-medium text-slate-500">Save up to 10% - 30%</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">Home Collection</h4>
                      <p className="text-[10px] font-medium text-slate-500">Free home sample collection*</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">Accurate Reports</h4>
                      <p className="text-[10px] font-medium text-slate-500">Timely & accurate results</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">Secure & Confidential</h4>
                      <p className="text-[10px] font-medium text-slate-500">Your data is 100% safe</p>
                    </div>
                  </div>

                </div>

                {/* Lab Report Graphic Preview (sm:col-span-5) */}
                <div className="sm:col-span-5 flex justify-center">
                  <div className="w-full max-w-[150px] bg-slate-900 text-white rounded-2xl p-3 shadow-md relative overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">LAB REPORT</span>
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    
                    <div className="py-2 space-y-1.5 text-[9px] font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                        <span>Complete Blood Count</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                        <span>Liver Function Test</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                        <span>Thyroid Profile</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                        <span>Diabetes Profile</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-end">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                        <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* 2. POPULAR HEALTH PACKAGES */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-tight">
                  POPULAR HEALTH PACKAGES
                </h3>
                <button 
                  type="button" 
                  onClick={() => setSelectedCategory('Full Body Packages')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All Packages
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                
                {/* Package 1 */}
                <div 
                  onClick={() => handleSelectPredefinedPackage('Full Body Checkup (70+ Tests) - ₹1,499', 'Full Body Packages')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight">Full Body Checkup</h4>
                    <span className="text-[9px] font-semibold text-slate-500">70+ Tests</span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-[#0f2e5a]">₹1499</span>
                      <span className="text-[9px] text-slate-400 line-through ml-1">₹2100</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">Save 29%</span>
                  </div>
                </div>

                {/* Package 2 */}
                <div 
                  onClick={() => handleSelectPredefinedPackage('Diabetes Profile (15 Tests) - ₹599', 'Diabetes / Blood Sugar')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight">Diabetes Profile</h4>
                    <span className="text-[9px] font-semibold text-slate-500">15 Tests</span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-[#0f2e5a]">₹599</span>
                      <span className="text-[9px] text-slate-400 line-through ml-1">₹900</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">Save 33%</span>
                  </div>
                </div>

                {/* Package 3 */}
                <div 
                  onClick={() => handleSelectPredefinedPackage('Thyroid Profile Total (7 Tests) - ₹399', 'Thyroid Profile')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight">Thyroid Profile</h4>
                    <span className="text-[9px] font-semibold text-slate-500">7 Tests</span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-[#0f2e5a]">₹399</span>
                      <span className="text-[9px] text-slate-400 line-through ml-1">₹600</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">Save 33%</span>
                  </div>
                </div>

                {/* Package 4 */}
                <div 
                  onClick={() => handleSelectPredefinedPackage('Heart Care Package (20 Tests) - ₹999', 'Heart Care / Cardiac')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight">Heart Care Package</h4>
                    <span className="text-[9px] font-semibold text-slate-500">20 Tests</span>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-[#0f2e5a]">₹999</span>
                      <span className="text-[9px] text-slate-400 line-through ml-1">₹1500</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">Save 33%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. OUR PARTNER LABS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-tight">
                  OUR PARTNER LABS
                </h3>
                <button 
                  type="button" 
                  onClick={() => {}}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All Labs
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 items-center">
                {/* Thyrocare */}
                <div className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center shadow-2xs hover:border-emerald-400 transition-all">
                  <span className="text-[11px] font-black text-[#d32f2f]">Thyrocare</span>
                  <span className="text-[7px] text-slate-400">Tests you can trust</span>
                </div>

                {/* SRL */}
                <div className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center shadow-2xs hover:border-emerald-400 transition-all">
                  <span className="text-[11px] font-black text-[#0288d1]">SRL</span>
                  <span className="text-[7px] text-slate-400">Diagnostics</span>
                </div>

                {/* METROPOLIS */}
                <div className="p-2 rounded-lg border border-slate-200 bg-emerald-950 text-white flex flex-col items-center justify-center text-center shadow-2xs hover:opacity-90 transition-all">
                  <span className="text-[10px] font-black tracking-tighter text-emerald-400">METROPOLIS</span>
                </div>

                {/* Dr Lal PathLabs */}
                <div className="p-2 rounded-lg border border-slate-200 bg-[#fff8e1] flex flex-col items-center justify-center text-center shadow-2xs hover:border-amber-400 transition-all">
                  <span className="text-[9px] font-black text-[#e65100]">Dr Lal PathLabs</span>
                </div>

                {/* MAX Lab */}
                <div className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center shadow-2xs hover:border-blue-400 transition-all col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-black text-[#0d47a1]">MAX</span>
                  <span className="text-[7px] text-slate-400">Lab</span>
                </div>
              </div>
            </div>

            {/* 4. NEED HELP? */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-tight pb-1 border-b border-slate-100">
                NEED HELP?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Call Us */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500">Call Us</div>
                    <a href="tel:08704210820" className="text-xs font-black text-slate-900 hover:text-blue-700">0870-4210820</a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500">WhatsApp</div>
                    <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="text-xs font-black text-emerald-700 hover:underline">9000045073</a>
                  </div>
                </div>

                {/* 24/7 Support */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500">24/7 Support</div>
                    <div className="text-[10px] font-bold text-slate-900">We are here to help you</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4. BOTTOM 6 FEATURE HIGHLIGHT CARDS (Exact match with image) */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="pt-2 lg:pt-0 lg:px-2 flex items-start gap-2.5">
              <div className="text-blue-600 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Easy Booking</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Book tests in just few clicks</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="pt-2 lg:pt-0 lg:px-2 flex items-start gap-2.5">
              <div className="text-emerald-600 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Home Collection</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Free sample collection at your home</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="pt-2 lg:pt-0 lg:px-2 flex items-start gap-2.5">
              <div className="text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Fast Reports</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Get reports within 24 - 48 hours</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="pt-2 lg:pt-0 lg:px-2 flex items-start gap-2.5">
              <div className="text-teal-600 shrink-0">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Online Reports</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Download your reports anytime, anywhere</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="pt-2 lg:pt-0 lg:px-2 flex items-start gap-2.5">
              <div className="text-indigo-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Secure Payment</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">100% secure & multiple payment options</p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="pt-2 lg:pt-0 lg:px-2 flex items-start gap-2.5">
              <div className="text-purple-600 shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">Best Prices</h4>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Affordable prices with great discounts</p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 5. LAB BOOKING CONFIRMATION MODAL */}
      {bookingConfirmation.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Lab Test Booked Successfully!</h3>
                  <p className="text-xs font-bold text-emerald-700">Booking ID: {bookingConfirmation.bookingId}</p>
                </div>
              </div>
              <button 
                onClick={() => setBookingConfirmation({ open: false })}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs font-medium text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Test / Package:</span>
                <span className="font-bold text-slate-900">{bookingConfirmation.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diagnostic Partner:</span>
                <span className="font-bold text-slate-900">{bookingConfirmation.labName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collection Mode:</span>
                <span className="font-bold text-emerald-700">{bookingConfirmation.collectionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Schedule:</span>
                <span className="font-bold text-slate-900">{bookingConfirmation.date} at {bookingConfirmation.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{patientName} ({age} yrs, {gender})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-black text-slate-800">Total Payable:</span>
                <span className="font-black text-emerald-700 text-sm">{bookingConfirmation.totalAmount}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>A phlebotomist will arrive at your address with a sterile sample kit during your chosen time slot. Live tracking SMS dispatched to <b>{mobileNumber}</b>.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBookingConfirmation({ open: false })}
                className="w-full bg-[#00703c] hover:bg-[#005830] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Close & View Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
