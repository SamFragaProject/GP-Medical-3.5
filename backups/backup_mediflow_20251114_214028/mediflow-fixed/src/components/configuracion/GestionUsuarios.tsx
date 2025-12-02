// Gestión de Usuarios y Roles
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Key,
  Settings
} from 'lucide-react'
import { useConfiguracion } from '@/hooks/useConfiguracion'
import { Usuario, Rol } from '@/types/configuracion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import toast from 'react-hot-toast'

interface UsuarioFormData {
  name: string
  email: string
  role: string
  permissions: string[]
  phone: string
  department: string
  position: string
  isActive: boolean
}

interface RolFormData {
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
}

function UsuarioForm({ usuario, onSave, onCancel }: { 
  usuario?: Usuario
  onSave: (data: UsuarioFormData) => void
  onCancel: () => void 
}) {
  const { settings } = useConfiguracion()
  const [formData, setFormData] = useState<UsuarioFormData>({
    name: usuario?.name || '',
    email: usuario?.email || '',
    role: usuario?.role || '',
    permissions: usuario?.permissions || [],
    phone: usuario?.phone || '',
    department: usuario?.department || '',
    position: usuario?.position || '',
    isActive: usuario?.isActive ?? true
  })

  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    onSave(formData)
  }

  const rolSeleccionado = settings.roles.find(r => r.name === formData.role)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dr. Juan Pérez"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="juan.perez@mediflow.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+52 55 1234 5678"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => {
              const rol = settings.roles.find(r => r.name === e.target.value)
              setFormData({ 
                ...formData, 
                role: e.target.value,
                permissions: rol?.permissions || []
              })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Seleccionar rol</option>
            {settings.roles.map((rol) => (
              <option key={rol.id} value={rol.name}>
                {rol.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento
          </label>
          <Input
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Medicina del Trabajo"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posición
          </label>
          <Input
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Médico Especialista"
          />
        </div>
      </div>

      {!usuario && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña temporal
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
      )}

      {rolSeleccionado && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permisos del rol: {rolSeleccionado.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {rolSeleccionado.permissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Usuario activo
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">
          {usuario ? 'Actualizar' : 'Crear'} Usuario
        </Button>
      </div>
    </form>
  )
}

function RolForm({ rol, onSave, onCancel }: { 
  rol?: Rol
  onSave: (data: RolFormData) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<RolFormData>({
    name: rol?.name || '',
    description: rol?.description || '',
    permissions: rol?.permissions || [],
    isSystemRole: rol?.isSystemRole ?? false
  })

  const permissions = [
    { id: 'read', name: 'Leer', description: 'Ver información del sistema' },
    { id: 'write', name: 'Escribir', description: 'Crear y modificar registros' },
    { id: 'delete', name: 'Eliminar', description: 'Borrar registros del sistema' },
    { id: 'admin', name: 'Administrar', description: 'Acceso a configuraciones' },
    { id: 'export', name: 'Exportar', description: 'Exportar datos del sistema' },
    { id: 'import', name: 'Importar', description: 'Importar datos al sistema' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    if (formData.permissions.length === 0) {
      toast.error('Selecciona al menos un permiso')
      return
    }
    onSave(formData)
  }

  const togglePermission = (permissionId: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter(p => p !== permissionId)
        : [...formData.permissions, permissionId]
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del rol *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Administrador"
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isSystemRole"
            checked={formData.isSystemRole}
            onChange={(e) => setFormData({ ...formData, isSystemRole: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isSystemRole" className="ml-2 text-sm text-gray-700">
            Rol del sistema
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de los permisos y responsabilidades del rol"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Permisos *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissions.map((permission) => (
            <div
              key={permission.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.permissions.includes(permission.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => togglePermission(permission.id)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{permission.name}</h4>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">
          {rol ? 'Actualizar' : 'Crear'} Rol
        </Button>
      </div>
    </form>
  )
}

export function GestionUsuarios() {
  const { settings, createUsuario, updateUsuario, deleteUsuario, createRol, updateRol, deleteRol } = useConfiguracion()
  const [vistaActiva, setVistaActiva] = useState<'usuarios' | 'roles'>('usuarios')
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'create-user' | 'edit-user' | 'create-role' | 'edit-role'>('create-user')
  const [itemSeleccionado, setItemSeleccionado] = useState<Usuario | Rol | null>(null)

  const usuariosFiltrados = settings.usuario.filter(usuario => {
    const matchesSearch = usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(busqueda.toLowerCase())
    const matchesRole = !filtroRol || usuario.role === filtroRol
    return matchesSearch && matchesRole
  })

  const handleCrearUsuario = () => {
    setModalType('create-user')
    setItemSeleccionado(null)
    setShowModal(true)
  }

  const handleEditarUsuario = (usuario: Usuario) => {
    setModalType('edit-user')
    setItemSeleccionado(usuario)
    setShowModal(true)
  }

  const handleCrearRol = () => {
    setModalType('create-role')
    setItemSeleccionado(null)
    setShowModal(true)
  }

  const handleEditarRol = (rol: Rol) => {
    setModalType('edit-role')
    setItemSeleccionado(rol)
    setShowModal(true)
  }

  const handleGuardarUsuario = (data: UsuarioFormData) => {
    if (modalType === 'create-user') {
      createUsuario(data)
    } else if (modalType === 'edit-user' && itemSeleccionado) {
      updateUsuario(itemSeleccionado.id, data)
    }
    setShowModal(false)
  }

  const handleGuardarRol = (data: RolFormData) => {
    if (modalType === 'create-role') {
      createRol({
        ...data,
        userCount: 0
      })
    } else if (modalType === 'edit-role' && itemSeleccionado) {
      updateRol(itemSeleccionado.id, data)
    }
    setShowModal(false)
  }

  const handleEliminarUsuario = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUsuario(id)
    }
  }

  const handleEliminarRol = (id: string) => {
    const usuariosConRol = settings.usuario.filter(u => u.role === (itemSeleccionado as Rol)?.name).length
    if (usuariosConRol > 0) {
      toast.error(`No se puede eliminar el rol. Hay ${usuariosConRol} usuarios asignados.`)
      return
    }
    if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      deleteRol(id)
    }
  }

  const renderModal = () => {
    if (!showModal) return null

    const isUserModal = modalType === 'create-user' || modalType === 'edit-user'

    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isUserModal
                ? (modalType === 'create-user' ? 'Crear Nuevo Usuario' : 'Editar Usuario')
                : (modalType === 'create-role' ? 'Crear Nuevo Rol' : 'Editar Rol')
              }
            </h2>
            {isUserModal ? (
              <UsuarioForm
                usuario={modalType === 'edit-user' ? itemSeleccionado as Usuario : undefined}
                onSave={handleGuardarUsuario}
                onCancel={() => setShowModal(false)}
              />
            ) : (
              <RolForm
                rol={modalType === 'edit-role' ? itemSeleccionado as Rol : undefined}
                onSave={handleGuardarRol}
                onCancel={() => setShowModal(false)}
              />
            )}
          </Card>
        </div>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios y Roles</h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setVistaActiva('usuarios')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'usuarios'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuarios ({settings.usuario.length})
          </button>
          <button
            onClick={() => setVistaActiva('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              vistaActiva === 'roles'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Roles ({settings.roles.length})
          </button>
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {vistaActiva === 'usuarios' ? (
          <motion.div
            key="usuarios"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Controles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar usuarios..."
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos los roles</option>
                  {settings.roles.map((rol) => (
                    <option key={rol.id} value={rol.name}>
                      {rol.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCrearUsuario} className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Nuevo Usuario</span>
              </Button>
            </div>

            {/* Lista de usuarios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {usuariosFiltrados.map((usuario) => (
                <Card key={usuario.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{usuario.name}</h3>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant={usuario.isActive ? 'default' : 'secondary'}>
                        {usuario.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield size={14} className="mr-2" />
                      <span>{usuario.role}</span>
                    </div>
                    {usuario.department && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building size={14} className="mr-2" />
                        <span>{usuario.department}</span>
                      </div>
                    )}
                    {usuario.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone size={14} className="mr-2" />
                        <span>{usuario.phone}</span>
                      </div>
                    )}
                    {usuario.lastLogin && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2" />
                        <span>Último acceso: {usuario.lastLogin.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarUsuario(usuario)}
                      className="flex-1"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEliminarUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">No se encontraron usuarios</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Controles */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Roles del Sistema
              </h2>
              <Button onClick={handleCrearRol} className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Nuevo Rol</span>
              </Button>
            </div>

            {/* Lista de roles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {settings.roles.map((rol) => (
                <Card key={rol.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rol.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rol.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">
                          {rol.userCount} usuarios
                        </Badge>
                        {rol.isSystemRole && (
                          <Badge variant="secondary">Sistema</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Permisos:</h4>
                    <div className="flex flex-wrap gap-1">
                      {rol.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarRol(rol)}
                      className="flex-1"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    {!rol.isSystemRole && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEliminarRol(rol.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderModal()}
    </div>
  )
}