// =====================================================
// PÁGINA: Cuentas por Cobrar - GPMedical ERP Pro
// =====================================================
// Vista de aging, registro de pagos, y métricas de cobranza.
// =====================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, TrendingUp, AlertTriangle, Search, Filter,
    Clock, CheckCircle2, XCircle, ChevronRight, Loader2,
    Calendar, Building2, CreditCard, Plus, BarChart3, PieChart
} from 'lucide-react';
import { cxcService } from '@/services/cxcService';
import {
    ESTADOS_CXC_LABELS,
    AGING_BUCKET_LABELS,
    AGING_BUCKET_COLORS,
    METODOS_PAGO_LABELS,
    type CuentaPorCobrar,
    type AgingResumen,
    type AgingBucket,
    type EstadoCxC,
    type FiltrosCxC,
    type RegistrarPagoDTO,
    type MetodoPago,
} from '@/types/cxc';

// =====================================================
// HELPERS
// =====================================================

const formatMoney = (amount: number, currency = 'MXN') =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

// =====================================================
// AGING CHART COMPONENT
// =====================================================

const AgingChart: React.FC<{ data: AgingResumen }> = ({ data }) => {
    const maxMonto = Math.max(...data.buckets.map(b => b.monto), 1);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" /> Aging Report
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
                {data.buckets.map(bucket => (
                    <div key={bucket.bucket} className="text-center">
                        <div className="mb-2">
                            <div
                                className="mx-auto rounded-lg transition-all"
                                style={{
                                    backgroundColor: bucket.color + '33',
                                    height: `${Math.max(20, (bucket.monto / maxMonto) * 120)}px`,
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: '4px',
                                }}
                            >
                                <span className="text-xs font-bold" style={{ color: bucket.color }}>
                                    {bucket.count}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs font-medium" style={{ color: bucket.color }}>{bucket.label}</div>
                        <div className="text-sm font-bold text-white mt-1">{formatMoney(bucket.monto)}</div>
                        <div className="text-xs text-white/30">{bucket.porcentaje}%</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                    <div className="text-xs text-white/50">Total pendiente</div>
                    <div className="text-lg font-bold text-white">{formatMoney(data.total_saldo)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-white/50">Vencido</div>
                    <div className="text-lg font-bold text-red-400">{formatMoney(data.total_vencido)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-white/50">% Cobranza</div>
                    <div className="text-lg font-bold text-emerald-400">{data.porcentaje_cobranza}%</div>
                </div>
            </div>
        </div>
    );
};

// =====================================================
// MODAL REGISTRAR PAGO
// =====================================================

function RegistrarPagoModal({ cuenta, onPago, onCerrar }: {
    cuenta: CuentaPorCobrar;
    onPago: (dto: RegistrarPagoDTO) => Promise<void>;
    onCerrar: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        monto: cuenta.saldo_pendiente,
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: 'transferencia' as MetodoPago,
        referencia: '',
        notas: '',
        complemento_cfdi: false,
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onPago({
                cuenta_id: cuenta.id,
                ...form,
            });
            onCerrar();
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onCerrar}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
                <h3 className="text-xl font-bold text-slate-900 mb-4">💰 Registrar Pago</h3>
                <div className="text-sm text-slate-500 mb-6">
                    <span className="text-slate-900 font-semibold">{cuenta.cliente_nombre}</span> · Saldo: <span className="text-amber-600 font-bold">{formatMoney(cuenta.saldo_pendiente)}</span>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">Monto *</label>
                        <input
                            type="number"
                            value={form.monto}
                            onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))}
                            max={cuenta.saldo_pendiente}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-slate-700 mb-1 font-medium">Fecha</label>
                            <input
                                type="date"
                                value={form.fecha_pago}
                                onChange={e => setForm(f => ({ ...f, fecha_pago: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1 font-medium">Método</label>
                            <select
                                value={form.metodo_pago}
                                onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value as MetodoPago }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm"
                            >
                                {Object.entries(METODOS_PAGO_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">Referencia</label>
                        <input
                            type="text"
                            value={form.referencia}
                            onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
                            placeholder="No. transferencia, cheque, etc."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.complemento_cfdi}
                            onChange={e => setForm(f => ({ ...f, complemento_cfdi: e.target.checked }))}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500"
                        />
                        <span className="text-sm text-slate-600 font-medium">Requiere complemento de pago CFDI</span>
                    </label>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onCerrar} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || form.monto <= 0}
                        className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                        Registrar {formatMoney(form.monto)}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function CuentasPorCobrar() {
    const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
    const [agingData, setAgingData] = useState<AgingResumen | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<EstadoCxC | ''>('');
    const [filtroBucket, setFiltroBucket] = useState<AgingBucket | ''>('');
    const [cuentaPago, setCuentaPago] = useState<CuentaPorCobrar | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const filtros: FiltrosCxC = {};
            if (filtroEstado) filtros.estado = filtroEstado;
            if (filtroBucket) filtros.aging_bucket = filtroBucket;
            if (searchQuery) filtros.search = searchQuery;

            const [data, aging] = await Promise.all([
                cxcService.listar(filtros),
                cxcService.obtenerAgingResumen(),
            ]);
            setCuentas(data);
            setAgingData(aging);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando CxC');
        } finally {
            setLoading(false);
        }
    }, [filtroEstado, filtroBucket, searchQuery]);

    useEffect(() => { cargar(); }, [cargar]);

    const handlePago = async (dto: RegistrarPagoDTO) => {
        await cxcService.registrarPago(dto);
        await cargar();
    };

    const cuentasFiltradas = useMemo(() => {
        if (!searchQuery) return cuentas;
        const q = searchQuery.toLowerCase();
        return cuentas.filter(c =>
            c.cliente_nombre.toLowerCase().includes(q) ||
            c.folio_factura?.toLowerCase().includes(q)
        );
    }, [cuentas, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cuentas por Cobrar</h1>
                    <p className="text-slate-500 mt-1">Aging, pagos y cobranza</p>
                </div>
            </div>

            {/* Aging Chart */}
            {agingData && <AgingChart data={agingData} />}

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar por cliente o folio..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value as EstadoCxC | '')}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS_CXC_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <select
                    value={filtroBucket}
                    onChange={e => setFiltroBucket(e.target.value as AgingBucket | '')}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                >
                    <option value="">Todo el aging</option>
                    {Object.entries(AGING_BUCKET_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-20 text-center text-white/40">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Cargando cuentas...
                </div>
            ) : cuentasFiltradas.length === 0 ? (
                <div className="py-20 text-center">
                    <DollarSign className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium mb-2">Sin cuentas por cobrar</h3>
                    <p className="text-white/30 text-sm">Las CxC se generan automáticamente al facturar.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Folio</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vence</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Original</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
                                <th className="text-center px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aging</th>
                                <th className="text-center px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="text-right px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cuentasFiltradas.map((c, i) => (
                                <motion.tr
                                    key={c.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="border-t border-white/5 hover:bg-white/5 transition-all"
                                >
                                    <td className="px-5 py-4 text-sm text-slate-900 font-mono font-medium">{c.folio_factura || '-'}</td>
                                    <td className="px-5 py-4">
                                        <div className="text-sm text-slate-900 font-bold">{c.cliente_nombre}</div>
                                        <div className="text-xs text-slate-500 font-medium">{c.cliente_rfc}</div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                                        {new Date(c.fecha_vencimiento).toLocaleDateString('es-MX')}
                                        {c.dias_vencidos > 0 && (
                                            <span className="text-red-500 font-bold text-xs ml-1">({c.dias_vencidos}d)</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-500 text-right font-medium">{formatMoney(c.monto_original)}</td>
                                    <td className="px-5 py-4 text-sm text-slate-900 font-black text-right">{formatMoney(c.saldo_pendiente)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                                            style={{
                                                backgroundColor: AGING_BUCKET_COLORS[c.aging_bucket as AgingBucket] + '33',
                                                color: AGING_BUCKET_COLORS[c.aging_bucket as AgingBucket],
                                            }}
                                        >
                                            {AGING_BUCKET_LABELS[c.aging_bucket as AgingBucket]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${c.estado === 'pagada' ? 'bg-green-500/20 text-green-300' :
                                                c.estado === 'vencida' ? 'bg-red-500/20 text-red-300' :
                                                    c.estado === 'pagada_parcial' ? 'bg-amber-500/20 text-amber-300' :
                                                        'bg-gray-500/20 text-gray-300'}`}>
                                            {ESTADOS_CXC_LABELS[c.estado]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {c.estado !== 'pagada' && c.estado !== 'cancelada' && (
                                            <button
                                                onClick={() => setCuentaPago(c)}
                                                className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1"
                                            >
                                                <CreditCard className="w-3 h-3" /> Pago
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Pago */}
            <AnimatePresence>
                {cuentaPago && (
                    <RegistrarPagoModal
                        cuenta={cuentaPago}
                        onPago={handlePago}
                        onCerrar={() => setCuentaPago(null)}
                    />
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}
        </div>
    );
}
