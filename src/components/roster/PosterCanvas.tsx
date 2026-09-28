import type { MeetingDetails, RoleSlot } from '../../types'
import { ROLE_CATALOGUE, matchesEntry } from '../../lib/roleCatalogue'
import { Download, Share2 } from 'lucide-react'

const POSTER_SIZE = 1080

const PC = {
  maroon: '#7C0C2E',
  maroonDeep: '#6A0A27',
  gold: '#B8860B',
  textGold: '#FFF0A0',
  teal: '#1D5E7C',
  cream: '#FBEFD0',
  white: '#FFFFFF',
}

interface PosterCanvasProps {
  meeting: MeetingDetails
  slots: RoleSlot[]
}

function PosterRibbons() {
  return (
    <svg width={POSTER_SIZE} height={POSTER_SIZE} viewBox={`0 0 ${POSTER_SIZE} ${POSTER_SIZE}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <line x1="600" y1="-30" x2="1110" y2="480" stroke={PC.gold} strokeWidth="86" />
      <line x1="468" y1="-30" x2="1110" y2="612" stroke={PC.teal} strokeWidth="20" />
      <line x1="-30" y1="600" x2="480" y2="1110" stroke={PC.teal} strokeWidth="86" />
    </svg>
  )
}


function LabelVal({ label, value, size = 30, align = 'left' }: { label: string; value: string; size?: number; align?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <span style={{ fontSize: size, fontWeight: 800, color: PC.textGold, whiteSpace: 'nowrap', letterSpacing: 0.3 }}>{label}</span>
      <span style={{ fontSize: size, fontWeight: 600, color: PC.white, letterSpacing: 0.2 }}>{value}</span>
    </div>
  )
}

function DividerBar() {
  return (
    <div style={{ display: 'flex', height: 40, borderRadius: 6, overflow: 'hidden', margin: '4px 0' }}>
      <div style={{ width: '31%', background: PC.teal }} />
      <div style={{ flex: 1, background: PC.gold }} />
    </div>
  )
}

function RoleColumn({ heading, items }: { heading: string; items: { role: string; name: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
      <div style={{ fontSize: 25, fontWeight: 800, color: PC.cream, letterSpacing: 1, marginBottom: 2 }}>{heading}</div>
      {items.filter(it => it.role || it.name).map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 20, fontWeight: 700, color: PC.white, lineHeight: 1.25, letterSpacing: 0.2 }}>
          <span style={{ color: PC.textGold }}>•</span>
          <span><span style={{ textTransform: 'uppercase' }}>{it.role}</span>{it.role && it.name ? ': ' : ''}{it.name}</span>
        </div>
      ))}
    </div>
  )
}

function NameColumn({ heading, names }: { heading: string; names: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center', flexShrink: 0 }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: PC.cream, letterSpacing: 1.5, marginBottom: 2 }}>{heading}</div>
      {names.filter(Boolean).map((n, i) => (
        <div key={i} style={{ fontSize: 25, fontWeight: 700, color: PC.white, letterSpacing: 0.3, lineHeight: 1.25 }}>{n}</div>
      ))}
    </div>
  )
}

function capitalizeName(name: string): string {
  return name.replace(/\b\w/g, c => c.toUpperCase())
}

function displayName(slot: RoleSlot | undefined): string {
  if (!slot?.name) return ''
  return `${slot.rolePrefix ?? 'TM'} ${capitalizeName(slot.name)}`
}

const POSTER_ROLE_ABBR: Record<string, string> = {
  SAA: 'SAA',
  PO: 'PO',
  TMOD: 'TMOD',
  TTM: 'TTM',
  GE: 'GE',
  TIMER: 'Timer',
  AHC: 'AHC',
  GRAM: 'Grammarian',
  LISTEN: 'Listening Post',
  SPKR: 'Speaker',
  EVAL: 'Evaluator',
}

function buildFixedRows(group: 'roleTakers' | 'tagl', slots: RoleSlot[]) {
  return ROLE_CATALOGUE
    .filter(e => e.group === group)
    .map(e => {
      const slot = slots.find(s => matchesEntry(s.role, e))
      const label = POSTER_ROLE_ABBR[e.code] ?? e.name
      return { role: label, name: displayName(slot) }
    })
}

export function PosterInner({ meeting, slots }: PosterCanvasProps) {
  const roleTakers = buildFixedRows('roleTakers', slots)
  const tagl = buildFixedRows('tagl', slots)
  const speakers = slots.filter(s => s.group === 'speakers')
  const evaluators = slots.filter(s => s.group === 'evaluators')
  const clubLen = meeting.club.length
  const clubFontSize = clubLen > 26 ? 46 : clubLen > 21 ? 54 : clubLen > 15 ? 62 : 72

  return (
    <div style={{
      position: 'relative', width: POSTER_SIZE, height: POSTER_SIZE,
      background: `radial-gradient(120% 120% at 50% 0%, ${PC.maroon} 0%, ${PC.maroonDeep} 100%)`,
      overflow: 'hidden',
      fontFamily: '"Poppins", "Montserrat", system-ui, sans-serif',
      color: PC.white,
    }}>
      {/* Embed font so html2canvas captures it */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap');`}</style>

      <PosterRibbons />

      <div style={{ position: 'absolute', inset: 0, padding: '48px 58px 64px', display: 'flex', flexDirection: 'column', zIndex: 2, boxSizing: 'border-box' }}>
        {/* Header row: logo left, title centre-right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexShrink: 0 }}>
          {/* Logo */}
          <div style={{
            width: 160, height: 160, flexShrink: 0,
            borderRadius: 24, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: meeting.logoURL ? 'transparent' : 'rgba(255,255,255,0.12)',
            border: meeting.logoURL ? 'none' : '2px dashed rgba(255,255,255,0.4)',
          }}>
            {meeting.logoURL ? (
              <img src={meeting.logoURL} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontWeight: 800, lineHeight: 1.2 }}>
                <div style={{ fontSize: 26 }}>★</div>
                <div style={{ fontSize: 15, letterSpacing: 1 }}>LOGO</div>
              </div>
            )}
          </div>
          {/* Club name + sub — centred in remaining space */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: clubFontSize, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.04, textTransform: 'uppercase' }}>{meeting.club}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: PC.white, letterSpacing: 1.5, marginTop: 10, textTransform: 'uppercase' }}>{meeting.sub}</div>
          </div>
          {/* Spacer to balance logo width so title stays visually centred */}
          <div style={{ width: 160, flexShrink: 0 }} />
        </div>

        <div style={{ fontSize: 28, fontWeight: 800, color: PC.textGold, letterSpacing: 1, marginTop: 14, flexShrink: 0, textTransform: 'uppercase' }}>
          MEETING NO: <span style={{ color: PC.white }}>{meeting.meetingNo}</span>
        </div>

        <div style={{ marginTop: 18, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LabelVal label="THEME:" value={meeting.theme.toUpperCase()} size={31} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <LabelVal label="WOD:" value={(meeting.wod.split('\n')[0] ?? '').toUpperCase()} size={29} />
            <LabelVal label="POD:" value={(meeting.pod.split('\n')[0] ?? '').toUpperCase()} size={29} align="right" />
          </div>
        </div>

        <div style={{ marginTop: 18, flexShrink: 0 }}><DividerBar /></div>

        <div style={{ marginTop: 20, flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30 }}>
          <RoleColumn heading="ROLE TAKERS" items={roleTakers} />
          <RoleColumn heading="TAGL" items={tagl} />
        </div>

        <div style={{ marginTop: 24, flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30 }}>
          <NameColumn heading="SPEAKERS" names={speakers.map(s => s.pathwaysLevel ? `${s.pathwaysLevel} · ${displayName(s)}` : displayName(s))} />
          <NameColumn heading="EVALUATORS" names={evaluators.map(s => displayName(s))} />
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 26, flexShrink: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>DATE : <span style={{ color: PC.textGold }}>{meeting.date}</span></div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>TIMING: <span style={{ color: PC.textGold }}>{meeting.timing}</span></div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>LOCATION - <span style={{ color: PC.textGold }}>{meeting.location}</span></div>
          <div style={{ fontSize: 6, fontWeight: 200, color: 'rgba(200,200,200,0.35)', letterSpacing: 0.5, marginTop: 4 }}>Developed by Neurasphere</div>
        </div>
      </div>
    </div>
  )
}

export function PosterCanvas({ meeting, slots }: PosterCanvasProps) {
  return <PosterInner meeting={meeting} slots={slots} />
}

interface LightboxActionsProps {
  onDownload?: () => void
  downloading?: boolean
  onShare?: () => void
  shareState?: 'idle' | 'sharing' | 'done'
  width: number
}

function LightboxActions({ onDownload, downloading, onShare, shareState = 'idle', width }: LightboxActionsProps) {
  if (!onDownload && !onShare) return null
  return (
    <div
      style={{ width, display: 'flex', gap: 10, marginTop: 14 }}
      onClick={(e) => e.stopPropagation()}
    >
      {onShare && (
        <button
          onClick={onShare}
          disabled={shareState === 'sharing'}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '11px 0', borderRadius: 12,
            background: shareState === 'done' ? '#DCFCE7' : '#fff',
            color: shareState === 'done' ? '#166534' : '#111827',
            border: 'none', fontSize: 13, fontWeight: 700,
            cursor: shareState === 'sharing' ? 'not-allowed' : 'pointer',
            opacity: shareState === 'sharing' ? 0.65 : 1,
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Share2 size={15} />
          {shareState === 'sharing' ? 'Sharing…' : shareState === 'done' ? 'Shared!' : 'Share'}
        </button>
      )}
      {onDownload && (
        <button
          onClick={onDownload}
          disabled={downloading}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '11px 0', borderRadius: 12,
            background: '#fff', color: '#111827',
            border: 'none', fontSize: 13, fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.65 : 1,
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Download size={15} />
          {downloading ? 'Downloading…' : 'Download'}
        </button>
      )}
    </div>
  )
}

export function PosterLightbox({ meeting, slots, onClose, onDownload, downloading, onShare, shareState }: PosterCanvasProps & {
  onClose: () => void
  onDownload?: () => void
  downloading?: boolean
  onShare?: () => void
  shareState?: 'idle' | 'sharing' | 'done'
}) {
  const maxSize = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.82)
  const scale = maxSize / POSTER_SIZE

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Close button — outside the poster, above it */}
      <div
        style={{
          width: maxSize,
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 18, fontWeight: 700, color: '#111827',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Poster — scaled to fit viewport, no clipping */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: maxSize,
          height: maxSize,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: POSTER_SIZE,
          height: POSTER_SIZE,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <PosterInner meeting={meeting} slots={slots} />
        </div>
      </div>

      <LightboxActions onDownload={onDownload} downloading={downloading} onShare={onShare} shareState={shareState} width={maxSize} />
    </div>
  )
}

// ─── Photo Poster ────────────────────────────────────────────────────────────

export interface PhotoProfile {
  uid: string
  displayName: string
  photoURL?: string
}

interface PhotoPosterProps {
  meeting: MeetingDetails
  slots: RoleSlot[]
  profiles: PhotoProfile[]
}

function avatarInitials(name: string) {
  return name.split(/[\s@._-]+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function avatarHue(seed: string) {
  return (seed.charCodeAt(0) * 47 + seed.charCodeAt(1) * 13) % 360
}

function PhotoAvatar({ name, photoURL, size = 72 }: { name: string; photoURL?: string; size?: number }) {
  const hue = avatarHue(name || '?')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      overflow: 'hidden', border: '3px solid rgba(255,255,255,0.35)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
      background: `hsl(${hue},55%,42%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            const img = e.currentTarget
            img.style.display = 'none'
            img.parentElement!.textContent = avatarInitials(name)
            Object.assign(img.parentElement!.style, {
              fontSize: `${size * 0.35}px`, fontWeight: '800', color: '#fff', letterSpacing: '0.5px',
            })
          }}
        />
      ) : (
        <span style={{ fontSize: size * 0.35, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
          {avatarInitials(name)}
        </span>
      )}
    </div>
  )
}

function PhotoRoleRow({ roleName, slotName, rolePrefix, photoURL }: {
  roleName: string; slotName: string; rolePrefix?: string; photoURL?: string
}) {
  const displayedName = slotName ? `${rolePrefix ?? 'TM'} ${capitalizeName(slotName)}` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <PhotoAvatar name={slotName || '?'} photoURL={slotName ? photoURL : undefined} size={56} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: PC.textGold, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {roleName}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: PC.white, letterSpacing: 0.2, lineHeight: 1.2 }}>
          {displayedName || <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: 16 }}>Open</span>}
        </div>
      </div>
    </div>
  )
}

function PhotoSpeakerRow({ slotName, rolePrefix, photoURL, pathwaysLevel, speechTopic, size = 58 }: {
  slotName: string; rolePrefix?: string; photoURL?: string; pathwaysLevel?: string; speechTopic?: string; size?: number
}) {
  const displayedName = slotName ? `${rolePrefix ?? 'TM'} ${capitalizeName(slotName)}` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <PhotoAvatar name={slotName || '?'} photoURL={slotName ? photoURL : undefined} size={size} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: PC.white, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayedName || <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, fontSize: 14 }}>Open</span>}
          </span>
          {pathwaysLevel && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: PC.maroonDeep, background: PC.textGold,
              borderRadius: 5, padding: '1px 6px', flexShrink: 0,
            }}>
              {pathwaysLevel}
            </span>
          )}
        </div>
        {speechTopic && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{speechTopic}"
          </div>
        )}
      </div>
    </div>
  )
}

/** One speech's Speaker and Evaluator shown side by side in the same row. */
function PhotoPairRow({ speaker, evaluator, getPhoto, index }: {
  speaker: RoleSlot | null; evaluator: RoleSlot | null; getPhoto: (slot: RoleSlot) => string | undefined; index: number
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 14, alignItems: 'center',
      padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: PC.textGold, gridColumn: '1 / -1', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>
        Speech {index + 1}
      </div>
      <PhotoSpeakerRow
        slotName={speaker?.name ?? ''}
        rolePrefix={speaker?.rolePrefix}
        photoURL={speaker ? getPhoto(speaker) : undefined}
        pathwaysLevel={speaker?.pathwaysLevel}
        speechTopic={speaker?.speechTopic}
        size={44}
      />
      <PhotoSpeakerRow
        slotName={evaluator?.name ?? ''}
        rolePrefix={evaluator?.rolePrefix}
        photoURL={evaluator ? getPhoto(evaluator) : undefined}
        size={44}
      />
    </div>
  )
}

function PosterInnerWithPhotos({ meeting, slots, profiles }: PhotoPosterProps) {
  const profileMap = new Map(profiles.map(p => [p.uid, p]))

  const getPhoto = (slot: RoleSlot) => {
    if (slot.uid) return profileMap.get(slot.uid)?.photoURL
    return undefined
  }

  const roleTakerEntries = ROLE_CATALOGUE.filter(e => e.group === 'roleTakers')
  const taglEntries = ROLE_CATALOGUE.filter(e => e.group === 'tagl')
  const speakers = slots.filter(s => s.group === 'speakers').sort((a, b) => a.order - b.order)
  const evaluators = slots.filter(s => s.group === 'evaluators').sort((a, b) => a.order - b.order)
  const pairCount = Math.max(speakers.length, evaluators.length)
  const pairs = Array.from({ length: pairCount }, (_, i) => ({
    speaker: speakers.find(s => s.pairIndex === i) ?? speakers[i] ?? null,
    evaluator: evaluators.find(s => s.pairIndex === i) ?? evaluators[i] ?? null,
    index: i,
  }))

  const clubLen = meeting.club.length
  const clubFontSize = clubLen > 26 ? 38 : clubLen > 21 ? 44 : clubLen > 15 ? 52 : 60

  return (
    <div style={{
      position: 'relative', width: POSTER_SIZE, height: POSTER_SIZE,
      background: `radial-gradient(120% 120% at 50% 0%, ${PC.maroon} 0%, ${PC.maroonDeep} 100%)`,
      overflow: 'hidden',
      fontFamily: '"Poppins", "Montserrat", system-ui, sans-serif',
      color: PC.white,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap');`}</style>
      <PosterRibbons />

      <div style={{ position: 'absolute', inset: 0, padding: '28px 38px 26px', display: 'flex', flexDirection: 'column', zIndex: 2, boxSizing: 'border-box', gap: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0, marginBottom: 6 }}>
          <div style={{
            width: 100, height: 100, flexShrink: 0, borderRadius: 16, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: meeting.logoURL ? 'transparent' : 'rgba(255,255,255,0.12)',
            border: meeting.logoURL ? 'none' : '2px dashed rgba(255,255,255,0.4)',
          }}>
            {meeting.logoURL
              ? <img src={meeting.logoURL} alt="logo" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}><div style={{ fontSize: 20 }}>★</div><div style={{ fontSize: 11 }}>LOGO</div></div>
            }
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: clubFontSize, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.05, textTransform: 'uppercase' }}>{meeting.club}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: PC.white, letterSpacing: 1.5, marginTop: 4, textTransform: 'uppercase' }}>{meeting.sub}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: PC.textGold, letterSpacing: 1, marginTop: 3, textTransform: 'uppercase' }}>
              Meeting No: <span style={{ color: PC.white }}>{meeting.meetingNo}</span>
            </div>
          </div>
          <div style={{ width: 100, flexShrink: 0 }} />
        </div>

        {/* Theme / WOD / POD */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
          {meeting.theme && <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: PC.textGold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Theme: <span style={{ color: PC.white }}>{meeting.theme}</span>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            {meeting.wod && <div style={{ fontSize: 18, fontWeight: 700, color: PC.textGold }}>WOD: <span style={{ color: PC.white }}>{meeting.wod.split('\n')[0]}</span></div>}
            {meeting.pod && <div style={{ fontSize: 18, fontWeight: 700, color: PC.textGold }}>POD: <span style={{ color: PC.white }}>{meeting.pod.split('\n')[0]}</span></div>}
          </div>
        </div>

        <div style={{ flexShrink: 0, marginBottom: 8 }}><DividerBar /></div>

        {/* Role Takers + TAGL — balanced two columns */}
        <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20, rowGap: 8 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: PC.cream, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1 }}>Role Takers</div>
            {roleTakerEntries.map(e => {
              const slot = slots.find(s => matchesEntry(s.role, e))
              return (
                <PhotoRoleRow
                  key={e.code}
                  roleName={POSTER_ROLE_ABBR[e.code] ?? e.name}
                  slotName={slot?.name ?? ''}
                  rolePrefix={slot?.rolePrefix}
                  photoURL={slot ? getPhoto(slot) : undefined}
                />
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: PC.cream, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1 }}>TAGL</div>
            {taglEntries.map(e => {
              const slot = slots.find(s => matchesEntry(s.role, e))
              return (
                <PhotoRoleRow
                  key={e.code}
                  roleName={POSTER_ROLE_ABBR[e.code] ?? e.name}
                  slotName={slot?.name ?? ''}
                  rolePrefix={slot?.rolePrefix}
                  photoURL={slot ? getPhoto(slot) : undefined}
                />
              )
            })}
          </div>
        </div>

        {/* Speakers & Evaluators — paired, side by side in the same row */}
        {pairs.length > 0 && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: PC.cream, letterSpacing: 1, textTransform: 'uppercase' }}>Speakers &amp; Evaluators</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pairs.map(({ speaker, evaluator, index }) => (
                <PhotoPairRow key={index} speaker={speaker} evaluator={evaluator} getPhoto={getPhoto} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ flexShrink: 0, borderTop: `2px solid ${PC.gold}`, paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {meeting.date && <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>📅 <span style={{ color: PC.textGold }}>{meeting.date}</span></div>}
            {meeting.timing && <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>⏰ <span style={{ color: PC.textGold }}>{meeting.timing}</span></div>}
          </div>
          {meeting.location && (
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' }}>
              📍 <span style={{ color: PC.textGold }}>{meeting.location}</span>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 6, fontWeight: 200, color: 'rgba(200,200,200,0.35)', letterSpacing: 0.5 }}>Developed by Neurasphere</span>
        </div>
      </div>
    </div>
  )
}

export function PosterCanvasWithPhotos({ meeting, slots, profiles }: PhotoPosterProps) {
  return <PosterInnerWithPhotos meeting={meeting} slots={slots} profiles={profiles} />
}

export function PosterLightboxWithPhotos({ meeting, slots, profiles, onClose, onDownload, downloading, onShare, shareState }: PhotoPosterProps & {
  onClose: () => void
  onDownload?: () => void
  downloading?: boolean
  onShare?: () => void
  shareState?: 'idle' | 'sharing' | 'done'
}) {
  const maxSize = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.82)
  const scale = maxSize / POSTER_SIZE
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ width: maxSize, display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%', background: '#fff', border: 'none',
          cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#111827',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)', flexShrink: 0,
        }}>✕</button>
      </div>
      <div onClick={e => e.stopPropagation()} style={{
        width: maxSize, height: maxSize, borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)', flexShrink: 0,
      }}>
        <div style={{ width: POSTER_SIZE, height: POSTER_SIZE, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <PosterInnerWithPhotos meeting={meeting} slots={slots} profiles={profiles} />
        </div>
      </div>

      <LightboxActions onDownload={onDownload} downloading={downloading} onShare={onShare} shareState={shareState} width={maxSize} />
    </div>
  )
}
