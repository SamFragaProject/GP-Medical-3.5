import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pricingTiers = [
    {
        name: 'Básico',
        price: '$2,499',
        period: '/mes',
        description: 'Perfecto para clínicas pequeñas',
        icon: Zap,
        gradient: 'from-blue-500 to-cyan-600',
        features: [
            'Hasta 100 trabajadores',
            'Gestión de pacientes',
            'Historial clínico digital',
            'Reportes básicos',
            'Soporte por email',
            '5 usuarios simultáneos',
        ],
        popular: false,
    },
    {
        name: 'Profesional',
        price: '$5,999',
        period: '/mes',
        description: 'Lo más elegido por empresas',
        icon: Crown,
        gradient: 'from-purple-500 to-pink-600',
        features: [
            'Hasta 500 trabajadores',
            'Todo lo de Básico +',
            '🤖 IA Médica Avanzada',
            'Evaluaciones ergonómicas',
            'Analytics & ROI en tiempo real',
            'Automatización de reportes',
            'Certificaciones automáticas',
            'Soporte prioritario 24/7',
            '20 usuarios simultáneos',
        ],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Personalizado',
        period: '',
        description: 'Para grandes corporativos',
        icon: Sparkles,
        gradient: 'from-amber-500 to-orange-600',
        features: [
            'Trabajadores ilimitados',
            'Todo lo de Profesional +',
            'Implementación personalizada',
            'Integración con sistemas existentes',
            'Capacitación en sitio',
            'Gerente de cuenta dedicado',
            'SLA garantizado 99.9%',
            'Usuarios ilimitados',
        ],
        popular: false,
    },
];

export function PricingSection() {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-semibold text-sm">Planes y Precios</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Elige el plan
                        </span>
                        <br />
                        <span className="text-slate-900">perfecto para ti</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Todos los planes incluyen actualizaciones gratuitas y soporte técnico
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: tier.popular ? 1.05 : 1.02 }}
                            className={`relative ${tier.popular ? 'md:-mt-8' : ''}`}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-sm shadow-lg">
                                        ⭐ Más Popular
                                    </div>
                                </div>
                            )}

                            <div
                                className={`relative h-full bg-white rounded-3xl p-8 shadow-xl ${tier.popular
                                        ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20'
                                        : 'border border-slate-200'
                                    } overflow-hidden group`}
                            >
                                {/* Gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className={`inline-flex p-4 bg-gradient-to-br ${tier.gradient} rounded-2xl shadow-lg mb-6`}>
                                        <tier.icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Name & Description */}
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                                    <p className="text-slate-600 mb-6">{tier.description}</p>

                                    {/* Price */}
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-5xl font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                                                {tier.price}
                                            </span>
                                            {tier.period && (
                                                <span className="text-slate-500 text-lg">{tier.period}</span>
                                            )}
                                        </div>
                                        {tier.period && (
                                            <p className="text-sm text-slate-500 mt-2">+ IVA • Facturación mensual</p>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-6 h-6 bg-gradient-to-br ${tier.gradient} rounded-full flex items-center justify-center mt-0.5`}>
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/register')}
                                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${tier.popular
                                                ? `bg-gradient-to-r ${tier.gradient} text-white shadow-lg hover:shadow-xl`
                                                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                            }`}
                                    >
                                        Comenzar ahora
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-slate-600">
                        ¿Necesitas un plan personalizado?{' '}
                        <button className="text-blue-600 font-semibold hover:underline">
                            Contáctanos
                        </button>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
