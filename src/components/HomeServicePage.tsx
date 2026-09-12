import React, { useState } from 'react';
import { 
  HeartPulse, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  IndianRupee, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut,
  X,
  MessageSquare,
  Home,
  Heart,
  Baby,
  Activity,
  Syringe,
  FileText,
  UserCheck,
  Headphones,
  Check,
  ArrowRight,
  Droplets,
  PhoneCall,
  Bed,
  Sparkles,
  ClipboardList,
  CalendarCheck,
  HeartHandshake
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';

interface HomeServicePageProps {
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
    address?: string;
  };
  onNavigateDashboard?: () => void;
  onLogout?: () => void;
  isDashboardContext?: boolean;
  hideHeader?: boolean;
}

export const HomeServicePage: React.FC<HomeServicePageProps> = ({
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
    address: 'H.No 2-8-450, Subedari, Hanamkonda, Warangal - 506001',
    image: '/src/assets/images/patient_avatar_1787229395408.jpg'
  },
  onNavigateDashboard,
  onLogout,
  hideHeader = false
}) => {
  const { create } = useLiveData();
  const { isGuest } = useAuth();
  // Form State
  const [patientName, setPatientName] = useState(isLoggedIn ? userProfile.name : '');
  const [mobileNumber, setMobileNumber] = useState(isLoggedIn ? userProfile.phone || '9876543210' : '');
  const [cityDistrict, setCityDistrict] = useState('');
  const [serviceRequired, setServiceRequired] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Learn More Modal State
  const [selectedServiceModal, setSelectedServiceModal] = useState<{
    title: string;
    desc: string;
    icon: any;
    features: string[];
    price: string;
  } | null>(null);

  // Success Confirmation Modal
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    bookingId?: string;
    patientName?: string;
    serviceName?: string;
    city?: string;
    date?: string;
    time?: string;
  }>({ open: false });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  // 8 Specific Services matching exact image 2
  const servicesList = [
    {
      id: 'nursing_care',
      title: 'Nursing Care at Home',
      desc: 'Trained nurses for wound care, IV fluids, injection, catheter care, medication management & more.',
      icon: Syringe,
      price: '₹799 / Shift',
      features: ['Certified GNM / B.Sc Nurses', 'Wound & Dressing Management', 'Post-Op Vital Monitoring', 'Catheter & Ryle Tube Care']
    },
    {
      id: 'doctor_visit',
      title: 'Doctor Visit at Home',
      desc: 'Consult experienced doctors at home for regular checkups, follow-ups & health monitoring.',
      icon: Stethoscope,
      price: '₹499 / Visit',
      features: ['Senior General Physicians & MDs', 'Physical Exam & Prescription', 'Health Charting & Advice', 'Tele-consultation Follow-up']
    },
    {
      id: 'physiotherapy',
      title: 'Physiotherapy at Home',
      desc: 'Expert physiotherapy sessions for pain management, mobility improvement & rehabilitation.',
      icon: Activity,
      price: '₹599 / Session',
      features: ['Neuro & Ortho Rehabilitation', 'Stroke Recovery Exercises', 'Joint & Muscle Pain Relief', 'Custom Mobility Protocols']
    },
    {
      id: 'elderly_care',
      title: 'Elderly Care',
      desc: 'Compassionate care for elderly patients including daily assistance, companionship & health monitoring.',
      icon: Users,
      price: '₹699 / Day',
      features: ['Dedicated Trained Attendants', 'Assisted Mobility & Feeding', 'Timely Medicine Admin', 'Companionship & Hygiene']
    },
    {
      id: 'post_surgery',
      title: 'Post-Surgery Care',
      desc: 'Professional care after surgery including wound care, medication, diet support & monitoring.',
      icon: Bed,
      price: '₹849 / Shift',
      features: ['Sterile Dressing & Stitch Care', 'Pain & Drain Management', 'Surgical Recovery Regimen', 'Doctor Consultation On-Call']
    },
    {
      id: 'palliative_care',
      title: 'Palliative Care',
      desc: 'Pain & symptom management and emotional support for patients with critical illnesses.',
      icon: Heart,
      price: '₹899 / Day',
      features: ['Advanced Pain Management', 'Emotional & Family Support', 'Compassionate Palliative Nurses', '24x7 Physician On-Call']
    },
    {
      id: 'baby_mother',
      title: 'Baby & Mother Care',
      desc: 'Newborn care, mother care, feeding support, vaccination reminders & more.',
      icon: Baby,
      price: '₹649 / Day',
      features: ['Newborn Bathing & Massage', 'Postnatal Mother Support', 'Lactation & Feeding Guidance', 'Immunization & Health Reminders']
    },
    {
      id: 'lab_sample',
      title: 'Lab Sample Collection',
      desc: 'Trained staff will collect lab samples from your home and deliver accurate reports.',
      icon: Droplets,
      price: 'Free Home Pickup',
      features: ['Home Blood & Urine Pickup', 'NABL Accredited Diagnostics', 'Digital Report on WhatsApp/EHR', 'Zero Home Visit Charge']
    }
  ];

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onOpenModal('register_patient');
      return;
    }
    if (!patientName.trim() || !mobileNumber.trim()) {
      alert('Please enter Patient Name and Mobile Number.');
      return;
    }

    const created = await create('home_care_bookings', {
      patientName,
      phone: mobileNumber,
      cityDistrict,
      serviceRequired: serviceRequired || 'Nursing Care at Home',
      preferredDate,
      preferredTime,
      additionalNotes,
      patientId: userProfile.patientId,
      status: 'Scheduled',
    });
    setSuccessModal({
      open: true,
      bookingId: created.id,
      patientName,
      serviceName: serviceRequired || 'Nursing Care at Home',
      city: cityDistrict || 'Warangal',
      date: preferredDate || 'Today',
      time: preferredTime || 'Immediate'
    });
  };

  const handleLearnMore = (service: typeof servicesList[0]) => {
    setSelectedServiceModal(service);
  };

  const handleSelectService = (title: string) => {
    setServiceRequired(title);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP HEADER CONTACT BAR */}
      {!hideHeader && (
        <div className="bg-[#f0f4f9] border-b border-slate-200 text-slate-700 text-xs py-1.5 px-4 sm:px-8">
          <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium">
            
            {/* Left Contact Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="tel:08704210820" className="flex items-center gap-1.5 hover:text-blue-700 font-semibold">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>0870-4210820</span>
              </a>
              <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-700 font-semibold">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>9000045073</span>
              </a>
              <a href="mailto:info@ayudhvikasfoundation.org" className="hidden md:flex items-center gap-1.5 hover:text-blue-700">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>info@ayudhvikasfoundation.org</span>
              </a>
              <div className="hidden xl:flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>KM Complex, Hunter Road, Near Opp: Kasam Jreedha Sala, Warangal, Telangana - 506002</span>
              </div>
            </div>

            {/* Right Emergency Red Badge Button */}
            <a 
              href="tel:08704210820"
              className="bg-[#b91c1c] hover:bg-[#991b1b] text-white px-3.5 py-1 rounded-sm flex items-center gap-1.5 font-bold tracking-wide shadow-xs transition-colors"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>Emergency 24x7: 0870-4210820</span>
            </a>

          </div>
        </div>
      )}

      {/* 2. MAIN NAVBAR */}
      {!hideHeader && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={onBackToHome}
            >
              <BrandLogo className="w-10 h-10 shadow-2xs" />
              <div className="flex flex-col">
                <h1 className="text-base font-black text-[#0f2e5a] tracking-tight leading-none uppercase font-sans">
                  AYUDH VIKAS
                </h1>
                <span className="text-[10px] font-extrabold text-[#006633] tracking-wider uppercase leading-tight">
                  HEALTH CARE NETWORK
                </span>
                <span className="text-[8px] font-semibold text-slate-500 tracking-wider">
                  Care Beyond Boundaries
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
              <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Home</button>
              <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">About Us</button>
              
              {/* Services Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                >
                  <span>Services</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {servicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-lg py-1.5 z-50 text-left">
                    <button 
                      onClick={() => { setServicesDropdownOpen(false); onOpenModal('book_appointment'); }} 
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                    >
                      Doctor Consultation
                    </button>
                    <button 
                      onClick={() => { setServicesDropdownOpen(false); onOpenModal('find_hospitals'); }} 
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                    >
                      Hospital Guidance
                    </button>
                    <button 
                      onClick={() => { setServicesDropdownOpen(false); onOpenModal('book_lab_test'); }} 
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                    >
                      Diagnostic Lab Tests
                    </button>
                    <button 
                      onClick={() => { setServicesDropdownOpen(false); onOpenModal('ambulance_booking'); }} 
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 text-slate-700"
                    >
                      Ambulance Service
                    </button>
                    <button 
                      onClick={() => { setServicesDropdownOpen(false); }} 
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 font-bold text-emerald-700"
                    >
                      Home Care Services
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => onOpenModal('book_appointment')} className="hover:text-emerald-700 cursor-pointer">Doctors</button>
              <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Hospitals</button>
              <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Health Camps</button>
              <button onClick={() => onOpenModal('book_lab_test')} className="hover:text-emerald-700 cursor-pointer">Labs</button>
              
              {/* Active Home Care Link */}
              <div className="text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1 cursor-pointer">
                Home Care
              </div>

              <button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-700 cursor-pointer">Membership</button>
              <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Contact Us</button>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.scrollTo({ top: 80, behavior: 'smooth' })}
                className="bg-[#00703c] hover:bg-[#005830] text-white text-xs font-bold px-4 py-2 rounded-sm transition-all shadow-xs cursor-pointer"
              >
                Book Service
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-sm cursor-pointer text-xs font-semibold text-slate-700"
                  >
                    <img 
                      src={userProfile.image} 
                      alt={userProfile.name} 
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{userProfile.displayName}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onNavigateDashboard) onNavigateDashboard();
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Patient Dashboard</span>
                      </button>
                      {onLogout && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Logout</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onSignInClick}
                  className="border border-[#0f2e5a] text-[#0f2e5a] hover:bg-[#0f2e5a] hover:text-white px-3.5 py-1.5 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>

          </div>
        </header>
      )}

      {/* 3. MAIN SECTION: (LEFT: EXACT TOP HERO BANNER + OUR HOME CARE SERVICES) & (RIGHT: DOCKED BOOKING FORM) */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-5 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN (8 COLS): HERO BANNER (MATCHING GIVEN IMAGE EXACTLY) + 8 SERVICE CARDS */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* TOP HERO BANNER: EXACT REPLICATION OF USER IMAGE */}
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-[#edf4fc] via-[#f3f8fd] to-[#f8fbfe] border border-sky-200/80 shadow-xs min-h-[220px] sm:min-h-[250px] flex items-stretch">
              
              {/* Right Embedded Nurse & Patient Image with smooth fade on left edge */}
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[54%] md:w-[50%] lg:w-[48%] overflow-hidden pointer-events-none">
                <img 
                  src="/src/assets/images/home_care_top_banner_1787376874931.jpg" 
                  alt="Home Care Services Nurse with Elderly Patient"
                  className="w-full h-full object-cover object-center"
                />
                {/* Smooth Gradient Overlay matching the reference banner */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#edf4fc] via-[#edf4fc]/70 to-transparent sm:via-transparent sm:from-[#edf4fc] w-[35%]"></div>
              </div>

              {/* Left Content Area (Overlaid on top of background) */}
              <div className="relative z-10 p-5 sm:p-7 max-w-full sm:max-w-[62%] md:max-w-[58%] flex flex-col justify-between space-y-4">
                
                {/* Heading + Subtitle + Description */}
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0f4c81] tracking-tight font-sans leading-none">
                    HOME CARE SERVICES
                  </h1>
                  <h2 className="text-base sm:text-lg font-bold text-[#2e7d32] tracking-tight">
                    Care at Home, Comfort at Heart
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal pt-1 max-w-md">
                    Professional medical care and support services at the comfort of your home by trained and verified healthcare professionals.
                  </p>
                </div>

                {/* 4 Green Line Icon Badges with Vertical Separator Lines (Exact replica of image) */}
                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 pt-2 border-t border-sky-100">
                  
                  {/* Badge 1: 24/7 Availability (24 with circular arrow) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-emerald-600 bg-white/90 text-emerald-700 flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs">
                      24
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 leading-tight">
                      24/7<br /><span className="text-[9px] text-slate-500 font-normal">Availability</span>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden sm:block w-[1px] h-6 bg-slate-300"></div>

                  {/* Badge 2: Trained & Verified Caregivers (Doctor outline) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-emerald-600 bg-white/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 leading-tight">
                      Trained & Verified<br /><span className="text-[9px] text-slate-500 font-normal">Caregivers</span>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden sm:block w-[1px] h-6 bg-slate-300"></div>

                  {/* Badge 3: Safe & Reliable Care at Home (Shield with check) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-emerald-600 bg-white/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 leading-tight">
                      Safe & Reliable<br /><span className="text-[9px] text-slate-500 font-normal">Care at Home</span>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden sm:block w-[1px] h-6 bg-slate-300"></div>

                  {/* Badge 4: Affordable Pricing (Rupee symbol) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-7 h-7 rounded-full border border-emerald-600 bg-white/90 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                      ₹
                    </div>
                    <div className="text-[10px] font-semibold text-slate-800 leading-tight">
                      Affordable<br /><span className="text-[9px] text-slate-500 font-normal">Pricing</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* OUR HOME CARE SERVICES (Listed at left of booking form) */}
            <div className="space-y-3.5 pt-1">
              
              {/* Section Header */}
              <div className="flex items-center gap-2">
                <div className="text-emerald-700">
                  <Home className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-sm font-black text-[#0f2e5a] tracking-wide uppercase">
                  OUR HOME CARE SERVICES
                </h2>
              </div>

              {/* 8 Cards: 4 Columns x 2 Rows Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {servicesList.map(service => {
                  const IconComp = service.icon;
                  return (
                    <div 
                      key={service.id}
                      className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5 group"
                    >
                      <div className="space-y-1.5">
                        
                        {/* Blue Icon */}
                        <div className="w-8 h-8 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <IconComp className="w-4 h-4" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                          {service.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[10px] text-slate-600 leading-relaxed font-normal line-clamp-3">
                          {service.desc}
                        </p>

                      </div>

                      {/* Learn More link */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <button
                          onClick={() => handleLearnMore(service)}
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 cursor-pointer text-[10px]"
                        >
                          <span>Learn More</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSelectService(service.title)}
                          className="text-[9px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN (4 COLS): BOOK HOME CARE SERVICE FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-md p-4 sm:p-5 space-y-3 sticky top-16">
              
              {/* Form Title with House/Stethoscope Icon */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0f2e5a] tracking-wide uppercase">
                  BOOK HOME CARE SERVICE
                </h3>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleFormSubmit} className="space-y-2.5 text-xs">
                
                {/* 1. Patient Name */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 placeholder:text-slate-400"
                  />
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Enter mobile number"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 placeholder:text-slate-400"
                  />
                </div>

                {/* 3. City / District */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    City / District <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={cityDistrict}
                    onChange={e => setCityDistrict(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 text-slate-700"
                  >
                    <option value="">Select City / District</option>
                    <option value="Warangal">Warangal</option>
                    <option value="Hanamkonda">Hanamkonda</option>
                    <option value="Kazipet">Kazipet</option>
                    <option value="Jangaon">Jangaon</option>
                    <option value="Mahabubabad">Mahabubabad</option>
                    <option value="Jayashankar Bhupalpally">Jayashankar Bhupalpally</option>
                  </select>
                </div>

                {/* 4. Service Required */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Service Required <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={serviceRequired}
                    onChange={e => setServiceRequired(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 text-slate-700"
                  >
                    <option value="">Select Service</option>
                    <option value="Nursing Care at Home">Nursing Care at Home</option>
                    <option value="Doctor Visit at Home">Doctor Visit at Home</option>
                    <option value="Physiotherapy at Home">Physiotherapy at Home</option>
                    <option value="Elderly Care">Elderly Care</option>
                    <option value="Post-Surgery Care">Post-Surgery Care</option>
                    <option value="Palliative Care">Palliative Care</option>
                    <option value="Baby & Mother Care">Baby & Mother Care</option>
                    <option value="Lab Sample Collection">Lab Sample Collection</option>
                  </select>
                </div>

                {/* 5. Preferred Date */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Preferred Date
                  </label>
                  <input 
                    type="date" 
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 text-slate-700"
                  />
                </div>

                {/* 6. Preferred Time */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Preferred Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 text-slate-700"
                  >
                    <option value="">Select Time</option>
                    <option value="Morning (08:00 AM - 11:00 AM)">Morning (08:00 AM - 11:00 AM)</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM - 07:00 PM)</option>
                    <option value="Immediate / Emergency Visit">Immediate / Emergency Visit</option>
                  </select>
                </div>

                {/* 7. Additional Notes */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Additional Notes
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Enter any additional notes"
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm p-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 placeholder:text-slate-400"
                  />
                </div>

                {/* BOOK NOW Button */}
                <button
                  type="submit"
                  className="w-full bg-[#006633] hover:bg-[#004d26] text-white font-bold text-xs py-2.5 rounded-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 tracking-wider cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>BOOK NOW</span>
                </button>

                {/* Chat on WhatsApp Button */}
                <a
                  href="https://wa.me/919000045073"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full border border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs py-2 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>

              </form>

            </div>
          </div>

        </div>
      </div>

      {/* 4. FULL-WIDTH LOWER SECTION: WHY CHOOSE AYUDH VIKAS HOME CARE? & HOW IT WORKS */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 pb-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT: WHY CHOOSE AYUDH VIKAS HOME CARE? (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
            
            <h3 className="text-xs font-black text-[#0f2e5a] tracking-wider uppercase">
              WHY CHOOSE AYUDH VIKAS HOME CARE?
            </h3>

            {/* 5 Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-center pt-1">
              
              {/* 1. Verified & Trained Professionals */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-2xs">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Verified & Trained Professionals</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Background verified caregivers & staff</div>
              </div>

              {/* 2. Personalized Care */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-700 border border-sky-300 flex items-center justify-center shadow-2xs">
                  <HeartHandshake className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Personalized Care</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Care plans tailored to patient's needs</div>
              </div>

              {/* 3. Hygienic & Safe Practices */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 border border-teal-300 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Hygienic & Safe Practices</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Followed as per hospital standards</div>
              </div>

              {/* 4. Affordable & Transparent */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-2xs">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Affordable & Transparent</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">No hidden charges. Best value for care</div>
              </div>

              {/* 5. 24/7 Support & Monitoring */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-300 flex items-center justify-center shadow-2xs">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">24/7 Support & Monitoring</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">We are always here when you need us</div>
              </div>

            </div>

          </div>

          {/* RIGHT: HOW IT WORKS (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
            
            <h3 className="text-xs font-black text-[#0f2e5a] tracking-wider uppercase">
              HOW IT WORKS
            </h3>

            {/* 5 Step Flow with arrows */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center pt-1 relative">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs font-bold text-xs">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[9px] font-black text-blue-800">1</div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Contact Us</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Call or book online</div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs font-bold text-xs">
                  <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[9px] font-black text-blue-800">2</div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Share Details</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Share patient & service details</div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs font-bold text-xs">
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[9px] font-black text-blue-800">3</div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Schedule</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">We confirm the schedule</div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs font-bold text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[9px] font-black text-blue-800">4</div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">Care at Home</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Our professional reaches your home</div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-2xs font-bold text-xs">
                  <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[9px] font-black text-blue-800">5</div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">We Follow Up</div>
                <div className="text-[8.5px] text-slate-500 leading-tight">Regular follow-up & support</div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 5. BOTTOM FLOATING ASSISTANCE & AMBULANCE BANNER */}
      <section className="bg-[#0f2e5a] text-white py-4 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Ambulance Cutout + Call Helpline */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 bg-white/10 rounded-lg p-1 flex items-center justify-center shrink-0 border border-white/20">
              <img 
                src="/src/assets/images/ambulance_side_cutout_1787376350532.jpg" 
                alt="Ambulance" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                NEED IMMEDIATE ASSISTANCE?
              </div>
              <div className="text-xs text-slate-300">
                Call our 24/7 Helpline
              </div>
              <a 
                href="tel:08704210820" 
                className="text-base sm:text-lg font-black text-white hover:text-emerald-400 flex items-center gap-1.5 mt-0.5"
              >
                <Phone className="w-4 h-4 fill-current text-emerald-400" />
                <span>0870-4210820</span>
              </a>
            </div>
          </div>

          {/* Middle: 4 Circular Badge Icons */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-blue-100 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight">24/7 Service</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight">Quick Response</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight">Verified Caregivers</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight">Safe & Reliable</div>
              </div>
            </div>
          </div>

          {/* Right: WhatsApp Support Box */}
          <div className="bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors shrink-0 w-full md:w-auto">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-emerald-300 uppercase">WhatsApp Support</div>
              <a 
                href="https://wa.me/919000045073" 
                target="_blank" 
                rel="noreferrer"
                className="text-sm font-black text-white hover:text-emerald-200 block leading-tight"
              >
                9000045073
              </a>
              <div className="text-[9px] text-slate-300">Chat with our care coordinator</div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. SUCCESS BOOKING MODAL */}
      {successModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4 text-center">
            
            <button
              onClick={() => setSuccessModal({ open: false })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                Service Request Received
              </span>
              <h3 className="text-lg font-black text-[#0f2e5a] mt-2">Home Care Scheduled!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID: <strong className="text-slate-800">{successModal.bookingId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 text-left text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-800">{successModal.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-800">{successModal.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-800">{successModal.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date & Time:</span>
                <span className="font-bold text-emerald-700">{successModal.date} • {successModal.time}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Our Care Coordinator will call you shortly on <strong>{mobileNumber}</strong> to confirm your caregiver and arrival details.
            </p>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/919000045073?text=Hi%20Ayudh%20Vikas,%20I%20just%20booked%20Home%20Care%20(${successModal.bookingId})`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>Confirm on WhatsApp</span>
              </a>
              <button
                onClick={() => setSuccessModal({ open: false })}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. LEARN MORE SERVICE MODAL */}
      {selectedServiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <selectedServiceModal.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0f2e5a]">{selectedServiceModal.title}</h3>
                <span className="text-xs font-bold text-emerald-700">{selectedServiceModal.price}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedServiceModal.desc}
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Key Inclusions</div>
              <ul className="space-y-1 text-xs text-slate-700">
                {selectedServiceModal.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setServiceRequired(selectedServiceModal.title);
                  setSelectedServiceModal(null);
                  window.scrollTo({ top: 80, behavior: 'smooth' });
                }}
                className="flex-1 bg-[#006633] hover:bg-[#004d26] text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Book This Service
              </button>
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
