import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, QrCode } from 'lucide-react'
import { useIntl } from 'react-intl'

export default function QRScanPage() {
  const navigate = useNavigate()
  const intl = useIntl()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const [manualId, setManualId] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const handleDetected = useCallback((url: string) => {
    stopCamera()
    // Accept both /admin/verify/:id and raw booking IDs
    const match = url.match(/\/admin\/verify\/([^/?#]+)/)
    const bookingId = match ? match[1] : url.trim()
    if (bookingId) navigate(`/admin/verify/${bookingId}`)
  }, [stopCamera, navigate])

  useEffect(() => {
    if (!hasBarcodeDetector) return

    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }

        // @ts-expect-error BarcodeDetector not yet in TS lib
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })

        const tick = async () => {
          if (cancelled || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              handleDetected(codes[0].rawValue)
              return
            }
          } catch {
            // frame not ready — continue
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      })
      .catch(() => {
        if (!cancelled) setCameraError('camera')
      })

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [hasBarcodeDetector, handleDetected, stopCamera])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = manualId.trim()
    if (id) navigate(`/admin/verify/${id}`)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0a', color: '#ffffff', fontFamily: 'var(--font-sans)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="tap iconbtn"
          aria-label="Back"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <ChevronLeft className="i" style={{ color: '#ffffff' }} />
        </button>
        <h1 className="m-0 text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {intl.formatMessage({ id: 'adminScan.title' }, { defaultMessage: 'Scan Booking QR' })}
        </h1>
      </div>

      {/* Camera view or unavailable state */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        {hasBarcodeDetector && !cameraError ? (
          <>
            {/* Video frame with corner brackets */}
            <div className="relative" style={{ width: 260, height: 260 }}>
              <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                style={{
                  width: 260,
                  height: 260,
                  objectFit: 'cover',
                  borderRadius: 16,
                  display: 'block',
                  background: '#1a1a1a',
                }}
              />
              {/* Corner brackets */}
              {['tl', 'tr', 'bl', 'br'].map((pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    width: 28,
                    height: 28,
                    borderColor: 'var(--brand-mint)',
                    borderStyle: 'solid',
                    borderWidth: 0,
                    ...(pos === 'tl' && { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 }),
                    ...(pos === 'tr' && { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 }),
                    ...(pos === 'bl' && { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 }),
                    ...(pos === 'br' && { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 }),
                  }}
                />
              ))}
            </div>
            <p className="m-0 text-sm text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {intl.formatMessage({ id: 'adminScan.instruction' }, { defaultMessage: "Point camera at the teacher's QR code" })}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="grid place-items-center w-20 h-20 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <QrCode className="w-9 h-9" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </div>
            <p className="m-0 text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {cameraError
                ? intl.formatMessage({ id: 'adminScan.cameraError' }, { defaultMessage: 'Camera unavailable. Enter booking ID below.' })
                : intl.formatMessage({ id: 'adminScan.noScanner' }, { defaultMessage: 'QR scanning not supported on this device. Enter booking ID below.' })}
            </p>
          </div>
        )}

        {/* Manual entry */}
        <form
          onSubmit={handleManualSubmit}
          className="w-full max-w-xs flex flex-col gap-3"
        >
          <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
            {intl.formatMessage({ id: 'adminScan.or' }, { defaultMessage: "or enter manually" })}
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder={intl.formatMessage({ id: 'adminScan.inputPlaceholder' }, { defaultMessage: 'Booking ID' })}
            className="w-full h-11 px-4 rounded-xl text-sm"
            style={{
              background: 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              outline: 'none',
            }}
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
