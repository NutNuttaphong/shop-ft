import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { UserRole } from '../roles';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-slate-600">กำลังตรวจสอบสิทธิ์การใช้งาน...</p>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but unauthorized
  if (!allowedRoles.includes(user.role)) {
    // Redirect to their default page based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'user') {
      return <Navigate to="/products" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 3. Authorized
  return <>{children}</>;
};
