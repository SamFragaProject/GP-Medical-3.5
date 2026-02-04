import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    CheckCircle,
    Sparkles,
    Zap,
    TrendingUp,
    Shield,
    Activity,
    Search,
    Target,
    Cpu,
    Microscope,
    Heart,
    Network,
    Glasses,
    Terminal,
    Dna,
    Beaker
} from 'lucide-react';

const aiFeatures = [
    {
        icon: Microscope,
        title: 'Diagnóstico Probabilístico',
        tagline: 'Precision Screening',
        description: 'Análisis detallado de síntomas cruzado con bases de datos epidemiológicas globales en milisegundos.',
    },
    {
        icon: TrendingUp,
        title: 'Patrones de Salud',
        tagline: 'Predictive Trends',
        description: 'Identificación precoz de tendencias de enfermedad en poblaciones laborales antes de que se vuelvan críticas.',
    },
    {
        icon: Target,
        title: 'Medicina de Precisión',
        tagline: 'Individual Focus',
        description: 'Personalización de tratamientos y seguimientos basados en perfiles de riesgo individuales y genómicos.',
    },
    {
        icon: Shield,
        title: 'Compliance Nativo',
        tagline: 'Legal Armor',
        description: 'Validación automática de cada registro médico frente a normativas locales e internacionales.',
    },
];

export function AIShowcase() {
    return (
        <section id="ai" className="py-32 relative overflow-hidden bg-[#fcfdfe]">
            {/* Massive Tech Gradients */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/[0.03] rounded-full blur-[160px] -mr-96 -mt-96" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/[0.03] rounded-full blur-[160px] -ml-96 -mb-96" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-20 items-center">
                    {/* Left: Content (Clinical High-Impact) */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full mb-10 shadow-2xl"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em]">AI Engine v4 Pro</span>
                        </motion.div>

                        <h2 className="text-5xl md:text-8xl font-black mb-10 text-slate-900 leading-[0.95] tracking-tighter">
                            Motor de <br />
                            <span className="text-emerald-500">Inteligencia</span> <br />
                            <span className="italic">Clínica</span>.
                        </h2>

                        <p className="text-xl text-slate-500 mb-16 leading-relaxed font-medium">
                            No es software de oficina. Es una red neuronal médica entrenada para proteger la integridad física y legal de su fuerza laboral.
                        </p>

                        {/* CRM Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            {aiFeatures.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-500 group"
                                >
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-all group-hover:rotate-6">
                                        <f.icon className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">{f.tagline}</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{f.title}</h3>
                                    <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
                                        {f.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: The High-Tech "Neural" Visualizer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative h-[800px] flex items-center justify-center"
                    >
                        {/* Complex Background Geometry */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                className="w-[600px] h-[600px] border-2 border-emerald-500/10 rounded-full border-dashed"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute w-[450px] h-[450px] border border-blue-500/10 rounded-full border-dashed"
                            />
                        </div>

                        {/* The Central Neural Brain Vis */}
                        <div className="relative z-10 w-[500px] h-[600px] bg-slate-900 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden group">
                            {/* Scanning Laser Line */}
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-20 opacity-40 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                            />

                            <div className="p-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                            <Brain className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-2xl tracking-tighter">AI Neural Suite</div>
                                            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em] mt-1">
                                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                Processing Real-time Data
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Latency</div>
                                        <div className="text-lg font-black text-white">4.2ms</div>
                                    </div>
                                </div>

                                <div className="space-y-8 flex-1 flex flex-col justify-center">
                                    <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden group/box">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em]">Predictive Health Score</span>
                                            <span className="text-emerald-400 font-black italic">TOP RANGE</span>
                                        </div>
                                        <div className="text-6xl font-black text-white tracking-tighter mb-6 italic">98.4<span className="text-emerald-500">%</span></div>
                                        <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '98.4%' }}
                                                transition={{ duration: 2, ease: "circOut" }}
                                                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-blue-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-center hover:bg-white/10 transition-colors">
                                            <Dna className="w-7 h-7 text-emerald-400 mx-auto mb-4" />
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Genomics</div>
                                            <div className="text-2xl font-black text-white tracking-tighter italic">ACTIVE</div>
                                        </div>
                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-center hover:bg-white/10 transition-colors">
                                            <Beaker className="w-7 h-7 text-blue-400 mx-auto mb-4" />
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Lab Sync</div>
                                            <div className="text-2xl font-black text-white tracking-tighter italic">SYNCED</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center gap-6 group hover:bg-emerald-500/20 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                        <Terminal className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-[11px] text-emerald-100 font-medium leading-relaxed italic tracking-tight uppercase">
                                        "Audit Trail Log: NOM-030 verification protocol successfully deployed across all enterprise nodes."
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Floating CRM Widgets */}
                        <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-20 -right-16 z-20"
                        >
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Network className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase">Global Sync</div>
                                    <div className="text-sm font-black text-slate-900 tracking-tight italic">CONNECTED</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
