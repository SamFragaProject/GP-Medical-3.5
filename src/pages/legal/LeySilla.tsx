// Página: Ley Silla — Cumplimiento de la Ley Federal del Trabajo (Art. 132 XXIX)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Armchair, Building2, MapPin, CheckCircle2, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AreaLeySilla {
    id: string;
    nombre_area: string;
    tipo_area: string;
    sillas_disponibles: number;
    trabajadores_area: number;
    cumple: boolean;
    observaciones: string;
    fecha_evaluacion: string;
}

export default function LeySillaPage() {
    const [areas, setAreas] = useState<AreaLeySilla[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarAreas();
    }, []);

    const cargarAreas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ley_silla_areas')
            .select('*')
            .order('nombre_area');

        if (!error && data) setAreas(data);
        setLoading(false);
    };

    const totalAreas = areas.length;
    const areasCumplen = areas.filter(a => a.cumple).length;
    const porcentajeCumplimiento = totalAreas > 0 ? Math.round((areasCumplen / totalAreas) * 100) : 0;

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Ley Silla"
                subtitle="Control de cumplimiento — Artículo 132 Fracción XXIX LFT"
                icon={Armchair}
                badge="STPS 2025"
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-4">
                {[
                    { label: 'Áreas Evaluadas', value: totalAreas, icon: MapPin, color: 'blue' },
                    { label: 'Cumplen', value: areasCumplen, icon: CheckCircle2, color: 'emerald' },
                    { label: 'No Cumplen', value: totalAreas - areasCumplen, icon: XCircle, color: 'red' },
                    { label: 'Cumplimiento', value: `${porcentajeCumplimiento}%`, icon: Armchair, color: 'amber' },
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

            {/* Lista de áreas */}
            <div className="px-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Áreas de Trabajo</h3>
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Nueva Área
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Cargando áreas...</div>
                    ) : areas.length === 0 ? (
                        <div className="text-center py-12">
                            <Armchair className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No hay áreas registradas</p>
                            <p className="text-gray-400 text-sm">Registra las áreas de trabajo para evaluar el cumplimiento de la Ley Silla</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {areas.map(area => (
                                <div key={area.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${area.cumple ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                        {area.cumple ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{area.nombre_area}</p>
                                        <p className="text-xs text-gray-500">{area.tipo_area} · {area.sillas_disponibles} sillas / {area.trabajadores_area} trabajadores</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${area.cumple ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {area.cumple ? 'CUMPLE' : 'NO CUMPLE'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
