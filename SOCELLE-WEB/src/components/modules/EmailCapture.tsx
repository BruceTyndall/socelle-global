import { useState } from 'react';
import { ArrowRight, Check, Shield, Clock, Zap } from 'lucide-react';
import { SocialProof } from './SocialProof';

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
  dark = false,
  placeholder = 'Enter your work email',
  buttonLabel = 'Request Access',
  showTrust = false,
  showSocialProof = false,
  compact = false,
  source = 'cta',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    // TODO: wire to Supabase newsletter_subscribers table
    console.log(`[EmailCapture] ${source}:`, email);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setEmail('');
  };

  if (submitted) {
    return (
      <div className={`flex items-center justify-center gap-3 py-4 ${dark ? 'text-signal-up' : 'text-signal-up'}`}>
        <div className="w-8 h-8 rounded-full bg-signal-up/20 flex items-center justify-center">
          <Check className="w-4 h-4" />
        </div>
        <span className="font-medium">You're on the list. We'll be in touch.</span>
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
          className={`${compact ? 'h-10 px-3 text-sm flex-1 min-w-0' : 'h-12 px-4 text-sm flex-1'} rounded-xl bg-white/10 border ${
            dark
              ? 'border-mn-bg/15 text-mn-bg placeholder:text-mn-bg/30 focus:border-mn-bg/30'
              : 'border-graphite/15 text-graphite placeholder:text-graphite/30 focus:border-graphite/30'
          } outline-none transition-colors`}
          style={{ backdropFilter: 'blur(8px)' }}
        />
        <button
          type="submit"
          className={`${compact ? 'h-10 px-4 text-sm' : 'h-12 px-6 text-sm'} rounded-xl bg-accent hover:bg-accent-hover text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap`}
        >
          {buttonLabel}
          <ArrowRight className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>
      </form>

      {showTrust && (
        <div className={`flex flex-wrap ${compact ? 'gap-3' : 'gap-4 sm:gap-6'} ${compact ? 'justify-start' : 'justify-center'}`}>
          {[
            { icon: Shield, label: 'No credit card required' },
            { icon: Clock, label: 'Setup in 2 minutes' },
            { icon: Zap, label: 'Cancel anytime' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={`flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} ${dark ? 'text-mn-bg/40' : 'text-graphite/40'}`}>
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {showSocialProof && (
        <div className={compact ? '' : 'flex justify-center'}>
          <SocialProof dark={dark} compact={compact} />
        </div>
      )}
    </div>
  );
}
