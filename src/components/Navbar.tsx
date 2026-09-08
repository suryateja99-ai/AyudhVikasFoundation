import React, { useState } from 'react';
import { PhoneCall, ChevronDown, Menu, X, ShieldAlert, HeartPulse } from 'lucide-react';
import { ActiveModal } from '../types';

interface NavbarProps {
  onOpenModal: (modal: ActiveModal) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignInClick?: () => void;
  onPartnerClick?: () => void;
  onAmbulanceClick?: () => void;
  onLabsClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal, activeTab, setActiveTab, onSignInClick, onPartnerClick, onAmbulanceClick, onLabsClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const navItems = [
    { label: 'HOME', id: 'home' },
    { label: 'ABOUT US', id: 'about' },
    { label: 'SERVICES', id: 'services', hasDropdown: true },
    { label: 'HEALTH CAMPS', id: 'camps' },
    { label: 'MEMBERSHIP', id: 'membership' },
    { label: 'PARTNER HOSPITALS', id: 'hospitals' },
    { label: 'DOCTORS', id: 'doctors' },
    { label: 'LABS', id: 'labs' },
    { label: 'AMBULANCE', id: 'ambulance' },
    { label: 'COMMUNITY PARTNERS', id: 'community' },
    { label: 'PATIENT PORTAL', id: 'portal' },
    { label: 'CONTACT US', id: 'contact' },
  ];

  const serviceSubItems = [
    { title: 'Doctor Appointment', modal: 'book_appointment' as const },
    { title: 'Hospital Guidance', modal: 'find_hospitals' as const },
    { title: 'Emergency Support', modal: 'emergency_help' as const },
    { title: 'Lab Test Booking', modal: 'book_lab_test' as const },
    { title: 'Ambulance Service', modal: 'ambulance_booking' as const },
    { title: 'Home Care Service', modal: 'home_service' as const },
    { title: 'Health Camps & Awareness', modal: 'health_camps' as const },
    { title: 'Membership Program', modal: 'become_member' as const },
  ];

  const handleNavClick = (id: string, hasDropdown?: boolean) => {
    if (hasDropdown) {
      setServicesDropdownOpen(!servicesDropdownOpen);
      return;
    }
    if (id === 'portal' && onSignInClick) {
      onSignInClick();
      setMobileMenuOpen(false);
      return;
    }
    if (id === 'doctors') {
      onOpenModal('book_appointment');
      setMobileMenuOpen(false);
      return;
    }
    if (id === 'labs') {
      if (onLabsClick) {
        onLabsClick();
      } else {
        onOpenModal('book_lab_test');
      }
      setMobileMenuOpen(false);
      return;
    }
    if (id === 'ambulance') {
      if (onAmbulanceClick) {
        onAmbulanceClick();
      } else {
        onOpenModal('ambulance_booking');
      }
      setMobileMenuOpen(false);
      return;
    }
    if ((id === 'membership' || id === 'hospitals' || id === 'community') && onPartnerClick) {
      onPartnerClick();
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(id);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);

    // Smooth scroll to relevant section if present
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40 border-b border-slate-200">
      {/* Top Main Branding Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Foundation Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center p-2 text-emerald-700 shadow-sm group-hover:bg-emerald-100 transition-all">
            <HeartPulse className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-[#0f2e5a] tracking-tight leading-tight uppercase font-sans">
              AYUDH VIKAS
            </h1>
            <span className="text-xs sm:text-sm font-extrabold text-[#006633] tracking-wide uppercase">
              FOUNDATION
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 tracking-wider uppercase border-t border-emerald-200 mt-0.5 pt-0.5">
              CARE BEYOND BOUNDARIES
            </span>
          </div>
        </div>

        {/* Center: Health Care Network Title */}
        <div className="hidden lg:flex flex-col items-center text-center px-4">
          <div className="text-base font-extrabold text-[#0275d8] tracking-wide uppercase border-b-2 border-emerald-500 pb-0.5">
            HEALTH CARE NETWORK
          </div>
          <p className="text-xs font-semibold text-slate-600 italic mt-1">
            One Call for Complete Healthcare Support
          </p>
        </div>

        {/* Right: Emergency Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onOpenModal('emergency_help')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg px-3.5 sm:px-4 py-2 flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all border border-red-800 cursor-pointer animate-pulse"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] font-black uppercase text-red-100 tracking-wider">
                EMERGENCY
              </div>
              <div className="text-xs font-bold text-white uppercase">
                24x7 HELPLINE
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-tight">
                1800 123 4567
              </div>
            </div>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-emerald-700 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Menu Bar */}
      <nav className="bg-[#f8fafc] border-t border-slate-200 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <ul className="flex items-center justify-between text-[11px] xl:text-xs font-extrabold text-[#0f2e5a]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              if (item.hasDropdown) {
                return (
                  <li key={item.id} className="relative group py-2.5">
                    <button
                      onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                      className={`flex items-center gap-1 hover:text-emerald-700 transition-colors uppercase px-2 py-1 rounded ${
                        isActive ? 'text-emerald-700 border-b-2 border-emerald-600' : ''
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-emerald-700" />
                    </button>

                    {/* Services Dropdown */}
                    <div className="absolute left-0 top-full hidden group-hover:block w-64 bg-white shadow-xl rounded-b-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      {serviceSubItems.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onOpenModal(sub.modal);
                            setServicesDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center justify-between border-b border-slate-100 last:border-0"
                        >
                          <span>{sub.title}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Open</span>
                        </button>
                      ))}
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.id} className="py-2.5">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`hover:text-emerald-700 transition-colors uppercase px-2 py-1 rounded ${
                      isActive ? 'text-emerald-700 bg-emerald-100/60 font-black border-b-2 border-emerald-600' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}

            {/* Dedicated Highlighted Green Partner Button */}
            <li className="py-2">
              <button
                onClick={() => {
                  if (onPartnerClick) {
                    onPartnerClick();
                  } else {
                    onOpenModal('become_partner');
                  }
                }}
                className="bg-[#00703c] hover:bg-[#005830] text-white text-[11px] font-black uppercase px-3 py-1.5 rounded shadow-xs transition-all cursor-pointer"
              >
                PARTNER WITH US
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white px-4 py-4 space-y-2 border-t border-slate-800">
          <div className="text-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase">Health Care Network</span>
            <p className="text-[11px] text-slate-400">One Call for Complete Healthcare Support</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.hasDropdown)}
                className="text-left px-3 py-2 rounded bg-slate-800/80 hover:bg-emerald-600 hover:text-white transition-colors uppercase"
              >
                {item.label}
              </button>
            ))}
          </div>
          {servicesDropdownOpen && (
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-1">Service Pages</p>
              {serviceSubItems.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onOpenModal(sub.modal);
                    setServicesDropdownOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded bg-slate-800/60 hover:bg-emerald-600 text-xs font-semibold"
                >
                  {sub.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
