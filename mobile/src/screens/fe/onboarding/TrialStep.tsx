import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { AppBackground, GradIcon, FEGlyph, FEButton, Pressable } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY, type FETone } from '@demand/shared/fe';

const PLANS = [
  { id: 'annual', name: 'Annual', price: '₹4,999', per: '/yr', note: 'Just ₹416/mo', save: 'SAVE 30%' },
  { id: 'monthly', name: 'Monthly', price: '₹599', per: '/mo', note: 'Billed monthly' },
];

export default function TrialStep({ score, onStart, onSkip }: { score: number; onStart: () => void; onSkip: () => void }) {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState('annual');

  const timeline: { ic: string; tone: FETone; h: string; b: string }[] = [
    { ic: 'lock', tone: 'green', h: 'Today — full access unlocked', b: 'AI partner, all rooms, scenario packs & certificates.' },
    { ic: 'bell', tone: 'gold', h: 'Day 5 — friendly reminder', b: "We'll nudge you before anything is charged." },
    { ic: 'star', tone: 'iris', h: 'Day 7 — trial ends', b: plan === 'annual' ? 'Billed ₹4,999/yr unless you cancel. Cancel anytime.' : 'Billed ₹599/mo unless you cancel. Cancel anytime.' },
  ];

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 20, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center' }}>
          <LinearGradient colors={['#FFD66B', '#F09819']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trophy}>
            <FEGlyph name="trophy" size={34} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={[styles.h1, { color: t.text }]}>7 days of Gold, free</Text>
        <Text style={[styles.sub, { color: t.text2 }]}>
          The fastest path from your <Text style={{ color: t.aText, fontWeight: '700' }}>{score}</Text> to a confident{' '}
          <Text style={{ color: t.aText, fontWeight: '700' }}>70+</Text>. Cancel anytime — no charge if you cancel before day 7.
        </Text>

        <View style={{ marginTop: 24, gap: 16 }}>
          {timeline.map((it) => (
            <View key={it.h} style={{ flexDirection: 'row', gap: 13 }}>
              <GradIcon name={it.ic} tone={it.tone} size={36} glyph={0.5} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13.5, fontWeight: '700', color: t.text }}>{it.h}</Text>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 2, lineHeight: 18 }}>{it.b}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ gap: 10, marginTop: 22 }}>
          {PLANS.map((o) => {
            const active = plan === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => setPlan(o.id)}
                scale={0.98}
                style={[styles.plan, { backgroundColor: active ? `${t.a2}1f` : t.card, borderColor: active ? t.a2 : t.stroke2, borderWidth: active ? 2 : 1 }]}
              >
                <View style={[styles.radio, active ? { borderWidth: 6, borderColor: t.a2 } : { borderWidth: 2, borderColor: t.stroke2 }]} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>{o.name}</Text>
                    {o.save ? (
                      <Text style={styles.saveBadge}>{o.save}</Text>
                    ) : null}
                  </View>
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 11.5, color: t.text3, marginTop: 2 }}>{o.note}</Text>
                </View>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 17, fontWeight: '800', color: t.text }}>
                  {o.price}
                  <Text style={{ fontSize: 12, color: t.text3, fontWeight: '600' }}>{o.per}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 12, gap: 10 }}>
        <FEButton label="Start my 7-day free trial" onPress={onStart} />
        <Pressable onPress={onSkip} style={{ alignItems: 'center', padding: 8 }}>
          <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '600', color: t.text3 }}>
            Maybe later — continue on free plan
          </Text>
        </Pressable>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  trophy: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: FE_FONT_FAMILY, fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.6, lineHeight: 30, marginTop: 14 },
  sub: { fontFamily: FE_FONT_FAMILY, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21, maxWidth: 300, alignSelf: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 16 },
  radio: { width: 22, height: 22, borderRadius: 11 },
  saveBadge: { fontFamily: FE_FONT_FAMILY, fontSize: 9.5, fontWeight: '800', color: '#16A34A', backgroundColor: 'rgba(94,227,154,0.18)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
});
