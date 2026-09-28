import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, startOfWeek, format, isSameDay, isToday, addWeeks } from 'date-fns'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'
import { useSessionsForWeek } from '../../hooks/queries/useSessions'
import type { ProgramId, Session } from '../../shared/types'
import type { Timestamp } from 'firebase/firestore'

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getProgramIds(selection: string | null, order: string): ProgramId[] {
  if (selection === 'cube') return ['cube']
  if (selection === 'lab') return ['lab']
  if (selection === 'both') return order === 'cube-first' ? ['cube', 'lab'] : ['lab', 'cube']
  return []
}

function getStepTitle(selection: string | null, order: string) {
  if (selection === 'cube') return 'Curiosity Cube'
  if (selection === 'lab') return 'Curiosity Lab'
  if (selection === 'both') return `Cube + Lab · ${order === 'cube-first' ? 'Cube first' : 'Lab first'}`
  return 'Choose time'
}

type SessionDoc = Session & { id: string }

export default function BookTimePage() {
  const navigate = useNavigate()
  const { programSelection, programOrder, selectedDate, slots, setSelectedDate, setSlots, startHold } = useBookingStore()

  const [weekOffset, setWeekOffset] = useState(0)
  const today = new Date()
  const baseWeek = useMemo(() => {
    const mon = startOfWeek(today, { weekStartsOn: 1 })
    return addWeeks(mon, weekOffset)
  }, [weekOffset, today])

  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => addDays(baseWeek, i)),
    [baseWeek]
  )

  const weekEnd = addDays(baseWeek, 5)
  const programIds = getProgramIds(programSelection, programOrder)

  const { data: sessions = [], isLoading } = useSessionsForWeek(
    programIds,
    baseWeek,
    weekEnd,
    programIds.length > 0,
  )

  // Group sessions by date string then by start time
  const sessionsByDay = useMemo(() => {
    const map: Record<string, SessionDoc[]> = {}
    for (const s of sessions) {
      const start = (s.start as unknown as Timestamp).toDate()
      const key = start.toDateString()
      if (!map[key]) map[key] = []
      map[key].push(s as unknown as SessionDoc)
    }
    return map
  }, [sessions])

  const availableTimes = useMemo(() => {
    if (!selectedDate) return []
    const key = selectedDate.toDateString()
    const daySessions = sessionsByDay[key] ?? []

    if (programSelection !== 'both') {
      return daySessions
        .filter((s) => s.capacity - s.seatsTaken - s.seatsHeld > 0)
        .map((s) => ({
          label: format((s.start as unknown as Timestamp).toDate(), 'HH:mm'),
          slots: [s],
        }))
    }

    // For "both": find pairs where second starts exactly when first ends
    const firstProg = programIds[0]
    const secondProg = programIds[1]
    const firsts = daySessions.filter((s) => s.programId === firstProg && s.capacity - s.seatsTaken - s.seatsHeld > 0)
    const seconds = daySessions.filter((s) => s.programId === secondProg && s.capacity - s.seatsTaken - s.seatsHeld > 0)

    return firsts.flatMap((first) => {
      const firstEnd = (first.end as unknown as Timestamp).toDate().getTime()
      const match = seconds.find((s) => (s.start as unknown as Timestamp).toDate().getTime() === firstEnd)
      if (!match) return []
      const startTime = format((first.start as unknown as Timestamp).toDate(), 'HH:mm')
      const endTime = format((match.end as unknown as Timestamp).toDate(), 'HH:mm')
      return [{ label: `${startTime} – ${endTime}`, slots: [first, match] }]
    })
  }, [selectedDate, sessionsByDay, programSelection, programIds])

  const selectedSlotKey = slots.length ? (slots[0].start as Date).toISOString() : null

  const handleSelectTime = (slotDocs: SessionDoc[]) => {
    setSlots(slotDocs.map((s) => ({
      sessionId: s.id,
      programId: s.programId,
      start: (s.start as unknown as Timestamp).toDate(),
      end: (s.end as unknown as Timestamp).toDate(),
    })))
  }

  const handleContinue = () => {
    startHold()
    navigate('/book/details')
  }

  const monthLabel = format(weekDays[0], 'MMMM yyyy')

  return (
    <BookingLayout
      title={getStepTitle(programSelection, programOrder)}
      step={3}
      totalSteps={4}
      onBack="/book/programs"
      footer={
        <ContinueButton disabled={slots.length === 0} onClick={handleContinue} />
      }
    >
      {/* Month nav */}
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
          const key = day.toDateString()
          const hasSessions = (sessionsByDay[key]?.length ?? 0) > 0
          const isPast = day < today && !isToday(day)
          const isSel = selectedDate ? isSameDay(day, selectedDate) : false
          const closed = isPast || (!isLoading && !hasSessions)

          return (
            <button
              key={i}
              type="button"
              disabled={closed}
              aria-pressed={isSel}
              onClick={() => { setSelectedDate(day); setSlots([]) }}
              className="tap flex flex-col items-center justify-center gap-0.5 rounded-[18px] border h-[84px]"
              style={{
                background: isSel ? 'var(--primary)' : closed ? 'var(--muted)' : 'var(--card)',
                color: isSel ? '#fff' : closed ? 'var(--muted-foreground)' : 'var(--foreground)',
                borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                boxShadow: isSel ? 'var(--shadow-float)' : 'var(--shadow-xs)',
                cursor: closed ? 'not-allowed' : 'pointer',
                opacity: closed ? 0.5 : 1,
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

      {/* Time slots */}
      {selectedDate && (
        <div className="rise flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {format(selectedDate, 'EEEE, d MMMM')}
          </h2>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
              ))}
            </div>
          ) : availableTimes.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
              No available times on this day.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableTimes.map(({ label, slots: slotDocs }) => {
                const isSel = selectedSlotKey === slotDocs[0].start?.toString() ||
                  (slots.length > 0 && slots[0].sessionId === slotDocs[0].id)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSelectTime(slotDocs as unknown as SessionDoc[])}
                    className="tap flex items-center justify-between px-4 h-14 rounded-2xl border-2 text-sm font-semibold"
                    style={{
                      background: isSel ? 'var(--tint-purple)' : 'var(--card)',
                      borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <span>{label}</span>
                    <span
                      className="w-5 h-5 rounded-full box-border"
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
