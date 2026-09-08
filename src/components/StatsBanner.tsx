import React from 'react';
import { 
  UserCheck, 
  Building2, 
  TestTube, 
  Ambulance, 
  Users, 
  Tent, 
  Headphones 
} from 'lucide-react';
import { useLiveData } from '../context/LiveDataContext';

export const StatsBanner: React.FC = () => {
  const { collections, stats: liveStats } = useLiveData();
  const doctorCount = collections.doctors.length || liveStats.doctors || 0;
  const hospitalCount = collections.hospitals.length || liveStats.hospitals || 0;
  const campCount = collections.health_camps.length || liveStats.health_camps || 0;
  const memberCount = (liveStats.users || 0) + (collections.memberships.length || 0);

  const stats = [
    { icon: UserCheck, count: `${Math.max(doctorCount, 1)}+`, label: 'QUALIFIED DOCTORS' },
    { icon: Building2, count: `${Math.max(hospitalCount, 1)}+`, label: 'PARTNER HOSPITALS' },
    { icon: TestTube, count: `${Math.max(collections.lab_bookings.length, 25)}+`, label: 'DIAGNOSTIC LABS' },
    { icon: Ambulance, count: `${Math.max(collections.ambulance_bookings.length, 30)}+`, label: 'AMBULANCE PARTNERS' },
    { icon: Users, count: `${Math.max(memberCount, 5)}+`, label: 'HAPPY MEMBERS' },
    { icon: Tent, count: `${Math.max(campCount, 1)}+`, label: 'HEALTH CAMPS CONDUCTED' },
    { icon: Headphones, count: '24x7', label: 'SUPPORT AVAILABLE' }
  ];

  return (
    <div className="bg-[#0a192f] text-white py-5 px-4 sm:px-8 border-y border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {stats.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-2 pt-3 sm:pt-2 group">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-base sm:text-lg font-black text-amber-400 tracking-tight leading-none">
                  {item.count}
                </div>
                <div className="text-[10px] font-extrabold uppercase text-slate-300 mt-1 tracking-wider leading-tight">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
