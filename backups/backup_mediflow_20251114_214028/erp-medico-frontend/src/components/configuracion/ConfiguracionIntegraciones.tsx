// Configuración de Integraciones
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Network, 
  Globe, 
  Server, 
  Key,
  Settings,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

function IntegrationCard({ 
  title, 
  description, 
  isEnabled, 
  onToggle, 
  onConfigure,
  icon: Icon 
}: {
  title: string
  description: string
  isEnabled: boolean
  onToggle: () => void
  onConfigure: () => void
  icon: React.ElementType
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Icon className={`h-6 w-6 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <Badge variant={isEnabled ? 'default' : 'secondary'}>
          {isEnabled ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">
            {isEnabled ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigure}
          >
            <Settings size={14} className="mr-1" />
            Configurar
          </Button>
          <Button
            variant={isEnabled ? 'outline' : 'default'}
            size="sm"
            onClick={onToggle}
          >
            {isEnabled ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function ConfiguracionIntegraciones() {
  const { settings } = useConfiguracion()
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)

  const integrations = [
    {
      id: 'imss',
      title: 'IMSS',
      description: 'Instituto Mexicano del Seguro Social',
      isEnabled: settings.integraciones.imss.isEnabled,
      icon: Server
    },
    {
      id: 'issste',
      title: 'ISSSTE',
      description: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
      isEnabled: settings.integraciones.issste.isEnabled,
      icon: Globe
    },
    {
      id: 'laboratorios',
      title: 'Laboratorios',
      description: 'Conexión con laboratorios externos',
      isEnabled: settings.integraciones.laboratorios.length > 0,
      icon: Key
    }
  ]

  const handleToggleIntegration = (id: string) => {
    console.log('Toggle integration:', id)
    toast.success(`Integración ${id} ${settings.integraciones[id as keyof typeof settings.integraciones] ? 'desactivada' : 'activada'}`)
  }

  const handleConfigureIntegration = (id: string) => {
    setSelectedIntegration(id)
    // Aquí se abriría un modal de configuración específico
    toast.success(`Configurando ${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Integraciones</h1>
        <p className="text-gray-600 mt-1">
          Conecta MediFlow con sistemas externos y APIs
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">3</div>
          <div className="text-sm text-gray-600">Integraciones activas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
          <div className="text-sm text-gray-600">Uptime promedio</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">1.2s</div>
          <div className="text-sm text-gray-600">Latencia promedio</div>
        </Card>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            title={integration.title}
            description={integration.description}
            isEnabled={integration.isEnabled}
            onToggle={() => handleToggleIntegration(integration.id)}
            onConfigure={() => handleConfigureIntegration(integration.id)}
            icon={integration.icon}
          />
        ))}
      </div>

      {/* Configuration Panel */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración Global</h3>
            <p className="text-sm text-gray-600">Ajustes generales para todas las integraciones</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeout de conexión (segundos)
            </label>
            <Input
              type="number"
              placeholder="30"
              min="5"
              max="300"
              defaultValue="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reintentos automáticos
            </label>
            <Input
              type="number"
              placeholder="3"
              min="0"
              max="10"
              defaultValue="3"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableLogging"
              className="h-4 w-4 text-primary"
            />
            <label htmlFor="enableLogging" className="ml-2 text-sm text-gray-700">
              Habilitar logging de integraciones
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableNotifications"
              className="h-4 w-4 text-primary"
            />
            <label htmlFor="enableNotifications" className="ml-2 text-sm text-gray-700">
              Notificar errores de conexión
            </label>
          </div>
        </div>
      </Card>

      {/* External Services */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Servicios Externos</h3>
              <p className="text-sm text-gray-600">APIs y servicios de terceros</p>
            </div>
          </div>
          <Button className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Agregar Servicio</span>
          </Button>
        </div>

        <div className="space-y-4">
          {settings.integraciones.externalServices.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-600">{service.endpoint}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={service.isEnabled ? 'default' : 'secondary'}>
                  {service.isEnabled ? 'Activo' : 'Inactivo'}
                </Badge>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Help Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Información sobre Integraciones</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Asegúrate de tener las credenciales correctas antes de activar</li>
              <li>• Prueba las conexiones en modo sandbox antes de producción</li>
              <li>• Mantén actualizadas las APIs para evitar incompatibilidades</li>
              <li>• Revisa regularmente los logs de integración</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}