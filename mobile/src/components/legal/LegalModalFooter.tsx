import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@theme/index';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import CustomButton from '@components/common/CustomButton';
import Icon from '@components/icons/Icon';

interface LegalModalFooterProps {
  isAccepted: boolean;
  onToggleAcceptance: () => void;
  onContinue: () => void;
  requireAcceptance: boolean;
  acceptanceText: string;
  continueButtonText: string;
  isRTL: boolean;
  canAccept: boolean;
}

/**
 * LegalModalFooter
 *
 * Reusable footer component with acceptance checkbox and continue button.
 * When canAccept is false, the checkbox is disabled and a scroll hint is shown.
 */
export const LegalModalFooter: React.FC<LegalModalFooterProps> = ({
  isAccepted,
  onToggleAcceptance,
  onContinue,
  requireAcceptance,
  acceptanceText,
  continueButtonText,
  isRTL,
  canAccept,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.footer, { backgroundColor: theme.background.secondary }]}
    >
      <Pressable
        onPress={() => {
          if (canAccept) {
            onToggleAcceptance();
          }
        }}
        style={({ pressed }) => [
          styles.checkboxContainer,
          !canAccept && styles.checkboxDisabled,
          pressed && canAccept && styles.checkboxPressed,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
        disabled={!canAccept}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isAccepted, disabled: !canAccept }}
        accessibilityLabel={acceptanceText}
      >
        <View style={styles.checkboxIcon}>
          <Icon
            name={isAccepted ? 'check-square' : 'square'}
            size={24}
            color={
              canAccept
                ? isAccepted
                  ? theme.text.link
                  : theme.border.primary
                : theme.text.tertiary
            }
          />
        </View>
        <CustomText
          style={[
            styles.checkboxText,
            {
              color: canAccept ? theme.text.secondary : theme.text.tertiary,
              marginLeft: isRTL ? 0 : 12,
              marginRight: isRTL ? 12 : 0,
            },
          ]}
        >
          {acceptanceText}
        </CustomText>
      </Pressable>

      {!canAccept && (
        <CustomText
          style={[
            styles.scrollHint,
            {
              color: theme.text.tertiary,
            },
          ]}
        >
          {t('legal.scrollToAccept', {
            defaultValue: 'Scroll to the bottom to accept',
          })}
        </CustomText>
      )}

      <CustomButton
        title={continueButtonText}
        onPress={onContinue}
        disabled={requireAcceptance && !isAccepted}
        containerStyle={styles.continueButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  checkboxPressed: {
    opacity: 0.7,
  },
  checkboxDisabled: {
    opacity: 0.4,
  },
  checkboxIcon: {
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  scrollHint: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  continueButton: {
    marginTop: 8,
  },
});
