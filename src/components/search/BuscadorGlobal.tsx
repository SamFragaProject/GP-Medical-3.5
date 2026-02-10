// =====================================================
// COMPONENTE: Buscador Global (Cmd+K) - GPMedical ERP Pro
// Modal con búsqueda multi-entidad y navegación rápida
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, X, Loader2, Command, ArrowRight,
    User, Building2, Calendar, Activity, ClipboardList, FileText
} from 'lucide-react';
import { searchService, type ResultadoBusqueda } from '@/services/searchService';

const TIPO_ICONO: Record<string, React.ElementType> = {
    paciente: User,
    empresa: Building2,
    cita: Calendar,
    episodio: Activity,
    campania: ClipboardList,
    cotizacion: FileText,
};

const TIPO_COLOR: Record<string, string> = {
    paciente: 'text-blue-400',
    empresa: 'text-purple-400',
    cita: 'text-green-400',
    episodio: 'text-amber-400',
    campania: 'text-orange-400',
    cotizacion: 'text-cyan-400',
};

const TIPO_ETIQUETA: Record<string, string> = {
    paciente: 'Paciente',
    empresa: 'Empresa',
    cita: 'Cita',
    episodio: 'Episodio',
    campania: 'Campaña',
    cotizacion: 'Cotización',
};

interface BuscadorGlobalProps {
    abierto: boolean;
    onCerrar: () => void;
}

export default function BuscadorGlobal({ abierto, onCerrar }: BuscadorGlobalProps) {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
    const [loading, setLoading] = useState(false);
    const [seleccion, setSeleccion] = useState(0);

    // Focus al abrir
    useEffect(() => {
        if (abierto) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResultados([]);
            setSeleccion(0);
        }
    }, [abierto]);

    // Atajos globales Cmd+K / Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (abierto) onCerrar();
                // El padre abre el modal
            }
            if (e.key === 'Escape' && abierto) {
                e.preventDefault();
                onCerrar();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [abierto, onCerrar]);

    // Búsqueda con debounce
    useEffect(() => {
        if (query.length < 2) { setResultados([]); return; }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchService.buscar(query);
                setResultados(data);
                setSeleccion(0);
            } catch {
                setResultados([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Navegación con teclado
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSeleccion(s => Math.min(s + 1, resultados.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSeleccion(s => Math.max(s - 1, 0));
        } else if (e.key === 'Enter' && resultados[seleccion]) {
            e.preventDefault();
            navigate(resultados[seleccion].ruta);
            onCerrar();
        }
    }, [resultados, seleccion, navigate, onCerrar]);

    const irA = (resultado: ResultadoBusqueda) => {
        navigate(resultado.ruta);
        onCerrar();
    };

    if (!abierto) return null;

    return (
        <AnimatePresence>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
                onClick={onCerrar}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[10000]"
            >
                <div className="bg-[#0a0a0f]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Barra de búsqueda */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                        <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Buscar pacientes, empresas, citas, episodios..."
                            className="flex-1 bg-transparent text-white text-base placeholder:text-white/30 outline-none"
                        />
                        {loading && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
                        <div className="flex items-center gap-1 text-xs text-white/20">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/40 font-mono">Esc</kbd>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {query.length < 2 ? (
                            <div className="px-5 py-8 text-center">
                                <div className="flex items-center justify-center gap-2 text-white/20 mb-3">
                                    <Command className="w-5 h-5" />
                                    <span className="text-sm">Buscador Global</span>
                                </div>
                                <p className="text-white/30 text-sm">Escribe al menos 2 caracteres para buscar</p>
                                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/15">
                                    <span>👤 Pacientes</span>
                                    <span>🏢 Empresas</span>
                                    <span>📅 Citas</span>
                                    <span>🏥 Episodios</span>
                                    <span>📋 Campañas</span>
                                </div>
                            </div>
                        ) : resultados.length === 0 && !loading ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-white/40 text-sm">Sin resultados para "<b className="text-white/60">{query}</b>"</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {resultados.map((r, i) => {
                                    const Icono = TIPO_ICONO[r.tipo] || Activity;
                                    const color = TIPO_COLOR[r.tipo] || 'text-white/50';
                                    return (
                                        <button
                                            key={`${r.tipo}-${r.id}`}
                                            onClick={() => irA(r)}
                                            onMouseEnter={() => setSeleccion(i)}
                                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all ${i === seleccion ? 'bg-white/10' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${color}`}>
                                                <Icono className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-medium truncate">{r.titulo}</div>
                                                <div className="text-white/40 text-xs truncate">{r.subtitulo}</div>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full bg-white/5 ${color} flex-shrink-0`}>
                                                {TIPO_ETIQUETA[r.tipo]}
                                            </span>
                                            {i === seleccion && <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 text-xs text-white/20">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white/10 rounded font-mono">↑↓</kbd> Navegar</span>
                            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white/10 rounded font-mono">↵</kbd> Abrir</span>
                        </div>
                        <span>{resultados.length} resultado{resultados.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
