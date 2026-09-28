import { useQuery } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Session, ProgramId } from '../../shared/types'

/** Fetch all open sessions for a program within a date range (week view). */
export function useSessionsForWeek(
  programIds: ProgramId[],
  weekStart: Date,
  weekEnd: Date,
  enabled = true,
) {
  return useQuery({
    queryKey: ['sessions', programIds.join(','), weekStart.toISOString(), weekEnd.toISOString()],
    enabled: enabled && programIds.length > 0,
    queryFn: async () => {
      const q = query(
        collection(db, 'sessions'),
        where('programId', 'in', programIds),
        where('status', '==', 'open'),
        where('start', '>=', Timestamp.fromDate(weekStart)),
        where('start', '<', Timestamp.fromDate(weekEnd)),
        orderBy('start', 'asc'),
      )
      const snap = await getDocs(q)
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session & { id: string })
    },
    staleTime: 30_000,
  })
}

/** Check if a specific day has any available sessions for the given programs. */
export function useAvailableDays(
  programIds: ProgramId[],
  monthStart: Date,
  monthEnd: Date,
  enabled = true,
) {
  return useQuery({
    queryKey: ['sessions-days', programIds.join(','), monthStart.toISOString()],
    enabled: enabled && programIds.length > 0,
    queryFn: async () => {
      const q = query(
        collection(db, 'sessions'),
        where('programId', 'in', programIds),
        where('status', '==', 'open'),
        where('start', '>=', Timestamp.fromDate(monthStart)),
        where('start', '<', Timestamp.fromDate(monthEnd)),
        orderBy('start', 'asc'),
      )
      const snap = await getDocs(q)
      const availableDays = new Set<string>()
      snap.forEach((doc) => {
        const data = doc.data()
        const start: Timestamp = data.start
        const available = data.capacity - data.seatsTaken - data.seatsHeld
        if (available > 0) {
          availableDays.add(start.toDate().toDateString())
        }
      })
      return availableDays
    },
    staleTime: 60_000,
  })
}
