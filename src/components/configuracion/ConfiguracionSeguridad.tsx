// Configuración de Seguridad
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Clock, 
  Key,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

export function ConfiguracionSeguridad() {
  const { settings } = useConfiguracion()
  const [formData, setFormData] = useState(settings.seguridad)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se actualizaría la configuración de seguridad
    toast.success('Configuración de seguridad actualizada')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Seguridad</h1>
        <p className="text-gray-600 mt-1">
          Políticas de contraseñas, sesiones y acceso al sistema
        </p>
      </div>

      {/* Password Policy */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-red-500 p-3 rounded-lg">
            <Key className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Política de Contraseñas</h3>
            <p className="text-sm text-gray-600">Requisitos mínimos para contraseñas de usuario</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitud mínima
              </label>
              <Input
                type="number"
                value={formData.passwordPolicy.minLength}
                onChange={(e) => setFormData({
                  ...formData,
                  passwordPolicy: {
                    ...formData.passwordPolicy,
                    minLength: Number(e.target.value)
                  }
                })}
                min="6"
                max="32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vigencia máxima (días)
              </label>
              <Input
                type="number"
                value={formData.passwordPolicy.maxAge}
                onChange={(e) => setFormData({
                  ...formData,
                  passwordPolicy: {
                    ...formData.passwordPolicy,
                    maxAge: Number(e.target.value)
                  }
                })}
                min="30"
                max="365"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireUppercase}
                onChange={(e) => setFormData({
                  ...formData,
                  passwordPolicy: {
                    ...formData.passwordPolicy,
                    requireUppercase: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary"
              />
              <label className="ml-2 text-sm text-gray-700">
                Requiere letra mayúscula
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireLowercase}
                onChange={(e) => setFormData({
                  ...formData,
                  passwordPolicy: {
                    ...formData.passwordPolicy,
                    requireLowercase: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary"
              />
              <label className="ml-2 text-sm text-gray-700">
                Requiere letra minúscula
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireNumbers}
                onChange={(e) => setFormData({
                  ...formData,
                  passwordPolicy: {
                    ...formData.passwordPolicy,
                    requireNumbers: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary"
              />
              <label className="ml-2 text-sm text-gray-700">
                Requiere números
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.passwordPolicy.requireSpecialChars}
                onChange={(e) => setFormData({
                  ...formData,
                  passwordPolicy: {
                    ...formData.passwordPolicy,
                    requireSpecialChars: e.target.checked
                  }
                })}
                className="h-4 w-4 text-primary"
              />
              <label className="ml-2 text-sm text-gray-700">
                Requiere caracteres especiales
              </label>
            </div>
          </div>

          <Button type="submit" className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Guardar Política</span>
          </Button>
        </form>
      </Card>

      {/* Session Policy */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Política de Sesiones</h3>
            <p className="text-sm text-gray-600">Configuración de tiempo de sesión y concurrencia</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo de sesión (minutos)
            </label>
            <Input
              type="number"
              value={formData.sessionPolicy.timeoutMinutes}
              onChange={(e) => setFormData({
                ...formData,
                sessionPolicy: {
                  ...formData.sessionPolicy,
                  timeoutMinutes: Number(e.target.value)
                }
              })}
              min="15"
              max="480"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sesiones concurrentes máximas
            </label>
            <Input
              type="number"
              value={formData.sessionPolicy.maxConcurrentSessions}
              onChange={(e) => setFormData({
                ...formData,
                sessionPolicy: {
                  ...formData.sessionPolicy,
                  maxConcurrentSessions: Number(e.target.value)
                }
              })}
              min="1"
              max="10"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sessionPolicy.allowRememberMe}
              onChange={(e) => setFormData({
                ...formData,
                sessionPolicy: {
                  ...formData.sessionPolicy,
                  allowRememberMe: e.target.checked
                }
              })}
              className="h-4 w-4 text-primary"
            />
            <label className="ml-2 text-sm text-gray-700">
              Permitir "Recordarme" en login
            </label>
          </div>
        </div>
      </Card>

      {/* Additional Security */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-500 p-3 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Seguridad Adicional</h3>
            <p className="text-sm text-gray-600">Opciones de seguridad avanzadas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Autenticación de dos factores</h4>
              <p className="text-sm text-gray-600">Agregar capa extra de seguridad</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={formData.twoFactorAuth ? 'default' : 'secondary'}>
                {formData.twoFactorAuth ? 'Habilitado' : 'Deshabilitado'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFormData({
                  ...formData,
                  twoFactorAuth: !formData.twoFactorAuth
                })}
              >
                {formData.twoFactorAuth ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Lista blanca de IPs</h4>
              <p className="text-sm text-gray-600">Restringir acceso por dirección IP</p>
            </div>
            <Button variant="outline" size="sm">
              Configurar IPs
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
