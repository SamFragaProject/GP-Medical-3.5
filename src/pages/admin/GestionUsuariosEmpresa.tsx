/**
 * GestionUsuariosEmpresa - Panel de Gestión de Colaboradores
 * GPMedical ERP Pro
 * 
 * Permite al administrador de la empresa gestionar su capital humano:
 * - Visualización de KPIs de equipo
 * - Invitación de nuevos miembros via Email/Link
 * - Gestión de roles y permisos granulares
 * - Control de estado (Activo/Inactivo)
 * 
 * ✅ KPIs dinámicos de equipo
 * ✅ Sistema de invitaciones con expiración
 * ✅ Diseño premium alineado con el ecosistema
 * ✅ Animaciones Framer Motion (Staggered)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    MoreVertical,
    Search,
    Check,
    X,
    Loader2,
    AlertCircle,
    Clock,
    Send,
    Copy,
    Trash2,
    Edit,
    UserX,
    UserCheck,
    Crown,
    Building2,
    ChevronDown,
    RefreshCw,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    MailCheck,
    Fingerprint,
    Zap,
    Filter,
    ShieldAlert,
    Briefcase
} from 'lucide-react'
import { AdminLayout, AdminSearchBar, AdminLoadingState } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import {
    usuariosEmpresaService,
    rolesEmpresaService,
    invitacionesService,
    UsuarioEmpresa,
    RolEmpresa,
    InvitacionUsuario,
    InvitarUsuarioDTO
} from '@/services/tenantService'
import toast from 'react-hot-toast'

// ─── KPI Card ────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, title, value, subtitle, gradient }: {
    icon: any; title: string; value: number | string; subtitle?: string; gradient: string
}) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg`}
    >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 shadow-sm" />
            </div>
            <h3 className="text-2xl font-black">{value}</h3>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">{title}</p>
            {subtitle && <p className="text-white/50 text-[10px] font-medium mt-0.5">{subtitle}</p>}
        </div>
    </motion.div>
)

// ─── Componente de Tarjeta de Usuario Premium ────────────────────────────
interface UsuarioCardProps {
    usuario: UsuarioEmpresa
    roles: RolEmpresa[]
    onCambiarRol: (userId: string, rolId: string) => void
    onToggleStatus: (userId: string, activo: boolean) => void
    currentUserId: string
    index: number
}

function UsuarioCard({ usuario, roles, onCambiarRol, onToggleStatus, currentUserId, index }: UsuarioCardProps) {
    const isCurrentUser = usuario.id === currentUserId
    const rolColor = usuario.rol?.color || '#64748b'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className={`group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden ${!usuario.activo ? 'opacity-70 bg-slate-50/50' : ''
                }`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Avatar Premium */}
                        <div
                            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                            style={{
                                backgroundColor: rolColor,
                                boxShadow: `0 10px 20px -5px ${rolColor}44`
                            }}
                        >
                            {usuario.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                                    {usuario.nombre} {usuario.apellido_paterno}
                                </h3>
                                {isCurrentUser && (
                                    <Badge className="bg-blue-500 text-white border-none text-[8px] font-black tracking-widest px-2 py-0.5">TÚ</Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-bold tracking-tight mb-2">{usuario.email}</p>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className="text-white border-none text-[10px] font-black uppercase tracking-tighter px-2.5"
                                    style={{ backgroundColor: rolColor }}
                                >
                                    {usuario.rol?.nombre || 'Sin rol'}
                                </Badge>
                                {!usuario.activo && (
                                    <Badge className="bg-rose-100 text-rose-700 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                                        <ShieldAlert className="w-2.5 h-2.5" /> Inactivo
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isCurrentUser && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all hover:rotate-90">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl p-2 border-slate-100 shadow-2xl w-60">
                                <div className="px-3 py-2 mb-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asignar Nuevo Rol</p>
                                </div>
                                {roles.map(rol => (
                                    <DropdownMenuItem
                                        key={rol.id}
                                        onClick={() => onCambiarRol(usuario.id, rol.id)}
                                        className="rounded-xl gap-3 py-2.5 font-bold text-xs"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: rol.color }}
                                        />
                                        <span className={usuario.rol_empresa_id === rol.id ? 'text-blue-600' : ''}>
                                            {rol.nombre}
                                        </span>
                                        {usuario.rol_empresa_id === rol.id && (
                                            <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="my-1 bg-slate-50" />
                                <DropdownMenuItem
                                    onClick={() => onToggleStatus(usuario.id, !usuario.activo)}
                                    className={`rounded-xl gap-3 py-3 font-black uppercase text-[10px] tracking-widest ${usuario.activo ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                >
                                    {usuario.activo ? (
                                        <>
                                            <UserX className="w-4 h-4" />
                                            Suspender Colaborador
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            Reactivar Acceso
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3" /> Cargo
                        </p>
                        <p className="text-xs font-bold text-slate-700 truncate">{usuario.cargo || 'No especificado'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Último Acceso
                        </p>
                        <p className="text-[10px] font-bold text-slate-700">
                            {usuario.ultimo_acceso
                                ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                                : 'Nunca'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Componente de Invitación Premium ────────────────────────────────────
function InvitacionCard({ invitacion, onCancelar, onCopiarLink }: {
    invitacion: InvitacionUsuario; onCancelar: (id: string) => void; onCopiarLink: (token: string) => void
}) {
    const expirada = new Date(invitacion.expira_en) < new Date()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-[2rem] border-2 border-dashed transition-all ${expirada ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50 hover:border-amber-400'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${expirada ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-500'} flex items-center justify-center flex-shrink-0`}>
                    <Send className={`w-7 h-7 ${!expirada ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 truncate tracking-tight">{invitacion.email}</p>
                        {expirada && <Badge className="bg-rose-500 text-white border-none text-[8px] font-black tracking-widest uppercase">Expirada</Badge>}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        {invitacion.nombre || 'Candidato'} • {invitacion.rol?.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold">
                        <Clock className="w-3 h-3" />
                        Expira el {new Date(invitacion.expira_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </div>
                </div>
                {!expirada && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onCopiarLink(invitacion.token)}
                            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-amber-100 hover:bg-amber-50 flex items-center justify-center transition-colors hover:scale-110"
                            title="Copiar enlace"
                        >
                            <Copy className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                            onClick={() => onCancelar(invitacion.id)}
                            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-rose-100 hover:bg-rose-50 flex items-center justify-center transition-colors hover:scale-110 text-rose-500"
                            title="Cancelar invitación"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function GestionUsuariosEmpresa() {
    const { user } = useAuth()
    const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([])
    const [roles, setRoles] = useState<RolEmpresa[]>([])
    const [invitaciones, setInvitaciones] = useState<InvitacionUsuario[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroRol, setFiltroRol] = useState<string>('todos')
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos')

    // Modal de invitación
    const [invitarModalOpen, setInvitarModalOpen] = useState(false)
    const [invitando, setInvitando] = useState(false)
    const [nuevaInvitacion, setNuevaInvitacion] = useState<InvitarUsuarioDTO>({
        email: '',
        nombre: '',
        rol_empresa_id: '',
        cargo: ''
    })

    const empresaId = user?.empresa_id

    // Indexar roles por ID para los KPIs
    const rolesMap = useMemo(() => {
        const map: Record<string, RolEmpresa> = {}
        roles.forEach(r => map[r.id] = r)
        return map
    }, [roles])

    // KPIs Dashboard
    const kpis = useMemo(() => {
        return {
            total: usuarios.length,
            activos: usuarios.filter(u => u.activo).length,
            pendientes: invitaciones.filter(i => new Date(i.expira_en) > new Date()).length,
            administradores: usuarios.filter(u => {
                const rolName = u.rol?.nombre?.toLowerCase() || ''
                return rolName.includes('admin') || rolName.includes('super')
            }).length
        }
    }, [usuarios, invitaciones])

    const cargarDatos = useCallback(async () => {
        if (!empresaId) return
        setLoading(true)
        try {
            const [usuariosData, rolesData, invitacionesData] = await Promise.all([
                usuariosEmpresaService.getByEmpresa(empresaId),
                rolesEmpresaService.getActivosByEmpresa(empresaId),
                invitacionesService.getPendientes(empresaId)
            ])
            setUsuarios(usuariosData)
            setRoles(rolesData)
            setInvitaciones(invitacionesData)
        } catch (error) {
            console.error('Error cargando datos:', error)
            toast.error('Error al sincronizar capital humano')
        } finally {
            setLoading(false)
        }
    }, [empresaId])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    // Handlers
    const handleCambiarRol = async (userId: string, rolId: string) => {
        try {
            const result = await usuariosEmpresaService.actualizar(userId, { rol_empresa_id: rolId })
            if (result.success) {
                toast.success('Rol actualizado con éxito')
                cargarDatos()
            } else toast.error(result.error || 'Fallo al actualizar rol')
        } catch { toast.error('Error de red') }
    }

    const handleToggleStatus = async (userId: string, activo: boolean) => {
        try {
            const result = activo
                ? await usuariosEmpresaService.reactivar(userId)
                : await usuariosEmpresaService.desactivar(userId)
            if (result.success) {
                toast.success(activo ? 'Acceso reactivado' : 'Acceso suspendido temporalmente')
                cargarDatos()
            } else toast.error(result.error || 'Error al cambiar estado')
        } catch { toast.error('Error de red') }
    }

    const handleInvitar = async () => {
        if (!empresaId || !user?.id) return
        if (!nuevaInvitacion.email || !nuevaInvitacion.rol_empresa_id) {
            toast.error('Email y Rol son mandatorios')
            return
        }
        setInvitando(true)
        try {
            const result = await invitacionesService.crear(empresaId, nuevaInvitacion, user.id)
            if (result.success) {
                toast.success('Invitación enviada al buzón del colaborador')
                setInvitarModalOpen(false)
                setNuevaInvitacion({ email: '', nombre: '', rol_empresa_id: '', cargo: '' })
                cargarDatos()
                if (result.token) {
                    const link = `${window.location.origin}/aceptar-invitacion?token=${result.token}`
                    navigator.clipboard.writeText(link)
                    toast.success('Link de acceso directo copiado', { icon: '🔗' })
                }
            } else toast.error(result.error || 'Error al generar invitación')
        } catch { toast.error('Error inesperado') }
        finally { setInvitando(false) }
    }

    const handleCancelarInvitacion = async (id: string) => {
        try {
            const result = await invitacionesService.cancelar(id)
            if (result.success) {
                toast.success('Invitación revocada')
                cargarDatos()
            }
        } catch { toast.error('Error al revocar') }
    }

    const handleCopiarLink = (token: string) => {
        const link = `${window.location.origin}/aceptar-invitacion?token=${token}`
        navigator.clipboard.writeText(link)
        toast.success('Link copiado al portapapeles', { icon: '📋' })
    }

    // Filtrado memoizado
    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter(u => {
            if (busqueda) {
                const q = busqueda.toLowerCase()
                const match = u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.cargo?.toLowerCase().includes(q)
                if (!match) return false
            }
            if (filtroRol !== 'todos' && u.rol_empresa_id !== filtroRol) return false
            if (filtroEstado === 'activos' && !u.activo) return false
            if (filtroEstado === 'inactivos' && u.activo) return false
            return true
        })
    }, [usuarios, busqueda, filtroRol, filtroEstado])

    return (
        <AdminLayout
            title="Capital Humano"
            subtitle="Gestión avanzada de colaboradores, roles y accesos corporativos."
            icon={Users}
            badges={[
                { text: `${kpis.activos} Activos`, variant: 'success', icon: <CheckCircle2 size={12} /> },
                { text: `${invitaciones.length} Invitaciones`, variant: 'warning', icon: <Send size={12} /> }
            ]}
            actions={
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={cargarDatos}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
                    </Button>
                    <Button
                        onClick={() => setInvitarModalOpen(true)}
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Añadir Miembro
                    </Button>
                </div>
            }
        >
            {/* ────── KPIs Dashboard ────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard icon={Users} title="Total Equipo" value={kpis.total} gradient="from-slate-700 to-slate-900" />
                <KpiCard icon={MailCheck} title="Invitaciones" value={invitaciones.length} subtitle="pendientes" gradient="from-blue-500 to-indigo-600" />
                <KpiCard icon={ShieldCheck} title="Administradores" value={kpis.administradores} subtitle="privilegiados" gradient="from-emerald-500 to-teal-600" />
                <KpiCard icon={Zap} title="Capacidad" value={`${Math.round((kpis.activos / Math.max(kpis.total, 1)) * 100)}%`} subtitle="operatividad" gradient="from-purple-500 to-violet-600" />
            </div>

            {/* ────── Filtros ────── */}
            <div className="flex flex-col lg:flex-row gap-4 items-center mb-10">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre, email, cargo o perfil..."
                        className="pl-12 bg-white border-slate-200 h-12 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="flex gap-4 w-full lg:w-fit">
                    <Select value={filtroRol} onValueChange={setFiltroRol}>
                        <SelectTrigger className="w-full lg:w-48 h-12 rounded-2xl border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-500">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3 h-3" />
                                <SelectValue placeholder="Rol" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                            <SelectItem value="todos" className="font-bold text-xs">TODOS LOS ROLES</SelectItem>
                            {roles.map(rol => (
                                <SelectItem key={rol.id} value={rol.id} className="font-bold text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rol.color }} />
                                        {rol.nombre.toUpperCase()}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex p-1.5 bg-slate-200/50 rounded-2xl border border-slate-100 whitespace-nowrap overflow-x-auto no-scrollbar">
                        {[
                            { id: 'todos', label: 'Todos' },
                            { id: 'activos', label: 'Activos' },
                            { id: 'inactivos', label: 'Suspendidos' }
                        ].map(st => (
                            <button
                                key={st.id}
                                onClick={() => setFiltroEstado(st.id as any)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroEstado === st.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <AdminLoadingState message="Sincronizando Capital Humano..." />
            ) : (
                <div className="space-y-12">
                    {/* Invitaciones Pendientes con Diseño Premium */}
                    {invitaciones.length > 0 && !busqueda && filtroRol === 'todos' && filtroEstado === 'todos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    Colaboradores Invitados ({invitaciones.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                {invitaciones.map(inv => (
                                    <InvitacionCard
                                        key={inv.id}
                                        invitacion={inv}
                                        onCancelar={handleCancelarInvitacion}
                                        onCopiarLink={handleCopiarLink}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lista de Usuarios Principal */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                Nómina de Acceso Activa ({usuariosFiltrados.length})
                            </h3>
                        </div>

                        {usuariosFiltrados.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
                            >
                                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mx-auto mb-8">
                                    <Users className="w-12 h-12 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cero coincidencias</h3>
                                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 mb-8">
                                    No pudimos encontrar colaboradores bajo los criterios seleccionados.
                                </p>
                                <Button
                                    variant="ghost"
                                    onClick={() => { setBusqueda(''); setFiltroRol('todos'); setFiltroEstado('todos') }}
                                    className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50"
                                >
                                    Reiniciar Búsqueda
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {usuariosFiltrados.map((usuario, idx) => (
                                        <UsuarioCard
                                            key={usuario.id}
                                            index={idx}
                                            usuario={usuario}
                                            roles={roles}
                                            onCambiarRol={handleCambiarRol}
                                            onToggleStatus={handleToggleStatus}
                                            currentUserId={user?.id || ''}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Invitación con Diseño Consistente */}
            <Dialog open={invitarModalOpen} onOpenChange={setInvitarModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                                <UserPlus className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tight">Añadir al Equipo</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Gestión de Talento</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Corporativo *</Label>
                            <Input
                                type="email"
                                value={nuevaInvitacion.email}
                                onChange={e => setNuevaInvitacion(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="colaborador@tuempresa.mx"
                                className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nombre Completo</Label>
                            <Input
                                value={nuevaInvitacion.nombre}
                                onChange={e => setNuevaInvitacion(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Nombre del colaborador"
                                className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Rol Asignado *</Label>
                                <Select
                                    value={nuevaInvitacion.rol_empresa_id}
                                    onValueChange={value => setNuevaInvitacion(prev => ({ ...prev, rol_empresa_id: value }))}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-xs">
                                        <SelectValue placeholder="Elegir..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        {roles.map(rol => (
                                            <SelectItem key={rol.id} value={rol.id} className="font-bold text-xs py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rol.color }} />
                                                    {rol.nombre}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Cargo</Label>
                                <Input
                                    value={nuevaInvitacion.cargo}
                                    onChange={e => setNuevaInvitacion(prev => ({ ...prev, cargo: e.target.value }))}
                                    placeholder="Ej: Gerente"
                                    className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setInvitarModalOpen(false)}
                            disabled={invitando}
                            className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleInvitar}
                            disabled={invitando || !nuevaInvitacion.email || !nuevaInvitacion.rol_empresa_id}
                            className="flex-[2] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20"
                        >
                            {invitando ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Despachar Invitación <Send className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
