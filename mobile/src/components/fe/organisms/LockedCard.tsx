import React from 'react';
import { View, Text } from 'react-native';
import GlassCard from '@components/fe/molecules/GlassCard';
import GradIcon from '@components/fe/atoms/GradIcon';
import FEGlyph from '@components/fe/atoms/FEGlyph';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY, FE_TIERS, minTierForFeature, type FEFeatureKey } from '@demand/shared/fe';

export interface LockedCardProps {
  feature: FEFeatureKey;
  title: string;
  sub?: string;
  icon?: string;
}

/**
 * Paywall affordance — shown by <Gate upgrade={<LockedCard/>}> when a feature
 * is globally on but the user's tier isn't entitled. Names the unlocking tier.
 */
export default function LockedCard({ feature, title, sub, icon = 'lock' }: LockedCardProps) {
  const t = useFETheme();
  const minTier = minTierForFeature(feature);
  const tierName = FE_TIERS.find((x) => x.id === minTier)?.name ?? 'a paid plan';

  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.85 }}>
        <GradIcon name={icon} tone="slate" size={46} glow={false} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
            {title}
          </Text>
          {sub ? (
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 2 }}>
              {sub}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: t.chip,
            borderColor: t.stroke,
            borderWidth: 1,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
          }}
        >
          <FEGlyph name="lock" size={13} color={t.aText} />
          <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 11.5, fontWeight: '700', color: t.aText }}>
            {tierName}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
