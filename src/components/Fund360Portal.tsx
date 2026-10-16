import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  HeartHandshake,
  History,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleRoutes';

type FundTab = 'dashboard' | 'onboarding' | 'profile' | 'finance' | 'payments' | 'milestones' | 'benefits' | 'history';

const tabPaths: Record<FundTab, string> = {
  dashboard: '/fund360/dashboard',
  onboarding: '/fund360/onboarding',
  profile: '/fund360/profile',
  finance: '/fund360/finance',
  payments: '/fund360/payments',
  milestones: '/fund360/milestones',
  benefits: '/fund360/benefits',
  history: '/fund360/history',
};

const pathTabs: Record<string, FundTab> = Object.entries(tabPaths).reduce(
  (acc, [tab, path]) => ({ ...acc, [path]: tab as FundTab }),
  {} as Record<string, FundTab>
);

const options = [
  {
    type: 'ANNUAL',
    title: '₹365 Annual Participation',
    badge: 'RECOMMENDED',
    amount: 365,
    icon: Award,
    copy: 'Simple annual participation with easier continuity tracking and no monthly payment action.',
  },
  {
    type: 'MONTHLY',
    title: 'Monthly Participation',
    amount: 30,
    icon: CalendarDays,
    copy: '₹30/month, tracked as a continuous monthly participation streak.',
  },
  {
    type: 'VOLUNTEER',
    title: 'Volunteer',
    amount: 0,
    icon: Users,
    copy: 'Join through Foundation coordination without a financial contribution by default.',
  },
  {
    type: 'SERVICE_CONTRIBUTION',
    title: 'Service + Contribution',
    amount: 0,
    icon: HeartHandshake,
    copy: 'Offer service and optionally contribute up to Rs. 365 with backend validation.',
  },
];

const fundMotto: Record<FundTab, { image: string; eyebrow: string; title: string; body: string }> = {
  onboarding: {
    image: '/src/assets/images/indian_family_hero_1785560495834.jpg',
    eyebrow: 'ప్రతి రోజు చిన్న సహాయం | Small help, every day',
    title: 'మీ పేరు మీద సేవ మొదలవుతుంది - FUND 365 joins your AV Foundation identity.',
    body: 'Registered Ayudh Vikas users do not need a second login. మీ details already linked, now choose how you want to participate.',
  },
  dashboard: {
    image: '/src/assets/images/partner_ceo_care_1787229842597.jpg',
    eyebrow: 'సేవ కొనసాగితే భరోసా పెరుగుతుంది | Continuity builds care',
    title: 'Your FUND 365 journey shows how steady support becomes real healthcare impact.',
    body: 'Status, streak, payments and milestones are calculated from backend records - no demo counters, no frontend-only promises.',
  },
  profile: {
    image: '/src/assets/images/patient_avatar_1787229395408.jpg',
    eyebrow: 'ఒకే వ్యక్తిత్వం | One Ayudh Vikas identity',
    title: 'Your AV Foundation profile is the source of truth for FUND 365.',
    body: 'Name, phone, email and role come from your registered account. కొత్త account అవసరం లేదు, same trust continues.',
  },
  finance: {
    image: '/src/assets/images/tech_crm_dashboard_1787229805352.jpg',
    eyebrow: 'ప్రతి రూపాయి record లో | Every rupee has a record',
    title: 'Finance ledger keeps contribution history clear and auditable.',
    body: 'Annual, monthly and service contributions are tracked as transaction records so support history stays transparent.',
  },
  payments: {
    image: '/src/assets/images/tech_crm_dashboard_1787229805352.jpg',
    eyebrow: 'Payment clarity | చెల్లింపు స్పష్టత',
    title: 'Payments are recorded only after backend verification.',
    body: 'Frontend success alone is not enough. FUND 365 keeps processing, success, monthly and failed payment states separate.',
  },
  milestones: {
    image: '/src/assets/images/diabetes_camp_banner_1787229418787.jpg',
    eyebrow: 'నాలుగు సంవత్సరాల సేవ ప్రయాణం | Four-year care journey',
    title: 'Milestones turn participation into recognition, screening and support eligibility.',
    body: 'Year 1 active member ID, Year 2 community appreciation, Year 3 health screening and Year 4 certificate / assistance are data-driven.',
  },
  benefits: {
    image: '/src/assets/images/home_nurse_elderly_patient_1787376333128.jpg',
    eyebrow: 'Health support with conditions | నిబంధనలతో ఆరోగ్య భరోసా',
    title: 'Benefits explain eligibility clearly, including insurance / health assistance terms.',
    body: 'Year 4 support is shown as applicable eligibility up to Rs. 1,00,000 subject to verification, provider terms and programme availability.',
  },
  history: {
    image: '/src/assets/images/partner_hero_team_1787229787269.jpg',
    eyebrow: 'సేవ చరిత్ర | Service memory',
    title: 'History keeps every participation cycle visible without deleting past records.',
    body: 'Completed, resumed, service and volunteer activities remain linked to your original FUND 365 account.',
  },
};

const fundPageDetails: Record<FundTab, { focus: string; bullets: string[]; checks: string[]; note: string }> = {
  onboarding: {
    focus: 'Join method | మీరు ఎలా పాల్గొనాలి',
    bullets: ['Registered AV profile is reused', 'Annual, monthly, volunteer and service options', 'Service contribution max is checked by backend'],
    checks: ['Prefilled identity', 'Choose one participation path', 'Submit for verified record'],
    note: 'First-time users see this page automatically because status is NOT_ENROLLED.',
  },
  dashboard: {
    focus: 'Live status | మీ ప్రయాణం ఇప్పుడు ఎక్కడ ఉంది',
    bullets: ['Current status from account record', 'Streak and year from participation history', 'Milestones loaded from backend'],
    checks: ['Review active status', 'Track current year', 'Open benefits when eligible'],
    note: 'Dashboard values are not manually typed on the browser; they come from the Fund 365 API.',
  },
  profile: {
    focus: 'Identity link | AV user తో Fund 365 link',
    bullets: ['Same user account', 'Same phone/email reference', 'Same role context after back navigation'],
    checks: ['Verify name and phone', 'Update AV profile if wrong', 'Continue with same login'],
    note: 'Fund 365 never creates a second login account for the same Ayudh Vikas user.',
  },
  finance: {
    focus: 'Ledger clarity | Transaction record స్పష్టంగా',
    bullets: ['Successful contributions stay in ledger', 'Pending payments remain separate', 'Monthly records are tracked separately'],
    checks: ['Check transaction status', 'Review amount/date', 'Use records for audit'],
    note: 'Finance page keeps history even if a monthly streak is interrupted later.',
  },
  payments: {
    focus: 'Payment verification | Backend confirmation అవసరం',
    bullets: ['Frontend success is not enough', 'Backend verifies transaction amount', 'Duplicate callbacks are handled safely'],
    checks: ['Start participation', 'Wait for verified success', 'Review payment history'],
    note: 'Recurring autopay still depends on final payment gateway/provider integration.',
  },
  milestones: {
    focus: '4-year path | ప్రతి year కి purpose ఉంది',
    bullets: ['Year 1 recognition', 'Year 2 appreciation/community service', 'Year 3 screening eligibility'],
    checks: ['Track yearly progress', 'Wait for verified completion', 'Admin records operational status'],
    note: 'Milestones are not marked complete until programme rules and records support it.',
  },
  benefits: {
    focus: 'Benefits with rules | అర్హత + verification',
    bullets: ['Benefits are eligibility records', 'Screening/assistance need admin confirmation', 'Year 4 wording avoids false guarantee'],
    checks: ['Read status', 'Prepare documents if asked', 'Follow Foundation confirmation'],
    note: 'Health insurance / assistance is subject to policy terms, availability and verification.',
  },
  history: {
    focus: 'Service memory | మీ సేవ record గా ఉంటుంది',
    bullets: ['Past cycles are preserved', 'Volunteer/service activities remain visible', 'Resumed participation starts a new cycle if needed'],
    checks: ['Review participation type', 'Check created dates', 'Keep history for audit'],
    note: 'History explains what happened without deleting older participation records.',
  },
};

function inr(value: number | string | undefined) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function dateText(value?: string) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function startOfDay(value: Date | string) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addCalendarDays(value: Date | string, days: number) {
  const date = startOfDay(value);
  date.setDate(date.getDate() + days);
  return date;
}

function dateKey(value: Date | string) {
  return startOfDay(value).toISOString().slice(0, 10);
}

function coverageDaysForTransaction(txn: any) {
  const amount = Number(txn?.amount || 0);
  const type = String(txn?.type || txn?.participationType || '').toUpperCase();
  if (type.includes('ANNUAL') || amount >= 365) return 365;
  if (type.includes('MONTHLY')) return 30;
  return Math.min(365, Math.max(1, Math.round(amount)));
}

function buildCoverageWindows(transactions: any[] = []) {
  return transactions
    .filter((txn) => String(txn?.status || '').toUpperCase() === 'SUCCESS' && Number(txn?.amount || 0) > 0)
    .map((txn) => {
      const paidAt = txn.verifiedAt || txn.paidAt || txn.createdAt || txn.updatedAt;
      const start = startOfDay(paidAt || new Date());
      const days = coverageDaysForTransaction(txn);
      const endExclusive = addCalendarDays(start, days);
      return { txn, start, endExclusive, days };
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime());
}

export function Fund360Portal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tab = pathTabs[location.pathname] || 'dashboard';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState('ANNUAL');
  const [serviceType, setServiceType] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [contributionAmount, setContributionAmount] = useState('0');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.fund360Account();
      setData(res);
      if (location.pathname === '/fund360' && res.account?.status === 'NOT_ENROLLED') {
        navigate('/fund360/onboarding', { replace: true });
      } else if (location.pathname === '/fund360') {
        navigate('/fund360/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load FUND 365.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = data?.summary || {};
  const isEnrolled = data?.account?.status && data.account.status !== 'NOT_ENROLLED';
  const selectedOption = options.find((item) => item.type === selectedType) || options[0];
  const tabs = useMemo(() => [
    ['dashboard', 'Dashboard'],
    ['onboarding', isEnrolled ? 'Change / Join' : 'Onboarding'],
    ['profile', 'Profile'],
    ['finance', 'Finance'],
    ['payments', 'Payments'],
    ['milestones', 'Milestones'],
    ['benefits', 'Benefits'],
    ['history', 'History'],
  ] as Array<[FundTab, string]>, [isEnrolled]);

  const backToRole = () => navigate(roleHome(user?.primaryRole || user?.role));

  const submitParticipation = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload: any = { type: selectedType };
      if (selectedType === 'SERVICE_CONTRIBUTION') {
        payload.serviceType = serviceType;
        payload.serviceDescription = serviceDescription;
        payload.contributionAmount = Number(contributionAmount || 0);
      }
      const started = await api.startFund360Participation(payload);
      if (started.transaction?.id) {
        await api.verifyFund360Transaction(started.transaction.id, {
          amount: started.transaction.amount,
          gatewayReference: started.transaction.reference,
        });
        setMessage('Participation payment verified and recorded.');
      } else {
        setMessage(selectedType === 'VOLUNTEER' ? 'Volunteer interest submitted. Foundation team will contact you.' : 'Participation submitted.');
      }
      await load();
      navigate('/fund360/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to submit FUND 365 participation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-emerald-900 font-black">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading FUND 365
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white font-sans text-slate-900">
      <header className="sticky top-0 z-30 bg-emerald-800 border-b border-emerald-900 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={backToRole} className="w-9 h-9 rounded-lg border border-white/25 text-white flex items-center justify-center hover:bg-white/10" title="Back to Ayudh Vikas Foundation">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">FUND 365</h1>
              <p className="text-xs font-semibold text-emerald-100">Ayudh Vikas Foundation programme linked to your existing account.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <button onClick={() => navigate('/fund360/about')} className="h-9 px-3 rounded-lg text-xs font-black whitespace-nowrap text-emerald-50 hover:bg-emerald-700">About Fund 365</button>
            {tabs.map(([id, label]) => (
              <button
                key={id}
                onClick={() => navigate(tabPaths[id])}
                className={`h-9 px-3 rounded-lg text-xs font-black whitespace-nowrap transition-colors ${tab === id ? 'bg-white text-emerald-900 shadow-sm' : 'bg-emerald-700/70 text-emerald-50 hover:bg-emerald-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto p-4 lg:p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="text-xs font-black underline">Retry</button>
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm font-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <FundMottoBanner tab={tab} />
        <FundPageDetailPanel tab={tab} summary={summary} />
        {!isEnrolled && tab !== 'onboarding' && (
          <Fund365FundingCta tab={tab} onStart={() => navigate('/fund360/onboarding')} />
        )}

        {tab === 'onboarding' && (
          <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
            <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-sm">
              <h2 className="text-xl font-black text-emerald-950">Choose your FUND 365 participation</h2>
              <p className="text-sm font-semibold text-emerald-800/80 mt-1">Your Ayudh Vikas profile is already linked. Select one option below.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                {options.map((item) => {
                  const Icon = item.icon;
                  const active = selectedType === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => setSelectedType(item.type)}
                      className={`text-left rounded-xl border p-4 transition-all ${active ? 'border-emerald-700 bg-emerald-50 shadow-sm ring-1 ring-emerald-100' : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-emerald-950">{item.title}</h3>
                            {item.badge && <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black">{item.badge}</span>}
                          </div>
                          <p className="text-xs font-semibold text-emerald-900/70 mt-1">{item.copy}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedType === 'SERVICE_CONTRIBUTION' && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="Service type" className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-500" />
                  <input value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} placeholder="Contribution amount up to 365" className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-emerald-500" />
                  <textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Service description" className="md:col-span-2 min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                </div>
              )}
              <button disabled={saving} onClick={submitParticipation} className="mt-5 h-11 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-sm font-black shadow-sm">
                {saving ? 'Processing...' : selectedOption.amount ? `Continue with ${inr(selectedOption.amount)}` : 'Submit Participation'}
              </button>
            </div>

            <aside className="bg-emerald-800 text-white rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-black">Profile Prefill</h3>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ['Name', data?.profile?.name],
                  ['Phone', data?.profile?.phone],
                  ['Email', data?.profile?.email],
                  ['Role', data?.profile?.role],
                  ['District', data?.profile?.district],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-white/15 pb-2">
                    <div className="text-[10px] uppercase font-black text-emerald-200">{label}</div>
                    <div className="font-black">{value || 'Not available'}</div>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        )}

        {tab === 'dashboard' && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                [ShieldCheck, 'Status', summary.status || 'NOT_ENROLLED'],
                [Award, 'Current Year', summary.currentYear ? `Year ${summary.currentYear}` : 'Not started'],
                [Clock, 'Current Streak', `${summary.currentStreak || 0}`],
                [CircleDollarSign, 'Total Contributions', inr(summary.totalContributions)],
              ].map(([Icon, label, value]: any) => (
                <div key={label} className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
                  <Icon className="w-5 h-5 text-emerald-700" />
                  <div className="text-xs font-black text-emerald-700 uppercase mt-3">{label}</div>
                  <div className="text-xl font-black text-emerald-950 mt-1">{value}</div>
                </div>
              ))}
            </section>
            <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">
              <Journey milestones={data?.milestones || []} />
              <Fund365CoverageCalendar transactions={data?.transactions || []} />
            </section>
          </>
        )}

        {tab === 'profile' && <ProfileView profile={data?.profile} account={data?.account} />}
        {(tab === 'finance' || tab === 'payments') && <FinanceView transactions={data?.transactions || []} monthlyPayments={data?.monthlyPayments || []} />}
        {tab === 'milestones' && <MilestoneView milestones={data?.milestones || []} transactions={data?.transactions || []} />}
        {tab === 'benefits' && <BenefitView benefits={data?.benefits || []} />}
        {tab === 'history' && <HistoryView participations={data?.participations || []} serviceParticipations={data?.serviceParticipations || []} />}
        <FundSupportStrip />
      </main>
    </div>
  );
}

function FundMottoBanner({ tab }: { tab: FundTab }) {
  const motto = fundMotto[tab] || fundMotto.dashboard;
  return (
    <section className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[190px]">
        <div className="p-5 lg:p-6 flex flex-col justify-center">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
            {motto.eyebrow}
          </div>
          <h2 className="mt-2 max-w-4xl text-2xl lg:text-3xl font-black leading-tight text-emerald-950">
            {motto.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-emerald-900/75">
            {motto.body}
          </p>
        </div>
        <div className="relative min-h-[180px] lg:min-h-full">
          <img
            src={motto.image}
            alt={motto.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-emerald-950/20" />
        </div>
      </div>
    </section>
  );
}

function FundPageDetailPanel({ tab, summary }: { tab: FundTab; summary: any }) {
  const detail = fundPageDetails[tab] || fundPageDetails.dashboard;
  const facts = [
    ['Account Status', summary?.status || 'NOT_ENROLLED'],
    ['Current Year', summary?.currentYear ? `Year ${summary.currentYear}` : 'Not started'],
    ['Total Support', inr(summary?.totalContributions)],
  ];
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr_0.85fr] gap-3">
      <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Page Focus</div>
        <h3 className="mt-1 text-base font-black text-emerald-950">{detail.focus}</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {detail.bullets.map((item) => (
            <div key={item} className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-900">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Next Actions</div>
        <div className="mt-2 space-y-2">
          {detail.checks.map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs font-black text-emerald-950">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-800 p-4 text-white shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">Quick Record</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/10 p-2">
              <div className="text-[9px] font-black uppercase text-emerald-100">{label}</div>
              <div className="mt-1 text-[11px] font-black text-white break-words">{value}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-bold leading-relaxed text-emerald-50">{detail.note}</p>
      </div>
    </section>
  );
}

function Fund365FundingCta({ tab, onStart }: { tab: FundTab; onStart: () => void }) {
  const content: Record<FundTab, { label: string; title: string; body: string }> = {
    onboarding: {
      label: 'Start funding',
      title: 'Start with Rs. 1 per day - one year, one clear record.',
      body: 'First-time users can begin from the onboarding form, with AV Foundation account details already prefilled.',
    },
    dashboard: {
      label: 'Start funding',
      title: 'Your Fund 365 dashboard is ready to begin.',
      body: 'Complete onboarding once and your payments, streak and coverage calendar will start updating from the backend.',
    },
    profile: {
      label: 'Fund for yourself',
      title: 'Use your registered AV profile for Fund 365.',
      body: 'Your name, phone and role are already linked, so onboarding can start without creating another account.',
    },
    finance: {
      label: 'Fund Now',
      title: 'Create your first verified Fund 365 ledger entry.',
      body: 'After payment verification, the transaction appears here and the calendar marks covered days.',
    },
    payments: {
      label: 'Fund Now',
      title: 'Begin payments to activate your coverage timeline.',
      body: 'Each successful payment updates your Fund 365 record through the backend.',
    },
    milestones: {
      label: 'Start funding',
      title: 'Milestones unlock after your participation starts.',
      body: 'Begin once, then yearly progress and eligibility records can be tracked clearly.',
    },
    benefits: {
      label: 'Fund for yourself',
      title: 'Benefits need a real participation record first.',
      body: 'Start onboarding to connect your Fund 365 eligibility with your AV Foundation identity.',
    },
    history: {
      label: 'Start funding',
      title: 'Your Fund 365 history begins with the first verified action.',
      body: 'Participation, service and payment activity will stay linked to your account.',
    },
  };
  const cta = content[tab] || content.dashboard;
  return (
    <section className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 p-4 shadow-sm">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10 blur-2xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">Fund 365 onboarding</div>
          <h3 className="mt-1 text-xl font-black text-white">{cta.title}</h3>
          <p className="mt-1 text-sm font-bold text-emerald-50">
            {cta.body}
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="h-10 rounded-lg bg-white px-5 text-xs font-black text-emerald-900 shadow-sm transition-all hover:bg-emerald-50 hover:-translate-y-0.5"
        >
          {cta.label}
        </button>
      </div>
    </section>
  );
}

function Fund365CoverageCalendar({ transactions }: { transactions: any[] }) {
  const windows = useMemo(() => buildCoverageWindows(transactions), [transactions]);
  const [visibleMonth, setVisibleMonth] = useState(() => windows[0]?.start || new Date());
  const [calendarTouched, setCalendarTouched] = useState(false);
  const [turning, setTurning] = useState(false);

  useEffect(() => {
    if (!calendarTouched && windows[0]) setVisibleMonth(windows[0].start);
  }, [calendarTouched, windows]);

  const coverage = useMemo(() => {
    const covered = new Map<string, any>();
    const paid = new Map<string, any>();
    windows.forEach((window) => {
      paid.set(dateKey(window.start), window);
      for (let index = 0; index < window.days; index += 1) {
        covered.set(dateKey(addCalendarDays(window.start, index)), window);
      }
    });
    return { covered, paid };
  }, [windows]);

  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const calendarStart = addCalendarDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => addCalendarDays(calendarStart, index));
  const monthLabel = monthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const latestWindow = windows[0];

  const moveMonth = (offset: number) => {
    setCalendarTouched(true);
    setTurning(true);
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1));
    window.setTimeout(() => setTurning(false), 260);
  };

  return (
    <aside className="rounded-xl border border-emerald-200 bg-white p-3 shadow-sm overflow-hidden xl:sticky xl:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">Rs. 1/day tracker</div>
          <h2 className="mt-1 text-sm font-black text-emerald-950 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-emerald-700" />
            Coverage Calendar
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-800 border border-emerald-100">
          {latestWindow ? `${latestWindow.days} days` : 'No cover'}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => moveMonth(-1)} className="h-7 w-8 rounded-md border border-emerald-200 text-xs font-black text-emerald-800 hover:bg-emerald-50">‹</button>
        <div className="flex-1 text-center rounded-md bg-emerald-50 border border-emerald-100 px-2 py-1.5 text-xs font-black text-emerald-950">{monthLabel}</div>
        <button onClick={() => moveMonth(1)} className="h-7 w-8 rounded-md border border-emerald-200 text-xs font-black text-emerald-800 hover:bg-emerald-50">›</button>
      </div>

      <div
        className="mt-3 rounded-lg border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-2 transition-all duration-300"
        style={{ transform: turning ? 'perspective(700px) rotateY(8deg) translateY(-2px)' : 'perspective(700px) rotateY(0deg) translateY(0)' }}
      >
        <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-black uppercase text-emerald-700">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`${day}-${index}`} className="py-0.5">{day}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const key = dateKey(day);
            const coveredWindow = coverage.covered.get(key);
            const paidWindow = coverage.paid.get(key);
            const inMonth = day.getMonth() === monthStart.getMonth();
            return (
              <div
                key={key}
                className={`relative flex aspect-square min-h-[28px] items-start rounded-md border p-1 text-[9px] font-black transition-all duration-200 ${
                  paidWindow
                    ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_0_12px_rgba(4,120,87,0.25)]'
                    : coveredWindow
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-950 hover:border-emerald-500'
                      : inMonth
                        ? 'border-slate-100 bg-white text-slate-500'
                        : 'border-slate-50 bg-slate-50 text-slate-300'
                }`}
                title={coveredWindow ? `Covered by ${coveredWindow.txn.reference || coveredWindow.txn.id}` : 'Not covered'}
              >
                <span>{day.getDate()}</span>
                {coveredWindow && <CheckCircle2 className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 ${paidWindow ? 'text-white' : 'text-emerald-700'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
        {latestWindow ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase text-emerald-700">Latest coverage</div>
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="mt-1 text-xs font-black text-emerald-950">{inr(latestWindow.txn.amount)} - {latestWindow.txn.type || 'Contribution'}</div>
            <div className="mt-0.5 text-[10px] font-bold text-emerald-900/70">
              {dateText(latestWindow.start.toISOString())} to {dateText(latestWindow.endExclusive.toISOString())}
            </div>
          </>
        ) : (
          <div className="text-xs font-bold leading-relaxed text-emerald-900/75">
            No successful payment yet. Coverage ticks appear after backend verification.
          </div>
        )}
      </div>
    </aside>
  );
}

function FundSupportStrip() {
  const items = [
    ['365-day idea', 'రోజుకి చిన్న సేవ - annual continuity through one simple record.'],
    ['Medical support', 'Hospital, screening and assistance benefits stay eligibility based.'],
    ['Transparency', 'Payments, services and milestones stay visible in the ledger.'],
    ['Community value', 'Volunteer and service options keep non-money participation open.'],
  ];
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {items.map(([title, body]) => (
          <div key={title} className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <div className="text-xs font-black text-emerald-950">{title}</div>
            <p className="mt-1 text-[11px] font-bold leading-relaxed text-emerald-900/75">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Journey({ milestones }: { milestones: any[] }) {
  const rows = milestones.length ? milestones : [
    { id: 'concept-y1', year: 1, title: 'Active Membership / Member ID', status: 'AWAITING_RECORD' },
    { id: 'concept-y2', year: 2, title: 'Birthday / Community Service', status: 'AWAITING_RECORD' },
    { id: 'concept-y3', year: 3, title: 'Health Screening Eligibility', status: 'AWAITING_RECORD' },
    { id: 'concept-y4', year: 4, title: 'Insurance / Assistance Eligibility', status: 'AWAITING_RECORD' },
  ];
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-emerald-950">Four-Year Journey</h2>
          <p className="text-xs font-semibold text-emerald-800/70">Progress is calculated from backend participation records.</p>
        </div>
        <Sparkles className="w-5 h-5 text-emerald-700" />
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.status === 'COMPLETED' || item.status === 'ELIGIBLE' ? 'bg-emerald-700 text-white' : item.status === 'IN_PROGRESS' ? 'bg-lime-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200'}`}>
              {item.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : item.year}
            </div>
            <h3 className="mt-3 font-black text-emerald-950">Year {item.year}</h3>
            <p className="text-xs font-bold text-emerald-900/70 mt-1">{item.title}</p>
            <span className="inline-flex mt-3 px-2 py-1 rounded-md bg-white border border-emerald-200 text-[10px] font-black text-emerald-800">{item.status}</span>
          </div>
        ))}
      </div>
      {!milestones.length && (
        <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-3 text-xs font-bold text-emerald-900">
          No active milestone records yet. ఇవి concept placeholders మాత్రమే - real milestones appear after enrollment and backend eligibility calculation.
        </div>
      )}
    </section>
  );
}

function ProfileView({ profile, account }: any) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2"><UserRound className="w-5 h-5 text-emerald-700" /> FUND 365 Profile</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          ['Account ID', account?.id],
          ['Linked User', profile?.name],
          ['Role', profile?.role],
          ['Phone', profile?.phone],
          ['Email', profile?.email],
          ['Status', account?.status],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <div className="text-[10px] uppercase font-black text-emerald-700">{label}</div>
            <div className="text-sm font-black text-emerald-950 mt-1">{value || 'Not available'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinanceView({ transactions, monthlyPayments }: any) {
  const flow = ['Order / request created', 'Backend verifies payment', 'Ledger and streak update'];
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">
      <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-700" /> Finance Ledger</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50 text-emerald-700 text-xs uppercase font-black">
              <tr><th className="text-left p-3">Reference</th><th className="text-left p-3">Type</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn: any) => (
                <tr key={txn.id}><td className="p-3 font-black">{txn.reference || txn.id}</td><td className="p-3">{txn.type}</td><td className="p-3 font-black">{inr(txn.amount)}</td><td className="p-3">{txn.status}</td><td className="p-3">{dateText(txn.createdAt)}</td></tr>
              ))}
              {!transactions.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No Fund 365 transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
        {!!monthlyPayments.length && <div className="mt-4 text-xs font-bold text-slate-500">Monthly records: {monthlyPayments.length}</div>}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {flow.map((item, index) => (
            <div key={item} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black">{index + 1}</div>
              <div className="mt-2 text-xs font-black text-emerald-950">{item}</div>
              <p className="mt-1 text-[11px] font-bold text-emerald-900/70">
                {index === 0 && 'Participation starts as a request or transaction record.'}
                {index === 1 && 'Amount and ownership are checked on server side.'}
                {index === 2 && 'Only verified success updates Fund 365 account state.'}
              </p>
            </div>
          ))}
        </div>
      </section>
      <Fund365CoverageCalendar transactions={transactions} />
    </section>
  );
}

function MilestoneView({ milestones, transactions }: any) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">
      <Journey milestones={milestones} />
      <Fund365CoverageCalendar transactions={transactions || []} />
    </section>
  );
}

function BenefitView({ benefits }: any) {
  const steps = [
    ['1. Register', 'Become an active Ayudh Vikas Fund 365 member and receive a linked Member ID.', 'నమోదు'],
    ['2. Participate', 'Continue eligible contribution and/or service participation.', 'పాల్గొనండి'],
    ['3. Complete 3 Years', 'Maintain continuous eligible participation according to programme rules.', '3 సంవత్సరాలు'],
    ['4. Certificate', 'Receive the Digital Certificate of Continuous Participation after verification.', 'సర్టిఫికేట్'],
  ];
  return (
    <section className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60 p-4 sm:p-5 shadow-sm overflow-hidden">
      <div className="text-center">
        <div className="mx-auto mb-2 h-1 w-36 rounded-full bg-emerald-700 shadow-[0_0_18px_rgba(4,120,87,0.55)]" />
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950">
          3-Year Participation <span className="text-emerald-700">→</span> Year 4
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-bold text-emerald-900/75">
          మూడు సంవత్సరాల నిరంతర పాల్గొనడం తర్వాత, Year 4 benefits are considered through verification and programme rules.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {steps.map(([title, body, telugu], index) => {
          const year = index + 1;
          const yearBenefits = benefits.filter((benefit: any) => Number(benefit.year) === year);
          return (
            <div
              key={title}
              className="group relative min-h-[265px] overflow-hidden rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-[0_18px_42px_rgba(4,120,87,0.18)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-100 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col">
                <div className="mb-7 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 border border-emerald-100">
                    {telugu}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white shadow-[0_0_16px_rgba(4,120,87,0.45)] transition-transform duration-300 group-hover:scale-110">
                    {year}
                  </span>
                </div>
                <h3 className="text-lg font-black text-emerald-700">{title}</h3>
                <p className="mt-4 text-sm font-semibold leading-tight text-slate-900">{body}</p>
                <div className="mt-5 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Relevant Benefits</div>
                  {yearBenefits.length ? yearBenefits.map((benefit: any) => (
                    <div key={benefit.id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 transition-colors duration-300 group-hover:border-emerald-300">
                      <div className="font-black text-[11px] text-emerald-950">{benefit.title}</div>
                      <p className="mt-1 text-[10.5px] font-semibold leading-snug text-emerald-900/75">{benefit.description}</p>
                      <span className="mt-2 inline-flex rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[9px] font-black text-emerald-800">
                        {benefit.status}
                      </span>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-2.5 text-[11px] font-bold leading-snug text-emerald-900/70">
                      Awaiting backend eligibility record for this year.
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-3 text-[10px] font-black uppercase tracking-wide text-emerald-700/70">
                  Year {year} programme stage
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-slate-950 shadow-inner">
        <span className="font-black text-emerald-950">Year 4 - Special Health & Assistance Benefits:</span>{' '}
        eligible members may be considered for applicable health check-up, health assistance/health card support,
        help-line, blood coordination, emergency medical assistance and referral support, subject to verification,
        programme rules, availability and relevant healthcare/insurance provider terms. Benefits are not automatically
        guaranteed insurance coverage.
      </div>

      {!benefits.length && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-white p-4 text-sm font-bold text-emerald-900">
          Benefit records are merged into the year cards above. No backend benefit records exist yet, so each year currently shows awaiting eligibility.
        </div>
      )}
    </section>
  );
}

function HistoryView({ participations, serviceParticipations }: any) {
  const rules = ['Old records stay visible', 'Missed cycles are not deleted', 'Service and volunteer activity can sit beside payments'];
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2"><History className="w-5 h-5 text-emerald-700" /> Participation History</h2>
      <div className="mt-4 space-y-2">
        {[...participations, ...serviceParticipations].map((item: any) => (
          <div key={item.id} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-black text-emerald-950">{item.type || item.serviceType || 'FUND 365 Activity'}</div>
              <div className="text-xs font-semibold text-emerald-900/60">{dateText(item.createdAt)} {item.description ? `- ${item.description}` : ''}</div>
            </div>
            <span className="px-2 py-1 rounded-md bg-white border border-emerald-200 text-[10px] font-black text-emerald-800">{item.status || item.verificationStatus}</span>
          </div>
        ))}
        {!participations.length && !serviceParticipations.length && <div className="p-8 text-center text-slate-500 font-bold">No participation history yet.</div>}
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {rules.map((rule) => (
          <div key={rule} className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs font-black text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 mb-2" />
            {rule}
          </div>
        ))}
      </div>
    </section>
  );
}
