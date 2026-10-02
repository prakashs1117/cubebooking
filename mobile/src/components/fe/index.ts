// ============================================================================
// FluentEdge component kit — atomic design barrel
// ============================================================================
// Consumers import from '@components/fe' only; internal foldering
// (atoms/molecules/organisms) can change without touching call sites.
// See plan/FluentEdge Architecture & Standards.md.
// ============================================================================

// ---- atoms (indivisible primitives) --------------------------------------
export { default as FEGlyph } from '@components/fe/atoms/FEGlyph';
export { default as GradIcon } from '@components/fe/atoms/GradIcon';
export { default as Avatar } from '@components/fe/atoms/Avatar';
export { default as Chip } from '@components/fe/atoms/Chip';
export { default as ProgressBar } from '@components/fe/atoms/ProgressBar';
export { default as Ring } from '@components/fe/atoms/Ring';
export { default as Pressable } from '@components/fe/atoms/Pressable';
export { default as FEButton } from '@components/fe/atoms/FEButton';
export { default as FEInput } from '@components/fe/atoms/FEInput';

// ---- molecules (small compositions) --------------------------------------
export { default as GlassCard } from '@components/fe/molecules/GlassCard';
export { default as StatTile } from '@components/fe/molecules/StatTile';
export { default as Segmented } from '@components/fe/molecules/Segmented';
export { default as Section } from '@components/fe/molecules/Section';
export { default as DrillCard } from '@components/fe/molecules/DrillCard';
export { default as FEStepBar } from '@components/fe/molecules/FEStepBar';
export { default as FEChoiceCard } from '@components/fe/molecules/FEChoiceCard';
export { default as FERadioCard } from '@components/fe/molecules/FERadioCard';

// ---- organisms (larger self-contained blocks) ----------------------------
export { default as AppBackground } from '@components/fe/organisms/AppBackground';
export { default as FETabBar } from '@components/fe/organisms/FETabBar';
export { default as LockedCard } from '@components/fe/organisms/LockedCard';
export { default as FEFloatCluster } from '@components/fe/organisms/FEFloatCluster';
export type { ClusterIcon } from '@components/fe/organisms/FEFloatCluster';
export { default as FEWaveform } from '@components/fe/organisms/FEWaveform';

// ---- hooks & gating ------------------------------------------------------
export { useCountUp } from '@components/fe/useCountUp';
export { default as Gate } from '@components/fe/gate/Gate';
export { useFeatureAccess } from '@components/fe/gate/useFeatureAccess';
