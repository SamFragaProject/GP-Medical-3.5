// =====================================================
// PÁGINA: Estudios Visuales - GPMedical ERP Pro
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Loader2, AlertTriangle, Eye, ChevronRight,
    Calendar, User, CheckCircle2, XCircle, Glasses, BookOpen, Info, ScanLine
} from 'lucide-react';
import { CampimetriaVisualizer } from '@/components/ui/CampimetriaVisualizer';
import { visionService } from '@/services/visionService';
import {
    CLASIFICACION_VISUAL_LABELS,
    CLASIFICACION_VISUAL_COLORS,
    SNELLEN_OPTIONS,
    JAEGER_OPTIONS,
    JAEGER_SCALE,
    JAEGER_CATEGORY_COLORS,
    type EstudioVisual,
    type CrearEstudioVisualDTO,
    type FiltrosVision,
    type ClasificacionVisual,
    type SnellenValue,
    type JaegerValue,
    type JaegerEntry,
} from '@/types/vision';

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const VisualBadge: React.FC<{ clasificacion: ClasificacionVisual }> = ({ clasificacion }) => {
    const { bg, text } = CLASIFICACION_VISUAL_COLORS[clasificacion];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {CLASIFICACION_VISUAL_LABELS[clasificacion]}
        </span>
    );
};

// Mini card shown below the Jaeger select when a value is picked
const JaegerMiniCard: React.FC<{ entry: JaegerEntry }> = ({ entry }) => {
    const colors = JAEGER_CATEGORY_COLORS[entry.category];
    return (
        <div className={`mt-3 p-3 rounded-xl border ${colors.border} ${colors.bg} transition-all`}>
            <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-black ${colors.text}`}>{entry.jaeger}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {entry.category}
                </span>
            </div>
            <p className={`text-[11px] ${colors.text} mb-1.5`}>{entry.description}</p>
            <div className="flex items-center justify-between">
                <div className="flex gap-2 text-[10px] text-slate-500">
                    <span>Snellen: <b>{entry.snellenNear}</b></span>
                    <span>{entry.pointSize}pt</span>
                    <span>LogMAR: {entry.logMAR.toFixed(2)}</span>
                </div>
                <span
                    style={{ fontSize: `${Math.min(entry.pointSize * 1.1, 20)}px`, lineHeight: 1 }}
                    className="font-serif text-slate-600"
                >
                    Aa
                </span>
            </div>
        </div>
    );
};

// =====================================================
// FORMULARIO NUEVO ESTUDIO
// =====================================================

function FormVision({ onCrear, onCerrar }: {
    onCrear: (dto: CrearEstudioVisualDTO) => Promise<void>;
    onCerrar: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        empresa_id: '',
        paciente_id: '',
        od_sin_correccion: '20/20' as SnellenValue,
        od_con_correccion: '' as string,
        oi_sin_correccion: '20/20' as SnellenValue,
        oi_con_correccion: '' as string,
        ishihara_placas_total: 14,
        ishihara_placas_correctas: 14,
        usa_lentes: false,
        tipo_lentes: '' as string,
        campimetria_realizada: false,
        campimetria_od: '' as string,
        campimetria_oi: '' as string,
        estereopsis_segundos_arco: undefined as number | undefined,
        observaciones: '',
        referencia_oftalmologo: false,
        od_jaeger: '' as string,
        oi_jaeger: '' as string,
    });

    // Jaeger panel state
    const [showJaegerPanel, setShowJaegerPanel] = useState(false);
    const [jaegerHighlight, setJaegerHighlight] = useState<JaegerEntry | null>(null);

    // Get current Jaeger entry for the active value
    const odJaegerEntry = JAEGER_SCALE.find(j => j.jaeger === form.od_jaeger);
    const oiJaegerEntry = JAEGER_SCALE.find(j => j.jaeger === form.oi_jaeger);

    const handleSubmit = async () => {
        if (!form.empresa_id || !form.paciente_id) return;
        setLoading(true);
        try {
            await onCrear({
                ...form,
                od_con_correccion: form.od_con_correccion ? form.od_con_correccion as SnellenValue : undefined,
                oi_con_correccion: form.oi_con_correccion ? form.oi_con_correccion as SnellenValue : undefined,
                tipo_lentes: form.tipo_lentes ? form.tipo_lentes as 'armazon' | 'contacto' | 'ambos' : undefined,
                od_jaeger: form.od_jaeger ? form.od_jaeger as JaegerValue : undefined,
                oi_jaeger: form.oi_jaeger ? form.oi_jaeger as JaegerValue : undefined,
            });
        } finally { setLoading(false); }
    };

    const SnellenSelect: React.FC<{ value: string; onChange: (v: string) => void; label: string }> = ({ value, onChange, label }) => (
        <div>
            <label className="block text-xs text-slate-500 mb-1">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20">
                <option value="">—</option>
                {SNELLEN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-blue-500/5"
        >
            <h3 className="text-xl font-bold text-slate-900 mb-6">👁️ Nuevo Estudio Visual</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Empresa *</label>
                    <input value={form.empresa_id} onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))} placeholder="UUID" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                </div>
                <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Paciente *</label>
                    <input value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} placeholder="UUID" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                </div>
            </div>

            {/* Agudeza Visual */}
            <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                    <h4 className="text-sm font-black text-blue-600 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Ojo Derecho (OD)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <SnellenSelect value={form.od_sin_correccion} onChange={v => setForm(f => ({ ...f, od_sin_correccion: v as SnellenValue }))} label="Sin corrección *" />
                        <SnellenSelect value={form.od_con_correccion} onChange={v => setForm(f => ({ ...f, od_con_correccion: v }))} label="Con corrección" />
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                    <h4 className="text-sm font-black text-emerald-600 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Ojo Izquierdo (OI)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <SnellenSelect value={form.oi_sin_correccion} onChange={v => setForm(f => ({ ...f, oi_sin_correccion: v as SnellenValue }))} label="Sin corrección *" />
                        <SnellenSelect value={form.oi_con_correccion} onChange={v => setForm(f => ({ ...f, oi_con_correccion: v }))} label="Con corrección" />
                    </div>
                </div>
            </div>

            {/* ===== SECCIÓN JAEGER (Visión Cercana) ===== */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-purple-700 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Visión Cercana — Escala de Jaeger
                    </h4>
                    <button
                        type="button"
                        onClick={() => setShowJaegerPanel(!showJaegerPanel)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showJaegerPanel
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-purple-50 hover:text-purple-600 border border-slate-200'
                            }`}
                    >
                        <Info className="w-3.5 h-3.5" />
                        {showJaegerPanel ? 'Ocultar Escala' : 'Ver Escala Completa'}
                    </button>
                </div>

                {/* Jaeger selects */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                        <label className="block text-xs text-blue-600 font-bold mb-2">OD — Visión Cercana</label>
                        <select
                            value={form.od_jaeger}
                            onChange={e => {
                                const val = e.target.value;
                                setForm(f => ({ ...f, od_jaeger: val }));
                                const entry = JAEGER_SCALE.find(j => j.jaeger === val);
                                if (entry) setJaegerHighlight(entry);
                            }}
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">— Seleccionar —</option>
                            {JAEGER_OPTIONS.map(j => {
                                const entry = JAEGER_SCALE.find(e => e.jaeger === j);
                                return <option key={j} value={j}>{j} — {entry?.snellenNear || ''}</option>;
                            })}
                        </select>
                        {odJaegerEntry && (
                            <JaegerMiniCard entry={odJaegerEntry} />
                        )}
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                        <label className="block text-xs text-emerald-600 font-bold mb-2">OI — Visión Cercana</label>
                        <select
                            value={form.oi_jaeger}
                            onChange={e => {
                                const val = e.target.value;
                                setForm(f => ({ ...f, oi_jaeger: val }));
                                const entry = JAEGER_SCALE.find(j => j.jaeger === val);
                                if (entry) setJaegerHighlight(entry);
                            }}
                            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="">— Seleccionar —</option>
                            {JAEGER_OPTIONS.map(j => {
                                const entry = JAEGER_SCALE.find(e => e.jaeger === j);
                                return <option key={j} value={j}>{j} — {entry?.snellenNear || ''}</option>;
                            })}
                        </select>
                        {oiJaegerEntry && (
                            <JaegerMiniCard entry={oiJaegerEntry} />
                        )}
                    </div>
                </div>

                {/* ===== INTERACTIVE JAEGER SCALE PANEL ===== */}
                <AnimatePresence>
                    {showJaegerPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-purple-200/60 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-purple-800">Escala de Jaeger — Referencia Interactiva</h5>
                                        <p className="text-[10px] text-purple-500">Distancia de lectura estándar: 35 cm (14"). Haz clic en una fila para seleccionarla.</p>
                                    </div>
                                </div>

                                {/* Live preview */}
                                {jaegerHighlight && (
                                    <div className={`mb-4 p-4 rounded-xl border-2 ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].border} ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].bg} transition-all`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-lg font-black ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].text}`}>
                                                        {jaegerHighlight.jaeger}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].bg} ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].text} border ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].border}`}>
                                                        {jaegerHighlight.category}
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${JAEGER_CATEGORY_COLORS[jaegerHighlight.category].text} mb-2`}>
                                                    {jaegerHighlight.description}
                                                </p>
                                                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                                                    <span>Snellen: <b>{jaegerHighlight.snellenNear}</b></span>
                                                    <span>Pts: <b>{jaegerHighlight.pointSize}pt</b></span>
                                                    <span>M: <b>{jaegerHighlight.mEquivalent}</b></span>
                                                    <span>LogMAR: <b>{jaegerHighlight.logMAR.toFixed(2)}</b></span>
                                                </div>
                                            </div>
                                            {/* Dynamic font preview */}
                                            <div className="flex-shrink-0 w-48 h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden px-3">
                                                <span
                                                    style={{ fontSize: `${Math.min(jaegerHighlight.pointSize * 1.2, 48)}px`, lineHeight: 1.1 }}
                                                    className="text-slate-800 font-serif text-center select-none"
                                                >
                                                    {jaegerHighlight.pointSize <= 8 ? 'El paciente lee este texto' : jaegerHighlight.pointSize <= 16 ? 'Texto' : 'Aa'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Scale table */}
                                <div className="overflow-x-auto rounded-xl border border-purple-200/40 max-h-[320px]">
                                    <table className="w-full text-sm">
                                        <thead className="bg-purple-100/60 sticky top-0 z-10">
                                            <tr>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">Jaeger</th>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">Snellen</th>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">Puntos</th>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">Métrico</th>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">LogMAR</th>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">Categoría</th>
                                                <th className="p-2 text-left text-[9px] font-black text-purple-600 uppercase tracking-widest">Vista Previa</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100/40">
                                            {JAEGER_SCALE.map((entry) => {
                                                const isHighlighted = jaegerHighlight?.jaeger === entry.jaeger;
                                                const isSelected = form.od_jaeger === entry.jaeger || form.oi_jaeger === entry.jaeger;
                                                const catColors = JAEGER_CATEGORY_COLORS[entry.category];
                                                return (
                                                    <tr
                                                        key={entry.jaeger}
                                                        onClick={() => setJaegerHighlight(entry)}
                                                        className={`cursor-pointer transition-all ${isHighlighted ? `${catColors.bg} ${catColors.border} border-l-4` :
                                                            isSelected ? 'bg-purple-50/60 border-l-4 border-purple-400' :
                                                                'hover:bg-purple-50/30'
                                                            }`}
                                                    >
                                                        <td className="p-2 font-black text-slate-800">{entry.jaeger}</td>
                                                        <td className="p-2 font-mono text-slate-600">{entry.snellenNear}</td>
                                                        <td className="p-2 text-slate-600">{entry.pointSize}pt</td>
                                                        <td className="p-2 text-slate-600">{entry.mEquivalent}</td>
                                                        <td className="p-2 font-mono text-slate-500">{entry.logMAR.toFixed(2)}</td>
                                                        <td className="p-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${catColors.bg} ${catColors.text} border ${catColors.border}`}>
                                                                {entry.category}
                                                            </span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span
                                                                style={{ fontSize: `${Math.min(entry.pointSize, 28)}px`, lineHeight: 1 }}
                                                                className="font-serif text-slate-700"
                                                            >
                                                                Aa
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ishihara */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Placas Ishihara</label>
                    <select value={form.ishihara_placas_total} onChange={e => setForm(f => ({ ...f, ishihara_placas_total: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm">
                        <option value={14}>14 placas</option>
                        <option value={38}>38 placas</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Correctas</label>
                    <input type="number" value={form.ishihara_placas_correctas} onChange={e => setForm(f => ({ ...f, ishihara_placas_correctas: Number(e.target.value) }))} max={form.ishihara_placas_total} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm" />
                </div>
                <div className="flex items-end pb-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.usa_lentes} onChange={e => setForm(f => ({ ...f, usa_lentes: e.target.checked }))} className="w-4 h-4 rounded border-slate-300" />
                        <span className="text-sm text-slate-600">Usa lentes</span>
                    </label>
                </div>
            </div>

            {/* Campimetría */}
            <div className="mb-6 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <ScanLine className="w-4 h-4 text-purple-600" />
                        Campimetría Computarizada
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.campimetria_realizada} onChange={e => setForm(f => ({ ...f, campimetria_realizada: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Estudio Realizado</span>
                    </label>
                </div>

                {form.campimetria_realizada && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                            <CampimetriaVisualizer
                                label="Ojo Derecho (Ejes con defecto)"
                                value={form.campimetria_od || ''}
                                onChange={(val) => setForm(f => ({ ...f, campimetria_od: val }))}
                            />
                            <CampimetriaVisualizer
                                label="Ojo Izquierdo (Ejes con defecto)"
                                value={form.campimetria_oi || ''}
                                onChange={(val) => setForm(f => ({ ...f, campimetria_oi: val }))}
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onCerrar} className="px-4 py-2 bg-slate-100/50 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button onClick={handleSubmit} disabled={loading || !form.empresa_id || !form.paciente_id}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Registrar Estudio Visual
                </button>
            </div>
        </motion.div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function EstudiosVisuales() {
    const [estudios, setEstudios] = useState<EstudioVisual[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const filtros: FiltrosVision = {};
            if (searchQuery) filtros.search = searchQuery;
            const data = await visionService.listar(filtros);
            setEstudios(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleCrear = async (dto: CrearEstudioVisualDTO) => {
        const nuevo = await visionService.crear(dto);
        setEstudios(prev => [nuevo, ...prev]);
        setShowForm(false);
    };

    const stats = useMemo(() => ({
        total: estudios.length,
        normales: estudios.filter(e => e.clasificacion === 'normal').length,
        deficientes: estudios.filter(e => e.clasificacion !== 'normal').length,
        lentes: estudios.filter(e => e.usa_lentes).length,
    }), [estudios]);

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Estudios Visuales"
                subtitle="Evaluación integral de agudeza visual, ishihara y campimetría computarizada"
                icon={Eye}
                badge="SISTEMA ACTIVO"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="premium"
                            className="h-12 px-8 shadow-xl shadow-blue-500/30 bg-white text-slate-900 hover:bg-slate-100 font-bold"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Estudio
                        </Button>
                    </div>
                }
            />

            <div className="container mx-auto px-6 -mt-10 relative z-40">
                {/* KPIs Premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PremiumMetricCard
                        title="Total Estudios"
                        value={stats.total}
                        subtitle="Historial registrado"
                        icon={Eye}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Pacientes Normales"
                        value={stats.normales}
                        subtitle="Visión 20/20"
                        icon={CheckCircle2}
                        gradient="emerald"
                        trend={{ value: 85, isPositive: true }}
                    />
                    <PremiumMetricCard
                        title="Deficiencias"
                        value={stats.deficientes}
                        subtitle="Requiere atención"
                        icon={AlertTriangle}
                        gradient="amber"
                    />
                    <PremiumMetricCard
                        title="Uso de Lentes"
                        value={stats.lentes}
                        subtitle="Corrección activa"
                        icon={Glasses}
                        gradient="purple"
                    />
                </div>

                <AnimatePresence>{showForm && <FormVision onCrear={handleCrear} onCerrar={() => setShowForm(false)} />}</AnimatePresence>

                {/* Search */}
                <div className="relative group">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar paciente por nombre o apellido..."
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                </div>

                {/* List */}
                {loading ? (
                    <div className="py-20 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Cargando...</div>
                ) : estudios.length === 0 ? (
                    <div className="py-20 text-center">
                        <Eye className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-slate-400 text-lg font-medium mb-2">Sin estudios visuales</h3>
                        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Registrar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {estudios.map((e, i) => (
                            <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="bg-white border border-slate-100 rounded-2xl p-4 hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-900 font-semibold">{e.paciente?.nombre} {e.paciente?.apellido_paterno}</span>
                                            <VisualBadge clasificacion={e.clasificacion} />
                                            {e.apto_para_puesto ? (
                                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">Apto</span>
                                            ) : (
                                                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">No Apto</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(e.fecha_estudio).toLocaleDateString('es-MX')}</span>
                                            <span>OD: <b className="text-slate-900">{e.od_sin_correccion}</b></span>
                                            <span>OI: <b className="text-slate-900">{e.oi_sin_correccion}</b></span>
                                            {e.usa_lentes && <span className="flex items-center gap-1 font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100"><Glasses className="w-3.5 h-3.5" /> Usa lentes</span>}
                                            {e.referencia_oftalmologo && <span className="text-amber-600 font-bold">⚠ Referido</span>}
                                        </div>
                                        {(e.campimetria_od || e.campimetria_oi || e.od_jaeger) && (
                                            <div className="flex items-center gap-4 text-xs mt-1.5 text-slate-500">
                                                {e.od_jaeger && <span>Jaeger (Cerca): <b className="text-slate-700">OD: {e.od_jaeger} OI: {e.oi_jaeger}</b></span>}
                                                {(e.campimetria_od || e.campimetria_oi) && (
                                                    <span className="flex items-center gap-1">
                                                        <ScanLine className="w-3.5 h-3.5" /> Campimetría:
                                                        <b className="text-slate-700">OD: {e.campimetria_od || 'Normal'} | OI: {e.campimetria_oi || 'Normal'}</b>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>
        </div>
    );
}
