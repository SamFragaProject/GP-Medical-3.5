import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    Briefcase,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Activity,
    FileText,
    BarChart3,
    Clock,
    Heart,
    Sparkles
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'IA Médica Avanzada',
        description: 'Diagnóstico asistido y predicción de riesgos laborales con machine learning',
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-500/10 to-indigo-500/5',
    },
    {
        icon: Briefcase,
        title: 'Medicina del Trabajo',
        description: 'Gestión completa de evaluaciones ergonómicas y salud ocupacional',
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-500/10 to-pink-500/5',
    },
    {
        icon: Users,
        title: 'Gestión de Pacientes',
        description: 'Expedientes digitales, historial clínico y seguimiento personalizado',
        gradient: 'from-emerald-500 to-green-600',
        bgGradient: 'from-emerald-500/10 to-green-500/5',
    },
    {
        icon: TrendingUp,
        title: 'Analytics & ROI',
        description: 'Métricas en tiempo real y cálculo automático de retorno de inversión',
        gradient: 'from-amber-500 to-orange-600',
        bgGradient: 'from-amber-500/10 to-orange-500/5',
    },
    {
        icon: Shield,
        title: 'Seguridad HIPAA',
        description: 'Cumplimiento total con normativas de privacidad y protección de datos',
        gradient: 'from-red-500 to-rose-600',
        bgGradient: 'from-red-500/10 to-rose-500/5',
    },
    {
        icon: Zap,
        title: 'Automatización Inteligente',
        description: 'Reportes automáticos, recordatorios y flujos de trabajo optimizados',
        gradient: 'from-cyan-500 to-blue-600',
        bgGradient: 'from-cyan-500/10 to-blue-500/5',
    },
    {
        icon: Activity,
        title: 'Signos Vitales',
        description: 'Monitoreo continuo y alertas tempranas de anomalías en salud',
        gradient: 'from-pink-500 to-purple-600',
        bgGradient: 'from-pink-500/10 to-purple-500/5',
    },
    {
        icon: FileText,
        title: 'Certificaciones',
        description: 'Generación automática de certificados médicos y documentos oficiales',
        gradient: 'from-indigo-500 to-blue-600',
        bgGradient: 'from-indigo-500/10 to-blue-500/5',
    },
    {
        icon: BarChart3,
        title: 'Reportes Ejecutivos',
        description: 'Dashboards interactivos con insights accionables para directivos',
        gradient: 'from-violet-500 to-purple-600',
        bgGradient: 'from-violet-500/10 to-purple-500/5',
    },
    {
        icon: Clock,
        title: 'Gestión de Agenda',
        description: 'Calendario inteligente con recordatorios y optimización de citas',
        gradient: 'from-teal-500 to-cyan-600',
        bgGradient: 'from-teal-500/10 to-cyan-500/5',
    },
    {
        icon: Heart,
        title: 'Evaluaciones de Riesgo',
        description: 'Análisis predictivo de riesgos laborales y planes de prevención',
        gradient: 'from-rose-500 to-pink-600',
        bgGradient: 'from-rose-500/10 to-pink-500/5',
    },
    {
        icon: Sparkles,
        title: 'Asistente IA 24/7',
        description: 'Chatbot médico inteligente disponible en todo momento',
        gradient: 'from-yellow-500 to-amber-600',
        bgGradient: 'from-yellow-500/10 to-amber-500/5',
    },
];

export function FeaturesGrid() {
    return (
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-semibold text-sm">Características Premium</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Todo lo que necesitas
                        </span>
                        <br />
                        <span className="text-slate-900">en un solo lugar</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Descubre cómo GPMedical revoluciona la gestión de salud ocupacional con tecnología de punta
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group"
                        >
                            <div className={`relative h-full bg-gradient-to-br ${feature.bgGradient} to-white backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                {/* Icon */}
                                <div className="relative z-10">
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg mb-6`}
                                    >
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </motion.div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Shine effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
