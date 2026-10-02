import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/index';
import {
  Heading3,
  ButtonText,
  CaptionText,
} from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  toast,
} from '@utils/toast';

/**
 * Toast Examples Component
 * Demonstrates different ways to use the toast notification system
 */
const ToastExamples: React.FC = () => {
  const { theme } = useTheme();

  const examples = [
    {
      title: 'Success Toast',
      icon: 'checkbox-checked' as const,
      color: '#10B981',
      onPress: () => {
        showSuccess({
          title: 'Success!',
          message: 'Your changes have been saved successfully',
        });
      },
    },
    {
      title: 'Error Toast',
      icon: 'close' as const,
      color: '#EF4444',
      onPress: () => {
        showError({
          title: 'Error',
          message: 'Something went wrong. Please try again.',
        });
      },
    },
    {
      title: 'Info Toast',
      icon: 'alert-circle' as const,
      color: '#3B82F6',
      onPress: () => {
        showInfo({
          title: 'Information',
          message: 'New updates are available',
        });
      },
    },
    {
      title: 'Warning Toast',
      icon: 'alert-circle' as const,
      color: '#F59E0B',
      onPress: () => {
        showWarning({
          title: 'Warning',
          message: 'Please complete all required fields',
        });
      },
    },
  ];

  const quickExamples = [
    {
      title: 'Quick Success',
      onPress: () => toast.success('Done!'),
    },
    {
      title: 'Quick Error',
      onPress: () => toast.error('Failed!'),
    },
    {
      title: 'Quick Info',
      onPress: () => toast.info('FYI'),
    },
    {
      title: 'Quick Warning',
      onPress: () => toast.warning('Careful!'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    header: {
      marginBottom: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      marginBottom: 12,
    },
    exampleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.tertiary,
      padding: 14,
      borderRadius: 8,
      marginBottom: 10,
    },
    exampleIcon: {
      marginRight: 12,
    },
    exampleContent: {
      flex: 1,
    },
    quickButtonsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    quickButton: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Heading3 color={theme.text.primary}>Toast Examples</Heading3>
        <CaptionText color={theme.text.secondary}>
          Tap any button to see different toast variants
        </CaptionText>
      </View>

      {/* Full Toast Examples */}
      <View style={styles.section}>
        <CaptionText style={styles.sectionTitle} color={theme.text.secondary}>
          With Title & Message
        </CaptionText>
        {examples.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exampleButton}
            onPress={example.onPress}
          >
            <Icon
              name={example.icon}
              size={24}
              color={example.color}
              style={styles.exampleIcon}
            />
            <View style={styles.exampleContent}>
              <ButtonText color={theme.text.primary}>
                {example.title}
              </ButtonText>
            </View>
            <Icon name="arrow-right" size={16} color={theme.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Toast Examples */}
      <View style={styles.section}>
        <CaptionText style={styles.sectionTitle} color={theme.text.secondary}>
          Quick Toasts (Title Only)
        </CaptionText>
        <View style={styles.quickButtonsRow}>
          {quickExamples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickButton}
              onPress={example.onPress}
            >
              <ButtonText color={theme.button.primary.text}>
                {example.title}
              </ButtonText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ToastExamples;
