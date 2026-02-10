// =====================================================
// COMPONENTE: Gestión de Lotes y Caducidades
// Control de inventario médico crítico
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Calendar, AlertTriangle, CheckCircle2,
    Trash2, Filter, Search, Loader2, ArrowRight,
    TrendingUp, Clock, ShieldAlert, Database
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lote {
    id: string;
    producto_id: string;
    producto_nombre: string;
    numero_lote: string;
    fecha_caducidad: string;
    cantidad_inicial: number;
    cantidad_actual: number;
    ubicacion: string;
    estado: 'nuevo' | 'parcial' | 'agotado' | 'caducado';
    created_at: string;
}

export default function LotesInventario() {
    const [loading, setLoading] = useState(true);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'todos' | 'proximos' | 'caducados' | 'agotados'>('todos');

    useEffect(() => {
        cargarLotes();
    }, []);

    const cargarLotes = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('lotes_inventario')
                .select(`
          *,
          producto:inventario(nombre)
        `)
                .order('fecha_caducidad', { ascending: true });

            const mapped = (data || []).map(l => ({
                ...l,
                producto_nombre: (l as any).producto?.nombre || 'Producto Desconocido'
            }));
            setLotes(mapped);
        } catch (err) {
            console.error('Error cargando lotes:', err);
        } finally {
            setLoading(false);
        }
    };

    const lotesFiltrados = lotes.filter(l => {
        const matchesSearch = l.producto_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.numero_lote.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'todos') return matchesSearch;

        const hoy = new Date();
        const cad = new Date(l.fecha_caducidad);
        const diffDias = Math.ceil((cad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        if (filter === 'proximos') return matchesSearch && diffDias > 0 && diffDias <= 90;
        if (filter === 'caducados') return matchesSearch && diffDias <= 0;
        if (filter === 'agotados') return matchesSearch && l.cantidad_actual <= 0;

        return matchesSearch;
    });

    const getUrgencyLevel = (fecha: string, cantidad: number) => {
        const hoy = new Date();
        const cad = new Date(fecha);
        const diffDias = Math.ceil((cad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDias <= 0) return { label: 'CADUCADO', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: ShieldAlert };
        if (diffDias <= 30) return { label: 'URGENTE', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: AlertTriangle };
        if (diffDias <= 90) return { label: 'PRÓXIMO', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock };
        if (cantidad <= 0) return { label: 'AGOTADO', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: Trash2 };
        return { label: 'VIGENTE', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 };
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Gestión de <span className="text-emerald-500">Lotes</span></h2>
                    <p className="text-white/40 text-xs tracking-widest font-bold uppercase">Control de caducidades y trazabilidad</p>
                </div>

                <div className="flex items-center gap-2">
                    {['todos', 'proximos', 'caducados', 'agotados'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${filter === f ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {f === 'proximos' ? 'Próximos a Caducar' : f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Buscar por lote o producto..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:border-emerald-500/50 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {lotesFiltrados.map((l) => {
                        const urgency = getUrgencyLevel(l.fecha_caducidad, l.cantidad_actual);
                        const UrgencyIcon = urgency.icon;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={l.id}
                                className="bg-[#0a0f1a] border border-white/10 p-5 rounded-3xl hover:border-white/20 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-xl ${urgency.color}`}>
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black tracking-widest flex items-center gap-1 ${urgency.color}`}>
                                        <UrgencyIcon className="w-3 h-3" />
                                        {urgency.label}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-white font-black italic tracking-tight line-clamp-1">{l.producto_nombre}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Database className="w-3 h-3 text-white/20" />
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">LOTE: {l.numero_lote}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Caducidad</p>
                                            <p className={`text-xs font-black ${urgency.label === 'CADUCADO' ? 'text-rose-400' : 'text-white/80'}`}>
                                                {new Date(l.fecha_caducidad).toLocaleDateString('es-MX')}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Stock Actual</p>
                                            <p className="text-xs font-black text-white">
                                                {l.cantidad_actual} <span className="text-[8px] text-white/30">unid.</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <span className="text-[9px] text-white/20 font-bold uppercase">{l.ubicacion}</span>
                                        <button className="text-white/40 hover:text-white transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
