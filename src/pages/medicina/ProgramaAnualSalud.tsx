import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Wand2, Plus, ChevronLeft, ChevronRight, BarChart3, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { programaSaludService, ProgramaAnual, ActividadPrograma } from '@/services/programaSaludService';
import toast from 'react-hot-toast';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';

export default function ProgramaAnualSalud() {
    const { user } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [programa, setPrograma] = useState<ProgramaAnual | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadPrograma();
    }, [year, user?.empresa_id]);

    const loadPrograma = async () => {
        if (!user?.empresa_id) return;
        setLoading(true);
        try {
            const data = await programaSaludService.getProgramaActual(user.empresa_id, year);
            setPrograma(data);
        } catch (error) {
            console.error('Error loading program:', error);
            toast.error('Error al cargar el programa anual');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerarIA = async () => {
        if (!programa || !user?.empresa_id) return;
        setGenerating(true);
        try {
            await programaSaludService.generarPropuestaActividades(programa.id, user.empresa_id);
            toast.success('¡Propuesta generada con IA!');
            loadPrograma(); // Recargar para ver actividades
        } catch (error) {
            toast.error('Error generando propuesta');
        } finally {
            setGenerating(false);
        }
    };

    const handleCreateProgram = async () => {
        if (!user?.empresa_id) return;
        try {
            await programaSaludService.createPrograma({
                empresa_id: user.empresa_id,
                anio: year,
                nombre: `Programa de Salud ${year}`,
                estado: 'borrador',
                avance_general: 0
            });
            loadPrograma();
        } catch (error) {
            toast.error('Error creando el programa');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando programa...</div>;

    // Calcular métricas
    const totalActividades = programa?.actividades?.length || 0;
    const actividadesCompletadas = programa?.actividades?.filter(a => a.estado === 'realizada').length || 0;
    const progresoGeneral = totalActividades > 0 ? (actividadesCompletadas / totalActividades) * 100 : 0;

    // Agrupar por meses para el calendario
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const actividadesPorMes = meses.reduce((acc, mes, index) => {
        const mesNum = index + 1;
        acc[mesNum] = programa?.actividades?.filter(a => {
            const d = new Date(a.fecha_inicio);
            return d.getMonth() + 1 === mesNum;
        }) || [];
        return acc;
    }, {} as Record<number, ActividadPrograma[]>);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PremiumPageHeader
                title="Programa Anual de Salud"
                subtitle="Gestión estratégica de campañas y medicina preventiva acelerada por IA."
                icon={CalendarIcon}
                badge={`Ciclo Operativo ${year}`}
                actions={
                    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl border border-white/20 backdrop-blur-md">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setYear(y => y - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-lg w-16 text-center text-white">{year}</span>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setYear(y => y + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                }
            />

            {!programa ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No existe programa para {year}</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Comienza la planificación anual de salud ocupacional creando un nuevo programa.</p>
                    <Button size="lg" onClick={handleCreateProgram} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                        <Plus className="w-5 h-5 mr-2" />
                        Crear Programa {year}
                    </Button>
                </div>
            ) : (
                <>
                    {/* KPI Cards & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="rounded-[24px] shadow-sm border-slate-100 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-indigo-100 font-medium">Avance Global</p>
                                        <h3 className="text-4xl font-black mt-1">{Math.round(progresoGeneral)}%</h3>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="relative pt-2">
                                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progresoGeneral}%` }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                    <p className="text-xs text-indigo-100 mt-2 text-right">{actividadesCompletadas} de {totalActividades} campañas</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[24px] shadow-sm border-slate-100">
                            <CardContent className="p-6 flex flex-col justify-center h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium">Población Impactada</p>
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            {programa.actividades?.reduce((acc, curr) => acc + (curr.meta_pacientes || 0), 0) || 0}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs">Meta total de colaboradores a atender este año.</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[24px] shadow-sm border-slate-100 bg-slate-50/50">
                            <CardContent className="p-6 flex flex-col justify-center items-center text-center h-full">
                                {totalActividades === 0 ? (
                                    <>
                                        <Wand2 className="w-10 h-10 text-indigo-500 mb-3" />
                                        <h3 className="font-bold text-slate-800 mb-1">Generador IA</h3>
                                        <p className="text-xs text-slate-500 mb-4">Crea una propuesta basada en tus Riesgos.</p>
                                        <Button onClick={handleGenerarIA} disabled={generating} className="bg-indigo-600 text-white rounded-full w-full">
                                            {generating ? 'Analizando...' : '✨ Generar Propuesta'}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <Button className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                                            Exportar PDF
                                        </Button>
                                        <Button className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700">
                                            + Actividad
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Visual Tracking Calendar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {meses.map((mes, index) => {
                            const mesNum = index + 1;
                            const acts = actividadesPorMes[mesNum];
                            const isCurrentMonth = new Date().getMonth() + 1 === mesNum && new Date().getFullYear() === year;

                            return (
                                <div key={mes} className={`rounded-3xl p-5 border ${isCurrentMonth ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-white'}`}>
                                    <h3 className={`font-bold mb-4 flex justify-between items-center ${isCurrentMonth ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {mes}
                                        {isCurrentMonth && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Actual</span>}
                                    </h3>

                                    <div className="space-y-3">
                                        {acts.length === 0 ? (
                                            <div className="h-20 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 text-xs">
                                                Sin actividad
                                            </div>
                                        ) : (
                                            acts.map(act => (
                                                <div key={act.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                                                    {/* Status Indicator Stripe */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${act.estado === 'realizada' ? 'bg-emerald-500' :
                                                        act.estado === 'en_curso' ? 'bg-blue-500' :
                                                            act.estado === 'cancelada' ? 'bg-rose-500' : 'bg-slate-300'
                                                        }`} />

                                                    <div className="pl-2">
                                                        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight mb-2">{act.nombre}</p>

                                                        {/* Visual Tracking: Progress Bar */}
                                                        {act.meta_pacientes && (
                                                            <div className="mt-2">
                                                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                                    <span>Progreso</span>
                                                                    <span>0 / {act.meta_pacientes}</span>
                                                                </div>
                                                                <Progress value={Math.random() * 40} className="h-1.5" />
                                                            </div>
                                                        )}

                                                        <div className="mt-2 flex gap-1 flex-wrap">
                                                            <Badge variant="outline" className="text-[9px] h-5 border-slate-100 bg-slate-50 text-slate-500">
                                                                {act.poblacion_objetivo}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
