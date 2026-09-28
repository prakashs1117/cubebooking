import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { AdvancedImage } from '@cloudinary/react'
import { useAuthContext } from '../context/AuthContext'
import { isGuestOnly } from '../lib/roles'
import { avatarImage } from '../lib/cloudinaryImage'
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore'
import { track } from '../lib/analytics'
import { NextMeetingBanner } from './roster/NextMeetingBanner'
import { GuestRsvpBanner } from './roster/GuestRsvpBanner'
import { PublicNextMeetingTeaser } from './roster/PublicNextMeetingTeaser'
import { VotingBanner } from './roster/VotingBanner'
import { usePosts } from '../hooks/usePosts'
import PostCard from './blog/PostCard'
import PostSkeleton from './blog/PostSkeleton'
import { Modal } from './ui/Modal'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  User,
  Phone,
  MapPin,
  Clock,
  Users,
  Landmark,
  Video,
  AlertCircle,
} from 'lucide-react'

const MAPS_URL =
  'https://www.google.com/maps/place/Dhwani+Toastmasters+Club/@12.8998954,77.5699281,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae15cc4a071f47:0x8d7ed9dd01b9bdfc!8m2!3d12.8998954!4d77.5699281!16s%2Fg%2F11hzxsc8gs'
const INSTAGRAM_URL = 'https://www.instagram.com/dhwani_toastmasters/'
const LINKEDIN_URL = 'https://www.linkedin.com/in/dhwanitmc/'
const FACEBOOK_URL = 'https://www.facebook.com/groups/dhwani.toastmasters'

function InstagramMark({ size = 20 }: { size?: number }) {
  const gid = 'ig-grad'
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0" y1="34" x2="34" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFDD55" />
          <stop offset="0.35" stopColor="#FF543E" />
          <stop offset="0.65" stopColor="#C837AB" />
          <stop offset="1" stopColor="#5B51D8" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="9" fill={`url(#${gid})`} />
      <rect x="9.5" y="9.5" width="15" height="15" rx="5" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17" cy="17" r="4.2" stroke="#fff" strokeWidth="1.8" />
      <circle cx="22.6" cy="11.4" r="1.1" fill="#fff" />
    </svg>
  )
}

function FacebookMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="34" height="34" rx="9" fill="#1877F2" />
      <path
        d="M20.6 17.3h-2.9V27h-4v-9.7h-2v-3.4h2v-2.3c0-2.5 1.2-4.2 4.5-4.2h2.9v3.4h-1.9c-1.2 0-1.5.6-1.5 1.5v1.6h3.4l-.5 3.4Z"
        fill="#fff"
      />
    </svg>
  )
}

function LinkedInMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="34" height="34" rx="9" fill="#0A66C2" />
      <path
        d="M9.9 13.2h3.6V25H9.9V13.2Zm1.8-5.7a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM16.4 13.2h3.4v1.6h.05c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.4V25h-3.6v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V25h-3.6V13.2Z"
        fill="#fff"
      />
    </svg>
  )
}

function WhatsAppMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="34" height="34" rx="9" fill="#25D366" />
      <path
        d="M23.3 19.7c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-2.6-1.6 9.7 9.7 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.7l.5-.6.4-.6c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.1 1.2-1.1 2.8s1.2 3.3 1.3 3.5c.2.2 2.3 3.6 5.6 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.6.3-.7.3-1.4.2-1.5l-.6-.3Z"
        fill="#fff"
      />
      <path
        d="M17 7a9.9 9.9 0 0 0-8.4 15.2L7.4 27l4.9-1.3A9.9 9.9 0 1 0 17 7Zm0 18.1a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 17 25.1Z"
        fill="#fff"
      />
    </svg>
  )
}

const WHATSAPP_NUMBER = '9738101117'
const WHATSAPP_MESSAGE =
  "Hi Dhwani Toastmasters! I'd like to know more about visiting the club as a guest. Could you share the details?"

function whatsappLink(phone: string = WHATSAPP_NUMBER, message = WHATSAPP_MESSAGE) {
  const digits = phone.replace(/\D/g, '')
  const num = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

const SOCIAL_LINKS = [
  { id: 'instagram', href: INSTAGRAM_URL, Mark: InstagramMark },
  { id: 'linkedin', href: LINKEDIN_URL, Mark: LinkedInMark },
  { id: 'facebook', href: FACEBOOK_URL, Mark: FacebookMark },
]


const CLUB_DEFAULTS = {
  name: 'Dhwani Toastmasters',
  number: '04410336',
  area: 'Area D04',
  division: 'Division D',
  district: 'District 92',
  day: 'Every Saturday',
  time: '3:00 – 5:00 PM',
  meetingMode: 'in-person' as 'in-person' | 'online' | 'hybrid',
  meetingLink: '',
  calendarInviteLink: '',
  phone: '+91 86604 54918',
  venue: 'Transcend College, Post Office Rd',
  address: 'Krishna Devaraya Nagar, Yelachenahalli, Kumaraswamy Layout, Bengaluru 560078',
  restriction: 'Open to all — no membership restrictions',
  website: '',
  facebook: '',
  updatedAt: undefined as any,
}

/**
 * Prefixes the label only when the admin hasn't already typed it, so a stored
 * value of "D4" renders "Area D4" while "Area D04" is left alone. These are
 * free-text fields, so both spellings turn up in practice.
 */
function withLabel(label: string, value?: string) {
  const v = value?.trim()
  if (!v) return ''
  return new RegExp(`^${label}\\b`, 'i').test(v) ? v : `${label} ${v}`
}

/** "Area D04 · Division D · District 92", skipping anything not filled in. */
function clubOrgLine(club: { area?: string; division?: string; district?: string }) {
  return [
    withLabel('Area', club.area),
    withLabel('Division', club.division),
    withLabel('District', club.district),
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Check if club info is stale (>7 days old). Returns { isStale, daysOld, lastUpdated }. */
function checkStaleness(updatedAt?: any) {
  if (!updatedAt) return { isStale: false, daysOld: 0, lastUpdated: '' }
  const updated = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt)
  const now = new Date()
  const daysOld = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24))
  const isStale = daysOld > 7
  const lastUpdated = updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return { isStale, daysOld, lastUpdated }
}

function useClub() {
  const [club, setClub] = useState(CLUB_DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const q = query(collection(db, 'club-details'), limit(1))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const d = snap.docs[0].data() as any
          setClub({
            name: d.clubName || CLUB_DEFAULTS.name,
            number: d.clubNumber || CLUB_DEFAULTS.number,
            area: d.area || CLUB_DEFAULTS.area,
            division: d.division || CLUB_DEFAULTS.division,
            district: d.district || CLUB_DEFAULTS.district,
            day: d.meetingDay || CLUB_DEFAULTS.day,
            time: d.meetingTime || CLUB_DEFAULTS.time,
            meetingMode: (d.meetingMode as any) || CLUB_DEFAULTS.meetingMode,
            meetingLink: d.meetingLink || '',
            calendarInviteLink: d.calendarInviteLink || '',
            phone: d.phone || CLUB_DEFAULTS.phone,
            venue: d.locationName || CLUB_DEFAULTS.venue,
            address: [d.address, d.city, d.state].filter(Boolean).join(', ') || CLUB_DEFAULTS.address,
            restriction: d.membershipRestriction || CLUB_DEFAULTS.restriction,
            website: d.website || '',
            facebook: d.facebookPage || '',
            updatedAt: d.updatedAt,
          } as any)
        }
      } catch (error) {
        console.error('Error fetching club details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClub()
  }, [])

  return { club, loading }
}

const Q_PAIRS = [
  [
    {
      id: 'goal',
      kind: 'multi' as const,
      q: 'What are you hoping to get better at?',
      sub: 'Pick as many as you like.',
      opts: ['Public speaking', 'Confidence', 'Leadership', 'Interviews', 'Networking', 'Just curious'],
    },
    {
      id: 'level',
      kind: 'single' as const,
      q: 'How much speaking experience do you have?',
      opts: ['Complete beginner', 'Spoken a few times', 'Comfortable already', 'Experienced speaker'],
    },
  ],
  [
    {
      id: 'visit',
      kind: 'single' as const,
      q: 'When would you like to visit us?',
      sub: 'We meet in person every Saturday, 3:00 to 5:00 PM.',
      opts: ['This Saturday', 'Next Saturday', 'Sometime this month', 'Still deciding'],
    },
    {
      id: 'travel',
      kind: 'single' as const,
      q: 'Where would you be travelling from?',
      sub: 'Helps us tell you the easiest way to reach the venue.',
      opts: ['Nearby', 'Elsewhere in the city', 'Outside the city'],
    },
  ],
  [
    {
      id: 'source',
      kind: 'single' as const,
      q: 'How did you find us?',
      opts: ['Instagram', 'A friend or colleague', 'Google search', 'LinkedIn', 'Somewhere else'],
    },
    {
      id: 'callTime',
      kind: 'single' as const,
      q: "What's the right time to call you?",
      sub: 'Someone from the club will reach out around then.',
      opts: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
    },
  ],
]

type Answers = Record<string, string | string[] | undefined>

interface ContactForm {
  name: string
  phone: string
  email: string
  city: string
  note: string
}

const INITIAL_CONTACT: ContactForm = { name: '', phone: '', email: '', city: '', note: '' }

/** Members' entry point into sign-in / their profile. */
function AuthLink() {
  const { user, profile } = useAuthContext()
  if (!user && !profile) return null

  if (!user) {
    return (
      <Link
        to="/signin"
        className="px-3.5 py-1.5 rounded-full bg-[#772432] text-white text-[11.5px] font-bold transition-colors hover:bg-[#5A1926] shrink-0"
      >
        Sign in
      </Link>
    )
  }

  const label = (profile?.displayName || user.displayName || user.email || '?').trim()
  const initials = label.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')

  return (
    <Link to="/profile" aria-label="Your profile" className="shrink-0">
      {profile?.photoPublicId ? (
        <AdvancedImage
          cldImg={avatarImage(profile.photoPublicId, 64, profile.photoVersion)}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-[#D6D1CC]"
        />
      ) : profile?.photoURL ? (
        <img
          src={profile.photoURL}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-[#D6D1CC]"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#772432] to-[#5A1926] text-[#F2DF74] text-[11px] font-extrabold flex items-center justify-center">
          {initials}
        </div>
      )}
    </Link>
  )
}

function Header({ showInfo = true }: { showInfo?: boolean }) {
  const { club } = useClub()
  return (
    <div className="sticky top-0 z-20 bg-[#F4F3F1]/85 backdrop-blur-md border-b border-[#E6E2DE]">
      <div className="max-w-[560px] mx-auto px-5 sm:px-7 flex items-center gap-3 py-3">
        <Link to="/" aria-label={`${club.name} home`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <img src="/favicon.svg" alt="Dhwani Toastmasters" className="w-[38px] h-[38px] rounded-xl shrink-0 transition-transform group-hover:scale-105" />
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-extrabold tracking-tight truncate">{club.name}</div>
            <div className="text-[11.5px] text-[#A29BA6] font-semibold truncate">{clubOrgLine(club)}</div>
          </div>
        </Link>
        {showInfo ? (
          <a
            href="#club-info"
            className="hidden sm:inline-block px-3.5 py-1.5 rounded-full border border-[#D6D1CC] text-[#772432] bg-white text-[11.5px] font-bold transition-colors hover:bg-[#772432] hover:border-[#772432] hover:text-white"
          >
            Club info
          </a>
        ) : null}
        {/* WhatsApp icon — mobile only */}
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          className="sm:hidden w-[34px] h-[34px] rounded-full flex items-center justify-center overflow-hidden shrink-0 transition-transform hover:scale-105"
        >
          <WhatsAppMark size={34} />
        </a>
        {/* Profile avatar / Sign in — desktop only */}
        <div className="hidden sm:block">
          <AuthLink />
        </div>
      </div>
    </div>
  )
}

function ClubInfoCard() {
  const { club } = useClub()
  const staleness = checkStaleness(club.updatedAt)
  const modeLabel = club.meetingMode === 'in-person' ? 'In-person' : club.meetingMode === 'online' ? 'Online' : 'Hybrid'

  const rows: [typeof Clock, string, string, string?][] = [
    [Clock, 'Meeting times', `${club.day}, ${club.time}`],
    [Video, 'Meeting mode', modeLabel],
    [Landmark, 'Area & District', clubOrgLine(club)],
    [MapPin, 'Location', `${club.venue}, ${club.address}`, MAPS_URL],
    [Users, 'Membership', club.restriction],
  ]
  return (
    <div id="club-info" className="max-w-[560px] mx-auto px-4 sm:px-7 pb-8 sm:pb-11">
      <div className="bg-white border border-[#E6E2DE] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-br from-[#772432] to-[#5A1926]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/75">Club information</div>
            <div className="text-[13.5px] sm:text-[15px] font-extrabold text-white mt-0.5 tracking-tight">{club.name}</div>
          </div>
        </div>
        <div className="grid divide-y divide-[#E6E2DE] border-t border-[#E6E2DE]">
          {rows.map(([Icon, label, value, href]) => {
            const Wrapper = href ? 'a' : 'div'
            return (
              <Wrapper
                key={label}
                {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`flex gap-3 px-4 py-2.5 sm:px-5 sm:py-3 ${href ? 'transition-colors hover:bg-[#FAF9F8]' : ''}`}
              >
                <div className="pt-0.5 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#772432]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#A29BA6]">{label}</div>
                  <div className={`text-[12.5px] font-semibold leading-snug ${href ? 'text-[#772432] underline underline-offset-2' : 'text-[#1A1519]'}`}>
                    {value}
                  </div>
                </div>
              </Wrapper>
            )
          })}
        </div>

        {/* Staleness warning */}
        {staleness.isStale && (
          <div className="px-5 py-3 bg-amber-50 border-t border-[#E6E2DE] flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-800">
              Information last updated {staleness.lastUpdated} — please verify details before attending
            </p>
          </div>
        )}

        {/* Meeting action buttons */}
        {(club.meetingLink || club.calendarInviteLink) && (
          <div className="px-5 py-3.5 border-t border-[#E6E2DE] flex gap-2">
            {club.meetingLink && (club.meetingMode === 'online' || club.meetingMode === 'hybrid') && (
              <a
                href={club.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-[#772432] text-white text-[12px] font-semibold rounded-lg text-center transition-colors hover:bg-[#5A1926]"
              >
                Join Meeting
              </a>
            )}
            {club.calendarInviteLink && (
              <a
                href={club.calendarInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-[#E6E2DE] text-[#1A1519] text-[12px] font-semibold rounded-lg text-center transition-colors hover:bg-[#D6D1CC]"
              >
                Add to Calendar
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[#E6E2DE]">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get directions"
            className="h-9 w-9 rounded-full border border-[#D6D1CC] text-[#772432] bg-white flex items-center justify-center transition-colors hover:bg-[#FBEEF0] hover:border-[#772432]"
          >
            <MapPin className="w-[15px] h-[15px]" />
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message us on WhatsApp"
            className="h-9 w-9 rounded-full border border-[#D6D1CC] bg-white flex items-center justify-center overflow-hidden transition-transform hover:scale-105"
          >
            <WhatsAppMark size={17} />
          </a>
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow on ${s.id}`}
              className="h-9 w-9 rounded-full border border-[#D6D1CC] bg-white flex items-center justify-center overflow-hidden transition-transform hover:scale-105"
            >
              <s.Mark size={17} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeBlogPreview() {
  const { posts, loading } = usePosts('blog')
  const preview = posts.slice(0, 3)
  if (!loading && preview.length === 0) return null
  return (
    <div className="max-w-[560px] mx-auto px-4 sm:px-7 pb-8 sm:pb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-extrabold tracking-tight text-[#1A1519]">
          From the Community
        </h2>
        <Link to="/blog" className="text-[12px] font-bold text-[#772432] hover:underline">
          See all posts →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {loading
          ? [0, 1, 2].map(i => <PostSkeleton key={i} />)
          : preview.map(post => <PostCard key={post.id} post={post} compact />)}
      </div>
    </div>
  )
}

function Hero({ onStart }: { onStart: () => void }) {
  const { club } = useClub()
  const steps = [
    { n: '01', t: 'Come as a guest, free', d: 'Sit in on a full meeting. No fee, no pressure to speak.' },
    { n: '02', t: 'Take a small role', d: 'Time a speech or count filler words. Two minutes on your feet.' },
    { n: '03', t: 'Give your first speech', d: 'Your Ice Breaker, four to six minutes, whenever you feel ready.' },
  ]
  const meta = [
    { Icon: Clock, t: `${club.day.replace('Every ', '')}s, ${club.time}` },
    { Icon: MapPin, t: club.venue, href: MAPS_URL },
    { Icon: Users, t: 'In person · open to all' },
  ]

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#772432] via-[#772432] to-[#5A1926] text-white pt-7 pb-7 sm:pt-12 sm:pb-11">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute -right-20 -top-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,.18), transparent 70%)' }}
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute -left-24 bottom-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(242,223,116,.16), transparent 70%)' }}
        />
        <div className="max-w-[560px] mx-auto px-4 sm:px-7 relative">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 px-3 py-1 rounded-full text-[10.5px] sm:text-[11.5px] font-bold tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2DF74] animate-pulse" />
            Now welcoming guests
          </motion.div>
          <h1 className="mt-2.5 sm:mt-4 font-extrabold tracking-[-0.04em] leading-[1] text-[clamp(22px,5.5vw,36px)]">
            {['Speak like the room', 'is yours.'].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.85, ease: [0.2, 0.8, 0.3, 1], delay: 0.15 + i * 0.09 }}
                  className="block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-2 max-w-[440px] text-white/80 leading-snug text-[13px] sm:text-[15px]"
          >
            {club.name} meets every Saturday afternoon. Prepared speeches, impromptu speaking and evaluation — in a room that's genuinely kind about it.
          </motion.p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {meta.map(({ Icon, t, href }, i) => {
              const Wrapper = href ? motion.a : motion.div
              return (
                <Wrapper
                  key={t}
                  {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.07 }}
                  className={`flex items-center gap-1.5 ${href ? 'hover:opacity-80 transition-opacity' : ''}`}
                >
                  <Icon className="w-[13px] h-[13px] text-white/70" />
                  <span className="text-[11.5px] font-semibold text-white/80">{t}</span>
                </Wrapper>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[560px] mx-auto px-4 sm:px-7 pt-4 sm:pt-7 pb-8 sm:pb-10">
        <div className="grid gap-2.5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.55 + i * 0.1 }}
              className="flex gap-3 p-3 sm:p-4 bg-white border border-[#E6E2DE] rounded-xl shadow-[0_1px_2px_rgba(26,21,25,.04)]"
            >
              <span className="text-[11px] font-extrabold text-[#C9962B] tracking-wide shrink-0 pt-0.5">{s.n}</span>
              <div>
                <div className="text-[13px] sm:text-[14px] font-bold tracking-tight leading-snug">{s.t}</div>
                <div className="text-[12px] text-[#6B6470] mt-0.5 leading-snug">{s.d}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="mt-4 w-full h-11 sm:h-14 rounded-full bg-[#1A1519] text-white flex items-center justify-center gap-2 text-[13.5px] sm:text-[15.5px] font-bold transition-colors hover:bg-[#772432]"
        >
          Tell us about yourself
          <ChevronRight className="w-[16px] h-[16px]" strokeWidth={2.2} />
        </motion.button>
        <motion.a
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          whileTap={{ scale: 0.96 }}
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full h-11 sm:h-14 rounded-full bg-white border border-[#D6D1CC] text-[#1A1519] flex items-center justify-center gap-2 text-[13px] sm:text-[15px] font-bold transition-colors hover:border-[#25D366] hover:bg-[#F3FCF6]"
        >
          <WhatsAppMark size={17} />
          Ask us on WhatsApp
        </motion.a>
        <div className="text-center text-[11px] text-[#A29BA6] mt-2">Five quick questions · about a minute</div>
      </div>
      <ClubInfoCard />
    </div>
  )
}

function StepDots({ total, index }: { total: number; index: number }) {
  const pct = ((index + 1) / total) * 100
  return (
    <div className="flex items-center gap-2.5 flex-1 max-w-[220px]">
      <div className="flex-1 h-[5px] rounded-full bg-[#E6E2DE] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#772432] transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11.5px] font-bold text-[#A29BA6] tabular-nums shrink-0">
        {index + 1}/{total}
      </span>
    </div>
  )
}

function TextField({
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = 'text',
  multiline,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon?: typeof User
  type?: string
  multiline?: boolean
}) {
  const cls = `w-full bg-white border border-[#D6D1CC] rounded-xl text-[13px] text-[#1A1519] outline-none resize-none transition-shadow focus:border-[#772432] focus:shadow-[0_0_0_3px_rgba(119,36,50,.12)] ${
    Icon ? 'pl-9 pr-3' : 'px-3'
  } py-2`
  return (
    <div className="relative">
      {Icon ? (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-3.5 h-3.5 text-[#A29BA6]" />
        </div>
      ) : null}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}

// Modal is imported from ./ui/Modal

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#D6D1CC] border-t-[#772432] animate-spin" />
    </div>
  )
}

export default function ClubInterestPage() {
  const { club, loading } = useClub()
  const { user: authUser, profile: authProfile } = useAuthContext()
  const [step, setStep] = useState(-1)
  const [dir, setDir] = useState(1)
  const [ans, setAns] = useState<Answers>({})
  const [contact, setContact] = useState<ContactForm>(INITIAL_CONTACT)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const P = Q_PAIRS.length
  const isContact = step === P
  const isThanks = step === P + 1
  const currentPair = step >= 0 && step < P ? Q_PAIRS[step] : null
  const filled = currentPair
    ? currentPair.every(q => q.kind === 'multi' ? ((ans[q.id] as string[]) || []).length > 0 : !!ans[q.id])
    : true
  const phoneOk = contact.phone.replace(/\D/g, '').length === 10
  const contactOk = contact.name.trim().length > 1 && phoneOk && /\S+@\S+\.\S+/.test(contact.email)

  const setContactField = (k: keyof ContactForm) => (v: string) =>
    setContact((o) => ({ ...o, [k]: v }))

  const next = () => {
    setDir(1)
    setStep((s) => s + 1)
  }
  const back = () => {
    setDir(-1)
    setStep((s) => s - 1)
  }
  const closeFlow = () => {
    setStep(-1)
    if (isThanks) {
      setAns({})
      setContact(INITIAL_CONTACT)
    }
  }

  const selectOpt = (isMulti: boolean, on: boolean, o: string, qid: string) => {
    if (isMulti) {
      setAns((a) => {
        const cur = (a[qid] as string[]) || []
        return { ...a, [qid]: on ? cur.filter((x) => x !== o) : [...cur, o] }
      })
    } else {
      setAns((a) => ({ ...a, [qid]: o }))
    }
  }

  const handleSubmit = async () => {
    if (!contactOk) return
    setSubmitting(true)
    setSubmitError('')
    const writePromise = addDoc(collection(db, 'toastmaster-onboarding'), {
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      city: contact.city,
      note: contact.note,
      answers: {
        goal: ans.goal || [],
        level: ans.level || '',
        when: ans.visit || '',
        travel: ans.travel || '',
        source: ans.source || '',
        callTime: ans.callTime || '',
      },
      submittedAt: serverTimestamp(),
    })
    writePromise.catch((error) => console.error('Submission sync error:', error))
    try {
      await addDoc(collection(db, 'toastmaster-onboarding'), {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        city: contact.city,
        note: contact.note,
        answers: {
          goal: ans.goal || [],
          level: ans.level || '',
          when: ans.visit || '',
          travel: ans.travel || '',
          source: ans.source || '',
          callTime: ans.callTime || '',
        },
        submittedAt: serverTimestamp(),
      })
      track({ name: 'interest_form_submitted', params: { city: contact.city || undefined } })
      setDir(1)
      setStep(P + 1)
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  const thanksContent = (
        <div className="px-5 sm:px-7 flex flex-col justify-center py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-[104px] h-[104px] mx-auto rounded-full bg-[#1E8E5A] flex items-center justify-center shadow-[0_8px_22px_-10px_rgba(30,142,90,.5)]"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.28 }}
              >
                <Check className="w-9 h-9 text-white" strokeWidth={2.6} />
              </motion.div>
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-6 font-extrabold tracking-[-0.03em] leading-[1.14] text-[clamp(26px,6.5vw,33px)]"
            >
              Thanks, {contact.name.split(' ')[0] || 'friend'} — we'll be in touch.
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="mt-3 mx-auto max-w-[400px] text-[15px] text-[#6B6470] leading-relaxed"
            >
              Someone from the club will call you and walk you through your first Saturday visit at{' '}
              {club.venue}.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white border border-[#E6E2DE] rounded-2xl p-5 mt-7 shadow-[0_1px_2px_rgba(26,21,25,.04),0_8px_24px_-12px_rgba(26,21,25,.12)]"
          >
            <div className="text-[11px] font-bold text-[#A29BA6] uppercase tracking-wider">What we have</div>
            <div className="mt-2.5 grid gap-2">
              {[
                { Icon: User, v: contact.name },
                { Icon: Phone, v: contact.phone },
                { Icon: Mail, v: contact.email },
                { Icon: MapPin, v: contact.city },
                { Icon: Clock, v: ans.callTime ? `Best time to call: ${ans.callTime}` : '' },
              ]
                .filter((r) => r.v)
                .map((r) => (
                  <div key={r.v} className="flex items-center gap-2.5">
                    <r.Icon className="w-[15px] h-[15px] text-[#A29BA6]" />
                    <span className="text-[13.5px] font-semibold text-[#1A1519]">{r.v}</span>
                  </div>
                ))}
            </div>
          </motion.div>

          <motion.a
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.53 }}
            whileTap={{ scale: 0.96 }}
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full py-3.5 rounded-full bg-white border border-[#D6D1CC] flex items-center justify-center gap-2.5 text-[15px] font-bold transition-colors hover:border-[#25D366] hover:bg-[#F3FCF6]"
          >
            <WhatsAppMark size={20} />
            Message us on WhatsApp
          </motion.a>

          <div className="mt-7">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.55 }}
              className="text-[15.5px] font-bold tracking-tight text-center"
            >
              Give us a follow
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.58 }}
              className="text-[13px] text-[#6B6470] text-center mt-1.5 leading-relaxed"
            >
              Contests, guest nights and speaker highlights.
            </motion.div>
            <div className="flex items-center justify-center gap-3 mt-4">
              {SOCIAL_LINKS.map((s, i) => (
                <motion.a
                  key={s.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.62 + i * 0.08 }}
                  whileTap={{ scale: 0.92 }}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow on ${s.id}`}
                  className="w-12 h-12 rounded-full bg-white border border-[#E6E2DE] flex items-center justify-center overflow-hidden shadow-[0_1px_2px_rgba(26,21,25,.04),0_8px_24px_-12px_rgba(26,21,25,.12)] transition-transform hover:scale-105"
                >
                  <s.Mark size={24} />
                </motion.a>
              ))}
            </div>
          </div>
          <div className="text-center mt-9 text-[12.5px] text-[#A29BA6] leading-relaxed">
            <div>{club.name} · {clubOrgLine(club)}</div>
            <div className="mt-1">{club.venue}, {club.address}</div>
          </div>
        </div>
  )

  const flowContent = (
    <div className="flex flex-col min-h-[62vh] mb-10 sm:mb-0">
      <div className="px-4 sm:px-7 w-full pt-4 pb-1 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={back}
          className="w-8 h-8 flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft className="w-[17px] h-[17px] text-[#1A1519]" strokeWidth={2} />
        </motion.button>
        <StepDots total={P + 1} index={step} />
        <div className="w-8 shrink-0 ml-auto" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ x: 34 * dir, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.3, 1] }}
          className="px-4 sm:px-7 w-full flex-1 flex flex-col pt-4 pb-7"
        >
          {currentPair ? (
            <div className="flex flex-col gap-7">
              {currentPair.map((q) => {
                const val = ans[q.id]
                return (
                  <div key={q.id}>
                    <h2 className="font-extrabold tracking-[-0.03em] leading-[1.15] text-[clamp(16px,4.5vw,20px)]" style={{ textWrap: 'pretty' }}>
                      {q.q}
                    </h2>
                    {q.sub ? <p className="text-[12px] text-[#6B6470] mt-1 leading-snug">{q.sub}</p> : null}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {q.opts.map((o) => {
                        const on = q.kind === 'multi' ? ((val as string[]) || []).includes(o) : val === o
                        const dimmed = q.kind === 'single' && !!val && !on
                        return (
                          <motion.button
                            key={o}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => selectOpt(q.kind === 'multi', on, o, q.id)}
                            aria-pressed={on}
                            className={`px-4 py-2 rounded-full border text-[13px] font-bold tracking-tight text-center transition-all ${
                              on
                                ? 'bg-[#1A1519] border-[#1A1519] text-white shadow-[0_8px_22px_-10px_rgba(0,0,0,.45)]'
                                : 'bg-white border-[#D6D1CC] text-[#1A1519] hover:border-[#772432]/40'
                            } ${dimmed ? 'opacity-45 hover:opacity-100' : ''}`}
                          >
                            {o}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {isContact ? (
            <>
              <h2 className="font-extrabold tracking-[-0.03em] leading-[1.15] text-[clamp(19px,5vw,26px)]">How do we reach you?</h2>
              <p className="text-[12px] text-[#6B6470] mt-1.5 leading-snug">
                We'll call you on the number you give us. Only the club committee sees this — we won't add you to any list.
              </p>
              <div className="grid gap-2 mt-4">
                <TextField value={contact.name} onChange={setContactField('name')} placeholder="Full name" icon={User} />
                <TextField value={contact.phone} onChange={setContactField('phone')} placeholder="Phone number" icon={Phone} type="tel" />
                <TextField value={contact.email} onChange={setContactField('email')} placeholder="Email address" icon={Mail} type="email" />
                <TextField value={contact.city} onChange={setContactField('city')} placeholder="City" icon={MapPin} />
                <TextField
                  value={contact.note}
                  onChange={setContactField('note')}
                  placeholder="Anything you'd like us to know? (optional)"
                  multiline
                />
              </div>
              {submitError ? <p className="text-[12px] text-red-600 mt-2">{submitError}</p> : null}
            </>
          ) : null}

          <div className="mt-auto pt-5 flex items-center justify-between gap-3">
            <span className="text-[11.5px] text-[#A29BA6] font-semibold">
              {isContact
                ? 'We reply within 2 days'
                : filled
                ? 'All set!'
                : 'Answer both questions'}
            </span>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={isContact ? handleSubmit : next}
              disabled={isContact ? !contactOk || submitting : !filled}
              className={`h-11 min-w-[48px] rounded-full flex items-center justify-center gap-2 transition-colors ${
                isContact ? 'px-6' : ''
              } ${(isContact ? contactOk : filled) ? 'bg-[#1A1519] hover:bg-[#772432]' : 'bg-[#D6D1CC]'} ${
                isContact && !contactOk ? 'cursor-default' : 'cursor-pointer'
              } disabled:opacity-40`}
            >
              {isContact ? (
                <span className="text-[13px] font-bold text-white">{submitting ? 'Sending…' : 'Send my details'}</span>
              ) : null}
              <ChevronRight className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )

  const showNextMeeting = !!authUser && !isGuestOnly(authProfile)
  const showGuestRsvp = !!authUser && isGuestOnly(authProfile)

  return (
    <div className="min-h-screen bg-[#F4F3F1] text-[#1A1519] font-sans antialiased">
      <Header />

      {/* Signed-in member — next meeting + role banner */}
      {showNextMeeting && (
        <div className="max-w-[560px] mx-auto px-5 sm:px-7 pt-4">
          <NextMeetingBanner />
          <VotingBanner />
        </div>
      )}

      {/* Guest — upcoming meeting RSVP only */}
      {showGuestRsvp && (
        <div className="max-w-[560px] mx-auto px-5 sm:px-7 pt-4">
          <GuestRsvpBanner />
          <VotingBanner />
        </div>
      )}

      {/* Not signed in — public teaser with signup CTA */}
      {!authUser && (
        <div className="max-w-[560px] mx-auto px-5 sm:px-7 pt-4">
          <PublicNextMeetingTeaser />
          <VotingBanner />
        </div>
      )}

      <Hero
        onStart={() => {
          setDir(1)
          setStep(0)
          track({ name: 'interest_form_started' })
        }}
      />
      <HomeBlogPreview />
      <AnimatePresence>
        {step >= 0 ? (
          <Modal key="flow" scrollKey={step} onClose={closeFlow}>
            {isThanks ? thanksContent : flowContent}
          </Modal>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
