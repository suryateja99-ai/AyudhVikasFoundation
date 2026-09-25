import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Ambulance,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Headphones,
  History,
  ImagePlus,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  PhoneCall,
  QrCode,
  RefreshCw,
  Route,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BrandLogo } from './BrandLogo';
import { Fund360Button } from './Fund360Button';

type AmbulanceNav = 'Dashboard' | 'Requests' | 'Upcoming' | 'Accepted' | 'History' | 'Profile' | 'Support';

interface AmbulanceDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  initialNav?: AmbulanceNav;
}

const navItems: Array<{ label: AmbulanceNav; icon: React.ElementType; path: string }> = [
  { label: 'Dashboard', icon: BarChart3, path: '/ambulance/dashboard' },
  { label: 'Requests', icon: ClipboardList, path: '/ambulance/requests' },
  { label: 'Upcoming', icon: CalendarClock, path: '/ambulance/upcoming' },
  { label: 'Accepted', icon: CheckCircle2, path: '/ambulance/accepted' },
  { label: 'History', icon: History, path: '/ambulance/history' },
  { label: 'Profile', icon: UserCheck, path: '/ambulance/profile' },
  { label: 'Support', icon: Headphones, path: '/ambulance/support' },
];

const ambulanceImages = {
  hero: '/src/assets/images/ambulance_panoramic_hero_1787232365048.jpg',
  side: '/src/assets/images/ambulance_side_cutout_1787376350532.jpg',
  banner: '/src/assets/images/ambulance_hero_banner_1787231839013.jpg',
  hospital: '/src/assets/images/modern_hospital_facade_1787227836867.jpg',
  family: '/src/assets/images/indian_family_hero_1785560495834.jpg',
  logo: '/src/assets/images/ayudh-vikas-logo.jpg',
  driverFallback: '/src/assets/images/patient_avatar_1787229395408.jpg',
};

const renderableDriverImage = (image?: string) => {
  const value = String(image || '').trim();
  if (!value || value.includes('support_agent_male_1785560404261')) return ambulanceImages.driverFallback;
  return value;
};

const posterCopy: Record<AmbulanceNav, { title: string; body: string; tone: string; image: string }> = {
  Dashboard: {
    title: 'Ayudh Vikas Emergency Dispatch',
    body: 'Track live requests, driver response, completed rides and demand signals from one ambulance operations desk.',
    tone: '24x7 verified ambulance network',
    image: ambulanceImages.hero,
  },
  Requests: {
    title: 'Pending Patient Ride Requests',
    body: 'Approve only the rides you can serve and call the patient directly before dispatch.',
    tone: 'Fast response queue',
    image: ambulanceImages.banner,
  },
  Upcoming: {
    title: 'Scheduled Pickups',
    body: 'Accepted rides that need time-aware pickup coordination and hospital drop readiness.',
    tone: 'Upcoming route planner',
    image: ambulanceImages.hospital,
  },
  Accepted: {
    title: 'Active And Accepted Rides',
    body: 'Start and complete rides from the same live workflow so patient and admin panels stay updated.',
    tone: 'Ride lifecycle control',
    image: ambulanceImages.side,
  },
  History: {
    title: 'Completed Ride History',
    body: 'Review previous ambulance service records with patient, route, status and distance context.',
    tone: 'Service accountability',
    image: ambulanceImages.family,
  },
  Profile: {
    title: 'Ambulance Member Identity',
    body: 'Maintain your Ayudh Vikas driver profile, vehicle details, image and verification identity.',
    tone: 'Verified fleet member',
    image: ambulanceImages.side,
  },
  Support: {
    title: 'Dispatch Support Desk',
    body: 'Reach Ayudh Vikas support for fleet account help, emergency coordination or operational questions.',
    tone: 'Driver helpdesk',
    image: ambulanceImages.hero,
  },
};

const statusClass = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized.includes('reject') || normalized.includes('cancel')) return 'bg-red-50 text-red-700 border-red-200';
  if (normalized.includes('complete')) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (normalized.includes('started') || normalized.includes('route')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (normalized.includes('accept') || normalized.includes('schedule')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const prettyDate = (date?: string, time?: string) => {
  const raw = `${date || ''} ${time || ''}`.trim();
  if (!raw) return 'Not scheduled';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const patientLine = (booking: any) => `${booking.patientName || 'Patient'} • ${booking.patientId || 'No ID'} • ${booking.phone || booking.patientPhone || 'No phone'}`;

const AmbulancePoster = ({ activeNav, stats }: { activeNav: AmbulanceNav; stats?: any }) => {
  const copy = posterCopy[activeNav];
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#071a31] text-white border border-slate-800 shadow-sm min-h-[210px]">
      <img src={copy.image} alt={copy.title} className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071a31] via-[#071a31]/90 to-[#071a31]/25" />
      <div className="relative p-5 lg:p-7 grid lg:grid-cols-[1fr_330px] gap-5 items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            {copy.tone}
          </div>
          <h2 className="mt-4 text-2xl lg:text-4xl font-black leading-tight">{copy.title}</h2>
          <p className="mt-3 text-sm font-semibold text-slate-200 max-w-2xl">{copy.body}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 max-w-xl">
            {[
              ['Pending', stats?.pendingBookings || 0],
              ['Accepted', stats?.acceptedBookings || 0],
              ['Completed', stats?.completedBookings || 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <div className="text-lg font-black">{value}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <img src={ambulanceImages.logo} alt="Ayudh Vikas" className="w-12 h-12 rounded-full object-cover bg-white p-1" />
            <div>
              <p className="text-sm font-black">AYUDH VIKAS FOUNDATION</p>
              <p className="text-[11px] font-bold text-emerald-200">Care Beyond Boundaries</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg bg-red-500/90 px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-wider">Emergency Helpdesk</div>
            <div className="text-xl font-black">0870 4210820</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MiniVisualStrip = () => (
  <div className="grid md:grid-cols-3 gap-3">
    {[
      ['Verified Fleet', 'Driver identity, vehicle details and ride status are linked to backend records.', ambulanceImages.side],
      ['Hospital Routes', 'Drop locations and demand board help spot frequent hospital transfer needs.', ambulanceImages.hospital],
      ['Patient First', 'Every action updates patient-side ride visibility through the ambulance booking record.', ambulanceImages.family],
    ].map(([title, body, image]) => (
      <div key={title} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-24 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="p-3">
          <h3 className="text-xs font-black text-slate-950">{title}</h3>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">{body}</p>
        </div>
      </div>
    ))}
  </div>
);

export const AmbulanceDashboard: React.FC<AmbulanceDashboardProps> = ({ onLogout, initialNav = 'Dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<AmbulanceNav>(initialNav);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [summary, setSummary] = useState<any>({ driver: {}, stats: {}, predictions: {}, requests: [], active: [], upcoming: [], accepted: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [profileForm, setProfileForm] = useState<any>({});

  useEffect(() => setActiveNav(initialNav), [initialNav]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.ambulanceSummary();
      setSummary(data);
      setProfileForm({
        driverName: data.driver?.driverName || data.driver?.name || user?.name || '',
        phone: data.driver?.phone || user?.phone || '',
        vehicleNumber: data.driver?.vehicleNumber || '',
        vehicleType: data.driver?.vehicleType || 'Basic Life Support (BLS)',
        district: data.driver?.district || 'Warangal',
        baseLocation: data.driver?.baseLocation || '',
        image: data.driver?.image || user?.data?.image || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load ambulance dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRequests = useMemo(() => {
    const text = query.toLowerCase();
    return (summary.requests || []).filter((item: any) =>
      `${item.patientName} ${item.patientId} ${item.phone} ${item.pickupLocation} ${item.dropLocation}`.toLowerCase().includes(text)
    );
  }, [query, summary.requests]);

  const action = async (label: string, fn: () => Promise<unknown>) => {
    setSaving(label);
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setSaving('');
    }
  };

  const handleNav = (label: AmbulanceNav, path: string) => {
    setActiveNav(label);
    navigate(path);
  };

  const handleProfileImageUpload = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file for the ambulance driver profile.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev: any) => ({ ...prev, image: String(reader.result || '') }));
    };
    reader.onerror = () => setError('Unable to read selected profile image.');
    reader.readAsDataURL(file);
  };

  const BookingCard = ({ booking, mode }: { booking: any; mode: 'request' | 'active' | 'history' }) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-950">{booking.patientName || 'Patient'}</h3>
            <span className={`px-2 py-1 rounded-full border text-[10px] font-black ${statusClass(booking.status)}`}>{booking.status || 'Pending'}</span>
            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">{booking.ambulanceType || booking.vehicleType || 'Ambulance'}</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{patientLine(booking)}</p>
          <div className="grid md:grid-cols-2 gap-3 mt-4 text-xs">
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <div><b>Pickup</b><br />{booking.pickupLocation || 'Not provided'}</div>
            </div>
            <div className="flex gap-2">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
              <div><b>Drop</b><br />{booking.dropLocation || 'Not provided'}</div>
            </div>
            <div className="flex gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div><b>Pickup Time</b><br />{prettyDate(booking.preferredDate, booking.preferredTime)}</div>
            </div>
            <div className="flex gap-2">
              <Route className="w-4 h-4 text-slate-600 shrink-0" />
              <div><b>Estimator</b><br />{booking.estimatedKm || 0} km • {booking.eta || 'Awaiting acceptance'}</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs font-semibold text-slate-600">
            Condition: {booking.patientCondition || 'Not mentioned'} • Support: {booking.medicalSupportNeeded || 'Not mentioned'}
            {booking.additionalNotes ? <span> • Notes: {booking.additionalNotes}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap lg:flex-col gap-2 lg:min-w-[170px]">
          <a href={`tel:${booking.phone || booking.patientPhone || ''}`} className="h-9 px-3 rounded-lg bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-2">
            <PhoneCall className="w-4 h-4" /> Call
          </a>
          {mode === 'request' && (
            <>
              <button
                disabled={saving === `accept-${booking.id}`}
                onClick={() => action(`accept-${booking.id}`, () => api.acceptAmbulanceBooking(booking.id))}
                className="h-9 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black disabled:opacity-60"
              >
                {saving === `accept-${booking.id}` ? 'Accepting...' : 'Accept'}
              </button>
              <input
                value={rejectReasons[booking.id] || ''}
                onChange={(e) => setRejectReasons((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                placeholder="Reject reason"
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold"
              />
              <button
                disabled={saving === `reject-${booking.id}`}
                onClick={() => action(`reject-${booking.id}`, () => api.rejectAmbulanceBooking(booking.id, { reason: rejectReasons[booking.id] }))}
                className="h-9 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black disabled:opacity-60"
              >
                Reject
              </button>
            </>
          )}
          {mode === 'active' && ['Accepted', 'Scheduled'].includes(String(booking.status || '')) && (
            <button
              disabled={saving === `start-${booking.id}`}
              onClick={() => action(`start-${booking.id}`, () => api.startAmbulanceRide(booking.id))}
              className="h-9 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-black disabled:opacity-60"
            >
              Start Ride
            </button>
          )}
          {mode === 'active' && ['Accepted', 'Scheduled', 'Ride Started', 'En Route'].includes(String(booking.status || '')) && (
            <button
              disabled={saving === `complete-${booking.id}`}
              onClick={() => action(`complete-${booking.id}`, () => api.completeAmbulanceRide(booking.id))}
              className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-950 text-white text-xs font-black disabled:opacity-60"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const Empty = ({ label }: { label: string }) => (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <Ambulance className="w-8 h-8 text-slate-300 mx-auto" />
      <p className="text-sm font-black text-slate-700 mt-2">{label}</p>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4">
      <AmbulancePoster activeNav="Dashboard" stats={summary.stats} />
      <MiniVisualStrip />

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {[
          ['Total Bookings', summary.stats?.totalBookings || 0, Ambulance, 'text-blue-700'],
          ['Pending', summary.stats?.pendingBookings || 0, Clock, 'text-amber-700'],
          ['Accepted', summary.stats?.acceptedBookings || 0, CheckCircle2, 'text-emerald-700'],
          ['Previous', summary.stats?.previousBookings || 0, History, 'text-slate-700'],
          ['Offline', summary.stats?.offlineBookings || 0, ClipboardList, 'text-purple-700'],
        ].map(([label, value, Icon, color]: any) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <Icon className={`w-5 h-5 ${color}`} />
            <div className="text-2xl font-black text-slate-950 mt-3">{value}</div>
            <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.35fr_0.65fr] gap-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-950">Pending Requests</h2>
              <p className="text-xs font-semibold text-slate-500">Requests waiting for ambulance approval.</p>
            </div>
            <button onClick={() => handleNav('Requests', '/ambulance/requests')} className="text-xs font-black text-emerald-700">View All</button>
          </div>
          <div className="mt-4 space-y-3">
            {(summary.requests || []).slice(0, 3).map((booking: any) => <BookingCard key={booking.id} booking={booking} mode="request" />)}
            {!(summary.requests || []).length && <Empty label="No pending ambulance requests." />}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-black text-slate-950">Users Prediction Board</h2>
          <p className="text-xs font-semibold text-slate-500">Demand signals from Ayudh Vikas ambulance usage.</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
              <div className="text-xl font-black text-emerald-800">{summary.predictions?.appUsers || 0}</div>
              <div className="text-[10px] font-black text-emerald-700 uppercase">Unique Users</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
              <div className="text-xl font-black text-blue-800">{summary.predictions?.averageKm || 0} km</div>
              <div className="text-[10px] font-black text-blue-700 uppercase">Avg Ride</div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {(summary.predictions?.mostRequestedHospitals || []).map((item: any, index: number) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-black text-slate-700">
                  <span className="truncate">{index + 1}. {item.name}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, 20 + item.count * 18)}%` }} />
                </div>
              </div>
            ))}
            {!(summary.predictions?.mostRequestedHospitals || []).length && <p className="text-xs font-semibold text-slate-500">No hospital demand data yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );

  const renderList = (items: any[], mode: 'request' | 'active' | 'history', empty: string, posterNav: AmbulanceNav) => (
    <div className="space-y-3">
      <AmbulancePoster activeNav={posterNav} stats={summary.stats} />
      <MiniVisualStrip />
      {items.map((booking) => <BookingCard key={booking.id} booking={booking} mode={mode} />)}
      {!items.length && <Empty label={empty} />}
    </div>
  );

  const renderProfile = () => (
    <div className="grid xl:grid-cols-[0.75fr_1.25fr] gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={renderableDriverImage(profileForm.image)} alt={profileForm.driverName || 'Ambulance driver'} className="w-24 h-24 rounded-2xl object-contain bg-slate-100 border border-slate-200 shadow-sm" />
            <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-lg cursor-pointer" title="Upload profile image">
              <ImagePlus className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleProfileImageUpload(e.target.files?.[0])}
              />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">{profileForm.driverName || 'Ambulance Driver'}</h2>
            <p className="text-xs font-bold text-slate-500">Ayudh Vikas Ambulance Member</p>
            <p className="text-xs font-black text-emerald-700 mt-1">{summary.driver?.ambulanceId || summary.driver?.id || 'AMB-MEMBER'}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-2">Upload a clear driver photo for dispatch identity checks.</p>
          </div>
        </div>
        <div className="mt-5 aspect-square max-w-[180px] rounded-xl border border-slate-200 bg-white p-3 grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }).map((_, index) => (
            <span key={index} className={`rounded-sm ${index % 3 === 0 || index % 7 === 0 ? 'bg-slate-950' : 'bg-slate-100'}`} />
          ))}
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-3">Scan identity card at Ayudh Vikas dispatch desk for driver verification.</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-black text-slate-950 mb-4">Rider Details</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ['driverName', 'Driver Name'],
            ['phone', 'Mobile Number'],
            ['vehicleNumber', 'Vehicle Number'],
            ['vehicleType', 'Vehicle Type'],
            ['district', 'District'],
            ['baseLocation', 'Base Location'],
          ].map(([key, label]) => (
            <label key={key} className={key === 'baseLocation' ? 'md:col-span-2' : ''}>
              <span className="text-xs font-black text-slate-700">{label}</span>
              <input
                value={profileForm[key] || ''}
                onChange={(e) => setProfileForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
                className="mt-1 w-full h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          ))}
          <label className="md:col-span-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 cursor-pointer hover:bg-emerald-50 transition-colors">
            <span className="flex items-center gap-2 text-xs font-black text-emerald-900">
              <ImagePlus className="w-4 h-4" />
              Upload Driver Image
            </span>
            <span className="block text-[11px] font-semibold text-emerald-700 mt-1">PNG, JPG or WEBP. The image is previewed instantly and saved when you press Save Profile.</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleProfileImageUpload(e.target.files?.[0])}
            />
          </label>
        </div>
        <button
          disabled={saving === 'profile'}
          onClick={() => action('profile', () => api.updateAmbulanceProfile(profileForm))}
          className="mt-4 h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving === 'profile' ? 'Saving...' : 'Save Profile'}
        </button>
      </section>
    </div>
  );

  const content = () => {
    if (loading) return <div className="h-80 flex items-center justify-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading ambulance dashboard...</div>;
    if (activeNav === 'Dashboard') return renderDashboard();
    if (activeNav === 'Requests') return (
      <div className="space-y-3">
        <AmbulancePoster activeNav="Requests" stats={summary.stats} />
        <MiniVisualStrip />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pending requests" className="w-full max-w-md h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold" />
        {filteredRequests.map((booking: any) => <BookingCard key={booking.id} booking={booking} mode="request" />)}
        {!filteredRequests.length && <Empty label="No pending requests found." />}
      </div>
    );
    if (activeNav === 'Upcoming') return renderList(summary.upcoming || [], 'active', 'No upcoming accepted bookings.', 'Upcoming');
    if (activeNav === 'Accepted') return renderList(summary.accepted || [], 'active', 'No accepted rides yet.', 'Accepted');
    if (activeNav === 'History') return renderList(summary.history || [], 'history', 'No previous ambulance ride history.', 'History');
    if (activeNav === 'Profile') return (
      <div className="space-y-4">
        <AmbulancePoster activeNav="Profile" stats={summary.stats} />
        {renderProfile()}
      </div>
    );
    return (
      <div className="space-y-4">
        <AmbulancePoster activeNav="Support" stats={summary.stats} />
        <MiniVisualStrip />
        <section className="rounded-lg border border-slate-200 bg-white p-6 grid lg:grid-cols-[1fr_340px] gap-5 items-center">
          <div>
            <Headphones className="w-8 h-8 text-emerald-700" />
            <h2 className="text-lg font-black text-slate-950 mt-3">Ambulance Support</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Contact Ayudh Vikas dispatch support for emergency coordination or fleet account help.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="tel:08704210820" className="inline-flex h-10 px-4 rounded-lg bg-slate-950 text-white text-xs font-black items-center gap-2"><PhoneCall className="w-4 h-4" /> 0870 4210820</a>
              <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="inline-flex h-10 px-4 rounded-lg bg-emerald-700 text-white text-xs font-black items-center gap-2"><Headphones className="w-4 h-4" /> WhatsApp Support</a>
            </div>
          </div>
          <img src={ambulanceImages.side} alt="Ambulance support" className="w-full h-48 object-cover rounded-xl border border-slate-200" />
        </section>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] font-sans text-slate-800 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <BrandLogo />
          <button onClick={() => setSidebarOpen((value) => !value)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Toggle sidebar">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-lg font-black text-[#102a53]">Welcome, {user?.name || 'Ambulance Team'}</h1>
            <p className="text-xs font-semibold text-slate-500">Ride requests, live approvals, dispatch analytics and driver profile.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Fund360Button compact />
          <button onClick={() => void load()} className="hidden sm:flex h-9 px-3 rounded-lg border border-slate-200 text-xs font-black text-slate-700 items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={onLogout} className="h-9 px-3 rounded-lg bg-[#102a53] text-white text-xs font-black flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {sidebarOpen && (
          <aside className="w-64 bg-[#0e2749] text-white border-r border-[#1d3b63] p-3 hidden md:flex md:flex-col sticky top-16 h-[calc(100vh-4rem)]">
            <div className="rounded-xl bg-white/8 p-3 mb-3">
              <div className="flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-red-300" />
                <div>
                  <p className="text-xs font-black">Ambulance Portal</p>
                  <p className="text-[10px] text-slate-300">{summary.driver?.vehicleNumber || 'Fleet Member'}</p>
                </div>
              </div>
            </div>
            <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img src={ambulanceImages.side} alt="Ayudh Vikas ambulance" className="h-24 w-full object-cover opacity-90" />
              <div className="p-3">
                <p className="text-[11px] font-black text-white">Rapid Care Network</p>
                <p className="text-[10px] font-semibold text-slate-300 mt-0.5">Verified rides, live records, patient-first response.</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.label, item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-black transition-all ${active ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1500px] mx-auto space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{activeNav}</h2>
                <p className="text-xs font-semibold text-slate-500">Live ambulance operations from backend booking records.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-black">
                <span className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified</span>
                <span className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-100 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> 24x7 Dispatch</span>
                <span className="px-3 py-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> AV Member ID</span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {content()}
          </div>
        </main>
      </div>
    </div>
  );
};
