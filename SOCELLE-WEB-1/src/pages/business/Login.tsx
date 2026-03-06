import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface RouteState {
  from?: {
    pathname?: string;
    search?: string;
  };
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading, effectiveRole, profileError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as RouteState | null;

  useEffect(() => {
    if (!authLoading && user && effectiveRole) {
      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo');
      const from = routeState?.from;

      if (effectiveRole === 'admin' || effectiveRole === 'platform_admin') {
        navigate('/admin/brands', { replace: true });
        return;
      }

      if (effectiveRole === 'brand_admin') {
        navigate('/brand/dashboard', { replace: true });
        return;
      }

      const destination = returnTo || (from ? `${from.pathname}${from.search || ''}` : '/portal/dashboard');
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, effectiveRole, navigate, location]);

  useEffect(() => {
    if (!authLoading && user && !effectiveRole) {
      setError(profileError || 'Your account is signed in, but no role was found. Please contact support.');
    }
  }, [authLoading, user, effectiveRole, profileError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
    }
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
            <div className="w-12 h-12 bg-pro-stone rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-pro-navy" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-pro-charcoal mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-pro-warm-gray mb-6">
            Log in to access your plans and dashboard
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
                placeholder="you@business.com"
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
              className="w-full py-3 bg-pro-navy text-white font-medium rounded-lg hover:bg-pro-charcoal disabled:bg-pro-warm-gray disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-pro-warm-gray">
              Don't have an account?{' '}
              <Link to="/portal/signup" className="text-pro-navy hover:text-pro-charcoal font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
