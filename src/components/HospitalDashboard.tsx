import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Edit3,
  FileText,
  Headphones,
  HeartPulse,
  IndianRupee,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Doctor, HospitalPartner, HospitalVisitRequest, SeniorDoctor } from '../types';
import { INITIAL_HOSPITAL_VISIT_REQUESTS, PARTNER_HOSPITALS, SPECIALITIES } from '../data/mockData';
import { PatientVerificationSection, VerifiedAyudhPatient } from './PatientVerificationSection';
import { ClinicalSessionPanel } from './ClinicalSessionPanel';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';

interface HospitalDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  visitRequests?: HospitalVisitRequest[];
  onUpdateVisitRequestStatus?: (
    requestId: string,
    newStatus: HospitalVisitRequest['status'],
    updateData?: Partial<HospitalVisitRequest>
  ) => void;
}

type HospitalNav =
  | 'Dashboard'
  | 'Appointments'
  | 'Patients'
  | 'Consultations'
  | 'Doctors Management'
  | 'Prescriptions'
  | 'Reports'
  | 'Earnings'
  | 'Subscription'
  | 'Profile'
  | 'Availability'
  | 'Messages'
  | 'Notifications'
  | 'Support'
  | 'Settings';

type HospitalDoctor = Partial<Doctor & SeniorDoctor> & {
  id: string;
  hospitalName?: string;
  qualifications?: string;
};

const defaultHospital: HospitalPartner = {
  id: 'hosp-1',
  name: 'Ayudh Vikas Partner Hospital',
  shortName: 'AVH',
  district: 'Warangal',
  location: 'Warangal',
  address: 'Warangal, Telangana',
  phone: '9000045073',
  emergencyPhone: '1800 123 4567',
  rating: 4.8,
  totalReviews: 384,
  totalBeds: 150,
  availableBeds: 42,
  icuBeds: 12,
  specialities: ['Cardiology', 'General Medicine', 'Emergency Care'],
  seniorDoctors: [],
  facilities: ['24x7 Emergency', 'ICU', 'Diagnostic Lab', 'Ayudh Cashless Desk'],
  logoText: 'AVH',
  logoBg: 'bg-emerald-700',
  hasAyudhCashless: true,
  isOpen24x7: true,
};

const fallbackDoctors: HospitalDoctor[] = [
  {
    id: 'doc-hosp-1',
    name: 'Dr. V. Rajeshwar Rao',
    designation: 'Chief Senior Consultant',
    speciality: 'Cardiology',
    qualification: 'MBBS, MD, DM',
    experienceYears: 22,
    rating: 4.9,
    opdTimings: 'Mon - Sat: 09:30 AM - 02:30 PM',
    roomNumber: 'OPD Suite 102',
    consultationFee: 700,
    status: 'Active',
  },
  {
    id: 'doc-hosp-2',
    name: 'Dr. P. Suresh Reddy',
    designation: 'Senior Consultant',
    speciality: 'Neurology',
    qualification: 'MBBS, MD, DM',
    experienceYears: 18,
    rating: 4.8,
    opdTimings: 'Mon - Fri: 10:00 AM - 03:00 PM',
    roomNumber: 'OPD Suite 108',
    consultationFee: 650,
    status: 'Active',
  },
  {
    id: 'doc-hosp-3',
    name: 'Dr. M. Sandhya Rani',
    designation: 'Senior Consultant',
    speciality: 'Gynecology',
    qualification: 'MBBS, MS, DGO',
    experienceYears: 16,
    rating: 4.9,
    opdTimings: 'Mon - Sat: 11:00 AM - 04:00 PM',
    roomNumber: 'Women Care OPD 204',
    consultationFee: 600,
    status: 'Active',
  },
];

const notifications = [
  { title: 'New patient visit request', subtitle: 'Cardiology OPD requested for 10:30 AM', time: '10 min ago', icon: Calendar },
  { title: 'Doctor status updated', subtitle: 'OPD availability changed by hospital admin', time: '1 hour ago', icon: Stethoscope },
  { title: 'Subscription active', subtitle: 'Growth plan renewal is valid this month', time: '2 hours ago', icon: CreditCard },
];

const scheduleItems = [
  { day: '24', month: 'May', title: 'Health Checkup Camp', location: 'Warangal, MGM Hospital', time: '09:00 AM - 04:00 PM' },
  { day: '26', month: 'May', title: 'Cardiology OP', location: 'Ayudh Vikas Desk', time: '10:00 AM - 01:00 PM' },
  { day: '28', month: 'May', title: 'Awareness Program', location: 'Hanamkonda', time: '03:00 PM - 05:00 PM' },
];

const statusClasses: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  'In OPD': 'bg-sky-50 text-sky-700 border-sky-300',
  'On Leave': 'bg-rose-50 text-rose-700 border-rose-300',
  'Emergency Only': 'bg-amber-50 text-amber-700 border-amber-300',
};

const emptyDoctorForm = {
  id: '',
  name: '',
  designation: 'Senior Consultant',
  speciality: 'Cardiology',
  qualification: 'MBBS, MD',
  experienceYears: '8',
  opdTimings: 'Mon - Sat: 10:00 AM - 02:00 PM',
  roomNumber: 'OPD Suite 101',
  consultationFee: '600',
  status: 'Active' as NonNullable<SeniorDoctor['status']>,
  phone: '',
  email: '',
};

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
    <div className="text-[10px] uppercase font-black text-slate-400">{label}</div>
    <div className="text-xs font-black text-slate-900 mt-1">{value}</div>
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, type = 'text', required }) => (
  <label className="space-y-1">
    <span className="font-black text-slate-700">{label}{required ? ' *' : ''}</span>
    <input
      required={required}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </label>
);

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  onLogout,
  onNavigateHome,
  visitRequests,
  onUpdateVisitRequestStatus,
}) => {
  const { user } = useAuth();
  const { collections, create, update, remove } = useLiveData();
  const [activeNav, setActiveNav] = useState<HospitalNav>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const liveHospitals = collections.hospitals.length ? (collections.hospitals as HospitalPartner[]) : PARTNER_HOSPITALS;
  const currentHospital = useMemo(() => {
    return (
      liveHospitals.find((hospital) => hospital.id === user?.hospitalId) ||
      liveHospitals.find((hospital) => hospital.name === user?.hospitalName) ||
      liveHospitals[0] ||
      defaultHospital
    );
  }, [liveHospitals, user?.hospitalId, user?.hospitalName]);

  const allVisitRequests = (visitRequests && Array.isArray(visitRequests)
    ? visitRequests
    : collections.visit_requests.length
      ? collections.visit_requests
      : INITIAL_HOSPITAL_VISIT_REQUESTS) as HospitalVisitRequest[];

  const hospitalRequests = useMemo(() => {
    const hospitalName = currentHospital.name.toLowerCase();
    const shortName = currentHospital.shortName.toLowerCase();
    return allVisitRequests.filter((request) => {
      const requestHospitalName = request.hospitalName?.toLowerCase() || '';
      return (
        request.hospitalId === currentHospital.id ||
        requestHospitalName.includes(hospitalName) ||
        requestHospitalName.includes(shortName)
      );
    });
  }, [allVisitRequests, currentHospital.id, currentHospital.name, currentHospital.shortName]);

  const hospitalDoctors = useMemo<HospitalDoctor[]>(() => {
    const hospitalName = currentHospital.name.toLowerCase();
    const shortName = currentHospital.shortName.toLowerCase();
    const liveDoctors = (collections.doctors as HospitalDoctor[]).filter((doctor) => {
      const doctorHospital = String(doctor.hospital || '').toLowerCase();
      const doctorHospitalName = String(doctor.hospitalName || '').toLowerCase();
      return (
        doctor.hospitalId === currentHospital.id ||
        doctorHospital === shortName ||
        doctorHospital === hospitalName ||
        doctorHospitalName === hospitalName ||
        doctorHospitalName.includes(shortName)
      );
    });

    if (liveDoctors.length) return liveDoctors;
    if (currentHospital.seniorDoctors?.length) {
      return currentHospital.seniorDoctors.map((doctor) => ({
        ...doctor,
        hospitalId: currentHospital.id,
        hospital: currentHospital.shortName,
        hospitalName: currentHospital.name,
      }));
    }
    return fallbackDoctors.map((doctor) => ({
      ...doctor,
      hospitalId: currentHospital.id,
      hospital: currentHospital.shortName,
      hospitalName: currentHospital.name,
    }));
  }, [collections.doctors, currentHospital]);

  const filteredDoctors = hospitalDoctors.filter((doctor) => {
    const text = `${doctor.name || ''} ${doctor.speciality || ''} ${doctor.designation || ''}`.toLowerCase();
    return text.includes(doctorSearch.toLowerCase());
  });

  const pendingRequests = hospitalRequests.filter((request) => request.status === 'Pending');
  const acceptedRequests = hospitalRequests.filter((request) => ['Accepted', 'Scheduled', 'Completed'].includes(request.status));
  const activeDoctors = hospitalDoctors.filter((doctor) => (doctor.status || 'Active') === 'Active');
  const todayAppointments = Math.max(18, acceptedRequests.length + pendingRequests.length);
  const monthlyRevenue = hospitalDoctors.reduce((sum, doctor) => sum + Number(doctor.consultationFee || 500) * 8, 0) + 48750;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const navigate = (nav: HospitalNav) => {
    setActiveNav(nav);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAddDoctor = () => {
    setEditingDoctorId(null);
    setDoctorForm(emptyDoctorForm);
    setDoctorModalOpen(true);
  };

  const openEditDoctor = (doctor: HospitalDoctor) => {
    setEditingDoctorId(doctor.id);
    setDoctorForm({
      id: doctor.id,
      name: doctor.name || '',
      designation: doctor.designation || 'Senior Consultant',
      speciality: doctor.speciality || 'Cardiology',
      qualification: doctor.qualification || doctor.qualifications || 'MBBS, MD',
      experienceYears: String(doctor.experienceYears || 5),
      opdTimings: doctor.opdTimings || doctor.availability || 'Mon - Sat: 10:00 AM - 02:00 PM',
      roomNumber: doctor.roomNumber || 'OPD Suite 101',
      consultationFee: String(doctor.consultationFee || 600),
      status: (doctor.status || 'Active') as NonNullable<SeniorDoctor['status']>,
      phone: doctor.phone || '',
      email: doctor.email || '',
    });
    setDoctorModalOpen(true);
  };

  const saveDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    const enteredName = doctorForm.name.trim();
    if (!enteredName) return;
    const name = enteredName.startsWith('Dr.') ? enteredName : `Dr. ${enteredName}`;

    const payload = {
      name,
      designation: doctorForm.designation,
      speciality: doctorForm.speciality,
      qualification: doctorForm.qualification,
      qualifications: doctorForm.qualification,
      experienceYears: Number(doctorForm.experienceYears) || 0,
      rating: editingDoctorId ? undefined : 4.8,
      opdTimings: doctorForm.opdTimings,
      availability: doctorForm.opdTimings,
      roomNumber: doctorForm.roomNumber,
      consultationFee: Number(doctorForm.consultationFee) || 0,
      status: doctorForm.status,
      phone: doctorForm.phone,
      email: doctorForm.email,
      hospitalId: currentHospital.id,
      hospital: currentHospital.shortName,
      hospitalName: currentHospital.name,
      district: currentHospital.district,
      location: currentHospital.location || currentHospital.district,
    };

    try {
      if (editingDoctorId) {
        await update('doctors', editingDoctorId, payload);
        showToast('Doctor details updated successfully.');
      } else {
        await create('doctors', payload);
        showToast('Doctor added to this hospital successfully.');
      }
      setDoctorModalOpen(false);
      setEditingDoctorId(null);
      setDoctorForm(emptyDoctorForm);
    } catch (error) {
      console.error(error);
      showToast('Doctor save failed. Please check the server connection.');
    }
  };

  const deleteDoctor = async (doctor: HospitalDoctor) => {
    try {
      await remove('doctors', doctor.id);
      showToast('Doctor removed from this hospital.');
    } catch (error) {
      console.error(error);
      showToast('Doctor delete failed. Please check the server connection.');
    }
  };

  const toggleDoctorStatus = async (doctor: HospitalDoctor) => {
    const nextStatus = doctor.status === 'Active' ? 'On Leave' : doctor.status === 'On Leave' ? 'Emergency Only' : 'Active';
    try {
      await update('doctors', doctor.id, { status: nextStatus });
      showToast('Doctor duty status updated.');
    } catch (error) {
      console.error(error);
      showToast('Unable to update doctor status.');
    }
  };

  const updateRequestStatus = async (request: HospitalVisitRequest, status: HospitalVisitRequest['status']) => {
    const tokenNumber = status === 'Accepted' ? `${currentHospital.shortName}-OPD-${Math.floor(100 + Math.random() * 899)}` : request.tokenNumber;
    const updateData = {
      status,
      tokenNumber,
      acceptedAt: status === 'Accepted' ? 'Today, Just Now' : request.acceptedAt,
      reportingRoom: request.reportingRoom || 'Ayudh Desk, Ground Floor',
      hospitalNotes: status === 'Accepted' ? 'Visit accepted. Please report 15 minutes before the slot.' : request.hospitalNotes,
    };
    try {
      await update('visit_requests', request.id, updateData);
      onUpdateVisitRequestStatus?.(request.id, status, updateData);
      showToast(`Visit request ${status.toLowerCase()}.`);
    } catch (error) {
      console.error(error);
      showToast('Visit request update failed.');
    }
  };

  const handlePatientVerified = (patient: VerifiedAyudhPatient, method: string) => {
    showToast(`${patient.name} verified through ${method}.`);
  };

  const handleWalkInAddedToQueue = (patient: VerifiedAyudhPatient, tokenNumber: string) => {
    showToast(`${patient.name} added to walk-in queue with token ${tokenNumber}.`);
  };

  const navItems: Array<{ label: HospitalNav; icon: React.ElementType; count?: number; badge?: string }> = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Appointments', icon: Calendar, count: todayAppointments },
    { label: 'Patients', icon: Users, badge: 'Verify' },
    { label: 'Consultations', icon: Stethoscope },
    { label: 'Doctors Management', icon: Building2, count: hospitalDoctors.length },
    { label: 'Prescriptions', icon: FileText },
    { label: 'Reports', icon: BarChart3 },
    { label: 'Earnings', icon: IndianRupee },
    { label: 'Subscription', icon: CreditCard },
    { label: 'Profile', icon: UserRound },
    { label: 'Availability', icon: Clock },
    { label: 'Messages', icon: Users, count: 3 },
    { label: 'Notifications', icon: Bell, count: 5 },
    { label: 'Support', icon: LifeBuoy },
    { label: 'Settings', icon: Settings },
  ];

  const metricCards = [
    { title: "Today's Appointments", value: todayAppointments, icon: Calendar, color: 'blue', action: 'View All', target: 'Appointments' as HospitalNav, sub: `${pendingRequests.length} pending` },
    { title: 'Total Patients', value: Math.max(256, collections.patients.length || 0), icon: Users, color: 'emerald', action: 'View All', target: 'Patients' as HospitalNav, sub: 'Network patients' },
    { title: 'Consultations Today', value: Math.max(32, acceptedRequests.length * 2), icon: Stethoscope, color: 'purple', action: 'View OPD', target: 'Consultations' as HospitalNav, sub: `${activeDoctors.length} doctors active` },
    { title: 'Patient Rating', value: `${currentHospital.rating || 4.8}`, icon: Star, color: 'amber', action: 'View Reviews', target: 'Reports' as HospitalNav, sub: `/ 5 (${currentHospital.totalReviews || 384})` },
    { title: 'This Month Earnings', value: `Rs. ${monthlyRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'blue', action: 'View Details', target: 'Earnings' as HospitalNav, sub: 'OPD + network' },
  ];

  const renderMetricCard = (card: (typeof metricCards)[number]) => {
    const colorMap: Record<string, { box: string; icon: string; border: string; text: string }> = {
      blue: { box: 'bg-blue-50', icon: 'bg-blue-600 text-white', border: 'border-blue-200', text: 'text-blue-700' },
      emerald: { box: 'bg-emerald-50', icon: 'bg-emerald-600 text-white', border: 'border-emerald-200', text: 'text-emerald-700' },
      purple: { box: 'bg-purple-50', icon: 'bg-purple-600 text-white', border: 'border-purple-200', text: 'text-purple-700' },
      amber: { box: 'bg-amber-50', icon: 'bg-amber-500 text-white', border: 'border-amber-200', text: 'text-amber-700' },
    };
    const palette = colorMap[card.color];
    const Icon = card.icon;
    return (
      <button
        key={card.title}
        onClick={() => navigate(card.target)}
        className={`${palette.box} ${palette.border} border rounded-lg p-3 min-h-[104px] text-left shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`${palette.icon} w-9 h-9 rounded-full flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </span>
          <div className="text-right min-w-0">
            <div className="text-2xl font-black text-slate-950 leading-none truncate">{card.value}</div>
            <div className="text-[10px] font-bold text-slate-700 mt-1 truncate">{card.title}</div>
            <div className="text-[10px] font-semibold text-slate-500 truncate">{card.sub}</div>
          </div>
        </div>
        <div className={`border-t ${palette.border} pt-2 mt-2 flex items-center justify-between text-[11px] font-black ${palette.text}`}>
          <span>{card.action}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
    );
  };

  const renderDoctorsManagement = () => (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">Doctors Management</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={doctorSearch}
                onChange={(event) => setDoctorSearch(event.target.value)}
                placeholder="Search doctors"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <button onClick={openAddDoctor} className="bg-[#00703c] hover:bg-[#005f33] text-white text-xs font-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <article key={doctor.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-950 truncate">{doctor.name}</h3>
                <p className="text-[11px] font-bold text-emerald-700">{doctor.speciality}</p>
                <p className="text-[11px] text-slate-500 font-semibold line-clamp-2">{doctor.designation || 'Senior Consultant'}</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg border shrink-0 ${statusClasses[doctor.status || 'Active'] || statusClasses.Active}`}>
                {doctor.status || 'Active'}
              </span>
            </div>

            <div className="my-4 rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="font-bold text-slate-500">Qualification</span>
                <span className="font-black text-slate-800 text-right">{doctor.qualification || doctor.qualifications || 'MBBS, MD'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-bold text-slate-500">Experience</span>
                <span className="font-black text-slate-800">{doctor.experienceYears || 5} years</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-bold text-slate-500">Room</span>
                <span className="font-black text-emerald-700">{doctor.roomNumber || 'OPD Suite 101'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="font-bold text-slate-500">Fee</span>
                <span className="font-black text-slate-950">Rs. {doctor.consultationFee || 500}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
                {doctor.opdTimings || doctor.availability || 'Mon - Sat: 10:00 AM - 02:00 PM'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => toggleDoctorStatus(doctor)} className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black py-2 cursor-pointer">
                Duty
              </button>
              <button onClick={() => openEditDoctor(doctor)} className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-black py-2 flex items-center justify-center gap-1 cursor-pointer">
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button onClick={() => deleteDoctor(doctor)} className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-black py-2 flex items-center justify-center gap-1 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );

  const renderAppointments = () => (
    <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950">Hospital Appointment Requests</h2>
          <p className="text-xs font-semibold text-slate-500">Accept, reject, and monitor visit requests for this hospital.</p>
        </div>
        <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-black shrink-0">{pendingRequests.length} Pending</span>
      </div>
      <div className="divide-y divide-slate-100">
        {hospitalRequests.map((request) => (
          <div key={request.id} className="py-4 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_auto] gap-3 items-center text-xs">
            <div>
              <div className="font-black text-slate-950">{request.patientName}</div>
              <div className="text-[11px] font-semibold text-slate-500">{request.patientPhone} - {request.patientAge || '--'} Y / {request.patientGender || 'Patient'}</div>
            </div>
            <div>
              <div className="font-black text-blue-700">{request.department} - {request.visitType}</div>
              <div className="text-[11px] font-semibold text-slate-500">{request.preferredDate}, {request.preferredTimeSlot}</div>
            </div>
            <div className="flex items-center justify-start lg:justify-end gap-2">
              <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${request.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                {request.status}
              </span>
              {request.status === 'Pending' && (
                <>
                  <button onClick={() => updateRequestStatus(request, 'Accepted')} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 font-black cursor-pointer">Accept</button>
                  <button onClick={() => updateRequestStatus(request, 'Rejected')} className="rounded-lg bg-rose-50 text-rose-700 px-3 py-1.5 font-black cursor-pointer">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderProfile = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <h2 className="text-base font-black text-slate-950">Hospital Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Info label="Hospital" value={currentHospital.name} />
          <Info label="District" value={currentHospital.district} />
          <Info label="Phone" value={currentHospital.phone || '9000045073'} />
          <Info label="Emergency" value={currentHospital.emergencyPhone || '1800 123 4567'} />
          <Info label="Beds" value={`${currentHospital.availableBeds || 0} available / ${currentHospital.totalBeds || 0} total`} />
          <Info label="Rating" value={`${currentHospital.rating || 4.8} / 5`} />
        </div>
      </section>
      <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <h2 className="text-base font-black text-slate-950">Enabled Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {['Ayudh Cashless Desk', 'Visit Requests', 'Doctor CRUD', 'Priority Listing', 'Analytics', 'Emergency Support'].map((feature) => (
            <div key={feature} className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              {feature}
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">{metricCards.map(renderMetricCard)}</div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1.15fr_0.85fr] gap-4">
        <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-950">Today's Hospital Appointments</h3>
            <button onClick={() => navigate('Appointments')} className="text-[11px] font-black text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 cursor-pointer">
              View Calendar
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {(hospitalRequests.length ? hospitalRequests : INITIAL_HOSPITAL_VISIT_REQUESTS).slice(0, 5).map((request, index) => (
              <div key={request.id} className="py-3 grid grid-cols-[48px_1fr_auto] gap-3 items-center text-xs">
                <div className="font-black text-slate-950">
                  {['09:30', '10:30', '11:30', '12:30', '02:00'][index] || '03:00'}
                  <span className="block text-[10px] text-slate-500">{index < 4 ? 'AM' : 'PM'}</span>
                </div>
                <div>
                  <div className="font-black text-slate-950">{request.patientName}</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {request.patientAge || 48} Y / {request.patientGender || 'Patient'} - {request.department}
                  </div>
                </div>
                <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${request.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('Appointments')} className="w-full border-t border-slate-100 pt-3 text-[11px] font-black text-blue-700 flex items-center justify-center gap-1 cursor-pointer">
            View All Appointments <ChevronRight className="w-3 h-3" />
          </button>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-950">Hospital Overview <span className="text-[11px] font-semibold text-slate-500">(This Month)</span></h3>
            <select className="text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-7 min-h-[190px]">
            <div className="relative w-32 h-32 rounded-full border-[18px] border-blue-600">
              <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-b-emerald-600 border-l-orange-500 border-t-purple-600 rotate-45" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full">
                <span className="text-xl font-black text-slate-950">{Math.max(356, hospitalRequests.length)}</span>
                <span className="text-[10px] font-semibold text-slate-500">Total</span>
              </div>
            </div>
            <div className="space-y-2 text-xs min-w-[190px]">
              {[
                ['Completed', 162, 'bg-blue-600'],
                ['Confirmed', 98, 'bg-emerald-600'],
                ['Cancelled', 32, 'bg-sky-600'],
                ['No Show', 28, 'bg-orange-500'],
                ['Reschedule', 36, 'bg-purple-600'],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    {label}
                  </span>
                  <span className="font-black text-slate-950">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('Reports')} className="w-full border-t border-slate-100 pt-3 text-[11px] font-black text-blue-700 flex items-center justify-center gap-1 cursor-pointer">
            View Full Report <ChevronRight className="w-3 h-3" />
          </button>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-black text-slate-950">Upcoming Schedule</h3>
            <button onClick={() => navigate('Availability')} className="text-[11px] font-black text-blue-700 cursor-pointer">View All</button>
          </div>
          <div className="space-y-4">
            {scheduleItems.map((item, index) => (
              <div key={item.title} className="grid grid-cols-[45px_1fr] gap-3 text-xs">
                <div className="border border-slate-200 bg-slate-50 rounded-lg h-12 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-950">{item.day}</span>
                  <span className="text-[10px] font-bold text-slate-500">{item.month}</span>
                </div>
                <div className="relative pl-4">
                  <span className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-emerald-600' : 'bg-purple-600'}`} />
                  <div className="font-black text-slate-950">{item.title}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{item.location}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-950">Doctors Summary</h3>
            <button onClick={() => navigate('Doctors Management')} className="text-[11px] font-black text-blue-700 cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {[
              ['Active Doctors', activeDoctors.length, 'bg-blue-50 text-blue-700'],
              ['On Leave', hospitalDoctors.filter((doctor) => doctor.status === 'On Leave').length, 'bg-emerald-50 text-emerald-700'],
              ['Departments', currentHospital.specialities.length, 'bg-orange-50 text-orange-700'],
            ].map(([label, value, cls]) => (
              <div key={String(label)} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cls}`}><Users className="w-3.5 h-3.5" /></span>
                  {label}
                </span>
                <span className="font-black text-slate-950">{String(value)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-950">Recent Consultations</h3>
            <button onClick={() => navigate('Consultations')} className="text-[11px] font-black text-blue-700 cursor-pointer">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {hospitalRequests.slice(0, 4).map((request) => (
              <div key={request.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-black text-slate-950">{request.patientName}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{request.preferredDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-blue-700">{request.department}</div>
                  <div className="text-[10px] text-slate-500">{request.doctorName || 'Doctor assignment pending'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-950">Notifications</h3>
            <button onClick={() => navigate('Notifications')} className="text-[11px] font-black text-blue-700 cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="grid grid-cols-[34px_1fr_auto] gap-3 text-xs items-start">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-black text-slate-950">{item.title}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{item.subtitle}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.time}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );

  const renderGenericPanel = () => {
    if (activeNav === 'Patients') {
      return <PatientVerificationSection onPatientVerified={handlePatientVerified} onWalkInAddedToQueue={handleWalkInAddedToQueue} />;
    }
    if (activeNav === 'Reports' || activeNav === 'Prescriptions') {
      return <ClinicalSessionPanel roleLabel="Hospital" title="Authorized Patients" />;
    }
    if (activeNav === 'Doctors Management') return renderDoctorsManagement();
    if (activeNav === 'Appointments') return renderAppointments();
    if (activeNav === 'Profile' || activeNav === 'Subscription' || activeNav === 'Settings') return renderProfile();

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-950">{activeNav}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {activeNav} for {currentHospital.name} follows the same operational layout as the doctor role screen.
            </p>
          </div>
          <button onClick={() => navigate('Dashboard')} className="rounded-lg bg-blue-50 text-blue-700 px-3 py-2 text-xs font-black cursor-pointer">
            Back to Dashboard
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {metricCards.slice(0, 3).map(renderMetricCard)}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#132d4b] text-white rounded-lg shadow-xl px-4 py-3 text-xs font-black flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {toast}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-sm">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={onNavigateHome}>
              <div className="w-9 h-9 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-600">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <h1 className="text-sm font-black text-[#0f2e5a] tracking-tight leading-none uppercase">AYUDH VIKAS</h1>
                <span className="text-[9px] font-extrabold text-[#006633] tracking-wider uppercase">HEALTH CARE NETWORK</span>
                <span className="text-[7.5px] font-semibold text-slate-500">Care Beyond Boundaries</span>
              </div>
            </button>

            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer" title="Toggle sidebar">
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex flex-col min-w-0">
              <h2 className="text-sm font-black text-slate-900 truncate">Welcome, {user?.displayName || user?.name || 'Hospital Admin'}</h2>
              <p className="text-[11px] text-slate-500 font-medium truncate">Here is what is happening with {currentHospital.shortName} today.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button onClick={() => navigate('Patients')} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">Verify Walk-In Patient</span>
            </button>
            <button onClick={() => navigate('Support')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer">
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Hospital Support</span>
            </button>
            <button onClick={() => navigate('Notifications')} className="relative w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-600 bg-white cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">5</span>
            </button>
            <div className="relative">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                <div className="relative">
                  <div className={`${currentHospital.logoBg || 'bg-emerald-700'} w-8 h-8 rounded-full text-white flex items-center justify-center text-[10px] font-black border border-slate-200`}>
                    {currentHospital.logoText || 'AVH'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="hidden sm:flex flex-col text-left max-w-[170px]">
                  <span className="text-xs font-black text-slate-800 leading-tight truncate">{currentHospital.shortName}</span>
                  <span className="text-[10px] text-slate-500 font-semibold leading-tight truncate">Hospital Admin</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentHospital.name}</p>
                    <p className="text-[10px] text-slate-500">{user?.email || currentHospital.phone}</p>
                    <p className="text-[9px] text-emerald-700 font-bold mt-0.5">Partner Hospital Portal</p>
                  </div>
                  {(['Profile', 'Doctors Management', 'Subscription', 'Settings'] as HospitalNav[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        navigate(item);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                    >
                      <UserRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1" />
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full flex-1 flex p-3 sm:p-4 gap-4 items-start">
        <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} shrink-0 transition-all duration-200 space-y-3 sticky top-16 hidden md:block`}>
          <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.label)}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active ? 'bg-[#152e4d] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </span>
                  {sidebarOpen && item.count !== undefined && (
                    <span className={`${active ? 'bg-white/15 text-white' : 'bg-blue-100 text-blue-800'} w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center`}>
                      {item.count}
                    </span>
                  )}
                  {sidebarOpen && item.badge && (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {sidebarOpen && (
            <div className="bg-[#132d4b] text-white rounded-lg p-3 shadow-sm text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-blue-500/20 text-blue-200 flex items-center justify-center mb-2">
                <Headphones className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black">Need Help?</h3>
              <p className="text-[10px] text-slate-300 font-semibold mb-3">Hospital operations support</p>
              <button onClick={() => navigate('Support')} className="w-full bg-white text-slate-950 rounded-lg py-2 text-xs font-black cursor-pointer">Contact Support</button>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 space-y-4">
          <div className="md:hidden bg-white border border-slate-200 rounded-lg p-2 flex gap-2 overflow-x-auto">
            {navItems.slice(0, 8).map((item) => (
              <button key={item.label} onClick={() => navigate(item.label)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black ${activeNav === item.label ? 'bg-[#152e4d] text-white' : 'bg-slate-50 text-slate-700'}`}>
                {item.label}
              </button>
            ))}
          </div>
          {activeNav === 'Dashboard' ? renderDashboard() : renderGenericPanel()}
        </main>
      </div>

      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveDoctor} className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">{editingDoctorId ? 'Edit Doctor' : 'Add Doctor'}</h2>
                <p className="text-xs font-semibold text-slate-500">{currentHospital.name}</p>
              </div>
              <button type="button" onClick={() => setDoctorModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <Field label="Doctor Name" required value={doctorForm.name} onChange={(value) => setDoctorForm({ ...doctorForm, name: value })} />
              <Field label="Designation" value={doctorForm.designation} onChange={(value) => setDoctorForm({ ...doctorForm, designation: value })} />
              <label className="space-y-1">
                <span className="font-black text-slate-700">Speciality</span>
                <select
                  value={doctorForm.speciality}
                  onChange={(event) => setDoctorForm({ ...doctorForm, speciality: event.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SPECIALITIES.map((speciality) => <option key={speciality} value={speciality}>{speciality}</option>)}
                </select>
              </label>
              <Field label="Qualification" value={doctorForm.qualification} onChange={(value) => setDoctorForm({ ...doctorForm, qualification: value })} />
              <Field label="Experience Years" type="number" value={doctorForm.experienceYears} onChange={(value) => setDoctorForm({ ...doctorForm, experienceYears: value })} />
              <Field label="Consultation Fee" type="number" value={doctorForm.consultationFee} onChange={(value) => setDoctorForm({ ...doctorForm, consultationFee: value })} />
              <Field label="OPD Timings" value={doctorForm.opdTimings} onChange={(value) => setDoctorForm({ ...doctorForm, opdTimings: value })} />
              <Field label="Room Number" value={doctorForm.roomNumber} onChange={(value) => setDoctorForm({ ...doctorForm, roomNumber: value })} />
              <Field label="Phone" value={doctorForm.phone} onChange={(value) => setDoctorForm({ ...doctorForm, phone: value })} />
              <Field label="Email" type="email" value={doctorForm.email} onChange={(value) => setDoctorForm({ ...doctorForm, email: value })} />
              <label className="space-y-1 md:col-span-2">
                <span className="font-black text-slate-700">Duty Status</span>
                <select
                  value={doctorForm.status}
                  onChange={(event) => setDoctorForm({ ...doctorForm, status: event.target.value as NonNullable<SeniorDoctor['status']> })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Emergency Only</option>
                  <option>In OPD</option>
                </select>
              </label>
            </div>

            <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDoctorModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 cursor-pointer">Cancel</button>
              <button type="submit" className="rounded-lg bg-[#00703c] px-4 py-2 text-xs font-black text-white cursor-pointer">{editingDoctorId ? 'Save Doctor' : 'Create Doctor'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
