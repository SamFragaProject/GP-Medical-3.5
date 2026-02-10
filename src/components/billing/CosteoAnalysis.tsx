// =====================================================
// COMPONENTE: Análisis de Costeo y Rentabilidad
// Visualización de margen por empresa, paciente y servicio
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, Users,
    PieChart, BarChart3, ArrowRight, Loader2,
    PieChart as PieChartIcon, Search, Download, Filter
} from 'lucide-react';
import {
    Card,
    Title,
    DonutChart,
    BarChart,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Badge,
    Metric,
    Flex,
    Select,
    SelectItem
} from '@tremor/react';
import { costeoService, type MargenEmpresa, type ResumenCosteo, type CostoPaciente } from '@/services/costeoService';

export default function CosteoAnalysis() {
    const [loading, setLoading] = useState(true);
    const [resumen, setResumen] = useState<ResumenCosteo | null>(null);
    const [margenes, setMargenes] = useState<MargenEmpresa[]>([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [res, marg] = await Promise.all([
                    costeoService.obtenerResumen(),
                    costeoService.obtenerMargenEmpresas()
                ]);
                setResumen(res);
                setMargenes(marg);
            } catch (err) {
                console.error('Error cargando datos de costeo:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredMargenes = useMemo(() => {
        return margenes.filter(m =>
            (selectedEmpresa === 'all' || m.empresa_id === selectedEmpresa) &&
            (m.empresa_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [margenes, selectedEmpresa, searchQuery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-white/60 font-medium">Analizando rentabilidad operativa...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Badge color="emerald">Finanzas & BI</Badge>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter mt-2 mt-2">
                        ANÁLISIS DE <span className="text-emerald-500">COSTEO</span>
                    </h1>
                    <p className="text-white/50 text-sm">Margen de utilidad real desglosado por operación clínica.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Buscar empresa..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:border-emerald-500/50 transition-colors w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-[#0a0f1a] border-white/10 shadow-emerald-500/5 shadow-xl">
                    <Text className="text-white/50 uppercase text-[10px] font-black tracking-widest">Costo Promedio Paciente</Text>
                    <Metric className="text-white font-black italic tracking-tighter">
                        ${resumen?.costo_promedio_paciente.toLocaleString()}
                    </Metric>
                    <Flex className="mt-4">
                        <Badge color="emerald" icon={TrendingDown}>-4% vs mes anterior</Badge>
                    </Flex>
                </Card>

                <Card className="bg-[#0a0f1a] border-white/10 shadow-emerald-500/5 shadow-xl">
                    <Text className="text-white/50 uppercase text-[10px] font-black tracking-widest">Margen Operativo Promedio</Text>
                    <Metric className={`text-white font-black italic tracking-tighter ${resumen && resumen.margen_promedio > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {resumen?.margen_promedio}%
                    </Metric>
                    <Flex className="mt-4">
                        <Text className="text-white/40 text-xs italic">Objetivo meta: {'>'}35%</Text>
                    </Flex>
                </Card>

                <Card className="bg-[#0a0f1a] border-white/10 shadow-emerald-500/5 shadow-xl">
                    <Text className="text-white/50 uppercase text-[10px] font-black tracking-widest">Empresa Mayor Margen</Text>
                    <Metric className="text-white font-black italic tracking-tight text-xl leading-tight mt-1">
                        {resumen?.empresa_mayor_margen}
                    </Metric>
                    <Flex className="mt-3">
                        <Badge color="blue" icon={TrendingUp}>Excelente performance</Badge>
                    </Flex>
                </Card>

                <Card className="bg-[#0a0f1a] border-white/10 shadow-emerald-500/5 shadow-xl">
                    <Text className="text-white/50 uppercase text-[10px] font-black tracking-widest">Total Pacientes Analizados</Text>
                    <Metric className="text-emerald-500 font-black italic tracking-tighter">
                        {resumen?.total_pacientes.toLocaleString()}
                    </Metric>
                    <Flex className="mt-4">
                        <Text className="text-white/40 text-xs italic">Corte: Hoy</Text>
                    </Flex>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Costos por Servicio */}
                <Card className="bg-[#0a0f1a] border-white/10">
                    <Title className="text-white font-black tracking-tighter italic uppercase text-lg">Distribución de Costos por Servicio</Title>
                    <DonutChart
                        className="mt-6 h-64"
                        data={resumen?.costos_por_servicio || []}
                        category="total"
                        index="servicio"
                        valueFormatter={(number: number) => `$${Intl.NumberFormat("us").format(number).toString()}`}
                        colors={["emerald", "cyan", "blue", "indigo", "violet", "purple", "fuchsia", "rose"]}
                        variant="donut"
                    />
                    <div className="mt-6 space-y-2">
                        {resumen?.costos_por_servicio.map((s, i) => (
                            <div key={s.servicio} className="flex items-center justify-between text-xs">
                                <span className="text-white/50 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--${["emerald", "cyan", "blue", "indigo", "violet", "purple", "fuchsia", "rose"][i]}-500)` }} />
                                    {s.servicio}
                                </span>
                                <span className="text-white font-bold">{s.porcentaje}%</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Margen por Empresa Top */}
                <Card className="bg-[#0a0f1a] border-white/10">
                    <Title className="text-white font-black tracking-tighter italic uppercase text-lg">Margen Neto por Empresa Client</Title>
                    <BarChart
                        className="mt-6 h-72"
                        data={margenes.slice(0, 5)}
                        index="empresa_nombre"
                        categories={["margen_total", "costo_total"]}
                        colors={["emerald", "rose"]}
                        valueFormatter={(number: number) => `$${(number / 1000).toFixed(1)}k`}
                        yAxisWidth={48}
                    />
                    <p className="text-[10px] text-white/30 text-center mt-4 italic uppercase tracking-widest">Comparativa de Rentabilidad (Ventas vs Costos Operativos)</p>
                </Card>
            </div>

            {/* Tabla Detallada */}
            <Card className="bg-[#0a0f1a] border-white/10 overflow-hidden p-0">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <Title className="text-white font-black tracking-tighter italic uppercase text-lg">Detalle por Entidad (Margen Operativo)</Title>
                    <Select
                        value={selectedEmpresa}
                        onValueChange={setSelectedEmpresa}
                        className="bg-[#0a0f1a] border-white/10 text-white w-48"
                    >
                        <SelectItem value="all">Todas las Empresas</SelectItem>
                        {margenes.map(m => (
                            <SelectItem key={m.empresa_id} value={m.empresa_id}>{m.empresa_nombre}</SelectItem>
                        ))}
                    </Select>
                </div>

                <Table className="mt-0">
                    <TableHead className="bg-[#0a0f1a]">
                        <TableRow className="border-b border-white/5">
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black">Empresa</TableHeaderCell>
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black text-right">Volumen</TableHeaderCell>
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black text-right">Costo Total</TableHeaderCell>
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black text-right">Facturación</TableHeaderCell>
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black text-right">Margen Neto</TableHeaderCell>
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black text-center">% Margen</TableHeaderCell>
                            <TableHeaderCell className="text-white/40 uppercase text-[10px] font-black"></TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMargenes.map((m) => (
                            <TableRow key={m.empresa_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="text-white font-bold italic tracking-tight">{m.empresa_nombre}</TableCell>
                                <TableCell className="text-right text-white/70">{m.total_pacientes} pac.</TableCell>
                                <TableCell className="text-right text-white/70">${m.costo_total.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-white font-black">${m.ingreso_total.toLocaleString()}</TableCell>
                                <TableCell className={`text-right font-black ${m.margen_total > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    ${m.margen_total.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge color={m.margen_porcentaje >= 35 ? "emerald" : m.margen_porcentaje >= 20 ? "amber" : "rose"}>
                                        {m.margen_porcentaje}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="p-1 px-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
