import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Pressable from '@components/fe/atoms/Pressable';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface SegmentedProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}

/** Segmented control with an accent-gradient active pill. */
export default function Segmented({ options, value, onChange }: SegmentedProps) {
  const t = useFETheme();
  return (
    <View style={[styles.wrap, { backgroundColor: t.chip, borderColor: t.stroke }]}>
      {options.map((o) => {
        const active = o.id === value;
        const inner = (
          <Text style={[styles.label, { color: active ? '#fff' : t.text2 }]}>{o.label}</Text>
        );
        return (
          <Pressable key={o.id} onPress={() => onChange(o.id)} scale={0.96} style={styles.seg}>
            {active ? (
              <LinearGradient
                colors={[t.a1, t.a2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeFill}
              >
                {inner}
              </LinearGradient>
            ) : (
              inner
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 34 },
  activeFill: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 7,
  },
  label: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '600', paddingVertical: 7 },
});
