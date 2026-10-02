import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, FEFloatCluster, FEButton, GradIcon, Pressable } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY, FE_WELCOME_SLIDES } from '@demand/shared/fe';

export default function WelcomeStep({ onNext, onSkip, onLogin }: { onNext: () => void; onSkip: () => void; onLogin: () => void }) {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const slide = FE_WELCOME_SLIDES[i];
  const last = i === FE_WELCOME_SLIDES.length - 1;

  return (
    <AppBackground>
      <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <GradIcon name="wave" tone="iris" size={30} glyph={0.56} glow={false} />
            <Text style={[styles.brandName, { color: t.text }]}>FluentEdge</Text>
          </View>
          <Pressable onPress={onSkip} style={{ padding: 6 }}>
            <Text style={[styles.skip, { color: t.text3 }]}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          <FEFloatCluster icons={slide.icons} />
          <View style={{ gap: 12, marginTop: 8 }}>
            <Text style={[styles.title, { color: t.text }]}>{slide.title}</Text>
            <Text style={[styles.sub, { color: t.text2 }]}>{slide.sub}</Text>
          </View>
        </View>

        <View style={{ gap: 20 }}>
          <View style={styles.dots}>
            {FE_WELCOME_SLIDES.map((_, k) => (
              <View key={k} style={[styles.dot, { width: k === i ? 24 : 7, backgroundColor: k === i ? t.aText : t.track }]} />
            ))}
          </View>
          <FEButton
            label={last ? "Let's begin" : 'Continue'}
            onPress={() => (last ? onNext() : setI(i + 1))}
          />
          <Pressable onPress={onLogin} style={{ alignItems: 'center', padding: 4 }}>
            <Text style={[styles.login, { color: t.text3 }]}>
              Already have an account? <Text style={{ color: t.aText, fontWeight: '700' }}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandName: { fontFamily: FE_FONT_FAMILY, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  skip: { fontFamily: FE_FONT_FAMILY, fontSize: 13.5, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', gap: 28 },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: -0.6, lineHeight: 34 },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 14.5, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  dot: { height: 7, borderRadius: 99 },
  login: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '500' },
});
