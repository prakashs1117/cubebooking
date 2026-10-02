import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useMerckTokens } from '@theme/merckTokens';
import { FontSize } from '@theme/typography';
import { Shadow } from '@theme/spacing';
import AppText from '@components/common/AppText';
import { useSubmitFoodFeedback } from '@hooks/useFood';
import type { FoodFeedbackPayload } from '@services/api/food.service';

// ── Icons ─────────────────────────────────────────────────────────────────────

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const CheckIcon = ({ color, size = 32 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color + '22'} stroke={color} strokeWidth="2" />
    <Path d="m8 12 3 3 5-5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const T = useMerckTokens();
  return (
    <View style={{ marginBottom: 16 }}>
      <AppText weight="semibold" size={FontSize.sm} color={T.headerText} style={{ marginBottom: 8 }}>
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity
            key={n}
            onPress={() => onChange(n)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: n <= value ? T.green : T.bgSurface,
              borderWidth: 1,
              borderColor: n <= value ? T.green : T.borderDefault,
            }}
          >
            <AppText weight="bold" size={FontSize.sm} color={n <= value ? T.bgApp : T.tabInactive}>
              {n}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive}>Poor</AppText>
        <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive}>Excellent</AppText>
      </View>
    </View>
  );
}

// ── Tags ──────────────────────────────────────────────────────────────────────

const FEEDBACK_TAGS = [
  { id: 'well-cooked',    label: '👨‍🍳 Well cooked' },
  { id: 'fresh',          label: '🥗 Fresh' },
  { id: 'good-variety',   label: '🍽️ Good variety' },
  { id: 'value-for-money', label: '💰 Value for money' },
  { id: 'too-salty',      label: '🧂 Too salty' },
  { id: 'too-spicy',      label: '🌶️ Too spicy' },
  { id: 'undercooked',    label: '⚠️ Undercooked' },
  { id: 'small-portion',  label: '📉 Small portion' },
  { id: 'large-portion',  label: '📈 Large portion' },
  { id: 'cold',           label: '🥶 Served cold' },
];

// ── Sheet ─────────────────────────────────────────────────────────────────────

export interface FoodFeedbackSheetProps {
  visible: boolean;
  orderId: string | null;
  mealName: string;
  onClose: () => void;
}

export default function FoodFeedbackSheet({
  visible,
  orderId,
  mealName,
  onClose,
}: FoodFeedbackSheetProps) {
  const T = useMerckTokens();
  const { mutate, isPending, isSuccess, reset } = useSubmitFoodFeedback();

  const [overallRating, setOverallRating] = useState(0);
  const [taste, setTaste] = useState(0);
  const [portionSize, setPortionSize] = useState(0);
  const [value, setValue] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');

  const resetForm = useCallback(() => {
    setOverallRating(0);
    setTaste(0);
    setPortionSize(0);
    setValue(0);
    setSelectedTags(new Set());
    setComment('');
    reset();
  }, [reset]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const toggleTag = useCallback((id: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const canSubmit = overallRating > 0 && taste > 0 && portionSize > 0 && value > 0 && !isPending;

  const handleSubmit = () => {
    if (!orderId || !canSubmit) return;
    const payload: FoodFeedbackPayload = {
      overallRating,
      taste,
      portionSize,
      value,
      tags: Array.from(selectedTags),
      comment: comment.trim() || undefined,
    };
    mutate({ orderId, payload });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={handleClose} />
      <View style={[s.sheet, { backgroundColor: T.bgCard, borderTopColor: T.borderDefault }]}>
        <View style={[s.handle, { backgroundColor: T.borderMuted }]} />

        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <AppText weight="bold" size={FontSize['2xl']} color={T.headerText}>Rate your meal</AppText>
            <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive} style={{ marginTop: 2 }}>
              {mealName}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={[s.closeBtn, { backgroundColor: T.bgSurface }]}
          >
            <CloseIcon color={T.tabInactive} />
          </TouchableOpacity>
        </View>

        {/* Success state */}
        {isSuccess ? (
          <View style={s.successWrap}>
            <CheckIcon color={T.green} size={56} />
            <AppText weight="bold" size={FontSize.xl} color={T.headerText} style={{ marginTop: 16 }}>
              Thank you!
            </AppText>
            <AppText weight="semibold" size={FontSize.sm} color={T.tabInactive} align="center" style={{ marginTop: 8, lineHeight: 20 }}>
              Your feedback helps us improve the cafeteria experience for everyone.
            </AppText>
            <TouchableOpacity
              onPress={handleClose}
              style={[s.doneBtn, { backgroundColor: T.green }]}
            >
              <AppText weight="bold" size={FontSize.lg} color={T.bgApp}>Done</AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={{ flex: 1, paddingHorizontal: 22 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Ratings */}
            <View style={[s.section, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
              <StarRating value={overallRating} onChange={setOverallRating} label="Overall rating *" />
              <StarRating value={taste} onChange={setTaste} label="Taste *" />
              <StarRating value={portionSize} onChange={setPortionSize} label="Portion size *" />
              <StarRating value={value} onChange={setValue} label="Value for money *" />
            </View>

            {/* Tags */}
            <View style={[s.section, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
              <AppText weight="semibold" size={FontSize.sm} color={T.headerText} style={{ marginBottom: 12 }}>
                What stood out? <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>(optional)</AppText>
              </AppText>
              <View style={s.tagsWrap}>
                {FEEDBACK_TAGS.map(tag => {
                  const active = selectedTags.has(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                      activeOpacity={0.8}
                      style={[
                        s.tag,
                        {
                          borderColor: active ? T.green : T.borderDefault,
                          backgroundColor: active ? T.green + '18' : T.bgApp,
                        },
                      ]}
                    >
                      <AppText weight="semibold" size={FontSize.xs} color={active ? T.green : T.tabInactive}>
                        {tag.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Comment */}
            <View style={[s.section, { backgroundColor: T.bgSurface, borderColor: T.borderDefault }]}>
              <AppText weight="semibold" size={FontSize.sm} color={T.headerText} style={{ marginBottom: 10 }}>
                Any comments? <AppText weight="semibold" size={FontSize.xs} color={T.tabInactive}>(optional)</AppText>
              </AppText>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Tell the cafeteria team what you think…"
                placeholderTextColor={T.tabInactive}
                multiline
                numberOfLines={3}
                maxLength={500}
                style={[s.input, { color: T.headerText, borderColor: T.borderDefault, backgroundColor: T.bgApp }]}
                textAlignVertical="top"
              />
              <AppText weight="semibold" size={FontSize['2xs']} color={T.tabInactive} align="right" style={{ marginTop: 4 }}>
                {comment.length}/500
              </AppText>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>
        )}

        {/* Submit */}
        {!isSuccess && (
          <View style={[s.footer, { borderTopColor: T.borderDefault }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.88}
              style={[s.submitBtn, { backgroundColor: canSubmit ? T.green : T.borderDefault, opacity: canSubmit ? 1 : 0.5 }]}
            >
              {isPending
                ? <ActivityIndicator color={T.bgApp} />
                : <AppText weight="bold" size={FontSize.xl} color={T.bgApp}>Submit Feedback</AppText>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  footer: {
    padding: 22,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  doneBtn: {
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
});
