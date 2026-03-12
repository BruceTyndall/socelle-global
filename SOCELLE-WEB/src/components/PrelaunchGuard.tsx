import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const PRELAUNCH_MODE = import.meta.env.VITE_PRELAUNCH_MODE === 'true';

export function PrelaunchGuard() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-graphite">
        <div>Loading...</div>
      </div>
    );
  }

  // Pre-launch rules:
  // 1. If PRELAUNCH_MODE is false, site is open
  // 2. If user is logged in, site is open
  const isUnlocked = !PRELAUNCH_MODE || !!user;

  if (isUnlocked) {
    return <Outlet />;
  }

  // If locked, redirect to pre-launch waitlist
  // using replace to prevent back navigation issues
  return <Navigate to="/waitlist" replace />;
}
