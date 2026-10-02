import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { BaseColors } from '@theme/colors';

const BRAND_PURPLE = BaseColors.merckPurple;

interface PickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T | '';
  renderLabel: (val: T) => string;
  onSelect: (val: T) => void;
  onDismiss: () => void;
  isDark: boolean;
}

function PickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  renderLabel,
  onSelect,
  onDismiss,
  isDark,
}: PickerModalProps<T>) {
  const { t } = useTranslation();
  const sheetBg = isDark ? '#1E1E2E' : '#FFFFFF';
  const titleColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const rowBg = isDark ? '#2A2A3E' : '#F0EDF8';
  const rowText = isDark ? '#FFFFFF' : '#1C1C1E';
  const cancelColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      />
      <View style={[styles.sheet, { backgroundColor: sheetBg }]}>
        <View style={styles.handle} />
        <CustomText style={[styles.title, { color: titleColor }]}>
          {title}
        </CustomText>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map(opt => {
            const isSelected = opt === selected;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.row, isSelected && { backgroundColor: rowBg }]}
                onPress={() => {
                  onSelect(opt);
                  onDismiss();
                }}
                activeOpacity={0.7}
              >
                <CustomText
                  style={[
                    styles.rowText,
                    { color: isSelected ? BRAND_PURPLE : rowText },
                  ]}
                >
                  {renderLabel(opt)}
                </CustomText>
                {isSelected && (
                  <Icon
                    name="checkmark-circle"
                    size={18}
                    color={BRAND_PURPLE}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss}>
          <CustomText style={[styles.cancelText, { color: cancelColor }]}>
            {t('label.cancel')}
          </CustomText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: '72%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowText: { flex: 1, fontSize: 15 },
  cancelBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15 },
});

export default PickerModal;
