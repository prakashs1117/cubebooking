import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FEButton } from '@components/fe';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

interface SocialAuthButtonsProps {
  onGoogle: () => void;
  onFacebook: () => void;
  onSkip?: () => void;
  disabled?: boolean;
  loading?: boolean;
  showDivider?: boolean;
}

/**
 * Reusable social auth buttons component
 * Shows Google, Facebook buttons (and optional Skip)
 * Can be used in AuthScreen, SignupStep, or any auth flow
 */
export default function SocialAuthButtons({
  onGoogle,
  onFacebook,
  onSkip,
  disabled = false,
  loading = false,
  showDivider = true,
}: SocialAuthButtonsProps) {
  const t = useFETheme();

  return (
    <View>
      {showDivider && (
        <Text style={[styles.divider, { color: t.text2 }]}>Or continue with</Text>
      )}
      <View style={styles.buttonRow}>
        <FEButton
          label="Google"
          onPress={onGoogle}
          disabled={disabled || loading}
          variant="outline"
          style={{ flex: 1 }}
        />
        <FEButton
          label="Facebook"
          onPress={onFacebook}
          disabled={disabled || loading}
          variant="outline"
          style={{ flex: 1 }}
        />
      </View>
      {onSkip && (
        <FEButton
          label="Skip for now"
          onPress={onSkip}
          disabled={disabled || loading}
          variant="ghost"
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    fontFamily: FE_FONT_FAMILY,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
