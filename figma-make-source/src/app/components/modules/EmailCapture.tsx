import { useState } from 'react';
import { ArrowRight, Check, Shield, Clock, Zap } from 'lucide-react';
import { SocialProof } from './SocialProof';

/*
 * SUPABASE INTEGRATION — EmailCapture.tsx
 * ──────────────────────────────────────────────────────────────
 *
 * This component appears in: CTASection, ArticleDetail (end-of-article),
 * ArticleFeed sidebar, StickyConversionBar, and the footer newsletter.
 *
 * TABLE:
 *   newsletter_subscribers
 *   ─────────────────────────────────────────────────────────────
 *   id            uuid        PK, default gen_random_uuid()
 *   email         text        UNIQUE, NOT NULL
 *   source        text        — 'cta' | 'article' | 'footer' | 'sticky_bar' | 'sidebar'
 *   subscribed_at timestamptz default now()
 *   confirmed     boolean     default false (for double opt-in)
 *   unsubscribed  boolean     default false
 *
 * RLS:
 *   — INSERT: allow anon (public signup)
 *   — SELECT/UPDATE/DELETE: admin only
 *
 * HANDLER — replace the current handleSubmit:
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     if (!email.includes('@')) return;
 *     setSubmitting(true);
 *     const { error } = await supabase
 *       .from('newsletter_subscribers')
 *       .upsert({ email, source }, { onConflict: 'email' });
 *     setSubmitting(false);
 *     if (!error) setSubmitted(true);
 *   };
 *
 * PROPS TO ADD:
 *   source?: string — pass 'article' | 'cta' | 'footer' etc. so
 *   you know where signups come from in your admin dashboard.
 *
 * DOUBLE OPT-IN (recommended):
 *   After insert, trigger a Supabase Edge Function that sends a
 *   confirmation email via Resend/SendGrid. On click, set
 *   confirmed = true. Only export confirmed subscribers.
 *
 * ADMIN PORTAL:
 *   — View subscriber list with source breakdown
 *   — Export CSV for email platform import
 *   — Unsubscribe management
 * ──────────────────────────────────────────────────────────────
 */

interface EmailCaptureProps {
  dark?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  showTrust?: boolean;
  showSocialProof?: boolean;
  compact?: boolean;
  source?: string;
}

export function EmailCapture({
  dark = true,
  placeholder = 'Your professional email',
  buttonLabel = 'Request Access',
  showTrust = true,
  showSocialProof = true,
  compact = false,
  source = 'cta',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  /*
   * SUPABASE SWAP: Replace this mock handler with the real Supabase call
   * shown in the integration notes above. Add a `submitting` loading state.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubmitted(true);
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
      {/* Email form */}
      <form onSubmit={handleSubmit} className={`flex ${compact ? 'gap-2' : 'flex-col sm:flex-row gap-3'}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className={`${compact ? 'h-10 px-3 text-sm flex-1 min-w-0' : 'h-12 px-4 text-sm flex-1'} rounded-xl bg-white/10 border ${
            dark
              ? 'border-[#F7F5F2]/15 text-[#F7F5F2] placeholder:text-[#F7F5F2]/30 focus:border-[#F7F5F2]/30'
              : 'border-[#141418]/15 text-[#141418] placeholder:text-[#141418]/30 focus:border-[#141418]/30'
          } outline-none transition-colors`}
          style={{ backdropFilter: 'blur(8px)' }}
        />
        <button
          type="submit"
          className={`${compact ? 'btn-liquid-accent btn-liquid-sm whitespace-nowrap' : 'btn-liquid-accent btn-liquid-lg'} flex items-center justify-center gap-2 cursor-pointer`}
        >
          {buttonLabel}
          <ArrowRight className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>
      </form>

      {/* Trust signals */}
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

      {/* Social proof */}
      {showSocialProof && (
        <div className={compact ? '' : 'flex justify-center'}>
          <SocialProof dark={dark} compact={compact} />
        </div>
      )}
    </div>
  );
}