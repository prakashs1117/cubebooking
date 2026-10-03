import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { ChevronLeft, QrCode } from 'lucide-react'
import { useIntl } from 'react-intl'

const READER_ID = 'qr-reader'

export default function QRScanPage() {
  const navigate   = useNavigate()
  const intl       = useIntl()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [manualId, setManualId] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleDetected = (decodedText: string) => {
    // Stop the scanner before navigating
    scannerRef.current?.stop().catch(() => {})
    const match = decodedText.match(/\/admin\/verify\/([^/?#]+)/)
    const bookingId = match ? match[1] : decodedText.trim()
    if (bookingId) navigate(`/admin/verify/${bookingId}`)
  }

  useEffect(() => {
    const scanner = new Html5Qrcode(READER_ID, { verbose: false })
    scannerRef.current = scanner

    scanner.start(
      { facingMode: { exact: 'environment' } },
      { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
      (decodedText) => handleDetected(decodedText),
      () => { /* scan failure — ignore, keep scanning */ },
    )
      .then(() => setScanning(true))
      .catch(() => {
        // Back camera failed — try any camera
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (decodedText) => handleDetected(decodedText),
          () => {},
        )
          .then(() => setScanning(true))
          .catch((err) => {
            console.error('[QRScanPage] camera failed:', err)
            setCameraError('camera')
          })
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = manualId.trim()
    if (id) navigate(`/admin/verify/${id}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a', color: '#ffffff', fontFamily: 'var(--font-sans)' }}>

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

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">

        {/* html5-qrcode mounts the video feed inside this div */}
        <div className="relative" style={{ width: 280, height: 280 }}>
          <div
            id={READER_ID}
            style={{
              width: 280,
              height: 280,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#1a1a1a',
            }}
          />
          {/* Corner bracket overlay */}
          {scanning && !cameraError && ['tl', 'tr', 'bl', 'br'].map((pos) => (
            <span key={pos} aria-hidden="true" style={{
              position: 'absolute', width: 28, height: 28,
              borderColor: 'var(--brand-mint)', borderStyle: 'solid', borderWidth: 0,
              ...(pos === 'tl' && { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 }),
              ...(pos === 'tr' && { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 }),
              ...(pos === 'bl' && { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 }),
              ...(pos === 'br' && { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 }),
            }} />
          ))}

          {/* Fallback if camera failed */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <QrCode className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p className="m-0 text-xs text-center px-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {intl.formatMessage({ id: 'adminScan.cameraError' }, { defaultMessage: 'Camera unavailable. Enter booking ID below.' })}
              </p>
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
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder={intl.formatMessage({ id: 'adminScan.inputPlaceholder' }, { defaultMessage: 'Booking ID' })}
            className="w-full h-11 px-4 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={!manualId.trim()}
            className="tap w-full h-11 rounded-xl text-sm font-semibold"
            style={{
              background: manualId.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              color: manualId.trim() ? '#ffffff' : 'rgba(255,255,255,0.3)',
            }}
          >
            {intl.formatMessage({ id: 'adminScan.verify' }, { defaultMessage: 'Verify Booking' })}
          </button>
        </form>
      </div>
    </div>
  )
}
