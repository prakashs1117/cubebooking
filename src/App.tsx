import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { useAnalyticsInit, usePageTracking } from './hooks/useAnalytics'
import { useMaintenanceMode } from './hooks/useMaintenanceMode'
import { MaintenanceBanner } from './components/ui/MaintenanceBanner'
import { MaintenanceModal } from './components/ui/MaintenanceModal'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import SignInPage from './components/auth/SignInPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import HomePage from './components/pages/HomePage'
import BookingsPage from './components/pages/BookingsPage'
import BookingDetailPage from './components/pages/BookingDetailPage'
import KitPage from './components/pages/KitPage'
import ProfilePage from './components/pages/ProfilePage'
import QRScanPage from './components/admin/QRScanPage'
import BookingVerifyPage from './components/admin/BookingVerifyPage'
import AdminDashboardPage from './components/admin/AdminDashboardPage'
import ProgramsPage from './components/pages/ProgramsPage'
import InformationPage from './components/pages/InformationPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,  // default: 30s; overridden per-query where appropriate
      retry: 1,
      gcTime: 5 * 60_000, // 5 min — explicit, matches TanStack default
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
})

function AnalyticsTracker() {
  useAnalyticsInit()
  usePageTracking()
  return null
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { enabled, bannerOnly, message, loading } = useMaintenanceMode()
  if (loading) return <>{children}</>
  return (
    <>
      {enabled && bannerOnly && <MaintenanceBanner message={message} />}
      {enabled && !bannerOnly && <MaintenanceModal message={message} />}
      {children}
    </>
  )
}

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
      {/* Public — no shell, no auth */}
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/info" element={<InformationPage />} />

      {/* Auth — no shell */}
      <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Shell pages */}
      <Route path="/home" element={<ShellRoute element={<HomePage />} />} />
      <Route path="/bookings" element={<ShellRoute element={<BookingsPage />} />} />
      <Route path="/bookings/:id" element={<ShellRoute element={<BookingDetailPage />} />} />
      <Route path="/kit" element={<ShellRoute element={<KitPage />} />} />
      <Route path="/profile" element={<ShellRoute element={<ProfilePage />} />} />

      {/* Booking funnel — now handled via modal; redirect old URLs to home */}
      <Route path="/book/*" element={<Navigate to="/home" replace />} />

      {/* Admin — role-guarded */}
      <Route path="/admin" element={<ShellRoute element={<ProtectedRoute requireStaff><AdminDashboardPage /></ProtectedRoute>} />} />
      <Route path="/admin/scan" element={<ProtectedRoute requireStaff><QRScanPage /></ProtectedRoute>} />
      <Route path="/admin/verify/:bookingId" element={<ProtectedRoute requireStaff><BookingVerifyPage /></ProtectedRoute>} />
      <Route path="/admin/toad" element={<Navigate to="/admin" replace />} />

      {/* Future routes */}
      {/* <Route path="/toad" element={<ProtectedRoute><ToadRequestPage /></ProtectedRoute>} /> */}

      <Route path="/" element={<Navigate to="/info" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <MaintenanceGate>
            <AnalyticsTracker />
            <AppRoutes />
          </MaintenanceGate>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}
