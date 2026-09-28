import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

// Field styling mirrors TextField in ClubInterestPage so the member-facing
// auth and profile screens read as part of the same site.
const baseInput =
  'w-full bg-white border border-[#D6D1CC] rounded-lg text-[13px] sm:text-[14px] text-[#1A1519] outline-none resize-none transition-shadow focus:border-[#772432] focus:shadow-[0_0_0_3px_rgba(119,36,50,.12)] disabled:bg-[#F4F3F1] disabled:text-[#6B6470] py-1.5 sm:py-2.5'

interface FieldShellProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string | null
  optional?: boolean
  children: React.ReactNode
}

export function FieldShell({ label, htmlFor, hint, error, optional, children }: FieldShellProps) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="flex items-baseline gap-2 mb-1">
        <span className="text-[11.5px] sm:text-[12px] font-bold text-[#1A1519]">{label}</span>
        {optional ? <span className="text-[10px] sm:text-[11px] text-[#A29BA6] font-semibold">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-semibold text-[#B3261E]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-[#6B6470]">{hint}</p>
      ) : null}
    </div>
  )
}

interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  icon?: LucideIcon
  hint?: string
  error?: string | null
  optional?: boolean
  disabled?: boolean
  autoComplete?: string
  maxLength?: number
  trailing?: React.ReactNode
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon: Icon,
  hint,
  error,
  optional,
  disabled,
  autoComplete,
  maxLength,
  trailing,
}: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} optional={optional}>
      <div className="relative">
        {Icon ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-3.5 h-3.5 text-[#A29BA6]" />
          </div>
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          className={cn(baseInput, Icon ? 'pl-9' : 'pl-3', trailing ? 'pr-10' : 'pr-3', error && 'border-[#B3261E]')}
        />
        {trailing ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div> : null}
      </div>
    </FieldShell>
  )
}

interface TextAreaFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  optional?: boolean
  error?: string | null
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  optional,
  error,
}: TextAreaFieldProps) {
  const hint = maxLength ? `${value.length}/${maxLength}` : undefined
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} optional={optional}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(baseInput, 'px-3', error && 'border-[#B3261E]')}
      />
    </FieldShell>
  )
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  optional?: boolean
}

export function SelectField({ id, label, value, onChange, options, placeholder = 'Select…', optional }: SelectFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} optional={optional}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(baseInput, 'px-3 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' stroke=\'%23A29BA6\' stroke-width=\'2\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-8')}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

interface ChipSelectProps {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  optional?: boolean
}

export function ChipSelect({ label, options, selected, onToggle, optional }: ChipSelectProps) {
  return (
    <FieldShell label={label} optional={optional}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              aria-pressed={active}
              className={cn(
                'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold border transition-colors',
                active
                  ? 'bg-[#772432] border-[#772432] text-white'
                  : 'bg-white border-[#D6D1CC] text-[#6B6470] hover:border-[#772432] hover:text-[#772432]',
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </FieldShell>
  )
}

export function SubmitButton({
  children,
  disabled,
  loading,
  type = 'submit',
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3.5 rounded-xl bg-[#772432] text-white text-[14.5px] font-bold transition-colors hover:bg-[#5A1926] disabled:bg-[#D6D1CC] disabled:text-[#8F8892] disabled:cursor-not-allowed"
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export function FormAlert({ kind, children }: { kind: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const styles = {
    error: 'bg-[#FDECEA] border-[#F3C9C4] text-[#8C1D18]',
    success: 'bg-[#E8F5EC] border-[#BFE3CC] text-[#14532D]',
    info: 'bg-[#FBF6E7] border-[#EFE0B0] text-[#6B5314]',
  }[kind]
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cn('mb-3 px-3 py-2 rounded-xl border text-[12px] font-semibold', styles)}>
      {children}
    </div>
  )
}
