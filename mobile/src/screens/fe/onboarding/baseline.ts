import { FE_PILLARS } from '@demand/shared/fe';

export interface OnboardingProfile {
  goals: string[];
  situations: string[];
  selfrate: { speakUp?: number; blocker?: string };
  details: { name?: string; profession?: string; lang?: string; goal?: number };
}

export interface BaselineResult {
  overall: number;
  pillars: Record<string, number>;
  personaId: 'silent' | 'over' | 'rusher';
}

const PERSONA_BY_BLOCKER: Record<string, BaselineResult['personaId']> = {
  words: 'over',
  nerves: 'silent',
  fast: 'rusher',
  judged: 'silent',
};

/**
 * Derive a baseline Communication Confidence score from the self-rating.
 * Simulated (no audio/AI yet) but responsive to the user's answers so the
 * reveal feels personal. Real scoring replaces this in the assessment phase.
 */
export function computeBaseline(profile: OnboardingProfile): BaselineResult {
  const speakUp = profile.selfrate.speakUp ?? 2; // 0 best … 3 worst
  const overall = Math.max(35, Math.min(72, 62 - speakUp * 6));
  const personaId = PERSONA_BY_BLOCKER[profile.selfrate.blocker ?? ''] ?? 'silent';

  // Spread pillar values around the overall with a little variation per pillar.
  const spread = [-4, 8, -2, 12, -9, 2];
  const pillars: Record<string, number> = {};
  FE_PILLARS.forEach((p, i) => {
    pillars[p.id] = Math.max(20, Math.min(95, overall + spread[i % spread.length]));
  });

  return { overall, pillars, personaId };
}
