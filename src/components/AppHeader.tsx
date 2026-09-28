import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, Plus, MessageSquare } from 'lucide-react'
import { AdvancedImage } from '@cloudinary/react'
import { useAuthContext } from '../context/AuthContext'
import { avatarImage } from '../lib/cloudinaryImage'
import { db } from '../firebase'
import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore'

// ─── Club data ────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = '+91 86604 54918'
const WHATSAPP_MESSAGE = "Hi! I'd like to know more about Dhwani Toastmasters."
const CLUB_DEFAULTS = {
  name: 'Dhwani Toastmasters',
  area: 'Area D04', division: 'Division D', district: 'District 92',
}

function withLabel(label: string, value?: string) {
  const v = value?.trim()
  if (!v) return ''
  return new RegExp(`^${label}\\b`, 'i').test(v) ? v : `${label} ${v}`
}

function clubOrgLine(club: { area?: string; division?: string; district?: string }) {
  return [withLabel('Area', club.area), withLabel('Division', club.division), withLabel('District', club.district)]
    .filter(Boolean).join(' · ')
}

function whatsappLink() {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, '')
  const num = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${num}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
}

function useClubName() {
  const [club, setClub] = useState(CLUB_DEFAULTS)
  useEffect(() => {
    getDocs(query(collection(db, 'club-details'), limit(1))).then(snap => {
      if (!snap.empty) {
        const d = snap.docs[0].data() as any
        setClub({
          name: d.clubName || CLUB_DEFAULTS.name,
          area: d.area || CLUB_DEFAULTS.area,
          division: d.division || CLUB_DEFAULTS.division,
          district: d.district || CLUB_DEFAULTS.district,
        })
      }
    }).catch(() => {})
  }, [])
  return club
}

// ─── Dynamic label resolvers ──────────────────────────────────────────────────

function useRosterLabel(rosterId?: string) {
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    if (!rosterId) return
    getDoc(doc(db, 'meetings', rosterId)).then(snap => {
      if (snap.exists()) {
        const d = snap.data() as any
        setLabel(d.meetingNo ? `Meeting #${d.meetingNo}` : 'Meeting')
      }
    }).catch(() => {})
  }, [rosterId])
  return label
}

function usePostLabel(postId?: string) {
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    if (!postId) return
    getDoc(doc(db, 'posts', postId)).then(snap => {
      if (snap.exists()) {
        const d = snap.data() as any
        setLabel(d.title || 'Post')
      }
    }).catch(() => {})
  }, [postId])
  return label
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

interface Crumb { label: string; to?: string }

function useBreadcrumbs(titleOverride?: string): Crumb[] {
  const location = useLocation()
  const params = useParams<{ rosterId?: string; postId?: string }>()
  const rosterLabel = useRosterLabel(params.rosterId)
  const postLabel = usePostLabel(params.postId)
  const path = location.pathname

  if (path === '/' || path === '/onboarding') return []

  if (path === '/profile')           return [{ label: 'Profile' }]
  if (path === '/members')           return [{ label: 'Members' }]
  if (path === '/roster')            return [{ label: 'Rosters' }]
  if (path === '/management')        return [{ label: 'Management' }]
  if (path === '/feedback')          return [{ label: 'Feedback' }]
  if (path === '/signin')            return [{ label: 'Sign in' }]
  if (path === '/signup')            return [{ label: 'Sign up' }]
  if (path === '/forgot-password')   return [{ label: 'Reset password' }]
  if (path === '/blog')              return [{ label: 'Blog' }]
  if (path === '/blog/new')          return [{ label: 'Blog', to: '/blog' }, { label: 'New post' }]
  if (path === '/blog/my')           return [{ label: 'Blog', to: '/blog' }, { label: 'My posts' }]

  if (path.match(/^\/blog\/[^/]+\/edit$/) && params.postId) {
    return [
      { label: 'Blog', to: '/blog' },
      { label: postLabel || 'Post', to: `/blog/${params.postId}` },
      { label: 'Edit' },
    ]
  }
  if (params.postId && path.startsWith('/blog/')) {
    return [{ label: 'Blog', to: '/blog' }, { label: postLabel || titleOverride || 'Post' }]
  }

  if (params.rosterId && path.endsWith('/vote')) {
    return [
      { label: 'Rosters', to: '/roster' },
      { label: rosterLabel || 'Meeting', to: `/roster/${params.rosterId}` },
      { label: 'Awards' },
    ]
  }
  if (params.rosterId) {
    return [{ label: 'Rosters', to: '/roster' }, { label: rosterLabel || titleOverride || 'Meeting' }]
  }

  if (titleOverride) return [{ label: titleOverride }]

  return []
}

// ─── Auth avatar (right side of header) ──────────────────────────────────────

function AuthAvatar() {
  const { user, profile } = useAuthContext()
  if (!user) return null
  const label = (profile?.displayName || user.displayName || user.email || '?').trim()
  const initials = label.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('')
  return (
    <Link to="/profile" aria-label="Your profile" className="shrink-0">
      {profile?.photoPublicId ? (
        <AdvancedImage cldImg={avatarImage(profile.photoPublicId, 64, profile.photoVersion)} alt="" className="w-8 h-8 rounded-full object-cover border border-[#D6D1CC]" />
      ) : profile?.photoURL ? (
        <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-[#D6D1CC]" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#772432] to-[#5A1926] text-[#F2DF74] text-[11px] font-extrabold flex items-center justify-center">
          {initials}
        </div>
      )}
    </Link>
  )
}

// ─── The one universal header ─────────────────────────────────────────────────

interface AppHeaderProps {
  title?: string
  subtitle?: string
  /** @deprecated — breadcrumbs are now auto-derived; kept for compatibility */
  backTo?: string
  /** @deprecated — kept for compatibility */
  backLabel?: string
  right?: React.ReactNode
}

/**
 * Single header used on every page.
 * Looks exactly like the home page header (logo · club name · org line).
 * On inner pages a slim breadcrumb bar appears below it.
 * Logo always links to home; clicking a parent crumb goes back in history.
 */
export default function AppHeader({ title, right }: AppHeaderProps) {
  const club = useClubName()
  const navigate = useNavigate()
  const crumbs = useBreadcrumbs(title)
  const isInnerPage = crumbs.length > 0

  return (
    <div className="sticky top-0 z-30">
      {/* ── Main brand bar — identical to home page ── */}
      <div className="bg-[#F4F3F1]/90 backdrop-blur-md border-b border-[#E6E2DE]">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-7 flex items-center gap-3 py-3">
          <Link to="/" aria-label={`${club.name} home`} className="flex items-center gap-3 flex-1 min-w-0 group">
            <img
              src="/favicon.svg"
              alt="Dhwani Toastmasters"
              className="w-[38px] h-[38px] rounded-xl shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-extrabold tracking-tight truncate">{club.name}</div>
              <div className="text-[11.5px] text-[#A29BA6] font-semibold truncate">{clubOrgLine(club)}</div>
            </div>
          </Link>

          {/* Feedback icon */}
          <Link
            to="/feedback"
            aria-label="Send feedback"
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 text-[#6B7280] hover:text-[#6366f1] transition-colors"
          >
            <MessageSquare size={18} />
          </Link>

          {/* WhatsApp */}
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message us on WhatsApp"
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center overflow-hidden shrink-0 transition-transform hover:scale-105"
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="34" height="34" rx="9" fill="#25D366" />
              <path d="M23.9 10.1A9.77 9.77 0 0 0 17 7.25C11.67 7.25 7.34 11.58 7.34 16.91c0 1.69.44 3.34 1.28 4.79L7.25 26.75l5.2-1.36a9.8 9.8 0 0 0 4.55 1.16h.01c5.32 0 9.65-4.33 9.65-9.66a9.6 9.6 0 0 0-2.76-6.79ZM17 25.18a8.12 8.12 0 0 1-4.14-1.13l-.3-.18-3.08.81.82-3-.19-.31A8.08 8.08 0 0 1 8.86 16.9c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.38 5.77c0 4.5-3.66 8.17-8.17 8.17Zm4.48-6.12c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.17 0-.43.06-.65.31-.23.25-.86.84-.86 2.04s.88 2.37 1 2.53c.13.17 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.1-.23-.16-.47-.28Z" fill="white"/>
            </svg>
          </a>

          {/* Right side: page actions + avatar */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {right && right}
            <AuthAvatar />
          </div>
          {/* Mobile: page actions only (avatar lives in tab bar) */}
          {right && <div className="flex sm:hidden items-center gap-2 shrink-0">{right}</div>}
        </div>
      </div>

      {/* ── Breadcrumb bar — only on inner pages ── */}
      {isInnerPage && (
        <div className="bg-white border-b border-[#E6E2DE]">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-7 flex items-center gap-1 h-8">
            {/* Home anchor */}
            <button
              onClick={() => navigate('/')}
              className="text-[11px] font-semibold text-[#772432] hover:underline bg-transparent border-none p-0 cursor-pointer shrink-0"
              style={{ fontFamily: 'inherit' }}
            >
              Home
            </button>

            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1
              // steps back = how many crumbs are after this one
              const stepsBack = crumbs.length - 1 - i
              return (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  <ChevronRight size={11} className="text-[#D1D5DB] shrink-0" />
                  {crumb.to && !isLast ? (
                    <button
                      onClick={() => navigate(-stepsBack)}
                      className="text-[11px] font-semibold text-[#772432] hover:underline bg-transparent border-none p-0 cursor-pointer shrink-0 whitespace-nowrap"
                      style={{ fontFamily: 'inherit' }}
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={`text-[11px] whitespace-nowrap ${isLast ? 'font-bold text-[#111827] truncate' : 'font-medium text-[#9CA3AF] shrink-0'}`}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** Kept so pages importing SiteHeader still compile without changes. */
export function SiteHeader() {
  return <AppHeader />
}

export function HeaderCreateButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#772432] text-white text-[11px] font-bold cursor-pointer border-none shrink-0 hover:bg-[#5A1926] transition-colors"
      style={{ fontFamily: 'inherit' }}
    >
      <Plus size={13} />
      {label}
    </button>
  )
}
