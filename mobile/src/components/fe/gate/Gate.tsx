import React from 'react';
import { useFeatureAccess } from '@components/fe/gate/useFeatureAccess';
import type { FEFeatureKey } from '@demand/shared/fe';

export interface GateProps {
  feature: FEFeatureKey;
  children: React.ReactNode;
  /** Rendered when the feature is not available (flag off or not entitled). */
  fallback?: React.ReactNode;
  /** Rendered specifically when the tier isn't entitled (paywall). Falls back to `fallback`. */
  upgrade?: React.ReactNode;
}

/**
 * Conditionally render `children` based on the two-layer gate.
 * - flag off  → `fallback` (or null)
 * - flag on but tier not entitled → `upgrade` (or `fallback`, or null)
 */
export default function Gate({ feature, children, fallback = null, upgrade }: GateProps) {
  const { can, needsUpgrade } = useFeatureAccess();

  if (can(feature)) return <>{children}</>;
  if (needsUpgrade(feature)) return <>{upgrade ?? fallback}</>;
  return <>{fallback}</>;
}
