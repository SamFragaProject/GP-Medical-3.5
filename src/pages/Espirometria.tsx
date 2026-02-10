// =====================================================
// PÁGINA: Espirometría - GPMedical ERP Pro
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Loader2, AlertTriangle, Activity, ChevronRight,
    Calendar, BarChart3, User, Wind
} from 'lucide-react';
import { espirometriaService } from '@/services/espirometriaService';
import {
    CLASIFICACION_LABELS,
    CLASIFICACION_COLORS,
    calcularPredichos,
    type Espirometria as EspirometriaType,
    type CrearEspirometriaDTO,
    type FiltrosEspirometria,
    type ClasificacionEspirometria,
    type Sexo,
} from '@/types/espirometria';

// =====================================================
// HELPERS
// =====================================================

const ClasificacionBadge: React.FC<{ clasificacion: ClasificacionEspirometria }> = ({ clasificacion }) => {
    const { bg, text } = CLASIFICACION_COLORS[clasificacion];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {CLASIFICACION_LABELS[clasificacion]}
        </span>
    );
};

// =====================================================
// FORMULARIO NUEVA ESPIROMETRÍA
// =====================================================

function FormEspirometria({ onCrear, onCerrar }: {
    onCrear: (dto: CrearEspirometriaDTO) => Promise<void>;
    onCerrar: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        empresa_id: '',
        paciente_id: '',
        edad: 35,
        sexo: 'masculino' as Sexo,
        talla_cm: 170,
        peso_kg: 75,
        fvc: 0,
        fev1: 0,
        pef: 0,
        fef_2575: 0,
        numero_intentos: 3,
        calidad_prueba: 'B' as 'A' | 'B' | 'C' | 'D' | 'F',
        broncodilatador: false,
        observaciones: '',
    });

    // Live calculation of predicted values
    const predichos = useMemo(() =>
        calcularPredichos({ edad: form.edad, talla_cm: form.talla_cm, sexo: form.sexo }),
        [form.edad, form.talla_cm, form.sexo]
    );

    const fev1_fvc = form.fvc > 0 ? Math.round((form.fev1 / form.fvc) * 100) : 0;
    const fvc_pct = predichos.fvc_predicho > 0 ? Math.round((form.fvc / predichos.fvc_predicho) * 100) : 0;
    const fev1_pct = predichos.fev1_predicho > 0 ? Math.round((form.fev1 / predichos.fev1_predicho) * 100) : 0;

    const handleSubmit = async () => {
        if (!form.empresa_id || !form.paciente_id || form.fvc <= 0) return;
        setLoading(true);
        try { await onCrear(form); } finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
            <h3 className="text-lg font-semibold text-white mb-4">🫁 Nueva Espirometría</h3>

            {/* Datos paciente */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-white/60 mb-1">Empresa *</label>
                    <input value={form.empresa_id} onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))} placeholder="UUID" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Paciente *</label>
                    <input value={form.paciente_id} onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))} placeholder="UUID" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Sexo</label>
                    <select value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value as Sexo }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm">
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-white/60 mb-1">Edad</label>
                    <input type="number" value={form.edad} onChange={e => setForm(f => ({ ...f, edad: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Talla (cm)</label>
                    <input type="number" value={form.talla_cm} onChange={e => setForm(f => ({ ...f, talla_cm: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Peso (kg)</label>
                    <input type="number" value={form.peso_kg} onChange={e => setForm(f => ({ ...f, peso_kg: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Intentos</label>
                    <input type="number" value={form.numero_intentos} onChange={e => setForm(f => ({ ...f, numero_intentos: Number(e.target.value) }))} min={1} max={8} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" />
                </div>
            </div>

            {/* Valores medidos + predichos */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-blue-400">Valores Medidos</h4>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-white/50 mb-1">FVC (L)</label>
                            <input type="number" step="0.01" value={form.fvc} onChange={e => setForm(f => ({ ...f, fvc: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-white/50 mb-1">FEV1 (L)</label>
                            <input type="number" step="0.01" value={form.fev1} onChange={e => setForm(f => ({ ...f, fev1: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-white/50 mb-1">PEF (L/s)</label>
                            <input type="number" step="0.01" value={form.pef} onChange={e => setForm(f => ({ ...f, pef: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-white/50 mb-1">FEF 25-75%</label>
                            <input type="number" step="0.01" value={form.fef_2575 || ''} onChange={e => setForm(f => ({ ...f, fef_2575: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                        </div>
                    </div>
                </div>
                <div className="space-y-3 bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-green-400">Valores Predichos (NHANES III)</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-white/50">FVC predicho:</div>
                        <div className="text-white font-medium">{predichos.fvc_predicho.toFixed(2)} L</div>
                        <div className="text-white/50">FEV1 predicho:</div>
                        <div className="text-white font-medium">{predichos.fev1_predicho.toFixed(2)} L</div>
                        <div className="text-white/50">FEV1/FVC:</div>
                        <div className="text-white font-medium">{fev1_fvc}%</div>
                        <div className="text-white/50">%FVC predicho:</div>
                        <div className={`font-bold ${fvc_pct >= 80 ? 'text-emerald-400' : fvc_pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{fvc_pct}%</div>
                        <div className="text-white/50">%FEV1 predicho:</div>
                        <div className={`font-bold ${fev1_pct >= 80 ? 'text-emerald-400' : fev1_pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{fev1_pct}%</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onCerrar} className="px-4 py-2 bg-white/5 rounded-xl text-sm text-white/70 hover:bg-white/10">Cancelar</button>
                <button onClick={handleSubmit} disabled={loading || !form.empresa_id || !form.paciente_id || form.fvc <= 0}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wind className="w-4 h-4" />} Registrar Espirometría
                </button>
            </div>
        </motion.div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Espirometria() {
    const [estudios, setEstudios] = useState<EspirometriaType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroClasificacion, setFiltroClasificacion] = useState('');

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const filtros: FiltrosEspirometria = {};
            if (searchQuery) filtros.search = searchQuery;
            if (filtroClasificacion) filtros.clasificacion = filtroClasificacion as ClasificacionEspirometria;
            const data = await espirometriaService.listar(filtros);
            setEstudios(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filtroClasificacion]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleCrear = async (dto: CrearEspirometriaDTO) => {
        const nueva = await espirometriaService.crear(dto);
        setEstudios(prev => [nueva, ...prev]);
        setShowForm(false);
    };

    const stats = useMemo(() => ({
        total: estudios.length,
        normales: estudios.filter(e => e.clasificacion === 'normal').length,
        alterados: estudios.filter(e => e.clasificacion !== 'normal').length,
        obstruccion: estudios.filter(e => e.clasificacion?.includes('obstruccion')).length,
    }), [estudios]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Espirometría</h1>
                    <p className="text-white/50 mt-1">Pruebas de función pulmonar · NHANES III</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nueva Espirometría
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-blue-400" /><span className="text-sm text-white/50">Total</span></div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><Wind className="w-4 h-4 text-emerald-400" /><span className="text-sm text-white/50">Normales</span></div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.normales}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-sm text-white/50">Alterados</span></div>
                    <div className="text-2xl font-bold text-amber-400">{stats.alterados}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-red-400" /><span className="text-sm text-white/50">Obstrucción</span></div>
                    <div className="text-2xl font-bold text-red-400">{stats.obstruccion}</div>
                </div>
            </div>

            <AnimatePresence>{showForm && <FormEspirometria onCrear={handleCrear} onCerrar={() => setShowForm(false)} />}</AnimatePresence>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar paciente..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30" />
                </div>
                <select value={filtroClasificacion} onChange={e => setFiltroClasificacion(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm">
                    <option value="">Todas</option>
                    {Object.entries(CLASIFICACION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 text-center text-white/40"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Cargando...</div>
            ) : estudios.length === 0 ? (
                <div className="py-20 text-center">
                    <Wind className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium mb-2">Sin espirometrías</h3>
                    <p className="text-white/30 text-sm mb-4">Registra la primera prueba pulmonar.</p>
                    <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2">
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
                                        <ClasificacionBadge clasificacion={e.clasificacion} />
                                        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-xs">{e.calidad_prueba}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-white/50">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(e.fecha_estudio).toLocaleDateString('es-MX')}</span>
                                        <span>FVC: <b className="text-white">{e.fvc}L</b> ({e.fvc_porcentaje}%)</span>
                                        <span>FEV1: <b className="text-white">{e.fev1}L</b> ({e.fev1_porcentaje}%)</span>
                                        <span>FEV1/FVC: <b className="text-white">{e.fev1_fvc}%</b></span>
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
