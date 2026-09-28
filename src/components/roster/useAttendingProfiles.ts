import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot, getDocs, query, where } from 'firebase/firestore'
import { isGuestOnly, normaliseRoles } from '../../lib/roles'
import type { AttendanceDoc, UserRole } from '../../types'

export interface AttendingProfile {
  uid: string
  displayName: string
  roles: UserRole[]
  isGuest: boolean
  roleLabel: string
  photoURL?: string
}

function deriveRoleLabel(roles: UserRole[]): string {
  if (roles.includes('super admin')) return 'Super Admin'
  if (roles.includes('admin')) return 'Admin'
  if (roles.includes('club member')) return 'Club Member'
  if (roles.includes('member')) return 'Member'
  return 'Guest'
}

export function useAttendingProfiles(rosterId: string): {
  attendingProfiles: AttendingProfile[]
  loadingProfiles: boolean
} {
  const [attendingProfiles, setAttendingProfiles] = useState<AttendingProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [attendingUids, setAttendingUids] = useState<{ uid: string; displayName: string; photoURL?: string }[]>([])
  // Stable key to avoid re-fetching when the array reference changes but uids haven't
  const attendingUidKey = attendingUids.map(a => a.uid).sort().join(',')

  useEffect(() => {
    if (!rosterId) {
      setLoadingProfiles(false)
      return
    }
    const unsub = onSnapshot(
      collection(db, 'meetings', rosterId, 'attendance'),
      snap => {
        const attending = snap.docs
          .map(d => d.data() as AttendanceDoc)
          .filter(a => a.status === 'attending')
          .map(a => ({ uid: a.uid, displayName: a.displayName, photoURL: a.photoURL }))
        setAttendingUids(attending)
      },
      () => setLoadingProfiles(false),
    )
    return unsub
  }, [rosterId])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (attendingUids.length === 0) {
      setAttendingProfiles([])
      setLoadingProfiles(false)
      return
    }

    let cancelled = false

    async function fetchProfiles() {
      setLoadingProfiles(true)
      try {
        const uids = attendingUids.map(a => a.uid)
        // Firestore `in` query supports up to 30 items; chunk for safety
        const chunks: string[][] = []
        for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30))

        const allDocs = await Promise.all(
          chunks.map(chunk =>
            getDocs(query(collection(db, 'users'), where('uid', 'in', chunk)))
          )
        )

        const profileMap = new Map<string, AttendingProfile>()
        allDocs.forEach(snap => {
          snap.docs.forEach(d => {
            const raw = d.data() as Record<string, unknown>
            const roles = normaliseRoles(raw)
            const uid = raw.uid as string
            const displayName = (raw.displayName as string) || ''
            const guest = isGuestOnly({ uid, email: raw.email as string, roles })
            profileMap.set(uid, {
              uid,
              displayName,
              roles,
              isGuest: guest,
              roleLabel: deriveRoleLabel(roles),
              photoURL: raw.photoURL as string | undefined,
            })
          })
        })

        // For attendees without a Firestore user doc, fall back to attendance displayName/photo
        const profiles: AttendingProfile[] = attendingUids.map(a => {
          if (profileMap.has(a.uid)) return profileMap.get(a.uid)!
          return {
            uid: a.uid,
            displayName: a.displayName,
            roles: ['guest'],
            isGuest: true,
            photoURL: a.photoURL,
            roleLabel: 'Guest',
          }
        })

        if (!cancelled) {
          setAttendingProfiles(profiles)
          setLoadingProfiles(false)
        }
      } catch {
        if (!cancelled) setLoadingProfiles(false)
      }
    }

    fetchProfiles()
    return () => { cancelled = true }
  // attendingUidKey is a stable string derived from sorted uids — avoids re-fetching on same attendees
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendingUidKey])

  return { attendingProfiles, loadingProfiles }
}
