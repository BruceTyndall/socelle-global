import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('spa');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interestBrandId = searchParams.get('interest');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, businessName, 'business_user', businessType);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // ── Wire Express Interest signal if arriving from a brand storefront ──
      if (interestBrandId) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const { data: biz } = await supabase
              .from('businesses')
              .select('id')
              .eq('created_by_user_id', currentUser.id)
              .single();

            if (biz?.id) {
              await supabase
                .from('brand_interest_signals')
                .upsert(
                  {
                    brand_id:    interestBrandId,
                    business_id: biz.id,
                    user_id:     currentUser.id,
                    signal_type: 'express_interest',
                  },
                  { onConflict: 'brand_id,business_id,signal_type', ignoreDuplicates: true }
                );
            }
          }
        } catch {
          // Non-fatal — signal write failure should not block navigation
        }
      }
      navigate('/portal/dashboard');
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
              <UserPlus className="w-6 h-6 text-pro-navy" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-pro-charcoal mb-2">
            Create Your Account
          </h1>
          <p className="text-center text-pro-warm-gray mb-6">
            Start exploring professional brands today
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-pro-charcoal mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-pro-charcoal mb-2">
                Business Type
              </label>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
              >
                <option value="spa">Spa</option>
                <option value="salon">Salon</option>
                <option value="barbershop">Barbershop</option>
                <option value="medspa">MedSpa</option>
                <option value="other">Other</option>
              </select>
            </div>

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
              {/* Password strength indicator */}
              {password.length > 0 && (() => {
                const len = password.length;
                const hasUpper = /[A-Z]/.test(password);
                const hasNumber = /\d/.test(password);
                const hasSpecial = /[^A-Za-z0-9]/.test(password);
                const score = (len >= 8 ? 1 : 0) + (len >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
                const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
                const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500', 'bg-pro-navy'];
                const textColors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-pro-navy'];
                return (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-pro-stone'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${textColors[score]}`}>
                      {labels[score]}
                      {score < 3 && ' — add numbers, symbols, or uppercase letters'}
                    </p>
                  </div>
                );
              })()}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pro-navy text-white font-medium rounded-lg hover:bg-pro-charcoal disabled:bg-pro-warm-gray disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-pro-warm-gray">
              Already have an account?{' '}
              <Link to="/portal/login" className="text-pro-navy hover:text-pro-charcoal font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
