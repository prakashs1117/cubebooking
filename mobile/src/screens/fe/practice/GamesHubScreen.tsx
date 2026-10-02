import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';

import {
  AppBackground,
  GlassCard,
  GradIcon,
  FEGlyph,
  Pressable,
} from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { useFeAuthStore } from '@stores/feAuthStore';
import { FE_FONT_FAMILY, type FETone } from '@demand/shared/fe';
import type { PracticeStackParamList } from '@navigation/types';

interface GameDef {
  id: string;
  icon: string;
  tone: FETone;
  title: string;
  tag?: string;
  desc: string;
  best: string;
}

/** The four non-flagship games (Filler-Word Slayer is the hero card). */
const FE_GAMES: GameDef[] = [
  {
    id: 'daily',
    icon: 'star',
    tone: 'gold',
    title: 'Daily Prompt',
    tag: 'Everyone',
    desc: 'One prompt a day for the whole community. Share your take.',
    best: '2,918 played today',
  },
  {
    id: 'emoji',
    icon: 'sparkle',
    tone: 'pink',
    title: 'Emoji Story',
    desc: 'Improvise a story from 3 random emojis in 30 seconds.',
    best: 'Streak 4',
  },
  {
    id: 'twister',
    icon: 'wave',
    tone: 'teal',
    title: 'Tongue-Twister Ladder',
    desc: 'Climb rungs of clarity. Nail one to unlock the next.',
    best: 'Rung 6/12',
  },
  {
    id: 'battle',
    icon: 'trophy',
    tone: 'orange',
    title: 'Speak Battle',
    tag: '1v1',
    desc: 'Same prompt, head to head. The room votes a winner.',
    best: 'Rank #7',
  },
];

export default function GamesHubScreen() {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<PracticeStackParamList>>();
  const xp = useFeAuthStore(s => s.user?.xp ?? 0);

  const openGame = (g: GameDef) => {
    navigation.navigate('GamePlaceholder', {
      title: g.title,
      desc: g.desc,
      icon: g.icon,
      tone: g.tone,
    });
  };

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <Pressable
              scale={0.9}
              onPress={() => navigation.goBack()}
              style={[
                styles.iconBtn,
                { backgroundColor: t.card, borderColor: t.stroke },
              ]}
            >
              <FEGlyph name="back" size={18} color={t.text2} />
            </Pressable>
            <Text style={[styles.title, { color: t.text }]}>Play</Text>
          </View>
          <View
            style={[
              styles.xpChip,
              { backgroundColor: t.card, borderColor: t.stroke },
            ]}
          >
            <FEGlyph name="zap" size={15} color="#FFB066" />
            <Text style={[styles.xpValue, { color: t.text }]}>{xp}</Text>
            <Text style={[styles.xpLabel, { color: t.text3 }]}>XP</Text>
          </View>
        </View>

        <Text style={[styles.intro, { color: t.text2 }]}>
          Learn by playing. 2-minute games that make speaking a habit — not a
          chore.
        </Text>

        {/* Flagship — Filler-Word Slayer */}
        <Pressable
          scale={0.98}
          onPress={() => navigation.navigate('FillerWordSlayer')}
        >
          <LinearGradient
            colors={[t.a1, t.a2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: t.radius }]}
          >
            <View style={styles.heroGlyph} pointerEvents="none">
              <FEGlyph name="zap" size={130} color="#ffffff" />
            </View>
            {/* faux floating filler bubbles */}
            <View style={styles.heroBubbles} pointerEvents="none">
              {['um', 'like', 'uh'].map((w, i) => (
                <View
                  key={w}
                  style={[
                    styles.fauxBubble,
                    { transform: [{ translateY: i % 2 ? -6 : 0 }] },
                  ]}
                >
                  <Text style={styles.fauxBubbleText}>{w}</Text>
                </View>
              ))}
            </View>

            <View style={{ padding: 20 }}>
              <View style={styles.mostPlayed}>
                <FEGlyph name="flame" size={13} color="#fff" />
                <Text style={styles.mostPlayedText}>MOST PLAYED</Text>
              </View>
              <Text style={styles.heroTitle}>Filler-Word Slayer</Text>
              <Text style={styles.heroDesc}>
                Pop every “um” before it escapes. 30 seconds. How clean can you
                speak?
              </Text>
              <View style={styles.playNow}>
                <FEGlyph name="play" size={16} color={t.a2} />
                <Text style={[styles.playNowText, { color: t.a2 }]}>
                  Play now
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Other games */}
        <View style={{ gap: 11 }}>
          {FE_GAMES.map(g => (
            <Pressable key={g.id} scale={0.98} onPress={() => openGame(g)}>
              <GlassCard pad={14}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 13,
                  }}
                >
                  <GradIcon name={g.icon} tone={g.tone} size={48} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Text style={[styles.gameTitle, { color: t.text }]}>
                        {g.title}
                      </Text>
                      {g.tag ? (
                        <View
                          style={[
                            styles.gameTag,
                            { backgroundColor: t.chip, borderColor: t.stroke },
                          ]}
                        >
                          <Text
                            style={[styles.gameTagText, { color: t.aText }]}
                          >
                            {g.tag}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.gameDesc, { color: t.text3 }]}>
                      {g.desc}
                    </Text>
                    <Text style={[styles.gameBest, { color: t.aText }]}>
                      {g.best}
                    </Text>
                  </View>
                  <FEGlyph name="chev" size={17} color={t.text3} />
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  xpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  xpValue: { fontFamily: FE_FONT_FAMILY, fontSize: 13, fontWeight: '800' },
  xpLabel: { fontFamily: FE_FONT_FAMILY, fontSize: 11, fontWeight: '600' },
  intro: { fontFamily: FE_FONT_FAMILY, fontSize: 13.5, lineHeight: 20 },

  hero: { padding: 0, overflow: 'hidden' },
  heroGlyph: { position: 'absolute', right: -10, top: -14, opacity: 0.18 },
  heroBubbles: {
    position: 'absolute',
    right: 24,
    bottom: 18,
    flexDirection: 'row',
    gap: 6,
    opacity: 0.9,
  },
  fauxBubble: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  fauxBubbleText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#fff',
  },
  mostPlayed: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  mostPlayedText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 12,
  },
  heroDesc: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    maxWidth: 230,
    lineHeight: 18,
  },
  playNow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  playNowText: { fontFamily: FE_FONT_FAMILY, fontSize: 14, fontWeight: '800' },

  gameTitle: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  gameTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  gameTagText: { fontFamily: FE_FONT_FAMILY, fontSize: 9.5, fontWeight: '800' },
  gameDesc: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 12.5,
    marginTop: 3,
    lineHeight: 17,
  },
  gameBest: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
});
