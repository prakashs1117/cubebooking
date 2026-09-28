import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, getDocs, limit } from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import { CreateRosterModal } from './CreateRosterModal'
import { useAttendance } from './useAttendance'
import { useMyRosterRole } from './useMyRosterRole'
import { NextMeetingBanner } from './NextMeetingBanner'
import { buildCalendarUrl, parseMeetingEndDate } from '../../lib/calendarUrl'
import { track } from '../../lib/analytics'
import AppHeader, { HeaderCreateButton } from '../AppHeader'
import type { MeetingDetails, ClubDetails, RoleSlot } from '../../types'
import type { Timestamp } from 'firebase/firestore'
import { AvatarStack } from './AvatarStack'

interface RosterSummary extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
  createdBy?: string
}

const MODE_LABEL: Record<string, string> = {
  'in-person': '📍 In-person',
  'online': '💻 Online',
  'hybrid': '🔀 Hybrid',
}
const MODE_COLOR: Record<string, { bg: string; color: string }> = {
  'in-person': { bg: '#F0FDF4', color: '#166534' },
  'online':    { bg: '#EFF6FF', color: '#1e40af' },
  'hybrid':    { bg: '#FFF7ED', color: '#92400e' },
}

const GROUP_COLOR: Record<string, string> = {
  roleTakers: '#D64A6A',
  tagl:       '#C89A14',
  speakers:   '#1A9E60',
  evaluators: '#3B82F6',
}

function formatClaimedAt(ts: Timestamp | undefined): string {
  if (!ts) return ''
  const d = ts.toDate()
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Per-card component so hooks aren't called conditionally ──────────────────
function RosterCard({
  roster, isAdmin, isPast, isMobile,
}: {
  roster: RosterSummary
  isAdmin: boolean
  isPast: boolean
  isMobile: boolean
}) {
  const { user, profile } = useAuthContext()
  const navigate = useNavigate()
  const mySlot = useMyRosterRole(roster.rosterId, user?.uid)
  const { myStatus, attending, notAttending, saving, setStatus } = useAttendance(
    roster.rosterId, user?.uid, profile?.displayName || user?.email || '', profile?.photoURL,
  )
  const [showNames, setShowNames] = useState(false)

  const mode = roster.meetingMode ?? 'in-person'
  const modeStyle = MODE_COLOR[mode] ?? MODE_COLOR['in-person']
  const calUrl = buildCalendarUrl(roster) ?? roster.calendarInviteUrl

  return (
    <div style={{
      background: isPast ? '#fafafa' : '#fff',
      border: `1px solid ${isPast ? '#e5e7eb' : '#E6E2DE'}`,
      borderRadius: 14,
      overflow: 'hidden',
      opacity: isPast ? 0.82 : 1,
      transition: 'box-shadow 0.15s',
    }}>

      {/* ── Past banner ── */}
      {isPast && (
        <div style={{
          background: '#f3f4f6', borderBottom: '1px solid #e5e7eb',
          padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Past meeting — view only
          </span>
        </div>
      )}

      <div style={{ padding: '12px 14px' }}>

        {/* ── Top row ── */}
        <div
          onClick={() => isMobile && navigate(`/roster/${roster.rosterId}`)}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: isMobile ? 'pointer' : 'default' }}
        >
          {/* Date block */}
          <div style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            background: isPast ? '#f1f5f9' : '#fff5f6',
            border: `1px solid ${isPast ? '#e2e8f0' : '#f3c0c8'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            {roster.meetingNo ? (
              <>
                <span style={{ fontSize: 8, fontWeight: 700, color: isPast ? '#94a3b8' : '#772432', textTransform: 'uppercase', letterSpacing: 0.5 }}>#</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: isPast ? '#64748b' : '#772432', lineHeight: 1 }}>{roster.meetingNo}</span>
              </>
            ) : (
              <span style={{ fontSize: 18 }}>📅</span>
            )}
          </div>

          {/* Main info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: isPast ? '#6b7280' : '#111827' }}>
                {roster.club || 'Meeting'} #{roster.meetingNo}
              </span>
              {roster.date && (
                <span style={{ background: isPast ? '#f1f5f9' : '#F3F0EE', color: '#6B6470', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5 }}>
                  {roster.date}
                </span>
              )}
              <span style={{ background: modeStyle.bg, color: modeStyle.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>
                {MODE_LABEL[mode]}
              </span>
            </div>

            {(roster.timing || roster.location) && (
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {[roster.timing, roster.location].filter(Boolean).join(' · ')}
              </p>
            )}
            {roster.theme && (
              <p style={{ margin: '2px 0 0', fontSize: 10, fontStyle: 'italic', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {roster.theme}
              </p>
            )}
          </div>

          {/* Open/Edit button — desktop */}
          {!isMobile && (
            <button
              onClick={() => navigate(`/roster/${roster.rosterId}`)}
              style={{
                padding: '6px 13px', flexShrink: 0,
                background: isPast ? '#f3f4f6' : '#772432',
                color: isPast ? '#6b7280' : '#fff',
                border: 'none', borderRadius: 9,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {isAdmin && !isPast ? 'Edit →' : 'View →'}
            </button>
          )}
        </div>

        {/* ── My role chip ── */}
        {mySlot && (
          <MyRoleChip slot={mySlot} isPast={isPast} />
        )}

        {/* ── Action links (join / calendar) — hide when past ── */}
        {!isPast && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: mySlot ? 8 : 10 }}>
            {(mode === 'online' || mode === 'hybrid') && roster.meetingLink && (
              <a
                href={roster.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track({ name: 'join_meeting_clicked', params: { roster_id: roster.rosterId, source: 'list' } })}
                style={{
                  padding: '5px 11px', borderRadius: 7,
                  background: '#1e40af', color: '#fff',
                  fontSize: 11, fontWeight: 700, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                💻 Join
              </a>
            )}
            {calUrl && (
              <a
                href={calUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track({ name: 'calendar_add_clicked', params: { roster_id: roster.rosterId, source: 'list' } })}
                style={{
                  padding: '5px 11px', borderRadius: 7,
                  border: '1px solid #e5e7eb', background: '#fff',
                  fontSize: 11, fontWeight: 700, color: '#374151',
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                📅 Calendar
              </a>
            )}
          </div>
        )}

        {/* ── RSVP row ── */}
        {user && (
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              {isPast ? (
                /* Past — show status read-only */
                myStatus ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999,
                    background: myStatus === 'attending' ? '#dcfce7' : '#fee2e2',
                    color: myStatus === 'attending' ? '#166534' : '#991b1b',
                  }}>
                    {myStatus === 'attending' ? '✓ You attended' : '✗ You didn\'t attend'}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>No RSVP recorded</span>
                )
              ) : myStatus === 'attending' ? (
                /* Confirmed attending — compact confirmation + edit */
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px', borderRadius: 999,
                    background: '#dcfce7', border: '1.5px solid #bbf7d0',
                    fontSize: 11, fontWeight: 700, color: '#166534',
                  }}>
                    ✓ See you on {roster.date}!
                  </span>
                  <button
                    onClick={() => setStatus('not-attending')}
                    disabled={saving}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '3px 8px', borderRadius: 999,
                      border: '1.5px solid #e5e7eb', background: '#fff',
                      fontSize: 10, fontWeight: 600, color: '#6b7280',
                      cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.5 : 1,
                    }}
                  >✎ Change</button>
                </div>
              ) : myStatus === 'not-attending' ? (
                /* Declined — compact with change option */
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px', borderRadius: 999,
                    background: '#fee2e2', border: '1.5px solid #fecaca',
                    fontSize: 11, fontWeight: 700, color: '#991b1b',
                  }}>
                    ✗ Not attending
                  </span>
                  <button
                    onClick={() => setStatus('attending')}
                    disabled={saving}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '3px 8px', borderRadius: 999,
                      border: '1.5px solid #e5e7eb', background: '#fff',
                      fontSize: 10, fontWeight: 600, color: '#6b7280',
                      cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.5 : 1,
                    }}
                  >✎ Change</button>
                </div>
              ) : (
                /* No RSVP yet — show both buttons */
                <>
                  <button
                    onClick={() => setStatus('attending')}
                    disabled={saving}
                    style={{
                      padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
                      cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
                    }}
                  >✓ I'll be there</button>
                  <button
                    onClick={() => setStatus('not-attending')}
                    disabled={saving}
                    style={{
                      padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280',
                      cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
                    }}
                  >✗ Can't make it</button>
                </>
              )}

              {/* Attendance summary + avatar stack */}
              {(attending.length > 0 || notAttending.length > 0) && (
                <button
                  onClick={() => setShowNames(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {attending.length > 0 && <AvatarStack attendees={attending} size={22} max={5} borderColor='#fff' />}
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                    {attending.length > 0 && <span style={{ color: '#166534' }}>{attending.length} attending</span>}
                    {attending.length > 0 && notAttending.length > 0 && <span style={{ color: '#d1d5db' }}> · </span>}
                    {notAttending.length > 0 && <span style={{ color: '#991b1b' }}>{notAttending.length} can't make it</span>}
                  </span>
                  <span style={{ fontSize: 10, color: '#d1d5db' }}>{showNames ? '▲' : '▼'}</span>
                </button>
              )}
            </div>

            {/* Expanded attendee name list */}
            {showNames && attending.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {attending.map(a => {
                  const ini = (a.displayName || '?').split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
                  return (
                    <div key={a.uid} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: 999, padding: '2px 8px 2px 3px',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                        background: `hsl(${(a.uid.charCodeAt(0) * 47) % 360}, 55%, 55%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 8,
                      }}>
                        {a.photoURL
                          ? <img src={a.photoURL} alt={a.displayName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { const img = e.currentTarget; img.style.display = 'none'; img.parentElement!.textContent = ini }} />
                          : ini}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#166534' }}>{a.displayName || 'Member'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Role chip with timestamp ─────────────────────────────────────────────────
function MyRoleChip({ slot, isPast }: { slot: RoleSlot; isPast: boolean }) {
  const color = GROUP_COLOR[slot.group] ?? '#6b7280'
  const claimedStr = formatClaimedAt(slot.claimedAt)
  return (
    <div style={{
      marginTop: 10,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: isPast ? '#f8f8f8' : `${color}10`,
      border: `1.5px solid ${isPast ? '#e5e7eb' : `${color}40`}`,
      borderRadius: 9, padding: '6px 10px',
    }}>
      {/* Colour dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: isPast ? '#d1d5db' : color,
      }} />

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: isPast ? '#9ca3af' : color, lineHeight: 1.2 }}>
          {isPast ? '✓ ' : ''}
          {slot.role}
        </div>
        {claimedStr && (
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
            {isPast ? 'was' : 'claimed'} · {claimedStr}
          </div>
        )}
      </div>

      {isPast && (
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#9ca3af',
          background: '#f1f5f9', padding: '1px 6px', borderRadius: 4,
          textTransform: 'uppercase', letterSpacing: 0.4,
        }}>Past</span>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function RosterListPage() {
  const [rosters, setRosters] = useState<RosterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [clubName, setClubName] = useState<string>('')
  const [vw, setVw] = useState(window.innerWidth)
  const [now] = useState(() => new Date())
  const { isAdmin } = useAuthContext()

  useEffect(() => {
    const fn = () => setVw(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  const isMobile = vw < 600

  useEffect(() => {
    getDocs(query(collection(db, 'club-details'), limit(1))).then(snap => {
      if (!snap.empty) setClubName((snap.docs[0].data() as ClubDetails).clubName ?? '')
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setRosters(snap.docs.map(d => ({ rosterId: d.id, ...d.data() } as RosterSummary)))
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ background: '#F4F3F1', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      <AppHeader
        title={clubName || 'Meeting Rosters'}
        subtitle="Your meetings, roles and attendance"
        right={isAdmin ? <HeaderCreateButton label="Create" onClick={() => setShowCreate(true)} /> : undefined}
      />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '12px' }}>
        {/* Next meeting banner — only for users who have a role claimed */}
        <NextMeetingBanner />

        {loading ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 13 }}>Loading…</div>
        ) : rosters.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <div style={{ fontSize: 36 }}>📅</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '12px 0 8px' }}>No rosters yet</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              {isAdmin ? "Click '+ Create' to get started." : 'Ask your admin to create the first meeting roster.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rosters.map(roster => {
              const endDate = roster.date ? parseMeetingEndDate(roster.date, roster.timing) : null
              const isPast = endDate ? endDate < now : false
              return (
                <RosterCard
                  key={roster.rosterId}
                  roster={roster}
                  isAdmin={isAdmin}
                  isPast={isPast}
                  isMobile={isMobile}
                />
              )
            })}
          </div>
        )}
      </div>

      {showCreate && <CreateRosterModal onClose={() => setShowCreate(false)} existingRosters={rosters} />}
    </div>
  )
}
