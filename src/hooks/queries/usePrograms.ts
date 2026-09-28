import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Program, ProgramId } from '../../shared/types'

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'programs'))
      const map: Record<string, Program> = {}
      snap.forEach((doc) => {
        map[doc.id] = { id: doc.id as ProgramId, ...doc.data() } as Program
      })
      return map
    },
    staleTime: 5 * 60_000,
  })
}
