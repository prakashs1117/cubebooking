import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, startOfWeek, format, isSameDay, addWeeks } from 'date-fns'
import { useIntl } from 'react-intl'
import { useBookingStore } from '../../../stores/bookingStore'
import { useSlotAvailability } from '../../../hooks/queries/useBookings'
import { SLOT_HOURS, COMBO_PAIRS, slotToDate, slotEndDate, dateToSlotKey } from '../../../config/slots'
import type { ProgramId } from '../../../shared/types'

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
  secondHour: number
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

interface Props {
  onContinue: () => void
}

export function BookTimeStep({ onContinue }: Props) {
  const intl = useIntl()
  const { programSelection, programOrder, selectedDate, setSelectedDate, setSlots } = useBookingStore()

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
        secondHour: h2,
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

  const handleSelectSingle = (h: number, pid: ProgramId) => {
    if (!dateKey) return
    setSlots([{
      programId: pid,
      date: dateKey,
      startHour: h,
      start: slotToDate(dateKey, h),
      end: slotEndDate(dateKey, h),
    }])
    onContinue()
  }

  const handleSelectCombo = (h1: number, h2: number, firstProg: ProgramId, secondProg: ProgramId) => {
    if (!dateKey) return
    setSlots([
      { programId: firstProg,  date: dateKey, startHour: h1, start: slotToDate(dateKey, h1), end: slotEndDate(dateKey, h1) },
      { programId: secondProg, date: dateKey, startHour: h2, start: slotToDate(dateKey, h2), end: slotEndDate(dateKey, h2) },
    ])
    onContinue()
  }

  const monthLabel = intl.formatDate(weekDays[0], { month: 'long', year: 'numeric' })
  const stepTitle = getStepTitle(programSelection, programOrder, intl)

  return (
    <>
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

      {stepTitle && (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{stepTitle}</p>
      )}

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

      {selectedDate && dateKey && (
        <div className="rise flex flex-col gap-5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          {programSelection !== 'both'
            ? (['morning', 'afternoon'] as const).map((period) => {
                const slots = singleTimes.filter((s) =>
                  period === 'morning' ? s.startHour < 12 : s.startHour >= 12
                )
                return (
                  <div key={period} className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      {period === 'morning' ? '☀️ Morning' : '🌤 Afternoon'}
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {slots.map((s) => {
                        const key = dateToSlotKey(dateKey, s.startHour)
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={s.disabled}
                            onClick={() => handleSelectSingle(s.startHour, s.programId)}
                            className="tap flex-none flex flex-col items-center justify-center gap-1 rounded-2xl border text-sm"
                            style={{
                              width: 88, minHeight: 80,
                              background: 'var(--card)', borderColor: 'var(--border)',
                              opacity: s.disabled ? 0.45 : 1,
                              cursor: s.disabled ? 'default' : 'pointer',
                            }}
                          >
                            <span className="font-bold text-[15px]" style={{ color: s.disabled ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{s.label}</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{s.endLabel}</span>
                            {s.reason ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                {s.reason === 'yours' ? intl.formatMessage({ id: 'bookTime.slot.yours' }) : intl.formatMessage({ id: 'bookTime.slot.booked' })}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>1h</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            : (['morning', 'afternoon'] as const).map((period) => {
                const slots = comboTimes.filter((s) =>
                  period === 'morning' ? s.startHour < 12 : s.startHour >= 12
                )
                return (
                  <div key={period} className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      {period === 'morning' ? '☀️ Morning' : '🌤 Afternoon'}
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {slots.map((s) => {
                        const key = dateToSlotKey(dateKey, s.startHour)
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={s.disabled}
                            onClick={() => handleSelectCombo(s.startHour, s.secondHour, s.firstProg, s.secondProg)}
                            className="tap flex-none flex flex-col items-center justify-center gap-1 rounded-2xl border text-sm"
                            style={{
                              width: 104, minHeight: 80,
                              background: 'var(--card)', borderColor: 'var(--border)',
                              opacity: s.disabled ? 0.45 : 1,
                              cursor: s.disabled ? 'default' : 'pointer',
                            }}
                          >
                            <span className="font-bold text-[15px]" style={{ color: s.disabled ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{s.label}</span>
                            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{s.endLabel}</span>
                            {s.reason ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                {s.reason === 'yours' ? intl.formatMessage({ id: 'bookTime.slot.yours' }) : intl.formatMessage({ id: 'bookTime.slot.booked' })}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>2h</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
          }
        </div>
      )}
    </>
  )
}
