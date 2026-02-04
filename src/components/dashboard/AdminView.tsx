import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, TrendingUp, AlertTriangle, FileText, Activity, ArrowRight, Package, AlertCircle } from 'lucide-react'
import { PremiumStatCard } from './PremiumStatCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { inventoryService } from '@/services/inventoryService'
import { InventoryStats } from '@/types/inventory'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Datos simulados para gráficos (Mantener simulados por ahora para visualización)
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

    useEffect(() => {
        if (!user?.empresa_id) return;

        inventoryService.getStats(user.empresa_id)
            .then(data => {
                setStats(data);

                // Generar alertas basadas en datos reales
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
            .catch(console.error);
    }, [user?.empresa_id]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Dashboard Empresa */}
            <PremiumPageHeader
                title="Panel Administrativo"
                subtitle="Gestión operativa y financiera de la sucursal con monitoreo Inteligente."
                badge="ADMIN EMPRESA"
                icon={TrendingUp}
                actions={
                    <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl shadow-2xl backdrop-blur-md px-6 py-2.5 font-bold text-xs uppercase tracking-wider">
                        Descargar Reporte Mensual
                    </Button>
                }
            />
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Tendencia de Ingresos</h3>
                            <p className="text-sm text-slate-500">Últimos 7 meses</p>
                        </div>
                        <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Actividad Operativa</h3>
                            <p className="text-sm text-slate-500">Consultas vs Exámenes</p>
                        </div>
                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                                <span className="text-xs text-slate-500">Consultas</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                <span className="text-xs text-slate-500">Exámenes</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                                />
                                <Bar dataKey="consultas" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="examenes" fill="#0d9488" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: Alerts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Alerts */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="lg:col-span-1 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                        Alertas del Sistema
                    </h3>
                    <div className="space-y-4">
                        {stats ? (
                            alerts.length > 0 ? alerts.map((alert, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{alert.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{alert.desc}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${alert.type === 'warning' ? 'bg-amber-500' :
                                            alert.type === 'error' ? 'bg-red-500' :
                                                alert.type === 'success' ? 'bg-emerald-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    Sistema Estable
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full rounded-2xl" />
                                <Skeleton className="h-20 w-full rounded-2xl" />
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Transactions Table (Simplified) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50"
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
        </div>
    )
}

