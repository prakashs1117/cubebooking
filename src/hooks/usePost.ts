import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import type { CommunityPost } from '../types'

export function usePost(postId: string) {
  const [post, setPost] = useState<CommunityPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!postId) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'posts', postId), snap => {
      if (!snap.exists()) {
        setNotFound(true)
        setPost(null)
      } else {
        setPost({ id: snap.id, ...snap.data() } as CommunityPost)
        setNotFound(false)
      }
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [postId])

  return { post, loading, notFound }
}
