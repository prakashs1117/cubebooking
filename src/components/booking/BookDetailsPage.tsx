import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, Minus, Plus } from 'lucide-react'
import { format } from 'date-fns'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const MAX_STUDENTS = 30

function useCountdown(expiresAt: Date | null) {
  // Initialise to actual remaining time — not 0 — so mount check doesn't false-fire
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)) : 600
  )

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => setRemaining(Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  return { remaining, label: `${mins}:${secs.toString().padStart(2, '0')}` }
}

export default function BookDetailsPage() {
  const navigate = useNavigate()
  const { slots, holdExpiresAt, classDetails, setClassDetails, reset } = useBookingStore()
  const { remaining, label: timerLabel } = useCountdown(holdExpiresAt)

  // Hold expired — only redirect when the expiry time is genuinely in the past
  useEffect(() => {
    if (holdExpiresAt && remaining === 0 && holdExpiresAt.getTime() < Date.now()) {
      reset()
      navigate('/book', { replace: true })
    }
  }, [remaining, holdExpiresAt, reset, navigate])

  const slotSummary = slots.length > 0
    ? slots.map((s) => `${s.programId.charAt(0).toUpperCase() + s.programId.slice(1)} ${format(s.start, 'HH:mm')}`).join(' → ')
    : ''

  const dateSummary = slots.length > 0
    ? format(slots[0].start, 'EEE, d MMM')
    : ''

  const isValid = classDetails.grade && classDetails.studentCount >= 1

  return (
    <BookingLayout
      title="Class details"
      step={4}
      totalSteps={4}
      onBack="/book/time"
      footer={<ContinueButton disabled={!isValid} onClick={() => navigate('/book/review')} />}
    >
      {/* Seat hold timer */}
      {holdExpiresAt && (
        <div
          className="flex items-center gap-3 p-3 px-3.5 rounded-2xl"
          style={{ background: 'var(--tint-yellow)' }}
          role="timer"
          aria-live="off"
        >
          <span className="flex-none grid place-items-center w-10 h-10 rounded-xl" style={{ background: 'var(--brand-yellow)' }}>
            <Timer className="i" />
          </span>
          <div className="flex-1 flex flex-col">
            <span className="text-sm font-semibold">Your sessions are held</span>
            {dateSummary && slotSummary && (
              <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                {dateSummary} · {slotSummary}
              </span>
            )}
          </div>
          <span
            className="font-extrabold text-[22px] tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              color: remaining < 120 ? 'var(--destructive)' : 'var(--foreground)',
            }}
          >
            {timerLabel}
          </span>
        </div>
      )}

      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        Tell us about your class
      </h1>

      {/* Grade */}
      <div className="flex flex-col gap-2">
        <label htmlFor="grade" className="text-sm font-medium">Grade</label>
        <div className="relative">
          <select
            id="grade"
            value={classDetails.grade}
            onChange={(e) => setClassDetails({ grade: e.target.value })}
            className="w-full h-11 pl-3 pr-8 rounded-xl border appearance-none text-sm"
            style={{
              borderColor: 'var(--input)',
              background: 'var(--input-surface)',
              color: 'var(--foreground)',
            }}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>▾</span>
        </div>
      </div>

      {/* Student count stepper */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span id="count-label" className="text-sm font-medium">Number of students</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>max {MAX_STUDENTS}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Remove student"
            onClick={() => setClassDetails({ studentCount: Math.max(1, classDetails.studentCount - 1) })}
            disabled={classDetails.studentCount <= 1}
            className="tap flex-none grid place-items-center w-11 h-11 rounded-xl border disabled:opacity-40"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <Minus className="w-4 h-4" />
          </button>
          <div
            className="flex-1 h-11 flex items-center justify-center rounded-xl border text-xl font-bold tabular-nums"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', fontFamily: 'var(--font-display)' }}
            aria-labelledby="count-label"
            aria-live="polite"
          >
            {classDetails.studentCount}
          </div>
          <button
            type="button"
            aria-label="Add student"
            onClick={() => setClassDetails({ studentCount: Math.min(MAX_STUDENTS, classDetails.studentCount + 1) })}
            disabled={classDetails.studentCount >= MAX_STUDENTS}
            className="tap flex-none grid place-items-center w-11 h-11 rounded-xl border disabled:opacity-40"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accessibility needs */}
      <div className="flex flex-col gap-2">
        <label htmlFor="access" className="text-sm font-medium">
          Accessibility or mobility needs <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          id="access"
          rows={3}
          placeholder="e.g. wheelchair access needed, hearing loop required…"
          value={classDetails.accessNeeds}
          onChange={(e) => setClassDetails({ accessNeeds: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border resize-none text-sm leading-relaxed"
          style={{
            borderColor: 'var(--input)',
            background: 'var(--input-surface)',
            color: 'var(--foreground)',
          }}
        />
      </div>
    </BookingLayout>
  )
}
