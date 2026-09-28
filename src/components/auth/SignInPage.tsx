import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import AuthLayout, { GoogleButton, OrDivider } from './AuthLayout'
import { TextField, SubmitButton, FormAlert } from '../FormField'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle } = useAuthContext()

  const searchParams = new URLSearchParams(location.search)
  const returnTo = searchParams.get('returnTo') || '/profile'
  const rsvp = searchParams.get('rsvp')
  const intent = searchParams.get('intent')
  const returnWithRsvp = rsvp
    ? `${returnTo}${returnTo.includes('?') ? '&' : '?'}rsvp=${rsvp}${intent ? `&intent=${intent}` : ''}`
    : returnTo

  // Build signup link that carries the same params
  const signupHref = rsvp
    ? `/signup?returnTo=${encodeURIComponent(returnTo)}&rsvp=${rsvp}${intent ? `&intent=${intent}` : ''}`
    : `/signup`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formOk = email.trim().length > 0 && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formOk) return
    setError(null)
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate(returnWithRsvp, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in.')
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
      title="Welcome back"
      subtitle="Sign in to manage your member profile."
      footer={
        <>
          New here?{' '}
          <Link to={signupHref} className="font-bold text-[#772432] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {error ? <FormAlert kind="error">{error}</FormAlert> : null}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={Mail}
          autoComplete="email"
        />
        <TextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
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

        <div className="flex justify-end -mt-1 mb-4">
          <Link to="/forgot-password" className="text-[12.5px] font-bold text-[#772432] hover:underline">
            Forgot password?
          </Link>
        </div>

        <SubmitButton disabled={!formOk} loading={loading}>
          Sign in
        </SubmitButton>
      </form>

      <OrDivider />
      <GoogleButton onClick={handleGoogle} disabled={loading} label="Continue with Google" />
    </AuthLayout>
  )
}
