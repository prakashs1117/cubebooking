import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import { parseMeetingEndDate } from '../../lib/calendarUrl'
import { AWARD_CATEGORIES } from '../../lib/awardCategories'
import type { MeetingDetails } from '../../types'
import type { Timestamp } from 'firebase/firestore'
import { Award, Copy, Check, Lock, ChevronRight } from 'lucide-react'
import { ShareResultsButton } from './ShareResultsCard'

interface RosterDoc extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
}

interface WinnersMap { [categoryId: string]: string }

/** Returns start time as Date, or null */
function getMeetingStart(date: string, timing?: string): Date | null {
  if (!date) return null
  const startStr = timing ? timing.split(/[–—-]/)[0].trim() : undefined
  return parseMeetingEndDate(date, startStr ? `${startStr} – ${startStr}` : undefined)
}

/** Voting unlocks at start + 45 min */
function getUnlockTime(date: string, timing?: string): Date | null {
  const start = getMeetingStart(date, timing)
  return start ? new Date(start.getTime() + 45 * 60 * 1000) : null
}

/** Banner is shown from meeting start until end of the day after the meeting */
function isMeetingDay(date: string, timing?: string): boolean {
  const start = getMeetingStart(date, timing)
  if (!start) return false
  const now = new Date()
  const endOfNextDay = new Date(start)
  endOfNextDay.setDate(endOfNextDay.getDate() + 1)
  endOfNextDay.setHours(23, 59, 59, 999)
  return now >= start && now <= endOfNextDay
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
        border: '1.5px solid #E6E2DE', background: '#fff',
        color: copied ? '#166534' : '#6B7280',
        cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
        fontFamily: 'inherit',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

function WinnersList({ winners }: { winners: WinnersMap }) {
  const declared = AWARD_CATEGORIES.filter(c => winners[c.id])
  if (declared.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
      {declared.map(cat => (
        <div key={cat.id} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderRadius: 10,
          background: 'linear-gradient(90deg, #FEF3C7, #FDE68A44)',
          border: '1px solid #FCD34D',
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>{cat.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.4 }}>{cat.label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#78350F', marginTop: 1 }}>🏅 {winners[cat.id]}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function VotingBanner() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [roster, setRoster] = useState<RosterDoc | null>(null)
  const [frozen, setFrozen] = useState(false)
  const [winners, setWinners] = useState<WinnersMap>({})
  const [loaded, setLoaded] = useState(false)
  const [now, setNow] = useState(() => new Date())

  // Hide banner for guests (not logged in)
  if (!user) return null

  // Clock tick every 30s for time-lock accuracy
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Find the most recent meeting that falls on today/yesterday window
  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const found = snap.docs
        .map(d => ({ rosterId: d.id, ...d.data() } as RosterDoc))
        .find(r => r.date && isMeetingDay(r.date, r.timing))
      setRoster(found ?? null)
      setLoaded(true)
    }, () => setLoaded(true))
    return unsub
  }, [])

  // Listen to voting status (frozen)
  useEffect(() => {
    if (!roster) return
    const unsub = onSnapshot(
      doc(db, 'meetings', roster.rosterId, 'voting', 'status'),
      snap => setFrozen(snap.exists() ? snap.data()?.frozen === true : false)
    )
    return unsub
  }, [roster?.rosterId])

  // Listen to declared winners
  useEffect(() => {
    if (!roster) return
    const unsub = onSnapshot(
      doc(db, 'meetings', roster.rosterId, 'voting', 'winners'),
      snap => setWinners(snap.exists() ? (snap.data() as WinnersMap) : {})
    )
    return unsub
  }, [roster?.rosterId])

  if (!loaded || !roster) return null

  const unlockTime = getUnlockTime(roster.date, roster.timing)
  const timeLocked = unlockTime ? now < unlockTime : false
  const minutesUntilOpen = unlockTime
    ? Math.max(0, Math.ceil((unlockTime.getTime() - now.getTime()) / 60_000))
    : 0

  const voteUrl = `${window.location.origin}/roster/${roster.rosterId}/vote`
  const hasWinners = Object.keys(winners).length > 0

  // State derivation
  const state: 'time-locked' | 'open' | 'frozen-no-results' | 'frozen-results' =
    timeLocked ? 'time-locked'
    : frozen && hasWinners ? 'frozen-results'
    : frozen ? 'frozen-no-results'
    : 'open'

  const stateColor = {
    'time-locked':       { bg: '#FEF3C7', border: '#FCD34D', accent: '#92400E', pill: '#F59E0B' },
    'open':              { bg: '#F0FDF4', border: '#6EE7B7', accent: '#065F46', pill: '#10B981' },
    'frozen-no-results': { bg: '#F9FAFB', border: '#E5E7EB', accent: '#374151', pill: '#6B7280' },
    'frozen-results':    { bg: '#FFFBEB', border: '#FCD34D', accent: '#92400E', pill: '#F59E0B' },
  }[state]

  const stateLabel = {
    'time-locked':       `🔒 Opens in ${minutesUntilOpen > 0 ? `${minutesUntilOpen} min` : 'a moment'}`,
    'open':              '🗳 Voting is open',
    'frozen-no-results': '🔒 Voting closed',
    'frozen-results':    '🏆 Results are in!',
  }[state]

  return (
    <div style={{
      background: stateColor.bg,
      border: `1.5px solid ${stateColor.border}`,
      borderRadius: 16, padding: '14px 16px', marginBottom: 16,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: stateColor.pill,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {state === 'open' ? <Award size={17} color="#fff" /> : <Lock size={16} color="#fff" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: stateColor.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {stateLabel}
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>
            Meeting #{roster.meetingNo}{roster.date ? ` · ${roster.date}` : ''}
          </div>
        </div>
        <CopyLink url={voteUrl} />
      </div>

      {/* Results when frozen */}
      {(state === 'frozen-results') && <WinnersList winners={winners} />}

      {/* CTA row */}
      {state !== 'time-locked' && (
        <div style={{ display: 'flex', gap: 8, marginTop: hasWinners && frozen ? 12 : 0 }}>
          <button
            onClick={() => navigate(`/roster/${roster.rosterId}/vote`)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: state === 'open' ? '#772432' : '#1A1519',
              color: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            <Award size={14} />
            {state === 'open' ? 'Vote now' : 'View results'}
            <ChevronRight size={14} />
          </button>

          {/* Share button — only when results are declared */}
          {state === 'frozen-results' && (
            <ShareResultsButton
              winners={winners}
              meetingNo={roster.meetingNo || ''}
              date={roster.date || ''}
              clubName={roster.club || undefined}
              voteUrl={voteUrl}
            />
          )}
        </div>
      )}

      {/* Time-locked message */}
      {state === 'time-locked' && (
        <div style={{ fontSize: 12, color: '#92400E', textAlign: 'center', padding: '4px 0' }}>
          Browse nominees now — voting opens halfway through the meeting
        </div>
      )}
    </div>
  )
}
