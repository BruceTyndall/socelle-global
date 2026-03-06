import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  verification_status: string;
}

export default function ClaimBrand() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimDone, setClaimDone] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUp, setSignUp] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: e } = await supabase
        .from('brands')
        .select('id, name, slug, verification_status')
        .eq('slug', slug)
        .maybeSingle();
      if (e) {
        setError(e.message);
        setBrand(null);
      } else if (!data) {
        setError('Brand not found.');
        setBrand(null);
      } else {
        setBrand(data as BrandRow);
        if ((data as BrandRow).verification_status !== 'unverified') {
          setError('This brand is already claimed or verified.');
        }
      }
      setLoading(false);
    })();
  }, [slug]);

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
    if (!brand || brand.verification_status !== 'unverified') return;
    setClaiming(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('claim_brand', { p_brand_id: brand.id });
      const result = data as { ok?: boolean; error?: string } | null;
      if (rpcError) throw new Error(rpcError.message);
      if (result && !result.ok) throw new Error(result.error || 'Claim failed');
      setClaimDone(true);
      setTimeout(() => navigate('/brand/claim/review', { replace: true }), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Claim failed.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pro-ivory flex flex-col">
        <header className="border-b border-pro-stone bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-serif text-xl text-pro-navy">socelle<span className="text-pro-gold">.</span></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <Loader2 className="w-8 h-8 text-pro-gold animate-spin" />
        </main>
      </div>
    );
  }

  if (error && !brand) {
    return (
      <div className="min-h-screen bg-pro-ivory flex flex-col">
        <header className="border-b border-pro-stone bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-serif text-xl text-pro-navy">socelle<span className="text-pro-gold">.</span></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center">
            <p className="text-pro-warm-gray font-sans mb-4">{error}</p>
            <Link to="/brands" className="text-pro-gold font-medium hover:underline">Browse brands</Link>
          </div>
        </main>
      </div>
    );
  }

  if (claimDone) {
    return (
      <div className="min-h-screen bg-pro-ivory flex flex-col">
        <header className="border-b border-pro-stone bg-white">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-serif text-xl text-pro-navy">socelle<span className="text-pro-gold">.</span></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif text-pro-navy mb-2">Page claimed<span className="text-pro-gold">.</span></h1>
            <p className="text-pro-warm-gray font-sans">Taking you to review your seed content…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pro-ivory flex flex-col">
      <header className="border-b border-pro-stone bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="font-serif text-xl text-pro-navy">socelle<span className="text-pro-gold">.</span></Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-pro-stone shadow-sm p-8">
            <h1 className="text-2xl font-serif text-pro-navy mb-1">
              Claim your page<span className="text-pro-gold">.</span>
            </h1>
            <p className="text-pro-warm-gray font-sans text-sm mb-6">
              {brand?.name} — confirm ownership to take over this listing.
            </p>

            {!user ? (
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-pro-stone rounded-lg text-pro-charcoal font-sans"
                    placeholder="you@yourbrand.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-pro-stone rounded-lg text-pro-charcoal font-sans"
                    placeholder={signUp ? 'At least 8 characters' : 'Your password'}
                    required
                  />
                </div>
                {authError && <p className="text-red-600 text-sm font-sans">{authError}</p>}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 btn-gold py-2 rounded-lg font-sans font-medium flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : signUp ? 'Create account' : 'Sign in'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setSignUp(!signUp); setAuthError(null); }}
                  className="text-sm text-pro-gold hover:underline font-sans"
                >
                  {signUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </form>
            ) : (
              <>
                {error && <p className="text-red-600 text-sm font-sans mb-4">{error}</p>}
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claiming || brand?.verification_status !== 'unverified'}
                  className="w-full btn-gold py-2 rounded-lg font-sans font-medium flex items-center justify-center gap-2"
                >
                  {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>Claim {brand?.name} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </>
            )}
          </div>
          <p className="text-center text-pro-warm-gray text-sm font-sans mt-6">
            <Link to={`/brands/${slug}`} className="text-pro-gold hover:underline">Back to brand page</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
