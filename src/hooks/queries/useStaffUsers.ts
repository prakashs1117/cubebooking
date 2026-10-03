import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../shared/firebase'

export interface StaffUser {
  uid: string
  email: string
  displayName: string
}

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'coordinator']))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    uid: d.id,
    email: d.data().email ?? '',
    displayName: d.data().displayName ?? '',
  }))
}
