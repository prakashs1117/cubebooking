import React from 'react';
import { View, Text, Switch } from 'react-native';
import FEScreen from '@screens/fe/FEScreen';
import { GlassCard, Section, Segmented, Avatar, Pressable, GradIcon, FEButton } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { useAppearanceStore } from '@stores/appearanceStore';
import { useFeAuthStore } from '@stores/feAuthStore';
import {
  FE_FONT_FAMILY,
  FE_ACCENT_KEYS,
  FE_RADIUS_RANGE,
  FE_TIERS,
  type FEAccentKey,
} from '@demand/shared/fe';

export default function ProfileScreen() {
  const t = useFETheme();
  const { theme, accent, radius, animations, setTheme, setAccent, setRadius, setAnimations } =
    useAppearanceStore();
  const user = useFeAuthStore((s) => s.user);
  const logout = useFeAuthStore((s) => s.logout);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Guest';

  return (
    <FEScreen title="Profile" subtitle={`${displayName} · ${user?.tier ?? 'free'} plan`}>
      <GlassCard style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name={displayName} size={72} ring />
        <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 20, fontWeight: '800', color: t.text }}>
          {displayName}
        </Text>
        <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12.5, color: t.text3 }}>{user?.email}</Text>
      </GlassCard>

      <Section title="Appearance">
        <GlassCard style={{ gap: 16 }}>
          <Segmented
            options={[
              { id: 'system', label: 'System' },
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
            ]}
            value={theme}
            onChange={(id) => setTheme(id as 'system' | 'light' | 'dark')}
          />

          {/* Accent swatches */}
          <View>
            <Text style={styles_label(t)}>Accent</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              {FE_ACCENT_KEYS.map((key) => {
                const active = key === accent;
                return (
                  <Pressable key={key} onPress={() => setAccent(key as FEAccentKey)} scale={0.9}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: key,
                        borderWidth: active ? 3 : 0,
                        borderColor: t.text,
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Radius stepper */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles_label(t)}>Corner radius · {radius}px</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Pressable onPress={() => setRadius(radius - 2)} scale={0.9}>
                <GradIcon name="x" tone="slate" size={30} glow={false} />
              </Pressable>
              <Pressable onPress={() => setRadius(radius + 2)} scale={0.9}>
                <GradIcon name="plus" tone="iris" size={30} glow={false} />
              </Pressable>
            </View>
          </View>
          <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 11, color: t.text3 }}>
            Range {FE_RADIUS_RANGE.min}–{FE_RADIUS_RANGE.max}px
          </Text>

          {/* Animations */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles_label(t)}>Animations</Text>
            <Switch value={animations} onValueChange={setAnimations} />
          </View>
        </GlassCard>
      </Section>

      <Section title="Your plan">
        {FE_TIERS.map((tier) => (
          <GlassCard key={tier.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: t.text }}>
                  {tier.name} {tier.popular ? '★' : ''}
                </Text>
                <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 12, color: t.text3, marginTop: 2 }}>
                  {tier.sub}
                </Text>
              </View>
              <Text style={{ fontFamily: FE_FONT_FAMILY, fontSize: 18, fontWeight: '800', color: t.text }}>
                {tier.price}
                <Text style={{ fontSize: 12, color: t.text3 }}>{tier.per ?? ''}</Text>
              </Text>
            </View>
          </GlassCard>
        ))}
      </Section>

      <FEButton label="Sign out" variant="ghost" onPress={logout} />
    </FEScreen>
  );
}

const styles_label = (t: { text2: string }) => ({
  fontFamily: FE_FONT_FAMILY,
  fontSize: 13,
  fontWeight: '600' as const,
  color: t.text2,
});
