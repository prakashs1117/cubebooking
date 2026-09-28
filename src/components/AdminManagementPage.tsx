import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Activity, Settings, ClipboardList, ChevronDown, ChevronUp, ShieldCheck, CalendarDays, Pencil, Plus, MessageSquare, Lightbulb, Bug, HelpCircle, Star, Trash2 } from 'lucide-react'
import AppHeader from './AppHeader'
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore'
import type { SpeakerFeedback } from '../types'
import { db } from '../firebase'
import { useAuthContext } from '../context/AuthContext'
import MembersPanel from './MembersPanel'
import RoleActivityPanel from './RoleActivityPanel'
import ClubDetailsForm from './ClubDetailsForm'
import { CreateRosterModal } from './roster/CreateRosterModal'
import type { Submission, MeetingDetails, FeedbackEntry } from '../types'
import type { Timestamp } from 'firebase/firestore'

type Tab = 'members' | 'submissions' | 'activity' | 'club' | 'rosters' | 'feedback' | 'speakerFeedback'

interface RosterSummary extends MeetingDetails {
  rosterId: string
  createdAt?: Timestamp
}

const ANSWER_LABELS: Record<string, string> = {
  goal: 'Goals', level: 'Experience', when: 'Availability',
  mode: 'Attendance', travel: 'From', source: 'Found us via', callTime: 'Call time',
}

function Chip({ text, purple }: { text: string; purple?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, marginRight: 4, marginBottom: 3,
      background: purple ? '#ede9fe' : '#dbeafe',
      color: purple ? '#5b21b6' : '#1e40af',
    }}>{text}</span>
  )
}

function SubmissionRow({ sub, index }: { sub: Submission; index: number }) {
  const [open, setOpen] = useState(false)
  const date = sub.submittedAt?.toDate?.()?.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) ?? '—'

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
      background: '#fff', marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: `hsl(${(index * 47) % 360}, 60%, 55%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          {sub.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{sub.name || '—'}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
            {sub.email}{sub.phone ? ` · ${sub.phone}` : ''}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginRight: 4 }}>{date}</div>
        {open ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12, marginTop: 12,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Contact</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8 }}>
                {sub.email && <div>📧 {sub.email}</div>}
                {sub.phone && <div>📱 +91 {sub.phone}</div>}
                {sub.city && <div>📍 {sub.city}</div>}
              </div>
            </div>
            {Object.entries(sub.answers || {}).map(([key, val]) => (
              <div key={key}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                  {ANSWER_LABELS[key] || key}
                </div>
                <div>
                  {Array.isArray(val)
                    ? val.map(v => <Chip key={v} text={v} purple />)
                    : <Chip text={val} />}
                </div>
              </div>
            ))}
            {sub.note && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Note</div>
                <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', padding: '8px 10px', borderRadius: 7, lineHeight: 1.6 }}>
                  {sub.note}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminManagementPage() {
  const { profile } = useAuthContext()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('members')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [rosters, setRosters] = useState<RosterSummary[]>([])
  const [latestRosterId, setLatestRosterId] = useState<string | undefined>()
  const [subSearch, setSubSearch] = useState('')
  const [showCreateRoster, setShowCreateRoster] = useState(false)
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([])
  const [feedbackSearch, setFeedbackSearch] = useState('')
  const [feedbackType, setFeedbackType] = useState<string>('all')
  const [confirmDeleteRosterId, setConfirmDeleteRosterId] = useState<string | null>(null)
  const [deleteRosterError, setDeleteRosterError] = useState<string | null>(null)
  const [speakerFbRosterId, setSpeakerFbRosterId] = useState<string>('')
  const [speakerFeedbacks, setSpeakerFeedbacks] = useState<SpeakerFeedback[]>([])
  const [speakerFbGroupFilter, setSpeakerFbGroupFilter] = useState<'all' | 'speakers' | 'tableTopics'>('all')

  useEffect(() => {
    const q = query(collection(db, 'toastmaster-onboarding'), orderBy('submittedAt', 'desc'))
    return onSnapshot(q, snap => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)))
    }, () => {})
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ rosterId: d.id, ...d.data() } as RosterSummary))
      setRosters(list)
      if (list.length > 0) setLatestRosterId(list[0].rosterId)
    }, () => {})
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('submittedAt', 'desc'))
    return onSnapshot(q, snap => {
      setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackEntry)))
    }, () => {})
  }, [])

  useEffect(() => {
    if (!speakerFbRosterId) { setSpeakerFeedbacks([]); return }
    const q = query(collection(db, 'meetings', speakerFbRosterId, 'speakerFeedback'), orderBy('submittedAt', 'desc'))
    return onSnapshot(q, snap => {
      setSpeakerFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() } as SpeakerFeedback)))
    }, () => {})
  }, [speakerFbRosterId])

  const isSuperAdmin = profile?.roles?.includes('super admin') ?? false

  const handleDeleteRoster = async (rosterId: string) => {
    setDeleteRosterError(null)
    try {
      await deleteDoc(doc(db, 'meetings', rosterId))
      setConfirmDeleteRosterId(null)
    } catch (err) {
      setDeleteRosterError(err instanceof Error ? err.message : 'Failed to delete roster')
    }
  }

  const filteredSubs = submissions.filter(s =>
    !subSearch ||
    s.name?.toLowerCase().includes(subSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(subSearch.toLowerCase()) ||
    s.city?.toLowerCase().includes(subSearch.toLowerCase())
  )

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchType = feedbackType === 'all' || f.type === feedbackType
    const matchSearch = !feedbackSearch ||
      f.message?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      f.name?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      f.email?.toLowerCase().includes(feedbackSearch.toLowerCase())
    return matchType && matchSearch
  })

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'members',         label: isSuperAdmin ? 'Roles' : 'Members', icon: isSuperAdmin ? <ShieldCheck size={16} /> : <Users size={16} /> },
    { id: 'rosters',         label: 'Rosters',         icon: <CalendarDays size={16} />, badge: rosters.length || undefined },
    { id: 'submissions',     label: 'Submissions',     icon: <ClipboardList size={16} />, badge: submissions.length || undefined },
    { id: 'feedback',        label: 'Feedback',        icon: <MessageSquare size={16} />, badge: feedbacks.length || undefined },
    { id: 'speakerFeedback', label: 'Speaker Feedback', icon: <Star size={16} /> },
    { id: 'activity',        label: 'Activity',        icon: <Activity    size={16} /> },
    { id: 'club',            label: 'Club',            icon: <Settings    size={16} /> },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
    }}>

      <AppHeader />

      {/* ─────────── TOP TAB BAR ─────────── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 62,
        zIndex: 19,
      }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto',
          padding: '10px 16px',
          overflowX: 'auto',
          scrollbarWidth: 'none' as any,
        }}>
          {/* Pill container */}
          <div style={{
            display: 'inline-flex',
            gap: 4,
            background: '#f1f5f9',
            borderRadius: 12,
            padding: 4,
            minWidth: 'max-content',
          }}>
            {tabs.map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 16px',
                    borderRadius: 9,
                    border: 'none',
                    background: active ? '#fff' : 'transparent',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                    color: active ? '#0f172a' : '#64748b',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.color = '#64748b'
                  }}
                >
                  <span style={{ color: active ? '#6366f1' : 'inherit', display: 'flex' }}>
                    {t.icon}
                  </span>
                  {t.label}
                  {t.badge ? (
                    <span style={{
                      background: active ? '#6366f1' : '#94a3b8',
                      color: '#fff',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 6px',
                      lineHeight: '15px',
                      minWidth: 18,
                      textAlign: 'center',
                      transition: 'background 0.15s',
                    }}>
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─────────── CONTENT ─────────── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 16px' }}>

        {/* Members */}
        {tab === 'members' && <MembersPanel />}

        {/* Submissions */}
        {tab === 'submissions' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <input
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                placeholder="Search name, email, city…"
                style={{
                  flex: 1, maxWidth: 340,
                  padding: '8px 12px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', background: '#fff',
                  color: '#0f172a',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
              <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {filteredSubs.length} / {submissions.length}
              </span>
            </div>

            {filteredSubs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  {subSearch ? 'No results' : 'No submissions yet'}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  {subSearch ? 'Try a different search' : 'Onboarding responses will appear here'}
                </div>
              </div>
            ) : (
              filteredSubs.map((sub, i) => <SubmissionRow key={sub.id} sub={sub} index={i} />)
            )}
          </>
        )}

        {/* Rosters */}
        {tab === 'rosters' && (
          <>
            {deleteRosterError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                {deleteRosterError}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {rosters.length} roster{rosters.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setShowCreateRoster(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  background: '#772432', color: '#fff',
                  border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Plus size={14} /> New Roster
              </button>
            </div>

            {rosters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No rosters yet</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Create the first meeting roster to get started.</div>
                <button
                  onClick={() => setShowCreateRoster(true)}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#772432', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  + Create roster
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rosters.map(roster => {
                  const created = roster.createdAt?.toDate?.()?.toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                  return (
                    <div
                      key={roster.rosterId}
                      style={{
                        background: '#fff', border: '1px solid #e2e8f0',
                        borderRadius: 12, padding: '12px 14px',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      {/* Date badge */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: '#f8f0f1', border: '1px solid #e8d5d8',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CalendarDays size={16} color="#772432" />
                        {roster.meetingNo && (
                          <div style={{ fontSize: 9, fontWeight: 800, color: '#772432', marginTop: 2 }}>#{roster.meetingNo}</div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {roster.meetingNo ? `Meeting #${roster.meetingNo}` : roster.club || 'Untitled Roster'}
                          {roster.date && (
                            <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b', background: '#f1f5f9', padding: '1px 7px', borderRadius: 5 }}>
                              {roster.date}
                            </span>
                          )}
                          {/* Mode badge */}
                          {(() => {
                            const m = roster.meetingMode ?? 'in-person'
                            const label = m === 'online' ? '💻 Online' : m === 'hybrid' ? '🔀 Hybrid' : '📍 In-person'
                            const bg = m === 'online' ? '#eff6ff' : m === 'hybrid' ? '#fff7ed' : '#f0fdf4'
                            const color = m === 'online' ? '#1e40af' : m === 'hybrid' ? '#92400e' : '#166534'
                            return (
                              <span style={{ fontSize: 10, fontWeight: 700, background: bg, color, padding: '1px 7px', borderRadius: 5 }}>
                                {label}
                              </span>
                            )
                          })()}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {[roster.timing, roster.location].filter(Boolean).join(' · ') || (created ? `Created ${created}` : '')}
                        </div>
                        {roster.theme && (
                          <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {roster.theme}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                        {confirmDeleteRosterId === roster.rosterId ? (
                          <>
                            <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600, whiteSpace: 'nowrap' }}>Delete?</span>
                            <button
                              onClick={() => handleDeleteRoster(roster.rosterId)}
                              style={{
                                padding: '5px 10px', borderRadius: 7,
                                border: 'none', background: '#dc2626',
                                fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer',
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteRosterId(null)}
                              style={{
                                padding: '5px 10px', borderRadius: 7,
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer',
                              }}
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/roster/${roster.rosterId}`)}
                              style={{
                                padding: '6px 12px', borderRadius: 8,
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                fontSize: 12, fontWeight: 700, color: '#374151',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#772432'; e.currentTarget.style.color = '#772432' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/roster/${roster.rosterId}`)}
                              style={{
                                padding: '6px 12px', borderRadius: 8,
                                border: 'none', background: '#772432',
                                fontSize: 12, fontWeight: 700, color: '#fff',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                              }}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() => setConfirmDeleteRosterId(roster.rosterId)}
                                style={{
                                  padding: '6px 10px', borderRadius: 8,
                                  border: '1.5px solid #fca5a5', background: '#fff5f5',
                                  color: '#dc2626', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center',
                                }}
                                title="Delete roster"
                                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Feedback */}
        {tab === 'feedback' && (
          <>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <input
                value={feedbackSearch}
                onChange={e => setFeedbackSearch(e.target.value)}
                placeholder="Search message, name, email…"
                style={{
                  flex: 1, minWidth: 180, maxWidth: 300,
                  padding: '8px 12px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 13,
                  outline: 'none', fontFamily: 'inherit', background: '#fff', color: '#0f172a',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
              {/* Type filter pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', 'feedback', 'suggestion', 'bug', 'other'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFeedbackType(t)}
                    style={{
                      padding: '5px 12px', borderRadius: 999,
                      border: feedbackType === t ? 'none' : '1.5px solid #e2e8f0',
                      background: feedbackType === t ? '#772432' : '#fff',
                      color: feedbackType === t ? '#fff' : '#64748b',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                {filteredFeedbacks.length} / {feedbacks.length}
              </span>
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  {feedbackSearch || feedbackType !== 'all' ? 'No results' : 'No feedback yet'}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  {feedbackSearch || feedbackType !== 'all'
                    ? 'Try a different search or filter'
                    : 'Feedback submitted via the app will appear here'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredFeedbacks.map((fb, i) => {
                  const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
                    feedback:   { icon: <MessageSquare size={14} />, color: '#6366f1', bg: '#eef2ff' },
                    suggestion: { icon: <Lightbulb size={14} />,    color: '#f59e0b', bg: '#fffbeb' },
                    bug:        { icon: <Bug size={14} />,          color: '#ef4444', bg: '#fef2f2' },
                    other:      { icon: <HelpCircle size={14} />,   color: '#64748b', bg: '#f8fafc' },
                  }
                  const tc = typeConfig[fb.type] ?? typeConfig.other
                  const date = (fb as any).submittedAt?.toDate?.()?.toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  }) ?? '—'

                  return (
                    <div
                      key={fb.id}
                      style={{
                        background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: 12, padding: '14px 16px',
                      }}
                    >
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${(i * 53) % 360}, 55%, 55%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: 14,
                        }}>
                          {fb.name?.[0]?.toUpperCase() ?? '?'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                            {fb.name || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>
                            {fb.email || 'No email'}{fb.uid ? ' · signed in' : ''}
                          </div>
                        </div>

                        {/* Type badge */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 999,
                          background: tc.bg, color: tc.color,
                          fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                          flexShrink: 0,
                        }}>
                          {tc.icon} {fb.type}
                        </span>

                        <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{date}</span>
                      </div>

                      {/* Rating */}
                      {fb.rating && (
                        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                          {[1,2,3,4,5].map(n => (
                            <Star
                              key={n}
                              size={13}
                              fill={n <= fb.rating! ? '#f59e0b' : 'none'}
                              color={n <= fb.rating! ? '#f59e0b' : '#d1d5db'}
                            />
                          ))}
                        </div>
                      )}

                      {/* Message */}
                      <div style={{
                        fontSize: 13, color: '#374151', lineHeight: 1.65,
                        background: '#f9fafb', borderRadius: 8,
                        padding: '10px 12px',
                      }}>
                        {fb.message}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Speaker Feedback */}
        {tab === 'speakerFeedback' && (
          <>
            {/* Roster selector */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={speakerFbRosterId}
                onChange={e => setSpeakerFbRosterId(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 13,
                  fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a',
                  minWidth: 220,
                }}
              >
                <option value="">Select a meeting…</option>
                {rosters.map(r => (
                  <option key={r.rosterId} value={r.rosterId}>
                    {r.meetingNo ? `#${r.meetingNo} ` : ''}{r.date || r.rosterId}{r.club ? ` — ${r.club}` : ''}
                  </option>
                ))}
              </select>

              {/* Group filter pills */}
              {speakerFbRosterId && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['all', 'speakers', 'tableTopics'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setSpeakerFbGroupFilter(g)}
                      style={{
                        padding: '5px 12px', borderRadius: 999,
                        border: speakerFbGroupFilter === g ? 'none' : '1.5px solid #e2e8f0',
                        background: speakerFbGroupFilter === g ? '#772432' : '#fff',
                        color: speakerFbGroupFilter === g ? '#fff' : '#64748b',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {g === 'all' ? 'All' : g === 'speakers' ? 'Speakers' : 'Table Topics'}
                    </button>
                  ))}
                </div>
              )}

              {speakerFbRosterId && (
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
                  {speakerFeedbacks.filter(f => speakerFbGroupFilter === 'all' || f.slotGroup === speakerFbGroupFilter).length} entries
                </span>
              )}
            </div>

            {!speakerFbRosterId ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Select a meeting</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Choose a meeting above to see speaker feedback</div>
              </div>
            ) : (() => {
              const filtered = speakerFeedbacks.filter(f => speakerFbGroupFilter === 'all' || f.slotGroup === speakerFbGroupFilter)
              const groupColor = (g: string) => g === 'speakers' ? '#1A9E60' : '#D97706'

              return filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No feedback yet</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Speaker feedback for this meeting will appear here</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((fb, i) => {
                    const color = groupColor(fb.slotGroup)
                    const date = (fb as any).submittedAt?.toDate?.()?.toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    }) ?? '—'
                    return (
                      <div key={fb.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: `hsl(${(i * 53) % 360}, 55%, 55%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 800, fontSize: 14,
                          }}>
                            {fb.reviewerName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                              {fb.reviewerName || 'Anonymous'} → <span style={{ color }}>{fb.speakerName}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>
                              {fb.slotGroup === 'speakers' ? 'Speaker' : 'Table Topics Speaker'}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                            background: color + '18', color, flexShrink: 0,
                          }}>
                            {fb.slotGroup === 'speakers' ? '🗣️ Speaker' : '🎤 Table Topics'}
                          </span>
                          <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={13} fill={n <= fb.rating ? '#f59e0b' : 'none'} color={n <= fb.rating ? '#f59e0b' : '#d1d5db'} />
                          ))}
                        </div>
                        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                          {fb.comment}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </>
        )}

        {/* Activity */}
        {tab === 'activity' && <RoleActivityPanel rosterId={latestRosterId} />}

        {/* Club */}
        {tab === 'club' && <ClubDetailsForm />}

      </div>

      {showCreateRoster && <CreateRosterModal onClose={() => setShowCreateRoster(false)} />}

      {/* Hide scrollbar on tab strip */}
      <style>{`
        [style*="scrollbarWidth"] { scrollbar-width: none; }
        [style*="scrollbarWidth"]::-webkit-scrollbar { display: none; }
        [style*="overflowX: auto"]::-webkit-scrollbar { display: none; }
        @media (min-width: 480px) { #signout-label { display: inline !important; } }
      `}</style>
    </div>
  )
}
