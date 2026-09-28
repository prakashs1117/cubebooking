import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { track } from '../../lib/analytics'
import type { AttendanceDoc } from '../../types'

export function useAttendance(rosterId: string, uid: string | undefined, displayName?: string, photoURL?: string) {
  const [attendees, setAttendees] = useState<AttendanceDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!rosterId) return
    const unsub = onSnapshot(
      collection(db, 'meetings', rosterId, 'attendance'),
      snap => {
        setAttendees(snap.docs.map(d => d.data() as AttendanceDoc))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [rosterId])

  const myStatus = uid ? attendees.find(a => a.uid === uid)?.status ?? null : null

  const attending = attendees.filter(a => a.status === 'attending')
  const notAttending = attendees.filter(a => a.status === 'not-attending')

  const setStatus = async (status: 'attending' | 'not-attending') => {
    if (!uid || !rosterId) return
    if (status === myStatus) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'meetings', rosterId, 'attendance', uid), {
        uid,
        displayName: displayName || '',
        ...(photoURL ? { photoURL } : {}),
        status,
        updatedAt: serverTimestamp(),
      })
      track({ name: 'rsvp_set', params: { roster_id: rosterId, status } })
    } finally {
      setSaving(false)
    }
  }

  return { myStatus, attending, notAttending, loading, saving, setStatus }
}
