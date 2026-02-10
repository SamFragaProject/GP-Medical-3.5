// =====================================================
// PÁGINA: Estudios Visuales - GPMedical ERP Pro
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Loader2, AlertTriangle, Eye, ChevronRight,
    Calendar, User, CheckCircle2, XCircle, Glasses
} from 'lucide-react';
import { visionService } from '@/services/visionService';
import {
    CLASIFICACION_VISUAL_LABELS,
    CLASIFICACION_VISUAL_COLORS,
    SNELLEN_OPTIONS,
    type EstudioVisual,
    type CrearEstudioVisualDTO,
    type FiltrosVision,
    type ClasificacionVisual,
    type SnellenValue,
} from '@/types/vision';

// =====================================================
// HELPERS
// =====================================================

const VisualBadge: React.FC<{ clasificacion: ClasificacionVisual }> = ({ clasificacion }) => {
    const { bg, text } = CLASIFICACION_VISUAL_COLORS[clasificacion];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {CLASIFICACION_VISUAL_LABELS[clasificacion]}
        </span>
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
        estereopsis_segundos_arco: undefined as number | undefined,
        observaciones: '',
        referencia_oftalmologo: false,
    });

    const handleSubmit = async () => {
        if (!form.empresa_id || !form.paciente_id) return;
        setLoading(true);
        try {
            await onCrear({
                ...form,
                od_con_correccion: form.od_con_correccion ? form.od_con_correccion as SnellenValue : undefined,
                oi_con_correccion: form.oi_con_correccion ? form.oi_con_correccion as SnellenValue : undefined,
                tipo_lentes: form.tipo_lentes ? form.tipo_lentes as 'armazon' | 'contacto' | 'ambos' : undefined,
            });
        } finally { setLoading(false); }
    };

    const SnellenSelect: React.FC<{ value: string; onChange: (v: string) => void; label: string }> = ({ value, onChange, label }) => (
        <div>
            <label className="block text-xs text-white mb-1">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
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
                <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-3">🔵 Ojo Derecho (OD)</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <SnellenSelect value={form.od_sin_correccion} onChange={v => setForm(f => ({ ...f, od_sin_correccion: v as SnellenValue }))} label="Sin corrección *" />
                        <SnellenSelect value={form.od_con_correccion} onChange={v => setForm(f => ({ ...f, od_con_correccion: v }))} label="Con corrección" />
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-green-400 mb-3">🟢 Ojo Izquierdo (OI)</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <SnellenSelect value={form.oi_sin_correccion} onChange={v => setForm(f => ({ ...f, oi_sin_correccion: v as SnellenValue }))} label="Sin corrección *" />
                        <SnellenSelect value={form.oi_con_correccion} onChange={v => setForm(f => ({ ...f, oi_con_correccion: v }))} label="Con corrección" />
                    </div>
                </div>
            </div>

            {/* Ishihara */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-white font-medium mb-1">Placas Ishihara</label>
                    <select value={form.ishihara_placas_total} onChange={e => setForm(f => ({ ...f, ishihara_placas_total: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm">
                        <option value={14}>14 placas</option>
                        <option value={38}>38 placas</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-white font-medium mb-1">Correctas</label>
                    <input type="number" value={form.ishihara_placas_correctas} onChange={e => setForm(f => ({ ...f, ishihara_placas_correctas: Number(e.target.value) }))} max={form.ishihara_placas_total} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
                <div className="flex items-end pb-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.usa_lentes} onChange={e => setForm(f => ({ ...f, usa_lentes: e.target.checked }))} className="w-4 h-4 rounded" />
                        <span className="text-sm text-white/60">Usa lentes</span>
                    </label>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onCerrar} className="px-4 py-2 bg-white/5 rounded-xl text-sm text-white/70 hover:bg-white/10">Cancelar</button>
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
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Estudios Visuales</h1>
                    <p className="text-white/50 mt-1">Agudeza visual Snellen · Ishihara · Campimetría</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-green-500/20 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Estudio
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-blue-400" /><span className="text-sm text-white/50">Total</span></div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-white/50">Normales</span></div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.normales}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-sm text-white/50">Deficientes</span></div>
                    <div className="text-2xl font-bold text-amber-400">{stats.deficientes}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><Glasses className="w-4 h-4 text-purple-400" /><span className="text-sm text-white/50">Usan lentes</span></div>
                    <div className="text-2xl font-bold text-purple-400">{stats.lentes}</div>
                </div>
            </div>

            <AnimatePresence>{showForm && <FormVision onCrear={handleCrear} onCerrar={() => setShowForm(false)} />}</AnimatePresence>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar paciente..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30" />
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 text-center text-white/40"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Cargando...</div>
            ) : estudios.length === 0 ? (
                <div className="py-20 text-center">
                    <Eye className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium mb-2">Sin estudios visuales</h3>
                    <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Registrar
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {estudios.map((e, i) => (
                        <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <User className="w-4 h-4 text-white/40" />
                                        <span className="text-white font-semibold">{e.paciente?.nombre} {e.paciente?.apellido_paterno}</span>
                                        <VisualBadge clasificacion={e.clasificacion} />
                                        {e.apto_para_puesto ? (
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Apto</span>
                                        ) : (
                                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">No Apto</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-white/50">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(e.fecha_estudio).toLocaleDateString('es-MX')}</span>
                                        <span>OD: <b className="text-white">{e.od_sin_correccion}</b></span>
                                        <span>OI: <b className="text-white">{e.oi_sin_correccion}</b></span>
                                        {e.usa_lentes && <span className="flex items-center gap-1"><Glasses className="w-3.5 h-3.5 text-purple-400" /> Usa lentes</span>}
                                        {e.referencia_oftalmologo && <span className="text-amber-400">⚠ Referido</span>}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-all" />
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
    );
}
