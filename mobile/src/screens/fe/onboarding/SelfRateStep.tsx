import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FunnelStep from '@screens/fe/onboarding/FunnelStep';
import { FERadioCard, Chip, FEButton } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface SelfRateValue {
  speakUp?: number;
  blocker?: string;
}

const Q1 = ['Always — I jump in', 'Sometimes, if prompted', 'Rarely — I hold back', 'Almost never'];
const Q2 = [
  { id: 'words', label: 'Finding the right words' },
  { id: 'nerves', label: 'Nerves & shaky voice' },
  { id: 'fast', label: 'Speaking too fast' },
  { id: 'judged', label: 'Fear of being judged' },
];

export default function SelfRateStep({
  value,
  onChange,
  onNext,
  onBack,
  onSkip,
  step,
  total,
}: {
  value: SelfRateValue;
  onChange: (v: SelfRateValue) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  step: number;
  total: number;
}) {
  const t = useFETheme();
  const ok = value.speakUp != null && !!value.blocker;

  return (
    <FunnelStep
      title="Where you are today"
      sub="Two quick honest answers — no wrong ones."
      step={step}
      total={total}
      onBack={onBack}
      footer={
        <View style={{ gap: 8 }}>
          <FEButton label="Continue" onPress={ok ? onNext : undefined} disabled={!ok} />
          {onSkip && <FEButton label="Skip for now" onPress={onSkip} variant="ghost" />}
        </View>
      }
    >
      <Text style={[styles.q, { color: t.text }]}>How often do you speak up when you have something to say?</Text>
      <View style={{ gap: 9, marginTop: 12 }}>
        {Q1.map((l, i) => (
          <FERadioCard key={l} label={l} selected={value.speakUp === i} onPress={() => onChange({ ...value, speakUp: i })} />
        ))}
      </View>

      <Text style={[styles.q, { color: t.text, marginTop: 24 }]}>What holds you back the most?</Text>
      <View style={styles.chips}>
        {Q2.map((o) => (
          <Chip key={o.id} label={o.label} active={value.blocker === o.id} onPress={() => onChange({ ...value, blocker: o.id })} />
        ))}
      </View>
    </FunnelStep>
  );
}

const styles = StyleSheet.create({
  q: { fontFamily: FE_FONT_FAMILY, fontSize: 14, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 12 },
});
