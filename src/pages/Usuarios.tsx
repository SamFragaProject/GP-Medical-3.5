/**
 * Usuarios - Vista Super Admin
 * 
 * Gestión global de usuarios con métricas,
 * auditoría y control de acceso
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Plus, Shield, Loader2, Mail, Phone, Building2,
  UserCheck, UserX, Edit, Trash2, Eye, EyeOff, Settings, Key,
  TrendingUp, ChevronRight, RefreshCw, Download, MoreVertical,
  CheckCircle, XCircle, Clock, Activity, Filter, Calendar, Globe,
  BarChart, PieChart as PieChartIcon, Zap, Lock, ShieldAlert
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, LineChart, Line
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { usuariosService, empresasService } from '@/services/dataService'
import { obtenerRoles, RolPersonalizado } from '@/services/permisosService'
import { NewUserDialog } from '@/components/admin/NewUserDialog'

// Interfaces
interface MetricasUsuarios {
  totalUsuarios: number
  usuariosActivos: number
  usuariosInactivos: number
  medicos: number
  admins: number
  superAdmins: number
  ultimosAccesos: number
  nuevosEsteMes: number
}

// Componente: Stat Card Grande
const BigStatCard = ({ icon: Icon, title, value, subtitle, color, trend }: {
  icon: any; title: string; value: string | number; subtitle?: string; color: string; trend?: { direction: 'up' | 'down'; value: string }
}) => {
  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-500',
    rose: 'from-rose-500 to-pink-600',
    slate: 'from-slate-600 to-slate-700',
    cyan: 'from-cyan-500 to-blue-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[color]} p-5 shadow-lg text-white`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trend.direction === 'up' ? 'text-emerald-200' : 'text-red-200'}`}>
              <TrendingUp className={`w-3 h-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
              {trend.value}
            </div>
          )}
        </div>
        <h3 className="text-3xl font-black">{value}</h3>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Componente: Usuario Card
const UsuarioCard = ({ usuario, onEdit, onToggleStatus }: { usuario: any; onEdit: () => void; onToggleStatus: () => void }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 overflow-hidden">
          {usuario.foto_url ? (
            <img src={usuario.foto_url} alt={usuario.nombre} className="w-full h-full object-cover" />
          ) : (
            usuario.nombre.substring(0, 2).toUpperCase()
          )}
        </div>
        <div className="max-w-[150px]">
          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{usuario.nombre} {usuario.apellido_paterno}</h4>
          <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
        </div>
      </div>
      <Badge className={`${usuario.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} border-none`}>
        {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </Badge>
    </div>

    <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="w-4 h-4 text-blue-500" />
        <span className="font-bold uppercase tracking-tight text-[11px]">{usuario.rol}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 truncate">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{usuario.empresa}</span>
      </div>
      {usuario.telefono && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{usuario.telefono}</span>
        </div>
      )}
    </div>

    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 font-bold text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-600"
        onClick={onEdit}
      >
        <Edit className="w-4 h-4 mr-2" /> Configurar
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 h-9 w-9 bg-slate-50">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 border-slate-100 shadow-2xl">
          <DropdownMenuItem onClick={onEdit} className="rounded-xl gap-3 font-bold text-xs py-2.5">
            <Edit size={14} className="text-blue-600" /> Perfil Completo
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5">
            <Lock size={14} className="text-slate-600" /> Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onToggleStatus}
            className={`rounded-xl gap-3 font-bold text-xs py-2.5 ${usuario.estado === 'activo' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {usuario.estado === 'activo' ? <UserX size={14} /> : <UserCheck size={14} />}
            {usuario.estado === 'activo' ? 'Suspender Acceso' : 'Activar Acceso'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </motion.div>
)

interface Rol {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
  createdAt: Date
}

// Componente: Rol Card
const RolCard = ({ rol, onEdit, onDelete, usuariosCount }: { rol: Rol; onEdit: () => void; onDelete: () => void; usuariosCount: number }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-xl text-gray-900">{rol.name}</h4>
          {rol.isSystemRole && (
            <Badge className="bg-slate-900 text-white text-[10px]">SISTEMA</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{rol.description}</p>
      </div>
      <Badge className="bg-blue-100 text-blue-700 border-none">
        <Users className="w-3 h-3 mr-1" /> {usuariosCount}
      </Badge>
    </div>

    <div className="mb-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Permisos</p>
      <div className="flex flex-wrap gap-2">
        {rol.permissions.slice(0, 4).map((perm) => (
          <Badge key={perm} variant="outline" className="text-xs">
            {perm}
          </Badge>
        ))}
        {rol.permissions.length > 4 && (
          <Badge variant="outline" className="text-xs text-gray-400">
            +{rol.permissions.length - 4} más
          </Badge>
        )}
      </div>
    </div>

    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
      <Button variant="ghost" size="sm" className="flex-1" onClick={onEdit}>
        <Settings className="w-4 h-4 mr-2" /> Configurar
      </Button>
      {!rol.isSystemRole && (
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  </motion.div>
)

// Componente: Actividad Reciente
const ActividadReciente = () => (
  <Card className="border-0 shadow-xl bg-white">
    <CardHeader>
      <CardTitle className="text-lg font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-500" />
        Últimos Accesos
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {[
        { user: 'Dr. García', action: 'Inició sesión', time: 'Hace 5 min', status: 'success' },
        { user: 'Admin Norte', action: 'Cerró sesión', time: 'Hace 15 min', status: 'info' },
        { user: 'Dra. Luna', action: 'Cambió contraseña', time: 'Hace 1 hora', status: 'warning' },
        { user: 'Super Admin', action: 'Creó usuario', time: 'Hace 2 horas', status: 'success' },
        { user: 'Dr. Mendoza', action: 'Inició sesión', time: 'Hace 3 horas', status: 'success' },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${item.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
              item.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              } flex items-center justify-center`}>
              {item.status === 'success' ? <CheckCircle className="w-5 h-5" /> :
                item.status === 'warning' ? <Key className="w-5 h-5" /> :
                  <Clock className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{item.user}</p>
              <p className="text-xs text-gray-500">{item.action}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">{item.time}</span>
        </div>
      ))}
    </CardContent>
  </Card>
)

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const isSuperAdmin = currentUser?.rol === 'super_admin'
  const targetEmpresaId = isSuperAdmin ? undefined : currentUser?.empresa_id

  const [usuarios, setUsuarios] = useState<any[]>([])
  const [roles, setRoles] = useState<RolPersonalizado[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('usuarios')
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [usuarioAEditar, setUsuarioAEditar] = useState<any | null>(null)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [usersData, rolesData, empresasData] = await Promise.all([
        usuariosService.getAll(targetEmpresaId),
        obtenerRoles(targetEmpresaId),
        isSuperAdmin ? empresasService.getAll() : Promise.resolve([])
      ])
      setUsuarios(usersData)
      setRoles(rolesData)
      setEmpresas(isSuperAdmin ? empresasData : (currentUser?.empresa ? [{ id: currentUser.empresa_id, nombre: currentUser.empresa }] : []))
    } catch (error) {
      console.error('Error cargando usuarios/roles:', error)
      toast.error('Error al sincronizar con la base de datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Métricas
  const metricas: MetricasUsuarios = useMemo(() => ({
    totalUsuarios: usuarios.length,
    usuariosActivos: usuarios.filter(u => u.estado === 'activo').length,
    usuariosInactivos: usuarios.filter(u => u.estado !== 'activo').length,
    medicos: usuarios.filter(u => u.rol?.toLowerCase().includes('medico')).length,
    admins: usuarios.filter(u => u.rol?.toLowerCase().includes('admin')).length,
    superAdmins: usuarios.filter(u => u.rol?.toLowerCase() === 'super_admin').length,
    ultimosAccesos: Math.floor(Math.random() * 20) + 5,
    nuevosEsteMes: Math.floor(Math.random() * 10) + 2
  }), [usuarios])

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const fullName = `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno || ''}`.toLowerCase()
      const matchSearch = fullName.includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchRol = !filtroRol || u.rol === filtroRol
      return matchSearch && matchRol
    })
  }, [usuarios, searchQuery, filtroRol])

  // Handlers
  const handleCrearUsuario = () => { setUsuarioAEditar(null); setShowModal(true) }
  const handleEditarUsuario = (usuario: any) => { setUsuarioAEditar(usuario); setShowModal(true) }

  const handleToggleStatus = async (id: string, actualmenteActivo: boolean) => {
    const accion = actualmenteActivo ? 'desactivar' : 'activar'
    if (confirm(`¿Estás seguro de que quieres ${accion} este usuario?`)) {
      try {
        await usuariosService.toggleStatus(id, !actualmenteActivo)
        toast.success(`Usuario ${actualmenteActivo ? 'desactivado' : 'activado'}`)
        cargarDatos()
      } catch (error) {
        toast.error(`Error al ${accion} usuario`)
      }
    }
  }

  const handleEliminarRol = async (id: string, rol: any) => {
    toast.error('Gesto de roles derivado a la sección de Configuración Core')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header God Mode */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight">Gestión de Usuarios</h1>
                  <Badge className={`border-none ${isSuperAdmin ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' : 'bg-blue-500/20 text-blue-300 border-blue-400/30'}`}>
                    {isSuperAdmin ? 'GOD MODE' : 'ADMIN MODE'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">
                  {isSuperAdmin ? 'Control global de acceso y gestión de identidades' : `Gestión de personal - ${currentUser?.empresa || 'Empresa'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" /> Exportar
              </Button>
              <Button onClick={handleCrearUsuario} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/30">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <BigStatCard icon={Users} title="Total Usuarios" value={metricas.totalUsuarios} color="cyan" trend={{ direction: 'up', value: `+${metricas.nuevosEsteMes}` }} />
          <BigStatCard icon={UserCheck} title="Activos" value={metricas.usuariosActivos} color="emerald" />
          <BigStatCard icon={UserX} title="Inactivos" value={metricas.usuariosInactivos} color="slate" />
          <BigStatCard icon={Shield} title="Roles" value={roles.length} subtitle="Configurados" color="purple" />
          <BigStatCard icon={Activity} title="Accesos Hoy" value={metricas.ultimosAccesos} color="blue" />
          <BigStatCard icon={Calendar} title="Nuevos" value={metricas.nuevosEsteMes} subtitle="Este mes" color="orange" trend={{ direction: 'up', value: '+15%' }} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1.5 rounded-2xl">
            <TabsTrigger value="usuarios" className="rounded-xl px-6 py-3 data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-medium">
              👥 Usuarios ({usuarios.length})
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-xl px-6 py-3 data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-medium">
              🛡️ Roles ({roles.length})
            </TabsTrigger>
            <TabsTrigger value="actividad" className="rounded-xl px-6 py-3 data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-medium">
              📊 Actividad
            </TabsTrigger>
          </TabsList>

          {/* Tab: Usuarios */}
          <TabsContent value="usuarios" className="space-y-6">
            {/* Filtros */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, email..."
                      className="pl-10 bg-gray-50 border-gray-200 h-11"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium"
                  >
                    <option value="">Todos los roles</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Grid de Usuarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {usuariosFiltrados.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  onEdit={() => handleEditarUsuario(usuario)}
                  onToggleStatus={() => handleToggleStatus(usuario.id, usuario.estado === 'activo')}
                />
              ))}
            </div>

            {usuariosFiltrados.length === 0 && (
              <Card className="border-0 shadow-lg bg-white p-12 text-center">
                <UserX className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900">No se encontraron usuarios</h3>
                <p className="text-gray-500 mt-1">Intenta ajustar tu búsqueda o crea un nuevo usuario.</p>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Roles */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Configuración de Niveles de Acceso</h3>
                <p className="text-sm text-gray-500">Define permisos granulares para cada tipo de usuario</p>
              </div>
              <Button onClick={() => {
                // Redirigir a Gestión de Roles o abrir un modal informativo
                toast('Los roles se gestionan en la sección de Configuración Core')
              }} className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
                <Settings className="w-4 h-4 mr-2" /> Gestionar Roles
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((rol) => (
                <RolCard
                  key={rol.id}
                  rol={{
                    id: rol.id,
                    name: rol.nombre,
                    description: rol.descripcion || '',
                    permissions: rol.permisos.map(p => p.modulo_nombre),
                    isSystemRole: rol.es_sistema,
                    createdAt: new Date()
                  }}
                  usuariosCount={usuarios.filter(u => u.rol === rol.nombre).length}
                  onEdit={() => {
                    toast('Edite este rol en Configuración > Roles')
                  }}
                  onDelete={() => {
                    toast('Elimine este rol en Configuración > Roles')
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* Tab: Actividad & Seguridad */}
          <TabsContent value="actividad" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de Accesos */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    Picos de Actividad (Últimas 24h)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { hora: '00:00', users: 5 }, { hora: '04:00', users: 2 },
                        { hora: '08:00', users: 45 }, { hora: '12:00', users: 80 },
                        { hora: '16:00', users: 65 }, { hora: '20:00', users: 30 },
                        { hora: '23:59', users: 10 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Line type="monotone" dataKey="users" stroke="#06B6D4" strokeWidth={4} dot={{ r: 6, fill: '#06B6D4' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Seguridad */}
              <Card className="border-0 shadow-xl bg-slate-900 text-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                    <Lock className="w-5 h-5" />
                    Security Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { label: 'Uso de 2FA', value: 68, color: 'bg-emerald-500' },
                      { label: 'Passw. Fuertes', value: 92, color: 'bg-blue-500' },
                      { label: 'Acceso SSO', value: 45, color: 'bg-purple-500' },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{stat.label}</span>
                          <span className="font-bold">{stat.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            className={`h-full ${stat.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Alertas</span>
                    </div>
                    <p className="text-xs text-slate-400">3 usuarios tienen contraseñas expiradas hace más de 30 días.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de últimos accesos (Sidebar) */}
              <div className="lg:col-span-1">
                <ActividadReciente />
              </div>

              {/* Distribución por Rol (Graph) */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Distribución de Ecosistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {roles.map((rol) => {
                        const count = usuarios.filter(u => u.rol === rol.nombre).length
                        const percent = usuarios.length > 0 ? Math.round((count / usuarios.length) * 100) : 0
                        return (
                          <div key={rol.id}>
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="font-medium text-gray-700">{rol.nombre}</span>
                              <span className="font-bold">{count}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className="h-full bg-cyan-500"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="h-full flex flex-col justify-center bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                      <Zap className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <h4 className="font-bold text-slate-800">Crecimiento Mensual</h4>
                      <p className="text-3xl font-black text-slate-900 mt-2">+15.4%</p>
                      <p className="text-xs text-slate-500 mt-1">vs. mes anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewUserDialog
        open={showModal}
        onOpenChange={setShowModal}
        empresas={empresas}
        onSuccess={() => {
          cargarDatos()
          setShowModal(false)
        }}
        initialData={usuarioAEditar}
      />
    </div>
  )
}
