import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, TrendingUp, AlertTriangle, FileText, Activity } from 'lucide-react'
import { PremiumStatCard } from './PremiumStatCard'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

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
    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumStatCard
                    title="Ingresos Totales"
                    value="$128,450"
                    subtext="MXN"
                    trend={15.3}
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
                    title="Tasa de Ocupación"
                    value="87%"
                    subtext="Promedio"
                    trend={-2.1}
                    icon={Activity}
                    variant="warning"
                    delay={0.3}
                />
                <PremiumStatCard
                    title="Facturas Pendientes"
                    value="12"
                    subtext="$24,000"
                    trend={-5}
                    trendLabel="vs mes anterior"
                    icon={FileText}
                    variant="danger"
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
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Tendencia de Ingresos</h3>
                            <p className="text-sm text-gray-500">Últimos 7 meses</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
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
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Actividad Operativa</h3>
                            <p className="text-sm text-gray-500">Consultas vs Exámenes</p>
                        </div>
                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-500">Consultas</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                <span className="text-xs text-gray-500">Exámenes</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="consultas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="examenes" fill="#34D399" radius={[4, 4, 0, 0]} />
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
                    className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                        Alertas del Sistema
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Inventario Bajo', desc: 'Reactivos de laboratorio al 15%', type: 'warning' },
                            { title: 'Mantenimiento', desc: 'Equipo de Rayos X requiere servicio', type: 'info' },
                            { title: 'Certificados', desc: '5 certificados pendientes de firma', type: 'error' },
                        ].map((alert, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{alert.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{alert.desc}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${alert.type === 'warning' ? 'bg-amber-500' : alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Transactions Table (Simplified) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Transacciones Recientes</h3>
                        <button className="text-sm text-primary font-medium hover:underline">Ver todas</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">ID</th>
                                    <th className="px-4 py-3">Concepto</th>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 rounded-r-xl text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: '#TR-8832', concept: 'Consulta General', date: 'Hoy, 10:30', status: 'Completado', amount: '$800.00' },
                                    { id: '#TR-8831', concept: 'Paquete Laboratorio', date: 'Hoy, 09:15', status: 'Pendiente', amount: '$1,250.00' },
                                    { id: '#TR-8830', concept: 'Certificado Médico', date: 'Ayer, 16:45', status: 'Completado', amount: '$450.00' },
                                    { id: '#TR-8829', concept: 'Rayos X Torax', date: 'Ayer, 14:20', status: 'Completado', amount: '$600.00' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 font-medium text-gray-900">{row.id}</td>
                                        <td className="px-4 py-4 text-gray-600">{row.concept}</td>
                                        <td className="px-4 py-4 text-gray-500">{row.date}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Completado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-gray-900">{row.amount}</td>
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
