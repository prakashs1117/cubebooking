import { useState } from 'react'
import { useIntl } from 'react-intl'
import { AlertTriangle, X } from 'lucide-react'

interface MaintenanceBannerProps {
  message: string
}

export function MaintenanceBanner({ message }: MaintenanceBannerProps) {
  const intl = useIntl()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 text-sm font-medium"
      style={{
        background: 'var(--warning, #f59e0b)',
        color: '#fff',
        animation: 'slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span className="flex-1">
        {message || intl.formatMessage({ id: 'maintenance.defaultMessage' })}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={intl.formatMessage({ id: 'maintenance.dismiss' })}
        className="tap shrink-0 p-1 rounded opacity-80 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
