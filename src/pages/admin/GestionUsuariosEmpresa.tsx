/**
 * Panel de Gestión de Usuarios por Empresa
 * GPMedical ERP Pro
 * 
 * Permite al admin de empresa:
 * - Ver todos los usuarios de su empresa
 * - Invitar nuevos usuarios
 * - Cambiar roles de usuarios
 * - Activar/desactivar usuarios
 */

import React, { useState, useEffect } from 'react'
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
    ChevronDown
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

// =====================================================
// COMPONENTE DE TARJETA DE USUARIO
// =====================================================

interface UsuarioCardProps {
    usuario: UsuarioEmpresa
    roles: RolEmpresa[]
    onCambiarRol: (userId: string, rolId: string) => void
    onToggleStatus: (userId: string, activo: boolean) => void
    currentUserId: string
}

function UsuarioCard({ usuario, roles, onCambiarRol, onToggleStatus, currentUserId }: UsuarioCardProps) {
    const isCurrentUser = usuario.id === currentUserId
    const rolColor = usuario.rol?.color || '#64748b'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all ${!usuario.activo ? 'opacity-60' : ''
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: rolColor }}
                >
                    {usuario.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 truncate">
                            {usuario.nombre} {usuario.apellido_paterno}
                        </h3>
                        {isCurrentUser && (
                            <Badge className="bg-blue-100 text-blue-700 border-none text-[9px]">TÚ</Badge>
                        )}
                        {!usuario.activo && (
                            <Badge className="bg-rose-100 text-rose-700 border-none text-[9px]">INACTIVO</Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{usuario.email}</p>
                    {usuario.cargo && (
                        <p className="text-xs text-slate-400 mt-1">{usuario.cargo}</p>
                    )}
                </div>

                {/* Rol y acciones */}
                <div className="flex flex-col items-end gap-2">
                    <Badge
                        className="text-white border-none text-xs"
                        style={{ backgroundColor: rolColor }}
                    >
                        {usuario.rol?.nombre || 'Sin rol'}
                    </Badge>

                    {!isCurrentUser && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-56">
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cambiar Rol</p>
                                </div>
                                {roles.map(rol => (
                                    <DropdownMenuItem
                                        key={rol.id}
                                        onClick={() => onCambiarRol(usuario.id, rol.id)}
                                        className="gap-3 py-2"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: rol.color }}
                                        />
                                        <span className={usuario.rol_empresa_id === rol.id ? 'font-bold' : ''}>
                                            {rol.nombre}
                                        </span>
                                        {usuario.rol_empresa_id === rol.id && (
                                            <Check className="w-4 h-4 ml-auto text-emerald-500" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onToggleStatus(usuario.id, !usuario.activo)}
                                    className={`gap-3 py-2 ${usuario.activo ? 'text-rose-600' : 'text-emerald-600'}`}
                                >
                                    {usuario.activo ? (
                                        <>
                                            <UserX className="w-4 h-4" />
                                            Desactivar Usuario
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            Reactivar Usuario
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Último acceso */}
            {usuario.ultimo_acceso && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Último acceso: {new Date(usuario.ultimo_acceso).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            )}
        </motion.div>
    )
}

// =====================================================
// COMPONENTE DE INVITACIÓN PENDIENTE
// =====================================================

interface InvitacionCardProps {
    invitacion: InvitacionUsuario
    onCancelar: (id: string) => void
    onCopiarLink: (token: string) => void
}

function InvitacionCard({ invitacion, onCancelar, onCopiarLink }: InvitacionCardProps) {
    const expirada = new Date(invitacion.expira_en) < new Date()

    return (
        <div className={`p-4 rounded-xl border-2 border-dashed ${expirada ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${expirada ? 'bg-rose-200 text-rose-600' : 'bg-amber-200 text-amber-600'} flex items-center justify-center`}>
                    <Send className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-900">{invitacion.email}</p>
                    <p className="text-xs text-slate-500">
                        {invitacion.nombre || 'Sin nombre'} • {invitacion.rol?.nombre || 'Sin rol'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {expirada ? (
                        <Badge className="bg-rose-500 text-white border-none text-[10px]">EXPIRADA</Badge>
                    ) : (
                        <>
                            <button
                                onClick={() => onCopiarLink(invitacion.token)}
                                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                                title="Copiar enlace"
                            >
                                <Copy className="w-4 h-4 text-slate-500" />
                            </button>
                            <button
                                onClick={() => onCancelar(invitacion.id)}
                                className="p-2 bg-white rounded-lg hover:bg-rose-100 transition-colors text-rose-500"
                                title="Cancelar invitación"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            {!expirada && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                    Expira {new Date(invitacion.expira_en).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            )}
        </div>
    )
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

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

    // Cargar datos
    useEffect(() => {
        if (empresaId) {
            cargarDatos()
        }
    }, [empresaId])

    const cargarDatos = async () => {
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
            toast.error('Error al cargar usuarios')
        } finally {
            setLoading(false)
        }
    }

    // Cambiar rol de usuario
    const handleCambiarRol = async (userId: string, rolId: string) => {
        try {
            const result = await usuariosEmpresaService.actualizar(userId, { rol_empresa_id: rolId })
            if (result.success) {
                toast.success('Rol actualizado')
                cargarDatos()
            } else {
                toast.error(result.error || 'Error al cambiar rol')
            }
        } catch (error) {
            toast.error('Error inesperado')
        }
    }

    // Toggle status de usuario
    const handleToggleStatus = async (userId: string, activo: boolean) => {
        try {
            const result = activo
                ? await usuariosEmpresaService.reactivar(userId)
                : await usuariosEmpresaService.desactivar(userId)

            if (result.success) {
                toast.success(activo ? 'Usuario reactivado' : 'Usuario desactivado')
                cargarDatos()
            } else {
                toast.error(result.error || 'Error al cambiar estado')
            }
        } catch (error) {
            toast.error('Error inesperado')
        }
    }

    // Invitar usuario
    const handleInvitar = async () => {
        if (!empresaId || !user?.id) return

        if (!nuevaInvitacion.email || !nuevaInvitacion.rol_empresa_id) {
            toast.error('Email y rol son requeridos')
            return
        }

        setInvitando(true)
        try {
            const result = await invitacionesService.crear(empresaId, nuevaInvitacion, user.id)

            if (result.success) {
                toast.success('Invitación enviada')
                setInvitarModalOpen(false)
                setNuevaInvitacion({ email: '', nombre: '', rol_empresa_id: '', cargo: '' })
                cargarDatos()

                // Copiar link al portapapeles
                if (result.token) {
                    const link = `${window.location.origin}/aceptar-invitacion?token=${result.token}`
                    navigator.clipboard.writeText(link)
                    toast.success('Enlace copiado al portapapeles', { icon: '📋' })
                }
            } else {
                toast.error(result.error || 'Error al invitar')
            }
        } catch (error) {
            toast.error('Error inesperado')
        } finally {
            setInvitando(false)
        }
    }

    // Cancelar invitación
    const handleCancelarInvitacion = async (id: string) => {
        try {
            const result = await invitacionesService.cancelar(id)
            if (result.success) {
                toast.success('Invitación cancelada')
                cargarDatos()
            }
        } catch (error) {
            toast.error('Error al cancelar')
        }
    }

    // Copiar link de invitación
    const handleCopiarLink = (token: string) => {
        const link = `${window.location.origin}/aceptar-invitacion?token=${token}`
        navigator.clipboard.writeText(link)
        toast.success('Enlace copiado', { icon: '📋' })
    }

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(u => {
        const matchBusqueda = !busqueda ||
            u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.email?.toLowerCase().includes(busqueda.toLowerCase())

        const matchRol = filtroRol === 'todos' || u.rol_empresa_id === filtroRol
        const matchEstado = filtroEstado === 'todos' ||
            (filtroEstado === 'activos' && u.activo) ||
            (filtroEstado === 'inactivos' && !u.activo)

        return matchBusqueda && matchRol && matchEstado
    })

    if (!empresaId) {
        return (
            <AdminLayout
                title="Gestión de Usuarios"
                subtitle="No tienes una empresa asignada"
                icon={Users}
            >
                <div className="text-center py-20">
                    <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No tienes permisos para ver esta sección</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Gestión de Usuarios"
            subtitle="Administra los colaboradores de tu empresa"
            icon={Users}
            badges={[
                { text: `${usuarios.filter(u => u.activo).length} activos`, variant: 'success' },
                { text: `${invitaciones.length} pendientes`, variant: 'warning' }
            ]}
            actions={
                <Button
                    onClick={() => setInvitarModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Invitar Usuario
                </Button>
            }
        >
            {/* Filtros */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <AdminSearchBar
                    placeholder="Buscar por nombre o email..."
                    value={busqueda}
                    onChange={setBusqueda}
                    className="flex-1"
                />

                <div className="flex gap-3">
                    <Select value={filtroRol} onValueChange={setFiltroRol}>
                        <SelectTrigger className="w-48 rounded-xl border-slate-200">
                            <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los roles</SelectItem>
                            {roles.map(rol => (
                                <SelectItem key={rol.id} value={rol.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rol.color }} />
                                        {rol.nombre}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {(['todos', 'activos', 'inactivos'] as const).map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFiltroEstado(estado)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filtroEstado === estado
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {estado}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <AdminLoadingState message="Cargando usuarios..." />
            ) : (
                <div className="space-y-8">
                    {/* Invitaciones pendientes */}
                    {invitaciones.length > 0 && (
                        <div>
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Invitaciones Pendientes ({invitaciones.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Lista de usuarios */}
                    <div>
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Usuarios ({usuariosFiltrados.length})
                        </h3>

                        {usuariosFiltrados.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl">
                                <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No se encontraron usuarios</p>
                                <p className="text-sm text-slate-400 mt-2">
                                    {busqueda ? 'Intenta con otro término de búsqueda' : 'Invita al primer usuario'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {usuariosFiltrados.map(usuario => (
                                    <UsuarioCard
                                        key={usuario.id}
                                        usuario={usuario}
                                        roles={roles}
                                        onCambiarRol={handleCambiarRol}
                                        onToggleStatus={handleToggleStatus}
                                        currentUserId={user?.id || ''}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Invitación */}
            <Dialog open={invitarModalOpen} onOpenChange={setInvitarModalOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xl font-black">Invitar Usuario</p>
                                <p className="text-sm text-slate-500 font-normal">Envía una invitación por email</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email *</Label>
                            <Input
                                type="email"
                                value={nuevaInvitacion.email}
                                onChange={e => setNuevaInvitacion(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="usuario@empresa.com"
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre</Label>
                            <Input
                                value={nuevaInvitacion.nombre}
                                onChange={e => setNuevaInvitacion(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Nombre del usuario"
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rol *</Label>
                            <Select
                                value={nuevaInvitacion.rol_empresa_id}
                                onValueChange={value => setNuevaInvitacion(prev => ({ ...prev, rol_empresa_id: value }))}
                            >
                                <SelectTrigger className="mt-2 h-12 rounded-xl">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(rol => (
                                        <SelectItem key={rol.id} value={rol.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rol.color }} />
                                                {rol.nombre}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cargo</Label>
                            <Input
                                value={nuevaInvitacion.cargo}
                                onChange={e => setNuevaInvitacion(prev => ({ ...prev, cargo: e.target.value }))}
                                placeholder="Ej: Médico Ocupacional"
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setInvitarModalOpen(false)}
                            disabled={invitando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleInvitar}
                            disabled={invitando || !nuevaInvitacion.email || !nuevaInvitacion.rol_empresa_id}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {invitando ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Invitación
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
