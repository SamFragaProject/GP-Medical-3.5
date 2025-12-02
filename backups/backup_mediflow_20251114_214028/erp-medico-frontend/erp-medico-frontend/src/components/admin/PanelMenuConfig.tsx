import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { 
  User, 
  Users, 
  Store, 
  Calendar, 
  FileText, 
  Package, 
  BarChart3, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Database,
  Activity,
  Building2,
  HeartPulse,
  Stethoscope,
  Bed,
  Pill,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { SaaSUser, GranularPermission, ResourceType, PermissionAction, UserHierarchy } from '../../types/saas'
import { useToast } from '../ui/toast'

interface MenuSection {
  id: string
  title: string
  icon: React.ReactNode
  resources: ResourceType[]
  description: string
  color: string
  bgColor: string
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
    resources: ['reports'],
    description: 'Panel principal y estadísticas',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'tienda',
    title: 'Tienda',
    icon: <Store className="h-4 w-4" />,
    resources: ['users', 'billing'],
    description: 'Gestión de productos y ventas',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'pacientes',
    title: 'Pacientes',
    icon: <Users className="h-4 w-4" />,
    resources: ['patients'],
    description: 'Gestión de expedientes clínicos',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'citas',
    title: 'Citas',
    icon: <Calendar className="h-4 w-4" />,
    resources: ['appointments'],
    description: 'Agenda y programación',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'examenes',
    title: 'Exámenes',
    icon: <Stethoscope className="h-4 w-4" />,
    resources: ['examinations'],
    description: 'Exámenes médicos y laborales',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'inventario',
    title: 'Inventario',
    icon: <Package className="h-4 w-4" />,
    resources: ['inventory'],
    description: 'Medicamentos y suministros',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 'reportes',
    title: 'Reportes',
    icon: <FileText className="h-4 w-4" />,
    resources: ['reports'],
    description: 'Informes y documentación',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50'
  },
  {
    id: 'configuracion',
    title: 'Configuración',
    icon: <Settings className="h-4 w-4" />,
    resources: ['settings', 'users'],
    description: 'Ajustes del sistema',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
]

// Constante con permisos válidos por recurso
const RESOURCE_PERMISSIONS: Record<ResourceType, PermissionAction> = {
  reports: { read: true, create: false, update: false, delete: false, export: false, import: false, admin: false },
  users: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  billing: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  patients: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  appointments: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  examinations: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  inventory: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  settings: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false },
  audits: { read: false, create: false, update: false, delete: false, export: false, import: false, admin: false }
}

const PERMISSION_ACTIONS = [
  { key: 'read' as keyof PermissionAction, label: 'Leer', description: 'Ver información' },
  { key: 'create' as keyof PermissionAction, label: 'Crear', description: 'Agregar nuevos registros' },
  { key: 'update' as keyof PermissionAction, label: 'Editar', description: 'Modificar información existente' },
  { key: 'delete' as keyof PermissionAction, label: 'Eliminar', description: 'Borrar registros' },
  { key: 'export' as keyof PermissionAction, label: 'Exportar', description: 'Descargar datos' },
  { key: 'import' as keyof PermissionAction, label: 'Importar', description: 'Cargar datos' },
  { key: 'admin' as keyof PermissionAction, label: 'Administrador', description: 'Control total' }
]

interface PanelMenuConfigProps {
  onSave?: (userId: string, permissions: GranularPermission[]) => Promise<void>
  users?: SaaSUser[]
}

export function PanelMenuConfig({ onSave, users = [] }: PanelMenuConfigProps) {
  const [selectedUser, setSelectedUser] = useState<SaaSUser | null>(null)
  const [searchUser, setSearchUser] = useState('')
  const [userPermissions, setUserPermissions] = useState<GranularPermission[]>([])
  const [originalPermissions, setOriginalPermissions] = useState<GranularPermission[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [showPreview, setShowPreview] = useState(true)
  const [autoSave, setAutoSave] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Hook para notificaciones toast
  const { showSuccess, showError, showWarning } = useToast()

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.hierarchy.toLowerCase().includes(searchUser.toLowerCase())
  )

  // Simular carga de usuarios (en producción vendría del backend)
  useEffect(() => {
    if (users.length === 0) {
      // Simulación de datos
      const mockUsers: SaaSUser[] = [
        {
          id: '1',
          name: 'Dr. Juan Pérez',
          email: 'juan.perez@empresa.com',
          hierarchy: 'medico_especialista',
          enterpriseId: 'emp-1',
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
          loginCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {}
        },
        {
          id: '2',
          name: 'Enfermera María González',
          email: 'maria.gonzalez@empresa.com',
          hierarchy: 'enfermera',
          enterpriseId: 'emp-1',
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
          loginCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {}
        }
      ]
      setSelectedUser(mockUsers[0])
      setUserPermissions([])
      setOriginalPermissions([])
    }
  }, [users])

  // Cargar permisos cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUser) {
      setLoading(true)
      // Simular carga de permisos del usuario
      setTimeout(() => {
        const mockPermissions: GranularPermission[] = selectedUser.permissions || []
        setUserPermissions(mockPermissions)
        setOriginalPermissions([...mockPermissions])
        setHasChanges(false)
        setLoading(false)
      }, 500)
    }
  }, [selectedUser])

  // Detectar cambios
  useEffect(() => {
    const hasChanges = JSON.stringify(userPermissions) !== JSON.stringify(originalPermissions)
    setHasChanges(hasChanges)
    setPendingChanges(hasChanges)
  }, [userPermissions, originalPermissions])

  // Auto-guardado
  useEffect(() => {
    if (autoSave && hasChanges && selectedUser && onSave) {
      const timer = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save después de 2 segundos de inactividad

      return () => clearTimeout(timer)
    }
  }, [userPermissions, autoSave])

  const handleUserSelect = (user: SaaSUser) => {
    setSelectedUser(user)
    setSaveStatus('idle')
  }

  const handlePermissionChange = (resource: ResourceType, action: keyof PermissionAction, checked: boolean) => {
    setUserPermissions(prev => {
      const existingIndex = prev.findIndex(p => p.resource === resource)
      const updatedResource = { ...RESOURCE_PERMISSIONS[resource] }

      // Actualizar la acción específica
      updatedResource[action] = checked

      // Crear nuevo objeto de permiso
      const newPermission: GranularPermission = {
        id: `perm-${resource}-${Date.now()}`,
        resource,
        action: updatedResource,
        level: 'user'
      }

      if (existingIndex >= 0) {
        // Actualizar permiso existente
        const updated = [...prev]
        updated[existingIndex] = newPermission
        return updated
      } else {
        // Agregar nuevo permiso
        return [...prev, newPermission]
      }
    })
  }

  const handleSectionPermissionChange = (section: MenuSection, action: keyof PermissionAction, checked: boolean) => {
    section.resources.forEach(resource => {
      handlePermissionChange(resource, action, checked)
    })
  }

  const getPermissionStatus = (resource: ResourceType, action: keyof PermissionAction): boolean => {
    const permission = userPermissions.find(p => p.resource === resource)
    return permission ? permission.action[action] : false
  }

  const handleSave = async () => {
    if (!selectedUser || !onSave) return

    setSaveStatus('saving')
    setLoading(true)

    try {
      await onSave(selectedUser.id, userPermissions)
      setOriginalPermissions([...userPermissions])
      setSaveStatus('success')
      setLastSaved(new Date())
      setPendingChanges(false)
      
      // Mostrar notificación de éxito
      showSuccess(
        'Permisos guardados',
        `Los permisos de ${selectedUser.name} se han actualizado correctamente`
      )
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error al guardar permisos:', error)
      setSaveStatus('error')
      
      // Mostrar notificación de error
      showError(
        'Error al guardar',
        'No se pudieron guardar los permisos. Verifica tu conexión e inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setUserPermissions([...originalPermissions])
  }

  const getInheritedPermissions = (): GranularPermission[] => {
    if (!selectedUser) return []
    
    // Simular herencia de permisos basado en rol
    const hierarchyPermissions: GranularPermission[] = [
      {
        id: 'inherit-pats',
        resource: 'patients',
        action: { read: true, create: false, update: false, delete: false, export: false, import: false, admin: false },
        level: 'department'
      }
    ]
    
    return hierarchyPermissions
  }

  const getInheritedPermissionStatus = (resource: ResourceType, action: keyof PermissionAction): boolean => {
    const inherited = getInheritedPermissions()
    const permission = inherited.find(p => p.resource === resource)
    return permission ? permission.action[action] : false
  }

  const renderPreview = () => {
    if (!showPreview || !selectedUser) return null

    const visibleSections = MENU_SECTIONS.filter(section => {
      return section.resources.some(resource => 
        userPermissions.some(permission => 
          permission.resource === resource && permission.action.read
        )
      )
    })

    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vista Previa del Menú
          </CardTitle>
          <CardDescription className="text-xs">
            Menú que verá {selectedUser.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleSections.map(section => (
            <div
              key={section.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${section.bgColor} border-l-4 border-l-current ${section.color}`}
            >
              {section.icon}
              <span className="font-medium">{section.title}</span>
            </div>
          ))}
          {visibleSections.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No hay secciones visibles con los permisos actuales
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Menús</h1>
          <p className="text-gray-600">Gestiona los permisos de acceso por usuario</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel de Usuario */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Usuario</CardTitle>
              <CardDescription>Busca y selecciona un usuario para configurar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar usuario</Label>
                <Input
                  id="search"
                  placeholder="Nombre, email o rol..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(filteredUsers.length > 0 ? filteredUsers : users).map(user => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {user.hierarchy.replace('_', ' ')}
                        </Badge>
                      </div>
                      {user.status === 'active' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vista Previa */}
          {renderPreview()}

          {/* Controles */}
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autosave">Auto-guardado</Label>
                  <Checkbox
                    id="autosave"
                    checked={autoSave}
                    onCheckedChange={(checked) => setAutoSave(checked as boolean)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || loading || saveStatus === 'saving'}
                    className="w-full"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>

                  <Button
                    onClick={handleReset}
                    disabled={!hasChanges || loading}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restablecer
                  </Button>
                </div>

                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Permisos guardados correctamente
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Error al guardar permisos
                  </div>
                )}

                {hasChanges && !autoSave && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Tienes cambios sin guardar
                  </div>
                )}
                
                {lastSaved && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Clock className="h-3 w-3" />
                    Último guardado: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                
                {pendingChanges && (
                  <div className="flex items-center gap-2 text-blue-600 text-xs">
                    <Activity className="h-3 w-3" />
                    Cambios pendientes
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel de Permisos */}
        <div className="lg:col-span-8">
          {selectedUser ? (
            <Tabs defaultValue="permissions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="permissions">Configurar Permisos</TabsTrigger>
                <TabsTrigger value="inheritance">Herencia</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                {MENU_SECTIONS.map(section => (
                  <Card key={section.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${section.bgColor}`}>
                          <div className={section.color}>{section.icon}</div>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PERMISSION_ACTIONS.map(action => (
                          <div key={action.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">{action.label}</Label>
                                <p className="text-xs text-gray-500">{action.description}</p>
                              </div>
                              <Checkbox
                                checked={section.resources.some(resource => 
                                  getPermissionStatus(resource, action.key)
                                )}
                                onCheckedChange={(checked) => 
                                  handleSectionPermissionChange(section, action.key, checked as boolean)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="inheritance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Permisos Heredados del Rol</CardTitle>
                    <CardDescription>
                      Los siguientes permisos son heredados automáticamente del rol del usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {MENU_SECTIONS.map(section => {
                        const inheritedActions = PERMISSION_ACTIONS.filter(action => 
                          section.resources.some(resource => 
                            getInheritedPermissionStatus(resource, action.key)
                          )
                        )

                        if (inheritedActions.length === 0) return null

                        return (
                          <div key={section.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${section.bgColor}`}>
                                <div className={section.color}>{section.icon}</div>
                              </div>
                              <div>
                                <h4 className="font-medium">{section.title}</h4>
                                <p className="text-sm text-gray-600">{section.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {inheritedActions.map(action => (
                                <Badge key={action.key} variant="outline" className="text-xs">
                                  {action.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un usuario
                </h3>
                <p className="text-gray-600">
                  Busca y selecciona un usuario para configurar sus permisos de menú
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default PanelMenuConfig