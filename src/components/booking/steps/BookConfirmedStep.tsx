import { useEffect } from 'react'
import { CalendarPlus, Home } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useBookingStore } from '../../../stores/bookingStore'
import { trackBookingConfirmed } from '../../../services/analyticsService'
import { BookingQRCode } from '../../ui/BookingQRCode'

const BRAND_COLORS = [
  'var(--brand-mint)', 'var(--brand-yellow)', 'var(--brand-magenta)',
  'var(--brand-lime)', 'var(--brand-cyan)', '#ffffff',
]

function randomConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${5 + Math.floor((i / count) * 90)}%`,
    y: `${-10 + Math.floor((i * 17) % 30)}%`,
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
    action: 'TEMPLATE', text: title,
    dates: `${fmt(start)}/${fmt(end)}`, details: desc,
    location: 'Merck KGaA, Frankfurter Str. 250, 64293 Darmstadt',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

interface Props {
  bookingId: string | null
  bookingCode: string | null
  onDone: () => void
}

export function BookConfirmedStep({ bookingId, bookingCode, onDone }: Props) {
  const intl = useIntl()
  const { slots, classDetails, programSelection } = useBookingStore()

  useEffect(() => {
    if (slots.length && programSelection && bookingId) {
      trackBookingConfirmed(bookingId, programSelection)
    }
  }, [slots.length, programSelection, bookingId])

  if (!slots.length) return null

  const firstSlot = slots[0]
  const lastSlot = slots[slots.length - 1]
  const programTitle = programSelection === 'both'
    ? intl.formatMessage({ id: 'program.both' })
    : firstSlot.programId === 'cube'
    ? intl.formatMessage({ id: 'program.cube' })
    : intl.formatMessage({ id: 'program.lab' })
  const dateLabel = intl.formatDate(firstSlot.start, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const timeRange = `${intl.formatDate(firstSlot.start, { hour: '2-digit', minute: '2-digit', hour12: false })}–${intl.formatDate(lastSlot.end, { hour: '2-digit', minute: '2-digit', hour12: false })}`
  const calUrl = makeCalendarUrl(
    `Curiosity ${programTitle} – Class ${classDetails.grade}`,
    firstSlot.start, lastSlot.end,
    `${classDetails.studentCount} students · Grade ${classDetails.grade}`
  )

  return (
    <div
      className="relative flex flex-col rounded-3xl overflow-hidden"
      style={{ background: 'var(--brand-purple)', color: '#ffffff', margin: '0 -20px -32px' }}
    >
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

      {CONFETTI.map((c) => (
        <span
          key={c.id}
          aria-hidden="true"
          style={{
            position: 'absolute', left: c.x, top: c.y,
            width: c.w, height: c.h, borderRadius: c.r, background: c.bg,
            animation: `cfFall 1.1s ${c.delay} cubic-bezier(.2,.8,.2,1) both`,
          }}
        />
      ))}

      {/* Hero */}
      <div className="relative flex flex-col items-center text-center px-7 pt-10 pb-6 gap-3">
        <span
          className="grid place-items-center w-20 h-20 rounded-full"
          style={{
            background: 'var(--brand-mint)', color: 'var(--foreground)',
            boxShadow: '0 0 0 12px rgba(150,215,210,0.22)',
            animation: 'lcPop .6s .1s cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <h1 className="rise-2 m-2 text-[28px] font-extrabold leading-9 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'confirmed.heading' })}
        </h1>
        <p className="rise-3 m-0 text-sm leading-6" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {intl.formatMessage({ id: 'confirmed.sub' }, { programTitle, grade: classDetails.grade, date: dateLabel, time: timeRange })
            .split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>
      </div>

      {/* Booking code + QR card */}
      <div
        className="rise-4 mx-5 rounded-3xl overflow-hidden"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        {/* Code row */}
        <div className="flex items-center gap-4 px-[18px] py-[16px] border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'confirmed.code.label' })}
            </span>
            <span className="text-[20px] font-extrabold tracking-widest" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
              {bookingCode ?? '—'}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'confirmed.code.sub' })}
            </span>
          </div>
          <span
            className="self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
            style={{ background: 'var(--tint-green, #dcfce7)', color: 'var(--brand-green, #16a34a)' }}
          >
            ✓ {intl.formatMessage({ id: 'confirmed.status' })}
          </span>
        </div>

        {/* QR code */}
        {bookingId && (
          <div className="flex flex-col items-center gap-2.5 px-[18px] py-4">
            <div className="p-3 rounded-2xl" style={{ background: '#ffffff' }}>
              <BookingQRCode bookingId={bookingId} size={148} />
            </div>
            <p className="m-0 text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'confirmed.qr.hint' })}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 pt-4 flex flex-col gap-3">
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tap w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border-2"
          style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}
        >
          <CalendarPlus className="w-4 h-4" />
          {intl.formatMessage({ id: 'confirmed.addCalendar' })}
        </a>

        <button
          type="button"
          onClick={onDone}
          className="tap w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          <Home className="w-4 h-4" />
          {intl.formatMessage({ id: 'confirmed.backHome' })}
        </button>
      </div>
    </div>
  )
}
