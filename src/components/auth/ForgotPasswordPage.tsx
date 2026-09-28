import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, ArrowRight } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'

const EMAIL_RE = /\S+@\S+\.\S+/

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthContext()
  const intl = useIntl()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailOk = EMAIL_RE.test(email.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailOk) return
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('No account found')) {
        setSent(true)
      } else {
        setError(message || 'Could not send the reset email.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      footer={
        <Link to="/signin" className="flex items-center justify-center gap-1.5 text-xs font-semibold tap" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ArrowLeft className="w-3.5 h-3.5" />
          {intl.formatMessage({ id: 'forgot.backToSignIn' })}
        </Link>
      }
    >
      <div className="rise rounded-3xl p-6 md:p-8 shadow-xl" style={{ background: 'var(--background)' }}>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {intl.formatMessage({ id: 'forgot.title' })}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'forgot.subtitle' })}
        </p>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {intl.formatMessage(
                { id: 'forgot.sent' },
                { email: <strong style={{ color: 'var(--foreground)' }}>{email.trim()}</strong> }
              )}
            </p>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {intl.formatMessage({ id: 'forgot.emailLabel' })}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={intl.formatMessage({ id: 'auth.signIn.emailPlaceholder' })}
                    className="w-full h-11 pl-9 pr-4 rounded-xl border text-sm"
                    style={{
                      borderColor: 'var(--input)',
                      background: 'var(--input-surface)',
                      color: 'var(--foreground)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!emailOk || loading}
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tap transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {intl.formatMessage({ id: 'forgot.submit' })}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
