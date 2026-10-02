import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';

interface LegalModalHeaderProps {
  title: string;
  onClose: () => void;
  isRTL: boolean;
}

/**
 * LegalModalHeader
 *
 * Reusable header component for legal modals with a centered title and close button.
 */
export const LegalModalHeader: React.FC<LegalModalHeaderProps> = ({
  title,
  onClose,
  isRTL,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.header, { borderBottomColor: theme.border.secondary }]}
    >
      <CustomText style={[styles.headerTitle, { color: theme.text.primary }]}>
        {title}
      </CustomText>

      <TouchableOpacity
        onPress={onClose}
        style={[
          styles.closeButton,
          {
            backgroundColor: theme.background.secondary,
            ...(isRTL ? { left: 16 } : { right: 16 }),
          },
        ]}
        activeOpacity={0.7}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <Icon name="close" size={24} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
