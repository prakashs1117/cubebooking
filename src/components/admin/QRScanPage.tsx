import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { ChevronLeft, QrCode } from 'lucide-react'
import { useIntl } from 'react-intl'

const READER_ID = 'qr-reader'

export default function QRScanPage() {
  const navigate    = useNavigate()
  const navigateRef = useRef(navigate)
  const intl        = useIntl()
  const scannerRef  = useRef<Html5Qrcode | null>(null)
  const [manualId, setManualId]     = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning]     = useState(false)

  // Keep navigateRef current without re-running the effect
  useEffect(() => { navigateRef.current = navigate }, [navigate])

  useEffect(() => {
    // Bail if the div isn't in the DOM yet (StrictMode double-invoke guard)
    if (!document.getElementById(READER_ID)) return

    const scanner = new Html5Qrcode(READER_ID, { verbose: false })
    scannerRef.current = scanner

    let running = false

    const safeStop = () => {
      try { scanner.stop().catch(() => {}) } catch { /* already stopped */ }
    }

    const onSuccess = (decodedText: string) => {
      running = false
      safeStop()
      const match = decodedText.match(/\/admin\/verify\/([^/?#]+)/)
      const bookingId = match ? match[1] : decodedText.trim()
      if (bookingId) navigateRef.current(`/admin/verify/${bookingId}`)
    }

    const config = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tryStart = (constraint: any): Promise<void> =>
      scanner.start(constraint, config, onSuccess, () => {}).then(() => {})

    tryStart({ facingMode: { exact: 'environment' } })
      .catch(() => tryStart({ facingMode: 'environment' }))
      .then(() => { running = true; setScanning(true) })
      .catch((err: unknown) => {
        console.error('[QRScan] camera failed:', err)
        setCameraError('camera')
      })

    return () => {
      if (running) {
        running = false
        safeStop()
      }
    }
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = manualId.trim()
    if (id) navigate(`/admin/verify/${id}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a', color: '#ffffff', fontFamily: 'var(--font-sans)' }}>

      {/* Suppress html5-qrcode default UI (buttons / file inputs it injects) */}
      <style>{`
        #${READER_ID} > img,
        #${READER_ID} button,
        #${READER_ID} input[type=file],
        #${READER_ID} select,
        #${READER_ID} #${READER_ID}__dashboard,
        #${READER_ID}__header_message { display: none !important; }
        #${READER_ID} video { border-radius: 16px !important; }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button type="button" onClick={() => navigate('/home')} className="tap iconbtn" aria-label="Back"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <ChevronLeft className="i" style={{ color: '#ffffff' }} />
        </button>
        <h1 className="m-0 text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'adminScan.title' }, { defaultMessage: 'Scan Booking QR' })}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">

        {/* Camera container */}
        <div className="relative" style={{ width: 280, height: 280 }}>
          {/* html5-qrcode renders the video feed here */}
          <div id={READER_ID} style={{ width: 280, height: 280, borderRadius: 16, overflow: 'hidden', background: '#1a1a1a' }} />

          {/* Our corner brackets — only once camera is live */}
          {scanning && !cameraError && ['tl', 'tr', 'bl', 'br'].map((pos) => (
            <span key={pos} aria-hidden="true" style={{
              position: 'absolute', width: 28, height: 28,
              borderColor: 'var(--brand-mint)', borderStyle: 'solid', borderWidth: 0, pointerEvents: 'none',
              ...(pos === 'tl' && { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 }),
              ...(pos === 'tr' && { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 }),
              ...(pos === 'bl' && { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 }),
              ...(pos === 'br' && { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 }),
            }} />
          ))}

          {/* Error fallback overlay */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <QrCode className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p className="m-0 text-xs text-center px-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {intl.formatMessage({ id: 'adminScan.cameraError' }, { defaultMessage: 'Camera unavailable. Enter booking ID below.' })}
              </p>
            </div>
          )}

          {/* Loading state before camera starts */}
          {!scanning && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ pointerEvents: 'none' }}>
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.6)' }} />
            </div>
          )}
        </div>

        {scanning && !cameraError && (
          <p className="m-0 text-sm text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {intl.formatMessage({ id: 'adminScan.instruction' }, { defaultMessage: "Point camera at the teacher's QR code" })}
          </p>
        )}

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
            {intl.formatMessage({ id: 'adminScan.or' }, { defaultMessage: 'or enter manually' })}
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <input type="text" value={manualId} onChange={(e) => setManualId(e.target.value)}
            placeholder={intl.formatMessage({ id: 'adminScan.inputPlaceholder' }, { defaultMessage: 'Booking ID' })}
            className="w-full h-11 px-4 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', outline: 'none' }} />
          <button type="submit" disabled={!manualId.trim()}
            className="tap w-full h-11 rounded-xl text-sm font-semibold"
            style={{
              background: manualId.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              color: manualId.trim() ? '#ffffff' : 'rgba(255,255,255,0.3)',
            }}>
            {intl.formatMessage({ id: 'adminScan.verify' }, { defaultMessage: 'Verify Booking' })}
          </button>
        </form>
      </div>
    </div>
  )
}
