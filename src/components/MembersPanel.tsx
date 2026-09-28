import { useState, useEffect, useRef } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDown, ChevronUp, Check, Trash2 } from 'lucide-react'
import { db } from '../firebase'
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useAuthContext } from '../context/AuthContext'
import { hasRole, hasAnyRole, normaliseRoles } from '../lib/roles'
import type { UserProfile, UserRole } from '../types'

const ROLE_ORDER: UserRole[] = ['guest', 'member', 'club member', 'admin', 'super admin']

const ROLE_META: Record<UserRole, { label: string; emoji: string; bg: string; color: string; border: string }> = {
  'guest':       { label: 'Guest',       emoji: '👁',  bg: '#f9fafb', color: '#6b7280', border: '#d1d5db' },
  'member':      { label: 'Member',      emoji: '👤', bg: '#f3f4f6', color: '#374151', border: '#9ca3af' },
  'club member': { label: 'Club Member', emoji: '📋', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  'admin':       { label: 'Admin',       emoji: '👑', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  'super admin': { label: 'Super Admin', emoji: '⚡', bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
}

const ADMIN_ASSIGNABLE_ROLES: UserRole[] = ['guest', 'member', 'club member']
const SUPER_ADMIN_ASSIGNABLE_ROLES: UserRole[] = ['guest', 'member', 'club member', 'admin', 'super admin']

type FilterRole = 'all' | UserRole

function toggleRole(currentRoles: UserRole[], role: UserRole): UserRole[] {
  const has = currentRoles.includes(role)
  let next: UserRole[]
  if (has) {
    next = currentRoles.filter((r) => r !== role)
    if (next.length === 0) next = ['guest']
  } else {
    next = role === 'guest'
      ? ['guest']
      : [...currentRoles.filter((r) => r !== 'guest'), role]
  }
  return next
}

function RoleTogglePills({
  member, currentUserIsSuperAdmin, currentUserIsAdmin, currentUserUid, updating, onToggle,
}: {
  member: UserProfile
  currentUserIsSuperAdmin: boolean
  currentUserIsAdmin: boolean
  currentUserUid: string | undefined
  updating: boolean
  onToggle: (role: UserRole) => void
}) {
  const isSelf = member.uid === currentUserUid
  const assignable = currentUserIsSuperAdmin ? SUPER_ADMIN_ASSIGNABLE_ROLES : ADMIN_ASSIGNABLE_ROLES
  const triggerRef = useRef<HTMLButtonElement>(null)
  const canEdit = currentUserIsSuperAdmin
    ? !isSelf
    : (currentUserIsAdmin && !hasAnyRole(member, 'admin', 'super admin') && !isSelf)
  const memberRoles = member.roles ?? ['guest']

  if (!canEdit) {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {memberRoles.map((r) => {
          const meta = ROLE_META[r] ?? ROLE_META['guest']
          return (
            <div key={r} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6,
              background: meta.bg, color: meta.color,
              border: `1.5px solid ${meta.border}`,
              fontWeight: 600, fontSize: 11,
            }}>
              {meta.emoji} {meta.label}
            </div>
          )
        })}
        {isSelf && <span style={{ fontSize: 10, color: '#9ca3af', alignSelf: 'center' }}>(you)</span>}
      </div>
    )
  }

  const triggerLabel = memberRoles.length === 0
    ? 'No roles'
    : memberRoles.map(r => ROLE_META[r]?.emoji + ' ' + ROLE_META[r]?.label).join(', ')

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          disabled={updating}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 8,
            border: '1.5px solid #e5e7eb', background: '#fff',
            fontSize: 11, fontWeight: 600, color: '#374151',
            cursor: updating ? 'not-allowed' : 'pointer',
            opacity: updating ? 0.6 : 1,
            transition: 'border-color 0.15s',
            fontFamily: 'inherit', maxWidth: '100%',
          }}
          onMouseEnter={e => { if (!updating) e.currentTarget.style.borderColor = '#6366f1' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb' }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            {triggerLabel}
          </span>
          <ChevronDown size={12} style={{ flexShrink: 0, color: '#9ca3af' }} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="bottom" align="start" sideOffset={4} style={{
          background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '6px 0',
          minWidth: 190, zIndex: 1000, fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {ROLE_ORDER.map((role) => {
            const meta = ROLE_META[role]
            const active = memberRoles.includes(role)
            const canAssign = assignable.includes(role)
            return (
              <button key={role} onClick={() => canAssign && onToggle(role)} disabled={!canAssign} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 12px', border: 'none',
                background: active ? meta.bg : 'transparent',
                cursor: canAssign ? 'pointer' : 'not-allowed',
                opacity: canAssign ? 1 : 0.35, transition: 'background 0.1s', fontFamily: 'inherit',
              }}
                onMouseEnter={e => { if (canAssign) e.currentTarget.style.background = active ? meta.bg : '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? meta.bg : 'transparent' }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${active ? meta.color : '#d1d5db'}`,
                  background: active ? meta.color : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.12s',
                }}>
                  {active && <Check size={10} color="#fff" strokeWidth={3} />}
                </span>
                <span style={{ fontSize: 12 }}>{meta.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? meta.color : '#374151', flex: 1, textAlign: 'left' }}>
                  {meta.label}
                </span>
                {!canAssign && <span style={{ fontSize: 9, color: '#9ca3af' }}>no perm</span>}
              </button>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function RoleStatChip({ role, count, active, onClick }: { role: FilterRole; count: number; active: boolean; onClick: () => void }) {
  const meta = role === 'all' ? null : ROLE_META[role]
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '6px 12px', borderRadius: 999,
      border: active ? `2px solid ${meta?.color ?? '#6366f1'}` : '1.5px solid #e5e7eb',
      background: active ? (meta?.bg ?? '#eef2ff') : '#fff',
      color: active ? (meta?.color ?? '#4f46e5') : '#6b7280',
      fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
      fontFamily: 'inherit', boxShadow: active ? `0 0 0 3px ${meta?.bg ?? '#eef2ff'}` : 'none', whiteSpace: 'nowrap',
    }}>
      {meta ? `${meta.emoji} ` : ''}
      {role === 'all' ? 'All' : meta!.label}
      <span style={{
        background: active ? (meta?.color ?? '#4f46e5') : '#f3f4f6',
        color: active ? '#fff' : '#6b7280',
        borderRadius: 999, fontSize: 10, fontWeight: 800, padding: '1px 6px', minWidth: 20, textAlign: 'center',
      }}>
        {count}
      </span>
    </button>
  )
}

function MemberRow({
  member, isSuperAdmin, isAdmin, currentUid, isUpdating, onToggle, onDelete,
}: {
  member: UserProfile
  isSuperAdmin: boolean
  isAdmin: boolean
  currentUid: string | undefined
  isUpdating: boolean
  onToggle: (role: UserRole) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const memberRoles = member.roles ?? ['guest']
  const topRole = [...ROLE_ORDER].reverse().find((r) => memberRoles.includes(r)) ?? 'guest'
  const topMeta = ROLE_META[topRole]
  const initials = (member.displayName || member.email || '?')
    .split(/[\s@._-]+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
  const joinDate = member.createdAt?.toDate?.()?.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) ?? '—'

  return (
    <div style={{
      background: '#fff',
      border: isUpdating ? '1.5px solid #c4b5fd' : '1px solid #e5e7eb',
      borderRadius: 10,
      boxShadow: isUpdating ? '0 0 0 3px #ede9fe' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      overflow: 'hidden',
    }}>
      {/* ── Collapsed row (always visible) ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: `hsl(${(member.uid.charCodeAt(0) * 47) % 360}, 65%, 55%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 11,
          border: `2px solid ${topMeta.border}`, overflow: 'hidden',
        }}>
          {member.photoURL
            ? <img src={member.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.currentTarget.style.display = 'none' }} />
            : (initials || '?')}
        </div>

        {/* Name + top role badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {member.displayName || member.email || '—'}
            </span>
            {isUpdating && <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>Updating…</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
            {/* Access roles */}
            {memberRoles.map((r) => {
              const meta = ROLE_META[r] ?? ROLE_META['guest']
              return (
                <span key={r} style={{
                  padding: '1px 6px', borderRadius: 4,
                  background: meta.bg, color: meta.color,
                  border: `1px solid ${meta.border}`,
                  fontWeight: 700, fontSize: 9,
                }}>
                  {meta.emoji} {meta.label}
                </span>
              )
            })}
            {/* Club roles count badge if any */}
            {member.rolesHeld && member.rolesHeld.length > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: 4,
                background: '#ede9fe', color: '#5b21b6',
                border: '1px solid #c4b5fd',
                fontWeight: 700, fontSize: 9,
              }}>
                🎙 {member.rolesHeld.length} club role{member.rolesHeld.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ flexShrink: 0, color: '#9ca3af' }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* ── Expanded details ── */}
      {open && (
        <div style={{
          padding: '0 12px 12px 54px',
          borderTop: '1px solid #f3f4f6',
          paddingTop: 10,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {/* Contact info */}
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6 }}>
            {member.email && <div>{member.email}</div>}
            {(member.phone || member.city) && (
              <div>{[member.phone, member.city].filter(Boolean).join(' · ')}</div>
            )}
            <div style={{ color: '#9ca3af', fontSize: 10 }}>Joined {joinDate}</div>
          </div>

          {/* Club roles held */}
          {member.rolesHeld && member.rolesHeld.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                Club Roles
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {member.rolesHeld.map((role) => (
                  <span key={role} style={{
                    padding: '3px 8px', borderRadius: 999,
                    fontSize: 11, fontWeight: 600,
                    background: '#ede9fe', color: '#5b21b6',
                    border: '1px solid #c4b5fd',
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Access role toggle */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
              Access Role
            </div>
            <RoleTogglePills
              member={member}
              currentUserIsSuperAdmin={isSuperAdmin}
              currentUserIsAdmin={isAdmin}
              currentUserUid={currentUid}
              updating={isUpdating}
              onToggle={onToggle}
            />
          </div>

          {/* Extra Toastmasters info */}
          {(member.pathway || member.level || member.memberSince) && (
            <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.6 }}>
              {member.pathway && <div>Pathway: {member.pathway}{member.level ? ` · Level ${member.level}` : ''}</div>}
              {member.memberSince && <div>Member since: {member.memberSince}</div>}
            </div>
          )}

          {/* Delete user — super admin only, cannot delete self */}
          {isSuperAdmin && member.uid !== currentUid && (
            <div style={{ borderTop: '1px solid #fee2e2', paddingTop: 10, marginTop: 2 }}>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 7,
                    border: '1.5px solid #fca5a5', background: '#fff5f5',
                    color: '#dc2626', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5' }}
                >
                  <Trash2 size={12} /> Delete User
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>
                    Remove {member.displayName || member.email}? This cannot be undone.
                  </span>
                  <button
                    onClick={() => { onDelete(); setConfirmDelete(false) }}
                    style={{
                      padding: '4px 12px', borderRadius: 7, border: 'none',
                      background: '#dc2626', color: '#fff',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{
                      padding: '4px 12px', borderRadius: 7,
                      border: '1.5px solid #e5e7eb', background: '#fff',
                      color: '#374151', fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MembersPanel() {
  const { user, isAdmin, isSuperAdmin } = useAuthContext()
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<FilterRole>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map((d) => {
        const raw = { ...d.data() }
        return { ...raw, roles: normaliseRoles(raw) } as UserProfile
      }))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const handleToggleRole = async (member: UserProfile, role: UserRole) => {
    const currentRoles = member.roles ?? ['guest']
    const newRoles = toggleRole(currentRoles, role)
    if (JSON.stringify(newRoles.sort()) === JSON.stringify(currentRoles.slice().sort())) return
    setUpdating(member.uid)
    setError(null)
    try {
      await updateDoc(doc(db, 'users', member.uid), { roles: newRoles })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles')
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteUser = async (member: UserProfile) => {
    setError(null)
    try {
      await deleteDoc(doc(db, 'users', member.uid))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const roleCounts = ROLE_ORDER.reduce<Record<UserRole, number>>((acc, r) => {
    acc[r] = members.filter((m) => hasRole(m, r)).length
    return acc
  }, {} as Record<UserRole, number>)

  const filtered = members.filter((m) => {
    if (filterRole !== 'all' && !hasRole(m, filterRole)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.displayName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.city?.toLowerCase().includes(q)
    )
  })

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading members…</div>

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', scrollbarWidth: 'none' as any, paddingBottom: 2 }}>
        <RoleStatChip role="all" count={members.length} active={filterRole === 'all'} onClick={() => setFilterRole('all')} />
        {ROLE_ORDER.map((role) => (
          <RoleStatChip key={role} role={role} count={roleCounts[role]} active={filterRole === role} onClick={() => setFilterRole(role)} />
        ))}
      </div>

      {/* Permission hint */}
      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 10 }}>
        {isSuperAdmin
          ? '⚡ Super Admin — toggle any role combination on any user'
          : '👑 Admin — you can toggle Guest, Member, and Club Member roles'}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 10 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, city…"
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: '1.5px solid #e5e7eb', fontSize: 13,
            outline: 'none', fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
        <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
          {filtered.length} of {members.length}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', borderRadius: 10, background: '#ffebee', color: '#b3261e', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            {search || filterRole !== 'all' ? 'No members found' : 'No members yet'}
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af' }}>
            {search ? 'Try a different search term'
              : filterRole !== 'all' ? `No users with role "${ROLE_META[filterRole]?.label}"`
              : 'Members will appear here as they sign up'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 1000 }}>
          {filtered.map((member) => (
            <MemberRow
              key={member.uid}
              member={member}
              isSuperAdmin={isSuperAdmin}
              isAdmin={isAdmin}
              currentUid={user?.uid}
              isUpdating={updating === member.uid}
              onToggle={(role) => handleToggleRole(member, role)}
              onDelete={() => handleDeleteUser(member)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
