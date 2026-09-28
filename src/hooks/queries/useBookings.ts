import { useQuery } from '@tanstack/react-query'
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Booking } from '../../shared/types'
import { useAuthContext } from '../../context/AuthContext'
import type { Timestamp } from 'firebase/firestore'

export type BookingDoc = Booking & { id: string }

export function useMyBookings() {
  const { user } = useAuthContext()
  return useQuery({
    queryKey: ['bookings', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const q = query(
        collection(db, 'bookings'),
        where('teacherId', '==', user!.uid),
        orderBy('createdAt', 'desc'),
      )
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc)
    },
    staleTime: 30_000,
  })
}

export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['booking', bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'bookings', bookingId!))
      if (!snap.exists()) throw new Error('Booking not found')
      return { id: snap.id, ...snap.data() } as BookingDoc
    },
    staleTime: 60_000,
  })
}

export function isUpcoming(booking: BookingDoc): boolean {
  if (!booking.segments?.length) return false
  try {
    const firstStart = (booking.segments[0] as { sessionId: string; programId: string; order: number } & { start?: Timestamp })?.start
    if (!firstStart) return true
    return firstStart.toDate() > new Date()
  } catch {
    return true
  }
}
