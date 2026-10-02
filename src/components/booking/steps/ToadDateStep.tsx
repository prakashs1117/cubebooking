import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useBookingStore } from '../../../stores/bookingStore'
import type { SelectedSlot } from '../../../stores/bookingStore'
import { ContinueButton } from '../BookingLayout'

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay() // 0=Sun
  const offset = first === 0 ? 6 : first - 1      // Mon-based
  const days: (number | null)[] = Array(offset).fill(null)
  const total = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= total; d++) days.push(d)
  return days
}

export function ToadDateStep({ onContinue }: { onContinue: () => void }) {
  const intl = useIntl()
  const { setSlots } = useBookingStore()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [viewYear, setViewYear] = useState(tomorrow.getFullYear())
  const [viewMonth, setViewMonth] = useState(tomorrow.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const days = calendarDays(viewYear, viewMonth)
  const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Disable navigation to months before the month containing tomorrow
  const canGoPrev = viewYear > tomorrow.getFullYear() || viewMonth > tomorrow.getMonth()

  const handleSelect = (d: number) => {
    const dow = new Date(viewYear, viewMonth, d).getDay()
    if (dow === 0 || dow === 6) return  // weekend
    const date = isoDate(viewYear, viewMonth, d)
    const dateObj = new Date(viewYear, viewMonth, d)
    if (dateObj <= today) return
    setSelected(date)
    const start = new Date(viewYear, viewMonth, d, 9, 0, 0)
    const end   = new Date(viewYear, viewMonth, d, 10, 30, 0)
    const slot: SelectedSlot = {
      programId: 'toad',
      date,
      startHour: 9,
      start,
      end,
    }
    setSlots([slot])
  }

  const monthLabel = intl.formatDate(new Date(viewYear, viewMonth, 1), { month: 'long', year: 'numeric' })

  return (
    <>
      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'toad.date.heading' })}
      </h1>
      <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {intl.formatMessage({ id: 'toad.date.sub' })}
      </p>

      {/* Calendar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="iconbtn tap disabled:opacity-30"
            aria-label="Previous month"
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 10 }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <button
            type="button"
            onClick={nextMonth}
            className="iconbtn tap"
            aria-label="Next month"
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 10 }}
          >
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {DOW.map((d) => (
            <span key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--muted-foreground)' }}>{d}</span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {days.map((d, i) => {
            if (d === null) return <span key={i} />
            const date = isoDate(viewYear, viewMonth, d)
            const dow = new Date(viewYear, viewMonth, d).getDay()
            const isWeekend = dow === 0 || dow === 6
            const dateObj = new Date(viewYear, viewMonth, d)
            const isPast = dateObj <= today
            const isDisabled = isWeekend || isPast
            const isSel = date === selected
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(d)}
                aria-pressed={isSel}
                aria-label={intl.formatDate(dateObj, { weekday: 'long', day: 'numeric', month: 'long' })}
                className="tap"
                style={{
                  height: 40,
                  borderRadius: 10,
                  border: isSel ? '2px solid var(--brand-magenta)' : '1px solid transparent',
                  background: isSel ? 'var(--tint-magenta)' : 'transparent',
                  color: isDisabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: isDisabled ? 0.35 : 1,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: isSel ? 700 : 400,
                  cursor: isDisabled ? 'default' : 'pointer',
                }}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <p className="m-0 text-sm font-medium text-center" style={{ color: 'var(--brand-magenta)' }}>
          {intl.formatDate(new Date(selected + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}

      <ContinueButton disabled={!selected} onClick={onContinue} />
    </>
  )
}
