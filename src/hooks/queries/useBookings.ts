import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Booking } from '../../shared/types'
import { useAuthContext } from '../../context/AuthContext'
import type { Timestamp } from 'firebase/firestore'

/** Fetch start/end times for a booking by looking up its session IDs. */
export function useBookingTimes(sessionIds: string[]) {
  return useQuery({
    queryKey: ['session-times', sessionIds.join(',')],
    enabled: sessionIds.length > 0,
    queryFn: async () => {
      const snaps = await Promise.all(sessionIds.map((id) => getDoc(doc(db, 'sessions', id))))
      const docs = snaps.filter((s) => s.exists()).map((s) => s.data())
      if (!docs.length) return { startDate: null, endDate: null }
      const starts = docs.map((d) => (d.start as Timestamp).toDate())
      const ends   = docs.map((d) => (d.end   as Timestamp).toDate())
      return {
        startDate: new Date(Math.min(...starts.map((d) => d.getTime()))),
        endDate:   new Date(Math.max(...ends.map((d)   => d.getTime()))),
      }
    },
    staleTime: 5 * 60_000,
  })
}

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

export function useTeacherBookingWindows(): { start: Date; end: Date }[] {
  const { data: bookings = [] } = useMyBookings()

  const activeSessionIds = useMemo(() => {
    const ids: string[] = []
    for (const b of bookings) {
      if (b.status !== 'confirmed' && b.status !== 'approved' && b.status !== 'pending') continue
      for (const seg of b.segments ?? []) {
        if (seg.sessionId) ids.push(seg.sessionId)
      }
    }
    return ids
  }, [bookings])

  const { data: windows = [] } = useQuery({
    queryKey: ['teacher-session-windows', activeSessionIds.join(',')],
    enabled: activeSessionIds.length > 0,
    queryFn: async () => {
      const snaps = await Promise.all(
        activeSessionIds.map((id) => getDoc(doc(db, 'sessions', id)))
      )
      return snaps
        .filter((s) => s.exists())
        .map((s) => {
          const d = s.data()!
          return {
            start: (d['start'] as Timestamp).toDate(),
            end:   (d['end']   as Timestamp).toDate(),
          }
        })
    },
    staleTime: 30_000,
  })

  return windows
}
