// =====================================================
// PÁGINA: Electrocardiograma - GPMedical ERP Pro
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Loader2, AlertTriangle, Activity, ChevronRight,
    Calendar, HeartPulse, User
} from 'lucide-react';
import { electrocardiogramaService } from '@/services/electrocardiogramaService';
import {
    CLASIFICACION_ECG_LABELS,
    CLASIFICACION_ECG_COLORS,
    Electrocardiograma as ElectrocardiogramaType,
    CrearElectrocardiogramaDTO,
    FiltrosElectrocardiograma,
    ClasificacionECG,
} from '@/types/electrocardiograma';

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { Button } from '@/components/ui/button';

const ClasificacionBadge: React.FC<{ clasificacion: ClasificacionECG }> = ({ clasificacion }) => {
    const { bg, text } = CLASIFICACION_ECG_COLORS[clasificacion] || { bg: 'bg-slate-500/20', text: 'text-slate-300' };
    const label = CLASIFICACION_ECG_LABELS[clasificacion] || clasificacion;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {label}
        </span>
    );
};

// =====================================================
// FORMULARIO NUEVO ECG
// =====================================================

function FormElectrocardiograma({ onCrear, onCerrar }: {
    onCrear: (dto: CrearElectrocardiogramaDTO) => Promise<void>;
    onCerrar: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<CrearElectrocardiogramaDTO>({
        empresa_id: '',
        paciente_id: '',
        ritmo: 'Sinusal',
        frecuencia_cardiaca: 70,
        eje_qrs: 60,
        onda_p: 'Normal',
        intervalo_pr: 160,
        complejo_qrs: 90,
        intervalo_qt: 400,
        intervalo_qtc: 410,
        segmento_st: 'Isoeléctrico',
        onda_t: 'Normal',
        hallazgos: 'Sin alteraciones significativas',
        interpretacion_medica: '',
        clasificacion: 'normal',
        calidad_prueba: 'Excelente'
    });

    const handleSubmit = async () => {
        if (!form.empresa_id || !form.paciente_id || form.frecuencia_cardiaca <= 0) return;
        setLoading(true);
        try { await onCrear(form); } finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-rose-500/5"
        >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" /> Nuevo Electrocardiograma
            </h3>

            {/* Datos paciente */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-slate-700 mb-1 font-medium">Empresa *</label>
                    <input value={form.empresa_id} onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))} placeholder="UUID de Empresa" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-rose-500/20 transition-all" />
                </div>
                <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1">Paciente *</label>
                    <input value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} placeholder="UUID de Paciente" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-rose-500/20 transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Ritmo</label>
                    <input value={form.ritmo} onChange={e => setForm(f => ({ ...f, ritmo: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">BPM (Frecuencia)</label>
                    <input type="number" value={form.frecuencia_cardiaca} onChange={e => setForm(f => ({ ...f, frecuencia_cardiaca: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Eje QRS (Grados)</label>
                    <input type="number" value={form.eje_qrs} onChange={e => setForm(f => ({ ...f, eje_qrs: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Onda P</label>
                    <input value={form.onda_p} onChange={e => setForm(f => ({ ...f, onda_p: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Intervalo PR (ms)</label>
                    <input type="number" value={form.intervalo_pr} onChange={e => setForm(f => ({ ...f, intervalo_pr: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Complejo QRS (ms)</label>
                    <input type="number" value={form.complejo_qrs} onChange={e => setForm(f => ({ ...f, complejo_qrs: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Intervalo QT (ms)</label>
                    <input type="number" value={form.intervalo_qt} onChange={e => setForm(f => ({ ...f, intervalo_qt: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Intervalo QTc (ms)</label>
                    <input type="number" value={form.intervalo_qtc} onChange={e => setForm(f => ({ ...f, intervalo_qtc: Number(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Segmento ST</label>
                    <input value={form.segmento_st} onChange={e => setForm(f => ({ ...f, segmento_st: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Onda T</label>
                    <input value={form.onda_t} onChange={e => setForm(f => ({ ...f, onda_t: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Hallazgos y Observaciones</label>
                    <textarea value={form.hallazgos} onChange={e => setForm(f => ({ ...f, hallazgos: e.target.value }))} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm resize-none"></textarea>
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Clasificación</label>
                    <select value={form.clasificacion} onChange={e => setForm(f => ({ ...f, clasificacion: e.target.value as ClasificacionECG }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm mb-3">
                        {Object.entries(CLASIFICACION_ECG_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>

                    <label className="block text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Calidad de Prueba</label>
                    <select value={form.calidad_prueba} onChange={e => setForm(f => ({ ...f, calidad_prueba: e.target.value as any }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm">
                        <option value="Excelente">Excelente</option>
                        <option value="Buena">Buena</option>
                        <option value="Regular">Regular</option>
                        <option value="Mala">Mala</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onCerrar} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm text-slate-600 font-bold transition-colors">Cancelar</button>
                <button onClick={handleSubmit} disabled={loading || !form.empresa_id || !form.paciente_id || form.frecuencia_cardiaca <= 0}
                    className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartPulse className="w-4 h-4" />} Registrar Electrocardiograma
                </button>
            </div>
        </motion.div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Electrocardiograma() {
    const [estudios, setEstudios] = useState<ElectrocardiogramaType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const filtros: FiltrosElectrocardiograma = {};
            if (searchQuery) filtros.search = searchQuery;
            if (filtroClasificacion) filtros.clasificacion = filtroClasificacion as ClasificacionECG;
            const data = await electrocardiogramaService.listar(filtros);
            setEstudios(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filtroClasificacion]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleCrear = async (dto: CrearElectrocardiogramaDTO) => {
        const nueva = await electrocardiogramaService.crear(dto);
        setEstudios(prev => [nueva, ...prev]);
        setShowForm(false);
    };

    const stats = useMemo(() => ({
        total: estudios.length,
        normales: estudios.filter(e => e.clasificacion === 'normal').length,
        anormalidades: estudios.filter(e => e.clasificacion !== 'normal' && e.clasificacion !== 'arritmia' && e.clasificacion !== 'isquemia').length,
        criticas: estudios.filter(e => e.clasificacion === 'isquemia' || e.clasificacion === 'arritmia' || e.clasificacion === 'bloqueo').length,
    }), [estudios]);

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Electrocardiograma"
                subtitle="Registro y análisis de trazados cardíacos integrados al expediente"
                icon={HeartPulse}
                badge="Módulo Activo"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="premium"
                            className="h-12 px-8 shadow-xl shadow-rose-500/30 bg-white text-slate-900 hover:bg-slate-100 font-bold"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Registro ECG
                        </Button>
                    </div>
                }
            />

            <div className="container mx-auto px-6 -mt-10 relative z-40">
                {/* KPIs Premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PremiumMetricCard
                        title="Total Pruebas"
                        value={stats.total}
                        subtitle="Historial clínico"
                        icon={Activity}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Normales"
                        value={stats.normales}
                        subtitle="Trazo sinusal normal"
                        icon={HeartPulse}
                        gradient="emerald"
                        trend={{ value: 85, isPositive: true }}
                    />
                    <PremiumMetricCard
                        title="Anormalidades"
                        value={stats.anormalidades}
                        subtitle="Vigilancia activa"
                        icon={AlertTriangle}
                        gradient="amber"
                    />
                    <PremiumMetricCard
                        title="Críticas"
                        value={stats.criticas}
                        subtitle="Isquemia/Arritmias"
                        icon={Activity}
                        gradient="rose"
                    />
                </div>

                <AnimatePresence>{showForm && <FormElectrocardiograma onCrear={handleCrear} onCerrar={() => setShowForm(false)} />}</AnimatePresence>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap mt-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar por paciente..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm shadow-sm focus:ring-4 focus:ring-rose-500/10 transition-all outline-none" />
                    </div>
                    <select value={filtroClasificacion} onChange={e => setFiltroClasificacion(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm shadow-sm outline-none focus:ring-4 focus:ring-rose-500/10 transition-all">
                        <option value="">Todas las clasificaciones</option>
                        {Object.entries(CLASIFICACION_ECG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>

                {/* List */}
                {loading ? (
                    <div className="py-20 text-center text-white/40"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-500" />Cargando...</div>
                ) : estudios.length === 0 ? (
                    <div className="py-20 text-center">
                        <HeartPulse className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-slate-600 text-lg font-medium mb-2">Sin electrocardiogramas</h3>
                        <p className="text-slate-500 text-sm mb-4">Registra la primera prueba cardíaca.</p>
                        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all">
                            <Plus className="w-4 h-4" /> Registrar ECG
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 mt-6">
                        {estudios.map((e, i) => (
                            <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 hover:border-rose-200 transition-all cursor-pointer group shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-900 font-bold text-base">{e.paciente?.nombre} {e.paciente?.apellido_paterno}</span>
                                                    <ClasificacionBadge clasificacion={e.clasificacion} />
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3" /> {new Date(e.fecha_estudio).toLocaleDateString('es-MX')}</span>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wider text-slate-600">{e.frecuencia_cardiaca} lpm</span>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-[10px] text-slate-600">{e.ritmo}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 text-sm ml-13 mt-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Eje QRS</span>
                                                <span className="text-slate-700 font-semibold">{e.eje_qrs}&deg;</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">PR / QRS (ms)</span>
                                                <span className="text-slate-700 font-semibold">{e.intervalo_pr} / {e.complejo_qrs}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">QT / QTc (ms)</span>
                                                <span className="text-slate-700 font-semibold">{e.intervalo_qt} / {e.intervalo_qtc}</span>
                                            </div>
                                            <div className="hidden sm:flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold">Hallazgos</span>
                                                <span className="text-slate-700 font-medium truncate max-w-xs">{e.hallazgos}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all ml-4 flex-shrink-0">
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2 mt-4">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>
        </div>
    );
}
