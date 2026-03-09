import {
  BarChart3,
  TrendingUp,
  FlaskConical,
  Target,
  DollarSign,
  BookOpen,
  Users,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type InterestValue =
  | 'market_intelligence'
  | 'treatment_trends'
  | 'ingredient_research'
  | 'competitive_analysis'
  | 'revenue_optimization'
  | 'education_ce'
  | 'staff_training'
  | 'client_retention';

interface InterestOption {
  value: InterestValue;
  label: string;
  icon: LucideIcon;
}

const INTERESTS: InterestOption[] = [
  { value: 'market_intelligence', label: 'Market Intelligence', icon: BarChart3 },
  { value: 'treatment_trends', label: 'Treatment Trends', icon: TrendingUp },
  { value: 'ingredient_research', label: 'Ingredient Research', icon: FlaskConical },
  { value: 'competitive_analysis', label: 'Competitive Analysis', icon: Target },
  { value: 'revenue_optimization', label: 'Revenue Optimization', icon: DollarSign },
  { value: 'education_ce', label: 'Education & CE Credits', icon: BookOpen },
  { value: 'staff_training', label: 'Staff Training', icon: Users },
  { value: 'client_retention', label: 'Client Retention', icon: Heart },
];

const MIN_SELECTIONS = 3;

interface OnboardingInterestsProps {
  selectedInterests: InterestValue[];
  onToggleInterest: (interest: InterestValue) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingInterests({
  selectedInterests,
  onToggleInterest,
  onNext,
  onBack,
}: OnboardingInterestsProps) {
  const canContinue = selectedInterests.length >= MIN_SELECTIONS;

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">
          What are you most interested in?
        </h1>
        <p className="text-graphite/60 text-base">
          Select at least {MIN_SELECTIONS} to personalize your feed.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.value);
          const Icon = interest.icon;
          return (
            <button
              key={interest.value}
              onClick={() => onToggleInterest(interest.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-graphite/70 border-graphite/10 hover:border-accent/40'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-graphite/50'}`} />
              <span className="text-xs font-medium leading-tight">{interest.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-graphite/50">
        {selectedInterests.length} of {MIN_SELECTIONS} minimum selected
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-graphite/60 hover:text-graphite font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
