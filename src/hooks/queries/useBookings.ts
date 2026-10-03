// src/hooks/queries/useBookings.ts
import { useState, useEffect, useDebugValue } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs, doc, getDoc, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Booking, ProgramId } from '../../shared/types'
import { useAuthContext } from '../../context/AuthContext'
import { dateToSlotKey, slotToDate } from '../../config/slots'
import { useBookingStore } from '../../stores/bookingStore'

export type BookingDoc = Booking & { id: string }

export type SlotAvailabilityMap = Record<string, 'taken' | 'yours'>

export function useMyBookings() {
  const { user } = useAuthContext()
  const result = useQuery({
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
  useDebugValue(result.data, (d) => `useMyBookings: ${d?.length ?? 0} bookings, status=${result.status}`)
  return result
}

export function useBooking(bookingId: string | undefined) {
  const result = useQuery({
    queryKey: ['booking', bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'bookings', bookingId!))
      if (!snap.exists()) throw new Error('Booking not found')
      return { id: snap.id, ...snap.data() } as BookingDoc
    },
    staleTime: 60_000,
  })
  useDebugValue(result.data, (d) => `useBooking(${bookingId}): status=${d?.status ?? 'none'}`)
  return result
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
 *
 * Primary source: `slots` collection (new bookings with atomic lock docs).
 * Legacy bridge: also queries `bookings` for pre-migration records that have no slot docs.
 * TODO: remove legacy bridge after 2027-01-01 once all pre-migration visit dates have passed.
 */
export function useSlotAvailability(
  programIds: ProgramId[],
  date: string | null,
): SlotAvailabilityMap {
  const { user } = useAuthContext()
  const bookedSlotKeys = useBookingStore((s) => s.bookedSlotKeys)
  const [slotMap, setSlotMap] = useState<SlotAvailabilityMap>({})
  const [legacyMap, setLegacyMap] = useState<SlotAvailabilityMap>({})

  // Live listener on slots collection — updates in real time when other teachers book
  useEffect(() => {
    if (!user || !date || !programIds.length) {
      setSlotMap({})
      return
    }
    const q = query(
      collection(db, 'slots'),
      where('date', '==', date),
      where('programId', 'in', programIds),
    )
    return onSnapshot(q, (snap) => {
      const map: SlotAvailabilityMap = {}
      for (const d of snap.docs) {
        const data = d.data()
        const key = dateToSlotKey(data.date as string, data.startHour as number)
        map[key] = data.teacherId === user.uid ? 'yours' : 'taken'
      }
      setSlotMap(map)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, date, programIds.join(',')])

  // Legacy bridge: one-time fetch of bookings for pre-migration records (no slot lock docs)
  useEffect(() => {
    if (!user || !date || !programIds.length) {
      setLegacyMap({})
      return
    }
    const activeStatuses = ['confirmed', 'approved', 'pending']
    getDocs(query(collection(db, 'bookings'), where('status', 'in', activeStatuses))).then((snap) => {
      const map: SlotAvailabilityMap = {}
      for (const d of snap.docs) {
        const booking = d.data() as Booking
        for (const seg of booking.segments ?? []) {
          if (!programIds.includes(seg.programId as ProgramId)) continue
          if (seg.date !== date) continue
          const key = dateToSlotKey(seg.date, seg.startHour)
          const val = booking.teacherId === user.uid ? 'yours' : 'taken'
          if (map[key] !== 'yours') map[key] = val
        }
      }
      setLegacyMap(map)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, date, programIds.join(',')])

  // Merge: slots (live) wins over legacy, optimistic cache wins over both
  const merged: SlotAvailabilityMap = { ...legacyMap, ...slotMap }
  for (const key of bookedSlotKeys) {
    if (merged[key] !== 'yours') merged[key] = 'yours'
  }
  useDebugValue({ date, programIds, takenCount: Object.keys(merged).length },
    (v) => `useSlotAvailability(${v.date ?? 'none'}): ${v.takenCount} slots locked`)
  return merged
}

/**
 * Staff-only: query all bookings, optionally filtered to a single date.
 * Callers MUST be in a staff-gated component (isStaff === true).
 */
export function useAllBookings(date?: string) {
  const { user, isStaff } = useAuthContext()
  const result = useQuery({
    queryKey: ['bookings', 'all', date ?? 'all'],
    enabled: !!user?.uid && isStaff,
    queryFn: async () => {
      // Firestore doesn't support querying nested array fields (segments[].date).
      // Fetch all active bookings and filter client-side by date if provided.
      const q = query(
        collection(db, 'bookings'),
        where('status', 'in', ['confirmed', 'approved', 'pending', 'arrived']),
        orderBy('createdAt', 'desc'),
      )
      const snap = await getDocs(q)
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc)
      if (!date) return all
      // Client-side filter: booking has at least one segment on the requested date
      return all.filter((b) => b.segments?.some((s) => s.date === date))
    },
    staleTime: 30_000,
    refetchInterval: 60_000, // admin dashboard polls every 60s for new arrivals
  })
  useDebugValue(result.data, (d) => `useAllBookings(${date ?? 'all'}): ${d?.length ?? 0} bookings`)
  return result
}

/**
 * Staff-only: real-time listener for all TOAD bookings (pending, approved, declined).
 */
export function useAllToadBookings(): BookingDoc[] {
  const { user, isStaff } = useAuthContext()
  const [bookings, setBookings] = useState<BookingDoc[]>([])

  useEffect(() => {
    // Wait until the Firestore profile is loaded and role confirmed as staff.
    // The security rule does a get() on users/{uid} to verify role — subscribing
    // before the profile loads causes a permission-denied that silently empties the list.
    if (!user || !isStaff) return
    const q = query(
      collection(db, 'bookings'),
      where('type', '==', 'toad'),
      where('status', 'in', ['pending', 'approved', 'declined']),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q,
      (snap) => {
        setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingDoc))
      },
      (err) => {
        console.error('[useAllToadBookings] Firestore error:', err.code, err.message)
      },
    )
  }, [user, isStaff])

  return bookings
}
