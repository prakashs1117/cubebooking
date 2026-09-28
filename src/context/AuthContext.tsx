import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from 'firebase/auth'
import {
  signIn as svcSignIn,
  signInWithGoogle as svcSignInWithGoogle,
  sendMagicLink as svcSendMagicLink,
  completeMagicLinkSignIn as svcCompleteMagicLink,
  resetPassword as svcResetPassword,
  signOut as svcSignOut,
  subscribeToAuthUser,
  subscribeToUserProfile,
  createUserDoc,
} from '../shared/auth/authService'
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
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const profileUnsub = useRef<(() => void) | null>(null)
  const backfillAttempted = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthUser((nextUser) => {
      profileUnsub.current?.()
      profileUnsub.current = null
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      profileUnsub.current = subscribeToUserProfile(
        nextUser.uid,
        (appUser) => {
          if (appUser) {
            setProfile(appUser)
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
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await svcSignInWithGoogle()
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

  const logout = useCallback(async () => {
    await svcSignOut()
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
      logout,
    }),
    [user, profile, loading, signIn, signInWithGoogle, sendMagicLink, completeMagicLinkSignIn, resetPassword, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside an <AuthProvider>')
  return ctx
}
