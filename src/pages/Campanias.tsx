// =====================================================
// PÁGINA: Campañas Masivas - GPMedical ERP Pro
// =====================================================
// Vista principal de campañas de evaluación médica con Luxury Light.
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

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// =====================================================
// SUBCOMPONENTES
// =====================================================

const EstadoBadge: React.FC<{ estado: EstadoCampania }> = ({ estado }) => {
    const config: Record<EstadoCampania, { bg: string; text: string; icon: React.ReactNode }> = {
        borrador: { bg: 'bg-slate-100', text: 'text-slate-500', icon: <Clock className="w-3 h-3" /> },
        planificada: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Calendar className="w-3 h-3" /> },
        en_proceso: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <Play className="w-3 h-3" /> },
        pausada: { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Pause className="w-3 h-3" /> },
        completada: { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 className="w-3 h-3" /> },
        cancelada: { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle className="w-3 h-3" /> },
    };
    const { bg, text, icon } = config[estado];
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${bg} ${text} border border-current/10`}>
            {icon} {ESTADOS_CAMPANIA_LABELS[estado]}
        </span>
    );
};

const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'bg-emerald-500' }) => (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
            className={`h-full ${color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        />
    </div>
);

// =====================================================
// WIZARD PARA CREAR CAMPAÑA
// =====================================================

function WizardCrearCampania({ onCrear, onCerrar }: { onCrear: (dto: CrearCampaniaDTO) => Promise<Campania>; onCerrar: () => void }) {
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/10 mb-8"
        >
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Calendar size={20} />
                </div>
                Nueva Campaña Médica
            </h3>

            {step === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2 col-span-full">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nombre de la Campaña *</label>
                        <Input
                            value={form.nombre || ''}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                            placeholder="Ej: Evaluación Periódica 2026"
                            className="h-12 bg-slate-50 border-slate-200 rounded-2xl font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Tipo de Evaluación</label>
                        <select
                            value={form.tipo}
                            onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoCampania }))}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        >
                            {Object.entries(TIPOS_CAMPANIA_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Fecha de Inicio</label>
                        <Input
                            type="date"
                            value={form.fecha_inicio}
                            onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                            className="h-12 bg-slate-50 border-slate-200 rounded-2xl font-medium"
                        />
                    </div>
                    <div className="space-y-2 col-span-full">
                        <label className="text-sm font-bold text-slate-700 ml-1">Empresa (ID) *</label>
                        <Input
                            value={form.empresa_id || ''}
                            onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))}
                            placeholder="UUID de la empresa vinculada"
                            className="h-12 bg-slate-50 border-slate-200 rounded-2xl font-medium"
                        />
                    </div>
                </div>
            ) : (
                <div className="mb-8">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 block ml-1">Configurar Servicios Médicos</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {form.servicios?.map((srv, i) => (
                            <label key={srv.codigo} className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl cursor-pointer transition-all group">
                                <input
                                    type="checkbox"
                                    checked={srv.incluido}
                                    onChange={e => {
                                        const updated = [...(form.servicios || [])];
                                        updated[i] = { ...updated[i], incluido: e.target.checked };
                                        setForm(f => ({ ...f, servicios: updated }));
                                    }}
                                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                />
                                <div className="flex-1">
                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{srv.nombre}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{srv.codigo}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <Button variant="ghost" onClick={onCerrar} className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-100">
                    Cancelar
                </Button>
                {step === 0 ? (
                    <Button onClick={() => setStep(1)} disabled={!form.nombre || !form.empresa_id} className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/10">
                        Siguiente: Servicios <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleCrear} disabled={loading} className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus size={20} className="mr-2" />}
                        Finalizar y Crear
                    </Button>
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
        crearCampania, seleccionarCampania, deseleccionar,
        cambiarEstado, importarPadron,
    } = useCampanias();

    const [showWizard, setShowWizard] = useState(false);
    const [showImporter, setShowImporter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        if (!searchQuery) return campanias;
        const q = searchQuery.toLowerCase();
        return campanias.filter(c => c.nombre.toLowerCase().includes(q) || c.empresa?.nombre?.toLowerCase().includes(q));
    }, [campanias, searchQuery]);

    if (campaniaActiva) {
        return (
            <div className="space-y-8 pb-12">
                <PremiumPageHeader
                    title={campaniaActiva.nombre}
                    subtitle={`Gestión operativa: ${campaniaActiva.empresa?.nombre}`}
                    icon={Calendar}
                    badge={TIPOS_CAMPANIA_LABELS[campaniaActiva.tipo]}
                    actions={
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={deseleccionar} className="h-12 bg-white/50 border-white/60 font-bold backdrop-blur-md">
                                Volver
                            </Button>
                            {campaniaActiva.estado === 'borrador' && (
                                <Button onClick={() => cambiarEstado(campaniaActiva.id, 'planificada')} className="h-12 bg-blue-600 font-bold">Planificar</Button>
                            )}
                            {campaniaActiva.estado === 'planificada' && (
                                <Button onClick={() => cambiarEstado(campaniaActiva.id, 'en_proceso')} className="h-12 bg-emerald-600 font-bold">Iniciar</Button>
                            )}
                            <Button variant="premium" onClick={() => setShowImporter(true)} className="h-12 bg-white text-slate-900 font-black">
                                <Upload size={18} className="mr-2" /> Importar
                            </Button>
                        </div>
                    }
                />

                <div className="container mx-auto px-6 -mt-10 relative z-40">
                    {metricas && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <PremiumMetricCard title="Padrón Total" value={metricas.total} icon={Users} gradient="blue" />
                            <PremiumMetricCard title="Aptos" value={metricas.aptos} icon={CheckCircle2} gradient="emerald" />
                            <PremiumMetricCard title="Restricciones" value={metricas.aptos_restricciones} icon={AlertTriangle} gradient="amber" />
                            <PremiumMetricCard title="No Aptos" value={metricas.no_aptos_definitivos} icon={XCircle} gradient="red" />
                            <button className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 text-left shadow-sm hover:shadow-lg transition-all">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avance Global</div>
                                <div className="text-3xl font-black text-slate-900 mb-2">{metricas.porcentaje_avance}%</div>
                                <ProgressBar value={metricas.porcentaje_avance} />
                            </button>
                        </div>
                    )}

                    <AnimatePresence>
                        {showImporter && (
                            <div className="mb-8">
                                <ExcelImporter
                                    titulo="Importar Padrón de Trabajadores"
                                    camposDestino={COLUMNAS_PADRON_REQUERIDAS}
                                    onImport={async (data) => {
                                        await importarPadron({ campania_id: campaniaActiva.id, trabajadores: data });
                                        setShowImporter(false);
                                    }}
                                    onCancel={() => setShowImporter(false)}
                                />
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Tabla Padrón */}
                    <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <Users className="text-blue-500" /> Detalle del Padrón
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Empleado</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trabajador</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Puesto / Área</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingPadron ? (
                                        <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto opacity-20" /></td></tr>
                                    ) : padron.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Sin registros importados</td></tr>
                                    ) : padron.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-mono text-sm font-bold text-slate-400">{t.numero_empleado || '-'}</td>
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-900">{t.nombre} {t.apellido_paterno}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">{t.curp}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-medium text-slate-700">{t.puesto || '-'}</div>
                                                <div className="text-xs text-slate-400">{t.area || '-'}</div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">{t.estado.replace('_', ' ')}</Badge>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                {t.dictamen_resultado ? (
                                                    <Badge className={t.dictamen_resultado === 'apto' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}>
                                                        {t.dictamen_resultado.toUpperCase()}
                                                    </Badge>
                                                ) : <span className="text-[10px] font-black text-slate-300 uppercase">Pendiente</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Gestión de Campañas"
                subtitle="Evaluaciones masivas, medicina del trabajo y seguimiento institucional"
                icon={BarChart3}
                badge="OPERACIONES"
                actions={
                    <Button variant="premium" onClick={() => setShowWizard(true)} className="h-12 bg-white text-slate-900 font-black shadow-xl shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" /> Nueva Campaña
                    </Button>
                }
            />

            <div className="container mx-auto px-6 -mt-10 relative z-40">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <PremiumMetricCard title="Total Campañas" value={campanias.length} icon={BarChart3} gradient="blue" />
                    <PremiumMetricCard title="En Proceso" value={campanias.filter(c => c.estado === 'en_proceso').length} icon={Play} gradient="emerald" />
                    <PremiumMetricCard title="Finalizadas" value={campanias.filter(c => c.estado === 'completada').length} icon={CheckCircle2} gradient="purple" />
                    <PremiumMetricCard title="Pacientes / Mes" value="1,240" icon={Users} gradient="amber" />
                </div>

                <AnimatePresence>
                    {showWizard && <WizardCrearCampania onCrear={crearCampania} onCerrar={() => setShowWizard(false)} />}
                </AnimatePresence>

                <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-[2rem] shadow-sm mb-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar campaña por nombre o empresa..."
                            className="pl-12 h-14 bg-white/50 border-white/60 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-32 text-center text-slate-400">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto opacity-20" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center bg-white/20 rounded-[3rem] border border-white/40">
                            <h3 className="text-xl font-black text-slate-300">No se encontraron campañas</h3>
                        </div>
                    ) : filtered.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => seleccionarCampania(c.id)}
                            className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 hover:bg-white hover:shadow-xl transition-all cursor-pointer group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all border border-slate-100">
                                    <BarChart3 size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-slate-900 font-bold text-xl">{c.nombre}</h3>
                                        <EstadoBadge estado={c.estado} />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
                                        <span className="flex items-center gap-1.5"><Building2 size={16} className="opacity-50" /> {c.empresa?.nombre}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={16} className="opacity-50" /> {new Date(c.fecha_inicio).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><Users size={16} className="opacity-50" /> {c.total_trabajadores} Personal</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-900">{c.total_trabajadores > 0 ? Math.round((c.total_evaluados / c.total_trabajadores) * 100) : 0}%</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">AVANCE OPERATIVO</div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
