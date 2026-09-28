import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import { TextField, SubmitButton, FormAlert } from '../FormField'

const EMAIL_RE = /\S+@\S+\.\S+/

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthContext()
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
      // Deliberately generic: don't leak whether the address has an account.
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
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one."
      footer={
        <Link to="/signin" className="font-bold text-[#772432] hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <FormAlert kind="success">
          If an account exists for <strong>{email.trim()}</strong>, a password reset link is on its way. Check your
          inbox and spam folder.
        </FormAlert>
      ) : (
        <>
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
            <SubmitButton disabled={!emailOk} loading={loading}>
              Send reset link
            </SubmitButton>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
