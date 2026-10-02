/**
 * Edit Profile Modal - Full Screen
 * Modern form with react-hook-form validation
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import CustomInput from '@components/common/CustomInput';
import CustomButton from '@components/common/CustomButton';
import Icon from '@components/icons/Icon';
import { UserProfile } from '@/types/user.types';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  company?: string;
  department?: string;
  designation?: string;
  specialization?: string;
  experienceYears?: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  userProfile,
  onSave,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      company: '',
      department: '',
      designation: '',
      specialization: '',
      experienceYears: '',
    },
  });

  // Initialize form when modal opens
  useEffect(() => {
    if (userProfile && visible) {
      reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        username: userProfile.username || '',
        email: userProfile.email || '',
        company: userProfile.company || '',
        department: userProfile.department || '',
        designation: userProfile.designation || '',
        specialization: userProfile.specialization || '',
        experienceYears: userProfile.experienceYears?.toString() || '',
      });
    }
  }, [userProfile, visible, reset]);

  // Handle form submission
  const onSubmit = (data: ProfileFormData) => {
    const updatedProfile: Partial<UserProfile> = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      company: data.company?.trim() || (null as any),
      department: data.department?.trim() || (null as any),
      designation: data.designation?.trim() || (null as any),
      specialization: data.specialization?.trim() || (null as any),
      experienceYears: data.experienceYears
        ? parseInt(data.experienceYears, 10)
        : 0,
    };

    onSave(updatedProfile);
  };

  // Handle close with confirmation if form is dirty
  const handleClose = () => {
    if (isDirty && !isLoading) {
      // Could add Alert here if needed
      reset();
      onClose();
    } else {
      reset();
      onClose();
    }
  };

  if (!userProfile) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
      paddingTop: insets.top,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    headerIcon: {
      marginRight: 12,
    },
    headerTitles: {
      flex: 1,
    },
    headerTitle: {
      fontFamily: getFontStyle('h3').fontFamily,
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
    },
    headerSubtitle: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 13,
      color: theme.text.tertiary,
      marginTop: 2,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: insets.bottom + 100,
    },
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    sectionTitle: {
      fontFamily: getFontStyle('h4').fontFamily,
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
    },
    helperBox: {
      marginTop: 16,
      padding: 14,
      backgroundColor: theme.background.secondary,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.button.primary.background,
    },
    helperText: {
      fontFamily: getFontStyle('caption').fontFamily,
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 18,
    },
    errorText: {
      fontFamily: getFontStyle('error').fontFamily,
      fontSize: 12,
      color: theme.button.error.background,
      marginTop: -8,
      marginBottom: 8,
      marginLeft: 2,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.background.primary,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: insets.bottom + 16,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Icon
                name="user"
                size={24}
                color={theme.button.primary.background}
              />
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>
                Update your personal information
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Icon name="close" size={22} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="user"
                size={18}
                color={theme.button.primary.background}
              />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <Controller
              control={control}
              name="firstName"
              rules={{
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'Must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <CustomInput
                    label="First Name *"
                    placeholder="Enter your first name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                    leftIcon={
                      <Icon name="user" size={18} color={theme.text.tertiary} />
                    }
                    editable={!isLoading}
                  />
                </>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={{
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Last Name *"
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  leftIcon={
                    <Icon name="user" size={18} color={theme.text.tertiary} />
                  }
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Must be at least 3 characters',
                },
                pattern: {
                  value: /^[a-z0-9_]+$/,
                  message: 'Only lowercase letters, numbers, and underscores',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Username *"
                  placeholder="Enter your username"
                  value={value}
                  onChangeText={text =>
                    onChange(text.toLowerCase().replace(/\s/g, ''))
                  }
                  onBlur={onBlur}
                  error={errors.username?.message}
                  autoCapitalize="none"
                  leftIcon={
                    <Icon
                      name="user-outline"
                      size={18}
                      color={theme.text.tertiary}
                    />
                  }
                  editable={!isLoading}
                />
              )}
            />
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="mail"
                size={18}
                color={theme.button.primary.background}
              />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Email Address *"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={text => onChange(text.toLowerCase())}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={
                    <Icon name="mail" size={18} color={theme.text.tertiary} />
                  }
                  editable={!isLoading}
                />
              )}
            />
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon
                name="merck"
                size={18}
                color={theme.button.primary.background}
              />
              <Text style={styles.sectionTitle}>Professional Information</Text>
            </View>

            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Company"
                  placeholder="Enter your company name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={
                    <Icon name="merck" size={18} color={theme.text.tertiary} />
                  }
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="department"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Department"
                  placeholder="Enter your department"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={
                    <Icon
                      name="component"
                      size={18}
                      color={theme.text.tertiary}
                    />
                  }
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="designation"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Job Title"
                  placeholder="Enter your job title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={
                    <Icon
                      name="achievement"
                      size={18}
                      color={theme.text.tertiary}
                    />
                  }
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="specialization"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Specialization"
                  placeholder="Enter your specialization"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={
                    <Icon name="star" size={18} color={theme.text.tertiary} />
                  }
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="experienceYears"
              rules={{
                pattern: {
                  value: /^[0-9]*$/,
                  message: 'Only numbers allowed',
                },
                validate: value => {
                  if (!value) return true;
                  const num = parseInt(value, 10);
                  if (num < 0) return 'Cannot be negative';
                  if (num > 70) return 'Must be less than 70';
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  label="Years of Experience"
                  placeholder="Enter years (e.g., 5)"
                  value={value}
                  onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))}
                  onBlur={onBlur}
                  error={errors.experienceYears?.message}
                  keyboardType="number-pad"
                  leftIcon={
                    <Icon
                      name="sparkle"
                      size={18}
                      color={theme.text.tertiary}
                    />
                  }
                  editable={!isLoading}
                />
              )}
            />

            <View style={styles.helperBox}>
              <Text style={styles.helperText}>
                💡 Professional fields are optional. Leave empty to remove from
                your profile.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <CustomButton
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              size="large"
              containerStyle={styles.button}
              disabled={isLoading}
            />
            <CustomButton
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              size="large"
              loading={isLoading}
              containerStyle={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileModal;
