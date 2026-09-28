import { useLocation, useNavigate } from 'react-router-dom'
import { Home, User, LayoutDashboard, ClipboardList, BookOpen, Users } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { isGuestOnly } from '../lib/roles'

export default function BottomTabBar() {
  const { profile, isAdmin } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const isGuest = isGuestOnly(profile)
  const isClubMember = !isGuest

  const publicTabs = [
    { icon: <Home size={20} />, label: 'Home', path: '/', action: () => navigate('/') },
    { icon: <BookOpen size={20} />, label: 'Blog', path: '/blog', action: () => navigate('/blog') },
    { icon: <User size={20} />, label: 'Sign in', path: '/signin', action: () => navigate('/signin') },
  ]

  const adminTabs = [
    { icon: <Home size={20} />, label: 'Home', path: '/', action: () => navigate('/') },
    { icon: <BookOpen size={20} />, label: 'Blog', path: '/blog', action: () => navigate('/blog') },
    { icon: <Users size={20} />, label: 'Members', path: '/members', action: () => navigate('/members') },
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/management', action: () => navigate('/management') },
    { icon: <User size={20} />, label: 'Profile', path: '/profile', action: () => navigate('/profile') },
  ]

  const memberTabs = [
    { icon: <Home size={20} />, label: 'Home', path: '/', action: () => navigate('/') },
    { icon: <BookOpen size={20} />, label: 'Blog', path: '/blog', action: () => navigate('/blog') },
    ...(!isGuest && isClubMember
      ? [
          { icon: <ClipboardList size={20} />, label: 'Roster', path: '/roster', action: () => navigate('/roster') },
          { icon: <Users size={20} />, label: 'Members', path: '/members', action: () => navigate('/members') },
        ]
      : []),
    { icon: <User size={20} />, label: 'Profile', path: '/profile', action: () => navigate('/profile') },
  ]

  const tabs = !profile ? publicTabs : isAdmin ? adminTabs : memberTabs

  return (
    <div className="flex sm:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #E6E2DE',
      zIndex: 9999,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      transform: 'translateZ(0)',
      willChange: 'transform',
    }}>
      {tabs.map(({ icon, label, path, action }) => {
        const active = path !== null && (
          path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
        )
        return (
          <button
            key={label}
            onClick={action}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '10px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? '#772432' : '#6B7280',
              fontSize: 10, fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'color 0.15s',
            }}
          >
            {icon}
            {label}
          </button>
        )
      })}
    </div>
  )
}
