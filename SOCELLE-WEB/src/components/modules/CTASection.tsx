import { EmailCapture } from './EmailCapture';

interface CTASectionProps {
  eyebrow?: string;
  headline: string;
  subtitle?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export function CTASection({ eyebrow, headline, subtitle, primaryCTA }: CTASectionProps) {
  return (
    <section className="bg-mn-dark py-20 lg:py-28 relative overflow-hidden">
      {/* Accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06] bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)]"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {eyebrow && <span className="text-eyebrow text-mn-bg/50 mb-6 block">{eyebrow}</span>}
        <h2 className="text-mn-bg text-section mb-4">{headline}</h2>
        {subtitle && (
          <p className="text-mn-bg/60 text-lg mb-10 max-w-xl mx-auto">{subtitle}</p>
        )}

        <EmailCapture
          dark
          buttonLabel={primaryCTA?.label || 'Request Access'}
          showTrust
          showSocialProof
        />
      </div>
    </section>
  );
}
