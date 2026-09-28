import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'
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

interface Props {
  post: CommunityPost
  compact?: boolean
}

export default function PostCard({ post, compact }: Props) {
  const navigate = useNavigate()
  const topReactions = Object.entries(post.reactionCounts ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e)

  const excerpt = post.body?.slice(0, compact ? 80 : 140) + (post.body?.length > (compact ? 80 : 140) ? '…' : '')

  return (
    <div
      onClick={() => navigate(`/blog/${post.id}`)}
      style={{
        background: '#fff',
        border: '1px solid #E6E2DE',
        borderLeft: post.type === 'word' ? '4px solid #C89A14' : '1px solid #E6E2DE',
        borderRadius: 16,
        padding: '18px 18px 14px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.12s',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Cover image or YouTube thumbnail */}
      {!compact && (post.imageURL || post.youtubeUrl) && (() => {
        const ytId = post.youtubeUrl
          ? post.youtubeUrl.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1]
          : null
        const thumbSrc = post.imageURL ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)
        if (!thumbSrc) return null
        return (
          <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
            <img
              src={thumbSrc}
              alt={post.title}
              style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
            />
            {ytId && !post.imageURL && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#FF0000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                    <path d="M6 3.5l7 4.5-7 4.5V3.5z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {post.photoURL ? (
          <img src={post.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: avatarColor(post.uid),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 800,
          }}>
            {initials(post.displayName)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.displayName}</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            {post.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) ?? ''}
          </div>
        </div>
        <PostTypeBadge type={post.type} />
      </div>

      {/* Title */}
      <div>
        <div style={{ fontSize: compact ? 14 : 16, fontWeight: 800, color: '#111827', lineHeight: 1.35, marginBottom: 4 }}>
          {post.title}
        </div>
        {post.type === 'word' && post.word && (
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 700, background: '#fffbeb', display: 'inline-block', padding: '1px 8px', borderRadius: 6, marginBottom: 4 }}>
            {post.word}
            {post.wordPartOfSpeech && <span style={{ fontWeight: 400, fontStyle: 'italic', marginLeft: 5 }}>({post.wordPartOfSpeech})</span>}
          </div>
        )}
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{excerpt}</div>
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {post.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 999,
              background: '#f1f5f9', color: '#64748b', fontWeight: 600,
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 2 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
          <Heart size={12} /> {post.likeCount || 0}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
          <MessageCircle size={12} /> {post.commentCount || 0}
        </span>
        {topReactions.length > 0 && (
          <span style={{ fontSize: 13, letterSpacing: -1 }}>{topReactions.join('')}</span>
        )}
        {post.status === 'pinned' && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#772432', background: '#fdf2f4', padding: '2px 8px', borderRadius: 999 }}>
            📌 Featured
          </span>
        )}
      </div>
    </div>
  )
}
