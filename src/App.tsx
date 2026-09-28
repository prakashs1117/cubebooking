import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import SignInPage from './components/auth/SignInPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import HomePage from './components/pages/HomePage'
import BookPage from './components/booking/BookPage'
import BookProgramsPage from './components/booking/BookProgramsPage'
import BookTimePage from './components/booking/BookTimePage'
import BookDetailsPage from './components/booking/BookDetailsPage'
import ReviewPage from './components/booking/ReviewPage'
import ConfirmedPage from './components/booking/ConfirmedPage'
import BookingsPage from './components/pages/BookingsPage'
import BookingDetailPage from './components/pages/BookingDetailPage'
import KitPage from './components/pages/KitPage'
import ProfilePage from './components/pages/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  const location = useLocation()
  if (loading) return null
  if (user) return <Navigate to={(location.state as { from?: string })?.from ?? '/home'} replace />
  return <>{children}</>
}

/** Wraps a page in the AppShell (sidebar + tab bar) */
function ShellRoute({ element }: { element: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{element}</AppShell>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth — no shell */}
      <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Shell pages */}
      <Route path="/home" element={<ShellRoute element={<HomePage />} />} />
      <Route path="/bookings" element={<ShellRoute element={<BookingsPage />} />} />
      <Route path="/bookings/:id" element={<ShellRoute element={<BookingDetailPage />} />} />
      <Route path="/kit" element={<ShellRoute element={<KitPage />} />} />
      <Route path="/profile" element={<ShellRoute element={<ProfilePage />} />} />

      {/* Booking funnel — no shell (full-screen flow) */}
      <Route path="/book" element={<ProtectedRoute><BookPage /></ProtectedRoute>} />
      <Route path="/book/programs" element={<ProtectedRoute><BookProgramsPage /></ProtectedRoute>} />
      <Route path="/book/time" element={<ProtectedRoute><BookTimePage /></ProtectedRoute>} />
      <Route path="/book/details" element={<ProtectedRoute><BookDetailsPage /></ProtectedRoute>} />
      <Route path="/book/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
      <Route path="/book/confirmed" element={<ProtectedRoute><ConfirmedPage /></ProtectedRoute>} />

      {/* Future routes */}
      {/* <Route path="/toad" element={<ProtectedRoute><ToadRequestPage /></ProtectedRoute>} /> */}
      {/* <Route path="/admin" element={<ShellRoute element={<AdminHomePage />} />} /> */}

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}
