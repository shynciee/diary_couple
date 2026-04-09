import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-[28px] border border-rose/15 bg-cream p-6 shadow-soft dark:border-white/10 dark:bg-[#140C0C]"
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
            ) : null}
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

