import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, FEStepBar } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface FunnelStepProps {
  title?: string;
  sub?: string;
  step?: number;
  total?: number;
  onBack?: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/** Shared scaffold for funnel steps: bg + step bar + scroll body + footer. */
export default function FunnelStep({ title, sub, step, total, onBack, footer, children }: FunnelStepProps) {
  const t = useFETheme();
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        {step != null && total != null ? <FEStepBar step={step} total={total} onBack={onBack} /> : null}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {title ? <Text style={[styles.title, { color: t.text }]}>{title}</Text> : null}
          {sub ? <Text style={[styles.sub, { color: t.text2 }]}>{sub}</Text> : null}
          <View style={{ marginTop: title ? 20 : 0 }}>{children}</View>
        </ScrollView>
        {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>{footer}</View> : null}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 22 },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 25, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 13.5, fontWeight: '500', marginTop: 6, lineHeight: 20 },
  footer: { paddingTop: 12 },
});
