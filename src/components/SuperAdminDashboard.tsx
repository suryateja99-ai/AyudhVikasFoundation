import React, { useEffect, useState } from 'react';
import { AdminHealthCampsPage } from './AdminHealthCampsPage';
import { AdminRoleManagement } from './AdminRoleManagement';
import { DoctorVerificationPanel } from './DoctorVerificationPanel';
import { HospitalVerificationPanel } from './HospitalVerificationPanel';
import { useLiveData } from '../context/LiveDataContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ADMIN_NAV_PATHS } from '../lib/roleRoutes';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  Building2,
  Handshake,
  Megaphone,
  Ambulance,
  FlaskConical,
  Tent,
  Calendar,
  CalendarDays,
  Clock,
  ClipboardList,
  MessageSquareText,
  AlertOctagon,
  Newspaper,
  Mail,
  Send,
  Globe,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  Filter,
  Download,
  Share2,
  HardDrive,
  Radio,
  Server,
  Database,
  Lock,
  Eye,
  Trash2,
  Edit,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  initialNav?: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onLogout,
  onNavigateHome,
  initialNav = 'Dashboard'
}) => {
  const navigate = useNavigate();
  const { collections, create, update, remove, stats } = useLiveData();
  // Navigation & Sub-section states
  const [activeNav, setActiveNav] = useState(initialNav);

  const goNav = (nav: string) => {
    setActiveNav(nav);
    const path = ADMIN_NAV_PATHS[nav];
    if (path) navigate(path);
  };

  useEffect(() => {
    if (initialNav) setActiveNav(initialNav);
  }, [initialNav]);
  const [expandedSection, setExpandedSection] = useState<{ [key: string]: boolean }>({
    management: true,
    operations: true,
    content: true,
    reports: true
  });

  // Timefilter states
  const [selectedMonth, setSelectedMonth] = useState('May 24, 2024');
  const [chartMonthFilter, setChartMonthFilter] = useState('This Month');
  const [hospitalsFilter, setHospitalsFilter] = useState('This Month');
  const [userRegFilter, setUserRegFilter] = useState('This Month');

  // Interactive Quick Action Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddHealthCampModal, setShowAddHealthCampModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showViewAllEnquiriesModal, setShowViewAllEnquiriesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'patient', password: 'Password@123', status: 'Active' });

  // Form states
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpeciality, setNewDoctorSpeciality] = useState('Cardiologist');
  const [newDoctorHospital, setNewDoctorHospital] = useState('MGM Hospital, Warangal');

  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalLocation, setNewHospitalLocation] = useState('Warangal');
  const [newHospitalBeds, setNewHospitalBeds] = useState('150');

  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampLocation, setNewCampLocation] = useState('Mulugu');
  const [newCampDate, setNewCampDate] = useState('2024-05-28');

  const [notificationAudience, setNotificationAudience] = useState('All Users');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Hover state for interactive chart tooltip
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ day: string; visits: number; completed: number; upcoming: number } | null>({
    day: 'May 21',
    visits: 2890,
    completed: 1840,
    upcoming: 780
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAdminUsers = async () => {
    try {
      const res = await api.users();
      setAdminUsers(res.items || []);
    } catch (err: any) {
      showToast(err.message || 'Unable to load users registry');
    }
  };

  useEffect(() => {
    if (['Users Management', 'Doctors Management', 'Hospitals Management', 'Marketing Team'].includes(activeNav)) loadAdminUsers();
  }, [activeNav]);

  const filteredAdminUsers = adminUsers.filter((item) => {
    const haystack = `${item.name || ''} ${item.email || ''} ${item.phone || ''} ${item.role || ''}`.toLowerCase();
    const matchesSearch = !userSearch || haystack.includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || item.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createUser(newUser);
    setAdminUsers((prev) => [res.item, ...prev]);
    setNewUser({ name: '', email: '', phone: '', role: 'patient', password: 'Password@123', status: 'Active' });
    showToast('User created in database');
  };

  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const { id, password, ...payload } = editingUser;
    const res = await api.updateUser(id, password ? { ...payload, password } : payload);
    setAdminUsers((prev) => prev.map((item) => (item.id === id ? res.item : item)));
    setEditingUser(null);
    showToast('User updated in database');
  };

  const handleDeleteAdminUser = async (id: string) => {
    await api.removeUser(id);
    setAdminUsers((prev) => prev.filter((item) => item.id !== id));
    showToast('User deleted from database');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Profile and Logout dropdown / modal
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // If user navigates to Health Camps from side nav, render the exact replica Health Camps page
  if (activeNav === 'Health Camps') {
    return (
      <AdminHealthCampsPage 
        onBackToDashboard={() => setActiveNav('Dashboard')}
        onLogout={onLogout}
      />
    );
  }

  const isRoleManagementNav = ['Users Management', 'Doctors Management', 'Hospitals Management', 'Marketing Team'].includes(activeNav);

  return (
    <div className="min-h-screen bg-[#f0f4f9] font-sans text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* TOP APPLICATION BAR (Exact Header from Image) */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <div 
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              {/* Ayudh Vikas Tree / Hands Logo */}
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <div className="relative flex items-center justify-center">
                  <span className="text-emerald-700 text-xl font-black">🌿</span>
                  <div className="absolute -bottom-1 w-2.5 h-1 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-[13px] font-black tracking-wider text-[#0b3c6d] uppercase">
                  AYUDH VIKAS
                </div>
                <div className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase">
                  HEALTH CARE NETWORK
                </div>
                <div className="text-[8px] text-slate-400 font-medium italic -mt-0.5">
                  Care Beyond Boundaries
                </div>
              </div>
            </div>

            {/* Hamburger & View Title */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <button className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients, hospitals, doctors, bookings..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right Action Icons & Profile Info */}
          <div className="flex items-center gap-3.5">
            
            {/* Notification Bell with '0' red badge */}
            <div className="relative">
              <button 
                onClick={() => showToast('No unread notifications')}
                className="text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  0
                </span>
              </button>
            </div>

            {/* Email Icon with '0' red badge */}
            <div className="relative">
              <button 
                onClick={() => showToast('Inbox is up to date')}
                className="text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer"
              >
                <Mail className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  0
                </span>
              </button>
            </div>

            {/* Settings Gear */}
            <button 
              onClick={() => showToast('Opening System Settings...')}
              className="text-slate-600 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {/* User Profile Pill (Admin User / Super Administrator) */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity p-1 rounded-lg hover:bg-slate-50"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0f2e5a] to-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 overflow-hidden shadow-2xs">
                    <span className="font-black text-[11px]">AU</span>
                  </div>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full absolute bottom-0 right-0 ring-1 ring-white"></span>
                </div>

                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-black text-slate-800">Admin User</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Super Administrator</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-0.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 rounded-lg mb-1">
                    <div className="text-xs font-black text-slate-900">Admin User</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">admin@ayudhvikasfoundation.org</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-[9.5px] font-bold text-emerald-700">Super Administrator (Active)</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onNavigateHome) onNavigateHome();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Public Portal</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveNav('Roles & Permissions');
                        showToast('RBAC permissions matrix');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Roles & Permissions</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveNav('System Settings');
                        showToast('System configuration');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>System Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutConfirmModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-bold cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout Admin Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Header Logout Button */}
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

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: SIDEBAR + DASHBOARD CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================================= */}
        {/* SIDEBAR (Exact Navy #11284d / Dark Blue Theme from Image) */}
        {/* ======================================================================= */}
        <aside className="w-64 bg-[#0e2343] text-slate-300 shrink-0 flex flex-col justify-between overflow-y-auto hidden md:flex border-r border-[#1a355d] select-none text-xs">
          
          <div className="p-3.5 space-y-4">
            
            {/* Top Dashboard Pill (Active Highlight) */}
            <button
              onClick={() => setActiveNav('Dashboard')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-sm ${
                activeNav === 'Dashboard'
                  ? 'bg-[#1e60db] text-white shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* SECTION 1: MANAGEMENT */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleSection('management')}
                className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between cursor-pointer py-1"
              >
                <span>MANAGEMENT</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSection.management ? '' : '-rotate-90'}`} />
              </div>

              {expandedSection.management && (
                <div className="space-y-0.5">
                  <button
                    onClick={() => { goNav('Users Management'); showToast('Loaded Users Registry'); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Users Management' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Users Management</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => goNav('Doctors Management')}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Doctors Management' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Doctors Management</span>
                  </button>

                  <button
                    onClick={() => goNav('Doctor Verifications')}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Doctor Verifications' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Doctor Verifications</span>
                  </button>

                  <button
                    onClick={() => goNav('Hospital Verifications')}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Hospital Verifications' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Hospital Verifications</span>
                  </button>

                  <button
                    onClick={() => goNav('Hospitals Management')}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Hospitals Management' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Hospitals Management</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Partners & Members'); showToast('Opening Partner Directory'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Partners & Members' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Handshake className="w-3.5 h-3.5 text-amber-400" />
                    <span>Partners & Members</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('Marketing Team')}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Marketing Team' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5 text-pink-400" />
                    <span>Marketing Team</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Ambulance Management'); showToast('Opening Ambulance Dispatch Tracker'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Ambulance Management' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Ambulance className="w-3.5 h-3.5 text-rose-400" />
                    <span>Ambulance Management</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Lab & Diagnostic Centers'); showToast('Opening Lab Network'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Lab & Diagnostic Centers' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lab & Diagnostic Centers</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('Health Camps')}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Health Camps' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Tent className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Health Camps</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 2: OPERATIONS */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleSection('operations')}
                className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between cursor-pointer py-1"
              >
                <span>OPERATIONS</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSection.operations ? '' : '-rotate-90'}`} />
              </div>

              {expandedSection.operations && (
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setActiveNav('Appointments'); showToast('Showing 23,867 Appointments'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Appointments' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Appointments</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Bookings'); showToast('Showing Lab & Ambulance Bookings'); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Bookings' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                      <span>Bookings</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => { setActiveNav('Enquiries'); setShowViewAllEnquiriesModal(true); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Enquiries' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enquiries</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Complaints & Feedback'); showToast('No pending complaints'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Complaints & Feedback' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span>Complaints & Feedback</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 3: CONTENT & COMMUNICATION */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleSection('content')}
                className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between cursor-pointer py-1"
              >
                <span>CONTENT & COMMUNICATION</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSection.content ? '' : '-rotate-90'}`} />
              </div>

              {expandedSection.content && (
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setActiveNav('News & Announcements'); showToast('News broadcast manager'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'News & Announcements' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
                    <span>News & Announcements</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('SMS / Email Campaigns'); setShowSendNotificationModal(true); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'SMS / Email Campaigns' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>SMS / Email Campaigns</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Website Content'); showToast('Portal content CMS'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Website Content' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    <span>Website Content</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Media Gallery'); showToast('Hospital and camp photo gallery'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Media Gallery' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                    <span>Media Gallery</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 4: REPORTS & SETTINGS */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleSection('reports')}
                className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between cursor-pointer py-1"
              >
                <span>REPORTS & SETTINGS</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSection.reports ? '' : '-rotate-90'}`} />
              </div>

              {expandedSection.reports && (
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setActiveNav('Reports & Analytics'); setShowGenerateReportModal(true); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Reports & Analytics' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reports & Analytics</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('System Settings'); showToast('System server & security configuration'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'System Settings' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Roles & Permissions'); showToast('RBAC permissions matrix'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Roles & Permissions' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Roles & Permissions</span>
                  </button>

                  <button
                    onClick={() => { setActiveNav('Activity Logs'); showToast('Viewing system audit trail'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeNav === 'Activity Logs' ? 'bg-[#1a3863] text-white' : 'text-slate-300 hover:bg-[#16335a] hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Activity Logs</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Logout Button */}
          <div className="p-3.5 border-t border-[#1a355d]">
            <button
              onClick={onLogout}
              className="w-full bg-[#1b3d6b] hover:bg-[#234e88] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-start gap-2.5 text-xs transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4 text-blue-300" />
              <span>Logout</span>
            </button>
          </div>

        </aside>

        {/* ======================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA (Exact Replication of Image) */}
        {/* ======================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Welcome Header Row with Date Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Welcome back, Admin!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Here's what's happening with Ayudh Vikas Health Care Network today.
              </p>
            </div>

            {/* Date Selector Pill */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => showToast('Date range: May 24, 2024 (Today)')}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedMonth}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {activeNav === 'Doctor Verifications' ? (
            <DoctorVerificationPanel />
          ) : activeNav === 'Hospital Verifications' ? (
            <HospitalVerificationPanel />
          ) : isRoleManagementNav ? (
            <AdminRoleManagement
              activeNav={activeNav}
              users={adminUsers}
              onUsersChanged={setAdminUsers}
              onToast={showToast}
            />
          ) : (
            <>

          {activeNav === 'Users Management' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Registered Users Registry</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    View every role account and perform database CRUD operations from one admin screen.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name, phone, email"
                      className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold min-w-[220px]"
                    />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black cursor-pointer"
                  >
                    {['All', 'patient', 'doctor', 'hospital', 'marketing', 'admin', 'ambulance', 'lab', 'volunteer', 'social_organizer'].map((role) => (
                      <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                    ))}
                  </select>
                  <button
                    onClick={loadAdminUsers}
                    className="px-3 py-2 rounded-lg bg-[#0f2e5a] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-300" />
                    Sync
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateAdminUser} className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
                <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full name" className="px-3 py-2 rounded-lg border border-slate-200 font-semibold" />
                <input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="px-3 py-2 rounded-lg border border-slate-200 font-semibold" />
                <input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 rounded-lg border border-slate-200 font-semibold" />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 font-black">
                  {['patient', 'doctor', 'hospital', 'marketing', 'admin', 'ambulance', 'lab', 'volunteer', 'social_organizer'].map((role) => <option key={role}>{role}</option>)}
                </select>
                <input required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Temp password" className="px-3 py-2 rounded-lg border border-slate-200 font-semibold" />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black flex items-center justify-center gap-1.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Add User
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-black">
                    <tr>
                      <th className="text-left px-4 py-2">User</th>
                      <th className="text-left px-4 py-2">Role</th>
                      <th className="text-left px-4 py-2">Contact</th>
                      <th className="text-left px-4 py-2">Payment / Plan</th>
                      <th className="text-right px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdminUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-black text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 text-[10px] font-black uppercase">{item.role}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-semibold">
                          <div>{item.phone || 'No phone'}</div>
                          <div className="text-[10px] text-slate-400">{item.email || 'No email'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-bold">
                          {item.subscriptionPlan ? `${item.subscriptionPlan} - Rs. ${item.subscriptionAmount}` : item.donationAmount ? `Donation Rs. ${item.donationAmount}` : 'Not captured'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingUser({ ...item, password: '' })} className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-black flex items-center gap-1 cursor-pointer">
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button onClick={() => handleDeleteAdminUser(item.id)} className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 font-black flex items-center gap-1 cursor-pointer">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredAdminUsers.length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-bold">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* ROW 1: TOP 6 STAT CARDS (Exact values and icons from Image) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Card 1: Total Users */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 leading-none">{stats.users || collections.patients.length || 0}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Total Users</div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span>↑ 16%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2: Registered Doctors */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 leading-none">{collections.doctors.length || stats.doctors || 0}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Registered Doctors</div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span>↑ 12%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 3: Partner Hospitals */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 leading-none">{collections.hospitals.length || stats.hospitals || 345}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Partner Hospitals</div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span>↑ 12%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 4: Appointments */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 leading-none">{collections.appointments.length || stats.appointments || 0}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Appointments</div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span>↑ 16%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 5: Ambulance Bookings */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Ambulance className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 leading-none">{collections.ambulance_bookings.length || stats.ambulance_bookings || 0}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Ambulance Bookings</div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span>↑ 16%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 6: Lab Bookings */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 leading-none">{collections.lab_bookings.length || stats.lab_bookings || 0}</div>
                <div className="text-[11px] font-bold text-slate-600 mt-1">Lab Bookings</div>
                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <span>↑ 22%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 2: 3-COLUMN ANALYTICS (Appointments, Hospitals, Registrations) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            
            {/* 1. Appointments Overview Chart (Col span 6) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-900">Appointments Overview</h3>
                  <div className="relative">
                    <select
                      value={chartMonthFilter}
                      onChange={(e) => setChartMonthFilter(e.target.value)}
                      className="text-[10.5px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="This Month">This Month</option>
                      <option value="Last Month">Last Month</option>
                      <option value="Last 3 Months">Last 3 Months</option>
                    </select>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[10.5px] font-bold text-slate-600 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Upcoming</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Cancelled</span>
                  </div>
                </div>

                {/* SVG Multi-Line Chart with interactive tooltip */}
                <div className="relative h-44 w-full mt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 420 140">
                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="410" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="55" x2="410" y2="55" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="90" x2="410" y2="90" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="20" y1="125" x2="410" y2="125" stroke="#e2e8f0" />

                    {/* Y-Axis Labels */}
                    <text x="5" y="24" className="text-[9px] fill-slate-400 font-bold">2K</text>
                    <text x="5" y="59" className="text-[9px] fill-slate-400 font-bold">1.5K</text>
                    <text x="5" y="94" className="text-[9px] fill-slate-400 font-bold">1K</text>
                    <text x="5" y="129" className="text-[9px] fill-slate-400 font-bold">500</text>
                    <text x="10" y="139" className="text-[9px] fill-slate-400 font-bold">0</text>

                    {/* Green Line (Completed) */}
                    <path
                      d="M 30,110 Q 90,100 150,85 T 270,60 T 360,68 T 405,50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Blue Line (Upcoming / Direct Visits) */}
                    <path
                      d="M 30,95 Q 90,75 150,65 T 270,40 T 360,48 T 405,32"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Red Line (Cancelled) */}
                    <path
                      d="M 30,130 Q 90,128 150,126 T 270,124 T 360,122 T 405,120"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Interactive Marker on May 21 */}
                    <circle cx="270" cy="40" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="cursor-pointer" />
                    <circle cx="270" cy="60" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" className="cursor-pointer" />

                    {/* Tooltip Box pinned to line */}
                    <g transform="translate(245, 12)">
                      <rect x="0" y="0" width="60" height="22" rx="4" fill="#1e293b" />
                      <text x="30" y="10" textAnchor="middle" className="text-[8px] fill-white font-bold">May 21</text>
                      <text x="30" y="18" textAnchor="middle" className="text-[7.5px] fill-emerald-300 font-black">• Direct Visits</text>
                    </g>
                  </svg>

                  {/* X-Axis labels */}
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 px-6 mt-1">
                    <span>1 May</span>
                    <span>6 May</span>
                    <span>11 May</span>
                    <span>16 May</span>
                    <span>21 May</span>
                    <span>24 May</span>
                  </div>
                </div>
              </div>

              {/* Bottom Summary Strip */}
              <div className="grid grid-cols-4 gap-2 pt-2.5 mt-2 border-t border-slate-100 text-center">
                <div>
                  <div className="text-[9.5px] text-slate-400 font-semibold">Total</div>
                  <div className="text-xs font-black text-slate-900">23,867</div>
                </div>
                <div>
                  <div className="text-[9.5px] text-slate-400 font-semibold">Completed</div>
                  <div className="text-xs font-black text-emerald-600">15,890 <span className="text-[9px] font-medium">(67%)</span></div>
                </div>
                <div>
                  <div className="text-[9.5px] text-slate-400 font-semibold">Upcoming</div>
                  <div className="text-xs font-black text-blue-600">6,245 <span className="text-[9px] font-medium">(26%)</span></div>
                </div>
                <div>
                  <div className="text-[9.5px] text-slate-400 font-semibold">Cancelled</div>
                  <div className="text-xs font-black text-rose-600">1,532 <span className="text-[9px] font-medium">(7%)</span></div>
                </div>
              </div>
            </div>

            {/* 2. Top Partner Hospitals (Col span 4) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-900">Top Partner Hospitals</h3>
                  <select
                    value={hospitalsFilter}
                    onChange={(e) => setHospitalsFilter(e.target.value)}
                    className="text-[10.5px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="This Month">This Month</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>

                {/* Ranked List 1 to 5 */}
                <div className="space-y-2.5">
                  
                  {/* Hospital 1 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                      <span className="font-bold text-slate-800 truncate">MGM Hospital, Warangal</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 shrink-0">2,990 Appointments</span>
                  </div>

                  {/* Hospital 2 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                      <span className="font-bold text-slate-800 truncate">Kakatiya Medical College</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 shrink-0">2,480 Appointments</span>
                  </div>

                  {/* Hospital 3 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                      <span className="font-bold text-slate-800 truncate">Apollo Hospitals, Hanamkonda</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 shrink-0">2,250 Appointments</span>
                  </div>

                  {/* Hospital 4 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">4</span>
                      <span className="font-bold text-slate-800 truncate">Sri Sri Holistic Hospitals</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 shrink-0">1,987 Appointments</span>
                  </div>

                  {/* Hospital 5 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">5</span>
                      <span className="font-bold text-slate-800 truncate">Mamatha Hospital, Jangaon</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 shrink-0">1,654 Appointments</span>
                  </div>

                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowAddHospitalModal(true)}
                  className="text-[11px] font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Hospitals</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. User Registrations (Donut Chart) (Col span 3) */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-900">User Registrations</h3>
                  <select
                    value={userRegFilter}
                    onChange={(e) => setUserRegFilter(e.target.value)}
                    className="text-[10.5px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="This Month">This Month</option>
                    <option value="Year 2024">Year 2024</option>
                  </select>
                </div>

                <div className="flex items-center justify-center gap-3 my-2">
                  
                  {/* Segmented Donut SVG */}
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      
                      {/* Segment 1: Patients (58% -> stroke-dasharray 138 238) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="12"
                        strokeDasharray="138 238"
                        strokeDashoffset="0"
                      />

                      {/* Segment 2: Doctors (25% -> 60 238) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray="50 238"
                        strokeDashoffset="-138"
                      />

                      {/* Segment 3: Hospitals (3%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="12"
                        strokeDasharray="15 238"
                        strokeDashoffset="-188"
                      />

                      {/* Segment 4: Corporate / Partners (3%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="12"
                        strokeDasharray="15 238"
                        strokeDashoffset="-203"
                      />

                      {/* Segment 5: Others (11%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="12"
                        strokeDasharray="20 238"
                        strokeDashoffset="-218"
                      />
                    </svg>

                    {/* Center Text in Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-black text-slate-900 leading-none">12,458</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Total</span>
                    </div>
                  </div>

                  {/* Breakdown Legend */}
                  <div className="space-y-1 text-[10px] font-bold text-slate-700 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>Patients</span>
                      </span>
                      <span className="font-black text-slate-900">7,245 (58%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Doctors</span>
                      </span>
                      <span className="font-black text-slate-900">1,245 (25%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        <span>Hospitals</span>
                      </span>
                      <span className="font-black text-slate-900">345 (3%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>Partners</span>
                      </span>
                      <span className="font-black text-slate-900">345 (3%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                        <span>Others</span>
                      </span>
                      <span className="font-black text-slate-900">3,367 (27%)</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowGenerateReportModal(true)}
                  className="text-[11px] font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 3: 3-COLUMN OPERATIONAL (Enquiries, Ambulance, System Overview) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            
            {/* 1. Recent Enquiries (Col span 5) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-black text-slate-900">Recent Enquiries</h3>
                  <button 
                    onClick={() => setShowViewAllEnquiriesModal(true)}
                    className="text-[11px] font-black text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  
                  {/* Enquiry 1: Ramesh Kumar */}
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black flex items-center justify-center shrink-0">RK</span>
                      <div>
                        <div className="font-black text-slate-900 leading-none">Ramesh Kumar</div>
                        <div className="text-[10px] text-slate-500 font-medium">Heart Problem</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] text-slate-500 font-medium">Warangal</span>
                      <span className="text-[10px] text-slate-400">9 min ago</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">New</span>
                    </div>
                  </div>

                  {/* Enquiry 2: Suresh Babu */}
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-[9px] font-black flex items-center justify-center shrink-0">SB</span>
                      <div>
                        <div className="font-black text-slate-900 leading-none">Suresh Babu</div>
                        <div className="text-[10px] text-slate-500 font-medium">Orthopedic Check</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] text-slate-500 font-medium">Hanamkonda</span>
                      <span className="text-[10px] text-slate-400">15 min ago</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">New</span>
                    </div>
                  </div>

                  {/* Enquiry 3: Anitha Devi */}
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[9px] font-black flex items-center justify-center shrink-0">AD</span>
                      <div>
                        <div className="font-black text-slate-900 leading-none">Anitha Devi</div>
                        <div className="text-[10px] text-slate-500 font-medium">General Checkup</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] text-slate-500 font-medium">Bhupalpally</span>
                      <span className="text-[10px] text-slate-400">21 min ago</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">New</span>
                    </div>
                  </div>

                  {/* Enquiry 4: Venkatesh */}
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black flex items-center justify-center shrink-0">VK</span>
                      <div>
                        <div className="font-black text-slate-900 leading-none">Venkatesh</div>
                        <div className="text-[10px] text-slate-500 font-medium">Eye Consultation</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] text-slate-500 font-medium">Mulugu</span>
                      <span className="text-[10px] text-slate-400">45 min ago</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">New</span>
                    </div>
                  </div>

                  {/* Enquiry 5: Pravalika */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-[9px] font-black flex items-center justify-center shrink-0">PR</span>
                      <div>
                        <div className="font-black text-slate-900 leading-none">Pravalika</div>
                        <div className="text-[10px] text-slate-500 font-medium">Thyroid Problem</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] text-slate-500 font-medium">Jangaon</span>
                      <span className="text-[10px] text-slate-400">1 hr ago</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">New</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowViewAllEnquiriesModal(true)}
                  className="text-[11px] font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Enquiries</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Ambulance Bookings (Col span 4) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-900">Ambulance Bookings</h3>
                  <button 
                    onClick={() => showToast('Showing 2,145 total ambulance bookings')}
                    className="text-[11px] font-black text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 py-2">
                  {/* Ambulance Graphic */}
                  <div className="w-24 h-20 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-2">
                    <span className="text-3xl">🚑</span>
                    <span className="text-[9px] font-black text-rose-700 mt-1 uppercase">24x7 Ready</span>
                  </div>

                  {/* Status Counts */}
                  <div className="space-y-1.5 text-[11px] font-bold text-slate-700 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Completed</span>
                      </span>
                      <span className="font-black text-slate-900">1,256 (25%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>Ongoing</span>
                      </span>
                      <span className="font-black text-slate-900">256 (19%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>Scheduled</span>
                      </span>
                      <span className="font-black text-slate-900">415 (19%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Cancelled</span>
                      </span>
                      <span className="font-black text-slate-900">215 (15%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => showToast('Opening Ambulance Fleet Monitor')}
                  className="text-[11px] font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Bookings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. System Overview (Col span 3) */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-black text-slate-900 mb-2">System Overview</h3>

              {/* Total Storage Used */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>Total Storage Used</span>
                  </span>
                  <span className="font-black text-slate-900">256 GB / 1 TB</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
                <div className="text-right text-[9px] font-bold text-slate-400 mt-0.5">25%</div>
              </div>

              {/* SMS Server */}
              <div className="flex items-center justify-between text-[11px] font-bold py-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SMS Server</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900">25,680 Credits</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">Good</span>
                </div>
              </div>

              {/* Email Server */}
              <div className="flex items-center justify-between text-[11px] font-bold py-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>Email Server</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900">Connected</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
                </div>
              </div>

              {/* Website Status */}
              <div className="flex items-center justify-between text-[11px] font-bold py-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>Website Status</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">ayudhvikasfoundation.org</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">Live</span>
                </div>
              </div>

              {/* Last Backup */}
              <div className="flex items-center justify-between text-[11px] font-bold py-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Database className="w-3.5 h-3.5 text-purple-600" />
                  <span>Last Backup</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 font-semibold">May 24, 02:34 AM</span>
                  <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-200">Remote</span>
                </div>
              </div>

            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 4: BOTTOM ROW (Recent Activity Logs + Quick Actions) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            
            {/* Recent Activity Logs (Col span 7) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-900">Recent Activity Logs</h3>
                <button 
                  onClick={() => showToast('Full audit log loaded (150+ events)')}
                  className="text-[11px] font-black text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 text-xs">
                
                {/* Activity 1 */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900">Admin User</span>
                      <span className="text-slate-600 font-medium ml-1">created new hospital "Sanjeevani Hospital, Warangal"</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium shrink-0">10 min ago</span>
                </div>

                {/* Activity 2 */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900">Marketing Team</span>
                      <span className="text-slate-600 font-medium ml-1">added 25 new leads from Health Camp</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium shrink-0">10 min ago</span>
                </div>

                {/* Activity 3 */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900">Dr. Ravi Teja</span>
                      <span className="text-slate-600 font-medium ml-1">updated doctor health information</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium shrink-0">1 hr ago</span>
                </div>

                {/* Activity 4 */}
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900">Admin User</span>
                      <span className="text-slate-600 font-medium ml-1">updated system storage config</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium shrink-0">3 hrs ago</span>
                </div>

              </div>
            </div>

            {/* Quick Actions 5 Color Buttons (Col span 5) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-black text-slate-900 mb-3">Quick Actions</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                
                {/* 1. Add Doctor (Blue) */}
                <button
                  onClick={() => setShowAddDoctorModal(true)}
                  className="bg-blue-50/80 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs hover:scale-105 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black leading-tight">Add Doctor</span>
                </button>

                {/* 2. Add Hospital (Green) */}
                <button
                  onClick={() => setShowAddHospitalModal(true)}
                  className="bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs hover:scale-105 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black leading-tight">Add Hospital</span>
                </button>

                {/* 3. Add Health Camp (Purple) */}
                <button
                  onClick={() => setShowAddHealthCampModal(true)}
                  className="bg-purple-50/80 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs hover:scale-105 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Tent className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black leading-tight">Add Health Camp</span>
                </button>

                {/* 4. Send Notification (Orange/Amber) */}
                <button
                  onClick={() => setShowSendNotificationModal(true)}
                  className="bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs hover:scale-105 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black leading-tight">Send Notification</span>
                </button>

                {/* 5. Generate Report (Cyan) */}
                <button
                  onClick={() => setShowGenerateReportModal(true)}
                  className="bg-cyan-50/80 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-2xs hover:scale-105 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black leading-tight">Generate Report</span>
                </button>

              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* FOOTER BAR (Exact Copyright & Privacy links from Image) */}
          {/* ===================================================================== */}
          <footer className="pt-4 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2024 Ayudh Vikas Health Care Network. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4 font-bold text-slate-600">
              <button onClick={() => showToast('Ayudh Vikas Privacy Policy')} className="hover:text-blue-700 cursor-pointer">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => showToast('Terms & Conditions')} className="hover:text-blue-700 cursor-pointer">
                Terms & Conditions
              </button>
            </div>
          </footer>

            </>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 1: ADD DOCTOR */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Edit Registered User</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveAdminUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name</label>
                  <input required value={editingUser.name || ''} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select value={editingUser.role || 'patient'} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-black">
                    {['patient', 'doctor', 'hospital', 'marketing', 'admin', 'ambulance', 'lab', 'volunteer', 'social_organizer'].map((role) => <option key={role}>{role}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input value={editingUser.phone || ''} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select value={editingUser.status || 'Active'} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-black">
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password</label>
                  <input value={editingUser.password || ''} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} placeholder="Leave blank to keep" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-black cursor-pointer">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add New Doctor</h3>
                  <p className="text-[10.5px] text-slate-500">Super Administrator Verification</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddDoctorModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  placeholder="e.g. Dr. K. Srinivas Rao, MD"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Speciality</label>
                <select
                  value={newDoctorSpeciality}
                  onChange={(e) => setNewDoctorSpeciality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                >
                  <option value="Cardiologist">Cardiologist (Heart Specialist)</option>
                  <option value="General Physician">General Physician / Internal Medicine</option>
                  <option value="Orthopedic Surgeon">Orthopedic Surgeon (Bone & Joint)</option>
                  <option value="Diabetologist">Diabetologist / Endocrinologist</option>
                  <option value="Gynecologist">Gynecologist & Obstetrician</option>
                  <option value="Pediatrician">Pediatrician (Child Specialist)</option>
                  <option value="Ophthalmologist">Ophthalmologist (Eye Surgeon)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Affiliated Hospital</label>
                <select
                  value={newDoctorHospital}
                  onChange={(e) => setNewDoctorHospital(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                >
                  <option value="MGM Hospital, Warangal">MGM Hospital, Warangal</option>
                  <option value="Kakatiya Medical College">Kakatiya Medical College</option>
                  <option value="Apollo Hospitals, Hanamkonda">Apollo Hospitals, Hanamkonda</option>
                  <option value="Sri Sri Holistic Hospitals">Sri Sri Holistic Hospitals</option>
                  <option value="Mamatha Hospital, Jangaon">Mamatha Hospital, Jangaon</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  create('doctors', {
                    name: newDoctorName || 'Dr. K. Srinivas',
                    speciality: newDoctorSpeciality,
                    hospital: newDoctorHospital,
                    status: 'Active',
                    rating: 4.8,
                    consultationFee: 600,
                    experienceYears: 10,
                    district: 'Warangal',
                  }).catch(console.error);
                  setShowAddDoctorModal(false);
                  showToast(`Doctor "${newDoctorName || 'Dr. K. Srinivas'}" registered successfully!`);
                  setNewDoctorName('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Register Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 2: ADD HOSPITAL */}
      {/* ========================================================================= */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Partner Hospital Onboarding</h3>
                  <p className="text-[10.5px] text-slate-500">MOU & Ayudh Vikas Network Empanelment</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddHospitalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                  placeholder="e.g. Sanjeevani Multi-Speciality Hospital"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / City</label>
                  <select
                    value={newHospitalLocation}
                    onChange={(e) => setNewHospitalLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
                  >
                    <option value="Warangal">Warangal</option>
                    <option value="Hanamkonda">Hanamkonda</option>
                    <option value="Mulugu">Mulugu</option>
                    <option value="Bhupalpally">Bhupalpally</option>
                    <option value="Jangaon">Jangaon</option>
                    <option value="Mahabubabad">Mahabubabad</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    value={newHospitalBeds}
                    onChange={(e) => setNewHospitalBeds(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddHospitalModal(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  create('hospitals', {
                    name: newHospitalName || 'Sanjeevani Hospital',
                    shortName: newHospitalName || 'Sanjeevani Hospital',
                    district: newHospitalLocation,
                    location: newHospitalLocation,
                    totalBeds: parseInt(newHospitalBeds, 10) || 150,
                    availableBeds: Math.round((parseInt(newHospitalBeds, 10) || 150) * 0.2),
                    specialities: ['General Medicine'],
                    logoText: (newHospitalName || 'SANJ').slice(0, 6).toUpperCase(),
                    logoBg: 'bg-blue-700',
                    hasAyudhCashless: true,
                    isOpen24x7: true,
                    rating: 4.6,
                    seniorDoctors: [],
                  }).catch(console.error);
                  setShowAddHospitalModal(false);
                  showToast(`Hospital "${newHospitalName || 'Sanjeevani Hospital'}" added to Partner Network!`);
                  setNewHospitalName('');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Onboard Hospital
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 3: ADD HEALTH CAMP */}
      {/* ========================================================================= */}
      {showAddHealthCampModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Tent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Schedule Health Camp</h3>
                  <p className="text-[10.5px] text-slate-500">Free Rural Outreach Screening Program</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddHealthCampModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Camp Title / Focus</label>
                <input
                  type="text"
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  placeholder="e.g. Free Mega Cardiology & Diabetes Screening"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Mandal</label>
                  <input
                    type="text"
                    value={newCampLocation}
                    onChange={(e) => setNewCampLocation(e.target.value)}
                    placeholder="e.g. Mulugu ZP High School"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newCampDate}
                    onChange={(e) => setNewCampDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddHealthCampModal(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  create('health_camps', {
                    title: newCampTitle || 'Free Health Camp',
                    name: newCampTitle || 'Free Health Camp',
                    location: newCampLocation,
                    district: newCampLocation,
                    date: newCampDate,
                    status: 'Upcoming',
                    organizedBy: 'Ayudh Vikas Foundation',
                    servicesOffered: ['General Checkup'],
                  }).catch(console.error);
                  setShowAddHealthCampModal(false);
                  showToast(`Health Camp "${newCampTitle || 'Free Health Camp'}" scheduled successfully!`);
                  setNewCampTitle('');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Schedule Camp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 4: SEND NOTIFICATION */}
      {/* ========================================================================= */}
      {showSendNotificationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Broadcast SMS / Push Notification</h3>
                  <p className="text-[10.5px] text-slate-500">Ayudh Vikas Network SMS Gateway</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSendNotificationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={notificationAudience}
                  onChange={(e) => setNotificationAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-amber-600 font-medium cursor-pointer"
                >
                  <option value="All Users">All Registered Users (12,458)</option>
                  <option value="Doctors">All Network Doctors (1,245)</option>
                  <option value="Hospitals">Partner Hospital Staff (345)</option>
                  <option value="Rural Patients">Rural Ayush Card Holders</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notification Message</label>
                <textarea
                  rows={3}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="e.g. Free Cardiology Health Camp at Mulugu this Sunday. Consult top doctors for free!"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-amber-600 font-medium resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSendNotificationModal(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSendNotificationModal(false);
                  showToast(`Broadcast sent to ${notificationAudience}!`);
                  setNotificationMessage('');
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 5: GENERATE REPORT */}
      {/* ========================================================================= */}
      {showGenerateReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Generate Executive Report</h3>
                  <p className="text-[10.5px] text-slate-500">Comprehensive Ayudh Vikas Health Analytics</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGenerateReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 mb-1">Select Report Scope</label>
              <div className="space-y-1.5">
                {['Monthly Executive Summary (May 2024)', 'Partner Hospitals OP Performance', 'Doctor Consultations & OPD Metrics', 'Ambulance & Emergency Response Log', 'Rural Health Camps & Lead Conversions'].map((rep, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <span className="font-semibold text-slate-800">{rep}</span>
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowGenerateReportModal(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowGenerateReportModal(false);
                  showToast('Executive PDF Report generated and downloaded!');
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 6: VIEW ALL ENQUIRIES */}
      {/* ========================================================================= */}
      {showViewAllEnquiriesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">All Patient Inbound Enquiries</h3>
                  <p className="text-[10.5px] text-slate-500">Live triage feed across Telangana centers</p>
                </div>
              </div>
              <button 
                onClick={() => setShowViewAllEnquiriesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {[
                { name: 'Ramesh Kumar', problem: 'Heart Problem (Chest Discomfort)', location: 'Warangal', time: '9 min ago', phone: '+91 98480 23145', badge: 'New' },
                { name: 'Suresh Babu', problem: 'Orthopedic Check (Knee Pain)', location: 'Hanamkonda', time: '15 min ago', phone: '+91 94401 88392', badge: 'New' },
                { name: 'Anitha Devi', problem: 'General Checkup & BP Check', location: 'Bhupalpally', time: '21 min ago', phone: '+91 97012 44321', badge: 'New' },
                { name: 'Venkatesh', problem: 'Eye Consultation / Cataract', location: 'Mulugu', time: '45 min ago', phone: '+91 99890 12049', badge: 'New' },
                { name: 'Pravalika', problem: 'Thyroid Problem & Hormone Screening', location: 'Jangaon', time: '1 hr ago', phone: '+91 96180 55432', badge: 'New' },
                { name: 'Ravi Chandra', problem: 'Nephrology & Dialysis Support', location: 'Mahabubabad', time: '2 hrs ago', phone: '+91 98481 00921', badge: 'In Review' },
                { name: 'Lakshmi Bai', problem: 'Pediatric Vaccination Inquiry', location: 'Karimnagar', time: '3 hrs ago', phone: '+91 94902 33110', badge: 'Resolved' }
              ].map((enq, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center shrink-0">
                      {enq.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{enq.name}</div>
                      <div className="text-[11px] text-slate-600">{enq.problem}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Location: {enq.location} • Phone: {enq.phone}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="bg-emerald-50 text-emerald-700 text-[9.5px] font-black px-2 py-0.5 rounded border border-emerald-200">{enq.badge}</span>
                    <span className="text-[10px] text-slate-400">{enq.time}</span>
                    <button 
                      onClick={() => showToast(`Connecting call with ${enq.name}...`)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Back</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Showing 7 recent enquiries</span>
              <button
                onClick={() => setShowViewAllEnquiriesModal(false)}
                className="bg-[#0f2e5a] hover:bg-[#183d73] text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 7: LOGOUT CONFIRMATION */}
      {/* ========================================================================= */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Sign Out of Super Admin?</h3>
              <p className="text-xs text-slate-500">
                You will be logged out of your administrator session and returned to the public Ayudh Vikas portal.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800">Admin User (Super Administrator)</div>
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
                  if (onLogout) onLogout();
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST NOTIFICATION POPUP */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
