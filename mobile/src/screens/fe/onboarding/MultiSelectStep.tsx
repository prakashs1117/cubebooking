import React from 'react';
import { View } from 'react-native';
import FunnelStep from '@screens/fe/onboarding/FunnelStep';
import { FEChoiceCard, FEButton } from '@components/fe';
import type { FETone } from '@demand/shared/fe';

export interface MultiOption {
  id: string;
  icon: string;
  tone: FETone;
  title: string;
  sub?: string;
}

export interface MultiSelectStepProps {
  title: string;
  sub: string;
  options: MultiOption[];
  min?: number;
  value: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  step: number;
  total: number;
}

export default function MultiSelectStep({
  title,
  sub,
  options,
  min = 1,
  value,
  onChange,
  onNext,
  onBack,
  onSkip,
  step,
  total,
}: MultiSelectStepProps) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const ok = value.length >= min;

  return (
    <FunnelStep
      title={title}
      sub={sub}
      step={step}
      total={total}
      onBack={onBack}
      footer={
        <View style={{ gap: 8 }}>
          <FEButton
            label={ok ? 'Continue' : `Pick at least ${min}`}
            onPress={ok ? onNext : undefined}
            disabled={!ok}
          />
          {onSkip && <FEButton label="Skip for now" onPress={onSkip} variant="ghost" />}
        </View>
      }
    >
      <View style={{ gap: 10 }}>
        {options.map((o) => (
          <FEChoiceCard
            key={o.id}
            icon={o.icon}
            tone={o.tone}
            title={o.title}
            sub={o.sub}
            selected={value.includes(o.id)}
            onPress={() => toggle(o.id)}
          />
        ))}
      </View>
    </FunnelStep>
  );
}
