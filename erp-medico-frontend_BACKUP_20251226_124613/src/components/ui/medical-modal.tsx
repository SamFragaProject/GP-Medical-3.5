// Modal especializado para contenido médico con mejoras de visualización
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Stethoscope, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface MedicalModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  type?: 'default' | 'critical' | 'success' | 'info' | 'warning'
  showCloseButton?: boolean
  actions?: React.ReactNode
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
  xl: 'max-w-5xl',
  full: 'max-w-full mx-4'
}

const typeStyles = {
  default: {
    header: 'bg-white',
    icon: Stethoscope,
    iconColor: 'text-primary',
    borderColor: 'border-primary/20'
  },
  critical: {
    header: 'bg-red-50',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    borderColor: 'border-red-200'
  },
  success: {
    header: 'bg-green-50',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  info: {
    header: 'bg-blue-50',
    icon: Info,
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  warning: {
    header: 'bg-yellow-50',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200'
  }
}

export function MedicalModal({ 
  open, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  type = 'default',
  showCloseButton = true,
  actions
}: MedicalModalProps) {
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

  const typeConfig = typeStyles[type]
  const Icon = typeConfig.icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] overflow-y-auto">
        {/* Backdrop con mejor visibilidad */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border-2 ${typeConfig.borderColor} relative`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header médico */}
            <div className={`${typeConfig.header} flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 rounded-t-xl`}>
              <div className="flex items-center space-x-3 pr-4">
                <div className={`p-2.5 rounded-lg ${typeConfig.header.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                  <Icon className={`h-5 w-5 ${typeConfig.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h2>
                  {type !== 'default' && (
                    <p className="text-xs text-gray-600 mt-1 capitalize">
                      {type === 'critical' && 'Requiere atención médica inmediata'}
                      {type === 'success' && 'Operación completada exitosamente'}
                      {type === 'info' && 'Información médica relevante'}
                      {type === 'warning' && 'Requiere verificación médica'}
                    </p>
                  )}
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0 ${typeConfig.header.replace('bg-', 'hover:bg-').replace('-50', '-100')}`}
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Contenido con scroll optimizado */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-4">
                {children}
              </div>
            </div>

            {/* Acciones en el footer */}
            {actions && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6 rounded-b-xl">
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  {actions}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}