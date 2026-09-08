import React from 'react';
import { 
  HeartPulse, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Share2 
} from 'lucide-react';
import { ActiveModal } from '../types';

interface FooterProps {
  onOpenModal: (modal: ActiveModal) => void;
  setActiveTab: (tab: string) => void;
  onSignInClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal, setActiveTab, onSignInClick }) => {
  return (
    <footer className="bg-[#070f21] text-slate-300 text-xs border-t border-slate-800">
      
      {/* Upper Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          
          {/* Col 1: Foundation Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-sm text-white uppercase tracking-tight">
                  AYUDH VIKAS FOUNDATION
                </div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase">
                  CARE BEYOND BOUNDARIES
                </div>
                <div className="text-[10px] font-semibold text-sky-400 uppercase">
                  HEALTH CARE NETWORK
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              We are committed to provide accessible, affordable and quality healthcare support by connecting patients to the right medical services across Telangana.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-pink-600 text-white flex items-center justify-center transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: QUICK LINKS */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-xs border-b border-slate-800 pb-1.5 text-amber-400">
              QUICK LINKS
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-emerald-400 transition-colors">About Us</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-emerald-400 transition-colors">Services</button></li>
              <li><button onClick={() => setActiveTab('hospitals')} className="hover:text-emerald-400 transition-colors">Partner Hospitals</button></li>
              <li><button onClick={() => setActiveTab('doctors')} className="hover:text-emerald-400 transition-colors">Doctors</button></li>
              <li><button onClick={() => setActiveTab('camps')} className="hover:text-emerald-400 transition-colors">Health Camps</button></li>
              <li><button onClick={() => setActiveTab('membership')} className="hover:text-emerald-400 transition-colors">Membership</button></li>
              <li><button onClick={() => setActiveTab('community')} className="hover:text-emerald-400 transition-colors">Community Partners</button></li>
              <li><button onClick={() => { if (onSignInClick) onSignInClick(); else onOpenModal('patient_portal'); }} className="hover:text-emerald-400 transition-colors">Patient Portal</button></li>
              <li><button onClick={() => setActiveTab('contact')} className="hover:text-emerald-400 transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* Col 3: PATIENTS */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-xs border-b border-slate-800 pb-1.5 text-amber-400">
              PATIENTS
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => onOpenModal('register_patient')} className="hover:text-emerald-400 transition-colors">Register as Patient</button></li>
              <li><button onClick={() => onOpenModal('book_appointment')} className="hover:text-emerald-400 transition-colors">Book Appointment</button></li>
              <li><button onClick={() => onOpenModal('emergency_help')} className="hover:text-emerald-400 transition-colors">Emergency Support</button></li>
              <li><button onClick={() => onOpenModal('book_lab_test')} className="hover:text-emerald-400 transition-colors">Lab Test Booking</button></li>
              <li><button onClick={() => onOpenModal('ambulance_booking')} className="hover:text-emerald-400 transition-colors">Ambulance Request</button></li>
              <li><button onClick={() => { if (onSignInClick) onSignInClick(); else onOpenModal('patient_portal'); }} className="hover:text-emerald-400 transition-colors">Patient Login</button></li>
              <li><button onClick={() => onOpenModal('become_member')} className="hover:text-emerald-400 transition-colors">Membership Plans</button></li>
              <li><button onClick={() => setActiveTab('contact')} className="hover:text-emerald-400 transition-colors">FAQs</button></li>
            </ul>
          </div>

          {/* Col 4: PARTNERS */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-xs border-b border-slate-800 pb-1.5 text-amber-400">
              PARTNERS
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => onOpenModal('become_partner')} className="hover:text-emerald-400 transition-colors">Hospital Partner</button></li>
              <li><button onClick={() => onOpenModal('become_partner')} className="hover:text-emerald-400 transition-colors">Doctor Partner</button></li>
              <li><button onClick={() => onOpenModal('become_partner')} className="hover:text-emerald-400 transition-colors">Lab Partner</button></li>
              <li><button onClick={() => onOpenModal('become_partner')} className="hover:text-emerald-400 transition-colors">Ambulance Partner</button></li>
              <li><button onClick={() => onOpenModal('become_partner')} className="hover:text-emerald-400 transition-colors">Community Partner</button></li>
              <li><button onClick={() => { if (onSignInClick) onSignInClick(); else onOpenModal('patient_portal'); }} className="hover:text-emerald-400 transition-colors">Partner Login</button></li>
              <li><button onClick={() => onOpenModal('become_partner')} className="hover:text-emerald-400 transition-colors">Partner Registration</button></li>
            </ul>
          </div>

          {/* Col 5: CONTACT US */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase text-xs border-b border-slate-800 pb-1.5 text-amber-400">
              CONTACT US
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>KM Complex, Hunter Road, Near Opp - Kasamjanatha Sale, Warangal, Telangana - 506001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:08704210820" className="hover:underline font-bold">0870 4210820</a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="https://wa.me/919000045073" target="_blank" rel="noreferrer" className="hover:underline font-bold text-emerald-400">9000045073</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <a href="mailto:support@ayudhvikas.com" className="hover:underline">support@ayudhvikas.com</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#030814] py-3 px-4 text-center text-[11px] font-semibold text-slate-500 border-t border-slate-900">
        © 2025 Ayudh Vikas Foundation - Health Care Network. All Rights Reserved.
      </div>

    </footer>
  );
};
