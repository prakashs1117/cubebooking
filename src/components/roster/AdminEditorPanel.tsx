import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp, Trash2, Info, Plus, User, Search, Pencil } from 'lucide-react'
import { validateImageFile, uploadProfileImage } from '../../lib/cloudinary'
import type { MeetingDetails, RoleSlot, RoleGroup } from '../../types'
import { ROLE_CATALOGUE, matchesEntry } from '../../lib/roleCatalogue'
import { DatePicker } from '../ui/DatePicker'
import { TimingPicker } from '../ui/TimingPicker'
import { WordDetailPopup } from './WordDetailPopup'

type WordField = 'wod' | 'pod' | 'theme'

export interface ClubUser {
  uid: string
  displayName: string
  photoURL?: string
}

interface AdminEditorPanelProps {
  meeting: MeetingDetails
  slots: RoleSlot[]
  rosterId?: string
  isSuperAdmin?: boolean
  users?: ClubUser[]
  onUpdateMeeting: (patch: Partial<MeetingDetails>) => Promise<void>
  onAddSlot: (group: RoleGroup, role: string) => Promise<void>
  onRemoveSlot: (slotId: string) => Promise<void>
  onUpdateSlotName: (slotId: string, name: string) => Promise<void>
  onAdminOverride?: (slotId: string, name: string, uid: string | null) => Promise<void>
  onAddSpeakerPair?: () => Promise<void>
  onUpdateSlotField?: (slotId: string, fields: { speechTopic?: string; pathwaysLevel?: string }) => Promise<void>
  onResetForNewWeek: () => Promise<void>
}

const GROUP_LABELS: Record<RoleGroup, string> = {
  roleTakers: 'Role Takers',
  tagl: 'TAGL',
  speakers: 'Speakers',
  evaluators: 'Evaluators',
  tableTopics: 'Table Topics Speakers',
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6470' }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #E6E2DE',
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#772432')}
        onBlur={(e) => (e.currentTarget.style.borderColor = '#E6E2DE')}
      />
    </label>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  editing?: boolean
  onEdit?: () => void
  onSave?: () => void
  summary?: React.ReactNode
}

function Section({ title, children, editing, onEdit, onSave, summary }: SectionProps) {
  const [expanded, setExpanded] = useState(false)
  const hasEditMode = onEdit !== undefined

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${editing ? '#772432' : '#E6E2DE'}`, marginBottom: 16, transition: 'border-color 0.2s' }}>
      <div
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: editing ? '#FFF5F6' : 'none',
          transition: 'background 0.2s',
        }}
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10, flex: 1, textAlign: 'left', minWidth: 0 }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1 }}>{title}</div>
          {expanded ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
        </button>
        {hasEditMode && (
          editing ? (
            <button
              onClick={onSave}
              style={{
                padding: '5px 14px', borderRadius: 7, border: 'none',
                background: '#772432', color: '#fff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              }}
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => { setExpanded(true); onEdit!() }}
              style={{
                padding: '5px 12px', borderRadius: 7,
                border: '1px solid #E6E2DE', background: '#fff', color: '#374151',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Pencil size={12} /> Edit
            </button>
          )
        )}
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${editing ? '#FFE4E8' : '#F3F4F6'}` }}>
          {/* View summary shown when not editing */}
          {!editing && summary && (
            <div style={{ padding: '10px 16px 12px' }}>{summary}</div>
          )}
          {/* Edit form shown when editing */}
          {editing && (
            <div style={{ padding: '12px 16px 16px' }}>{children}</div>
          )}
          {/* Sections without edit mode always show children */}
          {!hasEditMode && (
            <div style={{ padding: '12px 16px 16px' }}>{children}</div>
          )}
        </div>
      )}
    </div>
  )
}

function ViewRow({ label, value, empty }: { label: string; value?: string; empty?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', minWidth: 90, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: value ? '#111827' : '#9CA3AF', flex: 1 }}>
        {value || empty || '—'}
      </span>
    </div>
  )
}

export function AdminEditorPanel({
  meeting,
  slots,
  rosterId,
  isSuperAdmin = false,
  users = [],
  onUpdateMeeting,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlotName: _onUpdateSlotName,
  onAdminOverride,
  onAddSpeakerPair,
  onUpdateSlotField,
  onResetForNewWeek,
}: AdminEditorPanelProps) {
  const [_logoPreview, setLogoPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [wordPopup, setWordPopup] = useState<{ field: WordField; word: string; label: string; raw: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const startEdit = (section: string) => setEditingSection(section)
  const saveSection = () => setEditingSection(null)

  const handleUpdateMeeting = (key: keyof MeetingDetails, value: string) => {
    setBusy(null)
    setError(null)
    onUpdateMeeting({ [key]: value }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Update failed')
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setLogoPreview(URL.createObjectURL(file))
    setBusy('logo')

    try {
      const { url, publicId, version } = await uploadProfileImage(file)
      await onUpdateMeeting({
        logoURL: url,
        logoPublicId: publicId,
        logoVersion: version,
      })
      setLogoPreview(null)
    } catch (err) {
      setLogoPreview(null)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(null)
    }
  }

  const handleRemoveLogo = () => {
    setError(null)
    setBusy('logo')
    onUpdateMeeting({ logoURL: '', logoPublicId: '', logoVersion: undefined })
      .catch((err) => setError(err instanceof Error ? err.message : 'Remove failed'))
      .finally(() => setBusy(null))
  }

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReset = () => setShowResetConfirm(true)

  const handleResetConfirmed = () => {
    setShowResetConfirm(false)
    setBusy('reset')
    setError(null)
    onResetForNewWeek()
      .catch((err) => setError(err instanceof Error ? err.message : 'Reset failed'))
      .finally(() => setBusy(null))
  }

  const handleAddSlot = (group: RoleGroup, role: string = '') => {
    setBusy(null)
    setError(null)
    onAddSlot(group, role).catch((err) => {
      setError(err instanceof Error ? err.message : 'Add slot failed')
    })
  }

  const handleRemoveSlot = (slotId: string) => {
    setBusy(null)
    setError(null)
    onRemoveSlot(slotId).catch((err) => {
      setError(err instanceof Error ? err.message : 'Remove slot failed')
    })
  }


  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Admin controls</div>

      <Section
        title="Meeting header"
        editing={editingSection === 'header'}
        onEdit={() => startEdit('header')}
        onSave={saveSection}
        summary={
          <>
            <ViewRow label="Club" value={meeting.club} empty="Not set" />
            <ViewRow label="Sub" value={meeting.sub} empty="Not set" />
            <ViewRow label="Meeting #" value={meeting.meetingNo} empty="Not set" />
            {meeting.logoURL && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', minWidth: 90 }}>Logo</span>
                <img src={meeting.logoURL} alt="club logo" style={{ height: 28, borderRadius: 4, border: '1px solid #E6E2DE' }} />
              </div>
            )}
          </>
        }
      >
        <TextInput
          label="Club name"
          value={meeting.club}
          onChange={(v) => handleUpdateMeeting('club', v)}
          placeholder="Club name"
        />
        <TextInput
          label="Area / Division / District"
          value={meeting.sub}
          onChange={(v) => handleUpdateMeeting('sub', v)}
          placeholder="AREA | DIVISION | DISTRICT"
        />
        <TextInput
          label="Meeting number"
          value={meeting.meetingNo}
          onChange={(v) => handleUpdateMeeting('meetingNo', v)}
          placeholder="573"
        />

        {/* Logo upload */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 6 }}>
            Club logo
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={busy === 'logo'}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #E6E2DE',
                background: '#F9FAFB',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                cursor: busy === 'logo' ? 'not-allowed' : 'pointer',
                opacity: busy === 'logo' ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {busy === 'logo' ? 'Uploading…' : meeting.logoURL ? 'Change logo' : 'Upload logo'}
            </button>
            {meeting.logoURL && (
              <button
                onClick={handleRemoveLogo}
                disabled={busy === 'logo'}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: busy === 'logo' ? 'not-allowed' : 'pointer',
                  opacity: busy === 'logo' ? 0.6 : 1,
                }}
              >
                <Trash2 size={14} color="#B3261E" />
              </button>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: 'none' }}
          />
        </div>
      </Section>

      <Section
        title="Meeting details"
        editing={editingSection === 'details'}
        onEdit={() => startEdit('details')}
        onSave={saveSection}
        summary={
          <>
            <ViewRow label="Theme" value={meeting.theme} empty="Not set" />
            <ViewRow label="WOD" value={meeting.wod ? meeting.wod.split('\n')[0] : undefined} empty="Not set" />
            <ViewRow label="POD" value={meeting.pod ? meeting.pod.split('\n')[0] : undefined} empty="Not set" />
          </>
        }
      >
        <TextInput
          label="Theme"
          value={meeting.theme}
          onChange={(v) => handleUpdateMeeting('theme', v)}
          placeholder="Theme"
        />

        {/* WOD */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 6 }}>
            Word of the Day (WOD)
          </span>
          {isSuperAdmin ? (
            <textarea
              value={meeting.wod}
              onChange={e => handleUpdateMeeting('wod', e.target.value)}
              placeholder="Word&#10;Definition or extra details…"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #E6E2DE',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
          ) : meeting.wod ? (
            <button
              type="button"
              onClick={() => setWordPopup({ field: 'wod', word: meeting.wod.split('\n')[0] ?? '', label: 'Word of the Day', raw: meeting.wod })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                border: '1px solid #E6E2DE', background: '#F9FAFB',
                cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#772432'; e.currentTarget.style.background = '#FFF5F6' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6E2DE'; e.currentTarget.style.background = '#F9FAFB' }}
            >
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {meeting.wod.split('\n')[0]}
              </span>
              {meeting.wod.includes('\n') && <Info size={14} color="#772432" />}
            </button>
          ) : (
            <div style={{ padding: '10px 12px', borderRadius: 10, border: '1px dashed #E6E2DE', fontSize: 13, color: '#9CA3AF' }}>
              Not set — will be filled by Grammarian
            </div>
          )}
        </div>

        {/* POD */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 6 }}>
            Phrase of the Day (POD)
          </span>
          {isSuperAdmin ? (
            <textarea
              value={meeting.pod}
              onChange={e => handleUpdateMeeting('pod', e.target.value)}
              placeholder="Phrase&#10;Meaning or extra details…"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #E6E2DE',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
          ) : meeting.pod ? (
            <button
              type="button"
              onClick={() => setWordPopup({ field: 'pod', word: meeting.pod.split('\n')[0] ?? '', label: 'Phrase of the Day', raw: meeting.pod })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                border: '1px solid #E6E2DE', background: '#F9FAFB',
                cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#772432'; e.currentTarget.style.background = '#FFF5F6' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6E2DE'; e.currentTarget.style.background = '#F9FAFB' }}
            >
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {meeting.pod.split('\n')[0]}
              </span>
              {meeting.pod.includes('\n') && <Info size={14} color="#772432" />}
            </button>
          ) : (
            <div style={{ padding: '10px 12px', borderRadius: 10, border: '1px dashed #E6E2DE', fontSize: 13, color: '#9CA3AF' }}>
              Not set — will be filled by Grammarian
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Date & location"
        editing={editingSection === 'date'}
        onEdit={() => startEdit('date')}
        onSave={saveSection}
        summary={
          <>
            <ViewRow label="Date" value={meeting.date} empty="Not set" />
            <ViewRow label="Timing" value={meeting.timing} empty="Not set" />
            <ViewRow label="Location" value={meeting.location} empty="Not set" />
          </>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <DatePicker
            label="Date"
            value={meeting.date}
            placeholder="Select meeting date"
            onChange={(v) => handleUpdateMeeting('date', v)}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <TimingPicker
            label="Timing"
            value={meeting.timing}
            onChange={(v) => handleUpdateMeeting('timing', v)}
          />
        </div>
        <TextInput
          label="Location"
          value={meeting.location}
          onChange={(v) => handleUpdateMeeting('location', v)}
          placeholder="Location"
        />
      </Section>

      <Section
        title="Meeting mode & links"
        editing={editingSection === 'mode'}
        onEdit={() => startEdit('mode')}
        onSave={saveSection}
        summary={
          <>
            <ViewRow label="Mode" value={meeting.meetingMode === 'online' ? '💻 Online' : meeting.meetingMode === 'hybrid' ? '🔀 Hybrid' : '📍 In-person'} />
            {meeting.meetingLink && <ViewRow label="Meeting link" value={meeting.meetingLink} />}
            {meeting.calendarInviteUrl && <ViewRow label="Calendar" value={meeting.calendarInviteUrl} />}
          </>
        }
      >
        {/* Mode toggle */}
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6470', display: 'block', marginBottom: 8 }}>Mode</span>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['in-person', 'online', 'hybrid'] as const).map(mode => {
            const active = (meeting.meetingMode ?? 'in-person') === mode
            const label = mode === 'in-person' ? '📍 In-person' : mode === 'online' ? '💻 Online' : '🔀 Hybrid'
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleUpdateMeeting('meetingMode', mode)}
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

        {(meeting.meetingMode === 'online' || meeting.meetingMode === 'hybrid') && (
          <TextInput
            label="Meeting link (Zoom / Meet / Teams)"
            value={meeting.meetingLink ?? ''}
            onChange={(v) => handleUpdateMeeting('meetingLink', v)}
            placeholder="https://zoom.us/j/..."
          />
        )}

        <TextInput
          label="Calendar invite link (optional)"
          value={meeting.calendarInviteUrl ?? ''}
          onChange={(v) => handleUpdateMeeting('calendarInviteUrl', v)}
          placeholder="https://calendar.google.com/event?eid=..."
        />
      </Section>

      {/* Role Takers & TAGL — catalogue-driven toggles */}
      {(['roleTakers', 'tagl'] as RoleGroup[]).map((group) => (
        <CatalogueRoleGroup
          key={group}
          group={group}
          slots={slots.filter((s) => s.group === group)}
          users={users}
          onEnable={(code) => onAddSlot(group, code)}
          onDisable={handleRemoveSlot}
          onAssign={onAdminOverride}
        />
      ))}

      {/* Table Topics Speakers — TTM adds anyone: club members or guests, multiple at a time */}
      <TableTopicsSpeakers
        slots={slots}
        users={users}
        onAdd={() => handleAddSlot('tableTopics', 'TTS')}
        onRemove={handleRemoveSlot}
        onAssign={onAdminOverride}
      />

      {/* Speakers & Evaluators — paired */}
      <SpeakerEvaluatorPairs
        slots={slots}
        users={users}
        onAddPair={onAddSpeakerPair ?? (async () => { handleAddSlot('speakers') })}
        onRemove={handleRemoveSlot}
        onAssign={onAdminOverride}
        onUpdateSlotField={onUpdateSlotField}
      />

      <button
        onClick={handleReset}
        disabled={busy === 'reset'}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: 10,
          background: 'none',
          color: '#B3261E',
          fontSize: 12,
          fontWeight: 700,
          border: '1.5px solid #FECACA',
          cursor: busy === 'reset' ? 'not-allowed' : 'pointer',
          opacity: busy === 'reset' ? 0.6 : 1,
          marginBottom: 16,
          transition: 'opacity 0.2s, background 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
        onMouseEnter={e => { if (busy !== 'reset') (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
      >
        <Trash2 size={13} />
        {busy === 'reset' ? 'Deleting…' : 'Delete this Roster'}
      </button>

      {/* Delete confirmation modal */}
      {showResetConfirm && (
        <div
          onClick={() => setShowResetConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 18, width: '100%', maxWidth: 360,
              boxShadow: '0 24px 60px rgba(0,0,0,0.22)', overflow: 'hidden',
            }}
          >
            {/* Red top bar */}
            <div style={{ height: 4, background: '#DC2626' }} />
            <div style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🗑️</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                Delete this Roster?
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, margin: '0 0 6px' }}>
                This will permanently clear <strong>all role assignments, speaker details, topics, and evaluator pairings</strong> from this roster.
              </p>
              <p style={{ fontSize: 11, color: '#B3261E', fontWeight: 600, margin: '0 0 20px' }}>
                ⚠️ This cannot be undone. All existing data will be lost.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: '1.5px solid #E6E2DE', background: '#fff',
                    fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetConfirmed}
                  style={{
                    flex: 2, padding: '10px 0', borderRadius: 10,
                    border: 'none', background: '#DC2626',
                    fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  }}
                >
                  Yes, delete everything
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px',
            borderRadius: 10,
            background: '#FFEBEE',
            color: '#B3261E',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {wordPopup && rosterId && (
        <WordDetailPopup
          rosterId={rosterId}
          field={wordPopup.field}
          word={wordPopup.word}
          label={wordPopup.label}
          rawValue={wordPopup.raw}
          currentUid={undefined}
          isAdmin
          onSave={async (newRaw) => {
            await onUpdateMeeting({ [wordPopup.field]: newRaw })
            setWordPopup(prev => prev ? { ...prev, raw: newRaw, word: newRaw.split('\n')[0] ?? '' } : null)
          }}
          onClose={() => setWordPopup(null)}
        />
      )}
    </div>
  )
}

const GROUP_COLORS: Record<RoleGroup, string> = {
  roleTakers: '#D64A6A',
  tagl: '#C89A14',
  speakers: '#1A9E60',
  evaluators: '#3B82F6',
  tableTopics: '#D97706',
}

interface CatalogueRoleGroupProps {
  group: RoleGroup
  slots: RoleSlot[]
  users: ClubUser[]
  onEnable: (code: string) => Promise<void>
  onDisable: (slotId: string) => void
  onAssign?: (slotId: string, name: string, uid: string | null) => Promise<void>
}

function CatalogueRoleGroup({ group, slots, users, onEnable, onDisable, onAssign }: CatalogueRoleGroupProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const entries = ROLE_CATALOGUE.filter(e => e.group === group)
  const color = GROUP_COLORS[group]

  return (
    <Section title={GROUP_LABELS[group]}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map(entry => {
          const slot = slots.find(s => matchesEntry(s.role, entry))
          const isOn = !!slot
          const isClaimed = !!(slot?.uid || slot?.name)
          const isLoading = busy === entry.code

          const toggle = async () => {
            if (isLoading) return
            if (isOn) {
              if (isClaimed) return
              setBusy(entry.code)
              try { onDisable(slot!.id) } finally { setBusy(null) }
            } else {
              setBusy(entry.code)
              try { await onEnable(entry.code) } finally { setBusy(null) }
            }
          }

          return (
            <div key={entry.code} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Toggle row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: isOn && onAssign ? '10px 10px 0 0' : 10,
                  border: `1.5px solid ${isOn ? color + '50' : '#E6E2DE'}`,
                  borderBottom: isOn && onAssign ? 'none' : undefined,
                  background: isOn ? color + '08' : '#F9FAFB',
                  transition: 'border-color 0.15s, background 0.15s',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{entry.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111827', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.name}
                </span>
                {isClaimed ? (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {slot!.name.split(/[\s@._-]+/)[0] || 'Claimed'}
                  </span>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#DCFCE7', color: '#166534', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Open
                  </span>
                )}
                <button
                  onClick={toggle}
                  disabled={isClaimed || isLoading}
                  title={isClaimed ? 'Release the role before disabling' : isOn ? 'Disable role' : 'Enable role'}
                  style={{
                    flexShrink: 0, width: 44, height: 24, borderRadius: 999, border: 'none',
                    background: isLoading ? '#E5E7EB' : isOn ? color : '#D1D5DB',
                    cursor: isClaimed || isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s', outline: 'none',
                    display: 'flex', alignItems: 'center', padding: '0 3px',
                    justifyContent: isOn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'all 0.2s' }} />
                </button>
              </div>

              {/* User assign row — shown when slot is enabled */}
              {isOn && onAssign && slot && (
                <div style={{ border: `1.5px solid ${color + '50'}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#fff', padding: '8px 12px 10px' }}>
                  <SlotAssignRow slot={slot} users={users} onAssign={onAssign} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}


const PATHWAYS_LEVELS = ['CC', 'ACB', 'ACS', 'ACG', 'DTM', 'L1', 'L2', 'L3', 'L4', 'L5']

interface SpeakerEvaluatorPairsProps {
  slots: RoleSlot[]
  users: ClubUser[]
  onAddPair: () => Promise<void>
  onRemove: (slotId: string) => void
  onAssign?: (slotId: string, name: string, uid: string | null) => Promise<void>
  onUpdateSlotField?: (slotId: string, fields: { speechTopic?: string; pathwaysLevel?: string }) => Promise<void>
}

function SpeakerEvaluatorPairs({ slots, users, onAddPair, onRemove, onAssign, onUpdateSlotField }: SpeakerEvaluatorPairsProps) {
  const [addingPair, setAddingPair] = useState(false)

  const speakerSlots = slots.filter(s => s.group === 'speakers')
  const evalSlots = slots.filter(s => s.group === 'evaluators')
  const pairCount = Math.max(speakerSlots.length, evalSlots.length)

  const pairs = Array.from({ length: pairCount }, (_, i) => ({
    speaker: speakerSlots.find(s => s.pairIndex === i) ?? speakerSlots[i] ?? null,
    evaluator: evalSlots.find(s => s.pairIndex === i) ?? evalSlots[i] ?? null,
  }))

  const handleAddPair = async () => {
    setAddingPair(true)
    try { await onAddPair() } finally { setAddingPair(false) }
  }

  return (
    <Section title="Speakers & Evaluators">
      {pairs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#9CA3AF', fontSize: 12 }}>
          No speaker pairs yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          {pairs.map((pair, i) => (
            <SpeakerEvaluatorPairCard
              key={i}
              index={i}
              speaker={pair.speaker}
              evaluator={pair.evaluator}
              users={users}
              onAssign={onAssign}
              onRemove={onRemove}
              onUpdateSlotField={onUpdateSlotField}
            />
          ))}
        </div>
      )}

      <button
        onClick={handleAddPair}
        disabled={addingPair}
        style={{
          width: '100%', padding: '8px', borderRadius: 8,
          border: '1.5px dashed #E6E2DE', background: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: '#6B6470', fontSize: 12, fontWeight: 700,
          cursor: addingPair ? 'not-allowed' : 'pointer', opacity: addingPair ? 0.6 : 1,
        }}
      >
        <Plus size={14} />
        {addingPair ? 'Adding…' : 'Add speaker + evaluator pair'}
      </button>
    </Section>
  )
}

interface SpeakerEvaluatorPairCardProps {
  index: number
  speaker: RoleSlot | null
  evaluator: RoleSlot | null
  users: ClubUser[]
  onAssign?: (slotId: string, name: string, uid: string | null) => Promise<void>
  onRemove: (slotId: string) => void
  onUpdateSlotField?: (slotId: string, fields: { speechTopic?: string; pathwaysLevel?: string }) => Promise<void>
}

function SpeakerEvaluatorPairCard({ index, speaker, evaluator, users, onAssign, onRemove, onUpdateSlotField }: SpeakerEvaluatorPairCardProps) {
  const [level, setLevel] = useState(speaker?.pathwaysLevel ?? '')
  const [topic, setTopic] = useState(speaker?.speechTopic ?? '')
  const [savingMeta, setSavingMeta] = useState(false)

  const metaChanged = (level !== (speaker?.pathwaysLevel ?? '')) || (topic !== (speaker?.speechTopic ?? ''))

  const saveMeta = async () => {
    if (!speaker || savingMeta) return
    setSavingMeta(true)
    try {
      await onUpdateSlotField?.(speaker.id, {
        pathwaysLevel: level.trim() || undefined,
        speechTopic: topic.trim() || undefined,
      })
    } finally {
      setSavingMeta(false)
    }
  }

  const removePair = () => {
    if (speaker) onRemove(speaker.id)
    if (evaluator) onRemove(evaluator.id)
  }

  return (
    <div style={{ border: '1.5px solid #E6E2DE', borderRadius: 12, overflow: 'hidden' }}>
      {/* Pair header — single delete removes both slots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid #E6E2DE' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>Pair {index + 1}</span>
        <button
          onClick={removePair}
          style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          title="Remove pair"
        >
          <Trash2 size={11} color="#B3261E" />
        </button>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Speaker */}
        {speaker && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1A9E60' }}>🗣️ Speaker</span>
            {onAssign && <SlotAssignRow slot={speaker} users={users} onAssign={onAssign} hideHeader />}
            {/* Pathways level + speech topic */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '0 0 auto' }}>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  style={{
                    padding: '7px 28px 7px 10px', borderRadius: 8, border: '1px solid #E6E2DE',
                    fontSize: 12, fontFamily: 'inherit', outline: 'none',
                    background: '#fff', color: level ? '#111827' : '#9CA3AF',
                    appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Pathways level…</option>
                  {PATHWAYS_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                  <ChevronDown size={12} />
                </span>
              </div>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Speech topic…"
                style={{ flex: 1, minWidth: 120, padding: '7px 10px', borderRadius: 8, border: '1px solid #E6E2DE', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
              />
              {metaChanged && onUpdateSlotField && (
                <button
                  onClick={saveMeta}
                  disabled={savingMeta}
                  style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#772432', color: '#fff', fontSize: 12, fontWeight: 700, cursor: savingMeta ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  {savingMeta ? 'Saving…' : 'Save'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>EVALUATED BY</span>
          <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
        </div>

        {/* Evaluator */}
        {evaluator && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>✍️ Evaluator</span>
            {onAssign && <SlotAssignRow slot={evaluator} users={users} onAssign={onAssign} hideHeader />}
          </div>
        )}
      </div>
    </div>
  )
}

const ROLE_DISPLAY: Record<string, string> = {
  SAA: 'Sergeant at Arms', PO: 'Presiding Officer', TMOD: 'Toastmaster of the Day',
  TTM: 'Table Topics Master', GE: 'General Evaluator', TIMER: 'Timer',
  AHC: 'Ah-Counter', GRAM: 'Grammarian', TAGL: 'Timer + AH + Gram',
  LISTEN: 'Listening Post', SPKR: 'Speaker', EVAL: 'Evaluator', TTS: 'Table Topics Speaker',
}

const GROUP_COLOR_MAP: Record<RoleGroup, string> = {
  roleTakers: '#D64A6A', tagl: '#C89A14', speakers: '#1A9E60', evaluators: '#3B82F6', tableTopics: '#D97706',
}

const ROLE_PREFIXES = ['TM', 'DTM']

interface SlotRowProps {
  slot: RoleSlot
  users: ClubUser[]
  onAssign: (slotId: string, name: string, uid: string | null, rolePrefix?: string) => Promise<void>
  hideHeader?: boolean
  prefixes?: string[]
}

function SlotAssignRow({ slot, users, onAssign, hideHeader, prefixes = ROLE_PREFIXES }: SlotRowProps) {
  const isAssigned = !!(slot.uid || slot.name)
  const [editing, setEditing] = useState(!isAssigned)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [draftName, setDraftName] = useState(slot.name || '')
  const [draftPrefix, setDraftPrefix] = useState(slot.rolePrefix ?? 'TM')
  const [selectedUid, setSelectedUid] = useState<string | null>(slot.uid)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)

  // Sync state when slot changes externally (e.g. after save)
  useEffect(() => {
    if (slot.uid || slot.name) setEditing(false)
    setDraftName(slot.name || '')
    setDraftPrefix(slot.rolePrefix ?? 'TM')
    setSelectedUid(slot.uid)
  }, [slot.uid, slot.name, slot.rolePrefix])

  const updateRect = useCallback(() => {
    if (!inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    setDropdownRect({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width })
  }, [])

  useEffect(() => {
    if (!open) return
    updateRect()
    setTimeout(() => searchRef.current?.focus(), 0)
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [open, updateRect])

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase())
  )

  const handlePickUser = (u: ClubUser) => {
    setSelectedUid(u.uid)
    setDraftName(u.displayName)
    setOpen(false)
    setSearch('')
  }

  const handleNameChange = (v: string) => {
    setDraftName(v)
    setSelectedUid(null)
  }

  const handleSave = async () => {
    if (!draftName.trim() || saving) return
    setSaving(true)
    try {
      await onAssign(slot.id, draftName.trim(), selectedUid, draftPrefix)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraftName(slot.name || '')
    setDraftPrefix(slot.rolePrefix ?? 'TM')
    setSelectedUid(slot.uid)
    setSearch('')
    setOpen(false)
    setEditing(false)
  }

  const color = GROUP_COLOR_MAP[slot.group]
  const roleName = ROLE_DISPLAY[slot.role?.trim().toUpperCase()] ?? slot.role ?? 'Role'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: hideHeader ? '0' : '10px 12px', borderRadius: hideHeader ? 0 : 10, border: hideHeader ? 'none' : '1px solid #E6E2DE', background: hideHeader ? 'none' : (slot.uid || slot.name) ? '#F9FAFB' : '#fff' }}>
      {/* Role chip + name + Edit button — all inline in one row */}
      {!hideHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: color + '15', color, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {roleName}
          </span>
          {slot.uid || slot.name ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {`${slot.rolePrefix ?? 'TM'} ${slot.name}`}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: '#9CA3AF', flex: 1 }}>Unassigned</span>
          )}
          {!editing && (
            <button
              onClick={() => {
                setEditing(true)
                if (!draftPrefix) setDraftPrefix(prefixes[0])
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 7,
                border: '1px solid #E6E2DE', background: '#fff',
                fontSize: 11, fontWeight: 700, color: '#374151', cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Pencil size={11} /> Edit
            </button>
          )}
        </div>
      )}

      {/* hideHeader view mode — name + Edit inline (no role chip above) */}
      {hideHeader && !editing && (slot.uid || slot.name) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {`${slot.rolePrefix ?? 'TM'} ${slot.name}`}
          </span>
          <button
            onClick={() => {
              setEditing(true)
              if (!draftPrefix) setDraftPrefix(prefixes[0])
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 7,
              border: '1px solid #E6E2DE', background: '#fff',
              fontSize: 11, fontWeight: 700, color: '#374151', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Pencil size={11} /> Edit
          </button>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Prefix chips */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {prefixes.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setDraftPrefix(p)}
                style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${draftPrefix === p ? '#772432' : '#E6E2DE'}`,
                  background: draftPrefix === p ? '#FFF5F6' : '#fff',
                  color: draftPrefix === p ? '#772432' : '#6B7280',
                  cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Smart unified input — search members or enter custom name */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={draftName}
                onChange={e => {
                  const val = e.target.value
                  setDraftName(val)
                  handleNameChange(val)
                  if (!open) setOpen(true)
                }}
                placeholder="Search members or type a name…"
                style={{
                  width: '100%', padding: '8px 32px 8px 10px', borderRadius: 8,
                  border: `1.5px solid ${open ? '#772432' : selectedUid ? '#6366f1' : '#E6E2DE'}`,
                  fontSize: 12, fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#772432'; cancelClose(); setOpen(true) }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = selectedUid ? '#6366f1' : '#E6E2DE'
                  scheduleClose()
                }}
                onKeyDown={e => { if (e.key === 'Enter' && draftName.trim()) handleSave() }}
              />
              <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                <User size={13} />
              </span>
            </div>
            {isAssigned && (
              <button onClick={handleCancel} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #E6E2DE', background: '#fff', fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!draftName.trim() || saving}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: !draftName.trim() || saving ? '#E5E7EB' : selectedUid ? '#6366f1' : '#772432',
                color: !draftName.trim() || saving ? '#9CA3AF' : '#fff',
                fontSize: 12, fontWeight: 700,
                cursor: !draftName.trim() || saving ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', transition: 'background 0.15s', fontFamily: 'inherit',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

        </div>
      )}

      {/* Portal dropdown — escapes all overflow:hidden parents */}
      {open && dropdownRect && createPortal(
        <div style={{
          position: 'absolute',
          top: dropdownRect.top,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 9999,
          background: '#fff',
          border: '1px solid #E6E2DE',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 8px 4px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#F9FAFB', borderRadius: 6 }}>
              <Search size={12} color="#9CA3AF" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members…"
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, fontFamily: 'inherit', flex: 1, color: '#374151' }}
                onMouseDown={e => e.stopPropagation()}
                onFocus={cancelClose}
                onBlur={scheduleClose}
              />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>No members found</div>
            ) : filtered.map(u => (
              <button
                key={u.uid}
                onMouseDown={() => handlePickUser(u)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', border: 'none', borderBottom: '1px solid #F9FAFB',
                  background: selectedUid === u.uid ? '#FFF5F6' : '#fff',
                  color: selectedUid === u.uid ? '#772432' : '#374151',
                  fontSize: 12, fontWeight: selectedUid === u.uid ? 700 : 400,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (selectedUid !== u.uid) e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={e => { if (selectedUid !== u.uid) e.currentTarget.style.background = '#fff' }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${(u.uid.charCodeAt(0) * 47) % 360}, 55%, 52%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, fontWeight: 700, overflow: 'hidden',
                }}>
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { const img = e.currentTarget; img.style.display = 'none'; img.parentElement!.textContent = u.displayName.charAt(0).toUpperCase() }}
                    />
                  ) : u.displayName.charAt(0).toUpperCase()}
                </div>
                {u.displayName}
              </button>
            ))}
          </div>
          <div style={{ padding: '6px 12px 8px', borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF' }}>
            Not listed? Switch to ✏️ Add Manual tab
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

interface TableTopicsSpeakersProps {
  slots: RoleSlot[]
  users: ClubUser[]
  onAdd: () => void
  onRemove: (slotId: string) => void
  onAssign?: (slotId: string, name: string, uid: string | null) => Promise<void>
}

/** TTM adds any number of Table Topics speakers — pick from club members or type a guest's name. */
function TableTopicsSpeakers({ slots, users, onAdd, onRemove, onAssign }: TableTopicsSpeakersProps) {
  const [adding, setAdding] = useState(false)
  const ttSlots = slots.filter(s => s.group === 'tableTopics').sort((a, b) => a.order - b.order)
  const color = GROUP_COLORS['tableTopics']

  const handleAdd = async () => {
    if (adding) return
    setAdding(true)
    try { onAdd() } finally { setAdding(false) }
  }

  return (
    <Section title="Table Topics Speakers">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ttSlots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '10px 0', color: '#9CA3AF', fontSize: 12 }}>
            No Table Topics speakers added yet.
          </div>
        )}
        {ttSlots.map(slot => (
          <div key={slot.id} style={{
            border: `1.5px solid ${color}30`, borderRadius: 10,
            background: '#fff', padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {onAssign && <SlotAssignRow slot={slot} users={users} onAssign={onAssign} hideHeader prefixes={['TM', 'DTM', 'Guest']} />}
            </div>
            <button
              onClick={() => onRemove(slot.id)}
              title="Remove speaker"
              style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: 7,
                border: '1px solid #E6E2DE', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Trash2 size={13} color="#B3261E" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            padding: '9px 0', borderRadius: 10,
            background: adding ? '#E5E7EB' : color + '14',
            border: `1.5px solid ${color}40`,
            fontSize: 12, fontWeight: 700, color,
            cursor: adding ? 'default' : 'pointer',
          }}
        >
          {adding ? 'Adding…' : '+ Add Table Topics Speaker'}
        </button>
      </div>
    </Section>
  )
}
