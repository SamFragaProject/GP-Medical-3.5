// =====================================================
// PÁGINA: Campañas Masivas - GPMedical ERP Pro
// =====================================================
// Vista principal de campañas de evaluación médica.
// Incluye lista, creación, seguimiento y métricas.
// =====================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Building2, Calendar, Users,
    ChevronRight, BarChart3, Upload, Play, Pause, CheckCircle2,
    XCircle, Clock, TrendingUp, FileSpreadsheet, Eye, AlertTriangle,
    ArrowRight, Loader2, RefreshCw
} from 'lucide-react';
import { useCampanias } from '@/hooks/useCampanias';
import ExcelImporter from '@/components/shared/ExcelImporter';
import {
    TIPOS_CAMPANIA_LABELS,
    ESTADOS_CAMPANIA_LABELS,
    COLUMNAS_PADRON_REQUERIDAS,
    SERVICIOS_DISPONIBLES,
    type Campania,
    type TipoCampania,
    type EstadoCampania,
    type CrearCampaniaDTO,
} from '@/types/campania';

// =====================================================
// SUBCOMPONENTES
// =====================================================

// Badges de estado con colores
const EstadoBadge: React.FC<{ estado: EstadoCampania }> = ({ estado }) => {
    const config: Record<EstadoCampania, { bg: string; text: string; icon: React.ReactNode }> = {
        borrador: { bg: 'bg-gray-500/20', text: 'text-gray-300', icon: <Clock className="w-3 h-3" /> },
        planificada: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: <Calendar className="w-3 h-3" /> },
        en_proceso: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', icon: <Play className="w-3 h-3" /> },
        pausada: { bg: 'bg-amber-500/20', text: 'text-amber-300', icon: <Pause className="w-3 h-3" /> },
        completada: { bg: 'bg-green-500/20', text: 'text-green-300', icon: <CheckCircle2 className="w-3 h-3" /> },
        cancelada: { bg: 'bg-red-500/20', text: 'text-red-300', icon: <XCircle className="w-3 h-3" /> },
    };
    const { bg, text, icon } = config[estado];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {icon} {ESTADOS_CAMPANIA_LABELS[estado]}
        </span>
    );
};

// Barra de progreso
const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'bg-emerald-500' }) => (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
            className={`h-full ${color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        />
    </div>
);

// KPI Card
const KPICard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all">
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
            <span className="text-sm text-white/50">{label}</span>
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
    </div>
);

// =====================================================
// WIZARD PARA CREAR CAMPAÑA (simplificado inline)
// =====================================================

interface WizardCrearCampaniaProps {
    onCrear: (dto: CrearCampaniaDTO) => Promise<Campania>;
    onCerrar: () => void;
}

function WizardCrearCampania({ onCrear, onCerrar }: WizardCrearCampaniaProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Partial<CrearCampaniaDTO>>({
        tipo: 'periodico',
        fecha_inicio: new Date().toISOString().split('T')[0],
        servicios: SERVICIOS_DISPONIBLES.map(s => ({ ...s, incluido: s.codigo === 'consulta_medica' })),
    });

    const handleCrear = async () => {
        if (!form.nombre || !form.empresa_id) return;
        setLoading(true);
        try {
            await onCrear(form as CrearCampaniaDTO);
            onCerrar();
        } catch (err) {
            console.error('Error creando campaña:', err);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        // Step 0: Info básica
        <div key="info" className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">📋 Datos de la Campaña</h3>
            <div>
                <label className="block text-sm text-white/60 mb-1">Nombre de la campaña *</label>
                <input
                    type="text"
                    value={form.nombre || ''}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Examen periódico 2026 - Empresa X"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-white/60 mb-1">Tipo *</label>
                    <select
                        value={form.tipo || 'periodico'}
                        onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoCampania }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 transition-all"
                    >
                        {Object.entries(TIPOS_CAMPANIA_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Fecha inicio *</label>
                    <input
                        type="date"
                        value={form.fecha_inicio || ''}
                        onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 transition-all"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm text-white/60 mb-1">ID Empresa *</label>
                <input
                    type="text"
                    value={form.empresa_id || ''}
                    onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))}
                    placeholder="UUID de la empresa"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/50 transition-all"
                />
            </div>
            <div>
                <label className="block text-sm text-white/60 mb-1">Descripción</label>
                <textarea
                    value={form.descripcion || ''}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/50 transition-all resize-none"
                />
            </div>
        </div>,

        // Step 1: Servicios
        <div key="servicios" className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4">🩺 Servicios Incluidos</h3>
            {form.servicios?.map((srv, i) => (
                <label key={srv.codigo} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-all">
                    <input
                        type="checkbox"
                        checked={srv.incluido}
                        onChange={e => {
                            const updated = [...(form.servicios || [])];
                            updated[i] = { ...updated[i], incluido: e.target.checked };
                            setForm(f => ({ ...f, servicios: updated }));
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30"
                    />
                    <span className="text-white/80">{srv.nombre}</span>
                </label>
            ))}
        </div>,
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {steps[step]}
                </motion.div>
            </AnimatePresence>
            <div className="flex gap-3 mt-6">
                <button onClick={onCerrar} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all">
                    Cancelar
                </button>
                {step > 0 && (
                    <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all">
                        ← Anterior
                    </button>
                )}
                {step < steps.length - 1 ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        disabled={step === 0 && (!form.nombre || !form.empresa_id)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        Siguiente <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleCrear}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Crear Campaña
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Campanias() {
    const {
        campanias, campaniaActiva, padron, metricas,
        loading, loadingPadron, error,
        filtros, setFiltros,
        crearCampania, seleccionarCampania, deseleccionar,
        eliminarCampania, cambiarEstado, importarPadron,
    } = useCampanias();

    const [showWizard, setShowWizard] = useState(false);
    const [showImporter, setShowImporter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<EstadoCampania | ''>('');
    const [filtroTipo, setFiltroTipo] = useState<TipoCampania | ''>('');

    // Filtered campaigns
    const campaniasFiltradas = useMemo(() => {
        let result = [...campanias];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.nombre.toLowerCase().includes(q) ||
                c.empresa?.nombre?.toLowerCase().includes(q)
            );
        }
        if (filtroEstado) result = result.filter(c => c.estado === filtroEstado);
        if (filtroTipo) result = result.filter(c => c.tipo === filtroTipo);
        return result;
    }, [campanias, searchQuery, filtroEstado, filtroTipo]);

    // KPI stats
    const stats = useMemo(() => ({
        total: campanias.length,
        activas: campanias.filter(c => c.estado === 'en_proceso').length,
        completadas: campanias.filter(c => c.estado === 'completada').length,
        trabajadores: campanias.reduce((sum, c) => sum + (c.total_trabajadores || 0), 0),
    }), [campanias]);

    // =====================================================
    // VISTA DE DETALLE DE CAMPAÑA
    // =====================================================
    if (campaniaActiva) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={deseleccionar}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{campaniaActiva.nombre}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <EstadoBadge estado={campaniaActiva.estado} />
                                <span className="text-white/50 text-sm">{campaniaActiva.empresa?.nombre}</span>
                                <span className="text-white/30 text-sm">·</span>
                                <span className="text-white/50 text-sm">{TIPOS_CAMPANIA_LABELS[campaniaActiva.tipo]}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {campaniaActiva.estado === 'borrador' && (
                            <button
                                onClick={() => cambiarEstado(campaniaActiva.id, 'planificada')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                            >
                                <Calendar className="w-4 h-4" /> Planificar
                            </button>
                        )}
                        {campaniaActiva.estado === 'planificada' && (
                            <button
                                onClick={() => cambiarEstado(campaniaActiva.id, 'en_proceso')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                            >
                                <Play className="w-4 h-4" /> Iniciar
                            </button>
                        )}
                        <button
                            onClick={() => setShowImporter(true)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" /> Importar Padrón
                        </button>
                    </div>
                </div>

                {/* Métricas */}
                {metricas && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <KPICard label="Total" value={metricas.total} icon={<Users className="w-4 h-4 text-blue-400" />} color="bg-blue-500/20" />
                            <KPICard label="Evaluados" value={metricas.evaluados + metricas.dictaminados + metricas.cerrados} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} color="bg-emerald-500/20" />
                            <KPICard label="Aptos" value={metricas.aptos} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} color="bg-green-500/20" />
                            <KPICard label="Restricciones" value={metricas.aptos_restricciones} icon={<AlertTriangle className="w-4 h-4 text-amber-400" />} color="bg-amber-500/20" />
                            <KPICard label="No Aptos" value={metricas.no_aptos_temporales + metricas.no_aptos_definitivos} icon={<XCircle className="w-4 h-4 text-red-400" />} color="bg-red-500/20" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-white/50">Avance general</span>
                                <span className="text-white font-medium">{metricas.porcentaje_avance}%</span>
                            </div>
                            <ProgressBar value={metricas.porcentaje_avance} />
                        </div>
                    </div>
                )}

                {/* Importador */}
                <AnimatePresence>
                    {showImporter && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <ExcelImporter
                                titulo="Importar Padrón de Trabajadores"
                                descripcion="Sube el archivo Excel con los datos de los trabajadores a evaluar."
                                camposDestino={COLUMNAS_PADRON_REQUERIDAS}
                                onImport={async (data) => {
                                    const result = await importarPadron({
                                        campania_id: campaniaActiva.id,
                                        trabajadores: data.map(d => ({
                                            nombre: String(d.nombre || ''),
                                            apellido_paterno: String(d.apellido_paterno || ''),
                                            apellido_materno: d.apellido_materno ? String(d.apellido_materno) : undefined,
                                            numero_empleado: d.numero_empleado ? String(d.numero_empleado) : undefined,
                                            curp: d.curp ? String(d.curp) : undefined,
                                            nss: d.nss ? String(d.nss) : undefined,
                                            fecha_nacimiento: d.fecha_nacimiento ? String(d.fecha_nacimiento) : undefined,
                                            genero: d.genero ? String(d.genero) : undefined,
                                            puesto: d.puesto ? String(d.puesto) : undefined,
                                            area: d.area ? String(d.area) : undefined,
                                            antiguedad_anios: d.antiguedad_anios ? Number(d.antiguedad_anios) : undefined,
                                            riesgo: d.riesgo ? String(d.riesgo) : undefined,
                                        })),
                                    });
                                    return result;
                                }}
                                onCancel={() => setShowImporter(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabla de padrón */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            Padrón ({padron.length})
                        </h3>
                    </div>
                    {loadingPadron ? (
                        <div className="p-12 text-center text-white/40">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            Cargando padrón...
                        </div>
                    ) : padron.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileSpreadsheet className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/50">Sin trabajadores en el padrón</p>
                            <button
                                onClick={() => setShowImporter(true)}
                                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> Importar desde Excel
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase">No. Emp</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase">Nombre</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase">Puesto</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase">Área</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase">Estado</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase">Dictamen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {padron.map((t, i) => (
                                        <motion.tr
                                            key={t.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="border-t border-white/5 hover:bg-white/5 transition-all"
                                        >
                                            <td className="px-4 py-3 text-sm text-white/60 font-mono">{t.numero_empleado || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-white font-medium">
                                                {t.nombre} {t.apellido_paterno} {t.apellido_materno || ''}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-white/60">{t.puesto || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-white/60">{t.area || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${t.estado === 'cerrado' || t.estado === 'dictaminado' ? 'bg-green-500/20 text-green-300' :
                                                        t.estado === 'en_proceso' || t.estado === 'evaluado' ? 'bg-blue-500/20 text-blue-300' :
                                                            t.estado === 'no_presentado' ? 'bg-red-500/20 text-red-300' :
                                                                'bg-gray-500/20 text-gray-300'}`}>
                                                    {t.estado.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {t.dictamen_resultado ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${t.dictamen_resultado === 'apto' ? 'bg-green-500/20 text-green-300' :
                                                            t.dictamen_resultado === 'apto_restricciones' ? 'bg-amber-500/20 text-amber-300' :
                                                                'bg-red-500/20 text-red-300'}`}>
                                                        {t.dictamen_resultado.replace(/_/g, ' ')}
                                                    </span>
                                                ) : (
                                                    <span className="text-white/30 text-xs">Pendiente</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =====================================================
    // VISTA LISTA DE CAMPAÑAS
    // =====================================================
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 bg-[#020617] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Campañas Masivas</h1>
                    <p className="text-white/50 mt-1">Evaluaciones médicas por empresa</p>
                </div>
                <button
                    onClick={() => setShowWizard(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nueva Campaña
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KPICard label="Total Campañas" value={stats.total} icon={<BarChart3 className="w-4 h-4 text-blue-400" />} color="bg-blue-500/20" />
                <KPICard label="En Proceso" value={stats.activas} icon={<Play className="w-4 h-4 text-emerald-400" />} color="bg-emerald-500/20" />
                <KPICard label="Completadas" value={stats.completadas} icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} color="bg-green-500/20" />
                <KPICard label="Trabajadores" value={stats.trabajadores} icon={<Users className="w-4 h-4 text-purple-400" />} color="bg-purple-500/20" />
            </div>

            {/* Wizard */}
            <AnimatePresence>
                {showWizard && (
                    <WizardCrearCampania
                        onCrear={crearCampania}
                        onCerrar={() => setShowWizard(false)}
                    />
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar campaña o empresa..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                </div>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value as EstadoCampania | '')}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-all"
                >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS_CAMPANIA_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value as TipoCampania | '')}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-all"
                >
                    <option value="">Todos los tipos</option>
                    {Object.entries(TIPOS_CAMPANIA_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            {/* Campaign list */}
            {loading ? (
                <div className="py-20 text-center text-white/40">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Cargando campañas...
                </div>
            ) : campaniasFiltradas.length === 0 ? (
                <div className="py-20 text-center">
                    <BarChart3 className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium mb-2">
                        {campanias.length === 0 ? 'Sin campañas aún' : 'Sin resultados'}
                    </h3>
                    <p className="text-white/30 text-sm mb-4">
                        {campanias.length === 0
                            ? 'Crea tu primera campaña para empezar a evaluar trabajadores.'
                            : 'Intenta cambiar los filtros de búsqueda.'}
                    </p>
                    {campanias.length === 0 && (
                        <button
                            onClick={() => setShowWizard(true)}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Crear campaña
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {campaniasFiltradas.map((c, i) => {
                        const avance = c.total_trabajadores > 0
                            ? Math.round((c.total_evaluados / c.total_trabajadores) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => seleccionarCampania(c.id)}
                                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-white font-semibold text-lg">{c.nombre}</h3>
                                            <EstadoBadge estado={c.estado} />
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-white/50">
                                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {c.empresa?.nombre || 'Sin empresa'}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.fecha_inicio).toLocaleDateString('es-MX')}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.total_trabajadores} trabajadores</span>
                                            <span className="px-2 py-0.5 bg-white/5 rounded-full text-xs">{TIPOS_CAMPANIA_LABELS[c.tipo]}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">{avance}%</div>
                                            <div className="text-xs text-white/40">avance</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full">{c.total_aptos} aptos</span>
                                            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full">{c.total_restricciones} restr.</span>
                                            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full">{c.total_no_aptos} no aptos</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-all" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <ProgressBar value={avance} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}
        </div>
    );
}
