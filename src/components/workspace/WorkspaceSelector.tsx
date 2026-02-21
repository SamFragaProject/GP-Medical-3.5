// =====================================================
// COMPONENTE: Selector de Workspace (Multi-Sede/Empresa)
// GPMedical ERP Pro — Cambio de contexto empresa/sede
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, ChevronDown, Check, Search, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Sede {
    id: string;
    nombre: string;
    ciudad?: string;
    estado?: string;
    activa: boolean;
}

interface Empresa {
    id: string;
    nombre: string;
    rfc?: string;
    sedes: Sede[];
}

interface WorkspaceSelectorProps {
    empresaActual?: string;
    sedeActual?: string;
    onCambioWorkspace: (empresaId: string, sedeId?: string) => void;
    compact?: boolean;
}

export default function WorkspaceSelector({
    empresaActual,
    sedeActual,
    onCambioWorkspace,
    compact = false,
}: WorkspaceSelectorProps) {
    const [open, setOpen] = useState(false);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
    const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede | null>(null);
    const [loading, setLoading] = useState(true);
    const ref = useRef<HTMLDivElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Cargar empresas y sedes
    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            const { data: empresasData } = await supabase
                .from('empresas_clientes')
                .select('id, nombre, rfc')
                .eq('activa', true)
                .order('nombre');

            if (empresasData) {
                const conSedes: Empresa[] = [];
                for (const emp of empresasData) {
                    const { data: sedesData } = await supabase
                        .from('sedes')
                        .select('id, nombre, ciudad, estado, activa')
                        .eq('empresa_id', emp.id)
                        .eq('activa', true)
                        .order('nombre');

                    conSedes.push({
                        ...emp,
                        sedes: sedesData || [{ id: 'principal', nombre: 'Sede Principal', activa: true }],
                    });
                }
                setEmpresas(conSedes);

                // Seleccionar actual
                if (empresaActual) {
                    const emp = conSedes.find(e => e.id === empresaActual);
                    if (emp) {
                        setEmpresaSeleccionada(emp);
                        if (sedeActual) setSedeSeleccionada(emp.sedes.find(s => s.id === sedeActual) || null);
                    }
                }
            }
            setLoading(false);
        };
        cargar();
    }, []);

    const seleccionar = (emp: Empresa, sede?: Sede) => {
        setEmpresaSeleccionada(emp);
        setSedeSeleccionada(sede || null);
        onCambioWorkspace(emp.id, sede?.id);
        setOpen(false);
    };

    const empresasFiltradas = busqueda
        ? empresas.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.rfc?.toLowerCase().includes(busqueda.toLowerCase()))
        : empresas;

    return (
        <div ref={ref} className="relative">
            {/* Botón trigger */}
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all ${compact ? 'px-2 py-1.5' : 'px-3 py-2'
                    }`}
            >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                </div>
                {!compact && (
                    <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate max-w-[120px]">
                            {empresaSeleccionada?.nombre || 'Todas las empresas'}
                        </p>
                        {sedeSeleccionada && (
                            <p className="text-[10px] text-gray-400 truncate max-w-[120px] flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {sedeSeleccionada.nombre}
                            </p>
                        )}
                    </div>
                )}
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.97 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        {/* Buscador */}
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                                <input
                                    type="text"
                                    placeholder="Buscar empresa..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Opción: Todas */}
                        <button
                            onClick={() => { setEmpresaSeleccionada(null); setSedeSeleccionada(null); onCambioWorkspace('', ''); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${!empresaSeleccionada ? 'bg-emerald-50' : ''}`}
                        >
                            <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">Todas las empresas</span>
                            {!empresaSeleccionada && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
                        </button>

                        {/* Lista de empresas */}
                        <div className="max-h-64 overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-4 text-xs text-gray-400">Cargando...</div>
                            ) : empresasFiltradas.length === 0 ? (
                                <div className="text-center py-4 text-xs text-gray-400">Sin resultados</div>
                            ) : (
                                empresasFiltradas.map(emp => (
                                    <div key={emp.id}>
                                        <button
                                            onClick={() => seleccionar(emp)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${empresaSeleccionada?.id === emp.id ? 'bg-emerald-50' : ''
                                                }`}
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                {emp.nombre.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 truncate">{emp.nombre}</p>
                                                {emp.rfc && <p className="text-[10px] text-gray-400 font-mono">{emp.rfc}</p>}
                                            </div>
                                            {empresaSeleccionada?.id === emp.id && !sedeSeleccionada && (
                                                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            )}
                                        </button>

                                        {/* Sedes de la empresa */}
                                        {emp.sedes.length > 1 && empresaSeleccionada?.id === emp.id && (
                                            <div className="pl-12 pb-1">
                                                {emp.sedes.map(sede => (
                                                    <button
                                                        key={sede.id}
                                                        onClick={() => seleccionar(emp, sede)}
                                                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-lg transition-colors ${sedeSeleccionada?.id === sede.id ? 'bg-emerald-100' : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <MapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[11px] text-gray-600">{sede.nombre}</span>
                                                        {sede.ciudad && <span className="text-[9px] text-gray-300">{sede.ciudad}</span>}
                                                        {sedeSeleccionada?.id === sede.id && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
