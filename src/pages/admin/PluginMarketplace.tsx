import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Puzzle, Zap, Brain, Shield, CheckCircle, Plus,
    Settings, CreditCard, Layers, ArrowRight, Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

// Interfaces simuladas (luego vendrán de DB)
interface PluginDef {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: any;
    category: 'ai' | 'hr' | 'clinical' | 'admin';
    price: string;
    active: boolean;
    features: string[];
}

const AVAILABLE_PLUGINS: PluginDef[] = [
    {
        id: '1', key: 'ai_xray_vision', name: 'Visión IA Radiológica',
        description: 'Interpretación automática de Rayos-X utilizando modelos de visión Computerizada.',
        icon: Zap, category: 'ai', price: '$29/mes', active: true,
        features: ['Detección de fracturas', 'Pre-informe automático', 'Soporte DICOM']
    },
    {
        id: '2', key: 'hr_psychometrics', name: 'Suite Psicométrica',
        description: 'Batería de pruebas laborales y psicológicas personalizables para empleados.',
        icon: Brain, category: 'hr', price: 'Gratis', active: false,
        features: ['Test de Estrés (NOM-035)', 'Evaluación de Liderazgo', 'Resultados en PDF']
    },
    {
        id: '3', key: 'telemed_secure', name: 'Telemedicina Pro',
        description: 'Consultas remotas encriptadas con receta digital firmada.',
        icon: Shield, category: 'clinical', price: '$49/mes', active: false,
        features: ['Video HD', 'Chat seguro', 'Receta digital SAT']
    }
];

export const PluginMarketplace = () => {
    const [plugins, setPlugins] = useState(AVAILABLE_PLUGINS);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'ai', label: 'Inteligencia Artificial' },
        { id: 'clinical', label: 'Clínicos' },
        { id: 'hr', label: 'Recursos Humanos' }
    ];

    const handleTogglePlugin = (pluginId: string) => {
        setPlugins(prev => prev.map(p => {
            if (p.id === pluginId) {
                const newState = !p.active;
                toast.success(`${p.name} ${newState ? 'activado' : 'desactivado'} correctamente.`);
                return { ...p, active: newState };
            }
            return p;
        }));
    };

    const filteredPlugins = selectedCategory === 'all'
        ? plugins
        : plugins.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                <Puzzle size={28} />
                            </div>
                            Marketplace de Extensiones
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Personaliza tu GPMedical activando módulos especializados.
                        </p>
                    </div>

                    <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat.id
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Plugins */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredPlugins.map((plugin) => (
                            <motion.div
                                key={plugin.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`relative group rounded-[2rem] p-1 transition-all duration-300 ${plugin.active
                                        ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20'
                                        : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                                    }`}
                            >
                                <div className="bg-white h-full w-full rounded-[1.8rem] p-6 flex flex-col relative overflow-hidden">

                                    {/* Status Indicator */}
                                    <div className="absolute top-6 right-6">
                                        <Badge variant={plugin.active ? 'default' : 'secondary'} className={plugin.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}>
                                            {plugin.active ? 'ACTIVO' : 'INACTIVO'}
                                        </Badge>
                                    </div>

                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${plugin.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        <plugin.icon size={28} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plugin.name}</h3>
                                    <p className="text-sm text-slate-500 mb-6 flex-1">{plugin.description}</p>

                                    <div className="space-y-3 mb-6">
                                        {plugin.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <CheckCircle size={14} className="text-emerald-500" />
                                                {feat}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                        <span className="font-bold text-slate-900">{plugin.price}</span>
                                        <Button
                                            onClick={() => handleTogglePlugin(plugin.id)}
                                            variant={plugin.active ? "outline" : "default"}
                                            className={plugin.active
                                                ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            }
                                        >
                                            {plugin.active ? 'Desactivar' : 'Activar Módulo'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Card para solicitar nuevo plugin */}
                    <motion.div
                        layout
                        className="rounded-[2rem] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group min-h-[400px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center mb-4 transition-colors">
                            <Plus size={32} className="text-slate-400 group-hover:text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">¿Necesitas algo más?</h3>
                        <p className="text-sm text-slate-500 max-w-[200px] mb-4">
                            Solicita un módulo personalizado y nuestro equipo lo desarrollará para ti.
                        </p>
                        <Button variant="ghost" className="text-indigo-600 font-bold">Contactar Ventas</Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
