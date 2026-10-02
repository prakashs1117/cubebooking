import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface RingProps {
  /** 0..100 */
  value: number;
  size?: number;
  stroke?: number;
  /** Optional big center label; defaults to the rounded value. */
  label?: string;
  sublabel?: string;
}

/** Circular progress ring with an accent gradient stroke + center label. */
export default function Ring({ value, size = 120, stroke = 12, label, sublabel }: RingProps) {
  const t = useFETheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const dash = c * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="feRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={t.a1} />
            <Stop offset="1" stopColor={t.a2} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#feRing)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          fill="none"
        />
      </Svg>
      <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: size * 0.28, fontWeight: '800', color: t.text }}>
        {label ?? Math.round(value)}
      </Text>
      {sublabel ? (
        <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 11, fontWeight: '600', color: t.text3 }}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}
