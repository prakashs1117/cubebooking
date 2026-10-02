import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import AppText from '@components/common/AppText';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { getFontStyle } from '@utils/fonts';
import OTPInput from '@components/auth/OTPInput';
import { useAuth } from '@context/AuthContext';
import {
  handleApiError,
  parseApiError,
  getErrorTitle,
} from '@utils/apiErrorHandler';
import { AppModal, ModalConfig } from '@components/modals';
import { BaseColors, useTheme } from '@theme/index';
import type { ThemeColors } from '@theme/colors';

interface OTPBottomSheetProps {
  email: string;
  onClose: () => void;
}

const RESEND_SECONDS = 60;

const OTPBottomSheet: React.FC<OTPBottomSheetProps> = ({ email, onClose }) => {
  const { t } = useTranslation();
  const { verifyRegistration, resendOTP } = useAuth();
  const { theme, isDark } = useTheme();

  const bottomSheetRef = useRef<any>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      bottomSheetRef.current?.present();
    }, 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} pressBehavior="none" />
    ),
    [],
  );

  const handleDismiss = useCallback(() => { onClose(); }, [onClose]);
  const handleClose = () => { bottomSheetRef.current?.dismiss(); };

  const handleVerify = async (codeValue: string = code) => {
    if (isLoadingRef.current) return;
    setCodeError('');
    if (codeValue.length < 6) {
      setCodeError(t('validation.otpInvalid', { defaultValue: 'OTP must be 6 digits' }));
      return;
    }
    Keyboard.dismiss();
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      await verifyRegistration({ email, code: codeValue });
    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = handleApiError(error);
      setCode('');
      setModal({ variant: 'error', title: getErrorTitle(apiError), message: errorMessage });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOTP({ email, type: 'registration' });
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      setCode('');
      setModal({
        variant: 'info',
        title: t('common.success', { defaultValue: 'Success' }),
        message: t('auth.codeSentTo', { email, defaultValue: `Code sent to ${email}` }),
      });
    } catch (error) {
      const apiError = parseApiError(error);
      setModal({ variant: 'error', title: getErrorTitle(apiError), message: handleApiError(error) });
    } finally {
      setIsResending(false);
    }
  };

  const isVerifyEnabled = code.length === 6 && !isLoading;
  const styles = getStyles(theme, isDark);

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['75%', '92%']}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        onDismiss={handleDismiss}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.header}>
            <AppText style={styles.title}>
              {t('auth.verifyEmailTitle', { defaultValue: 'Verify Email' })}
            </AppText>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <AppText style={styles.closeBtnText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <AppText style={styles.description}>
            {t('auth.verifyEmailDescription', {
              defaultValue: 'You received a verification email containing a verification code. Please check your emails and enter the code below to finish the signup.',
            })}
          </AppText>

          <AppText style={styles.emailText}>{email}</AppText>

          <OTPInput
            value={code}
            onChangeText={newCode => {
              setCode(newCode);
              if (newCode.length === 6 && !isLoadingRef.current) { handleVerify(newCode); }
            }}
            error={codeError}
            length={6}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.verifyButton, !isVerifyEnabled && styles.verifyButtonDisabled]}
            onPress={() => handleVerify()}
            disabled={!isVerifyEnabled}
            activeOpacity={0.85}
          >
            <View style={styles.verifyButtonContent}>
              {isLoading && <ActivityIndicator color="#FFFFFF" size="small" />}
              <AppText style={styles.verifyButtonText}>
                {t('auth.verifyButton', { defaultValue: 'Verify Code' })}
              </AppText>
            </View>
          </TouchableOpacity>

          <View style={styles.resendSection}>
            <AppText style={styles.resendPrompt}>
              {t('auth.didntReceiveCode', { defaultValue: "Didn't receive the code?" })}
            </AppText>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isResending} activeOpacity={0.7}>
                <AppText style={styles.resendLink}>
                  {isResending ? t('auth.sending', { defaultValue: 'Sending...' }) : t('auth.resendCode', { defaultValue: 'Resend Code' })}
                </AppText>
              </TouchableOpacity>
            ) : (
              <AppText style={styles.timerText}>
                {t('auth.resendIn', { seconds: timer, defaultValue: `Resend in ${timer}s` })}
              </AppText>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </>
  );
};

function getStyles(theme: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    handleIndicator: {
      backgroundColor: theme.border.primary,
      width: 40,
    },
    sheetBackground: {
      backgroundColor: theme.background.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      fontFamily: getFontStyle('h2').fontFamily,
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      fontSize: 16,
      color: theme.text.secondary,
    },
    description: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 22,
      marginBottom: 8,
    },
    emailText: {
      fontFamily: getFontStyle('link').fontFamily,
      fontSize: 14,
      fontWeight: '600',
      color: BaseColors.merckPurple,
      marginBottom: 8,
    },
    verifyButton: {
      height: 52,
      borderRadius: 8,
      backgroundColor: BaseColors.merckPurple,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 24,
    },
    verifyButtonDisabled: { opacity: 0.5 },
    verifyButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    verifyButtonText: {
      fontFamily: getFontStyle('button').fontFamily,
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    resendSection: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border.primary,
      gap: 8,
    },
    resendPrompt: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: theme.text.secondary,
    },
    resendLink: {
      fontFamily: getFontStyle('link').fontFamily,
      fontSize: 14,
      fontWeight: '600',
      color: BaseColors.merckPurple,
    },
    timerText: {
      fontFamily: getFontStyle('body').fontFamily,
      fontSize: 14,
      color: theme.text.secondary,
    },
  });
}

export default OTPBottomSheet;
