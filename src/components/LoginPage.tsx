import React, { useState } from 'react';
import { 
  HeartPulse, 
  Phone, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  UserCheck, 
  Users, 
  Building2, 
  Ambulance, 
  TestTube, 
  HeartHandshake, 
  Tent, 
  CreditCard, 
  Headphones, 
  ShieldCheck, 
  Clock, 
  Heart, 
  LockKeyhole, 
  MapPin, 
  MessageSquare, 
  Mail, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Stethoscope,
  Megaphone
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onRegisterClick?: () => void;
  onLoginSuccess?: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onBackToHome, 
  onOpenModal,
  onRegisterClick,
  onLoginSuccess
}) => {
  const { login, loginAsGuest } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation error states
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ identifier?: boolean; password?: boolean }>({});

  // Validation function
  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string; general?: string } = {};
    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      newErrors.identifier = 'Please enter your Mobile Number, Email ID, Hospital ID, Doctor ID, or Staff ID.';
    } else {
      const isNumeric = /^\d+$/.test(cleanIdentifier);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
      const isSpecialId = 
        cleanIdentifier.toLowerCase().startsWith('dr') || 
        cleanIdentifier.toLowerCase().startsWith('doc') ||
        cleanIdentifier.toLowerCase().includes('hospital') ||
        cleanIdentifier.toLowerCase().includes('kims') ||
        cleanIdentifier.toLowerCase().includes('marketing') ||
        cleanIdentifier.toLowerCase().includes('mkt') ||
        cleanIdentifier.toLowerCase().includes('admin');

      if (isNumeric && cleanIdentifier.length !== 10) {
        newErrors.identifier = 'Please enter a valid 10-digit mobile number.';
      } else if (!isNumeric && !isEmail && !isSpecialId && cleanIdentifier.length < 3) {
        newErrors.identifier = 'Please enter a valid email, mobile number, or ID.';
      }
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    login(identifier, password)
      .then((user) => {
        if (onLoginSuccess) {
          onLoginSuccess(user.role);
        }
      })
      .catch((err: Error) => {
        setErrors({ general: err.message || 'Login failed. Please check your credentials.' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Demo autofill quick helpers
  const handleAutoFillPatient = () => {
    setIdentifier('9876543210');
    setPassword('patient123');
    setErrors({});
  };

  const handleAutoFillDoctor = () => {
    setIdentifier('dr.raviteja@ayudhvikas.org');
    setPassword('doctor123');
    setErrors({});
  };

  const handleAutoFillHospital = () => {
    setIdentifier('kims@ayudhvikas.org');
    setPassword('hospital123');
    setErrors({});
  };

  const handleAutoFillMarketing = () => {
    setIdentifier('marketing@ayudhvikasfoundation.org');
    setPassword('marketing123');
    setErrors({});
  };

  const handleAutoFillAdmin = () => {
    setIdentifier('admin@ayudhvikasfoundation.org');
    setPassword('admin123');
    setErrors({});
  };

  const handleAutoFillVolunteer = () => {
    setIdentifier('volunteer@ayudhvikas.org');
    setPassword('volunteer123');
    setErrors({});
  };

  const handleAutoFillOrganizer = () => {
    setIdentifier('organizer@ayudhvikas.org');
    setPassword('organizer123');
    setErrors({});
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    if (onLoginSuccess) onLoginSuccess('patient');
  };

  const serviceBadges = [
    { label: 'Doctor\nAppointment', icon: UserCheck, color: 'text-sky-600 border-sky-300 bg-sky-50', modal: 'book_appointment' as const },
    { label: 'Hospital\nGuidance', icon: Building2, color: 'text-blue-600 border-blue-300 bg-blue-50', modal: 'find_hospitals' as const },
    { label: 'Emergency\nSupport', icon: Phone, color: 'text-red-600 border-red-300 bg-red-50', modal: 'emergency_help' as const },
    { label: 'Lab Test\nBooking', icon: TestTube, color: 'text-emerald-600 border-emerald-300 bg-emerald-50', modal: 'book_lab_test' as const },
    { label: 'Ambulance\nService', icon: Ambulance, color: 'text-indigo-600 border-indigo-300 bg-indigo-50', modal: 'ambulance_booking' as const },
    { label: 'Home Care\nService', icon: HeartHandshake, color: 'text-teal-600 border-teal-300 bg-teal-50', modal: 'home_service' as const },
    { label: 'Health Camps &\nAwareness', icon: Tent, color: 'text-cyan-600 border-cyan-300 bg-cyan-50', modal: 'health_camps' as const },
    { label: 'Membership\nProgram', icon: CreditCard, color: 'text-blue-700 border-blue-300 bg-blue-50', modal: 'become_member' as const },
    { label: 'Community\nPartners', icon: Users, color: 'text-emerald-700 border-emerald-300 bg-emerald-50', modal: 'become_partner' as const },
    { label: '24x7 Call\nCentre Support', icon: Headphones, color: 'text-slate-800 border-slate-300 bg-slate-50', modal: 'request_callback' as const },
  ];

  const stats = [
    { count: '100+', label: 'Doctors', icon: UserCheck },
    { count: '50+', label: 'Hospitals', icon: Building2 },
    { count: '25+', label: 'Diagnostic Labs', icon: TestTube },
    { count: '10000+', label: 'Happy Members', icon: Users },
    { count: '24x7', label: 'Support Available', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-2 px-2 sm:px-4 md:px-6 font-sans">
      
      {/* Outer Card Container matching the uploaded design frame */}
      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col my-auto">
        
        {/* Top Header Row */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Network Title */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={onBackToHome}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center p-1.5 text-emerald-600 shadow-xs">
                <HeartPulse className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black text-[#0f2e5a] tracking-tight leading-tight uppercase font-sans">
                  AYUDH VIKAS
                </h1>
                <span className="text-xs sm:text-sm font-extrabold text-[#006633] tracking-wide uppercase">
                  FOUNDATION
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-700 tracking-wider uppercase border-t border-emerald-200 mt-0.5 pt-0.5">
                  — CARE BEYOND BOUNDARIES —
                </span>
              </div>
            </div>

            {/* Vertical Divider & Health Care Network subtitle */}
            <div className="hidden md:block h-10 w-px bg-slate-300 mx-2"></div>

            <div className="hidden md:flex flex-col">
              <span className="text-sm font-black text-[#0275d8] uppercase tracking-wide">
                HEALTH CARE NETWORK
              </span>
              <span className="text-xs font-semibold text-slate-500">
                One Call for Complete Healthcare Support
              </span>
            </div>
          </div>

          {/* Right Header: Back to Home + Need Help Pill */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 bg-white transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="text-slate-500">Need Help?</span>
              <a
                href="tel:08704210820"
                className="bg-[#0b1b3d] hover:bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>24x7</span>
              </a>
            </div>
          </div>

        </div>

        {/* Main Body Grid: Left Content (60%) + Right Single Universal Login Box (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8 items-start">
          
          {/* Left Column: Services, Imagery & Stats (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Main Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0f2e5a] uppercase leading-tight tracking-tight">
                One Call for <br />
                <span className="text-[#0f2e5a]">Complete Healthcare Support</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">
                We connect you to the <strong className="text-emerald-700 font-bold">Right Doctor</strong>, <strong className="text-blue-700 font-bold">Right Hospital</strong>, <strong className="text-slate-800 font-bold">Right Service</strong> at the Right Time.
              </p>
            </div>

            {/* 10 Services Icons Grid (5 cols x 2 rows) */}
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {serviceBadges.map((badge, idx) => {
                const IconComponent = badge.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center text-center group cursor-pointer"
                    onClick={() => onOpenModal(badge.modal)}
                  >
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border ${badge.color} flex items-center justify-center shadow-2xs group-hover:scale-108 transition-all duration-200 mb-1.5`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight whitespace-pre-line group-hover:text-emerald-800">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Illustration Graphic: Smiling Indian Family + Glass Hospital Facade */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50 h-52 sm:h-64 shadow-inner flex items-stretch">
              
              {/* Family Image (Left side) */}
              <div className="w-1/2 h-full relative z-10">
                <img
                  src="/src/assets/images/indian_family_hero_1785560495834.jpg"
                  alt="Ayudh Vikas Happy Family"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/40"></div>
              </div>

              {/* Hospital Facade (Right side) */}
              <div className="w-1/2 h-full relative">
                <img
                  src="/src/assets/images/modern_hospital_facade_1787227836867.jpg"
                  alt="Modern Hospital Network"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-900/10 to-transparent"></div>
              </div>

              {/* Floating Quality Tag */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-800 border border-emerald-200 shadow-xs flex items-center gap-1 z-20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Quality Care</span>
              </div>
            </div>

            {/* Navy/Blue Stats Banner across bottom of left section */}
            <div className="bg-[#0b3b82] text-white rounded-xl py-3 px-4 shadow-md grid grid-cols-5 gap-2 items-center text-center divide-x divide-blue-800/80">
              {stats.map((stat, idx) => {
                const IconComp = stat.icon;
                return (
                  <div key={idx} className="flex flex-col items-center px-1">
                    <div className="flex items-center gap-1">
                      <IconComp className="w-3.5 h-3.5 text-blue-200" />
                      <span className="text-xs sm:text-sm font-black text-amber-300 tracking-tight">
                        {stat.count}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-blue-100 mt-0.5 truncate max-w-full">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Single Clean Login Card with Credentials-Based Auto-Routing */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg relative flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Header */}
              <div className="text-center space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#0f2e5a] tracking-tight">
                  Welcome Back!
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Quick 1-Click Demo Credentials Helper */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Demo Credentials:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Click to fill</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                  <button
                    type="button"
                    onClick={handleAutoFillPatient}
                    className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-slate-900 group-hover:text-emerald-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      <span>Patient</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      9876543210
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillDoctor}
                    className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-[#0f2e5a] group-hover:text-blue-900 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-blue-600" />
                      <span>Doctor</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      Dr. Ravi Teja
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillHospital}
                    className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200 hover:border-sky-300 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-sky-900 group-hover:text-sky-950 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-sky-600" />
                      <span>Hospital</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      KIMS Hospitals
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillMarketing}
                    className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-400 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-emerald-800 group-hover:text-emerald-900 flex items-center gap-1">
                      <Megaphone className="w-3 h-3 text-emerald-600" />
                      <span>Marketing</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      Rohit Kumar
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillAdmin}
                    className="bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-950 border border-slate-200 hover:border-purple-400 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-purple-900 group-hover:text-purple-950 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      Super Admin
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillVolunteer}
                    className="bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-teal-900 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-teal-600" />
                      <span>Volunteer</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      volunteer@
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillOrganizer}
                    className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-lg p-2 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-600" />
                      <span>Organizer</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate">
                      organizer@
                    </div>
                  </button>
                </div>
              </div>

              {/* General Error Message if any */}
              {errors.general && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Single Universal Login Form */}
              <form onSubmit={handleLogin} className="space-y-3.5 pt-1" noValidate>
                
                {/* Identifier Field (Mobile Number / Email ID / Doctor ID) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number / Email ID / Doctor ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (touched.identifier) {
                          setErrors(prev => ({ ...prev, identifier: undefined, general: undefined }));
                        }
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, identifier: true }));
                        validateForm();
                      }}
                      placeholder="Enter mobile, email, or Doctor ID"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.identifier 
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-600'
                      }`}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-[10.5px] font-semibold text-red-600 flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.identifier}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (touched.password) {
                          setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
                        }
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, password: true }));
                        validateForm();
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-9 pr-10 py-2.5 bg-slate-50/70 border rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                        errors.password 
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10.5px] font-semibold text-red-600 flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </p>
                  )}

                  {/* Forgot Password Link */}
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        alert('Password Reset: A temporary verification link or OTP will be sent to your registered contact.');
                      }}
                      className="text-xs font-bold text-[#0066cc] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Primary SIGN IN Button (with subtle intelligent indicator) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#152e4d] hover:bg-[#0f2238] active:bg-[#0a1727] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>{isSubmitting ? 'Verifying & Signing In...' : 'SIGN IN'}</span>
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full bg-white hover:bg-emerald-50 text-[#0f2e5a] font-black text-xs uppercase py-3 rounded-lg border-2 border-emerald-600 shadow-xs transition-all cursor-pointer"
                >
                  Continue as Guest (Patient View Only)
                </button>
                <p className="text-[10px] text-center text-slate-500 font-semibold">
                  Guest can browse the patient portal. Booking a doctor, hospital, ambulance, lab or home care requires patient registration.
                </p>

                {/* Or Continue With Social Login */}
                <div className="relative py-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-medium text-slate-500">
                    or continue with
                  </span>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onLoginSuccess) onLoginSuccess('patient');
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onLoginSuccess) onLoginSuccess('patient');
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Register Prompt */}
                <div className="text-center pt-2 text-xs font-medium text-slate-600 space-y-1">
                  <div>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onRegisterClick) {
                          onRegisterClick();
                        } else {
                          onOpenModal('register_patient');
                        }
                      }}
                      className="font-bold text-[#0066cc] hover:underline cursor-pointer ml-1"
                    >
                      Register Now
                    </button>
                  </div>
                  <div>
                    Are you a doctor interested in joining?{' '}
                    <button
                      type="button"
                      onClick={() => onOpenModal('become_partner')}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer ml-1"
                    >
                      Join as Doctor Partner
                    </button>
                  </div>
                </div>

              </form>

            </div>

          </div>

        </div>

        {/* Insurance Partners Row */}
        <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-200">
          <div className="text-center mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              OUR INSURANCE PARTNERS
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto text-[11px] font-black pb-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 rounded text-blue-700 shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Star Health Insurance</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-900 rounded font-black shadow-2xs shrink-0">
              <span>carē HEALTH INSURANCE</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-sky-300 rounded text-sky-800 shadow-2xs shrink-0">
              <span className="bg-blue-600 text-white px-1 rounded text-[9px]">B</span>
              <span>BAJAJ Allianz</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#d32f2f] text-white rounded font-black shadow-2xs shrink-0">
              <span>HDFC ERGO</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-orange-300 rounded text-orange-700 shadow-2xs shrink-0">
              <span>ICICI Lombard</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00897b] text-white rounded font-bold shadow-2xs shrink-0">
              <span>niva bupa</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-400 rounded text-blue-900 shadow-2xs shrink-0">
              <span>RELIANCE General</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-900 text-white rounded font-bold shadow-2xs shrink-0">
              <span>SBI general</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a237e] text-white rounded font-bold shadow-2xs shrink-0">
              <span>TATA AIG</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400 text-slate-900 rounded font-black shadow-2xs shrink-0">
              <span>digit</span>
            </div>
          </div>
        </div>

        {/* Footer Blue Bar */}
        <div className="bg-[#0b1b3d] text-white px-6 py-4 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
            
            {/* 4 Feature Items (4 Cols) */}
            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-white leading-tight">Trusted Network</div>
                  <div className="text-[9px] text-slate-300 leading-tight">Wide network of verified hospitals & specialists</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-white leading-tight">Affordable Care</div>
                  <div className="text-[9px] text-slate-300 leading-tight">Best guidance with affordable options</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-rose-300">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-white leading-tight">Care with Compassion</div>
                  <div className="text-[9px] text-slate-300 leading-tight">Patient first approach with empathy</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-amber-300">
                  <LockKeyhole className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black text-white leading-tight">Secure & Reliable</div>
                  <div className="text-[9px] text-slate-300 leading-tight">Your data is safe with us</div>
                </div>
              </div>

            </div>

            {/* Address & Contact Info (2 Cols) */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row lg:flex-col justify-between text-[10px] space-y-1.5 lg:border-l lg:border-slate-700 lg:pl-4 text-slate-300">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  KM Complex, Hunter Road, Near Opp- Kasamjanatha Sale, Warangal, Telangana - 506001
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-0.5">
                <a href="tel:08704210820" className="flex items-center gap-1 hover:text-white font-bold text-white">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>0870 4210820</span>
                </a>
                <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-400 font-bold text-emerald-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>9000045073</span>
                </a>
              </div>
              <div>
                <a href="mailto:support@ayudhvikas.com" className="flex items-center gap-1 hover:text-sky-300 text-slate-300">
                  <Mail className="w-3 h-3 text-sky-400" />
                  <span>support@ayudhvikas.com</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
