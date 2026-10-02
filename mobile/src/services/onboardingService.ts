import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@app_onboarding_completed';

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    console.log('✅ Onboarding marked as completed');
  } catch (error) {
    console.error('❌ Error setting onboarding completed:', error);
  }
};

// ─── Per-screen swipe hint ────────────────────────────────────────────────────

const swipeHintKey = (screen: string) => `@swipe_hint_seen_${screen}`;

export const hasSeenSwipeHint = async (screen: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(swipeHintKey(screen));
    return value === 'true';
  } catch {
    return false;
  }
};

export const markSwipeHintSeen = async (screen: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(swipeHintKey(screen), 'true');
  } catch {}
};

export const resetSwipeHints = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem('@swipe_hint_seen_home'),
    AsyncStorage.removeItem('@swipe_hint_seen_history'),
    AsyncStorage.removeItem('@swipe_hint_seen_favourites'),
  ]);
};

// ─── Reset ────────────────────────────────────────────────────────────────────

/**
 * Reset onboarding status (for testing)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log('✅ Onboarding status reset');
  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
  }
};
