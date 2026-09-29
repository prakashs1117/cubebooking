import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HelpCircle, ChevronDown, X } from 'lucide-react'
import { useIntl } from 'react-intl'

interface FAQItem {
  q: string
  a: string
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-start justify-between gap-3 py-4 text-left tap"
            style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}
          >
            <span className="text-sm font-semibold leading-snug flex-1">{item.q}</span>
            <ChevronDown
              className="flex-none mt-0.5 transition-transform duration-200"
              style={{
                width: 16,
                height: 16,
                color: 'var(--muted-foreground)',
                transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
          {open === i && (
            <p
              className="text-sm leading-relaxed pb-4"
              style={{ color: 'var(--muted-foreground)', marginTop: -4 }}
            >
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export function FAQDialog({ trigger }: { trigger: React.ReactNode }) {
  const intl = useIntl()

  const faqs: FAQItem[] = [
    {
      q: intl.formatMessage({ id: 'faq.q1' }),
      a: intl.formatMessage({ id: 'faq.a1' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q2' }),
      a: intl.formatMessage({ id: 'faq.a2' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q3' }),
      a: intl.formatMessage({ id: 'faq.a3' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q4' }),
      a: intl.formatMessage({ id: 'faq.a4' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q5' }),
      a: intl.formatMessage({ id: 'faq.a5' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q6' }),
      a: intl.formatMessage({ id: 'faq.a6' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q7' }),
      a: intl.formatMessage({ id: 'faq.a7' }),
    },
    {
      q: intl.formatMessage({ id: 'faq.q8' }),
      a: intl.formatMessage({ id: 'faq.a8' }),
    },
  ]

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease-out' }}
        />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:rounded-3xl sm:w-full sm:max-w-lg"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            maxHeight: '85vh',
            animation: 'slideUp 0.3s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
            @media (min-width: 640px) {
              [data-radix-dialog-content] { animation: scaleIn 0.25s cubic-bezier(0.2,0.8,0.2,1) !important; }
              @keyframes scaleIn { from { transform: translate(-50%,-48%) scale(0.96); opacity: 0 } to { transform: translate(-50%,-50%) scale(1); opacity: 1 } }
            }
          `}</style>

          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex items-start justify-between px-6 pt-5 pb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex-none grid place-items-center w-9 h-9 rounded-xl"
                  style={{ background: 'var(--tint-purple)' }}
                >
                  <HelpCircle className="w-5 h-5" style={{ color: 'var(--brand-purple)' }} />
                </span>
                <Dialog.Title className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  {intl.formatMessage({ id: 'faq.title' })}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="tap iconbtn flex-none"
                  aria-label="Close"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description asChild>
              <div className="px-6 pb-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {intl.formatMessage({ id: 'faq.subtitle' })}
              </div>
            </Dialog.Description>

            <div className="px-6 pb-4">
              <FAQAccordion items={faqs} />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="border-t px-6 py-4 flex justify-end" style={{ borderColor: 'var(--border)' }}>
            <Dialog.Close asChild>
              <button
                type="button"
                className="tap h-10 px-5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {intl.formatMessage({ id: 'dialog.close' })}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
