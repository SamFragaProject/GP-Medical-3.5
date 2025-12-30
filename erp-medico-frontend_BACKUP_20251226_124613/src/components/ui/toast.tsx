import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string, action?: { label: string; onClick: () => void }) => void
  showInfo: (title: string, message?: string) => void
  dismissToast: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      const timeout = setTimeout(() => {
        dismissToast(id)
      }, newToast.duration)
      timeoutsRef.current[id] = timeout
    }
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 7000 })
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    showToast({ type: 'warning', title, message, action })
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  const dismissToast = useCallback((id: string) => {
    // Clear timeout if exists
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }

    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = {}
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      dismissToast,
      dismissAll
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'info':
        return {
          icon: <Info className="h-5 w-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      default:
        return {
          icon: <Info className="h-5 w-5 text-gray-600" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const styles = getToastStyles(toast.type)

  return (
    <Card className={`${styles.bgColor} ${styles.borderColor} border-l-4 animate-in slide-in-from-right-full duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-sm text-gray-600 mt-1">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toast.action.onClick}
                  className="text-xs h-6 px-2"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(toast.id)}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook para facilitar el uso en componentes
export function useSuccessToast() {
  const { showSuccess } = useToast()
  return showSuccess
}

export function useErrorToast() {
  const { showError } = useToast()
  return showError
}

export function useWarningToast() {
  const { showWarning } = useToast()
  return showWarning
}

export function useInfoToast() {
  const { showInfo } = useToast()
  return showInfo
}