import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { AlertCircle, LogIn } from 'lucide-react'

interface AdminLoginProps {
  onLoginSuccess?: () => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      onLoginSuccess?.()
    } catch (err: any) {
      let errorMsg = 'Authentication failed'
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'Email not found. Create an account first.'
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password.'
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Email already in use.'
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak (min 6 characters).'
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email format.'
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            margin: '0 auto 16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 28,
            fontWeight: 800,
          }}>A</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
            Manage your Toastmasters club
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#fee2e2',
            border: '1.5px solid #fca5a5',
          }}>
            <AlertCircle size={18} color="#991b1b" />
            <span style={{ fontSize: 14, color: '#991b1b' }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@toastmasters.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1.5px solid #d1d5db',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1.5px solid #d1d5db',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)'
              }
            }}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <LogIn size={16} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Member link */}
        <div style={{
          textAlign: 'center',
          paddingTop: 20,
          borderTop: '1px solid #e5e7eb',
        }}>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px 0' }}>
            Not an admin?
          </p>
          <Link
            to="/signin"
            style={{
              color: '#6366f1',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Member sign in
          </Link>
        </div>

        {/* Info */}
        <div style={{
          marginTop: 24,
          padding: '12px 16px',
          background: '#f0f9ff',
          borderRadius: 10,
          border: '1px solid #bfdbfe',
        }}>
          <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
            🔒 Admin access is granted by an existing admin. Sign in with an account that has the admin role.
          </p>
        </div>
      </div>
    </div>
  )
}
