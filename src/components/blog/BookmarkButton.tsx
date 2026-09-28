import { Bookmark } from 'lucide-react'
import { useBookmark } from '../../hooks/useBookmark'

interface Props {
  postId: string
  uid: string | null
}

export default function BookmarkButton({ postId, uid }: Props) {
  const { bookmarked, toggle } = useBookmark(postId, uid)

  if (!uid) return null

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle() }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        color: bookmarked ? '#f59e0b' : '#9ca3af',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
    >
      <Bookmark size={15} fill={bookmarked ? '#f59e0b' : 'none'} />
    </button>
  )
}
