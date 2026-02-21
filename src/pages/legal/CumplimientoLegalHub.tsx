/**
 * CumplimientoLegalHub — GPMedical 3.5
 *
 * CENTRO DE CUMPLIMIENTO LEGAL STPS
 * Panel de gestión integral con 5 secciones:
 *  1. Programas Normativos (NOM-011, NOM-036, etc.)
 *  2. Evidencias Documentales por Trabajador
 *  3. Desviaciones y Seguimiento
 *  4. Bitácora de Auditoría STPS
 *  5. Control de Responsables (Médico SO)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, FileText, AlertTriangle, ClipboardList, UserCog,
    Plus, Search, Filter, ChevronRight, ChevronDown, Eye,
    Calendar, Building2, Hash, CheckCircle2, XCircle, Clock,
    Loader2, ArrowUpRight, TrendingUp, TrendingDown,
    BookOpen, Scale, CircleAlert, BadgeCheck, RefreshCw,
    Activity, Award, Briefcase, FileWarning, Gavel, Stethoscope,
    UserCheck, Upload, ExternalLink, MessageSquare
} from 'lucide-react';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import cumplimientoSTPSService, {
    type ProgramaSTPS, type DesviacionSTPS, type AuditoriaSTPS,
    type ResponsableSTPS, type KPICumplimiento
} from '@/services/cumplimientoSTPSService';
import { evidenciasService, type EvidenciaSTPS } from '@/services/evidenciasService';

// ═══════════════════════════════════════════════════
// SUB-COMPONENTES COMPARTIDOS
// ═══════════════════════════════════════════════════

const GlassCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}> = ({ children, className = '', delay = 0, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.08, duration: 0.5 }}
        onClick={onClick}
        className={`bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40
            hover:shadow-xl hover:shadow-emerald-100/30 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
        {children}
    </motion.div>
);

const StatusBadge: React.FC<{ estado: string; size?: 'sm' | 'md' }> = ({ estado, size = 'sm' }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        activo: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Activo' },
        borrador: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Borrador' },
        vencido: { bg: 'bg-red-50', text: 'text-red-700', label: 'Vencido' },
        renovado: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Renovado' },
        suspendido: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Suspendido' },
        abierta: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Abierta' },
        en_proceso: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'En Proceso' },
        accion_tomada: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Acción Tomada' },
        verificada: { bg: 'bg-teal-50', text: 'text-teal-700', label: 'Verificada' },
        cerrada: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Cerrada' },
        escalada: { bg: 'bg-red-50', text: 'text-red-700', label: 'Escalada' },
        conforme: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Conforme' },
        no_conforme: { bg: 'bg-red-50', text: 'text-red-700', label: 'No Conforme' },
        conforme_observaciones: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'C/ Observaciones' },
        sancion: { bg: 'bg-red-100', text: 'text-red-800', label: 'Con Sanción' },
    };
    const c = config[estado] || { bg: 'bg-slate-100', text: 'text-slate-600', label: estado };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest
            ${c.bg} ${c.text} ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.text.replace('text-', 'bg-')}`} />
            {c.label}
        </span>
    );
};

const SeverityDot: React.FC<{ severity: string }> = ({ severity }) => {
    const colors: Record<string, string> = {
        menor: 'bg-yellow-400',
        mayor: 'bg-orange-500',
        critica: 'bg-red-600',
    };
    return <span className={`w-2.5 h-2.5 rounded-full ${colors[severity] || 'bg-slate-400'}`} />;
};

// ─── KPI Mini Card ───
const KPICard: React.FC<{
    icon: React.ElementType; label: string; value: number | string;
    color: string; trend?: 'up' | 'down' | 'neutral'; delay?: number;
    sub?: string;
}> = ({ icon: Icon, label, value, color, trend, delay = 0, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1, duration: 0.5 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 flex flex-col items-center text-center
            hover:shadow-lg transition-shadow"
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</p>}
        {trend && (
            <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold
                ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            </div>
        )}
    </motion.div>
);

// ─── Tab Button ───
const Tab: React.FC<{
    icon: React.ElementType; label: string; active: boolean; onClick: () => void;
    badge?: number;
}> = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest
            transition-all whitespace-nowrap
            ${active
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
    >
        <Icon className="w-4 h-4" />
        {label}
        {badge !== undefined && badge > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black
                ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                {badge}
            </span>
        )}
    </button>
);

// ───────────────────────────────────────────────────
// Norma icons/colors mapping
// ───────────────────────────────────────────────────
const NORMA_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    'NOM-011-STPS': { label: 'Conservación Auditiva', color: 'from-amber-500 to-orange-600', icon: Activity },
    'NOM-036-1-STPS': { label: 'Ergonomía / Manejo de Cargas', color: 'from-blue-500 to-indigo-600', icon: Briefcase },
    'NOM-035-STPS': { label: 'Factores Psicosociales', color: 'from-purple-500 to-violet-600', icon: BookOpen },
    'NOM-030-STPS': { label: 'Servicios Preventivos de SST', color: 'from-emerald-500 to-green-600', icon: Stethoscope },
    'NOM-017-STPS': { label: 'Equipo de Protección Personal', color: 'from-cyan-500 to-teal-600', icon: ShieldCheck },
};

const getNormaConfig = (codigo: string) =>
    NORMA_CONFIG[codigo] || { label: codigo, color: 'from-slate-500 to-slate-600', icon: Scale };

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════

export default function CumplimientoLegalHub() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'programas' | 'evidencias' | 'desviaciones' | 'auditoria' | 'responsables'>('programas');

    // Data states
    const [kpi, setKpi] = useState<KPICumplimiento | null>(null);
    const [programas, setProgramas] = useState<ProgramaSTPS[]>([]);
    const [desviaciones, setDesviaciones] = useState<DesviacionSTPS[]>([]);
    const [auditorias, setAuditorias] = useState<AuditoriaSTPS[]>([]);
    const [responsables, setResponsables] = useState<ResponsableSTPS[]>([]);
    const [evidencias, setEvidencias] = useState<EvidenciaSTPS[]>([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('all');

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [kpiData, progsData, desvsData, audsData, respsData] = await Promise.all([
                cumplimientoSTPSService.obtenerKPIs(),
                cumplimientoSTPSService.listarProgramas(),
                cumplimientoSTPSService.listarDesviaciones(),
                cumplimientoSTPSService.listarAuditorias(),
                cumplimientoSTPSService.listarResponsables(),
            ]);
            setKpi(kpiData);
            setProgramas(progsData);
            setDesviaciones(desvsData);
            setAuditorias(audsData);
            setResponsables(respsData);
        } catch (err) {
            console.error('Error cargando datos STPS:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    // ── Loading state ──
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Cargando módulo de cumplimiento...
                </p>
            </div>
        </div>
    );

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════
    return (
        <div className="space-y-8 pb-16">
            {/* ── Header ── */}
            <PremiumPageHeader
                title="Cumplimiento Legal"
                subtitle="Centro de gestión normativa STPS — Programas, Evidencias, Auditoría y Control"
                badge="STPS v3.5"
                icon={Scale}
                actions={
                    <button
                        onClick={cargarDatos}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl
                            text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Actualizar
                    </button>
                }
            />

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <KPICard icon={BookOpen} label="Programas Activos" value={kpi?.programasActivos || 0}
                    color="bg-gradient-to-br from-emerald-500 to-green-600" delay={0}
                    sub={kpi?.programasVencidos ? `${kpi.programasVencidos} vencido(s)` : undefined} />
                <KPICard icon={TrendingUp} label="Cumplimiento" value={`${kpi?.cumplimientoPromedio || 0}%`}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600" delay={1}
                    trend={(kpi?.cumplimientoPromedio || 0) >= 80 ? 'up' : 'down'} />
                <KPICard icon={AlertTriangle} label="Desviaciones" value={kpi?.desviacionesAbiertas || 0}
                    color="bg-gradient-to-br from-amber-500 to-orange-600" delay={2}
                    sub={kpi?.desviacionesCriticas ? `${kpi.desviacionesCriticas} crítica(s)` : undefined} />
                <KPICard icon={FileText} label="Evidencias" value={kpi?.evidenciasTotal || 0}
                    color="bg-gradient-to-br from-violet-500 to-purple-600" delay={3}
                    sub={kpi?.evidenciasPendientes ? `${kpi.evidenciasPendientes} por validar` : undefined} />
                <KPICard icon={UserCog} label="Responsables" value={kpi?.responsablesActivos || 0}
                    color="bg-gradient-to-br from-teal-500 to-cyan-600" delay={4} />
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Tab icon={BookOpen} label="Programas" active={activeTab === 'programas'} onClick={() => setActiveTab('programas')} />
                <Tab icon={FileText} label="Evidencias" active={activeTab === 'evidencias'} onClick={() => setActiveTab('evidencias')}
                    badge={kpi?.evidenciasPendientes} />
                <Tab icon={AlertTriangle} label="Desviaciones" active={activeTab === 'desviaciones'} onClick={() => setActiveTab('desviaciones')}
                    badge={kpi?.desviacionesAbiertas} />
                <Tab icon={ClipboardList} label="Auditoría" active={activeTab === 'auditoria'} onClick={() => setActiveTab('auditoria')} />
                <Tab icon={UserCog} label="Responsables" active={activeTab === 'responsables'} onClick={() => setActiveTab('responsables')} />
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
                {activeTab === 'programas' && <ProgramasTab programas={programas} key="prog" />}
                {activeTab === 'evidencias' && <EvidenciasTab key="evid" />}
                {activeTab === 'desviaciones' && <DesviacionesTab desviaciones={desviaciones} key="desv" />}
                {activeTab === 'auditoria' && <AuditoriaTab auditorias={auditorias} key="aud" />}
                {activeTab === 'responsables' && <ResponsablesTab responsables={responsables} key="resp" />}
            </AnimatePresence>
        </div>
    );
}


// ═══════════════════════════════════════════════════
// TAB 1: PROGRAMAS NORMATIVOS
// ═══════════════════════════════════════════════════

const ProgramasTab: React.FC<{ programas: ProgramaSTPS[] }> = ({ programas }) => {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Programas Regulatorios</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-2xl
                    text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                    <Plus className="w-4 h-4" /> Nuevo Programa
                </button>
            </div>

            {programas.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No hay programas registrados</p>
                    <p className="text-slate-300 text-sm mt-1">Crea un programa para NOM-011, NOM-036 u otra normativa</p>
                </GlassCard>
            ) : (
                programas.map((prog, i) => {
                    const norma = getNormaConfig(prog.codigo_norma);
                    const isExpanded = expanded === prog.id;
                    return (
                        <GlassCard key={prog.id} delay={i} onClick={() => setExpanded(isExpanded ? null : prog.id)}>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${norma.color} flex items-center justify-center flex-shrink-0`}>
                                        <norma.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-base font-black text-slate-800 tracking-tight">{prog.nombre}</h3>
                                            <StatusBadge estado={prog.estado} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {prog.codigo_norma} • {prog.anio_programa} • {prog.total_trabajadores_alcance} trabajadores
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="relative w-16 h-16">
                                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none" stroke={(prog.porcentaje_cumplimiento || 0) >= 80 ? '#10b981' : (prog.porcentaje_cumplimiento || 0) >= 50 ? '#f59e0b' : '#ef4444'}
                                                    strokeWidth="3" strokeDasharray={`${prog.porcentaje_cumplimiento || 0}, 100`}
                                                    strokeLinecap="round" />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700">
                                                {Math.round(prog.porcentaje_cumplimiento || 0)}%
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Expanded content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-6 pt-6 border-t border-slate-100 overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Vigencia</p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {new Date(prog.fecha_inicio).toLocaleDateString()} — {new Date(prog.fecha_fin).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsable</p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {prog.responsable ? `${prog.responsable.nombre} ${prog.responsable.apellido_paterno}` : 'Sin asignar'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Médico SO</p>
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {prog.medico ? `${prog.medico.nombre} ${prog.medico.apellido_paterno}` : 'Sin asignar'}
                                                    </p>
                                                </div>
                                            </div>
                                            {prog.alcance && (
                                                <div className="mt-4">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Alcance</p>
                                                    <p className="text-sm text-slate-600">{prog.alcance}</p>
                                                </div>
                                            )}
                                            {prog.objetivos && prog.objetivos.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Objetivos</p>
                                                    <div className="space-y-2">
                                                        {prog.objetivos.map((obj: any, j: number) => (
                                                            <div key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                {obj.objetivo || obj}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    );
                })
            )}
        </motion.div>
    );
};


// ═══════════════════════════════════════════════════
// TAB 2: EVIDENCIAS DOCUMENTALES
// ═══════════════════════════════════════════════════

const EvidenciasTab: React.FC = () => {
    const [evidencias, setEvidencias] = useState<EvidenciaSTPS[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCat, setFilterCat] = useState('all');

    useEffect(() => {
        (async () => {
            try {
                const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
                const empId = user?.user_metadata?.empresa_id;
                if (empId) {
                    const data = await evidenciasService.listarPorEmpresa(empId);
                    setEvidencias(data);
                }
            } catch { /* fallback */ }
            finally { setLoading(false); }
        })();
    }, []);

    const categorias = ['all', 'nom011', 'nom035', 'nom036', 'dictamen', 'consentimiento', 'capacitacion', 'epp', 'st7_st9'];
    const filtered = evidencias.filter(e => filterCat === 'all' || e.categoria === filterCat);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Evidencias Documentales</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-2xl
                    text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">
                    <Upload className="w-4 h-4" /> Subir Evidencia
                </button>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categorias.map(cat => (
                    <button key={cat} onClick={() => setFilterCat(cat)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                            ${filterCat === cat
                                ? 'bg-violet-600 text-white shadow'
                                : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
                        {cat === 'all' ? 'Todas' : cat.toUpperCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" /></div>
            ) : filtered.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No hay evidencias documentales</p>
                    <p className="text-slate-300 text-sm mt-1">Sube documentos de cumplimiento para tus trabajadores</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((ev, i) => (
                        <GlassCard key={ev.id} delay={i} className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-violet-500" />
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest
                                    ${ev.validado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {ev.validado ? '✓ Validado' : 'Pendiente'}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{ev.nombre_archivo}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                                {ev.categoria.toUpperCase()} • {new Date(ev.fecha_carga).toLocaleDateString()}
                            </p>
                            {ev.url_archivo && (
                                <a href={ev.url_archivo} target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200
                                        rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                    <ExternalLink className="w-3 h-3" /> Descargar
                                </a>
                            )}
                        </GlassCard>
                    ))}
                </div>
            )}
        </motion.div>
    );
};


// ═══════════════════════════════════════════════════
// TAB 3: DESVIACIONES Y SEGUIMIENTO
// ═══════════════════════════════════════════════════

const DesviacionesTab: React.FC<{ desviaciones: DesviacionSTPS[] }> = ({ desviaciones }) => {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [filtro, setFiltro] = useState('all');

    const filtered = desviaciones.filter(d => filtro === 'all' || d.estado === filtro);
    const estados = ['all', 'abierta', 'en_proceso', 'accion_tomada', 'verificada', 'cerrada'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Desviaciones y Seguimiento</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-2xl
                    text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
                    <Plus className="w-4 h-4" /> Registrar Desviación
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {estados.map(est => (
                    <button key={est} onClick={() => setFiltro(est)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                            ${filtro === est
                                ? 'bg-orange-600 text-white shadow'
                                : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
                        {est === 'all' ? 'Todas' : est.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Sin desviaciones registradas</p>
                    <p className="text-slate-300 text-sm mt-1">Excelente — cumplimiento sin hallazgos</p>
                </GlassCard>
            ) : (
                <div className="space-y-3">
                    {filtered.map((d, i) => {
                        const isExpanded = expanded === d.id;
                        return (
                            <GlassCard key={d.id} delay={i} onClick={() => setExpanded(isExpanded ? null : d.id)}>
                                <div className="p-5">
                                    <div className="flex items-center gap-4">
                                        <SeverityDot severity={d.severidad} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest">{d.folio}</span>
                                                <StatusBadge estado={d.estado} />
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase
                                                    ${d.severidad === 'critica' ? 'bg-red-50 text-red-700'
                                                        : d.severidad === 'mayor' ? 'bg-orange-50 text-orange-700'
                                                            : 'bg-yellow-50 text-yellow-700'}`}>
                                                    {d.severidad}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800 mt-1 truncate">{d.titulo}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                {d.codigo_norma} • Detectada: {new Date(d.fecha_deteccion).toLocaleDateString()}
                                                {d.fecha_compromiso && ` • Compromiso: ${new Date(d.fecha_compromiso).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-4 pt-4 border-t border-slate-100 space-y-4 overflow-hidden"
                                            >
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                                    <p className="text-sm text-slate-600">{d.descripcion}</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {d.causa_raiz && (
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Causa Raíz</p>
                                                            <p className="text-sm text-slate-600">{d.causa_raiz}</p>
                                                        </div>
                                                    )}
                                                    {d.accion_correctiva && (
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Acción Correctiva</p>
                                                            <p className="text-sm text-slate-600">{d.accion_correctiva}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {d.notas_seguimiento && d.notas_seguimiento.length > 0 && (
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Seguimiento</p>
                                                        <div className="space-y-2 pl-4 border-l-2 border-orange-200">
                                                            {d.notas_seguimiento.map((n: any, j: number) => (
                                                                <div key={j} className="text-sm">
                                                                    <span className="text-[10px] font-bold text-slate-400">
                                                                        {new Date(n.fecha).toLocaleDateString()} — {n.autor}
                                                                    </span>
                                                                    <p className="text-slate-600">{n.nota}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};


// ═══════════════════════════════════════════════════
// TAB 4: BITÁCORA DE AUDITORÍA
// ═══════════════════════════════════════════════════

const AuditoriaTab: React.FC<{ auditorias: AuditoriaSTPS[] }> = ({ auditorias }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Bitácora de Auditoría STPS</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl
                text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                <Plus className="w-4 h-4" /> Registrar Auditoría
            </button>
        </div>

        {auditorias.length === 0 ? (
            <GlassCard className="p-12 text-center">
                <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Sin auditorías registradas</p>
                <p className="text-slate-300 text-sm mt-1">Registra inspecciones internas y externas de la STPS</p>
            </GlassCard>
        ) : (
            <div className="space-y-3">
                {auditorias.map((aud, i) => (
                    <GlassCard key={aud.id} delay={i} className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                                ${aud.tipo === 'externa_stps' ? 'bg-red-50' : aud.tipo === 'interna' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                                <Gavel className={`w-6 h-6
                                    ${aud.tipo === 'externa_stps' ? 'text-red-500' : aud.tipo === 'interna' ? 'text-blue-500' : 'text-amber-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest">{aud.folio}</span>
                                    <StatusBadge estado={aud.resultado} />
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black uppercase">
                                        {aud.tipo.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 mt-1">{aud.titulo}</h4>
                                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date(aud.fecha_inicio).toLocaleDateString()}
                                    </span>
                                    {aud.auditor_nombre && (
                                        <span className="flex items-center gap-1">
                                            <UserCheck className="w-3 h-3" /> {aud.auditor_nombre}
                                        </span>
                                    )}
                                    {aud.auditor_institucion && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3" /> {aud.auditor_institucion}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-lg font-black text-red-600">{aud.hallazgos_criticos}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase">Críticos</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-orange-600">{aud.hallazgos_mayores}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase">Mayores</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-yellow-600">{aud.hallazgos_menores}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase">Menores</p>
                                    </div>
                                </div>
                                {aud.monto_sancion > 0 && (
                                    <p className="mt-2 text-[10px] font-black text-red-600">
                                        Sanción: ${aud.monto_sancion.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                        {aud.normas_auditadas && aud.normas_auditadas.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
                                {aud.normas_auditadas.map((n, j) => (
                                    <span key={j} className="px-2 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-500 border border-slate-100">
                                        {n}
                                    </span>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>
        )}
    </motion.div>
);


// ═══════════════════════════════════════════════════
// TAB 5: RESPONSABLES
// ═══════════════════════════════════════════════════

const ResponsablesTab: React.FC<{ responsables: ResponsableSTPS[] }> = ({ responsables }) => {
    const tipoLabels: Record<string, { label: string; color: string }> = {
        medico_so: { label: 'Médico Salud Ocupacional', color: 'bg-emerald-50 text-emerald-700' },
        higienista_industrial: { label: 'Higienista Industrial', color: 'bg-blue-50 text-blue-700' },
        ergonomo: { label: 'Ergónomo', color: 'bg-violet-50 text-violet-700' },
        psicologo_laboral: { label: 'Psicólogo Laboral', color: 'bg-purple-50 text-purple-700' },
        responsable_sh: { label: 'Responsable SH', color: 'bg-amber-50 text-amber-700' },
        auditor_interno: { label: 'Auditor Interno', color: 'bg-indigo-50 text-indigo-700' },
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Control de Responsables</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-2xl
                    text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                    <Plus className="w-4 h-4" /> Agregar Responsable
                </button>
            </div>

            {responsables.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Sin responsables registrados</p>
                    <p className="text-slate-300 text-sm mt-1">Agrega médicos especialistas y personal responsable STPS</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {responsables.map((resp, i) => {
                        const tipo = tipoLabels[resp.tipo] || { label: resp.tipo, color: 'bg-slate-100 text-slate-600' };
                        return (
                            <GlassCard key={resp.id} delay={i} className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl
                                        flex items-center justify-center text-white text-xl font-black">
                                        {resp.nombre_completo.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-black text-slate-800 tracking-tight">{resp.nombre_completo}</h4>
                                            {resp.activo ? (
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Activo" />
                                            ) : (
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-400" title="Inactivo" />
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 font-semibold">{resp.cargo}</p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${tipo.color}`}>
                                                {tipo.label}
                                            </span>
                                            {resp.especialidad && (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[8px] font-bold border border-slate-100">
                                                    {resp.especialidad}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-[10px]">
                                    {resp.cedula_profesional && (
                                        <div>
                                            <span className="font-black text-slate-400 uppercase tracking-widest">Cédula</span>
                                            <p className="font-bold text-slate-700 mt-0.5">{resp.cedula_profesional}</p>
                                        </div>
                                    )}
                                    {resp.email && (
                                        <div>
                                            <span className="font-black text-slate-400 uppercase tracking-widest">Email</span>
                                            <p className="font-bold text-slate-700 mt-0.5 truncate">{resp.email}</p>
                                        </div>
                                    )}
                                </div>
                                {resp.normas_competentes && resp.normas_competentes.length > 0 && (
                                    <div className="mt-3 flex gap-1.5 flex-wrap">
                                        {resp.normas_competentes.map((n, j) => (
                                            <span key={j} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg
                                                text-[8px] font-black border border-teal-100">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
