import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Link as LinkIcon,
  Loader2,
  Lock,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import { api } from '../lib/api';

type Props = {
  roleLabel: 'Doctor' | 'Hospital';
  title?: string;
};

const emptyMedicine = { medicine: '', dosage: '', frequency: '', duration: '', instructions: '' };

function sessionDate(session: any) {
  return session?.preferredDate || session?.appointmentDate || session?.createdAt?.slice?.(0, 10) || 'Today';
}

function isComplete(session: any) {
  return session?.status === 'Completed' || session?.sessionStatus === 'COMPLETED';
}

export const ClinicalSessionPanel: React.FC<Props> = ({ roleLabel, title = 'Authorized Patients' }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionBundle, setSessionBundle] = useState<any | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [historySessions, setHistorySessions] = useState<any[]>([]);

  const [reportForm, setReportForm] = useState({
    title: '',
    reportType: 'Clinical Report',
    method: 'manual',
    manualEntry: '',
    documentLink: '',
    file: null as null | { name: string; type: string; size: number; data: string },
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    instructions: '',
    medicines: [{ ...emptyMedicine }],
  });
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    time: '',
    recurrence: 'Daily',
    category: 'Medicine reminder',
    mandatory: false,
  });

  const selectedPatient = patients.find((patient) => patient.patientId === selectedPatientId);
  const sessions = selectedPatient?.sessions || [];
  const currentSession = sessionBundle?.item || selectedPatient?.activeSession;
  const completed = isComplete(currentSession);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) =>
      `${patient.patientName || ''} ${patient.patientId || ''} ${patient.phone || ''}`.toLowerCase().includes(q)
    );
  }, [patients, query]);

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return historySessions;
    return historySessions.filter((session) =>
      `${session.patientName || ''} ${session.patientId || ''} ${session.hospitalName || ''} ${session.doctorName || ''}`.toLowerCase().includes(q)
    );
  }, [historySessions, query]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    setError('');
    try {
      const res = await api.authorizedPatients();
      const items = res.items || [];
      setPatients(items);
      const stillActive = items.find((patient) => patient.patientId === selectedPatientId);
      if (selectedPatientId && !stillActive) {
        setSelectedPatientId('');
        setSelectedSessionId('');
        setSessionBundle(null);
      }
      const first = items[0];
      if (first && (!selectedPatientId || !stillActive)) {
        setSelectedPatientId(first.patientId);
        setSelectedSessionId(first.activeSession?.sessionId || first.activeSession?.id || first.sessions?.[0]?.sessionId || '');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load authorized patients.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    setError('');
    try {
      const res = await api.sessionHistory();
      setHistorySessions(res.items || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load reports history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadSession = async (id = selectedSessionId) => {
    if (!id) {
      setSessionBundle(null);
      return;
    }
    setLoadingSession(true);
    setError('');
    try {
      setSessionBundle(await api.session(id));
    } catch (err: any) {
      setError(err.message || 'Unable to load session.');
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSessionId) loadSession(selectedSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatientId(patient.patientId);
    const nextSession = patient.activeSession || patient.sessions?.[0];
    setSelectedSessionId(nextSession?.sessionId || nextSession?.id || '');
  };

  const handleHistorySelect = (session: any) => {
    setSelectedPatientId(session.patientId || '');
    setSelectedSessionId(session.sessionId || session.id || '');
    setSessionBundle({
      item: session,
      reports: session.reports || [],
      prescriptions: session.prescriptions || [],
      reminders: session.reminders || [],
    });
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReportForm((prev) => ({
        ...prev,
        method: 'file',
        file: { name: file.name, type: file.type, size: file.size, data: String(reader.result || '') },
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSessionId || completed) return;
    setSaving('report');
    setError('');
    try {
      await api.createSessionReport(selectedSessionId, reportForm);
      setReportForm({ title: '', reportType: 'Clinical Report', method: 'manual', manualEntry: '', documentLink: '', file: null });
      setNotice('Report saved to the patient record.');
      await loadSession();
    } catch (err: any) {
      setError(err.message || 'Unable to save report.');
    } finally {
      setSaving(null);
    }
  };

  const savePrescription = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSessionId || completed) return;
    setSaving('prescription');
    setError('');
    try {
      const medicines = prescriptionForm.medicines.filter((med) => med.medicine.trim());
      await api.createSessionPrescription(selectedSessionId, { ...prescriptionForm, medicines });
      setPrescriptionForm({ instructions: '', medicines: [{ ...emptyMedicine }] });
      setNotice('Prescription saved and reminders generated where possible.');
      await loadSession();
    } catch (err: any) {
      setError(err.message || 'Unable to save prescription.');
    } finally {
      setSaving(null);
    }
  };

  const saveReminder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSessionId || completed) return;
    setSaving('reminder');
    setError('');
    try {
      await api.createSessionReminder(selectedSessionId, reminderForm);
      setReminderForm({ title: '', description: '', time: '', recurrence: 'Daily', category: 'Medicine reminder', mandatory: false });
      setNotice('Health reminder saved for the patient.');
      await loadSession();
    } catch (err: any) {
      setError(err.message || 'Unable to save reminder.');
    } finally {
      setSaving(null);
    }
  };

  const finishSession = async () => {
    if (!selectedSessionId || completed) return;
    const ok = window.confirm('Are you sure you want to finish this patient session? After finishing, the visit pass will expire and the session will be recorded in history.');
    if (!ok) return;
    setSaving('finish');
    setError('');
    try {
      await api.finishSession(selectedSessionId);
      setNotice('Session completed. Visit pass expired and history recorded.');
      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Unable to finish session.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-semibold">Open an authorized patient session to manage reports, prescriptions and reminders.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setViewMode('active');
                setQuery('');
                loadPatients();
              }}
              className={`rounded-lg px-3 py-2 text-xs font-black cursor-pointer ${viewMode === 'active' ? 'bg-[#152e4d] text-white' : 'bg-blue-50 text-blue-700'}`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => {
                setViewMode('history');
                setQuery('');
                loadHistory();
              }}
              className={`rounded-lg px-3 py-2 text-xs font-black cursor-pointer ${viewMode === 'history' ? 'bg-[#152e4d] text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Reports History
            </button>
            <button onClick={viewMode === 'history' ? loadHistory : loadPatients} disabled={loadingPatients || loadingHistory} className="rounded-lg bg-blue-50 text-blue-700 px-3 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPatients || loadingHistory ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs font-bold">{error}</div>}
        {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-xs font-bold">{notice}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={viewMode === 'history' ? 'Search completed sessions' : 'Search authorized patients'} className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              {viewMode === 'history' ? (
                loadingHistory ? (
                  <div className="p-5 text-xs font-bold text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading reports history...
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="p-5 text-xs font-bold text-slate-500">No completed patient sessions found.</div>
                ) : (
                  <div className="divide-y divide-slate-200 max-h-[480px] overflow-y-auto">
                    {filteredHistory.map((session) => (
                      <button key={session.sessionId || session.id} onClick={() => handleHistorySelect(session)} className={`w-full text-left p-3 transition-colors cursor-pointer ${selectedSessionId === (session.sessionId || session.id) ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                        <div className="text-xs font-black text-slate-900">{session.patientName}</div>
                        <div className="text-[11px] font-semibold text-slate-500">{session.patientId || 'No ID'} - {sessionDate(session)}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[9px] font-black">{session.reports?.length || 0} Reports</span>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-black">{session.prescriptions?.length || 0} Rx</span>
                          <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[9px] font-black">{session.reminders?.length || 0} Reminders</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : loadingPatients ? (
                <div className="p-5 text-xs font-bold text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading authorized patients...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-5 text-xs font-bold text-slate-500">No authorized patients found after the API response.</div>
              ) : (
                <div className="divide-y divide-slate-200 max-h-[480px] overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <button key={patient.patientId || patient.phone} onClick={() => handlePatientSelect(patient)} className={`w-full text-left p-3 transition-colors cursor-pointer ${selectedPatientId === patient.patientId ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-black text-slate-900">{patient.patientName}</div>
                          <div className="text-[11px] font-semibold text-slate-500">{patient.patientId || 'No ID'} - {patient.phone || 'No phone'}</div>
                        </div>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-black">{patient.sessions?.length || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {loadingSession ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs font-bold text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading session...
              </div>
            ) : !currentSession ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs font-bold text-slate-500">Select an authorized patient to open an active session.</div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div><div className="text-[10px] uppercase font-black text-slate-400">Patient</div><div className="font-black text-slate-900">{currentSession.patientName}</div></div>
                  <div><div className="text-[10px] uppercase font-black text-slate-400">Visit Date</div><div className="font-black text-slate-900">{sessionDate(currentSession)}</div></div>
                  <div><div className="text-[10px] uppercase font-black text-slate-400">Status</div><div className="font-black text-slate-900">{currentSession.sessionStatus}</div></div>
                  <div><div className="text-[10px] uppercase font-black text-slate-400">Visit Pass</div><div className="font-black text-slate-900">{currentSession.visitPassStatus}</div></div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {sessions.map((session: any) => (
                    <button key={session.sessionId || session.id} onClick={() => setSelectedSessionId(session.sessionId || session.id)} className={`rounded-lg px-3 py-2 text-[11px] font-black border cursor-pointer ${selectedSessionId === (session.sessionId || session.id) ? 'bg-[#152e4d] text-white border-[#152e4d]' : 'bg-white text-slate-700 border-slate-200'}`}>
                      {sessionDate(session)} - {session.sessionStatus || session.status}
                    </button>
                  ))}
                </div>

                {completed && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    This session is completed. Reports, prescriptions and reminders are preserved as history.
                  </div>
                )}

                {viewMode === 'history' && sessionBundle && (
                  <HistoryDetail
                    session={currentSession}
                    reports={sessionBundle.reports || []}
                    prescriptions={sessionBundle.prescriptions || []}
                    reminders={sessionBundle.reminders || []}
                  />
                )}

                {viewMode === 'active' && (
                  <>
                <form onSubmit={saveReport} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm"><FileText className="w-4 h-4 text-blue-700" /> Session Report</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <input disabled={completed} value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} placeholder="Report title" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold" />
                    <input disabled={completed} value={reportForm.reportType} onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })} placeholder="Report type" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold" />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['manual', 'link', 'file'].map((method) => (
                      <button key={method} type="button" disabled={completed} onClick={() => setReportForm({ ...reportForm, method })} className={`rounded-lg px-3 py-2 font-black border cursor-pointer disabled:opacity-50 ${reportForm.method === method ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {method === 'file' ? <Upload className="w-3.5 h-3.5 inline mr-1" /> : method === 'link' ? <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> : null}
                        {method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {reportForm.method === 'manual' && <textarea disabled={completed} value={reportForm.manualEntry} onChange={(e) => setReportForm({ ...reportForm, manualEntry: e.target.value })} rows={3} placeholder="Clinical findings / result information" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold" />}
                  {reportForm.method === 'link' && <input disabled={completed} value={reportForm.documentLink} onChange={(e) => setReportForm({ ...reportForm, documentLink: e.target.value })} placeholder="https://secure-document-link" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold" />}
                  {reportForm.method === 'file' && <input disabled={completed} type="file" onChange={(e) => handleFile(e.target.files?.[0])} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold" />}
                  {reportForm.file && <div className="text-[11px] text-slate-500 font-bold">{reportForm.file.name} selected</div>}
                  <button disabled={completed || saving === 'report'} className="rounded-lg bg-[#00703c] text-white px-4 py-2 text-xs font-black disabled:opacity-60 cursor-pointer">{saving === 'report' ? 'Saving...' : 'Save Report'}</button>
                </form>

                <form onSubmit={savePrescription} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm"><Pill className="w-4 h-4 text-emerald-700" /> Prescription</div>
                  {prescriptionForm.medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                      {(['medicine', 'dosage', 'frequency', 'duration', 'instructions'] as const).map((field) => (
                        <input key={field} disabled={completed} value={med[field]} onChange={(e) => {
                          const medicines = [...prescriptionForm.medicines];
                          medicines[index] = { ...medicines[index], [field]: e.target.value };
                          setPrescriptionForm({ ...prescriptionForm, medicines });
                        }} placeholder={field} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold" />
                      ))}
                    </div>
                  ))}
                  <button type="button" disabled={completed} onClick={() => setPrescriptionForm({ ...prescriptionForm, medicines: [...prescriptionForm.medicines, { ...emptyMedicine }] })} className="text-xs font-black text-blue-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"><Plus className="w-3.5 h-3.5" /> Add Medicine</button>
                  <textarea disabled={completed} value={prescriptionForm.instructions} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })} rows={2} placeholder="Additional prescription instructions" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold" />
                  <button disabled={completed || saving === 'prescription'} className="rounded-lg bg-[#152e4d] text-white px-4 py-2 text-xs font-black disabled:opacity-60 cursor-pointer">{saving === 'prescription' ? 'Saving...' : 'Save Prescription'}</button>
                </form>

                <form onSubmit={saveReminder} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm"><Clock className="w-4 h-4 text-amber-600" /> Health Reminder</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <input disabled={completed} value={reminderForm.title} onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })} placeholder="Reminder title" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold" />
                    <input disabled={completed} value={reminderForm.time} onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })} placeholder="Time / date" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold" />
                    <input disabled={completed} value={reminderForm.recurrence} onChange={(e) => setReminderForm({ ...reminderForm, recurrence: e.target.value })} placeholder="Recurrence" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold" />
                    <label className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-bold flex items-center gap-2">
                      <input disabled={completed} type="checkbox" checked={reminderForm.mandatory} onChange={(e) => setReminderForm({ ...reminderForm, mandatory: e.target.checked })} />
                      Mandatory
                    </label>
                  </div>
                  <textarea disabled={completed} value={reminderForm.description} onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })} rows={2} placeholder="Reminder instructions" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold" />
                  <button disabled={completed || saving === 'reminder'} className="rounded-lg bg-amber-600 text-white px-4 py-2 text-xs font-black disabled:opacity-60 cursor-pointer">{saving === 'reminder' ? 'Saving...' : 'Save Reminder'}</button>
                </form>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <MiniList title="Reports" items={sessionBundle?.reports || []} render={(item) => item.title || item.type} />
                  <MiniList title="Prescriptions" items={sessionBundle?.prescriptions || []} render={(item) => item.doctorName || item.instructions || 'Prescription'} />
                  <MiniList title="Reminders" items={sessionBundle?.reminders || []} render={(item) => (
                    <span className="flex items-center gap-1">{item.mandatory && <Lock className="w-3 h-3" />}{item.title}</span>
                  )} />
                </div>

                <div className="flex justify-end">
                  <button onClick={finishSession} disabled={completed || saving === 'finish'} className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-black disabled:opacity-60 cursor-pointer">
                    {saving === 'finish' ? 'Finishing...' : 'Session Finished'}
                  </button>
                </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const MiniList: React.FC<{ title: string; items: any[]; render: (item: any) => React.ReactNode }> = ({ title, items, render }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <h4 className="text-xs font-black text-slate-900 mb-2">{title}</h4>
    {items.length ? (
      <div className="space-y-2">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-lg bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold text-slate-700">
            {render(item)}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-[11px] text-slate-400 font-bold">No records yet.</div>
    )}
  </div>
);

const HistoryDetail: React.FC<{ session: any; reports: any[]; prescriptions: any[]; reminders: any[] }> = ({
  session,
  reports,
  prescriptions,
  reminders,
}) => (
  <div className="space-y-3">
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-black text-slate-900">Completed Session Details</h4>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <InfoCell label="Patient" value={`${session.patientName || 'Patient'} (${session.patientId || 'No ID'})`} />
        <InfoCell label="Hospital" value={session.hospitalName || 'Ayudh Vikas Network'} />
        <InfoCell label="Doctor" value={session.doctorName || 'Medical Team'} />
        <InfoCell label="Completed" value={String(session.completedAt || session.updatedAt || '').slice(0, 16) || 'Recorded'} />
      </div>
    </div>

    <DetailGroup title="Reports Given" empty="No reports were created in this session.">
      {reports.map((report) => (
        <div key={report.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs space-y-1">
          <div className="font-black text-slate-900">{report.title || report.type || 'Medical Report'}</div>
          <div className="text-[11px] text-slate-500 font-semibold">
            {report.reportMethod || 'manual'} - {String(report.date || report.createdAt || '').slice(0, 10) || 'Today'}
          </div>
          {report.reportInformation && <div className="text-slate-700 font-semibold">{report.reportInformation}</div>}
          {report.documentLink && <div className="text-blue-700 font-black break-all">URL: {report.documentLink}</div>}
          {report.file && <div className="text-emerald-700 font-black">File: {report.file}</div>}
        </div>
      ))}
    </DetailGroup>

    <DetailGroup title="Prescriptions Given" empty="No prescriptions were created in this session.">
      {prescriptions.map((rx) => (
        <div key={rx.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs space-y-2">
          <div className="font-black text-slate-900">{rx.doctorName || 'Medical Team'} - {String(rx.prescriptionDate || rx.createdAt || '').slice(0, 10) || 'Today'}</div>
          {(rx.medicines || []).map((med: any, index: number) => (
            <div key={`${rx.id}-${index}`} className="rounded-md bg-white border border-slate-100 p-2">
              <div className="font-black text-slate-900">{med.medicine || med.name || 'Medicine'}</div>
              <div className="text-[11px] text-slate-600 font-semibold">
                {med.dosage || '-'} - {med.frequency || 'As directed'} - {med.duration || ''}
              </div>
              {med.instructions && <div className="text-[11px] text-emerald-700 font-bold">{med.instructions}</div>}
            </div>
          ))}
          {rx.instructions && <div className="text-slate-700 font-semibold">{rx.instructions}</div>}
        </div>
      ))}
    </DetailGroup>

    <DetailGroup title="Health Reminders Given" empty="No reminders were created in this session.">
      {reminders.map((reminder) => (
        <div key={reminder.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs">
          <div className="font-black text-slate-900 flex items-center gap-1">{reminder.mandatory && <Lock className="w-3 h-3 text-amber-600" />}{reminder.title}</div>
          <div className="text-[11px] text-slate-500 font-semibold">{reminder.time || 'No time'} - {reminder.recurrence || reminder.type || 'Reminder'}</div>
          {reminder.description && <div className="text-slate-700 font-semibold mt-1">{reminder.description}</div>}
        </div>
      ))}
    </DetailGroup>
  </div>
);

const InfoCell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
    <div className="text-[10px] uppercase font-black text-slate-400">{label}</div>
    <div className="text-xs font-black text-slate-900 mt-1">{value}</div>
  </div>
);

const DetailGroup: React.FC<{ title: string; empty: string; children: React.ReactNode }> = ({ title, empty, children }) => {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-black text-slate-900 mb-3">{title}</h4>
      {items.length ? <div className="space-y-2">{items}</div> : <div className="text-xs font-bold text-slate-500">{empty}</div>}
    </div>
  );
};
