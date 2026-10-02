import React from 'react';
import { View, Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

interface SocialAuthIconButtonsProps {
  onGoogle: () => void;
  onFacebook: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Compact icon-based social auth buttons (Google + Facebook)
 * Shows only icons with brand colors, no text labels
 * Can be used in any auth flow for minimal UI footprint
 */
export default function SocialAuthIconButtons({
  onGoogle,
  onFacebook,
  disabled = false,
  loading = false,
  size = 'medium',
}: SocialAuthIconButtonsProps) {
  const t = useFETheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return { button: 40, fontSize: 18 };
      case 'large':
        return { button: 56, fontSize: 26 };
      default:
        return { button: 48, fontSize: 22 };
    }
  };

  const { button: buttonSize, fontSize } = getSize();

  return (
    <View style={styles.container}>
      {/* Google Button */}
      <Pressable
        onPress={onGoogle}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: '#FFFFFF',
            borderColor: '#DADCE0',
            borderWidth: 1,
            opacity: pressed && !disabled ? 0.8 : disabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#1F2937" />
        ) : (
          <Text style={[styles.icon, { fontSize }]}>G</Text>
        )}
      </Pressable>

      {/* Facebook Button */}
      <Pressable
        onPress={onFacebook}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: '#1877F2',
            borderColor: '#1877F2',
            borderWidth: 1,
            opacity: pressed && !disabled ? 0.9 : disabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[styles.icon, { fontSize, color: '#FFFFFF' }]}>f</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    fontFamily: FE_FONT_FAMILY,
    fontWeight: '700',
    color: '#1F2937',
  },
});
