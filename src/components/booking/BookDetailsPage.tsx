import { useEffect, useState, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, Minus, Plus } from 'lucide-react'
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@radix-ui/react-icons'
import * as Select from '@radix-ui/react-select'
import { useIntl } from 'react-intl'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const MAX_STUDENTS = 30

// ─── Radix Select item ────────────────────────────────────────────────────────
const GradeSelectItem = forwardRef<
  HTMLDivElement,
  { value: string; children: React.ReactNode }
>(({ value, children, ...props }, ref) => (
  <Select.Item
    value={value}
    ref={ref}
    {...props}
    className="tap"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      outline: 'none',
      color: 'var(--foreground)',
      userSelect: 'none',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    onFocus={(e) => (e.currentTarget.style.background = 'var(--accent)')}
    onBlur={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <Select.ItemText>{children}</Select.ItemText>
    <Select.ItemIndicator>
      <CheckIcon style={{ color: 'var(--primary)', width: 16, height: 16 }} />
    </Select.ItemIndicator>
  </Select.Item>
))

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
  const intl = useIntl()
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
    ? slots.map((s) => {
        const programName = intl.formatMessage({ id: `program.${s.programId}` })
        const time = intl.formatDate(s.start, { hour: '2-digit', minute: '2-digit', hour12: false })
        return `${programName} ${time}`
      }).join(' → ')
    : ''

  const dateSummary = slots.length > 0
    ? intl.formatDate(slots[0].start, { weekday: 'short', day: 'numeric', month: 'short' })
    : ''

  const isValid = classDetails.grade && classDetails.studentCount >= 1

  return (
    <BookingLayout
      title={intl.formatMessage({ id: 'bookDetails.title' })}
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
            <span className="text-sm font-semibold">{intl.formatMessage({ id: 'bookDetails.timer.held' })}</span>
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
        {intl.formatMessage({ id: 'bookDetails.heading' })}
      </h1>

      {/* Grade — Radix UI Select */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{intl.formatMessage({ id: 'bookDetails.grade.label' })}</label>
        <Select.Root value={classDetails.grade} onValueChange={(v) => setClassDetails({ grade: v })}>
          <Select.Trigger
            aria-label={intl.formatMessage({ id: 'bookDetails.grade.selectLabel' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: 44,
              padding: '0 12px',
              borderRadius: 12,
              border: '1px solid var(--input)',
              background: 'var(--input-surface)',
              color: 'var(--foreground)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-xs)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--input)')}
          >
            <Select.Value placeholder={intl.formatMessage({ id: 'bookDetails.grade.placeholder' })} />
            <Select.Icon>
              <ChevronDownIcon style={{ color: 'var(--muted-foreground)', width: 16, height: 16 }} />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={6}
              style={{
                zIndex: 100,
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                boxShadow: 'var(--shadow-float)',
                padding: '6px',
                minWidth: 'var(--radix-select-trigger-width)',
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              <Select.ScrollUpButton style={{ display: 'flex', justifyContent: 'center', padding: '4px', color: 'var(--muted-foreground)' }}>
                <ChevronUpIcon />
              </Select.ScrollUpButton>

              <Select.Viewport>
                <Select.Group>
                  <Select.Label style={{ padding: '4px 14px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
                    {intl.formatMessage({ id: 'bookDetails.grade.label' })}
                  </Select.Label>
                  {GRADES.map((g) => (
                    <GradeSelectItem key={g} value={g}>
                      {intl.formatMessage({ id: 'bookDetails.grade.option' }, { grade: g })}
                    </GradeSelectItem>
                  ))}
                </Select.Group>
              </Select.Viewport>

              <Select.ScrollDownButton style={{ display: 'flex', justifyContent: 'center', padding: '4px', color: 'var(--muted-foreground)' }}>
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Student count stepper */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span id="count-label" className="text-sm font-medium">{intl.formatMessage({ id: 'bookDetails.students.label' })}</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'bookDetails.students.max' }, { max: MAX_STUDENTS })}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={intl.formatMessage({ id: 'bookDetails.students.remove' })}
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
            aria-label={intl.formatMessage({ id: 'bookDetails.students.add' })}
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
          {intl.formatMessage({ id: 'bookDetails.access.label' })} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{intl.formatMessage({ id: 'bookDetails.access.optional' })}</span>
        </label>
        <textarea
          id="access"
          rows={3}
          placeholder={intl.formatMessage({ id: 'bookDetails.access.placeholder' })}
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
