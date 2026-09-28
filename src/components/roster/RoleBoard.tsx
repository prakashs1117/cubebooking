import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import type { RoleSlot, RoleGroup } from '../../types'

function initials(name: string) {
  return (name || '?').split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function avatarHue(uid: string) {
  return (uid.charCodeAt(0) * 47) % 360
}

const ROLE_NAMES: Record<string, string> = {
  SAA:    'Sergeant at Arms',
  PO:     'Presiding Officer',
  TMOD:   'Toastmaster of the Day',
  TTM:    'Table Topics Master',
  GE:     'General Evaluator',
  TIMER:  'Timer',
  AHC:    'Ah-Counter',
  GRAM:   'Grammarian',
  TAGL:   'Timer + Ah-Counter + Grammarian',
  LISTEN: 'Listening Post',
  SPKR:   'Speaker',
  EVAL:   'Evaluator',
  TTS:    'Table Topics Speaker',
}

function resolveRoleName(role: string): string {
  return ROLE_NAMES[role.trim().toUpperCase()] ?? role
}

export interface ClubUser {
  uid: string
  displayName: string
  photoURL?: string
}

export interface RoleBoardProps {
  slots: RoleSlot[]
  currentUid?: string
  onClaim: (slotId: string) => Promise<void>
  onRelease: (slotId: string) => Promise<void>
  isSuperAdmin?: boolean
  onAdminOverride?: (slotId: string, name: string, uid: string | null, rolePrefix?: string) => Promise<void>
  users?: ClubUser[]
  onGiveFeedback?: (slot: RoleSlot) => void
  hasReviewedSlot?: (slotId: string) => boolean
}

const GROUP_ORDER: RoleGroup[] = ['roleTakers', 'tagl', 'tableTopics', 'speakers', 'evaluators']

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

interface SlotEditPanelProps {
  slot: RoleSlot
  users: ClubUser[]
  onSave: (name: string, uid: string | null, rolePrefix?: string) => Promise<void>
  onCancel: () => void
  accentColor: string
  prefixes?: string[]
}

function SlotEditPanel({ slot, users, onSave, onCancel, accentColor, prefixes = ['TM', 'DTM'] }: SlotEditPanelProps) {
  const [draftName, setDraftName] = useState(slot.name || '')
  const [draftPrefix, setDraftPrefix] = useState(slot.rolePrefix ?? 'TM')
  const [selectedUser, setSelectedUser] = useState<ClubUser | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectUser = (u: ClubUser) => {
    setSelectedUser(u)
    setDraftName(u.displayName)
  }

  const handleNameChange = (v: string) => {
    setDraftName(v)
    setSelectedUser(null)
  }

  const handleSave = async () => {
    if (!draftName.trim() || saving) return
    setSaving(true)
    try {
      await onSave(draftName.trim(), selectedUser?.uid ?? null, draftPrefix)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      marginTop: 8,
      padding: '12px',
      borderRadius: 10,
      border: `1.5px solid ${accentColor}40`,
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Prefix chips */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {prefixes.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setDraftPrefix(p)}
            style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              border: `1.5px solid ${draftPrefix === p ? accentColor : '#E6E2DE'}`,
              background: draftPrefix === p ? `${accentColor}14` : '#fff',
              color: draftPrefix === p ? accentColor : '#6B7280',
              cursor: 'pointer', transition: 'all 0.12s',
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={draftName}
        onChange={e => handleNameChange(e.target.value)}
        placeholder="Type a name…"
        autoFocus
        style={{
          padding: '8px 10px',
          borderRadius: 8,
          border: '1.5px solid #E6E2DE',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
        onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
      />

      {users.length > 0 && (
        <div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid #E6E2DE',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 4,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
          />
          <div style={{
            maxHeight: 160,
            overflowY: 'auto',
            borderRadius: 8,
            border: '1px solid #E6E2DE',
            background: '#fff',
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '10px', fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                No members found
              </div>
            ) : filtered.map(u => {
              const isSelected = selectedUser?.uid === u.uid
              return (
                <button
                  key={u.uid}
                  onClick={() => handleSelectUser(u)}
                  style={{
                    width: '100%',
                    display: 'block',
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 400,
                    fontFamily: 'inherit',
                    border: 'none',
                    borderBottom: '1px solid #F3F4F6',
                    background: isSelected ? '#FFF5F6' : '#fff',
                    color: isSelected ? '#772432' : '#374151',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                    outline: isSelected ? `1.5px solid #77243240` : 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F9FAFB' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                >
                  {u.displayName}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 8,
            border: '1.5px solid #E6E2DE',
            background: '#fff',
            fontSize: 12,
            fontWeight: 700,
            color: '#6B7280',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!draftName.trim() || saving}
          style={{
            flex: 2,
            padding: '7px 0',
            borderRadius: 8,
            border: 'none',
            background: !draftName.trim() || saving ? '#D1D5DB' : '#772432',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            cursor: !draftName.trim() || saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function RoleBoard({
  slots,
  currentUid,
  onClaim,
  onRelease,
  isSuperAdmin = false,
  onAdminOverride,
  users = [],
  onGiveFeedback,
  hasReviewedSlot,
}: RoleBoardProps) {
  const myRoleTakerCount = slots.filter((s) => s.group === 'roleTakers' && s.uid === currentUid).length
  const canClaimRoleTaker = myRoleTakerCount < 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {GROUP_ORDER.map((group) => {
        const groupSlots = slots.filter((s) => s.group === group)
        if (groupSlots.length === 0) return null
        const canClaim = group === 'roleTakers' ? canClaimRoleTaker : true
        return (
          <RoleGroupSection
            key={group}
            group={group}
            slots={groupSlots}
            currentUid={currentUid}
            onClaim={onClaim}
            onRelease={onRelease}
            canClaimMore={canClaim}
            isSuperAdmin={isSuperAdmin}
            onAdminOverride={onAdminOverride}
            users={users}
            onGiveFeedback={onGiveFeedback}
            hasReviewedSlot={hasReviewedSlot}
          />
        )
      })}
    </div>
  )
}

interface RoleGroupSectionProps {
  group: RoleGroup
  slots: RoleSlot[]
  currentUid?: string
  onClaim: (slotId: string) => Promise<void>
  onRelease: (slotId: string) => Promise<void>
  canClaimMore: boolean
  isSuperAdmin: boolean
  onAdminOverride?: (slotId: string, name: string, uid: string | null, rolePrefix?: string) => Promise<void>
  users: ClubUser[]
  onGiveFeedback?: (slot: RoleSlot) => void
  hasReviewedSlot?: (slotId: string) => boolean
}

function RoleGroupSection({ group, slots, currentUid, onClaim, onRelease, canClaimMore, isSuperAdmin, onAdminOverride, users, onGiveFeedback, hasReviewedSlot }: RoleGroupSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)

  const label = GROUP_LABELS[group]
  const color = GROUP_COLORS[group]
  const prefixOptions = group === 'tableTopics' ? ['TM', 'DTM', 'Guest'] : ['TM', 'DTM']
  const openCount = slots.filter((s) => !s.uid && !s.name).length
  const claimedCount = slots.filter((s) => s.uid).length

  const handleClaim = async (slotId: string) => {
    setBusy(slotId)
    try {
      await onClaim(slotId)
    } catch (err) {
      console.error('Claim failed:', err)
    } finally {
      setBusy(null)
    }
  }

  const handleRelease = async (slotId: string) => {
    setBusy(slotId)
    try {
      await onRelease(slotId)
    } catch (err) {
      console.error('Release failed:', err)
    } finally {
      setBusy(null)
    }
  }

  const handleAdminSave = async (slotId: string, name: string, uid: string | null, rolePrefix?: string) => {
    if (!onAdminOverride) return
    await onAdminOverride(slotId, name, uid, rolePrefix)
    setEditingSlotId(null)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E6E2DE' }}>
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{label}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
            {openCount} open · {claimedCount} claimed
          </div>
        </div>
        {expanded ? <ChevronUp size={18} color="#9CA3AF" /> : <ChevronDown size={18} color="#9CA3AF" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
          {slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '14px 0', color: '#9CA3AF', fontSize: 12 }}>No roles yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {slots.map((slot) => {
                const isMine = slot.uid === currentUid
                const isOpen = !slot.uid && !slot.name
                const isLoading = busy === slot.id
                const isEditing = editingSlotId === slot.id
                const photoURL = slot.uid ? users.find(u => u.uid === slot.uid)?.photoURL : undefined

                return (
                  <div key={slot.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '10px',
                        borderRadius: isEditing ? '10px 10px 0 0' : 10,
                        background: isMine ? `${color}14` : '#F9FAFB',
                        border: `1px solid ${isMine ? color : isEditing ? '#772432' : '#E5E7EB'}`,
                        borderBottom: isEditing ? 'none' : undefined,
                        alignItems: 'center',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: isOpen
                          ? '#E5E7EB'
                          : `hsl(${avatarHue(slot.uid || slot.name)}, 58%, 52%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isOpen ? '#9CA3AF' : '#fff',
                        fontWeight: 700, fontSize: 13,
                        border: `2px solid ${isMine ? color : '#fff'}`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                      }}>
                        {photoURL ? (
                          <img
                            src={photoURL}
                            alt={slot.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { const img = e.currentTarget; img.style.display = 'none'; img.parentElement!.textContent = initials(slot.name) }}
                          />
                        ) : isOpen ? '?' : initials(slot.name)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                          {slot.role ? resolveRoleName(slot.role) : 'Member'}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: isOpen ? '#9CA3AF' : isMine ? color : '#374151',
                          marginTop: 1,
                          fontWeight: isOpen ? 400 : 600,
                          display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
                        }}>
                          <span>{isOpen ? 'Open — waiting for someone to step up' : isMine ? `${slot.rolePrefix ?? 'TM'} ${slot.name} (You)` : `${slot.rolePrefix ?? 'TM'} ${slot.name}`}</span>
                          {!isOpen && slot.pathwaysLevel && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '1px 5px',
                              borderRadius: 4, background: '#D1FAE5', color: '#065F46',
                            }}>
                              {slot.pathwaysLevel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button area */}
                      {isOpen ? (
                        isSuperAdmin ? (
                          <button
                            onClick={() => setEditingSlotId(isEditing ? null : slot.id)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 8,
                              background: isEditing ? '#F3F4F6' : '#772432',
                              color: isEditing ? '#374151' : '#fff',
                              border: 'none',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isEditing ? 'Cancel' : 'Assign'}
                          </button>
                        ) : currentUid ? (
                          <button
                            onClick={() => handleClaim(slot.id)}
                            disabled={isLoading || !canClaimMore}
                            title={!canClaimMore ? 'Maximum 2 roles allowed' : ''}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 8,
                              background: canClaimMore ? color : '#D1D5DB',
                              color: '#fff',
                              border: 'none',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: isLoading || !canClaimMore ? 'not-allowed' : 'pointer',
                              opacity: isLoading || !canClaimMore ? 0.6 : 1,
                              transition: 'opacity 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isLoading ? 'Claiming…' : !canClaimMore ? 'Max reached' : 'Assign me'}
                          </button>
                        ) : null
                      ) : isMine ? (
                        <button
                          onClick={() => handleRelease(slot.id)}
                          disabled={isLoading}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 8,
                            background: '#E5E7EB',
                            color: '#374151',
                            border: 'none',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1,
                            transition: 'opacity 0.2s',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isLoading ? 'Releasing…' : 'Release'}
                        </button>
                      ) : isSuperAdmin ? (
                        <button
                          onClick={() => setEditingSlotId(isEditing ? null : slot.id)}
                          title="Edit assignment"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            border: `1px solid ${isEditing ? '#772432' : '#E6E2DE'}`,
                            background: isEditing ? '#FFF5F6' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'border-color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (!isEditing) {
                              e.currentTarget.style.borderColor = '#772432'
                              e.currentTarget.style.background = '#FFF5F6'
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isEditing) {
                              e.currentTarget.style.borderColor = '#E6E2DE'
                              e.currentTarget.style.background = '#fff'
                            }
                          }}
                        >
                          <Pencil size={13} color={isEditing ? '#772432' : '#6B7280'} />
                        </button>
                      ) : (
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>Claimed</div>
                      )}
                    </div>

                    {/* Feedback pill — for speaker & table-topics groups, claimed by someone else */}
                    {(group === 'speakers' || group === 'tableTopics') && !isOpen && !isMine && onGiveFeedback && (
                      <div style={{ paddingLeft: 48, paddingTop: 4 }}>
                        {hasReviewedSlot && hasReviewedSlot(slot.id) ? (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                            background: '#F3F4F6', color: '#9CA3AF', display: 'inline-block',
                          }}>
                            ✓ Feedback sent
                          </span>
                        ) : (
                          <button
                            onClick={() => onGiveFeedback(slot)}
                            style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                              background: color + '18', color,
                              border: `1px solid ${color}40`, cursor: 'pointer',
                            }}
                          >
                            💬 Give Feedback
                          </button>
                        )}
                      </div>
                    )}

                    {/* Inline edit panel */}
                    {isEditing && onAdminOverride && (
                      <div style={{
                        border: '1px solid #772432',
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        background: '#FAFAFA',
                        padding: '0 10px 10px',
                      }}>
                        <SlotEditPanel
                          slot={slot}
                          users={users}
                          onSave={(name, uid, rolePrefix) => handleAdminSave(slot.id, name, uid, rolePrefix)}
                          onCancel={() => setEditingSlotId(null)}
                          accentColor={color}
                          prefixes={prefixOptions}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
