import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SignInPage from './components/auth/SignInPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import HomePage from './components/pages/HomePage'
import BookPage from './components/booking/BookPage'
import BookProgramsPage from './components/booking/BookProgramsPage'
import BookTimePage from './components/booking/BookTimePage'
import BookDetailsPage from './components/booking/BookDetailsPage'
import ReviewPage from './components/booking/ReviewPage'
import ConfirmedPage from './components/booking/ConfirmedPage'

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

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Home */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

      {/* Onsite booking funnel */}
      <Route path="/book" element={<ProtectedRoute><BookPage /></ProtectedRoute>} />
      <Route path="/book/programs" element={<ProtectedRoute><BookProgramsPage /></ProtectedRoute>} />
      <Route path="/book/time" element={<ProtectedRoute><BookTimePage /></ProtectedRoute>} />
      <Route path="/book/details" element={<ProtectedRoute><BookDetailsPage /></ProtectedRoute>} />
      <Route path="/book/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
      <Route path="/book/confirmed" element={<ProtectedRoute><ConfirmedPage /></ProtectedRoute>} />

      {/* Future routes */}
      {/* <Route path="/toad" element={<ProtectedRoute><ToadRequestPage /></ProtectedRoute>} /> */}
      {/* <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} /> */}
      {/* <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} /> */}
      {/* <Route path="/kit" element={<ProtectedRoute><KitPage /></ProtectedRoute>} /> */}
      {/* <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> */}
      {/* <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminHomePage /></ProtectedRoute>} /> */}

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
