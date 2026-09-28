import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, query, where, orderBy, limit, startAfter, onSnapshot } from 'firebase/firestore'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db } from '../firebase'
import type { CommunityPost } from '../types'

const PAGE_SIZE = 15

// Takes primitives (not an object) so useCallback/useEffect deps are stable
export function usePosts(type?: 'blog' | 'word' | 'all', onlyPinned?: boolean) {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const unsubsRef = useRef<(() => void)[]>([])

  const filterType = type === 'all' ? undefined : type

  const fetchPage = useCallback((after?: QueryDocumentSnapshot<DocumentData>) => {
    const constraints: Parameters<typeof query>[1][] = []

    if (onlyPinned) {
      constraints.push(where('status', '==', 'pinned'))
    } else {
      constraints.push(where('status', 'in', ['published', 'pinned']))
      if (filterType) {
        constraints.push(where('type', '==', filterType))
      }
      constraints.push(orderBy('createdAt', 'desc'))
    }

    constraints.push(limit(PAGE_SIZE))
    if (after) constraints.push(startAfter(after))

    const q = query(collection(db, 'posts'), ...constraints)

    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost))
      docs.sort((a, b) => {
        if (onlyPinned) return (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999)
        const ta = (a.createdAt as any)?.toMillis?.() ?? 0
        const tb = (b.createdAt as any)?.toMillis?.() ?? 0
        return tb - ta
      })

      if (!after) {
        setPosts(docs)
      } else {
        setPosts(prev => {
          const ids = new Set(prev.map(p => p.id))
          return [...prev, ...docs.filter(d => !ids.has(d.id))]
        })
      }
      if (snap.docs.length > 0) lastDocRef.current = snap.docs[snap.docs.length - 1]
      setHasMore(snap.docs.length === PAGE_SIZE)
      setLoading(false)
    }, (err) => {
      console.warn('usePosts query failed — composite index may still be building:', err.message)
      // Fallback: drop orderBy, apply type filter, sort client-side
      const fallbackConstraints: Parameters<typeof query>[1][] = [
        where('status', 'in', ['published', 'pinned']),
      ]
      if (filterType) fallbackConstraints.push(where('type', '==', filterType))
      fallbackConstraints.push(limit(PAGE_SIZE))

      const fallbackQ = query(collection(db, 'posts'), ...fallbackConstraints)
      onSnapshot(fallbackQ, snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost))
        docs.sort((a, b) => {
          const ta = (a.createdAt as any)?.toMillis?.() ?? 0
          const tb = (b.createdAt as any)?.toMillis?.() ?? 0
          return tb - ta
        })
        setPosts(docs)
        setHasMore(false)
        setLoading(false)
      }, () => setLoading(false))
    })

    unsubsRef.current.push(unsub)
  }, [filterType, onlyPinned]) // primitives — stable deps

  useEffect(() => {
    setLoading(true)
    setPosts([])
    lastDocRef.current = null
    unsubsRef.current.forEach(u => u())
    unsubsRef.current = []
    fetchPage()
    return () => { unsubsRef.current.forEach(u => u()) }
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (!hasMore || !lastDocRef.current) return
    fetchPage(lastDocRef.current)
  }, [hasMore, fetchPage])

  return { posts, loading, loadMore, hasMore }
}
