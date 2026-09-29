import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    panel.current?.scrollTo({ top: 0, behavior: 'smooth' })
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
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(15,12,15,0.5)', backdropFilter: 'blur(4px)' }}
        />

        {/* Dialog panel */}
        <motion.div
          key="panel"
          ref={panel}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.3, 1] }}
          className="relative w-full overflow-y-auto"
          style={{
            maxWidth: 520,
            maxHeight: '80dvh',
            background: 'var(--app-ground)',
            borderRadius: '1.5rem',
            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.3), 0 0 0 1px var(--border)',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>

          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
