import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  AppBackground,
  GlassCard,
  GradIcon,
  Section,
  Pressable,
  Chip,
} from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { useCreatePracticeSession } from '@hooks/fe/useFE';
import { FE_FONT_FAMILY, type FETone } from '@demand/shared/fe';

interface TTCategory {
  id: string;
  title: string;
  icon: string;
  tone: FETone;
  desc: string;
  topics: string[];
  words: string[];
}

interface TTDuration {
  label: string;
  secs: number;
}

const TT_CATEGORIES: TTCategory[] = [
  {
    id: 'travel',
    title: 'Travel',
    icon: 'pin',
    tone: 'teal',
    desc: 'Places, journeys, culture shock',
    topics: [
      'A place that changed how you see the world',
      'Your best travel mistake — and what it taught you',
      'Convince us to visit your hometown',
      "The trip you would take if money didn't matter",
      'Airports: the best or worst part of travel?',
    ],
    words: [
      'wanderlust',
      'itinerary',
      'off the beaten path',
      'immersive',
      'layover',
      'detour',
      'hospitality',
      'souvenir',
      'off-season',
      'breathtaking',
    ],
  },
  {
    id: 'work',
    title: 'Professional',
    icon: 'chart',
    tone: 'blue',
    desc: 'Meetings, careers, workplace',
    topics: [
      'Sell your team on an idea they already rejected once',
      "The best manager you've ever had — what made them great?",
      'Should offices exist in 2030? Take a side',
      'A skill your industry undervalues',
      'Give a 2-minute status update on your life, stand-up style',
    ],
    words: [
      'stakeholder',
      'alignment',
      'trade-off',
      'prioritize',
      'milestone',
      'delegate',
      'roadmap',
      'actionable',
      'bandwidth',
      'win-win',
    ],
  },
  {
    id: 'life',
    title: 'Everyday life',
    icon: 'home',
    tone: 'gold',
    desc: 'Habits, food, small moments',
    topics: [
      "The small daily ritual you'd never give up",
      'Describe your perfect ordinary Sunday',
      "A household chore that's secretly satisfying",
      'The one thing you always overpack',
      'What your breakfast says about you',
    ],
    words: [
      'routine',
      'unwind',
      'savor',
      'declutter',
      'ritual',
      'cozy',
      'errands',
      'balance',
      'mindful',
      'simple pleasure',
    ],
  },
  {
    id: 'story',
    title: 'Storytelling',
    icon: 'book',
    tone: 'pink',
    desc: 'Memories, twists, characters',
    topics: [
      'Tell us about a time you got completely lost',
      'The most embarrassing moment you can now laugh about',
      'A stranger who left a mark on you',
      'The advice you ignored — and what happened next',
      'Start with: "I never expected the door to open..."',
    ],
    words: [
      'vivid',
      'suspense',
      'out of nowhere',
      'turning point',
      'in hindsight',
      'unforgettable',
      'heart pounding',
      'plot twist',
      'looking back',
      'to my surprise',
    ],
  },
  {
    id: 'debate',
    title: 'Opinions',
    icon: 'megaphone',
    tone: 'orange',
    desc: 'Hot takes, gentle debates',
    topics: [
      'Is being busy a status symbol? Argue one side',
      'Books or films — which tells better stories?',
      'Should everyone learn public speaking at school?',
      'Defend a popular thing everyone loves to hate',
      'Is talent overrated?',
    ],
    words: [
      'perspective',
      'evidence',
      'counterpoint',
      'nuance',
      'firmly believe',
      'on the other hand',
      'consider this',
      'the data shows',
      'common ground',
      'ultimately',
    ],
  },
  {
    id: 'wild',
    title: 'Wildcard',
    icon: 'sparkle',
    tone: 'iris',
    desc: 'Random, playful, unexpected',
    topics: [
      "You're a spoon. Describe your day",
      'Pitch a terrible business idea with total confidence',
      'If animals could talk, which would be the rudest?',
      'Explain the internet to someone from 1850',
      'What superpower would make life worse?',
    ],
    words: [
      'imagine',
      'absurd',
      'ridiculous',
      'hear me out',
      'plot spoiler',
      'genius',
      'chaos',
      'legendary',
      'trust me',
      'why not',
    ],
  },
];

const TT_DURATIONS: TTDuration[] = [
  { label: '1:00', secs: 60 },
  { label: '1:30', secs: 90 },
  { label: '2:00', secs: 120 },
  { label: '3:00', secs: 180 },
];

function feSignalPlan(total: number) {
  const green = total >= 120 ? total - 60 : Math.round(total * 0.5);
  const yellow = total >= 120 ? total - 30 : Math.round(total * 0.75);
  return { green, yellow, red: total - 12 };
}

function feSignalPhase(elapsed: number, plan: ReturnType<typeof feSignalPlan>) {
  if (elapsed >= plan.red) return 'red';
  if (elapsed >= plan.yellow) return 'yellow';
  if (elapsed >= plan.green) return 'green';
  return 'idle';
}

const PHASE_CONFIG = {
  idle: {
    color: '#8B5CF6',
    label: 'Find your footing',
    sub: 'Open with one clear point',
  },
  green: {
    color: '#5EE39A',
    label: 'On track',
    sub: "You've hit the minimum — develop it",
  },
  yellow: {
    color: '#FFD66B',
    label: 'Start closing',
    sub: 'Head towards your ending line',
  },
  red: {
    color: '#FF8DA1',
    label: 'Wrap it up!',
    sub: 'Land the last sentence — now',
  },
};

function feFmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function TableTopicsScreen() {
  const t = useFETheme();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const createSession = useCreatePracticeSession();

  const [step, setStep] = useState<'setup' | 'speak' | 'done'>('setup');
  const [catId, setCatId] = useState('travel');
  const [durIx, setDurIx] = useState(2);
  const [coach, setCoach] = useState(true);
  const [topic, setTopic] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [wordSet, setWordSet] = useState<string[]>([]);
  const [used, setUsed] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cat = TT_CATEGORIES.find(c => c.id === catId);
  const total = TT_DURATIONS[durIx].secs;
  const plan = feSignalPlan(total);
  const phase = feSignalPhase(elapsed, plan);
  const remain = Math.max(0, total - elapsed);

  const drawWords = (c: TTCategory) => {
    const pool = [...c.words].sort(() => Math.random() - 0.5);
    setWordSet(pool.slice(0, 4));
  };

  const start = (redraw = true) => {
    if (!cat) return;
    if (redraw) {
      const pool = cat.topics.filter(t => t !== topic);
      setTopic(pool[Math.floor(Math.random() * pool.length)]);
    }
    drawWords(cat);
    setUsed({});
    setElapsed(0);
    setPaused(false);
    setStep('speak');
  };

  useEffect(() => {
    if (step !== 'speak' || paused) return;
    timerRef.current = setInterval(() => setElapsed(e => e + 0.25), 250);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, paused]);

  useEffect(() => {
    if (step === 'speak' && elapsed >= total) {
      setStep('done');
    }
  }, [elapsed, step, total]);

  const usedCount = Object.values(used).filter(Boolean).length;
  const finishedInWindow = elapsed >= plan.green;

  const handleSaveAndExit = async () => {
    try {
      await createSession.mutateAsync({
        kind: 'table-topics',
        durationSec: Math.round(elapsed),
        xpAwarded: 10,
        coachNotes: [],
      });
      navigation.goBack();
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  if (!cat) return null;

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: top + 12, paddingBottom: 140 },
        ]}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <Pressable onPress={() => navigation.goBack()} scale={0.9}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: t.chip,
                borderWidth: 1,
                borderColor: t.stroke,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>←</Text>
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FE_FONT_FAMILY,
                fontSize: 17,
                fontWeight: '800',
                color: t.text,
              }}
            >
              Table Topics
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(94,227,154,0.14)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontFamily: FE_FONT_FAMILY,
                fontSize: 10,
                fontWeight: '700',
                color: '#5EE39A',
              }}
            >
              ● Works offline
            </Text>
          </View>
        </View>

        {/* SETUP STEP */}
        {step === 'setup' ? (
          <View style={{ gap: 16 }}>
            <Text
              style={{
                fontFamily: FE_FONT_FAMILY,
                fontSize: 13.5,
                color: t.text2,
                lineHeight: 20,
              }}
            >
              Draw a surprise topic, think on your feet, and speak to the timer
              — no internet, no recording, just reps.
            </Text>

            {/* Category Grid */}
            <Section title="Pick a category" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {TT_CATEGORIES.map(c => {
                const active = c.id === catId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCatId(c.id)}
                    scale={0.96}
                    style={{ flex: 1, minWidth: '45%' }}
                  >
                    <GlassCard
                      style={{
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? t.a1 : t.stroke,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                        }}
                      >
                        <GradIcon name={c.icon} tone={c.tone} size={32} />
                        {active ? (
                          <Text style={{ color: t.aText }}>✓</Text>
                        ) : null}
                      </View>
                      <Text
                        style={{
                          fontFamily: FE_FONT_FAMILY,
                          fontSize: 13,
                          fontWeight: '700',
                          color: t.text,
                        }}
                      >
                        {c.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FE_FONT_FAMILY,
                          fontSize: 10,
                          color: t.text3,
                          marginTop: 2,
                        }}
                      >
                        {c.desc}
                      </Text>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>

            {/* Duration */}
            <Section title="Speaking time" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {TT_DURATIONS.map((d, ix) => (
                <Pressable
                  key={d.label}
                  onPress={() => setDurIx(ix)}
                  scale={0.95}
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      backgroundColor: ix === durIx ? t.a1 : t.chip,
                      borderWidth: 1,
                      borderColor: ix === durIx ? t.a1 : t.stroke,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FE_FONT_FAMILY,
                        fontSize: 14,
                        fontWeight: '700',
                        color: ix === durIx ? '#fff' : t.text,
                        textAlign: 'center',
                      }}
                    >
                      {d.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Word Coach Toggle */}
            <Pressable onPress={() => setCoach(!coach)} scale={0.98}>
              <GlassCard>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <GradIcon name="bulb" tone="gold" size={40} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: FE_FONT_FAMILY,
                        fontSize: 14,
                        fontWeight: '700',
                        color: t.text,
                      }}
                    >
                      Word coach
                    </Text>
                    <Text
                      style={{
                        fontFamily: FE_FONT_FAMILY,
                        fontSize: 11,
                        color: t.text3,
                        marginTop: 2,
                      }}
                    >
                      Shows {cat.title.toLowerCase()} words to weave in
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 46,
                      height: 27,
                      borderRadius: 999,
                      padding: 3,
                      backgroundColor: coach ? t.a1 : t.track,
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 21,
                        height: 21,
                        borderRadius: 999,
                        backgroundColor: '#fff',
                        transform: [{ translateX: coach ? 19 : 0 }],
                      }}
                    />
                  </View>
                </View>
              </GlassCard>
            </Pressable>

            {/* Draw Topic Button */}
            <Pressable onPress={() => start(true)} scale={0.97}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: t.a1,
                }}
              >
                <Text style={{ fontSize: 16 }}>⚡</Text>
                <Text
                  style={{
                    fontFamily: FE_FONT_FAMILY,
                    fontSize: 15,
                    fontWeight: '800',
                    color: '#fff',
                  }}
                >
                  Draw my topic
                </Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* SPEAK STEP */}
        {step === 'speak' ? (
          <View style={{ gap: 16 }}>
            {/* Topic Card */}
            <GlassCard>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <GradIcon name={cat.icon} tone={cat.tone} size={24} />
                <Text
                  style={{
                    fontFamily: FE_FONT_FAMILY,
                    fontSize: 10,
                    fontWeight: '700',
                    color: t.text3,
                    flex: 1,
                  }}
                >
                  {cat.title.toUpperCase()} · YOUR TOPIC
                </Text>
                <Pressable onPress={() => start(true)} scale={0.88}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: t.chip,
                      borderWidth: 1,
                      borderColor: t.stroke,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>🔄</Text>
                  </View>
                </Pressable>
              </View>
              <Text
                style={{
                  fontFamily: FE_FONT_FAMILY,
                  fontSize: 17,
                  fontWeight: '700',
                  color: t.text,
                  lineHeight: 24,
                }}
              >
                {topic}
              </Text>
            </GlassCard>

            {/* Timer Ring (simplified) */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: t.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor:
                    PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].color,
                }}
              >
                <Text
                  style={{
                    fontFamily: FE_FONT_FAMILY,
                    fontSize: 36,
                    fontWeight: '800',
                    color: phase === 'red' ? '#FF8DA1' : t.text,
                  }}
                >
                  {feFmt(remain)}
                </Text>
                <Text
                  style={{
                    fontFamily: FE_FONT_FAMILY,
                    fontSize: 10,
                    fontWeight: '700',
                    color:
                      PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].color,
                    marginTop: 4,
                  }}
                >
                  {PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].label}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: FE_FONT_FAMILY,
                  fontSize: 12,
                  color: t.text2,
                  textAlign: 'center',
                }}
              >
                {PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].sub}
              </Text>
            </View>

            {/* Word Coach */}
            {coach && wordSet.length > 0 ? (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 11,
                      fontWeight: '700',
                      color: t.text3,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Try these words
                  </Text>
                  <Pressable onPress={() => drawWords(cat)} scale={0.9}>
                    <Text
                      style={{
                        fontFamily: FE_FONT_FAMILY,
                        fontSize: 12,
                        fontWeight: '700',
                        color: t.aText,
                      }}
                    >
                      🔄 Shuffle
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}
                >
                  {wordSet.map(w => (
                    <Pressable
                      key={w}
                      onPress={() => setUsed(u => ({ ...u, [w]: !u[w] }))}
                      scale={0.93}
                    >
                      <View
                        style={{
                          paddingHorizontal: 11,
                          paddingVertical: 7,
                          borderRadius: 999,
                          borderWidth: 1.5,
                          borderColor: used[w] ? '#5EE39A' : t.stroke2,
                          backgroundColor: used[w]
                            ? 'rgba(94,227,154,0.14)'
                            : t.chip,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: FE_FONT_FAMILY,
                            fontSize: 12,
                            fontWeight: '700',
                            color: used[w] ? '#5EE39A' : t.text,
                          }}
                        >
                          {used[w] ? '✓ ' : ''}
                          {w}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Controls */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setPaused(!paused)}
                scale={0.95}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: t.chip,
                    borderWidth: 1,
                    borderColor: t.stroke2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{paused ? '▶️' : '⏸️'}</Text>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 14,
                      fontWeight: '700',
                      color: t.text,
                    }}
                  >
                    {paused ? 'Resume' : 'Pause'}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => setStep('done')}
                scale={0.95}
                style={{ flex: 1.2 }}
              >
                <View
                  style={{
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: t.a1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>✓</Text>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 14,
                      fontWeight: '800',
                      color: '#fff',
                    }}
                  >
                    I'm done
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* DONE STEP */}
        {step === 'done' ? (
          <View style={{ gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 12 }}>
              <GradIcon
                name={finishedInWindow ? 'trophy' : 'flame'}
                tone={finishedInWindow ? 'gold' : 'orange'}
                size={64}
              />
              <Text
                style={{
                  fontFamily: FE_FONT_FAMILY,
                  fontSize: 22,
                  fontWeight: '800',
                  color: t.text,
                  textAlign: 'center',
                }}
              >
                {finishedInWindow
                  ? 'Landed in the window!'
                  : 'Good rep — go again'}
              </Text>
              <Text
                style={{
                  fontFamily: FE_FONT_FAMILY,
                  fontSize: 13,
                  color: t.text2,
                  textAlign: 'center',
                  lineHeight: 18,
                }}
              >
                {finishedInWindow
                  ? 'You spoke past the green signal — that’s a qualifying Table Topics answer.'
                  : 'You wrapped before the green signal. Next round, stretch one idea a little further.'}
              </Text>
            </View>

            <GlassCard>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-around' }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 20,
                      fontWeight: '800',
                      color: t.text,
                    }}
                  >
                    {feFmt(Math.min(elapsed, total))}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 10,
                      fontWeight: '700',
                      color: t.text3,
                      marginTop: 4,
                    }}
                  >
                    SPOKE FOR
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 20,
                      fontWeight: '800',
                      color:
                        PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].color,
                    }}
                  >
                    {phase === 'idle'
                      ? '—'
                      : PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 10,
                      fontWeight: '700',
                      color: t.text3,
                      marginTop: 4,
                    }}
                  >
                    SIGNAL
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 20,
                      fontWeight: '800',
                      color: '#5EE39A',
                    }}
                  >
                    {usedCount}/{wordSet.length}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 10,
                      fontWeight: '700',
                      color: t.text3,
                      marginTop: 4,
                    }}
                  >
                    WORDS USED
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Unused words reminder */}
            {coach && usedCount < wordSet.length ? (
              <GlassCard>
                <Text
                  style={{
                    fontFamily: FE_FONT_FAMILY,
                    fontSize: 11,
                    fontWeight: '700',
                    color: t.text3,
                    marginBottom: 8,
                  }}
                >
                  WORDS TO TRY NEXT ROUND
                </Text>
                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
                >
                  {wordSet
                    .filter(w => !used[w])
                    .map(w => (
                      <View
                        key={w}
                        style={{
                          backgroundColor: t.chip,
                          borderWidth: 1,
                          borderColor: t.stroke,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 999,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: FE_FONT_FAMILY,
                            fontSize: 12,
                            fontWeight: '700',
                            color: t.text,
                          }}
                        >
                          {w}
                        </Text>
                      </View>
                    ))}
                </View>
              </GlassCard>
            ) : null}

            {/* Buttons */}
            <View style={{ gap: 10 }}>
              <Pressable onPress={() => start(true)} scale={0.97}>
                <View
                  style={{
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: t.a1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>🔄</Text>
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 15,
                      fontWeight: '800',
                      color: '#fff',
                    }}
                  >
                    New topic
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={handleSaveAndExit} scale={0.97}>
                <View
                  style={{
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: t.chip,
                    borderWidth: 1,
                    borderColor: t.stroke2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FE_FONT_FAMILY,
                      fontSize: 14,
                      fontWeight: '700',
                      color: t.text,
                    }}
                  >
                    Save &amp; exit
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
});
