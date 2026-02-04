import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  UserX,
  Building2,
  Filter,
  Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '@/types/auth'
import type { UserRole } from '@/types/auth'
import { NewUserDialog } from '@/components/admin/NewUserDialog'
import { usuariosService, empresasService } from '@/services/dataService'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'

interface Usuario {
  id: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  rol: UserRole
  empresa: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  foto_url?: string
  telefono?: string
  last_login?: string
  created_at: string
}

const ESTADO_COLORS = {
  activo: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  inactivo: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
  suspendido: { bg: 'bg-red-100', text: 'text-red-700', icon: UserX }
}

export function UsuariosEmpresa() {
  const { user, checkPermission } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRol, setFilterRol] = useState<'all' | UserRole>('all')
  const [filterEstado, setFilterEstado] = useState<'all' | 'activo' | 'inactivo' | 'suspendido'>('all')
  const [filterEmpresa, setFilterEmpresa] = useState<string>('all')
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)

  // State for companies dropdown in NewUserDialog (though NewUserDialog might fetch it internally or satisfy prop)
  // Actually NewUserDialog usually takes 'empresas' prop if it's not fetching internally.
  // Let's implement basics.
  const [empresasOptions, setEmpresasOptions] = useState<{ id: string, nombre: string }[]>([])

  if (!user) return null

  const canManage = checkPermission('usuarios', 'update')

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const data = await usuariosService.getAll()
      // Map to UI interface
      const mapped: Usuario[] = data.map((u: any) => ({
        id: u.id,
        nombre: u.nombre || '',
        apellido_paterno: u.apellido_paterno || '',
        apellido_materno: u.apellido_materno || '',
        email: u.email || '',
        rol: (u.rol as UserRole) || 'paciente',
        empresa: u.empresa || 'Sin Empresa', // mapped in service
        estado: 'activo', // Default for now, as Supabase Auth status isn't directly in profiles yet usually
        telefono: u.telefono,
        created_at: u.created_at,
        foto_url: u.avatar_url
      }))
      setUsuarios(mapped)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmpresas = async () => {
    try {
      const data = await empresasService.getAll()
      setEmpresasOptions(data.map((e: any) => ({ id: e.id, nombre: e.nombre })))
    } catch (error) {
      console.error('Error fetching empresas options', error)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchEmpresas()
  }, [])

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellido_paterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRol = filterRol === 'all' || u.rol === filterRol
    const matchesEstado = filterEstado === 'all' || u.estado === filterEstado
    const matchesEmpresa = filterEmpresa === 'all' || u.empresa === filterEmpresa
    return matchesSearch && matchesRol && matchesEstado && matchesEmpresa
  })

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setIsNewUserDialogOpen(true)
  }

  const handleToggleStatus = async (usuario: Usuario) => {
    const nuevoEstado = usuario.estado !== 'activo' // Toggle logic
    const confirmMessage = nuevoEstado
      ? `¿Reactivar al usuario ${usuario.nombre}?`
      : `¿Suspender al usuario ${usuario.nombre}? Perderá acceso al sistema.`

    if (!window.confirm(confirmMessage)) return

    try {
      await usuariosService.toggleStatus(usuario.id, nuevoEstado)
      toast.success(nuevoEstado ? 'Usuario reactivado' : 'Usuario suspendido')
      fetchUsuarios()
    } catch (error) {
      toast.error('Error al cambiar estado')
      console.error(error)
    }
  }

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
    suspendidos: usuarios.filter(u => u.estado === 'suspendido').length
  }

  return (
    <div className="space-y-6">
      {/* Dialog de Crear Usuario */}
      <NewUserDialog
        open={isNewUserDialogOpen}
        onOpenChange={(open) => {
          setIsNewUserDialogOpen(open)
          if (!open) setSelectedUser(null)
        }}
        onSuccess={() => {
          fetchUsuarios()
          setSelectedUser(null)
        }}
        empresas={empresasOptions.length > 0 ? empresasOptions : [{ id: '1', nombre: 'Cargando...' }]}
        initialData={selectedUser}
      />

      <PremiumPageHeader
        title="Gestión de Capital Humano"
        subtitle="Control centralizado de identidades, roles y accesos corporativos del sistema."
        icon={Users}
        badge="ACTIVE DIRECTORY"
        actions={
          canManage && (
            <Button
              variant="premium"
              onClick={() => {
                setSelectedUser(null)
                setIsNewUserDialogOpen(true)
              }}
              className="h-11 px-6 shadow-xl shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Colaborador
            </Button>
          )
        }
      />

      {/* Permission Warning */}
      {!canManage && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Tu rol ({ROLE_LABELS[user.rol]}) solo permite visualización de usuarios. No puedes editar ni eliminar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Usuarios', value: stats.total, icon: Users, color: 'emerald', glow: 'stat-glow-emerald' },
          { label: 'Activos', value: stats.activos, icon: CheckCircle, color: 'teal', glow: 'stat-glow-emerald' },
          { label: 'Inactivos', value: stats.inactivos, icon: XCircle, color: 'slate', glow: 'shadow-sm' },
          { label: 'Suspendidos', value: stats.suspendidos, icon: UserX, color: 'rose', glow: 'stat-glow-rose' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card rounded-3xl p-6 border border-white/40 ${stat.glow}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-600 border border-${stat.color}-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm space-y-6">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Filtrar por nombre, correo electrónico o ID..."
            className="pl-12 h-12 bg-white/50 border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all rounded-2xl font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrar por Rol:</span>
            <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-200">
              <button
                onClick={() => setFilterRol('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterRol === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-500'}`}
              >
                Todos
              </button>
              {(['super_admin', 'admin_empresa', 'medico', 'paciente'] as UserRole[]).map(rol => (
                <button
                  key={rol}
                  onClick={() => setFilterRol(rol)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterRol === rol ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-500'}`}
                >
                  {ROLE_LABELS[rol]}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa:</span>
            <select
              className="h-10 text-xs font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 px-4 bg-white/50 outline-none transition-all cursor-pointer"
              value={filterEmpresa}
              onChange={(e) => setFilterEmpresa(e.target.value)}
            >
              <option value="all">Empresas Corporativas (Todas)</option>
              {empresasOptions.map(e => (
                <option key={e.id} value={e.nombre}>{e.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredUsuarios.map((usuario, index) => {
            const EstadoIcon = ESTADO_COLORS[usuario.estado].icon
            const estadoColor = ESTADO_COLORS[usuario.estado]

            return (
              <motion.div
                key={usuario.id}
                layoutId={`usuario-${usuario.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="glass-card rounded-[2rem] border border-white/40 shadow-xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-all" />

                  <div className="flex items-start gap-4 mb-6 relative z-10">
                    <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-md">
                      <AvatarImage src={usuario.foto_url} />
                      <AvatarFallback className={`${ROLE_COLORS[usuario.rol]} text-white font-black text-xl`}>
                        {usuario.nombre?.[0]}{usuario.apellido_paterno?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-slate-800 tracking-tight truncate leading-tight">
                        {usuario.nombre} {usuario.apellido_paterno}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium truncate mb-2">{usuario.email}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="premium" className="text-[9px] px-2 py-0.5 font-black uppercase tracking-widest">
                          {ROLE_LABELS[usuario.rol]}
                        </Badge>
                        <Badge variant={usuario.estado === 'activo' ? 'success' : 'destructive'} className="text-[9px] px-2 py-0.5 font-black uppercase tracking-widest flex items-center gap-1">
                          <EstadoIcon className="w-2 h-2" />
                          {usuario.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span className="truncate">{usuario.empresa}</span>
                    </div>
                    {usuario.telefono && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 px-3">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{usuario.telefono}</span>
                      </div>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex gap-2 relative z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl h-10 font-bold border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                        onClick={() => handleEdit(usuario)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Editar
                      </Button>
                      <button
                        className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${usuario.estado === 'activo'
                          ? 'border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200'
                          : 'border-emerald-100 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                        onClick={() => handleToggleStatus(usuario)}
                        title={usuario.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                      >
                        {usuario.estado === 'activo' ? <UserX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  )
}
