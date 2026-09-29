import { useIntl } from 'react-intl'
import { Wrench } from 'lucide-react'

interface MaintenanceModalProps {
  message: string
}

export function MaintenanceModal({ message }: MaintenanceModalProps) {
  const intl = useIntl()

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={intl.formatMessage({ id: 'maintenance.title' })}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center gap-5 shadow-2xl"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          animation: 'scaleIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--tint-amber, #fef3c7)' }}
        >
          <Wrench className="w-8 h-8" style={{ color: '#d97706' }} />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            {intl.formatMessage({ id: 'maintenance.title' })}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {message || intl.formatMessage({ id: 'maintenance.defaultMessage' })}
          </p>
        </div>

        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'maintenance.checkBack' })}
        </p>
      </div>
    </div>
  )
}
