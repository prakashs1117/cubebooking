/**
 * ratePromptStorage
 *
 * Manages the smart show/hide decision for the QuickRatePopup.
 *
 * Decision rules:
 *  1. If the user has ever responded (submitted feedback OR opened store) → never show again.
 *  2. Show first time after FIRST_THRESHOLD qualifying actions.
 *  3. If user soft-dismisses (X / "Maybe Later"), wait COOLDOWN_DAYS before trying again,
 *     and require REDISPLAY_EXTRA_ACTIONS additional actions.
 *  4. After MAX_DISMISSALS soft-dismissals, stop permanently — don't keep pestering.
 *  5. Never show more than once per app session (in-memory guard).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEY = {
  HAS_RESPONDED: '@rate_prompt:responded',
  ACTION_COUNT: '@rate_prompt:action_count',
  LAST_DISMISSED_AT: '@rate_prompt:dismissed_at',
  DISMISS_COUNT: '@rate_prompt:dismiss_count',
} as const;

// ─── Tuning constants ─────────────────────────────────────────────────────────

/** Show popup after this many qualifying user actions */
const FIRST_THRESHOLD = 3;

/** After a soft-dismiss, require this many MORE actions before showing again */
const REDISPLAY_EXTRA_ACTIONS = 4;

/** Days to wait after a soft-dismiss before eligible to show again */
const COOLDOWN_DAYS = 7;

/** After this many soft-dismissals, stop asking forever */
const MAX_DISMISSALS = 3;

// ─── In-memory session guard (resets on app restart) ─────────────────────────

let _shownThisSession = false;

export const resetSessionGuard = (): void => {
  // exposed for unit tests only
  _shownThisSession = false;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RatePromptStatus {
  hasResponded: boolean;
  actionCount: number;
  lastDismissedAt: number | null;
  dismissCount: number;
}

// ─── Read / Write helpers ─────────────────────────────────────────────────────

export const getStatus = async (): Promise<RatePromptStatus> => {
  const [responded, count, dismissedAt, dismissCount] = await Promise.all([
    AsyncStorage.getItem(KEY.HAS_RESPONDED),
    AsyncStorage.getItem(KEY.ACTION_COUNT),
    AsyncStorage.getItem(KEY.LAST_DISMISSED_AT),
    AsyncStorage.getItem(KEY.DISMISS_COUNT),
  ]);
  return {
    hasResponded: responded === 'true',
    actionCount: count ? parseInt(count, 10) : 0,
    lastDismissedAt: dismissedAt ? parseInt(dismissedAt, 10) : null,
    dismissCount: dismissCount ? parseInt(dismissCount, 10) : 0,
  };
};

/** Call when user submits in-app feedback OR opens the store. */
export const markAsResponded = async (): Promise<void> => {
  await AsyncStorage.setItem(KEY.HAS_RESPONDED, 'true');
};

/** Call when user taps X or "Maybe Later" without submitting. */
export const markDismissed = async (): Promise<void> => {
  const current = await AsyncStorage.getItem(KEY.DISMISS_COUNT);
  const next = (current ? parseInt(current, 10) : 0) + 1;
  await Promise.all([
    AsyncStorage.setItem(KEY.LAST_DISMISSED_AT, String(Date.now())),
    AsyncStorage.setItem(KEY.DISMISS_COUNT, String(next)),
  ]);
};

/**
 * Increments the action counter and returns the new count.
 * Call this after every qualifying user action.
 */
export const incrementActionCount = async (): Promise<number> => {
  const current = await AsyncStorage.getItem(KEY.ACTION_COUNT);
  const next = (current ? parseInt(current, 10) : 0) + 1;
  await AsyncStorage.setItem(KEY.ACTION_COUNT, String(next));
  return next;
};

// ─── Decision engine ──────────────────────────────────────────────────────────

/**
 * Returns true if the prompt should be shown right now.
 * Does NOT mutate any storage; pure read.
 */
export const shouldShowPrompt = async (): Promise<boolean> => {
  // In-memory session guard — only once per app session
  if (_shownThisSession) return false;

  const status = await getStatus();

  // Rule 1 — user already responded permanently
  if (status.hasResponded) return false;

  // Rule 4 — user has dismissed too many times, give up
  if (status.dismissCount >= MAX_DISMISSALS) return false;

  // Rule 2 / 3 — action-count threshold
  const threshold =
    FIRST_THRESHOLD + status.dismissCount * REDISPLAY_EXTRA_ACTIONS;
  if (status.actionCount < threshold) return false;

  // Rule 3 — cooldown after previous dismissal
  if (status.lastDismissedAt) {
    const daysSince =
      (Date.now() - status.lastDismissedAt) / (1000 * 60 * 60 * 24);
    if (daysSince < COOLDOWN_DAYS) return false;
  }

  // All gates passed — mark session so we don't show twice
  _shownThisSession = true;
  return true;
};
