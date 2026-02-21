// Página: NOM-035 — Factores de Riesgo Psicosocial
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, Users, ClipboardCheck, BarChart3, AlertTriangle,
    CheckCircle2, TrendingUp, Calendar, Plus
} from 'lucide-react';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CampanaNOM035 {
    id: string;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    total_trabajadores: number;
    respuestas_recibidas: number;
    nivel_riesgo_promedio: string;
}

const NIVELES_RIESGO = {
    nulo: { label: 'Nulo', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    bajo: { label: 'Bajo', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700' },
    medio: { label: 'Medio', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700' },
    alto: { label: 'Alto', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700' },
    muy_alto: { label: 'Muy Alto', color: 'red', bg: 'bg-red-50', text: 'text-red-700' },
};

export default function NOM035Page() {
    const [campanas, setCampanas] = useState<CampanaNOM035[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCampanas();
    }, []);

    const cargarCampanas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('nom035_campanas')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setCampanas(data);
        setLoading(false);
    };

    const totalTrabajadores = campanas.reduce((sum, c) => sum + (c.total_trabajadores || 0), 0);
    const totalRespuestas = campanas.reduce((sum, c) => sum + (c.respuestas_recibidas || 0), 0);
    const campanasActivas = campanas.filter(c => c.estado === 'activa').length;

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="NOM-035-STPS-2018"
                subtitle="Factores de riesgo psicosocial — Identificación y prevención"
                icon={Brain}
                badge="OBLIGATORIO"
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-4">
                {[
                    { label: 'Campañas', value: campanas.length, icon: ClipboardCheck, color: 'purple' },
                    { label: 'Activas', value: campanasActivas, icon: Calendar, color: 'emerald' },
                    { label: 'Trabajadores', value: totalTrabajadores, icon: Users, color: 'blue' },
                    { label: 'Respuestas', value: totalRespuestas, icon: BarChart3, color: 'amber' },
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 flex items-center justify-center mb-3`}>
                            <kpi.icon className={`w-5 h-5 text-${kpi.color}-600`} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Campañas */}
            <div className="px-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Campañas de Evaluación</h3>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Nueva Campaña
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Cargando campañas...</div>
                    ) : campanas.length === 0 ? (
                        <div className="text-center py-12">
                            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No hay campañas registradas</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Crea tu primera campaña NOM-035 para evaluar factores psicosociales
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {campanas.map(campana => {
                                const progreso = campana.total_trabajadores > 0
                                    ? Math.round((campana.respuestas_recibidas / campana.total_trabajadores) * 100)
                                    : 0;
                                const nivelInfo = NIVELES_RIESGO[(campana.nivel_riesgo_promedio as keyof typeof NIVELES_RIESGO)] || NIVELES_RIESGO.nulo;

                                return (
                                    <div key={campana.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <Brain className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{campana.nombre}</p>
                                                <p className="text-xs text-gray-500">
                                                    {campana.fecha_inicio} → {campana.fecha_fin} · {campana.respuestas_recibidas}/{campana.total_trabajadores} respuestas
                                                </p>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${nivelInfo.bg} ${nivelInfo.text}`}>
                                                Riesgo: {nivelInfo.label}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progreso}%` }}
                                                className="h-full bg-purple-500 rounded-full"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 text-right">{progreso}% completado</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
