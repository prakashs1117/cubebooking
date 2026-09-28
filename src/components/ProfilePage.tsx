import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, ShieldCheck, Pencil, X, Instagram, Linkedin, Clock, BookOpen, LogOut, PenLine, Users } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { useMyPosts } from '../hooks/useMyPosts'
import AppHeader from './AppHeader'
import { NextMeetingBanner } from './roster/NextMeetingBanner'
import EmailVerificationBanner from './auth/EmailVerificationBanner'
import ProfilePhotoUpload from './ProfilePhotoUpload'
import { AdvancedImage } from '@cloudinary/react'
import { avatarImage } from '../lib/cloudinaryImage'
import { TextField, TextAreaField, SelectField, ChipSelect, FormAlert } from './FormField'
import { formatDobNoYear, isBirthdayToday } from '../lib/birthday'
import { validatePhoneNumber } from '../lib/validation'
import type { ProfileDraft, UserProfile } from '../types'

const PATHWAYS = [
  'Presentation Mastery',
  'Dynamic Leadership',
  'Motivational Strategies',
  'Persuasive Influence',
  'Visionary Communication',
  'Effective Coaching',
  'Team Collaboration',
  'Leadership Development',
  'Innovative Planning',
  'Engaging Humor',
  'Strategic Relationships',
]

const LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']

const CLUB_ROLES = [
  'President', 'VP Education', 'VP Membership', 'VP Public Relations',
  'Secretary', 'Treasurer', 'Sergeant at Arms', 'Toastmaster',
  'Evaluator', 'Table Topics Master', 'Timer', 'Ah-Counter', 'Grammarian',
]

const EMPTY_DRAFT: ProfileDraft = {
  displayName: '', photoURL: '', photoPublicId: '', photoVersion: 0,
  phone: '', city: '', note: '', dateOfBirth: '', clubName: '', clubNumber: '',
  memberSince: '', pathway: '', level: '', rolesHeld: [],
  bio: '', linkedin: '', instagram: '',
}

function draftFromProfile(profile: UserProfile | null): ProfileDraft {
  if (!profile) return { ...EMPTY_DRAFT }
  return {
    ...EMPTY_DRAFT,
    displayName: profile.displayName ?? '',
    photoURL: profile.photoURL ?? '',
    photoPublicId: profile.photoPublicId ?? '',
    photoVersion: profile.photoVersion ?? 0,
    phone: profile.phone ?? '',
    city: profile.city ?? '',
    note: profile.note ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
    clubName: profile.clubName ?? '',
    clubNumber: profile.clubNumber ?? '',
    memberSince: profile.memberSince ?? '',
    pathway: profile.pathway ?? '',
    level: profile.level ?? '',
    rolesHeld: profile.rolesHeld ?? [],
    bio: profile.bio ?? '',
    linkedin: profile.linkedin ?? '',
    instagram: profile.instagram ?? '',
  }
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#E6E2DE] rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 shadow-[0_1px_2px_rgba(26,21,25,.04)]">
      <h2 className="text-[13px] sm:text-[14px] font-extrabold tracking-tight text-[#1A1519]">{title}</h2>
      {description ? <p className="text-[11px] sm:text-[12px] text-[#6B6470] mt-0.5 mb-3 sm:mb-4">{description}</p> : <div className="mb-3" />}
      {children}
    </section>
  )
}

// ─── Wavy SVG banner background ───────────────────────────────────────────────
function WaveBanner() {
  return (
    <svg
      viewBox="0 0 400 140"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <rect width="400" height="140" fill="#772432" />
      {/* Subtle wave lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${-40 + i * 8},${30 + i * 18} Q${100 + i * 5},${10 + i * 12} ${200 + i * 4},${35 + i * 16} T${440 + i * 6},${28 + i * 14}`}
          fill="none"
          stroke="rgba(242,223,116,0.18)"
          strokeWidth={i % 2 === 0 ? 1.5 : 1}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={`b${i}`}
          d={`M${-20 + i * 10},${80 + i * 10} Q${120 + i * 6},${60 + i * 8} ${240 + i * 5},${85 + i * 10} T${440 + i * 4},${72 + i * 9}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {/* Gold accent arc */}
      <ellipse cx="340" cy="20" rx="90" ry="55" fill="rgba(242,223,116,0.07)" />
      <ellipse cx="60" cy="120" rx="70" ry="40" fill="rgba(90,25,38,0.35)" />
    </svg>
  )
}

// ─── Role badge colour mapping ─────────────────────────────────────────────────
const ROLE_DISPLAY: Record<string, { label: string; bg: string; color: string; emoji: string }> = {
  'guest':       { label: 'Guest',        bg: '#F9FAFB', color: '#6B7280', emoji: '👁' },
  'member':      { label: 'Member',       bg: '#F3F4F6', color: '#374151', emoji: '👤' },
  'club member': { label: 'Club Member',  bg: '#DBEAFE', color: '#1E40AF', emoji: '📋' },
  'admin':       { label: 'Admin',        bg: '#FEF3C7', color: '#92400E', emoji: '👑' },
  'super admin': { label: 'Super Admin',  bg: '#EDE9FE', color: '#5B21B6', emoji: '⚡' },
}

// ─── My Posts mini-section ────────────────────────────────────────────────────
function MyPostsMini({ uid }: { uid?: string }) {
  const { posts, loading } = useMyPosts(uid)
  if (loading || posts.length === 0) return null
  const recent = posts.slice(0, 3)
  return (
    <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 16, padding: '14px 18px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <PenLine size={12} /> My Posts
        </div>
        <Link to="/blog/my" style={{ fontSize: 11, color: '#772432', fontWeight: 700, textDecoration: 'none' }}>
          View all →
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#1A1519',
              padding: '6px 10px', borderRadius: 8,
              background: '#f8fafc', border: '1px solid #E6E2DE',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}
            >
              {post.type === 'word' ? '📖 ' : '✍️ '}{post.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Profile View (read-only beautiful card) ───────────────────────────────────
export function ProfileView({
  profile,
  email,
  onEdit,
  onSignOut,
  hideContactDetails = false,
  readOnly = false,
}: {
  profile: UserProfile | null
  email: string | null | undefined
  onEdit: () => void
  onSignOut: () => void
  hideContactDetails?: boolean
  readOnly?: boolean
}) {
  const [imgError, setImgError] = useState(false)
  const photoKey = profile?.photoPublicId || profile?.photoURL || ''
  useEffect(() => { setImgError(false) }, [photoKey])

  const displayName = profile?.displayName || email?.split('@')[0] || 'Your Name'
  const activeRoles = profile?.roles?.length ? profile.roles : ['guest']

  const memberSinceLabel = profile?.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null

  const dobLabel = formatDobNoYear(profile?.dateOfBirth)
  const birthdayToday = isBirthdayToday(profile?.dateOfBirth)

  return (
    <div className="max-w-[520px] mx-auto px-4 sm:px-0 pb-6">
      {/* ── Birthday wish ── */}
      {birthdayToday && (
        <div style={{
          background: 'linear-gradient(135deg, #fef9ec, #fef3c7)',
          border: '1.5px solid #fcd34d', borderRadius: 14,
          padding: '14px 18px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 30 }}>🎂</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>Happy Birthday, {displayName}! 🎉</div>
            <div style={{ fontSize: 12.5, color: '#78350f', marginTop: 2 }}>Wishing you a wonderful year ahead from the whole club.</div>
          </div>
        </div>
      )}
      {/* ── Hero card ── */}
      <div className="rounded-2xl overflow-hidden shadow-[0_4px_24px_-6px_rgba(119,36,50,0.18)] mb-4">
        {/* Banner */}
        <div style={{ position: 'relative', height: 130, background: '#772432', overflow: 'hidden' }}>
          <WaveBanner />
          {/* Edit button */}
          {!readOnly && (
            <button
              onClick={onEdit}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 2,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10,
                padding: '6px 14px', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
            >
              <Pencil size={12} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Avatar + name row */}
        <div style={{ background: '#FDF9F5', padding: '0 20px 20px', position: 'relative'}}>
          <div style={{position: 'relative', marginTop: -30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Avatar */}
          <div style={{
            marginTop: -44, marginBottom: 12,
            width: 88, height: 88, borderRadius: '50%',
            border: '3px solid #fff',
            overflow: 'hidden', background: '#E6E2DE',
            boxShadow: '0 4px 14px rgba(119,36,50,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            {profile?.photoPublicId && !imgError ? (
              <AdvancedImage
                cldImg={avatarImage(profile.photoPublicId, 176, profile.photoVersion)}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgError(true)}
              />
            ) : profile?.photoURL && !imgError ? (
              <img
                src={profile.photoURL}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #772432, #5A1926)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#F2DF74', fontWeight: 800, fontSize: 30,
              }}>
                {displayName.split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1519', margin: '0 0 2px', letterSpacing: '-0.3px' }}>
                {displayName}
              </h1>
              {profile?.instagram && (
                <div style={{ fontSize: 13, color: '#772432', fontWeight: 600, marginBottom: 4 }}>
                  @{profile.instagram.replace(/^@/, '')}
                </div>
              )}
              {(profile?.pathway || profile?.clubName) && (
                <div style={{ fontSize: 12.5, color: '#6B6470', fontWeight: 500 }}>
                  {[profile.pathway, profile.clubName].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0, marginTop: 4 }}>
              {activeRoles.map((r) => {
                const m = ROLE_DISPLAY[r] ?? ROLE_DISPLAY['guest']
                return (
                  <div key={r} style={{
                    padding: '3px 9px', borderRadius: 8,
                    background: m.bg, color: m.color,
                    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    {m.emoji} {m.label}
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* ── Club Members quick link ── */}
      {!activeRoles.every((r) => r === 'guest') && (
        <Link
          to="/members"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #E6E2DE', borderRadius: 14,
            padding: '13px 16px', marginBottom: 14, textDecoration: 'none',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: '#FFF5F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={16} color="#772432" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1519' }}>Club Members</div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>See all members &amp; guests, with birthdays</div>
          </div>
          <span style={{ color: '#772432', fontSize: 13, fontWeight: 700 }}>→</span>
        </Link>
      )}

      {/* ── Guest CTA ── */}
      {activeRoles.every((r) => r === 'guest') && (
        <div style={{
          background: 'linear-gradient(135deg, #fef9ec, #fef3c7)',
          border: '1.5px solid #fcd34d',
          borderRadius: 14, padding: '16px 20px',
          marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>👁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e', marginBottom: 4 }}>
              You're signed in as a Guest
            </div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
              You have limited access right now. To unlock roster features and become a full member, fill out the interest form — an admin will upgrade your role.
            </div>
          </div>
          <a
            href="/onboarding"
            style={{
              flexShrink: 0, padding: '8px 16px',
              borderRadius: 10, background: '#92400e', color: '#fff',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              transition: 'background 0.15s',
            }}
          >
            Request Access →
          </a>
        </div>
      )}

      {/* ── Stats row ── */}
      {(profile?.level || profile?.memberSince || (profile?.rolesHeld?.length ?? 0) > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${[profile?.level, profile?.memberSince, profile?.rolesHeld?.length].filter(Boolean).length}, 1fr)`,
          gap: 10, marginBottom: 14,
        }}>
          {profile?.level && (
            <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <BookOpen size={16} color="#772432" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1519' }}>{profile.level}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Level</div>
            </div>
          )}
          {memberSinceLabel && (
            <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <Clock size={16} color="#772432" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 12, fontWeight: 800, color: '#1A1519' }}>{memberSinceLabel}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Member Since</div>
            </div>
          )}
          {(profile?.rolesHeld?.length ?? 0) > 0 && (
            <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#772432', lineHeight: 1.2 }}>{profile!.rolesHeld!.length}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Roles Held</div>
            </div>
          )}
        </div>
      )}

      {/* ── Bio ── */}
      {profile?.bio && (
        <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            About
          </div>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
        </div>
      )}

      {/* ── Contact & location ── */}
      {(profile?.city || (!hideContactDetails && email) || dobLabel) && (
        <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Contact
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!hideContactDetails && email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <Mail size={14} color="#772432" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 500 }}>{email}</span>
              </div>
            )}
            {profile?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <MapPin size={14} color="#772432" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 500 }}>{profile.city}</span>
              </div>
            )}
            {dobLabel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <span style={{ width: 14, textAlign: 'center', flexShrink: 0 }}>🎂</span>
                <span style={{ fontWeight: 500 }}>{dobLabel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Roles held chips ── */}
      {(profile?.rolesHeld?.length ?? 0) > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            Roles Held
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {profile!.rolesHeld!.map((role) => (
              <span key={role} style={{
                padding: '5px 12px', borderRadius: 999,
                background: 'linear-gradient(135deg, #772432, #5A1926)',
                color: '#F2DF74', fontSize: 11.5, fontWeight: 700,
              }}>
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Note ── */}
      {profile?.note && (
        <div style={{ background: '#FDF9F5', border: '1px solid #E6E2DE', borderRadius: 16, padding: '14px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
            Note
          </div>
          <p style={{ fontSize: 13, color: '#6B6470', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{profile.note}</p>
        </div>
      )}

      {/* ── My Posts ── */}
      <MyPostsMini uid={profile?.uid} />

      {/* ── Social links ── */}
      {(profile?.linkedin || profile?.instagram) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {profile?.linkedin && (
            <a
              href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: '#fff', border: '1px solid #E6E2DE',
                display: 'flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', color: '#0A66C2', fontWeight: 600, fontSize: 12.5,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A66C2' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E6E2DE' }}
            >
              <Linkedin size={15} />
              LinkedIn
            </a>
          )}
          {profile?.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: '#fff', border: '1px solid #E6E2DE',
                display: 'flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', color: '#E1306C', fontWeight: 600, fontSize: 12.5,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E1306C' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E6E2DE' }}
            >
              <Instagram size={15} />
              Instagram
            </a>
          )}
        </div>
      )}

      {/* ── Empty state nudge ── */}
      {!profile?.bio && !profile?.city && !profile?.phone && (profile?.rolesHeld?.length ?? 0) === 0 && (
        <div style={{
          textAlign: 'center', padding: '28px 20px',
          background: '#fff', border: '1.5px dashed #D6D1CC', borderRadius: 16,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1519', marginBottom: 4 }}>Complete your profile</div>
          <div style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 14 }}>
            Add your bio, contact details and roles to let the club know you better.
          </div>
          {!readOnly && (
            <button
              onClick={onEdit}
              style={{
                padding: '8px 22px', borderRadius: 10,
                background: '#772432', color: '#fff',
                fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
              }}
            >
              Fill in my profile
            </button>
          )}
        </div>
      )}

      {/* ── Sign Out ── */}
      <button
        onClick={onSignOut}
        style={{
          width: '100%', marginTop: 4, marginBottom: 8,
          padding: '11px 0', borderRadius: 12,
          border: '1.5px solid #E6E2DE', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, fontWeight: 700, color: '#6B7280',
          cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#fecaca'
          e.currentTarget.style.background = '#fef2f2'
          e.currentTarget.style.color = '#dc2626'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#E6E2DE'
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.color = '#6B7280'
        }}
      >
        <LogOut size={15} />
        Sign Out
      </button>
    </div>
  )
}

// ─── Profile Edit form ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, profile, saveProfile, logout } = useAuthContext()
  const [mode, setMode] = useState<'view' | 'edit'>('view')

  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const serverDraft = useMemo(() => draftFromProfile(profile), [profile])
  const seededRef = useRef(JSON.stringify(serverDraft))

  useEffect(() => {
    const nextSerialized = JSON.stringify(serverDraft)
    if (nextSerialized === seededRef.current) return
    setDraft((current) => {
      const hasLocalEdits = JSON.stringify(current) !== seededRef.current
      seededRef.current = nextSerialized
      return hasLocalEdits ? current : serverDraft
    })
  }, [serverDraft])

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(serverDraft), [draft, serverDraft])

  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setSaved(false)
    setDraft((d) => ({ ...d, [key]: value }))
    if (key === 'phone') {
      setPhoneError(null)
    }
  }

  const toggleRole = (role: string) => {
    const current = draft.rolesHeld ?? []
    set('rolesHeld', current.includes(role) ? current.filter((r) => r !== role) : [...current, role])
  }

  const handlePhotoChange = (photo: { photoURL: string; photoPublicId: string; photoVersion: number }) => {
    setSaved(false)
    setDraft((d) => ({ ...d, ...photo }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPhoneError(null)

    const phoneValidationError = validatePhoneNumber(draft.phone ?? '')
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
      return
    }

    setSaving(true)
    try {
      await saveProfile(draft)
      setSaved(true)
      setMode('view')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(serverDraft)
    seededRef.current = JSON.stringify(serverDraft)
    setSaved(false)
    setError(null)
    setMode('view')
  }

  return (
    <div className="min-h-screen bg-[#F4F3F1] text-[#1A1519] pb-20">
      <AppHeader
        title={mode === 'edit' ? 'Edit Profile' : 'Profile'}
        right={
          mode === 'edit' ? (
            <button
              onClick={handleCancel}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 13px', borderRadius: 8,
                background: '#F3F4F6', color: '#6B7280',
                fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
              }}
            >
              <X size={12} />
              Cancel
            </button>
          ) : undefined
        }
      />

      {mode === 'view' ? (
        <div className="pt-4 sm:pt-6">
          <div className="max-w-[520px] mx-auto px-4 sm:px-0">
            <NextMeetingBanner />
          </div>
          <ProfileView profile={profile} email={user?.email} onEdit={() => setMode('edit')} onSignOut={logout} />
        </div>
      ) : (
        <div className="max-w-[680px] mx-auto px-4 sm:px-7 py-4 sm:py-6">
          <EmailVerificationBanner />

          <Section title="Account" description="Your photo and how the club sees your name.">
            <ProfilePhotoUpload
              photoURL={draft.photoURL}
              photoPublicId={draft.photoPublicId}
              photoVersion={draft.photoVersion}
              displayName={draft.displayName}
              email={user?.email ?? undefined}
              onChange={handlePhotoChange}
            />
            <div className="mt-4">
              <form onSubmit={handleSave} id="profile-form" noValidate>
                <TextField
                  id="displayName" label="Display name"
                  value={draft.displayName ?? ''} onChange={(v) => set('displayName', v)}
                  placeholder="Your name" optional
                />
                <TextField
                  id="email" label="Email"
                  value={user?.email ?? ''} onChange={() => {}}
                  icon={Mail} disabled
                  hint={user?.emailVerified ? 'Verified' : 'Not verified yet — check the banner above.'}
                />
                <div className="flex items-center gap-2 text-[11.5px] sm:text-[12px] text-[#6B6470]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A29BA6]" />
                  Account type:{' '}
                  <span className="font-bold text-[#1A1519] capitalize">
                    {(profile?.roles?.length ? profile.roles : ['guest']).join(', ')}
                  </span>
                </div>
              </form>
            </div>
          </Section>

          <Section title="Personal details" description="Everything below is optional — share what you like.">
            <TextField id="phone" label="Phone" value={draft.phone ?? ''} onChange={(v) => set('phone', v)} placeholder="+91 9876543210" icon={Phone} type="tel" optional error={phoneError} hint="10 digits (e.g., 9876543210)" />
            <TextField id="city" label="City" value={draft.city ?? ''} onChange={(v) => set('city', v)} placeholder="Bengaluru" icon={MapPin} optional />
            <TextField id="dateOfBirth" label="Date of birth" type="date" value={draft.dateOfBirth ?? ''} onChange={(v) => set('dateOfBirth', v)} hint="Only your birth month and day are shown to others — never the year." optional />
            <TextAreaField id="note" label="Anything you'd like the club to know" value={draft.note ?? ''} onChange={(v) => set('note', v)} placeholder="Availability, interests, accessibility needs…" maxLength={300} optional />
          </Section>

          <Section title="Toastmasters" description="Your club membership and pathway progress.">
            <div className="grid sm:grid-cols-2 sm:gap-x-4">
              <TextField id="clubName" label="Club name" value={draft.clubName ?? ''} onChange={(v) => set('clubName', v)} placeholder="Dhwani Toastmasters" optional />
              <TextField id="clubNumber" label="Club number" value={draft.clubNumber ?? ''} onChange={(v) => set('clubNumber', v)} placeholder="04410336" optional />
              <TextField id="memberSince" label="Member since" type="date" value={draft.memberSince ?? ''} onChange={(v) => set('memberSince', v)} optional />
              <SelectField id="level" label="Current level" value={draft.level ?? ''} onChange={(v) => set('level', v)} options={LEVELS} optional />
            </div>
            <SelectField id="pathway" label="Pathway" value={draft.pathway ?? ''} onChange={(v) => set('pathway', v)} options={PATHWAYS} optional />
            <ChipSelect label="Roles you've held" options={CLUB_ROLES} selected={draft.rolesHeld ?? []} onToggle={toggleRole} optional />
          </Section>

          <Section title="About you" description="A short bio and where members can find you.">
            <TextAreaField id="bio" label="Bio" value={draft.bio ?? ''} onChange={(v) => set('bio', v)} placeholder="A couple of lines about you and what brought you to Toastmasters." rows={4} maxLength={500} optional />
            <div className="grid sm:grid-cols-2 sm:gap-x-4">
              <TextField id="linkedin" label="LinkedIn" value={draft.linkedin ?? ''} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/yourname" optional />
              <TextField id="instagram" label="Instagram" value={draft.instagram ?? ''} onChange={(v) => set('instagram', v)} placeholder="@yourhandle" optional />
            </div>
          </Section>

          {error ? <FormAlert kind="error">{error}</FormAlert> : null}
          {saved && !dirty ? <FormAlert kind="success">Profile saved.</FormAlert> : null}

          <div className="sticky bottom-0 -mx-4 sm:-mx-7 px-4 sm:px-7 py-3 bg-[#F4F3F1]/90 backdrop-blur-md border-t border-[#E6E2DE] flex items-center gap-3">
            <span className="text-[11px] sm:text-[12px] text-[#6B6470] flex-1">
              {dirty ? 'Unsaved changes.' : 'All changes saved.'}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-white border border-[#D6D1CC] text-[#6B6470] text-[12px] sm:text-[13px] font-bold transition-colors hover:border-[#772432] hover:text-[#772432]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={!dirty || saving}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#772432] text-white text-[12px] sm:text-[13px] font-bold transition-colors hover:bg-[#5A1926] disabled:bg-[#D6D1CC] disabled:text-[#8F8892] disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
