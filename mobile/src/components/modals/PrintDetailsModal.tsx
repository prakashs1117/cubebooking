/**
 * PrintDetailsModal — Update Label bottom sheet
 *
 * Replaced @gorhom/bottom-sheet with a plain RN Modal + animationType="slide"
 * to eliminate Reanimated worklet overhead and dismiss-race-condition delays.
 * The modal is now driven by a simple visible prop — no ref, no present/dismiss.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomText } from '@components/common/CustomText';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { useTranslation } from 'react-i18next';
import DatePickerField from '@components/common/DatePickerField';

export interface PrintDetails {
  template: string;
  amount: string;
  unit: string;
  fillDate: string;
  extraText: string;
}

interface PrintDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (details: PrintDetails) => Promise<void>;
  initialTemplate?: string;
  initialAmount?: string;
  initialUnit?: string;
  initialFillDate?: string;
  initialExtraText?: string;
}

const UNIT_OPTIONS = [
  'L', 'mL', 'μL', 'g', 'mg', 'μg', 'ng', 'lbs', 'oz', 'gal',
] as const;

const TEMPLATE_OPTIONS = ['big', 'medium', 'small', 'milliseq'] as const;

const PrintDetailsModal: React.FC<PrintDetailsModalProps> = ({
  visible,
  onClose,
  onUpdate,
  initialTemplate = 'big',
  initialAmount = '',
  initialUnit = '',
  initialFillDate = '',
  initialExtraText = '',
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState(initialTemplate);
  const [amount, setAmount] = useState(initialAmount);
  const [unit, setUnit] = useState(initialUnit);
  const [fillDate, setFillDate] = useState<Date | null>(
    initialFillDate ? new Date(initialFillDate) : null,
  );
  const [extraText, setExtraText] = useState(initialExtraText);

  // Reset form to latest initial values whenever modal opens
  useEffect(() => {
    if (visible) {
      setTemplate(initialTemplate);
      setAmount(initialAmount);
      setUnit(initialUnit);
      setFillDate(initialFillDate ? new Date(initialFillDate) : null);
      setExtraText(initialExtraText);
    }
  }, [visible, initialTemplate, initialAmount, initialUnit, initialFillDate, initialExtraText]);

  const handleUpdate = useCallback(async () => {
    setIsLoading(true);
    try {
      const fillDateStr = fillDate
        ? fillDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';
      await onUpdate({ template, amount, unit, fillDate: fillDateStr, extraText });
      onClose();
    } catch (error) {
      console.error('Failed to update print details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [template, amount, unit, extraText, onUpdate, onClose]);

  const bgColor = theme.background.primary;
  const textColor = theme.text.primary;
  const secondaryText = theme.text.secondary;
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
  const inputBorder = theme.border.primary;
  const btnBg = BaseColors.merckPurple;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop tap to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Sheet */}
        <View style={[styles.sheet, { backgroundColor: bgColor, paddingBottom: insets.bottom + 16 }]}>
          {/* Handle */}
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: theme.border.primary }]} />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <CustomText style={[styles.title, { color: textColor }]}>
              {t('label.updateLabel')}
            </CustomText>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Template */}
            <View style={styles.fieldGroup}>
              <CustomText style={[styles.fieldLabel, { color: textColor }]}>
                {t('label.template')}
              </CustomText>
              <FlatList
                data={TEMPLATE_OPTIONS}
                renderItem={({ item: tmpl }) => (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      template === tmpl
                        ? { backgroundColor: btnBg }
                        : { backgroundColor: inputBg, borderColor: inputBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setTemplate(tmpl)}
                  >
                    <CustomText
                      style={[styles.chipText, { color: template === tmpl ? '#FFFFFF' : textColor }]}
                    >
                      {tmpl}
                    </CustomText>
                  </TouchableOpacity>
                )}
                keyExtractor={tmpl => tmpl}
                horizontal
                scrollEnabled={false}
                contentContainerStyle={styles.chipRow}
              />
            </View>

            {/* Amount */}
            <View style={styles.fieldGroup}>
              <CustomText style={[styles.fieldLabel, { color: textColor }]}>
                {t('label.amount')}
              </CustomText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]}
                placeholder={t('label.amountPlaceholder')}
                placeholderTextColor={secondaryText}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            </View>

            {/* Unit */}
            <View style={styles.fieldGroup}>
              <CustomText style={[styles.fieldLabel, { color: textColor }]}>
                {t('label.unit')}
              </CustomText>
              <FlatList
                data={UNIT_OPTIONS}
                renderItem={({ item: u }) => (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      unit === u
                        ? { backgroundColor: btnBg }
                        : { backgroundColor: inputBg, borderColor: inputBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setUnit(u)}
                  >
                    <CustomText
                      style={[styles.chipText, { color: unit === u ? '#FFFFFF' : textColor }]}
                    >
                      {u}
                    </CustomText>
                  </TouchableOpacity>
                )}
                keyExtractor={u => u}
                horizontal
                scrollEnabled={false}
                contentContainerStyle={styles.chipRow}
              />
            </View>

            {/* Fill Date */}
            <View style={styles.fieldGroup}>
              <CustomText style={[styles.fieldLabel, { color: textColor }]}>
                {t('label.fillDate')}
              </CustomText>
              <DatePickerField
                value={fillDate}
                onChange={setFillDate}
                placeholder={t('label.fillDatePlaceholder')}
                disabled={isLoading}
                minimumDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
              />
            </View>

            {/* Additional Information */}
            <View style={styles.fieldGroup}>
              <CustomText style={[styles.fieldLabel, { color: textColor }]}>
                {t('label.additionalInfo')}
              </CustomText>
              <TextInput
                style={[styles.input, styles.inputMultiline, { backgroundColor: inputBg, color: textColor, borderColor: inputBorder }]}
                placeholder={t('label.additionalInfoPlaceholder')}
                placeholderTextColor={secondaryText}
                value={extraText}
                onChangeText={v => setExtraText(v.slice(0, 200))}
                maxLength={200}
                multiline
                editable={!isLoading}
                textAlignVertical="top"
              />
              <CustomText style={[styles.charCounter, { color: secondaryText }]}>
                {extraText.length} / 200
              </CustomText>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel, { borderColor: theme.border.primary }]}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <CustomText style={[styles.btnText, { color: textColor }]}>{t('label.cancel')}</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: btnBg }, isLoading && styles.btnDisabled]}
              onPress={handleUpdate}
              disabled={isLoading}
              activeOpacity={0.82}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CustomText style={[styles.btnText, { color: '#FFFFFF' }]}>{t('label.update')}</CustomText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handleWrap: { alignItems: 'center', marginBottom: 12 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  titleContainer: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  formContainer: { marginBottom: 16 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  inputMultiline: { height: 80, paddingTop: 12 },
  charCounter: { textAlign: 'right', fontSize: 11, marginTop: 4 },
  chipRow: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  chipText: { fontSize: 13, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: 'transparent', borderWidth: 1.5 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontWeight: '600', fontSize: 15 },
});

export default PrintDetailsModal;
