// =====================================================
// COMPONENTE: Dashboard por Empresa — GPMedical ERP Pro
// Métricas: Headcount evaluado, % Aptos/Restricciones,
// Hallazgos Críticos, SLA de Entrega, Saldo Pendiente
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, CheckCircle2, AlertTriangle, Clock, DollarSign,
    Activity, TrendingUp, Building2, Loader2, BarChart3,
    ClipboardList, ShieldAlert, Timer, ChevronDown,
    RefreshCw, Zap, ArrowRight, XCircle, Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import reportesEjecutivosService, { type MetricaEmpresa } from '@/services/reportesEjecutivosService';
import toast from 'react-hot-toast';

// =====================================================
// COMPONENTES INTERNOS
// =====================================================

function MetricCard({ icon: Icon, label, value, color, subtext, delay = 0 }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    subtext?: string;
    delay?: number;
}) {
    const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-500', text: 'text-blue-700' },
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', text: 'text-emerald-700' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-500', text: 'text-amber-700' },
        red: { bg: 'bg-red-50', icon: 'text-red-500', text: 'text-red-700' },
        indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-500', text: 'text-indigo-700' },
        purple: { bg: 'bg-purple-50', icon: 'text-purple-500', text: 'text-purple-700' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.06 }}
            className="group bg-white rounded-2xl border border-slate-100/80 p-5 shadow-sm hover:shadow-lg transition-all"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${c.text}`}>{value}</span>
            </div>
            {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
        </motion.div>
    );
}

function ProgressBar({ value, color = 'emerald', height = 'h-2' }: { value: number; color?: string; height?: string }) {
    const colorClasses: Record<string, string> = {
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
    };

    return (
        <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden`}>
            <motion.div
                className={`h-full rounded-full ${colorClasses[color] || colorClasses.emerald}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, value)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />
        </div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function EmpresaDashboard() {
    const [metricas, setMetricas] = useState<MetricaEmpresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedEmpresa, setExpandedEmpresa] = useState<string | null>(null);

    // ── Load ──
    const cargar = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await reportesEjecutivosService.obtenerMetricasPorEmpresa();
            setMetricas(data);
            if (silent) toast.success('Datos actualizados');
        } catch (err) {
            console.error('Error cargando métricas:', err);
            toast.error('Error al cargar métricas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    // ── Totales globales ──
    const totales = useMemo(() => ({
        headcount: metricas.reduce((s, m) => s + m.headcount_total, 0),
        evaluados: metricas.reduce((s, m) => s + m.headcount_evaluado, 0),
        aptos: metricas.reduce((s, m) => s + m.aptos, 0),
        restriccion: metricas.reduce((s, m) => s + m.aptos_con_restriccion, 0),
        hallazgos: metricas.reduce((s, m) => s + m.hallazgos_criticos, 0),
        saldo: metricas.reduce((s, m) => s + m.saldo_pendiente, 0),
        campanias: metricas.reduce((s, m) => s + m.campanias_activas, 0),
        empresas: metricas.length,
    }), [metricas]);

    const pctAptosGlobal = totales.headcount > 0 ? Math.round((totales.aptos / totales.headcount) * 100) : 0;
    const pctEvaluadosGlobal = totales.headcount > 0 ? Math.round((totales.evaluados / totales.headcount) * 100) : 0;

    const fmtMoney = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
            {/* ── Encabezado ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Dashboard por Empresa</h1>
                    <p className="text-white/50 mt-1 text-sm">
                        Métricas consolidadas · Headcount, Aptitud, Hallazgos, SLA y Saldo
                    </p>
                </div>
                <button
                    onClick={() => cargar(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-white/80 hover:text-white text-sm font-medium transition-all"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            {/* ── KPIs Globales ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { icon: Building2, label: 'Empresas', value: totales.empresas, color: 'text-purple-400' },
                    { icon: Users, label: 'Headcount', value: totales.headcount, color: 'text-blue-400' },
                    { icon: CheckCircle2, label: '% Evaluados', value: `${pctEvaluadosGlobal}%`, color: 'text-cyan-400' },
                    { icon: CheckCircle2, label: '% Aptos', value: `${pctAptosGlobal}%`, color: 'text-emerald-400' },
                    { icon: AlertTriangle, label: 'Hallazgos Críticos', value: totales.hallazgos, color: 'text-red-400' },
                    { icon: DollarSign, label: 'Saldo CxC', value: `$${(totales.saldo / 1000).toFixed(0)}k`, color: 'text-amber-400' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{item.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── Loading ── */}
            {loading ? (
                <div className="py-20 text-center text-white/40">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Cargando métricas por empresa...
                </div>
            ) : metricas.length === 0 ? (
                <div className="py-20 text-center">
                    <Building2 className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium">Sin empresas registradas</h3>
                </div>
            ) : (
                /* ── Cards por Empresa ── */
                <div className="space-y-4">
                    {metricas.map((m, idx) => {
                        const isExpanded = expandedEmpresa === m.empresa_id;
                        const pctEvalEmpresa = m.headcount_total > 0 ? Math.round((m.headcount_evaluado / m.headcount_total) * 100) : 0;

                        return (
                            <motion.div
                                key={m.empresa_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                            >
                                {/* Header row */}
                                <button
                                    onClick={() => setExpandedEmpresa(isExpanded ? null : m.empresa_id)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/80 to-indigo-600/80 flex items-center justify-center text-white font-black text-sm">
                                            {m.empresa_nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base">{m.empresa_nombre}</h3>
                                            <p className="text-white/40 text-xs mt-0.5">
                                                {m.campanias_activas} campañas · {m.episodios_abiertos} episodios
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {/* Quick metrics in header */}
                                        <div className="hidden md:flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-white/50 text-[10px] uppercase">Headcount</p>
                                                <p className="text-white font-bold">{m.headcount_evaluado}/{m.headcount_total}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/50 text-[10px] uppercase">Aptos</p>
                                                <p className={`font-bold ${m.porcentaje_aptos >= 80 ? 'text-emerald-400' : m.porcentaje_aptos >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {m.porcentaje_aptos}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/50 text-[10px] uppercase">Hallazgos</p>
                                                <p className={`font-bold ${m.hallazgos_criticos > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {m.hallazgos_criticos}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/50 text-[10px] uppercase">SLA</p>
                                                <p className={`font-bold ${m.sla_cumplimiento >= 90 ? 'text-emerald-400' : m.sla_cumplimiento >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {m.sla_cumplimiento}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/50 text-[10px] uppercase">Saldo</p>
                                                <p className={`font-bold ${m.saldo_pendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {fmtMoney(m.saldo_pendiente)}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* Expanded detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 border-t border-white/5 pt-5">
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {/* Headcount evaluado */}
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Users className="w-4 h-4 text-blue-400" />
                                                            <span className="text-[10px] text-white/50 uppercase">Headcount Evaluado</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-white mb-2">
                                                            {m.headcount_evaluado}<span className="text-sm text-white/30">/{m.headcount_total}</span>
                                                        </p>
                                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pctEvalEmpresa}%` }}
                                                                transition={{ duration: 1 }}
                                                            />
                                                        </div>
                                                        <p className="text-white/30 text-[10px] mt-1">{pctEvalEmpresa}% completado · {m.headcount_pendiente} pendientes</p>
                                                    </div>

                                                    {/* % Aptos / Restricciones */}
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-[10px] text-white/50 uppercase">Aptitud</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2 mb-2">
                                                            <span className="text-xl font-bold text-emerald-400">{m.porcentaje_aptos}%</span>
                                                            <span className="text-xs text-white/30">aptos</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-emerald-400">Aptos: {m.aptos}</span>
                                                                <span className="text-amber-400">Restricción: {m.aptos_con_restriccion}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-red-400">No aptos: {m.no_aptos}</span>
                                                                <span className="text-white/30">Pend.: {m.headcount_pendiente}</span>
                                                            </div>
                                                        </div>
                                                        {/* Stacked bar */}
                                                        <div className="flex w-full h-2 rounded-full overflow-hidden mt-2 bg-white/5">
                                                            {m.headcount_total > 0 && (
                                                                <>
                                                                    <div className="bg-emerald-500 h-full" style={{ width: `${(m.aptos / m.headcount_total) * 100}%` }} />
                                                                    <div className="bg-amber-500 h-full" style={{ width: `${(m.aptos_con_restriccion / m.headcount_total) * 100}%` }} />
                                                                    <div className="bg-red-500 h-full" style={{ width: `${(m.no_aptos / m.headcount_total) * 100}%` }} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Hallazgos Críticos */}
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ShieldAlert className="w-4 h-4 text-red-400" />
                                                            <span className="text-[10px] text-white/50 uppercase">Hallazgos</span>
                                                        </div>
                                                        {m.hallazgos_criticos > 0 ? (
                                                            <>
                                                                <p className="text-xl font-bold text-red-400 mb-1">{m.hallazgos_criticos}</p>
                                                                <p className="text-[10px] text-red-400/60">críticos detectados</p>
                                                                {m.hallazgos_totales > m.hallazgos_criticos && (
                                                                    <p className="text-[10px] text-white/30 mt-1">+{m.hallazgos_totales - m.hallazgos_criticos} leves</p>
                                                                )}
                                                            </>
                                                        ) : m.hallazgos_totales > 0 ? (
                                                            <>
                                                                <p className="text-xl font-bold text-amber-400 mb-1">{m.hallazgos_totales}</p>
                                                                <p className="text-[10px] text-amber-400/60">hallazgos leves</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-xl font-bold text-emerald-400 mb-1">0</p>
                                                                <p className="text-[10px] text-emerald-400/60 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Sin hallazgos
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* SLA de Entrega */}
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Timer className="w-4 h-4 text-cyan-400" />
                                                            <span className="text-[10px] text-white/50 uppercase">SLA Entrega</span>
                                                        </div>
                                                        <p className={`text-xl font-bold mb-1 ${m.sla_cumplimiento >= 90 ? 'text-emerald-400' : m.sla_cumplimiento >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                                            {m.sla_cumplimiento}%
                                                        </p>
                                                        <p className="text-[10px] text-white/30">cumplimiento</p>
                                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-white/40">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{m.sla_entrega_dias} días promedio</span>
                                                        </div>
                                                    </div>

                                                    {/* Saldo Pendiente */}
                                                    <div className="bg-white/5 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <DollarSign className="w-4 h-4 text-amber-400" />
                                                            <span className="text-[10px] text-white/50 uppercase">Saldo Pendiente</span>
                                                        </div>
                                                        <p className={`text-xl font-bold mb-1 ${m.saldo_pendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                            {fmtMoney(m.saldo_pendiente)}
                                                        </p>
                                                        {m.facturado_mes > 0 && (
                                                            <p className="text-[10px] text-white/30">
                                                                Facturado este mes: {fmtMoney(m.facturado_mes)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
