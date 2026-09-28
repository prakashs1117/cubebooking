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
import { useAuthContext } from '../../context/AuthContext'
import type { Session, ProgramId } from '../../shared/types'

type SessionDoc = Session & { id: string }

/**
 * Fetch open sessions for one or more programs within a date window.
 * Runs one query per programId and merges — avoids Firestore 'in' + range
 * index requirement and is more reliable across all auth states.
 */
export function useSessionsForWeek(
  programIds: ProgramId[],
  weekStart: Date,
  weekEnd: Date,
  enabled = true,
) {
  const { user } = useAuthContext()

  return useQuery({
    queryKey: ['sessions', programIds.join(','), weekStart.toISOString(), weekEnd.toISOString()],
    // Only run when auth is resolved AND we have a user (sessions require sign-in)
    enabled: enabled && programIds.length > 0 && !!user,
    queryFn: async () => {
      const start = Timestamp.fromDate(weekStart)
      const end   = Timestamp.fromDate(weekEnd)

      // One query per programId — avoids 'in' + range + orderBy index issues
      const results = await Promise.all(
        programIds.map((pid) =>
          getDocs(
            query(
              collection(db, 'sessions'),
              where('programId', '==', pid),
              where('status', '==', 'open'),
              where('start', '>=', start),
              where('start', '<', end),
              orderBy('start', 'asc'),
            ),
          ).then((snap) =>
            snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SessionDoc),
          ),
        ),
      )

      // Merge and sort by start time
      return results
        .flat()
        .sort((a, b) => {
          const at = (a.start as unknown as Timestamp).toDate().getTime()
          const bt = (b.start as unknown as Timestamp).toDate().getTime()
          return at - bt
        })
    },
    staleTime: 30_000,
    retry: 2,
  })
}
