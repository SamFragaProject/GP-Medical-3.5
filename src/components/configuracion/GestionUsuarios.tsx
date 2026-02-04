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

// =============================================
// ICONS & ASSETS (CLEAN BLUE)
// =============================================
const ICONO_MAP: Record<string, any> = {
  'Users': Users,
  'Shield': Shield,
  'Mail': Mail,
  'Phone': Phone,
  'Building': Building,
  'UserCheck': UserCheck,
  'UserX': UserX,
  'Key': Key,
  'Settings': Settings
}

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
            placeholder="juan.perez@GPMedical.com"
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
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.permissions.includes(permission.id)
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

  // Handlers
  const handleCrearUsuario = () => { setModalType('create-user'); setItemSeleccionado(null); setShowModal(true); }
  const handleEditarUsuario = (usuario: Usuario) => { setModalType('edit-user'); setItemSeleccionado(usuario); setShowModal(true); }
  const handleCrearRol = () => { setModalType('create-role'); setItemSeleccionado(null); setShowModal(true); }
  const handleEditarRol = (rol: Rol) => { setModalType('edit-role'); setItemSeleccionado(rol); setShowModal(true); }

  const handleGuardarUsuario = (data: UsuarioFormData) => {
    if (modalType === 'create-user') createUsuario(data)
    else if (modalType === 'edit-user' && itemSeleccionado) updateUsuario(itemSeleccionado.id, data)
    setShowModal(false)
  }

  const handleGuardarRol = (data: RolFormData) => {
    if (modalType === 'create-role') createRol({ ...data, userCount: 0 })
    else if (modalType === 'edit-role' && itemSeleccionado) updateRol(itemSeleccionado.id, data)
    setShowModal(false)
  }

  const handleEliminarUsuario = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) deleteUsuario(id)
  }

  const handleEliminarRol = (id: string) => {
    const usuariosConRol = settings.usuario.filter(u => u.role === (itemSeleccionado as Rol)?.name).length
    if (usuariosConRol > 0) {
      toast.error(`No se puede eliminar el rol. Hay ${usuariosConRol} usuarios asignados.`)
      return
    }
    if (confirm('¿Estás seguro de que quieres eliminar este rol?')) deleteRol(id)
  }

  const renderModal = () => {
    if (!showModal) return null
    const isUserModal = modalType === 'create-user' || modalType === 'edit-user'

    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <div className="p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                {isUserModal ? <Users className="w-5 h-5 text-white" /> : <Shield className="w-5 h-5 text-white" />}
              </div>
              {isUserModal
                ? (modalType === 'create-user' ? 'Desplegar Nuevo Usuario' : 'Actualizar Credenciales')
                : (modalType === 'create-role' ? 'Configurar Perfil Operativo' : 'Editar Estructura de Rol')
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
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50/30 p-2 rounded-[3rem]">
      {/* Master Header Clean Blue */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
              SISTEMA DE SEGURIDAD CORE
            </Badge>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Arquitectura de Usuarios</h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Control de acceso centralizado y gestión de identidades corporativas para el ecosistema GPMedical.
          </p>
        </div>
      </div>

      {/* Tabs de Alta Fidelidad */}
      <div className="px-4">
        <div className="flex p-1.5 bg-slate-200/50 rounded-[2rem] w-full md:w-fit border border-slate-100 backdrop-blur-sm">
          {[
            { id: 'usuarios', label: 'Estructura Humana', count: settings.usuario.length, icon: Users },
            { id: 'roles', label: 'Perfiles Operativos', count: settings.roles.length, icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500
                ${vistaActiva === tab.id
                  ? 'bg-white text-slate-900 shadow-xl shadow-blue-900/5 ring-1 ring-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${vistaActiva === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.label}
              <Badge className={`ml-2 border-none font-mono ${vistaActiva === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {vistaActiva === 'usuarios' ? (
          <motion.div
            key="usuarios"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 px-4"
          >
            {/* Toolbar Principal */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por identidad..."
                    className="pl-14 pr-6 py-4 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all border-none ring-1 ring-slate-100 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div className="relative w-full md:w-60">
                  <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 border-none ring-1 ring-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-[11px] font-black uppercase tracking-widest bg-slate-50/50 appearance-none text-slate-600"
                  >
                    <option value="">Todos los Roles</option>
                    {settings.roles.map((rol) => (
                      <option key={rol.id} value={rol.name}>{rol.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCrearUsuario}
                className="w-full lg:w-auto px-8 py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                Registrar Identidad
              </button>
            </div>

            {/* Grid de Usuarios Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {usuariosFiltrados.map((usuario) => (
                <motion.div
                  key={usuario.id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6">
                        <Users size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">{usuario.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{usuario.email}</p>
                      </div>
                    </div>
                    <Badge className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none ${usuario.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {usuario.isActive ? 'ACTIVO' : 'SITIO DOWN'}
                    </Badge>
                  </div>

                  <div className="space-y-4 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 group-hover:bg-white transition-colors relative z-10">
                    <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-600">
                      <Shield size={16} className="mr-3 text-blue-500 stroke-[3]" />
                      <span>{usuario.role}</span>
                    </div>
                    {usuario.department && (
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <Building size={16} className="mr-3 text-slate-300" />
                        <span>{usuario.department}</span>
                      </div>
                    )}
                    {usuario.phone && (
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <Phone size={16} className="mr-3 text-slate-300" />
                        <span>{usuario.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50 relative z-10">
                    <button
                      onClick={() => handleEditarUsuario(usuario)}
                      className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit size={14} className="stroke-[3]" />
                      Editar
                    </button>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <button
                      onClick={() => handleEliminarUsuario(usuario.id)}
                      className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} className="stroke-[3]" />
                      Baja
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                  <UserX className="h-12 w-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identidad no detectada</h3>
                <p className="mt-2 text-slate-400 font-medium max-w-sm">No se encontraron registros activos bajo estos parámetros de filtrado.</p>
                <button onClick={() => { setBusqueda(''); setFiltroRol('') }} className="mt-8 text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest underline decoration-2 underline-offset-8 transition-all">Limpiar Protocolo de Búsqueda</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 px-4"
          >
            {/* Header de Sección Roles */}
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-5 ml-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Shield className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Perfiles de Permisos</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Estructura jerárquica de GPMedical</p>
                </div>
              </div>
              <button
                onClick={handleCrearRol}
                className="px-8 py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
              >
                <Plus size={18} className="stroke-[3]" />
                Alta de Perfil
              </button>
            </div>

            {/* Grid de Roles Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {settings.roles.map((rol) => (
                <div key={rol.id} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-50 group-hover:scale-150"></div>

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{rol.name}</h3>
                        {rol.isSystemRole && (
                          <Badge className="bg-slate-900 text-white border-none text-[9px] font-black uppercase tracking-widest">SISTEMA CORE</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 line-clamp-2 max-w-sm">{rol.description}</p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-none flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black">
                      <Users className="w-3 h-3" />
                      {rol.userCount} USUARIOS
                    </Badge>
                  </div>

                  <div className="mb-10 relative z-10">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Privilegios de Acceso Activos</h4>
                    <div className="flex flex-wrap gap-2">
                      {rol.permissions.map((permission) => (
                        <div key={permission} className="flex items-center px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100 group-hover:bg-white group-hover:border-blue-100 group-hover:text-blue-600 transition-all">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shadow-sm shadow-blue-500/50"></span>
                          {permission}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-8 border-t border-slate-50 relative z-10">
                    <button
                      onClick={() => handleEditarRol(rol)}
                      className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-50 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                    >
                      <Edit size={16} className="stroke-[3]" />
                      Configurar
                    </button>
                    {!rol.isSystemRole && (
                      <button
                        onClick={() => handleEliminarRol(rol.id)}
                        className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderModal()}
    </div>
  )
}
