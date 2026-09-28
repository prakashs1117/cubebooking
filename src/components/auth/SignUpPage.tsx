import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import AuthLayout, { GoogleButton, OrDivider } from './AuthLayout'
import { TextField, SubmitButton, FormAlert } from '../FormField'

const EMAIL_RE = /\S+@\S+\.\S+/

export default function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp, signInWithGoogle } = useAuthContext()

  const searchParams = new URLSearchParams(location.search)
  const returnTo = searchParams.get('returnTo') || '/profile'
  // Preserve rsvp + intent so GuestRsvpBanner can auto-fire after redirect
  const rsvp = searchParams.get('rsvp')
  const intent = searchParams.get('intent')
  const returnWithRsvp = rsvp
    ? `${returnTo}${returnTo.includes('?') ? '&' : '?'}rsvp=${rsvp}${intent ? `&intent=${intent}` : ''}`
    : returnTo

  // Build signin link that carries the same params
  const signinHref = rsvp
    ? `/signin?returnTo=${encodeURIComponent(returnTo)}&rsvp=${rsvp}${intent ? `&intent=${intent}` : ''}`
    : `/signin`

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived validity, matching how ClubInterestPage gates its submit button.
  const nameOk = name.trim().length > 1
  const emailOk = EMAIL_RE.test(email.trim())
  const passwordOk = password.length >= 6
  const confirmOk = confirm === password && confirm.length > 0
  const formOk = nameOk && emailOk && passwordOk && confirmOk

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!formOk) return
    setError(null)
    setLoading(true)
    try {
      await signUp(email.trim(), password, name.trim())
      navigate(returnWithRsvp, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate(returnWithRsvp, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the club and set up your member profile."
      footer={
        <>
          Already have an account?{' '}
          <Link to={signinHref} className="font-bold text-[#772432] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error ? <FormAlert kind="error">{error}</FormAlert> : null}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="name"
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Your name"
          icon={UserIcon}
          autoComplete="name"
          error={touched && !nameOk ? 'Please enter your name.' : null}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={Mail}
          autoComplete="email"
          error={touched && !emailOk ? 'Please enter a valid email address.' : null}
        />
        <TextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          error={touched && !passwordOk ? 'Password must be at least 6 characters.' : null}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1 text-[#A29BA6] hover:text-[#772432] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <TextField
          id="confirm"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          value={confirm}
          onChange={setConfirm}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={touched && !confirmOk ? 'Passwords do not match.' : null}
        />

        <div className="mt-5">
          <SubmitButton disabled={touched && !formOk} loading={loading}>
            Create account
          </SubmitButton>
        </div>
      </form>

      <OrDivider />
      <GoogleButton onClick={handleGoogle} disabled={loading} label="Continue with Google" />

      <p className="mt-4 text-center text-[11px] text-[#9CA3AF] leading-relaxed">
        👁 New accounts start as <strong>Guest</strong>. An admin will upgrade your role once you're verified.
      </p>
    </AuthLayout>
  )
}
