import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { BodyText, CaptionText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';

interface DatePickerFieldProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  // Tracks the in-progress scroll selection — committed only on Done
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setPendingDate(selectedDate);
    }
  };

  const handleDone = () => {
    const chosen = pendingDate ?? value;
    if (chosen) {
      onChange(chosen);
    }
    setShowPicker(false);
    setPendingDate(null);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setPendingDate(null);
  };

  const fieldBg = isDark ? theme.background.card : '#F5F3FF';
  const borderColor = showPicker
    ? BaseColors.merckPurple
    : isDark
    ? 'rgba(255,255,255,0.15)'
    : theme.border.primary;
  const iconColor = disabled
    ? theme.text.tertiary
    : isDark
    ? 'rgba(255,255,255,0.7)'
    : BaseColors.merckPurple;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <CaptionText
          style={[
            styles.label,
            {
              color: disabled ? theme.text.tertiary : theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          {label}
        </CaptionText>
      ) : null}

      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: fieldBg, borderColor },
          disabled && styles.fieldDisabled,
        ]}
        onPress={() => !disabled && setShowPicker(v => !v)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Icon name="calendar" size={18} color={iconColor} style={styles.calendarIcon} />
        <BodyText
          style={[
            styles.valueText,
            {
              color: value
                ? disabled ? theme.text.tertiary : theme.text.primary
                : theme.text.placeholder,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </BodyText>
        <Icon name="chevron-down" size={16} color={iconColor} />
      </TouchableOpacity>

      {showPicker && (
        <View style={[styles.pickerContainer, { backgroundColor: isDark ? theme.background.card : '#F9F8FF' }]}>
          <View style={[styles.pickerToolbar, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
            <TouchableOpacity onPress={handleCancel} style={styles.toolbarBtn}>
              <BodyText style={[styles.toolbarBtnText, { color: theme.text.secondary }]}>
                Cancel
              </BodyText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDone} style={styles.toolbarBtn}>
              <BodyText style={[styles.toolbarBtnText, { color: isDark ? '#A78BFA' : BaseColors.merckPurple }]}>
                Done
              </BodyText>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={pendingDate ?? value ?? new Date()}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            themeVariant={isDark ? 'dark' : 'light'}
            accentColor={BaseColors.merckPurple}
            style={styles.picker}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
  calendarIcon: {
    flexShrink: 0,
  },
  valueText: {
    flex: 1,
    fontSize: 15,
  },
  pickerContainer: {
    borderRadius: 12,
    marginTop: 4,
  },
  pickerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarBtn: {
    paddingHorizontal: 4,
  },
  toolbarBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  picker: {
    height: Platform.OS === 'ios' ? 216 : undefined,
    width: '100%',
  },
});

export default DatePickerField;
