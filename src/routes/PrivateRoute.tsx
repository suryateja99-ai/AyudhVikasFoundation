import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  requiredRole?: string | string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 font-bold">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const have = user?.roles?.length ? user.roles : [user?.primaryRole || user?.role || ''];
    if (!roles.some((role) => have.includes(role))) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
