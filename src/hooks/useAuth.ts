// Thin alias for the auth context so components can keep importing useAuth.
// The single onAuthStateChanged listener lives in AuthProvider.
export { useAuthContext as useAuth } from '../context/AuthContext'
