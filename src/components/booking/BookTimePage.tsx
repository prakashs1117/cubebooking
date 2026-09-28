import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { addDays, startOfWeek, format, isSameDay, addWeeks } from 'date-fns'
import { useIntl } from 'react-intl'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'
import { useSessionsForWeek } from '../../hooks/queries/useSessions'
import type { ProgramId, Session } from '../../shared/types'
import type { Timestamp } from 'firebase/firestore'

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

type SessionDoc = Session & { id: string }

function toDate(val: unknown): Date {
  return (val as Timestamp).toDate()
}

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

  // Stable reference: today midnight and tomorrow midnight
  const todayRef = useRef<Date>((() => { const d = new Date(); d.setHours(0,0,0,0); return d })())
  const tomorrowRef = useRef<Date>((() => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+1); return d })())
  const today    = todayRef.current
  const tomorrow = tomorrowRef.current

  // Start on the week that contains tomorrow
  const baseWeek = useMemo(() => {
    const base = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
    base.setHours(0, 0, 0, 0)
    return base
  }, [weekOffset, today])

  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => addDays(baseWeek, i)),
    [baseWeek],
  )

  // Give a full 7-day window to account for timezone offsets
  const weekEnd = addDays(baseWeek, 7)
  const programIds = getProgramIds(programSelection, programOrder)

  const { data: sessions = [], isLoading, isError } = useSessionsForWeek(
    programIds,
    baseWeek,
    weekEnd,
    programIds.length > 0,
  )

  // Group sessions by the LOCAL date string of their start time
  const sessionsByDay = useMemo(() => {
    const map: Record<string, SessionDoc[]> = {}
    for (const s of sessions) {
      const start = toDate(s.start)
      // Use local date string so IST/CET/etc. days match what the calendar shows
      const key = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toDateString()
      if (!map[key]) map[key] = []
      map[key].push(s as unknown as SessionDoc)
    }
    return map
  }, [sessions])

  const availableTimes = useMemo(() => {
    if (!selectedDate) return []
    const key = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toDateString()
    const daySessions = sessionsByDay[key] ?? []

    if (programSelection !== 'both') {
      // Deduplicate by start time (seed may have created duplicates)
      const seen = new Set<string>()
      return daySessions
        .filter((s) => {
          const available = s.capacity - s.seatsTaken - s.seatsHeld
          if (available <= 0) return false
          const timeKey = toDate(s.start).getTime().toString()
          if (seen.has(timeKey)) return false
          seen.add(timeKey)
          return true
        })
        .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())
        .map((s) => ({
          label: intl.formatTime(toDate(s.start), { hour: '2-digit', minute: '2-digit' }),
          endLabel: intl.formatTime(toDate(s.end), { hour: '2-digit', minute: '2-digit' }),
          slots: [s],
        }))
    }

    // "Both" — find pairs where second starts exactly when first ends
    const firstProg = programIds[0]
    const secondProg = programIds[1]
    const firsts = daySessions
      .filter((s) => s.programId === firstProg && s.capacity - s.seatsTaken - s.seatsHeld > 0)
      .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())

    const seen = new Set<string>()
    return firsts.flatMap((first) => {
      const firstEnd = toDate(first.end).getTime()
      const match = daySessions.find(
        (s) => s.programId === secondProg
          && toDate(s.start).getTime() === firstEnd
          && s.capacity - s.seatsTaken - s.seatsHeld > 0,
      )
      if (!match) return []
      const key = `${first.id}-${match.id}`
      if (seen.has(key)) return []
      seen.add(key)
      return [{
        label: intl.formatTime(toDate(first.start), { hour: '2-digit', minute: '2-digit' }),
        endLabel: intl.formatTime(toDate(match.end), { hour: '2-digit', minute: '2-digit' }),
        slots: [first, match],
      }]
    })
  }, [selectedDate, sessionsByDay, programSelection, programIds, intl])

  // Auto-select tomorrow when sessions first load and no date is chosen yet
  useEffect(() => {
    if (!selectedDate && !isLoading && sessions.length > 0) {
      const tomorrowKey = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toDateString()
      if (sessionsByDay[tomorrowKey]?.length) {
        setSelectedDate(new Date(tomorrow))
      }
    }
  }, [isLoading, sessions.length, selectedDate, sessionsByDay, tomorrow, setSelectedDate])

  const selectedSlotKey = slots.length > 0 ? slots[0].sessionId : null

  const handleSelectTime = (slotDocs: SessionDoc[]) => {
    setSlots(slotDocs.map((s) => ({
      sessionId: s.id,
      programId: s.programId,
      start: toDate(s.start),
      end: toDate(s.end),
    })))
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

      {/* Connection error banner */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--tint-yellow)' }}>
          <AlertCircle className="w-4 h-4 flex-none" style={{ color: 'var(--brand-orange)' }} />
          <span>Could not load availability. Check your connection and try again.</span>
        </div>
      )}

      {/* 5-day week grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {weekDays.map((day, i) => {
          const dayMidnight = new Date(day.getFullYear(), day.getMonth(), day.getDate())
          const key = dayMidnight.toDateString()
          const hasSessions = (sessionsByDay[key]?.length ?? 0) > 0
          // Block today and past — earliest bookable day is tomorrow
          const isPast = dayMidnight < tomorrow
          const isSel = selectedDate ? isSameDay(day, selectedDate) : false
          // Only mark closed if load is complete (not loading, no error) and genuinely no sessions
          const closed = isPast || (!isLoading && !isError && !hasSessions)

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
              {/* Green dot = sessions available */}
              {!closed && !isSel && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
              )}
              {/* Loading shimmer */}
              {isLoading && !isPast && (
                <span className="w-4 h-1 rounded-full animate-pulse mt-0.5" style={{ background: 'var(--muted)' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Time slots for selected day */}
      {selectedDate && (
        <div className="rise flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
              ))}
            </div>
          ) : availableTimes.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage({ id: 'bookTime.noSlots' })}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableTimes.map(({ label, endLabel, slots: slotDocs }) => {
                const isSel = selectedSlotKey === slotDocs[0].id
                // Calculate total duration in minutes across all segments
                const startMs = toDate(slotDocs[0].start).getTime()
                const endMs   = toDate(slotDocs[slotDocs.length - 1].end).getTime()
                const mins    = Math.round((endMs - startMs) / 60000)
                const durLabel = mins >= 60 ? `${mins / 60}h` : `${mins} min`

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSelectTime(slotDocs as unknown as SessionDoc[])}
                    className="tap flex items-center px-4 h-14 rounded-2xl border-2 text-sm"
                    style={{
                      background: isSel ? 'var(--tint-purple)' : 'var(--card)',
                      borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {/* Time range */}
                    <span className="font-semibold">{label}</span>
                    <span className="mx-1.5 opacity-40">–</span>
                    <span className="font-semibold">{endLabel}</span>
                    {/* Duration badge */}
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: isSel ? 'rgba(80,50,145,0.12)' : 'var(--muted)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {durLabel}
                    </span>
                    {/* Radio indicator */}
                    <span className="ml-auto w-5 h-5 rounded-full box-border flex-none transition-all"
                      style={{ border: isSel ? '6px solid var(--primary)' : '2px solid var(--border)' }}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </BookingLayout>
  )
}
