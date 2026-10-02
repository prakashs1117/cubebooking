/**
 * NoNetworkPopup - Modal popup displayed when network is unavailable
 * Theme-aware and localized component
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts/fontRegistry';

interface NoNetworkPopupProps {
  visible: boolean;
  onRetry: () => void;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const NoNetworkPopup: React.FC<NoNetworkPopupProps> = ({
  visible,
  onRetry,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    popup: {
      backgroundColor: theme.background.card,
      borderRadius: 16,
      padding: 24,
      width: screenWidth - 40,
      maxWidth: 400,
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 12,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },
    icon: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: 16,
    },
    title: {
      fontFamily: getFontStyle('h4').fontFamily,
      fontSize: getFontStyle('h4').fontSize,
      lineHeight: getFontStyle('h4').lineHeight,
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontFamily: getFontStyle('bodyMedium').fontFamily,
      fontSize: getFontStyle('bodyMedium').fontSize,
      lineHeight: getFontStyle('bodyMedium').lineHeight,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    retryButton: {
      backgroundColor: theme.button.primary.background,
      borderWidth: 1,
      borderColor: theme.button.primary.border,
    },
    closeButton: {
      backgroundColor: theme.button.secondary.background,
      borderWidth: 1,
      borderColor: theme.button.secondary.border,
    },
    retryButtonText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: getFontStyle('button').fontSize,
      lineHeight: getFontStyle('button').lineHeight,
      color: theme.button.primary.text,
    },
    closeButtonText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: getFontStyle('button').fontSize,
      lineHeight: getFontStyle('button').lineHeight,
      color: theme.button.secondary.text,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.icon}>📶</Text>
          <Text style={styles.title}>{t('network.noConnection')}</Text>
          <Text style={styles.message}>{t('network.checkConnection')}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>{t('network.retry')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
