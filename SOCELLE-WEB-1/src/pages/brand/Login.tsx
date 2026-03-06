import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function BrandLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading, effectiveRole, profileError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && effectiveRole) {
      if (effectiveRole === 'admin' || effectiveRole === 'platform_admin') {
        navigate('/admin/brands', { replace: true });
        return;
      }

      if (effectiveRole === 'business_user' || effectiveRole === 'spa_user') {
        navigate('/portal/dashboard', { replace: true });
        return;
      }

      navigate('/brand/dashboard', { replace: true });
    }
  }, [user, authLoading, effectiveRole, navigate]);

  useEffect(() => {
    if (!authLoading && user && !effectiveRole) {
      setError(profileError || 'Your account is signed in, but no role was found. Please contact support.');
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
    <div className="min-h-screen bg-pro-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-pro-warm-gray hover:text-pro-charcoal mb-6 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-pro-stone">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-pro-navy to-pro-charcoal rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-pro-charcoal mb-2">
            Brand Portal
          </h1>
          <p className="text-center text-pro-warm-gray mb-6">
            Manage your brand content and submissions
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pro-charcoal mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
                placeholder="brand@naturopathica.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pro-charcoal mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-pro-navy hover:text-pro-charcoal font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pro-navy text-white font-semibold rounded-lg hover:bg-pro-charcoal disabled:bg-pro-warm-gray disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Authenticating...' : 'Access Brand Portal'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-pro-ivory rounded-lg border border-pro-stone">
            <p className="text-xs text-pro-warm-gray text-center">
              Brand portal access for approved brand partners only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
