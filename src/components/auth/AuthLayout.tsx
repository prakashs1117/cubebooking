import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import MerckLogo from './MerckLogo'
import UpcomingVisitCard from '../ui/UpcomingVisitCard'

interface AuthLayoutProps {
  children: ReactNode
  footer?: ReactNode
}

// ─── Animated left-panel science illustration ─────────────────────────────────
// Pure CSS animation — no GSAP dependency, no network images.

const PANEL_CSS = `
@keyframes auth-float   { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-12px)} }
@keyframes auth-float2  { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-8px)}  }
@keyframes auth-spin    { from{transform:rotate(0deg)}         to{transform:rotate(360deg)}     }
@keyframes auth-spin-r  { from{transform:rotate(0deg)}         to{transform:rotate(-360deg)}    }
@keyframes auth-pulse   { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
@keyframes auth-rise    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes auth-orb1    { 0%,100%{transform:rotate(0deg)  scaleY(.38)} 50%{transform:rotate(180deg) scaleY(.38)} }
@keyframes auth-wave    { from{transform:translateX(0)}    to{transform:translateX(-50%)} }
@keyframes auth-bubble  {
  0%   { transform:translateY(0)   scale(.5); opacity:0 }
  15%  { opacity:.85 }
  85%  { opacity:.6 }
  100% { transform:translateY(-180px) scale(1); opacity:0 }
}
@keyframes auth-shake   {
  0%,100%{ transform:rotate(0deg)   }
  20%    { transform:rotate(-3deg)  }
  40%    { transform:rotate(3deg)   }
  60%    { transform:rotate(-2deg)  }
  80%    { transform:rotate(2deg)   }
}
.auth-float  { animation: auth-float  5s ease-in-out infinite }
.auth-float2 { animation: auth-float2 4s ease-in-out infinite }
.auth-pulse  { animation: auth-pulse  3s ease-in-out infinite }
.auth-rise   { animation: auth-rise   .7s cubic-bezier(.2,.8,.2,1) both }
.auth-rise-2 { animation: auth-rise   .7s .12s cubic-bezier(.2,.8,.2,1) both }
.auth-rise-3 { animation: auth-rise   .7s .24s cubic-bezier(.2,.8,.2,1) both }
`

function BrandPanel() {
  const intl = useIntl()
  return (
    <>
      <style>{PANEL_CSS}</style>
      <div style={{
        flex: '1 1 0',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(155deg, #503291 0%, #2b1a57 60%, #1a0f38 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'clamp(32px,4vw,56px)',
        minHeight: 0,
      }}>

        {/* ── Decorative blobs ── */}
        <div className="auth-float" style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'var(--brand-mint)', top:'-15%', right:'-12%', opacity:.18 }} />
        <div className="auth-float2" style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'var(--brand-magenta)', top:'28%', right:'-6%', opacity:.22, animationDelay:'-1.4s' }} />
        <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'var(--brand-yellow)', left:'8%', top:'18%', opacity:.16 }} />
        <div style={{ position:'absolute', width:100, height:100, borderRadius:'50%', border:'16px solid var(--brand-lime)', left:'38%', top:'-4%', opacity:.28, boxSizing:'border-box' }} />

        {/* ── Flask SVG illustration (top-centred) ── */}
        <div className="auth-float" style={{ position:'absolute', left:'50%', top:'4%', transform:'translateX(-50%)', width:'min(300px,52%)', animationDuration:'6s' }}>
          <svg viewBox="0 0 280 340" style={{ width:'100%', height:'auto', filter:'drop-shadow(0 24px 48px rgba(0,0,0,.55))' }}>
            <defs>
              <clipPath id="auth-flask"><path d="M110 30V100L60 220Q48 248 72 252H208Q232 248 220 220L170 100V30Z"/></clipPath>
              <linearGradient id="auth-glass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity=".32"/>
                <stop offset="1" stopColor="#fff" stopOpacity=".06"/>
              </linearGradient>
            </defs>

            {/* Liquid */}
            <g clipPath="url(#auth-flask)">
              <rect x="0" y="160" width="280" height="120" fill="var(--brand-cyan)" opacity=".5"/>
              <rect x="0" y="170" width="280" height="100" fill="var(--brand-mint)"/>
              {/* Wave */}
              <g style={{ animation:'auth-wave 3s linear infinite' }}>
                <path d="M0 170 q35,-14 70,0 t70,0 t70,0 t70,0 V280 H0Z" fill="var(--brand-mint)" opacity=".85"/>
                <path d="M0 175 q35,-10 70,0 t70,0 t70,0 t70,0 V280 H0Z" fill="#96d7d2"/>
              </g>
              {/* Bubbles */}
              {[
                { cx:90,  cy:240, r:5, delay:'0s',    dur:'2.2s' },
                { cx:140, cy:250, r:7, delay:'.6s',   dur:'2.8s' },
                { cx:170, cy:238, r:4, delay:'1.1s',  dur:'2.4s' },
                { cx:115, cy:245, r:6, delay:'1.8s',  dur:'3s'   },
              ].map((b, i) => (
                <circle key={i} cx={b.cx} cy={b.cy} r={b.r}
                  fill="#fff" fillOpacity=".5"
                  style={{ animation:`auth-bubble ${b.dur} ${b.delay} ease-in infinite` }}/>
              ))}
            </g>

            {/* Flask glass */}
            <path fill="url(#auth-glass)" d="M110 30V100L60 220Q48 248 72 252H208Q232 248 220 220L170 100V30Z"/>
            <path fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" d="M110 30V100L60 220Q48 248 72 252H208Q232 248 220 220L170 100V30Z"/>
            {/* Neck */}
            <rect x="104" y="22" width="72" height="14" rx="7" fill="rgba(255,255,255,.2)" stroke="#fff" strokeWidth="5"/>
            {/* Inner shine */}
            <path d="M122 45V110L90 195" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="4" strokeLinecap="round"/>

            {/* Vapour puffs */}
            {[
              { cx:130, cy:16, r:5, delay:'0s', dur:'1.8s' },
              { cx:143, cy:12, r:7, delay:'.4s', dur:'2.2s' },
              { cx:156, cy:16, r:4, delay:'.8s', dur:'1.9s' },
            ].map((v, i) => (
              <circle key={i} cx={v.cx} cy={v.cy} r={v.r}
                fill="none" stroke="#fff" strokeWidth="2"
                style={{ animation:`auth-bubble ${v.dur} ${v.delay} ease-in infinite` }}/>
            ))}

            {/* Atom (top-right) */}
            <g transform="translate(232 54)">
              <circle r="6" fill="var(--brand-yellow)"/>
              {[0, 60, 120].map((rot, i) => (
                <g key={i} transform={`rotate(${rot})`}>
                  <ellipse rx="36" ry="14" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5"
                    style={{ animation:`auth-spin ${2.4 + i * 0.8}s linear infinite` }}/>
                  <circle cx="36" r="4.5" fill={['var(--brand-mint)','var(--brand-magenta)','var(--brand-lime)'][i]}/>
                </g>
              ))}
            </g>

            {/* Benzene hex (bottom-left) */}
            <g transform="translate(42 200)">
              <polygon points="20,0 10,17.3 -10,17.3 -20,0 -10,-17.3 10,-17.3"
                fill="rgba(255,255,255,.06)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round"
                style={{ animation:'auth-spin-r 22s linear infinite', transformOrigin:'center' }}/>
              <circle r="12" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.5"/>
              {[0,60,120,180,240,300].map((a, i) => (
                <circle key={i} cx={20*Math.cos(a*Math.PI/180)} cy={20*Math.sin(a*Math.PI/180)} r="3"
                  fill={['var(--brand-yellow)','var(--brand-lime)'][i%2]}/>
              ))}
            </g>

            {/* Test tubes */}
            {[
              { tx:6,  fill:'var(--brand-mint)',    h:50 },
              { tx:24, fill:'var(--brand-magenta)', h:38 },
              { tx:42, fill:'var(--brand-yellow)',  h:62 },
            ].map(({ tx, fill, h }, i) => (
              <g key={i} transform={`translate(${tx} 282)`}>
                <rect x="0" y={h} width="12" height={80-h} fill={fill} rx="2"/>
                <path d="M0 0V60a6 6 0 0 0 12 0V0" fill="rgba(255,255,255,.12)" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </g>
            ))}
          </svg>
        </div>

        {/* ── Floating chip labels ── */}
        {[
          { text:'H₂O', color:'var(--brand-yellow)', style:{ left:'10%', top:'20%' }, delay:'.2s' },
          { text:'CO₂', color:'var(--brand-mint)',   style:{ right:'8%', top:'24%' }, delay:'.5s' },
          { text:'pH 7',color:'var(--brand-lime)',   style:{ left:'16%', top:'40%' }, delay:'.8s' },
        ].map(({ text, color, style, delay }, i) => (
          <div key={i} className="auth-float2" style={{ position:'absolute', ...style, animationDelay:delay }}>
            <span style={{ display:'block', padding:'6px 12px', borderRadius:10, background:color, color:'var(--foreground)', fontWeight:800, fontSize:13, fontFamily:'var(--font-display)', boxShadow:'0 8px 20px rgba(0,0,0,.35)' }}>
              {text}
            </span>
          </div>
        ))}

        {/* ── Upcoming visit card (real data, shown only when logged in) ── */}
        <UpcomingVisitCard
          variant="panel"
          style={{ position:'absolute', right:'6%', top:'38%' }}
        />

        {/* ── Bottom text content ── */}
        <div style={{ position:'relative', zIndex:2 }}>
          <Link to="/programs" style={{ textDecoration:'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <div style={{ background:'rgba(255,255,255,.12)', borderRadius:12, padding:'6px 10px' }}>
                <MerckLogo width={44} height={21} />
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, color:'#fff' }}>Curiosity</span>
            </div>
          </Link>

          <h2 className="auth-rise" style={{ margin:'0 0 10px', fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(26px,2.8vw,36px)', lineHeight:1.1, letterSpacing:'-0.02em', color:'#fff' }}>
            {intl.formatMessage({ id: 'auth.info.headline' })}
          </h2>
          <p className="auth-rise-2" style={{ margin:'0 0 20px', fontSize:14, lineHeight:1.65, color:'rgba(255,255,255,.72)', maxWidth:340 }}>
            {intl.formatMessage({ id: 'auth.info.sub' })}
          </p>

          {/* Stats row */}
          <div className="auth-rise-3" style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[
              { n: intl.formatMessage({ id: 'auth.info.stat1.value' }), l: intl.formatMessage({ id: 'auth.info.stat1.label' }) },
              { n: intl.formatMessage({ id: 'auth.info.stat2.value' }), l: intl.formatMessage({ id: 'auth.info.stat2.label' }) },
              { n: intl.formatMessage({ id: 'auth.info.stat3.value' }), l: intl.formatMessage({ id: 'auth.info.stat3.label' }) },
            ].map(({ n, l }) => (
              <div key={l} style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <span style={{ fontFamily:'var(--font-merck)', fontWeight:800, fontSize:20, color:'var(--brand-yellow)', letterSpacing:'.04em' }}>{n}</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.55)', fontWeight:600 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── AuthLayout ────────────────────────────────────────────────────────────────

export default function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        fontFamily: 'var(--font-sans)',
        color: 'var(--foreground)',
        // Purple base — shows through on mobile, covered by white panel on desktop
        background: 'var(--brand-purple)',
      }}
    >
      {/* Left: brand panel — desktop/tablet only */}
      <div className="hidden md:flex" style={{ width: '48%', minWidth: 400, maxWidth: 560, flexShrink: 0 }}>
        <BrandPanel />
      </div>

      {/* Mobile-only floating blobs (match original AuthLayout decorations) */}
      <div className="md:hidden" aria-hidden="true">
        <div className="float" style={{ position:'fixed', width:'clamp(160px,45vw,320px)', height:'clamp(160px,45vw,320px)', borderRadius:'9999px', background:'var(--brand-mint)', top:'-15%', right:'-10%', opacity:0.9, pointerEvents:'none' }}/>
        <div className="float" style={{ position:'fixed', width:'clamp(100px,25vw,180px)', height:'clamp(100px,25vw,180px)', borderRadius:'9999px', background:'var(--brand-magenta)', top:'30%', right:'-8%', animationDelay:'-2s', opacity:0.9, pointerEvents:'none' }}/>
        <div style={{ position:'fixed', width:80, height:80, borderRadius:'9999px', background:'var(--brand-yellow)', top:'52%', left:'clamp(200px,55%,280px)', opacity:0.85, pointerEvents:'none' }}/>
        <div style={{ position:'fixed', width:140, height:140, borderRadius:'9999px', border:'20px solid var(--brand-lime)', boxSizing:'border-box', top:'10%', left:'-40px', pointerEvents:'none' }}/>
        <div className="float" style={{ position:'fixed', width:100, height:100, borderRadius:'9999px', background:'var(--brand-purple)', bottom:'8%', left:'-20px', opacity:0.5, animationDelay:'-3s', pointerEvents:'none' }}/>
      </div>

      {/* Right: form panel — transparent on mobile (shows purple bg), white on desktop */}
      <div
        className="auth-form-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px,5vw,56px) clamp(20px,5vw,48px)',
          overflowY: 'auto',
          minHeight: '100dvh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Mobile-only logo (white, sits on purple bg) */}
        <div className="md:hidden mb-6 self-start">
          <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ background:'rgba(255,255,255,.12)', borderRadius:12, padding:'6px 10px' }}>
              <MerckLogo width={44} height={21} />
            </div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color:'#fff' }}>Curiosity</span>
          </div>
        </div>

        {/* Form content */}
        <div style={{ width:'100%', maxWidth:420 }}>
          {children}
        </div>

        {footer && (
          <div className="auth-footer-text" style={{ marginTop:24, textAlign:'center', fontSize:12, maxWidth:400 }}>
            {footer}
          </div>
        )}
      </div>

      {/* Scoped CSS: panel background white on md+, transparent on mobile */}
      <style>{`
        .auth-form-panel { background: transparent; }
        @media (min-width: 768px) {
          .auth-form-panel { background: var(--background); }
          .auth-footer-text { color: var(--muted-foreground); }
        }
        @media (max-width: 767px) {
          .auth-footer-text { color: rgba(255,255,255,0.5); }
        }
      `}</style>
    </div>
  )
}

// ─── Re-exported helpers ───────────────────────────────────────────────────────

export function GoogleButton({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 font-semibold text-sm rounded-xl py-3 px-4 tap transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background:'var(--background)', color:'var(--foreground)', border:'1.5px solid var(--border)', boxShadow:'var(--shadow-xs)' }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
        <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
      </svg>
      {label}
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1" style={{ background:'var(--border)' }}/>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--muted-foreground)' }}>or</span>
      <div className="h-px flex-1" style={{ background:'var(--border)' }}/>
    </div>
  )
}
