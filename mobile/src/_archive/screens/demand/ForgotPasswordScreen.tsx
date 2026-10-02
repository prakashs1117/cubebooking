/**
 * ForgotPasswordScreen
 *
 * Password recovery screen
 * Features:
 * - Email input field with validation
 * - Submit button with loading state
 * - Success message state
 * - Back to SignIn button
 * - Integration with auth service
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { authService } from '@/services/api/demand/auth';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      if (__DEV__) {
        console.log('🔐 Requesting password reset for email:', data.email);
      }

      await authService.forgotPassword(data.email);

      setSubmittedEmail(data.email);
      setSuccess(true);

      if (__DEV__) {
        console.log('✅ Password reset email sent successfully');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send reset email. Please try again.';

      if (__DEV__) {
        console.error('❌ Forgot password error:', errorMessage);
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.successContent}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✓</Text>
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to{'\n'}
            <Text style={styles.emailHighlight}>{submittedEmail}</Text>
          </Text>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionStep}>
              <Text style={styles.stepNumber}>1.</Text> Check your email for the
              reset link
            </Text>
            <Text style={styles.instructionStep}>
              <Text style={styles.stepNumber}>2.</Text> Click the link to set a
              new password
            </Text>
            <Text style={styles.instructionStep}>
              <Text style={styles.stepNumber}>3.</Text> Sign in with your new
              password
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              setSuccess(false);
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          {/* Resend Link */}
          <TouchableOpacity
            onPress={() => setSuccess(false)}
            style={styles.resendContainer}
          >
            <Text style={styles.resendText}>
              Didn't receive the email?{' '}
              <Text style={styles.resendLink}>Try again</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Password reset form
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.backArrow}
          >
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="your.email@company.com"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  editable={!loading}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading || isSubmitting}
            style={[
              styles.button,
              (loading || isSubmitting) && styles.buttonDisabled,
            ]}
          >
            {loading || isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelContainer}
          >
            <Text style={styles.cancelText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            If you don't have an account, contact your administrator to request
            access.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backArrow: {
    paddingRight: 16,
    paddingTop: 4,
  },
  backArrowText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  cancelText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    textAlign: 'center',
  },

  // Success screen styles
  successContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  emailHighlight: {
    color: '#000',
    fontWeight: '600',
  },
  instructionsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 24,
  },
  instructionStep: {
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
    marginBottom: 12,
  },
  stepNumber: {
    fontWeight: '700',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 24,
  },
  backButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
