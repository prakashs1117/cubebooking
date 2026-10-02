import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@components/icons/Icon';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { useTheme } from '@theme/index';
import { IconName } from '@components/icons/Icon';
import { CustomToggle } from '@components/common/CustomToggle';

interface SettingToggleRowProps {
  label: string;
  description?: string;
  icon?: IconName;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  label,
  description,
  icon,
  value,
  onValueChange,
  disabled = false,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    contentContainer: {
      flex: 1,
      gap: 4,
    },
    switchContainer: {
      marginLeft: 'auto',
    },
  });

  return (
    <View style={styles.container}>
      {icon && <Icon name={icon} size={24} color={theme.text.link} />}
      <View style={styles.contentContainer}>
        <BodyText color={theme.text.primary}>{label}</BodyText>
        {description && (
          <CaptionText color={theme.text.secondary}>{description}</CaptionText>
        )}
      </View>
      <View style={styles.switchContainer}>
        <CustomToggle
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          size={56}
          testID={testID}
        />
      </View>
    </View>
  );
};
