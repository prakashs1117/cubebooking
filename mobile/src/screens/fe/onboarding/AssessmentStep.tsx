import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBackground,
  GlassCard,
  GradIcon,
  FEGlyph,
  Ring,
  ProgressBar,
  FEButton,
  FEWaveform,
  useCountUp,
} from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import {
  FE_FONT_FAMILY,
  FE_ASSESSMENT_PROMPTS,
  FE_PILLARS,
  FE_PERSONAS,
} from '@demand/shared/fe';
import type { BaselineResult } from '@screens/fe/onboarding/baseline';

type Phase = 'intro' | 'rec' | 'analyze' | 'reveal';
const ANALYZE_STEPS = [
  'Transcribing your words…',
  'Measuring pace & pauses…',
  'Spotting filler words…',
  'Scoring clarity & structure…',
  'Building your profile…',
];

export default function AssessmentStep({
  baseline,
  onFinish,
  onSkip,
  customPrompt,
}: {
  baseline: BaselineResult;
  onFinish: () => void;
  onSkip?: () => void;
  customPrompt?: string;
}) {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('intro');
  const [secs, setSecs] = useState(0);
  const [msg, setMsg] = useState(0);
  const prompt = useMemo(
    () => customPrompt || FE_ASSESSMENT_PROMPTS[Math.floor(Math.random() * FE_ASSESSMENT_PROMPTS.length)],
    [customPrompt],
  );

  useEffect(() => {
    if (phase !== 'rec') return;
    const id = setInterval(() => {
      setSecs((s) => {
        if (s >= 60) {
          clearInterval(id);
          setPhase('analyze');
          return 60;
        }
        return s + 1;
      });
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'analyze') return;
    const tick = setInterval(() => setMsg((m) => m + 1), 620);
    const done = setTimeout(() => setPhase('reveal'), 3300);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [phase]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  // ---- intro ----
  if (phase === 'intro') {
    return (
      <AppBackground>
        <View style={[styles.pad, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
          <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
            <View style={{ alignItems: 'center', gap: 10 }}>
              <Text style={[styles.kicker, { color: t.aText }]}>60-SECOND CHECK</Text>
              <Text style={[styles.h1, { color: t.text }]}>Now let’s hear your voice</Text>
              <Text style={[styles.body, { color: t.text2 }]}>
                Speak freely for up to a minute. We’ll turn it into your Communication Confidence Score.
              </Text>
            </View>
            <GlassCard pad={18} style={{ flexDirection: 'row', gap: 13 }}>
              <GradIcon name="chat" tone="blue" size={40} glyph={0.5} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.overline, { color: t.text3 }]}>YOUR PROMPT</Text>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15.5, fontWeight: '600', color: t.text, lineHeight: 21 }}>
                  {prompt}
                </Text>
              </View>
            </GlassCard>
          </View>
          <View style={{ gap: 12 }}>
            <FEButton label="Start speaking" onPress={() => { setSecs(0); setPhase('rec'); }} />
            {onSkip && <FEButton label="Skip assessment" onPress={onSkip} variant="ghost" />}
            <Text style={[styles.fine, { color: t.text3 }]}>Your recording never leaves your device in this demo.</Text>
          </View>
        </View>
      </AppBackground>
    );
  }

  // ---- recording ----
  if (phase === 'rec') {
    return (
      <AppBackground>
        <View style={[styles.pad, { paddingTop: insets.top, paddingBottom: insets.bottom + 24, alignItems: 'center' }]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 28, width: '100%' }}>
            <View style={{ alignItems: 'center' }}>
              <View style={[styles.recPill, { borderColor: 'rgba(225,29,72,0.4)', backgroundColor: 'rgba(225,29,72,0.16)' }]}>
                <View style={styles.recDot} />
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, fontWeight: '700', color: '#FF8DA1' }}>Recording</Text>
              </View>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, color: t.text2, textAlign: 'center', marginTop: 18, maxWidth: 290, lineHeight: 21 }}>
                {prompt}
              </Text>
            </View>
            <Ring value={(secs / 60) * 100} size={176} stroke={10} label=" " />
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 40, fontWeight: '800', color: t.text, letterSpacing: -1 }}>
              {mm}:{ss}
            </Text>
            <View style={{ width: '100%', maxWidth: 300 }}>
              <FEWaveform active height={64} />
            </View>
          </View>
          <FEButton label="Stop & analyze" variant="ghost" onPress={() => setPhase('analyze')} />
        </View>
      </AppBackground>
    );
  }

  // ---- analyzing ----
  if (phase === 'analyze') {
    return (
      <AppBackground>
        <View style={[styles.pad, { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }]}>
          <View style={{ width: 130, height: 130, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={t.aText} style={{ position: 'absolute', transform: [{ scale: 2.4 }] }} />
            <GradIcon name="sparkle" tone="iris" size={64} glyph={0.55} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.h2, { color: t.text }]}>Reading your voice</Text>
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 14, color: t.text2, marginTop: 8 }}>
              {ANALYZE_STEPS[Math.min(msg, ANALYZE_STEPS.length - 1)]}
            </Text>
          </View>
        </View>
      </AppBackground>
    );
  }

  return <Reveal baseline={baseline} onFinish={onFinish} onSkip={onSkip} />;
}

function Reveal({ baseline, onFinish, onSkip }: { baseline: BaselineResult; onFinish: () => void; onSkip?: () => void }) {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const shown = useCountUp(baseline.overall, 1500);
  const persona = FE_PERSONAS[baseline.personaId] ?? FE_PERSONAS.silent;

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.kicker, { color: t.aText }]}>YOUR BASELINE</Text>
          <Text style={[styles.h2, { color: t.text, marginTop: 4 }]}>Communication Confidence</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Ring value={baseline.overall} size={190} stroke={15} label={String(shown)} sublabel="OUT OF 100" />
        </View>

        <GlassCard pad={17} style={{ flexDirection: 'row', gap: 13, alignItems: 'center' }}>
          <GradIcon name="person" tone={persona.tone} size={46} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.overline, { color: t.text3 }]}>YOUR PERSONA</Text>
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 17, fontWeight: '800', color: t.text, marginVertical: 2 }}>
              {persona.name}
            </Text>
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, color: t.text2, lineHeight: 19 }}>{persona.line}</Text>
          </View>
        </GlassCard>

        <View>
          <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '700', color: t.text2, marginBottom: 10 }}>
            Where you stand today
          </Text>
          <GlassCard pad={16} style={{ gap: 12 }}>
            {FE_PILLARS.map((p) => {
              const v = (baseline.pillars[p.id] ?? 0) / 100;
              return (
                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <GradIcon name={p.icon} tone={p.tone} size={30} glyph={0.5} glow={false} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                      <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '600', color: t.text }}>{p.short}</Text>
                      <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, fontWeight: '700', color: t.text3 }}>
                        {Math.round(v * 100)}
                      </Text>
                    </View>
                    <ProgressBar value={v} h={6} />
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </View>

        <GlassCard style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <GradIcon name="target" tone="green" size={40} />
          <Text style={{ flex: 1, fontFamily: FE_FONT_FAMILY, fontSize: 13.5, color: t.text, lineHeight: 19 }}>
            <Text style={{ fontWeight: '700' }}>Your 30-day path is ready. </Text>
            Reach <Text style={{ fontWeight: '700', color: t.aText }}>70+</Text> with 5 minutes of speaking a day.
          </Text>
        </GlassCard>

        <View style={{ gap: 8 }}>
          <FEButton label="Unlock my plan" onPress={onFinish} />
          {onSkip && <FEButton label="Skip for now" onPress={onSkip} variant="ghost" />}
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: 26 },
  kicker: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  h1: { fontFamily: FE_FONT_FAMILY, fontSize: 27, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5, lineHeight: 31 },
  h2: { fontFamily: FE_FONT_FAMILY, fontSize: 22, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center' },
  body: { fontFamily: FE_FONT_FAMILY, fontSize: 14, textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  overline: { fontFamily: FE_FONT_FAMILY, fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6, marginBottom: 4 },
  fine: { fontFamily: FE_FONT_FAMILY, fontSize: 12, textAlign: 'center' },
  recPill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5E7A' },
});
