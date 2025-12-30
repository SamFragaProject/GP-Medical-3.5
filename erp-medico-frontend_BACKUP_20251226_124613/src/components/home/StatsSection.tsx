import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Heart, Clock } from 'lucide-react';

interface StatItemProps {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    gradient: string;
    duration?: number;
}

function StatItem({ icon: Icon, value, suffix, label, gradient, duration = 2000 }: StatItemProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
        >
            <div className={`bg-gradient-to-br ${gradient} p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300`}>
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl mb-4"
                    >
                        <Icon className="w-10 h-10 text-white" />
                    </motion.div>

                    <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                        {count.toLocaleString()}
                        {suffix}
                    </div>

                    <p className="text-white/90 text-lg font-medium">{label}</p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                </div>
            </div>
        </motion.div>
    );
}

export function StatsSection() {
    return (
        <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                        Resultados que{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            hablan por sí solos
                        </span>
                    </h2>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Empresas líderes confían en GPMedical para transformar su gestión de salud ocupacional
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatItem
                        icon={Users}
                        value={1240}
                        suffix="+"
                        label="Trabajadores Monitoreados"
                        gradient="from-blue-500 to-indigo-600"
                    />
                    <StatItem
                        icon={TrendingUp}
                        value={368}
                        suffix="%"
                        label="ROI Promedio"
                        gradient="from-emerald-500 to-green-600"
                    />
                    <StatItem
                        icon={Heart}
                        value={87}
                        suffix="%"
                        label="Reducción en Incidencias"
                        gradient="from-rose-500 to-pink-600"
                    />
                    <StatItem
                        icon={Clock}
                        value={24}
                        suffix="/7"
                        label="Soporte IA Activo"
                        gradient="from-purple-500 to-pink-600"
                    />
                </div>

                {/* Additional Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
                >
                    {[
                        { value: '99.9%', label: 'Uptime' },
                        { value: '2.3s', label: 'Tiempo de respuesta IA' },
                        { value: '50+', label: 'Empresas activas' },
                        { value: '$234K', label: 'Ahorro promedio anual' },
                    ].map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                        >
                            <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                            <p className="text-blue-200 text-sm">{metric.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
