import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { syncSignupToCrm } from '../../lib/crmRegistration';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface BusinessRow {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
}

export default function ClaimBusiness() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [claimDone, setClaimDone] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUp, setSignUp] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { data: queryResult, isLoading: loading } = useQuery({
    queryKey: ['claim-business', slug],
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from('businesses')
        .select('id, name, slug, verification_status')
        .eq('slug', slug!)
        .maybeSingle();
      if (e) return { business: null, error: e.message };
      if (!data) return { business: null, error: 'Business not found.' };
      const biz = data as BusinessRow;
      const err = biz.verification_status !== 'unverified'
        ? 'This business is already claimed or verified.'
        : null;
      return { business: biz, error: err };
    },
    enabled: !!slug,
  });

  const business = queryResult?.business ?? null;
  const error = claimError ?? queryResult?.error ?? null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (signUp) {
        const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!business || business.verification_status !== 'unverified') return;
    setClaiming(true);
    setClaimError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('claim_business', { p_business_id: business.id });
      const result = data as { ok?: boolean; error?: string } | null;
      if (rpcError) throw new Error(rpcError.message);
      if (result && !result.ok) throw new Error(result.error || 'Claim failed');

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser?.id) {
        await syncSignupToCrm({
          businessId: business.id,
          userId: authUser.id,
          email: authUser.email ?? email,
          source: signUp ? 'claim_business_signup' : 'claim_business_existing',
          metadata: {
            claim_slug: slug ?? null,
          },
        });
      }

      setClaimDone(true);
      setTimeout(() => navigate('/portal/claim/review', { replace: true }), 1500);
    } catch (err: unknown) {
      setClaimError(err instanceof Error ? err.message : 'Claim failed.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mn-bg flex flex-col">
        <header className="border-b border-[rgba(30,37,43,0.08)] bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-sans text-xl text-graphite font-medium tracking-tight">socelle<span className="text-accent">.</span></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </main>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-mn-bg flex flex-col">
        <header className="border-b border-[rgba(30,37,43,0.08)] bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-sans text-xl text-graphite font-medium tracking-tight">socelle<span className="text-accent">.</span></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center">
            <p className="text-graphite/60 font-sans mb-4">{error}</p>
            <Link to="/" className="text-accent font-medium hover:underline">Back to home</Link>
          </div>
        </main>
      </div>
    );
  }

  if (claimDone) {
    return (
      <div className="min-h-screen bg-mn-bg flex flex-col">
        <header className="border-b border-[rgba(30,37,43,0.08)] bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-sans text-xl text-graphite font-medium tracking-tight">socelle<span className="text-accent">.</span></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-signal-up mx-auto mb-4" />
            <h1 className="text-2xl font-sans text-graphite mb-2">Listing claimed<span className="text-accent">.</span></h1>
            <p className="text-graphite/60 font-sans">Taking you to review your listing...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-bg flex flex-col">
      <header className="border-b border-[rgba(30,37,43,0.08)] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="font-sans text-xl text-graphite font-medium tracking-tight">socelle<span className="text-accent">.</span></Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-[rgba(30,37,43,0.08)] shadow-sm p-8">
            <h1 className="text-2xl font-sans text-graphite mb-1">
              Claim your listing<span className="text-accent">.</span>
            </h1>
            <p className="text-graphite/60 font-sans text-sm mb-6">
              {business?.name} — confirm ownership to take over this salon/spa listing.
            </p>

            {!user ? (
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-graphite font-sans mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgba(30,37,43,0.12)] rounded-lg text-graphite font-sans"
                    placeholder="you@yoursalon.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite font-sans mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgba(30,37,43,0.12)] rounded-lg text-graphite font-sans"
                    placeholder={signUp ? 'At least 8 characters' : 'Your password'}
                    required
                  />
                </div>
                {authError && <p className="text-signal-down text-sm font-sans">{authError}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 btn-mineral-primary py-2 rounded-lg font-sans font-medium flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : signUp ? 'Create account' : 'Sign in'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setSignUp(!signUp); setAuthError(null); }}
                  className="text-sm text-accent hover:underline font-sans"
                >
                  {signUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </form>
            ) : (
              <>
                {error && <p className="text-signal-down text-sm font-sans mb-4">{error}</p>}
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claiming || business?.verification_status !== 'unverified'}
                  className="w-full btn-mineral-primary py-2 rounded-lg font-sans font-medium flex items-center justify-center gap-2"
                >
                  {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>Claim {business?.name} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
