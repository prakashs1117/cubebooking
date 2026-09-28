import { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import type { WordEntry } from '../../types'

export function useWordEntries(rosterId: string, field: 'wod' | 'pod' | 'theme') {
  const [entries, setEntries] = useState<WordEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rosterId) { setLoading(false); return }
    const ref = collection(db, 'meetings', rosterId, 'wordEntries')
    const q = query(ref, where('field', '==', field), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WordEntry)))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [rosterId, field])

  const addEntry = async (meaning: string, example: string) => {
    if (!auth.currentUser) throw new Error('Must be signed in')
    const trimmedMeaning = meaning.trim()
    if (!trimmedMeaning) throw new Error('Meaning is required')
    await addDoc(collection(db, 'meetings', rosterId, 'wordEntries'), {
      field,
      meaning: trimmedMeaning,
      example: example.trim(),
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || auth.currentUser.email || 'Member',
      createdAt: serverTimestamp(),
    })
  }

  return { entries, loading, addEntry }
}
