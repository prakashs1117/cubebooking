import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';

import {
  AppBackground,
  GradIcon,
  FEGlyph,
  FEButton,
  FEWaveform,
  Pressable,
} from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { useFeAuthStore } from '@stores/feAuthStore';
import { feSaveGameResult } from '@services/fe/feApi';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

const GAME_ID = 'filler-slayer';

type Phase = 'ready' | 'count' | 'play' | 'over';

const FILLERS = [
  'um',
  'like',
  'uh',
  'you know',
  'actually',
  'basically',
  'so',
  'literally',
  'kind of',
  'I mean',
];
const PROMPTS = [
  'Talk about your last weekend.',
  'Describe your dream job.',
  'Pitch your favourite app.',
  'Explain how to make tea.',
  'Convince me to visit your city.',
];
const GAME_SECS = 30;
const SPAWN_MS = 780;

interface BubbleData {
  id: number;
  word: string;
  x: number; // percent 0..100
  dur: number; // seconds
}

// ─────────────────────────────────────────────────────────
// A single rising, tappable filler bubble (Reanimated).
// ─────────────────────────────────────────────────────────
function Bubble({
  data,
  riseDist,
  a1,
  a2,
  onPop,
  onExpire,
}: {
  data: BubbleData;
  riseDist: number;
  a1: string;
  a2: string;
  onPop: (id: number) => void;
  onExpire: (id: number) => void;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: data.dur * 1000, easing: Easing.linear },
      finished => {
        if (finished) runOnJS(onExpire)(data.id);
      },
    );
    // animate once on mount; parent removes on pop/expire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * riseDist }],
    opacity: progress.value > 0.94 ? 1 - (progress.value - 0.94) / 0.06 : 1,
  }));

  return (
    <Animated.View style={[styles.bubbleWrap, { left: `${data.x}%` }, style]}>
      <Pressable scale={0.8} onPress={() => onPop(data.id)}>
        <LinearGradient
          colors={[a1, a2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bubble}
        >
          <Text style={styles.bubbleText}>{data.word}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function FillerWordSlayerScreen() {
  const t = useFETheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [phase, setPhase] = useState<Phase>('ready');
  const [count, setCount] = useState(3);
  const [time, setTime] = useState(GAME_SECS);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [popped, setPopped] = useState(0);
  const [missed, setMissed] = useState(0);
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  const idRef = useRef(0);
  const comboRef = useRef(0);
  const handledRef = useRef<Set<number>>(new Set());
  const fieldH = useRef(Dimensions.get('window').height);
  const savedRef = useRef(false);

  const user = useFeAuthStore(s => s.user);
  const setUser = useFeAuthStore(s => s.setUser);

  const flash = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const onField = (e: LayoutChangeEvent) => {
    fieldH.current = e.nativeEvent.layout.height;
  };

  // ── Countdown 3 · 2 · 1 · GO ──
  useEffect(() => {
    if (phase !== 'count') return;
    if (count <= 0) {
      setPhase('play');
      return;
    }
    const id = setTimeout(() => setCount(c => c - 1), 700);
    return () => clearTimeout(id);
  }, [phase, count]);

  // ── Game clock ──
  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => {
      setTime(s => {
        if (s <= 1) {
          clearInterval(id);
          setPhase('over');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Spawn bubbles while playing ──
  useEffect(() => {
    if (phase !== 'play') return;
    const spawn = () => {
      const id = ++idRef.current;
      const word = FILLERS[Math.floor(Math.random() * FILLERS.length)];
      const x = 8 + Math.random() * 74;
      const dur = 3.1 + Math.random() * 1.6;
      setBubbles(b => [...b, { id, word, x, dur }]);
    };
    spawn();
    const iv = setInterval(spawn, SPAWN_MS);
    return () => clearInterval(iv);
  }, [phase]);

  // ── On game over: persist result + award XP (fires once) ──
  useEffect(() => {
    if (phase !== 'over' || savedRef.current) return;
    savedRef.current = true;

    const clarityPct =
      popped + missed > 0
        ? Math.round((popped / (popped + missed)) * 100)
        : 100;
    const stars = clarityPct >= 90 ? 3 : clarityPct >= 70 ? 2 : 1;
    const xpAwarded = stars * 10 + Math.min(20, popped);

    // Optimistically reflect XP locally so the Today screen updates immediately.
    if (user) setUser({ ...user, xp: (user.xp ?? 0) + xpAwarded });

    // Best-effort persist (no-op if offline / not authed).
    feSaveGameResult({
      gameId: GAME_ID,
      score,
      stars,
      xpAwarded,
      stats: { popped, missed, bestCombo, clarity: clarityPct },
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const remove = useCallback((id: number) => {
    setBubbles(b => b.filter(x => x.id !== id));
  }, []);

  const pop = useCallback(
    (id: number) => {
      if (handledRef.current.has(id)) return;
      handledRef.current.add(id);
      remove(id);
      comboRef.current += 1;
      const c = comboRef.current;
      setCombo(c);
      setBestCombo(bc => Math.max(bc, c));
      setScore(s => s + 10 * Math.min(5, Math.ceil(c / 3)));
      setPopped(p => p + 1);
    },
    [remove],
  );

  const expire = useCallback(
    (id: number) => {
      if (handledRef.current.has(id)) return;
      handledRef.current.add(id);
      remove(id);
      comboRef.current = 0;
      setCombo(0);
      setMissed(m => m + 1);
      setScore(s => Math.max(0, s - 5));
      flash.value = withSequence(
        withTiming(0.35, { duration: 90 }),
        withTiming(0, { duration: 420 }),
      );
    },
    [remove, flash],
  );

  const reset = useCallback((nextPhase: Phase) => {
    handledRef.current.clear();
    comboRef.current = 0;
    savedRef.current = false;
    setBubbles([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setPopped(0);
    setMissed(0);
    setTime(GAME_SECS);
    setCount(3);
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setPhase(nextPhase);
  }, []);

  const clarity =
    popped + missed > 0 ? Math.round((popped / (popped + missed)) * 100) : 100;

  // ── Results ──
  if (phase === 'over') {
    const stars = clarity >= 90 ? 3 : clarity >= 70 ? 2 : 1;
    const headline =
      clarity >= 90
        ? 'Crystal clear!'
        : clarity >= 70
        ? 'Nicely done'
        : 'Keep practising';
    const tiles = [
      { v: String(popped), l: 'Slayed', c: '#16A34A' },
      { v: `${bestCombo}×`, l: 'Best combo', c: t.aText },
      { v: `${clarity}%`, l: 'Clarity', c: '#2563EB' },
    ];
    return (
      <AppBackground>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.results,
            { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <Animated.View
                key={i}
                entering={ZoomIn.delay(i * 120).duration(400)}
              >
                <FEGlyph
                  name="star"
                  size={i === 1 ? 52 : 42}
                  color={i < stars ? '#FFD66B' : t.track}
                />
              </Animated.View>
            ))}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.resHeadline, { color: t.aText }]}>
              {headline}
            </Text>
            <Text style={[styles.resScore, { color: t.text }]}>{score}</Text>
            <Text style={[styles.resPoints, { color: t.text3 }]}>POINTS</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            {tiles.map(m => (
              <View
                key={m.l}
                style={[
                  styles.resTile,
                  { backgroundColor: t.card, borderColor: t.stroke },
                ]}
              >
                <Text style={[styles.resTileVal, { color: m.c }]}>{m.v}</Text>
                <Text style={[styles.resTileLabel, { color: t.text3 }]}>
                  {m.l}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.resNote, { color: t.text2 }]}>
            You caught yourself{' '}
            <Text style={{ color: t.text, fontWeight: '800' }}>{popped}</Text>{' '}
            times. Awareness is the whole game — carry it into your next real
            conversation.
          </Text>

          <View style={{ width: '100%', gap: 10, marginTop: 4 }}>
            <FEButton label="Play again" onPress={() => reset('count')} />
            <FEButton
              label="Back to games"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
          </View>
        </Animated.View>
      </AppBackground>
    );
  }

  // ── Ready / countdown / play field ──
  return (
    <AppBackground>
      <View style={StyleSheet.absoluteFill} onLayout={onField}>
        {/* red flash on miss */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.flash, flashStyle]}
        />

        {/* HUD — close button always; timer + score only while playing */}
        <View style={[styles.hud, { top: insets.top + 8 }]}>
          <Pressable
            scale={0.9}
            onPress={() => navigation.goBack()}
            style={[
              styles.hudBtn,
              { backgroundColor: t.card, borderColor: t.stroke },
            ]}
          >
            <FEGlyph name="x" size={18} color={t.text2} />
          </Pressable>
          {phase === 'play' ? (
            <>
              <View
                style={[
                  styles.timerPill,
                  { backgroundColor: t.card, borderColor: t.stroke },
                ]}
              >
                <FEGlyph
                  name="clock"
                  size={15}
                  color={time <= 5 ? '#FF8DA1' : t.text2}
                />
                <Text
                  style={[
                    styles.timerText,
                    { color: time <= 5 ? '#FF8DA1' : t.text },
                  ]}
                >
                  {time}
                </Text>
              </View>
              <LinearGradient
                colors={[t.a1, t.a2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scorePill}
              >
                <Text style={styles.scoreText}>{score}</Text>
              </LinearGradient>
            </>
          ) : null}
        </View>

        {/* prompt + combo — only while playing */}
        {phase === 'play' ? (
          <View
            style={[styles.promptWrap, { top: insets.top + 62 }]}
            pointerEvents="none"
          >
            <Text style={[styles.promptEyebrow, { color: t.text3 }]}>
              KEEP TALKING ABOUT
            </Text>
            <Text style={[styles.promptText, { color: t.text }]}>{prompt}</Text>
            {combo >= 3 ? (
              <Animated.View
                key={combo}
                entering={ZoomIn.duration(300)}
                style={styles.comboChip}
              >
                <FEGlyph name="flame" size={14} color="#FFB066" />
                <Text style={styles.comboText}>{combo}× combo</Text>
              </Animated.View>
            ) : null}
          </View>
        ) : null}

        {/* bubbles */}
        {phase === 'play'
          ? bubbles.map(b => (
              <Bubble
                key={b.id}
                data={b}
                riseDist={fieldH.current}
                a1={t.a1}
                a2={t.a2}
                onPop={pop}
                onExpire={expire}
              />
            ))
          : null}

        {/* decorative waveform at base */}
        <View
          style={[styles.waveBase, { bottom: insets.bottom + 20 }]}
          pointerEvents="none"
        >
          <FEWaveform
            active={phase === 'play'}
            bars={40}
            height={40}
            color={t.aText}
          />
        </View>

        {/* ready / countdown overlay */}
        {phase !== 'play' ? (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            {phase === 'ready' ? (
              <Animated.View
                entering={FadeIn.duration(400)}
                style={{ alignItems: 'center', gap: 10, paddingHorizontal: 30 }}
              >
                <GradIcon name="zap" tone="iris" size={72} glyph={0.54} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.readyTitle, { color: t.text }]}>
                    Filler-Word Slayer
                  </Text>
                  <Text style={[styles.readyDesc, { color: t.text2 }]}>
                    Speak on the prompt out loud. Every filler word floats up —{' '}
                    <Text style={{ color: t.text, fontWeight: '800' }}>
                      tap to pop it
                    </Text>{' '}
                    before it escapes. Chain pops for combos.
                  </Text>
                </View>
                <FEButton
                  label="Start"
                  onPress={() => reset('count')}
                  style={{ width: 200 }}
                />
              </Animated.View>
            ) : (
              <Animated.Text
                key={count}
                entering={ZoomIn.duration(400)}
                style={[styles.countText, { color: t.text }]}
              >
                {count > 0 ? count : 'GO'}
              </Animated.Text>
            )}
          </View>
        ) : null}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flash: { backgroundColor: 'rgba(225,29,72,0.35)' },

  hud: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hudBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  timerText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '800',
    width: 22,
    textAlign: 'center',
  },
  scorePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 48,
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },

  promptWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 6,
    alignItems: 'center',
  },
  promptEyebrow: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  promptText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  comboChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,214,107,0.18)',
  },
  comboText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFB066',
  },

  bubbleWrap: { position: 'absolute', bottom: 0, zIndex: 4 },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  bubbleText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },

  waveBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
    opacity: 0.5,
  },

  overlay: {
    zIndex: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  readyTitle: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  readyDesc: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },
  countText: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 96,
    fontWeight: '800',
    letterSpacing: -3,
  },

  results: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    gap: 18,
  },
  resHeadline: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  resScore: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: -2,
    marginTop: 4,
  },
  resPoints: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  resTileVal: { fontFamily: FE_FONT_FAMILY, fontSize: 20, fontWeight: '800' },
  resTileLabel: { fontFamily: FE_FONT_FAMILY, fontSize: 10.5, marginTop: 2 },
  resNote: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 6,
  },
});
