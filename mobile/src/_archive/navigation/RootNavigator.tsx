import React, { useEffect } from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '@screens/SignInScreen';
import SignUpScreen from '@screens/SignUpScreen';
import ForgotPasswordScreen from '@screens/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/ResetPasswordScreen';
import OTPVerificationScreen from '@screens/OTPVerificationScreen';
import DrawerNavigator from '@navigation/DrawerNavigator';
import TabNavigator from '@navigation/TabNavigator';
import { RootStackParamList } from '@/types/navigation';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@theme/index';
import { useFeatureFlagsSync } from '@hooks/useFeatureFlagsSync';
import { useNotifications } from '@hooks/useNotifications';
import FEATURE_FLAGS_SYNC_CONFIG from '@config/featureFlagsSync.config';
import NOTIFICATIONS_SYNC_CONFIG from '@config/notificationsSync.config';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    sessionExpired,
    dismissSessionExpired,
    logout,
    pendingAuthTarget,
    clearPendingAuthTarget,
  } = useAuth();
  const { theme } = useTheme();

  // Sync feature flags from API with automatic polling (only when authenticated)
  useFeatureFlagsSync({
    enabled: isAuthenticated && FEATURE_FLAGS_SYNC_CONFIG.AUTO_SYNC_ENABLED,
    pollingInterval: FEATURE_FLAGS_SYNC_CONFIG.POLLING_INTERVAL,
    autoSync: true,
    foregroundOnly: FEATURE_FLAGS_SYNC_CONFIG.FOREGROUND_ONLY,
  });

  // Sync notifications from API with automatic polling (only when authenticated)
  useNotifications({
    enabled: isAuthenticated && NOTIFICATIONS_SYNC_CONFIG.AUTO_SYNC_ENABLED,
    pollingInterval: NOTIFICATIONS_SYNC_CONFIG.POLLING_INTERVAL,
    autoSync: true,
    page: NOTIFICATIONS_SYNC_CONFIG.DEFAULT_PAGE,
    limit: NOTIFICATIONS_SYNC_CONFIG.DEFAULT_LIMIT,
  });

  // Feature flag from JSON config via Zustand store
  const isDrawerEnabled = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('ENABLE_DRAWER_NAVIGATION'),
  );

  // After exitGuestMode flips isAuthenticated → false, navigate to the requested auth screen
  useEffect(() => {
    if (!isAuthenticated && pendingAuthTarget) {
      const timer = setTimeout(() => {
        const { navigationRef } = require('@navigation/navigationRef');
        if (navigationRef.isReady()) {
          navigationRef.navigate(
            pendingAuthTarget === 'signUp' ? 'SignUp' : 'SignIn',
          );
        }
        clearPendingAuthTarget();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pendingAuthTarget, clearPendingAuthTarget]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    card: {
      backgroundColor: theme.background.primary,
      borderRadius: 16,
      padding: 28,
      width: '100%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 10,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    button: {
      backgroundColor: theme.button.primary.background,
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 40,
    },
    buttonText: {
      color: theme.button.primary.text,
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack - shown when user is not authenticated
          <Stack.Group>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
            />
          </Stack.Group>
        ) : (
          // Main Stack - shown when user is authenticated
          // Use drawer navigation if enabled, otherwise use tabs only
          <Stack.Screen
            name="Main"
            component={isDrawerEnabled ? DrawerNavigator : TabNavigator}
          />
        )}
      </Stack.Navigator>

      {/* Session expired modal — shown over any screen */}
      <Modal
        visible={sessionExpired}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={dismissSessionExpired}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Session Expired</Text>
            <Text style={styles.message}>
              Your session has expired. Please log in again to continue.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                try {
                  await logout();
                } catch {
                  // Ignore logout API errors — tokens are already cleared by session handler
                }
                dismissSessionExpired();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RootNavigator;
