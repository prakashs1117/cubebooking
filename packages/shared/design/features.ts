// ============================================================================
// FluentEdge — Feature keys, tier entitlements & gating helper
// ============================================================================
// Single source of truth for the two-layer gating model (see
// plan/FluentEdge Architecture & Standards.md). Consumed by web + mobile;
// the backend mirrors this in src/fluentedge/features.ts (keep in sync).
// ============================================================================

import type { FETierId } from './constants';

export const FE_FEATURE_KEYS = [
  'onboarding',
  'auth',
  'today',
  'dailySpeak',
  'practice',
  'games',
  'progress',
  'profile',
  'community',
  'rooms',
  'buddy',
  'aiPartner',
  'scenarioPacks',
  'framework',
  'certificates',
  'coachSessions',
  'cohort',
  'paywall',
] as const;

export type FEFeatureKey = (typeof FE_FEATURE_KEYS)[number];

/** Global feature flags (backend kill-switch / rollout). */
export type FEFeatureFlags = Record<FEFeatureKey, boolean>;

/** All features default ON; the backend can turn any off via platform config. */
export const DEFAULT_FEATURE_FLAGS: FEFeatureFlags = FE_FEATURE_KEYS.reduce(
  (acc, k) => ({ ...acc, [k]: true }),
  {} as FEFeatureFlags,
);

/** Which features each subscription tier is entitled to (the paywall layer). */
const FREE: FEFeatureKey[] = [
  'onboarding',
  'auth',
  'today',
  'dailySpeak',
  'practice',
  'progress',
  'profile',
  'community',
  'paywall',
];
const SILVER: FEFeatureKey[] = [...FREE, 'games', 'rooms', 'buddy'];
const GOLD: FEFeatureKey[] = [...SILVER, 'aiPartner', 'scenarioPacks', 'framework', 'certificates'];
const DIAMOND: FEFeatureKey[] = [...GOLD, 'coachSessions', 'cohort'];

export const TIER_ENTITLEMENTS: Record<FETierId, FEFeatureKey[]> = {
  free: FREE,
  silver: SILVER,
  gold: GOLD,
  diamond: DIAMOND,
};

/** Tiers from lowest to highest. */
export const TIER_ORDER: FETierId[] = ['free', 'silver', 'gold', 'diamond'];

/** The lowest tier entitled to a feature (for "unlock with X" paywall copy). */
export function minTierForFeature(key: FEFeatureKey): FETierId | null {
  for (const tier of TIER_ORDER) {
    if (TIER_ENTITLEMENTS[tier].includes(key)) return tier;
  }
  return null;
}

/** True if a feature is globally enabled AND the tier is entitled to it. */
export function canUseFeature(
  key: FEFeatureKey,
  flags: Partial<FEFeatureFlags> | undefined,
  tier: FETierId,
): boolean {
  const flagOn = flags?.[key] !== false; // default on unless explicitly disabled
  const entitled = TIER_ENTITLEMENTS[tier]?.includes(key) ?? false;
  return flagOn && entitled;
}

/** Config payload returned by GET /api/v1/fe/config. */
export interface FEConfig {
  features: FEFeatureFlags;
  entitlements: Record<FETierId, FEFeatureKey[]>;
  minSupportedVersion?: { ios?: string; android?: string };
}
