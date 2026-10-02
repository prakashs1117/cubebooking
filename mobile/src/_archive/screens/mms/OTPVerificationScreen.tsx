import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { AppModal, ModalConfig } from '@components/modals';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import CustomButton from '@components/common/CustomButton';
import AuthLayout from '@components/auth/AuthLayout';
import OTPInput from '@components/auth/OTPInput';
import { useAuth } from '@context/AuthContext';
import { validation } from '@utils/validation';
import { RootStackParamList } from '@/types/navigation';
import {
  handleApiError,
  parseApiError,
  getErrorTitle,
} from '@utils/apiErrorHandler';

type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OTPVerification'
>;
type OTPVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'OTPVerification'
>;

const OTPVerificationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const { verifyRegistration, resendOTP } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const email = route.params?.email || '';
  const type = route.params?.type || 'registration';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    setCodeError('');

    const errorKey = validation.getOTPError(code);
    if (errorKey) {
      setCodeError(t(errorKey));
      return;
    }

    setIsLoading(true);
    try {
      await verifyRegistration({ email, code });
      setModal({
        variant: 'success',
        title: t('common.success'),
        message: t('auth.verifyWelcome'),
        confirmLabel: t('common.ok'),
        onConfirm: () => navigation.navigate('Main'),
      });
    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = handleApiError(error);
      setModal({
        variant: 'error',
        title: getErrorTitle(apiError),
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOTP({ email, type });
      setTimer(60);
      setCanResend(false);
      setModal({
        variant: 'info',
        title: t('common.success'),
        message: t('auth.codeSentTo', { email }),
      });
    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = handleApiError(error);
      setModal({
        variant: 'error',
        title: getErrorTitle(apiError),
        message: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const styles = StyleSheet.create({
    formContainer: {
      maxWidth: isTablet ? 500 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    header: {
      marginBottom: 32,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background.card,
      marginBottom: 24,
    },
    backButtonText: {
      fontSize: 20,
      color: theme.text.primary,
    },
    title: {
      fontFamily: getFontStyle('h2').fontFamily,
      fontSize: isTablet ? 32 : 28,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontFamily: getFontStyle('subtitle').fontFamily,
      fontSize: 15,
      color: theme.text.secondary,
      lineHeight: 22,
    },
    form: {
      marginBottom: 16,
      marginTop: 8,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
    resendText: {
      fontFamily: getFontStyle('bodySmall').fontFamily,
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 12,
    },
    resendButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    resendButtonText: {
      fontFamily: getFontStyle('link').fontFamily,
      fontSize: 14,
      fontWeight: '600',
      color: theme.button.primary.background,
    },
    timerText: {
      fontFamily: getFontStyle('bodySmall').fontFamily,
      fontSize: 14,
      color: theme.text.secondary,
    },
  });

  return (
    <AuthLayout
      welcomeTitle={t('auth.verifyEmail')}
      welcomeSubtitle={t('auth.verifyWelcome')}
    >
      <View style={styles.formContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('auth.verifyEmail')}</Text>
          <Text style={styles.subtitle}>{t('auth.codeSentTo', { email })}</Text>
        </View>

        <View style={styles.form}>
          <OTPInput
            value={code}
            onChangeText={setCode}
            error={codeError}
            length={6}
            autoFocus={true}
          />

          <CustomButton
            title={isLoading ? t('auth.verifying') : t('auth.verifyButton')}
            onPress={handleVerify}
            variant="primary"
            size="large"
            loading={isLoading}
          />
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{t('auth.didntReceiveCode')}</Text>
          {canResend ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.7}
            >
              <Text style={styles.resendButtonText}>
                {isResending ? t('auth.sending') : t('auth.resendCode')}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              {t('auth.resendIn', { seconds: timer })}
            </Text>
          )}
        </View>
      </View>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </AuthLayout>
  );
};

export default OTPVerificationScreen;
