import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { 
  Users, 
  Shield, 
  Download, 
  Upload, 
  Copy, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock, 
  Activity,
  Settings,
  Database,
  Package,
  Calendar,
  UserCheck,
  Archive,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3,
  Store,
  FileBarChart,
  UserX
} from 'lucide-react'
import { 
  SaaSRole, 
  SaaSUser, 
  UserHierarchy, 
  GranularPermission, 
  ResourceType, 
  PermissionAction,
  RESOURCE_PERMISSIONS,
  HIERARCHY_LEVELS
} from '../../types/saas'
import { useToast } from '../ui/toast'

interface Template {
  id: string
  name: string
  description: string
  hierarchy: UserHierarchy
  permissions: GranularPermission[]
  isSystem: boolean
  createdAt: Date
  usage: number
}

interface AuditEntry {
  id: string
  action: string
  userId: string
  roleId: string
  timestamp: Date
  details: string
  status: 'success' | 'error' | 'warning'
}

const HIERARCHY_TITLES: Record<UserHierarchy, string> = {
  super_admin: 'Super Administrador',
  admin_empresa: 'Administrador de Empresa',
  medico_especialista: 'Médico Especialista',
  medico_trabajo: 'Médico del Trabajo',
  enfermera: 'Enfermera',
  audiometrista: 'Audiometrista',
  psicologo_laboral: 'Psicólogo Laboral',
  tecnico_ergonomico: 'Técnico Ergonómico',
  recepcion: 'Recepción',
  medico_industrial: 'Médico Industrial',
  bot: 'Bot',
  paciente: 'Paciente'
}

const RESOURCE_TITLES: Record<ResourceType, string> = {
  users: 'Usuarios',
  patients: 'Pacientes',
  appointments: 'Citas',
  examinations: 'Exámenes',
  reports: 'Reportes',
  billing: 'Facturación',
  inventory: 'Inventario',
  settings: 'Configuración',
  audits: 'Auditoría'
}

export function AdminMenuManager() {
  const [roles, setRoles] = useState<SaaSRole[]>([])
  const [selectedRole, setSelectedRole] = useState<SaaSRole | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [users, setUsers] = useState<SaaSUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchRole, setSearchRole] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [filterHierarchy, setFilterHierarchy] = useState<UserHierarchy | 'all'>('all')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [bulkConfirmDialog, setBulkConfirmDialog] = useState(false)
  const [bulkOperationData, setBulkOperationData] = useState<{roleId: string, userIds: string[]} | null>(null)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [operationInProgress, setOperationInProgress] = useState(false)
  
  // Hook para notificaciones toast
  const { showSuccess, showError, showWarning } = useToast()

  // Simular carga inicial de datos
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    
    // Simular carga de roles
    const mockRoles: SaaSRole[] = [
      {
        id: 'role-1',
        name: 'Médico Especialista',
        hierarchy: 'medico_especialista',
        description: 'Médico con acceso a expedientes clínicos y diagnósticos',
        permissions: [
          {
            id: 'perm-1',
            resource: 'patients',
            action: { read: true, create: true, update: true, delete: false, export: true, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'perm-2',
            resource: 'appointments',
            action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'perm-3',
            resource: 'examinations',
            action: { read: true, create: true, update: true, delete: false, export: true, import: false, admin: false },
            level: 'department'
          }
        ],
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: { userCount: 12, departmentCount: 3, clinicCount: 8 }
      },
      {
        id: 'role-2',
        name: 'Enfermera',
        hierarchy: 'enfermera',
        description: 'Personal de enfermería con acceso limitado',
        permissions: [
          {
            id: 'perm-4',
            resource: 'patients',
            action: { read: true, create: false, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'perm-5',
            resource: 'appointments',
            action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          }
        ],
        isSystemRole: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: { userCount: 8, departmentCount: 2, clinicCount: 5 }
      }
    ]

    // Simular carga de usuarios
    const mockUsers: SaaSUser[] = [
      {
        id: 'user-1',
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
        loginCount: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      },
      {
        id: 'user-2',
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
        loginCount: 23,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      }
    ]

    setRoles(mockRoles)
    setUsers(mockUsers)
    setSelectedRole(mockRoles[0])
    
    setLoading(false)
  }

  const handleRoleSelect = (role: SaaSRole) => {
    setSelectedRole(role)
  }

  const handlePermissionChange = (resource: ResourceType, action: keyof PermissionAction, checked: boolean) => {
    if (!selectedRole) return

    setRoles(prev => prev.map(role => {
      if (role.id === selectedRole.id) {
        const existingIndex = role.permissions.findIndex(p => p.resource === resource)
        const updatedResource = { ...RESOURCE_PERMISSIONS[resource] }
        
        updatedResource[action] = checked

        const newPermission: GranularPermission = {
          id: `perm-${resource}-${Date.now()}`,
          resource,
          action: updatedResource,
          level: 'department'
        }

        if (existingIndex >= 0) {
          const updated = [...role.permissions]
          updated[existingIndex] = newPermission
          return { ...role, permissions: updated }
        } else {
          return { ...role, permissions: [...role.permissions, newPermission] }
        }
      }
      return role
    }))
  }

  const getPermissionStatus = (role: SaaSRole, resource: ResourceType, action: keyof PermissionAction): boolean => {
    const permission = role.permissions.find(p => p.resource === resource)
    return permission ? permission.action[action] : false
  }

  const handleSaveRole = async () => {
    if (!selectedRole) return

    setSaving(true)
    
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Agregar entrada de auditoría
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'update_role_permissions',
        userId: 'current-admin',
        roleId: selectedRole.id,
        timestamp: new Date(),
        details: `Se actualizaron los permisos del rol ${selectedRole.name}`,
        status: 'success'
      }
      
      setAuditLog(prev => [auditEntry, ...prev.slice(0, 49)]) // Mantener últimos 50
      
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id ? { ...role, updatedAt: new Date() } : role
      ))
      
      // Mostrar notificación de éxito
      showSuccess(
        'Rol actualizado',
        `Los permisos del rol "${selectedRole.name}" se han guardado correctamente`
      )
      
    } catch (error) {
      console.error('Error al guardar rol:', error)
      
      // Mostrar notificación de error
      showError(
        'Error al guardar',
        'No se pudieron guardar los permisos del rol. Inténtalo de nuevo.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleBulkApplyConfirm = (roleId: string, userIds: string[]) => {
    const selectedRole = roles.find(r => r.id === roleId)
    setBulkOperationData({ roleId, userIds })
    showWarning(
      'Confirmar aplicación masiva',
      `Estás a punto de aplicar permisos del rol "${selectedRole?.name}" a ${userIds.length} usuarios. Esta acción no se puede deshacer.`,
      {
        label: 'Confirmar',
        onClick: () => {
          setBulkConfirmDialog(true)
        }
      }
    )
  }

  const executeBulkApply = async () => {
    if (!bulkOperationData || !confirmPassword) return

    setOperationInProgress(true)
    
    try {
      // Validación de contraseña simulada
      if (confirmPassword.length < 6) {
        showError('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres')
        setOperationInProgress(false)
        return
      }

      // Simular aplicación masiva
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Agregar auditoría detallada
      const selectedRole = roles.find(r => r.id === bulkOperationData.roleId)
      const auditEntry: AuditEntry = {
        id: `audit-${Date.now()}`,
        action: 'bulk_apply_permissions',
        userId: 'current-admin',
        roleId: bulkOperationData.roleId,
        timestamp: new Date(),
        details: `Se aplicaron permisos del rol "${selectedRole?.name}" a ${bulkOperationData.userIds.length} usuarios. Contraseña confirmada.`,
        status: 'success'
      }
      
      setAuditLog(prev => [auditEntry, ...prev.slice(0, 49)])
      
      setSelectedUsers([])
      setBulkConfirmDialog(false)
      setBulkOperationData(null)
      setConfirmPassword('')
      
      // Mostrar notificación de éxito
      showSuccess(
        'Aplicación masiva completada',
        `Se aplicaron permisos a ${bulkOperationData.userIds.length} usuarios exitosamente`
      )
      
    } catch (error) {
      console.error('Error en aplicación masiva:', error)
      
      // Mostrar notificación de error
      showError(
        'Error en aplicación masiva',
        'No se pudieron aplicar los permisos a todos los usuarios. Revisa la consola para más detalles.'
      )
    } finally {
      setOperationInProgress(false)
    }
  }

  const handleApplyTemplate = (template: Template) => {
    if (!selectedRole) return
    
    setRoles(prev => prev.map(role => 
      role.id === selectedRole?.id 
        ? { ...role, permissions: [...template.permissions] }
        : role
    ))
  }

  const handleApplyTemplateToRole = (roleId: string, hierarchy: UserHierarchy) => {
    // Simular aplicación de plantilla predefinida
    const templatePermissions: GranularPermission[] = []
    
    // Generar permisos según la jerarquía
    switch (hierarchy) {
      case 'medico_especialista':
        templatePermissions.push(
          {
            id: 'tpl-patients',
            resource: 'patients',
            action: { read: true, create: true, update: true, delete: false, export: true, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'tpl-appointments',
            resource: 'appointments',
            action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'tpl-examinations',
            resource: 'examinations',
            action: { read: true, create: true, update: true, delete: false, export: true, import: false, admin: false },
            level: 'department'
          }
        )
        break
      case 'enfermera':
        templatePermissions.push(
          {
            id: 'tpl-patients',
            resource: 'patients',
            action: { read: true, create: false, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          },
          {
            id: 'tpl-appointments',
            resource: 'appointments',
            action: { read: true, create: true, update: true, delete: false, export: false, import: false, admin: false },
            level: 'department'
          }
        )
        break
      default:
        templatePermissions.push(
          {
            id: 'tpl-reports',
            resource: 'reports',
            action: { read: true, create: false, update: false, delete: false, export: false, import: false, admin: false },
            level: 'department'
          }
        )
    }
    
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, permissions: templatePermissions, updatedAt: new Date() }
        : role
    ))
    
    // Agregar auditoría
    const selectedRole = roles.find(r => r.id === roleId)
    const auditEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      action: 'apply_template',
      userId: 'current-admin',
      roleId: roleId,
      timestamp: new Date(),
      details: `Se aplicó plantilla "${HIERARCHY_TITLES[hierarchy]}" al rol "${selectedRole?.name}"`,
      status: 'success'
    }
    
    setAuditLog(prev => [auditEntry, ...prev.slice(0, 49)])
    
    // Notificar éxito
    showSuccess(
      'Plantilla aplicada',
      `Se aplicaron los permisos de la plantilla "${HIERARCHY_TITLES[hierarchy]}" al rol seleccionado`
    )
  }

  const handleExportRoles = () => {
    const exportData = {
      roles,
      templates,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roles-permisos-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    // Mostrar notificación de éxito
    showSuccess(
      'Exportación completada',
      `Se exportaron ${roles.length} roles y ${templates.length} plantillas`
    )
  }

  const handleImportRoles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        if (importData.roles) {
          setRoles(importData.roles)
        }
        if (importData.templates) {
          setTemplates(importData.templates)
        }
        
        const auditEntry: AuditEntry = {
          id: `audit-${Date.now()}`,
          action: 'import_roles',
          userId: 'current-admin',
          roleId: '',
          timestamp: new Date(),
          details: `Se importaron roles desde archivo`,
          status: 'success'
        }
        
        setAuditLog(prev => [auditEntry, ...prev.slice(0, 49)])
        
        // Mostrar notificación de éxito
        showSuccess(
          'Importación completada',
          `Se importaron roles y plantillas desde el archivo`
        )
        
      } catch (error) {
        console.error('Error al importar:', error)
        
        // Mostrar notificación de error
        showError(
          'Error al importar',
          'El archivo seleccionado no es válido o está corrupto'
        )
      }
    }
    reader.readAsText(file)
  }

  // Filtrar roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchRole.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchRole.toLowerCase())
    const matchesHierarchy = filterHierarchy === 'all' || role.hierarchy === filterHierarchy
    return matchesSearch && matchesHierarchy
  })

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchUser.toLowerCase())
    const matchesHierarchy = filterHierarchy === 'all' || user.hierarchy === filterHierarchy
    return matchesSearch && matchesHierarchy
  })

  const getRoleUsageCount = (roleId: string): number => {
    return users.filter(user => user.hierarchy === roles.find(r => r.id === roleId)?.hierarchy).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión Masiva de Menús</h1>
          <p className="text-gray-600">Administra permisos por rol con herramientas avanzadas</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Configuración de Roles</DialogTitle>
                <DialogDescription>
                  Descarga la configuración actual de roles y permisos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>Se exportarán {roles.length} roles y {templates.length} plantillas.</p>
                <Button onClick={handleExportRoles} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar archivo JSON
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Configuración de Roles</DialogTitle>
                <DialogDescription>
                  Carga una configuración desde archivo JSON
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportRoles}
                />
                <p className="text-sm text-gray-500">
                  Selecciona un archivo JSON exportado previamente
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">Gestión de Roles</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="bulk">Aplicación Masiva</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>

        {/* Gestión de Roles */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Roles */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Selecciona un rol para editar</CardDescription>
                <div className="space-y-2">
                  <Input
                    placeholder="Buscar roles..."
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                  />
                  <Select value={filterHierarchy} onValueChange={(value) => setFilterHierarchy(value as UserHierarchy | 'all')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por jerarquía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las jerarquías</SelectItem>
                      {Object.entries(HIERARCHY_TITLES).map(([key, title]) => (
                        <SelectItem key={key} value={key}>{title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredRoles.map(role => (
                    <div
                      key={role.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRole?.id === role.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-sm text-gray-500">{role.description}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {HIERARCHY_TITLES[role.hierarchy]}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <UserCheck className="h-3 w-3" />
                            {getRoleUsageCount(role.id)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Permisos */}
            <div className="lg:col-span-2">
              {selectedRole ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedRole.name}</CardTitle>
                        <CardDescription>{selectedRole.description}</CardDescription>
                      </div>
                      <Button onClick={handleSaveRole} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(RESOURCE_TITLES).map(([resource, title]) => {
                      const permissions = selectedRole.permissions.filter(p => p.resource === resource)
                      return (
                        <div key={resource} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {title}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(RESOURCE_PERMISSIONS[resource as ResourceType]).map(([action, defaultValue]) => (
                              <div key={action} className="flex items-center justify-between">
                                <Label className="text-sm font-medium capitalize">{action}</Label>
                                <Checkbox
                                  checked={getPermissionStatus(selectedRole, resource as ResourceType, action as keyof PermissionAction)}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(resource as ResourceType, action as keyof PermissionAction, checked as boolean)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona un rol
                    </h3>
                    <p className="text-gray-600">
                      Elige un rol de la lista para configurar sus permisos
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Plantillas */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(HIERARCHY_TITLES).map(([hierarchy, title]) => (
              <Card key={hierarchy}>
                <CardHeader>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>
                    Plantilla predefinida para {title.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(RESOURCE_TITLES).map(([resource, resourceTitle]) => (
                        <Badge key={resource} variant="outline" className="text-xs">
                          {resourceTitle}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={!selectedRole}
                        onClick={() => {
                          if (selectedRole) {
                            showWarning('Plantilla seleccionada', `Se aplicará la plantilla de ${title} al rol ${selectedRole.name}`)
                            handleApplyTemplateToRole(selectedRole.id, hierarchy as UserHierarchy)
                          } else {
                            showWarning('Sin rol seleccionado', 'Selecciona un rol primero para aplicar la plantilla')
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Aplicar a Rol Seleccionado
                      </Button>
                      {!selectedRole && (
                        <p className="text-xs text-gray-500 text-center">Selecciona un rol primero</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aplicación Masiva */}
        <TabsContent value="bulk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selección de Usuarios */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Usuarios</CardTitle>
                <CardDescription>
                  Elige los usuarios a los que aplicar cambios masivos
                </CardDescription>
                <div className="space-y-2">
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                    />
                    <Label className="flex-1 ml-2">
                      Seleccionar todos ({filteredUsers.length})
                    </Label>
                  </div>
                  
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(prev => [...prev, user.id])
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {HIERARCHY_TITLES[user.hierarchy]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aplicación de Cambios */}
            <Card>
              <CardHeader>
                <CardTitle>Aplicar Cambios</CardTitle>
                <CardDescription>
                  Aplica la configuración del rol seleccionado a los usuarios elegidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRole && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-2">Rol: {selectedRole.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{selectedRole.description}</p>
                    <div className="text-sm">
                      <strong>{selectedUsers.length} usuarios seleccionados</strong>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button 
                    onClick={() => selectedRole && handleBulkApplyConfirm(selectedRole.id, selectedUsers)}
                    disabled={!selectedRole || selectedUsers.length === 0 || operationInProgress}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {operationInProgress ? 'Aplicando...' : `Aplicar a ${selectedUsers.length} usuarios`}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedUsers([])}
                  >
                    Limpiar Selección
                  </Button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Los cambios reemplazarán los permisos actuales</p>
                  <p>• Se registrará en la auditoría</p>
                  <p>• Los usuarios verán los cambios en su próximo login</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Auditoría */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría</CardTitle>
              <CardDescription>
                Historial de cambios en permisos y configuraciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLog.length > 0 ? auditLog.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        entry.status === 'success' ? 'bg-green-100' :
                        entry.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {entry.status === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         entry.status === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                         <AlertTriangle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {entry.timestamp.toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2" />
                    <p>No hay entradas de auditoría</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para aplicación masiva */}
      <Dialog open={bulkConfirmDialog} onOpenChange={setBulkConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Contraseña</DialogTitle>
            <DialogDescription>
              Para continuar con la aplicación masiva, confirma tu contraseña de administrador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Acción Crítica</span>
              </div>
              <p className="text-sm text-yellow-700">
                Estás a punto de modificar permisos de {bulkOperationData?.userIds.length} usuarios.
                Esta acción afectará inmediatamente el acceso de estos usuarios al sistema.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña de administrador</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={operationInProgress}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setBulkConfirmDialog(false)
                  setConfirmPassword('')
                  setBulkOperationData(null)
                }}
                disabled={operationInProgress}
              >
                Cancelar
              </Button>
              <Button
                onClick={executeBulkApply}
                disabled={!confirmPassword || operationInProgress}
                variant="destructive"
              >
                {operationInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Confirmar y Aplicar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminMenuManager
