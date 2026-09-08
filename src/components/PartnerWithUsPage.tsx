import React, { useState } from 'react';
import { 
  HeartPulse, 
  Phone, 
  Building2, 
  Users, 
  Headphones, 
  ShieldCheck, 
  Calendar, 
  BarChart3, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Handshake, 
  Heart, 
  Trees, 
  Home as HomeIcon,
  Tent, 
  CreditCard, 
  Mail, 
  Globe, 
  QrCode, 
  ArrowLeft,
  Check,
  Star,
  Award,
  Crown
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';

interface PartnerWithUsPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onSignInClick: () => void;
  isLoggedIn?: boolean;
  userProfile?: {
    name: string;
    displayName: string;
    patientId: string;
    image: string;
  };
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
}

export const PartnerWithUsPage: React.FC<PartnerWithUsPageProps> = ({
  onBackToHome,
  onOpenModal,
  onSignInClick,
  isLoggedIn = false,
  userProfile,
  onNavigateDashboard,
  onLogout
}) => {
  const { create } = useLiveData();
  const [hospitalName, setHospitalName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    try {
      await create('partnerships', {
        hospitalName,
        contactPerson,
        phone: mobileNumber,
        email,
        cityDistrict,
        status: 'Submitted',
        partnerType: 'Hospital Partner',
      });
      alert('Thank you for your partnership interest! Our team will contact you within 24 hours.');
      setHospitalName('');
      setContactPerson('');
      setMobileNumber('');
      setEmail('');
      setCityDistrict('');
    } catch (err: any) {
      alert(err.message || 'Could not submit partnership request.');
    } finally {
      setFormSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* Outer Content Frame matching the uploaded high quality sheet */}
      <div className="max-w-[1600px] w-full mx-auto bg-white shadow-xl border border-slate-200 overflow-hidden my-0 sm:my-2">
        
        {/* 1. TOP HEADER ROW */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand Logo & Healthcare Network subtitle */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={onBackToHome}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center p-1.5 text-emerald-600 shadow-2xs">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-black text-[#0f2e5a] tracking-tight leading-none uppercase font-sans">
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

            {/* Vertical Divider */}
            <div className="hidden md:block h-9 w-px bg-slate-300 mx-2"></div>

            <div className="hidden md:flex flex-col">
              <span className="text-sm font-black text-[#0f2e5a] uppercase tracking-wide">
                AYUDH VIKAS
              </span>
              <span className="text-xs font-black text-[#0275d8] uppercase tracking-wide">
                HEALTH CARE NETWORK
              </span>
            </div>
          </div>

          {/* Right Header: Phone, WhatsApp, Address */}
          <div className="flex flex-wrap items-center gap-4 text-xs ml-auto">
            
            <div className="flex items-center gap-3">
              <a href="tel:08704210820" className="flex items-center gap-1.5 font-black text-[#0f2e5a] hover:text-emerald-700">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>0870-4210820</span>
              </a>

              <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-black text-emerald-800 hover:underline">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>9000045073</span>
              </a>
            </div>

            <div className="hidden lg:flex items-start gap-1.5 max-w-[280px] text-[10px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-tight">
                KM Complex, Hunter Road, Near Opp. Kasam Janatha Sale, Warangal, Telangana - 506002
              </span>
            </div>

          </div>

        </div>

        {/* 2. BLUE NAVIGATION STRIP */}
        <nav className="bg-[#0b2b64] text-white px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-xs font-black uppercase tracking-wide">
            <button onClick={onBackToHome} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              HOME
            </button>
            <button onClick={onBackToHome} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              ABOUT US
            </button>
            <button onClick={onBackToHome} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              SERVICES
            </button>
            <button onClick={() => {}} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              PARTNER HOSPITALS
            </button>
            <button onClick={() => {}} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              MEMBERSHIP
            </button>
            <button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              HEALTH CAMPS
            </button>
            <button onClick={() => onOpenModal('emergency_help')} className="hover:text-emerald-400 px-2 py-1 rounded transition-colors cursor-pointer">
              CONTACT US
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => {
                const element = document.getElementById('partner-apply-form');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-black uppercase px-4 py-1.5 rounded shadow-sm transition-all cursor-pointer"
            >
              PARTNER WITH US
            </button>

            {isLoggedIn ? (
              <button
                onClick={onNavigateDashboard || onBackToHome}
                className="bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 border border-emerald-500/50"
              >
                <img
                  src={userProfile?.image || "/src/assets/images/patient_avatar_1787229395408.jpg"}
                  alt={userProfile?.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{userProfile?.displayName || userProfile?.name || 'My Profile'}</span>
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer border border-white/20"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        {/* 3. HERO SECTION + WHY PARTNER WITH US */}
        <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Middle: Hero Banner (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Title & Slogan */}
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0f2e5a] tracking-tight leading-none uppercase">
                PARTNER WITH <br />
                <span className="text-[#0275d8]">AYUDH VIKAS</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-black text-[#006633] uppercase tracking-tight mt-1">
                HEALTH CARE NETWORK
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide mt-2">
                CONNECTING PATIENTS, HOSPITALS & COMMUNITIES THROUGH COORDINATED HEALTHCARE SERVICES
              </p>
            </div>

            {/* 2 Big Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => {
                  const element = document.getElementById('partner-apply-form');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#0d47a1] hover:bg-blue-900 text-white px-5 py-3 rounded-full text-xs sm:text-sm font-black uppercase flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <span>BECOME A PARTNER HOSPITAL</span>
              </button>

              <button 
                onClick={() => onOpenModal('emergency_help')}
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-5 py-3 rounded-full text-xs sm:text-sm font-black uppercase flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span>SCHEDULE A MEETING</span>
              </button>
            </div>

            {/* Composite Hero Image: Doctor, Nurse, Happy Family, Hospital & Ambulance */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 h-64 sm:h-80 md:h-96">
              <img
                src="/src/assets/images/partner_hero_team_1787229787269.jpg"
                alt="Ayudh Vikas Medical Network Team"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 bg-[#0f2e5a]/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-md border border-white/20">
                ★ Trusted Healthcare Ecosystem in Warangal & Across Telangana
              </div>
            </div>

          </div>

          {/* Right Column: WHY PARTNER WITH US? (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            
            <h3 className="text-base sm:text-lg font-black text-[#0f2e5a] text-center uppercase tracking-wide pb-2 border-b border-slate-200">
              WHY PARTNER WITH US?
            </h3>

            {/* 6 Grid Cards (2 columns x 3 rows) */}
            <div className="grid grid-cols-2 gap-3 text-center">
              
              {/* Card 1: 24/7 Patient Support */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  24/7 Patient Support
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                  Round the clock patient assistance & guidance
                </p>
              </div>

              {/* Card 2: Health Camp Coordination */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
                  <Tent className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  Health Camp Coordination
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                  Organize health camps in rural & urban areas
                </p>
              </div>

              {/* Card 3: Digital Hospital Profile */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-1.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  Digital Hospital Profile
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                  Showcase your hospital to thousands of people
                </p>
              </div>

              {/* Card 4: Appointment Coordination */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  Appointment Coordination
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                  We coordinate & confirm appointments
                </p>
              </div>

              {/* Card 5: Community Outreach */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-1.5">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  Community Outreach
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                  Connect with communities through our network
                </p>
              </div>

              {/* Card 6: Monthly Reports & Performance */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center mb-1.5">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  Monthly Reports & Performance
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">
                  Detailed reports & analytics of patient coordination
                </p>
              </div>

            </div>

            {/* Coverage Areas & Technology Sub-Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Coverage Areas */}
              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 text-left">
                <h4 className="text-xs font-black text-[#0f2e5a] uppercase pb-1.5 border-b border-sky-200">
                  COVERAGE AREAS
                </h4>
                <div className="space-y-1 pt-2 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" /><span>Mulugu</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" /><span>Bhupalpally</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" /><span>Hanamkonda</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" /><span>Warangal</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" /><span>Mahabubabad</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-600 shrink-0" /><span>Jangaon</span></div>
                </div>
              </div>

              {/* Our Technology */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-left flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#0f2e5a] uppercase pb-1.5 border-b border-slate-200">
                    OUR TECHNOLOGY
                  </h4>
                  <div className="space-y-1 pt-2 text-[10px] font-bold text-slate-700">
                    <div className="flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" /><span>Advanced CRM System</span></div>
                    <div className="flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" /><span>24/7 Call Centre Management</span></div>
                    <div className="flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" /><span>Real-time Patient Tracking</span></div>
                    <div className="flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" /><span>Reports & Analytics Dashboard</span></div>
                    <div className="flex items-start gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" /><span>Secure & Scalable Platform</span></div>
                  </div>
                </div>

                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src="/src/assets/images/tech_crm_dashboard_1787229805352.jpg"
                    alt="Ayudh Vikas CRM Tech Platform"
                    className="w-full h-14 object-cover"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 4. OUR HEALTHCARE COORDINATION NETWORK FLOWCHART */}
        <div className="px-4 sm:px-6 py-6 bg-slate-50/70 border-y border-slate-200 text-center">
          
          <h3 className="text-sm sm:text-base font-black text-[#0f2e5a] uppercase tracking-wider mb-5">
            OUR HEALTHCARE COORDINATION NETWORK
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-6xl mx-auto">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-emerald-600 text-emerald-700 flex items-center justify-center shadow-sm">
                <Trees className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mt-2 max-w-[90px] leading-tight">
                VILLAGES & COMMUNITIES
              </span>
            </div>

            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-blue-600 text-blue-700 flex items-center justify-center shadow-sm">
                <Users className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mt-2 max-w-[90px] leading-tight">
                COMMUNITY HEALTH PARTNERS
              </span>
            </div>

            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-sky-600 text-sky-700 flex items-center justify-center shadow-sm">
                <Headphones className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mt-2 max-w-[90px] leading-tight">
                24/7 CALL CENTRE
              </span>
            </div>

            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#006633] text-[#006633] flex items-center justify-center shadow-sm">
                <HeartPulse className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mt-2 max-w-[90px] leading-tight">
                AYUDH VIKAS FOUNDATION
              </span>
            </div>

            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />

            {/* Step 5 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#0f2e5a] text-[#0f2e5a] flex items-center justify-center shadow-sm">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mt-2 max-w-[90px] leading-tight">
                PARTNER HOSPITALS
              </span>
            </div>

            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />

            {/* Step 6 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00703c] border-2 border-[#00703c] text-white flex items-center justify-center shadow-sm">
                <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase mt-2 max-w-[90px] leading-tight">
                BETTER PATIENT CARE
              </span>
            </div>

          </div>

        </div>

        {/* 5. SERVICES, INSURANCE, HOSPITALS, TESTIMONIALS & PLANS */}
        <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 7 Cols: Services, Insurance, Hospital Partners */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Our Services Checkmarks */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide pb-2 border-b border-slate-100">
                OUR SERVICES
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Patient Support & Guidance</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Specialist Appointment Coordination</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Diagnostic & Lab Coordination</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Health Camp Organization</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Follow-up & Feedback Support</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Membership Support Services</span></div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Emergency Assistance</span></div>
              </div>
            </div>

            {/* Our Insurance Partners */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide pb-2 border-b border-slate-100">
                OUR INSURANCE PARTNERS
              </h4>
              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                <div className="px-3 py-1 bg-white border border-blue-200 rounded text-xs font-black text-blue-700 shadow-2xs">STAR</div>
                <div className="px-3 py-1 bg-amber-400 text-slate-900 rounded text-xs font-black shadow-2xs">care HEALTH INSURANCE</div>
                <div className="px-3 py-1 bg-[#d32f2f] text-white rounded text-xs font-black shadow-2xs">HDFC ERGO</div>
                <div className="px-3 py-1 bg-white border border-orange-200 rounded text-xs font-black text-orange-700 shadow-2xs">ICICI Lombard</div>
                <div className="px-3 py-1 bg-[#004ba0] text-white rounded text-xs font-black shadow-2xs">BAJAJ Allianz</div>
                <div className="px-3 py-1 bg-[#1a237e] text-white rounded text-xs font-black shadow-2xs">TATA AIG</div>
                <div className="px-3 py-1 bg-[#00897b] text-white rounded text-xs font-black shadow-2xs">niva bupa</div>
                <span className="text-xs font-bold text-slate-500 italic">and more...</span>
              </div>
            </div>

            {/* Our Hospital Partners */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide pb-2 border-b border-slate-100">
                OUR HOSPITAL PARTNERS
              </h4>
              <div className="flex flex-wrap items-center gap-2.5 pt-3">
                <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded text-xs font-black shadow-2xs">KIMS HOSPITALS</div>
                <div className="px-3 py-1 bg-white border border-slate-300 text-slate-900 rounded text-xs font-black shadow-2xs">YASHODA HOSPITALS</div>
                <div className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded text-xs font-black shadow-2xs">CARE HOSPITALS</div>
                <div className="px-3 py-1 bg-[#0f2e5a] text-white rounded text-xs font-black shadow-2xs">AIG HOSPITALS</div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded text-xs font-black shadow-2xs">MGM HEALTHCARE</div>
                <div className="px-3 py-1 bg-red-50 border border-red-200 text-red-900 rounded text-xs font-black shadow-2xs">MEDICOVER HOSPITALS</div>
                <div className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-900 rounded text-xs font-black shadow-2xs">Rainbow Children's Hospital</div>
                <div className="px-3 py-1 bg-blue-900 text-white rounded text-xs font-black shadow-2xs">Apollo HOSPITALS</div>
                <span className="text-xs font-bold text-slate-500 italic">and more...</span>
              </div>
            </div>

          </div>

          {/* Right 5 Cols: What Our Partners Say & Partnership Plans */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* What Our Partners Say */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide pb-1 border-b border-slate-100">
                WHAT OUR PARTNERS SAY
              </h4>

              {/* Testimonial 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <img
                  src="/src/assets/images/partner_doctor_kims_1787229821989.jpg"
                  alt="Administrator KIMS Hospital"
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shrink-0 shadow-2xs"
                />
                <div className="text-xs">
                  <p className="text-slate-700 italic font-medium text-[11px] leading-relaxed">
                    "Ayudh Vikas Foundation is doing a wonderful job in connecting patients from rural areas to quality healthcare services. We are proud to be their partner."
                  </p>
                  <div className="text-[10px] font-bold text-slate-900 mt-1">
                    — Administrator, <span className="text-blue-700 font-black">KIMS Hospital</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <img
                  src="/src/assets/images/partner_ceo_care_1787229842597.jpg"
                  alt="CEO Care Hospital"
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shrink-0 shadow-2xs"
                />
                <div className="text-xs">
                  <p className="text-slate-700 italic font-medium text-[11px] leading-relaxed">
                    "Their call centre and follow-up support is excellent. It helps us in better patient care and trust building in the community."
                  </p>
                  <div className="text-[10px] font-bold text-slate-900 mt-1">
                    — CEO, <span className="text-emerald-700 font-black">Care Hospital</span>
                  </div>
                </div>
              </div>

            </div>

            {/* PARTNERSHIP PLANS (3 Cards) */}
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-black text-[#0f2e5a] uppercase tracking-wide text-center">
                PARTNERSHIP PLANS
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                
                {/* 1. BASIC PLAN */}
                <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="bg-[#2e7d32] text-white py-1.5 text-xs font-black uppercase">
                    BASIC PLAN
                  </div>
                  <div className="p-3 space-y-2 text-[10px] font-bold text-slate-700 flex-1 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <ul className="space-y-1 text-left pt-1">
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /><span>Hospital Listing</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /><span>Basic Profile</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600" /><span>24/7 Support</span></li>
                    </ul>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-base font-black text-slate-900 leading-none">₹ 5,000</div>
                      <span className="text-[8px] text-slate-500 uppercase font-semibold">One Time</span>
                    </div>
                  </div>
                </div>

                {/* 2. STANDARD PLAN */}
                <div className="bg-white rounded-xl border border-blue-300 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="bg-[#1565c0] text-white py-1.5 text-xs font-black uppercase">
                    STANDARD PLAN
                  </div>
                  <div className="p-3 space-y-2 text-[10px] font-bold text-slate-700 flex-1 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <ul className="space-y-1 text-left pt-1">
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-blue-600" /><span>Everything in Basic</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-blue-600" /><span>Health Camp Support</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-blue-600" /><span>Digital Promotion</span></li>
                    </ul>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-base font-black text-slate-900 leading-none">₹ 10,000</div>
                      <span className="text-[8px] text-slate-500 uppercase font-semibold">One Time</span>
                    </div>
                  </div>
                </div>

                {/* 3. PREMIUM PLAN */}
                <div className="bg-white rounded-xl border border-teal-300 overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="bg-[#004d40] text-white py-1.5 text-xs font-black uppercase">
                    PREMIUM PLAN
                  </div>
                  <div className="p-3 space-y-2 text-[10px] font-bold text-slate-700 flex-1 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                      <Crown className="w-4 h-4" />
                    </div>
                    <ul className="space-y-1 text-left pt-1">
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-teal-600" /><span>Everything in Standard</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-teal-600" /><span>Dedicated Executive</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-teal-600" /><span>Monthly Reports</span></li>
                      <li className="flex items-center gap-1"><Check className="w-3 h-3 text-teal-600" /><span>Priority Listing</span></li>
                    </ul>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-base font-black text-slate-900 leading-none">₹ 15,000</div>
                      <span className="text-[8px] text-slate-500 uppercase font-semibold">One Time</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* 6. MISSION BANNER STRIP */}
        <div className="bg-[#0b2b64] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm sm:text-base font-black uppercase tracking-wide">
            JOIN US IN OUR MISSION TO PROVIDE QUALITY HEALTHCARE TO EVERY COMMUNITY
          </div>
          <button 
            onClick={() => {
              const element = document.getElementById('partner-apply-form');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#00703c] hover:bg-[#005830] text-white font-black text-xs uppercase px-6 py-2.5 rounded-lg shadow-md transition-all cursor-pointer"
          >
            BECOME A PARTNER TODAY!
          </button>
        </div>

        {/* 7. FOOTER + BECOME A PARTNER HOSPITAL FORM */}
        <div className="bg-[#071736] text-white p-6 lg:p-8" id="partner-apply-form">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: Foundation Branding, Quick Links, Contacts & QR */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center p-1.5 shadow-sm">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight leading-none">
                    AYUDH VIKAS FOUNDATION
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                    Care Beyond Boundaries
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                
                {/* Quick Links */}
                <div>
                  <h4 className="font-black uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-700">
                    QUICK LINKS
                  </h4>
                  <ul className="space-y-1 pt-2 text-[11px] text-slate-300 font-medium">
                    <li><button onClick={onBackToHome} className="hover:text-emerald-400 transition-colors">Home</button></li>
                    <li><button onClick={onBackToHome} className="hover:text-emerald-400 transition-colors">About Us</button></li>
                    <li><button onClick={onBackToHome} className="hover:text-emerald-400 transition-colors">Services</button></li>
                    <li><button onClick={() => {}} className="hover:text-emerald-400 transition-colors">Partner Hospitals</button></li>
                    <li><button onClick={() => {}} className="hover:text-emerald-400 transition-colors">Membership</button></li>
                    <li><button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-400 transition-colors">Health Camps</button></li>
                    <li><button onClick={() => onOpenModal('emergency_help')} className="hover:text-emerald-400 transition-colors">Contact Us</button></li>
                    <li><button onClick={() => {}} className="hover:text-emerald-400 font-bold text-emerald-400 transition-colors">Partner With Us</button></li>
                  </ul>
                </div>

                {/* Contact Us */}
                <div>
                  <h4 className="font-black uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-700">
                    CONTACT US
                  </h4>
                  <div className="space-y-2 pt-2 text-[11px] text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <a href="tel:08704210820" className="hover:text-white font-bold">0870-4210820</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="hover:text-white font-bold">9000045073</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">info@ayudhvikasfoundation.org</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>www.ayudhvikasfoundation.org</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[10px] pt-1 leading-tight text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>KM Complex, Hunter Road, Near Opp. Kasam Janatha Sale, Warangal, Telangana - 506002</span>
                    </div>
                  </div>
                </div>

                {/* Follow Us & QR Code */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-black uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-700">
                      FOLLOW US
                    </h4>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black cursor-pointer hover:scale-110 transition-transform">f</div>
                      <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-white text-xs font-black cursor-pointer hover:scale-110 transition-transform">ig</div>
                      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black cursor-pointer hover:scale-110 transition-transform">yt</div>
                      <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-black cursor-pointer hover:scale-110 transition-transform">in</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/10">
                    <div className="bg-white p-1 rounded">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                    <div className="text-[10px] text-slate-300 leading-tight">
                      <div className="font-black text-white">Scan QR Code</div>
                      <div>Visit Our Website</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right 5 Cols: BECOME A PARTNER HOSPITAL FORM */}
            <div className="lg:col-span-5 bg-white/5 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl">
              
              <h4 className="text-sm font-black text-white uppercase tracking-wider text-center pb-3 border-b border-slate-700">
                BECOME A PARTNER HOSPITAL
              </h4>

              <form onSubmit={handleSubmit} className="space-y-3 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="Enter hospital name"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Doctor / Admin name"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10 digit mobile"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hospital@email.com"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">City / District</label>
                  <input
                    type="text"
                    value={cityDistrict}
                    onChange={(e) => setCityDistrict(e.target.value)}
                    placeholder="e.g. Warangal, Hanamkonda, Karimnagar"
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00703c] hover:bg-[#005830] active:bg-[#004726] text-white font-black text-xs uppercase py-3 rounded-lg shadow-md transition-all cursor-pointer mt-2"
                >
                  {formSubmitted ? 'SUBMITTING...' : 'APPLY NOW'}
                </button>
              </form>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
