/**
 * ForceUpdateModal
 *
 * A full-screen blocking modal shown when the installed app version is
 * below the minimum required version returned by the API.
 *
 * - Cannot be dismissed (no cancel, no back button)
 * - "Update Now" opens the platform-appropriate store listing
 * - Designed for both light and dark themes via useTheme()
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

const { width: SW } = Dimensions.get('window');

const { fontFamily: h2FontFamily } = getFontStyle('h2');
const { fontFamily: bodyFontFamily } = getFontStyle('body');
const { fontFamily: buttonFontFamily } = getFontStyle('button');
const { fontFamily: captionFontFamily } = getFontStyle('caption');

interface Props {
  visible: boolean;
  storeUrl: string;
  latestVersion: string;
}

const ForceUpdateModal: React.FC<Props> = ({
  visible,
  storeUrl,
  latestVersion,
}) => {
  const { theme } = useTheme();

  // Block Android hardware back button
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => handler.remove();
  }, [visible]);

  const handleUpdate = () => {
    Linking.openURL(storeUrl).catch(() => {
      // If deep link fails, try the generic store URL
      const fallback =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com'
          : 'https://play.google.com/store';
      Linking.openURL(fallback);
    });
  };

  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        /* intentionally blocked */
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon area */}
          <View
            style={[
              styles.iconRing,
              { borderColor: theme.button.primary.background },
            ]}
          >
            <Text style={styles.iconEmoji}>🚀</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Update Required</Text>

          {/* Version badge */}
          <View
            style={[
              styles.versionBadge,
              { backgroundColor: theme.background.tertiary },
            ]}
          >
            <Text style={[styles.versionText, { color: theme.text.secondary }]}>
              Version {latestVersion} is now available
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            A new version of{' '}
            {Platform.OS === 'ios' ? 'Pharma Connect' : 'Pharma Connect'} is
            required to continue. Please update to get the latest features,
            improvements, and security fixes.
          </Text>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.border.secondary },
            ]}
          />

          {/* Update button */}
          <TouchableOpacity
            style={[
              styles.updateBtn,
              { backgroundColor: theme.button.primary.background },
            ]}
            onPress={handleUpdate}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.updateBtnText,
                { color: theme.button.primary.text },
              ]}
            >
              {Platform.OS === 'ios'
                ? 'Update on App Store'
                : 'Update on Play Store'}
            </Text>
          </TouchableOpacity>

          {/* Hint */}
          <Text style={[styles.hint, { color: theme.text.tertiary }]}>
            You must update to continue using the app.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: Math.min(SW - 48, 380),
      backgroundColor: theme.background.primary,
      borderRadius: 24,
      paddingHorizontal: 28,
      paddingTop: 36,
      paddingBottom: 28,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 20,
    },
    iconRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    iconEmoji: {
      fontSize: 36,
    },
    title: {
      color: theme.text.primary,
      fontFamily: h2FontFamily,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 12,
      textAlign: 'center',
    },
    versionBadge: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 16,
    },
    versionText: {
      fontFamily: captionFontFamily,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    description: {
      color: theme.text.secondary,
      fontFamily: bodyFontFamily,
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 24,
    },
    divider: {
      width: '100%',
      height: 1,
      marginBottom: 24,
    },
    updateBtn: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    updateBtnText: {
      fontFamily: buttonFontFamily,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    hint: {
      fontFamily: captionFontFamily,
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 16,
    },
  });

export default ForceUpdateModal;
