/**
 * Push Notification Service
 * FCM push is disabled (react-native-firebase/messaging removed — was crashing app launch
 * via its native AppDelegate swizzling). Local notifications still work.
 * All exports are kept as no-ops so call sites don't need to change.
 */

import {
  initLocalNotifications,
  registerFoodReminderBackgroundHandler,
} from '@services/localNotificationService';

export const registerDeviceToken = async (): Promise<void> => {};

/**
 * @deprecated Use registerDeviceToken() instead.
 * Kept for the FoodScreen call-site that still uses this signature.
 */
export const syncFCMTokenToBackend = async (
  _postTokenFn: (token: string) => Promise<void>,
): Promise<void> => {};

export const initializePushNotifications = async (): Promise<() => void> => {
  initLocalNotifications().catch(() => {});
  registerFoodReminderBackgroundHandler();
  return () => {};
};
