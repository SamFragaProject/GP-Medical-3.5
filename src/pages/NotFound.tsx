import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative z-10 max-w-lg w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="relative inline-block">
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Ghost size={120} className="text-emerald-500 opacity-20 mx-auto" strokeWidth={1} />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-9xl font-black italic tracking-tighter text-white/5 selec-none">404</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                        <ShieldAlert className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Protocolo de Error: 404</span>
                    </div>

                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">
                        Página no <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Encontrada</span>
                    </h1>

                    <p className="text-slate-400 font-light text-lg mb-10 leading-relaxed">
                        Parece que has intentado acceder a un area restringida o inexistente del ecosistema médico. Verifica la URL o regresa al inicio.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 rounded-2xl px-8 uppercase font-black text-[10px] tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver atrás
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-8 shadow-[0_0_20px_rgba(16,185,129,0.2)] uppercase font-black text-[10px] tracking-widest"
                        >
                            <Home className="w-4 h-4 mr-2" /> Ir al Inicio
                        </Button>
                    </div>
                </motion.div>

                <div className="mt-16 text-slate-600">
                    <p className="text-[8px] uppercase tracking-[0.5em] font-black italic">
                        MediFlow OS v3.5 &copy; 2026 GPMedical Security Systems
                    </p>
                </div>
            </div>
        </div>
    );
}
