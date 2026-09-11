import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Edit,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { CollectionName, useLiveData } from '../context/LiveDataContext';
import { api } from '../lib/api';

type Workspace = 'patients' | 'doctors' | 'hospitals' | 'marketing';

interface AdminRoleManagementProps {
  activeNav: string;
  users: any[];
  onUsersChanged: (users: any[]) => void;
  onToast: (message: string) => void;
}

const DEFAULT_PLANS = [
  {
    id: 'PLAN-STARTER',
    name: 'Starter',
    amount: 2999,
    features: [
      { id: 'st-1', name: 'Hospital profile listing', enabled: true },
      { id: 'st-2', name: 'Patient enquiries', enabled: true },
      { id: 'st-3', name: 'Basic analytics', enabled: true },
    ],
  },
  {
    id: 'PLAN-GROWTH',
    name: 'Growth',
    amount: 5999,
    features: [
      { id: 'gr-1', name: 'Priority listing', enabled: true },
      { id: 'gr-2', name: 'Visit requests', enabled: true },
      { id: 'gr-3', name: 'Doctor roster', enabled: true },
      { id: 'gr-4', name: 'Ayudh Cashless Desk', enabled: true },
    ],
  },
  {
    id: 'PLAN-PREMIUM',
    name: 'Premium',
    amount: 8999,
    features: [
      { id: 'pr-1', name: 'Top placement', enabled: true },
      { id: 'pr-2', name: 'Advanced analytics', enabled: true },
      { id: 'pr-3', name: 'Unlimited doctor management', enabled: true },
      { id: 'pr-4', name: 'Emergency Support', enabled: true },
      { id: 'pr-5', name: 'Visit requests', enabled: true },
    ],
  },
];

const navToWorkspace: Record<string, Workspace> = {
  'Users Management': 'patients',
  'Doctors Management': 'doctors',
  'Hospitals Management': 'hospitals',
  'Marketing Team': 'marketing',
};

function initials(name = 'User') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
}

function normalizeFeatures(features: any[] = []) {
  return features.map((feature, index) =>
    typeof feature === 'string'
      ? { id: `f-${index}`, name: feature, enabled: true }
      : { id: feature.id || `f-${index}`, name: feature.name, enabled: feature.enabled !== false }
  );
}

export function getPlanFeatures(plans: any[], planName?: string) {
  const plan = plans.find((item) => item.name === planName) || plans[0];
  return normalizeFeatures(plan?.features || []).filter((feature) => feature.enabled);
}

export const AdminRoleManagement: React.FC<AdminRoleManagementProps> = ({ activeNav, users, onUsersChanged, onToast }) => {
  if (activeNav === 'Feature Management') {
    return <FeatureManagementPanel onToast={onToast} />;
  }

  const workspace = navToWorkspace[activeNav] || 'patients';
  const { collections, create, update, remove } = useLiveData();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [editing, setEditing] = useState<any | null>(null);

  const plans = (collections.subscription_plans || []).length ? collections.subscription_plans : DEFAULT_PLANS;

  const patientUsers = users.filter((user) => user.role === 'patient');
  const doctorUsers = users.filter((user) => user.role === 'doctor');
  const hospitalUsers = users.filter((user) => user.role === 'hospital');
  const marketingUsers = users.filter((user) => user.role === 'marketing');

  const rows = useMemo(() => {
    if (workspace === 'patients') return patientUsers;
    if (workspace === 'doctors') return collections.doctors.length ? collections.doctors : doctorUsers;
    if (workspace === 'hospitals') return collections.hospitals.length ? collections.hospitals : hospitalUsers;
    return marketingUsers;
  }, [workspace, patientUsers, doctorUsers, hospitalUsers, marketingUsers, collections.doctors, collections.hospitals]);

  const filteredRows = rows.filter((item: any) => {
    const text = `${item.name || item.fullName || item.hospitalName || ''} ${item.email || ''} ${item.phone || ''} ${item.patientId || ''} ${item.speciality || ''} ${item.district || ''}`.toLowerCase();
    return !search || text.includes(search.toLowerCase());
  });

  const selected = filteredRows.find((item: any) => item.id === selectedId) || null;

  useEffect(() => {
    setSelectedId(null);
    setDetailTab('overview');
    setSearch('');
  }, [workspace]);

  const saveUser = async (patch: any) => {
    const res = await api.updateUser(patch.id, patch);
    onUsersChanged(users.map((user) => (user.id === patch.id ? res.item : user)));
    setEditing(null);
    onToast('Record updated');
  };

  const createUser = async (payload: any) => {
    const res = await api.createUser({
      name: payload.name || 'New User',
      role: payload.role || (workspace === 'marketing' ? 'marketing' : 'patient'),
      email: payload.email || '',
      phone: payload.phone || '',
      password: payload.password || 'Password@123',
      status: payload.status || 'Active',
    });
    onUsersChanged([res.item, ...users]);
    setEditing(null);
    onToast('Record created');
  };

  const deleteUser = async (id: string) => {
    await api.removeUser(id);
    onUsersChanged(users.filter((user) => user.id !== id));
    setSelectedId(null);
    onToast('Record deleted');
  };

  const saveRecord = async (collection: CollectionName, item: any) => {
    if (item.id) await update(collection, item.id, item);
    else await create(collection, item);
    setEditing(null);
    onToast('Record saved');
  };

  const deleteRecord = async (collection: CollectionName, id: string) => {
    await remove(collection, id);
    setSelectedId(null);
    onToast('Record deleted');
  };

  const title =
    workspace === 'patients' ? 'Users Registry'
    : workspace === 'doctors' ? 'Doctors Registry'
    : workspace === 'hospitals' ? 'Hospitals Registry'
    : 'Marketing Team';

  const tabs = workspace === 'patients'
    ? ['Overview', 'Appointments', 'Hospital Visits', 'Approvals']
    : workspace === 'doctors'
      ? ['Overview', 'Appointments', 'Earnings', 'Profile']
      : workspace === 'hospitals'
        ? ['Overview', 'Visit Timeline', 'Subscription']
        : ['Overview', 'Leads', 'Conversions', 'Territory'];

  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">{selected ? (selected.name || selected.hospitalName || selected.shortName) : title}</h3>
          <p className="text-xs font-semibold text-slate-500">
            {selected ? 'Individual record. Use Back to return to the registry table.' : 'Click a row to open the full profile.'}
          </p>
        </div>
        {!selected && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold min-w-[240px]" />
            </div>
            <button onClick={() => setEditing({ role: workspace === 'patients' ? 'patient' : workspace === 'marketing' ? 'marketing' : undefined })} className="px-3 py-2 rounded-lg bg-[#0f2e5a] text-white text-xs font-black flex items-center gap-1 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        )}
      </div>

      {!selected ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {workspace === 'patients' && (
                    <>
                      <th className="text-left p-3 font-black uppercase">Patient</th>
                      <th className="text-left p-3 font-black uppercase">Patient ID</th>
                      <th className="text-left p-3 font-black uppercase">Phone</th>
                      <th className="text-left p-3 font-black uppercase">Email</th>
                      <th className="text-left p-3 font-black uppercase">Age / Gender</th>
                      <th className="text-left p-3 font-black uppercase">District</th>
                      <th className="text-left p-3 font-black uppercase">Status</th>
                    </>
                  )}
                  {workspace === 'doctors' && (
                    <>
                      <th className="text-left p-3 font-black uppercase">Doctor</th>
                      <th className="text-left p-3 font-black uppercase">Speciality</th>
                      <th className="text-left p-3 font-black uppercase">Hospital</th>
                      <th className="text-left p-3 font-black uppercase">Phone</th>
                      <th className="text-left p-3 font-black uppercase">Email</th>
                      <th className="text-left p-3 font-black uppercase">Status</th>
                    </>
                  )}
                  {workspace === 'hospitals' && (
                    <>
                      <th className="text-left p-3 font-black uppercase">Hospital</th>
                      <th className="text-left p-3 font-black uppercase">District</th>
                      <th className="text-left p-3 font-black uppercase">Plan</th>
                      <th className="text-left p-3 font-black uppercase">Phone</th>
                      <th className="text-left p-3 font-black uppercase">Beds</th>
                      <th className="text-left p-3 font-black uppercase">Status</th>
                    </>
                  )}
                  {workspace === 'marketing' && (
                    <>
                      <th className="text-left p-3 font-black uppercase">Name</th>
                      <th className="text-left p-3 font-black uppercase">Territory</th>
                      <th className="text-left p-3 font-black uppercase">Phone</th>
                      <th className="text-left p-3 font-black uppercase">Email</th>
                      <th className="text-left p-3 font-black uppercase">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item: any) => (
                  <tr key={item.id} onClick={() => { setSelectedId(item.id); setDetailTab('overview'); }} className="border-t border-slate-100 hover:bg-blue-50/60 cursor-pointer">
                    {workspace === 'patients' && (
                      <>
                        <td className="p-3 font-black text-slate-900">{item.name || item.fullName}</td>
                        <td className="p-3 font-semibold text-slate-600">{item.patientId || item.id}</td>
                        <td className="p-3 font-semibold">{item.phone || '—'}</td>
                        <td className="p-3 font-semibold">{item.email || '—'}</td>
                        <td className="p-3 font-semibold">{item.age || '—'} / {item.gender || '—'}</td>
                        <td className="p-3 font-semibold">{item.district || '—'}</td>
                        <td className="p-3"><StatusPill value={item.status || 'Active'} /></td>
                      </>
                    )}
                    {workspace === 'doctors' && (
                      <>
                        <td className="p-3 font-black text-slate-900">{item.name}</td>
                        <td className="p-3 font-semibold">{item.speciality || '—'}</td>
                        <td className="p-3 font-semibold">{item.hospital || item.hospitalName || '—'}</td>
                        <td className="p-3 font-semibold">{item.phone || '—'}</td>
                        <td className="p-3 font-semibold">{item.email || '—'}</td>
                        <td className="p-3"><StatusPill value={item.verificationStatus || item.status || 'Active'} /></td>
                      </>
                    )}
                    {workspace === 'hospitals' && (
                      <>
                        <td className="p-3 font-black text-slate-900">{item.name || item.hospitalName}</td>
                        <td className="p-3 font-semibold">{item.district || '—'}</td>
                        <td className="p-3 font-black text-emerald-700">{item.subscriptionPlan || 'Not assigned'}</td>
                        <td className="p-3 font-semibold">{item.phone || '—'}</td>
                        <td className="p-3 font-semibold">{item.availableBeds || 0}/{item.totalBeds || 0}</td>
                        <td className="p-3"><StatusPill value={item.verificationStatus || item.status || 'Active'} /></td>
                      </>
                    )}
                    {workspace === 'marketing' && (
                      <>
                        <td className="p-3 font-black text-slate-900">{item.name}</td>
                        <td className="p-3 font-semibold">{item.assignedTerritory || item.district || '—'}</td>
                        <td className="p-3 font-semibold">{item.phone || '—'}</td>
                        <td className="p-3 font-semibold">{item.email || '—'}</td>
                        <td className="p-3"><StatusPill value={item.status || 'Active'} /></td>
                      </>
                    )}
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center gap-1 cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="w-11 h-11 rounded-xl bg-[#0f2e5a] text-white flex items-center justify-center text-sm font-black">
                {initials(selected.name || selected.hospitalName)}
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">{selected.name || selected.hospitalName || selected.shortName}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{selected.email || selected.phone || selected.speciality || selected.district}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(selected)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black flex items-center gap-1 cursor-pointer">
                <Edit className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => workspace === 'patients' || workspace === 'marketing' ? deleteUser(selected.id) : deleteRecord(workspace === 'doctors' ? 'doctors' : 'hospitals', selected.id)}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-[11px] font-black flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>

          <div className="px-4 pt-3 border-b border-slate-100 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setDetailTab(tab.toLowerCase())} className={`px-3 py-2 text-[11px] font-black border-b-2 whitespace-nowrap ${detailTab === tab.toLowerCase() ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 text-xs">
            {workspace === 'patients' && <PatientDetails selected={selected} appointments={collections.appointments} visits={collections.visit_requests} tab={detailTab} />}
            {workspace === 'doctors' && <DoctorDetails selected={selected} appointments={collections.appointments} tab={detailTab} />}
            {workspace === 'hospitals' && <HospitalDetails selected={selected} visits={collections.visit_requests} doctors={collections.doctors} plans={plans} tab={detailTab} />}
            {workspace === 'marketing' && <MarketingDetails selected={selected} leads={collections.leads} tab={detailTab} />}
          </div>
        </div>
      )}

      {editing && (
        <EditModal
          workspace={workspace}
          item={editing}
          setItem={setEditing}
          onClose={() => setEditing(null)}
          onSave={(item: any) => {
            if ((workspace === 'patients' || workspace === 'marketing') && item.id) saveUser(item);
            else if (workspace === 'patients' || workspace === 'marketing') createUser(item);
            else saveRecord(workspace === 'doctors' ? 'doctors' : 'hospitals', item);
          }}
        />
      )}
    </section>
  );
};

function StatusPill({ value }: { value: string }) {
  const good = /active|verified|approved/i.test(value);
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${good ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
      {value}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
      <div className="text-base font-black text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function RecordList({ items, empty }: { items: any[]; empty: string }) {
  if (!items.length) return <div className="text-slate-500 font-bold py-6 text-center">{empty}</div>;
  return (
    <div className="overflow-x-auto border border-slate-100 rounded-xl">
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-2.5 font-black uppercase text-slate-500">Record</th>
            <th className="text-left p-2.5 font-black uppercase text-slate-500">When</th>
            <th className="text-left p-2.5 font-black uppercase text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="p-2.5 font-bold text-slate-800">{item.doctorName || item.hospitalName || item.patientName || item.title || item.id}</td>
              <td className="p-2.5 font-semibold text-slate-500">{item.appointmentDate || item.preferredDate || item.createdAt || '—'}</td>
              <td className="p-2.5"><StatusPill value={item.status || 'Pending'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientDetails({ selected, appointments, visits, tab }: any) {
  const pid = selected.patientId || selected.id;
  const phone = selected.phone;
  const patientAppointments = appointments.filter((item: any) => item.patientId === pid || item.phone === phone);
  const patientVisits = visits.filter((item: any) => item.patientId === pid || item.patientPhone === phone);
  const approved = [...patientAppointments, ...patientVisits].filter((item: any) => ['Accepted', 'Approved', 'Confirmed', 'Completed', 'Scheduled'].includes(item.status)).length;
  const rejected = [...patientAppointments, ...patientVisits].filter((item: any) => ['Rejected', 'Cancelled', 'Declined'].includes(item.status)).length;
  if (tab === 'appointments') return <RecordList items={patientAppointments} empty="No doctor appointments for this patient." />;
  if (tab === 'hospital visits') return <RecordList items={patientVisits} empty="No hospital visit requests for this patient." />;
  if (tab === 'approvals') return <div className="grid grid-cols-2 gap-3"><Metric label="Approved" value={approved} /><Metric label="Rejected" value={rejected} /></div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Patient ID" value={selected.patientId || selected.id} />
        <Metric label="Phone" value={selected.phone || '—'} />
        <Metric label="Age / Gender" value={`${selected.age || '—'} / ${selected.gender || '—'}`} />
        <Metric label="Blood group" value={selected.bloodGroup || '—'} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Doctor requests" value={patientAppointments.length} />
        <Metric label="Hospital visits" value={patientVisits.length} />
        <Metric label="Approved" value={approved} />
        <Metric label="Rejected" value={rejected} />
      </div>
    </div>
  );
}

function DoctorDetails({ selected, appointments, tab }: any) {
  const doctorAppointments = appointments.filter((item: any) => item.doctorId === selected.id || item.doctorName === selected.name);
  const earnings = doctorAppointments.reduce((sum: number, item: any) => sum + Number(item.consultationFee || selected.consultationFee || 0), 0);
  if (tab === 'appointments') return <RecordList items={doctorAppointments} empty="No appointments assigned to this doctor." />;
  if (tab === 'earnings') return <div className="grid grid-cols-2 gap-3"><Metric label="Total earnings" value={`Rs. ${earnings}`} /><Metric label="Consultation fee" value={`Rs. ${selected.consultationFee || 0}`} /></div>;
  if (tab === 'profile') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Metric label="Speciality" value={selected.speciality || '—'} />
        <Metric label="Hospital" value={selected.hospital || selected.hospitalName || '—'} />
        <Metric label="Qualification" value={selected.qualification || selected.qualifications || '—'} />
        <Metric label="Experience" value={`${selected.experienceYears || '—'} years`} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Metric label="Speciality" value={selected.speciality || '—'} />
      <Metric label="Appointments" value={doctorAppointments.length} />
      <Metric label="Earnings" value={`Rs. ${earnings}`} />
      <Metric label="Status" value={selected.verificationStatus || selected.status || 'Active'} />
    </div>
  );
}

function HospitalDetails({ selected, visits, doctors, plans, tab }: any) {
  const hid = selected.hospitalId || selected.id;
  const name = selected.name || selected.hospitalName;
  const hospitalVisits = visits.filter((item: any) => item.hospitalId === hid || item.hospitalName === name);
  const hospitalDoctors = doctors.filter((item: any) => item.hospitalId === hid || item.hospital === name || item.hospitalName === name);
  const planName = selected.subscriptionPlan;
  const plan = plans.find((item: any) => item.name === planName);
  const features = getPlanFeatures(plans, planName);

  if (tab === 'visit timeline') return <RecordList items={hospitalVisits} empty="No visit requests for this hospital." />;
  if (tab === 'subscription') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">Registered subscription</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{planName || 'Not assigned'}</div>
          <div className="text-sm font-bold text-slate-600">Rs. {selected.subscriptionAmount || plan?.amount || '—'}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">This is the plan chosen during hospital registration. Features below come from Feature Management.</p>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900 mb-2">Enabled features for this plan</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2 rounded-lg bg-white border border-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> {feature.name}
              </div>
            ))}
            {!features.length && <div className="text-slate-500 font-bold">No enabled features on this plan.</div>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Metric label="Patient visits" value={hospitalVisits.length} />
      <Metric label="Doctors" value={hospitalDoctors.length} />
      <Metric label="Plan" value={planName || 'Not assigned'} />
      <Metric label="Beds" value={`${selected.availableBeds || 0}/${selected.totalBeds || 0}`} />
    </div>
  );
}

function MarketingDetails({ selected, leads, tab }: any) {
  const userLeads = leads.filter((item: any) => item.createdBy === selected.id || item.assignedTo === selected.name || item.owner === selected.name);
  if (tab === 'leads' || tab === 'conversions') return <RecordList items={userLeads} empty="No leads yet." />;
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Metric label="Leads" value={userLeads.length} /><Metric label="Territory" value={selected.assignedTerritory || selected.district || 'Unassigned'} /><Metric label="Phone" value={selected.phone || '—'} /><Metric label="Status" value={selected.status || 'Active'} /></div>;
}

export const FeatureManagementPanel: React.FC<{ onToast: (message: string) => void }> = ({ onToast }) => {
  const { collections, create, update, remove } = useLiveData();
  const [newFeature, setNewFeature] = useState<Record<string, string>>({});
  const [rename, setRename] = useState<{ planId: string; featureId: string; name: string } | null>(null);

  useEffect(() => {
    if (collections.subscription_plans?.length) return;
    DEFAULT_PLANS.forEach((plan) => {
      create('subscription_plans', plan).catch(() => undefined);
    });
  }, [collections.subscription_plans, create]);

  const plans = collections.subscription_plans?.length ? collections.subscription_plans : DEFAULT_PLANS;

  const savePlan = async (plan: any) => {
    await update('subscription_plans', plan.id, plan);
    onToast('Plan updated');
  };

  const addFeature = async (plan: any) => {
    const name = (newFeature[plan.id] || '').trim();
    if (!name) return;
    const features = [...normalizeFeatures(plan.features), { id: `f-${Date.now()}`, name, enabled: true }];
    await savePlan({ ...plan, features });
    setNewFeature({ ...newFeature, [plan.id]: '' });
  };

  const toggleFeature = async (plan: any, featureId: string) => {
    const features = normalizeFeatures(plan.features).map((feature) => feature.id === featureId ? { ...feature, enabled: !feature.enabled } : feature);
    await savePlan({ ...plan, features });
  };

  const deleteFeature = async (plan: any, featureId: string) => {
    const features = normalizeFeatures(plan.features).filter((feature) => feature.id !== featureId);
    await savePlan({ ...plan, features });
  };

  const renameFeature = async () => {
    if (!rename) return;
    const plan = plans.find((item: any) => item.id === rename.planId);
    if (!plan) return;
    const features = normalizeFeatures(plan.features).map((feature) => feature.id === rename.featureId ? { ...feature, name: rename.name } : feature);
    await savePlan({ ...plan, features });
    setRename(null);
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900">Feature Management</h3>
        <p className="text-xs font-semibold text-slate-500">Define features for each subscription plan. Hospitals only receive the enabled features of the plan they registered with.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {plans.map((plan: any) => (
          <div key={plan.id} className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="text-sm font-black text-slate-900">{plan.name}</div>
              <div className="text-lg font-black text-emerald-700">Rs. {plan.amount}</div>
            </div>
            <div className="p-4 space-y-2">
              {normalizeFeatures(plan.features).map((feature) => (
                <div key={feature.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-2">
                  <button
                    onClick={() => toggleFeature(plan, feature.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${feature.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    title={feature.enabled ? 'Disable feature' : 'Enable feature'}
                  >
                    <span className={`absolute top-0.5 ${feature.enabled ? 'right-0.5' : 'left-0.5'} w-4 h-4 bg-white rounded-full shadow-sm`} />
                  </button>
                  {rename?.featureId === feature.id ? (
                    <input value={rename.name} onChange={(e) => setRename({ ...rename, name: e.target.value })} className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs font-semibold" />
                  ) : (
                    <span className={`flex-1 text-xs font-bold ${feature.enabled ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{feature.name}</span>
                  )}
                  {rename?.featureId === feature.id ? (
                    <button onClick={renameFeature} className="text-emerald-700 font-black text-[10px] cursor-pointer">Save</button>
                  ) : (
                    <button onClick={() => setRename({ planId: plan.id, featureId: feature.id, name: feature.name })} className="text-slate-400 hover:text-blue-700 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  )}
                  <button onClick={() => deleteFeature(plan, feature.id)} className="text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <input value={newFeature[plan.id] || ''} onChange={(e) => setNewFeature({ ...newFeature, [plan.id]: e.target.value })} placeholder="Add a feature" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold" />
                <button onClick={() => addFeature(plan)} className="px-3 py-2 rounded-lg bg-[#0f2e5a] text-white text-xs font-black cursor-pointer">Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

function EditModal({ workspace, item, setItem, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <form onSubmit={(e) => { e.preventDefault(); onSave(item); }} className="bg-white rounded-xl border border-slate-200 shadow-2xl p-5 w-full max-w-lg space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">Edit record</h3>
          <button type="button" onClick={onClose}><XCircle className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={item.name || item.hospitalName || ''} onChange={(e) => setItem({ ...item, name: e.target.value, hospitalName: workspace === 'hospitals' ? e.target.value : item.hospitalName })} placeholder="Name" className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
          <input value={item.email || ''} onChange={(e) => setItem({ ...item, email: e.target.value })} placeholder="Email" className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
          <input value={item.phone || ''} onChange={(e) => setItem({ ...item, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
          <input value={item.district || item.speciality || ''} onChange={(e) => setItem({ ...item, district: e.target.value, speciality: workspace === 'doctors' ? e.target.value : item.speciality })} placeholder={workspace === 'doctors' ? 'Speciality' : 'District'} className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
        </div>
        {(workspace === 'patients' || workspace === 'marketing') && (
          <input value={item.password || ''} onChange={(e) => setItem({ ...item, password: e.target.value })} placeholder="New password optional" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold" />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-black">Save</button>
        </div>
      </form>
    </div>
  );
}
