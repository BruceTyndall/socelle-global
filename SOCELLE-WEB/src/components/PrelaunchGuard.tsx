import { Navigate, Outlet } from 'react-router-dom';

/**
 * PrelaunchGuard — layout route that gates all public pages during prelaunch.
 *
 * Activated by: VITE_PRELAUNCH_MODE=true (set in Cloudflare Pages env, production only).
 * Dev / local builds: VITE_PRELAUNCH_MODE is unset → guard is transparent (Outlet renders normally).
 *
 * Any route wrapped by this component will redirect to "/" when prelaunch mode is active.
 * Portal, brand, and admin routes are NOT wrapped — they are auth-protected independently
 * and must remain accessible to development agents at all times.
 */
const PRELAUNCH_MODE = import.meta.env.VITE_PRELAUNCH_MODE === 'true';

export function PrelaunchGuard() {
  if (!PRELAUNCH_MODE) return <Outlet />;
  return <Navigate to="/" replace />;
}
