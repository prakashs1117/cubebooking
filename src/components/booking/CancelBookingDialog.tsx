import { useIntl } from 'react-intl'
import * as Dialog from '@radix-ui/react-dialog'
import { XCircle, X } from 'lucide-react'

interface CancelBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: CancelBookingDialogProps) {
  const intl = useIntl()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="tap w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}
        >
          <XCircle className="w-4 h-4" />
          {intl.formatMessage({ id: 'bookingDetail.cancel' })}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0, 0, 0, 0.5)', animation: 'fadeIn 0.2s ease-out' }}
        />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 max-h-[90vh] overflow-auto"
          style={{
            background: 'var(--background)',
            borderColor: 'var(--border)',
            border: '1px solid',
            animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>

          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold">
              {intl.formatMessage({ id: 'bookingDetail.cancelTitle' })}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="tap p-1"
                aria-label="Close"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'bookingDetail.confirmCancel' })}
          </Dialog.Description>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Dialog.Close asChild>
              <button
                type="button"
                className="tap px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                {intl.formatMessage({ id: 'bookingDetail.cancelDialogNo' })}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="tap px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--destructive)', color: '#fff' }}
            >
              {isLoading
                ? intl.formatMessage({ id: 'bookingDetail.cancelling' })
                : intl.formatMessage({ id: 'bookingDetail.cancelDialogYes' })}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
