/**
 * GestionEmpresas - Gestión Multi-Tenancy de Empresas
 * 
 * Vista de administración de empresas (tenants) del sistema SaaS.
 * 
 * ✅ KPIs calculados en tiempo real
 * ✅ Conteo de usuarios por empresa
 * ✅ Filtros por estado
 * ✅ Empty state premium
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Plus,
    Search,
    MapPin,
    Globe,
    Shield,
    MoreVertical,
    Users,
    Activity,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    Edit,
    ExternalLink,
    Settings,
    UserCog,
    RefreshCw,
    TrendingUp,
    Zap,
    Filter,
    X,
    Calendar
} from 'lucide-react'
import { AdminLayout, AdminSearchBar, AdminLoadingState } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dataService } from '@/services/dataService'
import { WizardCrearEmpresa } from '@/components/admin/WizardCrearEmpresa'
import { NewCompanyDialog } from '@/components/admin/NewCompanyDialog'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

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
                <Icon className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-2xl font-black">{value}</h3>
            <p className="text-white/80 text-xs font-bold mt-0.5">{title}</p>
            {subtitle && <p className="text-white/50 text-[10px] mt-0.5">{subtitle}</p>}
        </div>
    </motion.div>
)

export default function GestionEmpresas() {
    const navigate = useNavigate()
    const [empresas, setEmpresas] = useState<any[]>([])
    const [usuariosPorEmpresa, setUsuariosPorEmpresa] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activas' | 'suspendidas'>('todos')
    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null)

    useEffect(() => {
        cargarEmpresas()
    }, [])

    const cargarEmpresas = async () => {
        setLoading(true)
        try {
            const data = await dataService.empresas.getAll()
            setEmpresas(data)

            // Cargar conteo de usuarios por empresa
            try {
                const { data: perfiles } = await supabase
                    .from('perfiles')
                    .select('empresa_id')

                if (perfiles) {
                    const conteo: Record<string, number> = {}
                    perfiles.forEach(p => {
                        if (p.empresa_id) {
                            conteo[p.empresa_id] = (conteo[p.empresa_id] || 0) + 1
                        }
                    })
                    setUsuariosPorEmpresa(conteo)
                }
            } catch { /* fallback silencioso */ }
        } catch (error) {
            toast.error('Error al cargar empresas')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (emp: any) => {
        setSelectedEmpresa(emp)
        setIsDialogOpen(true)
    }

    const handleToggleStatus = async (emp: any) => {
        try {
            await dataService.empresas.toggleStatus(emp.id, !emp.activo)
            toast.success(emp.activo ? 'Empresa suspendida' : 'Empresa activada')
            cargarEmpresas()
        } catch (error) {
            toast.error('Error al cambiar el estado')
        }
    }

    // ─── KPIs ────────────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const activas = empresas.filter(e => e.activo).length
        const suspendidas = empresas.filter(e => !e.activo).length
        const totalUsuarios = Object.values(usuariosPorEmpresa).reduce((a, b) => a + b, 0)
        const planesUnicos = new Set(empresas.map(e => e.plan || 'trial').filter(Boolean)).size
        return { total: empresas.length, activas, suspendidas, totalUsuarios, planesUnicos }
    }, [empresas, usuariosPorEmpresa])

    // ─── Filtrado ────────────────────────────────────────────────────────
    const filteredEmpresas = useMemo(() => {
        return empresas.filter(emp => {
            // Búsqueda por texto
            if (busqueda) {
                const q = busqueda.toLowerCase()
                if (!emp.nombre.toLowerCase().includes(q) &&
                    !(emp.rfc && emp.rfc.toLowerCase().includes(q)) &&
                    !(emp.email && emp.email.toLowerCase().includes(q))) return false
            }
            // Filtro de estado
            if (filtroEstado === 'activas' && !emp.activo) return false
            if (filtroEstado === 'suspendidas' && emp.activo) return false
            return true
        })
    }, [empresas, busqueda, filtroEstado])

    // Helpers
    const formatFechaCorta = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        } catch { return '—' }
    }

    return (
        <AdminLayout
            title="Gestión de Empresas (Tenants)"
            subtitle="Administra los socios corporativos y sus configuraciones SaaS."
            icon={Building2}
            badges={[{ text: 'Multi-Tenancy', variant: 'info', icon: <Shield size={12} /> }]}
            actions={
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={cargarEmpresas}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
                    </Button>
                    <Button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus size={16} className="mr-2" />
                        Nueva Empresa
                    </Button>
                </div>
            }
        >
            {/* ────── KPIs ────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KpiCard icon={Building2} title="Empresas Totales" value={kpis.total} gradient="from-slate-700 to-slate-900" />
                <KpiCard icon={CheckCircle2} title="Activas" value={kpis.activas} subtitle="operativas" gradient="from-emerald-500 to-teal-600" />
                <KpiCard icon={Users} title="Colaboradores" value={kpis.totalUsuarios} subtitle="en todas las empresas" gradient="from-blue-500 to-indigo-600" />
                <KpiCard icon={Zap} title="Planes Activos" value={kpis.planesUnicos} subtitle="tipos de plan" gradient="from-purple-500 to-violet-600" />
            </div>

            {/* ────── Filtros ────── */}
            <div className="flex flex-col lg:flex-row gap-4 items-center mb-8">
                <AdminSearchBar
                    placeholder="Buscar empresa por nombre, RFC o email..."
                    value={busqueda}
                    onChange={setBusqueda}
                    className="flex-1"
                />

                <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-full lg:w-fit border border-slate-100">
                    {[
                        { valor: 'todos', label: 'Todas', count: kpis.total },
                        { valor: 'activas', label: 'Activas', count: kpis.activas },
                        { valor: 'suspendidas', label: 'Suspendidas', count: kpis.suspendidas }
                    ].map(filtro => (
                        <button
                            key={filtro.valor}
                            onClick={() => setFiltroEstado(filtro.valor as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${filtroEstado === filtro.valor
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-100'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {filtro.label}
                            <span className="text-[9px] opacity-50">{filtro.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <AdminLoadingState message="Cargando Universos de Datos..." />
            ) : filteredEmpresas.length === 0 ? (
                /* ────── Empty State ────── */
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-32 flex flex-col items-center text-center px-6"
                >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                        <Building2 className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        No se encontraron empresas
                    </h3>
                    <p className="text-slate-400 font-medium max-w-sm mb-10">
                        {busqueda
                            ? `No hay coincidencias para "${busqueda}".`
                            : filtroEstado !== 'todos'
                                ? `No hay empresas ${filtroEstado}.`
                                : 'Aún no has registrado ninguna empresa en el ecosistema.'
                        }
                    </p>
                    {!busqueda && filtroEstado === 'todos' ? (
                        <button
                            onClick={() => setIsWizardOpen(true)}
                            className="px-8 py-4 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5 stroke-[3]" />
                            Crear Primera Empresa
                        </button>
                    ) : (
                        <button
                            onClick={() => { setBusqueda(''); setFiltroEstado('todos') }}
                            className="px-6 py-3 text-slate-500 font-bold text-xs hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Limpiar Filtros
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmpresas.map((emp, idx) => {
                        const userCount = usuariosPorEmpresa[emp.id] || 0

                        return (
                            <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="rounded-[2rem] border-none shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white group">
                                    <div className={`h-2 ${emp.activo ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'}`} />
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`w-16 h-16 rounded-2xl ${emp.activo ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                                                <Building2 size={32} />
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge className={emp.activo ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-rose-100 text-rose-700 border-none'}>
                                                    {emp.activo ? 'Activa' : 'Suspendida'}
                                                </Badge>
                                                <Badge variant="outline" className="border-blue-200 text-blue-600 uppercase font-black text-[9px]">
                                                    Plan {emp.plan || 'Trial'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{emp.nombre}</h3>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                <Globe size={14} className="text-slate-400" />
                                                {emp.rfc || 'Sin RFC'}
                                            </div>
                                        </div>

                                        {/* Stats reales */}
                                        <div className="grid grid-cols-2 gap-3 mb-6 pt-6 border-t border-slate-50">
                                            <div className="bg-slate-50 rounded-xl p-3">
                                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                    <Users size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Colaboradores</span>
                                                </div>
                                                <p className="text-lg font-black text-slate-700">{userCount}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-3">
                                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                    <Calendar size={12} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Registro</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-700">{formatFechaCorta(emp.created_at)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleEdit(emp)}
                                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                                            >
                                                Configurar
                                            </button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-slate-100 shadow-2xl">
                                                    <DropdownMenuItem onClick={() => handleEdit(emp)} className="rounded-xl gap-3 font-bold text-xs py-2.5">
                                                        <Edit size={14} className="text-blue-600" /> Editar Datos
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/admin/empresas/${emp.id}/usuarios`)}
                                                        className="rounded-xl gap-3 font-bold text-xs py-2.5"
                                                    >
                                                        <UserCog size={14} className="text-slate-600" /> Gestionar Usuarios
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/admin/empresas/${emp.id}/roles`)}
                                                        className="rounded-xl gap-3 font-bold text-xs py-2.5"
                                                    >
                                                        <Settings size={14} className="text-violet-600" /> Configurar Roles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(emp)}
                                                        className={`rounded-xl gap-3 font-bold text-xs py-2.5 ${emp.activo ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                    >
                                                        {emp.activo ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                                        {emp.activo ? 'Suspender Empresa' : 'Activar Empresa'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Wizard para nueva empresa */}
            <WizardCrearEmpresa
                open={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                onSuccess={cargarEmpresas}
            />

            {/* Dialog para editar empresa existente */}
            <NewCompanyDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={cargarEmpresas}
                initialData={selectedEmpresa}
            />
        </AdminLayout>
    )
}
