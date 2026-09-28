import { useState, useEffect } from 'react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase'

function getLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem('liked_posts')
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveLikedSet(set: Set<string>) {
  try {
    localStorage.setItem('liked_posts', JSON.stringify([...set]))
  } catch {}
}

export function usePostLike(postId: string, initialCount: number, uid: string | null) {
  const [liked, setLiked] = useState(() => getLikedSet().has(postId))
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  const toggle = () => {
    if (!uid) return
    const next = !liked
    setLiked(next)
    setCount(c => next ? c + 1 : Math.max(0, c - 1))

    const set = getLikedSet()
    if (next) { set.add(postId) } else { set.delete(postId) }
    saveLikedSet(set)

    updateDoc(doc(db, 'posts', postId), { likeCount: increment(next ? 1 : -1) }).catch(() => {
      // rollback
      setLiked(!next)
      setCount(c => next ? Math.max(0, c - 1) : c + 1)
    })
  }

  return { liked, count, toggle }
}
