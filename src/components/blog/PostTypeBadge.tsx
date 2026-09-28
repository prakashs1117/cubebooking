import type { PostType } from '../../types'

export default function PostTypeBadge({ type }: { type: PostType }) {
  const isWord = type === 'word'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 0.4,
      background: isWord ? '#fffbeb' : '#eef2ff',
      color: isWord ? '#92400e' : '#4338ca',
      border: `1px solid ${isWord ? '#fde68a' : '#c7d2fe'}`,
      textTransform: 'uppercase' as const,
    }}>
      {isWord ? '📖 Word' : '✍️ Blog'}
    </span>
  )
}
