// =====================================================
// PÁGINA: Cotizaciones - GPMedical ERP Pro
// =====================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FileText, DollarSign, Send, CheckCircle2,
    Clock, Loader2, ChevronRight,
    Building2, Calendar, Receipt, Trash2, Eye, AlertTriangle
} from 'lucide-react';
import { cotizacionService } from '@/services/cotizacionService';
import {
    ESTADOS_COTIZACION_LABELS,
    ESTADOS_COTIZACION_COLORS,
    CATALOGO_SERVICIOS,
    type Cotizacion,
    type EstadoCotizacion,
    type CrearCotizacionDTO,
    type ConceptoCotizacion,
    type FiltrosCotizacion,
} from '@/types/cotizacion';

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// =====================================================
// BADGES & HELPERS
// =====================================================

const EstadoBadge: React.FC<{ estado: EstadoCotizacion }> = ({ estado }) => {
    const { bg, text } = ESTADOS_COTIZACION_COLORS[estado];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            {ESTADOS_COTIZACION_LABELS[estado]}
        </span>
    );
};

const formatMoney = (amount: number, currency = 'MXN') =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

// =====================================================
// WIZARD CREAR COTIZACIÓN
// =====================================================

function WizardCotizacion({ onCrear, onCerrar }: { onCrear: (dto: CrearCotizacionDTO) => Promise<void>; onCerrar: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Partial<CrearCotizacionDTO>>({
        fecha_vigencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        conceptos: [],
    });

    const [conceptos, setConceptos] = useState<Omit<ConceptoCotizacion, 'id' | 'importe'>[]>([]);

    const agregarServicio = (codigo: string) => {
        const srv = CATALOGO_SERVICIOS.find(s => s.codigo === codigo);
        if (!srv) return;
        setConceptos(prev => [...prev, {
            descripcion: srv.nombre,
            codigo_servicio: srv.codigo,
            cantidad: 1,
            precio_unitario: srv.precio_sugerido,
            descuento_porcentaje: 0,
        }]);
    };

    const eliminarConcepto = (idx: number) => {
        setConceptos(prev => prev.filter((_, i) => i !== idx));
    };

    const updateConcepto = (idx: number, field: string, value: number) => {
        setConceptos(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
    };

    const subtotal = conceptos.reduce((sum, c) =>
        sum + c.cantidad * c.precio_unitario * (1 - (c.descuento_porcentaje || 0) / 100), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const handleCrear = async () => {
        if (!form.empresa_id || !form.cliente_nombre || conceptos.length === 0) return;
        setLoading(true);
        try {
            await onCrear({ ...form as CrearCotizacionDTO, conceptos });
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
                    <FileText size={20} />
                </div>
                Nueva Cotización
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">ID Empresa *</label>
                    <Input
                        value={form.empresa_id || ''}
                        onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))}
                        placeholder="UUID de la empresa"
                        className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Cliente *</label>
                    <Input
                        value={form.cliente_nombre || ''}
                        onChange={e => setForm(f => ({ ...f, cliente_nombre: e.target.value }))}
                        placeholder="Nombre del cliente"
                        className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">RFC</label>
                    <Input
                        value={form.cliente_rfc || ''}
                        onChange={e => setForm(f => ({ ...f, cliente_rfc: e.target.value.toUpperCase() }))}
                        placeholder="RFC del cliente"
                        className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 font-medium uppercase"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Vigencia hasta</label>
                    <Input
                        type="date"
                        value={form.fecha_vigencia || ''}
                        onChange={e => setForm(f => ({ ...f, fecha_vigencia: e.target.value }))}
                        className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 font-medium"
                    />
                </div>
            </div>

            {/* Catálogo de servicios */}
            <div className="mb-8">
                <label className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 block ml-1">Seleccionar Servicios</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {CATALOGO_SERVICIOS.map(srv => (
                        <button
                            key={srv.codigo}
                            onClick={() => agregarServicio(srv.codigo)}
                            className="text-left p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 rounded-2xl transition-all group"
                        >
                            <div className="font-bold text-slate-900 truncate mb-1 text-sm group-hover:text-blue-600">{srv.nombre}</div>
                            <div className="text-slate-500 font-bold text-xs">{formatMoney(srv.precio_sugerido)}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conceptos agregados */}
            {conceptos.length > 0 && (
                <div className="mb-8 space-y-3">
                    <div className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">Resumen de Conceptos</div>
                    <div className="space-y-2">
                        {conceptos.map((c, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] hover:bg-blue-50 transition-colors">
                                <div className="flex-1 text-sm font-black text-slate-900 truncate">{c.descripcion}</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">CANT:</span>
                                    <input
                                        type="number"
                                        value={c.cantidad}
                                        onChange={e => updateConcepto(i, 'cantidad', Number(e.target.value))}
                                        min={1}
                                        className="w-16 h-10 bg-white border border-blue-200 rounded-xl text-center font-bold text-blue-600 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">PRECIO:</span>
                                    <input
                                        type="number"
                                        value={c.precio_unitario}
                                        onChange={e => updateConcepto(i, 'precio_unitario', Number(e.target.value))}
                                        className="w-32 h-10 bg-white border border-blue-200 rounded-xl text-right px-3 font-bold text-slate-900"
                                    />
                                </div>
                                <div className="w-32 text-right text-base font-black text-blue-700">
                                    {formatMoney(c.cantidad * c.precio_unitario * (1 - (c.descuento_porcentaje || 0) / 100))}
                                </div>
                                <button onClick={() => eliminarConcepto(i)} className="p-2 hover:bg-red-500 hover:text-white rounded-xl text-slate-400 transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <div className="w-80 space-y-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-inner">
                            <div className="flex justify-between text-slate-500 font-bold"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                            <div className="flex justify-between text-slate-500 font-bold"><span>IVA (16%)</span><span>{formatMoney(iva)}</span></div>
                            <div className="flex justify-between text-slate-900 font-black text-xl border-t border-slate-200 pt-2 mt-2">
                                <span>Total</span><span className="text-blue-600">{formatMoney(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mt-8">
                <Button variant="ghost" onClick={onCerrar} className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-100">
                    Cancelar
                </Button>
                <Button
                    onClick={handleCrear}
                    disabled={loading || !form.empresa_id || !form.cliente_nombre || conceptos.length === 0}
                    className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-40"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    Confirmar y Crear Cotización
                </Button>
            </div>
        </motion.div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Cotizaciones() {
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<EstadoCotizacion | ''>('');

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const filtros: FiltrosCotizacion = {};
            if (filtroEstado) filtros.estado = filtroEstado;
            if (searchQuery) filtros.search = searchQuery;
            const data = await cotizacionService.listar(filtros);
            setCotizaciones(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando cotizaciones');
        } finally {
            setLoading(false);
        }
    }, [filtroEstado, searchQuery]);

    useEffect(() => { cargar(); }, [cargar]);

    const stats = useMemo(() => ({
        total: cotizaciones.length,
        borradores: cotizaciones.filter(c => c.estado === 'borrador').length,
        enviadas: cotizaciones.filter(c => c.estado === 'enviada').length,
        aceptadas: cotizaciones.filter(c => c.estado === 'aceptada' || c.estado === 'convertida').length,
        monto: cotizaciones.filter(c => c.estado !== 'rechazada' && c.estado !== 'vencida').reduce((s, c) => s + c.total, 0),
    }), [cotizaciones]);

    const handleCrear = async (dto: CrearCotizacionDTO) => {
        const nueva = await cotizacionService.crear(dto);
        setCotizaciones(prev => [nueva, ...prev]);
        setShowWizard(false);
    };

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Panel de Cotizaciones"
                subtitle="Gestión avanzada de propuestas comerciales para empresas y convenios"
                icon={FileText}
                badge="GESTIÓN COMERCIAL"
                actions={
                    <Button
                        variant="premium"
                        onClick={() => setShowWizard(true)}
                        className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-black shadow-xl shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Cotización
                    </Button>
                }
            />

            <div className="container mx-auto px-6 -mt-10 relative z-40">
                {/* KPIs Premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PremiumMetricCard
                        title="Total Cotizaciones"
                        value={stats.total}
                        subtitle="Historial de propuestas"
                        icon={FileText}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Enviadas"
                        value={stats.enviadas}
                        subtitle="Pendientes de firma"
                        icon={Send}
                        gradient="purple"
                    />
                    <PremiumMetricCard
                        title="Cerradas / Aceptadas"
                        value={stats.aceptadas}
                        subtitle="Conversión exitosa"
                        icon={CheckCircle2}
                        gradient="emerald"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <PremiumMetricCard
                        title="Volumen Facturable"
                        value={formatMoney(stats.monto)}
                        subtitle="Proyección ingresos"
                        icon={DollarSign}
                        gradient="amber"
                    />
                </div>

                <AnimatePresence>
                    {showWizard && <WizardCotizacion onCrear={handleCrear} onCerrar={() => setShowWizard(false)} />}
                </AnimatePresence>

                {/* Filtros y Buscador */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 rounded-[2rem] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar por folio, cliente o RFC..."
                            className="pl-12 h-12 bg-white/50 border-white/60 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                        />
                    </div>
                    <select
                        value={filtroEstado}
                        onChange={e => setFiltroEstado(e.target.value as EstadoCotizacion | '')}
                        className="h-12 px-6 bg-white/50 border border-white/60 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none min-w-[200px]"
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(ESTADOS_COTIZACION_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>

                {/* Listado */}
                {loading ? (
                    <div className="py-32 text-center text-slate-400">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-xs">Sincronizando propuestas...</p>
                    </div>
                ) : cotizaciones.length === 0 ? (
                    <div className="py-32 text-center bg-white/20 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-inner">
                        <FileText className="w-24 h-24 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-400 mb-2">Sin registros activos</h3>
                        <p className="text-slate-400 font-medium mb-8">Inicia una nueva propuesta comercial para visualizarla aquí.</p>
                        <Button onClick={() => setShowWizard(true)} className="rounded-2xl h-12 px-8 bg-blue-600 font-bold">
                            <Plus size={20} className="mr-2" /> Crear Primera Cotización
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {cotizaciones.map((cot, i) => (
                            <motion.div
                                key={cot.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[1.5rem] p-5 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all border border-slate-100">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-blue-600 font-black font-mono text-sm">{cot.folio}</span>
                                            <h3 className="text-slate-900 font-bold text-lg">{cot.cliente_nombre}</h3>
                                            <EstadoBadge estado={cot.estado} />
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 font-bold">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-50" /> {new Date(cot.fecha_emision).toLocaleDateString('es-MX')}</span>
                                            <span className="flex items-center gap-1.5"><Receipt className="w-4 h-4 opacity-50" /> {cot.conceptos?.length || 0} CONCEPTOS</span>
                                            {cot.empresa?.nombre && (
                                                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 opacity-50" /> {cot.empresa.nombre}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-900">{formatMoney(cot.total)}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cot.moneda}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="mx-auto max-w-2xl p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 text-sm font-bold flex items-center gap-4 shadow-xl shadow-red-500/5">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="uppercase tracking-widest text-[10px] mb-1">Error de Sincronización</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
