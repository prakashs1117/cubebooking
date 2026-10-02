import React from 'react';
import { View, Text } from 'react-native';
import FEScreen from '@screens/fe/FEScreen';
import { GlassCard, Section, ProgressBar, Gate, LockedCard } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY, FE_PILLARS } from '@demand/shared/fe';
import { useFeAuthStore } from '@stores/feAuthStore';

export default function ProgressScreen() {
  const t = useFETheme();
  const me = useFeAuthStore((s) => s.user);
  const pillars = me?.latestScore?.pillars ?? {};

  return (
    <FEScreen title="Progress" subtitle="Your growth across the six pillars">
      <Section title="Pillar mastery">
        <GlassCard style={{ gap: 14 }}>
          {FE_PILLARS.map((p) => {
            const pct = (pillars[p.id] ?? 0) / 100;
            return (
              <View key={p.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '600', color: t.text }}>
                    {p.short}
                  </Text>
                  <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12, fontWeight: '600', color: t.text3 }}>
                    {Math.round(pct * 100)}%
                  </Text>
                </View>
                <ProgressBar value={pct} />
              </View>
            );
          })}
        </GlassCard>
      </Section>

      <Section title="Certificates">
        <Gate
          feature="certificates"
          upgrade={
            <LockedCard
              feature="certificates"
              title="Earn shareable certificates"
              sub="Complete pathways and share to LinkedIn"
              icon="cert"
            />
          }
        >
          <GlassCard>
            <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 13, color: t.text2 }}>
              No certificates yet — keep practicing to earn your first.
            </Text>
          </GlassCard>
        </Gate>
      </Section>
    </FEScreen>
  );
}
