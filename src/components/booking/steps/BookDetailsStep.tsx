import { forwardRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@radix-ui/react-icons'
import * as Select from '@radix-ui/react-select'
import { useIntl } from 'react-intl'
import { ContinueButton } from '../BookingLayout'
import { useBookingStore } from '../../../stores/bookingStore'

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const MAX_STUDENTS = 30

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
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
      cursor: 'pointer', outline: 'none', color: 'var(--foreground)', userSelect: 'none',
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

interface Props {
  onContinue: () => void
  onExpired?: () => void
}

export function BookDetailsStep({ onContinue }: Props) {
  const intl = useIntl()
  const { classDetails, setClassDetails } = useBookingStore()

  const isValid = classDetails.grade && classDetails.studentCount >= 1

  return (
    <>
      <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {intl.formatMessage({ id: 'bookDetails.heading' })}
      </h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'bookDetails.grade.label' })}
        </label>
        <Select.Root value={classDetails.grade} onValueChange={(v) => setClassDetails({ grade: v })}>
          <Select.Trigger
            aria-label={intl.formatMessage({ id: 'bookDetails.grade.selectLabel' })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', height: 44, padding: '0 12px', borderRadius: 12,
              border: '1px solid var(--input)', background: 'var(--input-surface)',
              color: 'var(--foreground)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', outline: 'none', fontFamily: 'inherit', boxShadow: 'var(--shadow-xs)',
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
                zIndex: 99999,
                background: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: 14, boxShadow: 'var(--shadow-float)',
                padding: '6px', minWidth: 'var(--radix-select-trigger-width)',
                maxHeight: 280, overflowY: 'auto',
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
          style={{ borderColor: 'var(--input)', background: 'var(--input-surface)', color: 'var(--foreground)' }}
        />
      </div>

      <ContinueButton disabled={!isValid} onClick={onContinue} />
    </>
  )
}
