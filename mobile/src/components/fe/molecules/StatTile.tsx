import React from 'react';
import { View, Text } from 'react-native';
import GlassCard from '@components/fe/molecules/GlassCard';
import { useFETheme } from '@theme/useFETheme';
import { useCountUp } from '@components/fe/useCountUp';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface StatTileProps {
  value: number;
  label: string;
  /** Show an eased count-up (default true). */
  count?: boolean;
  suffix?: string;
}

/** Compact stat card with a big tabular number + label. */
export default function StatTile({ value, label, count = true, suffix }: StatTileProps) {
  const t = useFETheme();
  const shown = useCountUp(count ? value : value, count ? 900 : 0);
  const display = count ? shown : value;

  return (
    <GlassCard pad={14} style={{ flex: 1, alignItems: 'center' }}>
      <Text
        style={{
          fontFamily: FE_FONT_FAMILY,
          fontSize: 22,
          fontWeight: '800',
          color: t.text,
          fontVariant: ['tabular-nums'],
        }}
      >
        {display}
        {suffix ?? ''}
      </Text>
      <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 11.5, fontWeight: '600', color: t.text3, marginTop: 2 }}>
        {label}
      </Text>
    </GlassCard>
  );
}
