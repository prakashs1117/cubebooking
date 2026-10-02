import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { AppBackground, GradIcon, FEGlyph, FEButton, Pressable } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';
import type { PracticeStackParamList } from '@navigation/types';

/**
 * Shared "coming soon" screen for the not-yet-built games (Daily Prompt,
 * Emoji Story, Tongue-Twister Ladder, Speak Battle). Keeps the hub cards live
 * instead of dead-ending. Content is driven by route params.
 */
export default function GamePlaceholderScreen() {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<PracticeStackParamList, 'GamePlaceholder'>>();

  return (
    <AppBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 26 }}>
        <Pressable scale={0.9} onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.stroke }]}>
          <FEGlyph name="x" size={18} color={t.text2} />
        </Pressable>

        <View style={styles.body}>
          <GradIcon name={params.icon} tone={params.tone} size={72} glyph={0.52} />
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.eyebrow, { color: t.aText }]}>{params.title.toUpperCase()}</Text>
            <Text style={[styles.desc, { color: t.text }]}>{params.desc}</Text>
            <View style={[styles.soonChip, { backgroundColor: t.chip, borderColor: t.stroke }]}>
              <FEGlyph name="clock" size={14} color={t.text2} />
              <Text style={[styles.soonText, { color: t.text2 }]}>Coming soon</Text>
            </View>
          </View>
        </View>

        <FEButton label="Back to games" onPress={() => navigation.goBack()} />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  eyebrow: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  desc: { fontFamily: FE_FONT_FAMILY, fontSize: 21, fontWeight: '800', marginTop: 12, lineHeight: 29, letterSpacing: -0.3, textAlign: 'center', maxWidth: 300 },
  soonChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  soonText: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '700' },
});
