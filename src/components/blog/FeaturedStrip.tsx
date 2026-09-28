import { usePosts } from '../../hooks/usePosts'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'

export default function FeaturedStrip() {
  const { posts, loading } = usePosts(undefined, true)

  if (!loading && posts.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#772432', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
        📌 Featured
      </div>
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none' as any,
      }}>
        {loading ? (
          [0, 1].map(i => (
            <div key={i} style={{ minWidth: 260, flexShrink: 0 }}>
              <PostSkeleton />
            </div>
          ))
        ) : (
          posts.map(post => (
            <div key={post.id} style={{ minWidth: 260, flexShrink: 0 }}>
              <PostCard post={post} compact />
            </div>
          ))
        )}
      </div>
      <style>{`.featured-strip::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}
