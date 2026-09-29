import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, startOfWeek, format, isSameDay, addWeeks } from 'date-fns'
import { useIntl } from 'react-intl'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'
import { useSlotAvailability } from '../../hooks/queries/useBookings'
import { SLOT_HOURS, COMBO_PAIRS, slotToDate, slotEndDate, dateToSlotKey } from '../../config/slots'
import type { ProgramId } from '../../shared/types'

// ─── Typed slot shapes ────────────────────────────────────────────────────────

interface SingleSlotItem {
  kind: 'single'
  startHour: number
  programId: ProgramId
  start: Date
  end: Date
  disabled: boolean
  reason: 'taken' | 'yours' | null
  label: string
  endLabel: string
}

interface ComboSlotItem {
  kind: 'combo'
  startHour: number
  endHour: number
  firstProg: ProgramId
  secondProg: ProgramId
  start: Date
  end: Date
  disabled: boolean
  reason: 'taken' | 'yours' | null
  label: string
  endLabel: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgramIds(selection: string | null, order: string): ProgramId[] {
  if (selection === 'cube') return ['cube']
  if (selection === 'lab') return ['lab']
  if (selection === 'both') return order === 'cube-first' ? ['cube', 'lab'] : ['lab', 'cube']
  return []
}

function getStepTitle(selection: string | null, order: string, intl: ReturnType<typeof useIntl>): string {
  if (selection === 'cube') return intl.formatMessage({ id: 'program.cube' })
  if (selection === 'lab')  return intl.formatMessage({ id: 'program.lab' })
  if (selection === 'both') return `${intl.formatMessage({ id: 'program.both' })} · ${order === 'cube-first' ? intl.formatMessage({ id: 'bookPrograms.order.cubeFirst.label' }) : intl.formatMessage({ id: 'bookPrograms.order.labFirst.label' })}`
  return intl.formatMessage({ id: 'bookTime.title' })
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookTimePage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const { programSelection, programOrder, selectedDate, slots, setSelectedDate, setSlots, startHold } = useBookingStore()

  const [weekOffset, setWeekOffset] = useState(0)

  const DOW_LABELS = [
    intl.formatMessage({ id: 'bookTime.dow.mon' }),
    intl.formatMessage({ id: 'bookTime.dow.tue' }),
    intl.formatMessage({ id: 'bookTime.dow.wed' }),
    intl.formatMessage({ id: 'bookTime.dow.thu' }),
    intl.formatMessage({ id: 'bookTime.dow.fri' }),
  ]

  const todayRef = useRef<Date>((() => { const d = new Date(); d.setHours(0,0,0,0); return d })())
  const tomorrowRef = useRef<Date>((() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+1); return d })())
  const today    = todayRef.current
  const tomorrow = tomorrowRef.current

  const baseWeek = useMemo(() => {
    const base = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
    base.setHours(0, 0, 0, 0)
    return base
  }, [weekOffset, today])

  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => addDays(baseWeek, i)),
    [baseWeek],
  )

  const programIds = getProgramIds(programSelection, programOrder)
  const dateKey = selectedDate ? formatDateKey(selectedDate) : null

  const availabilityMap = useSlotAvailability(programIds, dateKey)

  // Auto-advance to first bookable day of this week if no date selected
  useEffect(() => {
    if (!selectedDate) {
      const firstBookable = weekDays.find((d) => d >= tomorrow)
      if (firstBookable) setSelectedDate(new Date(firstBookable))
    }
  }, [selectedDate, weekDays, tomorrow, setSelectedDate])

  const singleTimes = useMemo((): SingleSlotItem[] => {
    if (!dateKey || programSelection === 'both') return []
    const pid = programIds[0]
    return SLOT_HOURS.map((h) => {
      const key = dateToSlotKey(dateKey, h)
      const status = availabilityMap[key]
      return {
        kind: 'single' as const,
        startHour: h,
        programId: pid,
        start: slotToDate(dateKey, h),
        end: slotEndDate(dateKey, h),
        disabled: !!status,
        reason: status ?? null,
        label: intl.formatTime(slotToDate(dateKey, h), { hour: '2-digit', minute: '2-digit' }),
        endLabel: intl.formatTime(slotEndDate(dateKey, h), { hour: '2-digit', minute: '2-digit' }),
      }
    })
  }, [dateKey, programSelection, programIds, availabilityMap, intl])

  const comboTimes = useMemo((): ComboSlotItem[] => {
    if (!dateKey || programSelection !== 'both') return []
    const firstProg = programIds[0]
    const secondProg = programIds[1]
    return COMBO_PAIRS.map(([h1, h2]) => {
      const key1 = dateToSlotKey(dateKey, h1)
      const key2 = dateToSlotKey(dateKey, h2)
      const s1 = availabilityMap[key1]
      const s2 = availabilityMap[key2]
      const disabled = !!(s1 || s2)
      const reason: 'taken' | 'yours' | null = disabled
        ? (s1 === 'yours' && s2 === 'yours' ? 'yours' : 'taken')
        : null
      return {
        kind: 'combo' as const,
        startHour: h1,
        endHour: h2 + 1,
        firstProg,
        secondProg,
        start: slotToDate(dateKey, h1),
        end: slotEndDate(dateKey, h2),
        disabled,
        reason,
        label: intl.formatTime(slotToDate(dateKey, h1), { hour: '2-digit', minute: '2-digit' }),
        endLabel: intl.formatTime(slotEndDate(dateKey, h2), { hour: '2-digit', minute: '2-digit' }),
      }
    })
  }, [dateKey, programSelection, programIds, availabilityMap, intl])

  const selectedSlotKey = slots.length > 0 ? dateToSlotKey(slots[0].date, slots[0].startHour) : null

  const handleSelectSingle = (h: number, pid: ProgramId) => {
    if (!dateKey) return
    setSlots([{
      programId: pid,
      date: dateKey,
      startHour: h,
      start: slotToDate(dateKey, h),
      end: slotEndDate(dateKey, h),
    }])
  }

  const handleSelectCombo = (h1: number, h2: number, firstProg: ProgramId, secondProg: ProgramId) => {
    if (!dateKey) return
    setSlots([
      { programId: firstProg,  date: dateKey, startHour: h1, start: slotToDate(dateKey, h1), end: slotEndDate(dateKey, h1) },
      { programId: secondProg, date: dateKey, startHour: h2, start: slotToDate(dateKey, h2), end: slotEndDate(dateKey, h2) },
    ])
  }

  const handleContinue = () => {
    startHold()
    navigate('/book/details')
  }

  const monthLabel = intl.formatDate(weekDays[0], { month: 'long', year: 'numeric' })

  return (
    <BookingLayout
      title={getStepTitle(programSelection, programOrder, intl)}
      step={3}
      totalSteps={4}
      onBack="/book/programs"
      footer={<ContinueButton disabled={slots.length === 0} onClick={handleContinue} />}
    >
      {/* Month + week nav */}
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-[28px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {monthLabel}
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            disabled={weekOffset <= 0}
            className="iconbtn tap border disabled:opacity-30"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            aria-label="Previous week"
          >
            <ChevronLeft className="i" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="iconbtn tap border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            aria-label="Next week"
          >
            <ChevronRight className="i" />
          </button>
        </div>
      </div>

      {/* 5-day week grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {weekDays.map((day, i) => {
          const dayMidnight = new Date(day.getFullYear(), day.getMonth(), day.getDate())
          const isPast = dayMidnight < tomorrow
          const isSel = selectedDate ? isSameDay(day, selectedDate) : false
          const closed = isPast

          return (
            <button
              key={i}
              type="button"
              disabled={closed}
              aria-pressed={isSel}
              onClick={() => { setSelectedDate(day); setSlots([]) }}
              className="tap flex flex-col items-center justify-center gap-0.5 rounded-[18px] border h-[84px] transition-colors"
              style={{
                background: isSel ? 'var(--primary)' : closed ? 'transparent' : 'var(--card)',
                color: isSel ? '#fff' : closed ? 'var(--muted-foreground)' : 'var(--foreground)',
                borderColor: isSel ? 'var(--primary)' : closed ? 'var(--border)' : 'var(--border)',
                boxShadow: isSel ? 'var(--shadow-float)' : 'var(--shadow-xs)',
                cursor: closed ? 'default' : 'pointer',
                opacity: closed ? 0.4 : 1,
              }}
            >
              <span className="text-xs font-semibold">{DOW_LABELS[i]}</span>
              <span className="text-2xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                {format(day, 'd')}
              </span>
              {!closed && !isSel && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Time slots for selected day */}
      {selectedDate && dateKey && (
        <div className="rise flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          <div className="flex flex-col gap-2">
            {programSelection !== 'both'
              ? singleTimes.map((s) => {
                  const key = dateToSlotKey(dateKey, s.startHour)
                  const isSel = !s.disabled && selectedSlotKey === key

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={s.disabled}
                      onClick={() => handleSelectSingle(s.startHour, s.programId)}
                      className="flex items-center px-4 h-14 rounded-2xl border-2 text-sm"
                      style={{
                        background: isSel ? 'var(--tint-purple)' : 'var(--card)',
                        borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                        color: s.disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                        opacity: s.disabled ? 0.55 : 1,
                        cursor: s.disabled ? 'default' : 'pointer',
                      }}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span className="mx-1.5 opacity-40">–</span>
                      <span className="font-semibold">{s.endLabel}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: isSel ? 'rgba(80,50,145,0.12)' : 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        1h
                      </span>
                      {s.reason ? (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          {s.reason === 'yours'
                            ? intl.formatMessage({ id: 'bookTime.slot.yours' })
                            : intl.formatMessage({ id: 'bookTime.slot.booked' })}
                        </span>
                      ) : (
                        <span className="ml-auto w-5 h-5 rounded-full box-border flex-none transition-all"
                          style={{ border: isSel ? '6px solid var(--primary)' : '2px solid var(--border)' }} />
                      )}
                    </button>
                  )
                })
              : comboTimes.map((s) => {
                  const key = dateToSlotKey(dateKey, s.startHour)
                  const isSel = !s.disabled && selectedSlotKey === key

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={s.disabled}
                      onClick={() => handleSelectCombo(s.startHour, s.startHour + 1, s.firstProg, s.secondProg)}
                      className="flex items-center px-4 h-14 rounded-2xl border-2 text-sm"
                      style={{
                        background: isSel ? 'var(--tint-purple)' : 'var(--card)',
                        borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                        color: s.disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                        opacity: s.disabled ? 0.55 : 1,
                        cursor: s.disabled ? 'default' : 'pointer',
                      }}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span className="mx-1.5 opacity-40">–</span>
                      <span className="font-semibold">{s.endLabel}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: isSel ? 'rgba(80,50,145,0.12)' : 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        2h
                      </span>
                      {s.reason ? (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                          {s.reason === 'yours'
                            ? intl.formatMessage({ id: 'bookTime.slot.yours' })
                            : intl.formatMessage({ id: 'bookTime.slot.booked' })}
                        </span>
                      ) : (
                        <span className="ml-auto w-5 h-5 rounded-full box-border flex-none transition-all"
                          style={{ border: isSel ? '6px solid var(--primary)' : '2px solid var(--border)' }} />
                      )}
                    </button>
                  )
                })
            }
          </div>
        </div>
      )}
    </BookingLayout>
  )
}
