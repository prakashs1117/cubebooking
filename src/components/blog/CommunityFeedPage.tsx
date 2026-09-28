import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import AppHeader from '../AppHeader'
import { useAuthContext } from '../../context/AuthContext'
import { usePosts } from '../../hooks/usePosts'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'
import SearchBar from './SearchBar'
import FeaturedStrip from './FeaturedStrip'
import type { CommunityPost } from '../../types'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'blog', label: '✍️ Blog' },
  { id: 'word', label: '📖 Words' },
] as const

type Filter = (typeof FILTERS)[number]['id']

function filterPosts(posts: CommunityPost[], query: string): CommunityPost[] {
  if (!query.trim()) return posts
  const q = query.toLowerCase()
  return posts.filter(p =>
    p.title?.toLowerCase().includes(q) ||
    p.body?.slice(0, 200).toLowerCase().includes(q) ||
    p.displayName?.toLowerCase().includes(q) ||
    p.tags?.some(t => t.includes(q)) ||
    p.word?.toLowerCase().includes(q),
  )
}

export default function CommunityFeedPage() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { posts, loading, loadMore, hasMore } = usePosts(filter)

  const displayed = filterPosts(posts, searchQuery)

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) loadMore()
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) handleLoadMore()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [handleLoadMore])

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F1', fontFamily: 'Poppins, Inter, system-ui, sans-serif', paddingBottom: 80 }}>
      <AppHeader />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Community</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Posts, word discussions, and ideas from club members</p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 14 }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 16px', borderRadius: 999,
                border: filter === f.id ? 'none' : '1.5px solid #E6E2DE',
                background: filter === f.id ? '#772432' : '#fff',
                color: filter === f.id ? '#fff' : '#6b7280',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Featured pinned strip */}
        {!searchQuery && filter === 'all' && <FeaturedStrip />}

        {/* Feed */}
        {loading && posts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[0, 1, 2].map(i => <PostSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#374151', marginBottom: 6 }}>
              {searchQuery ? 'No posts match your search' : 'No posts yet'}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
              {searchQuery ? 'Try a different keyword' : 'Be the first to share something with the club'}
            </div>
            {user && !searchQuery && (
              <button
                onClick={() => navigate('/blog/new')}
                style={{
                  padding: '10px 22px', borderRadius: 10,
                  background: '#772432', color: '#fff',
                  border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Write a Post
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayed.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {/* Load-more sentinel */}
        <div ref={sentinelRef} style={{ height: 40 }} />

        {!loading && !hasMore && posts.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', padding: '10px 0 20px' }}>
            You've seen all posts
          </div>
        )}
      </div>

      {/* FAB — write a post */}
      {user && (
        <button
          onClick={() => navigate('/blog/new')}
          style={{
            position: 'fixed',
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            right: 20,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: '#772432',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 16px rgba(119,36,50,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(119,36,50,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(119,36,50,0.4)'
          }}
          aria-label="Write a post"
        >
          <PenLine size={20} />
        </button>
      )}
    </div>
  )
}
