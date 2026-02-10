// =====================================================
// COMPONENTE: Repositorio de Evidencias STPS
// GPMedical ERP Pro - Compliance Legal
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, FileText, Download, CheckCircle2,
    XCircle, Filter, Search, Loader2, Calendar,
    User, Building2, Upload
} from 'lucide-react';
import { evidenciasService, type EvidenciaSTPS } from '@/services/evidenciasService';
import { Badge } from '@/components/ui/badge';

export default function EvidenciasSTPS() {
    const [loading, setLoading] = useState(true);
    const [evidencias, setEvidencias] = useState<EvidenciaSTPS[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        cargarEvidencias();
    }, []);

    const cargarEvidencias = async () => {
        setLoading(true);
        try {
            // Por defecto lista todo (comportamiento de admin/higienista)
            const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser();
            const empId = user?.user_metadata?.empresa_id;

            const data = empId
                ? await evidenciasService.listarPorEmpresa(empId)
                : await evidenciasService.listarPorEmpresa('all' as any); // Mock for superadmin

            setEvidencias(data);
        } catch (err) {
            console.error('Error cargando evidencias:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = evidencias.filter(e => {
        const matchesSearch = (e as any).paciente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            e.nombre_archivo.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || e.categoria === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Evidencias <span className="text-indigo-500">STPS</span></h1>
                </div>
                <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Repositorio centralizado de cumplimiento legal tras auditoría</p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Buscar por trabajador o archivo..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'dictamen', 'nom011', 'nom036', 'st7_st9'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-white/40 border-white/10'
                                }`}
                        >
                            {f === 'all' ? 'Ver Todo' : f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((e) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={e.id}
                        className="bg-[#0a0f1a] border border-white/10 rounded-3xl p-6 hover:border-indigo-500/30 transition-all shadow-xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                                <FileText className="w-6 h-6" />
                            </div>
                            <Badge variant={e.validado ? 'success' : 'warning'}>
                                {e.validado ? 'Validado' : 'Pendiente Validation'}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-white font-black tracking-tight text-lg line-clamp-1">{e.nombre_archivo}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="w-3 h-3 text-white/20" />
                                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
                                        {(e as any).paciente?.nombre} {(e as any).paciente?.apellido_paterno}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] text-white/30 font-black uppercase tracking-widest">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {new Date(e.fecha_carga).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> {e.categoria}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex gap-2">
                                <a
                                    href={e.url_archivo}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Descargar PDF
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
