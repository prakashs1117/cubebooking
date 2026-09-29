import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { MessageSquarePlus, Star, X, CheckCircle2, Loader2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'

const CATEGORIES_EN = [
  'Booking experience',
  'Programme content',
  'Arrival & logistics',
  'App usability',
  'Communication',
  'Other',
]

const CATEGORIES_DE = [
  'Buchungserfahrung',
  'Programminhalte',
  'Anreise & Logistik',
  'App-Benutzerfreundlichkeit',
  'Kommunikation',
  'Sonstiges',
]

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="tap p-0.5"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={value === n}
        >
          <Star
            className="w-8 h-8 transition-colors"
            style={{
              color: n <= (hover || value) ? 'var(--brand-yellow)' : 'var(--border)',
              fill: n <= (hover || value) ? 'var(--brand-yellow)' : 'transparent',
            }}
          />
        </button>
      ))}
    </div>
  )
}

export function FeedbackDialog({ trigger }: { trigger: React.ReactNode }) {
  const intl = useIntl()
  const { submitFeedback, profile } = useAuthContext()
  const isDE = intl.locale === 'de'
  const categories = isDE ? CATEGORIES_DE : CATEGORIES_EN

  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const resetForm = () => {
    setRating(0)
    setCategory('')
    setMessage('')
    setDone(false)
    setError(null)
  }

  const handleOpen = (v: boolean) => {
    setOpen(v)
    if (v) resetForm()
  }

  const handleSubmit = async () => {
    if (!rating || !category || !message.trim()) return
    setLoading(true)
    setError(null)
    try {
      await submitFeedback({ rating, category, message: message.trim() })
      setDone(true)
    } catch {
      setError(intl.formatMessage({ id: 'feedback.error' }))
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = rating > 0 && !!category && message.trim().length >= 10

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
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
            maxHeight: '90vh',
            animation: 'slideUp 0.3s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
          `}</style>

          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="flex items-start justify-between px-6 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex-none grid place-items-center w-9 h-9 rounded-xl"
                  style={{ background: 'var(--tint-purple)' }}
                >
                  <MessageSquarePlus className="w-5 h-5" style={{ color: 'var(--brand-purple)' }} />
                </span>
                <Dialog.Title className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  {intl.formatMessage({ id: 'feedback.title' })}
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

            {done ? (
              <div className="flex flex-col items-center text-center px-6 py-10 gap-4">
                <span
                  className="grid place-items-center w-16 h-16 rounded-full"
                  style={{ background: 'var(--accent)' }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--brand-green)' }} />
                </span>
                <div>
                  <p className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                    {intl.formatMessage({ id: 'feedback.thanks.title' })}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {intl.formatMessage({ id: 'feedback.thanks.body' })}
                  </p>
                </div>
              </div>
            ) : (
              <Dialog.Description asChild>
                <div className="px-6 pb-4 flex flex-col gap-5">
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {intl.formatMessage({ id: 'feedback.subtitle' }, { name: profile?.displayName?.split(' ')[0] || '' })}
                  </p>

                  {/* Star rating */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {intl.formatMessage({ id: 'feedback.rating.label' })}
                    </label>
                    <StarRating value={rating} onChange={setRating} />
                    {rating > 0 && (
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {intl.formatMessage({ id: `feedback.rating.${rating}` })}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {intl.formatMessage({ id: 'feedback.category.label' })}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className="tap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                          style={{
                            background: category === cat ? 'var(--brand-purple)' : 'var(--card)',
                            color: category === cat ? '#fff' : 'var(--foreground)',
                            borderColor: category === cat ? 'var(--brand-purple)' : 'var(--border)',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {intl.formatMessage({ id: 'feedback.message.label' })}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={800}
                      placeholder={intl.formatMessage({ id: 'feedback.message.placeholder' })}
                      className="w-full rounded-xl border p-3 text-sm resize-none outline-none focus:ring-2"
                      style={{
                        background: 'var(--card)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                        fontFamily: 'var(--font-sans)',
                        // @ts-ignore
                        '--tw-ring-color': 'var(--primary)',
                      }}
                    />
                    <span className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>
                      {message.length}/800
                    </span>
                  </div>

                  {error && (
                    <div
                      className="px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}
                    >
                      {error}
                    </div>
                  )}
                </div>
              </Dialog.Description>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex gap-3 justify-end" style={{ borderColor: 'var(--border)' }}>
            <Dialog.Close asChild>
              <button
                type="button"
                className="tap h-10 px-4 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                {intl.formatMessage({ id: done ? 'dialog.close' : 'dialog.cancel' })}
              </button>
            </Dialog.Close>
            {!done && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="tap h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {intl.formatMessage({ id: 'feedback.submit' })}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
