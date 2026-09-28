import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, query, limit, orderBy, writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { useAuthContext } from '../../context/AuthContext'
import { track } from '../../lib/analytics'
import type { ClubDetails } from '../../types'
import { DatePicker } from '../ui/DatePicker'
import { TimingPicker } from '../ui/TimingPicker'

const DEFAULT_ROLE_TAKERS = ['SAA', 'PO', 'TMOD', 'TTM', 'GE']
const DEFAULT_TAGL = ['TIMER', 'AHC', 'GRAM', 'LISTEN']

interface ExistingRoster { rosterId: string; date?: string; meetingNo?: string; club?: string }

export function CreateRosterModal({ onClose, existingRosters = [] }: { onClose: () => void; existingRosters?: ExistingRoster[] }) {
  const [form, setForm] = useState({
    club: '',
    sub: '',
    meetingNo: '',
    theme: '',
    wod: '',
    pod: '',
    date: '',
    timing: '',
    location: '',
    meetingMode: 'in-person' as 'in-person' | 'online' | 'hybrid',
    meetingLink: '',
    calendarInviteUrl: '',
  })
  const [speakerCount, setSpeakerCount] = useState<3 | 5>(3)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateRoster, setDuplicateRoster] = useState<ExistingRoster | null>(null)
  const [clubLoading, setClubLoading] = useState(true)
  const [existingLogo, setExistingLogo] = useState<{ logoURL: string; logoPublicId: string; logoVersion?: number }>({ logoURL: '', logoPublicId: '' })
  const { user } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const [clubSnap, meetingSnap] = await Promise.all([
          getDocs(query(collection(db, 'club-details'), limit(1))),
          getDocs(query(collection(db, 'meetings'), orderBy('createdAt', 'desc'), limit(1))),
        ])

        if (!clubSnap.empty) {
          const club = clubSnap.docs[0].data() as ClubDetails
          const sub = [club.area && `Area ${club.area}`, club.division && `Division ${club.division}`, club.district && `District ${club.district}`]
            .filter(Boolean)
            .join('  |  ')
          setForm(f => ({
            ...f,
            club: club.clubName ?? '',
            sub: sub,
            location: club.locationName ?? '',
          }))
        }

        if (!meetingSnap.empty) {
          const prev = meetingSnap.docs[0].data()
          if (prev.logoURL) {
            setExistingLogo({
              logoURL: prev.logoURL,
              logoPublicId: prev.logoPublicId ?? '',
              logoVersion: prev.logoVersion,
            })
          }
        }
      } catch {
        // silently fall through — admin can fill manually
      } finally {
        setClubLoading(false)
      }
    }
    fetchClub()
  }, [])

  const checkDuplicate = (date: string) => {
    if (!date) { setDuplicateRoster(null); return }
    const match = existingRosters.find(r => r.date === date)
    setDuplicateRoster(match ?? null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.club.trim() || !form.meetingNo.trim()) {
      setError('Club name and meeting number are required')
      return
    }
    if (duplicateRoster) {
      setError('A roster already exists for this date. Please edit the existing one.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const rosterRef = await addDoc(collection(db, 'meetings'), {
        ...form,
        logoURL: existingLogo.logoURL,
        logoPublicId: existingLogo.logoPublicId,
        ...(existingLogo.logoVersion !== undefined ? { logoVersion: existingLogo.logoVersion } : {}),
        createdAt: serverTimestamp(),
        createdBy: user?.uid ?? '',
      })

      const batch = writeBatch(db)
      const slotsCol = collection(db, 'meetings', rosterRef.id, 'roleSlots')
      let order = 0

      for (const role of DEFAULT_ROLE_TAKERS) {
        batch.set(doc(slotsCol), { group: 'roleTakers', role, order: order++, name: '', uid: null, claimedAt: null })
      }
      for (const role of DEFAULT_TAGL) {
        batch.set(doc(slotsCol), { group: 'tagl', role, order: order++, name: '', uid: null, claimedAt: null })
      }
      for (let i = 1; i <= speakerCount; i++) {
        batch.set(doc(slotsCol), { group: 'speakers', role: 'SPKR', order: order++, name: '', uid: null, claimedAt: null })
      }
      for (let i = 1; i <= speakerCount; i++) {
        batch.set(doc(slotsCol), { group: 'evaluators', role: 'EVAL', order: order++, name: '', uid: null, claimedAt: null })
      }

      await batch.commit()
      track({ name: 'roster_created', params: { roster_id: rosterRef.id, meeting_mode: form.meetingMode, speaker_count: speakerCount } })
      onClose()
      navigate(`/roster/${rosterRef.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create roster')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E6E2DE',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: '#F9FAFB',
    color: '#6B7280',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#6B6470',
    marginBottom: 6,
  }

  const fieldStyle: React.CSSProperties = { marginBottom: 16 }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 540,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Create New Roster</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9CA3AF' }}>All default roles will be added automatically</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#F3F4F6', border: 'none', cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Club info — pre-filled from club-details, read-only */}
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #E6E2DE' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#772432', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
              Club Info {clubLoading && <span style={{ fontWeight: 400, color: '#9CA3AF' }}>— loading…</span>}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Club name <span style={{ color: '#772432' }}>*</span></label>
              <input
                style={readOnlyInputStyle}
                value={form.club}
                readOnly
                placeholder="Loading from club details…"
              />
            </div>

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>Area / Division / District</label>
              <input
                style={readOnlyInputStyle}
                value={form.sub}
                readOnly
                placeholder="Loading from club details…"
              />
            </div>
          </div>

          {/* Meeting specifics */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
            Meeting Details
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Meeting number <span style={{ color: '#772432' }}>*</span></label>
            <input
              style={inputStyle}
              value={form.meetingNo}
              placeholder="e.g. 574"
              onChange={(e) => setForm(f => ({ ...f, meetingNo: e.target.value }))}
              onFocus={(e) => (e.target.style.borderColor = '#772432')}
              onBlur={(e) => (e.target.style.borderColor = '#E6E2DE')}
            />
          </div>

          <div style={fieldStyle}>
            <DatePicker
              label="Date"
              value={form.date}
              placeholder="Select meeting date"
              onChange={(v) => { setForm(f => ({ ...f, date: v })); checkDuplicate(v) }}
            />
            {duplicateRoster && (
              <div style={{
                marginTop: 8, padding: '10px 12px', borderRadius: 9,
                background: '#FFF7ED', border: '1.5px solid #FCD34D',
                display: 'flex', flexDirection: 'column', gap: 5,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>
                  ⚠️ A roster already exists for this date
                </div>
                <div style={{ fontSize: 11, color: '#78350F' }}>
                  Meeting #{duplicateRoster.meetingNo || '—'} already uses <strong>{duplicateRoster.date}</strong>. Please edit that roster instead of creating a new one.
                </div>
                <button
                  type="button"
                  onClick={() => { onClose(); navigate(`/roster/${duplicateRoster.rosterId}`) }}
                  style={{
                    alignSelf: 'flex-start', marginTop: 2,
                    padding: '5px 12px', borderRadius: 7,
                    background: '#F59E0B', border: 'none',
                    fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  }}
                >
                  Edit existing roster →
                </button>
              </div>
            )}
          </div>

          <div style={fieldStyle}>
            <TimingPicker
              label="Timing"
              value={form.timing}
              onChange={(v) => setForm(f => ({ ...f, timing: v }))}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Location</label>
            <input
              style={inputStyle}
              value={form.location}
              placeholder="Venue name"
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              onFocus={(e) => (e.target.style.borderColor = '#772432')}
              onBlur={(e) => (e.target.style.borderColor = '#E6E2DE')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Theme</label>
              <input
                style={inputStyle}
                value={form.theme}
                placeholder="Theme"
                onChange={(e) => setForm(f => ({ ...f, theme: e.target.value }))}
                onFocus={(e) => (e.target.style.borderColor = '#772432')}
                onBlur={(e) => (e.target.style.borderColor = '#E6E2DE')}
              />
            </div>
            <div>
              <label style={labelStyle}>WOD</label>
              <input
                style={inputStyle}
                value={form.wod}
                placeholder="Word of the Day"
                onChange={(e) => setForm(f => ({ ...f, wod: e.target.value }))}
                onFocus={(e) => (e.target.style.borderColor = '#772432')}
                onBlur={(e) => (e.target.style.borderColor = '#E6E2DE')}
              />
            </div>
            <div>
              <label style={labelStyle}>POD</label>
              <input
                style={inputStyle}
                value={form.pod}
                placeholder="Phrase of the Day"
                onChange={(e) => setForm(f => ({ ...f, pod: e.target.value }))}
                onFocus={(e) => (e.target.style.borderColor = '#772432')}
                onBlur={(e) => (e.target.style.borderColor = '#E6E2DE')}
              />
            </div>
          </div>

          {/* Meeting mode */}
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #E6E2DE' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
              Meeting Mode
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {(['in-person', 'online', 'hybrid'] as const).map(mode => {
                const active = form.meetingMode === mode
                const label = mode === 'in-person' ? '📍 In-person' : mode === 'online' ? '💻 Online' : '🔀 Hybrid'
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, meetingMode: mode }))}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${active ? '#772432' : '#E6E2DE'}`,
                      background: active ? '#FFF5F6' : '#fff',
                      color: active ? '#772432' : '#6B7280',
                      fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {(form.meetingMode === 'online' || form.meetingMode === 'hybrid') && (
              <div style={fieldStyle}>
                <label style={labelStyle}>Meeting link (Zoom / Meet / Teams)</label>
                <input
                  style={inputStyle}
                  type="url"
                  value={form.meetingLink}
                  placeholder="https://zoom.us/j/..."
                  onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = '#772432')}
                  onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
                />
              </div>
            )}

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>Calendar invite link <span style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>(optional — paste Google Calendar share link)</span></label>
              <input
                style={inputStyle}
                type="url"
                value={form.calendarInviteUrl}
                placeholder="https://calendar.google.com/event?eid=..."
                onChange={e => setForm(f => ({ ...f, calendarInviteUrl: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = '#772432')}
                onBlur={e => (e.target.style.borderColor = '#E6E2DE')}
              />
            </div>
          </div>

          {/* Speaker count */}
          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #E6E2DE' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
              Default Role Slots
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: '#374151', flex: 1 }}>
                <span style={{ fontWeight: 700 }}>Role Takers</span> — SAA, PO, TMOD, TTM, GE
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#D64A6A', background: '#D64A6A14', padding: '3px 10px', borderRadius: 6 }}>5 slots</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: '#374151', flex: 1 }}>
                <span style={{ fontWeight: 700 }}>TAG L</span> — Timer, AHC, Grammarian, Listening Post
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#C89A14', background: '#C89A1414', padding: '3px 10px', borderRadius: 6 }}>4 slots</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#374151', flex: 1 }}>
                <span style={{ fontWeight: 700 }}>Speakers</span> + <span style={{ fontWeight: 700 }}>Evaluators</span> — how many pairs?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([3, 5] as const).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSpeakerCount(n)}
                    style={{
                      padding: '6px 18px',
                      borderRadius: 8,
                      border: `1.5px solid ${speakerCount === n ? '#1A9E60' : '#E6E2DE'}`,
                      background: speakerCount === n ? '#1A9E6014' : '#fff',
                      color: speakerCount === n ? '#1A9E60' : '#6B7280',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
              Creates {speakerCount} Speaker + {speakerCount} Evaluator slots ({speakerCount * 2} total)
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#B3261E', padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || clubLoading || !!duplicateRoster}
            style={{
              width: '100%',
              padding: 12,
              background: '#772432',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: submitting || clubLoading || !!duplicateRoster ? 'not-allowed' : 'pointer',
              opacity: submitting || clubLoading || !!duplicateRoster ? 0.4 : 1,
            }}
          >
            {submitting ? 'Creating…' : 'Create Roster'}
          </button>
        </form>
      </div>
    </div>
  )
}
