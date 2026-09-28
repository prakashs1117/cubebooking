import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { authErrorMessage } from '../lib/authErrors'
import type { AppUser } from '../types'

const MAGIC_LINK_STORAGE_KEY = 'emailForSignIn'

function toAppUser(firebaseUser: User, role: AppUser['role'] = null, schoolId?: string): AppUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    photoURL: firebaseUser.photoURL ?? undefined,
    role,
    schoolId,
    language: 'de',
  }
}

export async function createUserDoc(firebaseUser: User): Promise<void> {
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    photoURL: firebaseUser.photoURL ?? '',
    role: null,
    language: 'de',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Could not sign you in.'))
  }
}

export async function signInWithGoogle(): Promise<void> {
  try {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const ref = doc(db, 'users', cred.user.uid)
    const existing = await getDoc(ref)
    if (!existing.exists()) {
      await createUserDoc(cred.user)
    }
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Google sign-in failed.'))
  }
}

export async function sendMagicLink(email: string, redirectUrl: string): Promise<void> {
  try {
    await sendSignInLinkToEmail(auth, email, {
      url: redirectUrl,
      handleCodeInApp: true,
    })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MAGIC_LINK_STORAGE_KEY, email)
    }
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Could not send the sign-in link.'))
  }
}

export async function completeMagicLinkSignIn(href: string): Promise<boolean> {
  if (!isSignInWithEmailLink(auth, href)) return false
  const email = typeof window !== 'undefined'
    ? window.localStorage.getItem(MAGIC_LINK_STORAGE_KEY) ?? ''
    : ''
  if (!email) return false
  try {
    const cred = await signInWithEmailLink(auth, email, href)
    window.localStorage.removeItem(MAGIC_LINK_STORAGE_KEY)
    const ref = doc(db, 'users', cred.user.uid)
    const existing = await getDoc(ref)
    if (!existing.exists()) {
      await createUserDoc(cred.user)
    }
    return true
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Magic link sign-in failed.'))
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Could not send the reset email.'))
  }
}

export async function updateUserProfile(
  user: User,
  fields: { displayName?: string; schoolName?: string },
): Promise<void> {
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (fields.displayName !== undefined) {
    updates.displayName = fields.displayName
    await firebaseUpdateProfile(user, { displayName: fields.displayName })
  }
  if (fields.schoolName !== undefined) updates.schoolName = fields.schoolName
  await updateDoc(doc(db, 'users', user.uid), updates)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export function subscribeToAuthUser(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback)
}

export function subscribeToUserProfile(
  uid: string,
  callback: (user: AppUser | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        callback(null)
        return
      }
      const data = snap.data()
      callback({
        uid: snap.id,
        email: data.email ?? '',
        displayName: data.displayName ?? '',
        photoURL: data.photoURL ?? undefined,
        role: data.role ?? null,
        schoolId: data.schoolId ?? undefined,
        schoolName: data.schoolName ?? undefined,
        language: data.language ?? 'de',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    },
    (err) => {
      onError?.(err)
    },
  )
}

export { toAppUser }
