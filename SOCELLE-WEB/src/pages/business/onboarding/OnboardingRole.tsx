import { Building2, Scissors, Briefcase, GraduationCap, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type OnboardingRoleValue = 'operator' | 'provider' | 'brand' | 'student';

interface RoleOption {
  value: OnboardingRoleValue;
  label: string;
  description: string;
  icon: LucideIcon;
}

const ROLES: RoleOption[] = [
  {
    value: 'operator',
    label: 'Operator',
    description: 'Spa, salon, or medspa owner',
    icon: Building2,
  },
  {
    value: 'provider',
    label: 'Provider',
    description: 'Esthetician, stylist, or NP',
    icon: Scissors,
  },
  {
    value: 'brand',
    label: 'Brand',
    description: 'Beauty company or manufacturer',
    icon: Briefcase,
  },
  {
    value: 'student',
    label: 'Student',
    description: 'Currently in training or school',
    icon: GraduationCap,
  },
];

interface OnboardingRoleProps {
  selectedRole: OnboardingRoleValue | null;
  onSelectRole: (role: OnboardingRoleValue) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingRole({
  selectedRole,
  onSelectRole,
  onNext,
  onBack,
}: OnboardingRoleProps) {
  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">
          What&apos;s your role?
        </h1>
        <p className="text-graphite/60 text-base">
          This helps us tailor your intelligence experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.value;
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              onClick={() => onSelectRole(role.value)}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? 'border-accent bg-accent-soft'
                  : 'border-graphite/10 bg-white hover:border-accent/40'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 bg-accent text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <Icon className={`w-8 h-8 ${isSelected ? 'text-accent' : 'text-graphite/50'}`} />
              <div>
                <p className="font-medium text-graphite">{role.label}</p>
                <p className="text-sm text-graphite/60">{role.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-graphite/60 hover:text-graphite font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedRole}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
