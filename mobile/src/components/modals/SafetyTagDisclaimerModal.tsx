import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';

interface SafetyTagDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
}

const SafetyTagDisclaimerModal: React.FC<SafetyTagDisclaimerModalProps> = ({
  visible,
  onAccept,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark
                ? theme.background.card
                : BaseColors.white,
              marginBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header bar */}
          <View
            style={[
              styles.headerBar,
              { backgroundColor: BaseColors.merckPurple },
            ]}
          >
            <CustomText style={styles.headerTitle}>
              {t('safetyTag.disclaimerTitle')}
            </CustomText>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <CustomText
              style={[styles.bodyText, { color: theme.text.primary }]}
            >
              {t('safetyTag.disclaimerBody')}
            </CustomText>
          </View>

          {/* OK button */}
          <TouchableOpacity
            style={[
              styles.okButton,
              { backgroundColor: BaseColors.merckPurple },
            ]}
            onPress={onAccept}
            activeOpacity={0.85}
          >
            <CustomText style={styles.okButtonText}>
              {t('common.ok')}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BaseColors.white,
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  okButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  okButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: BaseColors.white,
    letterSpacing: 0.3,
  },
});

export default SafetyTagDisclaimerModal;
