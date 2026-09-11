import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  Clock,
  XCircle,
  Users,
  Plus,
  Search,
  Bell,
  Mail,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  MapPin,
  Stethoscope,
  Activity,
  Heart,
  Baby,
  Sparkles,
  FlaskConical,
  Award,
  Filter,
  CheckCircle2,
  FileText,
  Phone,
  Building2,
  X,
  Share2,
  Download,
  AlertCircle,
  LogOut,
  ShieldCheck
} from 'lucide-react';

import { useLiveData } from '../context/LiveDataContext';
import { BrandLogo } from './BrandLogo';

interface AdminHealthCampsPageProps {
  onBackToDashboard?: () => void;
  onLogout?: () => void;
  embedded?: boolean;
}

interface HealthCampItem {
  id: string;
  name: string;
  category: string;
  location: string;
  district: string;
  date: string;
  time: string;
  organizedBy: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Ongoing';
  beneficiaries?: number;
  doctorsInvolved?: number;
  leadDoctor?: string;
  description?: string;
  venue?: string;
}

export const AdminHealthCampsPage: React.FC<AdminHealthCampsPageProps> = ({ onBackToDashboard, onLogout, embedded = false }) => {
  const { collections, create, update } = useLiveData();
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Completed' | 'Upcoming' | 'Cancelled' | 'Ongoing'>('All');
  const [statsDateRange, setStatsDateRange] = useState('01 May - 24 May 2024');

  // Interactive Modals
  const [showOrganizeModal, setShowOrganizeModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMapFullModal, setShowMapFullModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [selectedCampForView, setSelectedCampForView] = useState<HealthCampItem | null>(null);
  const [selectedCampForEdit, setSelectedCampForEdit] = useState<HealthCampItem | null>(null);
  const [activeMapPin, setActiveMapPin] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!collections.health_camps.length) return;
    const mapped = collections.health_camps.map((camp: any) => ({
      id: camp.id,
      name: camp.name || camp.title,
      category: camp.category || 'General Medicine',
      location: camp.location,
      district: camp.district,
      date: camp.date,
      time: camp.time || '9:00 AM - 1:00 PM',
      organizedBy: camp.organizedBy || 'Ayudh Vikas Foundation',
      status: camp.status || 'Upcoming',
      beneficiaries: camp.beneficiaries,
      doctorsInvolved: camp.doctorsInvolved,
      leadDoctor: camp.leadDoctor,
      description: camp.description,
      venue: camp.venue,
    }));
    setUpcomingCamps(mapped.filter((c: HealthCampItem) => c.status === 'Upcoming' || c.status === 'Ongoing'));
    setCompletedCamps(mapped.filter((c: HealthCampItem) => c.status === 'Completed' || c.status === 'Cancelled'));
  }, [collections.health_camps]);

  // State for upcoming camps list
  const [upcomingCamps, setUpcomingCamps] = useState<HealthCampItem[]>([
    {
      id: 'HC-UP-01',
      name: 'Free Diabetes Screening Camp',
      category: 'Diabetes & Metabolism',
      location: 'Mulugu, Warangal',
      district: 'Mulugu',
      date: '25 May 2024',
      time: '9:00 AM - 1:00 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      status: 'Upcoming',
      doctorsInvolved: 8,
      leadDoctor: 'Dr. Ravi Teja (Chief Endocrinologist)',
      venue: 'Govt High School Grounds, Mulugu',
      description: 'Comprehensive blood glucose fasting screening, HbA1c tests, diabetic foot examination, and dietary counselling for rural residents.'
    },
    {
      id: 'HC-UP-02',
      name: 'General Health Checkup Camp',
      category: 'General Medicine',
      location: 'Hanamkonda',
      district: 'Hanamkonda',
      date: '27 May 2024',
      time: '9:30 AM - 1:30 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      status: 'Upcoming',
      doctorsInvolved: 12,
      leadDoctor: 'Dr. S. K. Reddy (General Physician)',
      venue: 'Community Hall, Nakkalagutta, Hanamkonda',
      description: 'Full vitals check, BP monitoring, ECG screening, paediatric care, and free distribution of essential medications.'
    },
    {
      id: 'HC-UP-03',
      name: "Women's Health Awareness Camp",
      category: 'Gynecology & Maternal Care',
      location: 'Jangaon',
      district: 'Jangaon',
      date: '28 May 2024',
      time: '10:00 AM - 2:00 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      status: 'Upcoming',
      doctorsInvolved: 10,
      leadDoctor: 'Dr. Swapna Priya (Senior Gynaecologist)',
      venue: 'Town Municipal Hall, Jangaon Main Road',
      description: 'Maternal health education, anaemia screening, pap smears, breast examination awareness, and nutritional supplements distribution.'
    },
    {
      id: 'HC-UP-04',
      name: 'Eye Checkup Camp',
      category: 'Ophthalmology',
      location: 'Bhupalpally',
      district: 'Bhupalpally',
      date: '30 May 2024',
      time: '9:00 AM - 2:00 PM',
      organizedBy: 'Sri Sri Holistic Hospitals',
      status: 'Upcoming',
      doctorsInvolved: 6,
      leadDoctor: 'Dr. Rajesh Kumar (Ophthalmic Surgeon)',
      venue: 'Zilla Parishad High School, Bhupalpally',
      description: 'Refraction testing, cataract early detection, glaucoma check, and prescription of free reading spectacles.'
    },
    {
      id: 'HC-UP-05',
      name: 'Free Cardiology Camp',
      category: 'Cardiology',
      location: 'Warangal',
      district: 'Warangal',
      date: '01 Jun 2024',
      time: '9:00 AM - 1:00 PM',
      organizedBy: 'MGM Hospital, Warangal',
      status: 'Upcoming',
      doctorsInvolved: 14,
      leadDoctor: 'Dr. A. Srinivas (Consultant Cardiologist)',
      venue: 'MGM Hospital Outdoor Auditorium, Warangal',
      description: '12-lead ECG, 2D Echocardiography triage, hypertension screening, and cardiology specialist consultation.'
    }
  ]);

  // State for recent completed camps
  const [completedCamps, setCompletedCamps] = useState<HealthCampItem[]>([
    {
      id: 'HC-CMP-01',
      name: 'Orthopedic Camp',
      category: 'Orthopedics & Joint Care',
      location: 'Mulugu',
      district: 'Mulugu',
      date: '20 May 2024',
      time: '9:00 AM - 3:00 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      status: 'Completed',
      beneficiaries: 652,
      doctorsInvolved: 52,
      leadDoctor: 'Dr. K. V. Sharma (Orthopedic Specialist)',
      venue: 'Mulugu Primary Health Centre Grounds',
      description: 'Joint pain therapy, bone mineral density checks, posture correction, and free distribution of calcium supplements.'
    },
    {
      id: 'HC-CMP-02',
      name: 'Dental Checkup Camp',
      category: 'Dental & Oral Health',
      location: 'Warangal',
      district: 'Warangal',
      date: '19 May 2024',
      time: '9:30 AM - 2:00 PM',
      organizedBy: 'Kakatiya Dental College & Foundation',
      status: 'Completed',
      beneficiaries: 498,
      doctorsInvolved: 10,
      leadDoctor: 'Dr. Meenakshi (Dental Surgeon)',
      venue: 'Shambunipet Community Centre, Warangal',
      description: 'Dental cavity screening, scaling, oral hygiene education, and free distribution of dental care kits.'
    },
    {
      id: 'HC-CMP-03',
      name: 'Thyroid Screening Camp',
      category: 'Endocrinology',
      location: 'Hanamkonda',
      district: 'Hanamkonda',
      date: '18 May 2024',
      time: '8:30 AM - 1:30 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      status: 'Completed',
      beneficiaries: 580,
      doctorsInvolved: 9,
      leadDoctor: 'Dr. Harish Rao (Endocrinologist)',
      venue: 'Subedari Mandal Parishad Office, Hanamkonda',
      description: 'TSH blood sampling, thyroid nodule palpation, dietary guidance, and prescription management.'
    },
    {
      id: 'HC-CMP-04',
      name: 'General Health Camp',
      category: 'General Medicine & Paediatrics',
      location: 'Bhupalpally',
      district: 'Bhupalpally',
      date: '17 May 2024',
      time: '9:00 AM - 4:00 PM',
      organizedBy: 'Singareni Collieries & Ayudh Vikas',
      status: 'Completed',
      beneficiaries: 723,
      doctorsInvolved: 11,
      leadDoctor: 'Dr. V. Prasad (Chief Medical Officer)',
      venue: 'Singareni Workers Welfare Club, Bhupalpally',
      description: 'Mass health screening for coal miners and local families with multi-specialty triage and basic diagnostic tests.'
    },
    {
      id: 'HC-CMP-05',
      name: 'Diabetes Awareness Camp',
      category: 'Diabetes & Nutrition',
      location: 'Jangaon',
      district: 'Jangaon',
      date: '16 May 2024',
      time: '9:00 AM - 2:00 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      status: 'Completed',
      beneficiaries: 685,
      doctorsInvolved: 10,
      leadDoctor: 'Dr. K. Anjaneyulu (Physician)',
      venue: 'Zilla Parishad Meeting Hall, Jangaon',
      description: 'Random blood sugar tests, dietary charts, lifestyle risk assessment, and free metformin distribution for senior citizens.'
    }
  ]);

  // Form state for New Camp Modal
  const [newCamp, setNewCamp] = useState({
    name: '',
    category: 'Free Diabetes Screening Camp',
    location: 'Warangal',
    district: 'Warangal',
    date: '2024-06-05',
    time: '9:00 AM - 1:00 PM',
    organizedBy: 'Ayudh Vikas Foundation',
    venue: '',
    doctorsInvolved: 8,
    leadDoctor: 'Dr. Ravi Teja (Chief Endocrinologist)',
    description: ''
  });

  // Filtered upcoming camps
  const filteredUpcoming = upcomingCamps.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.organizedBy.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Upcoming') return matchesSearch && c.status === 'Upcoming';
    if (activeFilter === 'Completed') return false; // Handled in completed table
    if (activeFilter === 'Cancelled') return matchesSearch && c.status === 'Cancelled';
    return matchesSearch;
  });

  // Filtered completed camps
  const filteredCompleted = completedCamps.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.organizedBy.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Completed') return matchesSearch && c.status === 'Completed';
    if (activeFilter === 'Upcoming') return false;
    return matchesSearch;
  });

  // Map pin points (Telangana Locations)
  const mapPins = [
    { id: 'mulugu', name: 'Mulugu', top: '22%', left: '78%', camps: 8, beneficiaries: 1450, color: '#10b981' },
    { id: 'bhupalpally', name: 'Bhupalpally', top: '35%', left: '92%', camps: 6, beneficiaries: 1120, color: '#3b82f6' },
    { id: 'hanamkonda', name: 'Hanamkonda', top: '56%', left: '46%', camps: 12, beneficiaries: 2680, color: '#10b981' },
    { id: 'warangal', name: 'Warangal', top: '64%', left: '49%', camps: 14, beneficiaries: 3200, color: '#2563eb' },
    { id: 'kazipet', name: 'Kazipet', top: '52%', left: '32%', camps: 4, beneficiaries: 850, color: '#3b82f6' },
    { id: 'jangaon', name: 'Jangaon', top: '78%', left: '22%', camps: 7, beneficiaries: 1350, color: '#10b981' },
    { id: 'narsampet', name: 'Narsampet', top: '82%', left: '70%', camps: 5, beneficiaries: 980, color: '#3b82f6' },
    { id: 'mahabubabad', name: 'Mahabubabad', top: '72%', left: '86%', camps: 4, beneficiaries: 810, color: '#10b981' }
  ];

  const handleOrganizeCampSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamp.name.trim() || !newCamp.venue.trim()) {
      showToast('Please provide Camp Name and Venue details');
      return;
    }

    const created: HealthCampItem = {
      id: `HC-UP-${Date.now().toString().slice(-4)}`,
      name: newCamp.name,
      category: newCamp.category,
      location: `${newCamp.location}, Telangana`,
      district: newCamp.district,
      date: newCamp.date,
      time: newCamp.time,
      organizedBy: newCamp.organizedBy,
      status: 'Upcoming',
      doctorsInvolved: Number(newCamp.doctorsInvolved) || 6,
      leadDoctor: newCamp.leadDoctor,
      venue: newCamp.venue,
      description: newCamp.description || 'Community health camp organized with free doctor consultation and diagnostic testing.'
    };

    setUpcomingCamps(prev => [created, ...prev]);
    create('health_camps', { ...created, title: created.name }).catch(console.error);
    setShowOrganizeModal(false);
    showToast(`Health Camp "${newCamp.name}" scheduled successfully!`);
    setNewCamp({
      name: '',
      category: 'Free Diabetes Screening Camp',
      location: 'Warangal',
      district: 'Warangal',
      date: '2024-06-05',
      time: '9:00 AM - 1:00 PM',
      organizedBy: 'Ayudh Vikas Foundation',
      venue: '',
      doctorsInvolved: 8,
      leadDoctor: 'Dr. Ravi Teja (Chief Endocrinologist)',
      description: ''
    });
  };

  const handleSaveEditCamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampForEdit) return;

    setUpcomingCamps(prev => prev.map(item => item.id === selectedCampForEdit.id ? selectedCampForEdit : item));
    setCompletedCamps(prev => prev.map(item => item.id === selectedCampForEdit.id ? selectedCampForEdit : item));
    update('health_camps', selectedCampForEdit.id, selectedCampForEdit).catch(console.error);
    setSelectedCampForEdit(null);
    showToast(`Camp "${selectedCampForEdit.name}" updated successfully`);
  };

  return (
    <div className={embedded ? "space-y-4 w-full" : "min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white"}>
      
      {/* ========================================================================= */}
      {/* TOP APPLICATION BAR (Exact as screenshot) - Hidden in Embedded mode */}
      {/* ========================================================================= */}
      {!embedded && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Hamburger + Title + Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button 
                onClick={onBackToDashboard}
                className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Toggle Menu / Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-none">
                  Health Camps
                </h1>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <span 
                    onClick={onBackToDashboard} 
                    className="hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    Dashboard
                  </span>
                  <span>›</span>
                  <span className="text-slate-600 font-semibold">Health Camps</span>
                </div>
              </div>
            </div>

            {/* Center Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search camps by name, location..."
                  className="w-full pl-4 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" />
              </div>
            </div>

            {/* Right Action Icons & Profile Info */}
            <div className="flex items-center gap-3.5">
              
              {/* Notification Bell with '47' red badge */}
              <div className="relative">
                <button 
                  onClick={() => showToast('47 Unread System & Camp Alerts')}
                  className="text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    47
                  </span>
                </button>
              </div>

              {/* Email Icon with '9' red badge */}
              <div className="relative">
                <button 
                  onClick={() => showToast('9 Incoming Requests from Village Sarpanches')}
                  className="text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
                >
                  <Mail className="w-4.5 h-4.5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    9
                  </span>
                </button>
              </div>

              {/* Ayudh Vikas Brand Logo Pill with Chevron & Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <div 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity p-1 rounded-lg hover:bg-slate-50"
                >
                  <BrandLogo className="w-7 h-7 shadow-2xs" />
                  <div className="hidden lg:block text-left leading-tight">
                    <div className="text-[11px] font-black text-[#0b3c6d] uppercase tracking-wide">
                      AYUDH VIKAS
                    </div>
                    <div className="text-[9px] font-bold text-emerald-600">Super Administrator</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Profile / Admin Menu Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 rounded-lg mb-1">
                      <div className="text-xs font-black text-slate-900">Admin User</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">admin@ayudhvikasfoundation.org</div>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[9.5px] font-bold text-emerald-700">Super Administrator (Online)</span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          if (onBackToDashboard) onBackToDashboard();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Back to Full Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          showToast('Showing system configuration');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Camp Logistics & Resources</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowReportModal(true);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download Consolidated Reports</span>
                      </button>

                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setShowLogoutConfirmModal(true);
                          }}
                          className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-bold cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout Super Admin</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Super Admin Logout Button in Header */}
              <button
                onClick={() => setShowLogoutConfirmModal(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
                title="Log Out of Super Admin"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>

            </div>

          </div>
        </header>
      )}

      {/* Embedded Breadcrumb Banner */}
      {embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <span onClick={onBackToDashboard} className="hover:text-blue-600 cursor-pointer">Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700">Health Camps</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Health Camps Overview & Coordination
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search camps by name, location..."
                className="w-full pl-3.5 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => setShowOrganizeModal(true)}
              className="bg-[#00703c] hover:bg-[#005830] text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Organize New Camp</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN BODY VIEW */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 sm:p-5 space-y-4 max-w-7xl mx-auto w-full">
        
        {/* ======================================================================= */}
        {/* ROW 1: TOP 4 STAT CARDS + RIGHT ACTION & BENEFICIARIES CARD */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3.5 items-stretch">
          
          {/* Card 1: 42 Total Camps (Col 2.5) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-black text-slate-900 leading-none">42</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Total Camps</div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <span>↑ 16%</span>
                <span className="text-slate-400 font-normal">this month</span>
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button 
                onClick={() => { setActiveFilter('All'); showToast('Showing all 42 Health Camps'); }}
                className="text-[10.5px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Camps</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 2: 18 Completed (Col 2.5) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-black text-slate-900 leading-none">18</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Completed</div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <span>↑ 20%</span>
                <span className="text-slate-400 font-normal">this month</span>
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button 
                onClick={() => { setActiveFilter('Completed'); showToast('Filtered to 18 Completed Camps'); }}
                className="text-[10.5px] font-black text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Completed</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 3: 12 Upcoming (Col 2.5) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-black text-slate-900 leading-none">12</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Upcoming</div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <span>↑ 10%</span>
                <span className="text-slate-400 font-normal">this month</span>
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button 
                onClick={() => { setActiveFilter('Upcoming'); showToast('Filtered to 12 Upcoming Camps'); }}
                className="text-[10.5px] font-black text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Upcoming</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 4: 5 Cancelled (Col 2) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl font-black text-slate-900 leading-none">5</div>
              <div className="text-xs font-bold text-slate-600 mt-1">Cancelled</div>
              <div className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5 mt-0.5">
                <span>↓ 5%</span>
                <span className="text-slate-400 font-normal">this month</span>
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button 
                onClick={() => { setActiveFilter('Cancelled'); showToast('Showing 5 Cancelled/Postponed Camps'); }}
                className="text-[10.5px] font-black text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Cancelled</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Stack: "+ Organize New Camp" Button + Beneficiaries Card (Col 3) */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-2.5">
            
            {/* Dark Green Organize Button */}
            <button
              onClick={() => setShowOrganizeModal(true)}
              className="w-full bg-[#2e6848] hover:bg-[#25563b] text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-2xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Organize New Camp</span>
            </button>

            {/* 8,765 Total Beneficiaries Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-900 leading-tight">8,765</div>
                  <div className="text-[10.5px] font-bold text-slate-600">Total Beneficiaries</div>
                  <div className="text-[9.5px] font-bold text-emerald-600">↑ 18% this month</div>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(true)}
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>View Report</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>

        {/* ======================================================================= */}
        {/* ROW 2: UPCOMING HEALTH CAMPS (LEFT) + CAMP STATISTICS DONUT (RIGHT) */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT: Upcoming Health Camps Table (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900">Upcoming Health Camps</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Scheduled rural and suburban outreach programs</p>
                </div>

                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Calendar</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Camp Name</th>
                      <th className="pb-2 font-semibold">Location</th>
                      <th className="pb-2 font-semibold">Date & Time</th>
                      <th className="pb-2 font-semibold">Organized By</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUpcoming.map((camp, idx) => (
                      <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors group">
                        
                        {/* Camp Name with Category Icon */}
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <div className="text-slate-600 group-hover:text-blue-600 transition-colors shrink-0">
                              {idx === 0 && <Activity className="w-4 h-4 text-sky-600" />}
                              {idx === 1 && <Stethoscope className="w-4 h-4 text-emerald-600" />}
                              {idx === 2 && <Baby className="w-4 h-4 text-pink-600" />}
                              {idx === 3 && <Eye className="w-4 h-4 text-purple-600" />}
                              {idx === 4 && <Heart className="w-4 h-4 text-rose-600" />}
                              {idx > 4 && <Activity className="w-4 h-4 text-blue-600" />}
                            </div>
                            <span className="font-bold text-slate-800 text-[11px] leading-snug">
                              {camp.name}
                            </span>
                          </div>
                        </td>

                        {/* Location with Pin */}
                        <td className="py-2.5 pr-2 text-[11px] text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{camp.location}</span>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-2.5 pr-2 whitespace-nowrap">
                          <div className="font-bold text-slate-800 text-[10.5px]">{camp.date}</div>
                          <div className="text-[9.5px] text-slate-400 font-medium">{camp.time}</div>
                        </td>

                        {/* Organized By */}
                        <td className="py-2.5 pr-2 text-[11px] font-medium text-slate-600 whitespace-nowrap">
                          {camp.organizedBy}
                        </td>

                        {/* Status Pill */}
                        <td className="py-2.5 pr-2 whitespace-nowrap">
                          <span className="bg-sky-50 text-sky-700 text-[9.5px] font-bold px-2 py-0.5 rounded border border-sky-200/80">
                            Upcoming
                          </span>
                        </td>

                        {/* Actions (View Eye + Edit Pencil) */}
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedCampForView(camp)}
                              className="p-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer"
                              title="View Camp Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedCampForEdit(camp)}
                              className="p-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 transition-colors cursor-pointer"
                              title="Edit Camp Info"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="pt-2.5 mt-2 border-t border-slate-100">
              <button 
                onClick={() => { setActiveFilter('Upcoming'); showToast('Showing all upcoming health camps'); }}
                className="text-[11px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Upcoming Camps</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Camp Statistics Donut Chart + 2 Bottom Metric Cards (Col 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header with Date Range Dropdown */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs sm:text-sm font-black text-slate-900">Camp Statistics</h2>
                <div className="relative">
                  <select
                    value={statsDateRange}
                    onChange={(e) => setStatsDateRange(e.target.value)}
                    className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="01 May - 24 May 2024">01 May - 24 May 2024</option>
                    <option value="April 2024">April 2024</option>
                    <option value="Q1 2024">Q1 2024</option>
                  </select>
                </div>
              </div>

              {/* Donut Chart and Legend */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
                
                {/* SVG Donut Chart */}
                <div className="relative w-36 h-36 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#f1f5f9" strokeWidth="13" />
                    
                    {/* 1. Completed (18/42 = 42.86% -> dasharray ~97 226) - Green */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#2e7d32"
                      strokeWidth="13"
                      strokeDasharray="97 226"
                      strokeDashoffset="0"
                    />

                    {/* 2. Upcoming (12/42 = 28.57% -> dasharray ~65 226) - Blue */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#1e60db"
                      strokeWidth="13"
                      strokeDasharray="65 226"
                      strokeDashoffset="-97"
                    />

                    {/* 3. Cancelled (5/42 = 11.9% -> dasharray ~27 226) - Red */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="13"
                      strokeDasharray="27 226"
                      strokeDashoffset="-162"
                    />

                    {/* 4. Ongoing (7/42 = 16.67% -> dasharray ~37 226) - Orange/Amber */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="13"
                      strokeDasharray="37 226"
                      strokeDashoffset="-189"
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-slate-900 leading-none">42</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Total Camps</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2 text-xs w-full max-w-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]"></span>
                      <span className="font-bold text-slate-700">Completed</span>
                    </div>
                    <span className="font-black text-slate-900 text-[11px]">18 (42.86%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1e60db]"></span>
                      <span className="font-bold text-slate-700">Upcoming</span>
                    </div>
                    <span className="font-black text-slate-900 text-[11px]">12 (28.57%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                      <span className="font-bold text-slate-700">Cancelled</span>
                    </div>
                    <span className="font-black text-slate-900 text-[11px]">5 (11.90%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                      <span className="font-bold text-slate-700">Ongoing</span>
                    </div>
                    <span className="font-black text-slate-900 text-[11px]">7 (16.67%)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom 2 Mini Metric Cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 mt-1 border-t border-slate-100">
              
              {/* Metric 1: Total Beneficiaries */}
              <div className="bg-[#eff6ff] rounded-xl p-2.5 border border-blue-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9.5px] font-bold text-slate-600">Total Beneficiaries</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-slate-900">8,765</span>
                    <span className="text-[9.5px] font-bold text-emerald-600">↑ 18%</span>
                  </div>
                </div>
              </div>

              {/* Metric 2: Total Doctors Involved */}
              <div className="bg-[#eff6ff] rounded-xl p-2.5 border border-blue-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9.5px] font-bold text-slate-600">Total Doctors Involved</div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-slate-900">126</span>
                    <span className="text-[9.5px] font-bold text-emerald-600">↑ 16%</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================================= */}
        {/* ROW 3: RECENT COMPLETED CAMPS (LEFT) + CAMP LOCATIONS MAP (RIGHT) */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* LEFT: Recent Completed Camps Table (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900">Recent Completed Camps</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Post-camp clinical summaries and outreach impact</p>
                </div>

                <button 
                  onClick={() => { setActiveFilter('Completed'); showToast('Showing all completed camps'); }}
                  className="text-[11px] font-black text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 font-semibold">Camp Name</th>
                      <th className="pb-2 font-semibold">Location</th>
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold text-center">Beneficiaries</th>
                      <th className="pb-2 font-semibold text-center">Doctors Involved</th>
                      <th className="pb-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompleted.map((camp, idx) => (
                      <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors group">
                        
                        {/* Camp Name with Category Icon */}
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <div className="text-slate-600 group-hover:text-emerald-600 transition-colors shrink-0">
                              {idx === 0 && <Activity className="w-4 h-4 text-blue-600" />}
                              {idx === 1 && <Award className="w-4 h-4 text-emerald-600" />}
                              {idx === 2 && <FlaskConical className="w-4 h-4 text-purple-600" />}
                              {idx === 3 && <Stethoscope className="w-4 h-4 text-amber-600" />}
                              {idx === 4 && <Heart className="w-4 h-4 text-rose-600" />}
                              {idx > 4 && <Activity className="w-4 h-4 text-teal-600" />}
                            </div>
                            <span className="font-bold text-slate-800 text-[11px] leading-snug">
                              {camp.name}
                            </span>
                          </div>
                        </td>

                        {/* Location with Pin */}
                        <td className="py-2.5 pr-2 text-[11px] text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{camp.location}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 pr-2 text-[10.5px] font-bold text-slate-700 whitespace-nowrap">
                          {camp.date}
                        </td>

                        {/* Beneficiaries */}
                        <td className="py-2.5 pr-2 text-center font-black text-slate-900 text-[11px] whitespace-nowrap">
                          {camp.beneficiaries}
                        </td>

                        {/* Doctors Involved */}
                        <td className="py-2.5 pr-2 text-center font-bold text-slate-700 text-[11px] whitespace-nowrap">
                          {camp.doctorsInvolved}
                        </td>

                        {/* Actions (View Eye) */}
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCampForView(camp)}
                            className="p-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer"
                            title="View Camp Summary"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="pt-2.5 mt-2 border-t border-slate-100">
              <button 
                onClick={() => { setActiveFilter('Completed'); showToast('Showing all completed camps'); }}
                className="text-[11px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Completed Camps</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Camp Locations Map (Col 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900">Camp Locations</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Regional coverage across Telangana districts</p>
                </div>

                <button 
                  onClick={() => setShowMapFullModal(true)}
                  className="text-[11px] font-black text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  View Map
                </button>
              </div>

              {/* Styled Interactive Geographic Map Component */}
              <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-[#e5ece2] select-none">
                
                {/* SVG Map Terrain, Roads, Greenery and Water */}
                <svg className="w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
                  {/* Base Green / Land background */}
                  <rect width="500" height="300" fill="#e8eee3" />
                  
                  {/* Soft Forest Patches */}
                  <path d="M 380,20 Q 420,10 470,40 T 490,120 T 430,160 Z" fill="#d3e4cb" opacity="0.7" />
                  <path d="M 20,40 Q 60,10 100,50 T 80,120 T 10,100 Z" fill="#d3e4cb" opacity="0.7" />
                  <path d="M 360,220 Q 420,190 480,240 T 460,290 T 350,280 Z" fill="#d3e4cb" opacity="0.6" />

                  {/* Water bodies */}
                  <path d="M 400,210 C 420,230 430,260 410,280 C 390,290 380,270 390,240 Z" fill="#b9daf5" />
                  <path d="M 120,240 C 140,250 150,270 130,280 Z" fill="#b9daf5" />

                  {/* Highway Lines (Yellow / White Road Network) */}
                  <path d="M 40,260 L 160,230 L 260,180 L 360,120 L 460,70" stroke="#fbd38d" strokeWidth="5" fill="none" />
                  <path d="M 40,260 L 160,230 L 260,180 L 360,120 L 460,70" stroke="#f6ad55" strokeWidth="2.5" fill="none" />

                  <path d="M 260,30 L 260,180 L 290,290" stroke="#ffffff" strokeWidth="4" fill="none" strokeDasharray="6 3" />
                  <path d="M 110,80 L 260,180 L 420,240" stroke="#ffffff" strokeWidth="3" fill="none" />

                  {/* Road Shields */}
                  <rect x="235" y="60" width="16" height="10" rx="2" fill="#ecc94b" />
                  <text x="243" y="68" textAnchor="middle" className="text-[6px] fill-slate-900 font-bold">565</text>

                  <rect x="440" y="240" width="16" height="10" rx="2" fill="#ecc94b" />
                  <text x="448" y="248" textAnchor="middle" className="text-[6px] fill-slate-900 font-bold">365B</text>

                  <rect x="235" y="240" width="16" height="10" rx="2" fill="#ecc94b" />
                  <text x="243" y="248" textAnchor="middle" className="text-[6px] fill-slate-900 font-bold">163</text>

                  {/* Location Area Text Labels */}
                  <text x="170" y="45" className="text-[9px] fill-slate-600 font-black">Mulugu</text>
                  <text x="380" y="55" className="text-[9px] fill-slate-600 font-black">Mallampalli</text>
                  <text x="430" y="75" className="text-[9px] fill-slate-600 font-black">Bhupalpally</text>
                  <text x="180" y="145" className="text-[9px] fill-slate-600 font-black">Kazipet</text>
                  <text x="235" y="155" className="text-[10px] fill-slate-800 font-black">Hanamkonda</text>
                  <text x="235" y="195" className="text-[12px] fill-slate-900 font-black tracking-tight">Warangal</text>
                  <text x="75" y="245" className="text-[9px] fill-slate-600 font-black">Jangaon</text>
                  <text x="375" y="255" className="text-[9px] fill-slate-600 font-black">Narsampet</text>
                </svg>

                {/* Interactive Map Pins */}
                {mapPins.map(pin => (
                  <div
                    key={pin.id}
                    style={{ top: pin.top, left: pin.left }}
                    onClick={() => setActiveMapPin(activeMapPin === pin.id ? null : pin.id)}
                    className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group z-10"
                  >
                    {/* Blue Pin Icon from image */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-5 h-6 rounded-t-full rounded-b-none bg-[#1d4ed8] text-white flex items-center justify-center shadow-md group-hover:scale-125 transition-transform">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="w-1 h-1.5 bg-[#1d4ed8]"></div>
                    </div>

                    {/* Popover Card */}
                    {activeMapPin === pin.id && (
                      <div className="absolute bottom-8 -left-16 bg-white rounded-lg p-2 shadow-xl border border-slate-200 w-36 text-[10px] z-30 pointer-events-auto">
                        <div className="font-black text-slate-900">{pin.name} District</div>
                        <div className="text-blue-600 font-bold">{pin.camps} Camps Conducted</div>
                        <div className="text-slate-500 font-medium">{pin.beneficiaries} Beneficiaries</div>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </div>

            <div className="pt-2 text-[10.5px] text-slate-500 font-medium flex items-center justify-between">
              <span>Active Camps: Warangal, Mulugu, Hanamkonda</span>
              <button 
                onClick={() => showToast('Connecting to GIS Health Tracker...')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Live GPS Tracker
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* FOOTER (Exact copyright & terms from screenshot) */}
        {/* ======================================================================= */}
        <footer className="pt-4 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © 2024 Ayudh Vikas Health Care Network. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 font-bold text-slate-600">
            <button onClick={() => showToast('Ayudh Vikas Privacy Policy')} className="hover:text-blue-700 cursor-pointer">
              Privacy Policy
            </button>
            <span>|</span>
            <button onClick={() => showToast('Terms & Conditions')} className="hover:text-blue-700 cursor-pointer">
              Terms & Conditions
            </button>
            <span>|</span>
            <button onClick={() => showToast('24x7 Help & Support: 0870-4210820')} className="hover:text-blue-700 cursor-pointer">
              Help & Support
            </button>
          </div>
        </footer>

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: ORGANIZE NEW CAMP */}
      {/* ========================================================================= */}
      {showOrganizeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Organize New Health Camp</h3>
                  <p className="text-[10.5px] text-slate-500">Schedule rural & suburban outreach camp</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOrganizeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrganizeCampSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Camp Title / Subject *</label>
                <input
                  type="text"
                  required
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  placeholder="e.g. Mega Pediatric & Eye Screening Camp"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Camp Specialty *</label>
                  <select
                    value={newCamp.category}
                    onChange={(e) => setNewCamp({ ...newCamp, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="Free Diabetes Screening Camp">Diabetes Screening</option>
                    <option value="General Health Checkup Camp">General Medicine</option>
                    <option value="Free Cardiology Camp">Cardiology Screening</option>
                    <option value="Eye Checkup Camp">Eye Checkup & Cataract</option>
                    <option value="Orthopedic Camp">Orthopedic & Joint Care</option>
                    <option value="Dental Checkup Camp">Dental Checkup</option>
                    <option value="Women's Health Awareness Camp">Women's Health & Gyn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / Region *</label>
                  <select
                    value={newCamp.district}
                    onChange={(e) => setNewCamp({ ...newCamp, district: e.target.value, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="Warangal">Warangal</option>
                    <option value="Hanamkonda">Hanamkonda</option>
                    <option value="Mulugu">Mulugu</option>
                    <option value="Bhupalpally">Bhupalpally</option>
                    <option value="Jangaon">Jangaon</option>
                    <option value="Mahabubabad">Mahabubabad</option>
                    <option value="Karimnagar">Karimnagar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue / Exact Address *</label>
                <input
                  type="text"
                  required
                  value={newCamp.venue}
                  onChange={(e) => setNewCamp({ ...newCamp, venue: e.target.value })}
                  placeholder="e.g. ZP High School Grounds, Main Road, Mulugu"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Camp Date *</label>
                  <input
                    type="date"
                    required
                    value={newCamp.date}
                    onChange={(e) => setNewCamp({ ...newCamp, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                  >
                  </input>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot *</label>
                  <input
                    type="text"
                    value={newCamp.time}
                    onChange={(e) => setNewCamp({ ...newCamp, time: e.target.value })}
                    placeholder="9:00 AM - 1:00 PM"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organized By</label>
                  <input
                    type="text"
                    value={newCamp.organizedBy}
                    onChange={(e) => setNewCamp({ ...newCamp, organizedBy: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctors Deployed</label>
                  <input
                    type="number"
                    value={newCamp.doctorsInvolved}
                    onChange={(e) => setNewCamp({ ...newCamp, doctorsInvolved: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Medical Officer</label>
                <input
                  type="text"
                  value={newCamp.leadDoctor}
                  onChange={(e) => setNewCamp({ ...newCamp, leadDoctor: e.target.value })}
                  placeholder="e.g. Dr. Ravi Teja (Chief Medical Lead)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Camp Objectives & Details</label>
                <textarea
                  rows={2}
                  value={newCamp.description}
                  onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })}
                  placeholder="Free medicines, diagnostic screening, ambulance on standby..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 bg-slate-50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrganizeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2e6848] hover:bg-[#25563b] text-white rounded-lg font-black shadow-sm cursor-pointer"
                >
                  Confirm & Schedule Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW CAMP DETAILS */}
      {/* ========================================================================= */}
      {selectedCampForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{selectedCampForView.name}</h3>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                    selectedCampForView.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {selectedCampForView.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampForView(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Camp ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCampForView.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Date & Time:</span>
                  <span className="font-bold text-slate-900">{selectedCampForView.date} • {selectedCampForView.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-900">{selectedCampForView.location}</span>
                </div>
                {selectedCampForView.venue && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Venue:</span>
                    <span className="font-bold text-slate-900 text-right">{selectedCampForView.venue}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Organized By:</span>
                  <span className="font-bold text-slate-900">{selectedCampForView.organizedBy}</span>
                </div>
                {selectedCampForView.leadDoctor && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Lead Doctor:</span>
                    <span className="font-bold text-blue-700">{selectedCampForView.leadDoctor}</span>
                  </div>
                )}
                {selectedCampForView.beneficiaries !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Beneficiaries Screened:</span>
                    <span className="font-black text-emerald-700">{selectedCampForView.beneficiaries} Patients</span>
                  </div>
                )}
              </div>

              {selectedCampForView.description && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700">Clinical Scope & Activities:</span>
                  <p className="text-slate-600 text-[11.5px] mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedCampForView.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => showToast(`Exporting full report for ${selectedCampForView.name}...`)}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>

              <button
                onClick={() => setSelectedCampForView(null)}
                className="bg-[#0f2e5a] hover:bg-[#183d73] text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT CAMP */}
      {/* ========================================================================= */}
      {selectedCampForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Edit Health Camp</h3>
                  <p className="text-[10.5px] text-slate-500">{selectedCampForEdit.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampForEdit(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCamp} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Camp Name</label>
                <input
                  type="text"
                  value={selectedCampForEdit.name}
                  onChange={(e) => setSelectedCampForEdit({ ...selectedCampForEdit, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={selectedCampForEdit.date}
                    onChange={(e) => setSelectedCampForEdit({ ...selectedCampForEdit, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={selectedCampForEdit.time}
                    onChange={(e) => setSelectedCampForEdit({ ...selectedCampForEdit, time: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={selectedCampForEdit.location}
                  onChange={(e) => setSelectedCampForEdit({ ...selectedCampForEdit, location: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Organized By</label>
                <input
                  type="text"
                  value={selectedCampForEdit.organizedBy}
                  onChange={(e) => setSelectedCampForEdit({ ...selectedCampForEdit, organizedBy: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCampForEdit(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CALENDAR VIEW */}
      {/* ========================================================================= */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Health Camps Calendar</h3>
                  <p className="text-[10.5px] text-slate-500">May - June 2024 Schedule</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCalendarModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Calendar grid preview */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] pb-1 border-b border-slate-100">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const isCampDay = [16, 17, 18, 19, 20, 25, 27, 28, 30].includes(day);
                  const isToday = day === 24;
                  return (
                    <div
                      key={day}
                      onClick={() => isCampDay && showToast(`Camp scheduled on May ${day}, 2024`)}
                      className={`p-2 rounded-lg font-bold transition-all ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isCampDay
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-pointer hover:scale-105'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>{day}</div>
                      {isCampDay && <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mx-auto mt-0.5"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3 text-[10.5px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">Camp Scheduled</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-slate-600 font-medium">Today</span>
                </div>
              </div>

              <button
                onClick={() => setShowCalendarModal(false)}
                className="bg-[#0f2e5a] hover:bg-[#183d73] text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: BENEFICIARY REPORT EXPORT */}
      {/* ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Health Camp Impact Report</h3>
                  <p className="text-[10.5px] text-slate-500">Consolidated rural patient metrics</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold text-purple-950">
                  <span>Total Beneficiaries:</span>
                  <span className="text-base font-black">8,765</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Telangana Districts Covered:</span>
                  <span className="font-bold">6 Districts (Warangal cluster)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Free Medicines Distributed:</span>
                  <span className="font-bold">₹ 14.8 Lakhs worth</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Emergency Hospital Referrals:</span>
                  <span className="font-bold text-blue-700">142 Cases to MGM/Apollo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  showToast('Impact Report CSV downloaded');
                  setShowReportModal(false);
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-black text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Impact CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Log Out of Super Admin?</h3>
              <p className="text-xs text-slate-500">
                You will be signed out of your administrator account and returned to the public portal.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800">Admin User</div>
              <div className="text-slate-400">admin@ayudhvikasfoundation.org</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowLogoutConfirmModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirmModal(false);
                  if (onLogout) {
                    onLogout();
                  } else if (onBackToDashboard) {
                    onBackToDashboard();
                  }
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST POPUP */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
