import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';

interface CustomToastProps {
  text1?: string;
  text2?: string;
  onPress?: () => void;
  hide?: () => void;
}

// Toast variant configurations
const toastVariants = {
  success: {
    icon: 'checkbox-checked' as IconName,
    iconColor: '#10B981',
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  error: {
    icon: 'close' as IconName,
    iconColor: '#EF4444',
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  info: {
    icon: 'alert-circle' as IconName,
    iconColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  warning: {
    icon: 'alert-circle' as IconName,
    iconColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
};

// Custom Toast Component
const CustomToastComponent: React.FC<
  CustomToastProps & { variant: keyof typeof toastVariants }
> = ({ text1, text2, onPress, hide, variant }) => {
  const config = toastVariants[variant];
  const fontStyle = getFontStyle('bodySmall');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress || hide}
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderLeftColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Icon name={config.icon} size={24} color={config.iconColor} />
      </View>
      <View style={styles.textContainer}>
        {text1 && (
          <BodyText
            style={[styles.title, { fontFamily: fontStyle.fontFamily }]}
            color="#1F2937"
          >
            {text1}
          </BodyText>
        )}
        {text2 && (
          <CaptionText
            style={[styles.message, { fontFamily: fontStyle.fontFamily }]}
            color="#4B5563"
          >
            {text2}
          </CaptionText>
        )}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Icon name="close" size={16} color="#6B7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Toast configuration for react-native-toast-message
export const toastConfig: ToastConfig = {
  success: props => <CustomToastComponent {...props} variant="success" />,
  error: props => <CustomToastComponent {...props} variant="error" />,
  info: props => <CustomToastComponent {...props} variant="info" />,
  warning: props => <CustomToastComponent {...props} variant="warning" />,
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginHorizontal: '5%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 14,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
