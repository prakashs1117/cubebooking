import { useIntl } from 'react-intl'
import { Truck } from 'lucide-react'

interface Props {
  bookingId: string | null
  bookingCode: string | null
  onDone: () => void
}

export function ToadConfirmedStep({ bookingCode, onDone }: Props) {
  const intl = useIntl()
  return (
    <div className="flex flex-col items-center gap-5 pb-4 text-center">
      {/* Icon */}
      <div className="grid place-items-center rounded-full" style={{ width: 80, height: 80, background: 'var(--tint-magenta)' }}>
        <Truck style={{ width: 40, height: 40, color: 'var(--brand-magenta)' }} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[28px] font-extrabold leading-[34px] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'toad.confirmed.heading' })}
        </h1>
        <p className="m-0 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'toad.confirmed.sub' })}
        </p>
      </div>

      {bookingCode && (
        <div className="flex flex-col items-center gap-1.5 w-full p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'toad.confirmed.code' })}
          </span>
          <span className="text-3xl font-extrabold tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-magenta)', letterSpacing: '0.06em' }}>
            {bookingCode}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="tap w-full h-12 rounded-2xl text-sm font-semibold"
        style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {intl.formatMessage({ id: 'toad.confirmed.goBookings' })}
      </button>
    </div>
  )
}
