import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { parseMeetingEndDate } from '../../lib/calendarUrl'
import type { MeetingDetails } from '../../types'
import type { Timestamp } from 'firebase/firestore'
import { GuestOnboardingModal } from './GuestOnboardingModal'

interface RosterDoc extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
}

const MODE_ICON: Record<string, string> = {
  'online': '💻',
  'hybrid': '🔀',
  'in-person': '📍',
}

/** Shown on the home page for unauthenticated visitors.
 *  Clicking either RSVP button sends them to /signup with returnTo + rsvp + intent params
 *  so the full flow completes automatically after they create an account. */
export function PublicNextMeetingTeaser() {
  const navigate = useNavigate()
  const [nextRoster, setNextRoster] = useState<RosterDoc | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // meetings collection is publicly readable — no auth needed
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const now = new Date()
      const upcoming = snap.docs
        .map(d => ({ rosterId: d.id, ...d.data() } as RosterDoc))
        .filter(r => {
          if (!r.date) return false
          const end = parseMeetingEndDate(r.date, r.timing)
          // If date parses but timing doesn't, parseMeetingEndDate returns end-of-day — still show it
          // Only exclude if date itself can't be parsed at all
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
  }, [])

  if (!loaded || !nextRoster) return null

  const mode = nextRoster.meetingMode ?? 'in-person'
  const modeIcon = MODE_ICON[mode] ?? '📍'

  const goToSignup = (intent: 'attending' | 'not-attending') => {
    const params = new URLSearchParams({
      returnTo: '/',
      rsvp: nextRoster.rosterId,
      intent,
    })
    navigate(`/signup?${params.toString()}`)
  }

  return (
    <>
    <div style={{
      background: '#fff',
      border: '1.5px solid #e6e2de',
      borderRadius: 16,
      padding: '16px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Inline row: date info + RSVP buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Left: date/time/location */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 2 }}>
              Next Meeting
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {nextRoster.date}
            </div>
            {nextRoster.timing && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{nextRoster.timing}</div>
            )}
            {nextRoster.location && (
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{modeIcon} {nextRoster.location}</div>
            )}
          </div>

          {/* Right: attend buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setShowOnboarding(true)}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: '2px solid #bbf7d0', background: '#dcfce7', color: '#166534',
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >✓ I'll be there</button>
            <button
              onClick={() => goToSignup('not-attending')}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: '2px solid #fecaca', background: '#fee2e2', color: '#991b1b',
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >✗ Can't make it</button>
          </div>
        </div>

        {/* Sign-in nudge */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate(`/signin?returnTo=${encodeURIComponent('/')}`)}
            style={{ color: '#772432', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign in
          </span>
        </div>

      </div>
    </div>

    <AnimatePresence>
      {showOnboarding && (
        <GuestOnboardingModal
          roster={nextRoster}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
