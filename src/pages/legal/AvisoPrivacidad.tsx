import React, { useEffect } from 'react';
import { HomeNavbar } from '../../components/home/HomeNavbar';
import { HomeFooter } from '../../components/home/HomeFooter';
import { Shield, Lock, FileText, CheckCircle, Terminal, Activity, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AvisoPrivacidad() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] selection:bg-emerald-500/30">
            <HomeNavbar />

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Security Protocol v3.5</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 italic tracking-tighter uppercase leading-tight">
                            Aviso de <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Privacidad</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
                            Última actualización: <span className="text-white font-medium">26 de Enero de 2026</span>
                            <br />
                            Compromiso total con la seguridad de sus activos de datos clínicos.
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
                                        Responsable de los Datos
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light text-lg">
                                    <strong className="text-white font-bold">GPMedical S.A. de C.V.</strong> (en adelante "MediFlow"), con domicilio en Ciudad de México, México, es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
                                </p>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        02
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Datos Personales Obtenidos
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales procesados bajo protocolos de alta seguridad:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'Datos de identificación y contacto',
                                        'Datos laborales y académicos',
                                        'Datos patrimoniales o financieros',
                                        'Datos biométricos (Identidad Digital)',
                                        'Datos de salud (Expediente Clínico)',
                                        'Antecedentes médicos y laborales'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-300 bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-medium uppercase tracking-wider">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl group">
                                    <div className="flex items-start gap-4">
                                        <Activity className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                        <p className="text-sm text-emerald-100/70 leading-relaxed italic">
                                            <strong className="text-emerald-400 font-bold block mb-1">TRATAMIENTO DE DATOS SENSIBLES</strong>
                                            Trataremos datos sensibles relacionados con su estado de salud presente y futuro, los cuales serán resguardados bajo estrictas medidas de seguridad conforme a la <span className="text-emerald-300">NOM-024-SSA3-2012</span> y la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        03
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Finalidades del Tratamiento
                                    </h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Finalidades Primarias</h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Prestación de servicios médicos integrales',
                                                'Creación y conservación del expediente clínico',
                                                'Emisión de certificados de aptitud laboral',
                                                'Gestión de citas y recordatorios',
                                                'Facturación y procesos administrativos'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Finalidades Secundarias</h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Análisis estadísticos y Big Data (Anonimizado)',
                                                'Encuestas de optimización de calidad',
                                                'Información sobre actualizaciones de servicios'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        04
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Derechos ARCO
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    Usted tiene derecho a conocer qué datos personales tenemos, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección, eliminación u oposición de su información personal.
                                </p>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Ejecución de Protocolo ARCO</h3>
                                    <p className="text-sm text-slate-500 mb-6 font-light">
                                        Para ejercer sus derechos, deberá remitir su solicitud al departamento de integridad de datos:
                                    </p>
                                    <a href="mailto:privacidad@gpmedical.com" className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        <Terminal className="w-4 h-4" />
                                        privacidad@gpmedical.com
                                    </a>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                        05
                                    </div>
                                    <h2 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                                        Infraestructura Tecnológica
                                    </h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    Nuestra plataforma utiliza un despliegue de seguridad con <span className="text-white font-medium italic">SSL Certification</span>, encriptación de grado militar y monitoreo de integridad en tiempo real para proteger su comportamiento como usuario y sus activos clínicos.
                                </p>
                            </section>

                            <div className="border-t border-white/5 pt-12 mt-12 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Lock className="w-8 h-8 text-emerald-500/50" />
                                </div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] max-w-2xl leading-relaxed italic">
                                    Este sitio web utiliza arquitectura de cifrado distribuido. Al utilizar nuestros servicios médicos, el usuario inicializa el protocolo de aceptación de este Aviso de Privacidad Integral.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <HomeFooter />
        </div>
    );
}
