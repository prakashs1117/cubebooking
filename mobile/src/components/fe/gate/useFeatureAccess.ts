import { useCallback } from 'react';
import { useFeConfig } from '@hooks/fe/useFE';
import { useFeAuthStore } from '@stores/feAuthStore';
import { canUseFeature, type FEFeatureKey, type FETierId } from '@demand/shared/fe';

export interface FeatureAccess {
  /** True if a feature is globally enabled AND the current tier is entitled. */
  can: (key: FEFeatureKey) => boolean;
  /** Global flag only (ignores tier) — for "coming soon" vs "upgrade" copy. */
  isFlagOn: (key: FEFeatureKey) => boolean;
  /** True when the feature exists but the tier isn't entitled (→ show paywall). */
  needsUpgrade: (key: FEFeatureKey) => boolean;
  tier: FETierId;
}

/**
 * Two-layer feature gating: backend flags (kill-switch/rollout) + subscription
 * entitlements. See plan/FluentEdge Architecture & Standards.md.
 */
export function useFeatureAccess(): FeatureAccess {
  const { config } = useFeConfig();
  const user = useFeAuthStore((s) => s.user);
  const tier = (user?.tier as FETierId) ?? 'free';

  const can = useCallback(
    (key: FEFeatureKey) => canUseFeature(key, config.features, tier),
    [config.features, tier],
  );

  const isFlagOn = useCallback(
    (key: FEFeatureKey) => config.features?.[key] !== false,
    [config.features],
  );

  const needsUpgrade = useCallback(
    (key: FEFeatureKey) => isFlagOn(key) && !can(key),
    [isFlagOn, can],
  );

  return { can, isFlagOn, needsUpgrade, tier };
}
