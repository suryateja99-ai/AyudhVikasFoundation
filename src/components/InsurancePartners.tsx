import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { INSURANCE_PARTNERS } from '../data/mockData';

export const InsurancePartners: React.FC = () => {
  const [scrollIdx, setScrollIdx] = useState(0);

  const prev = () => {
    setScrollIdx((prev) => (prev === 0 ? INSURANCE_PARTNERS.length - 1 : prev - 1));
  };

  const next = () => {
    setScrollIdx((prev) => (prev === INSURANCE_PARTNERS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-6 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto space-y-3">
        
        <div className="text-center">
          <h3 className="text-xs sm:text-sm font-black uppercase text-[#0f2e5a] tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            OUR INSURANCE PARTNERS
          </h3>
        </div>

        <div className="relative flex items-center">
          
          <button
            onClick={prev}
            className="p-1.5 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-500 z-10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="overflow-hidden w-full mx-2">
            <div className="flex items-center gap-3 transition-transform duration-300 py-1">
              {INSURANCE_PARTNERS.map((partner, idx) => (
                <div
                  key={idx}
                  className={`shrink-0 bg-white border-2 ${partner.color} px-4 py-2 rounded-lg text-xs font-black shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{partner.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            className="p-1.5 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-500 z-10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

      </div>
    </section>
  );
};
