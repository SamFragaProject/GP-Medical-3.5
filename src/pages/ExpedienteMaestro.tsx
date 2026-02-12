import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Activity,
    BarChart3,
    History,
    Shield,
    SearchCode,
    UserCheck,
    ArrowLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { Pacientes } from './Pacientes';
import HistorialClinico from './HistorialClinico';
import { useParams, useNavigate } from 'react-router-dom';

export function ExpedienteMaestro() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    // Tab activo: si hay un id de paciente, auto-seleccionar historial
    const [activeTab, setActiveTab] = useState(id ? 'historial' : 'poblacion');

    // Sincronizar tab con la URL
    useEffect(() => {
        if (id) {
            setActiveTab('historial');
        } else {
            // Si no hay ID, forzar a población (evita tab "fantasma")
            if (activeTab === 'historial') {
                setActiveTab('poblacion');
            }
        }
    }, [id]);

    const handlePatientSelect = (patientId: string) => {
        navigate(`/medicina/expediente/${patientId}`);
        // El useEffect se encargará de cambiar el tab
    };

    const handleBackToList = () => {
        navigate('/medicina/expediente');
        setActiveTab('poblacion');
    };

    const handleTabChange = (newTab: string) => {
        // No permitir seleccionar historial sin paciente
        if (newTab === 'historial' && !id) return;

        setActiveTab(newTab);
        if (newTab === 'poblacion') {
            navigate('/medicina/expediente');
        }
    };

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Expediente Maestro Digital"
                subtitle="Centro unificado de gestión de pacientes y vigilancia de la salud"
                icon={Shield}
                badge="NOM-024 COMPLIANT"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="text-right hidden md:block mr-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Estado del Sistema</p>
                            <div className="flex items-center gap-2 justify-end">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xl font-black text-white">SYNC</span>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Indicador de paciente seleccionado */}
            {id && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3"
                >
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">Paciente seleccionado</span>
                    <button
                        onClick={handleBackToList}
                        className="ml-auto flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a la lista
                    </button>
                </motion.div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-slate-100/50 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/50 shadow-inner w-full md:w-fit">
                    <TabsTrigger
                        value="poblacion"
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg"
                    >
                        <Users className="h-4 w-4" />
                        <span>Población / Trabajadores</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="historial"
                        disabled={!id}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg ${!id ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <History className="h-4 w-4" />
                        <span>Historial Clínico</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="analitica"
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg"
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span>Métricas de Salud</span>
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabsContent value="poblacion" className="mt-0 outline-none">
                            <Pacientes onSelectPatient={handlePatientSelect} hideHeader={true} />
                        </TabsContent>

                        <TabsContent value="historial" className="mt-0 outline-none">
                            {id ? <HistorialClinico /> : (
                                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                                    <SearchCode className="h-16 w-16 text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-bold">Seleccione un trabajador de la lista para ver su expediente</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="analitica" className="mt-0 outline-none">
                            <div className="bg-white rounded-[2.5rem] p-10 border shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <BarChart3 className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Panel de Vigilancia Epidemiológica</h3>
                                        <p className="text-slate-500 font-medium">Análisis predictivo y descriptivo del estado de salud de toda la población laboral.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-700">Aptitud Laboral</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 mb-1">—</p>
                                        <p className="text-xs text-slate-400 italic">Se calculará con datos reales</p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-700">Riesgo Cardiovascular</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 mb-1">—</p>
                                        <p className="text-xs text-slate-400 italic">Se calculará con datos reales</p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-700">Cumplimiento NOM</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 mb-1">—</p>
                                        <p className="text-xs text-slate-400 italic">Se calculará con datos reales</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xl font-black mb-2">Generar Reporte Ejecutivo de Salud</h4>
                                        <p className="text-emerald-200 text-sm max-w-lg">Obtenga un análisis detallado en PDF con gráficas de tendencia y recomendaciones automáticas para el departamento de RH y Dirección.</p>
                                    </div>
                                    <button className="btn-premium-primary px-8 py-4 rounded-2xl text-sm uppercase tracking-widest">
                                        DESCARGAR PDF
                                    </button>
                                </div>
                            </div>
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
