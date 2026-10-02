import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppBackground, GlassCard, GradIcon, Section, DrillCard, Gate, LockedCard, Pressable, Chip } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { useFeAuthStore } from '@stores/feAuthStore';
import { FE_FONT_FAMILY, type FEFeatureKey, type FETone } from '@demand/shared/fe';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PracticeStackParamList } from '@navigation/types';

interface PracticeMode {
  id: string;
  feature: FEFeatureKey;
  icon: string;
  tone: FETone;
  title: string;
  sub: string;
  tag?: string;
  tagColor?: string;
  lock?: string;
}

interface ScenarioPack {
  id: string;
  icon: string;
  tone: FETone;
  title: string;
  level: string;
}

const PRACTICE_MODES: PracticeMode[] = [
  { id: 'daily', feature: 'dailySpeak', icon: 'mic', tone: 'iris', title: 'Daily Speak Challenge', sub: 'One prompt, 90 seconds, instant AI feedback.', tag: 'Streak +1', tagColor: '#5EE39A' },
  { id: 'rapid', feature: 'practice', icon: 'zap', tone: 'blue', title: 'Rapid Response Drills', sub: '3-second countdown, then you speak. Kills translation lag.', tag: 'Fluency', tagColor: '#5EE39A' },
  { id: 'topics', feature: 'practice', icon: 'timer', tone: 'orange', title: 'Table Topics', sub: 'Draw a topic, get word hints, speak to the signal timer.', tag: 'Offline', tagColor: '#5EE39A' },
  { id: 'ai', feature: 'aiPartner', icon: 'chat', tone: 'iris', title: 'AI Conversation Partner', sub: 'Roleplay a client call, interview or tough stakeholder.', lock: 'Gold' },
  { id: 'shadow', feature: 'shadow', icon: 'headphones', tone: 'teal', title: 'Shadow & Compare', sub: 'Match a model speaker; see your waveform side by side.', lock: 'Silver' },
  { id: 'framework', feature: 'framework', icon: 'layers', tone: 'gold', title: 'Framework Builder', sub: 'PREP · STAR · SCQA — build then deliver a structured point.', lock: 'Gold' },
  { id: 'journal', feature: 'practice', icon: 'book', tone: 'green', title: 'Private Voice Journal', sub: 'Speak your thoughts. Never shared, never scored.', tag: 'Free forever', tagColor: '#5EE39A' },
];

const SCENARIO_PACKS: ScenarioPack[] = [
  { id: 'demand', icon: 'chat', tone: 'blue', title: 'Client demand call', level: 'Gold' },
  { id: 'interview', icon: 'person', tone: 'iris', title: 'Job interview', level: 'Gold' },
  { id: 'standup', icon: 'megaphone', tone: 'orange', title: 'Team stand-up', level: 'Gold' },
  { id: 'negotiate', icon: 'trophy', tone: 'pink', title: 'Negotiation', level: 'Diamond' },
];

export default function PracticeScreen() {
  const t = useFETheme();
  const { top } = useSafeAreaInsets();
  const me = useFeAuthStore((s) => s.user);
  const navigation = useNavigation<NativeStackNavigationProp<PracticeStackParamList>>();

  const handleDrillPress = (modeId: string) => {
    if (modeId === 'topics') {
      navigation.navigate('TableTopics');
    }
    // Other modes will route to upgrade sheet or their own screens later
  };

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: top + 12, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: t.text }]}>Practice</Text>
        <Text style={[styles.subtitle, { color: t.text2 }]}>Every session, you do the talking.</Text>

        {/* Hero: Today's Challenge */}
        <Pressable scale={0.98} style={{ marginTop: 16, marginBottom: 16 }}>
          <View
            style={{
              borderRadius: 18,
              padding: 20,
              backgroundColor: t.a1,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View style={{ position: 'absolute', right: -40, bottom: -20, opacity: 0.12 }}>
              <GradIcon name="mic" tone="iris" size={120} />
            </View>
            <View style={{ position: 'relative', zIndex: 1 }}>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>
                TODAY'S CHALLENGE
              </Text>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 6 }}>
                Speak for 90 seconds
              </Text>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, color: 'rgba(255,255,255,0.88)', marginTop: 8, maxWidth: 220 }}>
                Keep your streak alive and earn instant feedback.
              </Text>
              <Pressable scale={0.95} style={{ alignSelf: 'flex-start', marginTop: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: '#fff' }}>
                  <GradIcon name="mic" tone="iris" size={14} />
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 14, fontWeight: '800', color: t.a1 }}>
                    Start
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Pressable>

        {/* Practice Modes */}
        <View style={{ gap: 8, marginBottom: 4 }}>
          {PRACTICE_MODES.map((mode) => (
            <Gate key={mode.id} feature={mode.feature}>
              <Pressable scale={0.98} onPress={() => handleDrillPress(mode.id)}>
                <GlassCard>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <GradIcon name={mode.icon} tone={mode.tone} size={46} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
                          {mode.title}
                        </Text>
                        {mode.lock ? (
                          <Chip label={mode.lock} tone="text3" />
                        ) : mode.tag ? (
                          <View style={{ backgroundColor: mode.tagColor + '24', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 }}>
                            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 10, fontWeight: '700', color: mode.tagColor }}>
                              {mode.tag}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 3 }}>
                        {mode.sub}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            </Gate>
          ))}
        </View>

        {/* Play & Learn */}
        <Pressable scale={0.98} onPress={() => navigation.navigate('GamesHub')} style={{ marginTop: 16, marginBottom: 4 }}>
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <GradIcon name="zap" tone="pink" size={46} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
                    Play &amp; learn
                  </Text>
                  <View style={{ backgroundColor: '#FFB066', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 }}>
                    <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 9, fontWeight: '800', color: '#3a2600' }}>NEW</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 3 }}>
                  Fun 2-minute games that build the habit
                </Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>

        {/* Scenario Packs */}
        <Section title="Scenario packs" action="Unlock all">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginHorizontal: -18 }}
          >
            {SCENARIO_PACKS.map((pack) => (
              <Pressable key={pack.id} scale={0.96}>
                <GlassCard style={{ width: 130 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <GradIcon name={pack.icon} tone={pack.tone} size={36} />
                    <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12, fontWeight: '700', color: t.text3 }}>🔒</Text>
                  </View>
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '700', color: t.text, lineHeight: 18 }}>
                    {pack.title}
                  </Text>
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 10, fontWeight: '700', color: t.aText, marginTop: 6 }}>
                    {pack.level}
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
          </ScrollView>
        </Section>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18 },
  title: { fontFamily: FE_FONT_FAMILY, fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontFamily: FE_FONT_FAMILY, fontSize: 13.5, fontWeight: '500', marginTop: 3 },
});
