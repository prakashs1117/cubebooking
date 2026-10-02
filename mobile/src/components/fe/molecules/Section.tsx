import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Pressable from '@components/fe/atoms/Pressable';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface SectionProps {
  title: string;
  action?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

/** Section title + optional action link, then children. */
export default function Section({ title, action, onAction, children }: SectionProps) {
  const t = useFETheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {action ? (
          <Pressable onPress={onAction} scale={0.94}>
            <Text style={[styles.action, { color: t.aText }]}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 16.5, fontWeight: '700', letterSpacing: -0.2 },
  action: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '600' },
});
