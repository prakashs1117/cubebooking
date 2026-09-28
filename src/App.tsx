import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { isGuestOnly } from './lib/roles'
import ClubInterestPage from './components/ClubInterestPage'
import AdminManagementPage from './components/AdminManagementPage'
import AdminLogin from './components/AdminLogin'
import ProfilePage from './components/ProfilePage'
import MembersPage from './components/MembersPage'
import MeetingPosterPage from './components/roster/MeetingPosterPage'
import RosterListPage from './components/roster/RosterListPage'
import PosterSharePage from './components/roster/PosterSharePage'
import VotingPage from './components/roster/VotingPage'
import FeedbackPage from './components/FeedbackPage'
import CommunityFeedPage from './components/blog/CommunityFeedPage'
import PostDetailPage from './components/blog/PostDetailPage'
import CreatePostPage from './components/blog/CreatePostPage'
import MyPostsPage from './components/blog/MyPostsPage'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import Footer from './components/Footer'
import BottomTabBar from './components/BottomTabBar'

/** Keeps signed-in users off the sign-in / sign-up screens. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  if (loading) return <Loader />
  if (user) return <Navigate to="/profile" replace />
  return <>{children}</>
}

function ClubMemberRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthContext()
  const location = useLocation()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  if (!profile || isGuestOnly(profile)) {
    return <Navigate to="/profile" replace />
  }
  return <>{children}</>
}

function useShowTabBar() {
  const { loading } = useAuthContext()
  if (loading) return false
  return true
}

function AppRoutes() {
  const { isAdmin, loading } = useAuthContext()
  const showTabBar = useShowTabBar()

  return (
    <>
    <Routes>
      <Route path="/" element={<ClubInterestPage />} />
      <Route path="/onboarding" element={<ClubInterestPage />} />

      <Route path="/signup" element={<GuestOnly><SignUpPage /></GuestOnly>} />
      <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roster"
        element={
          <ClubMemberRoute>
            <RosterListPage />
          </ClubMemberRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ClubMemberRoute>
            <MembersPage />
          </ClubMemberRoute>
        }
      />
      <Route
        path="/roster/:rosterId"
        element={
          <ClubMemberRoute>
            <MeetingPosterPage />
          </ClubMemberRoute>
        }
      />

      <Route
        path="/admin-login"
        element={loading ? <Loader /> : isAdmin ? <Navigate to="/management" replace /> : <AdminLogin />}
      />
      <Route path="/admin" element={<Navigate to="/management" replace />} />

      <Route
        path="/management"
        element={
          <ProtectedRoute requireAdmin>
            <AdminManagementPage />
          </ProtectedRoute>
        }
      />

      <Route path="/poster/:rosterId" element={<PosterSharePage />} />

      <Route path="/roster/:rosterId/vote" element={<VotingPage />} />

      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Blog / Community — /blog/my and /blog/new MUST precede /blog/:postId */}
      <Route path="/blog" element={<CommunityFeedPage />} />
      <Route path="/blog/my" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
      <Route path="/blog/new" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
      <Route path="/blog/:postId/edit" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
      <Route path="/blog/:postId" element={<PostDetailPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer />
    {showTabBar && <BottomTabBar />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}
