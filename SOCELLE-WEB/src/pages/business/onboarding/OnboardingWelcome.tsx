import { ArrowRight } from 'lucide-react';

interface OnboardingWelcomeProps {
  userName: string | null;
  onNext: () => void;
}

export default function OnboardingWelcome({ userName, onNext }: OnboardingWelcomeProps) {
  const displayName = userName ?? 'there';

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">
          Welcome to SOCELLE{displayName !== 'there' ? `, ${displayName}` : ''}
        </h1>
        <p className="text-graphite/70 text-lg max-w-md mx-auto leading-relaxed">
          Intelligence-first platform for beauty and medspa professionals.
          Market signals, treatment trends, and revenue intelligence — built for
          licensed pros.
        </p>
      </div>

      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-8 py-3 rounded-lg transition-colors"
      >
        Let&apos;s get started
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
