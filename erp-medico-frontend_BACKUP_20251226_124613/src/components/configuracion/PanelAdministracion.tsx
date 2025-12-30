// Panel de administración principal
import React from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  Users, 
  Building, 
  FileText, 
  Database, 
  Shield, 
  Bot, 
  CreditCard, 
  BarChart3,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  HardDrive
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, icon: Icon, color, subtitle, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} className={`mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              <span>{trend.value}% vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ElementType
  onClick: () => void
  color: string
}

function QuickAction({ title, description, icon: Icon, onClick, color }: QuickActionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
    >
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} mb-4`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.button>
  )
}

export function PanelAdministracion() {
  const { settings } = useConfiguracion()

  const stats = [
    {
      title: 'Usuarios Activos',
      value: settings.usuario.filter(u => u.isActive).length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      subtitle: `${settings.usuario.length} usuarios totales`,
      trend: { value: 5.2, isPositive: true }
    },
    {
      title: 'Roles Configurados',
      value: settings.roles.length,
      icon: Shield,
      color: 'from-green-500 to-green-600',
      subtitle: 'Roles de sistema',
      trend: { value: 0, isPositive: true }
    },
    {
      title: 'Protocolos Activos',
      value: settings.protocolos.filter(p => p.isActive).length,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      subtitle: `${settings.protocolos.length} protocolos totales`,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Sedes Registradas',
      value: settings.sedes.filter(s => s.isActive).length,
      icon: Building,
      color: 'from-orange-500 to-orange-600',
      subtitle: 'Ubicaciones activas',
      trend: { value: 0, isPositive: true }
    }
  ]

  const quickActions = [
    {
      title: 'Crear Usuario',
      description: 'Agregar nuevo usuario al sistema',
      icon: Users,
      onClick: () => window.location.hash = 'usuarios',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Configurar Empresa',
      description: 'Actualizar información corporativa',
      icon: Building,
      onClick: () => window.location.hash = 'empresa',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Backup Manual',
      description: 'Crear respaldo de configuración',
      icon: Database,
      onClick: () => window.location.hash = 'backup',
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Configurar IA',
      description: 'Personalizar chatbot médico',
      icon: Bot,
      onClick: () => window.location.hash = 'chatbot',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Facturación',
      description: 'Configurar CFDI y PAC',
      icon: CreditCard,
      onClick: () => window.location.hash = 'facturacion',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Reportes',
      description: 'Gestionar plantillas y formatos',
      icon: BarChart3,
      onClick: () => window.location.hash = 'reportes',
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const systemStatus = [
    {
      name: 'Sistema de Backup',
      status: settings.backup.isActive ? 'Activo' : 'Inactivo',
      isHealthy: settings.backup.isActive,
      lastRun: settings.backup.lastBackup
    },
    {
      name: 'Notificaciones',
      status: settings.notificaciones.email.isEnabled ? 'Activo' : 'Inactivo',
      isHealthy: settings.notificaciones.email.isEnabled
    },
    {
      name: 'Chatbot IA',
      status: settings.chatbotIA.isEnabled ? 'Activo' : 'Inactivo',
      isHealthy: settings.chatbotIA.isEnabled
    },
    {
      name: 'Facturación CFDI',
      status: settings.facturacion.pac.isEnabled ? 'Activo' : 'Inactivo',
      isHealthy: settings.facturacion.pac.isEnabled
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">
          Vista general del estado del sistema y configuraciones principales
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado del sistema */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Estado del Sistema</h2>
          </div>
          
          <div className="space-y-4">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${item.isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={item.isHealthy ? 'default' : 'destructive'}>
                    {item.status}
                  </Badge>
                  {item.lastRun && (
                    <span className="text-xs text-gray-500">
                      {item.lastRun.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Acciones rápidas */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuickAction {...action} />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Información del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Configuración General</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Idioma:</span>
              <span className="font-medium">Español</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Zona horaria:</span>
              <span className="font-medium">America/Mexico_City</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Moneda:</span>
              <span className="font-medium">MXN (Pesos)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Formato fecha:</span>
              <span className="font-medium">DD/MM/YYYY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tema:</span>
              <span className="font-medium capitalize">{settings.general.theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Modo mantenimiento:</span>
              <Badge variant={settings.general.maintenanceMode ? 'destructive' : 'default'}>
                {settings.general.maintenanceMode ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Sistema de Backup</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Backup automático:</span>
              <Badge variant={settings.backup.autoBackup ? 'default' : 'secondary'}>
                {settings.backup.autoBackup ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frecuencia:</span>
              <span className="font-medium capitalize">{settings.backup.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retención:</span>
              <span className="font-medium">{settings.backup.retentionDays} días</span>
            </div>
            {settings.backup.lastBackup && (
              <div className="flex justify-between">
                <span className="text-gray-600">Último backup:</span>
                <span className="font-medium">
                  {settings.backup.lastBackup.toLocaleDateString()}
                </span>
              </div>
            )}
            {settings.backup.nextBackup && (
              <div className="flex justify-between">
                <span className="text-gray-600">Próximo backup:</span>
                <span className="font-medium">
                  {settings.backup.nextBackup.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}