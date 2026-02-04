import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MEDICAL_AI_IMAGE = '/assets/medical_ai.png';

export function HeroSection() {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);
    const scale = useTransform(scrollY, [0, 400], [1, 0.97]);

    return (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
            {/* Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[5%] w-[50%] h-[50%] bg-emerald-400/[0.07] blur-[150px] rounded-full" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-sky-400/[0.05] blur-[120px] rounded-full" />
            </div>

            <motion.div
                style={{ opacity, scale }}
                className="relative z-10 max-w-7xl mx-auto px-6 w-full"
            >
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* LEFT: The Message */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-10"
                    >
                        {/* Tagline */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600 font-semibold text-xs tracking-wide">ERP de Salud Ocupacional</span>
                        </div>

                        {/* Headline - CLEAR & BOLD */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight">
                            El sistema operativo<br />
                            <span className="text-emerald-500">para clínicas</span><br />
                            de medicina laboral
                        </h1>

                        {/* Sub-headline - SHORT */}
                        <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
                            Expedientes, exámenes, reportes STPS y cumplimiento NOM. Todo en una sola plataforma impulsada por IA.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-semibold text-base shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center gap-3"
                            >
                                Comenzar Gratis
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold text-base hover:bg-slate-50 transition-colors shadow-lg shadow-slate-100"
                            >
                                Iniciar Sesión
                            </motion.button>
                        </div>

                        {/* Trust Indicators - MINIMAL */}
                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium">NOM-004 Certificado</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-medium">HIPAA Compliant</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: The Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative hidden lg:block"
                    >
                        {/* Main Image Card */}
                        <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/30 aspect-[4/3]">
                            <img
                                src={MEDICAL_AI_IMAGE}
                                alt="GPMedical Dashboard"
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                            {/* Live Indicator */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-white/80 text-xs font-medium">IA Activa</span>
                            </div>

                            {/* Bottom Caption */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Motor de Análisis</div>
                                <div className="text-white text-lg font-semibold">Diagnóstico Predictivo en Tiempo Real</div>
                            </div>
                        </div>

                        {/* Floating Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 border border-slate-100"
                        >
                            <div className="text-3xl font-bold text-slate-900">+12,400</div>
                            <div className="text-sm text-slate-500">Pacientes gestionados</div>
                        </motion.div>

                        {/* Floating Compliance Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="absolute -top-4 -right-4 bg-emerald-500 text-white rounded-2xl px-4 py-3 shadow-lg shadow-emerald-500/30"
                        >
                            <div className="text-xs font-bold uppercase tracking-wide">NOM-030 Ready</div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll Hint */}
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
            >
                <div className="w-px h-8 bg-gradient-to-b from-slate-400 to-transparent" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Scroll</span>
            </motion.div>
        </section>
    );
}
