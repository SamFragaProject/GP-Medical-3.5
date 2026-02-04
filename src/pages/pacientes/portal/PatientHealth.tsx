import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Pill, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { pacientesService, examenesService, Examen } from '@/services/dataService';
import { prescripcionService, RecetaMedica } from '@/services/prescripcionService';
import toast from 'react-hot-toast';

export default function PatientHealth() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [recetas, setRecetas] = useState<RecetaMedica[]>([]);
    const [examenes, setExamenes] = useState<Examen[]>([]);
    const [pacienteId, setPacienteId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;

            try {
                // 1. Obtener ID del paciente
                const paciente = await pacientesService.getByEmail(user.email);

                if (!paciente) {
                    setLoading(false);
                    return;
                }
                setPacienteId(paciente.id);

                // 2. Cargar Recetas y Exámenes en paralelo
                const [recetasData, examenesData] = await Promise.all([
                    prescripcionService.getRecetasPaciente(paciente.id),
                    examenesService.getByPaciente(paciente.id)
                ]);

                setRecetas(recetasData || []);
                setExamenes(examenesData || []);

            } catch (error) {
                console.error('Error fetching health data:', error);
                toast.error('Error al actualizar tu expediente');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                <p>Cargando expediente...</p>
            </div>
        );
    }

    // Filtrar recetas activas (para demo, las últimas 2)
    const recetasActivas = recetas.slice(0, 2);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-black text-slate-900 mb-6">Mi Salud</h1>

            <Tabs defaultValue="recetas" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-2xl w-full">
                    <TabsTrigger value="recetas" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
                        Recetas
                    </TabsTrigger>
                    <TabsTrigger value="estudios" className="rounded-xl flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">
                        Estudios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="recetas" className="mt-6 space-y-4">
                    {/* Lista de Recetas */}
                    {recetas.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">No tienes recetas registradas</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recetas.map(receta => (
                                <div key={receta.id} className="bg-white border border-slate-100 p-0 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folio: {receta.id.slice(0, 8)}</p>
                                            <p className="text-xs text-slate-500">{new Date(receta.fecha_emision).toLocaleDateString('es-MX')}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-50">
                                            <Download className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {receta.detalles?.map(detalle => (
                                            <div key={detalle.id} className="flex items-start gap-3">
                                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 mt-1">
                                                    <Pill className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{detalle.nombre_medicamento}</p>
                                                    <p className="text-sm text-slate-500">{detalle.dosis} • {detalle.frecuencia}</p>
                                                    <p className="text-xs text-slate-400 italic">Durante {detalle.duracion}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!receta.detalles || receta.detalles.length === 0) && (
                                            <p className="text-sm text-slate-400 italic">Sin medicamentos listados</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="estudios" className="mt-6 space-y-4">
                    {examenes.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">No hay resultados de estudios</p>
                        </div>
                    ) : (
                        examenes.map(examen => (
                            <div key={examen.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-10 h-10 text-emerald-500 p-2 bg-emerald-50 rounded-xl" />
                                    <div>
                                        <p className="font-bold text-slate-800 capitalize">{examen.tipo}</p>
                                        <p className="text-xs text-slate-500">{new Date(examen.fecha).toLocaleDateString('es-MX')}</p>
                                        <Badge className={`mt-1 text-[10px] border-0 ${examen.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {examen.estado === 'completada' ? 'Disponible' : 'Pendiente'}
                                        </Badge>
                                    </div>
                                </div>
                                {examen.estado === 'completada' && (
                                    <Button variant="ghost" size="icon" className="text-indigo-600">
                                        <Download className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
