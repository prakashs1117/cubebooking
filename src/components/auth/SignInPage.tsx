import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'
import AuthLayout, { GoogleButton, OrDivider } from './AuthLayout'

type Mode = 'password' | 'magic-link'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle, sendMagicLink } = useAuthContext()
  const returnTo = (location.state as { from?: string })?.from ?? '/home'
  const intl = useIntl()
  const { locale, setLocale } = useLocale()

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  const emailOk = /\S+@\S+\.\S+/.test(email.trim())
  const formOk = emailOk && (mode === 'magic-link' || password.length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formOk) return
    setError(null)
    setLoading(true)
    try {
      if (mode === 'magic-link') {
        await sendMagicLink(email.trim())
        setMagicSent(true)
      } else {
        await signIn(email.trim(), password)
        navigate(returnTo, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      footer={
        <p style={{ fontSize: 12 }}>
          {intl.formatMessage({ id: 'auth.signIn.gdpr' })}
        </p>
      }
    >
      {/* Mobile hero text — shown above card on purple bg */}
      <div className="md:hidden rise mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand-mint)', letterSpacing: '0.14em' }}>
          {intl.formatMessage({ id: 'auth.tagline' })}
        </div>
        <h1 className="m-0 text-3xl font-extrabold leading-tight text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          {intl.formatMessage({ id: 'auth.hero.title' }).split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>
      </div>

      {/* Mobile: white card over purple bg. Desktop: flat (white panel handles bg). */}
      <style>{`
        .auth-card { background: var(--background); border-radius: 24px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.35); }
        @media (min-width: 768px) { .auth-card { background: transparent; border-radius: 0; padding: 0; box-shadow: none; } }
      `}</style>
      <div className="auth-card">

      {/* Header row — desktop only (mobile title shown above card) */}
      <div className="flex justify-between items-center mb-8">
        <div className="hidden md:block">
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--brand-purple)', letterSpacing: '0.14em' }}>
            {intl.formatMessage({ id: 'auth.tagline' })}
          </div>
          <h1 className="m-0 text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            {intl.formatMessage({ id: 'auth.signIn.submit' })}
          </h1>
        </div>
        {/* On mobile: empty div so lang switcher stays right-aligned */}
        <div className="md:hidden" />
        <div
          role="group"
          aria-label="Language"
          className="flex gap-1 p-1 rounded-full"
          style={{ background: 'var(--muted)' }}
        >
          {(['de', 'en'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLocale(lang)}
              className="tap px-3 py-1 rounded-full text-xs font-bold transition-colors"
              style={lang === locale
                ? { background: 'var(--background)', color: 'var(--brand-purple)', boxShadow: 'var(--shadow-sm)' }
                : { background: 'transparent', color: 'var(--muted-foreground)' }}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Magic-link sent state */}
      {magicSent ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-5">✉️</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            {intl.formatMessage({ id: 'auth.magicSent.title' })}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage(
              { id: 'auth.magicSent.body' },
              { email: <strong>{email.trim()}</strong> }
            )}
          </p>
          <button
            type="button"
            className="mt-5 text-sm font-semibold tap"
            style={{ color: 'var(--primary)' }}
            onClick={() => setMagicSent(false)}
          >
            {intl.formatMessage({ id: 'auth.magicSent.different' })}
          </button>
        </div>
      ) : (
        <>
          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {intl.formatMessage({ id: 'auth.signIn.emailLabel' })}
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
                  className="w-full h-11 pl-9 pr-4 rounded-xl border text-sm outline-none transition-shadow focus:ring-2"
                  style={{
                    borderColor: 'var(--input)',
                    background: 'var(--input-surface)',
                    color: 'var(--foreground)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            {mode === 'password' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {intl.formatMessage({ id: 'auth.signIn.passwordLabel' })}
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold tap" style={{ color: 'var(--primary)' }}>
                    {intl.formatMessage({ id: 'auth.signIn.forgotPassword' })}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={intl.formatMessage({ id: 'auth.signIn.passwordPlaceholder' })}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border text-sm outline-none transition-shadow"
                    style={{
                      borderColor: 'var(--input)',
                      background: 'var(--input-surface)',
                      color: 'var(--foreground)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword
                      ? intl.formatMessage({ id: 'auth.hidePassword' })
                      : intl.formatMessage({ id: 'auth.showPassword' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 tap"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!formOk || loading}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tap transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{ background: 'var(--brand-purple)', color: '#fff' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'magic-link'
                    ? intl.formatMessage({ id: 'auth.signIn.submitMagic' })
                    : intl.formatMessage({ id: 'auth.signIn.submit' })}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <button
            type="button"
            onClick={() => { setMode(mode === 'password' ? 'magic-link' : 'password'); setError(null) }}
            className="w-full mt-3 text-xs font-semibold tap text-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {mode === 'password'
              ? intl.formatMessage({ id: 'auth.signIn.switchToMagic' })
              : intl.formatMessage({ id: 'auth.signIn.switchToPassword' })}
          </button>

          <OrDivider />

          <GoogleButton onClick={handleGoogle} disabled={loading} label={intl.formatMessage({ id: 'auth.signIn.google' })} />

          {/* Link to /info page */}
          <p className="mt-6 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {intl.formatMessage({ id: 'auth.notTeacher' })}{' '}
            <Link to="/programs" className="font-semibold tap" style={{ color: 'var(--primary)' }}>
              {intl.formatMessage({ id: 'auth.learnPrograms' })}
            </Link>
          </p>
        </>
      )}
      </div>{/* end .auth-card */}
    </AuthLayout>
  )
}
