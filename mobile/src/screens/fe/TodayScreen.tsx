import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import FEScreen from '@screens/fe/FEScreen';
import { GlassCard, Ring, StatTile, Section, GradIcon, Chip } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY, FE_PILLARS } from '@demand/shared/fe';
import { useFeDailyPrompt } from '@hooks/fe/useFE';
import { useFeAuthStore } from '@stores/feAuthStore';

export default function TodayScreen() {
  const t = useFETheme();
  const me = useFeAuthStore((s) => s.user);
  const meLoading = !me;
  const { data: prompt, isLoading: promptLoading } = useFeDailyPrompt();

  const score = me?.latestScore?.overall ?? 0;
  const streak = me?.streak?.current ?? 0;
  const firstName = me?.firstName ?? 'there';

  return (
    <FEScreen title={`Hi, ${firstName}`} subtitle="Your daily 60 seconds of growth">
      <GlassCard pad={20} style={{ alignItems: 'center' }}>
        {meLoading ? (
          <View style={{ height: 132, justifyContent: 'center' }}>
            <ActivityIndicator color={t.aText} />
          </View>
        ) : (
          <Ring value={score} size={132} sublabel="Confidence" />
        )}
        <Text
          style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '600', color: t.text2, marginTop: 12 }}
        >
          🔥 {streak}-day streak · keep it going
        </Text>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatTile value={me?.xp ?? 0} label="XP" />
        <StatTile value={me?.level ?? 0} label="Level" />
        <StatTile value={streak} label="Day streak" />
      </View>

      <Section title="Six pillars">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FE_PILLARS.map((p) => (
            <Chip key={p.id} label={p.short} tone={p.tone} />
          ))}
        </View>
      </Section>

      <Section title="Daily Speak" action="See all">
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <GradIcon name="mic" tone="iris" size={46} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
                {promptLoading ? 'Loading today’s prompt…' : prompt?.text ?? 'No prompt available'}
              </Text>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 2 }}>
                60-second warm-up · +5 credits
              </Text>
            </View>
          </View>
        </GlassCard>
      </Section>
    </FEScreen>
  );
}
