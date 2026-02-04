import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShieldCheck,
    ChevronRight,
    Activity,
    Lock,
    Mail,
    User,
    Building2,
    Terminal,
    Network,
    Fingerprint,
    Zap,
    ArrowLeft,
    Briefcase,
    UserPlus
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom';

/**
 * Register Premium Redesigned - Estética "CUDA/Vercel Dark"
 */
export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState<'paciente' | 'admin_empresa'>('paciente')

    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        email: '',
        password: '',
        confirmPassword: '',
        nombre_empresa: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Las contraseñas no coinciden')
        }

        if (formData.password.length < 6) {
            return toast.error('La contraseña debe tener al menos 6 caracteres')
        }

        setLoading(true)
        try {
            const metadata = {
                nombre: formData.nombre,
                apellido_paterno: formData.apellido_paterno,
                rol: role,
                ...(role === 'admin_empresa' && { nombre_empresa: formData.nombre_empresa })
            }

            await register(formData.email, formData.password, metadata)
            // If registration is successful and creates a session, AuthContext handles it.
            // If it requires email verification, we might stay here or go to a success page.
            // For now, let's assume successful JIT login or redirect.
            navigate('/dashboard');
        } catch (error) {
            // Error handled by AuthContext toast
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-emerald-500/30 overflow-hidden relative">
            {/* Background Architecture */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Technical Info */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:flex flex-col space-y-12"
                >
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <UserPlus className="w-7 h-7 text-black" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white italic tracking-tighter">
                                    JOIN <span className="text-emerald-400">GPMEDICAL</span>
                                </h1>
                                <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Network Expansion Protocol
                                </p>
                            </div>
                        </div>

                        <h2 className="text-5xl font-black text-white leading-tight tracking-tighter italic uppercase">
                            Crea tu <br />
                            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Perfil Clínico</span>
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-md leading-relaxed">
                            Únetea la infraestructura médica más avanzada de Latinoamérica. Gestión de salud transparente, segura y en tiempo real.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-emerald-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest italic">Privacidad de Grado Médico</h4>
                                <p className="text-slate-500 text-sm font-light mt-1">Cumplimiento total con la NOM-024 y estándares internacionales ISO 27001.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-cyan-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest italic">IA Diagnóstica</h4>
                                <p className="text-slate-500 text-sm font-light mt-1">Acceso inmediato a herramientas de predicción de riesgos y análisis clínico.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Register Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-3xl opacity-50" />

                    <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-8 lg:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden group max-h-[90vh] overflow-y-auto">
                        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                                    <Terminal className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">New_User_Initialization</span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Registro</h3>
                                <p className="text-slate-400 text-sm font-light mt-2">Seleccione su tipo de nodo y complete los datos</p>
                            </div>

                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('paciente')}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'paciente'
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    <User className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Paciente</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin_empresa')}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'admin_empresa'
                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    <Building2 className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Empresa</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nombre</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                placeholder="John"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Appelido</label>
                                            <input
                                                type="text"
                                                name="apellido_paterno"
                                                value={formData.apellido_paterno}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {role === 'admin_empresa' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nombre Empresa</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="nombre_empresa"
                                                    value={formData.nombre_empresa}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                                                    placeholder="TechCorp S.A."
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                placeholder="user@gpmedical.mx"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                    placeholder="••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Confirm</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-medium focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                    placeholder="••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${role === 'paciente'
                                            ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                                            : 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_50px_rgba(6,182,212,0.4)]'
                                        }`}
                                >
                                    {loading ? (
                                        <Activity className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Initialize Account
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                    ¿Ya tienes una cuenta? <br />
                                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Identificarse en el Nodo</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
