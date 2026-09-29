// src/hooks/queries/useBookings.ts
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Booking, ProgramId } from '../../shared/types'
import { useAuthContext } from '../../context/AuthContext'
import { dateToSlotKey, slotToDate } from '../../config/slots'

export type BookingDoc = Booking & { id: string }

export type SlotAvailabilityMap = Record<string, 'taken' | 'yours'>

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
  const seg = booking.segments[0]
  if (!seg.date || seg.startHour == null) return true
  return slotToDate(seg.date, seg.startHour) > new Date()
}

/**
 * Returns a map of slotKey → 'yours' | 'taken' for the given programs and date.
 * 'yours' = current teacher holds this slot (any active status).
 * 'taken' = another class holds this slot.
 * Keys absent from the map = slot is available.
 */
export function useSlotAvailability(
  programIds: ProgramId[],
  date: string | null,
): SlotAvailabilityMap {
  const { user } = useAuthContext()

  const { data } = useQuery({
    queryKey: ['slot-availability', programIds.join(','), date],
    enabled: !!user && !!date && programIds.length > 0,
    queryFn: async () => {
      const activeStatuses = ['confirmed', 'approved', 'pending']
      const results = await Promise.all(
        programIds.map((pid) =>
          getDocs(
            query(
              collection(db, 'bookings'),
              where('status', 'in', activeStatuses),
            ),
          ).then((snap) =>
            snap.docs
              .map((d) => ({ id: d.id, ...d.data() }) as BookingDoc)
              .filter((b) =>
                (b.segments ?? []).some(
                  (seg) => seg.programId === pid && seg.date === date,
                ),
              ),
          ),
        ),
      )

      const map: SlotAvailabilityMap = {}
      for (const bookingList of results) {
        for (const booking of bookingList) {
          for (const seg of booking.segments ?? []) {
            if (!programIds.includes(seg.programId as ProgramId)) continue
            if (seg.date !== date) continue
            const key = dateToSlotKey(date, seg.startHour)
            map[key] = booking.teacherId === user!.uid ? 'yours' : 'taken'
          }
        }
      }
      return map
    },
    staleTime: 30_000,
  })

  return data ?? {}
}
