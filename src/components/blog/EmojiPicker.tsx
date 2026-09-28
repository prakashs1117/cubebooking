import { useEffect, useRef } from 'react'
import { REACTION_EMOJIS, type ReactionEmoji } from '../../types'

interface Props {
  onSelect: (emoji: ReactionEmoji) => void
  onClose: () => void
  anchorEl: HTMLElement | null
  myEmoji?: string
}

export default function EmojiPicker({ onSelect, onClose, anchorEl, myEmoji }: Props) {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Position relative to anchor
  const rect = anchorEl?.getBoundingClientRect()
  const top = rect ? Math.max(8, rect.top - 56) : 100
  const left = rect ? Math.min(rect.left, window.innerWidth - 300) : 20

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
          anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorEl])

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
        }}
        onClick={onClose}
      />
      <div
        ref={pickerRef}
        style={{
          position: 'fixed',
          top,
          left,
          zIndex: 1000,
          background: '#fff',
          border: '1px solid #E6E2DE',
          borderRadius: 14,
          padding: '8px 10px',
          display: 'flex',
          gap: 4,
          boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
          animation: 'emojiPopIn 0.14s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {REACTION_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={e => { e.stopPropagation(); onSelect(emoji); onClose() }}
            style={{
              background: myEmoji === emoji ? '#fef3c7' : 'none',
              border: myEmoji === emoji ? '1.5px solid #fcd34d' : '1.5px solid transparent',
              borderRadius: 8,
              padding: '4px 6px',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            aria-label={emoji}
          >
            {emoji}
          </button>
        ))}
        <style>{`
          @keyframes emojiPopIn {
            from { opacity: 0; transform: scale(0.7) translateY(6px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </>
  )
}
