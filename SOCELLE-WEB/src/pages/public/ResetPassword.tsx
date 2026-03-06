import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    // Listen for auth state changes (e.g. from magic link/recovery link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
        setHasSession(true);
        setError('');
        setCheckingSession(false);
      } else if (event === 'SIGNED_OUT') {
        setHasSession(false);
        setCheckingSession(false);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true);
        setCheckingSession(false);
      } else {
        // Give a small grace period for the auth state change to fire if it's pending
        // but if no session is found after a short delay, show error
        setTimeout(() => {
          setCheckingSession(false);
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/portal/login');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center p-4">
        <Helmet><title>Password Updated — Socelle</title></Helmet>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-[rgba(20,20,24,0.12)]">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-graphite mb-2">
              Password Updated
            </h1>
            <p className="text-center text-[rgba(20,20,24,0.52)] mb-6">
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-bg flex items-center justify-center p-4">
      <Helmet><title>Reset Password — Socelle</title></Helmet>
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-[rgba(20,20,24,0.52)] hover:text-graphite mb-6 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-[rgba(20,20,24,0.12)]">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[rgba(20,20,24,0.06)] rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-graphite mb-2">
            Set New Password
          </h1>
          <p className="text-center text-[rgba(20,20,24,0.52)] mb-6">
            Enter your new password below
          </p>
          {checkingSession && (
             <div className="mb-6 flex justify-center">
               <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
             </div>
          )}

          {!checkingSession && !hasSession && !error && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-red-700">
                 Invalid or expired reset link. Please request a new one.
               </p>
             </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-graphite mb-2">
                Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={!hasSession}
                className="w-full px-4 py-2 border border-[rgba(20,20,24,0.12)] rounded-lg focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-mn-surface"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-graphite mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!hasSession}
                className="w-full px-4 py-2 border border-[rgba(20,20,24,0.12)] rounded-lg focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-mn-surface"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !hasSession}
              className="w-full py-3 bg-mn-dark text-white font-semibold rounded-lg hover:bg-graphite disabled:bg-[rgba(20,20,24,0.25)] disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
