import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  UserCheck,
  CreditCard,
  Building2,
  Stethoscope,
  Megaphone,
  HelpCircle,
  PhoneCall,
  Sparkles,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  X,
  MessageCircle
} from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';

export interface MarketingLeadItem {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  location: string;
  address?: string;
  requirement: string;
  sourceCategory: 'Health Camps' | 'Website' | 'Doctor Referral' | 'Social Media' | 'Direct Walk-in' | 'Community Outreach' | '24x7 Helpline';
  sourceDetails: string; // Specific camp name, referrer doctor, campaign name
  status: 'New' | 'Contacted' | 'In Discussion' | 'Converted' | 'Lost';
  registeredAsPatient: boolean;
  memberId?: string;
  uhid?: string;
  membershipTier?: 'Gold' | 'Silver' | 'Rural Ayush' | 'Senior Citizen' | 'Standard Patient';
  assignedDoctor?: string;
  dateAdded: string;
  lastFollowUp?: string;
  nextFollowUpDate?: string;
  notes?: string;
  marketerName: string;
}

const INITIAL_MARKETING_LEADS: MarketingLeadItem[] = [
  {
    id: 'LD-2024-0101',
    patientName: 'Rohit Verma',
    age: 52,
    gender: 'Male',
    phone: '9848022334',
    email: 'rohit.verma@example.com',
    location: 'Warangal',
    address: 'Near Head Post Office, Nakkalagutta, Warangal',
    requirement: 'Cardiology Consultation & ECG check',
    sourceCategory: 'Health Camps',
    sourceDetails: 'Free Cardiology Camp - Mulugu Govt High School',
    status: 'New',
    registeredAsPatient: false,
    assignedDoctor: 'Dr. Ravi Teja (Cardiologist)',
    dateAdded: '2024-05-24',
    lastFollowUp: 'Enquired at camp registration counter today',
    nextFollowUpDate: '2024-05-25',
    notes: 'Mild chest uneasiness during physical activity. Recommended for lipid profile and 2D Echo.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0102',
    patientName: 'Priya Sharma',
    age: 36,
    gender: 'Female',
    phone: '9849155667',
    email: 'priya.s@example.com',
    location: 'Hanamkonda',
    address: 'Subedari Colony, Hanamkonda',
    requirement: 'General Health & Thyroid Screening',
    sourceCategory: 'Website',
    sourceDetails: 'Ayudh Vikas Web Portal (Warangal OP Form)',
    status: 'Contacted',
    registeredAsPatient: false,
    assignedDoctor: 'Dr. Anusha Reddy (General Physician)',
    dateAdded: '2024-05-24',
    lastFollowUp: 'Called at 11:30 AM; explained OPD discount benefits',
    nextFollowUpDate: '2024-05-26',
    notes: 'Interested in Comprehensive Full Body Health Package for family.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0103',
    patientName: 'Suresh Kumar',
    age: 61,
    gender: 'Male',
    phone: '9440188992',
    email: 'suresh.kumar@example.com',
    location: 'Bhupalpally',
    address: 'Main Bazar, Bhupalpally Town',
    requirement: 'Diabetes Management & Neuropathy Consultation',
    sourceCategory: 'Health Camps',
    sourceDetails: 'Diabetes Screening Camp - Bhupalpally Science Center',
    status: 'In Discussion',
    registeredAsPatient: false,
    assignedDoctor: 'Dr. Prakash Kumar (Diabetologist)',
    dateAdded: '2024-05-23',
    lastFollowUp: 'Shared Senior Citizen Health Card benefits on WhatsApp',
    nextFollowUpDate: '2024-05-25',
    notes: 'Fasting blood sugar was 188 mg/dL at camp. Ready to enroll in Ayudh Vikas Senior Citizen membership.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0104',
    patientName: 'Neha Reddy',
    age: 44,
    gender: 'Female',
    phone: '9701233445',
    email: 'neha.reddy@example.com',
    location: 'Jangaon',
    address: 'Station Road, Jangaon',
    requirement: 'Orthopedic Knee Pain & Joint Replacement OPD',
    sourceCategory: 'Doctor Referral',
    sourceDetails: 'Referred by Dr. S. K. Rao (Community Health Center)',
    status: 'Converted',
    registeredAsPatient: true,
    memberId: 'AV-2024-8841',
    uhid: 'UHID-94821',
    membershipTier: 'Gold',
    assignedDoctor: 'Dr. Vikram Singh (Orthopedic Surgeon)',
    dateAdded: '2024-05-22',
    lastFollowUp: 'Converted to Gold Member; OPD Token booked for Tuesday',
    nextFollowUpDate: '2024-05-28',
    notes: 'Enrolled in Gold Family Card. Card issued and mailed.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0105',
    patientName: 'Anil Reddy',
    age: 29,
    gender: 'Male',
    phone: '9988776655',
    email: 'anil.r@example.com',
    location: 'Jangaon',
    address: 'Near RTC Bus Stand, Jangaon',
    requirement: 'Thyroid Problem & Hormonal Panel',
    sourceCategory: 'Social Media',
    sourceDetails: 'Facebook Ad - Ayudh Vikas Rural Health Initiative',
    status: 'New',
    registeredAsPatient: false,
    assignedDoctor: 'Dr. Anusha Reddy',
    dateAdded: '2024-05-24',
    lastFollowUp: 'Form submitted through Facebook Lead Gen form',
    nextFollowUpDate: '2024-05-25',
    notes: 'Requested a callback in the evening after 6 PM.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0106',
    patientName: 'Lakshmi Devi',
    age: 58,
    gender: 'Female',
    phone: '9848123456',
    email: 'lakshmi.d@example.com',
    location: 'Mulugu',
    address: 'Govt Hospital Road, Mulugu',
    requirement: 'Hypertension & Preventive Cardiac Checkup',
    sourceCategory: 'Community Outreach',
    sourceDetails: 'ASHA Worker Outreach Network (Mulugu Mandal)',
    status: 'Converted',
    registeredAsPatient: true,
    memberId: 'AV-2024-9021',
    uhid: 'UHID-77219',
    membershipTier: 'Rural Ayush',
    assignedDoctor: 'Dr. Ravi Teja (Cardiologist)',
    dateAdded: '2024-05-20',
    lastFollowUp: 'Smart Health QR Card issued at village center',
    notes: 'Beneficiary of Rural Ayush Subsidized Care program.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0107',
    patientName: 'M. Venkateshwarlu',
    age: 67,
    gender: 'Male',
    phone: '9441239876',
    email: 'venkat.m@example.com',
    location: 'Warangal',
    address: 'Kishanpura, Hanamkonda, Warangal',
    requirement: 'Cataract Surgery & Eye Checkup',
    sourceCategory: 'Direct Walk-in',
    sourceDetails: 'Ayudh Vikas Helpdesk Counter - Warangal',
    status: 'In Discussion',
    registeredAsPatient: false,
    assignedDoctor: 'Dr. K. Srinivas (Ophthalmology)',
    dateAdded: '2024-05-21',
    lastFollowUp: 'Gave free eye checkup voucher for partner hospital',
    nextFollowUpDate: '2024-05-27',
    notes: 'Exploring Ayudh Vikas Senior Citizen cashless scheme.',
    marketerName: 'Rohit Kumar'
  },
  {
    id: 'LD-2024-0108',
    patientName: 'Kavitha Goud',
    age: 33,
    gender: 'Female',
    phone: '9900112233',
    email: 'kavitha.g@example.com',
    location: 'Mahabubabad',
    address: 'Nehru Center, Mahabubabad',
    requirement: 'Maternity & Pediatric Care Guidance',
    sourceCategory: '24x7 Helpline',
    sourceDetails: 'Helpline 0870-4210820 Inbound Call',
    status: 'Contacted',
    registeredAsPatient: false,
    assignedDoctor: 'Dr. Radhika Sharma (Gynecology)',
    dateAdded: '2024-05-23',
    lastFollowUp: 'Counselled on institutional delivery partner hospitals',
    nextFollowUpDate: '2024-05-26',
    notes: 'Looking for 30% discount package for maternity delivery at partner private hospital.',
    marketerName: 'Rohit Kumar'
  }
];

interface MarketingLeadsPageProps {
  onBackToDashboard: () => void;
}

export const MarketingLeadsPage: React.FC<MarketingLeadsPageProps> = ({ onBackToDashboard }) => {
  const { collections, create, update, remove } = useLiveData();
  const [leads, setLeads] = useState<MarketingLeadItem[]>(INITIAL_MARKETING_LEADS);

  useEffect(() => {
    if (collections.leads.length) {
      setLeads(collections.leads as MarketingLeadItem[]);
    }
  }, [collections.leads]);

  // Filters and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<MarketingLeadItem | null>(null);
  const [viewingLead, setViewingLead] = useState<MarketingLeadItem | null>(null);
  const [deletingLead, setDeletingLead] = useState<MarketingLeadItem | null>(null);
  const [convertingLead, setConvertingLead] = useState<MarketingLeadItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<Partial<MarketingLeadItem>>({
    patientName: '',
    age: 35,
    gender: 'Male',
    phone: '',
    email: '',
    location: 'Warangal',
    address: '',
    requirement: '',
    sourceCategory: 'Health Camps',
    sourceDetails: 'Free Cardiology Camp - Mulugu Govt High School',
    status: 'New',
    assignedDoctor: 'Dr. Ravi Teja (Cardiologist)',
    notes: '',
    membershipTier: 'Standard Patient',
    nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Create Lead Modal
  const handleOpenAddModal = () => {
    setFormData({
      patientName: '',
      age: 35,
      gender: 'Male',
      phone: '',
      email: '',
      location: 'Warangal',
      address: '',
      requirement: 'General OP & Health Checkup',
      sourceCategory: 'Health Camps',
      sourceDetails: 'Free Cardiology Camp - Mulugu Govt High School',
      status: 'New',
      assignedDoctor: 'Dr. Ravi Teja (Cardiologist)',
      notes: '',
      membershipTier: 'Standard Patient',
      nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  // Open Edit Lead Modal
  const handleOpenEditModal = (lead: MarketingLeadItem) => {
    setEditingLead(lead);
    setFormData({ ...lead });
  };

  // Handle Save (Create New)
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.phone) {
      showToast('Please provide Patient Name and Mobile Number.');
      return;
    }

    const newLead: MarketingLeadItem = {
      id: `LD-2024-${(leads.length + 101).toString()}`,
      patientName: formData.patientName.trim(),
      age: Number(formData.age) || 30,
      gender: formData.gender as 'Male' | 'Female' | 'Other' || 'Male',
      phone: formData.phone.trim(),
      email: formData.email?.trim() || '',
      location: formData.location || 'Warangal',
      address: formData.address || '',
      requirement: formData.requirement || 'General OP Consultation',
      sourceCategory: formData.sourceCategory || 'Health Camps',
      sourceDetails: formData.sourceDetails || 'Direct Field Outreach',
      status: formData.status || 'New',
      registeredAsPatient: false,
      assignedDoctor: formData.assignedDoctor || 'Dr. Ravi Teja (Cardiologist)',
      dateAdded: new Date().toISOString().split('T')[0],
      lastFollowUp: 'Initial lead captured by Rohit Kumar',
      nextFollowUpDate: formData.nextFollowUpDate || '',
      notes: formData.notes || '',
      marketerName: 'Rohit Kumar'
    };

    setLeads(prev => [newLead, ...prev]);
    create('leads', newLead).catch(console.error);
    setShowAddModal(false);
    showToast(`Lead for "${newLead.patientName}" created successfully!`);
  };

  // Handle Update (Edit Existing)
  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    setLeads(prev =>
      prev.map(l => {
        if (l.id === editingLead.id) {
          return {
            ...l,
            ...formData,
            patientName: formData.patientName || l.patientName,
            phone: formData.phone || l.phone,
            lastFollowUp: `Updated on ${new Date().toLocaleDateString('en-GB')}: ${formData.notes || 'Status details refreshed'}`
          } as MarketingLeadItem;
        }
        return l;
      })
    );

    update('leads', editingLead.id, formData).catch(console.error);
    setEditingLead(null);
    showToast(`Lead "${formData.patientName}" updated successfully.`);
  };

  // Handle Delete Lead
  const handleConfirmDelete = () => {
    if (!deletingLead) return;
    remove('leads', deletingLead.id).catch(console.error);
    setLeads(prev => prev.filter(l => l.id !== deletingLead.id));
    showToast(`Lead "${deletingLead.patientName}" has been removed.`);
    setDeletingLead(null);
  };

  // Handle Convert Lead directly into Registered Ayudh Vikas Patient
  const handleConvertLeadToPatient = (lead: MarketingLeadItem, tier: 'Gold' | 'Silver' | 'Rural Ayush' | 'Senior Citizen') => {
    const generatedMemberId = `AV-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedUhid = `UHID-${Math.floor(10000 + Math.random() * 90000)}`;

    setLeads(prev =>
      prev.map(l => {
        if (l.id === lead.id) {
          return {
            ...l,
            status: 'Converted',
            registeredAsPatient: true,
            memberId: generatedMemberId,
            uhid: generatedUhid,
            membershipTier: tier,
            lastFollowUp: `Enrolled as ${tier} Member by Rohit Kumar with ID ${generatedMemberId}`
          };
        }
        return l;
      })
    );
    update('leads', lead.id, {
      status: 'Converted',
      registeredAsPatient: true,
      memberId: generatedMemberId,
      uhid: generatedUhid,
      membershipTier: tier,
    }).catch(console.error);
    create('patients', {
      id: generatedMemberId,
      fullName: lead.patientName,
      memberId: generatedMemberId,
      uhid: generatedUhid,
      phone: lead.phone,
      age: String(lead.age),
      gender: lead.gender,
      membershipTier: `${tier} Member`,
    }).catch(console.error);

    // Also sync to global doctor registered patients registry in localStorage
    try {
      const docSaved = localStorage.getItem('ayudh_doc_registeredPatients');
      const existingDocPatients = docSaved ? JSON.parse(docSaved) : [];
      const newDocPatient = {
        id: `REG-${Date.now()}`,
        patientName: lead.patientName,
        age: lead.age,
        gender: lead.gender,
        phone: lead.phone,
        memberId: generatedMemberId,
        membershipTier: `${tier} Member`,
        uhid: generatedUhid,
        bloodGroup: 'B+ (Verified)',
        bp: '120/80 mmHg',
        heartRate: '72 bpm',
        lastVisit: 'Just Enrolled (New)',
        avatar: lead.gender === 'Female' 
          ? '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg'
          : '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg',
        verificationMethod: `Field Lead Convert (${lead.sourceCategory})`,
        notes: `Converted from Marketing Lead (${lead.sourceDetails}). Requirement: ${lead.requirement}`
      };
      localStorage.setItem('ayudh_doc_registeredPatients', JSON.stringify([newDocPatient, ...existingDocPatients]));
    } catch (err) {
      console.error('Failed to sync converted patient to doc registry', err);
    }

    setConvertingLead(null);
    showToast(`🎉 ${lead.patientName} has been enrolled as a ${tier} Patient! Member ID: ${generatedMemberId}`);
  };

  // Inline Status Quick Switcher
  const handleQuickStatusChange = (leadId: string, newStatus: MarketingLeadItem['status']) => {
    setLeads(prev =>
      prev.map(l => {
        if (l.id === leadId) {
          return { ...l, status: newStatus };
        }
        return l;
      })
    );
    showToast(`Status updated to "${newStatus}"`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Lead ID,Patient Name,Age,Gender,Phone,Email,Location,Requirement,Source Category,Source Details,Status,Registered Member,Member ID,Assigned Doctor,Date Added'];
    const rows = filteredLeads.map(l => 
      `"${l.id}","${l.patientName}","${l.age}","${l.gender}","${l.phone}","${l.email || ''}","${l.location}","${l.requirement}","${l.sourceCategory}","${l.sourceDetails}","${l.status}","${l.registeredAsPatient ? 'Yes' : 'No'}","${l.memberId || ''}","${l.assignedDoctor || ''}","${l.dateAdded}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ayudh_Vikas_Marketer_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads data exported to CSV!');
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      !searchTerm ||
      lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.sourceDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.memberId && lead.memberId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource = filterSource === 'All' || lead.sourceCategory === filterSource;
    const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
    const matchesLocation = filterLocation === 'All' || lead.location === filterLocation;

    return matchesSearch && matchesSource && matchesStatus && matchesLocation;
  });

  // Calculate Real-time Summary Counters
  const countTotal = leads.length;
  const countConverted = leads.filter(l => l.status === 'Converted' || l.registeredAsPatient).length;
  const countInDiscussion = leads.filter(l => l.status === 'In Discussion').length;
  const countNew = leads.filter(l => l.status === 'New').length;
  const countContacted = leads.filter(l => l.status === 'Contacted').length;

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* TOP HEADER / ACTION BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onBackToDashboard}
                className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                Marketer: Rohit Kumar
              </span>
            </div>

            <h1 className="text-xl font-black text-[#0f2e5a] mt-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Patients & Field Leads Registry</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive list of all patient leads and registered members acquired across Telangana outreach camps, web forms, and referral sources.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Export to Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="bg-[#0f2e5a] hover:bg-[#152e4d] text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Lead</span>
            </button>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* QUICK STAT METRICS STRIP */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
          
          <div 
            onClick={() => setFilterStatus('All')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterStatus === 'All' ? 'bg-blue-50/80 border-blue-300 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-600">Total Leads</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{countTotal}</div>
            <div className="text-[10px] text-blue-700 font-semibold">Under Marketer</div>
          </div>

          <div 
            onClick={() => setFilterStatus('Converted')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterStatus === 'Converted' ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="text-[11px] font-bold text-emerald-800">Converted Patients</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{countConverted}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Active Members</div>
          </div>

          <div 
            onClick={() => setFilterStatus('In Discussion')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterStatus === 'In Discussion' ? 'bg-purple-50/80 border-purple-300 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="text-[11px] font-bold text-purple-800">In Discussion</div>
            <div className="text-xl font-black text-purple-700 mt-0.5">{countInDiscussion}</div>
            <div className="text-[10px] text-purple-600 font-semibold">In Triage</div>
          </div>

          <div 
            onClick={() => setFilterStatus('Contacted')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterStatus === 'Contacted' ? 'bg-amber-50/80 border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="text-[11px] font-bold text-amber-800">Contacted</div>
            <div className="text-xl font-black text-amber-700 mt-0.5">{countContacted}</div>
            <div className="text-[10px] text-amber-600 font-semibold">Follow-up pending</div>
          </div>

          <div 
            onClick={() => setFilterStatus('New')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              filterStatus === 'New' ? 'bg-cyan-50/80 border-cyan-300 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="text-[11px] font-bold text-cyan-800">New Leads</div>
            <div className="text-xl font-black text-cyan-700 mt-0.5">{countNew}</div>
            <div className="text-[10px] text-cyan-600 font-semibold">Just In</div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Patient Name, Mobile No, Location, Member ID, or Specific Camp Source..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter by Source */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Source:</span>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Sources</option>
                <option value="Health Camps">Health Camps</option>
                <option value="Website">Website</option>
                <option value="Doctor Referral">Doctor Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="Community Outreach">Community Outreach</option>
                <option value="24x7 Helpline">24x7 Helpline</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Filter by Location */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">District:</span>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Locations</option>
                <option value="Warangal">Warangal</option>
                <option value="Hanamkonda">Hanamkonda</option>
                <option value="Mulugu">Mulugu</option>
                <option value="Bhupalpally">Bhupalpally</option>
                <option value="Jangaon">Jangaon</option>
                <option value="Mahabubabad">Mahabubabad</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterSource !== 'All' || filterStatus !== 'All' || filterLocation !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSource('All');
                  setFilterStatus('All');
                  setFilterLocation('All');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEADS LIST TABLE VIEW */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">Leads & Patient Directory</h3>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
              Showing {filteredLeads.length} of {leads.length} records
            </span>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Acquired & Managed by <strong className="text-slate-800">Rohit Kumar (Marketing)</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Patient / Lead</th>
                <th className="py-3 px-4">Requirement / Speciality</th>
                <th className="py-3 px-4">Acquisition Source (Camp / Channel)</th>
                <th className="py-3 px-4">Status & Membership</th>
                <th className="py-3 px-4">Assigned Doctor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredLeads.map((lead) => {
                const isConverted = lead.status === 'Converted' || lead.registeredAsPatient;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Patient / Contact column */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isConverted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 text-xs">{lead.patientName}</span>
                            <span className="text-[10px] text-slate-400">({lead.gender[0]}, {lead.age}y)</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <a href={`tel:${lead.phone}`} className="text-slate-700 hover:text-emerald-700 font-bold flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{lead.phone}</span>
                            </a>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{lead.location}</span>
                            </span>
                          </div>

                          <div className="text-[9.5px] text-slate-400 mt-0.5">
                            ID: <strong className="text-slate-600">{lead.id}</strong> • Added: {lead.dateAdded}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Requirement column */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{lead.requirement}</div>
                      {lead.notes && (
                        <div className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5" title={lead.notes}>
                          💬 {lead.notes}
                        </div>
                      )}
                    </td>

                    {/* Source column (Detailed specifications) */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border bg-slate-50 text-slate-800 border-slate-200">
                          {lead.sourceCategory === 'Health Camps' && <Stethoscope className="w-3 h-3 text-purple-600" />}
                          {lead.sourceCategory === 'Website' && <ExternalLink className="w-3 h-3 text-blue-600" />}
                          {lead.sourceCategory === 'Doctor Referral' && <Building2 className="w-3 h-3 text-emerald-600" />}
                          {lead.sourceCategory === 'Social Media' && <Share2 className="w-3 h-3 text-amber-600" />}
                          {lead.sourceCategory === 'Direct Walk-in' && <Users className="w-3 h-3 text-rose-600" />}
                          {lead.sourceCategory === 'Community Outreach' && <ShieldCheck className="w-3 h-3 text-teal-600" />}
                          {lead.sourceCategory === '24x7 Helpline' && <PhoneCall className="w-3 h-3 text-cyan-600" />}
                          <span>{lead.sourceCategory}</span>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-700 leading-tight">
                          {lead.sourceDetails}
                        </div>
                      </div>
                    </td>

                    {/* Status & Membership column */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {/* Quick Status Dropdown */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleQuickStatusChange(lead.id, e.target.value as MarketingLeadItem['status'])}
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border cursor-pointer ${
                            lead.status === 'Converted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : lead.status === 'In Discussion'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : lead.status === 'Contacted'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : lead.status === 'Lost'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="New">🔵 New</option>
                          <option value="Contacted">🟡 Contacted</option>
                          <option value="In Discussion">🟣 In Discussion</option>
                          <option value="Converted">🟢 Converted</option>
                          <option value="Lost">🔴 Lost</option>
                        </select>

                        {/* If Converted: show Member ID */}
                        {isConverted ? (
                          <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{lead.memberId || 'Registered'} ({lead.membershipTier || 'Member'})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConvertingLead(lead)}
                            className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Convert to Member</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Assigned Doctor */}
                    <td className="py-3 px-4">
                      <div className="text-xs font-bold text-slate-800">{lead.assignedDoctor || 'General OP Clinic'}</div>
                      <div className="text-[10px] text-slate-400">Warangal Network</div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Call Button */}
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/91${lead.phone}?text=Hello%20${encodeURIComponent(lead.patientName)},%20this%20is%20Rohit%20Kumar%20from%20Ayudh%20Vikas%20Health%20Care%20Network.`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {/* View Details Button */}
                        <button
                          onClick={() => setViewingLead(lead)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(lead)}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingLead(lead)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-xs">No leads found matching your search or filter.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterSource('All');
                        setFilterStatus('All');
                        setFilterLocation('All');
                      }}
                      className="mt-2 text-xs text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW LEAD */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Create New Patient Lead</h3>
                  <p className="text-[11px] text-slate-500">Acquired by Rohit Kumar (Marketing Team)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              
              {/* Row 1: Name, Age, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName || ''}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar Goud"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={formData.age || 35}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender || 'Male'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Contact Number, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Contact (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9848022334"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: District / Location, Full Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / Region</label>
                  <select
                    value={formData.location || 'Warangal'}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
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

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Village / Colony / Landmark</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Near ZP High School, Mulugu Mandal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Source Category & Specific Acquisition Details (KEY REQUIREMENT) */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="font-black text-emerald-950 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Lead Acquisition Source Specification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Acquisition Channel *</label>
                    <select
                      value={formData.sourceCategory || 'Health Camps'}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        let defaultDetail = '';
                        if (cat === 'Health Camps') defaultDetail = 'Free Cardiology Camp - Mulugu Govt High School';
                        else if (cat === 'Website') defaultDetail = 'Ayudh Vikas Web Portal OPD Form';
                        else if (cat === 'Doctor Referral') defaultDetail = 'Referred by Dr. Ravi Teja (Cardiology)';
                        else if (cat === 'Social Media') defaultDetail = 'Facebook Rural Health Campaign';
                        else if (cat === 'Direct Walk-in') defaultDetail = 'Ayudh Vikas Warangal Helpdesk';
                        else if (cat === 'Community Outreach') defaultDetail = 'ASHA Worker Village Network';
                        else if (cat === '24x7 Helpline') defaultDetail = 'Helpline 0870-4210820 Inbound';

                        setFormData({ ...formData, sourceCategory: cat, sourceDetails: defaultDetail });
                      }}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                    >
                      <option value="Health Camps">Health Camps</option>
                      <option value="Website">Website & Web Portal</option>
                      <option value="Doctor Referral">Doctor / Hospital Referral</option>
                      <option value="Social Media">Social Media Ad / Campaign</option>
                      <option value="Direct Walk-in">Direct Walk-in / Counter</option>
                      <option value="Community Outreach">Community Outreach (ASHA / NGO)</option>
                      <option value="24x7 Helpline">24x7 Helpline Inbound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specific Camp / Campaign Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.sourceDetails || ''}
                      onChange={(e) => setFormData({ ...formData, sourceDetails: e.target.value })}
                      placeholder="e.g. Free Cardiology Camp - Mulugu Govt High School"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Medical Requirement & Assigned Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medical Requirement / Problem *</label>
                  <input
                    type="text"
                    required
                    value={formData.requirement || ''}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    placeholder="e.g. Cardiology OPD / ECG / Knee Joint Pain"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Specialist Doctor</label>
                  <select
                    value={formData.assignedDoctor || 'Dr. Ravi Teja (Cardiologist)'}
                    onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="Dr. Ravi Teja (Cardiologist)">Dr. Ravi Teja (Cardiologist)</option>
                    <option value="Dr. Anusha Reddy (General Physician)">Dr. Anusha Reddy (General Physician)</option>
                    <option value="Dr. Prakash Kumar (Diabetologist)">Dr. Prakash Kumar (Diabetologist)</option>
                    <option value="Dr. Vikram Singh (Orthopedic)">Dr. Vikram Singh (Orthopedic)</option>
                    <option value="Dr. Radhika Sharma (Gynecologist)">Dr. Radhika Sharma (Gynecologist)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Initial Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Marketer Notes & Initial Symptoms</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Patient attended camp, recommended 2D Echo and lipid profile. Follow-up planned tomorrow."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f2e5a] hover:bg-[#152e4d] text-white rounded-xl font-bold shadow-md cursor-pointer transition-all"
                >
                  Save New Lead
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT LEAD */}
      {/* ========================================================================= */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Patient Lead</h3>
                  <p className="text-[11px] text-slate-500">Lead ID: {editingLead.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLead} className="space-y-3.5 text-xs">
              
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName || ''}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Status & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Status</label>
                  <select
                    value={formData.status || 'New'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District / Location</label>
                  <select
                    value={formData.location || 'Warangal'}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Warangal">Warangal</option>
                    <option value="Hanamkonda">Hanamkonda</option>
                    <option value="Mulugu">Mulugu</option>
                    <option value="Bhupalpally">Bhupalpally</option>
                    <option value="Jangaon">Jangaon</option>
                    <option value="Mahabubabad">Mahabubabad</option>
                  </select>
                </div>
              </div>

              {/* Source & Source Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Source Specification</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Source Category</label>
                    <select
                      value={formData.sourceCategory || 'Health Camps'}
                      onChange={(e) => setFormData({ ...formData, sourceCategory: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    >
                      <option value="Health Camps">Health Camps</option>
                      <option value="Website">Website</option>
                      <option value="Doctor Referral">Doctor Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Direct Walk-in">Direct Walk-in</option>
                      <option value="Community Outreach">Community Outreach</option>
                      <option value="24x7 Helpline">24x7 Helpline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Specific Camp / Campaign</label>
                    <input
                      type="text"
                      value={formData.sourceDetails || ''}
                      onChange={(e) => setFormData({ ...formData, sourceDetails: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Requirement & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medical Requirement</label>
                  <input
                    type="text"
                    value={formData.requirement || ''}
                    onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.nextFollowUpDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Marketer Progress Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all"
                >
                  Update Lead
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW FULL LEAD PROFILE */}
      {/* ========================================================================= */}
      {viewingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm border-2 border-emerald-400">
                  {viewingLead.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{viewingLead.patientName}</h3>
                  <p className="text-xs text-slate-500">{viewingLead.gender}, {viewingLead.age} Years • {viewingLead.location}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingLead(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Lead Identifier:</span>
                <span className="font-bold text-slate-900">{viewingLead.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Mobile Number:</span>
                <span className="font-bold text-emerald-800">{viewingLead.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Acquisition Channel:</span>
                <span className="font-bold text-purple-800">{viewingLead.sourceCategory}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Camp / Campaign:</span>
                <span className="font-bold text-slate-800 text-right">{viewingLead.sourceDetails}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Medical Need:</span>
                <span className="font-bold text-slate-900">{viewingLead.requirement}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {viewingLead.status}
                </span>
              </div>
              {viewingLead.memberId && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Ayudh Member ID:</span>
                  <span className="font-black text-emerald-700">{viewingLead.memberId} ({viewingLead.membershipTier})</span>
                </div>
              )}
              <div className="py-1">
                <span className="text-slate-500 font-medium block mb-1">Marketer Progress Notes:</span>
                <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                  {viewingLead.notes || 'No specific notes recorded.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <a
                href={`tel:${viewingLead.phone}`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Patient</span>
              </a>
              <button
                onClick={() => {
                  const leadToEdit = viewingLead;
                  setViewingLead(null);
                  handleOpenEditModal(leadToEdit);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 cursor-pointer text-xs"
              >
                Edit Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONVERT TO AYUDH VIKAS MEMBER */}
      {/* ========================================================================= */}
      {convertingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Convert Lead to Registered Patient</h3>
                  <p className="text-[11px] text-slate-500">{convertingLead.patientName} ({convertingLead.phone})</p>
                </div>
              </div>
              <button 
                onClick={() => setConvertingLead(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select an Ayudh Vikas membership tier to issue a permanent Member ID & register this patient directly into Dr. Ravi Teja's OPD and central clinic registry:
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => handleConvertLeadToPatient(convertingLead, 'Gold')}
                className="p-3 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="font-black text-amber-900 flex items-center gap-1">
                  <span>🏅 Gold Membership</span>
                </div>
                <div className="text-[10px] text-amber-700 mt-1">30% Hospital Discount + Free OP</div>
              </button>

              <button
                onClick={() => handleConvertLeadToPatient(convertingLead, 'Silver')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="font-black text-slate-900 flex items-center gap-1">
                  <span>🥈 Silver Membership</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">20% Hospital Discount</div>
              </button>

              <button
                onClick={() => handleConvertLeadToPatient(convertingLead, 'Senior Citizen')}
                className="p-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="font-black text-blue-900 flex items-center gap-1">
                  <span>👴 Senior Citizen Card</span>
                </div>
                <div className="text-[10px] text-blue-700 mt-1">Free Medicines + Home Visit</div>
              </button>

              <button
                onClick={() => handleConvertLeadToPatient(convertingLead, 'Rural Ayush')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="font-black text-emerald-900 flex items-center gap-1">
                  <span>🌿 Rural Ayush Card</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">Subsidized Village Camp Scheme</div>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setConvertingLead(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Delete Lead?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deletingLead.patientName}</strong> ({deletingLead.phone}) from your leads registry?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingLead(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0f2e5a] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-slide-up border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
