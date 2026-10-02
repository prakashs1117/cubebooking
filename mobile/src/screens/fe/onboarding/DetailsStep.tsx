import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FunnelStep from '@screens/fe/onboarding/FunnelStep';
import { FEInput, Chip, Segmented, FEButton } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface DetailsValue {
  name?: string;
  profession?: string;
  lang?: string;
  goal?: number;
}

const PROFESSIONS = ['Student', 'Software / IT', 'Sales', 'Founder', 'Manager', 'Consultant', 'Educator', 'Other'];
const LANGS = ['Tamil', 'Hindi', 'Telugu', 'Kannada', 'Bengali', 'English', 'Other'];
const GOALS = [
  { id: '5', label: '5 min' },
  { id: '10', label: '10 min' },
  { id: '15', label: '15 min' },
];

export default function DetailsStep({
  data,
  setData,
  onNext,
  onBack,
  onSkip,
  step,
  total,
}: {
  data: DetailsValue;
  setData: (v: DetailsValue) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  step: number;
  total: number;
}) {
  const t = useFETheme();
  const valid = !!data.name && data.name.trim().length >= 2;

  return (
    <FunnelStep
      title="A little about you"
      sub="We tailor prompts and coaching to your world. Takes 20 seconds."
      step={step}
      total={total}
      onBack={onBack}
      footer={
        <View style={{ gap: 8 }}>
          <FEButton label="Continue" onPress={valid ? onNext : undefined} disabled={!valid} />
          {onSkip && <FEButton label="Skip for now" onPress={onSkip} variant="ghost" />}
        </View>
      }
    >
      <View style={{ gap: 20 }}>
        <FEInput
          label="What should we call you?"
          value={data.name ?? ''}
          onChangeText={(name) => setData({ ...data, name })}
          placeholder="Your first name"
          autoCapitalize="words"
        />

        <View>
          <Text style={[styles.label, { color: t.text2 }]}>What do you do?</Text>
          <View style={styles.chips}>
            {PROFESSIONS.map((p) => (
              <Chip key={p} label={p} active={data.profession === p} onPress={() => setData({ ...data, profession: p })} />
            ))}
          </View>
        </View>

        <View>
          <Text style={[styles.label, { color: t.text2 }]}>First language</Text>
          <View style={styles.chips}>
            {LANGS.map((l) => (
              <Chip key={l} label={l} active={data.lang === l} onPress={() => setData({ ...data, lang: l })} />
            ))}
          </View>
        </View>

        <View>
          <Text style={[styles.label, { color: t.text2 }]}>Daily practice goal</Text>
          <Segmented
            options={GOALS}
            value={String(data.goal ?? 10)}
            onChange={(v) => setData({ ...data, goal: Number(v) })}
          />
        </View>
      </View>
    </FunnelStep>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: FE_FONT_FAMILY, fontSize: 12.5, fontWeight: '700', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
