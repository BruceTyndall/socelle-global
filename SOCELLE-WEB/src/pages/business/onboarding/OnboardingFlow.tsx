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
import {
  applyUserTagPreferenceDelta,
  buildOnboardingPreferenceSeedGroups,
} from '../../../lib/intelligence/personalization';

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

  const isRecoverablePreferenceError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: string }).code)
        : '';

    return (
      code === '42P01' ||
      code === '42703' ||
      code === '42883' ||
      code === 'PGRST202' ||
      message.includes('user_tag_preferences') ||
      message.includes('apply_user_tag_preference_delta') ||
      message.includes('does not exist') ||
      message.includes('could not find the function')
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

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_role: payload.role,
          onboarding_vertical: payload.vertical,
          onboarding_interests: payload.interests,
          onboarding_plan: payload.plan,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', user.id);

      if (profileError) {
        // 42P01 / 42703 = table or column missing — fall back to localStorage only
        if (
          profileError.code === '42P01' ||
          profileError.code === '42703' ||
          profileError.message.toLowerCase().includes('does not exist')
        ) {
          console.warn('[onboarding] Supabase onboarding columns not yet available, saving to localStorage only.');
        } else {
          throw profileError;
        }
      }

      const { primaryTags, secondaryTags } = buildOnboardingPreferenceSeedGroups({
        role: payload.role,
        vertical: payload.vertical,
        interests: payload.interests,
      });

      try {
        if (primaryTags.length > 0) {
          await applyUserTagPreferenceDelta({
            userId: user.id,
            tagCodes: primaryTags,
            delta: 4,
            source: 'onboarding',
          });
        }

        if (secondaryTags.length > 0) {
          await applyUserTagPreferenceDelta({
            userId: user.id,
            tagCodes: secondaryTags,
            delta: 2,
            source: 'onboarding',
          });
        }
      } catch (error) {
        if (isRecoverablePreferenceError(error)) {
          console.warn('[onboarding] Preference seed layer not yet available, continuing without preference sync.');
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
