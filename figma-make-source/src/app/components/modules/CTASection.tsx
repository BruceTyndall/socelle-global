import { EmailCapture } from './EmailCapture';

interface CTASectionProps {
  eyebrow?: string;
  headline: string;
  subtitle?: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export function CTASection({ eyebrow, headline, subtitle, primaryCTA, secondaryCTA }: CTASectionProps) {
  return (
    <section className="bg-[#1F2428] py-20 lg:py-28 relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #3F5465 0%, transparent 70%)' }}
      />
      {/* Secondary glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #3F5465 0%, transparent 70%)' }}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {eyebrow && <span className="eyebrow text-[#F7F5F2]/50 mb-6 block">{eyebrow}</span>}
        <h2 className="text-[#F7F5F2] text-3xl lg:text-6xl mb-4">{headline}</h2>
        {subtitle && (
          <p className="text-[#F7F5F2]/60 text-lg mb-10 max-w-xl mx-auto">{subtitle}</p>
        )}

        {/* Email capture replaces dead-link buttons */}
        <EmailCapture
          dark
          buttonLabel={primaryCTA.label}
          showTrust
          showSocialProof
        />
      </div>
    </section>
  );
}
