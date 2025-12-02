import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { 
  Settings, 
  Users, 
  Shield, 
  Database,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

// Importar nuestros componentes de panel de menús
import { PanelMenuConfig, AdminMenuManager } from './index'
import { useToast, ToastProvider } from '../ui/toast'

// Mock API para demostración
const mockAPI = {
  // Simular carga de usuarios
  async getUsers() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      {
        id: '1',
        name: 'Dr. Juan Pérez',
        email: 'juan.perez@hospital.com',
        hierarchy: 'medico_especialista',
        enterpriseId: 'emp-1',
        departmentId: 'dept-1',
        clinicId: 'clinic-1',
        permissions: [
          {
            id: 'perm-1',
            resource: 'patients',
            action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'perm-2',
            resource: 'appointments',
            action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          }
        ],
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'America/Mexico_City',
          notifications: {
            email: true,
            push: true,
            sms: false,
            appointmentReminders: true,
            systemAlerts: true,
            auditNotifications: true
          },
          dashboard: {
            widgets: [],
            layout: 'grid',
            refreshInterval: 30
          }
        },
        status: 'active',
        loginCount: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      },
      {
        id: '2',
        name: 'Enfermera María González',
        email: 'maria.gonzalez@hospital.com',
        hierarchy: 'enfermera',
        enterpriseId: 'emp-1',
        departmentId: 'dept-1',
        clinicId: 'clinic-1',
        permissions: [],
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'America/Mexico_City',
          notifications: {
            email: true,
            push: true,
            sms: false,
            appointmentReminders: true,
            systemAlerts: true,
            auditNotifications: true
          },
          dashboard: {
            widgets: [],
            layout: 'grid',
            refreshInterval: 30
          }
        },
        status: 'active',
        loginCount: 23,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      },
      {
        id: '3',
        name: 'Dr. Carlos Rivera',
        email: 'carlos.rivera@hospital.com',
        hierarchy: 'medico_trabajo',
        enterpriseId: 'emp-1',
        departmentId: 'dept-2',
        clinicId: 'clinic-2',
        permissions: [],
        preferences: {
          theme: 'light',
          language: 'es',
          timezone: 'America/Mexico_City',
          notifications: {
            email: true,
            push: true,
            sms: false,
            appointmentReminders: true,
            systemAlerts: true,
            auditNotifications: true
          },
          dashboard: {
            widgets: [],
            layout: 'grid',
            refreshInterval: 30
          }
        },
        status: 'active',
        loginCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      }
    ]
  },

  // Simular guardado de permisos de usuario
  async saveUserPermissions(userId: string, permissions: any[]) {
    console.log('Guardando permisos para usuario:', userId, permissions)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simular posibles errores
    if (Math.random() > 0.9) {
      throw new Error('Error de conexión con el servidor')
    }
    
    return { success: true, timestamp: new Date().toISOString() }
  },

  // Simular obtener estadísticas
  async getPermissionStats() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      totalUsers: 156,
      activeUsers: 142,
      rolesConfigured: 8,
      permissionsChanged: 23,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Componente de Dashboard para mostrar estadísticas
function PermissionStats() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    mockAPI.getPermissionStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold">{stats?.totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold">{stats?.activeUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Roles Configurados</p>
              <p className="text-2xl font-bold">{stats?.rolesConfigured}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cambios Este Mes</p>
              <p className="text-2xl font-bold">{stats?.permissionsChanged}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal de la página de administración
function MenuAdministrationPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const { showSuccess, showError, showWarning } = useToast()

  React.useEffect(() => {
    // Cargar usuarios al montar el componente
    mockAPI.getUsers()
      .then(setUsers)
      .catch(error => {
        showError('Error', 'No se pudieron cargar los usuarios')
        console.error('Error loading users:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveUserPermissions = async (userId: string, permissions: any[]) => {
    try {
      await mockAPI.saveUserPermissions(userId, permissions)
      showSuccess(
        'Permisos actualizados',
        'Los permisos del usuario se han guardado correctamente'
      )
    } catch (error) {
      showError(
        'Error al guardar',
        'No se pudieron guardar los permisos del usuario'
      )
      throw error // Re-lanzar para que el componente maneje el estado
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Administración de Menús
            </h1>
            <p className="text-gray-600 mt-2">
              Configura permisos de acceso y menús para usuarios y roles del sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sistema Activo
            </Badge>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Backup Config
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <PermissionStats />

      {/* Alertas del sistema */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Recordatorio de Seguridad</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Los cambios en permisos de administrador requieren revisión adicional. 
                Siempre verifica antes de aplicar cambios masivos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="individual">Configuración Individual</TabsTrigger>
          <TabsTrigger value="bulk">Gestión Masiva</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        {/* Panel de configuración individual */}
        <TabsContent value="individual">
          <PanelMenuConfig 
            onSave={handleSaveUserPermissions}
            users={users}
          />
        </TabsContent>

        {/* Panel de gestión masiva */}
        <TabsContent value="bulk">
          <AdminMenuManager />
        </TabsContent>

        {/* Panel de plantillas */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas Predefinidas</CardTitle>
              <CardDescription>
                Configuraciones estándar para diferentes roles del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Médico Especialista</CardTitle>
                    <CardDescription>
                      Acceso completo a expedientes clínicos y diagnósticos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Pacientes</Badge>
                        <Badge variant="secondary">Citas</Badge>
                        <Badge variant="secondary">Exámenes</Badge>
                        <Badge variant="secondary">Reportes</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Aplicar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Enfermera</CardTitle>
                    <CardDescription>
                      Acceso limitado para apoyo en atención médica
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Pacientes</Badge>
                        <Badge variant="secondary">Citas</Badge>
                        <Badge variant="outline">Reportes</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Aplicar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recepción</CardTitle>
                    <CardDescription>
                      Acceso básico para gestión de citas y pacientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Citas</Badge>
                        <Badge variant="outline">Pacientes</Badge>
                        <Badge variant="outline">Reportes</Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Aplicar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer informativo */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">Información del Sistema</p>
              <p className="text-gray-600">
                Los cambios en permisos se aplican inmediatamente para usuarios nuevos. 
                Los usuarios existentes deberán cerrar sesión y volver a iniciar para ver los cambios.
                Usa la función de auto-guardado para cambios frecuentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente wrapper que incluye el ToastProvider
export function MenuAdministrationWithProvider() {
  return (
    <ToastProvider>
      <MenuAdministrationPage />
    </ToastProvider>
  )
}

export default MenuAdministrationWithProvider