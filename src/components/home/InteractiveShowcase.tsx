import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    BarChart3,
    ShieldCheck,
    Zap,
    ArrowRight,
    X,
    CheckCircle2,
    PieChart,
    Layers,
    Activity,
    Target,
    BellRing,
    LayoutDashboard,
    Database,
    LineChart,
    Settings,
    Briefcase
} from 'lucide-react';

interface Feature {
    id: string;
    icon: React.ElementType;
    title: string;
    tagline: string;
    description: string;
    benefitTitle: string;
    benefitDesc: string;
    mockup: React.ReactNode;
    stats: { label: string; value: string; trend: string }[];
}

const features: Feature[] = [
    {
        id: 'crm-pipeline',
        icon: Target,
        title: 'Pipeline de Salud',
        tagline: 'Ciclo de vida del paciente',
        description: 'Optimiza el flujo desde el reclutamiento hasta el examen de retiro. Gestión integral de candidatos y empleados.',
        benefitTitle: 'Eficiencia de Conversión',
        benefitDesc: 'Acelera el proceso de ingreso en un 65% mediante validaciones automáticas y seguimiento en tiempo real.',
        stats: [
            { label: 'Conversión', value: '94%', trend: '+12%' },
            { label: 'Tiempo de Onboarding', value: '24hrs', trend: '-40%' },
        ],
        mockup: (
            <div className="bg-[#fcfdfe] rounded-2xl p-6 shadow-2xl border border-slate-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        Pipeline Operativo
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { step: 'Candidatos', count: 124, color: 'bg-blue-500', width: 'w-full' },
                        { step: 'Evaluación', count: 86, color: 'bg-emerald-500', width: 'w-[70%]' },
                        { step: 'Aprobados', count: 42, color: 'bg-cyan-500', width: 'w-[40%]' },
                    ].map((s, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                <span>{s.step}</span>
                                <span>{s.count}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: s.width.split('-')[1].replace('[', '').replace(']', '') }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    className={`h-full ${s.color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase">ROI Estimado</div>
                        <div className="text-lg font-black text-emerald-700">$12,400</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <div className="text-[10px] font-bold text-blue-600 uppercase">Activos</div>
                        <div className="text-lg font-black text-blue-700">852</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'bi-intelligence',
        icon: LineChart,
        title: 'BI Intelligence',
        tagline: 'Analítica predictiva de salud',
        description: 'Transforma datos clínicos en decisiones estratégicas. Identificación automática de tendencias epidemiológicas por sector.',
        benefitTitle: 'Prevención Basada en Datos',
        benefitDesc: 'Reduce incidentes laborales en un 38% anticipando riesgos mediante algoritmos de salud ocupacional.',
        stats: [
            { label: 'Predicción Acc.', value: '98.2%', trend: '+5.4%' },
            { label: 'Ahorro Seguro', value: '22%', trend: '+8%' },
        ],
        mockup: (
            <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            Health Dashboard v4
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-8">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: h }}
                                transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                                className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm"
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Impacto Riesgo</div>
                            <div className="text-xl font-black text-white">-12.5%</div>
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-md">
                            <div className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Satisfacción</div>
                            <div className="text-xl font-black text-emerald-400">4.9/5</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'account-management',
        icon: Briefcase,
        title: 'Gestor Corporativo',
        tagline: 'CRM Multi-Empresa',
        description: 'Administra múltiples contratos y protocolos de salud desde una sola consola centralizada con gestión documental completa.',
        benefitTitle: 'Centralización Total',
        benefitDesc: 'Gestiona la salud de miles de empleados a través de diversos nodos empresariales sin perder el control normativo.',
        stats: [
            { label: 'Carga Admin.', value: '-75%', trend: 'Stable' },
            { label: 'Compliance Index', value: '100%', trend: 'Verified' },
        ],
        mockup: (
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 h-full">
                <div className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Directorio de Cuentas
                </div>
                <div className="space-y-4">
                    {[
                        { name: 'TechCorp Global', status: 'Audit Clear', count: '1,240 Emp' },
                        { name: 'Logistics MX', status: 'Review', count: '450 Emp' },
                        { name: 'Industrial S.A.', status: 'Active', count: '890 Emp' },
                    ].map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                    {c.name[0]}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-800">{c.name}</div>
                                    <div className="text-[10px] text-slate-400 tracking-tight">{c.count}</div>
                                </div>
                            </div>
                            <div className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${c.status === 'Audit Clear' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {c.status}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
                    Añadir Nuevo Nodo
                </button>
            </div>
        )
    },
    {
        id: 'safety-automation',
        icon: BellRing,
        title: 'Auto-Compliance',
        tagline: 'Protocolos automatizados',
        description: 'Detección automática de desviaciones normativas. Sistema de alertas inteligentes para el cumplimiento de las NOM mexicanas.',
        benefitTitle: 'Blindaje Legal',
        benefitDesc: 'Asegura el cumplimiento total de NOM-004, NOM-024 y NOM-030 de forma automática y verificable.',
        stats: [
            { label: 'Alertas IA', value: 'Live', trend: 'Active' },
            { label: 'Auditorías', value: 'Pass', trend: '100%' },
        ],
        mockup: (
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Guardian v4.2
                    </div>
                    <div className="h-5 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin duration-[3s]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                    </div>
                    <div className="text-lg font-black text-slate-900 leading-tight">SISTEMA CUMPLIMENTADO</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-[160px]">Escaneo en tiempo real de NOM-030 completado con éxito.</div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="px-2 py-3 bg-slate-50 rounded-xl">
                        <div className="text-[8px] font-bold text-slate-400 uppercase">NOM-004</div>
                        <div className="text-[10px] font-black text-emerald-600 tracking-tighter">YES</div>
                    </div>
                    <div className="px-2 py-3 bg-slate-50 rounded-xl">
                        <div className="text-[8px] font-bold text-slate-400 uppercase">NOM-024</div>
                        <div className="text-[10px] font-black text-emerald-600 tracking-tighter">YES</div>
                    </div>
                    <div className="px-2 py-3 bg-slate-50 rounded-xl">
                        <div className="text-[8px] font-bold text-slate-400 uppercase">NOM-030</div>
                        <div className="text-[10px] font-black text-emerald-600 tracking-tighter">YES</div>
                    </div>
                </div>
            </div>
        )
    },
];

export function InteractiveShowcase() {
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

    return (
        <section className="py-24 relative overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
                >
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full mb-6">
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest">Motor Operativo CRM</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.05]">
                            Ecosistema de <span className="text-emerald-500">Gestión Inteligente</span>
                        </h2>
                    </div>
                    <p className="text-lg text-slate-500 max-w-[340px] leading-relaxed font-medium">
                        Transformamos la salud laboral desde una tarea administrativa a un activo estratégico medible.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <button
                                onClick={() => setSelectedFeature(f)}
                                className="group w-full h-[480px] text-left relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-emerald-200/50 hover:-translate-y-2 transition-all duration-500 flex flex-col"
                            >
                                <div className="relative z-10 mb-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:rotate-6 transition-all duration-500">
                                        <f.icon className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">{f.tagline}</div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{f.title}</h3>
                                </div>
                                <div className="flex-1 flex items-center justify-center pointer-events-none transform group-hover:scale-105 transition-transform duration-700">
                                    <div className="w-full scale-90 translate-y-4">
                                        {f.mockup}
                                    </div>
                                </div>
                                <div className="pt-6 relative z-10 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ver Integración</span>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Modal Detail */}
                <AnimatePresence>
                    {selectedFeature && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
                            onClick={() => setSelectedFeature(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedFeature(null)}
                                    className="absolute top-8 right-8 w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors z-20"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="grid lg:grid-cols-[1.2fr_1fr] h-full overflow-y-auto lg:overflow-hidden">
                                    {/* Left: Interactive Visual */}
                                    <div className="bg-slate-50 p-12 flex flex-col items-center justify-center relative min-h-[400px]">
                                        <div className="absolute top-0 left-0 p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                                    <selectedFeature.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-900">{selectedFeature.title}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Integration Module</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full max-w-[400px] transform scale-110">
                                            {selectedFeature.mockup}
                                        </div>
                                    </div>

                                    {/* Right: Content & CRM Value */}
                                    <div className="p-12 lg:p-16 flex flex-col justify-center">
                                        <div className="space-y-12">
                                            <div>
                                                <div className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">{selectedFeature.tagline}</div>
                                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                                                    {selectedFeature.title}
                                                </h3>
                                                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                                    {selectedFeature.description}
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Valor Estratégico</div>
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-lg tracking-tight mb-1">{selectedFeature.benefitTitle}</div>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{selectedFeature.benefitDesc}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 pt-4">
                                                {selectedFeature.stats.map((s, i) => (
                                                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                                                            <div className="text-[10px] font-black text-emerald-600">{s.trend}</div>
                                                        </div>
                                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => window.location.href = '/register'}
                                                className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-bold uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-4 group"
                                            >
                                                Desplegar Módulo
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
