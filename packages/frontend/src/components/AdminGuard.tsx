// master-restaurante-v2/packages/frontend/src/components/AdminGuard.tsx

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
        </div>
    ); 
  }

  if (user && user.role === 'admin') {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
}