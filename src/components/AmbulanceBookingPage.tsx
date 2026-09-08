import React, { useState } from 'react';
import { 
  HeartPulse, 
  Phone, 
  User, 
  MapPin, 
  Crosshair, 
  Calendar, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  IndianRupee, 
  Ambulance, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut,
  X,
  MessageSquare,
  Activity,
  Check,
  Building2,
  Navigation,
  FileCheck
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';

interface AmbulanceBookingPageProps {
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
  isDashboardContext?: boolean; // When rendered inside patient dashboard
  hideHeader?: boolean;
}

export const AmbulanceBookingPage: React.FC<AmbulanceBookingPageProps> = ({
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
  // Ambulance Type Selection: BLS, ALS, Neonatal
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState<'BLS' | 'ALS' | 'Neonatal'>('BLS');

  // Form State
  const [patientName, setPatientName] = useState(isLoggedIn ? userProfile.name : '');
  const [patientAge, setPatientAge] = useState(isLoggedIn ? '42' : '');
  const [gender, setGender] = useState(isLoggedIn ? 'Male' : '');
  const [mobileNumber, setMobileNumber] = useState(isLoggedIn ? userProfile.phone || '9876543210' : '');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [numberOfPatients, setNumberOfPatients] = useState('1');
  const [pickupLocation, setPickupLocation] = useState('Subedari, Hanamkonda, Warangal');
  const [dropLocation, setDropLocation] = useState('MGM Hospital, Warangal');
  const [pickupType, setPickupType] = useState('Immediate / Emergency');
  const [preferredDate, setPreferredDate] = useState('2026-08-20');
  const [preferredTime, setPreferredTime] = useState('Immediate');
  const [patientCondition, setPatientCondition] = useState('Stable / Non-Critical');
  const [medicalSupportNeeded, setMedicalSupportNeeded] = useState('Oxygen Support');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Dropdown states & UI states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<{
    open: boolean;
    bookingId?: string;
    ambulanceType?: string;
    pickupLocation?: string;
    dropLocation?: string;
    driverContact?: string;
    driverName?: string;
    eta?: string;
  }>({ open: false });

  // Handle GPS location detection
  const handleDetectLocation = (type: 'pickup' | 'drop') => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          if (type === 'pickup') {
            setPickupLocation('Current Location: Hanamkonda Main Road, Warangal (GPS Active)');
          } else {
            setDropLocation('Near MGM Hospital Emergency Ward, Warangal');
          }
          setIsDetectingLocation(false);
        },
        () => {
          if (type === 'pickup') {
            setPickupLocation('Subedari, Hanamkonda, Warangal (GPS Detected)');
          }
          setIsDetectingLocation(false);
        },
        { timeout: 3000 }
      );
    } else {
      setPickupLocation('Subedari, Hanamkonda, Warangal');
      setIsDetectingLocation(false);
    }
  };

  // Reset form handler
  const handleResetForm = () => {
    setSelectedAmbulanceType('BLS');
    setPatientName('');
    setPatientAge('');
    setGender('');
    setMobileNumber('');
    setAlternateNumber('');
    setNumberOfPatients('1');
    setPickupLocation('');
    setDropLocation('');
    setPickupType('Immediate / Emergency');
    setPreferredDate('2026-08-20');
    setPreferredTime('Immediate');
    setPatientCondition('Stable / Non-Critical');
    setMedicalSupportNeeded('');
    setAdditionalNotes('');
  };

  // Submit ambulance booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onOpenModal('register_patient');
      return;
    }
    const typeLabel = 
      selectedAmbulanceType === 'BLS' ? 'Basic Life Support (BLS)' :
      selectedAmbulanceType === 'ALS' ? 'Advanced Life Support (ALS ICU)' : 'Neonatal Ambulance';

    const created = await create('ambulance_bookings', {
      patientName,
      patientAge,
      gender,
      phone: mobileNumber,
      alternateNumber,
      numberOfPatients,
      pickupLocation,
      dropLocation,
      pickupType,
      preferredDate,
      preferredTime,
      patientCondition,
      medicalSupportNeeded,
      additionalNotes,
      ambulanceType: typeLabel,
      patientId: userProfile.patientId,
      status: 'Dispatched',
    });

    setBookingSuccessModal({
      open: true,
      bookingId: created.id,
      ambulanceType: typeLabel,
      pickupLocation: pickupLocation || 'Subedari, Hanamkonda',
      dropLocation: dropLocation || 'MGM Hospital Emergency Ward',
      driverName: created.driverName || 'Suresh Varma (Paramedic Driver)',
      driverContact: created.driverContact || '9000045073',
      eta: created.eta || '8 - 12 Minutes'
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP HEADER (Unified Header Style) */}
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
                <button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-600 transition-colors cursor-pointer">Health Camps</button>
                <button className="text-emerald-700 font-black cursor-pointer border-b-2 border-emerald-600 pb-0.5 flex items-center gap-1">
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
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#0f2e5a] uppercase">
                    Ambulance Dispatch Centre
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Direct Priority Line
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Emergency Contact & Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-lg text-xs font-bold text-red-700">
                <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>Emergency: 0870-4210820</span>
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

      {/* 2. HERO BANNER (Exact Match with Reference Image) */}
      <section className="relative w-full bg-[#f8fbff] border-b border-slate-200 overflow-hidden">
        {/* Background panoramic image layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/ambulance_panoramic_hero_1787232365048.jpg" 
            alt="Ambulance Emergency Background" 
            className="w-full h-full object-cover object-right md:object-center"
          />
          {/* Subtle gradient overlay to ensure perfect contrast on the left side text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8fbff] via-[#f8fbff]/90 via-45% to-transparent"></div>
        </div>

        {/* Content container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-7 sm:py-9 relative z-10">
          <div className="max-w-2xl space-y-1.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#003874] tracking-tight uppercase font-sans">
              AMBULANCE BOOKING
            </h1>
            
            {/* Green Accent Line under title */}
            <div className="w-12 h-1 bg-[#15803d] rounded-full my-1.5"></div>
            
            <p className="text-xs sm:text-sm md:text-base font-semibold text-[#1e3a5f] pt-0.5">
              Fast. Safe. Reliable. We are always there to save lives.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MAIN FORM & INFO LAYOUT (Exact 2-Column Structure from Image) */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: BOOK AN AMBULANCE FORM (~lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            
            {/* Title Header with Icon */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="text-emerald-700">
                <Ambulance className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#0f2e5a] tracking-tight uppercase">
                BOOK AN AMBULANCE
              </h2>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* SECTION: AMBULANCE TYPE (3 Selection Cards) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Ambulance Type
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: BLS */}
                  <button
                    type="button"
                    onClick={() => setSelectedAmbulanceType('BLS')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      selectedAmbulanceType === 'BLS'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedAmbulanceType === 'BLS' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 leading-tight">
                        Basic Life Support (BLS)
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        General Ambulance
                      </div>
                    </div>
                  </button>

                  {/* Option 2: ALS */}
                  <button
                    type="button"
                    onClick={() => setSelectedAmbulanceType('ALS')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      selectedAmbulanceType === 'ALS'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedAmbulanceType === 'ALS' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 leading-tight">
                        Advanced Life Support (ALS)
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        ICU Ambulance
                      </div>
                    </div>
                  </button>

                  {/* Option 3: Neonatal */}
                  <button
                    type="button"
                    onClick={() => setSelectedAmbulanceType('Neonatal')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      selectedAmbulanceType === 'Neonatal'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedAmbulanceType === 'Neonatal' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 leading-tight">
                        Neonatal Ambulance
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        For Newborn Care
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ROW 1: Patient Name, Patient Age, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    Patient Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
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
              </div>

              {/* ROW 2: Mobile Number, Alternate Number, Number of Patients */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Alternate Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={alternateNumber}
                    onChange={(e) => setAlternateNumber(e.target.value)}
                    placeholder="Enter alternate number"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Number of Patients
                  </label>
                  <div className="relative">
                    <select
                      value={numberOfPatients}
                      onChange={(e) => setNumberOfPatients(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="1">1 Patient</option>
                      <option value="2">2 Patients</option>
                      <option value="3+">3+ Patients</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ROW 3: Pickup Location & Drop Location with GPS Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDetectLocation('pickup')}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Crosshair className="w-3 h-3 text-emerald-600" />
                      <span>{isDetectingLocation ? 'Locating...' : 'Use Current GPS'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Enter pickup location"
                      className="w-full pl-3 pr-9 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDetectLocation('pickup')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 cursor-pointer"
                      title="Set via GPS"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800">
                      Drop Location <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDetectLocation('drop')}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Choose Hospital</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      placeholder="Enter drop location"
                      className="w-full pl-3 pr-9 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDetectLocation('drop')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="Set drop location"
                    >
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ROW 4: Pickup Type, Preferred Date, Preferred Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Pickup Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={pickupType}
                      onChange={(e) => setPickupType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="Immediate / Emergency">Immediate / Emergency</option>
                      <option value="Scheduled Hospital Transfer">Scheduled Hospital Transfer</option>
                      <option value="Post-Discharge Home Drop">Post-Discharge Home Drop</option>
                      <option value="Diagnostic / Test Visit">Diagnostic / Test Visit</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      placeholder="Select Time"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ROW 5: Patient Condition, Medical Support Needed, Additional Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Patient Condition
                  </label>
                  <div className="relative">
                    <select
                      value={patientCondition}
                      onChange={(e) => setPatientCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="Stable / Non-Critical">Stable / Non-Critical</option>
                      <option value="Critical / ICU Condition">Critical / ICU Condition</option>
                      <option value="Trauma / Accident Injury">Trauma / Accident Injury</option>
                      <option value="Post Surgery / Bedridden">Post Surgery / Bedridden</option>
                      <option value="Cardiac / Respiratory Issue">Cardiac / Respiratory Issue</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    Medical Support Needed
                  </label>
                  <div className="relative">
                    <select
                      value={medicalSupportNeeded}
                      onChange={(e) => setMedicalSupportNeeded(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="Oxygen Support">Oxygen Support</option>
                      <option value="Ventilator / Advanced Life Support">Ventilator / ALS</option>
                      <option value="Doctor on Board">Doctor on Board</option>
                      <option value="Paramedic Team">Paramedic Team</option>
                      <option value="Wheelchair / Stretcher Only">Wheelchair / Stretcher Only</option>
                      <option value="None">None</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={1}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Enter any additional information"
                    className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS: BOOK AMBULANCE NOW + RESET FORM */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <button
                  type="submit"
                  className="sm:col-span-8 bg-[#00703c] hover:bg-[#005830] active:bg-[#004224] text-white text-xs sm:text-sm font-black uppercase py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>BOOK AMBULANCE NOW</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="sm:col-span-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold uppercase py-3.5 px-4 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>RESET FORM</span>
                </button>
              </div>

            </form>

          </div>

          {/* RIGHT COLUMN: WHY CHOOSE US & COVERAGE AREA (~lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* CARD 1: WHY CHOOSE OUR AMBULANCE SERVICE? */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3.5">
              <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-tight pb-1.5 border-b border-slate-100">
                WHY CHOOSE OUR AMBULANCE SERVICE?
              </h3>

              <div className="space-y-3">
                
                {/* 1. 24/7 Availability */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">24/7 Availability</h4>
                    <p className="text-[11px] font-medium text-slate-500">We are always ready to help you</p>
                  </div>
                </div>

                {/* 2. Trained Medical Staff */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">Trained Medical Staff</h4>
                    <p className="text-[11px] font-medium text-slate-500">Experienced doctors & paramedics</p>
                  </div>
                </div>

                {/* 3. Advanced Life Support */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-50 text-red-700 flex items-center justify-center shrink-0 mt-0.5 border border-red-200">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">Advanced Life Support</h4>
                    <p className="text-[11px] font-medium text-slate-500">ICU setup with advanced equipment</p>
                  </div>
                </div>

                {/* 4. On-time Service */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">On-time Service</h4>
                    <p className="text-[11px] font-medium text-slate-500">Quick response in emergency</p>
                  </div>
                </div>

                {/* 5. Affordable & Transparent */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">Affordable & Transparent</h4>
                    <p className="text-[11px] font-medium text-slate-500">Best service at the right price</p>
                  </div>
                </div>

              </div>

              {/* Badge & Call Button Container */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-3">
                {/* 24/7 Clock Badge */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
                    24/7
                  </div>
                  <span className="text-[11px] font-black text-[#0f2e5a] uppercase">EMERGENCY SERVICE</span>
                </div>

                {/* Direct Call Button */}
                <a
                  href="tel:08704210820"
                  className="w-full bg-[#004d26] hover:bg-[#00381c] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-black shadow-xs transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CALL NOW: 0870-4210820</span>
                </a>
              </div>

            </div>

            {/* CARD 2: OUR COVERAGE AREA (Warangal Specific Map + Checklist) */}
            <div className="bg-[#f8fafc] rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3.5">
              <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-tight">
                OUR COVERAGE AREA
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                
                {/* Visual Map Graphic: Warangal Unified Region SVG Map */}
                <div className="sm:col-span-7 relative rounded-xl overflow-hidden border border-slate-200/80 bg-[#edf2f7] p-2 aspect-[4/3] flex items-center justify-center shadow-xs">
                  {/* Subtle map background grid */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px]"></div>

                  {/* SVG Warangal Unified District Map Silhouette */}
                  <svg 
                    viewBox="0 0 340 380" 
                    className="w-full h-full max-h-56 filter drop-shadow-sm select-none"
                    aria-label="Warangal Coverage District Map"
                  >
                    <defs>
                      {/* Gradient for district region */}
                      <linearGradient id="warangalGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#96d48a" />
                        <stop offset="50%" stopColor="#81c775" />
                        <stop offset="100%" stopColor="#68b45c" />
                      </linearGradient>
                      
                      {/* Drop shadow filter for pin points */}
                      <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3"/>
                      </filter>
                    </defs>

                    {/* Regional Map Boundary Shape (Greater Warangal Cluster) */}
                    <path
                      d="M 125,25 
                         C 145,20 175,30 190,42 
                         C 205,52 225,55 235,75 
                         C 245,95 240,118 248,138 
                         C 255,155 268,172 265,195 
                         C 262,215 272,235 265,255 
                         C 258,272 245,282 232,295 
                         C 220,308 202,312 188,310 
                         C 175,308 165,322 150,332 
                         C 135,342 120,345 110,335 
                         C 100,325 95,305 92,288 
                         C 88,270 75,255 72,238 
                         C 68,220 75,200 70,182 
                         C 65,165 72,148 78,132 
                         C 85,115 92,95 98,75 
                         C 105,55 112,32 125,25 Z"
                      fill="url(#warangalGreenGradient)"
                      stroke="#569848"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />

                    {/* Subtle internal district border lines */}
                    <path 
                      d="M 130,105 Q 165,115 240,118" 
                      stroke="#6fa85f" 
                      strokeWidth="1.2" 
                      strokeDasharray="3 3" 
                      fill="none" 
                    />
                    <path 
                      d="M 98,175 Q 155,170 265,195" 
                      stroke="#6fa85f" 
                      strokeWidth="1.2" 
                      strokeDasharray="3 3" 
                      fill="none" 
                    />
                    <path 
                      d="M 92,250 Q 150,240 232,295" 
                      stroke="#6fa85f" 
                      strokeWidth="1.2" 
                      strokeDasharray="3 3" 
                      fill="none" 
                    />

                    {/* Location Pin 1: Mulugu (Top) */}
                    <g transform="translate(145, 58)" filter="url(#pinShadow)">
                      <circle cx="0" cy="0" r="5" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      <rect x="8" y="-9" width="52" height="17" rx="3.5" fill="#ffffff" fillOpacity="0.92" stroke="#e2e8f0" strokeWidth="0.8"/>
                      <text x="12" y="3" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">Mulugu</text>
                    </g>

                    {/* Location Pin 2: Bhupalpally (Upper Central) */}
                    <g transform="translate(138, 115)" filter="url(#pinShadow)">
                      <circle cx="0" cy="0" r="5" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      <rect x="8" y="-9" width="70" height="17" rx="3.5" fill="#ffffff" fillOpacity="0.92" stroke="#e2e8f0" strokeWidth="0.8"/>
                      <text x="12" y="3" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">Bhupalpally</text>
                    </g>

                    {/* Location Pin 3: Hanamkonda (Mid-Left) */}
                    <g transform="translate(120, 172)" filter="url(#pinShadow)">
                      <circle cx="0" cy="0" r="5" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      <rect x="8" y="-9" width="76" height="17" rx="3.5" fill="#ffffff" fillOpacity="0.92" stroke="#e2e8f0" strokeWidth="0.8"/>
                      <text x="12" y="3" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">Hanamkonda</text>
                    </g>

                    {/* Location Pin 4: Warangal (Mid-Right) */}
                    <g transform="translate(178, 205)" filter="url(#pinShadow)">
                      <circle cx="0" cy="0" r="5" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      <rect x="8" y="-9" width="60" height="17" rx="3.5" fill="#ffffff" fillOpacity="0.92" stroke="#e2e8f0" strokeWidth="0.8"/>
                      <text x="12" y="3" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">Warangal</text>
                    </g>

                    {/* Location Pin 5: Mahabubabad (Lower-Right) */}
                    <g transform="translate(195, 272)" filter="url(#pinShadow)">
                      <circle cx="0" cy="0" r="5" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      <rect x="8" y="-9" width="80" height="17" rx="3.5" fill="#ffffff" fillOpacity="0.92" stroke="#e2e8f0" strokeWidth="0.8"/>
                      <text x="12" y="3" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">Mahabubabad</text>
                    </g>

                    {/* Location Pin 6: Jangaon (Bottom-Left) */}
                    <g transform="translate(125, 315)" filter="url(#pinShadow)">
                      <circle cx="0" cy="0" r="5" fill="#881337" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      <rect x="8" y="-9" width="56" height="17" rx="3.5" fill="#ffffff" fillOpacity="0.92" stroke="#e2e8f0" strokeWidth="0.8"/>
                      <text x="12" y="3" fontSize="10" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">Jangaon</text>
                    </g>
                  </svg>
                </div>

                {/* Checklist with Solid Dark-Green Check Icons (sm:col-span-5) */}
                <div className="sm:col-span-5 space-y-2 pl-1 sm:pl-2">
                  {[
                    'Mulugu',
                    'Bhupalpally',
                    'Hanamkonda',
                    'Warangal',
                    'Mahabubabad',
                    'Jangaon'
                  ].map((district, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-[13px] font-black text-slate-900">
                      {/* Exact dark green circle with white check icon from reference image */}
                      <div className="w-4 h-4 rounded-full bg-[#0a5c2d] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                      <span>{district}</span>
                    </div>
                  ))}
                  
                  <p className="text-[11px] font-extrabold text-[#1e293b] pt-1.5 leading-tight">
                    and surrounding areas
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* 4. BOTTOM 5 FEATURE BADGES (Exact Icons & Copy from Image) */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* 1. Quick Response */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/60 border border-slate-200/60 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Ambulance className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">Quick Response</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">
                Our team reaches you within the shortest time.
              </p>
            </div>
          </div>

          {/* 2. Safe & Secure */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/60 border border-slate-200/60 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">Safe & Secure</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">
                Patient safety is our top priority.
              </p>
            </div>
          </div>

          {/* 3. Professional Team */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/60 border border-slate-200/60 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">Professional Team</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">
                Trained doctors, nurses and paramedics.
              </p>
            </div>
          </div>

          {/* 4. Advanced Equipment */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/60 border border-slate-200/60 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">Advanced Equipment</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">
                Well-equipped ambulances for all emergencies.
              </p>
            </div>
          </div>

          {/* 5. Affordable Pricing */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/60 border border-slate-200/60 shadow-2xs col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">Affordable Pricing</h4>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">
                Transparent pricing with no hidden charges.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* 5. BOTTOM EMERGENCY STRIP (Exact Layout from Image) */}
      <footer className="bg-[#05142b] text-white border-t border-slate-800 py-3.5 px-4 sm:px-8 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Emergency Call Pill */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-900/60 border border-blue-400/40 flex items-center justify-center text-white shrink-0">
              <Phone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wide uppercase text-white">
                EMERGENCY? CALL NOW!
              </div>
              <div className="text-[10px] font-medium text-slate-300">
                We are just a call away to save lives
              </div>
            </div>
          </div>

          {/* Middle 3 Metric Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
            
            {/* Helpline */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">24/7 EMERGENCY HELPLINE</div>
              <a href="tel:08704210820" className="text-sm sm:text-base font-black text-red-400 hover:text-red-300">
                0870-4210820
              </a>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            {/* WhatsApp */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">WHATSAPP SUPPORT</div>
              <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="text-sm sm:text-base font-black text-emerald-400 hover:text-emerald-300">
                9000045073
              </a>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            {/* Response Time */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">AVERAGE RESPONSE TIME</div>
              <div className="text-sm sm:text-base font-black text-sky-300">
                10 - 15 MINUTES
              </div>
            </div>

          </div>

          {/* Right Brand Badge */}
          <div className="flex items-center gap-2 text-right">
            <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-white">
              <Ambulance className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-slate-200">YOUR HEALTH</div>
              <div className="text-[9px] font-bold text-emerald-400 uppercase">IS OUR MISSION</div>
            </div>
          </div>

        </div>
      </footer>

      {/* 6. BOOKING SUCCESS MODAL */}
      {bookingSuccessModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            
            <button
              onClick={() => setBookingSuccessModal({ open: false })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 animate-bounce">
                <FileCheck className="w-7 h-7" />
              </div>
              <span className="bg-red-100 text-red-700 text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                Emergency Dispatch Assigned
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Ambulance Booked Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Booking Reference ID: <span className="font-black text-[#0f2e5a]">{bookingSuccessModal.bookingId}</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Service Type:</span>
                <span className="font-black text-slate-800">{bookingSuccessModal.ambulanceType}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Pickup Location:</span>
                <span className="font-black text-slate-800 max-w-[240px] text-right truncate">{bookingSuccessModal.pickupLocation}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Drop Location:</span>
                <span className="font-black text-slate-800 max-w-[240px] text-right truncate">{bookingSuccessModal.dropLocation}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Assigned Driver:</span>
                <span className="font-bold text-slate-800">{bookingSuccessModal.driverName}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-black">
                <span>Estimated Arrival Time:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs">
                  {bookingSuccessModal.eta}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`tel:${bookingSuccessModal.driverContact}`}
                className="flex-1 bg-[#00703c] hover:bg-[#005830] text-white py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Driver Now</span>
              </a>
              <button
                onClick={() => setBookingSuccessModal({ open: false })}
                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase cursor-pointer"
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
