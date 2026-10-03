import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../shared/firebase'
import type { NotificationType } from '../stores/notificationStore'
import { fetchStaffUsers } from '../hooks/queries/useStaffUsers'

export interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  bookingId?: string
}

async function writeNotification(uid: string, payload: NotificationPayload): Promise<void> {
  await addDoc(collection(db, 'notifications', uid, 'items'), {
    ...payload,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function notifyStaff(payload: NotificationPayload): Promise<void> {
  const staff = await fetchStaffUsers()
  await Promise.all(staff.map((u) => writeNotification(u.uid, payload)))
}

export async function notifyUser(uid: string, payload: NotificationPayload): Promise<void> {
  await writeNotification(uid, payload)
}
