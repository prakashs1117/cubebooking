import { Heart } from 'lucide-react'
import { usePostLike } from '../../hooks/usePostLike'

interface Props {
  postId: string
  initialCount: number
  uid: string | null
  size?: 'sm' | 'md'
}

export default function LikeButton({ postId, initialCount, uid, size = 'md' }: Props) {
  const { liked, count, toggle } = usePostLike(postId, initialCount, uid)
  const iconSize = size === 'sm' ? 13 : 15

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle() }}
      disabled={!uid}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        cursor: uid ? 'pointer' : 'default',
        padding: 0,
        color: liked ? '#ef4444' : '#9ca3af',
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart size={iconSize} fill={liked ? '#ef4444' : 'none'} />
      {count > 0 && count}
    </button>
  )
}
