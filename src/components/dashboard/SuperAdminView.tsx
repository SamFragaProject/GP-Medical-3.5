/**
 * SuperAdminView - GPMedical 3.5 
 * 
 * DASHBOARD ULTRA-PREMIUM: Rediseño World-Class
 * Header Sticky, Tarjetas de Lujo con Semántica de Color y Widgets de Monitoreo Avanzado.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Bell, Building2, Activity, FileText, AlertCircle,
    CheckCircle, Clock, BarChart3, ChevronRight, Zap, TrendingUp, Shield,
    Heart, Brain, Plus, Settings, Search, Sparkles, Download,
    RefreshCw, Bot, Globe, UserCog, Loader2, Eye, ArrowUpRight, ArrowDownRight,
    Command, Laptop, Database, ShieldCheck, Trash2, Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { NewCompanyDialog } from '../admin/NewCompanyDialog';
import { PremiumPageHeader } from '../ui/PremiumPageHeader';

// =============================================
// COMPONENTES DE LUJO
// =============================================

/**
 * Tarjeta Premium Refinada: No básica
 * Implementa bordes de luz, sombras suaves y layout inteligente.
 */
const LuxurySummaryCard = ({ item, i }: { item: any, i: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative group cursor-pointer"
    >
        {/* Glow de fondo dinámico según el tema */}
        <div className={`absolute inset-0 bg-gradient-to-br ${item.theme.glow} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`} />

        <div className="relative z-20 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700 h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.theme.bgIcon} p-0.5 shadow-xl shadow-black/5 group-hover:rotate-12 transition-transform duration-500`}>
                        <div className="w-full h-full bg-slate-950/10 backdrop-blur-md rounded-[calc(1rem-2px)] flex items-center justify-center text-white">
                            <item.icon className="w-7 h-7 stroke-[2.5]" />
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500 shadow-sm border border-slate-100'}`}>
                            {item.trend.startsWith('+') ? <ArrowUpRight size={12} /> : null}
                            {item.trend}
                        </div>
                        <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                            <Zap size={14} className={item.theme.text} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        {item.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                        </h4>
                        {item.unit && <span className="text-sm font-bold text-slate-400">{item.unit}</span>}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.theme.dot} animate-pulse`} />
                        {item.description}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">SYNC OK</span>
                </div>

                {/* Mini gráfico de progreso visual */}
                <div className="h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.progress || '70%' }}
                        transition={{ delay: 0.5 + (i * 0.1), duration: 1.5, ease: "circOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.theme.bgIcon}`}
                    />
                </div>
            </div>

            {/* Acento inferior minimalista mejorado */}
            <div className={`absolute bottom-0 left-10 right-10 h-[4px] rounded-t-full bg-gradient-to-r ${item.theme.bgIcon} opacity-0 group-hover:opacity-100 transition-all duration-500 blur-[2px]`} />
        </div>
    </motion.div>
);

const GlassCard = ({ children, className = "", delay = 0, title, icon: Icon, actions }: { children: React.ReactNode, className?: string, delay?: number, title?: string, icon?: any, actions?: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] rounded-[2.5rem] p-8 flex flex-col ${className}`}
    >
        {title && (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-lg shadow-slate-900/10">
                            <Icon size={20} />
                        </div>
                    )}
                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">
                        {title}
                    </h3>
                </div>
                {actions}
            </div>
        )}
        <div className="flex-1 w-full">
            {children}
        </div>
    </motion.div>
);

// =============================================
// MAIN COMPONENT
// =============================================
export function SuperAdminView() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);

    // State for real-time data
    const [stats, setStats] = useState({
        totalPacientes: 0,
        totalCitas: 0,
        citasHoy: 0,
        totalEmpresas: 0,
        precisionIA: 98.9
    });

    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Stats
                const [
                    { count: countPacientes },
                    { count: countCitas },
                    { count: countEmpresas },
                    { count: countCitasHoy }
                ] = await Promise.all([
                    supabase.from('pacientes').select('*', { count: 'exact', head: true }),
                    supabase.from('citas').select('*', { count: 'exact', head: true }),
                    supabase.from('empresas').select('*', { count: 'exact', head: true }),
                    supabase.from('citas').select('*', { count: 'exact', head: true })
                        .gte('fecha_hora', new Date().toISOString().split('T')[0])
                ]);

                setStats({
                    totalPacientes: countPacientes || 0,
                    totalCitas: countCitas || 0,
                    totalEmpresas: countEmpresas || 0,
                    citasHoy: countCitasHoy || 0,
                    precisionIA: 98.9 // Mantenemos mock para IA
                });

                // 2. Fetch Recent Activity (Audit Logs)
                const { data: logs } = await supabase
                    .from('auditoria')
                    .select('*')
                    .order('timestamp_evento', { ascending: false })
                    .limit(6);

                if (logs) {
                    setRecentActivity(logs.map(log => ({
                        icon: log.tipo_evento === 'INSERT' ? Plus :
                            log.tipo_evento === 'DELETE' ? Trash2 :
                                log.tipo_evento === 'UPDATE' ? Edit : UserCog,
                        title: log.descripcion_evento || `${log.tipo_evento} en ${log.tabla_afectada}`,
                        user: log.usuario_email || 'Sistema',
                        time: new Date(log.timestamp_evento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: log.tipo_evento === 'INSERT' ? 'success' :
                            log.tipo_evento === 'DELETE' ? 'warning' : 'info'
                    })));
                }

                // 3. Fetch Chart Data (Appointments per day last 7 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const { data: appointments } = await supabase
                    .from('citas')
                    .select('fecha_hora')
                    .gte('fecha_hora', sevenDaysAgo.toISOString());

                if (appointments) {
                    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
                    const countsByDay = appointments.reduce((acc: any, curr) => {
                        const dayName = days[new Date(curr.fecha_hora).getDay()];
                        acc[dayName] = (acc[dayName] || 0) + 1;
                        return acc;
                    }, {});

                    const formattedChartData = days.map(day => ({
                        name: day,
                        val: countsByDay[day] || 0
                    }));

                    // Rearrange chart data to end at today
                    const todayIdx = new Date().getDay();
                    const reordered = [
                        ...formattedChartData.slice(todayIdx + 1),
                        ...formattedChartData.slice(0, todayIdx + 1)
                    ];
                    setChartData(reordered);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const DASHBOARD_THEMES = {
        emerald: {
            bgIcon: 'from-emerald-400 to-emerald-600',
            glow: 'from-emerald-500/20 to-teal-500/20',
            dot: 'bg-emerald-500',
            text: 'text-emerald-500'
        },
        blue: {
            bgIcon: 'from-blue-400 to-blue-600',
            glow: 'from-blue-500/20 to-indigo-500/20',
            dot: 'bg-blue-500',
            text: 'text-blue-500'
        },
        indigo: {
            bgIcon: 'from-indigo-500 to-indigo-700',
            glow: 'from-indigo-500/20 to-purple-500/20',
            dot: 'bg-indigo-500',
            text: 'text-indigo-500'
        },
        violet: {
            bgIcon: 'from-violet-500 to-fuchsia-600',
            glow: 'from-violet-500/20 to-pink-500/20',
            dot: 'bg-violet-500',
            text: 'text-violet-500'
        },
        amber: {
            bgIcon: 'from-amber-400 to-orange-600',
            glow: 'from-amber-500/20 to-orange-500/20',
            dot: 'bg-amber-500',
            text: 'text-amber-500'
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#F8FAFC]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
                    <Bot className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* 1. HEADER PREMIUM VORTEX - UNIFICACIÓN DE NIVEL 1 */}
            <div className="px-8 pt-8">
                <PremiumPageHeader
                    title="Workspace Intelligence"
                    subtitle="Centro de comando global asistido por IA Neural de Alta Precisión."
                    icon={Bot}
                    badge="Vortex Engine v3.5"
                    actions={
                        <div className="flex items-center gap-3">
                            <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                <Download size={16} /> Reporte Global
                            </button>
                            <button
                                onClick={() => setIsNewCompanyOpen(true)}
                                className="group bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                Nueva Gestión
                            </button>
                        </div>
                    }
                />
            </div>

            <main className="px-8 mt-12 pb-20 max-w-screen-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* 2. TARJETAS PREMIUM DE LUJO (KPIs) */}
                    <div className="md:col-span-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                            {[
                                { label: 'Pacientes', value: stats.totalPacientes, trend: '+12.5%', icon: Users, theme: DASHBOARD_THEMES.emerald, description: 'Red Diagnóstica Activa', progress: '85%' },
                                { label: 'Empresas', value: stats.totalEmpresas, trend: '+2', icon: Building2, theme: DASHBOARD_THEMES.blue, description: 'Partners Corporativos', progress: '65%' },
                                { label: 'Citas Hoy', value: stats.citasHoy, trend: 'LIVE', icon: Calendar, theme: DASHBOARD_THEMES.amber, description: 'Operación Técnica', progress: '40%' },
                                { label: 'IA Precisión', value: stats.precisionIA, unit: '%', trend: 'OPTIMAL', icon: Brain, theme: DASHBOARD_THEMES.violet, description: 'Medical Vision AI v2.5', progress: '98%' }
                            ].map((item, i) => (
                                <LuxurySummaryCard key={i} item={item} i={i} />
                            ))}
                        </div>
                    </div>

                    {/* 3. WIDGETS PRINCIPALES */}
                    {/* Gráfico de Flujo Operativo */}
                    <div className="md:col-span-8 space-y-8">
                        <GlassCard
                            title="Flujo Operativo de Red"
                            icon={Activity}
                            actions={
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">7 Días</div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Real-Time</div>
                                </div>
                            }
                        >
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                                            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="val"
                                            stroke="#10b981"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorVal)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latencia IA</p>
                                    <p className="text-xl font-black text-slate-800 tracking-tighter">14ms</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saturación</p>
                                    <p className="text-xl font-black text-slate-800 tracking-tighter">12%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nodos</p>
                                    <p className="text-xl font-black text-slate-800 tracking-tighter">48</p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Nueva Sección: Sistema Health (Widget Adicional) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <GlassCard title="Servidores Core" icon={Database}>
                                <div className="space-y-4">
                                    {[
                                        { name: 'MX-Sinaloa-Region', status: 'Online', load: '24%' },
                                        { name: 'AWS-Edge-Nodes', status: 'Online', load: '45%' },
                                        { name: 'Supabase-Cluster', status: 'Sincronizando', load: '12%' }
                                    ].map((server, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${server.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                                <span className="text-xs font-bold text-slate-700">{server.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{server.load}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Seguridad Perimetral" icon={ShieldCheck}>
                                <div className="flex flex-col items-center justify-center h-full gap-4 py-4 text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                                        <ShieldCheck className="w-16 h-16 text-emerald-500 relative z-10" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">RLS Activo</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1">Aislamiento de Tenencia: 100%</p>
                                    </div>
                                    <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Ver Logs Audit</button>
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Sidebar de Actividad (Widget Sidebar) */}
                    <div className="md:col-span-4 space-y-8">
                        <GlassCard title="Actividad Global Live" icon={Globe} className="h-full">
                            <div className="space-y-6">
                                {recentActivity.map((act, i) => (
                                    <div key={i} className="group flex gap-4 p-3 hover:bg-white rounded-[1.5rem] transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-sm">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
                                            ${act.type === 'info' ? 'bg-blue-50 text-blue-500' :
                                                act.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                                                    act.type === 'warning' ? 'bg-rose-50 text-rose-500' :
                                                        'bg-violet-50 text-violet-500'}`}>
                                            <act.icon size={22} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{act.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400">{act.time}</p>
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{act.user}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-10 py-4 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                                Ver Auditoría Completa
                            </button>
                        </GlassCard>

                        {/* Widget de Invitación / Soporte */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30"
                        >
                            <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
                            <div className="relative z-10">
                                <h4 className="text-xl font-black tracking-tight mb-2">Neural Support</h4>
                                <p className="text-xs text-indigo-100 font-medium mb-6 leading-relaxed">¿Necesitas asistencia con la red de empresas o la configuración de jerarquías?</p>
                                <button className="px-6 py-2.5 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Contactar Especialista</button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </main>

            <NewCompanyDialog
                open={isNewCompanyOpen}
                onOpenChange={setIsNewCompanyOpen}
                onSuccess={() => console.log('Gestión creada')}
            />
        </div>
    );
}
