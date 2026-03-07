import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center p-4">
        <Helmet>
          <title>Password Reset Sent — Socelle</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-full max-w-md">
          <Link
            to="/portal/login"
            className="flex items-center gap-2 text-graphite/50 hover:text-graphite mb-6 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-8 border border-graphite/[0.12]">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-graphite mb-2">
              Check Your Email
            </h1>
            <p className="text-center text-graphite/50 mb-6">
              Check your email for reset instructions
            </p>

            <div className="p-4 bg-mn-surface border border-graphite/[0.12] rounded-lg">
              <p className="text-sm text-graphite">
                If you don't see the email, check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-bg flex items-center justify-center p-4">
      <Helmet>
        <title>Forgot Password — Socelle</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-graphite/50 hover:text-graphite mb-6 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-graphite/[0.12]">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-graphite/[0.06] rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-graphite mb-2">
            Reset Your Password
          </h1>
          <p className="text-center text-graphite/50 mb-6">
            Enter your email and we'll send you a reset link
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-graphite mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-graphite/[0.12] rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-mn-dark text-white font-semibold rounded-lg hover:bg-graphite disabled:bg-graphite/25 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
