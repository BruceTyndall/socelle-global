import { Check } from 'lucide-react';
import type { OnboardingRoleValue } from './OnboardingRole';

export type VerticalValue =
  | 'day_spa'
  | 'medical_spa'
  | 'hair_salon'
  | 'barbershop'
  | 'nail_salon'
  | 'wellness_center'
  | 'skincare_brand'
  | 'haircare_brand'
  | 'professional_tools'
  | 'cosmetics'
  | 'esthetics'
  | 'cosmetology'
  | 'nursing'
  | 'business_mgmt';

interface VerticalOption {
  value: VerticalValue;
  label: string;
}

const VERTICALS_BY_ROLE: Record<OnboardingRoleValue, VerticalOption[]> = {
  operator: [
    { value: 'day_spa', label: 'Day Spa' },
    { value: 'medical_spa', label: 'Medical Spa' },
    { value: 'hair_salon', label: 'Hair Salon' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'nail_salon', label: 'Nail Salon' },
    { value: 'wellness_center', label: 'Wellness Center' },
  ],
  provider: [
    { value: 'esthetics', label: 'Esthetics' },
    { value: 'cosmetology', label: 'Cosmetology' },
    { value: 'nursing', label: 'Nursing / NP' },
    { value: 'wellness_center', label: 'Wellness' },
  ],
  brand: [
    { value: 'skincare_brand', label: 'Skincare' },
    { value: 'haircare_brand', label: 'Haircare' },
    { value: 'professional_tools', label: 'Professional Tools' },
    { value: 'cosmetics', label: 'Cosmetics' },
  ],
  student: [
    { value: 'esthetics', label: 'Esthetics' },
    { value: 'cosmetology', label: 'Cosmetology' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'business_mgmt', label: 'Business Management' },
  ],
};

interface OnboardingVerticalProps {
  role: OnboardingRoleValue | null;
  selectedVertical: VerticalValue | null;
  onSelectVertical: (vertical: VerticalValue) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingVertical({
  role,
  selectedVertical,
  onSelectVertical,
  onNext,
  onBack,
}: OnboardingVerticalProps) {
  const verticals = role ? VERTICALS_BY_ROLE[role] : [];

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">
          What&apos;s your vertical?
        </h1>
        <p className="text-graphite/60 text-base">
          We&apos;ll focus your intelligence feed on what matters most.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {verticals.map((vertical) => {
          const isSelected = selectedVertical === vertical.value;
          return (
            <button
              key={vertical.value}
              onClick={() => onSelectVertical(vertical.value)}
              className={`relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? 'border-accent bg-accent-soft'
                  : 'border-graphite/10 bg-white hover:border-accent/40'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 bg-accent text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <span className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-graphite'}`}>
                {vertical.label}
              </span>
            </button>
          );
        })}
      </div>

      {verticals.length === 0 && (
        <p className="text-sm text-graphite/50">
          Select a role first to see available verticals.
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-graphite/60 hover:text-graphite font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedVertical}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
