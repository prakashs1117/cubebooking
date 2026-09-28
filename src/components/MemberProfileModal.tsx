import { X, MapPin, Calendar, BookOpen, Mic, Instagram, Linkedin, Mail, Trash2 } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { AdvancedImage } from '@cloudinary/react'
import { avatarImage } from '../lib/cloudinaryImage'
import { formatDobNoYear, isBirthdayToday } from '../lib/birthday'
import type { UserProfile } from '../types'
import { useAuthContext } from '../context/AuthContext'
import { useDeleteMember } from '../hooks/useDeleteMember'

interface MemberProfileModalProps {
  profile: UserProfile | null
  isOpen: boolean
  onClose: () => void
}

const ROLE_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  'guest':       { label: 'Guest',       color: '#6B7280', bg: '#F3F4F6', emoji: '👁' },
  'member':      { label: 'Member',      color: '#374151', bg: '#F3F4F6', emoji: '👤' },
  'club member': { label: 'Club Member', color: '#1E40AF', bg: '#DBEAFE', emoji: '📋' },
  'admin':       { label: 'Admin',       color: '#92400E', bg: '#FEF3C7', emoji: '👑' },
  'super admin': { label: 'Super Admin', color: '#5B21B6', bg: '#EDE9FE', emoji: '⚡' },
}

function Avatar({ profile }: { profile: UserProfile }) {
  const [err, setErr] = useState(false)
  const name = profile.displayName || profile.email || '?'
  const initials = name.split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
  const base: React.CSSProperties = {
    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
    border: '2px solid #fff', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  }
  if (profile.photoPublicId && !err) return (
    <div style={base}>
      <AdvancedImage cldImg={avatarImage(profile.photoPublicId, 112, profile.photoVersion)} alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setErr(true)} />
    </div>
  )
  if (profile.photoURL && !err) return (
    <div style={base}>
      <img src={profile.photoURL} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setErr(true)} />
    </div>
  )
  return (
    <div style={{ ...base, background: 'linear-gradient(135deg,#772432,#5A1926)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2DF74', fontWeight: 800, fontSize: 18 }}>
      {initials}
    </div>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ color: '#9CA3AF', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, color: '#374151', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '9px 11px' }}>
      {children}
    </div>
  )
}

function CardLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 8.5, fontWeight: 800, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
      {text}
    </div>
  )
}

function MemberProfileView({ profile }: { profile: UserProfile }) {
  const name = profile.displayName || profile.email || 'Member'
  const dobLabel = formatDobNoYear(profile.dateOfBirth)
  const birthdayToday = isBirthdayToday(profile.dateOfBirth)
  const memberSince = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null
  const roles = profile.roles?.length ? profile.roles : ['guest']
  const hasRolesHeld = (profile.rolesHeld?.length ?? 0) > 0
  const hasAwards = (profile.awardBadges?.length ?? 0) > 0
  const hasSocials = profile.linkedin || profile.instagram
  const hasToastInfo = profile.pathway || profile.level || memberSince || profile.clubName
  const hasDetails = profile.city || dobLabel || profile.email

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8F9FA', borderRadius: 14 }}>

      {/* ── Header strip ── */}
      <div style={{ background: 'linear-gradient(135deg,#772432,#5A1926)', borderRadius: '14px 14px 0 0', padding: '12px 12px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar profile={profile} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', marginBottom: 2 }}>
            {name}{birthdayToday ? ' 🎂' : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {roles.map(r => {
              const m = ROLE_META[r] ?? ROLE_META['guest']
              return (
                <span key={r} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {m.emoji} {m.label}
                </span>
              )
            })}
          </div>
          {(profile.pathway || profile.clubName) && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3, fontWeight: 500 }}>
              {[profile.pathway, profile.level].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardLabel text="About" />
            <p style={{ margin: 0, fontSize: 11.5, color: '#374151', lineHeight: 1.5 }}>{profile.bio}</p>
          </Card>
        )}

        {/* Toastmasters */}
        {hasToastInfo && (
          <Card>
            <CardLabel text="Toastmasters" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {profile.clubName && <InfoRow icon={<Mic size={11} />} label={profile.clubName + (profile.clubNumber ? ` #${profile.clubNumber}` : '')} />}
              {profile.pathway && <InfoRow icon={<BookOpen size={11} />} label={profile.pathway + (profile.level ? ` · ${profile.level}` : '')} />}
              {memberSince && <InfoRow icon={<Calendar size={11} />} label={`Member since ${memberSince}`} />}
            </div>
          </Card>
        )}

        {/* Details */}
        {hasDetails && (
          <Card>
            <CardLabel text="Details" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {profile.city && <InfoRow icon={<MapPin size={11} />} label={profile.city} />}
              {dobLabel && <InfoRow icon={<span style={{ fontSize: 11, lineHeight: 1 }}>🎂</span>} label={dobLabel} />}
              {profile.email && <InfoRow icon={<Mail size={11} />} label={profile.email} />}
            </div>
          </Card>
        )}

        {/* Roles held */}
        {hasRolesHeld && (
          <Card>
            <CardLabel text={`Roles Held · ${profile.rolesHeld!.length}`} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {profile.rolesHeld!.map(role => (
                <span key={role} style={{ padding: '2px 8px', borderRadius: 5, background: '#FFF5F6', color: '#772432', border: '1px solid #FECDD3', fontSize: 10.5, fontWeight: 600 }}>
                  {role}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Awards */}
        {hasAwards && (
          <Card>
            <CardLabel text={`Awards · ${profile.awardBadges!.length}`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {profile.awardBadges!.map((badge, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{badge.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', lineHeight: 1.3 }}>{badge.categoryLabel}</div>
                    <div style={{ fontSize: 9.5, color: '#B45309' }}>Meeting #{badge.meetingNo}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Socials */}
        {hasSocials && (
          <div style={{ display: 'flex', gap: 6 }}>
            {profile.linkedin && (
              <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 10px', borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', textDecoration: 'none', color: '#0A66C2', fontSize: 11, fontWeight: 600 }}>
                <Linkedin size={12} /> LinkedIn
              </a>
            )}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 10px', borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', textDecoration: 'none', color: '#E1306C', fontSize: 11, fontWeight: 600 }}>
                <Instagram size={12} /> @{profile.instagram.replace(/^@/, '')}
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default function MemberProfileModal({ profile, isOpen, onClose }: MemberProfileModalProps) {
  const { isSuperAdmin } = useAuthContext()
  const { deleteMember, restoreMember } = useDeleteMember()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (isOpen && dialogRef.current) dialogRef.current.focus()
  }, [isOpen])

  const handleDeleteClick = async () => {
    if (!profile) return
    setBusy(true)
    try {
      if (profile.deletedAt) {
        await restoreMember(profile.uid)
      } else {
        await deleteMember(profile.uid)
      }
      setShowConfirm(false)
      onClose()
    } catch (err) {
      console.error('Failed to delete/restore member:', err)
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen || !profile) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, padding: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}
      role="dialog"
      aria-modal="true"
    >
      {/* Sheet slides up from bottom on mobile, centered on desktop */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '88vh', overflowY: 'auto',
          borderRadius: '14px 14px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          outline: 'none', position: 'relative',
          margin: '0 auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', zIndex: 10 }} />

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 10,
            width: 28, height: 28, borderRadius: 7,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <X size={13} />
        </button>

        <MemberProfileView profile={profile} />

        {/* Super admin delete/restore button */}
        {isSuperAdmin && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #E6E2DE', background: '#F8F9FA' }}>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={busy}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1.5px solid #B3261E',
                background: profile.deletedAt ? '#FEE2E2' : 'transparent',
                color: '#B3261E',
                fontSize: '13px',
                fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s',
                opacity: busy ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!busy && !profile.deletedAt) {
                  e.currentTarget.style.background = '#FEE2E2'
                }
              }}
              onMouseLeave={(e) => {
                if (!profile.deletedAt) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Trash2 size={14} />
              {profile.deletedAt ? 'Restore Member' : 'Delete Member'}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
          onClick={() => !busy && setShowConfirm(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1519', margin: '0 0 8px' }}>
              {profile.deletedAt ? 'Restore Member?' : 'Delete Member?'}
            </h3>
            <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 20px', lineHeight: 1.5 }}>
              {profile.deletedAt
                ? `This will restore ${profile.displayName || profile.email} to the active members list.`
                : `This will remove ${profile.displayName || profile.email} from the active members list. They can be restored later.`}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={busy}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E6E2DE',
                  background: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  color: '#6B6470',
                  transition: 'all 0.15s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={busy}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#B3261E',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  opacity: busy ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {busy ? 'Processing…' : profile.deletedAt ? 'Restore' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
