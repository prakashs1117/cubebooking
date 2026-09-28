import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft } from 'lucide-react'

interface BookingLayoutProps {
  title: string
  step: number
  totalSteps: number
  onBack?: string | (() => void)
  onClose?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function BookingLayout({
  title,
  step,
  totalSteps,
  onBack,
  onClose = '/home',
  children,
  footer,
}: BookingLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (!onBack) return
    if (typeof onBack === 'string') navigate(onBack)
    else onBack()
  }

  return (
    <div
      className="min-h-screen flex flex-col max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-3 px-3 pt-12 pb-3 md:pt-6">
        <div className="flex items-center gap-1">
          {onBack ? (
            <button type="button" onClick={handleBack} className="iconbtn tap" aria-label="Back">
              <ChevronLeft className="i" />
            </button>
          ) : (
            <button type="button" onClick={() => navigate(onClose)} className="iconbtn tap" aria-label="Close">
              <X className="i" />
            </button>
          )}

          <span className="flex-1 text-center text-[15px] font-semibold">{title}</span>

          <span className="w-11 text-right text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {step} / {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="grid gap-1.5 px-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className="h-1 rounded-full"
              style={{ background: i < step ? 'var(--primary)' : 'var(--border)' }}
            />
          ))}
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 scroll overflow-y-auto px-5 pt-3 pb-6 flex flex-col gap-4">
        {children}
      </main>

      {/* Sticky footer CTA */}
      {footer && (
        <div
          className="sticky bottom-0 px-5 pb-8 pt-4 border-t"
          style={{ background: 'var(--app-ground)', borderColor: 'var(--border)' }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

export function ContinueButton({
  disabled,
  loading,
  onClick,
  children = 'Continue',
}: {
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tap disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  )
}
