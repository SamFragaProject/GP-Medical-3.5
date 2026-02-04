import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight, Shield, Cpu, Activity, Building2, Server, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pricingTiers = [
    {
        name: 'Lite Node',
        price: '$2,499',
        period: '/mes',
        tagline: 'Ideal para clínicas locales',
        description: 'Optimizado para consultorios independientes y unidades médicas en crecimiento.',
        icon: Building2,
        features: [
            '100 Nodos de Empleado',
            'CRM Clínico Base',
            'NOM-004 Base Compliance',
            'IA Diagnostic Assist v1',
            'Auditoría Mensual'
        ],
        popular: false
    },
    {
        name: 'Core System',
        price: '$5,999',
        period: '/mes',
        tagline: 'El estándar industrial',
        description: 'La solución definitiva para centros de salud industriales y corporativos medianos.',
        icon: Server,
        features: [
            '500 Nodos de Empleado',
            'Pipeline Operativo Avanzado',
            'NOM-004 + NOM-030 Full',
            'IA Predictiva de Riesgos',
            'Integración Lab Sync 24/7'
        ],
        popular: true
    },
    {
        name: 'Enterprise Grid',
        price: 'Custom',
        period: '',
        tagline: 'Infraestructura global',
        description: 'Control total para corporativos internacionales con múltiples nodos empresariales.',
        icon: Globe,
        features: [
            'Nodos Ilimitados',
            'Data Warehouse Privado',
            'Auditoría Full Legal (STPS)',
            'Gerente de Cuenta Dedicado',
            'SLA de Arquitectura 99.9%'
        ],
        popular: false
    }
];

export function PricingSection() {
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-40 bg-transparent relative overflow-hidden">
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
                        className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full mb-8 shadow-2xl"
                    >
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest leading-none">Global Licensing Infrastructure</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none mb-10">
                        Inversión en <br />
                        <span className="text-emerald-500 italic">Continuidad Clínica</span>.
                    </h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Seleccione el nivel de despliegue que mejor se adapte a su infraestructura operativa.
                    </p>
                </motion.div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative group flex"
                        >
                            <div className={`flex flex-col w-full bg-white border border-slate-200 rounded-[3.5rem] p-12 transition-all duration-500 relative overflow-hidden shadow-xl shadow-slate-100 group-hover:shadow-2xl group-hover:shadow-emerald-200/50 group-hover:-translate-y-2 ${tier.popular ? 'ring-2 ring-emerald-500' : ''}`}>

                                {tier.popular && (
                                    <div className="absolute top-10 right-10">
                                        <div className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-emerald-200">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-12">
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-10 transition-all duration-500 shadow-xl ${tier.popular ? 'bg-emerald-500 text-white shadow-emerald-200 rotate-6' : 'bg-slate-50 text-slate-900 shadow-slate-100 border border-slate-100'
                                        }`}>
                                        <tier.icon className="w-10 h-10" />
                                    </div>
                                    <div className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">{tier.tagline}</div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-none">{tier.name}</h3>
                                    <p className="text-slate-500 text-[13px] font-medium leading-relaxed">{tier.description}</p>
                                </div>

                                <div className="mb-12 pb-12 border-b border-slate-50">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black text-slate-900 tracking-tighter">{tier.price}</span>
                                        <span className="text-slate-400 text-sm font-black uppercase tracking-widest">{tier.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-6 mb-16 flex-1">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-4 group/item">
                                            <div className="mt-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm shadow-emerald-200 transition-transform group-hover/item:scale-110">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-slate-600 text-[13px] font-bold tracking-tight leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/register')}
                                    className={`w-full h-20 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl ${tier.popular
                                            ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                                            : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
                                        }`}
                                >
                                    Desplegar Nodo
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-24 text-center">
                    <div className="inline-flex items-center gap-6 p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-black text-slate-900 tracking-tighter">Únete a +400 clínicas</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Despliegues activos este mes</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
