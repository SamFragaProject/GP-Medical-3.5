// =====================================================
// PÁGINA: Cuentas por Cobrar - GPMedical ERP Pro
// =====================================================
// Vista de aging, registro de pagos, y métricas de cobranza con Luxury Light.
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

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// =====================================================
// HELPERS
// =====================================================

const formatMoney = (amount: number, currency = 'MXN') =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

// =====================================================
// MODAL REGISTRAR PAGO
// =====================================================

const ModalPago: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: any) => void; cuenta: CuentaPorCobrar | null }> = ({ isOpen, onClose, onSave, cuenta }) => {
    const [form, setForm] = useState({ monto: 0, fecha_pago: new Date().toISOString().split('T')[0], metodo_pago: 'transferencia' as MetodoPago });

    useEffect(() => {
        if (cuenta) setForm(f => ({ ...f, monto: cuenta.saldo_pendiente }));
    }, [cuenta]);

    if (!isOpen || !cuenta) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white border border-slate-200 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <DollarSign size={20} />
                    </div>
                    Registrar Cobro
                </h3>
                <div className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    Propio de: <span className="text-slate-900 font-bold">{cuenta.cliente_nombre}</span><br />
                    Saldo Pendiente: <span className="text-emerald-600 font-black">{formatMoney(cuenta.saldo_pendiente)}</span>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-700 ml-1">Monto a abonar</label>
                        <Input type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: Number(e.target.value) }))} className="h-12 bg-slate-50 rounded-2xl mt-1 font-black text-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1">Fecha</label>
                            <Input type="date" value={form.fecha_pago} onChange={e => setForm(f => ({ ...f, fecha_pago: e.target.value }))} className="h-12 bg-slate-50 rounded-2xl mt-1" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 ml-1">Método</label>
                            <select value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value as MetodoPago }))}
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-100 transition-all outline-none">
                                {Object.entries(METODOS_PAGO_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <Button variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold">Cancelar</Button>
                    <Button onClick={() => onSave({ ...form, cuenta_id: cuenta.id })} className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all">
                        Efectuar Pago
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

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
    const [cuentaPago, setCuentaPago] = useState<CuentaPorCobrar | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const filtros: FiltrosCxC = {};
            if (filtroEstado) filtros.estado = filtroEstado;
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
    }, [filtroEstado, searchQuery]);

    useEffect(() => { cargar(); }, [cargar]);

    const handlePago = async (dto: RegistrarPagoDTO) => {
        await cxcService.registrarPago(dto);
        setCuentaPago(null);
        await cargar();
    };

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Cuentas por Cobrar"
                subtitle="Seguimiento de facturación, carteras vencidas y registros de pagos"
                icon={BarChart3}
                badge="FINANZAS"
                actions={
                    <Button
                        variant="premium"
                        onClick={() => { }}
                        disabled
                        className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-black shadow-xl shadow-emerald-500/20 opacity-50"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Acción Masiva
                    </Button>
                }
            />

            <div className="container mx-auto px-6 -mt-10 relative z-40">
                {/* KPIs Premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <PremiumMetricCard
                        title="Cartera Total"
                        value={formatMoney(agingData?.total_saldo || 0)}
                        subtitle="Monto bruto por cobrar"
                        icon={DollarSign}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Vencido (+30d)"
                        value={formatMoney(agingData?.total_vencido || 0)}
                        subtitle="Cartera fuera de plazo"
                        icon={AlertTriangle}
                        gradient="red"
                        trend={{ value: 5, isPositive: false }}
                    />
                    <PremiumMetricCard
                        title="Por Vencer"
                        value={formatMoney((agingData?.total_saldo || 0) - (agingData?.total_vencido || 0))}
                        subtitle="Próximos ingresos"
                        icon={Clock}
                        gradient="amber"
                    />
                    <PremiumMetricCard
                        title="DSO Promedio"
                        value="24"
                        subtitle="Días de cobro"
                        icon={BarChart3}
                        gradient="emerald"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Aging Chart Lux */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Antigüedad de Saldos</h2>
                                <p className="text-slate-500 text-sm font-medium">Distribución de deuda por periodos</p>
                            </div>
                        </div>
                        <div className="h-[300px] flex items-end justify-between gap-4 px-4">
                            {agingData?.buckets.map(item => {
                                const height = (item.monto / (agingData.total_saldo || 1)) * 100;
                                return (
                                    <div key={item.bucket} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="w-full relative group">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(height, 5)}%` }}
                                                className={`w-full rounded-t-2xl shadow-lg transition-all ${item.bucket === 'current' ? 'bg-emerald-500/80 group-hover:bg-emerald-500' : 'bg-slate-200 group-hover:bg-blue-500'}`}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg font-bold">
                                                    {formatMoney(item.monto)}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center h-8 flex items-center">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filtros Lux */}
                    <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-[2.5rem] flex flex-col justify-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Filtro de búsqueda</label>
                        <div className="relative group mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Empresa o Folio..."
                                className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 transition-all font-bold"
                            />
                        </div>
                        <select
                            value={filtroEstado}
                            onChange={e => setFiltroEstado(e.target.value as EstadoCxC | '')}
                            className="h-12 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                        >
                            <option value="">Estados: Todos</option>
                            {Object.entries(ESTADOS_CXC_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Lux */}
                <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2.5rem] overflow-hidden shadow-sm mt-8">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900">Lista de Cuentas</h3>
                        <Badge variant="outline" className="rounded-lg h-8 px-4 font-bold border-slate-200 text-slate-500">
                            {cuentas.length} Registros
                        </Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / RFC</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Factura / Fecha</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Pendiente</th>
                                    <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-slate-400"><Loader2 className="w-10 h-10 animate-spin mx-auto opacity-20" /></td></tr>
                                ) : cuentas.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900">{c.cliente_nombre}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.cliente_rfc}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-mono text-sm font-bold text-emerald-600">{c.folio_factura || 'S/F'}</div>
                                            <div className="text-xs text-slate-400 font-medium">{new Date(c.fecha_emision).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-emerald-700">{formatMoney(c.saldo_pendiente)}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <Badge className={c.saldo_pendiente > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}>
                                                    {c.saldo_pendiente > 0 ? 'PENDIENTE' : 'PAGADO'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {c.saldo_pendiente > 0 && (
                                                <Button size="sm" onClick={() => setCuentaPago(c)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
                                                    Pagar
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ModalPago isOpen={!!cuentaPago} onClose={() => setCuentaPago(null)} onSave={handlePago} cuenta={cuentaPago} />

            {error && (
                <div className="mx-auto max-w-2xl p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 text-sm font-bold flex items-center gap-4 shadow-xl shadow-red-500/5 mt-8">
                    <AlertTriangle size={24} />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
