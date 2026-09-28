import { useEffect, useMemo, useState, useRef } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase'
import { AdvancedImage } from '@cloudinary/react'
import { Search, MapPin, Cake, Phone, Mail } from 'lucide-react'
import { avatarImage } from '../lib/cloudinaryImage'
import { formatDobNoYear, isBirthdayToday } from '../lib/birthday'
import { isGuestOnly } from '../lib/roles'
import { useAuthContext } from '../context/AuthContext'
import AppHeader from './AppHeader'
import MemberProfileModal from './MemberProfileModal'
import type { UserProfile } from '../types'

const ROLE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  'guest':       { label: 'Guest',       bg: '#F3F4F6', color: '#6B7280' },
  'member':      { label: 'Member',      bg: '#F3F4F6', color: '#374151' },
  'club member': { label: 'Club Member', bg: '#DBEAFE', color: '#1E40AF' },
  'admin':       { label: 'Admin',       bg: '#FEF3C7', color: '#92400E' },
  'super admin': { label: 'Super Admin', bg: '#EDE9FE', color: '#5B21B6' },
}

function roleBadgeFor(profile: UserProfile) {
  const role = profile.roles?.[0] ?? 'guest'
  return ROLE_BADGE[role] ?? ROLE_BADGE.guest
}

function MemberAvatar({ profile, size }: { profile: UserProfile; size: number }) {
  const [imgError, setImgError] = useState(false)
  const displayName = profile.displayName || profile.email || '?'
  const initials = displayName.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')

  if (profile.photoPublicId && !imgError) {
    return (
      <AdvancedImage
        cldImg={avatarImage(profile.photoPublicId, size * 2, profile.photoVersion)}
        alt={displayName}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setImgError(true)}
      />
    )
  }
  if (profile.photoURL && !imgError) {
    return (
      <img
        src={profile.photoURL}
        alt={displayName}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #772432, #5A1926)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F2DF74', fontWeight: 800, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function MemberCard({
  profile,
  isAdmin,
  onClick,
}: {
  profile: UserProfile
  isAdmin: boolean
  onClick?: () => void
}) {
  const displayName = profile.displayName || profile.email || 'Member'
  const birthdayToday = isBirthdayToday(profile.dateOfBirth)
  const dobLabel = formatDobNoYear(profile.dateOfBirth)
  const badge = roleBadgeFor(profile)

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: `1.5px solid ${birthdayToday ? '#fcd34d' : '#E6E2DE'}`,
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        ...(birthdayToday ? { boxShadow: '0 2px 10px rgba(252,211,77,0.35)' } : {}),
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = '#f9f8f7'
          e.currentTarget.style.borderColor = '#d6d1cc'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#fff'
        e.currentTarget.style.borderColor = birthdayToday ? '#fcd34d' : '#E6E2DE'
      }}
    >
      <MemberAvatar profile={profile} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1519', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </div>
          <span style={{
            flexShrink: 0, fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
            background: badge.bg, color: badge.color,
          }}>
            {badge.label}
          </span>
        </div>
        {(profile.pathway || profile.clubName) && (
          <div style={{ fontSize: 11.5, color: '#6B6470', fontWeight: 500, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[profile.pathway, profile.level].filter(Boolean).join(' · ')}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 5 }}>
          {profile.city && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#9CA3AF' }}>
              <MapPin size={11} /> {profile.city}
            </span>
          )}
          {dobLabel && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#9CA3AF' }}>
              <Cake size={11} /> {dobLabel}
            </span>
          )}
          {/* Contact details — admin only */}
          {isAdmin && profile.phone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#9CA3AF' }}>
              <Phone size={11} /> {profile.phone}
            </span>
          )}
          {isAdmin && profile.email && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#9CA3AF' }}>
              <Mail size={11} /> {profile.email}
            </span>
          )}
        </div>
      </div>
      {birthdayToday && (
        <span style={{
          flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#92400e',
          background: 'linear-gradient(135deg, #fef9ec, #fef3c7)',
          border: '1px solid #fcd34d', borderRadius: 999,
          padding: '5px 10px', whiteSpace: 'nowrap',
        }}>
          🎉 Happy Birthday!
        </span>
      )}
    </div>
  )
}

export default function MembersPage() {
  const { isAdmin, isSuperAdmin } = useAuthContext()
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const isMounted = useRef(true)

  // Find selected member profile
  const selectedMember = selectedMemberId
    ? members.find(m => m.uid === selectedMemberId) || null
    : null

  useEffect(() => {
    isMounted.current = true
    const q = query(collection(db, 'users'))
    const unsubscribe = onSnapshot(q, snap => {
      if (isMounted.current) {
        setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)))
        setLoading(false)
      }
    }, err => {
      if (isMounted.current) {
        console.error('Members listener error:', err)
        setLoading(false)
      }
    })

    return () => {
      isMounted.current = false
      unsubscribe()
    }
  }, [])

  const { active, deleted } = useMemo(() => {
    const activeMembers = members.filter(m => !m.deletedAt)
    const deletedMembers = members.filter(m => m.deletedAt)

    const sortMembers = (list: UserProfile[]) =>
      [...list].sort((a, b) => {
        const aBday = isBirthdayToday(a.dateOfBirth) ? 0 : 1
        const bBday = isBirthdayToday(b.dateOfBirth) ? 0 : 1
        if (aBday !== bBday) return aBday - bBday
        const aGuest = isGuestOnly(a) ? 1 : 0
        const bGuest = isGuestOnly(b) ? 1 : 0
        if (aGuest !== bGuest) return aGuest - bGuest
        return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '')
      })

    const filterBySearch = (list: UserProfile[]) => {
      const term = search.trim().toLowerCase()
      if (!term) return list
      return list.filter(m =>
        (m.displayName ?? '').toLowerCase().includes(term)
        || (m.city ?? '').toLowerCase().includes(term)
        || (m.pathway ?? '').toLowerCase().includes(term)
      )
    }

    return {
      active: filterBySearch(sortMembers(activeMembers)),
      deleted: isSuperAdmin ? filterBySearch(sortMembers(deletedMembers)) : [],
    }
  }, [members, search, isSuperAdmin])

  const birthdaysToday = active.filter(m => isBirthdayToday(m.dateOfBirth))

  return (
    <div style={{ background: '#F4F3F1', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      <AppHeader title="Club Members" subtitle={`${members.filter(m => !m.deletedAt).length} member${members.filter(m => !m.deletedAt).length === 1 ? '' : 's'} & guests`} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '12px 12px 0' }}>
        {birthdaysToday.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #fef9ec, #fef3c7)',
            border: '1.5px solid #fcd34d', borderRadius: 14,
            padding: '12px 16px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🎂</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
              {birthdaysToday.length === 1
                ? `It's ${birthdaysToday[0].displayName || 'a member'}'s birthday today — wish them well!`
                : `It's ${birthdaysToday.map(m => m.displayName || 'a member').join(', ')}'s birthday today — wish them well!`}
            </span>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city or pathway…"
            style={{
              width: '100%', padding: '10px 12px 10px 32px',
              borderRadius: 12, border: '1px solid #E6E2DE',
              fontSize: 13, background: '#fff', color: '#1A1519',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 13 }}>Loading…</div>
        ) : active.length === 0 && deleted.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <div style={{ fontSize: 36 }}>👥</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '12px 0 8px' }}>No members found</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Try a different search.</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {active.map(m => (
                  <MemberCard
                    key={m.uid}
                    profile={m}
                    isAdmin={isAdmin}
                    onClick={() => setSelectedMemberId(m.uid)}
                  />
                ))}
              </div>
            )}

            {deleted.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase',
                  letterSpacing: 0.5, marginBottom: 12,
                }}>
                  Deleted Members ({deleted.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {deleted.map(m => (
                    <MemberCard
                      key={m.uid}
                      profile={m}
                      isAdmin={isAdmin}
                      onClick={() => setSelectedMemberId(m.uid)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <MemberProfileModal
        profile={selectedMember}
        isOpen={selectedMemberId !== null}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  )
}
