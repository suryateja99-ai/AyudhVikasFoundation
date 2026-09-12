import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit,
  Eye,
  Megaphone,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Trash2,
  Users,
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

const subscriptionDefaults = [
  { name: 'Starter', amount: 2999, features: ['Hospital profile listing', 'Patient enquiries', 'Basic analytics'], enabled: true },
  { name: 'Growth', amount: 5999, features: ['Priority listing', 'Visit requests', 'Doctor roster CRUD'], enabled: true },
  { name: 'Premium', amount: 8999, features: ['Top placement', 'Advanced analytics', 'Unlimited doctor management'], enabled: true },
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

function dateKey(value?: string) {
  if (!value) return 'Unscheduled';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  return String(value).slice(0, 12);
}

export const AdminRoleManagement: React.FC<AdminRoleManagementProps> = ({ activeNav, users, onUsersChanged, onToast }) => {
  const workspace = navToWorkspace[activeNav] || 'patients';
  const { collections, create, update, remove } = useLiveData();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [detailTab, setDetailTab] = useState('overview');
  const [editing, setEditing] = useState<any | null>(null);
  const [plans, setPlans] = useState(subscriptionDefaults);
  const [newPlan, setNewPlan] = useState({ name: '', amount: '9999', feature: '' });

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
    const text = `${item.name || item.fullName || item.hospitalName || ''} ${item.email || ''} ${item.phone || ''} ${item.district || ''}`.toLowerCase();
    return !search || text.includes(search.toLowerCase());
  });

  const selected = filteredRows.find((item: any) => item.id === selectedId) || filteredRows[0];

  const patientStats = (patient: any) => {
    const pid = patient?.patientId || patient?.id;
    const phone = patient?.phone;
    const appointments = collections.appointments.filter((item: any) => item.patientId === pid || item.phone === phone);
    const visits = collections.visit_requests.filter((item: any) => item.patientId === pid || item.patientPhone === phone);
    return {
      appointments: appointments.length,
      visits: visits.length,
      approved: [...appointments, ...visits].filter((item: any) => ['Accepted', 'Approved', 'Confirmed', 'Completed'].includes(item.status)).length,
      rejected: [...appointments, ...visits].filter((item: any) => ['Rejected', 'Cancelled', 'Declined'].includes(item.status)).length,
    };
  };

  const doctorStats = (doctor: any) => {
    const did = doctor?.doctorId || doctor?.id;
    const name = doctor?.name;
    const appointments = collections.appointments.filter((item: any) => item.doctorId === did || item.doctorName === name);
    const earnings = appointments.reduce((sum: number, item: any) => sum + Number(item.consultationFee || doctor?.consultationFee || 0), 0);
    return { patients: new Set(appointments.map((item: any) => item.patientId || item.phone || item.patientName)).size, appointments: appointments.length, earnings };
  };

  const hospitalStats = (hospital: any) => {
    const hid = hospital?.hospitalId || hospital?.id;
    const name = hospital?.name || hospital?.hospitalName;
    const visits = collections.visit_requests.filter((item: any) => item.hospitalId === hid || item.hospitalName === name);
    const doctors = collections.doctors.filter((item: any) => item.hospitalId === hid || item.hospital === name || item.hospitalName === name);
    return { visits: visits.length, approved: visits.filter((item: any) => ['Accepted', 'Approved', 'Completed'].includes(item.status)).length, doctors: doctors.length };
  };

  const marketingStats = (member: any) => {
    const id = member?.id;
    const name = member?.name;
    const leads = collections.leads.filter((item: any) => item.createdBy === id || item.assignedTo === name || item.owner === name);
    return { leads: leads.length, converted: leads.filter((item: any) => ['Converted', 'Closed', 'Won'].includes(item.status)).length };
  };

  const statCards = (() => {
    if (workspace === 'patients') {
      const totalAppointments = patientUsers.reduce((sum, user) => sum + patientStats(user).appointments, 0);
      const totalVisits = patientUsers.reduce((sum, user) => sum + patientStats(user).visits, 0);
      return [['Patient Users', patientUsers.length], ['Doctor Appointment Requests', totalAppointments], ['Hospital Visit Requests', totalVisits], ['Approved', collections.appointments.filter((a: any) => ['Accepted', 'Approved', 'Confirmed'].includes(a.status)).length]];
    }
    if (workspace === 'doctors') {
      const totalEarnings = collections.appointments.reduce((sum: number, item: any) => sum + Number(item.consultationFee || 0), 0);
      return [['Doctor Records', collections.doctors.length], ['Handled Patients', collections.appointments.length], ['Timeline Earnings', `Rs. ${totalEarnings}`], ['Active Doctors', collections.doctors.filter((d: any) => d.status !== 'On Leave').length]];
    }
    if (workspace === 'hospitals') {
      return [['Hospitals', collections.hospitals.length], ['Patient Visits', collections.visit_requests.length], ['Subscription Users', hospitalUsers.length], ['Enabled Plans', plans.filter((plan) => plan.enabled).length]];
    }
    return [['Marketing Users', marketingUsers.length], ['Leads', collections.leads.length], ['Conversions', collections.leads.filter((lead: any) => ['Converted', 'Closed', 'Won'].includes(lead.status)).length], ['Active Territories', new Set(marketingUsers.map((user) => user.assignedTerritory || user.district)).size]];
  })();

  const saveUser = async (patch: any) => {
    const res = await api.updateUser(patch.id, patch);
    onUsersChanged(users.map((user) => (user.id === patch.id ? res.item : user)));
    setEditing(null);
    onToast('User account updated');
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
    onToast('User account created');
  };

  const deleteUser = async (id: string) => {
    await api.removeUser(id);
    onUsersChanged(users.filter((user) => user.id !== id));
    onToast('User account deleted');
  };

  const saveRecord = async (collection: CollectionName, item: any) => {
    if (item.id) await update(collection, item.id, item);
    else await create(collection, item);
    setEditing(null);
    onToast('Database record saved');
  };

  const deleteRecord = async (collection: CollectionName, id: string) => {
    await remove(collection, id);
    onToast('Database record deleted');
  };

  const title = workspace === 'patients' ? 'Patient Users Management' : workspace === 'doctors' ? 'Doctors Management' : workspace === 'hospitals' ? 'Hospitals Management' : 'Marketing Team Management';
  const tabs = workspace === 'patients'
    ? ['Overview', 'Appointments', 'Hospital Visits', 'Approvals']
    : workspace === 'doctors'
      ? ['Overview', 'Patient Timeline', 'Earnings', 'Profile']
      : workspace === 'hospitals'
        ? ['Overview', 'Visit Timeline', 'Subscription', 'Feature Management']
        : ['Overview', 'Leads', 'Conversions', 'Territory'];

  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="text-xs font-semibold text-slate-500">Role-specific registry, CRUD, statistics, and selected-record detail tabs.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold min-w-[260px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statCards.map(([label, value], index) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
            <div className="text-xl font-black text-slate-900 mt-1">{value}</div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">Live database metric {index + 1}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase">Registry</span>
            <button onClick={() => setEditing({ role: workspace === 'patients' ? 'patient' : workspace === 'marketing' ? 'marketing' : undefined })} className="text-xs font-black text-blue-700 flex items-center gap-1 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {filteredRows.map((item: any) => {
              const name = item.name || item.fullName || item.hospitalName || item.shortName || 'Unnamed';
              return (
                <button key={item.id} onClick={() => { setSelectedId(item.id); setDetailTab('overview'); }} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selected?.id === item.id ? 'bg-blue-50/70' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0f2e5a] text-white flex items-center justify-center text-[11px] font-black">{initials(name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900 truncate">{name}</div>
                      <div className="text-[10px] font-semibold text-slate-500 truncate">{item.email || item.phone || item.district || item.speciality || item.assignedTerritory || 'No contact data'}</div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {selected ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-900">{selected.name || selected.hospitalName || selected.shortName}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{selected.email || selected.phone || selected.speciality || selected.district}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(selected)} className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black flex items-center gap-1 cursor-pointer">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => workspace === 'patients' || workspace === 'marketing' ? deleteUser(selected.id) : deleteRecord(workspace === 'doctors' ? 'doctors' : 'hospitals', selected.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
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
                {workspace === 'patients' && <PatientDetails selected={selected} stats={patientStats(selected)} appointments={collections.appointments} visits={collections.visit_requests} tab={detailTab} />}
                {workspace === 'doctors' && <DoctorDetails selected={selected} stats={doctorStats(selected)} appointments={collections.appointments} tab={detailTab} />}
                {workspace === 'hospitals' && <HospitalDetails selected={selected} stats={hospitalStats(selected)} plans={plans} setPlans={setPlans} newPlan={newPlan} setNewPlan={setNewPlan} update={update} tab={detailTab} />}
                {workspace === 'marketing' && <MarketingDetails selected={selected} stats={marketingStats(selected)} leads={collections.leads} tab={detailTab} />}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-bold">No records available.</div>
          )}
        </div>
      </div>

      {editing && (
        <EditModal
          workspace={workspace}
          item={editing}
          setItem={setEditing}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            if ((workspace === 'patients' || workspace === 'marketing') && item.id) saveUser(item);
            else if (workspace === 'patients' || workspace === 'marketing') createUser(item);
            else saveRecord(workspace === 'doctors' ? 'doctors' : 'hospitals', item);
          }}
        />
      )}
    </section>
  );
};

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
      <div className="text-base font-black text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function Timeline({ items, label }: { items: any[]; label: string }) {
  const grouped = items.reduce((acc: Record<string, number>, item) => {
    const key = dateKey(item.date || item.preferredDate || item.createdAt);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([date, count]) => (
        <div key={date} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <span className="font-bold text-slate-700">{date}</span>
          <span className="font-black text-slate-900">{count} {label}</span>
        </div>
      ))}
      {!items.length && <div className="text-slate-500 font-bold">No timeline data yet.</div>}
    </div>
  );
}

function PatientDetails({ selected, stats, appointments, visits, tab }: any) {
  const pid = selected.patientId || selected.id;
  const phone = selected.phone;
  const patientAppointments = appointments.filter((item: any) => item.patientId === pid || item.phone === phone);
  const patientVisits = visits.filter((item: any) => item.patientId === pid || item.patientPhone === phone);
  if (tab === 'appointments') return <Timeline items={patientAppointments} label="appointments" />;
  if (tab === 'hospital visits') return <Timeline items={patientVisits} label="visits" />;
  if (tab === 'approvals') return <div className="grid grid-cols-2 gap-3"><Metric label="Approved" value={stats.approved} /><Metric label="Rejected" value={stats.rejected} /></div>;
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Metric label="Doctor Requests" value={stats.appointments} /><Metric label="Hospital Visits" value={stats.visits} /><Metric label="Approved" value={stats.approved} /><Metric label="Rejected" value={stats.rejected} /></div>;
}

function DoctorDetails({ selected, stats, appointments, tab }: any) {
  const doctorAppointments = appointments.filter((item: any) => item.doctorId === selected.id || item.doctorName === selected.name);
  if (tab === 'patient timeline') return <Timeline items={doctorAppointments} label="patients" />;
  if (tab === 'earnings') return <div className="grid grid-cols-2 gap-3"><Metric label="Total Earnings" value={`Rs. ${stats.earnings}`} /><Metric label="Average Fee" value={`Rs. ${selected.consultationFee || 0}`} /></div>;
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Metric label="Handled Patients" value={stats.patients} /><Metric label="Appointments" value={stats.appointments} /><Metric label="Earnings" value={`Rs. ${stats.earnings}`} /><Metric label="Status" value={selected.status || 'Active'} /></div>;
}

function HospitalDetails({ selected, stats, plans, setPlans, newPlan, setNewPlan, update, tab }: any) {
  if (tab === 'feature management') {
    return (
      <div className="space-y-3">
        {plans.map((plan: any) => (
          <div key={plan.name} className="rounded-lg border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-black text-slate-900">{plan.name} - Rs. {plan.amount}</div>
              <div className="text-[11px] text-slate-500 font-semibold">{plan.features.join(', ')}</div>
            </div>
            <button onClick={() => setPlans(plans.map((p: any) => p.name === plan.name ? { ...p, enabled: !p.enabled } : p))} className={`px-3 py-1.5 rounded-lg text-[11px] font-black ${plan.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {plan.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="New plan" className="px-3 py-2 border border-slate-200 rounded-lg font-semibold" />
          <input value={newPlan.amount} onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })} placeholder="Price" className="px-3 py-2 border border-slate-200 rounded-lg font-semibold" />
          <input value={newPlan.feature} onChange={(e) => setNewPlan({ ...newPlan, feature: e.target.value })} placeholder="Feature" className="px-3 py-2 border border-slate-200 rounded-lg font-semibold" />
          <button onClick={() => { if (newPlan.name) setPlans([...plans, { name: newPlan.name, amount: Number(newPlan.amount), features: [newPlan.feature || 'Custom feature'], enabled: true }]); }} className="bg-blue-600 text-white rounded-lg font-black">Add Plan</button>
        </div>
      </div>
    );
  }
  if (tab === 'subscription') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((plan: any) => (
          <button key={plan.name} onClick={() => update('hospitals', selected.id, { subscriptionPlan: plan.name, subscriptionAmount: plan.amount, enabledFeatures: plan.features })} className="rounded-lg border border-slate-200 p-3 text-left hover:border-blue-500">
            <CreditCard className="w-4 h-4 text-blue-600 mb-2" />
            <div className="font-black">{plan.name}</div>
            <div className="text-lg font-black">Rs. {plan.amount}</div>
          </button>
        ))}
      </div>
    );
  }
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Metric label="Patient Visits" value={stats.visits} /><Metric label="Approved Visits" value={stats.approved} /><Metric label="Doctors" value={stats.doctors} /><Metric label="Plan" value={selected.subscriptionPlan || 'Not assigned'} /></div>;
}

function MarketingDetails({ selected, stats, leads, tab }: any) {
  const userLeads = leads.filter((item: any) => item.createdBy === selected.id || item.assignedTo === selected.name || item.owner === selected.name);
  if (tab === 'leads' || tab === 'conversions') return <Timeline items={userLeads} label={tab} />;
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Metric label="Leads" value={stats.leads} /><Metric label="Converted" value={stats.converted} /><Metric label="Territory" value={selected.assignedTerritory || selected.district || 'Unassigned'} /><Metric label="Status" value={selected.status || 'Active'} /></div>;
}

function EditModal({ workspace, item, setItem, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <form onSubmit={(e) => { e.preventDefault(); onSave(item); }} className="bg-white rounded-xl border border-slate-200 shadow-2xl p-5 w-full max-w-lg space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">Edit {workspace.slice(0, -1)} record</h3>
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
