import React from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Pressable from '@components/fe/atoms/Pressable';
import { useFETheme } from '@theme/useFETheme';
import { toneGradient } from '@theme/feTokens';
import { FE_FONT_FAMILY, type FETone } from '@demand/shared/fe';

export interface ChipProps {
  label: string;
  tone?: FETone;
  active?: boolean;
  onPress?: () => void;
}

/** Pill: neutral / tone-tinted / active-gradient. */
export default function Chip({ label, tone, active, onPress }: ChipProps) {
  const t = useFETheme();

  if (active) {
    return (
      <Pressable onPress={onPress} scale={0.94}>
        <LinearGradient
          colors={[t.a1, t.a2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pill}
        >
          <Text style={[styles.label, { color: '#fff' }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const toneColor = tone ? toneGradient(tone)[t.isDark ? 0 : 1] : undefined;
  return (
    <Pressable
      onPress={onPress}
      scale={0.94}
      style={[
        styles.pill,
        {
          backgroundColor: tone ? `${toneColor}22` : t.chip,
          borderWidth: 1,
          borderColor: t.stroke,
        },
      ]}
    >
      <Text style={[styles.label, { color: tone ? toneColor : t.text2 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: { fontFamily: FE_FONT_FAMILY, fontSize: 12.5, fontWeight: '600' },
});
