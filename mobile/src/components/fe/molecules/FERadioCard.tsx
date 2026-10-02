import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Pressable from '@components/fe/atoms/Pressable';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface FERadioCardProps {
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}

/** Single-select row with a radio dot on the left. */
export default function FERadioCard({ label, sub, selected, onPress }: FERadioCardProps) {
  const t = useFETheme();
  return (
    <Pressable
      onPress={onPress}
      scale={0.98}
      style={[
        styles.card,
        {
          backgroundColor: selected ? `${t.a2}1f` : t.card,
          borderColor: selected ? t.a2 : t.stroke,
          borderWidth: selected ? 1.5 : 1,
          borderRadius: 16,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          selected ? { borderWidth: 6, borderColor: t.a2 } : { borderWidth: 2, borderColor: t.stroke2 },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: t.text }]}>{label}</Text>
        {sub ? <Text style={[styles.sub, { color: t.text3 }]}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  dot: { width: 22, height: 22, borderRadius: 11 },
  label: { fontFamily: FE_FONT_FAMILY, fontSize: 14.5, fontWeight: '600' },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 12, marginTop: 2 },
});
