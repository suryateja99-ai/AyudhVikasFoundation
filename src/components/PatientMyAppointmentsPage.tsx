import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Stethoscope,
  MapPin,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { EmptyState } from './EmptyState';
import { LiveStatusBadge } from './LiveStatusBadge';

type StatusFilter = 'all' | 'accepted' | 'rejected' | 'pending';

function normalizeStatus(status?: string) {
  return String(status || 'Pending').toLowerCase();
}

function isAccepted(status?: string) {
  return ['accepted', 'scheduled', 'confirmed', 'checkedin', 'completed', 'arrived'].includes(normalizeStatus(status));
}

function isRejected(status?: string) {
  return ['rejected', 'cancelled'].includes(normalizeStatus(status));
}

function isPending(status?: string) {
  return !isAccepted(status) && !isRejected(status);
}

function StatusBadge({ status }: { status?: string }) {
  if (isRejected(status)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
        <XCircle className="w-3 h-3" /> {status || 'Rejected'}
      </span>
    );
  }
  if (isAccepted(status)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
        <CheckCircle2 className="w-3 h-3" /> {status || 'Accepted'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
      <Clock className="w-3 h-3" /> {status || 'Pending'}
    </span>
  );
}

function FilterChips({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
  counts: { all: number; accepted: number; rejected: number; pending: number };
}) {
  const chips: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: `All (${counts.all})` },
    { id: 'accepted', label: `Accepted (${counts.accepted})` },
    { id: 'rejected', label: `Rejected (${counts.rejected})` },
    { id: 'pending', label: `Pending (${counts.pending})` },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(chip.id)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border cursor-pointer ${
            value === chip.id ? 'bg-[#0f2e5a] text-white border-[#0f2e5a]' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

function applyFilter<T extends { status?: string }>(items: T[], filter: StatusFilter) {
  if (filter === 'accepted') return items.filter((item) => isAccepted(item.status));
  if (filter === 'rejected') return items.filter((item) => isRejected(item.status));
  if (filter === 'pending') return items.filter((item) => isPending(item.status));
  return items;
}

export const PatientMyAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { collections } = useLiveData();
  const [doctorFilter, setDoctorFilter] = useState<StatusFilter>('all');
  const [hospitalFilter, setHospitalFilter] = useState<StatusFilter>('all');
  const pid = user?.patientId;

  const doctorAppointments = useMemo(() => {
    return (collections.appointments || []).filter((item: any) => !pid || item.patientId === pid);
  }, [collections.appointments, pid]);

  const hospitalAppointments = useMemo(() => {
    return (collections.visit_requests || []).filter((item: any) => !pid || item.patientId === pid);
  }, [collections.visit_requests, pid]);

  const doctorCounts = {
    all: doctorAppointments.length,
    accepted: doctorAppointments.filter((item: any) => isAccepted(item.status)).length,
    rejected: doctorAppointments.filter((item: any) => isRejected(item.status)).length,
    pending: doctorAppointments.filter((item: any) => isPending(item.status)).length,
  };
  const hospitalCounts = {
    all: hospitalAppointments.length,
    accepted: hospitalAppointments.filter((item: any) => isAccepted(item.status)).length,
    rejected: hospitalAppointments.filter((item: any) => isRejected(item.status)).length,
    pending: hospitalAppointments.filter((item: any) => isPending(item.status)).length,
  };

  const doctorList = applyFilter(doctorAppointments, doctorFilter);
  const hospitalList = applyFilter(hospitalAppointments, hospitalFilter);

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#0f2e5a]">My Appointment</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Track doctor booking requests and hospital visit requests in one place.
          </p>
        </div>
        <LiveStatusBadge />
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Doctor appointments</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Accepted bookings and rejected requests with reason</p>
            </div>
          </div>
          <FilterChips value={doctorFilter} onChange={setDoctorFilter} counts={doctorCounts} />
        </div>

        {doctorList.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-5 h-5" />}
            title="No doctor appointments yet"
            message="Book a doctor from Book Doctor. Accepted and rejected requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {doctorList.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-slate-900">{item.doctorName || 'Doctor'}</div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {item.speciality || 'Consultation'} · {item.hospital || item.hospitalName || 'Ayudh Network'}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> {item.appointmentDate || item.appointmentDateTime || 'Date pending'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-600" /> {item.appointmentTime || item.slot || 'Time pending'}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-600" /> Token {item.tokenNumber || '—'}</span>
                </div>
                {isRejected(item.status) && (
                  <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-[11px] text-rose-800 font-semibold flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Rejected reason: {item.rejectionReason || item.hospitalNotes || 'Doctor / clinic could not confirm this slot.'}</span>
                  </div>
                )}
                {isAccepted(item.status) && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-[11px] text-emerald-800 font-semibold">
                    Appointment accepted. Please report 15 minutes before the slot{item.tokenNumber ? ` with token ${item.tokenNumber}` : ''}.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Hospital Appointment</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Accepted hospital visits and rejected requests with reason</p>
            </div>
          </div>
          <FilterChips value={hospitalFilter} onChange={setHospitalFilter} counts={hospitalCounts} />
        </div>

        {hospitalList.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-5 h-5" />}
            title="No hospital appointments yet"
            message="Request a visit from Find Nearby Hospitals. Accepted and rejected statuses will appear here."
          />
        ) : (
          <div className="space-y-3">
            {hospitalList.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-black text-slate-900">{item.hospitalName || 'Hospital'}</div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {item.department || 'OP Consultation'} · {item.doctorName || 'Duty doctor'}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> {item.preferredDate || item.appointmentDateTime || 'Date pending'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-600" /> {item.preferredTimeSlot || 'Slot pending'}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {item.patientPhone || user?.phone || '—'}</span>
                </div>
                {isRejected(item.status) && (
                  <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-[11px] text-rose-800 font-semibold flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Rejected reason: {item.rejectionReason || item.hospitalNotes || 'Hospital could not accept this visit request.'}</span>
                  </div>
                )}
                {isAccepted(item.status) && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-[11px] text-emerald-800 font-semibold">
                    Visit accepted{item.tokenNumber ? `. Token ${item.tokenNumber}` : ''}{item.assignedBedNumber ? ` · Bed ${item.assignedBedNumber}` : ''}. {item.hospitalNotes || 'Please report 15 minutes early.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
