import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Pressable from '@components/fe/atoms/Pressable';
import GradIcon from '@components/fe/atoms/GradIcon';
import FEGlyph from '@components/fe/atoms/FEGlyph';
import { useFETheme } from '@theme/useFETheme';
import { toneGradient } from '@theme/feTokens';
import { FE_FONT_FAMILY, type FETone } from '@demand/shared/fe';

export interface FEChoiceCardProps {
  icon: string;
  tone: FETone;
  title: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}

/** Multi-select card with a check circle on the right. */
export default function FEChoiceCard({ icon, tone, title, sub, selected, onPress }: FEChoiceCardProps) {
  const t = useFETheme();
  const [, c2] = toneGradient(tone);

  return (
    <Pressable
      onPress={onPress}
      scale={0.98}
      style={[
        styles.card,
        {
          backgroundColor: selected ? `${c2}1f` : t.card,
          borderColor: selected ? t.a2 : t.stroke,
          borderWidth: selected ? 1.5 : 1,
          borderRadius: t.radius,
        },
      ]}
    >
      <GradIcon name={icon} tone={tone} size={42} glow={selected} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {sub ? <Text style={[styles.sub, { color: t.text3 }]}>{sub}</Text> : null}
      </View>
      {selected ? (
        <LinearGradient colors={[t.a1, t.a2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkOn}>
          <FEGlyph name="check" size={13} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.checkOff, { borderColor: t.stroke2 }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 14.5, fontWeight: '700', letterSpacing: -0.2 },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 12, marginTop: 2 },
  checkOn: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkOff: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
});
