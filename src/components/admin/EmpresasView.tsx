/**
 * EmpresasView — Gestión de Empresas Clientes
 * 
 * Vista premium para gestionar las empresas clientes del SaaS.
 * Incluye métricas, filtrado, tarjetas de empresa y acciones contextuales.
 * Diseño unificado con el estilo de GestionRoles (pilares ERP).
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Users,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Building,
    CreditCard,
    TrendingUp,
    Globe,
    ShieldCheck,
    Zap,
    Crown,
    Loader2,
    RefreshCw,
    ExternalLink,
    BarChart3,
    ArrowUpRight,
    Sparkles,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NewCompanyDialog } from './NewCompanyDialog'
import { empresasService } from '@/services/dataService'
import toast from 'react-hot-toast'

interface Empresa {
    id: string
    nombre: string
    razon_social: string
    rfc: string
    direccion: string
    telefono: string
    email: string
    plan_type: 'basico' | 'profesional' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
    usuarios_count: number
    created_at: string
}

// ════════════════════════════════════════════════════════
// CONFIGURACIÓN DE DISEÑO
// ════════════════════════════════════════════════════════

const PLAN_CONFIG = {
    basico: {
        bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200',
        gradient: 'from-slate-500 to-slate-600', label: 'Básico', icon: Building
    },
    profesional: {
        bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200',
        gradient: 'from-blue-500 to-indigo-600', label: 'Profesional', icon: Zap
    },
    enterprise: {
        bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200',
        gradient: 'from-purple-500 to-indigo-600', label: 'Enterprise', icon: Crown
    }
}

const STATUS_CONFIG = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Activa', icon: CheckCircle },
    inactive: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Inactiva', icon: XCircle },
    suspended: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Suspendida', icon: AlertTriangle }
}

// ════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════

export function EmpresasView() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
    const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false)

    const fetchEmpresas = async () => {
        setLoading(true)
        try {
            const data = await empresasService.getAll()
            const mappedData: Empresa[] = data.map((e: any) => ({
                id: e.id,
                nombre: e.nombre,
                razon_social: e.razon_social || '',
                rfc: e.rfc || '',
                direccion: e.direccion || '',
                telefono: e.telefono || '',
                email: e.email || '',
                plan_type: (e.plan as any) || 'basico',
                status: e.activa !== false ? 'active' : 'inactive',
                usuarios_count: e.usuarios_count || 0,
                created_at: e.created_at
            }))
            setEmpresas(mappedData)
        } catch (error) {
            console.error('Error fetching empresas:', error)
            toast.error('Error al cargar empresas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmpresas()
    }, [])

    // Métricas derivadas
    const metricas = useMemo(() => ({
        total: empresas.length,
        activas: empresas.filter(e => e.status === 'active').length,
        inactivas: empresas.filter(e => e.status !== 'active').length,
        totalUsuarios: empresas.reduce((sum, e) => sum + e.usuarios_count, 0),
        enterprise: empresas.filter(e => e.plan_type === 'enterprise').length,
        profesional: empresas.filter(e => e.plan_type === 'profesional').length,
    }), [empresas])

    const filteredEmpresas = useMemo(() => {
        return empresas.filter(empresa => {
            const matchesSearch =
                empresa.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                empresa.rfc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                empresa.email.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = filterStatus === 'all' || empresa.status === filterStatus
            return matchesSearch && matchesStatus
        })
    }, [empresas, searchQuery, filterStatus])

    const handleEdit = (empresa: Empresa) => {
        setSelectedEmpresa(empresa)
        setIsNewCompanyDialogOpen(true)
    }

    const handleToggleStatus = async (empresa: Empresa) => {
        const nuevoEstado = empresa.status !== 'active'
        const confirmMessage = nuevoEstado
            ? `¿Reactivar la empresa ${empresa.nombre}?`
            : `¿Suspender la empresa ${empresa.nombre}? Sus usuarios perderán acceso.`

        if (!window.confirm(confirmMessage)) return

        try {
            await empresasService.toggleStatus(empresa.id, nuevoEstado)
            toast.success(nuevoEstado ? 'Empresa reactivada con éxito' : 'Empresa suspendida')
            fetchEmpresas()
        } catch (error) {
            toast.error('Error al cambiar estado')
            console.error(error)
        }
    }

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'short', year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="space-y-8">
            <NewCompanyDialog
                open={isNewCompanyDialogOpen}
                onOpenChange={(open) => {
                    setIsNewCompanyDialogOpen(open)
                    if (!open) setSelectedEmpresa(null)
                }}
                onSuccess={() => {
                    fetchEmpresas()
                    setSelectedEmpresa(null)
                }}
                initialData={selectedEmpresa}
            />

            {/* ──── Header Premium ──── */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Ecosistema Empresarial
                                </h1>
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[10px] font-black uppercase tracking-widest">
                                    SaaS Core
                                </Badge>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mt-1">
                                Administración centralizada de clientes corporativos y suscripciones activas.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchEmpresas}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedEmpresa(null)
                                setIsNewCompanyDialogOpen(true)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 rounded-xl font-bold"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Empresa
                        </Button>
                    </div>
                </div>
            </div>

            {/* ──── Métricas KPI ──── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Empresas', value: metricas.total, icon: Building2, color: 'from-slate-600 to-slate-700', iconBg: 'bg-white/20' },
                    { label: 'Activas', value: metricas.activas, icon: CheckCircle, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-white/20' },
                    { label: 'Inactivas', value: metricas.inactivas, icon: XCircle, color: 'from-rose-500 to-pink-600', iconBg: 'bg-white/20' },
                    { label: 'Usuarios Totales', value: metricas.totalUsuarios, icon: Users, color: 'from-blue-500 to-indigo-600', iconBg: 'bg-white/20' },
                    { label: 'Enterprise', value: metricas.enterprise, icon: Crown, color: 'from-purple-500 to-indigo-600', iconBg: 'bg-white/20' },
                    { label: 'Profesional', value: metricas.profesional, icon: Zap, color: 'from-amber-500 to-orange-600', iconBg: 'bg-white/20' },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 shadow-lg text-white group hover:scale-[1.03] transition-transform cursor-default`}
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
                        <div className="relative z-10">
                            <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <h3 className="text-2xl font-black">{stat.value}</h3>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ──── Buscador y Filtros Premium ──── */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, RFC o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                        />
                    </div>

                    <div className="flex p-1.5 bg-slate-100/50 rounded-2xl w-full lg:w-fit border border-slate-100">
                        {[
                            { valor: 'all', label: 'Todas', icon: Globe },
                            { valor: 'active', label: 'Activas', icon: CheckCircle },
                            { valor: 'inactive', label: 'Inactivas', icon: XCircle },
                            { valor: 'suspended', label: 'Suspendidas', icon: AlertTriangle }
                        ].map(filtro => (
                            <button
                                key={filtro.valor}
                                onClick={() => setFilterStatus(filtro.valor as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                    ${filterStatus === filtro.valor
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
            </div>

            {/* ──── Grid de Empresas ──── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Ecosistema...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredEmpresas.map((empresa, index) => {
                            const statusConfig = STATUS_CONFIG[empresa.status]
                            const planConfig = PLAN_CONFIG[empresa.plan_type]
                            const PlanIcon = planConfig.icon

                            return (
                                <motion.div
                                    key={empresa.id}
                                    layoutId={`empresa-${empresa.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group"
                                >
                                    <div className="h-full bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden">
                                        {/* Decoración de fondo */}
                                        <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full bg-gradient-to-br ${planConfig.gradient} opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-150 transition-all duration-700`} />

                                        {/* Header: Avatar + Nombre */}
                                        <div className="flex items-start justify-between mb-5 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${planConfig.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform group-hover:rotate-6 duration-500`}>
                                                    {empresa.nombre.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors truncate">
                                                        {empresa.nombre}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-400 font-mono truncate">{empresa.rfc || 'Sin RFC'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleEdit(empresa)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Badges: Plan + Status */}
                                        <div className="flex gap-2 mb-5 relative z-10">
                                            <Badge className={`text-[10px] font-black uppercase tracking-widest ${planConfig.bg} ${planConfig.text} border-none gap-1.5`}>
                                                <PlanIcon className="w-3 h-3" />
                                                {planConfig.label}
                                            </Badge>
                                            <Badge className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} border-none gap-1.5`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                {statusConfig.label}
                                            </Badge>
                                        </div>

                                        {/* Detalle de contacto */}
                                        <div className="space-y-2.5 mb-5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 relative z-10">
                                            {empresa.direccion && (
                                                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate font-medium">{empresa.direccion}</span>
                                                </div>
                                            )}
                                            {empresa.telefono && (
                                                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-medium">{empresa.telefono}</span>
                                                </div>
                                            )}
                                            {empresa.email && (
                                                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate font-medium">{empresa.email}</span>
                                                </div>
                                            )}
                                            {!empresa.direccion && !empresa.telefono && !empresa.email && (
                                                <div className="text-xs text-slate-300 italic font-medium text-center py-1">
                                                    Sin información de contacto
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer: Users count + Fecha + Acciones */}
                                        <div className="pt-5 border-t border-slate-100/50 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Users className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="font-bold text-slate-700">{empresa.usuarios_count}</span>
                                                    <span className="text-slate-400">usuarios</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(empresa.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(empresa)}
                                                    className="px-3 py-2 rounded-xl text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-all"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(empresa)}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all
                                                        ${empresa.status === 'active'
                                                            ? 'text-rose-500 hover:bg-rose-50'
                                                            : 'text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={empresa.status === 'active' ? 'Suspender' : 'Reactivar'}
                                                >
                                                    {empresa.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* ──── Empty State Premium ──── */}
            {!loading && filteredEmpresas.length === 0 && (
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
                        {searchQuery
                            ? `No hay coincidencias para "${searchQuery}" en el ecosistema empresarial.`
                            : 'Registra la primera empresa para comenzar a operar el SaaS.'
                        }
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => {
                                setSelectedEmpresa(null)
                                setIsNewCompanyDialogOpen(true)
                            }}
                            className="px-8 py-4 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5 stroke-[3]" />
                            Registrar Primera Empresa
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    )
}
