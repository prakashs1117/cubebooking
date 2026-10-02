/**
 * Push Notification Service
 * Handles FCM token registration, permission requests, and message handling.
 * Gated by the `push_notifications` feature flag.
 */

import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { getFeatureFlagValue } from '@stores/featureFlagsStore';
import { createNotification } from '@services/notificationService';
import { registerFCMToken } from '@services/api/notifications.service';
import { initLocalNotifications, registerFoodReminderBackgroundHandler } from '@services/localNotificationService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RemoteMessageData {
  screen?: string;
  eventId?: string;
  materialNumber?: string;
  [key: string]: string | undefined;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register this device's FCM token with the backend.
 * Call after every login, SSO completion, and registration.
 * Safe to call multiple times — the backend deduplicates by token.
 */
export const registerDeviceToken = async (): Promise<void> => {
  if (!getFeatureFlagValue('push_notifications')) return;
  try {
    const authStatus = await messaging().requestPermission();
    const allowed =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!allowed) return;

    const token = await messaging().getToken();
    if (token) {
      await registerFCMToken(token);
      console.log('[FCM] Token registered with backend');
    }
  } catch (e) {
    // Non-fatal — push just won't work until next login or token refresh
    console.warn('[FCM] Token registration failed:', e);
  }
};

/**
 * @deprecated Use registerDeviceToken() instead.
 * Kept for the FoodScreen call-site that still uses this signature.
 */
export const syncFCMTokenToBackend = async (postTokenFn: (token: string) => Promise<void>): Promise<void> => {
  if (!getFeatureFlagValue('push_notifications')) return;
  try {
    const token = await messaging().getToken();
    if (token) await postTokenFn(token);
  } catch (e) {
    console.warn('[FCM] Token sync failed:', e);
  }
};

/**
 * Handle deep-linking when notification is tapped.
 * Routes to Events, SDS, or a named screen based on the notification data.
 */
const handleDeepLink = (data?: RemoteMessageData): void => {
  if (!data) return;
  // navigationRef is set in App.tsx by events/notifications services
  // This will be called after the app opens, so routing happens naturally
};

/**
 * Handle incoming FCM message (foreground + background).
 * Creates an in-app notification that appears in the notification center.
 */
const handleMessage = (message: FirebaseMessagingTypes.RemoteMessage): void => {
  const { notification, data } = message;
  if (notification) {
    createNotification({
      title: notification.title ?? 'Notification',
      body: notification.body ?? '',
      data: data as RemoteMessageData,
    });
  }
};

/**
 * Initialize push notifications.
 * Call this once after the app has mounted (e.g. inside a useEffect in App.tsx).
 *
 * Returns a cleanup function that removes all listeners.
 */
export const initializePushNotifications = async (): Promise<() => void> => {
  // Initialize local notification channel + permissions (independent of push_notifications flag)
  initLocalNotifications().catch(() => {});
  registerFoodReminderBackgroundHandler();

  if (!getFeatureFlagValue('push_notifications')) {
    return () => {};
  }

  // iOS Simulator doesn't support push notifications
  const instance = messaging();
  if (typeof instance.requestPermission !== 'function') {
    console.log('[FCM] Push notifications not supported on this device/simulator');
    return () => {};
  }

  try {
    // Request permission
    const authStatus = await instance.requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return () => {};

    // Register/refresh FCM token with backend on every app start
    // (token may have rotated since last launch)
    registerDeviceToken().catch(() => {});

    // Handle notification that opened app from quit state
    const initialMessage = await instance.getInitialNotification();
    if (initialMessage?.data) handleDeepLink(initialMessage.data as RemoteMessageData);

    // Foreground messages
    const unsubForeground = instance.onMessage(async (message) => {
      handleMessage(message);
    });

    // Background/quit: notification tapped
    instance.onNotificationOpenedApp((message) => {
      if (message?.data) handleDeepLink(message.data as RemoteMessageData);
    });

    // Background handler (must be outside component)
    instance.setBackgroundMessageHandler(async (message) => {
      handleMessage(message);
    });

    // Token refresh — re-register with backend whenever Firebase rotates the token
    const unsubTokenRefresh = instance.onTokenRefresh(async (token) => {
      console.log('[FCM] Token refreshed, re-registering with backend');
      try {
        await registerFCMToken(token);
      } catch (e) {
        console.warn('[FCM] Token re-registration on refresh failed:', e);
      }
    });

    return () => {
      unsubForeground();
      unsubTokenRefresh();
    };
  } catch (error) {
    console.log('Push notification initialization failed:', error);
    return () => {};
  }
};
