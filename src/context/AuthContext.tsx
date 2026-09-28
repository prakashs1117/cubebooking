import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import { useLocale } from './LocaleContext'
import {
  signIn as svcSignIn,
  signInWithGoogle as svcSignInWithGoogle,
  sendMagicLink as svcSendMagicLink,
  completeMagicLinkSignIn as svcCompleteMagicLink,
  resetPassword as svcResetPassword,
  updateUserProfile as svcUpdateUserProfile,
  signOut as svcSignOut,
  subscribeToAuthUser,
  subscribeToUserProfile,
  createUserDoc,
} from '../shared/auth/authService'
import { trackUserSignIn, trackUserSignOut, setCurrentUser, setUserProps } from '../services/analyticsService'
import type { AppUser } from '../shared/types'

interface AuthContextValue {
  user: User | null
  profile: AppUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  completeMagicLinkSignIn: (href: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (fields: { displayName?: string; schoolName?: string; language?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const profileUnsub = useRef<(() => void) | null>(null)
  const backfillAttempted = useRef<string | null>(null)

  const { setLocale } = useLocale()

  useEffect(() => {
    if (profile?.language) setLocale(profile.language)
  }, [profile?.language, setLocale])

  useEffect(() => {
    const unsubscribe = subscribeToAuthUser((nextUser) => {
      profileUnsub.current?.()
      profileUnsub.current = null
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        trackUserSignOut()
        return
      }

      setLoading(true)
      setCurrentUser(nextUser.uid)
      profileUnsub.current = subscribeToUserProfile(
        nextUser.uid,
        (appUser) => {
          if (appUser) {
            setProfile(appUser)
            setUserProps({
              school_name: appUser.schoolName || '',
              user_role: appUser.role || 'user',
            })
            setLoading(false)
            return
          }
          setProfile(null)
          if (backfillAttempted.current !== nextUser.uid) {
            backfillAttempted.current = nextUser.uid
            createUserDoc(nextUser).catch((err) => {
              console.error('Could not create user document:', err)
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
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await svcSignIn(email, password)
    trackUserSignIn(email, 'email')
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await svcSignInWithGoogle()
    trackUserSignIn('google_user', 'google')
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/signin`
    await svcSendMagicLink(email, redirectUrl)
  }, [])

  const completeMagicLinkSignIn = useCallback(async (href: string) => {
    return svcCompleteMagicLink(href)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await svcResetPassword(email)
  }, [])

  const updateProfile = useCallback(async (fields: { displayName?: string; schoolName?: string }) => {
    if (!user) throw new Error('Not signed in')
    await svcUpdateUserProfile(user, fields)
  }, [user])

  const logout = useCallback(async () => {
    await svcSignOut()
    trackUserSignOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      signIn,
      signInWithGoogle,
      sendMagicLink,
      completeMagicLinkSignIn,
      resetPassword,
      updateProfile,
      logout,
    }),
    [user, profile, loading, signIn, signInWithGoogle, sendMagicLink, completeMagicLinkSignIn, resetPassword, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside an <AuthProvider>')
  return ctx
}
