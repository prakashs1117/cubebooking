import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import {
  Heading3,
  BodyText,
  ButtonText,
  CaptionText,
} from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { useAuth } from '@context/AuthContext';
import { showSuccess, showError } from '@utils/toast';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
}

const ProfileUpdateForm: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Initialize form with existing data
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError({
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual API call to update profile
      // await authService.updateProfile(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      showSuccess({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
      });
    } catch {
      showError({
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 8,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
      fontFamily: getFontStyle('bodyMedium').fontFamily,
    },
    input: {
      backgroundColor: theme.background.secondary,
      borderWidth: 1,
      borderColor: theme.border.secondary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text.primary,
      fontFamily: getFontStyle('body').fontFamily,
    },
    inputError: {
      borderColor: theme.button.error.background,
    },
    inputDisabled: {
      backgroundColor: theme.background.tertiary,
      color: theme.text.tertiary,
    },
    errorText: {
      fontSize: 12,
      color: theme.button.error.background,
      marginTop: 4,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    helperText: {
      fontSize: 12,
      color: theme.text.tertiary,
      marginTop: 4,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    saveButton: {
      backgroundColor: theme.button.primary.background,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      gap: 8,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    emailInfo: {
      backgroundColor: theme.background.secondary,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="user" size={20} color={theme.button.primary.background} />
        <Heading3 color={theme.text.primary}>Personal Information</Heading3>
      </View>

      {/* First Name */}
      <View style={styles.formGroup}>
        <BodyText style={styles.label}>First Name *</BodyText>
        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          value={formData.firstName}
          onChangeText={value => handleChange('firstName', value)}
          placeholder="Enter your first name"
          placeholderTextColor={theme.text.tertiary}
          editable={!isLoading}
        />
        {errors.firstName && (
          <CaptionText style={styles.errorText}>{errors.firstName}</CaptionText>
        )}
      </View>

      {/* Last Name */}
      <View style={styles.formGroup}>
        <BodyText style={styles.label}>Last Name *</BodyText>
        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          value={formData.lastName}
          onChangeText={value => handleChange('lastName', value)}
          placeholder="Enter your last name"
          placeholderTextColor={theme.text.tertiary}
          editable={!isLoading}
        />
        {errors.lastName && (
          <CaptionText style={styles.errorText}>{errors.lastName}</CaptionText>
        )}
      </View>

      {/* Phone */}
      <View style={styles.formGroup}>
        <BodyText style={styles.label}>Phone Number (Optional)</BodyText>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={formData.phone}
          onChangeText={value => handleChange('phone', value)}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor={theme.text.tertiary}
          keyboardType="phone-pad"
          editable={!isLoading}
        />
        {errors.phone && (
          <CaptionText style={styles.errorText}>{errors.phone}</CaptionText>
        )}
        {!errors.phone && (
          <CaptionText style={styles.helperText}>
            Include country code if applicable
          </CaptionText>
        )}
      </View>

      {/* Email (Read-only) */}
      <View style={styles.emailInfo}>
        <Icon name="mail" size={16} color={theme.text.tertiary} />
        <View style={{ flex: 1 }}>
          <CaptionText style={{ color: theme.text.tertiary }}>
            Email
          </CaptionText>
          <BodyText style={{ color: theme.text.secondary, fontSize: 14 }}>
            {user?.email || 'No email'}
          </BodyText>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color={theme.button.primary.text} />
            <ButtonText color={theme.button.primary.text}>Saving...</ButtonText>
          </>
        ) : (
          <>
            <Icon
              name="checkbox-checked"
              size={18}
              color={theme.button.primary.text}
            />
            <ButtonText color={theme.button.primary.text}>
              Save Changes
            </ButtonText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileUpdateForm;
