/**
 * Gestión de Empresas - Vista Super Admin
 * 
 * Panel de control de clientes del SaaS con métricas,
 * distribución y gestión completa de tenants
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2, Search, Plus, MoreVertical, Activity, Shield, Loader2,
    MapPin, Mail, Phone, Calendar, Users, TrendingUp, CreditCard,
    ChevronRight, Eye, Edit, Trash2, CheckCircle, XCircle, Globe,
    BarChart3, PieChart, DollarSign, RefreshCw, Download, Settings,
    Star, Zap, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { empresasService, Empresa } from '@/services/dataService'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { NewCompanyDialog } from '@/components/admin/NewCompanyDialog'

// Interfaces
interface MetricasEmpresas {
    totalEmpresas: number
    empresasActivas: number
    empresasInactivas: number
    planBasico: number
    planPro: number
    planEnterprise: number
    ingresosMensuales: number
    usuariosTotales: number
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
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[color]} p-6 shadow-lg text-white`}
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
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

// Componente: Plan Badge
const PlanBadge = ({ plan }: { plan: string }) => {
    const planConfig: Record<string, { icon: any; bg: string; text: string }> = {
        basico: { icon: Star, bg: 'bg-slate-100', text: 'text-slate-700' },
        pro: { icon: Zap, bg: 'bg-blue-100', text: 'text-blue-700' },
        enterprise: { icon: Crown, bg: 'bg-purple-100', text: 'text-purple-700' }
    }
    const config = planConfig[plan] || planConfig.basico
    const Icon = config.icon

    return (
        <Badge className={`${config.bg} ${config.text} border-none flex items-center gap-1.5 px-3 py-1`}>
            <Icon className="w-3 h-3" />
            <span className="capitalize font-bold">{plan}</span>
        </Badge>
    )
}

// Componente: Fila de Empresa
const EmpresaRow = ({ empresa, index, onView, onEdit }: {
    empresa: Empresa; index: number; onView: () => void; onEdit: () => void
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer"
        onClick={onView}
    >
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                {empresa.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
                <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{empresa.nombre}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    {empresa.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {empresa.email}</span>
                    )}
                    {empresa.direccion && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {empresa.direccion}</span>
                    )}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900">{Math.floor(Math.random() * 200) + 10} usuarios</p>
                <p className="text-xs text-gray-500">{Math.floor(Math.random() * 1000) + 50} pacientes</p>
            </div>
            <PlanBadge plan={empresa.plan || 'basico'} />
            <div className={`flex items-center gap-1.5 text-xs font-bold ${empresa.activo ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${empresa.activo ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                {empresa.activo ? 'Activa' : 'Inactiva'}
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <MoreVertical className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </Button>
        </div>
    </motion.div>
)

// Componente: Distribución de Planes
const PlanesDistribucion = ({ basico, pro, enterprise }: { basico: number; pro: number; enterprise: number }) => {
    const total = basico + pro + enterprise || 1
    return (
        <div className="space-y-4">
            {[
                { label: 'Enterprise', value: enterprise, color: 'purple', icon: Crown },
                { label: 'Pro', value: pro, color: 'blue', icon: Zap },
                { label: 'Básico', value: basico, color: 'slate', icon: Star },
            ].map((plan) => (
                <div key={plan.label}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <plan.icon className={`w-4 h-4 text-${plan.color}-500`} />
                            <span className="text-sm font-medium text-gray-700">{plan.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{plan.value}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(plan.value / total) * 100}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 rounded-full`}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function Empresas() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('list')
    const [filtroEstado, setFiltroEstado] = useState<'all' | 'active' | 'inactive'>('all')
    const [filtroPlan, setFiltroPlan] = useState<string>('all')
    const [showDialog, setShowDialog] = useState(false)
    const [empresaAEditar, setEmpresaAEditar] = useState<Empresa | null>(null)

    // Métricas
    const [metricas, setMetricas] = useState<MetricasEmpresas>({
        totalEmpresas: 0, empresasActivas: 0, empresasInactivas: 0,
        planBasico: 0, planPro: 0, planEnterprise: 0,
        ingresosMensuales: 0, usuariosTotales: 0
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await empresasService.getAll()
            setEmpresas(data)

            // Calcular métricas
            const activas = data.filter(e => e.activo).length
            const basico = data.filter(e => e.plan === 'basico' || !e.plan).length
            const pro = data.filter(e => e.plan === 'profesional').length
            const enterprise = data.filter(e => e.plan === 'enterprise').length

            setMetricas({
                totalEmpresas: data.length,
                empresasActivas: activas,
                empresasInactivas: data.length - activas,
                planBasico: basico,
                planPro: pro,
                planEnterprise: enterprise,
                ingresosMensuales: (basico * 500) + (pro * 2000) + (enterprise * 5000),
                usuariosTotales: data.length * Math.floor(Math.random() * 50 + 20)
            })
        } catch (error) {
            console.error('Error al cargar empresas:', error)
            toast.error('Error al cargar lista de empresas')
        } finally {
            setLoading(false)
        }
    }

    const filtered = useMemo(() => {
        return empresas.filter(e => {
            const matchSearch = e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.razon_social?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchEstado = filtroEstado === 'all' ||
                (filtroEstado === 'active' && e.activo) ||
                (filtroEstado === 'inactive' && !e.activo)
            const matchPlan = filtroPlan === 'all' || e.plan === filtroPlan
            return matchSearch && matchEstado && matchPlan
        })
    }, [empresas, searchQuery, filtroEstado, filtroPlan])

    const handleCreate = () => {
        setEmpresaAEditar(null)
        setShowDialog(true)
    }

    const handleEdit = (empresa: Empresa) => {
        setEmpresaAEditar(empresa)
        setShowDialog(true)
    }

    const handleToggleStatus = async (empresa: Empresa) => {
        try {
            await empresasService.toggleStatus(empresa.id, !empresa.activo)
            toast.success(`Empresa ${empresa.activo ? 'desactivada' : 'activada'}`)
            loadData()
        } catch (error) {
            toast.error('Error al cambiar estado de la empresa')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500">Cargando empresas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Header God Mode */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="w-full px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-black tracking-tight">Gestión de Empresas</h1>
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">GOD MODE</Badge>
                                </div>
                                <p className="text-slate-400 text-sm">Administración de clientes y tenants del SaaS</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                                <Download className="w-4 h-4 mr-2" /> Exportar
                            </Button>
                            <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30">
                                <Plus className="w-4 h-4 mr-2" /> Nueva Empresa
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-8 py-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <BigStatCard icon={Building2} title="Total Empresas" value={metricas.totalEmpresas} color="purple" trend={{ direction: 'up', value: '+3' }} />
                    <BigStatCard icon={CheckCircle} title="Activas" value={metricas.empresasActivas} color="emerald" />
                    <BigStatCard icon={XCircle} title="Inactivas" value={metricas.empresasInactivas} color="slate" />
                    <BigStatCard icon={Crown} title="Enterprise" value={metricas.planEnterprise} subtitle="Plan Premium" color="orange" />
                    <BigStatCard icon={Users} title="Usuarios Totales" value={metricas.usuariosTotales.toLocaleString()} color="cyan" />
                    <BigStatCard icon={DollarSign} title="MRR Estimado" value={`$${(metricas.ingresosMensuales / 1000).toFixed(0)}K`} subtitle="Ingresos mensuales" color="blue" trend={{ direction: 'up', value: '+12%' }} />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border shadow-sm p-1.5 rounded-2xl">
                        <TabsTrigger value="list" className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
                            📋 Lista de Empresas
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
                            📊 Analíticas
                        </TabsTrigger>
                        <TabsTrigger value="plans" className="rounded-xl px-6 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
                            💎 Planes
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Lista */}
                    <TabsContent value="list" className="space-y-6">
                        {/* Filtros */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Buscar por nombre, razón social..."
                                            className="pl-10 bg-gray-50 border-gray-200 h-11"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value as any)}
                                        className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="active">Activas</option>
                                        <option value="inactive">Inactivas</option>
                                    </select>
                                    <select
                                        value={filtroPlan}
                                        onChange={(e) => setFiltroPlan(e.target.value)}
                                        className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium"
                                    >
                                        <option value="all">Todos los planes</option>
                                        <option value="basico">Básico</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de Empresas */}
                        <div className="space-y-4">
                            {filtered.length === 0 ? (
                                <Card className="border-0 shadow-lg bg-white p-12 text-center">
                                    <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-bold text-gray-900">No se encontraron empresas</h3>
                                    <p className="text-gray-500 mt-1">Intenta ajustar tu búsqueda o crea una nueva empresa.</p>
                                </Card>
                            ) : (
                                filtered.map((empresa, idx) => (
                                    <EmpresaRow
                                        key={empresa.id}
                                        empresa={empresa}
                                        index={idx}
                                        onView={() => toast.success(`Ver detalles de ${empresa.nombre}`)}
                                        onEdit={() => handleEdit(empresa)}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab: Analíticas */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Distribución por Plan */}
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-purple-500" />
                                        Distribución por Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PlanesDistribucion
                                        basico={metricas.planBasico}
                                        pro={metricas.planPro}
                                        enterprise={metricas.planEnterprise}
                                    />
                                </CardContent>
                            </Card>

                            {/* Estadísticas de Uso */}
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-500" />
                                        Actividad del Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { label: 'Usuarios activos hoy', value: Math.floor(metricas.usuariosTotales * 0.6), max: metricas.usuariosTotales },
                                        { label: 'Citas programadas', value: Math.floor(Math.random() * 500) + 100, max: 800 },
                                        { label: 'Exámenes realizados', value: Math.floor(Math.random() * 200) + 50, max: 400 },
                                        { label: 'Recetas generadas', value: Math.floor(Math.random() * 300) + 80, max: 500 },
                                    ].map((stat) => (
                                        <div key={stat.label}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">{stat.label}</span>
                                                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                                    transition={{ duration: 1 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab: Planes */}
                    <TabsContent value="plans" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: 'Básico', price: '$500', icon: Star, color: 'slate', features: ['5 usuarios', '100 pacientes', 'Soporte email'], count: metricas.planBasico },
                                { name: 'Pro', price: '$2,000', icon: Zap, color: 'blue', features: ['25 usuarios', '1000 pacientes', 'Soporte prioritario', 'API access'], count: metricas.planPro },
                                { name: 'Enterprise', price: '$5,000', icon: Crown, color: 'purple', features: ['Usuarios ilimitados', 'Pacientes ilimitados', 'Soporte 24/7', 'API + Integraciones', 'SLA 99.9%'], count: metricas.planEnterprise },
                            ].map((plan) => (
                                <motion.div
                                    key={plan.name}
                                    whileHover={{ y: -4 }}
                                    className={`bg-white rounded-3xl p-8 border-2 ${plan.color === 'purple' ? 'border-purple-200' : 'border-gray-100'} shadow-lg relative overflow-hidden`}
                                >
                                    {plan.color === 'purple' && (
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-purple-600 text-white">Popular</Badge>
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 rounded-2xl bg-${plan.color}-100 flex items-center justify-center mb-6`}>
                                        <plan.icon className={`w-7 h-7 text-${plan.color}-600`} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-3xl font-black text-gray-900 mb-6">
                                        {plan.price}<span className="text-base font-medium text-gray-500">/mes</span>
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-6 border-t">
                                        <p className="text-center">
                                            <span className="text-3xl font-black text-gray-900">{plan.count}</span>
                                            <span className="text-sm text-gray-500 ml-2">empresas</span>
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <NewCompanyDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onSuccess={() => {
                    loadData()
                    setShowDialog(false)
                }}
                initialData={empresaAEditar}
            />
        </div>
    )
}
