// =====================================================
// PÁGINA: Cotizaciones - GPMedical ERP Pro
// =====================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FileText, DollarSign, Send, CheckCircle2,
    XCircle, Clock, ArrowRight, Copy, Loader2, ChevronRight,
    Building2, Calendar, Receipt, TrendingUp, AlertTriangle, Eye, Trash2
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        >
            <h3 className="text-lg font-semibold text-white mb-4">📝 Nueva Cotización</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm text-white/60 mb-1">ID Empresa *</label>
                    <input
                        type="text"
                        value={form.empresa_id || ''}
                        onChange={e => setForm(f => ({ ...f, empresa_id: e.target.value }))}
                        placeholder="UUID de la empresa"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Cliente *</label>
                    <input
                        type="text"
                        value={form.cliente_nombre || ''}
                        onChange={e => setForm(f => ({ ...f, cliente_nombre: e.target.value }))}
                        placeholder="Nombre del cliente"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">RFC</label>
                    <input
                        type="text"
                        value={form.cliente_rfc || ''}
                        onChange={e => setForm(f => ({ ...f, cliente_rfc: e.target.value.toUpperCase() }))}
                        placeholder="RFC del cliente"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm uppercase placeholder:text-white/30 focus:border-blue-500/50 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm text-white/60 mb-1">Vigencia hasta</label>
                    <input
                        type="date"
                        value={form.fecha_vigencia || ''}
                        onChange={e => setForm(f => ({ ...f, fecha_vigencia: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Catálogo de servicios */}
            <div className="mb-4">
                <label className="block text-sm text-white/60 mb-2">Agregar servicio del catálogo</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2">
                    {CATALOGO_SERVICIOS.map(srv => (
                        <button
                            key={srv.codigo}
                            onClick={() => agregarServicio(srv.codigo)}
                            className="text-left p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/70 hover:text-white transition-all"
                        >
                            <div className="font-medium truncate">{srv.nombre}</div>
                            <div className="text-white/40">{formatMoney(srv.precio_sugerido)} / {srv.unidad}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conceptos agregados */}
            {conceptos.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="text-sm text-white/60 font-medium">Conceptos ({conceptos.length})</div>
                    {conceptos.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                            <div className="flex-1 text-sm text-white/80 truncate">{c.descripcion}</div>
                            <input
                                type="number"
                                value={c.cantidad}
                                onChange={e => updateConcepto(i, 'cantidad', Number(e.target.value))}
                                min={1}
                                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-center"
                            />
                            <input
                                type="number"
                                value={c.precio_unitario}
                                onChange={e => updateConcepto(i, 'precio_unitario', Number(e.target.value))}
                                className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-right"
                            />
                            <div className="w-24 text-right text-sm text-white font-medium">
                                {formatMoney(c.cantidad * c.precio_unitario * (1 - (c.descuento_porcentaje || 0) / 100))}
                            </div>
                            <button onClick={() => eliminarConcepto(i)} className="p-1 hover:bg-red-500/20 rounded-lg text-white/30 hover:text-red-400 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-end space-y-1 text-sm">
                        <div className="w-64 space-y-1">
                            <div className="flex justify-between text-white/50"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                            <div className="flex justify-between text-white/50"><span>IVA 16%</span><span>{formatMoney(iva)}</span></div>
                            <div className="flex justify-between text-white font-bold text-base border-t border-white/10 pt-1">
                                <span>Total</span><span>{formatMoney(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-4">
                <button onClick={onCerrar} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all">
                    Cancelar
                </button>
                <button
                    onClick={handleCrear}
                    disabled={loading || !form.empresa_id || !form.cliente_nombre || conceptos.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Crear Cotización
                </button>
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
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Cotizaciones</h1>
                    <p className="text-white/50 mt-1">Propuestas comerciales para empresas</p>
                </div>
                <button
                    onClick={() => setShowWizard(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nueva Cotización
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-blue-400" /><span className="text-sm text-white/50">Total</span></div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><Send className="w-4 h-4 text-amber-400" /><span className="text-sm text-white/50">Enviadas</span></div>
                    <div className="text-2xl font-bold text-white">{stats.enviadas}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-white/50">Aceptadas</span></div>
                    <div className="text-2xl font-bold text-white">{stats.aceptadas}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-green-400" /><span className="text-sm text-white/50">Monto Total</span></div>
                    <div className="text-2xl font-bold text-white">{formatMoney(stats.monto)}</div>
                </div>
            </div>

            {/* Wizard */}
            <AnimatePresence>
                {showWizard && <WizardCotizacion onCrear={handleCrear} onCerrar={() => setShowWizard(false)} />}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar por folio o cliente..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-blue-500/50 transition-all"
                    />
                </div>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value as EstadoCotizacion | '')}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                >
                    <option value="">Todos</option>
                    {Object.entries(ESTADOS_COTIZACION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 text-center text-white/40">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Cargando cotizaciones...
                </div>
            ) : cotizaciones.length === 0 ? (
                <div className="py-20 text-center">
                    <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium mb-2">Sin cotizaciones</h3>
                    <p className="text-white/30 text-sm mb-4">Crea tu primera cotización para empezar.</p>
                    <button onClick={() => setShowWizard(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Crear cotización
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {cotizaciones.map((cot, i) => (
                        <motion.div
                            key={cot.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-white font-mono text-sm bg-white/10 px-2 py-0.5 rounded">{cot.folio}</span>
                                        <h3 className="text-white font-semibold">{cot.cliente_nombre}</h3>
                                        <EstadoBadge estado={cot.estado} />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-white/50">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(cot.fecha_emision).toLocaleDateString('es-MX')}</span>
                                        <span className="flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> {cot.conceptos?.length || 0} conceptos</span>
                                        {cot.empresa?.nombre && (
                                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {cot.empresa.nombre}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">{formatMoney(cot.total)}</div>
                                        <div className="text-xs text-white/40">{cot.moneda}</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-all" />
                                </div>
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
