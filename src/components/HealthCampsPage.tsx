import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Tent,
  MapPin,
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  Users,
  Navigation,
  ShieldAlert,
  Heart,
  Crosshair,
  RefreshCw,
  Eye,
  Activity,
  HeartPulse
} from 'lucide-react';
import { ActiveModal, HealthCamp } from '../types';
import {
  UPCOMING_CAMPS,
  COMPLETED_CAMPS,
  DISTRICTS,
  getDistrictCoordinates,
  haversineKm
} from '../data/mockData';
import { useLiveData } from '../context/LiveDataContext';

interface HealthCampsPageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onSelectCamp?: (campTitle: string) => void;
}

type LocationStatus = 'requesting' | 'granted' | 'denied' | 'unavailable';

const FALLBACK_CAMP_IMAGE = '/src/assets/images/diabetes_camp_banner_1787229418787.jpg';

const campCoords = (camp: HealthCamp) => {
  if (typeof camp.lat === 'number' && typeof camp.lng === 'number') {
    return { lat: camp.lat, lng: camp.lng };
  }
  return getDistrictCoordinates(camp.district);
};

const nearestDistrict = (lat: number, lng: number) => {
  return DISTRICTS.reduce((best, district) => {
    const point = getDistrictCoordinates(district);
    const km = haversineKm(lat, lng, point.lat, point.lng);
    if (!best || km < best.km) return { district, km };
    return best;
  }, null as { district: string; km: number } | null);
};

export const HealthCampsPage: React.FC<HealthCampsPageProps> = ({
  onBackToHome,
  onOpenModal,
  onSelectCamp
}) => {
  const { collections } = useLiveData();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePaused, setSlidePaused] = useState(false);
  const [districtFilter, setDistrictFilter] = useState('All');

  const liveCamps: HealthCamp[] = collections.health_camps.length
    ? collections.health_camps
    : [...UPCOMING_CAMPS, ...COMPLETED_CAMPS];

  const upcomingCamps = useMemo(
    () =>
      liveCamps.filter(
        (camp) => camp.status === 'Upcoming' || camp.status === 'Ongoing' || !camp.status
      ),
    [liveCamps]
  );

  const completedCamps = useMemo(() => {
    const done = liveCamps.filter((camp) => camp.status === 'Completed');
    const source = done.length ? done : COMPLETED_CAMPS;
    return source.map((camp) => ({
      ...camp,
      image:
        camp.image ||
        COMPLETED_CAMPS.find((item) => item.id === camp.id)?.image ||
        FALLBACK_CAMP_IMAGE
    }));
  }, [liveCamps]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setCoords(null);
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('granted');
      },
      () => {
        setCoords(null);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (slidePaused || completedCamps.length < 2) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % completedCamps.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slidePaused, completedCamps.length]);

  const locatedDistrict = coords ? nearestDistrict(coords.lat, coords.lng) : null;

  const campsWithDistance = useMemo(() => {
    return upcomingCamps.map((camp) => {
      const point = campCoords(camp);
      const distanceKm = coords ? haversineKm(coords.lat, coords.lng, point.lat, point.lng) : null;
      return { ...camp, distanceKm };
    });
  }, [upcomingCamps, coords]);

  const displayedCamps = useMemo(() => {
    let list = [...campsWithDistance];
    if (districtFilter !== 'All') {
      list = list.filter((camp) => camp.district === districtFilter);
    }
    if (locationStatus === 'granted') {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
    return list;
  }, [campsWithDistance, districtFilter, locationStatus]);

  const handleRegister = (camp: HealthCamp) => {
    const title = camp.title || (camp as any).name || '';
    if (onSelectCamp) onSelectCamp(title);
    onOpenModal('camp_register');
  };

  const activeSlide = completedCamps[slideIndex] || completedCamps[0];
  const locationGranted = locationStatus === 'granted' && coords;

  const awarenessItems = [
    {
      title: 'Diabetes Prevention',
      desc: 'Know your sugar numbers. Free HbA1c screening at upcoming camps.',
      color: 'bg-emerald-50/40 border-emerald-200/80',
      icon: Activity,
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Heart Health',
      desc: 'BP and ECG checks help detect hypertension before it becomes an emergency.',
      color: 'bg-sky-50/40 border-sky-200/80',
      icon: HeartPulse,
      iconColor: 'text-sky-600'
    },
    {
      title: "Women's Wellness",
      desc: 'Anaemia, maternal care and nutrition counselling for rural families.',
      color: 'bg-amber-50/40 border-amber-200/80',
      icon: Heart,
      iconColor: 'text-amber-600'
    },
    {
      title: 'Eye Care Awareness',
      desc: 'Cataract screening and free reading spectacles at community eye camps.',
      color: 'bg-indigo-50/40 border-indigo-200/80',
      icon: Eye,
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="bg-slate-100 font-sans text-slate-800">
      {/* Hero — homepage palette */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-8">
          <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-5">
            <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Services</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-700">Health Camps & Public Awareness</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-300 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>CARE BEYOND BOUNDARIES</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f2e5a] uppercase leading-tight tracking-tight">
                HEALTH CAMPS &amp; <br />
                <span className="text-[#0275d8]">PUBLIC AWARENESS</span>
              </h1>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed max-w-2xl">
                Free community screening camps across Telangana. Allow location access to see camps nearest to you, or browse all upcoming programmes and completed camp highlights.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={requestLocation}
                  className="bg-[#008a00] hover:bg-[#007000] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg transition-all border border-emerald-800 text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Crosshair className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white">
                      {locationGranted ? 'Refresh Location' : 'Allow Location Access'}
                    </div>
                    <div className="text-[11px] font-medium text-emerald-100">
                      Find camps near you
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onSelectCamp && displayedCamps[0]) onSelectCamp(displayedCamps[0].title);
                    onOpenModal('camp_register');
                  }}
                  className="bg-[#0052cc] hover:bg-[#003d99] text-white p-3 rounded-lg flex items-center gap-3 shadow-md hover:shadow-lg transition-all border border-blue-900 text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Tent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white">
                      Register for Camp
                    </div>
                    <div className="text-[11px] font-medium text-blue-100">
                      Free screening &amp; checkup
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md h-56 sm:h-72">
                <img
                  src="/src/assets/images/diabetes_camp_banner_1787229418787.jpg"
                  alt="Ayudh Vikas health camp screening"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2e5a]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="text-white">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Community Camps</div>
                    <div className="text-sm font-black">Screening Across 6 Districts</div>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location status bar — matches homepage search navy strip */}
      <div className="bg-[#0b1b3d] text-white py-3.5 px-4 sm:px-8 border-y-2 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              {locationStatus === 'requesting' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : locationGranted ? (
                <Navigation className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              {locationStatus === 'requesting' && (
                <>
                  <div className="text-xs font-black uppercase tracking-wide">Detecting your location</div>
                  <div className="text-[11px] text-slate-300 font-semibold">Please allow location access to see nearby health camps.</div>
                </>
              )}
              {locationGranted && (
                <>
                  <div className="text-xs font-black uppercase tracking-wide">
                    Camps near {locatedDistrict?.district || 'you'}
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold">
                    Location locked at {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                    {locatedDistrict ? ` · about ${locatedDistrict.km.toFixed(1)} km from ${locatedDistrict.district} centre` : ''}
                  </div>
                </>
              )}
              {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
                <>
                  <div className="text-xs font-black uppercase tracking-wide text-amber-300">
                    Location access not available
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold">
                    Showing all upcoming camps across Telangana. Enable location anytime to sort by distance.
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Districts</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {!locationGranted && (
              <button
                onClick={requestLocation}
                className="bg-[#008a00] hover:bg-[#007000] text-white text-[11px] font-black uppercase px-3 py-2 rounded cursor-pointer"
              >
                Enable Location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming / nearby camps */}
      <section className="py-8 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <h2 className="text-sm font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
              <Tent className="w-4 h-4 text-emerald-600" />
              {locationGranted ? 'Upcoming Camps Near You' : 'Upcoming Health Camps'}
            </h2>
            <span className="text-[10px] font-bold text-emerald-700">
              {displayedCamps.length} programme{displayedCamps.length === 1 ? '' : 's'}
            </span>
          </div>

          {displayedCamps.length === 0 ? (
            <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-6 text-center text-sm font-semibold text-slate-600">
              No upcoming camps in this district right now. Try another district or register for the next community camp.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCamps.map((camp, index) => {
                const title = camp.title || (camp as any).name || 'Health Camp';
                const services: string[] = camp.servicesOffered || (camp as any).services || [];
                return (
                  <article
                    key={camp.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          {camp.status || 'Upcoming'}
                        </span>
                        {locationGranted && camp.distanceKm != null ? (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            index === 0 && districtFilter === 'All'
                              ? 'bg-amber-400 text-[#0f2e5a]'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {camp.distanceKm < 1 ? `${Math.round(camp.distanceKm * 1000)} m` : `${camp.distanceKm.toFixed(1)} km`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500">{camp.category || 'Community Camp'}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-[#0f2e5a] leading-snug">{title}</h3>
                      <div className="mt-3 space-y-1.5 text-[11px] font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{camp.venue || camp.location}{camp.district ? `, ${camp.district}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{camp.date}</span>
                        </div>
                        {camp.time && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{camp.time}</span>
                          </div>
                        )}
                        {camp.leadDoctor && (
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{camp.leadDoctor}</span>
                          </div>
                        )}
                        {camp.organizedBy && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{camp.organizedBy}</span>
                          </div>
                        )}
                      </div>
                      {camp.description && (
                        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{camp.description}</p>
                      )}
                      {services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {services.map((service: string) => (
                            <span key={service} className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRegister(camp)}
                      className="w-full mt-4 bg-[#008a00] hover:bg-[#007000] text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Register for Camp
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Completed camps slideshow */}
      <section className="py-8 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-black uppercase text-[#0f2e5a] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Completed Camps Slideshow
            </h2>
            <span className="text-[10px] font-bold text-slate-500">
              {completedCamps.length} recent programmes
            </span>
          </div>

          {activeSlide && (
            <div
              className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-[#0f2e5a]"
              onMouseEnter={() => setSlidePaused(true)}
              onMouseLeave={() => setSlidePaused(false)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[320px]">
                <div className="lg:col-span-7 relative h-56 sm:h-72 lg:h-auto">
                  <img
                    src={activeSlide.image || FALLBACK_CAMP_IMAGE}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f2e5a]/40 hidden lg:block" />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                    Completed
                  </span>
                </div>

                <div className="lg:col-span-5 p-5 sm:p-7 text-white flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300 mb-1">
                      {activeSlide.category || 'Community Health Camp'}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight">{activeSlide.title}</h3>
                    <p className="text-xs text-slate-200 mt-3 leading-relaxed">{activeSlide.description}</p>
                    <div className="mt-4 space-y-1.5 text-[11px] font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activeSlide.venue || activeSlide.location}, {activeSlide.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{activeSlide.date}{activeSlide.time ? ` · ${activeSlide.time}` : ''}</span>
                      </div>
                      {activeSlide.leadDoctor && (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-300" />
                          <span>{activeSlide.leadDoctor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15">
                    <div>
                      <div className="text-lg font-black text-amber-400">{activeSlide.beneficiaries || '—'}</div>
                      <div className="text-[9px] font-extrabold uppercase text-slate-300">Beneficiaries</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-amber-400">{activeSlide.doctorsInvolved || '—'}</div>
                      <div className="text-[9px] font-extrabold uppercase text-slate-300">Doctors</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-amber-400">{activeSlide.district || '—'}</div>
                      <div className="text-[9px] font-extrabold uppercase text-slate-300">District</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSlideIndex((prev) => (prev - 1 + completedCamps.length) % completedCamps.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-[#0f2e5a] flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
                aria-label="Previous completed camp"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSlideIndex((prev) => (prev + 1) % completedCamps.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-[#0f2e5a] flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
                aria-label="Next completed camp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                {completedCamps.map((camp, idx) => (
                  <button
                    key={camp.id}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === slideIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Show ${camp.title}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Public awareness — homepage widget colours */}
      <section className="py-8 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-5">
          <h2 className="text-sm font-black uppercase text-[#0f2e5a] flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            Public Awareness Programmes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {awarenessItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`${item.color} rounded-xl p-4 border flex flex-col justify-between shadow-xs`}>
                  <div>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3 shadow-xs">
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-xs font-black uppercase text-[#0f2e5a]">{item.title}</h3>
                    <p className="text-[11px] font-semibold text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats strip — homepage navy counters */}
      <div className="bg-[#0a192f] text-white py-5 px-4 sm:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {[
            { count: `${upcomingCamps.length}+`, label: 'Upcoming Camps' },
            { count: `${completedCamps.length}+`, label: 'Completed Camps' },
            { count: '6', label: 'Districts Covered' },
            { count: 'Free', label: 'Community Screening' }
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center p-2">
              <div className="text-base sm:text-lg font-black text-amber-400 tracking-tight leading-none">{stat.count}</div>
              <div className="text-[10px] font-extrabold uppercase text-slate-300 mt-1 tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
