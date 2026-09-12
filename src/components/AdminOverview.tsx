import React from 'react';
import { useLiveData } from '../context/LiveDataContext';

function humanize(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).toLowerCase().includes('today');
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export const AdminOverview: React.FC = () => {
  const { collections, stats } = useLiveData();

  const values = {
    totalUsers: stats.users || 0,
    totalPatients: collections.patients?.length || 0,
    totalDoctors: collections.doctors?.filter((d) => (d.verificationStatus || 'VERIFIED') === 'VERIFIED').length || 0,
    pendingDoctors: collections.doctors?.filter((d) => d.verificationStatus === 'PENDING_VERIFICATION').length || 0,
    totalHospitals: collections.hospitals?.length || 0,
    todayAppointments: collections.appointments?.filter((a) => isToday(a.appointmentDateTime || a.appointmentDate)).length || 0,
    pendingVisitRequests: collections.visit_requests?.filter((v) => String(v.status).toLowerCase() === 'pending').length || 0,
    newLeads: collections.leads?.filter((l) => l.status === 'New').length || 0,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="bg-white p-4 rounded shadow border border-slate-100">
          <p className="text-gray-600 text-sm">{humanize(key)}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
      ))}
    </div>
  );
};
