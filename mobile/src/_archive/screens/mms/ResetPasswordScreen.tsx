import React, { useState } from 'react';
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
import CustomInput from '@components/common/CustomInput';
import CustomButton from '@components/common/CustomButton';
import AuthLayout from '@components/auth/AuthLayout';
import LockIcon from '@assets/icon-lock';
import VisibilityIcon from '@assets/icon-visibility';
import VisibilityOffIcon from '@assets/icon-visibility-off';
import { useAuth } from '@context/AuthContext';
import { validation } from '@utils/validation';
import { RootStackParamList } from '@/types/navigation';
import {
  handleApiError,
  parseApiError,
  getErrorTitle,
} from '@utils/apiErrorHandler';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ResetPassword'
>;
type ResetPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  'ResetPassword'
>;

const ResetPasswordScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { resetPassword } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const email = route.params?.email || '';

  const handleSubmit = async () => {
    setCodeError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    const otpErrKey = validation.getOTPError(code);
    if (otpErrKey) {
      setCodeError(t(otpErrKey));
      hasError = true;
    }

    const passwordErrKey = validation.getPasswordError(newPassword, true);
    if (passwordErrKey) {
      setNewPasswordError(t(passwordErrKey));
      hasError = true;
    }

    const confirmErrKey = validation.getPasswordConfirmError(
      newPassword,
      confirmPassword,
    );
    if (confirmErrKey) {
      setConfirmPasswordError(t(confirmErrKey));
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      setModal({
        variant: 'success',
        title: t('common.success'),
        message: t('auth.resetPasswordTitle'),
        confirmLabel: t('common.ok'),
        onConfirm: () => navigation.navigate('SignIn'),
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
    },
  });

  return (
    <AuthLayout
      welcomeTitle={t('auth.resetPassword')}
      welcomeSubtitle={t('auth.resetPasswordWelcome')}
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

          <Text style={styles.title}>{t('auth.resetPassword')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.resetCodeSentTo', { email })}
          </Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label={t('auth.verificationCode')}
            placeholder={t('auth.enterVerificationCode')}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            error={codeError}
          />

          <CustomInput
            label={t('auth.newPassword')}
            placeholder={t('auth.passwordPlaceholder')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            leftIcon={<LockIcon size={20} color="#668583" />}
            rightIcon={
              showNewPassword ? (
                <VisibilityOffIcon size={20} color="#668583" />
              ) : (
                <VisibilityIcon size={20} color="#668583" />
              )
            }
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
            error={newPasswordError}
          />

          <CustomInput
            label={t('auth.confirmNewPassword')}
            placeholder={t('auth.passwordPlaceholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            leftIcon={<LockIcon size={20} color="#668583" />}
            rightIcon={
              showConfirmPassword ? (
                <VisibilityOffIcon size={20} color="#668583" />
              ) : (
                <VisibilityIcon size={20} color="#668583" />
              )
            }
            onRightIconPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            error={confirmPasswordError}
          />

          <CustomButton
            title={isLoading ? t('auth.resetting') : t('auth.resetPassword')}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={isLoading}
          />
        </View>
      </View>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </AuthLayout>
  );
};

export default ResetPasswordScreen;
