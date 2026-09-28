import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, updateDoc, doc, getDocs, query, limit } from 'firebase/firestore'
import { Pencil, X, Save, MapPin, Phone, Globe, Calendar, Clock, Users, Building2 } from 'lucide-react'
import type { ClubDetails } from '../types'

const emptyClub: ClubDetails = {
  clubName: '', clubNumber: '', district: '', division: '', area: '',
  charterDate: '', meetingDay: '', meetingTime: '', meetingMode: 'in-person',
  meetingLink: '', calendarInviteLink: '', phone: '', locationName: '',
  address: '', city: '', state: '', postalCode: '', country: '',
  membershipRestriction: '', website: '', facebookPage: '',
}

const IS = {
  padding: '9px 12px', borderRadius: 7, border: '1.5px solid #e5e7eb',
  fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', color: '#1f2937', background: '#f9fafb',
  width: '100%', transition: 'all 0.15s',
}
const onF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#6366f1'
  e.currentTarget.style.background = '#fff'
}
const onB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#e5e7eb'
  e.currentTarget.style.background = '#f9fafb'
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ color: '#9ca3af', marginTop: 1, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}

interface ClubDetailsFormProps {
  onSaved?: () => void
}

export default function ClubDetailsForm({ onSaved }: ClubDetailsFormProps) {
  const [club, setClub] = useState<ClubDetails>(emptyClub)
  const [draft, setDraft] = useState<ClubDetails>(emptyClub)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'club-details'), limit(1)))
        if (!snap.empty) {
          const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as ClubDetails
          setClub(data)
          setDraft(data)
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetch()
  }, [])

  const set = (field: keyof ClubDetails, value: string) => setDraft(d => ({ ...d, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    try {
      if (draft.id) {
        await updateDoc(doc(db, 'club-details', draft.id), { ...draft, updatedAt: new Date() })
      } else {
        const ref = await addDoc(collection(db, 'club-details'), { ...draft, createdAt: new Date(), updatedAt: new Date() })
        setDraft(d => ({ ...d, id: ref.id }))
      }
      setClub({ ...draft })
      setToast({ ok: true, msg: 'Saved!' })
      setEditing(false)
      onSaved?.()
    } catch {
      setToast({ ok: false, msg: 'Save failed. Try again.' })
    } finally { setSaving(false) }
  }

  const handleCancel = () => { setDraft(club); setEditing(false); setToast(null) }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>Loading…</div>

  const hasData = club.clubName || club.meetingDay || club.city || club.phone

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 14,
          background: toast.ok ? '#dcfce7' : '#fee2e2',
          color: toast.ok ? '#15803d' : '#991b1b',
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {!editing ? (
        /* ── VIEW MODE ── */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{club.clubName || 'Club Details'}</div>
              {club.clubNumber && <div style={{ fontSize: 12, color: '#9ca3af' }}>Club #{club.clubNumber}</div>}
            </div>
            <button
              onClick={() => { setDraft(club); setEditing(true) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff',
                fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151' }}
            >
              <Pencil size={13} /> Edit
            </button>
          </div>

          {!hasData ? (
            <div style={{
              textAlign: 'center', padding: '48px 20px',
              background: '#fff', border: '2px dashed #e5e7eb', borderRadius: 14,
            }}>
              <Building2 size={36} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No club details yet</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Add your club's information so members can find you.</div>
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '8px 20px', borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Set up club details
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {/* Identity */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Club Info</div>
                <InfoRow icon={<Building2 size={14} />} label="Name" value={club.clubName} />
                <InfoRow icon={<Users size={14} />} label="Number" value={club.clubNumber} />
                <InfoRow icon={<Users size={14} />} label="District · Division · Area" value={[club.district, club.division, club.area].filter(Boolean).join(' · ') || undefined} />
                {club.charterDate && <InfoRow icon={<Calendar size={14} />} label="Charter Date" value={new Date(club.charterDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />}
              </div>

              {/* Meeting */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Meetings</div>
                <InfoRow icon={<Clock size={14} />} label="Schedule" value={[club.meetingDay, club.meetingTime].filter(Boolean).join(', ') || undefined} />
                <InfoRow icon={<Users size={14} />} label="Mode" value={club.meetingMode} />
                {club.meetingLink && <InfoRow icon={<Globe size={14} />} label="Meeting Link" value={club.meetingLink} />}
                {club.calendarInviteLink && <InfoRow icon={<Calendar size={14} />} label="Calendar" value={club.calendarInviteLink} />}
              </div>

              {/* Location */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Location & Contact</div>
                <InfoRow icon={<MapPin size={14} />} label="Venue" value={club.locationName} />
                <InfoRow icon={<MapPin size={14} />} label="Address" value={[club.address, club.city, club.state, club.postalCode, club.country].filter(Boolean).join(', ') || undefined} />
                <InfoRow icon={<Phone size={14} />} label="Phone" value={club.phone} />
              </div>

              {/* Web */}
              {(club.website || club.facebookPage || club.membershipRestriction) && (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Online & Membership</div>
                  <InfoRow icon={<Globe size={14} />} label="Website" value={club.website} />
                  <InfoRow icon={<Globe size={14} />} label="Facebook" value={club.facebookPage} />
                  <InfoRow icon={<Users size={14} />} label="Membership" value={club.membershipRestriction} />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── EDIT MODE ── */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Edit Club Details</div>
            <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <X size={14} /> Cancel
            </button>
          </div>

          {/* Section: Basic */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Club Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              <Field label="Club Name">
                <input style={IS} value={draft.clubName} onChange={e => set('clubName', e.target.value)} placeholder="Dhwani Toastmasters" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Club Number">
                <input style={IS} value={draft.clubNumber} onChange={e => set('clubNumber', e.target.value)} placeholder="04410336" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="District">
                <input style={IS} value={draft.district} onChange={e => set('district', e.target.value)} placeholder="District 92" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Division">
                <input style={IS} value={draft.division} onChange={e => set('division', e.target.value)} placeholder="Division D" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Area">
                <input style={IS} value={draft.area} onChange={e => set('area', e.target.value)} placeholder="Area D04" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Charter Date">
                <input style={IS} type="date" value={draft.charterDate} onChange={e => set('charterDate', e.target.value)} onFocus={onF} onBlur={onB} />
              </Field>
            </div>
          </div>

          {/* Section: Meeting */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Meeting</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              <Field label="Day">
                <select style={IS} value={draft.meetingDay} onChange={e => set('meetingDay', e.target.value)} onFocus={onF} onBlur={onB}>
                  <option value="">Select day</option>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Time">
                <input style={IS} value={draft.meetingTime} onChange={e => set('meetingTime', e.target.value)} placeholder="3:00 pm – 5:00 pm" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Mode">
                <select style={IS} value={draft.meetingMode || 'in-person'} onChange={e => set('meetingMode', e.target.value)} onFocus={onF} onBlur={onB}>
                  <option value="in-person">In-person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>
              {(draft.meetingMode === 'online' || draft.meetingMode === 'hybrid') && (
                <Field label="Meeting Link">
                  <input style={IS} type="url" value={draft.meetingLink || ''} onChange={e => set('meetingLink', e.target.value)} placeholder="https://zoom.us/j/..." onFocus={onF} onBlur={onB} />
                </Field>
              )}
              <Field label="Calendar Invite">
                <input style={IS} type="url" value={draft.calendarInviteLink || ''} onChange={e => set('calendarInviteLink', e.target.value)} placeholder="Google Calendar / .ics URL" onFocus={onF} onBlur={onB} />
              </Field>
            </div>
          </div>

          {/* Section: Location */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Location & Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              <Field label="Venue Name">
                <input style={IS} value={draft.locationName} onChange={e => set('locationName', e.target.value)} placeholder="Transcend College" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Phone">
                <input style={IS} type="tel" value={draft.phone} onChange={e => set('phone', e.target.value)} placeholder="+918660454918" onFocus={onF} onBlur={onB} />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Street Address">
                  <input style={IS} value={draft.address} onChange={e => set('address', e.target.value)} placeholder="Post office Rd, Kumaraswamy Layout" onFocus={onF} onBlur={onB} />
                </Field>
              </div>
              <Field label="City">
                <input style={IS} value={draft.city} onChange={e => set('city', e.target.value)} placeholder="Bengaluru" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="State">
                <input style={IS} value={draft.state} onChange={e => set('state', e.target.value)} placeholder="Karnataka" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Postal Code">
                <input style={IS} value={draft.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="560078" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Country">
                <input style={IS} value={draft.country} onChange={e => set('country', e.target.value)} placeholder="India" onFocus={onF} onBlur={onB} />
              </Field>
            </div>
          </div>

          {/* Section: Online */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Online & Membership</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              <Field label="Website">
                <input style={IS} type="url" value={draft.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://example.com" onFocus={onF} onBlur={onB} />
              </Field>
              <Field label="Facebook Page">
                <input style={IS} type="url" value={draft.facebookPage || ''} onChange={e => set('facebookPage', e.target.value)} placeholder="https://facebook.com/yourpage" onFocus={onF} onBlur={onB} />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Membership Restriction">
                  <input style={IS} value={draft.membershipRestriction} onChange={e => set('membershipRestriction', e.target.value)} placeholder="Open to all" onFocus={onF} onBlur={onB} />
                </Field>
              </div>
            </div>
          </div>

          {/* Save bar */}
          <div style={{
            position: 'sticky', bottom: 0, left: 0, right: 0,
            background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(8px)',
            borderTop: '1px solid #e5e7eb', padding: '12px 0',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb',
                background: '#fff', fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: saving ? '#d1d5db' : '#6366f1',
                fontSize: 13, fontWeight: 700, color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Club Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
