// Configuración de Notificaciones
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  AlertTriangle,
  Send,
  TestTube,
  Settings,
  Save,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

function EmailConfig() {
  const { settings, updateNotificaciones } = useConfiguracion()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState(settings.notificaciones.email)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificaciones({ email: formData })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración SMTP</h3>
          <p className="text-sm text-gray-600">Configura el servidor de correo electrónico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servidor SMTP
            </label>
            <Input
              value={formData.smtpHost}
              onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
              placeholder="smtp.gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puerto
            </label>
            <Input
              type="number"
              value={formData.smtpPort}
              onChange={(e) => setFormData({ ...formData, smtpPort: Number(e.target.value) })}
              placeholder="587"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="noreply@mediflow.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email remitente
            </label>
            <Input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              placeholder="noreply@mediflow.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre remitente
            </label>
            <Input
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              placeholder="MediFlow"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="emailEnabled" className="ml-2 text-sm text-gray-700">
              Habilitar notificaciones por email
            </label>
          </div>
          <Button type="submit" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Guardar</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

function SMSConfig() {
  const { settings, updateNotificaciones } = useConfiguracion()
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState(settings.notificaciones.sms)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificaciones({ sms: formData })
  }

  const providers = [
    { value: 'twilio', label: 'Twilio' },
    { value: 'messagebird', label: 'MessageBird' },
    { value: 'nexmo', label: 'Nexmo (Vonage)' },
    { value: 'aws-sns', label: 'AWS SNS' }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-500 p-2 rounded-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración SMS</h3>
          <p className="text-sm text-gray-600">Configura el proveedor de mensajes SMS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor SMS
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {providers.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número remitente
            </label>
            <Input
              value={formData.fromNumber}
              onChange={(e) => setFormData({ ...formData, fromNumber: e.target.value })}
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="smsEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="smsEnabled" className="ml-2 text-sm text-gray-700">
              Habilitar notificaciones por SMS
            </label>
          </div>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" className="flex items-center space-x-2">
              <TestTube size={16} />
              <span>Probar</span>
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Save size={16} />
              <span>Guardar</span>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}

function PushConfig() {
  const { settings, updateNotificaciones } = useConfiguracion()
  const [showVapidKey, setShowVapidKey] = useState(false)
  const [formData, setFormData] = useState(settings.notificaciones.push)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificaciones({ push: formData })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-500 p-2 rounded-lg">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones Push</h3>
          <p className="text-sm text-gray-600">Configura las notificaciones push del navegador</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VAPID Key (Public Key)
          </label>
          <div className="relative">
            <Input
              type={showVapidKey ? 'text' : 'password'}
              value={formData.vapidKey}
              onChange={(e) => setFormData({ ...formData, vapidKey: e.target.value })}
              placeholder="••••••••••••••••••••••••••••••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowVapidKey(!showVapidKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showVapidKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Genera una clave VAPID usando un generador online o biblioteca de Web Push
          </p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pushEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="pushEnabled" className="ml-2 text-sm text-gray-700">
              Habilitar notificaciones push
            </label>
          </div>
          <Button type="submit" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Guardar</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

function AlertsConfig() {
  const { settings, updateNotificaciones } = useConfiguracion()
  const [formData, setFormData] = useState(settings.notificaciones.alerts)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificaciones({ alerts: formData })
  }

  const alertItems = [
    { key: 'newAppointment', label: 'Nueva cita', description: 'Cuando se agenda una nueva cita' },
    { key: 'appointmentReminder', label: 'Recordatorio de cita', description: '24 horas antes de la cita' },
    { key: 'testResults', label: 'Resultados de exámenes', description: 'Cuando se publican nuevos resultados' },
    { key: 'invoiceGenerated', label: 'Factura generada', description: 'Cuando se genera una nueva factura' },
    { key: 'systemUpdates', label: 'Actualizaciones del sistema', description: 'Noticias y mantenimiento programado' }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-orange-500 p-2 rounded-lg">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tipos de Alertas</h3>
          <p className="text-sm text-gray-600">Selecciona qué eventos generarán notificaciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {alertItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <input
                type="checkbox"
                checked={formData[item.key as keyof typeof formData] as boolean}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [item.key]: e.target.checked 
                })}
                className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Guardar preferencias</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function ConfiguracionNotificaciones() {
  const { settings } = useConfiguracion()
  const [vistaActiva, setVistaActiva] = useState<'email' | 'sms' | 'push' | 'alerts'>('email')

  const tabs = [
    {
      id: 'email',
      name: 'Email SMTP',
      icon: Mail,
      isEnabled: settings.notificaciones.email.isEnabled,
      description: 'Configurar servidor de correo'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageSquare,
      isEnabled: settings.notificaciones.sms.isEnabled,
      description: 'Mensajes de texto'
    },
    {
      id: 'push',
      name: 'Push',
      icon: Smartphone,
      isEnabled: settings.notificaciones.push.isEnabled,
      description: 'Notificaciones del navegador'
    },
    {
      id: 'alerts',
      name: 'Alertas',
      icon: Bell,
      isEnabled: true,
      description: 'Tipos de eventos'
    }
  ]

  const renderContent = () => {
    switch (vistaActiva) {
      case 'email':
        return <EmailConfig />
      case 'sms':
        return <SMSConfig />
      case 'push':
        return <PushConfig />
      case 'alerts':
        return <AlertsConfig />
      default:
        return <EmailConfig />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Notificaciones</h1>
        <p className="text-gray-600 mt-1">
          Configura los canales de comunicación y tipos de alertas del sistema
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Card 
              key={tab.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                vistaActiva === tab.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setVistaActiva(tab.id as any)}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  tab.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{tab.name}</h3>
                  <p className="text-xs text-gray-600">{tab.description}</p>
                </div>
                <Badge variant={tab.isEnabled ? 'default' : 'secondary'}>
                  {tab.isEnabled ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={vistaActiva}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>

      {/* Información adicional */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Información Importante</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Asegúrate de probar cada configuración antes de activarla en producción</li>
              <li>• Las notificaciones por email pueden tardar unos minutos en procesarse</li>
              <li>• Los SMS tienen un costo por mensaje según el proveedor seleccionado</li>
              <li>• Las notificaciones push requieren permisos del navegador del usuario</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}