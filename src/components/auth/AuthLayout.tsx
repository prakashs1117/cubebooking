import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  footer?: ReactNode
}

/** Full-screen Liquid Carbon branded wrapper for auth screens. */
export default function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div
      className="h-dvh relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10"
      style={{ background: 'var(--brand-purple)', fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      {/* Floating brand circles — clamped so they stay partially visible on any screen width */}
      <div className="float" style={{ position: 'absolute', width: 'clamp(160px,45vw,320px)', height: 'clamp(160px,45vw,320px)', borderRadius: '9999px', background: 'var(--brand-mint)', top: '-15%', right: '-10%', opacity: 0.9 }} />
      <div className="float" style={{ position: 'absolute', width: 'clamp(100px,25vw,180px)', height: 'clamp(100px,25vw,180px)', borderRadius: '9999px', background: 'var(--brand-magenta)', top: '30%', right: '-8%', animationDelay: '-2s', opacity: 0.9 }} />
      <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '9999px', background: 'var(--brand-yellow)', top: '52%', left: 'clamp(200px,55%,280px)', opacity: 0.85 }} />
      <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '9999px', border: '20px solid var(--brand-lime)', boxSizing: 'border-box', top: '10%', left: '-40px' }} />
      <div className="float" style={{ position: 'absolute', width: 100, height: 100, borderRadius: '9999px', background: 'var(--brand-purple)', bottom: '8%', left: '-20px', opacity: 0.5, animationDelay: '-3s' }} />

      {/* Content card */}
      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {children}
      </div>

      {footer ? (
        <div className="relative mt-5 text-center text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function GoogleButton({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 bg-white text-[#1A1519] font-semibold text-sm rounded-xl py-3 px-4 border border-white/20 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed tap"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
      </svg>
      {label}
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-2 sm:my-4">
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>or</span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.2)' }} />
    </div>
  )
}
