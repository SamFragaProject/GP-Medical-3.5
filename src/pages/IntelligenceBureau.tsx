import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    SearchCode,
    MessageSquare,
    Shield,
    Zap,
    Database,
    Layers,
    Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { IA } from './IA';
import ExtractorMedico from './apps/ExtractorMedico';

export function IntelligenceBureau() {
    const [activeTab, setActiveTab] = useState('cortex');

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Intelligence Bureau"
                subtitle="Núcleo de Inteligencia Artificial y Procesamiento de Datos Médicos"
                icon={Brain}
                badge="NEURAL ENGINE v2.0"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="text-right hidden md:block mr-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1">Cortex Status</p>
                            <div className="flex items-center gap-2 justify-end">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-xl font-black text-white">READY</span>
                            </div>
                        </div>
                    </div>
                }
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100/50 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/50 shadow-inner w-full md:w-fit">
                    <TabsTrigger
                        value="cortex"
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg"
                    >
                        <Zap className="h-4 w-4" />
                        <span>Cortex (Predicciones)</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="extractor"
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg"
                    >
                        <Database className="h-4 w-4" />
                        <span>Extractor Maestro</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="asistente"
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span>Asistente Legal/Médico</span>
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
                        <TabsContent value="cortex" className="mt-0 outline-none">
                            <IA hideHeader />
                        </TabsContent>

                        <TabsContent value="extractor" className="mt-0 outline-none">
                            <ExtractorMedico hideHeader={true} />
                        </TabsContent>

                        <TabsContent value="asistente" className="mt-0 outline-none">
                            <div className="bg-white rounded-[2.5rem] p-10 border shadow-sm min-h-[600px] flex flex-col">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                        <MessageSquare className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Asistente Médico-Legal Pro</h3>
                                        <p className="text-slate-500 font-medium">Motor de consulta avanzada para normatividad STPS y guías médicas industriales.</p>
                                    </div>
                                </div>

                                <div className="flex-1 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                                        <Brain className="w-10 h-10 text-cyan-500 animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-700 mb-2">¿En qué puedo ayudarte hoy?</h4>
                                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                                        Puedo analizar normativas como la NOM-035, NOM-036 o asistirte en la redacción de dictámenes médicos laborales con base en evidencia.
                                    </p>
                                    <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                        Iniciar Nueva Consulta
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
