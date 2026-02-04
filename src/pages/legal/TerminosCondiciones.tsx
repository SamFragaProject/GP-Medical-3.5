import React, { useEffect } from 'react';
import { HomeNavbar } from '../../components/home/HomeNavbar';
import { HomeFooter } from '../../components/home/HomeFooter';
import { FileText, Shield, AlertTriangle, Users, Terminal, Cpu, ShieldAlert, CpuIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TerminosCondiciones() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-emerald-500/30">
            <HomeNavbar />

            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #00FFB3 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative z-10 pt-32 pb-24">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6 text-emerald-400 font-black text-[10px] uppercase tracking-widest leading-none">
                            <Terminal className="w-3 h-3" />
                            Legal_Protocol_Core
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 italic tracking-tighter uppercase leading-tight">
                            Términos y <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Condiciones</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
                            Última actualización: <span className="text-white font-medium">26 de Enero de 2026</span>
                            <br />
                            Marco normativo para el despliegue de servicios clínicos GPMedical.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        {/* Box Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/10 rounded-[2.5rem] blur-2xl opacity-50" />

                        <div className="relative bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 md:p-16 space-y-16 shadow-2xl">

                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        01
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Aceptación del Nodo
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light text-lg">
                                    Bienvenido a <strong className="text-white font-bold">GPMedical</strong>. Al acceder o utilizar nuestra plataforma de gestión médica y salud ocupacional ("Servicio"), usted acepta estar legalmente vinculado por estos Términos y Condiciones ("Términos"). Si no está de acuerdo con alguna parte de estos términos, no podrá inicializar el Servicio.
                                </p>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        02
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Protocolo de Servicio
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    GPMedical proporciona un software como servicio (SaaS) diseñado para la orquestación de expedientes clínicos, salud ocupacional, control de inventarios y procesos analíticos.
                                </p>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Responsabilidad Operativa del Usuario:</h3>
                                    <ul className="space-y-3">
                                        {[
                                            'Garantizar la integridad de los datos clínicos ingresados.',
                                            'Mantener la confidencialidad de las claves de cifrado de acceso.',
                                            'Uso del ecosistema conforme a la ética clínica y NOMs vigentes.'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm italic">
                                                <div className="w-1 h-4 bg-emerald-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        03
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Prohibiciones de Sistema
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light mb-8">
                                    Cualquier intento de subversión de la integridad del Servicio activará protocolos de seguridad inmediatos. Se prohíbe:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'Violar leyes de protección de datos sensibles.',
                                        'Infringir derechos de propiedad intelectual GPMedical.',
                                        'Inyección de código malicioso o desestabilizador.',
                                        'Extracción de datos mediante procesos no autorizados.',
                                        'Ingeniería inversa de la arquitectura del motor clínico.',
                                        'Sobrecarga deliberada de los nodos del Servicio.'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-300 bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-red-500/30 transition-colors group">
                                            <ShieldAlert className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
                                            <span className="text-xs font-medium uppercase tracking-wider">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        04
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Propiedad Intelectual
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    La arquitectura del Servicio, algoritmos propietarios y lógica de negocio son propiedad exclusiva de <strong className="text-white">GPMedical S.A. de C.V.</strong> El Servicio está protegido por tratados internacionales de propiedad intelectual y leyes federales.
                                </p>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        05
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Límites de Ejecución
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    GPMedical no será responsable por daños incidentales o punitivos resultantes del uso o incapacidad de uso del Nodo Clínico.
                                </p>
                                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                                        <p className="text-sm text-red-100/70 leading-relaxed italic">
                                            <strong className="text-red-400 font-bold block mb-1 uppercase tracking-widest">Aviso de Exención</strong>
                                            GPMedical es una infraestructura de soporte y gestión. Bajo ninguna circunstancia sustituye el juicio clínico autónomo y profesional del personal médico certificado.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="border-t border-white/5 pt-12 mt-12 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group hover:bg-emerald-500/10 transition-colors">
                                    <Users className="w-8 h-8 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">Consultas Jurídicas</p>
                                <a href="mailto:legal@gpmedical.com" className="text-emerald-400 font-black text-lg hover:text-emerald-300 transition-colors italic tracking-tighter">
                                    legal@gpmedical.com
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <HomeFooter />
        </div>
    );
}
