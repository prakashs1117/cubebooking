import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({
  onClose,
  scrollKey,
  children,
}: {
  onClose: () => void
  scrollKey: number
  children: React.ReactNode
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panel.current?.scrollTo({ top: 0 })
  }, [scrollKey])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#1A1519]/45 backdrop-blur-[2px]"
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        initial={{ y: 16, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 8, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.3, 1] }}
        className="relative w-full sm:max-w-[560px] max-h-[calc(100dvh-32px)] overflow-y-auto bg-[#F4F3F1] text-[#1A1519] rounded-3xl shadow-[0_24px_60px_-20px_rgba(26,21,25,.5)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full bg-white border border-[#E6E2DE] flex items-center justify-center text-[#1A1519] transition-colors hover:bg-[#772432] hover:border-[#772432] hover:text-white"
        >
          <X className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        {children}
      </motion.div>
    </div>
  )
}
