import React from 'react';
import { 
  UserCheck, 
  Building2, 
  PhoneCall, 
  TestTube, 
  Ambulance, 
  HeartHandshake, 
  Tent, 
  CreditCard,
  MessageSquare,
  Mail,
  Headphones,
  ArrowUpRight
} from 'lucide-react';
import { ActiveModal } from '../types';

interface ServicesGridProps {
  onOpenModal: (modal: ActiveModal) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onOpenModal }) => {
  const serviceCards = [
    {
      id: 'doc',
      title: 'DOCTOR APPOINTMENT',
      subtitle: 'Book with Specialist Doctors',
      icon: UserCheck,
      color: 'bg-blue-600',
      modal: 'book_appointment' as const
    },
    {
      id: 'hosp',
      title: 'HOSPITAL GUIDANCE',
      subtitle: 'Find the Right Hospital',
      icon: Building2,
      color: 'bg-emerald-600',
      modal: 'find_hospitals' as const
    },
    {
      id: 'emerg',
      title: 'EMERGENCY SUPPORT',
      subtitle: '24x7 Emergency Assistance',
      icon: PhoneCall,
      color: 'bg-red-600',
      modal: 'emergency_help' as const
    },
    {
      id: 'lab',
      title: 'LAB TEST BOOKING',
      subtitle: 'Book Lab Tests & Packages',
      icon: TestTube,
      color: 'bg-indigo-600',
      modal: 'book_lab_test' as const
    },
    {
      id: 'amb',
      title: 'AMBULANCE SERVICE',
      subtitle: 'Quick Ambulance Support',
      icon: Ambulance,
      color: 'bg-amber-600',
      modal: 'ambulance_booking' as const
    },
    {
      id: 'home',
      title: 'HOME CARE SERVICE',
      subtitle: 'Elderly & Patient Home Care',
      icon: HeartHandshake,
      color: 'bg-teal-600',
      modal: 'home_service' as const
    },
    {
      id: 'camps',
      title: 'HEALTH CAMPS & AWARENESS',
      subtitle: 'Camps, Checkups & Awareness Programs',
      icon: Tent,
      color: 'bg-cyan-600',
      modal: 'health_camps' as const
    },
    {
      id: 'member',
      title: 'MEMBERSHIP PROGRAM',
      subtitle: 'Exclusive Benefits for Members',
      icon: CreditCard,
      color: 'bg-purple-600',
      modal: 'become_member' as const
    }
  ];

  return (
    <section id="section-services" className="py-6 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: 8 Quick Service Icons Grid (9 Cols) */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {serviceCards.map((card) => {
              const IconComp = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => onOpenModal(card.modal)}
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-3.5 flex flex-col items-center text-center justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out group cursor-pointer hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-full ${card.color} text-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200 mb-2`}>
                    <IconComp className="w-6 h-6 transition-transform duration-200 group-hover:rotate-3" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#0f2e5a] uppercase group-hover:text-emerald-700 transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <span>Explore</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Call Centre Support Widget (3 Cols) */}
          <div className="lg:col-span-3 bg-gradient-to-b from-slate-900 to-[#0b1b3d] text-white rounded-xl p-4 shadow-lg border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    CALL CENTRE SUPPORT
                  </span>
                </div>
                <span className="bg-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase">
                  24x7
                </span>
              </div>

              <p className="text-[11px] font-medium text-slate-300">
                Our Patient Support Team is always ready to help you.
              </p>

              <div className="space-y-1.5 text-xs font-bold pt-1">
                <a href="tel:08704210820" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>0870 4210820</span>
                </a>
                <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>9000045073</span>
                </a>
                <a href="mailto:support@ayudhvikas.com" className="flex items-center gap-2 text-[11px] hover:text-sky-400 transition-colors text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">support@ayudhvikas.com</span>
                </a>
              </div>

              <button
                onClick={() => onOpenModal('request_callback')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-2.5 rounded-lg shadow-md transition-all cursor-pointer border border-emerald-500 mt-2"
              >
                REQUEST CALL BACK
              </button>
            </div>

            {/* Support Representative Photo overlay */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
              <img
                src="/src/assets/images/support_agent_female_1785560510481.jpg"
                alt="Support Agent"
                className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-[10px]">
                <div className="font-extrabold text-slate-100">Ayudh Helpline Assistant</div>
                <div className="text-emerald-400 font-semibold">Online & Ready to Assist</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
