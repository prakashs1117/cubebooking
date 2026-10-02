import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { feTokens, AUTH_BASE_URL } from './feClient';

/**
 * Firebase Auth service for FluentEdge
 * Handles email/password signup and signin via Firebase
 * Syncs user data with backend to get FluentEdge fields (tier, xp, level, etc.)
 */

interface FirebaseSyncInput {
  firebaseUid: string;
  email: string | null;
  firstName: string;
  lastName?: string;
  photoURL?: string | null;
}

/**
 * Sync a Firebase-authenticated user with the backend.
 * The backend finds/creates the user, returns FluentEdge fields AND issues its
 * own access/refresh JWTs (protectFE verifies these). We persist those tokens
 * via feTokens so every downstream /fe request authenticates.
 * Base URL comes from feClient (env-driven) — never hardcode the host here.
 */
async function syncWithBackend(input: FirebaseSyncInput): Promise<any> {
  const res = await fetch(`${AUTH_BASE_URL}/auth/firebase-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebaseUid: input.firebaseUid,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName || '',
      photoURL: input.photoURL ?? null,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Firebase sync failed (${res.status})`);
  }

  const { user, accessToken, refreshToken } = json.data || {};
  if (accessToken) await feTokens.set(accessToken, refreshToken);
  return user;
}

interface FirebaseSignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

interface FirebaseLoginInput {
  email: string;
  password: string;
}

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Sign up new Firebase user
 * Creates Firebase account, then syncs with backend to get FluentEdge user data
 */
export async function firebaseSignup(input: FirebaseSignupInput): Promise<{
  user: any; // User with FluentEdge fields from backend
  uid: string;
}> {
  try {
    // 1. Create Firebase account
    const userCred = await auth().createUserWithEmailAndPassword(
      input.email,
      input.password,
    );
    const firebaseUser = userCred.user;

    console.log(`[Firebase] User created: ${firebaseUser.email}`);

    // Sync with backend → creates user, returns FluentEdge fields + JWTs
    const user = await syncWithBackend({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      firstName: input.firstName,
      lastName: input.lastName,
      photoURL: firebaseUser.photoURL,
    });

    console.log(`[Firebase] Backend sync complete for: ${input.email}`);

    return { user, uid: firebaseUser.uid };
  } catch (error) {
    console.error('[Firebase] Signup error:', error);
    throw error;
  }
}

/**
 * Sign in existing Firebase user
 * Authenticates with Firebase, then syncs with backend to get FluentEdge user data
 */
export async function firebaseLogin(input: FirebaseLoginInput): Promise<{
  user: any; // User with FluentEdge fields from backend
  uid: string;
}> {
  try {
    // 1. Authenticate with Firebase
    const userCred = await auth().signInWithEmailAndPassword(
      input.email,
      input.password,
    );
    const firebaseUser = userCred.user;

    console.log(`[Firebase] User signed in: ${firebaseUser.email}`);

    // Sync with backend → returns FluentEdge fields + JWTs
    const user = await syncWithBackend({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      firstName: firebaseUser.displayName?.split(' ')[0] || '',
      lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      photoURL: firebaseUser.photoURL,
    });

    console.log(`[Firebase] Backend sync complete for: ${input.email}`);

    return { user, uid: firebaseUser.uid };
  } catch (error) {
    console.error('[Firebase] Login error:', error);
    throw error;
  }
}

/**
 * Sign out current Firebase user
 */
export async function firebaseLogout(): Promise<void> {
  try {
    await auth().signOut();
    console.log('[Firebase] User signed out');
  } catch (error) {
    console.error('[Firebase] Logout error:', error);
    throw error;
  }
}

/**
 * Get current Firebase user
 */
export function getCurrentFirebaseUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

/**
 * Check if user is authenticated in Firebase
 */
export function isFirebaseAuthed(): boolean {
  return !!auth().currentUser;
}

/**
 * Listen to Firebase auth state changes
 * Useful for restoring session on app launch
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(callback);
}

/**
 * Get Firebase ID token
 * Used if we need to make authenticated requests to backend
 */
export async function getFirebaseToken(): Promise<string | null> {
  const user = auth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Sign up / Sign in with Google
 * For testing: simulates Google OAuth flow without full OAuth setup
 * For production: requires Google OAuth app configured in Firebase Console
 */
export async function googleSignup(): Promise<{
  user: any;
  uid: string;
}> {
  try {
    console.log('[Firebase] Attempting Google Sign-In...');

    // TEST MODE: Create test account with Google prefix
    // In production, use: auth().signInWithGoogle() or auth().signInWithPopup()
    const testEmail = `google-test-${Date.now()}@example.com`;
    const testPassword = 'GoogleTest123!';

    // Register test Google account
    const userCred = await auth().createUserWithEmailAndPassword(
      testEmail,
      testPassword,
    );
    const googleUser = userCred.user;

    // Update profile to indicate Google login
    await googleUser.updateProfile({
      displayName: 'Google User',
    });

    console.log(`[Firebase] Google test account created: ${googleUser.email}`);

    const user = await syncWithBackend({
      firebaseUid: googleUser.uid,
      email: googleUser.email,
      firstName: 'Google',
      lastName: 'User',
      photoURL: null,
    });

    console.log(`[Firebase] Backend sync complete for: ${googleUser.email}`);

    return { user, uid: googleUser.uid };
  } catch (error) {
    console.error('[Firebase] Google signup error:', error);
    throw error;
  }
}

/**
 * Sign up / Sign in with Facebook
 * For testing: simulates Facebook OAuth flow without full OAuth setup
 * For production: requires Facebook OAuth app configured in Firebase Console
 */
export async function facebookSignup(): Promise<{
  user: any;
  uid: string;
}> {
  try {
    console.log('[Firebase] Attempting Facebook Sign-In...');

    // TEST MODE: Create test account with Facebook prefix
    // In production, use: auth().signInWithFacebook() or auth().signInWithPopup()
    const testEmail = `facebook-test-${Date.now()}@example.com`;
    const testPassword = 'FacebookTest123!';

    // Register test Facebook account
    const userCred = await auth().createUserWithEmailAndPassword(
      testEmail,
      testPassword,
    );
    const facebookUser = userCred.user;

    // Update profile to indicate Facebook login
    await facebookUser.updateProfile({
      displayName: 'Facebook User',
    });

    console.log(
      `[Firebase] Facebook test account created: ${facebookUser.email}`,
    );

    const user = await syncWithBackend({
      firebaseUid: facebookUser.uid,
      email: facebookUser.email,
      firstName: 'Facebook',
      lastName: 'User',
      photoURL: null,
    });

    console.log(`[Firebase] Backend sync complete for: ${facebookUser.email}`);

    return { user, uid: facebookUser.uid };
  } catch (error) {
    console.error('[Firebase] Facebook signup error:', error);
    throw error;
  }
}

/**
 * Start phone number verification
 * Sends OTP to the provided phone number
 * Returns a confirmation result to be used with verifyPhoneNumber
 */
export async function sendPhoneOTP(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
  try {
    console.log(`[Firebase] Sending OTP to: ${phoneNumber}`);
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    console.log('[Firebase] OTP sent successfully');
    return confirmation;
  } catch (error) {
    console.error('[Firebase] Phone OTP error:', error);
    throw error;
  }
}

/**
 * Verify OTP and sign in with phone number
 * Syncs with backend to get FluentEdge user data
 */
export async function verifyPhoneOTP(
  confirmationResult: FirebaseAuthTypes.ConfirmationResult,
  otp: string,
  firstName?: string,
): Promise<{
  user: any;
  uid: string;
}> {
  try {
    console.log('[Firebase] Verifying OTP...');

    // Verify OTP
    const userCred = await confirmationResult.confirm(otp);
    const phoneUser = userCred.user;

    console.log(`[Firebase] Phone user authenticated: ${phoneUser.phoneNumber}`);

    const user = await syncWithBackend({
      firebaseUid: phoneUser.uid,
      email: phoneUser.email || `phone-${phoneUser.uid}@example.com`,
      firstName: firstName || phoneUser.displayName || 'User',
      lastName: '',
      photoURL: phoneUser.photoURL,
    });

    console.log(`[Firebase] Backend sync complete for: ${phoneUser.phoneNumber}`);

    return { user, uid: phoneUser.uid };
  } catch (error) {
    console.error('[Firebase] Phone OTP verification error:', error);
    throw error;
  }
}
