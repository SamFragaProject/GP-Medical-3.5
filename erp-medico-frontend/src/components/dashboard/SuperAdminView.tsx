/**
 * MediFlow ERP - Ultimate Super Admin Dashboard
 * The most powerful and complete dashboard for platform owners
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@tremor/react';
import {
    Shield,
    Search,
    UserCog,
    LogOut,
    Server,
    Database,
    AlertCircle,
    CheckCircle,
    Building2,
    Users,
    Settings,
    Activity,
    TrendingUp,
    TrendingDown,
    Zap,
    Globe,
    Clock,
    Eye,
    Edit,
    Trash2,
    Plus,
    RefreshCw,
    BarChart3,
    PieChart,
    LineChart,
    Lock,
    Unlock,
    Crown,
    Cpu,
    HardDrive,
    Wifi,
    WifiOff,
    Bell,
    BellRing,
    Calendar,
    FileText,
    CreditCard,
    DollarSign,
    Briefcase,
    Heart,
    Stethoscope,
    ClipboardList,
    Package,
    Layers,
    ToggleLeft,
    ToggleRight,
    ExternalLink,
    ChevronRight,
    ArrowUpRight,
    AlertTriangle,
    Info,
    Terminal,
    Code,
    Boxes,
    Network
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Input } from '@/components/ui/input';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';

// ============================================================
// MOCK DATA - Replace with real Supabase queries
// ============================================================

const PLATFORM_STATS = {
    totalEmpresas: 47,
    empresasActivas: 42,
    totalUsuarios: 1284,
    usuariosActivos: 1156,
    citasHoy: 328,
    citasMes: 8432,
    ingresosMes: 485000,
    ticketPromedio: 850,
    uptime: 99.97,
    cpu: 34,
    ram: 62,
    storage: 45
};

const RECENT_EMPRESAS = [
    { id: '1', nombre: 'Hospital Central', plan: 'Enterprise', usuarios: 156, status: 'active', ingresos: 125000 },
    { id: '2', nombre: 'Clínica Norte', plan: 'Professional', usuarios: 45, status: 'active', ingresos: 45000 },
    { id: '3', nombre: 'Centro Médico Sur', plan: 'Professional', usuarios: 32, status: 'active', ingresos: 38000 },
    { id: '4', nombre: 'Consultorio Dr. Pérez', plan: 'Starter', usuarios: 5, status: 'trial', ingresos: 0 },
    { id: '5', nombre: 'Laboratorio Análisis', plan: 'Professional', usuarios: 28, status: 'active', ingresos: 52000 },
];

const SYSTEM_ALERTS = [
    { id: '1', type: 'warning', message: 'Alto uso de CPU en servidor DB-2', time: 'Hace 5 min' },
    { id: '2', type: 'info', message: 'Backup automático completado', time: 'Hace 1 hora' },
    { id: '3', type: 'success', message: 'Actualización v3.5.2 aplicada', time: 'Hace 3 horas' },
];

const QUICK_MODULES = [
    { id: 'empresas', title: 'Empresas', icon: Building2, path: '/platform/empresas', color: 'from-blue-500 to-cyan-500', count: 47 },
    { id: 'usuarios', title: 'Usuarios', icon: Users, path: '/platform/usuarios', color: 'from-green-500 to-emerald-500', count: 1284 },
    { id: 'rrhh', title: 'RRHH', icon: Briefcase, path: '/platform/rrhh', color: 'from-violet-500 to-purple-500', count: null },
    { id: 'facturacion', title: 'Facturación', icon: CreditCard, path: '/platform/facturacion', color: 'from-pink-500 to-rose-500', count: null },
    { id: 'config', title: 'Configuración', icon: Settings, path: '/platform/configuracion', color: 'from-gray-600 to-slate-700', count: null },
    { id: 'ia', title: 'Módulos IA', icon: Zap, path: '/platform/ia', color: 'from-amber-500 to-orange-500', count: 3 },
];

const SYSTEM_MODULES = [
    { name: 'Citas', enabled: true, icon: Calendar },
    { name: 'Facturación', enabled: true, icon: CreditCard },
    { name: 'Laboratorio', enabled: true, icon: FileText },
    { name: 'Inventario', enabled: true, icon: Package },
    { name: 'RRHH', enabled: true, icon: Briefcase },
    { name: 'Rayos X', enabled: true, icon: Heart },
    { name: 'Extractor IA', enabled: true, icon: Zap },
    { name: 'Telemedicina', enabled: false, icon: Globe },
];

// ============================================================
// COMPONENT
// ============================================================

export function SuperAdminView() {
    const { user, impersonateUser, isImpersonating, stopImpersonation } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modules, setModules] = useState(SYSTEM_MODULES);

    const toggleModule = (index: number) => {
        setModules(prev => prev.map((m, i) =>
            i === index ? { ...m, enabled: !m.enabled } : m
        ));
    };

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* ============================================================ */}
            {/* HERO HEADER */}
            {/* ============================================================ */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white"
            >
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl" />
                </div>

                <div className="relative z-10 px-6 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            {/* Left: Title & Status */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg shadow-amber-500/30">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm font-medium">
                                        Super Administrator
                                    </span>
                                    {isImpersonating && (
                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium animate-pulse">
                                            👁️ Modo Impersonación
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{user?.nombre || 'Admin'}</span>
                                </h1>
                                <p className="text-slate-400 mt-2 text-lg">
                                    Control total del ecosistema MediFlow • <span className="text-green-400">Sistema operativo</span>
                                </p>
                            </div>

                            {/* Right: Quick Actions */}
                            <div className="flex flex-wrap gap-3">
                                {isImpersonating ? (
                                    <Button
                                        onClick={stopImpersonation}
                                        className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Salir de Impersonación
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={refreshData}
                                            variant="secondary"
                                            className="bg-white/10 hover:bg-white/20 text-white border-0"
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                            Actualizar
                                        </Button>
                                        <Button
                                            onClick={() => navigate('/platform/configuracion')}
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configuración Global
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* System Health Bar */}
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Uptime', value: `${PLATFORM_STATS.uptime}%`, icon: Activity, color: 'text-green-400' },
                                { label: 'CPU', value: `${PLATFORM_STATS.cpu}%`, icon: Cpu, color: PLATFORM_STATS.cpu > 80 ? 'text-red-400' : 'text-blue-400' },
                                { label: 'RAM', value: `${PLATFORM_STATS.ram}%`, icon: Server, color: PLATFORM_STATS.ram > 80 ? 'text-amber-400' : 'text-purple-400' },
                                { label: 'Storage', value: `${PLATFORM_STATS.storage}%`, icon: HardDrive, color: 'text-cyan-400' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">{stat.label}</span>
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

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Empresas Activas', value: PLATFORM_STATS.empresasActivas, total: PLATFORM_STATS.totalEmpresas, icon: Building2, color: 'blue', trend: '+3' },
                        { label: 'Usuarios Activos', value: PLATFORM_STATS.usuariosActivos, total: PLATFORM_STATS.totalUsuarios, icon: Users, color: 'green', trend: '+48' },
                        { label: 'Citas Este Mes', value: PLATFORM_STATS.citasMes, total: null, icon: Calendar, color: 'purple', trend: '+12%' },
                        { label: 'Ingresos Mes', value: `$${(PLATFORM_STATS.ingresosMes / 1000).toFixed(0)}K`, total: null, icon: DollarSign, color: 'emerald', trend: '+8%' },
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
                                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                        <TrendingUp className="w-4 h-4" />
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <Metric className="text-3xl">{stat.value}</Metric>
                                    {stat.total && (
                                        <Text className="text-slate-500">de {stat.total} totales</Text>
                                    )}
                                    <Text className="text-slate-400 mt-1">{stat.label}</Text>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Tabs Section */}
                <Card className="p-0 overflow-hidden">
                    <TabGroup index={activeTab} onIndexChange={setActiveTab}>
                        <TabList className="px-6 pt-4 bg-slate-50 border-b">
                            <Tab icon={Building2}>Empresas</Tab>
                            <Tab icon={Layers}>Módulos</Tab>
                            <Tab icon={AlertCircle}>Alertas</Tab>
                            <Tab icon={Shield}>Auditoría</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Empresas Tab */}
                            <TabPanel className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Empresas Recientes</h3>
                                    <Link to="/platform/empresas" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                                        Ver todas <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {RECENT_EMPRESAS.map((empresa) => (
                                        <div key={empresa.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                    {empresa.nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{empresa.nombre}</h4>
                                                    <p className="text-sm text-slate-500">{empresa.usuarios} usuarios • {empresa.plan}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${empresa.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        empresa.status === 'trial' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {empresa.status === 'active' ? 'Activa' : empresa.status === 'trial' ? 'Prueba' : empresa.status}
                                                </span>
                                                <span className="text-slate-600 font-medium">
                                                    ${(empresa.ingresos / 1000).toFixed(0)}K
                                                </span>
                                                <Button variant="secondary" size="xs" icon={Eye}>Ver</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>

                            {/* Módulos Tab */}
                            <TabPanel className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Control de Módulos del Sistema</h3>
                                    <Badge color="blue">8 módulos disponibles</Badge>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {modules.map((module, index) => (
                                        <motion.div
                                            key={module.name}
                                            whileHover={{ scale: 1.02 }}
                                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${module.enabled
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 bg-gray-50'
                                                }`}
                                            onClick={() => toggleModule(index)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <module.icon className={`w-6 h-6 ${module.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                                {module.enabled ? (
                                                    <ToggleRight className="w-8 h-8 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <h4 className={`font-semibold ${module.enabled ? 'text-green-800' : 'text-gray-500'}`}>
                                                {module.name}
                                            </h4>
                                            <p className={`text-sm ${module.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                                {module.enabled ? 'Activo' : 'Desactivado'}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </TabPanel>

                            {/* Alertas Tab */}
                            <TabPanel className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-slate-800">Alertas del Sistema</h3>
                                    <Button variant="secondary" size="xs" icon={Bell}>Configurar</Button>
                                </div>
                                <div className="space-y-3">
                                    {SYSTEM_ALERTS.map((alert) => (
                                        <div key={alert.id} className={`p-4 rounded-xl flex items-start gap-4 ${alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                                                alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                                                    'bg-blue-50 border border-blue-200'
                                            }`}>
                                            {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                                            {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                                            {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
                                            <div className="flex-1">
                                                <p className={`font-medium ${alert.type === 'warning' ? 'text-amber-800' :
                                                        alert.type === 'success' ? 'text-green-800' :
                                                            'text-blue-800'
                                                    }`}>{alert.message}</p>
                                                <p className="text-sm text-slate-500 mt-1">{alert.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>

                            {/* Auditoría Tab */}
                            <TabPanel className="p-0">
                                <AuditLogViewer />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </Card>

            </div>
        </div>
    );
}
