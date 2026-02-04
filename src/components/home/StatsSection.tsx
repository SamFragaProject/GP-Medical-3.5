import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Users,
    TrendingUp,
    Heart,
    Clock,
    Activity,
    ShieldCheck,
    Zap,
    BarChart3,
    Trophy,
    Target,
    Gauge,
    Database
} from 'lucide-react';

interface StatItemProps {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    sublabel: string;
    duration?: number;
}

function StatItem({ icon: Icon, value, suffix, label, sublabel, duration = 2000 }: StatItemProps) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, value, duration]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <div className="bg-white border border-slate-100 p-12 rounded-[3.5rem] shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-700 relative overflow-hidden flex flex-col items-center text-center">
                <div className="p-6 bg-slate-900 rounded-3xl mb-10 group-hover:bg-emerald-500 group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-slate-200 group-hover:shadow-emerald-200">
                    <Icon className="w-10 h-10 text-emerald-400 group-hover:text-white transition-colors" />
                </div>

                <div className="text-6xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter tabular-nums">
                    {count.toLocaleString()}
                    <span className="text-emerald-500">{suffix}</span>
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
                    <p className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">{sublabel}</p>
                </div>

                {/* Decorative Tech Grid */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05 transition-opacity duration-700">
                    <div className="w-full h-full bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
            </div>
        </motion.div>
    );
}

export function StatsSection() {
    return (
        <section className="py-40 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-32"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
                    >
                        <Trophy className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">Global Performance Snapshot</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-10">
                        Resultados de <br />
                        <span className="text-emerald-500 italic">Clase Mundial</span>.
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Métricas auditadas y validadas por las principales instituciones de salud laboral y seguridad en el trabajo.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
                    <StatItem
                        icon={Users}
                        value={12400}
                        suffix="+"
                        label="Empresas"
                        sublabel="Ecosistema Activo"
                    />
                    <StatItem
                        icon={Target}
                        value={368}
                        suffix="%"
                        label="Promedio ROI"
                        sublabel="Retorno en Salud"
                    />
                    <StatItem
                        icon={ShieldCheck}
                        value={100}
                        suffix="%"
                        label="Compliance"
                        sublabel="Cero Multas STPS"
                    />
                    <StatItem
                        icon={Gauge}
                        value={4}
                        suffix="ms"
                        label="Análisis IA"
                        sublabel="Velocidad Atómica"
                    />
                </div>

                {/* Live Ticker Area */}
                <div className="relative p-12 bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12">
                        {[
                            { icon: Database, val: '8.4PB', label: 'Datos Clínicos' },
                            { icon: Zap, val: '99.99%', label: 'Uptime Sistema' },
                            { icon: Activity, val: '2.5M+', label: 'Pre-empleos' },
                            { icon: ShieldCheck, val: 'V3.5', label: 'Engine Core' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center md:items-start">
                                <item.icon className="w-6 h-6 text-emerald-400 mb-4" />
                                <span className="text-3xl font-black text-white tracking-tighter mb-1 tabular-nums">{item.val}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">
                            Global Neural Health Sync Active
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
