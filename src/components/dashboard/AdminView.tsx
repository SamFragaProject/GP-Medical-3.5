import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, TrendingUp, AlertTriangle, FileText, Activity, ArrowRight, Package, AlertCircle, CalendarPlus, UserPlus, FileArchive, Settings } from 'lucide-react'
import { PremiumStatCard } from './PremiumStatCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { inventoryService } from '@/services/inventoryService'
import { InventoryStats } from '@/types/inventory'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { SmartPatientRegistrationDialog } from '@/components/patients/SmartPatientRegistrationDialog';
import { ComunicadosFeed } from './ComunicadosFeed';

// Datos simulados para gráficos
const revenueData = [
    { name: 'Ene', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Abr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
]

const activityData = [
    { name: 'Lun', consultas: 12, examenes: 8 },
    { name: 'Mar', consultas: 19, examenes: 12 },
    { name: 'Mie', consultas: 15, examenes: 10 },
    { name: 'Jue', consultas: 22, examenes: 15 },
    { name: 'Vie', consultas: 28, examenes: 18 },
    { name: 'Sab', consultas: 10, examenes: 5 },
]

export function AdminView() {
    const { user } = useAuth();
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [alerts, setAlerts] = useState<{ title: string, desc: string, type: 'warning' | 'error' | 'info' | 'success' }[]>([]);
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

    useEffect(() => {
        if (!user?.empresa_id) {
            setStats({
                totalValue: 0,
                totalItems: 0,
                lowStockItems: 0,
                expiredItems: 0
            });
            setAlerts([{
                title: 'Sin empresa asignada',
                desc: 'Contacta al administrador para vincular tu cuenta a una empresa.',
                type: 'info'
            }]);
            return;
        }

        inventoryService.getStats(user.empresa_id)
            .then(data => {
                setStats(data);
                const newAlerts = [];
                if (data.lowStockItems > 0) {
                    newAlerts.push({
                        title: 'Stock Bajo Crítico',
                        desc: `${data.lowStockItems} productos requieren reabastecimiento inmediato`,
                        type: 'warning' as const
                    });
                }
                if (data.expiredItems > 0) {
                    newAlerts.push({
                        title: 'Productos Caducados',
                        desc: `${data.expiredItems} items han vencido. Retirar del inventario`,
                        type: 'error' as const
                    });
                }
                if (newAlerts.length === 0) {
                    newAlerts.push({
                        title: 'Sistema Estable',
                        desc: 'El inventario opera dentro de los parámetros normales',
                        type: 'success' as const
                    });
                }
                setAlerts(newAlerts);
            })
            .catch(err => {
                console.error('Error fetching inventory stats:', err);
                setStats({
                    totalValue: 0,
                    totalItems: 0,
                    lowStockItems: 0,
                    expiredItems: 0
                });
                setAlerts([{
                    title: 'Error de conexión',
                    desc: 'No se pudieron cargar las estadísticas del inventario',
                    type: 'warning'
                }]);
            });
    }, [user?.empresa_id]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    }

    return (
        <div className="space-y-6 pb-12">
            <SmartPatientRegistrationDialog
                open={isRegisterDialogOpen}
                onOpenChange={setIsRegisterDialogOpen}
                onSuccess={() => window.location.reload()}
                empresaId={user?.empresa_id}
            />

            {/* Header */}
            <PremiumPageHeader
                title="Panel Administrativo"
                subtitle="Gestión operativa y financiera de la sucursal con monitoreo Inteligente."
                badge="ADMIN EMPRESA"
                icon={TrendingUp}
                actions={
                    <div className="flex gap-3">
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider"
                            onClick={() => setIsRegisterDialogOpen(true)}
                        >
                            Nuevo Paciente
                        </Button>
                        <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl shadow-2xl backdrop-blur-md px-6 py-2.5 font-bold text-xs uppercase tracking-wider">
                            Descargar Reporte
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards — compact row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <PremiumStatCard
                    title="Valor de Inventario"
                    value={stats ? formatMoney(stats.totalValue) : <Skeleton className="h-8 w-32" />}
                    subtext="Activo Circulante"
                    trend={0}
                    icon={DollarSign}
                    variant="success"
                    delay={0.1}
                />
                <PremiumStatCard
                    title="Nuevos Pacientes"
                    value="48"
                    subtext="Este mes"
                    trend={8.2}
                    icon={Users}
                    variant="primary"
                    delay={0.2}
                />
                <PremiumStatCard
                    title="Items en Inventario"
                    value={stats ? stats.totalItems.toString() : <Skeleton className="h-8 w-16" />}
                    subtext="SKUs Activos"
                    trend={0}
                    icon={Package}
                    variant="warning"
                    delay={0.3}
                />
                <PremiumStatCard
                    title="Alertas Activas"
                    value={stats ? (stats.lowStockItems + stats.expiredItems).toString() : <Skeleton className="h-8 w-8" />}
                    subtext="Requieren Atención"
                    trend={stats && (stats.lowStockItems + stats.expiredItems) > 0 ? -10 : 0}
                    trendLabel={stats && (stats.lowStockItems + stats.expiredItems) > 0 ? "Crítico" : "Estable"}
                    icon={AlertTriangle}
                    variant={stats && (stats.lowStockItems + stats.expiredItems) > 0 ? "danger" : "success"}
                    delay={0.4}
                />
            </div>

            {/* ═══════════ MAIN LAYOUT: Feed (hero) + Sidebar Widgets ═══════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* ──── FEED — the star of the show ──── */}
                <div className="col-span-1 xl:col-span-8 order-1 xl:order-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-[0_20px_60px_rgba(0,0,0,0.04)] overflow-hidden"
                    >
                        {/* Scrollable feed container */}
                        <div className="max-h-[calc(100vh-220px)] overflow-y-auto overscroll-contain custom-scrollbar p-6">
                            <ComunicadosFeed />
                        </div>
                    </motion.div>
                </div>

                {/* ──── RIGHT SIDEBAR: stacked widgets ──── */}
                <div className="col-span-1 xl:col-span-4 order-2 xl:order-2 space-y-6">

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        {[
                            { label: 'Nueva Consulta', icon: CalendarPlus, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
                            { label: 'Registro Médico', icon: UserPlus, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                            { label: 'Reportes', icon: FileArchive, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
                            { label: 'Configuración', icon: Settings, gradient: 'from-slate-600 to-slate-800', bg: 'bg-slate-50' },
                        ].map((action, idx) => (
                            <button
                                key={idx}
                                className={`${action.bg} rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </motion.div>

                    {/* Revenue Mini Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Ingresos</h3>
                                <p className="text-xs text-slate-400">Últimos 7 meses</p>
                            </div>
                            <div className="p-1.5 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                                <TrendingUp className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                        <div className="h-36 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Activity Mini Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Actividad Semanal</h3>
                                <p className="text-xs text-slate-400">Consultas vs Exámenes</p>
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-slate-400">Consultas</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                                    <span className="text-[10px] text-slate-400">Exámenes</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-36 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '10px' }} />
                                    <Bar dataKey="consultas" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="examenes" fill="#0d9488" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* System Alerts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
                    >
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                            Alertas del Sistema
                        </h3>
                        <div className="space-y-3">
                            {stats ? (
                                alerts.length > 0 ? alerts.map((alert, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{alert.title}</h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{alert.desc}</p>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full mt-1 ${alert.type === 'warning' ? 'bg-amber-500' :
                                                alert.type === 'error' ? 'bg-red-500' :
                                                    alert.type === 'success' ? 'bg-emerald-500' :
                                                        'bg-blue-500'
                                                }`}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-gray-400 text-xs">
                                        <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        Sistema Estable
                                    </div>
                                )
                            ) : (
                                <div className="space-y-3">
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div> {/* End Right Sidebar */}
            </div> {/* End Main Layout */}

            {/* ═══════════ BOTTOM: Transactions Table (full width) ═══════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Transacciones Recientes</h3>
                    <Button variant="ghost" className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 p-0 h-auto font-medium">
                        Ver todas
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80">
                            <tr>
                                <th className="px-4 py-3 rounded-l-xl font-semibold">ID</th>
                                <th className="px-4 py-3 font-semibold">Concepto</th>
                                <th className="px-4 py-3 font-semibold">Fecha</th>
                                <th className="px-4 py-3 font-semibold">Estado</th>
                                <th className="px-4 py-3 rounded-r-xl text-right font-semibold">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: '#TR-8832', concept: 'Consulta General', date: 'Hoy, 10:30', status: 'Completado', amount: '$800.00' },
                                { id: '#TR-8831', concept: 'Paquete Laboratorio', date: 'Hoy, 09:15', status: 'Pendiente', amount: '$1,250.00' },
                                { id: '#TR-8830', concept: 'Certificado Médico', date: 'Ayer, 16:45', status: 'Completado', amount: '$450.00' },
                                { id: '#TR-8829', concept: 'Rayos X Torax', date: 'Ayer, 14:20', status: 'Completado', amount: '$600.00' },
                            ].map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-slate-900">{row.id}</td>
                                    <td className="px-4 py-4 text-slate-600">{row.concept}</td>
                                    <td className="px-4 py-4 text-slate-500">{row.date}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right font-bold text-slate-900">{row.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
