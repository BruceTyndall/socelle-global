import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OnboardingRoleValue } from './OnboardingRole';
import type { InterestValue } from './OnboardingInterests';

const ROLE_LABELS: Record<OnboardingRoleValue, string> = {
  operator: 'Operator',
  provider: 'Provider',
  brand: 'Brand',
  student: 'Student',
};

const INTEREST_LABELS: Record<InterestValue, string> = {
  market_intelligence: 'Market Intelligence',
  treatment_trends: 'Treatment Trends',
  ingredient_research: 'Ingredient Research',
  competitive_analysis: 'Competitive Analysis',
  revenue_optimization: 'Revenue Optimization',
  education_ce: 'Education & CE Credits',
  staff_training: 'Staff Training',
  client_retention: 'Client Retention',
};

interface OnboardingCompleteProps {
  role: OnboardingRoleValue | null;
  interests: InterestValue[];
  onFinish: () => void;
}

export default function OnboardingComplete({
  role,
  interests,
  onFinish,
}: OnboardingCompleteProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">
          You&apos;re all set!
        </h1>
        <p className="text-graphite/60 text-base max-w-sm mx-auto">
          Your intelligence feed is ready. Here&apos;s what we configured:
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4 text-left">
        {role && (
          <div className="bg-white border border-graphite/10 rounded-xl p-4">
            <p className="text-xs font-medium text-graphite/50 uppercase tracking-wide mb-1">
              Role
            </p>
            <p className="text-graphite font-medium">{ROLE_LABELS[role]}</p>
          </div>
        )}
        {interests.length > 0 && (
          <div className="bg-white border border-graphite/10 rounded-xl p-4">
            <p className="text-xs font-medium text-graphite/50 uppercase tracking-wide mb-2">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs font-medium bg-accent-soft text-accent px-2.5 py-1 rounded-full"
                >
                  {INTEREST_LABELS[interest]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
        <Link
          to="/portal/intelligence"
          onClick={onFinish}
          className="w-full text-center bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Go to Intelligence Hub
        </Link>
        <Link
          to="/portal/dashboard"
          onClick={onFinish}
          className="w-full text-center border border-graphite/15 text-graphite hover:bg-graphite/5 font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Explore Dashboard
        </Link>
      </div>
    </div>
  );
}
