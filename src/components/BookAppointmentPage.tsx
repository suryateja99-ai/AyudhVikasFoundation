import React, { useState } from 'react';
import { 
  HeartPulse, 
  Phone, 
  Search, 
  Calendar, 
  Clock, 
  Star, 
  Building2, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Bell, 
  Headphones, 
  RotateCcw, 
  ChevronDown, 
  Check, 
  User, 
  Video, 
  Building,
  CheckCircle2,
  X,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { ActiveModal } from '../types';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';

interface BookAppointmentPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onSignInClick: () => void;
  onSelectDoctorToBook?: (doctorName: string, hospital: string, date: string, fee: string) => void;
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
  hideHeader?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualifications: string;
  hospital: string;
  district: string;
  rating: number;
  reviewsCount: number;
  experience: string;
  consultationFee: number;
  image: string;
  consultationType: 'both' | 'in_person' | 'video';
  availableSlots: {
    day: string;
    date: string;
    month: string;
    isToday?: boolean;
    slots: string[];
  }[];
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  onBackToHome,
  onOpenModal,
  onSignInClick,
  onSelectDoctorToBook,
  isLoggedIn = false,
  userProfile = {
    name: 'Ramesh Kumar',
    displayName: 'Ramesh K.',
    patientId: 'AVP100245',
    image: '/src/assets/images/patient_avatar_1787229395408.jpg',
    phone: '',
    email: ''
  },
  onNavigateDashboard,
  onLogout,
  hideHeader = false
}) => {
  const { collections, create } = useLiveData();
  const { user, isGuest } = useAuth();
  // Filter States
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-08-24');
  const [consultationType, setConsultationType] = useState<'in_person' | 'video'>('in_person');
  const [sortBy, setSortBy] = useState('next_available');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Interactive booking state
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<{ [doctorId: string]: number }>({
    'doc-1': 0,
    'doc-2': 0,
    'doc-3': 0,
    'doc-4': 0,
  });

  const [bookingSuccessModal, setBookingSuccessModal] = useState<{
    open: boolean;
    doctorName: string;
    hospital: string;
    date: string;
    slot: string;
    fee: number;
  }>({
    open: false,
    doctorName: '',
    hospital: '',
    date: '',
    slot: '',
    fee: 0
  });

  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState<Doctor | null>(null);

  // Doctors Database matching the screenshot + extended entries for smooth scrolling
  const initialDoctors: Doctor[] = [
    {
      id: 'doc-1',
      name: 'Dr. Ravi Teja',
      speciality: 'Cardiologist',
      qualifications: 'MBBS, MD (General Medicine), DM (Cardiology)',
      hospital: 'MGM Hospital, Warangal',
      district: 'Warangal',
      rating: 4.8,
      reviewsCount: 256,
      experience: '15+ Years Experience',
      consultationFee: 800,
      image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['10:00 AM', '11:30 AM', '04:00 PM', '06:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['09:30 AM', '12:00 PM', '03:30 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['11:00 AM', '01:00 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['10:00 AM', '02:30 PM', '05:00 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['09:00 AM', '11:30 AM', '04:30 PM'] },
      ]
    },
    {
      id: 'doc-2',
      name: 'Dr. Anusha Reddy',
      speciality: 'Gynecologist',
      qualifications: 'MBBS, MS (OBG), DNB (OBG)',
      hospital: 'KIMS Hospital, Warangal',
      district: 'Warangal',
      rating: 4.7,
      reviewsCount: 189,
      experience: '12+ Years Experience',
      consultationFee: 700,
      image: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['10:30 AM', '01:00 PM', '05:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['10:00 AM', '12:30 PM', '04:00 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['11:30 AM', '02:00 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['09:30 AM', '03:00 PM', '06:30 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['10:00 AM', '01:30 PM', '05:00 PM'] },
      ]
    },
    {
      id: 'doc-3',
      name: 'Dr. Prakash Kumar',
      speciality: 'Orthopedic Surgeon',
      qualifications: 'MBBS, MS (Orthopedics)',
      hospital: 'CARE Hospitals, Warangal',
      district: 'Warangal',
      rating: 4.6,
      reviewsCount: 142,
      experience: '10+ Years Experience',
      consultationFee: 600,
      image: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['11:00 AM', '03:00 PM', '05:30 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['10:00 AM', '01:00 PM', '04:30 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['12:00 PM', '02:30 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['10:30 AM', '02:00 PM', '06:00 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['09:30 AM', '12:00 PM', '04:00 PM'] },
      ]
    },
    {
      id: 'doc-4',
      name: 'Dr. Shruthi Menon',
      speciality: 'Pediatrician',
      qualifications: 'MBBS, DCH (Paediatrics)',
      hospital: 'Rainbow Children\'s Hospital, Warangal',
      district: 'Warangal',
      rating: 4.9,
      reviewsCount: 210,
      experience: '8+ Years Experience',
      consultationFee: 600,
      image: '/src/assets/images/doctor_shruthi_menon_1787230394773.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['09:30 AM', '11:00 AM', '03:30 PM', '05:30 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['10:00 AM', '12:00 PM', '04:00 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['11:00 AM', '01:30 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['09:00 AM', '02:00 PM', '05:00 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['10:30 AM', '01:00 PM', '04:30 PM'] },
      ]
    },
    {
      id: 'doc-5',
      name: 'Dr. Sandeep Varma',
      speciality: 'Neurologist',
      qualifications: 'MBBS, MD, DM (Neurology)',
      hospital: 'Yashoda Hospitals, Hanamkonda',
      district: 'Hanamkonda',
      rating: 4.8,
      reviewsCount: 175,
      experience: '14+ Years Experience',
      consultationFee: 900,
      image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['11:30 AM', '04:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['10:00 AM', '02:00 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['11:00 AM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['09:30 AM', '03:30 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['10:00 AM', '05:00 PM'] },
      ]
    },
    {
      id: 'doc-6',
      name: 'Dr. Radhika Sharma',
      speciality: 'General Physician',
      qualifications: 'MBBS, MD (Internal Medicine)',
      hospital: 'Apollo Hospitals, Warangal',
      district: 'Warangal',
      rating: 4.9,
      reviewsCount: 310,
      experience: '16+ Years Experience',
      consultationFee: 500,
      image: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '06:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['09:30 AM', '01:00 PM', '04:00 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['10:30 AM', '01:00 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['09:00 AM', '03:00 PM', '05:30 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['10:00 AM', '02:00 PM', '06:00 PM'] },
      ]
    },
    {
      id: 'doc-7',
      name: 'Dr. Harish Rao',
      speciality: 'Cardiologist',
      qualifications: 'MBBS, MD, DM (Interventional Cardiology)',
      hospital: 'CARE Hospitals, Warangal',
      district: 'Warangal',
      rating: 4.9,
      reviewsCount: 290,
      experience: '18+ Years Experience',
      consultationFee: 850,
      image: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['10:00 AM', '02:00 PM', '05:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['11:00 AM', '03:30 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['10:30 AM', '01:30 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['09:00 AM', '04:00 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['11:00 AM', '06:00 PM'] },
      ]
    },
    {
      id: 'doc-8',
      name: 'Dr. Swathi Reddy',
      speciality: 'Gynecologist',
      qualifications: 'MBBS, MS (OBG), Laparoscopic Surgeon',
      hospital: 'Yashoda Hospitals, Hanamkonda',
      district: 'Hanamkonda',
      rating: 4.8,
      reviewsCount: 215,
      experience: '11+ Years Experience',
      consultationFee: 750,
      image: '/src/assets/images/doctor_shruthi_menon_1787230394773.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['09:30 AM', '01:30 PM', '04:30 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['10:00 AM', '02:30 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['11:00 AM', '03:00 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['09:30 AM', '05:00 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['10:30 AM', '04:00 PM'] },
      ]
    },
    {
      id: 'doc-9',
      name: 'Dr. Srikanth Goud',
      speciality: 'Orthopedic Surgeon',
      qualifications: 'MBBS, MS (Ortho), Joint Replacement Specialist',
      hospital: 'MGM Hospital, Warangal',
      district: 'Warangal',
      rating: 4.7,
      reviewsCount: 165,
      experience: '13+ Years Experience',
      consultationFee: 650,
      image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['10:00 AM', '12:30 PM', '05:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['09:00 AM', '01:30 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['10:30 AM', '02:00 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['11:00 AM', '04:30 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['09:30 AM', '03:00 PM'] },
      ]
    },
    {
      id: 'doc-10',
      name: 'Dr. Deepa Nair',
      speciality: 'Pediatrician',
      qualifications: 'MBBS, MD (Pediatrics), Neonatologist',
      hospital: 'KIMS Hospital, Warangal',
      district: 'Warangal',
      rating: 4.9,
      reviewsCount: 278,
      experience: '15+ Years Experience',
      consultationFee: 700,
      image: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
      consultationType: 'both',
      availableSlots: [
        { day: 'Today', date: '24', month: 'May', isToday: true, slots: ['10:30 AM', '02:00 PM', '06:00 PM'] },
        { day: 'Sat', date: '25', month: 'May', slots: ['09:30 AM', '01:00 PM'] },
        { day: 'Sun', date: '26', month: 'May', slots: ['11:00 AM', '02:30 PM'] },
        { day: 'Mon', date: '27', month: 'May', slots: ['10:00 AM', '05:00 PM'] },
        { day: 'Tue', date: '28', month: 'May', slots: ['09:00 AM', '03:30 PM'] },
      ]
    }
  ];

  const doctorsSource: Doctor[] = (collections.doctors.length ? collections.doctors : initialDoctors).map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    speciality: doc.speciality,
    qualifications: doc.qualifications || doc.qualification || '',
    hospital: doc.hospital || doc.hospitalName || '',
    district: doc.district || '',
    rating: doc.rating || 4.8,
    reviewsCount: doc.reviewsCount || 120,
    experience: doc.experience || `${doc.experienceYears || 10}+ Years Experience`,
    consultationFee: doc.consultationFee || 500,
    image: doc.image || '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
    consultationType: doc.consultationType || 'both',
    availableSlots: doc.availableSlots || [
      { day: 'Today', date: '29', month: 'Aug', isToday: true, slots: ['10:00 AM', '04:00 PM'] },
    ],
  }));

  // Filtering doctors
  const filteredDoctors = doctorsSource.filter(doc => {
    if (selectedSpeciality && doc.speciality !== selectedSpeciality) return false;
    if (selectedDistrict && doc.district !== selectedDistrict) return false;
    if (selectedHospital && !doc.hospital.toLowerCase().includes(selectedHospital.toLowerCase())) return false;
    return true;
  });

  const handleResetFilters = () => {
    setSelectedSpeciality('');
    setSelectedDistrict('');
    setSelectedHospital('');
    setSelectedDate('2026-08-24');
    setConsultationType('in_person');
  };

  const handleBookClick = async (doctor: Doctor) => {
    if (isGuest) {
      onOpenModal('register_patient');
      return;
    }
    const slotIdx = selectedSlotIndex[doctor.id] || 0;
    const selectedSlotDay = doctor.availableSlots?.[slotIdx] || doctor.availableSlots?.[0];
    const slotTime = selectedSlotDay?.slots?.[0] || '10:00 AM';
    const dateLabel = selectedSlotDay
      ? `${selectedSlotDay.date} ${selectedSlotDay.month} (${selectedSlotDay.day})`
      : 'Next available';

    try {
      await create('appointments', {
        patientName: user?.name || userProfile.name,
        patientId: user?.patientId || userProfile.patientId,
        phone: user?.phone || userProfile.phone,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospital: doctor.hospital,
        hospitalId: (doctor as any).hospitalId,
        speciality: doctor.speciality,
        appointmentDate: dateLabel,
        appointmentTime: slotTime,
        consultationFee: doctor.consultationFee,
        consultationType,
        status: 'Pending',
        visitType: 'Consultation',
        reason: `${doctor.speciality} consultation`,
      });
    } catch (err) {
      console.error(err);
    }
    
    setBookingSuccessModal({
      open: true,
      doctorName: doctor.name,
      hospital: doctor.hospital,
      date: dateLabel,
      slot: slotTime,
      fee: doctor.consultationFee
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* 1. TOP EMERGENCY HELP LINE (Dark Bar) & MAIN HEADER */}
      {!hideHeader && (
        <>
          <div className="bg-[#051124] text-white px-4 sm:px-8 py-1 flex items-center justify-end text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Emergency Help Line</span>
              <span className="text-red-400 font-black flex items-center gap-1">
                <Phone className="w-3 h-3 fill-current" /> 24/7
              </span>
            </div>
          </div>

      {/* 2. MAIN HEADER / NAVBAR */}
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

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">Home</button>
            <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">About Us</button>
            <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">Services</button>
            <button className="text-emerald-700 font-extrabold cursor-pointer border-b-2 border-emerald-600 pb-0.5">Doctors</button>
            <button onClick={onBackToHome} className="hover:text-emerald-600 transition-colors cursor-pointer">Hospitals</button>
            <button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-600 transition-colors cursor-pointer">Health Camps</button>
            <button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-600 transition-colors cursor-pointer">Membership</button>
            <button onClick={() => onOpenModal('emergency_help')} className="hover:text-emerald-600 transition-colors cursor-pointer">Contact Us</button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Dashboard Shortcut Button */}
                <button 
                  onClick={onNavigateDashboard || onBackToHome}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Go to Patient Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">My Dashboard</span>
                </button>

                {/* Patient Profile Dropdown / Pill */}
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
      )}

      {/* 3. HERO BANNER: "Book Doctor Appointment" + Stats Overlaid */}
      <section className="relative bg-gradient-to-r from-[#e8f1fa] via-[#e3f0fb] to-[#d8eaf8] border-b border-slate-200 overflow-hidden">
        
        {/* Background Doctor image blended on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 lg:opacity-60 pointer-events-none hidden sm:block">
          <img 
            src="/src/assets/images/doctor_hero_bg_1787230335675.jpg" 
            alt="Doctor Banner" 
            className="w-full h-full object-cover object-center mix-blend-multiply"
          />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Title & Subheading (6 cols) */}
            <div className="lg:col-span-6 space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2e5a] tracking-tight">
                Book Doctor Appointment
              </h1>
              <p className="text-sm sm:text-base font-bold text-slate-600">
                Find the right doctor and book an appointment easily
              </p>
            </div>

            {/* 4 Stat Boxes (6 cols) */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Stat 1 */}
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none">500+</div>
                <div className="text-[10px] font-bold text-slate-600 mt-0.5">Expert Doctors</div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none">100+</div>
                <div className="text-[10px] font-bold text-slate-600 mt-0.5">Partner Hospitals</div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none">24/7</div>
                <div className="text-[10px] font-bold text-slate-600 mt-0.5">Support</div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none">6</div>
                <div className="text-[10px] font-bold text-slate-600 mt-0.5">Districts Covered</div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT: 2-COLUMN LAYOUT (Filters Left 3.5 Cols, Doctor List Right 8.5 Cols) */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-7 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: FILTERS + NEED HELP (Sticky on desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            
            {/* Filter Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Card Header: Navy Blue */}
              <div className="bg-[#0f2e5a] text-white px-5 py-3 text-center">
                <h3 className="text-sm font-black uppercase tracking-wide">
                  Find Your Doctor
                </h3>
              </div>

              {/* Form Controls */}
              <div className="p-4 sm:p-5 space-y-4">
                
                {/* 1. Specialization */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Specialization</label>
                  <div className="relative">
                    <select
                      value={selectedSpeciality}
                      onChange={(e) => setSelectedSpeciality(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer pr-8"
                    >
                      <option value="">Select Specialization</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="General Physician">General Physician</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Select District */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Select District</label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer pr-8"
                    >
                      <option value="">Select District</option>
                      <option value="Warangal">Warangal</option>
                      <option value="Hanamkonda">Hanamkonda</option>
                      <option value="Karimnagar">Karimnagar</option>
                      <option value="Mulugu">Mulugu</option>
                      <option value="Bhupalpally">Bhupalpally</option>
                      <option value="Mahabubabad">Mahabubabad</option>
                      <option value="Jangaon">Jangaon</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Select Hospital */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Select Hospital</label>
                  <div className="relative">
                    <select
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer pr-8"
                    >
                      <option value="">Select Hospital</option>
                      <option value="MGM Hospital">MGM Hospital, Warangal</option>
                      <option value="KIMS Hospital">KIMS Hospital, Warangal</option>
                      <option value="CARE Hospitals">CARE Hospitals, Warangal</option>
                      <option value="Rainbow Children's Hospital">Rainbow Children's Hospital</option>
                      <option value="Yashoda Hospitals">Yashoda Hospitals</option>
                      <option value="Apollo Hospitals">Apollo Hospitals</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Date */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* 5. Consultation Type */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-700">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultationType('in_person')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        consultationType === 'in_person'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs ring-1 ring-emerald-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>In-Person</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('video')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        consultationType === 'video'
                          ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-2xs ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Video Consultation</span>
                    </button>
                  </div>
                </div>

                {/* Submit Search Button */}
                <button
                  type="button"
                  className="w-full bg-[#00703c] hover:bg-[#005830] active:bg-[#004224] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Search Doctors</span>
                  <Search className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Reset Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Reset</span>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>

            {/* Need Help Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">Need Help?</h4>
                  <p className="text-[10px] font-bold text-slate-500">Call our 24/7 Support Team</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1">
                <a 
                  href="tel:08704210820"
                  className="flex items-center gap-1.5 text-blue-800 hover:text-blue-950 font-black"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-700" />
                  <span>0870-4210820</span>
                </a>

                <a 
                  href="https://wa.me/919000045073" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-black"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                  <span>9000045073</span>
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: DOCTORS LIST WITH INNER SCROLLING CONTAINER */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Top Bar: Count & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                  Showing <span className="text-[#00703c] font-black">{filteredDoctors.length} Doctors</span>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Scroll for more ↓
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer pr-7"
                  >
                    <option value="next_available">Next Available</option>
                    <option value="highest_rated">Highest Rated</option>
                    <option value="experience">Experience</option>
                    <option value="fee_low">Consultation Fee (Low to High)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* INNER SCROLLING CONTAINER FOR DOCTORS */}
            <div 
              className="max-h-[640px] xl:max-h-[720px] overflow-y-auto pr-1.5 pb-4 space-y-3.5 scroll-smooth divide-y divide-transparent focus:outline-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f8fafc'
              }}
            >
              {filteredDoctors.map((doc) => {
                const activeSlotIdx = selectedSlotIndex[doc.id] || 0;

                return (
                  <div 
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    
                    {/* 3-Part Layout: 1. Doctor Bio (Left), 2. Next Available Slots + Fee (Middle), 3. Action Buttons (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center w-full">
                      
                      {/* Part 1: Doctor Bio (Left 5 cols) */}
                      <div className="lg:col-span-5 flex items-start gap-3.5">
                        {/* Doctor Avatar with Active Green Dot */}
                        <div className="relative shrink-0">
                          <img 
                            src={doc.image} 
                            alt={doc.name} 
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                          <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        {/* Doctor Bio Details */}
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-[#0f2e5a]">
                              {doc.name}
                            </h3>
                            <span className="bg-[#e8f0fe] text-[#1a73e8] text-[10px] font-bold px-2 py-0.5 rounded">
                              {doc.speciality}
                            </span>
                          </div>

                          <p className="text-[11px] font-semibold text-slate-600">
                            {doc.qualifications}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{doc.hospital}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 pt-0.5">
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{doc.rating} ({doc.reviewsCount} Reviews)</span>
                            </div>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-600 font-semibold">{doc.experience}</span>
                          </div>
                        </div>
                      </div>

                      {/* Part 2: Next Available Slots & Fee (Middle 4.5 cols) */}
                      <div className="lg:col-span-4 flex flex-col justify-center space-y-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                        <span className="text-xs font-bold text-slate-800 block">
                          Next Available Slots
                        </span>
                        
                        {/* 5 Date Boxes */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                          {doc.availableSlots.map((slotDay, idx) => {
                            const isSelected = activeSlotIdx === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedSlotIndex(prev => ({ ...prev, [doc.id]: idx }));
                                }}
                                className={`flex flex-col items-center justify-center min-w-[46px] py-1.5 px-1 rounded-md border text-center transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-600' 
                                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-white'
                                }`}
                              >
                                <span className="text-xs font-black leading-none">{slotDay.date}</span>
                                <span className="text-[9px] font-semibold text-slate-600 uppercase mt-0.5 leading-none">{slotDay.month}</span>
                                <span className="text-[9px] font-medium text-slate-500 leading-none mt-0.5">{slotDay.day}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Consultation Fee & Time */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Consultation Fee: <span className="font-black">₹{doc.consultationFee}</span></span>
                        </div>
                      </div>

                      {/* Part 3: Action Buttons (Right 2.5 cols) */}
                      <div className="lg:col-span-3 flex flex-col gap-2 w-full lg:w-44 ml-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                        <button
                          onClick={() => handleBookClick(doc)}
                          className="bg-[#00703c] hover:bg-[#005830] active:bg-[#004224] text-white text-xs font-black uppercase py-2.5 px-4 rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Book Appointment</span>
                        </button>

                        <button
                          onClick={() => setSelectedDoctorProfile(doc)}
                          className="border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold py-1.5 px-4 rounded-md transition-all text-center cursor-pointer hover:bg-slate-50"
                        >
                          View Profile
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </main>

      {/* 5. BOTTOM FEATURE STRIP (Footer Row) */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left 4 Trust Badges (8 Cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* 1. Easy Booking */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">Easy Booking</div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Book appointments in just a few clicks
                </p>
              </div>
            </div>

            {/* 2. Secure & Safe */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">Secure & Safe</div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Your health information is always protected
                </p>
              </div>
            </div>

            {/* 3. Timely Reminders */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">Timely Reminders</div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Get appointment reminders via SMS & WhatsApp
                </p>
              </div>
            </div>

            {/* 4. 24/7 Support */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">24/7 Support</div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  We are here to help you anytime, anywhere
                </p>
              </div>
            </div>

          </div>

          {/* Right Emergency Box (4 Cols) */}
          <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-600 uppercase">Emergency Assistance</div>
              <div className="text-[11px] font-medium text-slate-500">Call our 24/7 Emergency Help Line</div>
              <a href="tel:08704210820" className="text-sm font-black text-[#0f2e5a] hover:text-red-700 tracking-wide">
                0870-4210820
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* 6. BOOKING CONFIRMATION MODAL */}
      {bookingSuccessModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Appointment Booked!</h3>
              <p className="text-xs font-semibold text-slate-600">
                Your consultation request has been confirmed with Ayudh Vikas Care Coordination.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Doctor:</span>
                <span className="text-slate-900 font-black">{bookingSuccessModal.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Hospital:</span>
                <span className="text-slate-900 font-semibold">{bookingSuccessModal.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Date & Time:</span>
                <span className="text-emerald-700 font-black">{bookingSuccessModal.date} at {bookingSuccessModal.slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Consultation Fee:</span>
                <span className="text-slate-900 font-black">₹{bookingSuccessModal.fee}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500 font-bold">Status:</span>
                <span className="text-emerald-600 font-black flex items-center gap-1">
                  <Check className="w-3 h-3" /> Confirmed
                </span>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-500 font-medium">
              A confirmation SMS and WhatsApp message have been sent to your registered mobile number.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBookingSuccessModal(prev => ({ ...prev, open: false }))}
                className="flex-1 bg-[#00703c] hover:bg-[#005830] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOCTOR PROFILE VIEW MODAL */}
      {selectedDoctorProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSelectedDoctorProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedDoctorProfile.image}
                alt={selectedDoctorProfile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedDoctorProfile.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-black px-2 py-0.5 rounded">
                  {selectedDoctorProfile.speciality}
                </span>
                <p className="text-xs text-slate-600 font-semibold mt-1">{selectedDoctorProfile.qualifications}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-slate-200 py-3">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Hospital:</span>
                <span className="text-slate-900 font-bold">{selectedDoctorProfile.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Experience:</span>
                <span className="text-slate-900 font-bold">{selectedDoctorProfile.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Rating:</span>
                <span className="text-amber-600 font-black">★ {selectedDoctorProfile.rating} ({selectedDoctorProfile.reviewsCount} Patient Reviews)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Consultation Fee:</span>
                <span className="text-slate-900 font-black">₹{selectedDoctorProfile.consultationFee}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const doc = selectedDoctorProfile;
                  setSelectedDoctorProfile(null);
                  handleBookClick(doc);
                }}
                className="flex-1 bg-[#00703c] hover:bg-[#005830] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Book Appointment Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
