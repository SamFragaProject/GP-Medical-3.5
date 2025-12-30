import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Sparkles, Zap, TrendingUp, Shield } from 'lucide-react';

const aiFeatures = [
    {
        icon: Brain,
        title: 'Diagnóstico Asistido por IA',
        description: 'Análisis inteligente de síntomas y recomendaciones médicas basadas en millones de casos',
    },
    {
        icon: TrendingUp,
        title: 'Predicción de Riesgos Laborales',
        description: 'Identifica patrones y previene incidentes antes de que ocurran',
    },
    {
        icon: Zap,
        title: 'Automatización de Reportes',
        description: 'Genera documentos médicos, certificados y reportes en segundos',
    },
    {
        icon: Shield,
        title: 'Análisis de Tendencias de Salud',
        description: 'Detecta tendencias en la salud de tu equipo y sugiere intervenciones preventivas',
    },
];

export function AIShowcase() {
    return (
        <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span className="text-white font-semibold text-sm">Inteligencia Artificial</span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                            La IA que{' '}
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                revoluciona
                            </span>
                            <br />
                            la medicina laboral
                        </h2>

                        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                            Nuestro motor de IA aprende continuamente de cada evaluación, optimizando diagnósticos
                            y prediciendo riesgos con precisión sin precedentes.
                        </p>

                        {/* AI Features List */}
                        <div className="space-y-6">
                            {aiFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: 10 }}
                                    className="flex gap-4 items-start group cursor-pointer"
                                >
                                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/50 transition-all">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-blue-200">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-10 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all"
                        >
                            Descubre más sobre nuestra IA
                        </motion.button>
                    </motion.div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* AI Brain Visualization */}
                        <div className="relative">
                            {/* Central Brain */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, 0],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl"
                            >
                                <Brain className="w-full h-full text-blue-300" strokeWidth={1} />

                                {/* Floating Data Points */}
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -20, 0],
                                            opacity: [0.3, 1, 0.3],
                                        }}
                                        transition={{
                                            duration: 2 + i * 0.3,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                        className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                                        style={{
                                            top: `${Math.random() * 80 + 10}%`,
                                            left: `${Math.random() * 80 + 10}%`,
                                        }}
                                    />
                                ))}
                            </motion.div>

                            {/* Floating Cards */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                    <div>
                                        <p className="text-white font-bold">98.7%</p>
                                        <p className="text-xs text-blue-200">Precisión</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                    <div>
                                        <p className="text-white font-bold">2.3s</p>
                                        <p className="text-xs text-blue-200">Tiempo de análisis</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                                className="absolute top-1/2 -right-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                    <div>
                                        <p className="text-white font-bold">+368%</p>
                                        <p className="text-xs text-blue-200">ROI</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
