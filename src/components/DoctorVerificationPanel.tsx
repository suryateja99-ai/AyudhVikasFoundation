import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

export const DoctorVerificationPanel: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api
      .pendingDoctorVerifications()
      .then((res) => setDoctors(res.items || []))
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (doctorId: string) => {
    await api.approveDoctor(doctorId, { reason: 'Credentials verified' });
    setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
  };

  const handleReject = async (doctorId: string) => {
    await api.rejectDoctor(doctorId, { reason: rejectionReason || 'Documents incomplete' });
    setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    setSelectedDoctor(null);
    setRejectionReason('');
  };

  return (
    <div className="p-1">
      <h2 className="text-lg font-black text-slate-900 mb-3">Doctor Verifications Pending</h2>
      {error && <p className="text-xs text-rose-600 font-bold mb-3">{error}</p>}
      <div className="grid gap-4">
        {doctors.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm font-semibold text-slate-500">
            No pending doctor verifications.
          </div>
        )}
        {doctors.map((doctor) => (
          <div key={doctor.id} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-black text-slate-900">{doctor.name}</h3>
            <p className="text-xs font-semibold text-slate-600">Speciality: {doctor.speciality}</p>
            <p className="text-xs font-semibold text-slate-600">Experience: {doctor.experienceYears || 0} years</p>
            <p className="text-xs font-semibold text-slate-600">Email: {doctor.email || '—'}</p>

            <div className="mt-3">
              <h4 className="font-black text-xs mb-2 text-slate-700">Documents</h4>
              {(doctor.verificationDocuments || []).length === 0 && (
                <p className="text-[11px] text-slate-500">No documents attached.</p>
              )}
              {(doctor.verificationDocuments || []).map((doc: any, i: number) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 underline font-bold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {doc.type || doc.name || `Document ${i + 1}`}
                </a>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleApprove(doctor.id)}
                className="bg-green-600 text-white px-4 py-2 rounded text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setSelectedDoctor(doctor.id)}
                className="bg-red-600 text-white px-4 py-2 rounded text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>

            {selectedDoctor === doctor.id && (
              <div className="mt-4 p-4 bg-red-50 rounded">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="w-full p-2 border rounded mb-2 text-xs"
                />
                <button
                  onClick={() => handleReject(doctor.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-xs font-black cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
