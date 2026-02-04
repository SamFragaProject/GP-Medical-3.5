// Componente Modal reutilizable con manejo mejorado de scroll
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
}

// Hook para manejar el bloqueo del scroll del body
const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight

      // Calcular y aplicar padding para compensar el scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isLocked])
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true
}: ModalProps) {
  // Manejar el bloqueo del scroll del body cuando la modal está abierta
  useScrollLock(open)

  // Manejar la tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 transition-opacity"
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className={`glass-card rounded-[2.5rem] shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-white/40 dark:border-white/10 relative`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-200/50 bg-white/40 backdrop-blur-md rounded-t-[2.5rem]">
              <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 pr-4">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2.5 bg-slate-100/50 hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 rounded-xl transition-all duration-300 flex-shrink-0 group"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/30">
              <div className="p-6 sm:p-8">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
