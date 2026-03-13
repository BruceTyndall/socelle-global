import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { lazy, Suspense } from 'react';

const PublicHome = lazy(() => import('../pages/public/Home'));

export default function AuthAwareHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-interactive border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-interactive border-t-transparent" />
        </div>
      }
    >
      <PublicHome />
    </Suspense>
  );
}
