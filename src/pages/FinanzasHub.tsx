/**
 * FinanzasHub — Centro de Control Financiero y Administrativo
 * 
 * Módulos integrados:
 * 1. Dashboard (KPIs globales de administración)
 * 2. Cotizaciones (Propuestas por empresa/campaña)
 * 3. Facturación SAT (Emisión de CFDI 4.0)
 * 4. Cobranza (Aging y CxC)
 * 5. Costeo & ROI (Margen por empresa/paciente)
 * 6. Conciliación (Ingresos por categoría)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, Receipt, BarChart3, TrendingUp, Filter, Search, Plus,
    RefreshCw, ChevronRight, Loader2, Building2, CreditCard, PieChart, Clock,
    FileText, ArrowUpRight, ArrowDownRight, Wallet, Briefcase, Calculator,
    Zap, ShieldCheck, Download, Calendar, Users, ClipboardList, Target,
    GanttChartSquare, Landmark, Layers, Percent, Activity, Box, Pill,
    Stethoscope, Microscope, Beaker
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// Servicios existentes
import { finanzasService } from '@/services/finanzasService';
import { cotizacionService } from '@/services/cotizacionService';
import { billingService } from '@/services/billingService';
import { cxcService } from '@/services/cxcService';
import { costeoService } from '@/services/costeoService';

// Componentes unificados
import Cotizaciones from '@/pages/Cotizaciones';
import Facturacion from '@/pages/Facturacion';
import CuentasPorCobrar from '@/pages/CuentasPorCobrar';
import CosteoAnalysis from '@/components/billing/CosteoAnalysis';

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

function LiveDot() {
    return (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
    );
}

// ═══════════════════════════════════════════════════
// COMPONENTE: FinanzasHub
// ═══════════════════════════════════════════════════

export default function FinanzasHub() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data States
    const [summary, setSummary] = useState<any>(null);
    const [ingresosData, setIngresosData] = useState<any[]>([]);

    useEffect(() => {
        loadFinanzas();
    }, []);

    async function loadFinanzas() {
        setLoading(true);
        try {
            const [resumen, ingresos] = await Promise.all([
                finanzasService.obtenerResumenGlobal(),
                finanzasService.obtenerIngresosPorCategoria()
            ]);
            setSummary(resumen);
            setIngresosData(ingresos);
        } catch (e) {
            console.error('Error al cargar finanzas:', e);
            toast.error('Error al cargar datos financieros');
        } finally {
            setLoading(false);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        await loadFinanzas();
        setRefreshing(false);
        toast.success('Datos actualizados');
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PremiumPageHeader
                title="Administración y Finanzas"
                subtitle="Control avanzado de facturación, cobranza, costeo operativo y rentabilidad por empresa."
                icon={Landmark}
                badge="ADMIN ERP"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="h-10 px-4 rounded-xl bg-white/50 border-white/80 text-slate-800 hover:bg-white"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                        <Button className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10">
                            <Download className="w-4 h-4 mr-2" /> Reporte Anual
                        </Button>
                    </div>
                }
            />

            <div className="w-full px-6 lg:px-8 py-6 space-y-8">
                {/* KPIs Finanzas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <PremiumMetricCard
                        title="Facturación Hoy"
                        value={formatMoney(summary?.facturacion?.total_hoy || 0)}
                        subtitle={`${summary?.facturacion?.count_hoy || 0} facturas emitidas hoy`}
                        icon={Receipt}
                        gradient="emerald"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <PremiumMetricCard
                        title="Cuentas por Cobrar"
                        value={formatMoney(summary?.cobranza?.total_cartera || 0)}
                        subtitle={`${summary?.cobranza?.vencido > 0 ? formatMoney(summary.cobranza.vencido) + ' vencido' : 'Cartera sana'}`}
                        icon={Wallet}
                        gradient="rose"
                        trend={summary?.cobranza?.vencido > 0 ? { value: 8, isPositive: false } : undefined}
                    />
                    <PremiumMetricCard
                        title="Margen Operativo"
                        value={`${summary?.rentabilidad?.margen_promedio || 0}%`}
                        subtitle="Promedio sobre ingresos directos"
                        icon={TrendingUp}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="ROI por Paciente"
                        value={formatMoney(summary?.rentabilidad?.costo_promedio || 0)}
                        subtitle="Costo operativo promedio"
                        icon={Users}
                        gradient="amber"
                    />
                </div>

                {/* Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white/60 backdrop-blur-md border border-white/80 p-1.5 rounded-2xl w-full justify-start shadow-sm flex-wrap gap-1 h-auto">
                        <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <BarChart3 className="w-3.5 h-3.5" /> Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="cotizaciones" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <Calculator className="w-3.5 h-3.5" /> Cotizaciones
                        </TabsTrigger>
                        <TabsTrigger value="facturacion" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <Receipt className="w-3.5 h-3.5" /> Facturación
                        </TabsTrigger>
                        <TabsTrigger value="cobranza" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <Wallet className="w-3.5 h-3.5" /> Cobranza
                        </TabsTrigger>
                        <TabsTrigger value="costeo" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Costeo & ROI
                        </TabsTrigger>
                        <TabsTrigger value="reconciliacion" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest gap-2">
                            <Layers className="w-3.5 h-3.5" /> Reconciliación
                        </TabsTrigger>
                    </TabsList>

                    {/* 1. DASHBOARD OVERVIEW */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Reconciliation Chart Quick View */}
                            <Card className="border-0 shadow-lg bg-white lg:col-span-2 rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/30 border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-black flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                                            Ingresos por Categoría
                                            <LiveDot />
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] font-black">MENSUAL</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-4">
                                            {ingresosData.map((item, idx) => (
                                                <div key={item.name} className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                                                        <span className="text-sm font-bold text-slate-800">{formatMoney(item.value)}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(item.value / ingresosData.reduce((s, i) => s + i.value, 0)) * 100}%` }}
                                                            className={`h-full rounded-full bg-emerald-500 opacity-${(100 - idx * 15)}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-slate-50 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center border border-slate-100">
                                            <PieChart className="w-20 h-20 text-emerald-200 mb-4" />
                                            <h4 className="text-3xl font-black text-slate-900">{formatMoney(summary?.facturacion?.total_mes || 0)}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Facturado Mes</p>
                                            <div className="mt-6 grid grid-cols-2 gap-4 w-full text-left">
                                                <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                    <p className="text-xs font-black text-emerald-600">{summary?.facturacion?.timbradas || 0}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Timbradas</p>
                                                </div>
                                                <div className="p-3 bg-white rounded-xl border border-slate-100">
                                                    <p className="text-xs font-black text-amber-600">{summary?.facturacion?.borradores || 0}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Borradores</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Billing Status */}
                            <Card className="border-0 shadow-lg bg-white rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="bg-slate-900 border-b">
                                    <CardTitle className="text-base font-black text-white flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        Estado Fiscal (SAT)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Emisor 4.0</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">CSD Vigente hasta 2026</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-500 text-white border-0 text-[8px] font-black">ACTIVO</Badge>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Pacientes Registrados</span>
                                                    <span className="text-xs font-bold text-slate-900">85%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="w-[85%] h-full bg-slate-900 rounded-full" />
                                                </div>
                                                <p className="text-[8px] text-slate-400 mt-2">Usuarios con información fiscal completa</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-700 hover:bg-white" onClick={() => setActiveTab('facturacion')}>
                                            Configurar SAT <ChevronRight className="w-3 h-3 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Aging Summary Quick Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="border-0 shadow-lg bg-white rounded-[2rem] p-6 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                                    <Clock size={32} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-black text-rose-600">{summary?.cobranza?.porcentaje_recuperacion}%</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasa de Recuperación</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-full h-1 bg-slate-100 rounded-full">
                                            <div className={`h-full bg-rose-500 rounded-full`} style={{ width: `${summary?.cobranza?.porcentaje_recuperacion}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card className="border-0 shadow-lg bg-white rounded-[2rem] p-6 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Building2 size={32} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-black text-blue-600">{summary?.facturacion?.timbradas + summary?.facturacion?.borradores}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Comprobantes</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-slate-500 font-bold">Últimos 30 días</span>
                                    </div>
                                </div>
                            </Card>
                            <Card className="border-0 shadow-lg bg-slate-900 rounded-[2rem] p-6 flex items-center gap-6 text-white border-b-8 border-emerald-500">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                                    <TrendingUp size={32} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-black text-white">{summary?.rentabilidad?.empresa_top}</h4>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Empresa más rentable</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-emerald-400 font-bold">Top Margin</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* 2. COTIZACIONES */}
                    <TabsContent value="cotizaciones">
                        <Cotizaciones />
                    </TabsContent>

                    {/* 3. FACTURACIÓN SAT */}
                    <TabsContent value="facturacion">
                        <Facturacion />
                    </TabsContent>

                    {/* 4. COBRANZA / AGING */}
                    <TabsContent value="cobranza">
                        <CuentasPorCobrar />
                    </TabsContent>

                    {/* 5. COSTEO & ROI */}
                    <TabsContent value="costeo">
                        <CosteoAnalysis />
                    </TabsContent>

                    {/* 6. RECONCILIACIÓN */}
                    <TabsContent value="reconciliacion" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="border-0 shadow-xl bg-white rounded-[3rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-slate-50">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
                                            <Layers size={20} />
                                        </div>
                                        Ingresos Reconciliados por Servicios
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-6">
                                        {ingresosData.map((item, idx) => (
                                            <div key={item.name} className="group hover:bg-slate-50 p-4 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${item.name === 'Consultas' ? 'bg-blue-100 text-blue-600 shadow-blue-100/50' :
                                                        item.name === 'Laboratorio' ? 'bg-teal-100 text-teal-600 shadow-teal-100/50' :
                                                            item.name === 'Imagen' ? 'bg-violet-100 text-violet-600 shadow-violet-100/50' :
                                                                item.name === 'Checkups' ? 'bg-emerald-100 text-emerald-600 shadow-emerald-100/50' :
                                                                    item.name === 'Estudios_esp' ? 'bg-amber-100 text-amber-600 shadow-amber-100/50' :
                                                                        'bg-slate-100 text-slate-600 shadow-slate-100/50'
                                                        }`}>
                                                        {item.name === 'Consultas' && <Stethoscope size={24} />}
                                                        {item.name === 'Laboratorio' && <Beaker size={24} />}
                                                        {item.name === 'Imagen' && <Microscope size={24} />}
                                                        {item.name === 'Checkups' && <Activity size={24} />}
                                                        {item.name === 'Estudios_esp' && <Zap size={24} />}
                                                        {item.name === 'Otros' && <Box size={24} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${(item.value / ingresosData.reduce((s, i) => s + i.value, 0)) * 100}%` }}
                                                                    className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' :
                                                                        idx === 1 ? 'bg-teal-500' :
                                                                            idx === 2 ? 'bg-violet-500' :
                                                                                idx === 3 ? 'bg-emerald-500' :
                                                                                    idx === 4 ? 'bg-amber-500' :
                                                                                        'bg-slate-400'
                                                                        }`}
                                                                />
                                                            </div>
                                                            <span className="text-base font-black text-slate-900 min-w-[100px] text-right">
                                                                {formatMoney(item.value)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-0 shadow-lg bg-emerald-600 text-white rounded-[3rem] p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                                        <ArrowUpRight size={120} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-widest opacity-80 mb-2">Ingresos Totales</h3>
                                    <h2 className="text-5xl font-black mb-4">{formatMoney(ingresosData.reduce((s, i) => s + i.value, 0))}</h2>
                                    <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                                        <TrendingUp size={16} className="text-emerald-300" />
                                        <span className="text-xs font-black">+14.5% vs Mes anterior</span>
                                    </div>
                                </Card>

                                <Card className="border-0 shadow-lg bg-white rounded-[3rem] p-8 border border-slate-100">
                                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <GanttChartSquare className="text-violet-500" />
                                        Notas de Reconciliación
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                            <div className="w-1.5 h-full bg-violet-400 rounded-full" />
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Los ingresos por <strong>Staff médico</strong> están integrados en la categoría de "Consultas".
                                            </p>
                                        </div>
                                        <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                            <div className="w-1.5 h-full bg-emerald-400 rounded-full" />
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Se detectó un incremento del 22% en <strong>Checkups Corporativos</strong> debido a la campaña de salud ocupacional Q1.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
