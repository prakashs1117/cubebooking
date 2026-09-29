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
      <div className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-end sm:pb-0">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(15,12,15,0.52)', backdropFilter: 'blur(3px)' }}
        />

        {/* Sheet */}
        <motion.div
          key="sheet"
          ref={panel}
          role="dialog"
          aria-modal="true"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 340, damping: 38, mass: 0.9 }}
          className="relative w-full sm:max-w-lg overflow-y-auto"
          style={{
            maxHeight: '80dvh',
            background: 'var(--app-ground)',
            borderRadius: '1.5rem 1.5rem 0 0',
            boxShadow: '0 -8px 40px -4px rgba(0,0,0,0.22)',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Drag handle */}
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 pointer-events-none" style={{ background: 'var(--app-ground)' }}>
            <span
              className="w-10 h-1 rounded-full"
              style={{ background: 'var(--border)' }}
            />
          </div>

          {/* Close button — always visible top-right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--destructive)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--muted)'
              e.currentTarget.style.color = 'var(--muted-foreground)'
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
