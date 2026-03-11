import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingRole from './OnboardingRole';
import type { OnboardingRoleValue } from './OnboardingRole';
import OnboardingVertical from './OnboardingVertical';
import type { VerticalValue } from './OnboardingVertical';
import OnboardingInterests from './OnboardingInterests';
import type { InterestValue } from './OnboardingInterests';
import OnboardingPlanSelect from './OnboardingPlanSelect';
import type { SelectedPlanSlug } from './OnboardingPlanSelect';
import OnboardingComplete from './OnboardingComplete';

const TOTAL_STEPS = 6;
const STORAGE_KEY = 'socelle_onboarding_complete';

export default function OnboardingFlow() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<OnboardingRoleValue | null>(null);
  const [selectedVertical, setSelectedVertical] = useState<VerticalValue | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<InterestValue[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlanSlug>(null);

  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null;

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleToggleInterest = useCallback((interest: InterestValue) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }, []);

  // ── Persist onboarding selections to Supabase ─────────────────────
  const saveOnboardingMutation = useMutation({
    mutationFn: async (payload: {
      role: OnboardingRoleValue | null;
      vertical: VerticalValue | null;
      interests: InterestValue[];
      plan: SelectedPlanSlug;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_role: payload.role,
          onboarding_vertical: payload.vertical,
          onboarding_interests: payload.interests,
          onboarding_plan: payload.plan,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        // 42P01 = table/column missing — fall back to localStorage only
        if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) {
          console.warn('[onboarding] Supabase column not yet available, saving to localStorage only.');
          return;
        }
        // 42703 = column does not exist — same fallback
        if (error.code === '42703') {
          console.warn('[onboarding] Onboarding columns not yet migrated, saving to localStorage only.');
          return;
        }
        throw error;
      }
    },
  });

  const handleFinish = useCallback(() => {
    // Always persist to localStorage as a fast fallback
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completedAt: new Date().toISOString(),
          role: selectedRole,
          vertical: selectedVertical,
          interests: selectedInterests,
          plan: selectedPlan,
        }),
      );
    } catch {
      // localStorage unavailable — silently continue
    }

    // Persist to Supabase (fire-and-forget — mutation handles errors gracefully)
    saveOnboardingMutation.mutate({
      role: selectedRole,
      vertical: selectedVertical,
      interests: selectedInterests,
      plan: selectedPlan,
    });
  }, [selectedRole, selectedVertical, selectedInterests, selectedPlan, saveOnboardingMutation]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingWelcome userName={userName} onNext={goNext} />;
      case 2:
        return (
          <OnboardingRole
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <OnboardingVertical
            role={selectedRole}
            selectedVertical={selectedVertical}
            onSelectVertical={setSelectedVertical}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <OnboardingInterests
            selectedInterests={selectedInterests}
            onToggleInterest={handleToggleInterest}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 5:
        return (
          <OnboardingPlanSelect
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 6:
        return (
          <OnboardingComplete
            role={selectedRole}
            vertical={selectedVertical}
            interests={selectedInterests}
            selectedPlan={selectedPlan}
            onFinish={handleFinish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-graphite/50">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1.5 bg-graphite/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-graphite/10 shadow-sm p-8 sm:p-12">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
