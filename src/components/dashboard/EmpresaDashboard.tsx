// =====================================================
// COMPONENTE: Dashboard por Empresa - GPMedical ERP Pro
// Métricas: Headcount, % Aptos, Hallazgos, SLA, Saldo
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Users, CheckCircle2, AlertTriangle, Clock, DollarSign,
    Activity, TrendingUp, Building2, Loader2, BarChart3, ClipboardList
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// =====================================================
// TIPOS
// =====================================================

interface MetricasEmpresa {
    empresa_id: string;
    empresa_nombre: string;
    headcount: number;
    aptos: number;
    no_aptos: number;
    pendientes: number;
    hallazgos_criticos: number;
    porcentaje_aptos: number;
    saldo_pendiente: number;
    campanias_activas: number;
    ultima_campania: string | null;
}

interface FiltrosDashboard {
    empresa_id?: string;
}

// =====================================================
// SERVICIO INLINE
// =====================================================

async function obtenerMetricasEmpresas(filtros: FiltrosDashboard = {}): Promise<MetricasEmpresa[]> {
    // Obtener empresas
    let queryEmpresas = supabase.from('empresas').select('id, nombre');
    if (filtros.empresa_id) queryEmpresas = queryEmpresas.eq('id', filtros.empresa_id);
    const { data: empresas } = await queryEmpresas;
    if (!empresas || empresas.length === 0) return [];

    const metricas: MetricasEmpresa[] = [];

    for (const emp of empresas) {
        // Pacientes por empresa
        const { count: headcount } = await supabase
            .from('pacientes')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id);

        // Dictámenes por empresa
        const { data: dictamenes } = await supabase
            .from('dictamenes')
            .select('resultado')
            .eq('empresa_id', emp.id);

        const aptos = dictamenes?.filter(d => d.resultado === 'apto').length || 0;
        const no_aptos = dictamenes?.filter(d => d.resultado === 'no_apto').length || 0;
        const pendientes = (headcount || 0) - aptos - no_aptos;

        // Hallazgos críticos (alertas de vigilancia)
        const { count: hallazgos } = await supabase
            .from('alertas_vigilancia')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id)
            .eq('severidad', 'critica');

        // Saldo CxC pendiente
        const { data: cxcData } = await supabase
            .from('cuentas_por_cobrar')
            .select('saldo')
            .eq('empresa_id', emp.id)
            .neq('estado', 'pagada');
        const saldo = cxcData?.reduce((s, c) => s + (c.saldo || 0), 0) || 0;

        // Campañas activas
        const { count: campanias } = await supabase
            .from('campanias')
            .select('id', { count: 'exact', head: true })
            .eq('empresa_id', emp.id)
            .in('estado', ['activa', 'en_ejecucion']);

        const total = headcount || 0;
        metricas.push({
            empresa_id: emp.id,
            empresa_nombre: emp.nombre,
            headcount: total,
            aptos,
            no_aptos,
            pendientes: Math.max(0, pendientes),
            hallazgos_criticos: hallazgos || 0,
            porcentaje_aptos: total > 0 ? Math.round((aptos / total) * 100) : 0,
            saldo_pendiente: saldo,
            campanias_activas: campanias || 0,
            ultima_campania: null,
        });
    }

    return metricas.sort((a, b) => b.headcount - a.headcount);
}

// =====================================================
// COMPONENTES DE TARJETA
// =====================================================

function TarjetaKPI({ icono: Icono, etiqueta, valor, color, sufijo }: {
    icono: React.ElementType;
    etiqueta: string;
    valor: number | string;
    color: string;
    sufijo?: string;
}) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Icono className={`w-4 h-4 ${color}`} />
                <span className="text-sm text-white/50">{etiqueta}</span>
            </div>
            <div className="text-2xl font-bold text-white">
                {valor}{sufijo && <span className="text-sm text-white/40 ml-1">{sufijo}</span>}
            </div>
        </div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function EmpresaDashboard() {
    const [metricas, setMetricas] = useState<MetricasEmpresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [empresaFiltro, setEmpresaFiltro] = useState('');

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const data = await obtenerMetricasEmpresas(
                    empresaFiltro ? { empresa_id: empresaFiltro } : {}
                );
                setMetricas(data);
            } catch (err) {
                console.error('Error cargando métricas:', err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [empresaFiltro]);

    // Totales globales
    const totales = useMemo(() => ({
        headcount: metricas.reduce((s, m) => s + m.headcount, 0),
        aptos: metricas.reduce((s, m) => s + m.aptos, 0),
        hallazgos: metricas.reduce((s, m) => s + m.hallazgos_criticos, 0),
        saldo: metricas.reduce((s, m) => s + m.saldo_pendiente, 0),
        campanias: metricas.reduce((s, m) => s + m.campanias_activas, 0),
        empresas: metricas.length,
    }), [metricas]);

    const porcentajeGlobal = totales.headcount > 0
        ? Math.round((totales.aptos / totales.headcount) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard por Empresa</h1>
                    <p className="text-white/50 mt-1">Métricas consolidadas de salud ocupacional</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={empresaFiltro}
                        onChange={e => setEmpresaFiltro(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                    >
                        <option value="">Todas las empresas</option>
                        {metricas.map(m => (
                            <option key={m.empresa_id} value={m.empresa_id}>{m.empresa_nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPIs Globales */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <TarjetaKPI icono={Building2} etiqueta="Empresas" valor={totales.empresas} color="text-purple-400" />
                <TarjetaKPI icono={Users} etiqueta="Headcount" valor={totales.headcount} color="text-blue-400" />
                <TarjetaKPI icono={CheckCircle2} etiqueta="% Aptos" valor={porcentajeGlobal} color="text-emerald-400" sufijo="%" />
                <TarjetaKPI icono={AlertTriangle} etiqueta="Hallazgos" valor={totales.hallazgos} color="text-red-400" />
                <TarjetaKPI icono={DollarSign} etiqueta="Saldo CxC" valor={`$${(totales.saldo / 1000).toFixed(0)}k`} color="text-amber-400" />
                <TarjetaKPI icono={ClipboardList} etiqueta="Campañas" valor={totales.campanias} color="text-orange-400" />
            </div>

            {loading ? (
                <div className="py-20 text-center text-white/40">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Cargando métricas...
                </div>
            ) : metricas.length === 0 ? (
                <div className="py-20 text-center">
                    <Building2 className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-white/60 text-lg font-medium">Sin empresas registradas</h3>
                </div>
            ) : (
                /* Tabla de empresas */
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            Detalle por Empresa
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-white/50">
                                    <th className="text-left px-6 py-3 font-medium">Empresa</th>
                                    <th className="text-right px-4 py-3 font-medium">Headcount</th>
                                    <th className="text-right px-4 py-3 font-medium">Aptos</th>
                                    <th className="text-right px-4 py-3 font-medium">No Aptos</th>
                                    <th className="text-right px-4 py-3 font-medium">Pendientes</th>
                                    <th className="text-right px-4 py-3 font-medium">% Aptos</th>
                                    <th className="text-right px-4 py-3 font-medium">Hallazgos</th>
                                    <th className="text-right px-4 py-3 font-medium">Saldo CxC</th>
                                    <th className="text-right px-4 py-3 font-medium">Campañas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metricas.map((m, i) => (
                                    <motion.tr
                                        key={m.empresa_id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-purple-400" />
                                                <span className="text-white font-medium">{m.empresa_nombre}</span>
                                            </div>
                                        </td>
                                        <td className="text-right px-4 py-3 text-white font-medium">{m.headcount}</td>
                                        <td className="text-right px-4 py-3 text-emerald-400 font-medium">{m.aptos}</td>
                                        <td className="text-right px-4 py-3 text-red-400 font-medium">{m.no_aptos}</td>
                                        <td className="text-right px-4 py-3 text-amber-400">{m.pendientes}</td>
                                        <td className="text-right px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${m.porcentaje_aptos >= 80 ? 'bg-emerald-500' :
                                                            m.porcentaje_aptos >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${m.porcentaje_aptos}%` }}
                                                    />
                                                </div>
                                                <span className={`font-medium ${m.porcentaje_aptos >= 80 ? 'text-emerald-400' :
                                                    m.porcentaje_aptos >= 60 ? 'text-amber-400' : 'text-red-400'
                                                    }`}>{m.porcentaje_aptos}%</span>
                                            </div>
                                        </td>
                                        <td className="text-right px-4 py-3">
                                            {m.hallazgos_criticos > 0 ? (
                                                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {m.hallazgos_criticos}
                                                </span>
                                            ) : (
                                                <span className="text-white/20">0</span>
                                            )}
                                        </td>
                                        <td className="text-right px-4 py-3 text-white/70">
                                            ${m.saldo_pendiente.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                        </td>
                                        <td className="text-right px-4 py-3">
                                            {m.campanias_activas > 0 ? (
                                                <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {m.campanias_activas}
                                                </span>
                                            ) : (
                                                <span className="text-white/20">—</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
