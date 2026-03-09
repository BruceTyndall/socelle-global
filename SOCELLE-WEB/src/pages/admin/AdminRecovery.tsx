/**
 * AdminRecovery — Emergency admin login page (DEV + STAGING only)
 *
 * Accessible at /admin/recovery without any auth or layout requirement.
 * Provides one-click login using env-var credentials and shows full
 * auth debug state so you can diagnose any login issue without guessing.
 *
 * In production (import.meta.env.PROD) this page renders nothing.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL as string | undefined;
const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined;

export default function AdminRecovery() {
  const { user, profile, effectiveRole, isAdmin, loading, profileError, lastAuthError, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Production guard — never render in prod
  if (import.meta.env.PROD) return null;

  const handleQuickLogin = async () => {
    if (!devEmail || !devPassword) {
      setErrorMsg('VITE_DEV_ADMIN_EMAIL or VITE_DEV_ADMIN_PASSWORD not set in .env');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    const { error } = await signIn(devEmail, devPassword);
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => navigate('/admin/brands'), 1200);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Recovery</h1>
          <p className="text-slate-400 text-sm mt-1">DEV / STAGING only — never visible in production</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-signal-warn mt-2">DEMO / DEV ONLY</p>
        </div>

        {/* Current Auth State */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-2 text-sm">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Current Auth State</p>

          <Row label="Loading" value={loading ? 'true' : 'false'} ok={!loading} />
          <Row label="User" value={user?.email ?? 'none'} ok={!!user} />
          <Row label="Role" value={effectiveRole ?? 'none'} ok={isAdmin} />
          <Row label="Is Admin" value={isAdmin ? 'YES' : 'NO'} ok={isAdmin} />
          <Row label="Profile Error" value={profileError ?? 'none'} ok={!profileError} />
          <Row label="Last Auth Error" value={lastAuthError ?? 'none'} ok={!lastAuthError} />
          <Row label="Contact Email" value={profile?.contact_email ?? 'none'} ok={!!profile?.contact_email} />
        </div>

        {/* Env Var Status */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-2 text-sm">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Env Vars (.env)</p>
          <Row label="VITE_DEV_ADMIN_EMAIL" value={devEmail ? devEmail : 'NOT SET'} ok={!!devEmail} />
          <Row label="VITE_DEV_ADMIN_PASSWORD" value={devPassword ? '••••••••' : 'NOT SET'} ok={!!devPassword} />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Quick Login */}
          {!user && (
            <button
              onClick={handleQuickLogin}
              disabled={status === 'loading' || !devEmail || !devPassword}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
              ) : status === 'success' ? (
                <><CheckCircle className="w-4 h-4" /> Logged in — redirecting...</>
              ) : (
                <>⚡ Quick Login as Admin</>
              )}
            </button>
          )}

          {/* Sign Out */}
          {user && (
            <>
              {isAdmin ? (
                <button
                  onClick={() => navigate('/admin/brands')}
                  className="w-full py-3.5 bg-signal-up/20 hover:bg-signal-up/30 border border-signal-up/40 text-green-300 font-semibold rounded-xl transition-colors"
                >
                  ✅ Already logged in as admin — Go to Admin Hub
                </button>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-sm text-red-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Signed in but role is <strong>{effectiveRole ?? 'missing'}</strong>. Not admin. Sign out and try Quick Login, or run the recovery SQL in Supabase.</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </>
          )}

          {/* Error display */}
          {status === 'error' && errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-sm text-red-300">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Recovery SQL */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Recovery SQL (run in Supabase SQL Editor)</p>
          <pre className="text-xs text-green-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
{`-- 1. Restore admin role
UPDATE public.user_profiles
SET role = 'platform_admin'
WHERE id = (SELECT id FROM auth.users
            WHERE email = '${devEmail ?? 'your-email@example.com'}');

-- 2. Reset password
UPDATE auth.users
SET encrypted_password =
  crypt('DevAdmin2026!', gen_salt('bf', 10))
WHERE email = '${devEmail ?? 'your-email@example.com'}';

-- 3. Verify
SELECT au.email, up.role,
       LEFT(au.encrypted_password, 7) AS hash
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = '${devEmail ?? 'your-email@example.com'}';`}
          </pre>
        </div>

        {/* Nav links */}
        <div className="flex gap-4 justify-center text-xs text-slate-500">
          <a href="/admin/login" className="hover:text-slate-300 transition-colors">Admin Login</a>
          <a href="/admin/debug-auth" className="hover:text-slate-300 transition-colors">Debug Auth</a>
          <a href="/" className="hover:text-slate-300 transition-colors">Home</a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-right truncate ${ok ? 'text-green-400' : 'text-red-400'}`}>{value}</span>
    </div>
  );
}
