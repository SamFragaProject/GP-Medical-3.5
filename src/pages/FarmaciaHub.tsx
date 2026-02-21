/**
 * FarmaciaHub — Hub Central de Farmacia e Inventarios
 *
 * Tabs: Dashboard, Inventario, Dispensación, Botiquines, Alertas, Lotes
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Pill, AlertTriangle, CheckCircle, Clock, TrendingUp,
    Search, Filter, Plus, RefreshCw, ChevronRight, Eye,
    Loader2, Building2, Calendar, ClipboardList, ShieldAlert,
    ArrowRight, Thermometer, Trash2, DollarSign, BarChart3,
    FileText, ArrowDown, ArrowUp, Archive, Bell, Timer,
    Microscope, Activity, ChevronDown, X, Check, Minus,
    AlertCircle, Layers, Gauge, Radio, Zap, Heart, Star,
    Box
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
    dispensacionService,
    botiquinService,
    alertaReabastoService,
    farmaciaStatsService
} from '@/services/farmaciaService';
import type {
    Dispensacion,
    Botiquin,
    AlertaReabasto,
    EstadoDispensacion,
} from '@/types/inventario';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function LiveDot() {
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
    );
}

const ESTADO_DISP_COLORS: Record<EstadoDispensacion, { bg: string; text: string; label: string }> = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
    parcial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Parcial' },
    completa: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completa' },
    cancelada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
};

const ALERTA_NIVEL_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    critical: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertTriangle },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Bell },
};

const ALERTA_TIPO_LABELS: Record<string, string> = {
    stock_minimo: 'Stock Mínimo',
    caducidad_proxima: 'Caducidad Próxima',
    sin_stock: 'Sin Stock',
    botiquin_vencido: 'Botiquín Vencido',
    consumo_alto: 'Consumo Alto',
};

// ═══════════════════════════════════════════════════
// COMPONENTE: StatCard
// ═══════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
    icon: any; label: string; value: string | number; sub?: string; color: string; onClick?: () => void;
}) {
    const gradients: Record<string, string> = {
        emerald: 'from-emerald-500 to-teal-600',
        blue: 'from-blue-500 to-indigo-600',
        purple: 'from-purple-500 to-violet-600',
        amber: 'from-amber-500 to-orange-600',
        rose: 'from-rose-500 to-pink-600',
        cyan: 'from-cyan-500 to-blue-600',
        slate: 'from-slate-700 to-slate-900',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[color] || gradients.emerald} p-5 text-white shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-black">{value}</h3>
                <p className="text-white/80 text-xs font-semibold">{label}</p>
                {sub && <p className="text-white/60 text-[10px] mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════

export default function FarmaciaHub() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [stats, setStats] = useState({
        totalProductos: 0, valorInventario: 0, stockBajo: 0, porCaducar: 0,
        dispensacionesHoy: 0, botiquinesActivos: 0, alertasActivas: 0, consumoMensual: 0,
    });
    const [dispensaciones, setDispensaciones] = useState<Dispensacion[]>([]);
    const [dispensacionesPendientes, setDispensacionesPendientes] = useState<Dispensacion[]>([]);
    const [botiquines, setBotiquines] = useState<Botiquin[]>([]);
    const [alertas, setAlertas] = useState<AlertaReabasto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstadoDisp, setFiltroEstadoDisp] = useState<EstadoDispensacion | 'todas'>('todas');

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        setLoading(true);
        try {
            const [statsRes, dispRes, pendRes, botRes, alertRes] = await Promise.allSettled([
                farmaciaStatsService.obtenerResumen(),
                dispensacionService.listar(),
                dispensacionService.listarPendientes(),
                botiquinService.listar(),
                alertaReabastoService.obtenerActivas(),
            ]);

            if (statsRes.status === 'fulfilled') setStats(statsRes.value);
            if (dispRes.status === 'fulfilled') setDispensaciones(dispRes.value);
            if (pendRes.status === 'fulfilled') setDispensacionesPendientes(pendRes.value);
            if (botRes.status === 'fulfilled') setBotiquines(botRes.value);
            if (alertRes.status === 'fulfilled') setAlertas(alertRes.value);
        } catch (e) {
            console.error('Error cargando datos farmacia:', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        await loadAll();
        setRefreshing(false);
        toast.success('Datos actualizados');
    }

    async function handleResolverAlerta(alertaId: string) {
        if (!user) return;
        const ok = await alertaReabastoService.resolver(alertaId, user.id);
        if (ok) {
            setAlertas(prev => prev.filter(a => a.id !== alertaId));
            toast.success('Alerta resuelta');
        }
    }

    async function handleCompletarDispensacion(dispId: string) {
        const ok = await dispensacionService.completar(dispId);
        if (ok) {
            setDispensaciones(prev => prev.map(d => d.id === dispId ? { ...d, estado: 'completa' as const } : d));
            setDispensacionesPendientes(prev => prev.filter(d => d.id !== dispId));
            toast.success('Dispensación completada');
        }
    }

    // Filtered dispensaciones
    const dispensacionesFiltradas = useMemo(() => {
        let list = dispensaciones;
        if (filtroEstadoDisp !== 'todas') list = list.filter(d => d.estado === filtroEstadoDisp);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(d =>
                d.paciente_nombre?.toLowerCase().includes(term) ||
                d.medico_nombre?.toLowerCase().includes(term) ||
                d.id.includes(term)
            );
        }
        return list;
    }, [dispensaciones, filtroEstadoDisp, searchTerm]);

    // Botiquines stats
    const botiquinesStats = useMemo(() => {
        const activos = botiquines.filter(b => b.estado === 'activo').length;
        const porReabastecer = botiquines.filter(b => b.estado === 'por_reabastecer').length;
        const vencidos = botiquines.filter(b => b.estado === 'vencido').length;
        return { activos, porReabastecer, vencidos, total: botiquines.length };
    }, [botiquines]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/10 to-teal-50/10">
            <PremiumPageHeader
                title="Farmacia e Inventarios"
                subtitle="Medicamentos, dispensación, botiquines por empresa y alertas de reabasto."
                icon={Pill}
                badge="FARMACIA"
                actions={
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="h-10 px-4 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                }
            />

            <div className="w-full px-6 lg:px-8 py-6 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <StatCard icon={Package} label="Productos" value={stats.totalProductos} color="slate" onClick={() => setActiveTab('inventario')} />
                    <StatCard icon={DollarSign} label="Valor Inventario" value={`$${(stats.valorInventario / 1000).toFixed(1)}k`} color="emerald" />
                    <StatCard icon={AlertTriangle} label="Stock Bajo" value={stats.stockBajo} color={stats.stockBajo > 0 ? 'amber' : 'emerald'} onClick={() => setActiveTab('alertas')} />
                    <StatCard icon={Calendar} label="Por Caducar" value={stats.porCaducar} sub="Próximos 30 días" color={stats.porCaducar > 0 ? 'rose' : 'blue'} onClick={() => setActiveTab('lotes')} />
                    <StatCard icon={Pill} label="Dispensaciones" value={stats.dispensacionesHoy} sub="Hoy" color="purple" onClick={() => setActiveTab('dispensacion')} />
                    <StatCard icon={Box} label="Botiquines" value={stats.botiquinesActivos} sub="Activos" color="blue" onClick={() => setActiveTab('botiquines')} />
                    <StatCard icon={Bell} label="Alertas" value={stats.alertasActivas} color={stats.alertasActivas > 0 ? 'rose' : 'emerald'} onClick={() => setActiveTab('alertas')} />
                    <StatCard icon={TrendingUp} label="Consumo Mes" value={`$${(stats.consumoMensual / 1000).toFixed(1)}k`} color="cyan" />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-white/60 backdrop-blur-md border border-white/80 p-1.5 rounded-2xl w-full justify-start shadow-sm flex-wrap gap-1">
                        <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="inventario" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-slate-700 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Package className="w-3.5 h-3.5 mr-1.5" /> Inventario
                        </TabsTrigger>
                        <TabsTrigger value="dispensacion" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-purple-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Pill className="w-3.5 h-3.5 mr-1.5" /> Dispensación
                            {dispensacionesPendientes.length > 0 && (
                                <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded text-[9px] font-black">{dispensacionesPendientes.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="botiquines" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Box className="w-3.5 h-3.5 mr-1.5" /> Botiquines
                        </TabsTrigger>
                        <TabsTrigger value="alertas" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-rose-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Bell className="w-3.5 h-3.5 mr-1.5" /> Alertas
                            {alertas.length > 0 && (
                                <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded text-[9px] font-black">{alertas.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="lotes" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest">
                            <Archive className="w-3.5 h-3.5 mr-1.5" /> Lotes
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── DASHBOARD ─── */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Dispensaciones Pendientes */}
                            <Card className="border-0 shadow-lg bg-white lg:col-span-2">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50/50 border-b">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Pill className="w-5 h-5 text-purple-600" />
                                        Dispensaciones Pendientes
                                        <LiveDot />
                                        <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] font-black ml-2">
                                            {dispensacionesPendientes.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-16">
                                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                        </div>
                                    ) : dispensacionesPendientes.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <CheckCircle className="w-10 h-10 text-emerald-200 mb-3" />
                                            <p className="text-sm text-slate-400 font-medium">Sin dispensaciones pendientes</p>
                                            <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ Todo al día</p>
                                        </div>
                                    ) : (
                                        dispensacionesPendientes.map((disp, idx) => {
                                            const style = ESTADO_DISP_COLORS[disp.estado];
                                            return (
                                                <div key={disp.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <span className="text-[10px] font-mono text-slate-400 w-5">{idx + 1}</span>
                                                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                                                        <Pill className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 truncate">{disp.paciente_nombre || 'Paciente'}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Badge className={`${style.bg} ${style.text} border-0 text-[9px] font-black`}>{style.label}</Badge>
                                                            <span className="text-[10px] text-slate-400">{disp.items?.length || 0} medicamentos</span>
                                                            {disp.medico_nombre && <span className="text-[10px] text-slate-400">• Dr. {disp.medico_nombre}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCompletarDispensacion(disp.id)}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] h-7 px-3 rounded-lg font-bold"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Dispensar
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>

                            {/* Alertas Rápidas */}
                            <Card className="border-0 shadow-lg bg-white">
                                <CardHeader className="bg-gradient-to-r from-rose-50 to-amber-50/50 border-b">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-rose-500" />
                                        Alertas Activas
                                        {alertas.length > 0 && (
                                            <Badge className="bg-rose-500 text-white text-[10px] font-black ml-2">{alertas.length}</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                                    {alertas.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <CheckCircle className="w-8 h-8 text-emerald-200 mb-2" />
                                            <p className="text-xs text-slate-400">Sin alertas</p>
                                        </div>
                                    ) : (
                                        alertas.slice(0, 10).map(alerta => {
                                            const style = ALERTA_NIVEL_COLORS[alerta.nivel] || ALERTA_NIVEL_COLORS.info;
                                            const IconComp = style.icon;
                                            return (
                                                <div key={alerta.id} className={`p-3 rounded-xl ${style.bg} border ${style.border}`}>
                                                    <div className="flex items-start gap-2">
                                                        <IconComp className={`w-4 h-4 ${style.text} flex-shrink-0 mt-0.5`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-bold ${style.text}`}>{alerta.mensaje}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge className={`${style.bg} ${style.text} border-0 text-[8px] font-black`}>
                                                                    {ALERTA_TIPO_LABELS[alerta.tipo] || alerta.tipo}
                                                                </Badge>
                                                                {alerta.producto_codigo && (
                                                                    <span className="text-[9px] font-mono text-slate-400">{alerta.producto_codigo}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleResolverAlerta(alerta.id)}
                                                            className="p-1 hover:bg-white/50 rounded transition-colors"
                                                            title="Resolver"
                                                        >
                                                            <Check className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Botiquines Rápido */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader className="border-b bg-blue-50/30">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Box className="w-5 h-5 text-blue-600" />
                                        Botiquines por Empresa
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span className="font-bold text-slate-600">{botiquinesStats.activos} Activos</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                            <span className="font-bold text-slate-600">{botiquinesStats.porReabastecer} Por Reabastecer</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="font-bold text-slate-600">{botiquinesStats.vencidos} Vencidos</span>
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {botiquines.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Box className="w-10 h-10 text-slate-200 mb-3" />
                                        <p className="text-sm text-slate-400 font-medium">Sin botiquines registrados</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Los botiquines se asignan desde la sección Botiquines</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {botiquines.slice(0, 6).map(bot => {
                                            const estadoColor = bot.estado === 'activo' ? 'emerald' : bot.estado === 'por_reabastecer' ? 'amber' : 'rose';
                                            const itemsBajos = bot.items?.filter(i => i.cantidad_actual <= i.cantidad_minima).length || 0;
                                            return (
                                                <div
                                                    key={bot.id}
                                                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                                                    onClick={() => setActiveTab('botiquines')}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2.5 h-2.5 rounded-full bg-${estadoColor}-500`} />
                                                            <h4 className="text-sm font-bold text-slate-800 truncate">{bot.nombre}</h4>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium mb-2 truncate">
                                                        {bot.empresa_nombre || 'Sin empresa'} • {bot.ubicacion}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-600">{bot.items?.length || 0} items</span>
                                                        {itemsBajos > 0 && (
                                                            <Badge className="bg-amber-100 text-amber-700 border-0 text-[8px] font-black">
                                                                {itemsBajos} bajo mín.
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── INVENTARIO ─── */}
                    <TabsContent value="inventario" className="space-y-6">
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                            <Package className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Inventario de Medicamentos e Insumos</h3>
                                            <p className="text-xs text-slate-400 font-medium">Gestión completa de productos, stock, proveedores y órdenes de compra</p>
                                        </div>
                                    </div>
                                    <a href="/inventario">
                                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold">
                                            Abrir Inventario
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
                                <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-2xl font-black text-slate-900">{stats.totalProductos}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Productos</p>
                            </div>
                            <div className="p-5 bg-white rounded-2xl shadow-sm border border-emerald-100 text-center">
                                <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-2xl font-black text-emerald-700">${(stats.valorInventario / 1000).toFixed(1)}k</p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Valor Total</p>
                            </div>
                            <div className={`p-5 rounded-2xl shadow-sm border text-center ${stats.stockBajo > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
                                <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${stats.stockBajo > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
                                <p className={`text-2xl font-black ${stats.stockBajo > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{stats.stockBajo}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Bajo</p>
                            </div>
                            <div className={`p-5 rounded-2xl shadow-sm border text-center ${stats.porCaducar > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}>
                                <Calendar className={`w-8 h-8 mx-auto mb-2 ${stats.porCaducar > 0 ? 'text-rose-500' : 'text-slate-300'}`} />
                                <p className={`text-2xl font-black ${stats.porCaducar > 0 ? 'text-rose-700' : 'text-slate-400'}`}>{stats.porCaducar}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Por Caducar</p>
                            </div>
                        </div>

                        {/* Link to Admin Farmacia */}
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                            <ClipboardList className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Panel Admin Farmacia</h3>
                                            <p className="text-xs text-slate-400 font-medium">CRUD completo de productos farmacéuticos, precios, proveedores</p>
                                        </div>
                                    </div>
                                    <a href="/admin/farmacia">
                                        <Button className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl px-6 font-bold">
                                            Admin Farmacia
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── DISPENSACIÓN ─── */}
                    <TabsContent value="dispensacion" className="space-y-6">
                        {/* Filtros */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar paciente, médico..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 rounded-xl h-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(['todas', 'pendiente', 'parcial', 'completa', 'cancelada'] as const).map(est => (
                                    <button
                                        key={est}
                                        onClick={() => setFiltroEstadoDisp(est)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filtroEstadoDisp === est
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-purple-300'
                                            }`}
                                    >
                                        {est === 'todas' ? 'Todas' : ESTADO_DISP_COLORS[est].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabla Dispensaciones */}
                        <Card className="border-0 shadow-lg bg-white overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50/30 border-b">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-purple-600" />
                                    Dispensaciones
                                    <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] font-black ml-2">{dispensacionesFiltradas.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                    </div>
                                ) : dispensacionesFiltradas.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Pill className="w-10 h-10 text-slate-200 mb-3" />
                                        <p className="text-sm text-slate-400 font-medium">Sin dispensaciones</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Las dispensaciones se generan automáticamente desde recetas médicas</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {dispensacionesFiltradas.slice(0, 20).map((disp, idx) => {
                                            const style = ESTADO_DISP_COLORS[disp.estado];
                                            const totalItems = disp.items?.reduce((s, i) => s + (i.subtotal || 0), 0) || 0;
                                            return (
                                                <div key={disp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                                                    <span className="text-[10px] font-mono text-slate-400 w-5">{idx + 1}</span>
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-50 flex items-center justify-center">
                                                        <Pill className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-slate-800">{disp.paciente_nombre || 'Paciente'}</p>
                                                            <Badge className={`${style.bg} ${style.text} border-0 text-[9px] font-black`}>{style.label}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-slate-400 font-mono">#{disp.id.slice(0, 8)}</span>
                                                            {disp.medico_nombre && <span className="text-[10px] text-slate-400">• Dr. {disp.medico_nombre}</span>}
                                                            <span className="text-[10px] text-slate-400">• {disp.items?.length || 0} items</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-sm font-bold text-slate-800">${totalItems.toFixed(2)}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {new Date(disp.fecha_dispensacion || disp.created_at).toLocaleDateString('es-MX')}
                                                        </p>
                                                    </div>
                                                    {disp.estado === 'pendiente' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCompletarDispensacion(disp.id)}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] h-8 px-3 rounded-lg font-bold"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" /> Dispensar
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Info */}
                        <Card className="border-dashed border-2 border-purple-200 bg-purple-50/30">
                            <CardContent className="p-4 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-purple-800">Flujo de Dispensación</p>
                                    <p className="text-[10px] text-purple-600">
                                        Receta Médica → Dispensación Pendiente → Verificación de Stock → Selección de Lote → Entrega al Paciente → Dispensación Completa
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── BOTIQUINES ─── */}
                    <TabsContent value="botiquines" className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border text-center">
                                <p className="text-2xl font-black text-slate-900">{botiquinesStats.total}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 text-center">
                                <p className="text-2xl font-black text-emerald-700">{botiquinesStats.activos}</p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase">Activos</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl shadow-sm border border-amber-100 text-center">
                                <p className="text-2xl font-black text-amber-700">{botiquinesStats.porReabastecer}</p>
                                <p className="text-[10px] font-black text-amber-400 uppercase">Por Reabastecer</p>
                            </div>
                            <div className="p-4 bg-rose-50 rounded-2xl shadow-sm border border-rose-100 text-center">
                                <p className="text-2xl font-black text-rose-700">{botiquinesStats.vencidos}</p>
                                <p className="text-[10px] font-black text-rose-400 uppercase">Vencidos</p>
                            </div>
                        </div>

                        {/* Lista */}
                        <div className="space-y-4">
                            {botiquines.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <Box className="w-12 h-12 text-slate-200 mb-3" />
                                        <p className="text-sm text-slate-400 font-medium">Sin botiquines registrados</p>
                                        <p className="text-[10px] text-slate-400 mt-1 mb-4">Cree botiquines para cada empresa-cliente para control de consumo mensual</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                botiquines.map(bot => {
                                    const estadoColor = bot.estado === 'activo' ? 'emerald' : bot.estado === 'por_reabastecer' ? 'amber' : 'rose';
                                    const estadoLabel = bot.estado === 'activo' ? 'Activo' : bot.estado === 'por_reabastecer' ? 'Por Reabastecer' : bot.estado === 'vencido' ? 'Vencido' : 'Suspendido';
                                    const itemsBajos = bot.items?.filter(i => i.cantidad_actual <= i.cantidad_minima).length || 0;
                                    const totalItems = bot.items?.length || 0;

                                    return (
                                        <Card key={bot.id} className="border-0 shadow-lg bg-white overflow-hidden">
                                            <div className="flex items-stretch">
                                                <div className={`w-1.5 bg-${estadoColor}-500`} />
                                                <div className="flex-1 p-5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl bg-${estadoColor}-100 flex items-center justify-center`}>
                                                                <Box className={`w-5 h-5 text-${estadoColor}-600`} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-base font-black text-slate-800">{bot.nombre}</h3>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                                    <span className="text-[10px] text-slate-500 font-medium">{bot.empresa_nombre || 'Sin empresa'}</span>
                                                                    <span className="text-[10px] text-slate-300">•</span>
                                                                    <span className="text-[10px] text-slate-500">{bot.ubicacion}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className={`bg-${estadoColor}-100 text-${estadoColor}-700 border-0 text-[10px] font-black`}>
                                                                {estadoLabel}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Items del botiquín */}
                                                    {bot.items && bot.items.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {bot.items.slice(0, 8).map(item => {
                                                                const pct = item.cantidad_maxima > 0 ? (item.cantidad_actual / item.cantidad_maxima) * 100 : 0;
                                                                const isBajo = item.cantidad_actual <= item.cantidad_minima;
                                                                return (
                                                                    <div key={item.id} className={`p-2.5 rounded-lg ${isBajo ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                                                                        <p className="text-[10px] font-bold text-slate-700 truncate">{item.producto_nombre}</p>
                                                                        <div className="flex items-center justify-between mt-1">
                                                                            <span className={`text-xs font-black ${isBajo ? 'text-amber-700' : 'text-slate-800'}`}>
                                                                                {item.cantidad_actual}/{item.cantidad_maxima}
                                                                            </span>
                                                                            {item.fecha_vencimiento && (
                                                                                <span className="text-[8px] text-slate-400">{new Date(item.fecha_vencimiento).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full ${pct < 25 ? 'bg-rose-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                                style={{ width: `${pct}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                                            <span><strong>{totalItems}</strong> items</span>
                                                            {itemsBajos > 0 && <span className="text-amber-600 font-bold">{itemsBajos} bajo mínimo</span>}
                                                            <span>Responsable: {bot.responsable}</span>
                                                            {bot.fecha_ultimo_reabasto && (
                                                                <span>Último reabasto: {new Date(bot.fecha_ultimo_reabasto).toLocaleDateString('es-MX')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </TabsContent>

                    {/* ─── ALERTAS ─── */}
                    <TabsContent value="alertas" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Alertas por nivel */}
                            {(['critical', 'warning', 'info'] as const).map(nivel => {
                                const alertasNivel = alertas.filter(a => a.nivel === nivel);
                                if (alertasNivel.length === 0) return null;
                                const style = ALERTA_NIVEL_COLORS[nivel];
                                const IconComp = style.icon;
                                const nivelLabel = nivel === 'critical' ? 'Críticas' : nivel === 'warning' ? 'Advertencia' : 'Información';

                                return (
                                    <Card key={nivel} className={`border-2 ${style.border} shadow-lg bg-white`}>
                                        <CardHeader className={`${style.bg} border-b ${style.border}`}>
                                            <CardTitle className={`text-base font-bold flex items-center gap-2 ${style.text}`}>
                                                <IconComp className="w-5 h-5" />
                                                Alertas: {nivelLabel}
                                                <Badge className={`${style.bg} ${style.text} border-0 text-[10px] font-black ml-2`}>{alertasNivel.length}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                                            {alertasNivel.map(alerta => (
                                                <div key={alerta.id} className={`p-3 rounded-xl ${style.bg} border ${style.border}`}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className={`text-xs font-bold ${style.text}`}>{alerta.mensaje}</p>
                                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                <Badge className={`border-0 text-[8px] font-black ${style.bg} ${style.text}`}>
                                                                    {ALERTA_TIPO_LABELS[alerta.tipo] || alerta.tipo}
                                                                </Badge>
                                                                {alerta.producto_codigo && (
                                                                    <span className="text-[9px] font-mono text-slate-500">{alerta.producto_codigo}</span>
                                                                )}
                                                                {alerta.cantidad_actual !== undefined && alerta.cantidad_minima !== undefined && (
                                                                    <span className="text-[9px] font-bold text-slate-500">
                                                                        Stock: {alerta.cantidad_actual} / Mín: {alerta.cantidad_minima}
                                                                    </span>
                                                                )}
                                                                {alerta.dias_para_caducidad !== undefined && (
                                                                    <span className="text-[9px] font-bold text-rose-600">
                                                                        Caduca en {alerta.dias_para_caducidad}d
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleResolverAlerta(alerta.id)}
                                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold ${style.text} hover:bg-white/50 transition-colors border ${style.border}`}
                                                        >
                                                            <Check className="w-3 h-3" /> Resolver
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {alertas.length === 0 && (
                                <Card className="border-0 shadow-lg bg-white lg:col-span-2">
                                    <CardContent className="flex flex-col items-center justify-center py-20">
                                        <CheckCircle className="w-16 h-16 text-emerald-200 mb-4" />
                                        <p className="text-lg font-black text-slate-800">Sin alertas de reabasto</p>
                                        <p className="text-sm text-slate-400 mt-1">Todos los niveles de inventario están dentro de los parámetros</p>
                                        <p className="text-[10px] text-emerald-500 font-bold mt-2">✓ Stock mínimos OK • ✓ Caducidades OK • ✓ Botiquines OK</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* ─── LOTES ─── */}
                    <TabsContent value="lotes" className="space-y-6">
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Archive className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Gestión de Lotes y Caducidades</h3>
                                            <p className="text-xs text-slate-400 font-medium">Trazabilidad FIFO/FEFO, alertas de vencimiento, control por número de lote</p>
                                        </div>
                                    </div>
                                    <a href="/inventario/lotes">
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 font-bold">
                                            Abrir Lotes
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumen de lotes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-0 shadow-sm bg-emerald-50/50">
                                <CardContent className="p-5 text-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xl font-black text-emerald-700">Vigentes</p>
                                    <p className="text-[10px] text-emerald-500 font-bold mt-1">Lotes con fecha de caducidad válida</p>
                                </CardContent>
                            </Card>
                            <Card className={`border-0 shadow-sm ${stats.porCaducar > 0 ? 'bg-amber-50/50' : 'bg-slate-50'}`}>
                                <CardContent className="p-5 text-center">
                                    <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${stats.porCaducar > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
                                    <p className={`text-xl font-black ${stats.porCaducar > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                                        {stats.porCaducar} Por Caducar
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1">En los próximos 30 días</p>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm bg-rose-50/50">
                                <CardContent className="p-5 text-center">
                                    <Trash2 className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                                    <p className="text-xl font-black text-rose-600">Caducados</p>
                                    <p className="text-[10px] text-rose-400 font-bold mt-1">Requieren baja inmediata</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Políticas FEFO */}
                        <Card className="border-dashed border-2 border-amber-200 bg-amber-50/30">
                            <CardContent className="p-4 flex items-start gap-3">
                                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-800">Política FEFO (First Expire, First Out)</p>
                                    <p className="text-[10px] text-amber-600">
                                        El sistema prioriza automáticamente la dispensación de lotes con fecha de caducidad más cercana.
                                        Se aplica alerta amarilla a 30 días y alerta roja a 7 días de vencimiento.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
