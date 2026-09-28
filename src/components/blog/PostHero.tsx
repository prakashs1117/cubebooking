import type { CommunityPost } from '../../types'
import PostTypeBadge from './PostTypeBadge'

function initials(name: string) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function avatarColor(uid: string) {
  let hash = 0
  for (const c of uid) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`
}

export default function PostHero({ post }: { post: CommunityPost }) {
  const date = post.createdAt?.toDate?.()?.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) ?? ''

  return (
    <div style={{ marginBottom: 4 }}>
      {post.imageURL && (
        <img
          src={post.imageURL}
          alt={post.title}
          style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 14, display: 'block', marginBottom: 20 }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <PostTypeBadge type={post.type} />
        {post.status === 'pinned' && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#772432', background: '#fdf2f4', padding: '2px 8px', borderRadius: 999 }}>
            📌 Featured
          </span>
        )}
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.25 }}>
        {post.title}
      </h1>

      {post.type === 'word' && post.word && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, padding: '10px 14px', marginBottom: 14,
          display: 'inline-block',
        }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#92400e' }}>{post.word}</span>
          {post.wordPartOfSpeech && (
            <span style={{ fontSize: 12, color: '#a16207', fontStyle: 'italic', marginLeft: 8 }}>
              ({post.wordPartOfSpeech})
            </span>
          )}
        </div>
      )}

      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {post.photoURL ? (
          <img src={post.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: avatarColor(post.uid),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 800,
          }}>
            {initials(post.displayName)}
          </div>
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{post.displayName}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{date}</div>
        </div>
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: '#f1f5f9', color: '#475569', fontWeight: 600,
            }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
