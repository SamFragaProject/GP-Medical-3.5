import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Heart, Globe, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomeFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 text-slate-900 pt-32 pb-16 relative overflow-hidden">
            {/* Background Branding Overlay */}
            <div className="absolute -bottom-20 -left-20 text-[20rem] font-black text-slate-50 pointer-events-none select-none tracking-tighter">
                GPMED
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tighter">GP<span className="text-emerald-500">Medical</span></span>
                        </div>
                        <p className="text-slate-500 text-sm font-normal leading-relaxed max-w-xs">
                            Arquitectura de datos avanzada para la salud ocupacional. Potenciamos la medicina laboral con inteligencia artificial de grado clínico.
                        </p>
                        <div className="flex gap-5">
                            {[Linkedin, Twitter, Instagram].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ y: -3, color: '#10b981' }}
                                    className="text-slate-400 border border-slate-100 p-2.5 rounded-xl hover:bg-emerald-50 transition-all"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Columns */}
                    {[
                        {
                            title: 'Protocolos',
                            links: ['NOM-004-SSA3', 'NOM-024-SSA3', 'NOM-030-STPS', 'IA Engine', 'SOAP v4.0']
                        },
                        {
                            title: 'Soluciones',
                            links: ['Cloud Node', 'Security SLA', 'Dashboards', 'System Status', 'Changelog']
                        }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.2em] mb-8">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <a href="#" className="text-slate-500 hover:text-emerald-600 text-sm font-medium transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Terminal */}
                    <div>
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.2em] mb-8">Contacto</h4>
                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                                <div className="text-[9px] font-bold text-emerald-600 mb-2 tracking-widest uppercase">● Status: ONLINE</div>
                                <div className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Soporte Técnico 24/7</div>
                                <div className="text-xs text-slate-500 mt-1 font-medium italic leading-relaxed">Asistencia inmediata para coordinadores médicos.</div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer group px-2">
                                <Globe className="w-5 h-5" />
                                <span className="text-sm font-bold tracking-tight">Operaciones Globales</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 gap-8">
                    <div className="flex items-center gap-8">
                        <span className="text-xs font-bold text-slate-400 tracking-tight">
                            © {currentYear} GP<span className="text-emerald-500">Medical</span> v4.0
                        </span>
                        <div className="flex gap-6">
                            <Link to="/terminos" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-all">Términos</Link>
                            <Link to="/privacidad" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-all">Privacidad</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Sesión Encriptada E2EE</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">PowerBy</span>
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Mexico</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
