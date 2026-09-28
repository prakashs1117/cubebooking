import { useState } from 'react'
import { Shield, Globe, Trash2, Download, ChevronRight, Edit3, Check } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

function InitialsAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="flex-none grid place-items-center rounded-full text-white font-bold"
      style={{ width: size, height: size, background: 'var(--brand-purple)', fontSize: size * 0.35, fontFamily: 'var(--font-display)' }}
    >
      {initials || '?'}
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, logout, resetPassword } = useAuthContext()
  const [language, setLanguage] = useState<'de' | 'en'>(profile?.language ?? 'de')
  const [passwordSent, setPasswordSent] = useState(false)

  const handleResetPassword = async () => {
    if (!user?.email) return
    await resetPassword(user.email)
    setPasswordSent(true)
  }

  const rows: { label: string; value: string; placeholder?: string }[] = [
    { label: 'Name', value: profile?.displayName ?? '', placeholder: 'Your name' },
    { label: 'Email', value: user?.email ?? '' },
    { label: 'School', value: '', placeholder: 'Your school name' },
  ]

  return (
    <div
      className="min-h-screen flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      <main className="flex-1 scroll overflow-y-auto px-5 pt-12 lg:pt-6 pb-24 lg:pb-6 flex flex-col gap-4">
        <h1 className="m-0 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Profile
        </h1>

        {/* Identity card */}
        <section
          className="rise flex gap-3.5 items-center p-4 rounded-[22px] border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <InitialsAvatar name={profile?.displayName ?? user?.email ?? 'U'} />
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate">{profile?.displayName || 'Teacher'}</div>
            <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</div>
            {profile?.schoolId && (
              <div
                className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'var(--accent)', color: 'var(--brand-green)' }}
              >
                <Check className="w-3 h-3" />
                School approved
              </div>
            )}
          </div>
          <button type="button" className="tap flex-none iconbtn" aria-label="Edit profile">
            <Edit3 className="i i-sm" />
          </button>
        </section>

        {/* Profile fields */}
        <section className="rise-2 rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {rows.map((row, i) => (
            <div key={i} className="flex items-center min-h-[52px] px-4 gap-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <span className="w-20 text-xs flex-none" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
              <span className="flex-1 text-sm font-medium truncate" style={{ color: row.value ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {row.value || row.placeholder}
              </span>
              {row.label !== 'Email' && (
                <ChevronRight className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>
          ))}
        </section>

        {/* Language toggle */}
        <section
          className="rise-2 flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <Globe className="w-5 h-5 flex-none" style={{ color: 'var(--muted-foreground)' }} />
          <span className="flex-1 text-sm font-medium">Language</span>
          <div
            role="group"
            aria-label="Language"
            className="flex p-1 rounded-full gap-1"
            style={{ background: 'var(--muted)' }}
          >
            {(['DE', 'EN'] as const).map((lang) => {
              const active = language === lang.toLowerCase()
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang.toLowerCase() as 'de' | 'en')}
                  className="tap px-3 py-1 rounded-full text-xs font-bold transition-colors"
                  style={{
                    background: active ? 'var(--background)' : 'transparent',
                    color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)',
                    boxShadow: active ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  {lang}
                </button>
              )
            })}
          </div>
        </section>

        {/* Privacy & security */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}>
            Privacy & security
          </h2>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div
              className="flex items-center gap-3 px-4 min-h-[52px] border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <Shield className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              <span className="flex-1 text-sm">Data stored in EU (Frankfurt)</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--accent)', color: 'var(--brand-green)' }}>
                GDPR
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={passwordSent}
              className="tap w-full flex items-center gap-3 px-4 min-h-[52px] border-b text-sm text-left disabled:opacity-60"
              style={{ background: 'transparent', border: 'none', borderBottom: `1px solid var(--border)`, color: 'var(--foreground)', cursor: 'pointer' }}
            >
              <ChevronRight className="w-4 h-4 flex-none rotate-0" style={{ color: 'var(--muted-foreground)' }} />
              {passwordSent ? 'Reset link sent ✓' : 'Change password'}
            </button>

            <button
              type="button"
              className="tap w-full flex items-center gap-3 px-4 min-h-[52px] border-b text-sm text-left"
              style={{ background: 'transparent', border: 'none', borderBottom: `1px solid var(--border)`, color: 'var(--foreground)', cursor: 'pointer' }}
            >
              <Download className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              Export my data
            </button>

            <button
              type="button"
              className="tap w-full flex items-center gap-3 px-4 min-h-[52px] text-sm text-left"
              style={{ background: 'transparent', border: 'none', color: 'var(--destructive)', cursor: 'pointer' }}
            >
              <Trash2 className="w-4 h-4 flex-none" />
              Delete my account
            </button>
          </div>
        </section>

        {/* Sign out */}
        <button
          type="button"
          onClick={logout}
          className="tap w-full h-11 rounded-xl text-sm font-semibold border"
          style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--muted-foreground)' }}
        >
          Sign out
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Curiosity Booking · Merck KGaA, Darmstadt · No student data stored
        </p>
      </main>
    </div>
  )
}
