import { useRef, useState } from 'react'
import { Shield, Globe, Trash2, Download, ChevronRight, Check, Palette, Pencil, X, Loader2 } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useAuthContext } from '../../context/AuthContext'
import { useLocale } from '../../context/LocaleContext'
import ThemeToggle from '../ui/ThemeToggle'

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

type EditField = 'name' | 'school' | null

export default function ProfilePage() {
  const intl = useIntl()
  const { locale, setLocale } = useLocale()
  const { user, profile, logout, resetPassword, updateProfile } = useAuthContext()
  const [passwordSent, setPasswordSent] = useState(false)
  const [editing, setEditing] = useState<EditField>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (field: EditField) => {
    if (!field) return
    setDraft(field === 'name' ? (profile?.displayName ?? '') : (profile?.schoolName ?? ''))
    setSaveError(null)
    setEditing(field)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancelEdit = () => { setEditing(null); setSaveError(null) }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    try {
      if (editing === 'name') await updateProfile({ displayName: draft.trim() })
      else await updateProfile({ schoolName: draft.trim() })
      setEditing(null)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user?.email) return
    await resetPassword(user.email)
    setPasswordSent(true)
  }

  const handleLanguageChange = async (lang: 'de' | 'en') => {
    setLocale(lang)
    try { await updateProfile({ language: lang }) } catch { /* noop — locale already switched locally */ }
  }

  const editableRow = (field: EditField, label: string, value: string, placeholder: string, ariaLabel: string) => {
    const isEditing = editing === field
    return (
      <div className="flex items-center min-h-[52px] px-4 gap-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
        <span className="w-20 text-xs flex-none" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
            className="flex-1 text-sm bg-transparent outline-none border-b-2 py-0.5"
            style={{ borderColor: 'var(--primary)', color: 'var(--foreground)' }}
            placeholder={placeholder}
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate" style={{ color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
            {value || placeholder}
          </span>
        )}
        {isEditing ? (
          <div className="flex items-center gap-1 flex-none">
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              aria-label="Save"
              className="tap iconbtn"
              style={{ color: 'var(--primary)' }}
            >
              {saving ? <Loader2 className="i i-sm animate-spin" /> : <Check className="i i-sm" />}
            </button>
            <button type="button" onClick={cancelEdit} aria-label="Cancel" className="tap iconbtn" style={{ color: 'var(--muted-foreground)' }}>
              <X className="i i-sm" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => startEdit(field)} aria-label={ariaLabel} className="tap iconbtn flex-none" style={{ color: 'var(--muted-foreground)' }}>
            <Pencil className="i i-sm" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full"
      style={{ background: 'var(--app-ground)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      <main className="flex-1 scroll overflow-y-auto px-5 pt-6 pb-24 lg:pb-6 flex flex-col gap-4">
        <h1 className="m-0 text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'profile.title' })}
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
        </section>

        {saveError && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--tint-red)', color: 'var(--destructive)' }}>
            {saveError}
          </div>
        )}

        {/* Profile fields */}
        <section className="rise-2 rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {editableRow('name', intl.formatMessage({ id: 'profile.field.name' }), profile?.displayName ?? '', intl.formatMessage({ id: 'profile.field.name.placeholder' }), intl.formatMessage({ id: 'profile.field.name.edit' }))}
          <div className="flex items-center min-h-[52px] px-4 gap-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <span className="w-20 text-xs flex-none" style={{ color: 'var(--muted-foreground)' }}>{intl.formatMessage({ id: 'profile.field.email' })}</span>
            <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</span>
          </div>
          {editableRow('school', intl.formatMessage({ id: 'profile.field.school' }), profile?.schoolName ?? '', intl.formatMessage({ id: 'profile.field.school.placeholder' }), intl.formatMessage({ id: 'profile.field.school.edit' }))}
        </section>

        {/* Language toggle */}
        <section
          className="rise-2 flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <Globe className="w-5 h-5 flex-none" style={{ color: 'var(--muted-foreground)' }} />
          <span className="flex-1 text-sm font-medium">{intl.formatMessage({ id: 'profile.language' })}</span>
          <div
            role="group"
            aria-label="Language"
            className="flex p-1 rounded-full gap-1"
            style={{ background: 'var(--muted)' }}
          >
            {(['de', 'en'] as const).map((lang) => {
              const active = locale === lang
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className="tap px-3 py-1 rounded-full text-xs font-bold transition-colors"
                  style={{
                    background: active ? 'var(--background)' : 'transparent',
                    color: active ? 'var(--brand-purple)' : 'var(--muted-foreground)',
                    boxShadow: active ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              )
            })}
          </div>
        </section>

        {/* Appearance */}
        <section
          className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <Palette className="w-5 h-5 flex-none" style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-sm font-medium flex-none">{intl.formatMessage({ id: 'profile.theme' })}</span>
          <div className="flex-1">
            <ThemeToggle variant="segmented" />
          </div>
        </section>

        {/* Privacy & security */}
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.12em' }}>
            {intl.formatMessage({ id: 'profile.privacy.title' })}
          </h2>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div
              className="flex items-center gap-3 px-4 min-h-[52px] border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <Shield className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              <span className="flex-1 text-sm">{intl.formatMessage({ id: 'profile.privacy.gdpr' })}</span>
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
              {intl.formatMessage({ id: passwordSent ? 'profile.privacy.passwordSent' : 'profile.privacy.changePassword' })}
            </button>

            <button
              type="button"
              className="tap w-full flex items-center gap-3 px-4 min-h-[52px] border-b text-sm text-left"
              style={{ background: 'transparent', border: 'none', borderBottom: `1px solid var(--border)`, color: 'var(--foreground)', cursor: 'pointer' }}
            >
              <Download className="w-4 h-4 flex-none" style={{ color: 'var(--muted-foreground)' }} />
              {intl.formatMessage({ id: 'profile.privacy.exportData' })}
            </button>

            <button
              type="button"
              className="tap w-full flex items-center gap-3 px-4 min-h-[52px] text-sm text-left"
              style={{ background: 'transparent', border: 'none', color: 'var(--destructive)', cursor: 'pointer' }}
            >
              <Trash2 className="w-4 h-4 flex-none" />
              {intl.formatMessage({ id: 'profile.privacy.deleteAccount' })}
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
          {intl.formatMessage({ id: 'profile.signOut' })}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {intl.formatMessage({ id: 'profile.footer' })}
        </p>
      </main>
    </div>
  )
}
