import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile, loading: authLoading, effectiveRole, profileError, lastAuthError } = useAuth();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!authLoading && user && effectiveRole) {
      if (effectiveRole === 'admin' || effectiveRole === 'platform_admin') {
        navigate('/admin/brands', { replace: true });
        return;
      }
      navigate('/portal/dashboard', { replace: true });
    }
  }, [user, authLoading, effectiveRole, navigate]);

  useEffect(() => {
    if (!authLoading && user && !effectiveRole) {
      setError(profileError || 'Signed in, but no role was found on your profile.');
    }
  }, [authLoading, user, effectiveRole, profileError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 bg-pro-gold rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-pro-navy" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Admin Portal
        </h1>
        <p className="text-center text-slate-400 mb-6">
          Administrator access only
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-pro-gold focus:border-pro-gold"
              placeholder="admin@naturopathica.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-pro-gold focus:border-pro-gold"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-pro-gold hover:text-pro-gold-light font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pro-gold text-pro-navy font-semibold rounded-lg hover:bg-pro-gold-light disabled:bg-pro-stone disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Access Admin Portal'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 text-center mb-2">
            This area is restricted to administrators.
          </p>
          <p className="text-xs text-slate-500 text-center">
            Don't have an admin account? First{' '}
            <Link to="/portal/signup" className="text-pro-gold hover:text-pro-gold-light">
              create a business account
            </Link>
            , then contact support to upgrade to admin.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/admin/debug-auth"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Having trouble? Debug Auth
          </Link>
        </div>

        {isDev && (
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Dev Auth Debug</p>
            <div className="space-y-1 text-xs text-slate-300">
              <p><span className="text-slate-500">User:</span> {user?.email || 'none'}</p>
              <p><span className="text-slate-500">Role:</span> {effectiveRole || 'none'}</p>
              <p><span className="text-slate-500">Profile Email:</span> {profile?.contact_email || 'none'}</p>
              <p><span className="text-slate-500">Profile Error:</span> {profileError || 'none'}</p>
              <p><span className="text-slate-500">Auth Error:</span> {lastAuthError || 'none'}</p>
              {user?.email === 'bruetyndallprofessional@gmail.com' && effectiveRole !== 'admin' && effectiveRole !== 'platform_admin' && (
                <p className="text-amber-300">
                  This email is signed in but not admin. Run `scripts/grant_bruce_admin.sql` in Supabase SQL Editor.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
