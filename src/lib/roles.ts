import type { UserProfile, UserRole } from '../types'

export function hasRole(profile: UserProfile | null | undefined, role: UserRole): boolean {
  if (!profile?.roles?.length) return role === 'guest'
  return profile.roles.includes(role)
}

export function hasAnyRole(profile: UserProfile | null | undefined, ...roles: UserRole[]): boolean {
  return roles.some((r) => hasRole(profile, r))
}

/** True only when the user has no elevated role — guest-only or empty roles. */
export function isGuestOnly(profile: UserProfile | null | undefined): boolean {
  if (!profile?.roles?.length) return true
  return profile.roles.every((r) => r === 'guest')
}

/**
 * Normalise a profile read from Firestore. Old documents have `role: string`
 * instead of `roles: string[]`. This backfill runs in-memory only — Firestore
 * is updated the next time an admin saves that user's roles.
 */
export function normaliseRoles(raw: Record<string, unknown>): UserRole[] {
  if (Array.isArray(raw.roles) && raw.roles.length > 0) {
    return raw.roles as UserRole[]
  }
  if (typeof raw.role === 'string' && raw.role) {
    return [raw.role as UserRole]
  }
  return ['guest']
}
