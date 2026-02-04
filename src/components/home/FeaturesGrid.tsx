import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    Shield,
    Zap,
    BarChart3,
    Terminal,
    Network,
    Sparkles,
    Stethoscope,
    Microscope,
    HeartPulse,
    ClipboardCheck,
    Lock
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'Análisis IA Predictivo',
        description: 'Detección anticipada de riesgos ergonómicos y patologías mediante visión computacional.',
        tag: 'Neural Core v4'
    },
    {
        icon: Network,
        title: 'Interoperabilidad Médica',
        description: 'Conectividad absoluta bajo estándares HL7 y cumplimiento estricto de la NOM-024.',
        tag: 'HL7 / NOM-024'
    },
    {
        icon: Shield,
        title: 'Bóveda de Privacidad',
        description: 'Protección de datos sensibles con encriptación AES-256 de nivel hospitalario.',
        tag: 'E2EE Security'
    },
    {
        icon: ClipboardCheck,
        title: 'Automatización Normativa',
        description: 'Generación instantánea de reportes epidemiológicos y auditorías STPS automatizadas.',
        tag: 'Compliance Engine'
    },
    {
        icon: BarChart3,
        title: 'Business Health BI',
        description: 'Dashboards avanzados que transforman datos clínicos en decisiones estratégicas de ahorro.',
        tag: 'BI Analytics'
    },
    {
        icon: Zap,
        title: 'Flujos de Alto Desempeño',
        description: 'Digitalización completa del ciclo del paciente: desde el ingreso hasta el alta médica.',
        tag: 'Performance'
    }
];

export function FeaturesGrid() {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest">Capacidades de Próxima Generación</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Elevando el Estándar de la <br />
                        <span className="text-emerald-500">Excelencia Clínica</span>
                    </h2>
                    <p className="mt-6 text-slate-500 text-lg max-w-2xl mx-auto font-normal">
                        Nuestra tecnología está diseñada para integrarse perfectamente en el flujo de trabajo médico, eliminando la fricción administrativa.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            {/* Inner Card (Luminous White) */}
                            <div className="h-full bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 relative overflow-hidden group/card shadow-lg shadow-slate-100">
                                {/* Feature Icon Container */}
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100 group-hover/card:bg-emerald-500 group-hover/card:scale-110 transition-all duration-500 shadow-sm">
                                    <feature.icon className="w-8 h-8 text-emerald-600 group-hover/card:text-white transition-colors" />
                                </div>

                                <div className="relative z-10">
                                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3 opacity-70">
                                        {feature.tag}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-normal">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
