// Página principal del módulo de Configuración del sistema
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Users, 
  Building, 
  FileText, 
  Bell, 
  Database, 
  Shield, 
  Bot, 
  CreditCard, 
  BarChart3, 
  Lock, 
  CheckSquare, 
  Network, 
  Monitor,
  Crown,
  UserCog,
  Save,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react'

// Importar componentes de configuración
import { GestionUsuarios } from '@/components/configuracion/GestionUsuarios'
import { SaaSUserManagement } from '@/components/configuracion/SaaSUserManagement'
import { SaaSAdminPanel } from '@/components/configuracion/SaaSAdminPanel'
import { GestionEmpresa } from '@/components/configuracion/GestionEmpresa'
import { ConfiguracionProtocolos } from '@/components/configuracion/ConfiguracionProtocolos'
import { ConfiguracionNotificaciones } from '@/components/configuracion/ConfiguracionNotificaciones'
import { SistemaBackup } from '@/components/configuracion/SistemaBackup'
import { AuditLogs } from '@/components/configuracion/AuditLogs'
import { ConfiguracionChatbotIA } from '@/components/configuracion/ConfiguracionChatbotIA'
import { ConfiguracionFacturacion } from '@/components/configuracion/ConfiguracionFacturacion'
import { ConfiguracionReportes } from '@/components/configuracion/ConfiguracionReportes'
import { ConfiguracionSeguridad } from '@/components/configuracion/ConfiguracionSeguridad'
import { ConfiguracionCumplimiento } from '@/components/configuracion/ConfiguracionCumplimiento'
import { ConfiguracionIntegraciones } from '@/components/configuracion/ConfiguracionIntegraciones'
import { PanelAdministracion } from '@/components/configuracion/PanelAdministracion'

import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

// Definir las secciones disponibles
const SECCIONES = [
  {
    id: 'saas_admin',
    name: 'Panel SaaS',
    icon: Crown,
    description: 'Administración empresarial',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'saas_users',
    name: 'Usuarios SaaS',
    icon: UserCog,
    description: 'Gestión con jerarquías',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'admin',
    name: 'Panel Administración',
    icon: Monitor,
    description: 'Vista general del sistema',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'usuarios',
    name: 'Usuarios Básicos',
    icon: Users,
    description: 'Gestión de usuarios tradicional',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'empresa',
    name: 'Empresa/Sedes',
    icon: Building,
    description: 'Información corporativa',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'protocolos',
    name: 'Protocolos Médicos',
    icon: FileText,
    description: 'Plantillas y exámenes',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'notificaciones',
    name: 'Notificaciones',
    icon: Bell,
    description: 'Email, SMS y alertas',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'backup',
    name: 'Backup/Restore',
    icon: Database,
    description: 'Respaldos y restauración',
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'audit',
    name: 'Audit Logs',
    icon: Shield,
    description: 'Registro de acciones',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'chatbot',
    name: 'Chatbot IA',
    icon: Bot,
    description: 'Configuración del asistente',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'facturacion',
    name: 'Facturación',
    icon: CreditCard,
    description: 'CFDI y pagos',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'reportes',
    name: 'Reportes',
    icon: BarChart3,
    description: 'Plantillas y formatos',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    icon: Lock,
    description: 'Políticas y sesiones',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'cumplimiento',
    name: 'Cumplimiento',
    icon: CheckSquare,
    description: 'Normativas y auditorías',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'integraciones',
    name: 'Integraciones',
    icon: Network,
    description: 'APIs externas',
    color: 'from-violet-500 to-violet-600'
  }
]

export function Configuracion() {
  const [seccionActiva, setSeccionActiva] = useState('admin')
  const [guardando, setGuardando] = useState(false)
  
  const { settings, exportSettings, importSettings, resetToDefaults, performBackup } = useConfiguracion()

  const seccionActual = SECCIONES.find(s => s.id === seccionActiva)

  const handleExportar = async () => {
    exportSettings()
  }

  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const configData = JSON.parse(text)
      
      if (confirm('¿Estás seguro de que quieres importar esta configuración? Se sobrescribirán todos los datos actuales.')) {
        const success = importSettings(configData)
        if (success) {
          setSeccionActiva('admin')
          toast.success('Configuración importada exitosamente')
        }
      }
    } catch (error) {
      toast.error('Error al leer el archivo de configuración')
    }
    
    // Limpiar el input
    event.target.value = ''
  }

  const handleResetear = async () => {
    if (confirm('¿Estás seguro de que quieres restablecer la configuración a valores por defecto? Esta acción no se puede deshacer.')) {
      resetToDefaults()
      setSeccionActiva('admin')
    }
  }

  const handleBackupManual = async () => {
    performBackup()
  }

  const renderSeccionActiva = () => {
    switch (seccionActiva) {
      case 'saas_admin':
        return <SaaSAdminPanel />
      case 'saas_users':
        return <SaaSUserManagement />
      case 'admin':
        return <PanelAdministracion />
      case 'usuarios':
        return <GestionUsuarios />
      case 'empresa':
        return <GestionEmpresa />
      case 'protocolos':
        return <ConfiguracionProtocolos />
      case 'notificaciones':
        return <ConfiguracionNotificaciones />
      case 'backup':
        return <SistemaBackup />
      case 'audit':
        return <AuditLogs />
      case 'chatbot':
        return <ConfiguracionChatbotIA />
      case 'facturacion':
        return <ConfiguracionFacturacion />
      case 'reportes':
        return <ConfiguracionReportes />
      case 'seguridad':
        return <ConfiguracionSeguridad />
      case 'cumplimiento':
        return <ConfiguracionCumplimiento />
      case 'integraciones':
        return <ConfiguracionIntegraciones />
      default:
        return <PanelAdministracion />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-600">Administra todas las configuraciones de MediFlow • Incluye sistema SaaS con jerarquías</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackupManual}
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Backup</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportar}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportar}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importar</span>
                </Button>
              </label>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetear}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Resetear</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar de navegación */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h2>
            
            <div className="space-y-2">
              {SECCIONES.map((seccion) => {
                const Icon = seccion.icon
                const isActive = seccionActiva === seccion.id
                
                return (
                  <motion.button
                    key={seccion.id}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${
                      isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-br ${seccion.color}`
                    }`}>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-white'} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {seccion.name}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                        {seccion.description}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={seccionActiva}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderSeccionActiva()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}