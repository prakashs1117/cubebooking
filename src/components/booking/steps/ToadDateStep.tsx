import { useState, useEffect, useRef, type RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useBookingStore } from '../../../stores/bookingStore'
import type { SelectedSlot } from '../../../stores/bookingStore'
import { ContinueButton } from '../BookingLayout'
import { useAuthContext } from '../../../context/AuthContext'
import {
  useToadDateAvailability,
  holdToadDate,
  releaseToadHold,
} from '../../../services/toadSlotService'

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function calendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const offset = first === 0 ? 6 : first - 1
  const days: (number | null)[] = Array(offset).fill(null)
  const total = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= total; d++) days.push(d)
  return days
}

export function ToadDateStep({ onContinue, confirmedRef }: { onContinue: () => void; confirmedRef?: RefObject<boolean> }) {
  const intl = useIntl()
  const { user } = useAuthContext()
  const { setSlots } = useBookingStore()
  const availability = useToadDateAvailability()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [viewYear, setViewYear] = useState(tomorrow.getFullYear())
  const [viewMonth, setViewMonth] = useState(tomorrow.getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [holding, setHolding] = useState(false)
  const [holdError, setHoldError] = useState<string | null>(null)

  // Track what hold we placed so we can release it on unmount
  const heldDateRef = useRef<string | null>(null)

  // Release hold on unmount unless the booking was already confirmed
  useEffect(() => {
    return () => {
      if (heldDateRef.current && user?.uid && !confirmedRef?.current) {
        releaseToadHold(heldDateRef.current, user.uid)
        heldDateRef.current = null
      }
    }
  }, [user?.uid, confirmedRef])

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

  const canGoPrev = viewYear > tomorrow.getFullYear() || viewMonth > tomorrow.getMonth()

  const handleSelect = (d: number) => {
    const dow = new Date(viewYear, viewMonth, d).getDay()
    if (dow === 0 || dow === 6) return
    const date = isoDate(viewYear, viewMonth, d)
    const dateObj = new Date(viewYear, viewMonth, d)
    if (dateObj <= today) return
    const status = availability[date]
    if (status === 'held' || status === 'confirmed') return
    setHoldError(null)
    setSelected(date)
    const start = new Date(viewYear, viewMonth, d, 9, 0, 0)
    const end   = new Date(viewYear, viewMonth, d, 10, 30, 0)
    const slot: SelectedSlot = { programId: 'toad', date, startHour: 9, start, end }
    setSlots([slot])
  }

  const handleContinue = async () => {
    if (!selected || !user?.uid) return
    setHolding(true)
    setHoldError(null)
    // Release any previous hold before acquiring the new one
    if (heldDateRef.current && heldDateRef.current !== selected) {
      await releaseToadHold(heldDateRef.current, user.uid)
      heldDateRef.current = null
    }
    try {
      await holdToadDate(selected, user.uid)
      heldDateRef.current = selected
      onContinue()
    } catch {
      // Another teacher grabbed this date in the race window
      setHoldError(intl.formatMessage({ id: 'toad.date.holdFailed' }))
      setSelected(null)
      setSlots([])
    } finally {
      setHolding(false)
    }
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
          <button type="button" onClick={prevMonth} disabled={!canGoPrev}
            className="iconbtn tap disabled:opacity-30" aria-label="Previous month"
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 10 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <button type="button" onClick={nextMonth}
            className="iconbtn tap" aria-label="Next month"
            style={{ width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 10 }}>
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Day-of-week headers */}
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
            const dateObj = new Date(viewYear, viewMonth, d)
            const isWeekend = dow === 0 || dow === 6
            const isPast = dateObj <= today
            const slotStatus = availability[date]
            const isConfirmed = slotStatus === 'confirmed'
            const isHeld = slotStatus === 'held'
            const isDisabled = isWeekend || isPast || isConfirmed || isHeld
            const isSel = date === selected

            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(d)}
                aria-pressed={isSel}
                aria-label={intl.formatDate(dateObj, { weekday: 'long', day: 'numeric', month: 'long' })}
                className="tap relative flex flex-col items-center justify-center gap-0.5"
                style={{
                  height: isConfirmed || isHeld ? 48 : 40,
                  borderRadius: 10,
                  border: isSel ? '2px solid var(--brand-magenta)' : '1px solid transparent',
                  background: isSel
                    ? 'var(--tint-magenta)'
                    : isConfirmed
                    ? 'rgba(220,38,38,0.08)'
                    : isHeld
                    ? 'rgba(217,119,6,0.08)'
                    : 'transparent',
                  color: isDisabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                  opacity: (isWeekend || isPast) ? 0.35 : 1,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: isSel ? 700 : 400,
                  cursor: isDisabled ? 'default' : 'pointer',
                }}
              >
                <span>{d}</span>
                {isConfirmed && (
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--destructive)', lineHeight: 1 }}>
                    {intl.formatMessage({ id: 'toad.date.booked' })}
                  </span>
                )}
                {isHeld && (
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--brand-orange)', lineHeight: 1 }}>
                    {intl.formatMessage({ id: 'toad.date.held' })}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-1 justify-center flex-wrap">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(220,38,38,0.15)', display: 'inline-block' }} />
            {intl.formatMessage({ id: 'toad.date.legend.booked' })}
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(217,119,6,0.15)', display: 'inline-block' }} />
            {intl.formatMessage({ id: 'toad.date.legend.held' })}
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--tint-magenta)', border: '1.5px solid var(--brand-magenta)', display: 'inline-block' }} />
            {intl.formatMessage({ id: 'toad.date.legend.selected' })}
          </span>
        </div>
      </div>

      {holdError && (
        <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
          {holdError}
        </div>
      )}

      {selected && (
        <p className="m-0 text-sm font-medium text-center" style={{ color: 'var(--brand-magenta)' }}>
          {intl.formatDate(new Date(selected + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}

      <ContinueButton disabled={!selected} loading={holding} onClick={handleContinue} />
    </>
  )
}
