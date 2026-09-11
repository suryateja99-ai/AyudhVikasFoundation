import React, { useState } from 'react';
import { PhoneCall, ChevronDown, Menu, X, UserCheck, UserPlus } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
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
      <div className="w-full px-4 sm:px-8 lg:px-14 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Foundation Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <BrandLogo className="w-11 h-11 sm:w-12 sm:h-12 shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <h1 className="text-lg sm:text-2xl font-black text-[#0f2e5a] leading-none uppercase font-sans">
                AYUDH VIKAS
              </h1>
              <span className="text-lg sm:text-2xl font-black text-[#006633] leading-none uppercase">
                FOUNDATION
              </span>
              <span className="hidden sm:inline text-slate-300 font-black">|</span>
              <span className="hidden sm:inline text-[11px] font-black text-emerald-700 uppercase tracking-wide">
                Healthcare Support
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wide mt-1">
              Care Beyond Boundaries
            </span>
          </div>
        </div>

        {/* Center: Health Care Network Title */}
        <div className="hidden lg:flex flex-col items-center text-center px-4 flex-1">
          <div className="text-2xl xl:text-3xl font-black text-[#0870cf] tracking-[0.08em] uppercase border-b-2 border-emerald-500 pb-0.5 leading-none">
            HEALTH CARE NETWORK
          </div>
          <p className="text-xs xl:text-sm font-black text-slate-600 italic mt-2">
            One Call for Complete Healthcare Support
          </p>
        </div>

        {/* Right: Auth + Emergency Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (onSignInClick) {
                onSignInClick();
              } else {
                onOpenModal('patient_portal');
              }
            }}
            className="hidden md:flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-black text-[#0f2e5a] shadow-sm hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => onOpenModal('register_patient')}
            className="hidden md:flex items-center gap-2 rounded-md border border-emerald-700 bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Now</span>
          </button>
          <button
            onClick={() => onOpenModal('emergency_help')}
            className="bg-[#f0505d] hover:bg-red-600 text-white rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all border border-red-500 cursor-pointer"
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
              <div className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-tight">
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
        <div className="w-full px-4 sm:px-8 lg:px-14">
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
