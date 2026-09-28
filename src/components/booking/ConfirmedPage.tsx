import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, Home } from 'lucide-react'
import { format } from 'date-fns'
import { useBookingStore } from '../../stores/bookingStore'
import { useAuthContext } from '../../context/AuthContext'
import { trackBookingConfirmed } from '../../services/analyticsService'

const BRAND_COLORS = [
  'var(--brand-mint)', 'var(--brand-yellow)', 'var(--brand-magenta)',
  'var(--brand-lime)', 'var(--brand-cyan)', '#ffffff',
]

function randomConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${5 + Math.floor((i / count) * 90)}%`,
    y: `${-10 + Math.floor(Math.random() * 30)}%`,
    w: 8 + (i % 5) * 3,
    h: 12 + (i % 4) * 4,
    r: i % 3 === 0 ? '50%' : '3px',
    bg: BRAND_COLORS[i % BRAND_COLORS.length],
    delay: `${(i * 0.06).toFixed(2)}s`,
  }))
}

const CONFETTI = randomConfetti(22)

function makeCalendarUrl(title: string, start: Date, end: Date, desc = '') {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: desc,
    location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function ConfirmedPage() {
  const navigate = useNavigate()
  const { slots, classDetails, programSelection, reset } = useBookingStore()
  const { profile } = useAuthContext()

  useEffect(() => {
    if (!slots.length) navigate('/home', { replace: true })
  }, [slots, navigate])

  useEffect(() => {
    if (slots.length && programSelection) {
      const bookingId = `booking_${Date.now()}`
      trackBookingConfirmed(bookingId, programSelection)
    }
  }, [slots.length, programSelection])

  if (!slots.length) return null

  const firstSlot = slots[0]
  const lastSlot = slots[slots.length - 1]
  const programTitle = programSelection === 'both' ? 'Cube + Lab'
    : firstSlot.programId === 'cube' ? 'Curiosity Cube' : 'Curiosity Lab'
  const dateLabel = format(firstSlot.start, 'EEE, d MMM yyyy')
  const timeRange = `${format(firstSlot.start, 'HH:mm')}–${format(lastSlot.end, 'HH:mm')}`
  const calUrl = makeCalendarUrl(
    `Curiosity ${programTitle} – Class ${classDetails.grade}`,
    firstSlot.start,
    lastSlot.end,
    `${classDetails.studentCount} students · Grade ${classDetails.grade}`
  )

  const handleDone = () => {
    reset()
    navigate('/home', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--brand-purple)', fontFamily: 'var(--font-sans)', color: '#ffffff' }}
    >
      {/* Confetti */}
      {CONFETTI.map((c) => (
        <span
          key={c.id}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: c.x,
            top: c.y,
            width: c.w,
            height: c.h,
            borderRadius: c.r,
            background: c.bg,
            animation: `cfFall 1.1s ${c.delay} cubic-bezier(.2,.8,.2,1) both`,
          }}
        />
      ))}

      <style>{`
        @keyframes cfFall {
          0% { transform: translateY(-40px) rotate(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(60vh) rotate(200deg); opacity: 1; }
        }
        @keyframes lcPop {
          0% { transform: scale(.3); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Hero */}
      <div className="relative flex flex-col items-center text-center px-7 pt-24 pb-7 gap-3.5">
        <span
          className="grid place-items-center w-24 h-24 rounded-full"
          style={{
            background: 'var(--brand-mint)',
            color: 'var(--foreground)',
            boxShadow: '0 0 0 12px rgba(150,215,210,0.22)',
            animation: 'lcPop .6s .1s cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className="rise-2 m-2 text-[36px] font-extrabold leading-10 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          You're booked!
        </h1>
        <p className="rise-3 m-0 text-base leading-6" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {programTitle} for class {classDetails.grade}<br />
          {dateLabel} · {timeRange}
        </p>
      </div>

      {/* QR / booking code card */}
      <div
        className="rise-4 mx-5 p-[18px] rounded-3xl flex gap-4 items-center"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <div className="flex-none grid place-items-center w-[84px] h-[84px] rounded-2xl" style={{ background: 'var(--muted)' }}>
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/>
            <rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
            <path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
            <path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/>
            <path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Booking code</span>
          <span className="text-[22px] font-extrabold tracking-widest" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
            {profile?.displayName ? `CC-${profile.displayName.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}` : 'CC-1234'}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Show this on arrival</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto px-5 pb-10 pt-5 flex flex-col gap-3">
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tap w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border-2"
          style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}
        >
          <CalendarPlus className="w-4 h-4" />
          Add to calendar
        </a>

        <button
          type="button"
          onClick={handleDone}
          className="tap w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          <Home className="w-4 h-4" />
          Back to home
        </button>
      </div>
    </div>
  )
}
