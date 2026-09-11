import React, { useState } from 'react';
import {
  HeartPulse,
  Phone,
  Mail,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  CreditCard,
  IndianRupee,
  LayoutDashboard,
  Megaphone,
  HelpCircle,
  PhoneCall,
  BarChart3,
  Activity,
  CheckSquare,
  MessageSquare,
  Settings,
  Headphones,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
  CalendarDays,
  FileText,
  UserCheck,
  Hospital,
  Stethoscope,
  Eye
} from 'lucide-react';
import { MarketingLeadsPage } from './MarketingLeadsPage';
import { useLiveData } from '../context/LiveDataContext';
import { BrandLogo } from './BrandLogo';

interface MarketingDashboardProps {
  onLogout: () => void;
  onNavigateHome?: () => void;
}

export const MarketingDashboard: React.FC<MarketingDashboardProps> = ({
  onLogout,
  onNavigateHome
}) => {
  const { collections, create, update } = useLiveData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [selectedLeadModal, setSelectedLeadModal] = useState<any | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [activeNotificationToast, setActiveNotificationToast] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    location: 'Warangal',
    requirement: 'Heart Problem',
    source: 'Health Camps',
    assignedTo: 'Rohit Verma'
  });

  // Recent Leads Data
  const [leadsList, setLeadsList] = useState([
    { id: 'LD-101', name: 'Rohit Verma', problem: 'Heart Problem', location: 'Warangal', time: '2 min ago', initials: 'PS', bg: 'bg-blue-100 text-blue-700', status: 'New' },
    { id: 'LD-102', name: 'Priya Sharma', problem: 'General Checkup', location: 'Hanamkonda', time: '12 min ago', initials: 'PS', bg: 'bg-teal-100 text-teal-700', status: 'Contacted' },
    { id: 'LD-103', name: 'Suresh Kumar', problem: 'Diabetes Consultation', location: 'Bhupalpally', time: '1 hr ago', initials: 'PS', bg: 'bg-amber-100 text-amber-700', status: 'In Discussion' },
    { id: 'LD-104', name: 'Neha Reddy', problem: 'Orthopedic Issue', location: 'Jangaon', time: '2 hr ago', initials: 'NC', bg: 'bg-purple-100 text-purple-700', status: 'Converted' },
    { id: 'LD-105', name: 'Anil Reddy', problem: 'Thyroid Problem', location: 'Jangaon', time: '3 hr ago', initials: 'AM', bg: 'bg-pink-100 text-pink-700', status: 'New' },
  ]);

  // Handle adding a new lead
  const handleAddNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const initials = newLeadForm.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'LD';
    const newEntry = {
      id: `LD-${Date.now().toString().slice(-4)}`,
      name: newLeadForm.name,
      problem: newLeadForm.requirement,
      location: newLeadForm.location,
      time: 'Just now',
      initials: initials,
      bg: 'bg-emerald-100 text-emerald-700',
      status: 'New'
    };

    setLeadsList(prev => [newEntry, ...prev]);
    create('leads', {
      id: newEntry.id,
      patientName: newLeadForm.name,
      age: 40,
      gender: 'Male',
      phone: newLeadForm.phone,
      location: newLeadForm.location,
      requirement: newLeadForm.requirement,
      sourceCategory: newLeadForm.source,
      sourceDetails: `Direct Outreach - ${newLeadForm.location} Desk`,
      status: 'New',
      registeredAsPatient: false,
      assignedDoctor: 'Dr. Ravi Teja (Cardiologist)',
      dateAdded: new Date().toISOString().split('T')[0],
      lastFollowUp: 'Captured from Quick Add Dashboard',
      notes: `Requirement: ${newLeadForm.requirement}. Assigned to ${newLeadForm.assignedTo}`,
      marketerName: 'Rohit Kumar',
      problem: newLeadForm.requirement,
      time: 'Just now',
      initials: newEntry.initials,
      bg: newEntry.bg,
    }).catch(console.error);

    setShowAddLeadModal(false);
    setNewLeadForm({
      name: '',
      phone: '',
      location: 'Warangal',
      requirement: 'Heart Problem',
      source: 'Health Camps',
      assignedTo: 'Rohit Verma'
    });
    setActiveNotificationToast(`Lead ${newLeadForm.name} created successfully!`);
    setTimeout(() => setActiveNotificationToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* TOP HEADER BAR (EXACT AS IMAGE 2) */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto">
          
          {/* Left: Brand Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <BrandLogo className="w-10 h-10 shadow-2xs group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-[#0f2e5a] tracking-tight leading-none uppercase">
                    AYUDH VIKAS
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-[#006633] tracking-wider uppercase leading-none mt-0.5">
                  HEALTH CARE NETWORK
                </span>
                <span className="text-[9px] font-bold text-emerald-700 tracking-tight leading-none mt-0.5">
                  Care Beyond Boundaries
                </span>
              </div>
            </div>

            {/* Title & Welcome text */}
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex text-slate-600 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-md cursor-pointer"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-black text-[#0f2e5a] leading-tight">
                  Marketing Team Dashboard
                </h1>
                <p className="text-[11px] font-medium text-slate-500">
                  Welcome back! Here's your marketing overview for today.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Phone pill, notifications, Rohit Kumar profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Marketing Support Pill */}
            <a
              href="tel:08704210820"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors shadow-2xs"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Phone className="w-2.5 h-2.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[9px] text-emerald-600 font-semibold">Marketing Support</span>
                <span className="text-[11px] font-black text-emerald-900">0870-4210820</span>
              </div>
            </a>

            {/* Email Icon with Badge */}
            <button 
              onClick={() => setActiveNav('Messages')}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                0
              </span>
            </button>

            {/* Bell Icon with Badge */}
            <button 
              onClick={() => setActiveNav('Notifications')}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                9
              </span>
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src="/src/assets/images/doctor_prakash_kumar_1787230378706.jpg"
                alt="Rohit Kumar"
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
              />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-black text-slate-900">Rohit Kumar</span>
                <span className="text-[10px] font-semibold text-slate-500">Marketing Manager</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="ml-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: SIDEBAR + CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* ======================================================================= */}
        {/* SIDEBAR (NAVY DARK THEME) */}
        {/* ======================================================================= */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-[#152e4d] text-white flex flex-col justify-between p-3.5 z-30 transition-transform duration-200 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top Navigation Items */}
          <div className="space-y-1">
            
            {/* Dashboard (Active - Solid Green button) */}
            <button
              onClick={() => {
                setActiveNav('Dashboard');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeNav === 'Dashboard'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Leads */}
            <button
              onClick={() => {
                setActiveNav('Leads');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Leads'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Leads</span>
              </div>
            </button>

            {/* Hospitals */}
            <button
              onClick={() => {
                setActiveNav('Hospitals');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Hospitals'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Hospitals</span>
              </div>
            </button>

            {/* Health Camps */}
            <button
              onClick={() => {
                setActiveNav('Health Camps');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Health Camps'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4" />
                <span>Health Camps</span>
              </div>
            </button>

            {/* Memberships */}
            <button
              onClick={() => {
                setActiveNav('Memberships');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Memberships'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>Memberships</span>
              </div>
            </button>

            {/* Campaigns */}
            <button
              onClick={() => {
                setActiveNav('Campaigns');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Campaigns'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4" />
                <span>Campaigns</span>
              </div>
            </button>

            {/* Enquiries */}
            <button
              onClick={() => {
                setActiveNav('Enquiries');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Enquiries'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4" />
                <span>Enquiries</span>
              </div>
            </button>

            {/* Follow-ups */}
            <button
              onClick={() => {
                setActiveNav('Follow-ups');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Follow-ups'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4" />
                <span>Follow-ups</span>
              </div>
            </button>

            {/* Reports */}
            <button
              onClick={() => {
                setActiveNav('Reports');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Reports'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </div>
            </button>

            {/* Team Activity */}
            <button
              onClick={() => {
                setActiveNav('Team Activity');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Team Activity'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4" />
                <span>Team Activity</span>
              </div>
            </button>

            {/* Tasks (with badge 12) */}
            <button
              onClick={() => {
                setActiveNav('Tasks');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Tasks'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
              </div>
              <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                12
              </span>
            </button>

            {/* Messages (with badge 4) */}
            <button
              onClick={() => {
                setActiveNav('Messages');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Messages'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </div>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                4
              </span>
            </button>

            {/* Notifications (with badge 7) */}
            <button
              onClick={() => {
                setActiveNav('Notifications');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Notifications'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                7
              </span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setActiveNav('Settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'Settings'
                  ? 'bg-[#3b6e2d] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>

          </div>

          {/* Bottom Card: Need Help? + Copyright */}
          <div className="pt-4 space-y-3">
            <div className="bg-gradient-to-b from-blue-600 to-blue-800 rounded-2xl p-4 text-center text-white shadow-lg space-y-2.5 border border-blue-400/30">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center mx-auto text-white">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">Need Help?</h4>
                <p className="text-[10.5px] text-blue-100">Contact Marketing Support</p>
              </div>
              <button
                onClick={() => setShowSupportModal(true)}
                className="w-full bg-white text-[#0f2e5a] hover:bg-blue-50 text-xs font-black py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Contact Now
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center px-1">
              © 2024 Ayudh Vikas<br />Health Care Network<br />All Rights Reserved
            </div>
          </div>

        </aside>

        {/* Sidebar Overlay on mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* ======================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA */}
        {/* ======================================================================= */}
        <main className="flex-1 p-4 lg:p-6 space-y-5 overflow-x-hidden">
          
          {/* Top Row in Content: Quick notification toast & Date Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {activeNotificationToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeNotificationToast}</span>
                </div>
              )}
            </div>

            {/* Date Picker Button & Quick Add Lead */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs cursor-pointer">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                <span>May 24, 2024</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('Leads');
                  setShowAddLeadModal(true);
                }}
                className="bg-[#0f2e5a] hover:bg-[#152e4d] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          {/* Conditional View Rendering */}
          {activeNav === 'Leads' ? (
            <MarketingLeadsPage onBackToDashboard={() => setActiveNav('Dashboard')} />
          ) : (
            <>
              {/* ===================================================================== */}
              {/* ROW 1: TOP 5 STAT CARDS (EXACT AS IMAGE 2) */}
              {/* ===================================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            
            {/* Card 1: Total Leads */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">265</div>
                <div className="text-xs font-bold text-slate-600">Total Leads</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>+ 15%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveNav('Leads')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>View Leads</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 2: Partner Hospitals */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">42</div>
                <div className="text-xs font-bold text-slate-600">Partner Hospitals</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>+ 12%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveNav('Hospitals')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>View Hospitals</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 3: Health Camps */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">18</div>
                <div className="text-xs font-bold text-slate-600">Health Camps</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>+ 20%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveNav('Health Camps')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>View Camps</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 4: Memberships */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">1,256</div>
                <div className="text-xs font-bold text-slate-600">Memberships</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>+ 15%</span>
                  <span className="text-slate-400 font-normal">from last month</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveNav('Memberships')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>View Memberships</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 5: Campaign Spend */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">₹ 98,750</div>
                <div className="text-xs font-bold text-slate-600">Campaign Spend</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  This Month
                </div>
              </div>
              <button 
                onClick={() => setActiveNav('Campaigns')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 2: LEADS OVERVIEW, LEADS TREND & TOP SOURCES (3 CARDS) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Card A: Leads Overview (Donut Chart & Legend) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Leads Overview</h3>
                <button className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer">
                  <span>This Month</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Donut Chart and Legend */}
              <div className="py-4 flex items-center justify-center gap-4">
                {/* SVG Donut Chart */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    {/* New Leads: 37% (Blue) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="88.3 238.7" strokeDashoffset="0" />
                    {/* Contacted: 27% (Cyan) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06b6d4" strokeWidth="12" strokeDasharray="64.4 238.7" strokeDashoffset="-88.3" />
                    {/* In Discussion: 12% (Purple) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="28.6 238.7" strokeDashoffset="-152.7" />
                    {/* Converted: 9% (Amber) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="21.5 238.7" strokeDashoffset="-181.3" />
                    {/* Lost: 5% (Red) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray="12.0 238.7" strokeDashoffset="-202.8" />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-900 leading-tight">265</span>
                    <span className="text-[10px] font-bold text-slate-500 leading-none">Total Leads</span>
                  </div>
                </div>

                {/* Legend Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      New Leads
                    </span>
                    <span className="font-black text-slate-900">98 (37%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                      Contacted
                    </span>
                    <span className="font-black text-slate-900">72 (27%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      In Discussion
                    </span>
                    <span className="font-black text-slate-900">32 (12%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      Converted
                    </span>
                    <span className="font-black text-slate-900">24 (9%)</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Lost
                    </span>
                    <span className="font-black text-slate-900">14 (5%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer">
                <span>View Full Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card B: Leads Trend (Line / Area Chart) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Leads Trend</h3>
                <button className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer">
                  <span>This Month</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Chart SVG View */}
              <div className="py-2 relative">
                <div className="h-44 w-full flex flex-col justify-between relative pt-2">
                  
                  {/* Horizontal Grid lines */}
                  <div className="absolute inset-x-8 top-4 border-b border-slate-100 flex items-center">
                    <span className="text-[9.5px] text-slate-400 -ml-7">100</span>
                  </div>
                  <div className="absolute inset-x-8 top-12 border-b border-slate-100 flex items-center">
                    <span className="text-[9.5px] text-slate-400 -ml-7">80</span>
                  </div>
                  <div className="absolute inset-x-8 top-20 border-b border-slate-100 flex items-center">
                    <span className="text-[9.5px] text-slate-400 -ml-7">60</span>
                  </div>
                  <div className="absolute inset-x-8 top-28 border-b border-slate-100 flex items-center">
                    <span className="text-[9.5px] text-slate-400 -ml-7">40</span>
                  </div>
                  <div className="absolute inset-x-8 top-36 border-b border-slate-100 flex items-center">
                    <span className="text-[9.5px] text-slate-400 -ml-7">20</span>
                  </div>

                  {/* SVG Spline Trend Line */}
                  <svg className="w-full h-36 pl-8 pr-2" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10,95 Q 40,85 70,70 T 130,85 T 190,50 T 250,75 T 290,20 L 290,120 L 10,120 Z"
                      fill="url(#blueGradient)"
                    />
                    <path
                      d="M 10,95 Q 40,85 70,70 T 130,85 T 190,50 T 250,75 T 290,20"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                    {/* Points */}
                    <circle cx="10" cy="95" r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="70" cy="70" r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="130" cy="85" r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="190" cy="50" r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="250" cy="75" r="3.5" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="290" cy="20" r="4.5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                  </svg>

                  {/* Active Point Tooltip on 24 May */}
                  <div className="absolute right-4 top-2 bg-white border border-blue-200 shadow-md px-2 py-1 rounded-md text-[10px] font-bold text-slate-800 z-10">
                    <span className="text-slate-500 font-semibold">24 May</span> • <span className="text-blue-700">Leads: 42</span>
                  </div>

                  {/* X Axis Dates */}
                  <div className="flex justify-between pl-8 pr-2 text-[10px] font-semibold text-slate-500 pt-1">
                    <span>1 May</span>
                    <span>7 May</span>
                    <span>13 May</span>
                    <span>19 May</span>
                    <span>24 May</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer">
                <span>View Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card C: Top Lead Sources (Horizontal Progress Bars) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Top Lead Sources</h3>
                <button className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer">
                  <span>This Month</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Progress Bars List */}
              <div className="py-2 space-y-3.5">
                
                {/* Health Camps */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      Health Camps
                    </span>
                    <span>95 (36%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '36%' }}></div>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      Website
                    </span>
                    <span>68 (26%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '26%' }}></div>
                  </div>
                </div>

                {/* Referrals */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      Referrals
                    </span>
                    <span>52 (20%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-amber-600" />
                      Social Media
                    </span>
                    <span>20 (11%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '11%' }}></div>
                  </div>
                </div>

                {/* Others */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      Others
                    </span>
                    <span>20 (7%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-400 h-2 rounded-full" style={{ width: '7%' }}></div>
                  </div>
                </div>

              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer">
                <span>View Full Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 3: RECENT LEADS, UPCOMING HEALTH CAMPS & CAMPAIGN PERFORMANCE (3 CARDS) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Card 1: Recent Leads */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Recent Leads</h3>
                <button 
                  onClick={() => setActiveNav('Leads')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="py-2 divide-y divide-slate-100">
                {leadsList.map((lead) => (
                  <div 
                    key={lead.id} 
                    onClick={() => setSelectedLeadModal(lead)}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg p-1.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${lead.bg}`}>
                        {lead.initials}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{lead.name}</div>
                        <div className="text-[10.5px] text-slate-500">{lead.problem}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{lead.location}</div>
                      <div className="text-[10px] text-slate-400">{lead.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div 
                onClick={() => setActiveNav('Leads')}
                className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <span>View All Leads</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Upcoming Health Camps */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Upcoming Health Camps</h3>
                <button 
                  onClick={() => setActiveNav('Health Camps')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="py-2 divide-y divide-slate-100">
                
                {/* Event 1 */}
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-800 shrink-0">
                      <span className="text-xs font-black leading-none">25</span>
                      <span className="text-[9px] font-bold uppercase text-slate-500 leading-none mt-0.5">May</span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Free Cardiology Camp</div>
                      <div className="text-[10px] text-slate-500">Mulugu Government School</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">Mulugu</div>
                    <div className="text-[10px] text-slate-400">9:00 AM - 1:00 PM</div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-800 shrink-0">
                      <span className="text-xs font-black leading-none">26</span>
                      <span className="text-[9px] font-bold uppercase text-slate-500 leading-none mt-0.5">May</span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Diabetes Screening Camp</div>
                      <div className="text-[10px] text-slate-500">Primary Health Center</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">Bhupalpally</div>
                    <div className="text-[10px] text-slate-400">10:00 AM - 2:00 PM</div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-800 shrink-0">
                      <span className="text-xs font-black leading-none">27</span>
                      <span className="text-[9px] font-bold uppercase text-slate-500 leading-none mt-0.5">May</span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">General Health Camp</div>
                      <div className="text-[10px] text-slate-500">ZP High School</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">Hanamkonda</div>
                    <div className="text-[10px] text-slate-400">9:00 AM - 2:00 PM</div>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-800 shrink-0">
                      <span className="text-xs font-black leading-none">28</span>
                      <span className="text-[9px] font-bold uppercase text-slate-500 leading-none mt-0.5">May</span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Women's Health Camp</div>
                      <div className="text-[10px] text-slate-500">Community Health Center</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">Warangal</div>
                    <div className="text-[10px] text-slate-400">10:00 AM - 2:00 PM</div>
                  </div>
                </div>

              </div>

              <div 
                onClick={() => setActiveNav('Health Camps')}
                className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <span>View All Camps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Campaign Performance Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Campaign Performance</h3>
                <button className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer">
                  <span>This Month</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <div className="py-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10.5px] font-bold text-slate-400 border-b border-slate-100 pb-1">
                      <th className="pb-1.5 font-bold">Campaign</th>
                      <th className="pb-1.5 font-bold text-center">Leads</th>
                      <th className="pb-1.5 font-bold text-right">Cost</th>
                      <th className="pb-1.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    
                    <tr>
                      <td className="py-2 font-bold text-slate-900">Heart Care Awareness</td>
                      <td className="py-2 text-center text-slate-700">76</td>
                      <td className="py-2 text-right text-slate-700 font-medium">₹18,500</td>
                      <td className="py-2 text-right">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 font-bold text-slate-900">Diabetes Checkup Drive</td>
                      <td className="py-2 text-center text-slate-700">76</td>
                      <td className="py-2 text-right text-slate-700 font-medium">₹18,500</td>
                      <td className="py-2 text-right">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 font-bold text-slate-900">Orthopedic Camp Promo</td>
                      <td className="py-2 text-center text-slate-700">42</td>
                      <td className="py-2 text-right text-slate-700 font-medium">₹11,000</td>
                      <td className="py-2 text-right">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 font-bold text-slate-900">Membership Drive</td>
                      <td className="py-2 text-center text-slate-700">32</td>
                      <td className="py-2 text-right text-slate-700 font-medium">₹9,800</td>
                      <td className="py-2 text-right">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-2 font-bold text-slate-900">Women Health Awareness</td>
                      <td className="py-2 text-center text-slate-700">29</td>
                      <td className="py-2 text-right text-slate-700 font-medium">₹7,550</td>
                      <td className="py-2 text-right">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              <div 
                onClick={() => setActiveNav('Campaigns')}
                className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <span>View All Campaigns</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 4: TEAM ACTIVITY & TASKS OVERVIEW (2 COLUMNS) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Card: Team Activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Team Activity</h3>
                <button 
                  onClick={() => setActiveNav('Team Activity')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="py-2 space-y-3">
                
                {/* Item 1 */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/src/assets/images/doctor_prakash_kumar_1787230378706.jpg"
                      alt="Rohit Verma"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="text-slate-800">
                      <strong>Rohit Verma</strong> added 2 new leads
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0">10 min ago</span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/src/assets/images/doctor_anusha_reddy_1787230366958.jpg"
                      alt="Anita Sharma"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="text-slate-800">
                      <strong>Anita Sharma</strong> scheduled Health Camp at Mulugu
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0">1 hr ago</span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/src/assets/images/partner_doctor_kims_1787229821989.jpg"
                      alt="Vikram Singh"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="text-slate-800">
                      <strong>Vikram Singh</strong> converted a lead to membership
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0">1 hr ago</span>
                </div>

                {/* Item 4 */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/src/assets/images/support_agent_female_1785560510481.jpg"
                      alt="Pooja Verma"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="text-slate-800">
                      <strong>Pooja Verma</strong> updated campaign "Heart Care Awareness"
                    </div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0">3 hr ago</span>
                </div>

              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer">
                <span>View Full Team Stream</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Right Card: Tasks Overview (4 Status Cards) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Tasks Overview</h3>
                <button 
                  onClick={() => setActiveNav('Tasks')}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="py-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* 1. Pending Tasks */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-blue-950">12</div>
                  <div className="text-[10.5px] font-bold text-blue-800">Pending Tasks</div>
                </div>

                {/* 2. In Progress */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-amber-950">8</div>
                  <div className="text-[10.5px] font-bold text-amber-800">In Progress</div>
                </div>

                {/* 3. Completed */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-emerald-950">5</div>
                  <div className="text-[10.5px] font-bold text-emerald-800">Completed</div>
                </div>

                {/* 4. Overdue */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-rose-950">3</div>
                  <div className="text-[10.5px] font-bold text-rose-800">Overdue</div>
                </div>

              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer">
                <span>Manage Marketing Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* FOOTER BAR (EXACT AS IMAGE 2) */}
          {/* ===================================================================== */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-center gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>For any queries or support, contact Marketing Support:</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <a href="tel:08704210820" className="hover:text-blue-700">0870-4210820</a>
              <span>|</span>
              <a href="mailto:marketing@ayudhvikasfoundation.org" className="hover:text-blue-700">marketing@ayudhvikasfoundation.org</a>
            </div>
          </div>
            </>
          )}

        </main>

      </div>

      {/* ======================================================================= */}
      {/* MODAL: ADD NEW LEAD */}
      {/* ======================================================================= */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Marketing Lead</h3>
                  <p className="text-[11px] text-slate-500">Capture patient enquiry / field camp lead</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient / Lead Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Rajesh Reddy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact *</label>
                <input
                  type="tel"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / Location</label>
                  <select
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
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
                  <label className="block font-bold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Health Camps">Health Camps</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Walk-in">Direct Walk-in</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Health Requirement / Specialty</label>
                <input
                  type="text"
                  value={newLeadForm.requirement}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, requirement: e.target.value })}
                  placeholder="e.g. Cardiology OPD / Diabetes Camp Checkup"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#152e4d] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: VIEW LEAD DETAILS */}
      {/* ======================================================================= */}
      {selectedLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${selectedLeadModal.bg}`}>
                  {selectedLeadModal.initials}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedLeadModal.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedLeadModal.problem}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLeadModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Lead ID:</span>
                <span className="font-bold text-slate-900">{selectedLeadModal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-slate-900">{selectedLeadModal.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {selectedLeadModal.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Manager:</span>
                <span className="font-bold text-slate-900">Rohit Kumar</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <a
                href="tel:08704210820"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Patient</span>
              </a>
              <button
                onClick={() => setSelectedLeadModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: CONTACT MARKETING SUPPORT */}
      {/* ======================================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Marketing Support Desk</h3>
                  <p className="text-[11px] text-slate-500">Ayudh Vikas Central Operational Support</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-1">
                <div className="font-black text-blue-900">Direct Helpline:</div>
                <a href="tel:08704210820" className="text-sm font-black text-blue-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>0870-4210820 (24x7)</span>
                </a>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <div className="font-black text-emerald-900">Support Email:</div>
                <a href="mailto:marketing@ayudhvikasfoundation.org" className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>marketing@ayudhvikasfoundation.org</span>
                </a>
              </div>

              <p className="text-slate-500 text-[11px] leading-relaxed">
                For urgent budget approvals, new hospital tie-ups, or medical camp coordination, please contact the Foundation Central Headquarters.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-5 py-2 bg-[#0f2e5a] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-[#152e4d]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
