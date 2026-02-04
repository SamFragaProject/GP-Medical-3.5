import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle, Zap, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
    const navigate = useNavigate();

    return (
        <section className="py-40 bg-transparent relative overflow-hidden">
            {/* Soft Ambient Energy */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    {/* Medical Badge */}
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-10 shadow-sm">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-extrabold text-[10px] uppercase tracking-widest">Protocol Activation Ready</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-6xl md:text-8xl font-extrabold text-slate-900 mb-8 tracking-tighter leading-none">
                        El Futuro de la <br />
                        <span className="text-emerald-500">Salud Laboral</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-3xl mx-auto font-normal leading-relaxed">
                        Despliega la infraestructura más avanzada y eleva el estándar operativo de tu organización médica hoy mismo.
                    </p>

                    {/* High Impact Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="px-14 py-5 bg-emerald-500 text-white rounded-[2rem] font-extrabold text-lg uppercase tracking-wider shadow-2xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-4"
                        >
                            Comenzar Ahora
                            <ArrowRight className="w-6 h-6" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/pricing')}
                            className="px-14 py-5 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-extrabold text-lg uppercase tracking-wider hover:bg-slate-50 transition-all shadow-xl shadow-slate-100"
                        >
                            Ver Specs
                        </motion.button>
                    </div>

                    {/* Trust indicator */}
                    <div className="mt-24 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-slate-200" />
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.4em]">Confianza en +150 Centros Médicos</span>
                        <div className="h-px w-12 bg-slate-200" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
