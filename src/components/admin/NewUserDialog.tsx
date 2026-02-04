import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    User,
    Building2,
    Shield,
    Mail,
    Phone,
    Eye,
    Plus,
    Users,
    Edit,
    Trash2,
    FileText,
    CheckCircle,
    UserPlus,
    Key,
    Lock,
    Settings,
    ShieldCheck,
    Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { usuariosService } from '@/services/dataService'
import { obtenerRoles, RolPersonalizado } from '@/services/permisosService'

interface NewUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    empresas: { id: string; nombre: string }[]
    initialData?: any
}

// Módulos disponibles en el sistema
const MODULOS_SISTEMA = [
    { codigo: 'pacientes', nombre: 'Pacientes', icon: User, color: 'blue' },
    { codigo: 'agenda', nombre: 'Agenda', icon: FileText, color: 'indigo' },
    { codigo: 'examenes', nombre: 'Exámenes', icon: FileText, color: 'teal' },
    { codigo: 'rayos_x', nombre: 'Rayos X', icon: FileText, color: 'cyan' },
    { codigo: 'facturacion', nombre: 'Facturación', icon: FileText, color: 'emerald' },
    { codigo: 'reportes', nombre: 'Reportes', icon: FileText, color: 'violet' },
    { codigo: 'inventario', nombre: 'Inventario', icon: FileText, color: 'amber' },
    { codigo: 'configuracion', nombre: 'Configuración', icon: Settings, color: 'slate' },
    { codigo: 'usuarios', nombre: 'Gestión de Usuarios', icon: Users, color: 'blue' },
]

// Acciones posibles por módulo
const ACCIONES = [
    { codigo: 'ver', nombre: 'Ver', icon: Eye },
    { codigo: 'crear', nombre: 'Crear', icon: Plus },
    { codigo: 'editar', nombre: 'Editar', icon: Edit },
    { codigo: 'borrar', nombre: 'Borrar', icon: Trash2 },
]

type PermisosPorModulo = Record<string, string[]>

export function NewUserDialog({ open, onOpenChange, onSuccess, empresas, initialData }: NewUserDialogProps) {
    const { user: currentUser } = useAuth()
    const isSuperAdmin = currentUser?.rol === 'super_admin'
    const currentEmpresaId = currentUser?.empresa_id

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: '',
        telefono: '',
        empresa_id: isSuperAdmin ? '' : (currentEmpresaId || ''),
        rol: '',
    })
    const [permisos, setPermisos] = useState<PermisosPorModulo>({})
    const [rolesDisponibles, setRolesDisponibles] = useState<RolPersonalizado[]>([])

    // Cargar roles dinámicos al montar o abrir
    useEffect(() => {
        const cargarRoles = async () => {
            const targetEmpresaId = isSuperAdmin ? (formData.empresa_id || undefined) : currentEmpresaId
            const roles = await obtenerRoles(targetEmpresaId)

            // Si es Admin de Empresa, filtrar para que no pueda crear otros Super Admins
            const rolesFiltrados = isSuperAdmin
                ? roles
                : roles.filter(r => r.nombre.toLowerCase() !== 'super_admin')

            setRolesDisponibles(rolesFiltrados)
        }
        if (open) {
            cargarRoles()
        }
    }, [open, initialData?.empresa_id, formData.empresa_id, isSuperAdmin, currentEmpresaId])

    // Effect to load initial data for editing
    React.useEffect(() => {
        if (open && rolesDisponibles.length > 0) {
            if (initialData) {
                const rolEncontrado = rolesDisponibles.find(r =>
                    r.nombre.toLowerCase() === (initialData.rol as string).toLowerCase() ||
                    r.id === initialData.rol
                )

                setFormData({
                    nombre: initialData.nombre || '',
                    apellido_paterno: initialData.apellido_paterno || '',
                    apellido_materno: initialData.apellido_materno || '',
                    email: initialData.email || '',
                    password: '',
                    telefono: initialData.telefono || '',
                    empresa_id: initialData.empresa_id || (initialData.empresa && empresas.find(e => e.nombre === initialData.empresa)?.id) || '',
                    rol: rolEncontrado?.id || (initialData.rol as string) || '',
                })

                if (rolEncontrado) {
                    handleRolChange(rolEncontrado.id)
                }
            } else {
                setFormData({
                    nombre: '',
                    apellido_paterno: '',
                    apellido_materno: '',
                    email: '',
                    password: '',
                    telefono: '',
                    empresa_id: '',
                    rol: '',
                })
                setPermisos({})
            }
        }
    }, [open, initialData, empresas, rolesDisponibles])

    const handleRolChange = (rolId: string) => {
        setFormData(prev => ({ ...prev, rol: rolId }))
        const rolSeleccionado = rolesDisponibles.find(r => r.id === rolId)

        if (rolSeleccionado) {
            const nuevosPermisos: PermisosPorModulo = {}

            rolSeleccionado.permisos.forEach(p => {
                const acciones: string[] = []
                if (p.puede_ver) acciones.push('ver')
                if (p.puede_crear) acciones.push('crear')
                if (p.puede_editar) acciones.push('editar')
                if (p.puede_borrar) acciones.push('borrar')

                if (acciones.length > 0) {
                    nuevosPermisos[p.modulo_codigo] = acciones
                }
            })

            setPermisos(nuevosPermisos)
        }
    }

    const togglePermiso = (modulo: string, accion: string) => {
        setPermisos(prev => {
            const moduloPermisos = prev[modulo] || []
            if (moduloPermisos.includes(accion)) {
                return { ...prev, [modulo]: moduloPermisos.filter(a => a !== accion) }
            } else {
                return { ...prev, [modulo]: [...moduloPermisos, accion] }
            }
        })
    }

    const toggleModuloCompleto = (modulo: string) => {
        setPermisos(prev => {
            const moduloPermisos = prev[modulo] || []
            if (moduloPermisos.length === ACCIONES.length) {
                return { ...prev, [modulo]: [] }
            } else {
                return { ...prev, [modulo]: ACCIONES.map(a => a.codigo) }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.empresa_id || !formData.rol) {
            toast.error('Selecciona una empresa y un rol')
            return
        }

        setLoading(true)
        try {
            if (initialData) {
                await usuariosService.update(initialData.id, { ...formData })
                toast.success('Usuario actualizado correctamente')
            } else {
                await usuariosService.create({ ...formData, permisos })
                toast.success(`Usuario ${formData.nombre} creado exitosamente`)
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error(initialData ? 'Error al actualizar usuario' : 'Error al crear usuario')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] max-h-[92vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                {/* Header Premium con Gradiente */}
                <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            {initialData ? <Edit className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {initialData ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario'}
                            </DialogTitle>
                            <p className="text-blue-100 text-sm font-medium opacity-90">
                                {initialData ? 'Modifica los accesos y datos personales.' : 'Crea una cuenta corporativa y asigna permisos.'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                    {/* Sección: Datos Personales */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Información Personal</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Nombre(s) *</Label>
                                <Input
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    placeholder="Ej. Juan Carlos"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Apellido Paterno *</Label>
                                <Input
                                    value={formData.apellido_paterno}
                                    onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                                    className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    placeholder="Ej. Pérez"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Apellido Materno</Label>
                                <Input
                                    value={formData.apellido_materno}
                                    onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                                    className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    placeholder="Ej. García"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Correo Corporativo *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="rounded-xl pl-10 border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white disabled:bg-slate-50"
                                        placeholder="usuario@gpmedical.mx"
                                        required={!initialData}
                                        disabled={!!initialData}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Teléfono de Contacto</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="rounded-xl pl-10 border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        placeholder="55-0000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-200/60" />

                    {/* Sección: Seguridad y Asignación */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Seguridad y Roles</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Centro de Trabajo / Empresa *</Label>
                                <Select
                                    value={formData.empresa_id}
                                    onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
                                    disabled={!isSuperAdmin}
                                >
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <SelectValue placeholder="Seleccionar Entidad" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {empresas.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id} className="rounded-lg">{emp.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 ml-1">Rol Operativo *</Label>
                                <Select
                                    value={formData.rol}
                                    onValueChange={(v) => handleRolChange(v)}
                                >
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-slate-400" />
                                            <SelectValue placeholder="Seleccionar Perfil" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rolesDisponibles.map((rol) => (
                                            <SelectItem key={rol.id} value={rol.id} className="rounded-lg">{rol.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-semibold text-slate-600 ml-1">
                                {initialData ? 'Actualizar Contraseña (Dejar vacío para mantener)' : 'Contraseña de Acceso *'}
                            </Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="rounded-xl pl-10 border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    placeholder="••••••••"
                                    required={!initialData}
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Permisos Dinámicos (Solo si hay un rol seleccionado) */}
                    <AnimatePresence>
                        {formData.rol && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 pt-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Permisos Detallados</h3>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3">Personalizable</Badge>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {MODULOS_SISTEMA.map(modulo => {
                                        const moduloPermisos = permisos[modulo.codigo] || []
                                        const todosActivos = moduloPermisos.length === ACCIONES.length
                                        const IconModulo = modulo.icon

                                        return (
                                            <div
                                                key={modulo.codigo}
                                                className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 transition-all hover:border-blue-200 hover:shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 w-40">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                        <IconModulo className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{modulo.nombre}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-4 flex-1">
                                                    {ACCIONES.map(accion => {
                                                        const activo = moduloPermisos.includes(accion.codigo)
                                                        const IconAccion = accion.icon
                                                        return (
                                                            <label
                                                                key={accion.codigo}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border
                                                                    ${activo
                                                                        ? 'bg-blue-50 border-blue-100 text-blue-700'
                                                                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <Checkbox
                                                                    checked={activo}
                                                                    onCheckedChange={() => togglePermiso(modulo.codigo, accion.codigo)}
                                                                    className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                                <div className="flex items-center gap-1.5">
                                                                    <IconAccion className="w-3.5 h-3.5" />
                                                                    <span className="text-xs font-bold uppercase tracking-tight">{accion.nombre}</span>
                                                                </div>
                                                            </label>
                                                        )
                                                    })}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleModuloCompleto(modulo.codigo)}
                                                    className={`p-2 rounded-xl text-xs font-bold transition-all border
                                                        ${todosActivos
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-blue-50 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {todosActivos ? 'COMPLETO' : 'FULL'}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <DialogFooter className="p-6 bg-white border-t border-slate-100 flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Activity className="animate-spin w-4 h-4" />
                                <span>PROCESANDO...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {initialData ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span>{initialData ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}</span>
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
