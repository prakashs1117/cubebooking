import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-ground)' }}>
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
      />
    </div>
  )
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireStaff = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
  requireStaff?: boolean
}) {
  const { user, loading, isAdmin, isStaff } = useAuthContext()
  const location = useLocation()

  if (loading) return <Spinner />

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  if (requireStaff && !isStaff) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
