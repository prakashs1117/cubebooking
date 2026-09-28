import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import AuthLayout, { GoogleButton, OrDivider } from './AuthLayout'
import MerckLogo from './MerckLogo'

type Mode = 'password' | 'magic-link'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle, sendMagicLink } = useAuthContext()
  const returnTo = (location.state as { from?: string })?.from ?? '/home'

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
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          All data hosted in the EU · GDPR compliant
        </p>
      }
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="bg-white rounded-2xl p-2.5 px-3.5 shadow-lg">
          <MerckLogo />
        </div>
        <div
          role="group"
          aria-label="Language"
          className="flex gap-1 p-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.14)' }}
        >
          {(['DE', 'EN'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              className="tap px-3 py-1 rounded-full text-xs font-bold transition-colors"
              style={lang === 'DE'
                ? { background: 'rgba(255,255,255,0.92)', color: 'var(--brand-purple)' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.7)' }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Hero text */}
      <div className="rise mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-mint)', letterSpacing: '0.14em' }}>
          Curiosity Cube · Labs · TOAD
        </div>
        <h1 className="m-0 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Book a STEM<br />experience
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 280 }}>
          Schools in the Darmstadt area can book the Curiosity Cube, Lab, or TOAD truck in under 3 minutes.
        </p>
      </div>

      {/* Auth card */}
      <div className="rise-2 rounded-3xl p-6 md:p-8 shadow-xl" style={{ background: 'var(--background)' }}>
        {magicSent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Check your inbox</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              We sent a sign-in link to <strong>{email.trim()}</strong>. Click it to continue — no password needed.
            </p>
            <button
              type="button"
              className="mt-4 text-sm font-semibold tap"
              style={{ color: 'var(--primary)' }}
              onClick={() => setMagicSent(false)}
            >
              Use a different address
            </button>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.de"
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

              {/* Password (password mode only) */}
              {mode === 'password' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs font-semibold tap" style={{ color: 'var(--primary)' }}>
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full h-11 pl-4 pr-10 rounded-xl border text-sm"
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tap transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'magic-link' ? 'Send sign-in link' : 'Sign in'}
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
              {mode === 'password' ? 'Sign in with magic link instead' : 'Use password instead'}
            </button>

            <OrDivider />

            <GoogleButton onClick={handleGoogle} disabled={loading} label="Continue with Google" />
          </>
        )}
      </div>
    </AuthLayout>
  )
}
