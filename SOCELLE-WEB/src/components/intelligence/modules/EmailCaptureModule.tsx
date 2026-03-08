// ── EmailCaptureModule — V2-INTEL-01 ─────────────────────────────────
// Wrapper: renders email capture form.
// Wired to Supabase newsletter_subscribers table if it exists.
// Falls back to local state if table is missing.

import { useState } from 'react';
import { ArrowRight, Check, Shield, Clock, Zap } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { SocialProofModule } from './SocialProofModule';

interface EmailCaptureModuleProps {
  dark?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  showTrust?: boolean;
  showSocialProof?: boolean;
  compact?: boolean;
  source?: string;
}

export function EmailCaptureModule({
  dark = true,
  placeholder = 'Your professional email',
  buttonLabel = 'Request Access',
  showTrust = true,
  showSocialProof = true,
  compact = false,
  source = 'cta',
}: EmailCaptureModuleProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .upsert({ email, source }, { onConflict: 'email' });
        if (!error) {
          setSubmitted(true);
        }
      } else {
        // Fallback: just show success (no DB)
        setSubmitted(true);
      }
    } catch {
      // If table doesn't exist, still show success to user
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`${compact ? 'py-3' : 'py-6'} text-center`}>
        <div className={`flex items-center justify-center gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
          <div className="w-8 h-8 rounded-full bg-[#5F8A72]/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-[#5F8A72]" />
          </div>
          <span className={`${dark ? 'text-[#F7F5F2]' : 'text-[#141418]'} ${compact ? 'text-sm' : 'text-lg'}`}>
            You're on the list.
          </span>
        </div>
        <p className={`${dark ? 'text-[#F7F5F2]/50' : 'text-[#141418]/50'} text-sm`}>
          Applications are reviewed every Friday. We'll be in touch.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-5'}>
      <form onSubmit={handleSubmit} className={`flex ${compact ? 'gap-2' : 'flex-col sm:flex-row gap-3'}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={submitting}
          className={`${compact ? 'h-10 px-3 text-sm flex-1 min-w-0' : 'h-12 px-4 text-sm flex-1'} rounded-xl bg-white/10 border ${
            dark
              ? 'border-[#F7F5F2]/15 text-[#F7F5F2] placeholder:text-[#F7F5F2]/30 focus:border-[#F7F5F2]/30'
              : 'border-[#141418]/15 text-[#141418] placeholder:text-[#141418]/30 focus:border-[#141418]/30'
          } outline-none transition-colors disabled:opacity-50`}
          style={{ backdropFilter: 'blur(8px)' }}
        />
        <button
          type="submit"
          disabled={submitting}
          className={`${compact ? 'btn-liquid-accent btn-liquid-sm whitespace-nowrap' : 'btn-liquid-accent btn-liquid-lg'} flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
        >
          {submitting ? 'Submitting...' : buttonLabel}
          {!submitting && <ArrowRight className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
        </button>
      </form>

      {showTrust && (
        <div className={`flex flex-wrap ${compact ? 'gap-3' : 'gap-4 sm:gap-6'} ${compact ? 'justify-start' : 'justify-center'}`}>
          {[
            { icon: Shield, label: 'No credit card required' },
            { icon: Clock, label: 'Reviewed every Friday' },
            { icon: Zap, label: 'Free for practitioners' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={`flex items-center gap-1.5 ${dark ? 'text-[#F7F5F2]/40' : 'text-[#141418]/40'} text-xs`}>
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </div>
      )}

      {showSocialProof && (
        <div className={compact ? '' : 'flex justify-center'}>
          <SocialProofModule dark={dark} compact={compact} />
        </div>
      )}
    </div>
  );
}
