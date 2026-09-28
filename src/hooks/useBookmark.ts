import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useBookmark(postId: string, uid: string | null) {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid || !postId) { setLoading(false); return }
    getDoc(doc(db, 'userBookmarks', uid, 'saved', postId))
      .then(snap => setBookmarked(snap.exists()))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [uid, postId])

  const toggle = async () => {
    if (!uid) return
    const ref = doc(db, 'userBookmarks', uid, 'saved', postId)
    if (bookmarked) {
      setBookmarked(false)
      await deleteDoc(ref).catch(() => setBookmarked(true))
    } else {
      setBookmarked(true)
      await setDoc(ref, { postId, savedAt: serverTimestamp() }).catch(() => setBookmarked(false))
    }
  }

  return { bookmarked, loading, toggle }
}
