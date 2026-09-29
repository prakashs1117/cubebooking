import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface BookingQRCodeProps {
  bookingId: string
  size?: number
}

export function BookingQRCode({ bookingId, size = 180 }: BookingQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  const url = `${window.location.origin}/admin/verify/${bookingId}`

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then((du) => {
      if (!cancelled) setDataUrl(du)
    })
    return () => { cancelled = true }
  }, [url, size])

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size, borderRadius: 12 }}
        className="animate-pulse"
        aria-label="Loading QR code"
        role="img"
      />
    )
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code for booking ${bookingId}`}
      width={size}
      height={size}
      style={{ borderRadius: 12, display: 'block' }}
    />
  )
}
