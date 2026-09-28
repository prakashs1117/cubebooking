import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import Loader from './Loader'

/**
 * Gates a route on being signed in, and optionally on having the admin role.
 * Waits for AuthProvider to resolve both the auth state and the first profile
 * snapshot, so an admin refreshing /admin is never briefly bounced.
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const { user, loading, isAdmin } = useAuthContext()
  const location = useLocation()

  if (loading) return <Loader />

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}
