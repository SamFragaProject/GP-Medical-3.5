import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Users, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    // Animated counter effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => (prev < 1240 ? prev + 20 : 1240));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
            {/* Animated Background Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-500/30 to-blue-500/30 rounded-full blur-3xl"
                />
            </div>

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 100 - 50, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                />
            ))}

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        {/* AI Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8 mx-auto lg:mx-0"
                        >
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span className="text-white font-semibold">Potenciado por Inteligencia Artificial</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </motion.div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Medicina del Trabajo
                            </span>
                            <br />
                            <span className="text-white">Impulsada por IA</span>
                        </h1>

                        <p className="text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                            El ERP médico más avanzado para gestionar la salud ocupacional de tu empresa.
                            <span className="block mt-2 text-purple-300 font-semibold">
                                Automatización inteligente • ROI comprobado • Resultados en tiempo real
                            </span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-16">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/pricing')}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 flex items-center gap-2 hover:from-blue-500 hover:to-purple-500 transition-all"
                            >
                                Ver Precios
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Registrarse Gratis
                            </motion.button>
                        </div>

                        {/* Stats Row (Desktop only, moved from bottom) */}
                        <div className="hidden lg:flex gap-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{count.toLocaleString()}+</div>
                                    <div className="text-sm text-blue-200">Trabajadores</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">368%</div>
                                    <div className="text-sm text-blue-200">ROI Promedio</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Graphic */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative w-full aspect-square max-w-lg mx-auto">
                            {/* Central Glowing Orb */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
                            />

                            {/* Main Floating Card */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <Brain className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-lg">Análisis IA</div>
                                            <div className="text-blue-200 text-sm">Procesando datos...</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-bold animate-pulse">
                                        EN VIVO
                                    </div>
                                </div>

                                {/* Chart Visualization (Abstract) */}
                                <div className="space-y-3 mb-8">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "75%" }}
                                            transition={{ duration: 2, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                                        />
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "90%" }}
                                            transition={{ duration: 2, delay: 0.7 }}
                                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                                        />
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "60%" }}
                                            transition={{ duration: 2, delay: 0.9 }}
                                            className="h-full bg-gradient-to-r from-pink-400 to-orange-400"
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="text-blue-200 text-xs mb-1">Eficiencia</div>
                                        <div className="text-2xl font-bold text-white">98.5%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <div className="text-purple-200 text-xs mb-1">Riesgo</div>
                                        <div className="text-2xl font-bold text-white">Bajo</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                                className="absolute -top-10 -right-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
                            >
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                                transition={{ duration: 7, repeat: Infinity, delay: 2 }}
                                className="absolute -bottom-5 -left-5 z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl"
                            >
                                <Users className="w-8 h-8 text-blue-400" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
                    />
                </div>
            </motion.div>
        </div>
    );
}
