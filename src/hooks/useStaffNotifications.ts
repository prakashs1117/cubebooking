import { useEffect } from 'react'
import { collection, onSnapshot, orderBy, query, limit, doc, updateDoc } from 'firebase/firestore'
import { db } from '../shared/firebase'
import { useNotificationStore } from '../stores/notificationStore'

export function useStaffNotifications(uid: string | undefined) {
  const push = useNotificationStore((s) => s.push)
  const markRead = useNotificationStore((s) => s.markRead)

  useEffect(() => {
    if (!uid) return

    const q = query(
      collection(db, 'notifications', uid, 'items'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )

    const unsub = onSnapshot(q, (snap) => {
      snap.docs.forEach((d) => {
        const data = d.data()
        // Use Firestore doc ID as the store notification ID — enables write-back on markRead
        push({
          id: d.id,
          type: data.type ?? 'info',
          title: data.title ?? '',
          body: data.body ?? '',
          bookingId: data.bookingId,
        })
        // If already read in Firestore, mark it read in the local store too
        if (data.read) markRead(d.id)
      })
    })

    return unsub
  }, [uid, push, markRead])
}

// Call this from NotificationPopover when a staff user marks a notification read
export function markFirestoreNotificationRead(uid: string, notifId: string): void {
  updateDoc(doc(db, 'notifications', uid, 'items', notifId), { read: true }).catch(() => { /* non-blocking */ })
}
