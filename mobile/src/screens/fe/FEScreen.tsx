import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface FEScreenProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/**
 * Standard FluentEdge screen scaffold: ambient background + safe-area header +
 * scrollable content with room for the floating tab bar.
 */
export default function FEScreen({ title, subtitle, children }: FEScreenProps) {
  const t = useFETheme();
  const { top } = useSafeAreaInsets();

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: top + 12, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: t.text2 }]}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18 },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontFamily: FE_FONT_FAMILY, fontSize: 13.5, fontWeight: '500', marginTop: 3 },
  body: { marginTop: 20, gap: 16 },
});
