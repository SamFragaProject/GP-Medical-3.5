/**
 * SuperAdminView — GPMedical 3.5
 *
 * DASHBOARD EJECUTIVO GLOBAL
 * Panel de control con KPIs operativos y financieros:
 * - Empresas activas
 * - Campañas en curso
 * - Episodios en proceso
 * - Resultados retrasados
 * - Dictámenes por firmar
 * - Facturas vencidas
 * - Ingresos del mes vs meta
 * + Dashboard por empresa (Headcount, %Aptos, Hallazgos, SLA, Saldo)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Users, Calendar, Brain, Activity, Bot,
    Plus, Download, Globe, Database, ShieldCheck, Sparkles,
    Loader2, ArrowRight, TrendingUp, TrendingDown, AlertTriangle,
    FileSignature, Receipt, DollarSign, Target, Clock,
    ChevronRight, CheckCircle2, XCircle, ClipboardList, Eye,
    BarChart3, RefreshCw, Zap, Flag, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NewCompanyDialog } from '../admin/NewCompanyDialog';
import { PremiumPageHeader } from '../ui/PremiumPageHeader';
import { supabase } from '@/lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { SuperAdminComunicados } from './SuperAdminComunicados';
import reportesEjecutivosService, {
    type KPIGlobal,
    type MetricaEmpresa,
    type CampaniaResumen,
    type ResultadoRetrasado,
    type DictamenPendiente,
    type FacturaVencida
} from '@/services/reportesEjecutivosService';
import toast from 'react-hot-toast';

// =============================================
// KPI CARD COMPONENT
// =============================================
interface KPICardProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    bgGradient: string;
    glowColor: string;
    suffix?: string;
    trend?: string;
    trendDir?: 'up' | 'down' | 'neutral';
    delay?: number;
    onClick?: () => void;
    badge?: string;
}

function KPICard({ label, value, icon: Icon, color, bgGradient, glowColor, suffix, trend, trendDir, delay = 0, onClick, badge }: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.08, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={onClick}
            className={`group relative bg-white rounded-[1.8rem] border border-slate-100/80 p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} overflow-hidden`}
        >
            {/* Glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 ${glowColor} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {badge && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${color === 'red' ? 'bg-red-50 text-red-600' : color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {badge}
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
                        {suffix && <span className="text-sm font-bold text-slate-400">{suffix}</span>}
                    </div>
                </div>

                {trend && (
                    <div className={`mt-3 flex items-center gap-1 text-[10px] font-bold ${trendDir === 'up' ? 'text-emerald-500' : trendDir === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                        {trendDir === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trendDir === 'down' && <TrendingDown className="w-3 h-3" />}
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// =============================================
// GLASS PANEL COMPONENT
// =============================================
function GlassPanel({ children, className = '', title, icon: Icon, actions, delay = 0 }: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: React.ElementType;
    actions?: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.5 }}
            className={`bg-white rounded-[2rem] border border-slate-100/80 shadow-sm overflow-hidden ${className}`}
        >
            {title && (
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h3>
                    </div>
                    {actions}
                </div>
            )}
            <div className="p-7">{children}</div>
        </motion.div>
    );
}

// =============================================
// PROGRESS RING
// =============================================
function ProgressRing({ value, size = 56, strokeWidth = 5, color = '#10b981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(100, Math.max(0, value));
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeLinecap="round" strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            />
        </svg>
    );
}

// =============================================
// TAB TYPE
// =============================================
type TabView = 'global' | 'empresas' | 'campanias' | 'alertas';

// =============================================
// MAIN COMPONENT
// =============================================
export function SuperAdminView() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabView>('global');

    // Data state
    const [kpi, setKpi] = useState<KPIGlobal | null>(null);
    const [metricasEmpresa, setMetricasEmpresa] = useState<MetricaEmpresa[]>([]);
    const [campanias, setCampanias] = useState<CampaniaResumen[]>([]);
    const [resultadosRet, setResultadosRet] = useState<ResultadoRetrasado[]>([]);
    const [dictamenesPend, setDictamenesPend] = useState<DictamenPendiente[]>([]);
    const [facturasVenc, setFacturasVenc] = useState<FacturaVencida[]>([]);
    const [tendenciaIngresos, setTendenciaIngresos] = useState<any[]>([]);

    // ── Load data ──
    const loadDashboard = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const [kpiData, empresaData, campData, retData, dictData, factData, tendencia] = await Promise.all([
                reportesEjecutivosService.obtenerKPIGlobal(),
                reportesEjecutivosService.obtenerMetricasPorEmpresa(),
                reportesEjecutivosService.obtenerCampaniasActivas(),
                reportesEjecutivosService.obtenerResultadosRetrasados(),
                reportesEjecutivosService.obtenerDictamenesPendientes(),
                reportesEjecutivosService.obtenerFacturasVencidas(),
                reportesEjecutivosService.obtenerTendenciaIngresos(),
            ]);

            setKpi(kpiData);
            setMetricasEmpresa(empresaData);
            setCampanias(campData);
            setResultadosRet(retData);
            setDictamenesPend(dictData);
            setFacturasVenc(factData);
            setTendenciaIngresos(tendencia);

            if (silent) toast.success('Dashboard actualizado');
        } catch (err) {
            console.error('Error cargando dashboard:', err);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // ── Totales empresa ──
    const totalesEmpresa = useMemo(() => ({
        headcount: metricasEmpresa.reduce((s, m) => s + m.headcount_total, 0),
        evaluados: metricasEmpresa.reduce((s, m) => s + m.headcount_evaluado, 0),
        hallazgos: metricasEmpresa.reduce((s, m) => s + m.hallazgos_criticos, 0),
        saldo: metricasEmpresa.reduce((s, m) => s + m.saldo_pendiente, 0),
    }), [metricasEmpresa]);

    // ── Format helpers ──
    const fmtMoney = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v);
    const fmtCompact = (v: number) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

    // ── TABS ──
    const tabs = [
        { id: 'global' as const, label: 'Dashboard Global', icon: Globe },
        { id: 'empresas' as const, label: 'Por Empresa', icon: Building2 },
        { id: 'campanias' as const, label: 'Campañas', icon: Flag },
        { id: 'alertas' as const, label: 'Alertas', icon: AlertTriangle },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="relative inline-block">
                        <Loader2 className="w-14 h-14 text-slate-300 animate-spin" />
                        <Bot className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mt-4">Cargando tablero ejecutivo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* HEADER */}
            <div className="px-6 lg:px-8 pt-6">
                <PremiumPageHeader
                    title="Tablero de Control"
                    subtitle="Centro de comando ejecutivo — Métricas operativas y financieras en tiempo real."
                    icon={BarChart3}
                    badge="EXECUTIVE v3.5"
                    actions={
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => loadDashboard(true)}
                                disabled={refreshing}
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                            >
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                                {refreshing ? 'Actualizando...' : 'Actualizar'}
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

            {/* TABS */}
            <div className="px-6 lg:px-8 mt-8">
                <div className="flex items-center gap-2 bg-slate-100/60 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/50 shadow-inner w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${activeTab === t.id
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                                }`}
                        >
                            <t.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-6 lg:px-8 mt-8 pb-20 max-w-screen-2xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'global' && (
                        <motion.div key="global" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* ══════ COMUNICADOS (FEED) ══════ */}
                            <div className="mb-10">
                                <SuperAdminComunicados />
                            </div>

                            {/* ══════ KPI CARDS ══════ */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 mb-10">
                                <KPICard
                                    label="Empresas Activas" value={kpi?.empresasActivas || 0} icon={Building2}
                                    color="blue" bgGradient="from-blue-500 to-blue-700" glowColor="bg-blue-400/20"
                                    delay={0} trend={`${kpi?.totalPacientes || 0} pacientes`} trendDir="neutral"
                                />
                                <KPICard
                                    label="Campañas en Curso" value={kpi?.campaniasEnCurso || 0} icon={Flag}
                                    color="emerald" bgGradient="from-emerald-500 to-emerald-700" glowColor="bg-emerald-400/20"
                                    delay={1} onClick={() => setActiveTab('campanias')}
                                    badge={kpi?.campaniasEnCurso && kpi.campaniasEnCurso > 0 ? 'ACTIVAS' : undefined}
                                />
                                <KPICard
                                    label="Episodios en Proceso" value={kpi?.episodiosEnProceso || 0} icon={Activity}
                                    color="indigo" bgGradient="from-indigo-500 to-indigo-700" glowColor="bg-indigo-400/20"
                                    delay={2} trend={`${kpi?.citasHoy || 0} citas hoy`} trendDir="neutral"
                                />
                                <KPICard
                                    label="Resultados Retrasados" value={kpi?.resultadosRetrasados || 0} icon={Clock}
                                    color={kpi?.resultadosRetrasados ? 'red' : 'emerald'} bgGradient="from-orange-500 to-red-600" glowColor="bg-red-400/20"
                                    delay={3} onClick={() => setActiveTab('alertas')}
                                    badge={kpi?.resultadosRetrasados && kpi.resultadosRetrasados > 0 ? 'ATENCIÓN' : undefined}
                                />
                                <KPICard
                                    label="Dictámenes por Firmar" value={kpi?.dictamenesPorFirmar || 0} icon={FileSignature}
                                    color={kpi?.dictamenesPorFirmar ? 'amber' : 'emerald'} bgGradient="from-amber-500 to-orange-600" glowColor="bg-amber-400/20"
                                    delay={4} onClick={() => setActiveTab('alertas')}
                                    badge={kpi?.dictamenesPorFirmar && kpi.dictamenesPorFirmar > 0 ? 'PENDIENTES' : undefined}
                                />
                                <KPICard
                                    label="Facturas Vencidas" value={kpi?.facturasVencidas || 0} icon={Receipt}
                                    color={kpi?.facturasVencidas ? 'red' : 'emerald'} bgGradient="from-rose-500 to-red-700" glowColor="bg-rose-400/20"
                                    delay={5} onClick={() => setActiveTab('alertas')}
                                    badge={kpi?.facturasVencidas && kpi.facturasVencidas > 0 ? 'VENCIDAS' : undefined}
                                />
                                <KPICard
                                    label="Ingresos vs Meta" value={kpi?.porcentajeMeta || 0} suffix="%" icon={Target}
                                    color="emerald" bgGradient="from-emerald-400 to-teal-600" glowColor="bg-teal-400/20"
                                    delay={6}
                                    trend={fmtCompact(kpi?.ingresosMes || 0) + ` / ${fmtCompact(kpi?.metaMes || 0)}`}
                                    trendDir={(kpi?.porcentajeMeta || 0) >= 80 ? 'up' : 'down'}
                                />
                            </div>

                            {/* ══════ MAIN CONTENT ══════ */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Chart: Ingresos Tendencia */}
                                <GlassPanel
                                    title="Ingresos Mensuales vs Meta"
                                    icon={DollarSign}
                                    className="lg:col-span-8"
                                    delay={1}
                                    actions={
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                            Últimos 6 meses
                                        </span>
                                    }
                                >
                                    <div className="h-[320px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={tendenciaIngresos}>
                                                <defs>
                                                    <linearGradient id="ingresosGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="mes" axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip
                                                    formatter={(v: number, name: string) => [fmtMoney(v), name === 'ingresos' ? 'Ingresos' : 'Meta']}
                                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                                />
                                                <Area type="monotone" dataKey="meta" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3"
                                                    fillOpacity={1} fill="url(#metaGrad)" animationDuration={1500} />
                                                <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3}
                                                    fillOpacity={1} fill="url(#ingresosGrad)" animationDuration={1500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Resumen bajo gráfico */}
                                    <div className="mt-6 grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingreso Mes</p>
                                            <p className="text-xl font-black text-slate-800 tracking-tight">{fmtCompact(kpi?.ingresosMes || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta</p>
                                            <p className="text-xl font-black text-slate-800 tracking-tight">{fmtCompact(kpi?.metaMes || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CxC Pendiente</p>
                                            <p className="text-xl font-black text-amber-600 tracking-tight">{fmtCompact(totalesEmpresa.saldo)}</p>
                                        </div>
                                    </div>
                                </GlassPanel>

                                {/* Sidebar: Resumen rápido */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Semáforo de estado */}
                                    <GlassPanel title="Semáforo Operativo" icon={Zap} delay={2}>
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    label: 'Resultados retrasados',
                                                    value: kpi?.resultadosRetrasados || 0,
                                                    status: (kpi?.resultadosRetrasados || 0) === 0 ? 'green' : (kpi?.resultadosRetrasados || 0) <= 5 ? 'amber' : 'red'
                                                },
                                                {
                                                    label: 'Dictámenes pendientes',
                                                    value: kpi?.dictamenesPorFirmar || 0,
                                                    status: (kpi?.dictamenesPorFirmar || 0) === 0 ? 'green' : (kpi?.dictamenesPorFirmar || 0) <= 3 ? 'amber' : 'red'
                                                },
                                                {
                                                    label: 'Facturas vencidas',
                                                    value: kpi?.facturasVencidas || 0,
                                                    status: (kpi?.facturasVencidas || 0) === 0 ? 'green' : 'red'
                                                },
                                                {
                                                    label: 'Meta del mes',
                                                    value: `${kpi?.porcentajeMeta || 0}%`,
                                                    status: (kpi?.porcentajeMeta || 0) >= 80 ? 'green' : (kpi?.porcentajeMeta || 0) >= 50 ? 'amber' : 'red'
                                                },
                                            ].map((item, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.07 }}
                                                    className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-100/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${item.status === 'green' ? 'bg-emerald-500' : item.status === 'amber' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                                                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                                                    </div>
                                                    <span className={`text-sm font-black ${item.status === 'green' ? 'text-emerald-600' : item.status === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {item.value}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassPanel>

                                    {/* Progreso Meta Anillo */}
                                    <GlassPanel delay={3}>
                                        <div className="flex flex-col items-center py-2">
                                            <div className="relative mb-4">
                                                <ProgressRing value={kpi?.porcentajeMeta || 0} size={100} strokeWidth={8}
                                                    color={(kpi?.porcentajeMeta || 0) >= 80 ? '#10b981' : (kpi?.porcentajeMeta || 0) >= 50 ? '#f59e0b' : '#ef4444'} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl font-black text-slate-800">{kpi?.porcentajeMeta || 0}%</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avance Meta Mensual</p>
                                            <p className="text-xs text-slate-500">{fmtMoney(kpi?.ingresosMes || 0)} de {fmtMoney(kpi?.metaMes || 0)}</p>
                                        </div>
                                    </GlassPanel>

                                    {/* Quick Stats */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-7 text-white relative overflow-hidden"
                                    >
                                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-5" />
                                        <div className="relative z-10">
                                            <h4 className="text-lg font-black tracking-tight mb-4">Resumen Rápido</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/50">Pacientes totales</span>
                                                    <span className="font-bold">{kpi?.totalPacientes || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/50">Citas hoy</span>
                                                    <span className="font-bold">{kpi?.citasHoy || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/50">Empresas</span>
                                                    <span className="font-bold">{kpi?.empresasActivas || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/50">Headcount total</span>
                                                    <span className="font-bold">{totalesEmpresa.headcount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'empresas' && (
                        <motion.div key="empresas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* ══════ DASHBOARD POR EMPRESA ══════ */}
                            <GlassPanel title="Métricas por Empresa" icon={Building2} delay={0}
                                actions={
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                        {metricasEmpresa.length} empresas
                                    </span>
                                }
                            >
                                {metricasEmpresa.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">Sin empresas activas</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto -mx-7 px-7">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-slate-100 text-slate-400">
                                                    <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-widest">Empresa</th>
                                                    <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-widest">Headcount</th>
                                                    <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-widest">Evaluado</th>
                                                    <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-widest">% Aptos</th>
                                                    <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-widest">Restricción</th>
                                                    <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-widest">Hallazgos</th>
                                                    <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-widest">SLA</th>
                                                    <th className="text-right px-3 py-3 font-bold text-[10px] uppercase tracking-widest">Saldo CxC</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {metricasEmpresa.map((m, i) => (
                                                    <motion.tr
                                                        key={m.empresa_id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                                                                    {m.empresa_nombre.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm">{m.empresa_nombre}</p>
                                                                    <p className="text-[10px] text-slate-400">{m.campanias_activas} campañas · {m.episodios_abiertos} episodios</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center px-3 py-4">
                                                            <span className="text-lg font-black text-slate-800">{m.headcount_total}</span>
                                                        </td>
                                                        <td className="text-center px-3 py-4">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="font-bold text-slate-600">{m.headcount_evaluado}</span>
                                                                <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-500 rounded-full"
                                                                        style={{ width: `${m.headcount_total > 0 ? (m.headcount_evaluado / m.headcount_total) * 100 : 0}%` }} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center px-3 py-4">
                                                            <div className="inline-flex items-center gap-2">
                                                                <div className="relative">
                                                                    <ProgressRing value={m.porcentaje_aptos} size={36} strokeWidth={3}
                                                                        color={m.porcentaje_aptos >= 80 ? '#10b981' : m.porcentaje_aptos >= 60 ? '#f59e0b' : '#ef4444'} />
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-[9px] font-black text-slate-700">{m.porcentaje_aptos}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center px-3 py-4">
                                                            {m.aptos_con_restriccion > 0 ? (
                                                                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                                    {m.aptos_con_restriccion} ({m.porcentaje_restriccion}%)
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300">—</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center px-3 py-4">
                                                            {m.hallazgos_criticos > 0 ? (
                                                                <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold animate-pulse">
                                                                    {m.hallazgos_criticos} críticos
                                                                </span>
                                                            ) : m.hallazgos_totales > 0 ? (
                                                                <span className="text-amber-500 font-medium text-xs">{m.hallazgos_totales} leves</span>
                                                            ) : (
                                                                <span className="text-emerald-500 text-xs font-medium flex items-center justify-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> OK
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="text-center px-3 py-4">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className={`text-xs font-bold ${m.sla_cumplimiento >= 90 ? 'text-emerald-600' : m.sla_cumplimiento >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                    {m.sla_cumplimiento}%
                                                                </span>
                                                                <span className="text-[9px] text-slate-400">{m.sla_entrega_dias}d prom</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right px-3 py-4">
                                                            <span className={`font-bold ${m.saldo_pendiente > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>
                                                                {fmtMoney(m.saldo_pendiente)}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                            {/* Totales */}
                                            <tfoot>
                                                <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-bold">
                                                    <td className="px-4 py-4 text-slate-600 text-sm">TOTALES</td>
                                                    <td className="text-center px-3 py-4 text-lg font-black text-slate-800">{totalesEmpresa.headcount}</td>
                                                    <td className="text-center px-3 py-4 text-slate-600">{totalesEmpresa.evaluados}</td>
                                                    <td className="text-center px-3 py-4 text-emerald-600">
                                                        {totalesEmpresa.headcount > 0 ? Math.round((metricasEmpresa.reduce((s, m) => s + m.aptos, 0) / totalesEmpresa.headcount) * 100) : 0}%
                                                    </td>
                                                    <td className="text-center px-3 py-4 text-amber-600">{metricasEmpresa.reduce((s, m) => s + m.aptos_con_restriccion, 0)}</td>
                                                    <td className="text-center px-3 py-4 text-red-600">{totalesEmpresa.hallazgos}</td>
                                                    <td className="text-center px-3 py-4 text-slate-500">—</td>
                                                    <td className="text-right px-3 py-4 text-amber-600">{fmtMoney(totalesEmpresa.saldo)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </GlassPanel>
                        </motion.div>
                    )}

                    {activeTab === 'campanias' && (
                        <motion.div key="campanias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <GlassPanel title="Campañas en Curso" icon={Flag} delay={0}
                                actions={
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                        {campanias.length} activas
                                    </span>
                                }
                            >
                                {campanias.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Flag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">Sin campañas activas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {campanias.map((c, i) => (
                                            <motion.div
                                                key={c.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black ${c.estado === 'activa' ? 'bg-emerald-500' : c.estado === 'en_ejecucion' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                                                        {c.porcentaje}%
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-bold text-slate-800">{c.nombre}</p>
                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${c.estado === 'activa' ? 'bg-emerald-50 text-emerald-600' : c.estado === 'en_ejecucion' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {c.estado.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400">{c.empresa_nombre} · {fmtDate(c.fecha_inicio)}{c.fecha_fin ? ` — ${fmtDate(c.fecha_fin)}` : ''}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-700">{c.evaluados}/{c.headcount}</p>
                                                        <p className="text-[10px] text-slate-400">evaluados</p>
                                                    </div>
                                                    <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${c.porcentaje >= 80 ? 'bg-emerald-500' : c.porcentaje >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${c.porcentaje}%` }}
                                                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </GlassPanel>
                        </motion.div>
                    )}

                    {activeTab === 'alertas' && (
                        <motion.div key="alertas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                            {/* Resultados Retrasados */}
                            <GlassPanel title="Resultados Retrasados" icon={Clock} delay={0}
                                actions={
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${resultadosRet.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {resultadosRet.length} pendientes
                                    </span>
                                }
                            >
                                {resultadosRet.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium">Sin resultados retrasados ✨</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto -mx-7 px-7">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400">
                                                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Paciente</th>
                                                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Empresa</th>
                                                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Estudio</th>
                                                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Fecha Orden</th>
                                                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Días Atraso</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resultadosRet.map((r, i) => (
                                                    <tr key={r.id} className="border-b border-slate-50 hover:bg-red-50/30 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-slate-800">{r.paciente_nombre}</td>
                                                        <td className="px-4 py-3 text-slate-500">{r.empresa_nombre}</td>
                                                        <td className="px-4 py-3 text-slate-500">{r.tipo_estudio}</td>
                                                        <td className="px-4 py-3 text-center text-slate-400">{fmtDate(r.fecha_orden)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                                {r.dias_atraso}d
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </GlassPanel>

                            {/* Dictámenes Pendientes */}
                            <GlassPanel title="Dictámenes por Firmar" icon={FileSignature} delay={1}
                                actions={
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${dictamenesPend.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {dictamenesPend.length} pendientes
                                    </span>
                                }
                            >
                                {dictamenesPend.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium">Todos los dictámenes firmados ✨</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dictamenesPend.map((d, i) => (
                                            <motion.div
                                                key={d.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="flex items-center justify-between p-4 bg-amber-50/30 rounded-xl border border-amber-100/50 hover:bg-amber-50/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                                        <FileSignature className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{d.paciente_nombre}</p>
                                                        <p className="text-[10px] text-slate-400">{d.empresa_nombre} · {d.tipo} · {fmtDate(d.fecha_creacion)}</p>
                                                    </div>
                                                </div>
                                                {d.medico_nombre && (
                                                    <span className="text-xs text-slate-500">{d.medico_nombre}</span>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </GlassPanel>

                            {/* Facturas Vencidas */}
                            <GlassPanel title="Facturas Vencidas" icon={Receipt} delay={2}
                                actions={
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${facturasVenc.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {facturasVenc.length > 0
                                            ? fmtMoney(facturasVenc.reduce((s, f) => s + f.monto, 0))
                                            : 'Al corriente'
                                        }
                                    </span>
                                }
                            >
                                {facturasVenc.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium">Sin facturas vencidas ✨</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto -mx-7 px-7">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400">
                                                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Empresa</th>
                                                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Factura</th>
                                                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Monto</th>
                                                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Vencimiento</th>
                                                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider">Días</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {facturasVenc.map((f, i) => (
                                                    <tr key={f.id} className="border-b border-slate-50 hover:bg-red-50/30 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-slate-800">{f.empresa_nombre}</td>
                                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{f.numero_factura}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-red-600">{fmtMoney(f.monto)}</td>
                                                        <td className="px-4 py-3 text-center text-slate-400">{fmtDate(f.fecha_vencimiento)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${f.dias_vencida > 30 ? 'bg-red-100 text-red-700' : f.dias_vencida > 15 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {f.dias_vencida}d
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </GlassPanel>
                        </motion.div>
                    )}


                </AnimatePresence>
            </main>

            <NewCompanyDialog
                open={isNewCompanyOpen}
                onOpenChange={setIsNewCompanyOpen}
                onSuccess={() => {
                    toast.success('Empresa creada');
                    loadDashboard(true);
                }}
            />
        </div>
    );
}
