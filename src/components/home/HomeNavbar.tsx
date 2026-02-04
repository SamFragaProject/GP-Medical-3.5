import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function HomeNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Funciones', href: '#features' },
        { name: 'IA Engine', href: '#ai' },
        { name: 'Compliance', href: '#compliance' },
        { name: 'Soluciones', href: '#solutions' },
    ];

    const handleNavClick = (href: string) => {
        setIsMobileMenuOpen(false);
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200 py-3 shadow-sm'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Brand Hardware */}
                    <div
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => navigate('/home')}
                    >
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transition-transform hover:scale-105">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-xl font-extrabold tracking-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-800'}`}>
                                GP<span className="text-emerald-500">Medical</span>
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[7px] font-bold text-emerald-600/80 uppercase tracking-[0.3em]">Neural_Link_Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Nodes */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.href)}
                                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-emerald-600 group/link relative ${isScrolled ? 'text-slate-500' : 'text-slate-600'}`}
                            >
                                {link.name}
                                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover/link:w-full rounded-full" />
                            </button>
                        ))}
                    </div>

                    {/* Authentication Actions */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => navigate('/login')}
                            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-emerald-600 ${isScrolled ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                            Ingresar
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-colors shadow-xl shadow-slate-200 flex items-center gap-2"
                        >
                            Registrarse
                            <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>

                    {/* Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden ${isScrolled ? 'text-slate-900' : 'text-slate-800'}`}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile View */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl pt-24 px-8 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-4xl font-extrabold text-slate-900 text-left tracking-tight"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <div className="h-px w-full bg-slate-100 my-4" />
                            <button
                                onClick={() => navigate('/login')}
                                className="text-2xl font-bold text-emerald-600"
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg uppercase tracking-widest shadow-xl"
                            >
                                Registrarse Ahora
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
