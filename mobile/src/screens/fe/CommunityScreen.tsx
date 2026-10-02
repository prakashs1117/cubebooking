import React from 'react';
import { View, Text } from 'react-native';
import FEScreen from '@screens/fe/FEScreen';
import { GlassCard, GradIcon, Section, Avatar } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export default function CommunityScreen() {
  const t = useFETheme();
  return (
    <FEScreen title="Community" subtitle="Rooms, buddies & coaches">
      <Section title="Happening now">
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <GradIcon name="megaphone" tone="orange" size={46} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
                Earn the Mic · Live
              </Text>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 2 }}>
                12 listening · 3 in queue
              </Text>
            </View>
          </View>
        </GlassCard>
      </Section>

      <Section title="Matched for you">
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name="Priya Nair" size={44} ring />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
                Priya Nair
              </Text>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3, marginTop: 2 }}>
                Practice buddy · same goals
              </Text>
            </View>
          </View>
        </GlassCard>
      </Section>
    </FEScreen>
  );
}
