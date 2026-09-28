import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import type { RoleSlot } from '../../types'

/** Returns the current user's claimed slot for a single roster, live. */
export function useMyRosterRole(rosterId: string, uid: string | undefined): RoleSlot | null {
  const [slot, setSlot] = useState<RoleSlot | null>(null)

  useEffect(() => {
    if (!rosterId || !uid) { setSlot(null); return }
    const q = query(
      collection(db, 'meetings', rosterId, 'roleSlots'),
      where('uid', '==', uid),
    )
    const unsub = onSnapshot(q, snap => {
      setSlot(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as RoleSlot))
    }, () => setSlot(null))
    return unsub
  }, [rosterId, uid])

  return slot
}
