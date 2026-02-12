/**
 * Página de Gestión de Roles
 * 
 * Esta página permite al Super Admin visualizar, crear, editar y eliminar roles.
 * Incluye el Wizard para crear roles de forma visual.
 * 
 * ✅ Filtros alineados con los pilares ERP
 * ✅ KPIs de distribución de roles
 * ✅ Cobertura por pilar en cada tarjeta
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    Users,
    Eye,
    Check,
    X,
    AlertCircle,
    Loader2,
    Crown,
    Search,
    MoreVertical,
    ChevronDown,
    Building2,
    Lock,
    Zap,
    TrendingUp,
    BarChart3,
    RefreshCw,
    Filter
} from 'lucide-react'
import {
    obtenerRoles,
    eliminarRol,
    RolPersonalizado
} from '@/services/permisosService'
import { useAuth } from '@/contexts/AuthContext'
import { usePermisosDinamicos } from '@/hooks/usePermisosDinamicos'
import WizardCrearRol from '@/components/admin/WizardCrearRol'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { AdminLayout, AdminSearchBar, AdminLoadingState } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'

// ─── Pilares ERP (misma estructura que WizardCrearRol) ───────────────────
const ERP_PILARES: { key: string; label: string; color: string; dotColor: string; bgColor: string; textColor: string; modules: string[] }[] = [
    {
        key: 'medicina', label: 'Medicina', color: 'emerald', dotColor: 'bg-emerald-400', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700',
        modules: ['dashboard', 'pacientes', 'estudios_medicos', 'prescripcion', 'incapacidades', 'dictamenes']
    },
    {
        key: 'diagnostico', label: 'Diagnóstico', color: 'cyan', dotColor: 'bg-cyan-400', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700',
        modules: ['rayos_x', 'espirometria', 'vision', 'resultados']
    },
    {
        key: 'operaciones', label: 'Operaciones', color: 'purple', dotColor: 'bg-purple-400', bgColor: 'bg-purple-50', textColor: 'text-purple-700',
        modules: ['episodios', 'campanias', 'agenda', 'citas', 'alertas']
    },
    {
        key: 'finanzas', label: 'Finanzas', color: 'blue', dotColor: 'bg-blue-400', bgColor: 'bg-blue-50', textColor: 'text-blue-700',
        modules: ['facturacion', 'cotizaciones', 'cxc', 'inventario', 'tienda']
    },
    {
        key: 'cumplimiento', label: 'Cumplimiento', color: 'amber', dotColor: 'bg-amber-400', bgColor: 'bg-amber-50', textColor: 'text-amber-700',
        modules: ['normatividad', 'nom011', 'evaluaciones', 'matriz_riesgos', 'programa_anual', 'certificaciones']
    },
    {
        key: 'analisis', label: 'Análisis', color: 'violet', dotColor: 'bg-violet-400', bgColor: 'bg-violet-50', textColor: 'text-violet-700',
        modules: ['reportes', 'ia', 'rrhh']
    },
    {
        key: 'admin', label: 'Admin SaaS', color: 'slate', dotColor: 'bg-slate-400', bgColor: 'bg-slate-100', textColor: 'text-slate-700',
        modules: ['empresas', 'usuarios', 'roles_permisos', 'sedes', 'medicos', 'configuracion', 'sistema', 'suscripcion', 'logs']
    }
]

/** Calcula qué pilares cubre un rol */
function getPilaresCubiertos(rol: RolPersonalizado): typeof ERP_PILARES {
    return ERP_PILARES.filter(pilar =>
        pilar.modules.some(mod =>
            rol.permisos.some(p => p.modulo_codigo === mod && p.puede_ver)
        )
    )
}

// ─── Componente: KPI Card ────────────────────────────────────────────────
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
                <Icon className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-2xl font-black">{value}</h3>
            <p className="text-white/80 text-xs font-bold mt-0.5">{title}</p>
            {subtitle && <p className="text-white/50 text-[10px] mt-0.5">{subtitle}</p>}
        </div>
    </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: TARJETA DE ROL
// ═══════════════════════════════════════════════════════════════════════════

interface RolCardProps {
    rol: RolPersonalizado
    onEditar: () => void
    onEliminar: () => void
    index: number
}

function RolCard({ rol, onEditar, onEliminar, index }: RolCardProps) {
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
    const [eliminando, setEliminando] = useState(false)

    const handleEliminar = async () => {
        setEliminando(true)
        await onEliminar()
        setEliminando(false)
        setConfirmandoEliminar(false)
    }

    // Contar permisos
    const modulosConAcceso = rol.permisos.filter(p => p.puede_ver).length
    const puedeCrear = rol.permisos.filter(p => p.puede_crear).length
    const puedeEditar = rol.permisos.filter(p => p.puede_editar).length

    // Pilares cubiertos
    const pilaresCubiertos = getPilaresCubiertos(rol)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden"
        >
            {/* Decoración de fondo sutil */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 group-hover:opacity-[0.06]" style={{ backgroundColor: rol.color }}></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                {/* Icono y nombre */}
                <div className="flex items-center gap-5">
                    <div
                        className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/10 transition-transform duration-500 group-hover:rotate-6"
                        style={{ backgroundColor: rol.color }}
                    >
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                {rol.nombre}
                            </h3>
                            {rol.es_sistema && (
                                <Badge className="bg-slate-900 text-white border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                    SISTEMA
                                </Badge>
                            )}
                            {rol.empresa_id && (
                                <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                    EMPRESA
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                            {rol.descripcion || 'Sin descripción de responsabilidades'}
                        </p>
                    </div>
                </div>

                {/* Acciones Contextuales */}
                {!rol.es_sistema && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuAbierto(!menuAbierto)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {menuAbierto && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-3 z-20"
                                    >
                                        <button
                                            onClick={() => { setMenuAbierto(false); onEditar(); }}
                                            className="w-full px-5 py-3 text-left text-sm text-slate-700 font-bold hover:bg-slate-50 flex items-center gap-3"
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" /> Editar Perfil
                                        </button>
                                        <div className="h-px bg-slate-50 my-1 mx-3"></div>
                                        <button
                                            onClick={() => { setMenuAbierto(false); setConfirmandoEliminar(true); }}
                                            className="w-full px-5 py-3 text-left text-sm text-rose-600 font-bold hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Eliminar Perfil
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Cobertura por Pilar ERP */}
            {pilaresCubiertos.length > 0 && (
                <div className="mb-6 relative z-10">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Cobertura ERP</p>
                    <div className="flex flex-wrap gap-1.5">
                        {pilaresCubiertos.map(pilar => {
                            const modulesInPilar = pilar.modules.filter(mod =>
                                rol.permisos.some(p => p.modulo_codigo === mod && p.puede_ver)
                            ).length
                            return (
                                <div
                                    key={pilar.key}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${pilar.bgColor} border border-transparent`}
                                    title={`${pilar.label}: ${modulesInPilar} módulos`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${pilar.dotColor}`} />
                                    <span className={`text-[10px] font-bold ${pilar.textColor}`}>
                                        {pilar.label}
                                    </span>
                                    <span className={`text-[9px] font-extrabold ${pilar.textColor} opacity-60`}>
                                        {modulesInPilar}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Matrix Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                {[
                    { label: 'Módulos', val: modulosConAcceso, color: 'blue' },
                    { label: 'Crear', val: puedeCrear, color: 'emerald' },
                    { label: 'Editar', val: puedeEditar, color: 'amber' }
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-center transition-colors group-hover:bg-white">
                        <div className={`text-2xl font-black text-${stat.color}-600`}>{stat.val}</div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Barra de Jerarquía Premium */}
            <div className="relative z-10 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Poder Jerárquico</span>
                    <Badge variant="outline" className="border-slate-200 text-slate-600 font-mono text-[10px]">LVL {rol.nivel_jerarquia}</Badge>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((10 - rol.nivel_jerarquia) / 10) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                        className="h-full rounded-full shadow-sm"
                        style={{ backgroundColor: rol.color }}
                    />
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <AnimatePresence>
                {confirmandoEliminar && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500"></div>
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                                    ¿Confirmar Eliminación?
                                </h3>
                                <p className="text-slate-500 font-medium mb-8">
                                    El perfil <span className="font-bold text-slate-900">"{rol.nombre}"</span> será removido del sistema. Esta acción es irreversible.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleEliminar}
                                        disabled={eliminando}
                                        className="w-full px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        {eliminando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        Eliminar Definitivamente
                                    </button>
                                    <button
                                        onClick={() => setConfirmandoEliminar(false)}
                                        className="w-full px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div >
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function GestionRoles() {
    const { user } = useAuth()
    const { isSuperAdmin, puede } = usePermisosDinamicos()

    const [roles, setRoles] = useState<RolPersonalizado[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState<'todos' | 'sistema' | 'personalizados'>('todos')
    const [filtroPilar, setFiltroPilar] = useState<string>('todos')
    const [mostrarWizard, setMostrarWizard] = useState(false)
    const [rolAEditar, setRolAEditar] = useState<RolPersonalizado | null>(null)

    // Cargar roles
    const cargarRoles = async () => {
        setLoading(true)
        setError(null)
        try {
            const rolesData = await obtenerRoles()
            setRoles(rolesData)
        } catch (err) {
            setError('Error al cargar los roles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarRoles()
    }, [])

    // Eliminar rol
    const handleEliminarRol = async (rolId: string) => {
        const resultado = await eliminarRol(rolId)
        if (resultado.success) {
            setRoles(roles.filter(r => r.id !== rolId))
            toast.success('Rol eliminado correctamente')
        } else {
            setError(resultado.error || 'Error al eliminar el rol')
        }
    }

    // ─── KPIs calculados ─────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const totalPermisos = roles.reduce((acc, r) => acc + r.permisos.filter(p => p.puede_ver).length, 0)
        const totalRolesConCrear = roles.filter(r => r.permisos.some(p => p.puede_crear)).length
        const pilaresUnicos = new Set<string>()
        roles.forEach(r => {
            getPilaresCubiertos(r).forEach(p => pilaresUnicos.add(p.key))
        })
        return {
            total: roles.length,
            sistema: roles.filter(r => r.es_sistema).length,
            custom: roles.filter(r => !r.es_sistema).length,
            totalPermisos,
            totalRolesConCrear,
            pilaresCubiertos: pilaresUnicos.size
        }
    }, [roles])

    // ─── Cobertura por pilar (para el filtro) ────────────────────────────
    const coberturaPilares = useMemo(() => {
        return ERP_PILARES.map(pilar => {
            const rolesConPilar = roles.filter(r =>
                pilar.modules.some(mod =>
                    r.permisos.some(p => p.modulo_codigo === mod && p.puede_ver)
                )
            ).length
            return { ...pilar, count: rolesConPilar }
        })
    }, [roles])

    // ─── Filtrar roles ───────────────────────────────────────────────────
    const rolesFiltrados = useMemo(() => {
        return roles.filter(rol => {
            // Búsqueda por texto
            if (busqueda) {
                const searchLower = busqueda.toLowerCase()
                const matchNombre = rol.nombre.toLowerCase().includes(searchLower)
                const matchDesc = rol.descripcion?.toLowerCase().includes(searchLower)
                const matchModulo = rol.permisos.some(p =>
                    p.modulo_nombre?.toLowerCase().includes(searchLower) && p.puede_ver
                )
                if (!matchNombre && !matchDesc && !matchModulo) return false
            }

            // Filtro de tipo
            if (filtroTipo === 'sistema' && !rol.es_sistema) return false
            if (filtroTipo === 'personalizados' && rol.es_sistema) return false

            // Filtro por pilar ERP
            if (filtroPilar !== 'todos') {
                const pilar = ERP_PILARES.find(p => p.key === filtroPilar)
                if (pilar) {
                    const tienePilar = pilar.modules.some(mod =>
                        rol.permisos.some(p => p.modulo_codigo === mod && p.puede_ver)
                    )
                    if (!tienePilar) return false
                }
            }

            return true
        })
    }, [roles, busqueda, filtroTipo, filtroPilar])

    // Verificar acceso
    if (!isSuperAdmin && !puede('roles_permisos', 'ver')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Acceso Restringido
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        No tienes permisos para ver esta sección
                    </p>
                </div>
            </div>
        )
    }

    return (
        <AdminLayout
            title="Gestión de Perfiles Operativos"
            subtitle="Configura la arquitectura de accesos y responsabilidades jerárquicas para cada rol."
            icon={Shield}
            badges={[{ text: 'Administración Core', variant: 'info', icon: <Lock size={12} /> }]}
            actions={
                (isSuperAdmin || puede('roles_permisos', 'crear')) && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={cargarRoles}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
                        </Button>
                        <Button
                            onClick={() => setMostrarWizard(true)}
                            className="bg-slate-900 text-white hover:bg-slate-800"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Crear Nuevo Perfil
                        </Button>
                    </div>
                )
            }
        >
            {/* ────── KPIs ────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <KpiCard icon={Shield} title="Total Roles" value={kpis.total} gradient="from-slate-700 to-slate-900" />
                <KpiCard icon={Lock} title="Sistema" value={kpis.sistema} subtitle="No editables" gradient="from-purple-500 to-indigo-600" />
                <KpiCard icon={Crown} title="Personalizados" value={kpis.custom} subtitle="Editables" gradient="from-blue-500 to-cyan-600" />
                <KpiCard icon={Eye} title="Permisos Activos" value={kpis.totalPermisos} subtitle="Módulos × Roles" gradient="from-emerald-500 to-teal-600" />
                <KpiCard icon={Zap} title="Pilares" value={`${kpis.pilaresCubiertos}/7`} subtitle="Con cobertura" gradient="from-amber-500 to-orange-600" />
            </div>

            <div className="space-y-6">
                {/* ────── Filtros ────── */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <AdminSearchBar
                            placeholder="Filtrar por nombre, módulo o capacidad..."
                            value={busqueda}
                            onChange={setBusqueda}
                            className="flex-1"
                        />

                        {/* Selector de Tipo */}
                        <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-full lg:w-fit border border-slate-100">
                            {[
                                { valor: 'todos', label: 'Todos', icon: Shield },
                                { valor: 'sistema', label: 'Core', icon: Lock },
                                { valor: 'personalizados', label: 'Custom', icon: Users }
                            ].map(filtro => (
                                <button
                                    key={filtro.valor}
                                    onClick={() => setFiltroTipo(filtro.valor as any)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                        ${filtroTipo === filtro.valor
                                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-100'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <filtro.icon className="w-3.5 h-3.5" />
                                    {filtro.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ────── Filtro por Pilar ERP ────── */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Pilar</span>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setFiltroPilar('todos')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${filtroPilar === 'todos'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                Todos
                            </button>
                            {coberturaPilares.map(pilar => (
                                <button
                                    key={pilar.key}
                                    onClick={() => setFiltroPilar(pilar.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${filtroPilar === pilar.key
                                            ? `${pilar.bgColor} ${pilar.textColor} ring-1 ring-${pilar.color}-200`
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${pilar.dotColor}`} />
                                    {pilar.label}
                                    <span className="opacity-60">{pilar.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback de Estado */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-4 text-rose-700">
                            <div className="p-2 bg-rose-100 rounded-xl">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest flex-1">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="p-2 hover:bg-rose-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dashboard de Roles */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Base de Roles...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                    <AnimatePresence>
                        {rolesFiltrados.map((rol, idx) => (
                            <RolCard
                                key={rol.id}
                                rol={rol}
                                index={idx}
                                onEditar={() => {
                                    setRolAEditar(rol)
                                    setMostrarWizard(true)
                                }}
                                onEliminar={() => handleEliminarRol(rol.id)}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Empty States Premium */}
                    {rolesFiltrados.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-32 flex flex-col items-center text-center px-6"
                        >
                            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                                <Users className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                No se detectaron perfiles activos
                            </h3>
                            <p className="text-slate-400 font-medium max-w-sm mb-10">
                                {busqueda
                                    ? `No hay coincidencias para "${busqueda}" en la base de datos de seguridad.`
                                    : filtroPilar !== 'todos'
                                        ? `No hay roles con cobertura en el pilar "${ERP_PILARES.find(p => p.key === filtroPilar)?.label || filtroPilar}".`
                                        : 'Inicie el protocolo de creación para desplegar nuevos perfiles operativos.'
                                }
                            </p>
                            {!busqueda && filtroPilar === 'todos' && (
                                <button
                                    onClick={() => setMostrarWizard(true)}
                                    className="px-8 py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <Plus className="w-5 h-5 stroke-[3]" />
                                    Desplegar Primer Perfil
                                </button>
                            )}
                            {(busqueda || filtroPilar !== 'todos') && (
                                <button
                                    onClick={() => { setBusqueda(''); setFiltroPilar('todos'); setFiltroTipo('todos') }}
                                    className="px-6 py-3 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Limpiar Filtros
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Wizard Overlay */}
            <AnimatePresence>
                {mostrarWizard && (
                    <WizardCrearRol
                        onClose={() => {
                            setMostrarWizard(false)
                            setRolAEditar(null)
                        }}
                        onCreado={() => {
                            cargarRoles()
                        }}
                        rolInitial={rolAEditar || undefined}
                    />
                )}
            </AnimatePresence>
        </AdminLayout>
    )
}
