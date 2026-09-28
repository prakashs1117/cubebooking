import { Link } from 'react-router-dom'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useMyBookings } from '../../hooks/queries/useBookings'
import { format } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'

const PROGRAM_CARDS = [
  {
    id: 'onsite',
    label: 'Onsite STEM Visit',
    description: 'Book the Curiosity Cube, Lab, or both for your class at Merck in Darmstadt.',
    accent: 'var(--cube)',
    tint: 'var(--tint-purple)',
    href: '/book',
    icons: ['🔬', '⚗️'],
    tag: 'Confirmed instantly',
    tagColor: 'var(--brand-green)',
    tagBg: 'rgba(1,136,76,0.1)',
  },
  {
    id: 'toad',
    label: 'TOAD Truck Visit',
    description: 'Request the mobile TOAD lab to come directly to your school.',
    accent: 'var(--toad)',
    tint: 'var(--tint-magenta)',
    href: '/book',
    icons: ['🚚', '🧪'],
    tag: 'Subject to approval',
    tagColor: 'var(--brand-magenta)',
    tagBg: 'rgba(235,60,150,0.1)',
  },
] as const

function GreetingByTime() {
  const hour = new Date().getHours()
  if (hour < 12) return <>Good morning</>
  if (hour < 18) return <>Good afternoon</>
  return <>Good evening</>
}

export default function HomePage() {
  const { profile } = useAuthContext()
  const { data: bookings = [] } = useMyBookings()
  const name = profile?.displayName || 'there'

  const nextBooking = bookings.find((b) => {
    if (b.status === 'cancelled') return false
    try {
      const seg = b.segments?.[0] as unknown as { start?: Timestamp }
      return seg?.start ? seg.start.toDate() > new Date() : false
    } catch { return false }
  })

  const nextStart = (() => {
    try {
      const seg = nextBooking?.segments?.[0] as unknown as { start?: Timestamp }
      return seg?.start?.toDate()
    } catch { return undefined }
  })()

  const daysToGo = nextStart ? Math.ceil((nextStart.getTime() - Date.now()) / 86_400_000) : null
  const nextLabel = nextBooking
    ? [...new Set(nextBooking.segments?.map((s) => s.programId) ?? [])].length > 1 ? 'Cube + Lab' : nextBooking.segments?.[0]?.programId === 'cube' ? 'Curiosity Cube' : 'Curiosity Lab'
    : null

  return (
    <div
      className="flex flex-col"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)', minHeight: '100%' }}
    >
      <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-3xl lg:max-w-4xl mx-auto w-full pb-24 lg:pb-8">
        {/* Greeting */}
        <div className="rise flex flex-col gap-1">
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <GreetingByTime />,
          </div>
          <h1 className="m-0 text-3xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {name}
          </h1>
          {profile?.schoolId && (
            <div className="flex items-center gap-1.5 text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              <MapPin className="i i-sm" style={{ width: 14, height: 14 }} />
              Darmstadt
            </div>
          )}
        </div>

        {/* Upcoming booking card */}
        <Link
          to={nextBooking ? `/bookings/${nextBooking.id}` : '/book'}
          className="rise-2 tap relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--brand-purple)', color: '#ffffff', boxShadow: 'var(--shadow-float)', textDecoration: 'none' }}
        >
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '9999px', background: 'var(--brand-magenta)', right: -60, top: -70, opacity: 0.9 }} />
          <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '9999px', background: 'var(--brand-mint)', right: 40, top: 40, opacity: 0.9 }} />

          <div className="relative flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#ffffff', color: nextBooking ? 'var(--brand-green)' : 'var(--muted-foreground)' }}>
                {nextBooking ? '✓ Confirmed' : '→ Book now'}
              </span>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mt-1.5">Your next visit</div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                {nextLabel ?? 'Book your first session'}
              </div>
            </div>
            {daysToGo !== null && (
              <div className="text-center rounded-2xl px-3 py-2" style={{ background: 'rgba(14,14,17,0.28)', backdropFilter: 'blur(8px)' }}>
                <div className="text-3xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)' }}>{daysToGo}</div>
                <div className="text-xs font-semibold opacity-80 mt-1">days to go</div>
              </div>
            )}
          </div>

          <div className="relative flex flex-col gap-1 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Calendar className="i i-sm" style={{ width: 14, height: 14 }} />
              <span>
                {nextStart ? format(nextStart, 'EEE, d MMM yyyy') : 'No upcoming visits yet'}
              </span>
            </div>
          </div>
        </Link>

        {/* Booking CTAs */}
        <div className="rise-3">
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Book a visit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROGRAM_CARDS.map((card) => (
              <Link
                key={card.id}
                to={card.href}
                className="tap flex flex-col gap-4 p-5 rounded-2xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xs)', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 text-2xl">{card.icons.map((ic) => <span key={ic}>{ic}</span>)}</div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: card.tagBg, color: card.tagColor }}>
                    {card.tag}
                  </span>
                </div>
                <div>
                  <div className="font-bold mb-1">{card.label}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{card.description}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: card.id === 'toad' ? 'var(--brand-magenta)' : 'var(--primary)' }}>
                  Book now <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
