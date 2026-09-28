/**
 * Maps Firebase Auth error codes to messages we're happy to show a user.
 * Extracted from the original inline map in AdminLogin.tsx so every auth
 * surface reports failures the same way.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password is too weak (minimum 6 characters).',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/missing-password': 'Please enter a password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in window was closed before finishing.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
  'auth/account-exists-with-different-credential':
    'An account with this email already exists using a different sign-in method.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled for this project.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
  'auth/user-disabled': 'This account has been disabled.',
}

export function authErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const code = (err as { code?: string } | null)?.code
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code]
  if (err instanceof Error && err.message && !code) return err.message
  return fallback
}
