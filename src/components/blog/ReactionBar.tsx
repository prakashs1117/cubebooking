import { useState, useRef } from 'react'
import { Smile } from 'lucide-react'
import { useReactions } from '../../hooks/useReactions'
import EmojiPicker from './EmojiPicker'
import type { ReactionEmoji } from '../../types'

interface Props {
  postId: string
  uid: string | null
}

export default function ReactionBar({ postId, uid }: Props) {
  const { counts, myReaction, toggle } = useReactions(postId)
  const [pickerOpen, setPickerOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const handleSelect = (emoji: ReactionEmoji) => {
    if (uid) toggle(emoji)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {sorted.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={e => { e.preventDefault(); if (uid) toggle(emoji as ReactionEmoji) }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            borderRadius: 999,
            border: myReaction?.emoji === emoji ? '1.5px solid #fcd34d' : '1.5px solid #E6E2DE',
            background: myReaction?.emoji === emoji ? '#fef9ec' : '#fff',
            cursor: uid ? 'pointer' : 'default',
            fontSize: 13,
            fontWeight: 700,
            color: '#374151',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          <span>{emoji}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{count}</span>
        </button>
      ))}

      {uid && (
        <button
          ref={btnRef}
          onClick={e => { e.preventDefault(); e.stopPropagation(); setPickerOpen(o => !o) }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 999,
            border: '1.5px solid #E6E2DE',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            color: '#6b7280',
            fontFamily: 'inherit',
          }}
        >
          <Smile size={13} />
          {myReaction ? myReaction.emoji : '+'}
        </button>
      )}

      {pickerOpen && (
        <EmojiPicker
          onSelect={handleSelect}
          onClose={() => setPickerOpen(false)}
          anchorEl={btnRef.current}
          myEmoji={myReaction?.emoji}
        />
      )}
    </div>
  )
}
