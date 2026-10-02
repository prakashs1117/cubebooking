import { useDebugValue } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../shared/firebase'
import type { Program, ProgramId } from '../../shared/types'

export function usePrograms() {
  const result = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'programs'))
      const map: Record<string, Program> = {}
      snap.forEach((doc) => {
        map[doc.id] = { id: doc.id as ProgramId, ...doc.data() } as Program
      })
      return map
    },
    // Programs are static content — never refetch until manually invalidated.
    // 'static' blocks even manual invalidateQueries(); use Infinity if you need that.
    staleTime: Infinity,
    gcTime: Infinity,
  })
  useDebugValue(result.data, (d) => `usePrograms: ${Object.keys(d ?? {}).length} programs`)
  return result
}
