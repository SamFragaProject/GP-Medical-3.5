// =====================================================
// COMPONENTE: Pipeline Visual de Episodios (Kanban)
// Vista tipo Kanban para gestión de episodios médicos
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CheckCircle, AlertTriangle, XCircle, ArrowRight,
    User, Calendar, Building2, FileText, MoreHorizontal,
    Filter, RefreshCw, Search, Eye, Loader2, ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';

type EtapaEpisodio = 'programado' | 'en_proceso' | 'estudios_pendientes' | 'dictamen' | 'completado' | 'cancelado';

interface EpisodioKanban {
    id: string;
    paciente_nombre: string;
    paciente_id: string;
    empresa_nombre: string;
    campania_nombre?: string;
    tipo_examen: string;
    etapa: EtapaEpisodio;
    fecha_inicio: string;
    medico_nombre?: string;
    prioridad: 'normal' | 'alta' | 'urgente';
    estudios_total: number;
    estudios_completados: number;
    notas?: string;
}

const ETAPAS: { key: EtapaEpisodio; label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }[] = [
    { key: 'programado', label: 'Programado', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { key: 'en_proceso', label: 'En Proceso', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    { key: 'estudios_pendientes', label: 'Estudios Pend.', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'dictamen', label: 'Dictamen', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'completado', label: 'Completado', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { key: 'cancelado', label: 'Cancelado', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
];

const PRIORIDAD_COLORS = {
    normal: 'bg-slate-100 text-slate-600',
    alta: 'bg-amber-100 text-amber-700',
    urgente: 'bg-red-100 text-red-700',
};

// Datos de demo para mostrar el pipeline
const DEMO_EPISODIOS: EpisodioKanban[] = [
    { id: '1', paciente_nombre: 'García López, María', paciente_id: 'p1', empresa_nombre: 'CEMEX', campania_nombre: 'EMO 2025', tipo_examen: 'Ingreso', etapa: 'programado', fecha_inicio: '2025-02-20', prioridad: 'normal', estudios_total: 6, estudios_completados: 0 },
    { id: '2', paciente_nombre: 'Hdez. Ruiz, Carlos', paciente_id: 'p2', empresa_nombre: 'CEMEX', tipo_examen: 'Periódico', etapa: 'programado', fecha_inicio: '2025-02-21', prioridad: 'alta', estudios_total: 8, estudios_completados: 0 },
    { id: '3', paciente_nombre: 'Torres Sánchez, Ana', paciente_id: 'p3', empresa_nombre: 'Bimbo', campania_nombre: 'NOM-035 Q1', tipo_examen: 'Periódico', etapa: 'en_proceso', fecha_inicio: '2025-02-18', medico_nombre: 'Dr. Ramírez', prioridad: 'normal', estudios_total: 5, estudios_completados: 3 },
    { id: '4', paciente_nombre: 'Díaz Mora, Pedro', paciente_id: 'p4', empresa_nombre: 'Femsa', tipo_examen: 'Ingreso', etapa: 'en_proceso', fecha_inicio: '2025-02-17', medico_nombre: 'Dra. Flores', prioridad: 'urgente', estudios_total: 7, estudios_completados: 5 },
    { id: '5', paciente_nombre: 'Méndez Vega, Luis', paciente_id: 'p5', empresa_nombre: 'CEMEX', tipo_examen: 'Especial', etapa: 'estudios_pendientes', fecha_inicio: '2025-02-15', prioridad: 'alta', estudios_total: 4, estudios_completados: 2, notas: 'Falta espirometría' },
    { id: '6', paciente_nombre: 'Rodríguez P., Laura', paciente_id: 'p6', empresa_nombre: 'Bimbo', tipo_examen: 'Periódico', etapa: 'dictamen', fecha_inicio: '2025-02-14', medico_nombre: 'Dr. Ramírez', prioridad: 'normal', estudios_total: 6, estudios_completados: 6 },
    { id: '7', paciente_nombre: 'Salinas V., Roberto', paciente_id: 'p7', empresa_nombre: 'Femsa', tipo_examen: 'Egreso', etapa: 'dictamen', fecha_inicio: '2025-02-13', prioridad: 'alta', estudios_total: 3, estudios_completados: 3 },
    { id: '8', paciente_nombre: 'Ortiz N., Sandra', paciente_id: 'p8', empresa_nombre: 'CEMEX', campania_nombre: 'EMO 2025', tipo_examen: 'Periódico', etapa: 'completado', fecha_inicio: '2025-02-10', medico_nombre: 'Dra. Flores', prioridad: 'normal', estudios_total: 5, estudios_completados: 5 },
    { id: '9', paciente_nombre: 'Rivas H., Jorge', paciente_id: 'p9', empresa_nombre: 'Bimbo', tipo_examen: 'Ingreso', etapa: 'completado', fecha_inicio: '2025-02-08', prioridad: 'normal', estudios_total: 6, estudios_completados: 6 },
    { id: '10', paciente_nombre: 'Cruz M., Diana', paciente_id: 'p10', empresa_nombre: 'Femsa', tipo_examen: 'Periódico', etapa: 'cancelado', fecha_inicio: '2025-02-12', prioridad: 'normal', estudios_total: 4, estudios_completados: 0, notas: 'No se presentó' },
];

export default function PipelineEpisodios() {
    const navigate = useNavigate();
    const [episodios, setEpisodios] = useState<EpisodioKanban[]>(DEMO_EPISODIOS);
    const [loading, setLoading] = useState(false);
    const [filtroEmpresa, setFiltroEmpresa] = useState('all');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarCancelados, setMostrarCancelados] = useState(false);

    // Cargar episodios reales (si existen)
    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('episodios_medicos')
                .select('*, paciente:pacientes(nombre, apellido_paterno), empresa:empresas_clientes(nombre), campania:campanias(nombre)')
                .order('created_at', { ascending: false })
                .limit(100);

            if (data && data.length > 0) {
                const mapped: EpisodioKanban[] = data.map((e: any) => ({
                    id: e.id,
                    paciente_nombre: `${e.paciente?.apellido_paterno || ''}, ${e.paciente?.nombre || ''}`,
                    paciente_id: e.paciente_id,
                    empresa_nombre: e.empresa?.nombre || '—',
                    campania_nombre: e.campania?.nombre,
                    tipo_examen: e.tipo_examen || 'General',
                    etapa: mapearEtapa(e.estatus || e.estado || 'programado'),
                    fecha_inicio: e.fecha_inicio || e.created_at,
                    medico_nombre: e.medico_nombre,
                    prioridad: e.prioridad || 'normal',
                    estudios_total: e.estudios_total || 0,
                    estudios_completados: e.estudios_completados || 0,
                    notas: e.notas,
                }));
                setEpisodios(mapped);
            }
            setLoading(false);
        };
        cargar();
    }, []);

    const mapearEtapa = (estatus: string): EtapaEpisodio => {
        const map: Record<string, EtapaEpisodio> = {
            programado: 'programado', agendado: 'programado', pendiente: 'programado',
            en_proceso: 'en_proceso', en_curso: 'en_proceso', activo: 'en_proceso',
            estudios_pendientes: 'estudios_pendientes',
            dictamen: 'dictamen', revision: 'dictamen',
            completado: 'completado', finalizado: 'completado', cerrado: 'completado',
            cancelado: 'cancelado',
        };
        return map[estatus] || 'programado';
    };

    // Empresas únicas para filtro
    const empresas = useMemo(() => [...new Set(episodios.map(e => e.empresa_nombre))].sort(), [episodios]);

    // Filtrar episodios
    const episodiosFiltrados = useMemo(() => {
        let filtered = [...episodios];
        if (filtroEmpresa !== 'all') filtered = filtered.filter(e => e.empresa_nombre === filtroEmpresa);
        if (busqueda) {
            const q = busqueda.toLowerCase();
            filtered = filtered.filter(e =>
                e.paciente_nombre.toLowerCase().includes(q) ||
                e.empresa_nombre.toLowerCase().includes(q) ||
                e.tipo_examen.toLowerCase().includes(q)
            );
        }
        if (!mostrarCancelados) filtered = filtered.filter(e => e.etapa !== 'cancelado');
        return filtered;
    }, [episodios, filtroEmpresa, busqueda, mostrarCancelados]);

    // Agrupar por etapa
    const columnas = useMemo(() => {
        const etapasVisibles = mostrarCancelados ? ETAPAS : ETAPAS.filter(e => e.key !== 'cancelado');
        return etapasVisibles.map(etapa => ({
            ...etapa,
            episodios: episodiosFiltrados.filter(e => e.etapa === etapa.key),
        }));
    }, [episodiosFiltrados, mostrarCancelados]);

    // Mover episodio a siguiente etapa
    const moverEpisodio = async (episodioId: string, nuevaEtapa: EtapaEpisodio) => {
        setEpisodios(prev => prev.map(e => e.id === episodioId ? { ...e, etapa: nuevaEtapa } : e));
        await supabase.from('episodios_medicos').update({ estatus: nuevaEtapa }).eq('id', episodioId).catch(() => { });
    };

    return (
        <div className="space-y-6 p-6">
            <PremiumPageHeader
                title="Pipeline de Episodios"
                subtitle="Vista Kanban del flujo de episodios médicos"
                badge="OPERACIONES"
                badgeColor="purple"
                icon={<Clock className="w-7 h-7 text-white" />}
            />

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar paciente o empresa..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                    />
                </div>

                <select
                    value={filtroEmpresa}
                    onChange={e => setFiltroEmpresa(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                    <option value="all">Todas las empresas</option>
                    {empresas.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                </select>

                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={mostrarCancelados}
                        onChange={e => setMostrarCancelados(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    Cancelados
                </label>

                <div className="ml-auto text-xs text-gray-400 font-bold">
                    {episodiosFiltrados.length} episodios
                </div>
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="ml-3 text-gray-500">Cargando episodios...</span>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
                    {columnas.map(col => {
                        const EtapaIcon = col.icon;
                        return (
                            <div key={col.key} className="flex-shrink-0 w-72">
                                {/* Header de columna */}
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl ${col.bgColor} border ${col.borderColor} border-b-0`}>
                                    <EtapaIcon className={`w-4 h-4 ${col.color}`} />
                                    <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                                    <span className={`ml-auto text-xs font-black ${col.color} bg-white/60 rounded-full w-6 h-6 flex items-center justify-center`}>
                                        {col.episodios.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className={`space-y-2 p-2 min-h-[200px] rounded-b-2xl border ${col.borderColor} border-t-0 bg-gray-50/50`}>
                                    <AnimatePresence>
                                        {col.episodios.map((ep, i) => (
                                            <motion.div
                                                key={ep.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                                onClick={() => navigate(`/pacientes/${ep.paciente_id}/expediente`)}
                                            >
                                                {/* Nombre y prioridad */}
                                                <div className="flex items-start justify-between mb-2">
                                                    <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-emerald-700 transition-colors">
                                                        {ep.paciente_nombre}
                                                    </p>
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORIDAD_COLORS[ep.prioridad]}`}>
                                                        {ep.prioridad === 'normal' ? '' : ep.prioridad}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Building2 className="w-3 h-3" />
                                                        <span className="truncate">{ep.empresa_nombre}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <FileText className="w-3 h-3" />
                                                        <span>{ep.tipo_examen}</span>
                                                        {ep.campania_nombre && (
                                                            <span className="text-[9px] bg-purple-50 text-purple-600 px-1 rounded">{ep.campania_nombre}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(ep.fecha_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                                                        {ep.medico_nombre && <span className="ml-1 text-emerald-600">• {ep.medico_nombre}</span>}
                                                    </div>
                                                </div>

                                                {/* Barra de progreso de estudios */}
                                                {ep.estudios_total > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] text-gray-400">Estudios</span>
                                                            <span className="text-[10px] font-bold text-gray-600">{ep.estudios_completados}/{ep.estudios_total}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(ep.estudios_completados / ep.estudios_total) * 100}%` }}
                                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Nota si existe */}
                                                {ep.notas && (
                                                    <p className="mt-1.5 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{ep.notas}</p>
                                                )}

                                                {/* Botón avanzar (excepto completado y cancelado) */}
                                                {col.key !== 'completado' && col.key !== 'cancelado' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const idx = ETAPAS.findIndex(et => et.key === col.key);
                                                            if (idx < ETAPAS.length - 2) moverEpisodio(ep.id, ETAPAS[idx + 1].key);
                                                        }}
                                                        className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        Avanzar <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {col.episodios.length === 0 && (
                                        <div className="text-center py-8 text-gray-300 text-xs">
                                            Sin episodios
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
