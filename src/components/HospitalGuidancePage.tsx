import React from 'react';
import { ChevronRight, Building2 } from 'lucide-react';
import { ActiveModal } from '../types';
import { HospitalSearchVisitSection } from './HospitalSearchVisitSection';

interface HospitalGuidancePageProps {
  onBackToHome: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  userProfile?: {
    name: string;
    phone: string;
    patientId?: string;
    age?: string | number;
    gender?: string;
    bloodGroup?: string;
  };
}

export const HospitalGuidancePage: React.FC<HospitalGuidancePageProps> = ({
  onBackToHome,
  onOpenModal,
  userProfile
}) => {
  return (
    <section className="py-6 px-4 sm:px-8 bg-[#f3f5f8]">
      <div className="max-w-7xl mx-auto space-y-5">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={onBackToHome} className="hover:text-emerald-700 cursor-pointer">Services</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-700 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Hospital Guidance
          </span>
        </nav>

        <HospitalSearchVisitSection
          userProfile={userProfile}
          onOpenModal={onOpenModal}
        />
      </div>
    </section>
  );
};
