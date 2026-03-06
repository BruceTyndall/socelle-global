import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRole?: string | string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ children, requireAdmin = false, requireRole, redirectTo }: ProtectedRouteProps) {
  const { user, loading, profileError, effectiveRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pro-stone">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pro-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pro-warm-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo || '/portal/login'} state={{ from: location }} replace />;
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pro-stone p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-pro-charcoal mb-2">Profile Error</h2>
          <p className="text-pro-warm-gray mb-6">{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal transition-colors font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!effectiveRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pro-stone p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-pro-charcoal mb-2">Role Missing</h2>
          <p className="text-pro-warm-gray mb-6">
            Your account is authenticated, but no role is available. Ask an admin to verify your `user_profiles` record.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (requireAdmin && effectiveRole !== 'admin' && effectiveRole !== 'platform_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pro-stone p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-pro-charcoal mb-2">Access Denied</h2>
          <p className="text-pro-warm-gray mb-6">
            You don't have admin privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  if (requireRole) {
    const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];

    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pro-stone p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-pro-charcoal mb-2">Access Restricted</h2>
            <p className="text-pro-warm-gray mb-6">
              Your account doesn't have access to this area.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
