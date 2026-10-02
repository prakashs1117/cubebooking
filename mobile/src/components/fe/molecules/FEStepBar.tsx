import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Pressable from '@components/fe/atoms/Pressable';
import FEGlyph from '@components/fe/atoms/FEGlyph';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface FEStepBarProps {
  step: number;
  total: number;
  onBack?: () => void;
}

/** Funnel progress: back button + segmented progress + "step/total". */
export default function FEStepBar({ step, total, onBack }: FEStepBarProps) {
  const t = useFETheme();
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} scale={0.9} style={[styles.back, { backgroundColor: t.card, borderColor: t.stroke }]}>
          <FEGlyph name="back" size={18} color={t.text2} />
        </Pressable>
      ) : (
        <View style={{ width: 36 }} />
      )}
      <View style={styles.segments}>
        {Array.from({ length: total }, (_, i) =>
          i < step ? (
            <LinearGradient key={i} colors={[t.a1, t.a2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.seg} />
          ) : (
            <View key={i} style={[styles.seg, { backgroundColor: t.track }]} />
          ),
        )}
      </View>
      <Text style={[styles.count, { color: t.text3 }]}>
        {step}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  segments: { flex: 1, flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 6, borderRadius: 6 },
  count: { width: 36, textAlign: 'right', fontFamily: FE_FONT_FAMILY, fontSize: 12, fontWeight: '700' },
});
