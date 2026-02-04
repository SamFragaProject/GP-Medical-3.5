import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Users,
    Calendar,
    Bell,
    Search,
    ChevronRight,
    TrendingUp,
    Shield,
    Zap,
    Cpu,
    Dna,
    Stethoscope,
    FileText,
    Hospital,
    BarChart3,
    PieChart,
    LineChart,
    Settings,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    UserPlus,
    Target,
    LayoutDashboard
} from 'lucide-react';

export function DashboardPreview() {
    return (
        <section className="py-24 relative overflow-hidden bg-transparent">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[160px] opacity-40 -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[160px] opacity-40 -ml-64 -mb-64" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-full mb-8 shadow-xl"
                    >
                        <LayoutIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Intelligence Console v4.2</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 tracking-tighter leading-none">
                        La <span className="text-emerald-500 italic">Central de Inteligencia</span> <br />
                        de su departamento médico
                    </h2>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                        Una consola de mando unificada que integra CRM clínico, analítica predictiva y gestión de cumplimiento en una sola interfaz de alta fidelidad.
                    </p>
                </motion.div>

                {/* Master CRM Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative max-w-7xl mx-auto"
                >
                    {/* Floating Tech Badges */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-16 -left-12 z-20 hidden lg:block"
                    >
                        <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA Neural Core</div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-16 -right-12 z-20 hidden lg:block"
                    >
                        <div className="p-8 bg-emerald-500 text-white rounded-[3rem] shadow-2xl shadow-emerald-200 text-center">
                            <div className="text-4xl font-black tracking-tighter mb-1">99.9%</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest opacity-80 border-t border-white/20 pt-2">Uptime Garantizado</div>
                        </div>
                    </motion.div>

                    {/* Main Console Box */}
                    <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                        {/* Chrome Header */}
                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                            </div>
                            <div className="flex px-4 py-2 bg-white rounded-xl border border-slate-200 min-w-[300px] justify-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] shadow-inner">
                                <Shield className="w-3.5 h-3.5 mr-3 text-emerald-500" />
                                core.gpmedical.cloud / samuel_admin
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer relative">
                                    <Bell className="w-5 h-5" />
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 border-2 border-slate-800 overflow-hidden">
                                    <img src="https://i.pravatar.cc/100?u=medical" alt="Admin" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        {/* Interactive UI Layout */}
                        <div className="flex h-[800px]">
                            {/* Left Sidebar - High Intensity CRM Icons */}
                            <div className="w-24 lg:w-72 bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group hover:rotate-6 transition-all">
                                        <Activity className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <span className="hidden lg:block font-black text-2xl text-slate-900 tracking-tighter">GP<span className="text-emerald-500">Medical</span></span>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { icon: LayoutDashboard, label: 'Resumen', active: true },
                                        { icon: Target, label: 'Pipeline' },
                                        { icon: Users, label: 'Empresas' },
                                        { icon: FileText, label: 'Expedientes' },
                                        { icon: LineChart, label: 'Analytics' },
                                        { icon: Settings, label: 'Config' },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all ${item.active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                            }`}>
                                            <item.icon className="w-6 h-6 flex-shrink-0" />
                                            <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] hidden lg:block border border-slate-800 shadow-2xl">
                                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Soporte Premium</div>
                                    <div className="text-xs text-white/70 font-medium mb-4 leading-relaxed">¿Necesitas ayuda con un reporte STPS?</div>
                                    <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">Solicitar</button>
                                </div>
                            </div>

                            {/* Main Content Viewport */}
                            <div className="flex-1 p-12 overflow-y-auto bg-white space-y-12 scrollbar-hide">
                                {/* Header Stats */}
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Panel Operativo</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 bg-emerald-500/10 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live: Activo</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 hover:text-slate-900 transition-all">
                                            <Search className="w-5 h-5" />
                                        </button>
                                        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all">
                                            <UserPlus className="w-5 h-5" />
                                            Nuevo Ingreso
                                        </button>
                                    </div>
                                </div>

                                {/* CRM KPI Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Exámenes Hoy', val: '52', trend: '+12%', color: 'from-emerald-50' },
                                        { label: 'Pipeline Pendiente', val: '124', trend: 'Active', color: 'from-blue-50' },
                                        { label: 'Compliance Index', val: '98%', trend: 'Verified', color: 'from-purple-50' },
                                        { label: 'Ahorro ROI', val: '$1.2M', trend: 'Monthly', color: 'from-amber-50' },
                                    ].map((kpi, i) => (
                                        <div key={i} className={`p-8 bg-gradient-to-br ${kpi.color} to-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card overflow-hidden relative`}>
                                            <div className="relative z-10">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{kpi.label}</div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.val}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600">{kpi.trend}</span>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover/card:opacity-[0.1] transition-opacity">
                                                <TrendingUp className="w-24 h-24 text-slate-900" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Analytics Layout */}
                                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
                                    {/* Left: Interactive Line Chart Area */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden group/vis h-[400px] flex flex-col">
                                        <div className="flex items-center justify-between mb-10">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Tendencias de Salud Ocupacional</div>
                                                <div className="text-xs text-slate-500 font-medium tracking-tight">Análisis mensual de incidentes vs preventivos</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 uppercase">30 Días</div>
                                                <div className="px-3 py-1.5 bg-slate-900 rounded-xl text-white text-[10px] font-black uppercase tracking-widest">90 Días</div>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between px-4 pb-4">
                                            {[30, 45, 25, 60, 40, 75, 55, 90, 65, 80, 50, 95].map((h, i) => (
                                                <div key={i} className="w-full flex justify-center group/bar relative">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${h}%` }}
                                                        transition={{ duration: 1.5, delay: i * 0.05, ease: "circOut" }}
                                                        className="w-[60%] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg shadow-lg group-hover/bar:from-slate-900 group-hover/bar:to-slate-800 transition-all duration-500 relative"
                                                    >
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-md text-[8px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                            {h}%
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Pie Chart & Company Health */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
                                        <div className="relative z-10 flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-3">
                                                <PieChart className="w-6 h-6 text-emerald-400" />
                                                <div className="text-[11px] font-black uppercase tracking-[0.2em]">Risk Distribution</div>
                                            </div>
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                        </div>

                                        <div className="relative flex-1 flex items-center justify-center py-10">
                                            <div className="relative w-48 h-48 rounded-full border-[15px] border-emerald-500/20 flex items-center justify-center">
                                                <motion.div
                                                    initial={{ rotate: -90 }}
                                                    whileInView={{ rotate: 270 }}
                                                    transition={{ duration: 2 }}
                                                    className="absolute inset-[-15px] rounded-full border-[15px] border-emerald-500 border-t-transparent border-r-transparent animate-slow-spin"
                                                />
                                                <div className="text-center">
                                                    <div className="text-4xl font-black tracking-tighter italic leading-none">82%</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Óptimo</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-10">
                                            {[
                                                { label: 'Ergonómico', color: 'bg-emerald-500', val: '45%' },
                                                { label: 'Psicosocial', color: 'bg-blue-500', val: '25%' },
                                                { label: 'Químico', color: 'bg-amber-500', val: '12%' },
                                            ].map((r, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${r.color}`} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-emerald-400">{r.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function LayoutIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
    );
}

