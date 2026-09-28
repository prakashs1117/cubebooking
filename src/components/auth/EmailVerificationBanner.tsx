import { useState } from 'react'
import { MailWarning } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

const RESEND_COOLDOWN_MS = 60_000

export default function EmailVerificationBanner() {
  const { user, isVerified, resendVerification } = useAuthContext()
  const [dismissed, setDismissed] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [lastSent, setLastSent] = useState(0)
  const [sending, setSending] = useState(false)

  if (!user || isVerified || dismissed) return null

  const cooling = Date.now() - lastSent < RESEND_COOLDOWN_MS

  const handleResend = async () => {
    if (cooling) return
    setSending(true)
    setStatus(null)
    try {
      await resendVerification()
      setLastSent(Date.now())
      setStatus('Verification email sent. Check your inbox.')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not send the email.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mb-5 px-4 py-3.5 rounded-xl border border-[#EFE0B0] bg-[#FBF6E7] flex items-start gap-3">
      <MailWarning className="w-[18px] h-[18px] text-[#8A6D1B] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#6B5314]">Verify your email address</p>
        <p className="text-[12.5px] text-[#6B5314]/85 mt-0.5">
          We sent a link to {user.email}. Verifying keeps your account secure.
        </p>
        {status ? <p className="text-[12.5px] font-semibold text-[#6B5314] mt-1.5">{status}</p> : null}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={sending || cooling}
            className="text-[12.5px] font-bold text-[#772432] hover:underline disabled:text-[#A29BA6] disabled:no-underline disabled:cursor-not-allowed"
          >
            {sending ? 'Sending…' : cooling ? 'Sent — try again in a minute' : 'Resend email'}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-[12.5px] font-bold text-[#6B6470] hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
