import React, { useState } from 'react';
import { useLiveData } from '../context/LiveDataContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Phone,
  User,
  AlertCircle,
  FileText,
  Stethoscope,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  RotateCcw,
  Check,
  X,
  MapPin,
  HeartPulse,
  Activity,
  AlertTriangle,
  Info,
  CalendarDays
} from 'lucide-react';

export interface DoctorAppointmentItem {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  location: string;
  avatar: string;
  bloodGroup: string;
  bp: string;
  heartRate: string;
  appointmentDate: string; // e.g., '22 Aug 2024'
  appointmentTime: string; // e.g., '09:30 AM'
  timeSlotPeriod: 'Morning' | 'Afternoon' | 'Evening';
  tokenNumber: string; // e.g., 'TK-04'
  visitType: 'Consultation' | 'Follow-up' | 'Emergency Review' | 'ECG & Echo Review';
  reason: string;
  symptoms: string[];
  status: 'Confirmed' | 'Pending' | 'Rejected' | 'Arrived' | 'Completed';
  bookedAt: string;
  rejectionReason?: string;
  rejectedAt?: string;
  patientNotes?: string;
  previousVisitsCount: number;
}

interface DoctorAppointmentsPageProps {
  initialSubTab?: 'confirmed' | 'pending' | 'rejected';
  currentSubTab?: 'confirmed' | 'pending' | 'rejected';
  onSubTabChange?: (tab: 'confirmed' | 'pending' | 'rejected') => void;
  onStartConsultation?: (patient: DoctorAppointmentItem) => void;
  onUpdateProfile?: () => void;
}

export const DoctorAppointmentsPage: React.FC<DoctorAppointmentsPageProps> = ({
  initialSubTab = 'confirmed',
  currentSubTab,
  onSubTabChange,
  onStartConsultation,
  onUpdateProfile
}) => {
  const { collections, update } = useLiveData();
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<'confirmed' | 'pending' | 'rejected'>(currentSubTab || initialSubTab);

  // Synchronize when currentSubTab changes from parent
  React.useEffect(() => {
    if (currentSubTab && currentSubTab !== subTab) {
      setSubTab(currentSubTab);
    }
  }, [currentSubTab]);

  const handleTabSwitch = (tab: 'confirmed' | 'pending' | 'rejected') => {
    setSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentItem | null>(null);
  
  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<DoctorAppointmentItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [quickReasonSelected, setQuickReasonSelected] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  // Confirmation modal state
  const [confirmingItem, setConfirmingItem] = useState<DoctorAppointmentItem | null>(null);
  const [confirmDate, setConfirmDate] = useState('2024-08-22');
  const [confirmTime, setConfirmTime] = useState('10:00 AM');

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  React.useEffect(() => {
    const doctorId = user?.doctorId;
    const live = (collections.appointments || []).filter((a: any) =>
      !doctorId || a.doctorId === doctorId || String(a.doctorName || '').toLowerCase().includes('ravi teja')
    );
    if (!live.length) return;
    setAppointments(() => {
      const mapped = live.map((a: any) => ({
        id: a.id,
        patientName: a.patientName || a.name || 'Patient',
        age: Number(a.age || 40),
        gender: a.gender || 'Male',
        phone: a.phone || a.patientPhone || '',
        location: a.location || a.district || 'Warangal',
        avatar: a.avatar || '/src/assets/images/patient_avatar_1787229395408.jpg',
        bloodGroup: a.bloodGroup || 'B+',
        bp: a.bp || '—',
        heartRate: a.heartRate || '—',
        appointmentDate: a.appointmentDate || a.preferredDate || 'Upcoming',
        appointmentTime: a.appointmentTime || a.slot || '10:00 AM',
        timeSlotPeriod: a.timeSlotPeriod || 'Morning',
        tokenNumber: a.tokenNumber || 'TK-00',
        visitType: a.visitType || 'Consultation',
        reason: a.reason || a.chiefComplaint || 'Consultation',
        symptoms: a.symptoms || [],
        status: ['Scheduled', 'Accepted', 'Confirmed'].includes(a.status) ? 'Confirmed' : a.status || 'Pending',
        bookedAt: a.bookedAt || a.createdAt || '',
        rejectionReason: a.rejectionReason,
        rejectedAt: a.rejectedAt,
        patientNotes: a.patientNotes,
        previousVisitsCount: a.previousVisitsCount || 0,
      }));
      return mapped as DoctorAppointmentItem[];
    });
  }, [collections.appointments, user]);

  // Initial Master Data for Dr. Ravi Teja's Appointments
  const [appointments, setAppointments] = useState<DoctorAppointmentItem[]>([
    // Confirmed Appointments
    {
      id: 'APT-101',
      patientName: 'Ramesh Kumar',
      age: 56,
      gender: 'Male',
      phone: '9876543210',
      location: 'Hanamkonda, Warangal',
      avatar: '/src/assets/images/patient_avatar_1787229395408.jpg',
      bloodGroup: 'B+',
      bp: '128/82 mmHg',
      heartRate: '72 bpm',
      appointmentDate: '22 Aug 2024',
      appointmentTime: '09:30 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-01',
      visitType: 'Follow-up',
      reason: 'Post-Angioplasty ECG & Stent Evaluation',
      symptoms: ['Mild exertional breathlessness', 'Routine follow-up'],
      status: 'Confirmed',
      bookedAt: '20 Aug 2024, 02:15 PM',
      previousVisitsCount: 3,
      patientNotes: 'Previous stent placed 8 months ago in LAD. Reports attached.'
    },
    {
      id: 'APT-102',
      patientName: 'Lakshmi Devi',
      age: 48,
      gender: 'Female',
      phone: '9440123456',
      location: 'Naimnagar, Warangal',
      avatar: '/src/assets/images/support_agent_female_1785560510481.jpg',
      bloodGroup: 'O+',
      bp: '142/90 mmHg',
      heartRate: '86 bpm',
      appointmentDate: '22 Aug 2024',
      appointmentTime: '10:30 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-02',
      visitType: 'Consultation',
      reason: 'Chest Pain & Palpitations on Exertion',
      symptoms: ['Chest tightness', 'Morning dizziness', 'High BP history'],
      status: 'Arrived',
      bookedAt: '21 Aug 2024, 10:00 AM',
      previousVisitsCount: 1,
      patientNotes: 'Patient arrived in OPD waiting lounge. BP recorded by nurse: 142/90.'
    },
    {
      id: 'APT-103',
      patientName: 'Suresh Babu',
      age: 66,
      gender: 'Male',
      phone: '9848011223',
      location: 'Kazipet, Warangal',
      avatar: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
      bloodGroup: 'A+',
      bp: '150/95 mmHg',
      heartRate: '78 bpm',
      appointmentDate: '22 Aug 2024',
      appointmentTime: '11:30 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-03',
      visitType: 'Consultation',
      reason: 'Hypertension & Lipid Profile Assessment',
      symptoms: ['Elevated blood pressure', 'Fatigue'],
      status: 'Confirmed',
      bookedAt: '21 Aug 2024, 04:30 PM',
      previousVisitsCount: 4,
      patientNotes: 'Taking Telmisartan 40mg. Fasting sugar reports also available.'
    },
    {
      id: 'APT-104',
      patientName: 'K. Rajeshwar Rao',
      age: 52,
      gender: 'Male',
      phone: '9908123890',
      location: 'Subedari, Warangal',
      avatar: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
      bloodGroup: 'AB+',
      bp: '135/88 mmHg',
      heartRate: '74 bpm',
      appointmentDate: '23 Aug 2024',
      appointmentTime: '10:00 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-04',
      visitType: 'ECG & Echo Review',
      reason: 'TMT & 2D Echo Screening Evaluation',
      symptoms: ['Occasional skipped heartbeats', 'Family history of CAD'],
      status: 'Confirmed',
      bookedAt: '21 Aug 2024, 06:10 PM',
      previousVisitsCount: 2,
      patientNotes: '2D Echo images uploaded in Ayudh Vikas Cloud portal.'
    },
    {
      id: 'APT-105',
      patientName: 'Sunitha Kumari',
      age: 41,
      gender: 'Female',
      phone: '9700445566',
      location: 'Maddur, Siddipet',
      avatar: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
      bloodGroup: 'B-',
      bp: '124/78 mmHg',
      heartRate: '68 bpm',
      appointmentDate: '23 Aug 2024',
      appointmentTime: '11:45 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-05',
      visitType: 'Follow-up',
      reason: 'Heart Rhythm Medication Review',
      symptoms: ['Follow-up for beta-blocker dosage adjustment'],
      status: 'Confirmed',
      bookedAt: '21 Aug 2024, 07:00 PM',
      previousVisitsCount: 1,
      patientNotes: 'Patient traveled 40km from Maddur.'
    },

    // Pending Appointments (Waiting for Doctor's Action)
    {
      id: 'APT-201',
      patientName: 'Anitha Reddy',
      age: 48,
      gender: 'Female',
      phone: '9989012345',
      location: 'Girmajipet, Warangal',
      avatar: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg',
      bloodGroup: 'A+',
      bp: '120/80 mmHg',
      heartRate: '70 bpm',
      appointmentDate: '22 Aug 2024',
      appointmentTime: '12:30 PM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-06',
      visitType: 'Follow-up',
      reason: 'Medication Tolerance & Routine Cardiology Review',
      symptoms: ['Mild fatigue on long walks', 'Needs prescription refill'],
      status: 'Pending',
      bookedAt: '21 Aug 2024, 09:20 PM',
      previousVisitsCount: 2,
      patientNotes: 'Prefers morning slot between 12:00 PM and 01:00 PM.'
    },
    {
      id: 'APT-202',
      patientName: 'Venkateshwarlu G.',
      age: 59,
      gender: 'Male',
      phone: '9000112244',
      location: 'Jangaon District',
      avatar: '/src/assets/images/partner_doctor_kims_1787229821989.jpg',
      bloodGroup: 'O+',
      bp: '158/98 mmHg',
      heartRate: '88 bpm',
      appointmentDate: '22 Aug 2024',
      appointmentTime: '02:00 PM',
      timeSlotPeriod: 'Afternoon',
      tokenNumber: 'TK-07',
      visitType: 'Consultation',
      reason: 'Persistent High BP & Shortness of Breath',
      symptoms: ['Night orthopnea', 'Swelling in feet for 3 days', 'Severe hypertension'],
      status: 'Pending',
      bookedAt: '22 Aug 2024, 07:15 AM',
      previousVisitsCount: 0,
      patientNotes: 'Urgent consultation requested by patient attendant.'
    },
    {
      id: 'APT-203',
      patientName: 'Ch. Madhusudhan Rao',
      age: 63,
      gender: 'Male',
      phone: '9123456780',
      location: 'Mulugu Road, Warangal',
      avatar: '/src/assets/images/patient_avatar_1787229395408.jpg',
      bloodGroup: 'B+',
      bp: '138/86 mmHg',
      heartRate: '76 bpm',
      appointmentDate: '23 Aug 2024',
      appointmentTime: '04:30 PM',
      timeSlotPeriod: 'Evening',
      tokenNumber: 'TK-08',
      visitType: 'Consultation',
      reason: 'Second Opinion for Coronary Angiogram Advice',
      symptoms: ['TMT positive report from district hospital', 'Mild angina on stairs'],
      status: 'Pending',
      bookedAt: '22 Aug 2024, 08:30 AM',
      previousVisitsCount: 0,
      patientNotes: 'Wants Dr. Ravi Teja to review CD of previous angiogram.'
    },
    {
      id: 'APT-204',
      patientName: 'Padma Jyothi',
      age: 39,
      gender: 'Female',
      phone: '9849922110',
      location: 'Balasamudram, Hanamkonda',
      avatar: '/src/assets/images/support_agent_female_1785560510481.jpg',
      bloodGroup: 'AB+',
      bp: '118/76 mmHg',
      heartRate: '92 bpm',
      appointmentDate: '24 Aug 2024',
      appointmentTime: '05:00 PM',
      timeSlotPeriod: 'Evening',
      tokenNumber: 'TK-09',
      visitType: 'Consultation',
      reason: 'Frequent Episodes of Tachycardia & Anxiety',
      symptoms: ['Sudden racing heart beats while resting', 'Sweating episodes'],
      status: 'Pending',
      bookedAt: '22 Aug 2024, 09:10 AM',
      previousVisitsCount: 0,
      patientNotes: 'Holter 24-hr monitoring advised by local physician.'
    },

    // Rejected Appointments (With Prior Stated Reason)
    {
      id: 'APT-301',
      patientName: 'Mohd. Imran Khan',
      age: 34,
      gender: 'Male',
      phone: '9705511223',
      location: 'Mandi Bazar, Warangal',
      avatar: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
      bloodGroup: 'A-',
      bp: '122/80 mmHg',
      heartRate: '80 bpm',
      appointmentDate: '21 Aug 2024',
      appointmentTime: '11:00 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-X1',
      visitType: 'Consultation',
      reason: 'Chronic Migraine & Neurological Headaches',
      symptoms: ['Throbbing unilateral headache', 'Visual aura'],
      status: 'Rejected',
      bookedAt: '20 Aug 2024, 01:00 PM',
      rejectedAt: '20 Aug 2024, 03:30 PM',
      rejectionReason: 'Specialty Mismatch: Patient requires Senior Neurologist / General Medicine consultation for migraine workup. Re-directed to Dr. Prakash Kumar (MD Gen Med).',
      previousVisitsCount: 0,
      patientNotes: 'Auto-SMS sent to patient with Neurology OPD timing.'
    },
    {
      id: 'APT-302',
      patientName: 'T. Mallesh Yadav',
      age: 71,
      gender: 'Male',
      phone: '9988776655',
      location: 'Parkal, Warangal Rural',
      avatar: '/src/assets/images/partner_doctor_kims_1787229821989.jpg',
      bloodGroup: 'O+',
      bp: '160/100 mmHg',
      heartRate: '95 bpm',
      appointmentDate: '21 Aug 2024',
      appointmentTime: '03:00 PM',
      timeSlotPeriod: 'Afternoon',
      tokenNumber: 'TK-X2',
      visitType: 'Emergency Review',
      reason: 'Severe Chest Crushing Pain & Acute Breathlessness',
      symptoms: ['Acute diaphoresis', 'Radiating left arm pain', 'Unstable vitals'],
      status: 'Rejected',
      bookedAt: '21 Aug 2024, 01:30 PM',
      rejectedAt: '21 Aug 2024, 01:40 PM',
      rejectionReason: 'Emergency Red Flag: Patient is presenting with Acute Coronary Syndrome symptoms. Advised immediate 108 Emergency Casualty / ICCU admission at MGM Hospital instead of routine OPD slot.',
      previousVisitsCount: 1,
      patientNotes: 'Ayudh Vikas Emergency Casualty Ambulance was dispatched immediately.'
    },
    {
      id: 'APT-303',
      patientName: 'Shravani K.',
      age: 28,
      gender: 'Female',
      phone: '9848123499',
      location: 'Subedari, Hanamkonda',
      avatar: '/src/assets/images/support_agent_female_1785560510481.jpg',
      bloodGroup: 'B+',
      bp: '110/70 mmHg',
      heartRate: '75 bpm',
      appointmentDate: '22 Aug 2024',
      appointmentTime: '08:00 AM',
      timeSlotPeriod: 'Morning',
      tokenNumber: 'TK-X3',
      visitType: 'Consultation',
      reason: 'General Health Fitness Certificate',
      symptoms: ['Employment pre-medical checkup'],
      status: 'Rejected',
      bookedAt: '21 Aug 2024, 08:00 PM',
      rejectedAt: '21 Aug 2024, 08:30 PM',
      rejectionReason: 'Doctor on Emergency Cath Lab / OT duty at 08:00 AM. Requested patient to rebook slot after 10:00 AM or consult the Wellness OPD doctor.',
      previousVisitsCount: 0,
      patientNotes: 'Patient notified via WhatsApp notification.'
    }
  ]);

  // Quick Rejection Preset Reasons for Fast Doctor Triage
  const quickRejectionPresets = [
    'Emergency Cath Lab / CABG Surgery duty scheduled at requested time.',
    'Specialty Mismatch: Case referred to Senior Physician / Neurologist.',
    'Doctor on Emergency Hospital Rounds / Out of Station on this date.',
    'OPD Slot full for requested hour. Please reschedule for evening OPD (5:00 - 8:30 PM).',
    'Emergency Alert: Patient requires immediate Casualty / ICCU emergency triage.'
  ];

  // Filtering Logic
  const confirmedList = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Arrived');
  const pendingList = appointments.filter(a => a.status === 'Pending');
  const rejectedList = appointments.filter(a => a.status === 'Rejected');

  const currentList = subTab === 'confirmed' 
    ? confirmedList 
    : subTab === 'pending' 
      ? pendingList 
      : rejectedList;

  const filteredList = currentList.filter(item => {
    const matchesSearch = 
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.rejectionReason && item.rejectionReason.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (dateFilter === 'today') {
      return item.appointmentDate.includes('22 Aug');
    }
    if (dateFilter === 'tomorrow') {
      return item.appointmentDate.includes('23 Aug');
    }
    if (dateFilter === 'this_week') {
      return item.appointmentDate.includes('Aug 2024');
    }

    return true;
  });

  // Action: Handle Doctor Confirming an Appointment
  const handleConfirmAppointment = (item: DoctorAppointmentItem) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === item.id) {
        return {
          ...a,
          status: 'Confirmed',
          appointmentDate: confirmDate.includes('-') 
            ? new Date(confirmDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : a.appointmentDate,
          appointmentTime: confirmTime || a.appointmentTime
        };
      }
      return a;
    }));

    update('appointments', item.id, {
      status: 'Confirmed',
      appointmentTime: confirmTime || item.appointmentTime,
    }).catch(console.error);
    setConfirmingItem(null);
    showToast(`Appointment confirmed for ${item.patientName} at ${confirmTime} (${confirmDate})!`);
  };

  // Action: Open Rejection Modal
  const openRejectionModal = (item: DoctorAppointmentItem) => {
    setRejectingItem(item);
    setRejectionReasonInput('');
    setQuickReasonSelected('');
    setRejectionError('');
  };

  // Action: Submit Rejection with Mandatory Prior Reason
  const handleSubmitRejection = () => {
    const finalReason = rejectionReasonInput.trim() || quickReasonSelected;
    if (!finalReason) {
      setRejectionError('Doctor must specify a prior reason of rejection per patient.');
      return;
    }

    if (!rejectingItem) return;

    const nowStr = new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAppointments(prev => prev.map(a => {
      if (a.id === rejectingItem.id) {
        return {
          ...a,
          status: 'Rejected',
          rejectionReason: finalReason,
          rejectedAt: nowStr
        };
      }
      return a;
    }));

    update('appointments', rejectingItem.id, {
      status: 'Rejected',
      rejectionReason: finalReason,
      rejectedAt: nowStr,
    }).catch(console.error);
    const patientName = rejectingItem.patientName;
    setRejectingItem(null);
    setRejectionReasonInput('');
    setQuickReasonSelected('');
    showToast(`Appointment rejected for ${patientName} with reason documented.`);
  };

  // Action: Reconsider / Re-activate a rejected appointment
  const handleReconsiderRejected = (item: DoctorAppointmentItem) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === item.id) {
        return {
          ...a,
          status: 'Confirmed',
          rejectionReason: undefined,
          rejectedAt: undefined
        };
      }
      return a;
    }));
    update('appointments', item.id, { status: 'Confirmed', rejectionReason: '', rejectedAt: '' }).catch(console.error);
    showToast(`Appointment reinstated & confirmed for ${item.patientName}.`);
  };

  return (
    <div className="space-y-4">

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#152e4d] text-white px-4 py-3 rounded-xl shadow-xl border border-blue-400/30 flex items-center gap-3 text-xs font-bold animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPOINTMENTS SUMMARY BANNER & 3 SUB-PAGES TABS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Info */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-slate-900">
                Doctor Appointments Management Desk
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage patient bookings for <strong>Dr. Ravi Teja</strong> (Cardiology OPD & Heart Care Centre)
            </p>
          </div>

          {/* 3 SUB-PAGE SWITCHER BUTTONS / TABS */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            
            {/* 1. Confirmed Appointments Sub-Page */}
            <button
              onClick={() => handleTabSwitch('confirmed')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                subTab === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed Appointments</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === 'confirmed' ? 'bg-emerald-800/60 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {confirmedList.length}
              </span>
            </button>

            {/* 2. Pending Appointments Sub-Page */}
            <button
              onClick={() => handleTabSwitch('pending')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer relative ${
                subTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Appointments</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === 'pending' ? 'bg-amber-800/60 text-white' : 'bg-amber-100 text-amber-800 animate-pulse'
              }`}>
                {pendingList.length}
              </span>
            </button>

            {/* 3. Rejected Appointments Sub-Page */}
            <button
              onClick={() => handleTabSwitch('rejected')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                subTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected Appointments</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                subTab === 'rejected' ? 'bg-rose-800/60 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {rejectedList.length}
              </span>
            </button>

          </div>

        </div>

        {/* SEARCH & DATE FILTERS BAR */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder={`Search in ${subTab} appointments...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
              Filter:
            </span>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Today (22 Aug)
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                dateFilter === 'tomorrow'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Tomorrow (23 Aug)
            </button>
            <button
              onClick={() => setDateFilter('this_week')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                dateFilter === 'this_week'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              This Week
            </button>
          </div>

        </div>
      </div>

      {/* SUB-PAGE 1: CONFIRMED APPOINTMENTS */}
      {subTab === 'confirmed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Confirmed Patient Appointments ({filteredList.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              Patients scheduled with designated Date & Time slots
            </span>
          </div>

          {filteredList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No confirmed appointments found</p>
              <p className="text-[11px] text-slate-500">Try changing your search query or date filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredList.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Left: Token & Patient Info */}
                    <div className="flex items-start sm:items-center gap-3">
                      
                      {/* Token Badge */}
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Token</span>
                        <span className="text-sm font-black leading-none">{item.tokenNumber.replace('TK-', '#')}</span>
                      </div>

                      {/* Avatar */}
                      <img 
                        src={item.avatar} 
                        alt={item.patientName} 
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                      />

                      {/* Name & Vitals */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{item.patientName}</h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                            item.status === 'Arrived'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}>
                            {item.status === 'Arrived' ? '● In Waiting Lounge' : 'Confirmed'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                          <span>{item.age} Yrs / {item.gender}</span>
                          <span>•</span>
                          <span className="text-slate-700 font-bold">Blood: {item.bloodGroup}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.location}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Middle: Appointment Date & Time details */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-4 shrink-0">
                      <div className="text-left">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                          Scheduled Date & Time
                        </span>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                          <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.appointmentDate}</span>
                          <span className="text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-black text-[11px]">
                            {item.appointmentTime}
                          </span>
                        </div>
                      </div>

                      <div className="border-l border-slate-200 pl-3 text-left">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                          Vitals Record
                        </span>
                        <div className="text-[11px] font-bold text-slate-800 mt-0.5">
                          BP: <span className="text-blue-700">{item.bp}</span> • HR: {item.heartRate}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onStartConsultation) {
                            onStartConsultation(item);
                          } else {
                            setSelectedAppointment(item);
                          }
                        }}
                        className="bg-[#152e4d] hover:bg-[#0d1e33] text-white text-xs font-black px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Start Consultation</span>
                      </button>

                      <a
                        href={`tel:${item.phone}`}
                        title="Call patient"
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </a>

                      <button
                        onClick={() => openRejectionModal(item)}
                        title="Cancel or Reject Appointment with Reason"
                        className="p-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Reason for Visit & Clinical Note */}
                  <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Reason for Visit: </span>
                      <span className="font-black text-blue-900">{item.reason}</span>
                      <span className="text-slate-500 ml-2">({item.visitType})</span>
                    </div>
                    {item.patientNotes && (
                      <div className="text-[11px] text-slate-600 italic">
                        Note: {item.patientNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-PAGE 2: PENDING APPOINTMENTS (Doctor can Confirm or Reject with prior reason) */}
      {subTab === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Pending Patient Appointment Requests ({filteredList.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-700">
              Review and Confirm or Reject with documented reason
            </span>
          </div>

          {filteredList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">All pending requests have been triaged!</p>
              <p className="text-[11px] text-slate-500">New patient booking requests will appear here in real-time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredList.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl border-2 border-amber-200/80 p-4 shadow-xs hover:border-amber-400 transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Patient identity */}
                    <div className="flex items-start sm:items-center gap-3">
                      <img 
                        src={item.avatar} 
                        alt={item.patientName} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{item.patientName}</h4>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                            Awaiting Doctor Action
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                          <span>{item.age} Yrs / {item.gender}</span>
                          <span>•</span>
                          <span className="text-slate-700 font-bold">Blood: {item.bloodGroup}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Requested Date & Time info */}
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2 flex items-center gap-4 shrink-0">
                      <div>
                        <span className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider block">
                          Patient Requested Slot
                        </span>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>{item.appointmentDate}</span>
                          <span className="text-amber-900 bg-amber-200/80 px-1.5 py-0.2 rounded font-black text-[11px]">
                            {item.appointmentTime}
                          </span>
                        </div>
                      </div>
                      <div className="border-l border-amber-200 pl-3">
                        <span className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider block">
                          Booked At
                        </span>
                        <div className="text-[10px] font-semibold text-slate-700 mt-0.5">
                          {item.bookedAt}
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS: CONFIRM OR REJECT */}
                    <div className="flex items-center gap-2">
                      
                      {/* Confirm Button */}
                      <button
                        onClick={() => {
                          setConfirmingItem(item);
                          setConfirmTime(item.appointmentTime);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Appointment</span>
                      </button>

                      {/* Reject Button (requires prior reason) */}
                      <button
                        onClick={() => openRejectionModal(item)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-black px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject with Reason</span>
                      </button>

                    </div>

                  </div>

                  {/* Complaint & Symptoms */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="font-bold text-slate-700">Chief Complaint: </span>
                        <span className="font-black text-slate-900">{item.reason}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.symptoms.map((sym, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                    {item.patientNotes && (
                      <p className="text-[11px] text-slate-600 italic">
                        <strong>Patient Note:</strong> "{item.patientNotes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-PAGE 3: REJECTED APPOINTMENTS (Shows Prior Reason for Rejection per Patient) */}
      {subTab === 'rejected' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Rejected Patient Appointments ({filteredList.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              Appointments rejected with prior documented reason per patient
            </span>
          </div>

          {filteredList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No rejected appointments</p>
              <p className="text-[11px] text-slate-500">All patient consultation requests have been accommodated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredList.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl border border-rose-200 p-4 shadow-2xs hover:border-rose-300 transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Patient info */}
                    <div className="flex items-start sm:items-center gap-3">
                      <img 
                        src={item.avatar} 
                        alt={item.patientName} 
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 grayscale-30 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{item.patientName}</h4>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-300">
                            Appointment Rejected
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                          <span>{item.age} Yrs / {item.gender}</span>
                          <span>•</span>
                          <span>Phone: {item.phone}</span>
                          <span>•</span>
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Original requested slot */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-left shrink-0">
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                        Requested Slot
                      </span>
                      <div className="text-xs font-bold text-slate-700 mt-0.5">
                        {item.appointmentDate} at {item.appointmentTime}
                      </div>
                      {item.rejectedAt && (
                        <div className="text-[9px] text-rose-700 font-semibold mt-0.5">
                          Rejected on: {item.rejectedAt}
                        </div>
                      )}
                    </div>

                    {/* Reconsider Action Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReconsiderRejected(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>Reconsider & Confirm</span>
                      </button>

                      <a
                        href={`tel:${item.phone}`}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                        title="Contact patient"
                      >
                        <Phone className="w-4 h-4 text-slate-600" />
                      </a>
                    </div>

                  </div>

                  {/* PRIOR REJECTION REASON CALLOUT BOX (EXACT REQUIREMENT) */}
                  <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-xs font-black text-rose-900 flex items-center justify-between">
                        <span>Prior Reason for Rejection:</span>
                        <span className="text-[10px] font-bold text-rose-700">Authenticated by Dr. Ravi Teja</span>
                      </div>
                      <p className="text-xs font-bold text-rose-800 mt-1 leading-relaxed">
                        "{item.rejectionReason}"
                      </p>
                    </div>
                  </div>

                  {/* Chief complaint */}
                  <div className="text-[11px] text-slate-600 px-1">
                    <span className="font-semibold text-slate-500">Original Visit Reason: </span>
                    <span>{item.reason} ({item.visitType})</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: REJECT APPOINTMENT WITH MANDATORY PRIOR REASON */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 relative space-y-4">
            
            <button
              onClick={() => setRejectingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Reject Patient Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  Please provide a clear prior reason for rejecting this booking
                </p>
              </div>
            </div>

            {/* Patient Context */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <span className="font-black text-slate-900">{rejectingItem.patientName} ({rejectingItem.age} Y / {rejectingItem.gender})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Requested Slot:</span>
                <span className="font-bold text-slate-800">{rejectingItem.appointmentDate} • {rejectingItem.appointmentTime}</span>
              </div>
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 block">
                Select Quick Prior Reason:
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {quickRejectionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuickReasonSelected(preset);
                      setRejectionReasonInput(preset);
                      setRejectionError('');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      quickReasonSelected === preset
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 block">
                Or Write Detailed Reason of Rejection: <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Doctor must write a prior reason for rejection per patient (e.g. Doctor on emergency surgery, specialty mismatch, OP quota full)..."
                value={rejectionReasonInput}
                onChange={(e) => {
                  setRejectionReasonInput(e.target.value);
                  setRejectionError('');
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white text-slate-800"
              />
              {rejectionError && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {rejectionError}
                </p>
              )}
            </div>

            {/* Note */}
            <div className="bg-amber-50 text-amber-900 text-[11px] p-2.5 rounded-lg border border-amber-200">
              ℹ️ This rejection reason will be permanently documented in the doctor's <strong>Rejected Appointments</strong> sub-page and sent via SMS/Notification to the patient.
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSubmitRejection}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Confirm Rejection & Document Reason
              </button>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: CONFIRM APPOINTMENT WITH SLOT ALLOCATION */}
      {confirmingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative space-y-4">
            
            <button
              onClick={() => setConfirmingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Confirm Patient Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  Approve and allocate OPD slot for <strong>{confirmingItem.patientName}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{confirmingItem.patientName} ({confirmingItem.age} Y / {confirmingItem.gender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visit Reason:</span>
                <span className="font-bold text-blue-700">{confirmingItem.reason}</span>
              </div>
            </div>

            {/* Time slot picker */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 block">
                Assign Appointment Time Slot:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '05:00 PM', '06:30 PM'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setConfirmTime(slot)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                      confirmTime === slot
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmAppointment(confirmingItem)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Approve & Add to Confirmed
              </button>
              <button
                type="button"
                onClick={() => setConfirmingItem(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR APPOINTMENT */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img 
                src={selectedAppointment.avatar} 
                alt={selectedAppointment.patientName} 
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedAppointment.patientName}</h3>
                <p className="text-xs text-slate-500">{selectedAppointment.age} Y / {selectedAppointment.gender} • {selectedAppointment.phone}</p>
                <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 mt-1">
                  {selectedAppointment.status} • {selectedAppointment.tokenNumber}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-bold text-slate-800">{selectedAppointment.appointmentDate} at {selectedAppointment.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="font-bold text-blue-700">{selectedAppointment.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vitals:</span>
                <span className="font-bold text-slate-800">BP: {selectedAppointment.bp} | HR: {selectedAppointment.heartRate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Starting consultation for ${selectedAppointment.patientName}...`);
                  setSelectedAppointment(null);
                }}
                className="flex-1 bg-[#152e4d] hover:bg-[#0f2238] text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Start Consultation Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
