import { useState } from 'react'
import type { RoleSlot, RoleGroup, MeetingDetails, SpeakerFeedback } from '../../types'
import { ROLE_CATALOGUE, matchesEntry as matchesEntryLib } from '../../lib/roleCatalogue'
import type { CatalogueEntry } from '../../lib/roleCatalogue'

const COOL_MESSAGES = [
  "Every great speaker was once a nervous beginner. You're already ahead.",
  "Your voice matters — the room is better with you in it.",
  "Courage is not the absence of fear; it's showing up anyway. See you there!",
  "Growth happens outside the comfort zone. You're exactly where you need to be.",
  "The best way to become a better speaker? Show up, take the role, and do it.",
  "One meeting at a time — that's how legends are made.",
  "Your contribution makes the whole club stronger. Thank you for stepping up.",
  "Leadership is action, not position. You're already leading.",
]

function CelebrationModal({
  roleName,
  displayName,
  meetingDate,
  onClose,
}: {
  roleName: string
  displayName: string
  meetingDate: string
  onClose: () => void
}) {
  const msg = COOL_MESSAGES[Math.floor(displayName.length % COOL_MESSAGES.length)]
  const firstName = displayName.split(/[\s@._-]+/)[0] || displayName

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          padding: '32px 28px', width: '100%', maxWidth: 380,
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative top stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 5,
          background: 'linear-gradient(90deg, #772432, #D64A6A, #f2df74, #1A9E60)',
        }} />

        {/* Confetti emoji */}
        <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>🎉</div>

        {/* Headline */}
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>
          You're in, {firstName}!
        </div>

        {/* Role */}
        <div style={{
          display: 'inline-block', marginBottom: 16,
          padding: '5px 16px', borderRadius: 999,
          background: '#FFF5F6', border: '1.5px solid #f3c0c8',
          fontSize: 14, fontWeight: 700, color: '#772432',
        }}>
          {roleName}
        </div>

        {/* Meeting date */}
        <div style={{
          background: '#F9FAFB', border: '1px solid #E6E2DE',
          borderRadius: 12, padding: '12px 16px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
            See you on
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
            {meetingDate}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
            Your attendance has been marked ✓
          </div>
        </div>

        {/* Motivational message */}
        <p style={{
          fontSize: 13, color: '#6B7280', lineHeight: 1.65,
          margin: '0 0 24px', fontStyle: 'italic',
        }}>
          "{msg}"
        </p>

        {/* Thanks line */}
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 24 }}>
          Thank you for contributing and learning with us 🙌
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 12,
            background: '#772432', color: '#fff',
            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          Let's go!
        </button>
      </div>
    </div>
  )
}


function ConfirmRoleModal({
  entry,
  displayName,
  onConfirm,
  onCancel,
}: {
  entry: CatalogueEntry
  displayName: string
  onConfirm: (pathwaysLevel?: string, speechTopic?: string) => void
  onCancel: () => void
}) {
  const [pathwaysLevel, setPathwaysLevel] = useState('')
  const [speechTopic, setSpeechTopic] = useState('')
  const firstName = displayName.split(/[\s@._-]+/)[0] || displayName
  const color = GROUP_COLORS[entry.group]
  const isSpeaker = entry.code === 'SPKR'

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 70,
        background: 'rgba(0,0,0,0.52)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18,
          width: '100%', maxWidth: 360,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          overflow: 'hidden',
        }}
      >
        {/* ── Fixed header ── */}
        <div style={{
          flexShrink: 0,
          padding: '16px 16px 12px',
          borderBottom: '1px solid #F3F4F6',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: color,
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: color + '18', border: `1.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {entry.emoji}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                {entry.name}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                Ready to step up, {firstName}?
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          <p style={{ fontSize: 10, color: '#9CA3AF', lineHeight: 1.55, margin: '0 0 12px' }}>
            {entry.description}
          </p>

          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>
            Responsibilities
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {entry.responsibilities.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <span style={{ color, fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>

          {isSpeaker && (
            <div style={{
              marginTop: 14, padding: '10px 12px', borderRadius: 10,
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#166534', display: 'block', marginBottom: 5 }}>
                  Pathways Level{' '}
                  <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(e.g. L1P2, L2P4)</span>
                </label>
                <input
                  type="text"
                  value={pathwaysLevel}
                  onChange={e => setPathwaysLevel(e.target.value.toUpperCase())}
                  placeholder="e.g. L1P2"
                  maxLength={6}
                  autoFocus
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 7,
                    border: '1px solid #BBF7D0', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    color: '#111827',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#166534')}
                  onBlur={e => (e.target.style.borderColor = '#BBF7D0')}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#166534', display: 'block', marginBottom: 5 }}>
                  Speech Topic{' '}
                  <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={speechTopic}
                  onChange={e => setSpeechTopic(e.target.value)}
                  placeholder="e.g. The Power of Habits"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 7,
                    border: '1px solid #BBF7D0', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    color: '#111827',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#166534')}
                  onBlur={e => (e.target.style.borderColor = '#BBF7D0')}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Fixed footer ── */}
        <div style={{
          flexShrink: 0,
          padding: '12px 16px',
          borderTop: '1px solid #F3F4F6',
          display: 'flex', gap: 8,
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: '1.5px solid #E6E2DE', background: '#fff',
              fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
            }}
          >
            Not yet
          </button>
          <button
            onClick={() => onConfirm(
              isSpeaker && pathwaysLevel.trim() ? pathwaysLevel.trim() : undefined,
              isSpeaker && speechTopic.trim() ? speechTopic.trim() : undefined,
            )}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 10,
              border: 'none', background: color,
              fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}
          >
            Yes, assign me!
          </button>
        </div>
      </div>
    </div>
  )
}

// ROLE_CATALOGUE imported from ../../lib/roleCatalogue

const GROUP_ORDER: RoleGroup[] = ['roleTakers', 'tagl', 'speakers', 'evaluators']

const GROUP_LABELS: Record<RoleGroup, string> = {
  roleTakers: 'Role Takers',
  tagl: 'TAG L',
  speakers: 'Speakers',
  evaluators: 'Evaluators',
  tableTopics: 'Table Topics Speakers',
}

const GROUP_COLORS: Record<RoleGroup, string> = {
  roleTakers: '#D64A6A',
  tagl: '#C89A14',
  speakers: '#1A9E60',
  evaluators: '#3B82F6',
  tableTopics: '#D97706',
}

// ROLE_ALIASES and matchesEntry imported from ../../lib/roleCatalogue
const matchesEntry = matchesEntryLib

interface RoleCardProps {
  entry: CatalogueEntry
  mySlot: RoleSlot | undefined
  slots: RoleSlot[]
  currentUid?: string
  busy: string | null
  onPick: (entry: CatalogueEntry) => void
}

function RoleCard({ entry, mySlot, slots, currentUid, busy, onPick }: RoleCardProps) {
  const [hovered, setHovered] = useState(false)

  const openSlot  = slots.find(s => matchesEntry(s.role, entry) && !s.uid && !s.name)
  const takenSlot = slots.find(s => matchesEntry(s.role, entry) && !!(s.uid || s.name))
  const ismine    = !!mySlot && matchesEntry(mySlot.role, entry)
  const isLoading = busy === entry.code
  const color     = GROUP_COLORS[entry.group]

  type Avail = 'mine' | 'open' | 'taken' | 'notset'
  const avail: Avail = ismine ? 'mine' : openSlot ? 'open' : takenSlot ? 'taken' : 'notset'
  const isAvailable = avail === 'open' || avail === 'notset'
  const isTaken = avail === 'taken'
  const clickable = isAvailable && !isLoading && !!currentUid && !mySlot

  // First name of whoever took the slot
  const takerName = takenSlot?.name
    ? takenSlot.name.split(/[\s@._-]+/)[0]
    : null

  return (
    <div
      onClick={() => { if (clickable) onPick(entry) }}
      onMouseEnter={() => { if (clickable) setHovered(true) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        minWidth: 88, maxWidth: 110,
        flex: '0 0 auto',
        background: ismine
          ? `linear-gradient(145deg, ${color}20, ${color}08)`
          : isTaken
            ? '#F7F7F7'
            : '#fff',
        border: `1.5px solid ${
          ismine ? color
          : hovered && clickable ? color
          : isTaken ? '#EBEBEB'
          : '#E2E8F0'
        }`,
        borderRadius: 14,
        padding: '12px 8px 10px',
        cursor: clickable ? 'pointer' : 'default',
        opacity: isTaken ? 0.6 : isLoading ? 0.65 : 1,
        transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.12s',
        boxShadow: hovered && clickable
          ? '0 6px 18px rgba(0,0,0,0.11)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered && clickable ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        textAlign: 'center',
      }}
    >
      {/* Emoji */}
      <div style={{ fontSize: 22, lineHeight: 1 }}>{entry.emoji}</div>

      {/* Role name */}
      <div style={{
        fontSize: 10, fontWeight: 700, lineHeight: 1.25,
        color: ismine ? color : isTaken ? '#ABABAB' : '#111827',
      }}>
        {isLoading ? 'Claiming…' : entry.name}
      </div>

      {/* Status pill / taker name */}
      {isTaken && takerName ? (
        <div style={{
          fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
          background: '#EFEFEF', color: '#888', whiteSpace: 'nowrap',
          maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {takerName}
        </div>
      ) : (
        <div style={{
          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
          whiteSpace: 'nowrap',
          background: ismine ? color + '20' : '#DCFCE7',
          color: ismine ? color : '#166534',
        }}>
          {ismine ? '✓ Yours' : 'Open'}
        </div>
      )}
    </div>
  )
}

interface TmodModalProps {
  onConfirm: (theme: string, meanings: string) => Promise<void>
  onCancel: () => void
}

function TmodModal({ onConfirm, onCancel }: TmodModalProps) {
  const [theme, setTheme] = useState('')
  const [meanings, setMeanings] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #E6E2DE', borderRadius: 8,
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', color: '#111827',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theme.trim()) { setError('Theme is required'); return }
    setBusy(true)
    setError(null)
    try {
      await onConfirm(theme.trim(), meanings.trim())
    } catch (err: any) {
      setError(err?.message ?? 'Could not claim role')
      setBusy(false)
    }
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14,
          padding: '20px', width: '100%', maxWidth: 380,
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#D64A6A14', border: '1.5px solid #D64A6A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#D64A6A',
            }}>
              TM
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              Toastmaster of the Day
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            As TMOD, please share the meeting theme and an optional word/phrase meaning.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 5 }}>
              Meeting Theme <span style={{ color: '#772432' }}>*</span>
            </label>
            <input
              type="text"
              value={theme}
              autoFocus
              placeholder="e.g. The best things aren't planned"
              onChange={e => setTheme(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#772432')}
              onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 5 }}>
              Word / Phrase meaning <span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
            </label>
            <textarea
              value={meanings}
              placeholder="Add a word of the day, phrase, or meaning — or leave blank"
              onChange={e => setMeanings(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#772432')}
              onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#FFEBEE', color: '#B3261E', fontSize: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 8,
                border: '1px solid #E6E2DE', background: '#fff',
                fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{
                flex: 2, padding: '9px 0', borderRadius: 8,
                border: 'none', background: busy ? '#D1D5DB' : '#772432',
                fontSize: 12, fontWeight: 700, color: '#fff',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Claiming…' : 'Confirm & Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface GramModalProps {
  onConfirm: (wod: string, wodMeanings: string[], wodUsages: string[], pod: string, podMeanings: string[], podUsages: string[]) => Promise<void>
  onCancel: () => void
}

function DynamicList({ items, onChange, onAdd, onRemove, placeholder, color }: {
  items: string[]
  onChange: (i: number, val: string) => void
  onAdd: () => void
  onRemove: (i: number) => void
  placeholder: string
  color: string
}) {
  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '6px 8px',
    border: '1px solid #E6E2DE', borderRadius: 6,
    fontSize: 11, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', color: '#111827', background: '#fff',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, minWidth: 12, flexShrink: 0 }}>{i + 1}.</span>
          <input
            type="text" value={v}
            placeholder={`${placeholder} ${i + 1}`}
            onChange={e => onChange(i, e.target.value)}
            onFocus={e => (e.target.style.borderColor = color)}
            onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
            style={inputStyle}
          />
          {items.length > 1 && (
            <button type="button" onClick={() => onRemove(i)} style={{
              width: 18, height: 18, borderRadius: 4, border: '1px solid #E6E2DE',
              background: '#fff', cursor: 'pointer', fontSize: 9, color: '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>
          )}
          {i === items.length - 1 && (
            <button type="button" onClick={onAdd} style={{
              width: 18, height: 18, borderRadius: 4,
              background: color, border: 'none',
              cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              lineHeight: 1,
            }}>+</button>
          )}
        </div>
      ))}
    </div>
  )
}

function GramModal({ onConfirm, onCancel }: GramModalProps) {
  const [wod, setWod] = useState('')
  const [wodMeanings, setWodMeanings] = useState<string[]>([''])
  const [wodUsages, setWodUsages] = useState<string[]>([''])
  const [pod, setPod] = useState('')
  const [podMeanings, setPodMeanings] = useState<string[]>([''])
  const [podUsages, setPodUsages] = useState<string[]>([''])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const color = '#C89A14'

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px',
    border: '1px solid #E6E2DE', borderRadius: 8,
    fontSize: 12, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', color: '#111827', background: '#fff',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wod.trim()) { setError('Word of the Day is required'); return }
    if (!pod.trim()) { setError('Phrase of the Day is required'); return }
    setBusy(true)
    setError(null)
    try {
      await onConfirm(
        wod.trim(),
        wodMeanings.map(m => m.trim()).filter(Boolean),
        wodUsages.map(u => u.trim()).filter(Boolean),
        pod.trim(),
        podMeanings.map(m => m.trim()).filter(Boolean),
        podUsages.map(u => u.trim()).filter(Boolean),
      )
    } catch (err: any) {
      setError(err?.message ?? 'Could not claim role')
      setBusy(false)
    }
  }

  const sectionStyle: React.CSSProperties = {
    border: '1px solid #E6E2DE', borderRadius: 10,
    padding: '10px', marginBottom: 10,
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const,
    letterSpacing: 0.6, marginBottom: 8,
  }

  const subLabelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#6B6470',
    display: 'block', marginBottom: 3,
  }

  const subSectionStyle: React.CSSProperties = {
    background: '#F9FAFB', borderRadius: 7, padding: '7px 8px', marginTop: 7,
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14,
          padding: '16px', width: '100%', maxWidth: 420,
          maxHeight: '78vh', overflowY: 'auto',
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: color + '20', border: `1.5px solid ${color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color,
          }}>GR</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Grammarian</div>
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>
          Fill WOD and POD separately — each with their own meanings and example sentences.
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── WOD Section ── */}
          <div style={{ ...sectionStyle, borderColor: color + '60' }}>
            <div style={{ ...sectionLabelStyle, color }}>Word of the Day (WOD)</div>

            <label style={subLabelStyle}>
              Word <span style={{ color: '#772432' }}>*</span>
            </label>
            <input
              type="text" value={wod} autoFocus
              placeholder="e.g. Spontaneous"
              onChange={e => setWod(e.target.value)}
              onFocus={e => (e.target.style.borderColor = color)}
              onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
              style={inputStyle}
            />

            <div style={subSectionStyle}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6470', marginBottom: 5 }}>
                Meanings <span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
              </div>
              <DynamicList
                items={wodMeanings}
                onChange={(i, v) => setWodMeanings(p => p.map((x, idx) => idx === i ? v : x))}
                onAdd={() => setWodMeanings(p => [...p, ''])}
                onRemove={i => setWodMeanings(p => p.filter((_, idx) => idx !== i))}
                placeholder="Meaning"
                color={color}
              />
            </div>

            <div style={{ ...subSectionStyle, marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6470', marginBottom: 5 }}>
                Example Sentences <span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
              </div>
              <DynamicList
                items={wodUsages}
                onChange={(i, v) => setWodUsages(p => p.map((x, idx) => idx === i ? v : x))}
                onAdd={() => setWodUsages(p => [...p, ''])}
                onRemove={i => setWodUsages(p => p.filter((_, idx) => idx !== i))}
                placeholder="Sentence"
                color={color}
              />
            </div>
          </div>

          {/* ── POD Section ── */}
          <div style={{ ...sectionStyle, borderColor: '#6B6470' + '40' }}>
            <div style={{ ...sectionLabelStyle, color: '#6B6470' }}>Phrase of the Day (POD)</div>

            <label style={subLabelStyle}>
              Phrase <span style={{ color: '#772432' }}>*</span>
            </label>
            <input
              type="text" value={pod}
              placeholder="e.g. On the spur of the moment"
              onChange={e => setPod(e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#6B6470')}
              onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
              style={inputStyle}
            />

            <div style={subSectionStyle}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6470', marginBottom: 5 }}>
                Meanings <span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
              </div>
              <DynamicList
                items={podMeanings}
                onChange={(i, v) => setPodMeanings(p => p.map((x, idx) => idx === i ? v : x))}
                onAdd={() => setPodMeanings(p => [...p, ''])}
                onRemove={i => setPodMeanings(p => p.filter((_, idx) => idx !== i))}
                placeholder="Meaning"
                color="#6B6470"
              />
            </div>

            <div style={{ ...subSectionStyle, marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6470', marginBottom: 5 }}>
                Example Sentences <span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
              </div>
              <DynamicList
                items={podUsages}
                onChange={(i, v) => setPodUsages(p => p.map((x, idx) => idx === i ? v : x))}
                onAdd={() => setPodUsages(p => [...p, ''])}
                onRemove={i => setPodUsages(p => p.filter((_, idx) => idx !== i))}
                placeholder="Sentence"
                color="#6B6470"
              />
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#FFEBEE', color: '#B3261E', fontSize: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              border: '1px solid #E6E2DE', background: '#fff',
              fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={busy} style={{
              flex: 2, padding: '9px 0', borderRadius: 8,
              border: 'none', background: busy ? '#D1D5DB' : '#772432',
              fontSize: 12, fontWeight: 700, color: '#fff',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}>{busy ? 'Claiming…' : 'Confirm & Claim'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SlotCard({
  slot, entry, groupColor, label, ismine, isOpen, canClaim, isSpeaker, firstName,
  onClaim, onUpdateSlotField, onGiveFeedback, hasReviewed,
}: {
  slot: RoleSlot
  entry: CatalogueEntry
  groupColor: string
  label: string
  ismine: boolean
  isOpen: boolean
  canClaim: boolean
  isSpeaker: boolean
  firstName: string
  onClaim: () => void
  onUpdateSlotField?: (slotId: string, fields: { speechTopic?: string; pathwaysLevel?: string }) => Promise<void>
  onGiveFeedback?: () => void
  hasReviewed?: boolean
}) {
  const [editingTopic, setEditingTopic] = useState(false)
  const [topicDraft, setTopicDraft] = useState(slot.speechTopic ?? '')

  const saveTopic = async () => {
    setEditingTopic(false)
    const trimmed = topicDraft.trim()
    if (trimmed === (slot.speechTopic ?? '')) return
    await onUpdateSlotField?.(slot.id, { speechTopic: trimmed || undefined })
  }

  return (
    <div
      onClick={() => !editingTopic && canClaim && onClaim()}
      style={{
        background: ismine ? groupColor + '14' : isOpen ? '#fff' : '#F7F7F7',
        border: `1.5px solid ${ismine ? groupColor : isOpen ? '#E2E8F0' : '#EBEBEB'}`,
        borderRadius: 10, padding: '8px 10px',
        cursor: canClaim && !editingTopic ? 'pointer' : 'default',
        opacity: !isOpen && !ismine ? 0.6 : 1,
        display: 'flex', flexDirection: 'column', gap: 5,
        transition: 'border-color 0.15s',
        flex: 1, minWidth: 0,
      }}
    >
      {/* Top row: emoji + name/status + open badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 18, flexShrink: 0 }}>{entry.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: ismine ? groupColor : isOpen ? '#111827' : '#ABABAB', lineHeight: 1.2 }}>
            {isOpen ? 'Open' : ismine ? `✓ You` : firstName}
          </div>
          {(slot.pathwaysLevel) && (
            <div style={{ fontSize: 8, fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '1px 4px', borderRadius: 3, display: 'inline-block', marginTop: 1 }}>
              {slot.pathwaysLevel}
            </div>
          )}
        </div>
        {isOpen && (
          <div style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#DCFCE7', color: '#166534', flexShrink: 0 }}>Open</div>
        )}
      </div>

      {/* Topic row — only for speaker slots that are claimed */}
      {isSpeaker && !isOpen && (
        <div onClick={e => e.stopPropagation()} style={{ paddingLeft: 26 }}>
          {editingTopic ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                autoFocus
                value={topicDraft}
                onChange={e => setTopicDraft(e.target.value)}
                onBlur={saveTopic}
                onKeyDown={e => { if (e.key === 'Enter') saveTopic(); if (e.key === 'Escape') { setTopicDraft(slot.speechTopic ?? ''); setEditingTopic(false) } }}
                placeholder="Speech topic…"
                style={{
                  flex: 1, fontSize: 10, padding: '3px 7px', borderRadius: 5,
                  border: `1px solid ${groupColor}`, outline: 'none',
                  fontFamily: 'inherit', color: '#111827', background: '#fff',
                  boxSizing: 'border-box',
                }}
              />
              <button onClick={saveTopic} style={{ fontSize: 10, padding: '3px 7px', borderRadius: 5, background: groupColor, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✓</button>
            </div>
          ) : (
            <div
              onClick={() => (ismine || onUpdateSlotField) && setEditingTopic(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                cursor: ismine || onUpdateSlotField ? 'pointer' : 'default',
              }}
            >
              <span style={{ fontSize: 10, color: slot.speechTopic ? '#374151' : '#9CA3AF', fontStyle: slot.speechTopic ? 'normal' : 'italic', flex: 1 }}>
                {slot.speechTopic || 'Add speech topic…'}
              </span>
              {(ismine || onUpdateSlotField) && (
                <span style={{ fontSize: 9, color: '#9CA3AF' }}>✎</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feedback pill — shown when slot is claimed and viewer is not the speaker */}
      {!isOpen && !ismine && onGiveFeedback && (
        <div onClick={e => e.stopPropagation()} style={{ paddingLeft: 26, marginTop: 2 }}>
          {hasReviewed ? (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              background: '#F3F4F6', color: '#9CA3AF',
              display: 'inline-block',
            }}>
              ✓ Feedback sent
            </span>
          ) : (
            <button
              onClick={onGiveFeedback}
              style={{
                fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: groupColor + '18', color: groupColor,
                border: `1px solid ${groupColor}40`,
                cursor: 'pointer',
              }}
            >
              💬 Give Feedback
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function AlreadyPickedModal({
  currentRoleName, currentRoleEmoji,
  wantedRoleName, wantedRoleEmoji, wantedRoleColor,
  releaseBusy, onRelease, onKeep,
}: {
  currentRoleName: string
  currentRoleEmoji: string
  wantedRoleName: string
  wantedRoleEmoji: string
  wantedRoleColor: string
  releaseBusy: boolean
  onRelease: () => Promise<void>
  onKeep: () => void
}) {
  return (
    <div
      onClick={onKeep}
      style={{
        position: 'fixed', inset: 0, zIndex: 75,
        background: 'rgba(0,0,0,0.52)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18,
          width: '100%', maxWidth: 360,
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 3, background: '#F59E0B' }} />

        <div style={{ padding: '20px 20px 18px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔄</div>

          <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
            You already have a role!
          </div>

          {/* Current role */}
          <div style={{
            background: '#F9FAFB', border: '1px solid #E5E7EB',
            borderRadius: 10, padding: '10px 12px', marginBottom: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Your current role
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{currentRoleEmoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{currentRoleName}</span>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: 'center', fontSize: 16, color: '#9CA3AF', marginBottom: 12 }}>↓</div>

          {/* Wanted role */}
          <div style={{
            background: wantedRoleColor + '10', border: `1.5px solid ${wantedRoleColor}40`,
            borderRadius: 10, padding: '10px 12px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Role you want
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{wantedRoleEmoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: wantedRoleColor }}>{wantedRoleName}</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6, margin: '0 0 18px' }}>
            To switch roles, your current role will be released first so someone else can pick it up.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onKeep}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: '1.5px solid #E6E2DE', background: '#fff',
                fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
              }}
            >
              Keep current
            </button>
            <button
              onClick={onRelease}
              disabled={releaseBusy}
              style={{
                flex: 2, padding: '10px 0', borderRadius: 10,
                border: 'none', background: releaseBusy ? '#D1D5DB' : wantedRoleColor,
                fontSize: 12, fontWeight: 700, color: '#fff',
                cursor: releaseBusy ? 'not-allowed' : 'pointer',
              }}
            >
              {releaseBusy ? 'Switching…' : `Release & pick ${wantedRoleName.split(' ')[0]}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MyRoleBanner({
  mySlot, busy, mySlotFeedback, onRelease,
}: {
  mySlot: RoleSlot
  busy: string | null
  mySlotFeedback?: SpeakerFeedback[]
  onRelease: () => void
}) {
  const [showFeedback, setShowFeedback] = useState(false)
  const color = GROUP_COLORS[mySlot.group]
  const isSpeakerGroup = mySlot.group === 'speakers' || mySlot.group === 'tableTopics'

  return (
    <div style={{
      background: color + '14',
      border: `1.5px solid ${color}`,
      borderRadius: 14,
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>
            Your role this week
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
            {ROLE_CATALOGUE.find(e => matchesEntry(mySlot.role, e))?.name ?? mySlot.role}
          </div>
        </div>
        <button
          onClick={onRelease}
          disabled={busy === 'release'}
          style={{
            padding: '6px 12px', borderRadius: 8,
            background: '#E5E7EB', color: '#374151',
            border: 'none', fontSize: 12, fontWeight: 700,
            cursor: busy === 'release' ? 'not-allowed' : 'pointer',
            opacity: busy === 'release' ? 0.6 : 1,
            transition: 'opacity 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {busy === 'release' ? 'Releasing…' : 'Release'}
        </button>
      </div>

      {/* Feedback received — only for speaker/table-topics roles */}
      {isSpeakerGroup && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${color}30` }}>
          <button
            onClick={() => setShowFeedback(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color,
              padding: 0, fontFamily: 'inherit',
            }}
          >
            💬 Feedback received {mySlotFeedback && mySlotFeedback.length > 0 ? `(${mySlotFeedback.length})` : '(0)'}
            <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 2 }}>{showFeedback ? '▲' : '▼'}</span>
          </button>

          {showFeedback && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!mySlotFeedback || mySlotFeedback.length === 0 ? (
                <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
                  No feedback yet. It will appear here once submitted by other members.
                </div>
              ) : mySlotFeedback.map(fb => (
                <div key={fb.id} style={{
                  background: '#fff', borderRadius: 8,
                  border: '1px solid #E6E2DE', padding: '8px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#F59E0B', letterSpacing: -1 }}>
                      {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                    </span>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                      from {fb.reviewerName.split(/[\s@._-]+/)[0] || 'Anonymous'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{fb.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface RolePickerViewProps {
  slots: RoleSlot[]
  currentUid?: string
  displayName?: string
  meetingDate?: string
  onClaim: (slotId: string, pathwaysLevel?: string, speechTopic?: string) => Promise<void>
  /** For fixed catalogue roles: claim by role code, creating the slot if it was deleted. */
  onClaimByCode?: (roleCode: string, pathwaysLevel?: string, speechTopic?: string) => Promise<string>
  onRelease: (slotId: string) => Promise<void>
  onUpdateMeeting?: (patch: Partial<MeetingDetails>) => Promise<void>
  onMarkAttending?: () => Promise<void>
  onAddSlot?: (group: RoleGroup, role: string) => Promise<void>
  onAddSpeakerPair?: () => Promise<void>
  onUpdateSlotField?: (slotId: string, fields: { speechTopic?: string; pathwaysLevel?: string }) => Promise<void>
  isAdmin?: boolean
  onGiveFeedback?: (slot: RoleSlot) => void
  hasReviewedSlot?: (slotId: string) => boolean
  mySlotFeedback?: SpeakerFeedback[]
}

export function RolePickerView({ slots, currentUid, displayName = '', meetingDate = '', onClaim, onClaimByCode, onRelease, onUpdateMeeting, onMarkAttending, onAddSpeakerPair, onUpdateSlotField, isAdmin, onGiveFeedback, hasReviewedSlot, mySlotFeedback }: RolePickerViewProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tmodEntry, setTmodEntry] = useState<{ entry: CatalogueEntry; slotId: string } | null>(null)
  const [gramEntry, setGramEntry] = useState<{ entry: CatalogueEntry; slotId: string } | null>(null)
  const [celebration, setCelebration] = useState<{ roleName: string } | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [confirmEntry, setConfirmEntry] = useState<{ entry: CatalogueEntry; slotId: string } | null>(null)
  const [addingSlot, setAddingSlot] = useState<RoleGroup | null>(null)
  const [alreadyPickedFor, setAlreadyPickedFor] = useState<CatalogueEntry | null>(null)

  const mySlot = slots.find(s => s.uid === currentUid)

  const openRoles = ROLE_CATALOGUE.filter(e =>
    e.group !== 'speakers' && e.group !== 'evaluators' && e.group !== 'tableTopics' && (
      slots.some(s => matchesEntry(s.role, e) && !s.uid && !s.name) ||
      (e.fixed && !slots.some(s => matchesEntry(s.role, e) && !!(s.uid || s.name)))
    )
  )

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join us — roles are open!', url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const handlePick = async (entry: CatalogueEntry) => {
    setError(null)
    if (!currentUid) { setError('Sign in to claim a role'); return }
    if (mySlot) { setAlreadyPickedFor(entry); return }

    const openSlot = slots.find(s => matchesEntry(s.role, entry) && !s.uid && !s.name)

    // For non-fixed roles, a slot must exist in Firestore
    if (!entry.fixed && !openSlot) {
      setError(`No open slot for ${entry.name} this week`)
      return
    }

    if (entry.code === 'TMOD') {
      setTmodEntry({ entry, slotId: openSlot?.id ?? '' })
      return
    }

    if (entry.code === 'GRAM') {
      setGramEntry({ entry, slotId: openSlot?.id ?? '' })
      return
    }

    setConfirmEntry({ entry, slotId: openSlot?.id ?? '' })
  }

  const handleConfirm = async (pathwaysLevel?: string, speechTopic?: string) => {
    if (!confirmEntry) return
    const { entry, slotId } = confirmEntry
    setConfirmEntry(null)
    setBusy(entry.code)
    try {
      if (slotId) {
        await onClaim(slotId, pathwaysLevel, speechTopic)
      } else {
        await onClaimByCode?.(entry.code, pathwaysLevel, speechTopic)
      }
      onMarkAttending?.()
      setCelebration({ roleName: entry.name })
    } catch (err: any) {
      setError(err?.message ?? 'Could not claim role')
    } finally {
      setBusy(null)
    }
  }

  const handleTmodConfirm = async (theme: string, meanings: string) => {
    if (!tmodEntry) return
    if (onUpdateMeeting) {
      await onUpdateMeeting({ theme, wod: meanings || undefined })
    }
    if (tmodEntry.slotId) {
      await onClaim(tmodEntry.slotId)
    } else {
      await onClaimByCode?.('TMOD')
    }
    onMarkAttending?.()
    setCelebration({ roleName: tmodEntry.entry.name })
    setTmodEntry(null)
  }

  const handleGramConfirm = async (
    wod: string, wodMeanings: string[], wodUsages: string[],
    pod: string, podMeanings: string[], podUsages: string[],
  ) => {
    if (!gramEntry) return
    if (onUpdateMeeting) {
      const fmt = (label: string, items: string[]) =>
        items.length ? `${label}:\n${items.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''
      const wodFull = [wod, fmt('Meanings', wodMeanings), fmt('Examples', wodUsages)].filter(Boolean).join('\n\n')
      const podFull = [pod, fmt('Meanings', podMeanings), fmt('Examples', podUsages)].filter(Boolean).join('\n\n')
      await onUpdateMeeting({
        wod: wodFull || undefined,
        pod: podFull || undefined,
      })
    }
    if (gramEntry.slotId) {
      await onClaim(gramEntry.slotId)
    } else {
      await onClaimByCode?.('GRAM')
    }
    onMarkAttending?.()
    setCelebration({ roleName: gramEntry.entry.name })
    setGramEntry(null)
  }

  const handleRelease = async () => {
    if (!mySlot) return
    setBusy('release')
    try {
      await onRelease(mySlot.id)
    } catch (err: any) {
      setError(err?.message ?? 'Could not release role')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
      <style>{`.role-scroll::-webkit-scrollbar{display:none}`}</style>
      {mySlot && (
        <MyRoleBanner
          mySlot={mySlot}
          busy={busy}
          mySlotFeedback={mySlotFeedback}
          onRelease={handleRelease}
        />
      )}

      {/* ── Floating release pill — visible anywhere on the page once a role is claimed ── */}
      {mySlot && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          pointerEvents: 'auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: GROUP_COLORS[mySlot.group],
            color: '#fff',
            borderRadius: 999,
            padding: '10px 18px 10px 14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 999,
              padding: '2px 9px',
              fontSize: 12,
              fontWeight: 800,
            }}>
              {ROLE_CATALOGUE.find(e => matchesEntry(mySlot.role, e))?.name ?? mySlot.role}
            </span>
            <span style={{ fontSize: 12, opacity: 0.9 }}>assigned</span>
            <button
              onClick={handleRelease}
              disabled={busy === 'release'}
              title="Release role"
              style={{
                width: 26, height: 26,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                cursor: busy === 'release' ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (busy !== 'release') e.currentTarget.style.background = 'rgba(255,255,255,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
            >
              {busy === 'release' ? '…' : '×'}
            </button>
          </div>
        </div>
      )}

      {openRoles.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF8E7 0%, #FFFBF0 100%)',
          border: '1.5px solid #F5C842',
          borderRadius: 14,
          padding: '12px 14px',
          width: '100%', boxSizing: 'border-box', minWidth: 0,
        }}>
          {/* Header row — text left, share button right */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 2, lineHeight: 1.3 }}>
                ⚡ Few roles are pending!
              </div>
              <div style={{ fontSize: 10, color: '#B45309', lineHeight: 1.4 }}>
                Step up and make the meeting great.
              </div>
            </div>
            <button
              onClick={handleShare}
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                borderRadius: 8,
                background: '#F5C842',
                color: '#78350F',
                border: 'none',
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              📣 {shareCopied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {/* Inline wrapping pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {openRoles.map(e => {
              const isLoading = busy === e.code
              const disabled = !!mySlot || !currentUid || isLoading
              return (
                <button
                  key={e.code}
                  onClick={() => !disabled && handlePick(e)}
                  disabled={disabled}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: isLoading ? '#FCD34D' : '#FEF3C7',
                    border: '1.5px solid #FCD34D',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#92400E',
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled && !isLoading ? 0.55 : 1,
                    transition: 'background 0.15s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onMouseEnter={e2 => { if (!disabled) e2.currentTarget.style.background = '#FDE68A' }}
                  onMouseLeave={e2 => { e2.currentTarget.style.background = isLoading ? '#FCD34D' : '#FEF3C7' }}
                >
                  {isLoading ? '⏳' : e.emoji} {isLoading ? 'Claiming…' : e.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 14 }}>
          {mySlot ? 'All roles this week' : 'Pick your role'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {GROUP_ORDER.map(group => {
            const color = GROUP_COLORS[group]
            const isMultiSlot = group === 'speakers' || group === 'evaluators'

            if (isMultiSlot && group === 'speakers') {
              // Speakers + paired Evaluators rendered together
              const speakerSlots  = slots.filter(s => s.group === 'speakers').sort((a, b) => a.order - b.order)
              const evalSlots     = slots.filter(s => s.group === 'evaluators').sort((a, b) => a.order - b.order)
              const spkrEntry     = ROLE_CATALOGUE.find(e => e.code === 'SPKR')!
              const evalEntry     = ROLE_CATALOGUE.find(e => e.code === 'EVAL')!
              const spkrColor     = GROUP_COLORS['speakers']
              const evalColor     = GROUP_COLORS['evaluators']

              // Build pairs by pairIndex, fall back to position index
              const pairCount = Math.max(speakerSlots.length, evalSlots.length)
              const pairs = Array.from({ length: pairCount }, (_, i) => ({
                speaker:   speakerSlots.find(s => s.pairIndex === i) ?? speakerSlots[i] ?? null,
                evaluator: evalSlots.find(s => s.pairIndex === i)    ?? evalSlots[i]    ?? null,
                index: i,
              }))

              const openSpeakers = speakerSlots.filter(s => !s.uid && !s.name).length

              const renderSlotCard = (slot: RoleSlot | null, entry: CatalogueEntry, groupColor: string, label: string) => {
                if (!slot) return null
                const ismine    = slot.uid === currentUid
                const isOpen    = !slot.uid && !slot.name
                const canClaim  = isOpen && !mySlot && !!currentUid
                const isSpeaker = entry.code === 'SPKR'
                const firstName = slot.name.split(/[\s@._-]+/)[0] || slot.name
                return (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    entry={entry}
                    groupColor={groupColor}
                    label={label}
                    ismine={ismine}
                    isOpen={isOpen}
                    canClaim={canClaim}
                    isSpeaker={isSpeaker}
                    firstName={firstName}
                    onClaim={() => setConfirmEntry({ entry, slotId: slot.id })}
                    onUpdateSlotField={onUpdateSlotField}
                    onGiveFeedback={!isOpen && !ismine && onGiveFeedback ? () => onGiveFeedback(slot) : undefined}
                    hasReviewed={hasReviewedSlot ? hasReviewedSlot(slot.id) : false}
                  />
                )
              }

              return (
                <div key="speakers-evaluators" style={{ minWidth: 0 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: spkrColor, flexShrink: 0 }} />
                      <div style={{ fontSize: 10, fontWeight: 800, color: spkrColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        Speakers & Evaluators
                      </div>
                      {openSpeakers > 0 && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: spkrColor + '18', color: spkrColor }}>
                          {openSpeakers} open
                        </span>
                      )}
                    </div>
                    {/* + Add pair button — admins only */}
                    {onAddSpeakerPair && isAdmin && (
                      <button
                        onClick={addingSlot === 'speakers' ? undefined : async () => {
                          setAddingSlot('speakers')
                          try { await onAddSpeakerPair() }
                          catch (err: any) { setError(err?.message ?? 'Could not add') }
                          finally { setAddingSlot(null) }
                        }}
                        style={{
                          padding: '4px 10px', borderRadius: 8,
                          background: addingSlot === 'speakers' ? '#E5E7EB' : spkrColor + '18',
                          border: `1.5px solid ${spkrColor}40`,
                          fontSize: 10, fontWeight: 700, color: spkrColor,
                          cursor: addingSlot === 'speakers' ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        {addingSlot === 'speakers' ? '⏳ Adding…' : '+ Add Speaker'}
                      </button>
                    )}
                  </div>

                  {/* Pairs list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pairs.map(({ speaker, evaluator, index }) => (
                      <div key={index} style={{
                        background: '#F9FAFB', borderRadius: 12,
                        border: '1px solid #F0F0F0', padding: '10px 12px',
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#C4BAB4', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                          Speech {index + 1}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {renderSlotCard(speaker, spkrEntry, spkrColor, 'Speaker')}
                          {renderSlotCard(evaluator, evalEntry, evalColor, 'Evaluator')}
                        </div>
                      </div>
                    ))}

                    {pairs.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '16px 0', color: '#9CA3AF', fontSize: 11 }}>
                        {isAdmin ? 'No speakers yet — tap "+ Add Speaker" to add the first one.' : 'No speakers added yet.'}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            // Skip evaluators group — rendered above with speakers
            if (isMultiSlot && group === 'evaluators') return null

            // roleTakers & tagl — catalogue-based; fixed roles always shown
            const entries = ROLE_CATALOGUE.filter(e => e.group === group)
            const openEntries  = entries.filter(e => {
              const ismine = !!mySlot && matchesEntry(mySlot.role, e)
              const isOpen = slots.some(s => matchesEntry(s.role, e) && !s.uid && !s.name)
              const isFixedNoSlot = e.fixed && !slots.some(s => matchesEntry(s.role, e))
              return ismine || isOpen || isFixedNoSlot
            })
            const takenEntries = entries.filter(e => {
              const ismine = !!mySlot && matchesEntry(mySlot.role, e)
              const isTaken = slots.some(s => matchesEntry(s.role, e) && !!(s.uid || s.name))
              return !ismine && isTaken
            })
            const openCount = openEntries.filter(e => !mySlot || !matchesEntry(mySlot.role, e)).length

            return (
              <div key={group} style={{ minWidth: 0 }}>
                {/* Group label row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {GROUP_LABELS[group]}
                  </div>
                  {openCount > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: color + '18', color }}>
                      {openCount} open
                    </span>
                  )}
                </div>

                {/* Single horizontal scroll — open first, divider, taken at right */}
                <div className="role-scroll" style={{
                  display: 'flex', gap: 8, overflowX: 'auto',
                  paddingBottom: 8, paddingRight: 16,
                  scrollbarWidth: 'none', alignItems: 'stretch',
                  WebkitOverflowScrolling: 'touch',
                } as React.CSSProperties}>
                  {openEntries.map(entry => (
                    <RoleCard key={entry.code} entry={entry} mySlot={mySlot} slots={slots} currentUid={currentUid} busy={busy} onPick={handlePick} />
                  ))}

                  {openEntries.length > 0 && takenEntries.length > 0 && (
                    <div style={{ flexShrink: 0, width: 1, margin: '4px 4px', background: '#E5E7EB', borderRadius: 1, alignSelf: 'stretch' }} />
                  )}

                  {takenEntries.map(entry => (
                    <RoleCard key={entry.code} entry={entry} mySlot={mySlot} slots={slots} currentUid={currentUid} busy={busy} onPick={handlePick} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: '#FFEBEE',
          color: '#B3261E',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {alreadyPickedFor && mySlot && (
        <AlreadyPickedModal
          currentRoleName={ROLE_CATALOGUE.find(e => matchesEntry(mySlot.role, e))?.name ?? mySlot.role}
          currentRoleEmoji={ROLE_CATALOGUE.find(e => matchesEntry(mySlot.role, e))?.emoji ?? '🎭'}
          wantedRoleName={alreadyPickedFor.name}
          wantedRoleEmoji={alreadyPickedFor.emoji}
          wantedRoleColor={GROUP_COLORS[alreadyPickedFor.group]}
          releaseBusy={busy === 'release'}
          onRelease={async () => {
            setBusy('release')
            try {
              await onRelease(mySlot.id)
              // After release, open the confirm modal for the new role
              const openSlot = slots.find(s => matchesEntry(s.role, alreadyPickedFor) && !s.uid && !s.name && s.id !== mySlot.id)
              if (openSlot) {
                setConfirmEntry({ entry: alreadyPickedFor, slotId: openSlot.id })
              }
            } catch (err: any) {
              setError(err?.message ?? 'Could not release role')
            } finally {
              setBusy(null)
              setAlreadyPickedFor(null)
            }
          }}
          onKeep={() => setAlreadyPickedFor(null)}
        />
      )}

      {confirmEntry && (
        <ConfirmRoleModal
          entry={confirmEntry.entry}
          displayName={displayName}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmEntry(null)}
        />
      )}

      {tmodEntry && (
        <TmodModal
          onConfirm={handleTmodConfirm}
          onCancel={() => setTmodEntry(null)}
        />
      )}

      {gramEntry && (
        <GramModal
          onConfirm={handleGramConfirm}
          onCancel={() => setGramEntry(null)}
        />
      )}

      {celebration && (
        <CelebrationModal
          roleName={celebration.roleName}
          displayName={displayName}
          meetingDate={meetingDate}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  )
}
