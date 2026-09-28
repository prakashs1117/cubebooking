import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateAuthProfile,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { authErrorMessage } from '../lib/authErrors'
import { track, identifyUser, clearUser } from '../lib/analytics'
import { hasRole, hasAnyRole, isGuestOnly, normaliseRoles } from '../lib/roles'
import { uploadProfileImage } from '../lib/cloudinary'
import type { ProfileDraft, UserProfile } from '../types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isGuest: boolean
  isVerified: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  saveProfile: (patch: Partial<ProfileDraft>) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Fields the client is never allowed to write on its own user document. */
const PROTECTED_FIELDS = ['uid', 'email', 'roles', 'createdAt'] as const

function stripProtectedFields(patch: Partial<ProfileDraft>): Record<string, unknown> {
  const clean: Record<string, unknown> = { ...patch }
  for (const field of PROTECTED_FIELDS) delete clean[field]
  return clean
}

/** Fetch a remote image URL and upload it to Cloudinary, then persist to Firestore. Runs silently — never throws to the caller. */
async function syncGooglePhotoToCloudinary(uid: string, googlePhotoURL: string): Promise<void> {
  try {
    // Fetch the image bytes from Google
    const res = await fetch(googlePhotoURL)
    if (!res.ok) return
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return
    const file = new File([blob], 'google-profile.jpg', { type: blob.type })

    const uploaded = await uploadProfileImage(file)

    await updateDoc(doc(db, 'users', uid), {
      photoURL: uploaded.url,
      photoPublicId: uploaded.publicId,
      photoVersion: uploaded.version,
      updatedAt: serverTimestamp(),
    })
  } catch {
    // Silent — photo sync is best-effort, never block sign-in
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Holds the active users/{uid} snapshot listener so we can tear it down
  // when the signed-in user changes.
  const profileUnsub = useRef<(() => void) | null>(null)
  // Guards the backfill below so a failing create can't spin in a loop.
  const backfillAttempted = useRef<string | null>(null)

  const createProfileDoc = useCallback(async (nextUser: User, displayName?: string) => {
    await setDoc(doc(db, 'users', nextUser.uid), {
      uid: nextUser.uid,
      email: nextUser.email ?? '',
      roles: ['guest'],
      displayName: displayName || nextUser.displayName || '',
      photoURL: nextUser.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      profileUnsub.current?.()
      profileUnsub.current = null
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      // Stay in loading until the first profile snapshot lands, otherwise an
      // admin refreshing /admin would briefly be treated as a non-admin and
      // bounced out.
      setLoading(true)
      profileUnsub.current = onSnapshot(
        doc(db, 'users', nextUser.uid),
        (snap) => {
          if (snap.exists()) {
            const raw = { uid: snap.id, ...snap.data() }
            const p = { ...raw, roles: normaliseRoles(raw) } as UserProfile
            setProfile(p)
            identifyUser(nextUser.uid, { roles: p.roles.join(','), display_name: p.displayName })
            setLoading(false)
            return
          }

          // Accounts that predate the users collection (or any signup that
          // half-failed) have no profile document. Backfill one so they get a
          // working profile instead of a permanently empty page.
          setProfile(null)
          if (backfillAttempted.current !== nextUser.uid) {
            backfillAttempted.current = nextUser.uid
            createProfileDoc(nextUser).catch((err) => {
              console.error('Could not create profile document:', err)
            })
          }
          setLoading(false)
        },
        (err) => {
          console.error('Profile listener error:', err)
          setProfile(null)
          setLoading(false)
        },
      )
    })

    return () => {
      profileUnsub.current?.()
      unsubscribe()
    }
  }, [createProfileDoc])

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) await updateAuthProfile(cred.user, { displayName })
        await createProfileDoc(cred.user, displayName)
        track({ name: 'sign_up', params: { method: 'email' } })
        try { await sendEmailVerification(cred.user) } catch (err) {
          console.error('Verification email failed:', err)
        }
      } catch (err) {
        throw new Error(authErrorMessage(err, 'Could not create your account.'))
      }
    },
    [createProfileDoc],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      track({ name: 'login', params: { method: 'email' } })
    } catch (err) {
      throw new Error(authErrorMessage(err, 'Could not sign you in.'))
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const ref = doc(db, 'users', cred.user.uid)
      const existing = await getDoc(ref)
      const googlePhoto = cred.user.photoURL

      if (!existing.exists()) {
        // New Google user — create profile with the Google URL first (instant),
        // then upload to Cloudinary in the background
        await createProfileDoc(cred.user)
        track({ name: 'sign_up', params: { method: 'google' } })
        if (googlePhoto) {
          syncGooglePhotoToCloudinary(cred.user.uid, googlePhoto)
        }
      } else {
        track({ name: 'login', params: { method: 'google' } })
        // Existing user — if their stored photoURL is still a Google URL (not
        // Cloudinary), migrate it silently on this sign-in
        const stored = existing.data()?.photoURL as string | undefined
        const isGoogleUrl = stored && (
          stored.includes('googleusercontent.com') ||
          stored.includes('ggpht.com')
        )
        if (googlePhoto && isGoogleUrl) {
          syncGooglePhotoToCloudinary(cred.user.uid, googlePhoto)
        }
      }
    } catch (err) {
      throw new Error(authErrorMessage(err, 'Google sign-in failed.'))
    }
  }, [createProfileDoc])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      track({ name: 'password_reset_sent' })
    } catch (err) {
      throw new Error(authErrorMessage(err, 'Could not send the reset email.'))
    }
  }, [])

  const resendVerification = useCallback(async () => {
    if (!auth.currentUser) throw new Error('You need to be signed in.')
    try {
      await sendEmailVerification(auth.currentUser)
    } catch (err) {
      throw new Error(authErrorMessage(err, 'Could not send the verification email.'))
    }
  }, [])

  const saveProfile = useCallback(async (patch: Partial<ProfileDraft>) => {
    if (!auth.currentUser) throw new Error('You need to be signed in.')
    const clean = stripProtectedFields(patch)
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      ...clean,
      updatedAt: serverTimestamp(),
    })
    // Keep the Auth record in sync so anything reading user.displayName /
    // user.photoURL directly sees the same values.
    const authPatch: { displayName?: string; photoURL?: string } = {}
    if (typeof clean.displayName === 'string') authPatch.displayName = clean.displayName
    if (typeof clean.photoURL === 'string') authPatch.photoURL = clean.photoURL
    if (Object.keys(authPatch).length > 0) {
      await updateAuthProfile(auth.currentUser, authPatch)
    }
    const fields_filled = Object.values(clean).filter(v => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)).length
    track({ name: 'profile_saved', params: { fields_filled } })
  }, [])

  const logout = useCallback(async () => {
    track({ name: 'logout' })
    clearUser()
    await signOut(auth)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isSuperAdmin: hasRole(profile, 'super admin'),
      isAdmin: hasAnyRole(profile, 'admin', 'super admin'),
      isGuest: isGuestOnly(profile),
      isVerified: Boolean(user?.emailVerified),
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      resendVerification,
      saveProfile,
      logout,
    }),
    [user, profile, loading, signUp, signIn, signInWithGoogle, resetPassword, resendVerification, saveProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside an <AuthProvider>')
  return ctx
}
