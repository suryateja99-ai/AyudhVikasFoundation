import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { roleHome } from '../lib/roleRoutes';
import { ChevronDown } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user || !user.roles || user.roles.length <= 1) return null;

  const handleSwitch = async (role: UserRole) => {
    await switchRole(role);
    setOpen(false);
    navigate(roleHome(role));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-amber-300 hover:text-white cursor-pointer"
      >
        {user.primaryRole || user.role}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white text-slate-800 shadow-lg rounded-lg border border-slate-200 z-50 overflow-hidden">
          {user.roles.map((role) => (
            <button
              key={role}
              onClick={() => handleSwitch(role)}
              className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-emerald-50 cursor-pointer ${
                (user.primaryRole || user.role) === role ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
