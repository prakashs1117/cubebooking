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
      {/* ── Mobile: bottom sheet ───────────────────────────────────────────── */}
      <div key="mobile-sheet" className="md:hidden fixed inset-0 z-[9998] flex items-end">
        <motion.div
          key="backdrop-mobile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(15,12,15,0.5)', backdropFilter: 'blur(4px)' }}
        />
        <motion.div
          key="panel-mobile"
          ref={panel}
          role="dialog"
          aria-modal="true"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.3, 1] }}
          className="relative w-full"
          style={{
            background: 'var(--app-ground)',
            borderRadius: '1.5rem 1.5rem 0 0',
            boxShadow: '0 -8px 40px -8px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
            maxHeight: '92dvh',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <span className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer' }}
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
          {children}
        </motion.div>
      </div>

      {/* ── Desktop/tablet: centred dialog ────────────────────────────────── */}
      <div key="desktop-dialog" className="hidden md:flex fixed inset-0 z-[9998] items-center justify-center p-4">
        <motion.div
          key="backdrop-desktop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(15,12,15,0.5)', backdropFilter: 'blur(4px)' }}
        />
        <motion.div
          key="panel-desktop"
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer' }}
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
