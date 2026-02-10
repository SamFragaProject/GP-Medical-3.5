// =====================================================
// COMPONENTE: Gestión de Órdenes de Servicio
// GPMedical ERP Pro - Operación & Auditoría
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Search, Filter, MoreVertical,
    Calendar, Building2, CheckCircle2, Clock,
    AlertCircle, Download, ArrowRight, Loader2,
    ChevronRight, Tag, DollarSign
} from 'lucide-react';
import { ordenServicioService, type OrdenServicio, type EstadoOrden } from '@/services/ordenServicioService';

export default function OrdenesServicio() {
    const [loading, setLoading] = useState(true);
    const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
    const [filterStatus, setFilterStatus] = useState<EstadoOrden | 'todas'>('todas');
    const [searchQuery, setSearchQuery] = useState('');
    const [resumen, setResumen] = useState<any>(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [lista, res] = await Promise.all([
                ordenServicioService.listar(),
                ordenServicioService.resumen()
            ]);
            setOrdenes(lista);
            setResumen(res);
        } catch (err) {
            console.error('Error cargando órdenes:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrdenes = ordenes.filter(o =>
        (filterStatus === 'todas' || o.estado === filterStatus) &&
        (o.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o as any).empresa?.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusColor = (e: EstadoOrden) => {
        switch (e) {
            case 'completada': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'en_proceso': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'aceptada': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'borrador': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            case 'cancelada': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-white/40 animate-pulse uppercase tracking-[0.2em] font-black text-[10px]">Cargando Sistema de Operaciones...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                        Órdenes de <span className="text-emerald-500">Servicio</span>
                    </h1>
                    <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">Control operativo y administrativo B2B</p>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-white text-black font-black italic rounded-2xl flex items-center gap-2 shadow-xl shadow-white/10 hover:bg-emerald-400 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        NUEVA ORDEN
                    </motion.button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Órdenes', val: resumen?.total, icon: FileText, color: 'text-white' },
                    { label: 'En Proceso', val: resumen?.en_proceso, icon: Clock, color: 'text-blue-400' },
                    { label: 'Completadas', val: resumen?.completadas, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Monto Proyectado', val: `$${((resumen?.monto_total || 0) / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-amber-400' }
                ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-md">
                        <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className={`text-xl font-black italic tracking-tighter ${s.color}`}>{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#0a0f1a]/80 border border-white/5 p-4 rounded-3xl backdrop-blur-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Buscar por folio, cliente o título..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:border-emerald-500/50 transition-colors outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-white/30 mr-2 ml-4" />
                    {[
                        { id: 'todas', label: 'Todas' },
                        { id: 'borrador', label: 'Borrador' },
                        { id: 'aceptada', label: 'Aceptadas' },
                        { id: 'en_proceso', label: 'En Proceso' },
                        { id: 'completada', label: 'Cerradas' }
                    ].map(s => (
                        <button
                            key={s.id}
                            onClick={() => setFilterStatus(s.id as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterStatus === s.id
                                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrdenes.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <FileText className="w-16 h-16 text-white/10 mb-4" />
                        <p className="text-white/30 font-bold uppercase tracking-[0.2em]">No se encontraron órdenes</p>
                    </div>
                ) : (
                    filteredOrdenes.map((o) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={o.id}
                            className="group bg-[#0a0f1a] border border-white/10 overflow-hidden relative rounded-3xl hover:border-emerald-500/40 transition-all duration-300 shadow-xl shadow-black/20"
                        >
                            <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                {/* Visual Sidebar */}
                                <div className={`w-2 self-stretch rounded-full ${o.estado === 'completada' ? 'bg-emerald-500' : 'bg-white/10'}`} />

                                {/* Folio & Info */}
                                <div className="flex-shrink-0 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black text-white/20 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Servicio</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${getStatusColor(o.estado)}`}>
                                            {o.estado.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none mb-2">{o.folio}</h3>
                                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> {new Date(o.fecha_servicio).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                                    </p>
                                </div>

                                {/* Client & Description */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-sm font-black italic uppercase tracking-tight">{(o as any).empresa?.nombre || 'Empresa No Registrada'}</span>
                                    </div>
                                    <p className="text-white font-medium text-lg tracking-tight line-clamp-1">{o.titulo}</p>
                                    <p className="text-white/40 text-sm line-clamp-1 italic">{o.descripcion}</p>
                                </div>

                                {/* Metrics */}
                                <div className="flex items-center gap-8 lg:px-8 border-l border-white/10">
                                    <div>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Volumen</p>
                                        <p className="text-xl font-black text-white flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-500/50" />
                                            {o.total_pacientes} <span className="text-[10px] text-white/20 uppercase font-bold">Pac.</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Monto Total</p>
                                        <p className="text-xl font-black text-emerald-400 italic">
                                            ${o.total_servicios.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex-shrink-0">
                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all group/btn"
                                    >
                                        <ChevronRight className="w-6 h-6 transition-transform group-hover/btn:scale-110" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
