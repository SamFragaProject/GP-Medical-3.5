// Página de error personalizada para acceso denegado
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Lock, 
  AlertTriangle, 
  ArrowLeft, 
  Home, 
  RefreshCw, 
  Shield, 
  User, 
  Building, 
  MapPin,
  Clock,
  Eye,
  Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface AccessDeniedPageProps {
  resource?: string
  action?: string
  user?: any
  onBack?: () => void
  onHome?: () => void
  customMessage?: string
  showUserInfo?: boolean
  showRetryOption?: boolean
  autoRedirect?: boolean
  redirectDelay?: number
}

export function AccessDeniedPage({
  resource,
  action,
  user,
  onBack,
  onHome,
  customMessage,
  showUserInfo = true,
  showRetryOption = true,
  autoRedirect = true,
  redirectDelay = 5000
}: AccessDeniedPageProps) {
  const navigate = useNavigate()
  const { currentUser, empresaInfo, sedeInfo } = useCurrentUser()
  const [countdown, setCountdown] = React.useState(redirectDelay / 1000)

  const displayUser = user || currentUser

  // Auto-redirect countdown
  React.useEffect(() => {
    if (!autoRedirect) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onHome) {
            onHome()
          } else {
            navigate('/dashboard')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoRedirect, redirectDelay, onHome, navigate])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleGoHome = () => {
    if (onHome) {
      onHome()
    } else {
      navigate('/dashboard')
    }
  }

  const handleRetry = () => {
    window.location.reload()
  }

  const getPermissionDescription = (res: string, act: string) => {
    const permissionMap: Record<string, { description: string; icon: React.ComponentType }> = {
      'dashboard:view': { description: 'Panel principal del sistema', icon: Home },
      'patients:view': { description: 'Gestión de expedientes de pacientes', icon: User },
      'patients:manage': { description: 'Administración completa de pacientes', icon: User },
      'exams:view': { description: 'Visualización de exámenes ocupacionales', icon: Shield },
      'exams:manage': { description: 'Gestión de exámenes y resultados', icon: Shield },
      'billing:view': { description: 'Visualización de facturas y cobros', icon: Building },
      'billing:manage': { description: 'Administración de facturación', icon: Building },
      'reports:view': { description: 'Visualización de reportes', icon: Eye },
      'reports:manage': { description: 'Generación y administración de reportes', icon: Key },
      'system:admin': { description: 'Administración del sistema', icon: Shield },
      'store:view': { description: 'Acceso a la tienda de productos', icon: Building },
      'agenda:view': { description: 'Visualización de agenda y citas', icon: Clock },
      'agenda:manage': { description: 'Gestión de agenda y programación', icon: Clock }
    }

    const key = `${res}:${act}`
    return permissionMap[key] || { description: `${act} en ${res}`, icon: Lock }
  }

  const permissionInfo = resource && action ? getPermissionDescription(resource, action) : null
  const PermissionIcon = permissionInfo?.icon || Lock

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Header con icono animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-xl text-gray-600">
            {customMessage || 'No tienes permisos suficientes para acceder a este recurso'}
          </p>
        </motion.div>

        {/* Alert principal */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Información del Acceso Denegado</h3>
                
                {resource && action && (
                  <div className="bg-red-100 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <PermissionIcon className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">
                          Permiso Requerido: <code className="bg-red-200 px-2 py-1 rounded text-sm">
                            {resource}:{action}
                          </code>
                        </p>
                        {permissionInfo && (
                          <p className="text-sm text-red-700 mt-1">
                            {permissionInfo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showUserInfo && displayUser && (
                  <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Tu Información Actual
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Usuario:</span>
                        <p className="text-gray-900">{displayUser.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Rol:</span>
                        <Badge variant="secondary" className="ml-2">
                          {displayUser.hierarchy?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {(empresaInfo || displayUser.enterpriseName) && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700 flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            Empresa:
                          </span>
                          <p className="text-gray-900">
                            {empresaInfo?.nombre || displayUser.enterpriseName}
                          </p>
                        </div>
                      )}
                      {(sedeInfo || displayUser.sedeNombre || displayUser.sede) && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Sede:
                          </span>
                          <p className="text-gray-900">
                            {sedeInfo?.nombre || displayUser.sedeNombre || displayUser.sede}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Sugerencias */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-800 mb-2">¿Qué puedes hacer?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verifica que tu rol tenga los permisos necesarios</li>
            <li>• Contacta al administrador del sistema</li>
            <li>• Revisa tu configuración de empresa y sede</li>
            <li>• Intenta acceder a una sección diferente</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="default"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Dashboard
          </Button>

          {showRetryOption && (
            <Button
              onClick={handleRetry}
              variant="secondary"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
        </motion.div>

        {/* Countdown para auto-redirect */}
        {autoRedirect && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-gray-600"
          >
            <p className="mb-2">
              Redirigiendo automáticamente en <span className="font-bold">{countdown}</span> segundos...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: redirectDelay / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {/* Información técnica para desarrolladores */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center text-xs text-gray-500 border-t pt-6"
        >
          <p>Código de error: ACCESS_DENIED</p>
          {resource && action && (
            <p>Permiso requerido: {resource}:{action}</p>
          )}
          <p>Timestamp: {new Date().toISOString()}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Componente de error para loading states
export function PermissionLoadingError({ 
  onRetry, 
  message = "Error verificando permisos" 
}: { 
  onRetry?: () => void
  message?: string 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Alert className="max-w-md border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Error de Verificación</h3>
              <p className="text-sm mt-1">{message}</p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Componente para errores de sesión
export function SessionExpiredPage({ 
  onLogin,
  userEmail 
}: { 
  onLogin?: () => void
  userEmail?: string 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Alert className="max-w-md border-red-200 bg-red-50">
        <Clock className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Sesión Expirada</h3>
              <p className="text-sm mt-1">
                Tu sesión ha expirado por seguridad. 
                {userEmail && (
                  <> Para continuar como <strong>{userEmail}</strong>, por favor inicia sesión nuevamente.</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onLogin || (() => window.location.href = '/login')} 
                size="sm"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}