import React from 'react';
import { View, Text } from 'react-native';
import GlassCard from '@components/fe/molecules/GlassCard';
import GradIcon from '@components/fe/atoms/GradIcon';
import Pressable from '@components/fe/atoms/Pressable';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY, type FETone } from '@demand/shared/fe';

export interface DrillCardProps {
  icon: string;
  tone: FETone;
  title: string;
  sub: string;
  onPress?: () => void;
}

/** A tappable practice/feature card (icon + title + subtitle). */
export default function DrillCard({ icon, tone, title, sub, onPress }: DrillCardProps) {
  const t = useFETheme();
  return (
    <Pressable onPress={onPress} scale={0.98}>
      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <GradIcon name={icon} tone={tone} size={46} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
              {title}
            </Text>
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 2 }}>
              {sub}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}
