import React, { useState } from 'react';
import { Search, MapPin, Stethoscope, Filter, ArrowRight } from 'lucide-react';
import { DISTRICTS, LOCATIONS_BY_DISTRICT, SPECIALITIES } from '../data/mockData';
import { ActiveModal } from '../types';

interface SearchSectionProps {
  onSearchSubmit: (filters: { lookingFor: string; speciality: string; district: string; location: string }) => void;
  onOpenModal: (modal: ActiveModal) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ onSearchSubmit, onOpenModal }) => {
  const [lookingFor, setLookingFor] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [district, setDistrict] = useState('');
  const [location, setLocation] = useState('');

  const popularTags = [
    'Cardiologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'Gynecologist',
    'Diagnostic Tests',
    'Ambulance',
    'Eye Specialist'
  ];

  const handleTagClick = (tag: string) => {
    setSpeciality(tag);
    if (tag === 'Ambulance') {
      setLookingFor('Ambulance');
    } else if (tag === 'Diagnostic Tests') {
      setLookingFor('Diagnostic Lab');
    } else {
      setLookingFor('Doctor');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit({ lookingFor, speciality, district, location });
    if (lookingFor === 'Hospital') onOpenModal('find_hospitals');
    else if (lookingFor === 'Diagnostic Lab') onOpenModal('book_lab_test');
    else if (lookingFor === 'Ambulance') onOpenModal('ambulance_booking');
    else if (lookingFor === 'Home Care') onOpenModal('home_service');
    else if (lookingFor === 'Health Camp') onOpenModal('health_camps');
    else onOpenModal('book_appointment');
  };

  const availableLocations = district && LOCATIONS_BY_DISTRICT[district]
    ? LOCATIONS_BY_DISTRICT[district]
    : Object.values(LOCATIONS_BY_DISTRICT).flat();

  return (
    <div id="section-search" className="bg-[#0b1b3d] text-white py-4 px-4 sm:px-8 border-y-2 border-amber-500 shadow-md">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Title */}
        <div className="text-center">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-white flex items-center justify-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            FIND & BOOK HEALTHCARE SERVICES
          </h2>
        </div>

        {/* Filter Inputs Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
          
          {/* Dropdown 1: I am looking for */}
          <div className="relative">
            <select
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs font-semibold px-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">I am looking for...</option>
              <option value="Doctor">Doctor</option>
              <option value="Hospital">Hospital</option>
              <option value="Diagnostic Lab">Diagnostic Lab</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Home Care">Home Care</option>
              <option value="Health Camp">Health Camp</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              ▼
            </div>
          </div>

          {/* Dropdown 2: Speciality / Service */}
          <div className="relative">
            <select
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs font-semibold px-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">Speciality / Service</option>
              {SPECIALITIES.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              ▼
            </div>
          </div>

          {/* Dropdown 3: Select District */}
          <div className="relative">
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setLocation('');
              }}
              className="w-full bg-white text-slate-800 text-xs font-semibold px-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">Select District</option>
              {DISTRICTS.map((dist, idx) => (
                <option key={idx} value={dist}>{dist}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              ▼
            </div>
          </div>

          {/* Dropdown 4: Select Location */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs font-semibold px-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">Select Location</option>
              {availableLocations.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              ▼
            </div>
          </div>

          {/* Search Action Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-emerald-500"
            >
              <Search className="w-4 h-4" />
              <span>SEARCH NOW</span>
            </button>
          </div>

        </form>

        {/* Popular Searches Tags Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800">
          <span className="font-extrabold text-amber-400 uppercase text-[11px]">Popular Searches :</span>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
            {popularTags.map((tag, idx) => (
              <React.Fragment key={tag}>
                <button
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`hover:text-emerald-300 hover:underline transition-colors ${
                    speciality === tag ? 'text-amber-300 font-bold underline' : ''
                  }`}
                >
                  {tag}
                </button>
                {idx < popularTags.length - 1 && <span className="text-slate-600">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
