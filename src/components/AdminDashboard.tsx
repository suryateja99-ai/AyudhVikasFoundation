import React from 'react';
import { useLocation } from 'react-router-dom';
import { SuperAdminDashboard } from './SuperAdminDashboard';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigateHome }) => {
  const { pathname } = useLocation();
  const initialNav = pathname.includes('verify/doctors')
    ? 'Doctor Verifications'
    : pathname.includes('verify/hospitals')
      ? 'Hospital Verifications'
      : pathname.includes('/users')
        ? 'Users Management'
        : 'Dashboard';

  return <SuperAdminDashboard onLogout={onLogout} onNavigateHome={onNavigateHome} initialNav={initialNav} />;
};
