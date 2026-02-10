// =====================================================
// COMPONENTE: Gestión de Contactos de Empresa
// Directorio B2B para RH, HSE y Compras
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Building2, Shield,
    Plus, Search, MoreVertical, ExternalLink,
    MessageSquare, Users, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Contacto {
    id: string;
    empresa_id: string;
    nombre: string;
    puesto: string;
    departamento: 'RH' | 'HSE' | 'Compras' | 'Médico' | 'Otro';
    email: string;
    telefono: string;
    notas?: string;
    is_principal: boolean;
    created_at: string;
}

export default function ContactosEmpresa({ empresaId }: { empresaId?: string }) {
    const [loading, setLoading] = useState(true);
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        cargarContactos();
    }, [empresaId]);

    const cargarContactos = async () => {
        setLoading(true);
        try {
            let query = supabase.from('contactos_empresa').select('*').order('is_principal', { ascending: false });
            if (empresaId) query = query.eq('empresa_id', empresaId);

            const { data } = await query;
            setContactos(data || []);
        } catch (err) {
            console.error('Error cargando contactos:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = contactos.filter(c =>
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.departamento.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-black italic tracking-tight uppercase">Directorio de Contactos</h3>
                        <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Gestores clave del cliente B2B</p>
                    </div>
                </div>

                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Agregar
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Buscar gestor..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((c) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={c.id}
                        className={`bg-white/5 border p-4 rounded-2xl relative group ${c.is_principal ? 'border-emerald-500/30' : 'border-white/10'}`}
                    >
                        {c.is_principal && (
                            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Principal
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                <User className="w-6 h-6 text-white/20" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold truncate tracking-tight mb-1">{c.nombre}</h4>
                                <div className="flex items-center gap-2 text-[10px] mb-3">
                                    <span className="bg-white/5 text-white/40 px-2 py-0.5 rounded-md font-black uppercase">{c.departamento}</span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-white/40 italic">{c.puesto}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-white/60 hover:text-emerald-400 transition-colors cursor-pointer">
                                        <Mail className="w-3.5 h-3.5" />
                                        {c.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-white/60">
                                        <Phone className="w-3.5 h-3.5" />
                                        {c.telefono}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button className="text-white/20 hover:text-white transition-colors p-2">
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
