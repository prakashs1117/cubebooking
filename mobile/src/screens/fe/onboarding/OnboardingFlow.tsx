import React, { useMemo, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import WelcomeStep from '@screens/fe/onboarding/WelcomeStep';
import MultiSelectStep from '@screens/fe/onboarding/MultiSelectStep';
import SelfRateStep, { SelfRateValue } from '@screens/fe/onboarding/SelfRateStep';
import DetailsStep, { DetailsValue } from '@screens/fe/onboarding/DetailsStep';
import AssessmentStep from '@screens/fe/onboarding/AssessmentStep';
import SignupStep from '@screens/fe/onboarding/SignupStep';
import TrialStep from '@screens/fe/onboarding/TrialStep';
import { computeBaseline, type OnboardingProfile } from '@screens/fe/onboarding/baseline';
import { feRegister, feSaveOnboarding, type OnboardingOption } from '@services/fe/feApi';
import { useFeAuthStore } from '@stores/feAuthStore';
import { useOnboardingStore } from '@stores/onboardingStore';

type Screen = 'welcome' | 'goals' | 'situations' | 'selfrate' | 'details' | 'assess' | 'signup' | 'trial';
const FUNNEL_STEPS: Screen[] = ['goals', 'situations', 'selfrate', 'details'];

/**
 * Onboarding orchestrator — welcome → goals → situations → self-rate → details
 * → 60s assessment → score reveal → signup → 7-day trial. Collects the user's
 * details, creates the account, and persists the baseline assessment.
 * All selections are cached in localStorage and synced to backend on signup.
 */
export default function OnboardingFlow({ onLogin }: { onLogin: () => void }) {
  const setSession = useFeAuthStore((s) => s.setSession);
  const { config, loading, loadConfig, selections, updateSelections, restoreSelections } = useOnboardingStore();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [profile, setProfile] = useState<OnboardingProfile>({
    goals: [],
    situations: [],
    selfrate: {},
    details: { goal: 10 },
  });

  // Load config + restore previous selections on mount
  useEffect(() => {
    const init = async () => {
      await loadConfig();
      await restoreSelections();
    };
    init();
  }, [loadConfig, restoreSelections]);

  const baseline = useMemo(() => computeBaseline(profile), [profile]);
  const stepOf = (s: Screen) => FUNNEL_STEPS.indexOf(s) + 1;
  const total = FUNNEL_STEPS.length;
  const go = (s: Screen) => setScreen(s);

  // Create the account + persist all collected details, then move to the trial.
  const handleRegister = async (email: string, password: string) => {
    const firstName = (profile.details.name || 'there').trim();
    // Save to localStorage before account creation
    await updateSelections({ completedAt: new Date().toISOString() });
    await feRegister({ email, password, firstName });
    await feSaveOnboarding({
      goals: profile.goals,
      situations: profile.situations,
      selfRating: profile.selfrate.speakUp,
      speakUp: profile.selfrate.speakUp,
      blocker: profile.selfrate.blocker,
      profession: profile.details.profession,
      language: profile.details.lang,
      dailyGoalMin: profile.details.goal,
      persona: baseline.personaId,
      score: { overall: baseline.overall, pillars: baseline.pillars },
    });
    go('trial');
  };

  // Both trial start & skip enter the app; trial billing/IAP arrives later.
  const finish = async () => {
    const { feGetMe } = await import('@services/fe/feApi');
    const user = await feGetMe();
    setSession(user);
  };

  // Show loading while fetching config
  if (loading || !config) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Transform backend options to MultiSelectStep format
  const toMultiOption = (opt: OnboardingOption) => ({
    id: opt.value || opt._id,
    icon: opt.icon || '',
    tone: (opt.tone || 'neutral') as any,
    title: opt.title,
    sub: opt.subtitle,
  });

  // Get options for goals and situations from backend config
  const goalsStep = config.steps.find((s) => s.kind === 'goals');
  const goalsQuestion = goalsStep?.questions?.[0];
  const goalsOptions = (goalsQuestion?.options || []).map(toMultiOption);

  const situationsStep = config.steps.find((s) => s.kind === 'situations');
  const situationsQuestion = situationsStep?.questions?.[0];
  const situationsOptions = (situationsQuestion?.options || []).map(toMultiOption);

  switch (screen) {
    case 'welcome':
      return <WelcomeStep onNext={() => go('goals')} onSkip={() => go('goals')} onLogin={onLogin} />;

    case 'goals':
      return (
        <MultiSelectStep
          title={goalsStep?.title || 'What do you want to unlock?'}
          sub={goalsStep?.subtitle || 'Pick the moments that matter most. We\'ll shape your plan around them.'}
          options={goalsOptions}
          value={profile.goals}
          onChange={(goals) => {
            setProfile({ ...profile, goals });
            updateSelections({ goals });
          }}
          onNext={() => go('situations')}
          onBack={() => go('welcome')}
          onSkip={() => go('situations')}
          step={stepOf('goals')}
          total={total}
        />
      );

    case 'situations':
      return (
        <MultiSelectStep
          title={situationsStep?.title || 'When do you freeze up?'}
          sub={situationsStep?.subtitle || 'Be honest — this is where we\'ll focus your practice.'}
          options={situationsOptions}
          value={profile.situations}
          onChange={(situations) => {
            setProfile({ ...profile, situations });
            updateSelections({ situations });
          }}
          onNext={() => go('selfrate')}
          onBack={() => go('goals')}
          onSkip={() => go('selfrate')}
          step={stepOf('situations')}
          total={total}
        />
      );

    case 'selfrate':
      return (
        <SelfRateStep
          value={profile.selfrate}
          onChange={(selfrate: SelfRateValue) => {
            setProfile({ ...profile, selfrate });
            updateSelections({ selfrate });
          }}
          onNext={() => go('details')}
          onBack={() => go('situations')}
          onSkip={() => go('details')}
          step={stepOf('selfrate')}
          total={total}
        />
      );

    case 'details':
      return (
        <DetailsStep
          data={profile.details}
          setData={(details: DetailsValue) => {
            setProfile({ ...profile, details });
            updateSelections({ details });
          }}
          onNext={() => go('assess')}
          onBack={() => go('selfrate')}
          onSkip={() => go('assess')}
          step={stepOf('details')}
          total={total}
        />
      );

    case 'assess':
      // Pick a random assessment prompt from the backend config
      const prompts = config.prompts || [];
      const assessmentPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      return (
        <AssessmentStep
          baseline={baseline}
          customPrompt={assessmentPrompt?.text}
          onFinish={() => go('signup')}
          onSkip={() => go('signup')}
        />
      );

    case 'signup':
      return <SignupStep score={baseline.overall} onRegister={handleRegister} onBack={() => go('assess')} />;

    case 'trial':
      return <TrialStep score={baseline.overall} onStart={finish} onSkip={finish} />;

    default:
      return null;
  }
}
