/**
 * MediFlow ERP - Admin Empresa Dashboard
 * Premium dashboard for Enterprise Administrators
 * Aligned with Super Admin style but focused on tenant-level management
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
    Card,
    Grid,
    Badge,
    ProgressBar,
    Button,
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Metric,
    Text,
    Flex
} from '@tremor/react'
import {
    Building2,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    FileText,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Stethoscope,
    Package,
    CreditCard,
    Settings,
    ChevronRight,
    RefreshCw,
    Heart,
    Microscope,
    Shield,
    UserPlus,
    CalendarPlus,
    ClipboardList,
    Briefcase,
    PieChart,
    BarChart3,
    Bell,
    Info,
    Eye,
    ArrowUpRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell } from 'recharts'

// ============================================================
// MOCK DATA - Replace with real Supabase queries
// ============================================================

const EMPRESA_STATS = {
    nombreEmpresa: 'Clínica Medical Center',
    plan: 'Professional',
    totalUsuarios: 45,
    usuariosActivos: 42,
    totalPacientes: 1284,
    pacientesNuevosMes: 48,
    citasHoy: 28,
    citasMes: 432,
    ingresosMes: 285000,
    ingresosMesAnterior: 265000,
    facturasPendientes: 12,
    montoPendiente: 24000,
    ocupacion: 87
}

const REVENUE_DATA = [
    { name: 'Ene', value: 180000 },
    { name: 'Feb', value: 195000 },
    { name: 'Mar', value: 210000 },
    { name: 'Abr', value: 225000 },
    { name: 'May', value: 240000 },
    { name: 'Jun', value: 265000 },
    { name: 'Jul', value: 285000 },
]

const ACTIVITY_DATA = [
    { name: 'Lun', consultas: 24, examenes: 18, rayosx: 8 },
    { name: 'Mar', consultas: 32, examenes: 22, rayosx: 12 },
    { name: 'Mie', consultas: 28, examenes: 20, rayosx: 10 },
    { name: 'Jue', consultas: 35, examenes: 25, rayosx: 15 },
    { name: 'Vie', consultas: 42, examenes: 28, rayosx: 18 },
    { name: 'Sab', consultas: 18, examenes: 12, rayosx: 5 },
]

const SERVICES_DISTRIBUTION = [
    { name: 'Consultas', value: 45, color: '#3B82F6' },
    { name: 'Laboratorio', value: 25, color: '#10B981' },
    { name: 'Rayos X', value: 15, color: '#8B5CF6' },
    { name: 'Certificados', value: 10, color: '#F59E0B' },
    { name: 'Otros', value: 5, color: '#6B7280' },
]

const QUICK_MODULES = [
    { id: 'agenda', title: 'Agenda', icon: Calendar, path: '/app/agenda', color: 'from-blue-500 to-cyan-500', count: 28 },
    { id: 'pacientes', title: 'Pacientes', icon: Users, path: '/app/pacientes', color: 'from-green-500 to-emerald-500', count: 1284 },
    { id: 'examenes', title: 'Exámenes', icon: Microscope, path: '/app/examenes', color: 'from-purple-500 to-violet-500', count: null },
    { id: 'rayosx', title: 'Rayos X', icon: Heart, path: '/app/rayos-x', color: 'from-pink-500 to-rose-500', count: null },
    { id: 'facturacion', title: 'Facturación', icon: CreditCard, path: '/app/facturacion', color: 'from-amber-500 to-orange-500', count: 12 },
    { id: 'inventario', title: 'Inventario', icon: Package, path: '/app/inventario', color: 'from-teal-500 to-cyan-500', count: null },
]

const RECENT_TRANSACTIONS = [
    { id: '#TR-8832', paciente: 'María García', concepto: 'Consulta General', fecha: 'Hoy, 10:30', status: 'Pagado', monto: 800 },
    { id: '#TR-8831', paciente: 'Carlos López', concepto: 'Paquete Laboratorio', fecha: 'Hoy, 09:15', status: 'Pendiente', monto: 1250 },
    { id: '#TR-8830', paciente: 'Ana Martínez', concepto: 'Certificado Médico', fecha: 'Ayer, 16:45', status: 'Pagado', monto: 450 },
    { id: '#TR-8829', paciente: 'Juan Rodríguez', concepto: 'Rayos X Tórax', fecha: 'Ayer, 14:20', status: 'Pagado', monto: 600 },
]

const TODAY_APPOINTMENTS = [
    { hora: '09:00', paciente: 'María García', tipo: 'Consulta General', doctor: 'Dr. Ramírez', status: 'completada' },
    { hora: '09:30', paciente: 'Carlos López', tipo: 'Laboratorio', doctor: 'Lab. Central', status: 'en_progreso' },
    { hora: '10:00', paciente: 'Ana Martínez', tipo: 'Rayos X', doctor: 'Téc. González', status: 'pendiente' },
    { hora: '10:30', paciente: 'Juan Rodríguez', tipo: 'Examen Ocupacional', doctor: 'Dr. López', status: 'pendiente' },
    { hora: '11:00', paciente: 'Laura Sánchez', tipo: 'Consulta General', doctor: 'Dra. Pérez', status: 'pendiente' },
]

const SYSTEM_ALERTS = [
    { id: '1', type: 'warning', title: 'Inventario Bajo', message: 'Reactivos de laboratorio al 15%', time: 'Hace 2h' },
    { id: '2', type: 'info', title: 'Mantenimiento', message: 'Equipo de Rayos X requiere servicio', time: 'Hace 5h' },
    { id: '3', type: 'error', title: 'Certificados', message: '5 certificados pendientes de firma', time: 'Hace 1d' },
]

// ============================================================
// COMPONENT
// ============================================================

export function AdminView() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const refreshData = () => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 1500)
    }

    const ingresosTrend = ((EMPRESA_STATS.ingresosMes - EMPRESA_STATS.ingresosMesAnterior) / EMPRESA_STATS.ingresosMesAnterior * 100).toFixed(1)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* ============================================================ */}
            {/* HERO HEADER */}
            {/* ============================================================ */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white"
            >
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 px-6 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            {/* Left: Title & Status */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm font-medium">
                                        Administrador de Empresa
                                    </span>
                                    <Badge color="emerald" className="bg-emerald-400/20 text-emerald-100">
                                        Plan {EMPRESA_STATS.plan}
                                    </Badge>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
                                        {EMPRESA_STATS.nombreEmpresa}
                                    </span>
                                </h1>
                                <p className="text-emerald-100 mt-2 text-lg">
                                    Bienvenido, {user?.nombre || 'Admin'} • <span className="text-emerald-300">{EMPRESA_STATS.citasHoy} citas para hoy</span>
                                </p>
                            </div>

                            {/* Right: Quick Actions */}
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={refreshData}
                                    variant="secondary"
                                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Actualizar
                                </Button>
                                <Button
                                    onClick={() => navigate('/app/agenda/nueva')}
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-emerald-900/20"
                                >
                                    <CalendarPlus className="w-4 h-4 mr-2" />
                                    Nueva Cita
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats Bar */}
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Citas Hoy', value: EMPRESA_STATS.citasHoy, icon: Calendar, color: 'text-emerald-300' },
                                { label: 'Pacientes', value: EMPRESA_STATS.totalPacientes.toLocaleString(), icon: Users, color: 'text-teal-300' },
                                { label: 'Ocupación', value: `${EMPRESA_STATS.ocupacion}%`, icon: Activity, color: 'text-cyan-300' },
                                { label: 'Ingresos Mes', value: `$${(EMPRESA_STATS.ingresosMes / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-green-300' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-emerald-100 text-sm">{stat.label}</span>
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    </div>
                                    <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ============================================================ */}
            {/* MAIN CONTENT */}
            {/* ============================================================ */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Quick Access Modules */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {QUICK_MODULES.map((module, index) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.03, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                to={module.path}
                                className={`block bg-gradient-to-br ${module.color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all h-full`}
                            >
                                <div className="flex items-start justify-between">
                                    <module.icon className="w-8 h-8 opacity-90" />
                                    {module.count !== null && (
                                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-medium">
                                            {module.count}
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-3 font-semibold text-lg">{module.title}</h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: 'Ingresos del Mes',
                            value: `$${(EMPRESA_STATS.ingresosMes / 1000).toFixed(0)}K`,
                            subtext: 'MXN',
                            icon: DollarSign,
                            color: 'emerald',
                            trend: `+${ingresosTrend}%`,
                            trendUp: true
                        },
                        {
                            label: 'Nuevos Pacientes',
                            value: EMPRESA_STATS.pacientesNuevosMes,
                            subtext: 'Este mes',
                            icon: UserPlus,
                            color: 'blue',
                            trend: '+12%',
                            trendUp: true
                        },
                        {
                            label: 'Tasa de Ocupación',
                            value: `${EMPRESA_STATS.ocupacion}%`,
                            subtext: 'Promedio semanal',
                            icon: Activity,
                            color: 'purple',
                            trend: '+5%',
                            trendUp: true
                        },
                        {
                            label: 'Facturas Pendientes',
                            value: EMPRESA_STATS.facturasPendientes,
                            subtext: `$${(EMPRESA_STATS.montoPendiente / 1000).toFixed(0)}K`,
                            icon: FileText,
                            color: 'amber',
                            trend: '-3',
                            trendUp: false
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                    </div>
                                    <span className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <Metric className="text-3xl">{stat.value}</Metric>
                                    <Text className="text-slate-500">{stat.subtext}</Text>
                                    <Text className="text-slate-400 mt-1">{stat.label}</Text>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Tendencia de Ingresos</h3>
                                    <p className="text-sm text-slate-500">Últimos 7 meses</p>
                                </div>
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={REVENUE_DATA}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}K`} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Activity Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Actividad Operativa</h3>
                                    <p className="text-sm text-slate-500">Servicios por día</p>
                                </div>
                                <div className="flex space-x-3">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-xs text-slate-500">Consultas</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                        <span className="text-xs text-slate-500">Lab</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="text-xs text-slate-500">RX</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ACTIVITY_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                        <Bar dataKey="consultas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="examenes" fill="#34D399" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="rayosx" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Bottom Tabs Section */}
                <Card className="p-0 overflow-hidden">
                    <TabGroup index={activeTab} onIndexChange={setActiveTab}>
                        <TabList className="px-6 pt-4 bg-slate-50 border-b">
                            <Tab icon={Calendar}>Citas de Hoy</Tab>
                            <Tab icon={CreditCard}>Transacciones</Tab>
                            <Tab icon={AlertTriangle}>Alertas</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Today's Appointments */}
                            <TabPanel className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Agenda del Día</h3>
                                    <Link to="/app/agenda" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium">
                                        Ver completa <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {TODAY_APPOINTMENTS.map((cita, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <span className="text-lg font-bold text-slate-800">{cita.hora}</span>
                                                </div>
                                                <div className="w-px h-10 bg-slate-200"></div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{cita.paciente}</h4>
                                                    <p className="text-sm text-slate-500">{cita.tipo} • {cita.doctor}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${cita.status === 'completada' ? 'bg-green-100 text-green-700' :
                                                    cita.status === 'en_progreso' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {cita.status === 'completada' ? 'Completada' :
                                                    cita.status === 'en_progreso' ? 'En Progreso' : 'Pendiente'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>

                            {/* Transactions */}
                            <TabPanel className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Transacciones Recientes</h3>
                                    <Link to="/app/facturacion" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium">
                                        Ver todas <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-xl">ID</th>
                                                <th className="px-4 py-3">Paciente</th>
                                                <th className="px-4 py-3">Concepto</th>
                                                <th className="px-4 py-3">Fecha</th>
                                                <th className="px-4 py-3">Estado</th>
                                                <th className="px-4 py-3 rounded-r-xl text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {RECENT_TRANSACTIONS.map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-4 font-medium text-slate-900">{row.id}</td>
                                                    <td className="px-4 py-4 text-slate-700">{row.paciente}</td>
                                                    <td className="px-4 py-4 text-slate-600">{row.concepto}</td>
                                                    <td className="px-4 py-4 text-slate-500">{row.fecha}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold text-slate-900">${row.monto.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabPanel>

                            {/* Alerts */}
                            <TabPanel className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Alertas del Sistema</h3>
                                    <Button variant="secondary" size="xs" icon={Bell}>Configurar</Button>
                                </div>
                                <div className="space-y-3">
                                    {SYSTEM_ALERTS.map((alert) => (
                                        <div key={alert.id} className={`p-4 rounded-xl flex items-start gap-4 ${alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                                                alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                                                    'bg-blue-50 border border-blue-200'
                                            }`}>
                                            {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                                            {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
                                            {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
                                            <div className="flex-1">
                                                <p className={`font-medium ${alert.type === 'warning' ? 'text-amber-800' :
                                                        alert.type === 'error' ? 'text-red-800' :
                                                            'text-blue-800'
                                                    }`}>{alert.title}</p>
                                                <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                                                <p className="text-xs text-slate-400 mt-2">{alert.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>

            </div>
        </div>
    )
}
