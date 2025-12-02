import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 0],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.3, 1, 1.3],
                        rotate: [180, 0, 180],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                />
            </div>

            {/* Floating particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 3,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                />
            ))}

            <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full mb-8"
                    >
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span className="text-white font-semibold">Comienza tu transformación digital hoy</span>
                    </motion.div>

                    {/* Headline */}
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        ¿Listo para revolucionar
                        <br />
                        tu medicina laboral?
                    </h2>

                    <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Únete a las empresas líderes que ya están transformando la salud ocupacional con IA
                    </p>

                    {/* Benefits */}
                    <div className="flex flex-wrap justify-center gap-6 mb-12">
                        {[
                            'Sin tarjeta de crédito',
                            'Configuración en 5 minutos',
                            'Soporte 24/7',
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="flex items-center gap-2 text-white"
                            >
                                <CheckCircle className="w-5 h-5 text-green-300" />
                                <span className="font-medium">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-xl shadow-2xl hover:bg-blue-50 transition-all flex items-center gap-3"
                        >
                            Registrarse Gratis
                            <ArrowRight className="w-6 h-6" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/pricing')}
                            className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-bold text-xl hover:bg-white/20 transition-all"
                        >
                            Ver Precios
                        </motion.button>
                    </div>

                    {/* Trust indicator */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-white/70 text-sm"
                    >
                        Más de 50 empresas confían en GPMedical • Calificación 4.9/5 ⭐
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
