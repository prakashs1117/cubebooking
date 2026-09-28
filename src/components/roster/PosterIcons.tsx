// Poster icon glyphs — extracted from the Meeting Poster Studio original source
// Minimal set trimmed to the icons actually used in the UI

interface TMGlyphProps {
  name: string
  size?: number
  color?: string
  sw?: number
}

export function TMGlyph({ name, size = 22, color = '#fff', sw = 1.9 }: TMGlyphProps) {
  const s = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }


  let g: React.ReactNode = null

  switch (name) {
    case 'check':
      g = <path {...s} strokeWidth="2.6" d="M4.8 12.6l4.6 4.6L19.2 7" />
      break
    case 'x':
      g = (
        <g {...s} strokeWidth="2.2">
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </g>
      )
      break
    case 'plus':
      g = (
        <g {...s} strokeWidth="2.4">
          <path d="M12 5.2v13.6" />
          <path d="M5.2 12h13.6" />
        </g>
      )
      break
    case 'arrowR':
      g = (
        <g {...s} strokeWidth="2.2">
          <path d="M4.4 12h15.2" />
          <path d="M13.8 6.4 19.6 12l-5.8 5.6" />
        </g>
      )
      break
    case 'megaphone':
      g = <path {...s} d="M3.6 10.4v3.2a2 2 0 0 0 2 2h1.6l1 4.6h2.4l-1-4.6h1.6l7.6 3.8V5L11.2 8.8H5.6a2 2 0 0 0-2 1.6z" />
      break
    default:
      g = <circle cx="12" cy="12" r="8" {...s} />
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {g}
    </svg>
  )
}
