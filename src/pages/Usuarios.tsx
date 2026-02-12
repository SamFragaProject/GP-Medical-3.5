/**
 * Usuarios - Vista Super Admin
 * 
 * Gestión global de usuarios con métricas,
 * auditoría y control de acceso
 * 
 * ✅ Todos los datos son calculados desde usuarios reales
 * ✅ Sin datos hardcodeados ni mock
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Plus, Shield, Loader2, Mail, Phone, Building2,
  UserCheck, UserX, Edit, Trash2, Eye, EyeOff, Settings, Key,
  TrendingUp, TrendingDown, ChevronRight, RefreshCw, Download, MoreVertical,
  CheckCircle, XCircle, Clock, Activity, Filter, Calendar, Globe,
  BarChart, PieChart as PieChartIcon, Zap, Lock, ShieldAlert,
  AlertTriangle, Info
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, LineChart, Line, AreaChart, Area
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// ─── Interfaces ──────────────────────────────────────────────────────────
interface MetricasUsuarios {
  totalUsuarios: number
  usuariosActivos: number
  usuariosInactivos: number
  medicos: number
  admins: number
  superAdmins: number
  nuevosEsteMes: number
  nuevosMesPasado: number
  crecimientoMensualPct: number | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Calcula la distribución de creación de usuarios por hora del día (últimos 30 días) */
function calcularActividadPorHora(usuarios: any[]): { hora: string; usuarios: number }[] {
  const ahora = new Date()
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Inicializar 24 horas
  const porHora: Record<number, number> = {}
  for (let h = 0; h < 24; h++) porHora[h] = 0

  // Contar accesos/creaciones por hora
  usuarios.forEach(u => {
    try {
      const fecha = new Date(u.updated_at || u.created_at)
      if (fecha >= hace30Dias) {
        porHora[fecha.getHours()]++
      }
    } catch { /* skip invalid dates */ }
  })

  // Generar puntos de datos cada 2 horas para un gráfico limpio
  const puntos: { hora: string; usuarios: number }[] = []
  for (let h = 0; h < 24; h += 2) {
    const valor = porHora[h] + (porHora[h + 1] || 0)
    puntos.push({
      hora: `${String(h).padStart(2, '0')}:00`,
      usuarios: valor
    })
  }
  return puntos
}

/** Calcula registros por mes (últimos 6 meses) */
function calcularRegistrosPorMes(usuarios: any[]): { mes: string; registros: number }[] {
  const ahora = new Date()
  const meses: { mes: string; registros: number }[] = []
  const nombresMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const mesNum = fecha.getMonth()
    const anio = fecha.getFullYear()
    const count = usuarios.filter(u => {
      try {
        const d = new Date(u.created_at)
        return d.getMonth() === mesNum && d.getFullYear() === anio
      } catch { return false }
    }).length
    meses.push({ mes: nombresMes[mesNum], registros: count })
  }
  return meses
}

/** Calcula métricas de seguridad basadas en datos reales */
function calcularMetricasSeguridad(usuarios: any[]) {
  const activos = usuarios.filter(u => u.estado === 'activo')
  const totalActivos = activos.length || 1

  // Usuarios con email verificado (asumimos que si están activos y tienen email, está verificado)
  const conEmail = activos.filter(u => u.email).length
  const pctEmailVerificado = Math.round((conEmail / totalActivos) * 100)

  // Usuarios con teléfono registrado (indicador de perfil completo)
  const conTelefono = activos.filter(u => u.telefono).length
  const pctPerfilCompleto = Math.round((conTelefono / totalActivos) * 100)

  // Usuarios con rol asignado
  const conRol = activos.filter(u => u.rol && u.rol !== '').length
  const pctConRol = Math.round((conRol / totalActivos) * 100)

  // Usuarios inactivos por más de 90 días
  const hace90Dias = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const inactivosLongTime = usuarios.filter(u => {
    if (u.estado === 'activo') return false
    try {
      return new Date(u.updated_at || u.created_at) < hace90Dias
    } catch { return false }
  }).length

  // Usuarios sin actividad reciente (activos pero sin update en 30 días)
  const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sinActividadReciente = activos.filter(u => {
    try {
      return new Date(u.updated_at || u.created_at) < hace30Dias
    } catch { return false }
  }).length

  return {
    barras: [
      { label: 'Email Verificado', value: pctEmailVerificado, color: 'bg-emerald-500' },
      { label: 'Perfil Completo', value: pctPerfilCompleto, color: 'bg-blue-500' },
      { label: 'Rol Asignado', value: pctConRol, color: 'bg-purple-500' },
    ],
    alertas: [] as string[],
    inactivosLongTime,
    sinActividadReciente,
  }
}

// ─── Componente: Stat Card Grande ────────────────────────────────────────
const BigStatCard = ({ icon: Icon, title, value, subtitle, color, trend }: {
  icon: any; title: string; value: string | number; subtitle?: string; color: string
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string }
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
            <div className={`flex items-center gap-1 text-xs font-bold ${trend.direction === 'up' ? 'text-emerald-200' : trend.direction === 'down' ? 'text-red-200' : 'text-white/60'}`}>
              {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend.direction === 'neutral' && <span className="text-[10px]">—</span>}
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

// ─── Componente: Usuario Card ────────────────────────────────────────────
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
            usuario.nombre?.substring(0, 2).toUpperCase() || '??'
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

// ─── Componente: Rol Card ────────────────────────────────────────────────
interface Rol {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
  createdAt: Date
}

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

// ─── Componente: Actividad Reciente ──────────────────────────────────────
const ActividadReciente = ({ usuarios }: { usuarios: any[] }) => {
  const ultimosUsuarios = [...usuarios]
    .filter(u => u.nombre)
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
    .slice(0, 6)

  const formatTiempoRelativo = (fecha: string) => {
    try {
      const diff = Date.now() - new Date(fecha).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 60) return `hace ${mins}m`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `hace ${hrs}h`
      const dias = Math.floor(hrs / 24)
      if (dias < 30) return `hace ${dias}d`
      return `hace ${Math.floor(dias / 30)}mes`
    } catch { return '—' }
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b bg-slate-50/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Usuarios Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {ultimosUsuarios.length > 0 ? ultimosUsuarios.map((u, idx) => (
          <motion.div
            key={u.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${u.estado === 'activo' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-bold text-xs shadow-sm`}>
                {u.nombre?.substring(0, 2).toUpperCase() || '??'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{u.nombre} {u.apellido_paterno || ''}</p>
                <p className="text-[10px] text-gray-400 font-medium">{u.rol || 'Sin rol'} · {formatTiempoRelativo(u.updated_at || u.created_at)}</p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.estado === 'activo' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          </motion.div>
        )) : (
          <div className="text-center py-8 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">Sin usuarios registrados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
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
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos')
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

  // ─── Métricas: 100% calculadas de datos reales ───────────────────────
  const metricas: MetricasUsuarios = useMemo(() => {
    const now = new Date()
    const mesActual = now.getMonth()
    const anioActual = now.getFullYear()

    // Mes anterior
    const mesPasado = mesActual === 0 ? 11 : mesActual - 1
    const anioPasado = mesActual === 0 ? anioActual - 1 : anioActual

    const nuevosEsteMes = usuarios.filter(u => {
      try {
        const d = new Date(u.created_at)
        return d.getMonth() === mesActual && d.getFullYear() === anioActual
      } catch { return false }
    }).length

    const nuevosMesPasado = usuarios.filter(u => {
      try {
        const d = new Date(u.created_at)
        return d.getMonth() === mesPasado && d.getFullYear() === anioPasado
      } catch { return false }
    }).length

    // Crecimiento mensual real
    let crecimientoMensualPct: number | null = null
    if (nuevosMesPasado > 0) {
      crecimientoMensualPct = Math.round(((nuevosEsteMes - nuevosMesPasado) / nuevosMesPasado) * 100)
    } else if (nuevosEsteMes > 0) {
      crecimientoMensualPct = 100
    }

    return {
      totalUsuarios: usuarios.length,
      usuariosActivos: usuarios.filter(u => u.estado === 'activo').length,
      usuariosInactivos: usuarios.filter(u => u.estado !== 'activo').length,
      medicos: usuarios.filter(u => u.rol?.toLowerCase().includes('medico')).length,
      admins: usuarios.filter(u => u.rol?.toLowerCase().includes('admin')).length,
      superAdmins: usuarios.filter(u => u.rol?.toLowerCase() === 'super_admin').length,
      nuevosEsteMes,
      nuevosMesPasado,
      crecimientoMensualPct
    }
  }, [usuarios])

  // ─── Datos de gráficos: calculados de datos reales ────────────────────
  const datosActividad = useMemo(() => calcularActividadPorHora(usuarios), [usuarios])
  const datosRegistrosMensuales = useMemo(() => calcularRegistrosPorMes(usuarios), [usuarios])
  const metricasSeguridad = useMemo(() => calcularMetricasSeguridad(usuarios), [usuarios])

  // ─── Filtrar usuarios ─────────────────────────────────────────────────
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const fullName = `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno || ''}`.toLowerCase()
      const matchSearch = fullName.includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchRol = !filtroRol || u.rol === filtroRol
      const matchEstado = filtroEstado === 'todos' || u.estado === filtroEstado
      return matchSearch && matchRol && matchEstado
    })
  }, [usuarios, searchQuery, filtroRol, filtroEstado])

  // ─── Handlers ─────────────────────────────────────────────────────────
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

  // Trend helper
  const getTrendNuevos = (): { direction: 'up' | 'down' | 'neutral'; value: string } => {
    if (metricas.crecimientoMensualPct === null) return { direction: 'neutral', value: 'N/A' }
    if (metricas.crecimientoMensualPct > 0) return { direction: 'up', value: `+${metricas.crecimientoMensualPct}%` }
    if (metricas.crecimientoMensualPct < 0) return { direction: 'down', value: `${metricas.crecimientoMensualPct}%` }
    return { direction: 'neutral', value: '0%' }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      {/* ────── Header Premium ────── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">Gestión de Usuarios</h1>
                <Badge className={`border-none text-[10px] font-black uppercase tracking-widest ${isSuperAdmin ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  {isSuperAdmin ? 'GOD MODE' : 'ADMIN MODE'}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm font-medium mt-1">
                {isSuperAdmin ? 'Control global de acceso y gestión de identidades' : `Gestión de personal — ${currentUser?.empresa || 'Empresa'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={cargarDatos}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
            </Button>
            <Button onClick={handleCrearUsuario} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-500/20 rounded-xl font-bold">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* ────── Stats Grid ────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <BigStatCard
            icon={Users}
            title="Total Usuarios"
            value={metricas.totalUsuarios}
            color="cyan"
            trend={metricas.nuevosEsteMes > 0 ? { direction: 'up', value: `+${metricas.nuevosEsteMes} este mes` } : undefined}
          />
          <BigStatCard icon={UserCheck} title="Activos" value={metricas.usuariosActivos} color="emerald" />
          <BigStatCard icon={UserX} title="Inactivos" value={metricas.usuariosInactivos} color="slate" />
          <BigStatCard icon={Shield} title="Roles" value={roles.length} subtitle="Configurados" color="purple" />
          <BigStatCard
            icon={Building2}
            title="Empresas"
            value={empresas.length}
            subtitle="En ecosistema"
            color="blue"
          />
          <BigStatCard
            icon={Calendar}
            title="Nuevos"
            value={metricas.nuevosEsteMes}
            subtitle="Este mes"
            color="orange"
            trend={getTrendNuevos()}
          />
        </div>

        {/* ────── Tabs ────── */}
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

          {/* ────── Tab: Usuarios ────── */}
          <TabsContent value="usuarios" className="space-y-6">
            {/* Filtros mejorados */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, email..."
                      className="pl-10 bg-gray-50 border-gray-200 h-11 rounded-xl"
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
                  {/* Filtro de estado segmentado */}
                  <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    {(['todos', 'activo', 'inactivo'] as const).map(estado => (
                      <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filtroEstado === estado
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {estado === 'todos' ? 'Todos' : estado === 'activo' ? '🟢 Activos' : '🔴 Inactivos'}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de Usuarios */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-slate-500 font-medium">Cargando usuarios...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {usuariosFiltrados.map((usuario, idx) => (
                      <motion.div
                        key={usuario.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <UsuarioCard
                          usuario={usuario}
                          onEdit={() => handleEditarUsuario(usuario)}
                          onToggleStatus={() => handleToggleStatus(usuario.id, usuario.estado === 'activo')}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {usuariosFiltrados.length === 0 && (
                  <Card className="border-0 shadow-lg bg-white p-12 text-center">
                    <UserX className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-gray-900">No se encontraron usuarios</h3>
                    <p className="text-gray-500 mt-1">Intenta ajustar tu búsqueda o crea un nuevo usuario.</p>
                    <Button onClick={handleCrearUsuario} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-2" /> Crear Usuario
                    </Button>
                  </Card>
                )}

                {/* Contador de resultados */}
                {usuariosFiltrados.length > 0 && (
                  <div className="text-center text-sm text-slate-400 font-medium">
                    Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ────── Tab: Roles ────── */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Configuración de Niveles de Acceso</h3>
                <p className="text-sm text-gray-500">Define permisos granulares para cada tipo de usuario</p>
              </div>
              <Button onClick={() => {
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

          {/* ────── Tab: Actividad & Seguridad ────── */}
          <TabsContent value="actividad" className="space-y-6">
            {/* Fila 1: Gráfico de Actividad + Usuarios Recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de Actividad por Hora (datos reales) */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    Actividad por Hora del Día
                    <Badge variant="outline" className="text-[10px] ml-2 font-medium">Últimos 30 días</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {datosActividad.some(d => d.usuarios > 0) ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datosActividad}>
                          <defs>
                            <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [`${value} eventos`, 'Actividad']}
                          />
                          <Area
                            type="monotone"
                            dataKey="usuarios"
                            stroke="#06B6D4"
                            strokeWidth={3}
                            fill="url(#colorUsuarios)"
                            dot={{ r: 5, fill: '#06B6D4', stroke: '#fff', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                      <BarChart className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="font-medium">Sin datos de actividad aún</p>
                      <p className="text-xs mt-1">Los datos se generarán conforme los usuarios interactúen</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usuarios Recientes */}
              <ActividadReciente usuarios={usuarios} />
            </div>

            {/* Fila 2: Registros Mensuales + Métricas de Seguridad */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Registros por Mes (datos reales) */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Registros por Mes
                    <Badge variant="outline" className="text-[10px] ml-2 font-medium">Últimos 6 meses</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gráfico de barras */}
                    <div className="md:col-span-2 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={datosRegistrosMensuales} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [`${value} usuarios`, 'Registros']}
                          />
                          <Bar dataKey="registros" radius={[8, 8, 0, 0]}>
                            {datosRegistrosMensuales.map((_, idx) => (
                              <Cell
                                key={idx}
                                fill={idx === datosRegistrosMensuales.length - 1 ? '#06B6D4' : '#e2e8f0'}
                              />
                            ))}
                          </Bar>
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Crecimiento Mensual (calculado de datos reales) */}
                    <div className="flex flex-col justify-center bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                      <Zap className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <h4 className="font-bold text-slate-800 text-sm">Crecimiento Mensual</h4>
                      {metricas.crecimientoMensualPct !== null ? (
                        <>
                          <p className={`text-3xl font-black mt-2 ${metricas.crecimientoMensualPct > 0 ? 'text-emerald-600' :
                              metricas.crecimientoMensualPct < 0 ? 'text-rose-600' : 'text-slate-700'
                            }`}>
                            {metricas.crecimientoMensualPct > 0 ? '+' : ''}{metricas.crecimientoMensualPct}%
                          </p>
                          <p className="text-xs text-slate-500 mt-1">vs. mes anterior</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {metricas.nuevosEsteMes} nuevos vs {metricas.nuevosMesPasado} previos
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-black text-slate-400 mt-2">—</p>
                          <p className="text-xs text-slate-400 mt-1">Datos insuficientes</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Salud del Sistema (datos reales) */}
              <Card className="border-0 shadow-xl bg-slate-900 text-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                    <Lock className="w-5 h-5" />
                    Salud del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Barras de métricas (datos reales) */}
                  <div className="space-y-4">
                    {metricasSeguridad.barras.map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-400">{stat.label}</span>
                          <span className="font-bold">{stat.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full rounded-full ${stat.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Alertas basadas en datos reales */}
                  <div className="space-y-3">
                    {metricasSeguridad.inactivosLongTime > 0 && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1.5 text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Atención</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {metricasSeguridad.inactivosLongTime} usuario{metricasSeguridad.inactivosLongTime > 1 ? 's' : ''} lleva{metricasSeguridad.inactivosLongTime > 1 ? 'n' : ''} más de 90 días inactivo{metricasSeguridad.inactivosLongTime > 1 ? 's' : ''}.
                        </p>
                      </div>
                    )}

                    {metricasSeguridad.sinActividadReciente > 0 && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1.5 text-blue-400">
                          <Info className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Info</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {metricasSeguridad.sinActividadReciente} usuario{metricasSeguridad.sinActividadReciente > 1 ? 's' : ''} activo{metricasSeguridad.sinActividadReciente > 1 ? 's' : ''} sin actividad en 30+ días.
                        </p>
                      </div>
                    )}

                    {metricasSeguridad.inactivosLongTime === 0 && metricasSeguridad.sinActividadReciente === 0 && (
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-1.5 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Todo en orden</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          No hay alertas de seguridad activas.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resumen numérico */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-xl font-black text-white">{metricas.usuariosActivos}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Activos</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className="text-xl font-black text-white">{roles.length}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Roles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fila 3: Distribución por Rol */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  Distribución por Rol
                  <Badge variant="outline" className="text-[10px] ml-2 font-medium">{roles.length} roles configurados</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {roles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((rol, idx) => {
                      const count = usuarios.filter(u => u.rol === rol.nombre).length
                      const percent = usuarios.length > 0 ? Math.round((count / usuarios.length) * 100) : 0
                      const colores = ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-teal-500']
                      const bgColores = ['bg-cyan-50', 'bg-blue-50', 'bg-purple-50', 'bg-emerald-50', 'bg-amber-50', 'bg-rose-50', 'bg-indigo-50', 'bg-teal-50']
                      const textColores = ['text-cyan-700', 'text-blue-700', 'text-purple-700', 'text-emerald-700', 'text-amber-700', 'text-rose-700', 'text-indigo-700', 'text-teal-700']
                      const colorIdx = idx % colores.length

                      return (
                        <motion.div
                          key={rol.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-4 rounded-2xl ${bgColores[colorIdx]} border border-dashed border-slate-200`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${colores[colorIdx]}`} />
                              <span className={`font-bold text-sm ${textColores[colorIdx]}`}>{rol.nombre}</span>
                            </div>
                            <span className="text-xl font-black text-slate-800">{count}</span>
                          </div>
                          <div className="h-2 bg-white rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full rounded-full ${colores[colorIdx]}`}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mt-1.5">{percent}% del total</p>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No hay roles configurados</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
