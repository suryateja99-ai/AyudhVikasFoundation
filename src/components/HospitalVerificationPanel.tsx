import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CheckCircle2, XCircle, Building2 } from 'lucide-react';

export const HospitalVerificationPanel: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .pendingHospitalVerifications()
      .then((res) => setHospitals(res.items || []))
      .catch((err: Error) => setError(err.message));
  }, []);

  const handleApprove = async (id: string) => {
    await api.approveHospital(id, { reason: 'Facility verified' });
    setHospitals((prev) => prev.filter((h) => h.id !== id));
  };

  const handleReject = async (id: string) => {
    await api.rejectHospital(id, { reason: rejectionReason || 'Facility details incomplete' });
    setHospitals((prev) => prev.filter((h) => h.id !== id));
    setSelectedId(null);
  };

  return (
    <div className="p-1">
      <h2 className="text-lg font-black text-slate-900 mb-3">Hospital Verifications Pending</h2>
      {error && <p className="text-xs text-rose-600 font-bold mb-3">{error}</p>}
      <div className="grid gap-4">
        {hospitals.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm font-semibold text-slate-500">
            No pending hospital verifications.
          </div>
        )}
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{hospital.name}</h3>
                <p className="text-xs font-semibold text-slate-600">{hospital.district} · {hospital.phone || 'No phone'}</p>
                <p className="text-xs font-semibold text-slate-600">Beds: {hospital.totalBeds || 0}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleApprove(hospital.id)} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-black flex items-center gap-1 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => setSelectedId(hospital.id)} className="bg-red-600 text-white px-4 py-2 rounded text-xs font-black flex items-center gap-1 cursor-pointer">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
            {selectedId === hospital.id && (
              <div className="mt-4 p-4 bg-red-50 rounded">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="w-full p-2 border rounded mb-2 text-xs"
                />
                <button onClick={() => handleReject(hospital.id)} className="bg-red-600 text-white px-4 py-2 rounded text-xs font-black cursor-pointer">
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
