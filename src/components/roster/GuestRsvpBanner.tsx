import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import { useAttendance } from './useAttendance'
import { parseMeetingEndDate } from '../../lib/calendarUrl'
import type { MeetingDetails } from '../../types'
import type { Timestamp } from 'firebase/firestore'

interface RosterDoc extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
}

function RsvpButtons({ roster }: { roster: RosterDoc }) {
  const { user, profile } = useAuthContext()
  const { myStatus, attending, saving, setStatus } = useAttendance(
    roster.rosterId,
    user?.uid,
    profile?.displayName || user?.email || '',
  )

  // Auto-fire RSVP when user lands back after signup with ?rsvp=&intent= in the URL
  useEffect(() => {
    if (!user?.uid) return
    const params = new URLSearchParams(window.location.search)
    const rsvpId = params.get('rsvp')
    const intent = params.get('intent') as 'attending' | 'not-attending' | null
    if (rsvpId !== roster.rosterId || !intent) return
    if (myStatus) return // already set — don't override
    setStatus(intent)
    // Strip params from URL so refresh doesn't re-fire
    const clean = window.location.pathname
    window.history.replaceState(null, '', clean)
  }, [user?.uid, roster.rosterId, myStatus, setStatus])

  const isAttending = myStatus === 'attending'
  const isDeclined = myStatus === 'not-attending'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Header: attending status (only when decided) ── */}
      {(isAttending || isDeclined) && (
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
          color: isAttending ? '#166534' : '#991b1b',
        }}>
          {isAttending
            ? `✓ See you on ${roster.date}!${attending.length > 1 ? ` · ${attending.length} going` : ''}`
            : '✗ Not attending'}
        </div>
      )}

      {/* ── Inline row: date info + RSVP action ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Left: date/time/location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 2 }}>
            Next Meeting
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {roster.date}
          </div>
          {roster.timing && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{roster.timing}</div>
          )}
          {roster.location && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>📍 {roster.location}</div>
          )}
        </div>

        {/* Right: RSVP buttons */}
        {myStatus ? (
          <button
            onClick={() => setStatus(isAttending ? 'not-attending' : 'attending')}
            disabled={saving}
            style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >✎ Change</button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setStatus('attending')}
              disabled={saving}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: '2px solid #bbf7d0', background: '#dcfce7', color: '#166534',
                cursor: saving ? 'default' : 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >✓ I'll be there</button>
            <button
              onClick={() => setStatus('not-attending')}
              disabled={saving}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: '2px solid #fecaca', background: '#fee2e2', color: '#991b1b',
                cursor: saving ? 'default' : 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >✗ Can't make it</button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Shown on the home page for signed-in guests — lets them RSVP to the next meeting without seeing roster details. */
export function GuestRsvpBanner() {
  const { user } = useAuthContext()
  const [nextRoster, setNextRoster] = useState<RosterDoc | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) { setLoaded(true); return }
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const now = new Date()
      const upcoming = snap.docs
        .map(d => ({ rosterId: d.id, ...d.data() } as RosterDoc))
        .filter(r => {
          if (!r.date) return false
          const end = parseMeetingEndDate(r.date, r.timing)
          return end ? end >= now : true
        })
        .sort((a, b) => {
          const ea = parseMeetingEndDate(a.date, a.timing)
          const eb = parseMeetingEndDate(b.date, b.timing)
          return (ea?.getTime() ?? 0) - (eb?.getTime() ?? 0)
        })
      setNextRoster(upcoming[0] ?? null)
      setLoaded(true)
    }, () => setLoaded(true))
    return unsub
  }, [user])

  if (!loaded || !nextRoster) return null

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e6e2de',
      borderRadius: 16,
      padding: '16px',
      marginBottom: 16,
    }}>
      <RsvpButtons roster={nextRoster} />
    </div>
  )
}
