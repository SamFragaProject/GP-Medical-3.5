/**
 * CentroOperaciones — Hub Central Operativo
 * 
 * Unifica: Agenda, Check-in, Colas de Trabajo, Órdenes de Servicio, Control SLA
 * Vista según rol: Super Admin ve todo, Recepción ve check-in + colas, Médico ve su cola + agenda
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Clock, Users, Calendar, CheckCircle, XCircle,
    AlertTriangle, Building2, Stethoscope, Timer, Play, Pause,
    RefreshCw, ClipboardList, Gauge, ArrowRight, Zap, TrendingUp,
    ChevronRight, Search, Filter, BarChart3, Shield, FileText,
    UserCheck, Radio, Loader2, Eye, AlertCircle, Layers,
    Package, Headphones, Microscope, Heart, Ear, Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { episodioService } from '@/services/episodioService';
import { ordenServicioService } from '@/services/ordenServicioService';
import { sedesService } from '@/services/dataService';
import type { TipoCola, EpisodioAtencion } from '@/types/episodio';
import { CheckInRecepcion } from '@/components/episodios/CheckInRecepcion';
import { ColaTrabajo } from '@/components/episodios/ColaTrabajo';
import { SLA_POR_TIPO } from '@/types/episodio';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════
// TIPOS LOCALES
// ═══════════════════════════════════════════════════

interface SedeOption {
    id: string;
    nombre: string;
}

interface PipelineStats {
    total_hoy: number;
    por_estado: Record<string, number>;
    tiempo_promedio: number;
    alertas_sla: number;
}

interface OrdenResumen {
    total: number;
    borradores: number;
    en_proceso: number;
    completadas: number;
    monto_total: number;
}

// ═══════════════════════════════════════════════════
// CONFIGURACIONES
// ═══════════════════════════════════════════════════

const COLAS_CONFIG: { tipo: TipoCola; label: string; icon: React.ReactNode; color: string }[] = [
    { tipo: 'recepcion', label: 'Recepción', icon: <Users className="w-4 h-4" />, color: 'slate' },
    { tipo: 'triage', label: 'Triage / Enfermería', icon: <Heart className="w-4 h-4" />, color: 'blue' },
    { tipo: 'laboratorio', label: 'Laboratorio', icon: <Microscope className="w-4 h-4" />, color: 'purple' },
    { tipo: 'imagen', label: 'Rayos X / Imagen', icon: <Eye className="w-4 h-4" />, color: 'cyan' },
    { tipo: 'audiometria', label: 'Audiometría', icon: <Ear className="w-4 h-4" />, color: 'pink' },
    { tipo: 'espirometria', label: 'Espirometría', icon: <Wind className="w-4 h-4" />, color: 'orange' },
    { tipo: 'consulta', label: 'Consulta Médica', icon: <Stethoscope className="w-4 h-4" />, color: 'emerald' },
    { tipo: 'dictamen', label: 'Dictamen', icon: <FileText className="w-4 h-4" />, color: 'amber' },
];

const ESTADO_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    registro: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
    triage: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    evaluaciones: { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    laboratorio: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    imagen: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
    audiometria: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
    espirometria: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    dictamen: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cerrado: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

// ═══════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════

function LiveDot() {
    return (
        <span className="relative flex h-2.5 w-2.5 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
    );
}

function StatCard({ icon: Icon, label, value, subValue, color, trend }: {
    icon: any; label: string; value: string | number; subValue?: string; color: string; trend?: string;
}) {
    const bgMap: Record<string, string> = {
        emerald: 'from-emerald-500 to-teal-600',
        blue: 'from-blue-500 to-indigo-600',
        purple: 'from-purple-500 to-violet-600',
        amber: 'from-amber-500 to-orange-600',
        rose: 'from-rose-500 to-pink-600',
        slate: 'from-slate-700 to-slate-900',
        cyan: 'from-cyan-500 to-blue-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgMap[color] || bgMap.emerald} p-5 text-white shadow-lg`}
        >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                    </div>
                    {trend && (
                        <span className="text-[10px] font-bold text-white/80 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> {trend}
                        </span>
                    )}
                </div>
                <h3 className="text-2xl font-black">{value}</h3>
                <p className="text-white/80 text-xs font-semibold">{label}</p>
                {subValue && <p className="text-white/60 text-[10px] mt-0.5">{subValue}</p>}
            </div>
        </motion.div>
    );
}

function SLAGauge({ label, tipo, elapsed, sla }: { label: string; tipo: string; elapsed: number; sla: number }) {
    const pct = Math.min((elapsed / sla) * 100, 100);
    const isBreached = pct >= 100;
    const isWarning = pct >= 75;

    return (
        <div className={`p-4 rounded-xl border-2 ${isBreached ? 'border-rose-300 bg-rose-50' : isWarning ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">{label}</span>
                <Badge className={`text-[9px] font-black ${isBreached ? 'bg-rose-500 text-white' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isBreached ? 'BREACH' : isWarning ? 'WARNING' : 'OK'}
                </Badge>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${isBreached ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-mono">{elapsed} min</span>
                <span className="text-[10px] text-slate-400 font-mono">SLA: {sla} min</span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════

export default function CentroOperaciones() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('live');
    const [selectedSede, setSelectedSede] = useState<string>('');
    const [sedes, setSedes] = useState<SedeOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCola, setSelectedCola] = useState<TipoCola>('recepcion');

    // Stats
    const [pipelineStats, setPipelineStats] = useState<PipelineStats>({ total_hoy: 0, por_estado: {}, tiempo_promedio: 0, alertas_sla: 0 });
    const [ordenResumen, setOrdenResumen] = useState<OrdenResumen>({ total: 0, borradores: 0, en_proceso: 0, completadas: 0, monto_total: 0 });
    const [episodiosActivos, setEpisodiosActivos] = useState<EpisodioAtencion[]>([]);
    const [alertasSLA, setAlertasSLA] = useState<any[]>([]);

    // Cargar sedes
    useEffect(() => {
        async function loadSedes() {
            try {
                const data = await sedesService.getAll();
                if (data && data.length > 0) {
                    setSedes(data.map((s: any) => ({ id: s.id, nombre: s.nombre })));
                    setSelectedSede(data[0].id);
                }
            } catch (e) {
                console.error('Error cargando sedes:', e);
            }
        }
        loadSedes();
    }, []);

    // Cargar datos operativos
    useEffect(() => {
        if (!selectedSede) return;
        loadOperationalData();
    }, [selectedSede]);

    async function loadOperationalData() {
        setLoading(true);
        try {
            const [statsData, ordenData, episodiosData, alertasData] = await Promise.allSettled([
                episodioService.obtenerStats(selectedSede),
                ordenServicioService.resumen(),
                episodioService.listarActivosPorSede(selectedSede),
                episodioService.verificarSLAs(),
            ]);

            if (statsData.status === 'fulfilled') setPipelineStats(statsData.value);
            if (ordenData.status === 'fulfilled') setOrdenResumen(ordenData.value);
            if (episodiosData.status === 'fulfilled') setEpisodiosActivos(episodiosData.value);
            if (alertasData.status === 'fulfilled') setAlertasSLA(alertasData.value);
        } catch (e) {
            console.error('Error cargando datos operativos:', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        await loadOperationalData();
        setRefreshing(false);
        toast.success('Datos actualizados');
    }

    // Calcular contadores por estado de pipeline
    const contadoresPipeline = useMemo(() => {
        const counts: Record<string, number> = {};
        episodiosActivos.forEach(ep => {
            counts[ep.estado_actual] = (counts[ep.estado_actual] || 0) + 1;
        });
        return counts;
    }, [episodiosActivos]);

    // Pacientes SLA en riesgo
    const pacientesEnRiesgo = useMemo(() => {
        return episodiosActivos.filter(ep => {
            const sla = SLA_POR_TIPO[ep.tipo as keyof typeof SLA_POR_TIPO] || 60;
            const inicio = new Date(ep.created_at).getTime();
            const ahora = Date.now();
            const minutosTranscurridos = (ahora - inicio) / 60000;
            return minutosTranscurridos > sla * 0.75;
        });
    }, [episodiosActivos]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            <PremiumPageHeader
                title="Centro de Operaciones"
                subtitle="Control en tiempo real del flujo de pacientes, colas de trabajo, órdenes y SLAs."
                icon={Gauge}
                badge="LIVE"
                actions={
                    <div className="flex items-center gap-3">
                        {/* Selector de Sede */}
                        <select
                            className="h-10 px-4 rounded-xl text-sm font-bold bg-white/10 border border-white/20 text-white"
                            value={selectedSede}
                            onChange={(e) => setSelectedSede(e.target.value)}
                        >
                            {sedes.map(s => (
                                <option key={s.id} value={s.id} className="text-slate-900">{s.nombre}</option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="h-10 px-4 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                }
            />

            <div className="w-full px-6 lg:px-8 py-6 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard icon={Users} label="Episodios Hoy" value={pipelineStats.total_hoy} color="slate" />
                    <StatCard icon={Clock} label="En Cola" value={Object.values(contadoresPipeline).reduce((a, b) => a + b, 0)} subValue="Pacientes activos" color="blue" />
                    <StatCard icon={Timer} label="T. Promedio" value={`${pipelineStats.tiempo_promedio || 0}m`} subValue="Minutos por paciente" color="purple" />
                    <StatCard icon={AlertTriangle} label="Alertas SLA" value={pipelineStats.alertas_sla} subValue={pacientesEnRiesgo.length > 0 ? `${pacientesEnRiesgo.length} en riesgo` : 'Sin alertas'} color={pipelineStats.alertas_sla > 0 ? 'rose' : 'emerald'} />
                    <StatCard icon={ClipboardList} label="Órdenes" value={ordenResumen.total} subValue={`${ordenResumen.en_proceso} en proceso`} color="amber" />
                    <StatCard icon={CheckCircle} label="Completados" value={pipelineStats.por_estado?.cerrado || 0} subValue="Hoy" color="emerald" trend="+12%" />
                </div>

                {/* Pipeline Visual */}
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/30 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-600" />
                                Pipeline de Atención — Tiempo Real
                                <LiveDot />
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                                Sede: {sedes.find(s => s.id === selectedSede)?.nombre || '—'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {['registro', 'triage', 'evaluaciones', 'laboratorio', 'imagen', 'audiometria', 'espirometria', 'dictamen', 'cerrado'].map((estado, idx, arr) => {
                                const style = ESTADO_COLORS[estado] || ESTADO_COLORS.registro;
                                const count = contadoresPipeline[estado] || 0;
                                return (
                                    <React.Fragment key={estado}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`flex-shrink-0 px-4 py-3 rounded-xl ${style.bg} border border-transparent hover:shadow-md transition-all min-w-[110px] text-center`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${style.text}`}>
                                                    {estado === 'evaluaciones' ? 'Eval.' : estado}
                                                </span>
                                            </div>
                                            <p className={`text-2xl font-black ${style.text}`}>{count}</p>
                                        </motion.div>
                                        {idx < arr.length - 1 && (
                                            <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-white/60 backdrop-blur-md border border-white/80 p-1.5 rounded-2xl w-full justify-start shadow-sm flex-wrap gap-1">
                        <TabsTrigger value="live" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Radio className="w-3.5 h-3.5 mr-1.5" /> Live
                        </TabsTrigger>
                        <TabsTrigger value="checkin" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Check-In
                        </TabsTrigger>
                        <TabsTrigger value="colas" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-purple-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Layers className="w-3.5 h-3.5 mr-1.5" /> Colas
                        </TabsTrigger>
                        <TabsTrigger value="ordenes" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Órdenes
                        </TabsTrigger>
                        <TabsTrigger value="sla" className="rounded-xl px-5 py-2.5 data-[state=active]:bg-rose-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Gauge className="w-3.5 h-3.5 mr-1.5" /> SLA
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── TAB: LIVE ─── */}
                    <TabsContent value="live" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Episodios Activos */}
                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        Episodios Activos
                                        <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] font-black ml-2">
                                            {episodiosActivos.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                        </div>
                                    ) : episodiosActivos.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <Users className="w-10 h-10 text-slate-200 mb-3" />
                                            <p className="text-sm text-slate-400 font-medium">No hay episodios activos</p>
                                        </div>
                                    ) : (
                                        episodiosActivos.slice(0, 20).map((ep, idx) => {
                                            const style = ESTADO_COLORS[ep.estado_actual] || ESTADO_COLORS.registro;
                                            const sla = SLA_POR_TIPO[ep.tipo as keyof typeof SLA_POR_TIPO] || 60;
                                            const minutosTranscurridos = Math.round((Date.now() - new Date(ep.created_at).getTime()) / 60000);
                                            const slaBreached = minutosTranscurridos > sla;

                                            return (
                                                <div
                                                    key={ep.id}
                                                    className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${slaBreached ? 'bg-rose-50/40' : ''}`}
                                                >
                                                    <span className="text-[10px] font-mono text-slate-400 w-5">{idx + 1}</span>
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.bg}`}>
                                                        <Activity className={`w-4 h-4 ${style.text}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 truncate">
                                                            {ep.paciente?.nombre || 'Paciente'} {ep.paciente?.apellido_paterno || ''}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Badge className={`${style.bg} ${style.text} border-0 text-[9px] font-black capitalize`}>
                                                                {ep.estado_actual}
                                                            </Badge>
                                                            <span className="text-[10px] text-slate-400 font-medium capitalize">{ep.tipo}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className={`text-xs font-mono font-bold ${slaBreached ? 'text-rose-600' : minutosTranscurridos > sla * 0.75 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                            {minutosTranscurridos}m
                                                        </p>
                                                        <p className="text-[9px] text-slate-400">SLA {sla}m</p>
                                                    </div>
                                                    {slaBreached && <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resumen de Colas */}
                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-purple-500" />
                                        Colas de Trabajo — Resumen
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {COLAS_CONFIG.map(cola => {
                                        const count = contadoresPipeline[cola.tipo] || 0;
                                        return (
                                            <button
                                                key={cola.tipo}
                                                onClick={() => { setSelectedCola(cola.tipo); setActiveTab('colas'); }}
                                                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                        {cola.icon}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-slate-800">{cola.label}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-slate-900">{count}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">en cola</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alertas SLA activas */}
                        {alertasSLA.length > 0 && (
                            <Card className="border-2 border-rose-200 shadow-lg bg-white">
                                <CardHeader className="bg-rose-50/50 border-b border-rose-200">
                                    <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-700">
                                        <AlertTriangle className="w-5 h-5" />
                                        Alertas SLA Activas
                                        <Badge className="bg-rose-500 text-white text-[10px] font-black ml-2">{alertasSLA.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    {alertasSLA.slice(0, 5).map((alerta, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                                <div>
                                                    <p className="text-sm font-bold text-rose-800">
                                                        {alerta.paciente_nombre || `Episodio ${alerta.episodio_id?.slice(0, 8)}`}
                                                    </p>
                                                    <p className="text-[10px] text-rose-500 font-medium">
                                                        {alerta.tipo_evaluacion} — SLA excedido por {alerta.minutos_excedidos || '?'}min
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-rose-600 text-white text-[10px] font-black">BREACH</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ─── TAB: CHECK-IN ─── */}
                    <TabsContent value="checkin" className="space-y-6">
                        {selectedSede ? (
                            <CheckInRecepcion
                                sedeId={selectedSede}
                                onEpisodioCreado={(id) => {
                                    toast.success(`Episodio ${id.slice(0, 8)} creado`);
                                    loadOperationalData();
                                }}
                            />
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="py-16 text-center">
                                    <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400">Seleccione una sede para iniciar check-in</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ─── TAB: COLAS ─── */}
                    <TabsContent value="colas" className="space-y-6">
                        {/* Cola Selector */}
                        <div className="flex gap-2 flex-wrap">
                            {COLAS_CONFIG.map(cola => (
                                <button
                                    key={cola.tipo}
                                    onClick={() => setSelectedCola(cola.tipo)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedCola === cola.tipo
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                        }`}
                                >
                                    {cola.icon}
                                    {cola.label}
                                </button>
                            ))}
                        </div>

                        {/* Cola Activa */}
                        {selectedSede ? (
                            <ColaTrabajo
                                sedeId={selectedSede}
                                tipo={selectedCola}
                                onPacienteSelect={(p) => {
                                    toast.success(`Paciente ${p.paciente.nombre} seleccionado`);
                                }}
                            />
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="py-16 text-center">
                                    <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400">Seleccione una sede para ver la cola</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ─── TAB: ÓRDENES ─── */}
                    <TabsContent value="ordenes" className="space-y-6">
                        {/* Resumen KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
                                <p className="text-2xl font-black text-slate-900">{ordenResumen.total}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Órdenes</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
                                <p className="text-2xl font-black text-slate-500">{ordenResumen.borradores}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Borradores</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl shadow-sm border border-blue-100 text-center">
                                <p className="text-2xl font-black text-blue-700">{ordenResumen.en_proceso}</p>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">En Proceso</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 text-center">
                                <p className="text-2xl font-black text-emerald-700">{ordenResumen.completadas}</p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Completadas</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl shadow-sm border border-amber-100 text-center">
                                <p className="text-2xl font-black text-amber-700">${ordenResumen.monto_total.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Monto Total</p>
                            </div>
                        </div>

                        {/* Link a la página completa */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <ClipboardList className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Gestión de Órdenes de Servicio</h3>
                                            <p className="text-xs text-slate-400 font-medium">Crear, aprobar y dar seguimiento a órdenes internas y por empresa</p>
                                        </div>
                                    </div>
                                    <a href="/operaciones/ordenes">
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 font-bold">
                                            Abrir Gestión
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── TAB: SLA CONTROL ─── */}
                    <TabsContent value="sla" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* SLA Gauges por Tipo de Evaluación */}
                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader className="border-b bg-slate-50/50">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Gauge className="w-5 h-5 text-rose-500" />
                                        SLA por Tipo de Evaluación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {Object.entries(SLA_POR_TIPO).map(([tipo, sla]) => {
                                        // Calcular promedio de minutos transcurridos para episodios de este tipo
                                        const episodiosTipo = episodiosActivos.filter(ep => ep.tipo === tipo);
                                        const avgElapsed = episodiosTipo.length > 0
                                            ? Math.round(episodiosTipo.reduce((sum, ep) => sum + (Date.now() - new Date(ep.created_at).getTime()) / 60000, 0) / episodiosTipo.length)
                                            : 0;

                                        return (
                                            <SLAGauge
                                                key={tipo}
                                                label={`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} (${episodiosTipo.length} activos)`}
                                                tipo={tipo}
                                                elapsed={avgElapsed}
                                                sla={sla}
                                            />
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Compliance Score */}
                            <div className="space-y-6">
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white overflow-hidden">
                                    <CardContent className="p-8 text-center relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-2">
                                            Cumplimiento SLA General
                                        </p>
                                        <p className="text-6xl font-black">
                                            {pipelineStats.total_hoy > 0
                                                ? Math.round(((pipelineStats.total_hoy - pipelineStats.alertas_sla) / pipelineStats.total_hoy) * 100)
                                                : 100}%
                                        </p>
                                        <p className="text-emerald-200 text-sm font-medium mt-2">
                                            {pipelineStats.alertas_sla} of {pipelineStats.total_hoy} episodios excedieron SLA
                                        </p>
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden max-w-xs">
                                                <div
                                                    className="h-full bg-white rounded-full"
                                                    style={{
                                                        width: `${pipelineStats.total_hoy > 0
                                                            ? ((pipelineStats.total_hoy - pipelineStats.alertas_sla) / pipelineStats.total_hoy) * 100
                                                            : 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* SLA Definitions */}
                                <Card className="border-0 shadow-lg bg-white">
                                    <CardHeader className="border-b bg-slate-50/50">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <Timer className="w-5 h-5 text-blue-500" />
                                            Definiciones SLA
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(SLA_POR_TIPO).map(([tipo, minutos]) => (
                                                <div key={tipo} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-xs font-bold text-slate-700 capitalize">{tipo}</span>
                                                    <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] font-black">
                                                        {minutos} min
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Breach History */}
                                <Card className="border-0 shadow-lg bg-white">
                                    <CardHeader className="border-b bg-slate-50/50">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                            Historial de Incumplimientos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        {alertasSLA.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <CheckCircle className="w-10 h-10 text-emerald-200 mb-3" />
                                                <p className="text-sm text-slate-400 font-medium">Sin incumplimientos de SLA hoy</p>
                                                <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ Todos los pacientes dentro del SLA</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {alertasSLA.map((a, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-amber-800 truncate">
                                                                {a.paciente_nombre || `Episodio ${a.episodio_id?.slice(0, 8)}`}
                                                            </p>
                                                            <p className="text-[10px] text-amber-600">{a.tipo_evaluacion} — excedido por {a.minutos_excedidos}min</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
