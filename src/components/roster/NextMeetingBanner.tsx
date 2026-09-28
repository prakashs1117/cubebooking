import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import { useAttendance } from './useAttendance'
import { parseMeetingEndDate } from '../../lib/calendarUrl'
import type { MeetingDetails, RoleSlot } from '../../types'
import type { Timestamp } from 'firebase/firestore'

interface RosterDoc extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
}

const GROUP_COLOR: Record<string, string> = {
  roleTakers: '#D64A6A',
  tagl:       '#C89A14',
  speakers:   '#1A9E60',
  evaluators: '#3B82F6',
}

export function NextMeetingBanner() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [next, setNext] = useState<{ roster: RosterDoc; slot: RoleSlot } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user?.uid) { setLoaded(true); return }

    // Listen to all meetings, client-filter to find next upcoming + user's slot
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, async snap => {
      const now = new Date()
      const rosters: RosterDoc[] = snap.docs
        .map(d => ({ rosterId: d.id, ...d.data() } as RosterDoc))
        .filter(r => {
          if (!r.date) return false
          const end = parseMeetingEndDate(r.date, r.timing)
          // If date can't be parsed, include it — better to show than silently hide
          return end ? end >= now : true
        })
        .sort((a, b) => {
          const ea = parseMeetingEndDate(a.date, a.timing)
          const eb = parseMeetingEndDate(b.date, b.timing)
          // Unparseable dates go to end
          if (!ea && !eb) return 0
          if (!ea) return 1
          if (!eb) return -1
          return ea.getTime() - eb.getTime()
        })

      // For each upcoming roster (soonest first), find the first one where user has a slot
      let found = false
      for (const roster of rosters) {
        if (found) break
        await new Promise<void>(resolve => {
          const sq = query(
            collection(db, 'meetings', roster.rosterId, 'roleSlots'),
            where('uid', '==', user.uid),
          )
          const inner = onSnapshot(sq, slotSnap => {
            inner() // unsubscribe immediately after first result
            if (!slotSnap.empty) {
              setNext({ roster, slot: { id: slotSnap.docs[0].id, ...slotSnap.docs[0].data() } as RoleSlot })
              found = true
            }
            resolve()
          }, () => resolve())
        })
      }
      setLoaded(true)
    }, () => setLoaded(true))

    return unsub
  }, [user?.uid])

  if (!loaded || !next) return null

  const { roster, slot } = next
  const color = GROUP_COLOR[slot.group] ?? '#772432'
  const mode = roster.meetingMode ?? 'in-person'
  const modeIcon = mode === 'online' ? '💻' : mode === 'hybrid' ? '🔀' : '📍'

  return (
    <BannerWithAttendance
      roster={roster} slot={slot}
      color={color} modeIcon={modeIcon}
      onNavigate={() => navigate(`/roster/${roster.rosterId}`)}
    />
  )
}

// ── Inner component that can call useAttendance ───────────────────────────────
function BannerWithAttendance({
  roster, slot, color, modeIcon, onNavigate,
}: {
  roster: RosterDoc & { rosterId: string }
  slot: RoleSlot
  color: string
  modeIcon: string
  onNavigate: () => void
}) {
  const { user, profile } = useAuthContext()
  const { attending } = useAttendance(roster.rosterId, user?.uid, profile?.displayName || user?.email || '')

  // ── Shared badge ──────────────────────────────────────────────────────────
  const Badge = (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(145deg, ${color}, ${color}cc)`,
      boxShadow: `0 3px 10px ${color}44`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 7, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1 }}>
        MTG
      </span>
      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
        {roster.meetingNo}
      </span>
    </div>
  )

  return (
    <button
      onClick={onNavigate}
        style={{
          width: '100%', textAlign: 'left', boxSizing: 'border-box',
          background: `linear-gradient(135deg, ${color}16 0%, ${color}08 100%)`,
          border: `1.5px solid ${color}30`,
          borderRadius: 14, padding: '10px 12px',
          cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10,
          marginBottom: 12, transition: 'box-shadow 0.15s',
          fontFamily: 'inherit', position: 'relative', overflow: 'visible',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 14px ${color}22` }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
      >
        {/* ── Attending badge — top-right corner ── */}
        {attending.length > 0 && (
          <div style={{
            position: 'absolute', top: -9, right: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            background: color,
            borderRadius: 999,
            padding: '3px 8px 3px 5px',
            boxShadow: `0 2px 8px ${color}55`,
            border: '2px solid #fff',
          }}>
            {/* Overlapping mini avatars */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {attending.slice(0, 3).map((a, i) => {
                const initials = (a.displayName || '?')
                  .split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
                return (
                  <div key={a.uid} title={a.displayName} style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: `hsl(${(a.uid.charCodeAt(0) * 47) % 360}, 55%, 65%)`,
                    border: `1.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 6, fontWeight: 800, color: '#fff',
                    marginLeft: i === 0 ? 0 : -5,
                    position: 'relative', zIndex: 3 - i,
                  }}>
                    {initials}
                  </div>
                )
              })}
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {attending.length} going
            </span>
          </div>
        )}

        {Badge}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
            Your next meeting
          </div>
          {roster.date && (
            <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>
              {roster.date}{roster.timing ? ` · ${roster.timing}` : ''}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{
              background: `${color}20`, color, borderRadius: 999,
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
            }}>
              {slot.role}
            </span>
            {roster.location && (
              <span style={{ fontSize: 10, color: '#9ca3af' }}>
                {modeIcon} {roster.location}
              </span>
            )}
          </div>
        </div>

        <span style={{ fontSize: 16, color, flexShrink: 0, opacity: 0.5, alignSelf: 'center' }}>›</span>
    </button>
  )
}
