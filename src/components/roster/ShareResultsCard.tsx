import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { Share2, Loader } from 'lucide-react'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { AWARD_CATEGORIES } from '../../lib/awardCategories'

interface WinnersMap { [categoryId: string]: string }

interface Props {
  winners: WinnersMap
  meetingNo: string
  date: string
  clubName?: string
  voteUrl: string
}

interface ResultCardProps extends Omit<Props, 'voteUrl'> {
  winnerPhotos?: Record<string, string>
}

/** The off-screen card that gets rendered into a canvas */
function ResultCard({ winners, meetingNo, date, clubName, winnerPhotos = {} }: ResultCardProps) {
  const declared = AWARD_CATEGORIES.filter(c => winners[c.id])

  return (
    <div style={{
      width: 1000,
      background: 'linear-gradient(145deg, #1A1519 0%, #2d1f26 50%, #1A1519 100%)',
      borderRadius: 24,
      overflow: 'hidden',
      fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Decorative top glow */}
      <div style={{
        position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200,
        background: 'radial-gradient(ellipse, rgba(119,36,50,0.6) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Decorative corner circles */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(242,223,116,0.05)',
        border: '1px solid rgba(242,223,116,0.1)',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -40,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(119,36,50,0.15)',
        border: '1px solid rgba(119,36,50,0.2)',
      }} />

      <div style={{ position: 'relative', padding: '40px 40px 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(242,223,116,0.15)', border: '1px solid rgba(242,223,116,0.3)',
            borderRadius: 999, padding: '6px 14px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#F2DF74', letterSpacing: 1, textTransform: 'uppercase' }}>
              🏆 Winners
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 8 }}>
            Meeting #{meetingNo}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            {date} • {clubName || 'Dhwani Toastmasters'}
          </div>
        </div>

        {/* Winners photos grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}>
          {declared.map((cat) => {
            const winnerName = winners[cat.id]
            const photoUrl = winnerPhotos[winnerName]
            const initials = winnerName?.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?'
            const hue = winnerName?.charCodeAt(0) * 47 % 360 || 0

            return (
              <div key={cat.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                {/* Photo circle */}
                <div style={{
                  position: 'relative',
                  width: 120, height: 120, borderRadius: '50%', flexShrink: 0,
                  border: '4px solid #F59E0B',
                  background: photoUrl ? `url(${photoUrl})` : `hsl(${hue}, 65%, 52%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(119,36,50,0.4), 0 0 0 1px rgba(242,223,116,0.2)',
                  overflow: 'hidden',
                }}>
                  {!photoUrl && (
                    <span style={{
                      fontSize: 40, fontWeight: 800, color: '#fff',
                    }}>
                      {initials}
                    </span>
                  )}
                </div>

                {/* Award badge */}
                <div style={{
                  fontSize: 28,
                  textAlign: 'center',
                }}>
                  {cat.emoji}
                </div>

                {/* Name and category */}
                <div style={{ textAlign: 'center', minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 800, color: '#fff',
                    wordBreak: 'break-word', lineHeight: 1.3,
                    marginBottom: 4,
                  }}>
                    {winnerName}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {cat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(145deg, #772432, #5A1926)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14 }}>🎙</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              {clubName || 'Dhwani Toastmasters'}
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            toastmasters.dhwani.in
          </span>
        </div>
      </div>
    </div>
  )
}

export function ShareResultsButton({ winners, meetingNo, date, clubName, voteUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'generating' | 'done'>('idle')
  const [winnerPhotos, setWinnerPhotos] = useState<Record<string, string>>({})

  const declared = AWARD_CATEGORIES.filter(c => winners[c.id])

  // Fetch winner photos
  useEffect(() => {
    if (declared.length === 0) return
    const fetchPhotos = async () => {
      const photos: Record<string, string> = {}
      for (const cat of declared) {
        const winnerName = winners[cat.id]
        if (!winnerName) continue
        try {
          const q = query(collection(db, 'users'), where('displayName', '==', winnerName))
          const snap = await getDocs(q)
          if (!snap.empty && snap.docs[0].data().photoURL) {
            photos[winnerName] = snap.docs[0].data().photoURL
          }
        } catch {
          // Silently fail if photo fetch fails
        }
      }
      setWinnerPhotos(photos)
    }
    fetchPhotos()
  }, [winners, declared])

  if (declared.length === 0) return null

  const shareText = `🏆 Meeting #${meetingNo} Awards — ${date}\n\n${
    declared.map(c => `${c.emoji} ${c.label}: ${winners[c.id]}`).join('\n')
  }\n\n${clubName || 'Dhwani Toastmasters'} | Vote & results: ${voteUrl}`

  const generate = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!cardRef.current) return null
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    })
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) { resolve(null); return }
        resolve({ blob, url: canvas.toDataURL('image/png') })
      }, 'image/png', 1.0)
    })
  }

  const handleShare = async () => {
    setState('generating')
    try {
      const result = await generate()
      if (!result) { setState('idle'); return }

      const file = new File([result.blob], `dhwani-awards-meeting-${meetingNo}.png`, { type: 'image/png' })

      // Try Web Share API (works on mobile — WhatsApp, Instagram, etc.)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Meeting #${meetingNo} Awards — ${clubName || 'Dhwani Toastmasters'}`,
          text: shareText,
          files: [file],
        })
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      } else if (navigator.share) {
        // Share API without file support — share link + text
        await navigator.share({ title: `Meeting #${meetingNo} Awards`, text: shareText, url: voteUrl })
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      } else {
        // Desktop fallback — download the image
        const a = document.createElement('a')
        a.href = result.url
        a.download = `dhwani-awards-meeting-${meetingNo}.png`
        a.click()
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      }
    } catch (err: any) {
      // User cancelled share — not an error
      if (err?.name !== 'AbortError') console.error('Share failed:', err)
      setState('idle')
    }
  }

  return (
    <>
      {/* Off-screen render target — invisible but in DOM for html2canvas */}
      <div style={{
        position: 'fixed', top: '-9999px', left: '-9999px',
        pointerEvents: 'none', zIndex: -1,
      }}>
        <div ref={cardRef}>
          <ResultCard winners={winners} meetingNo={meetingNo} date={date} clubName={clubName} winnerPhotos={winnerPhotos} />
        </div>
      </div>

      <button
        onClick={handleShare}
        disabled={state === 'generating'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', borderRadius: 10,
          background: state === 'done' ? '#D1FAE5' : '#772432',
          color: state === 'done' ? '#065F46' : '#fff',
          border: 'none', fontSize: 13, fontWeight: 700,
          cursor: state === 'generating' ? 'not-allowed' : 'pointer',
          opacity: state === 'generating' ? 0.7 : 1,
          transition: 'all 0.2s', fontFamily: 'inherit',
          boxShadow: state === 'done' ? 'none' : '0 4px 14px rgba(119,36,50,0.3)',
        }}
      >
        {state === 'generating'
          ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
          : state === 'done'
          ? <>✓ Shared!</>
          : <><Share2 size={14} /> Share results</>
        }
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
