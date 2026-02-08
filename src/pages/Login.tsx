import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  ChevronRight,
  Activity,
  Lock,
  Mail,
  Sparkles,
  Zap,
  HeartPulse,
  UserCheck,
  Stethoscope,
  Building2,
  Cpu,
  Fingerprint,
  Terminal,
  Network
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';
import { useMeta } from '@/hooks/useMeta';

/**
 * Login Premium Redesigned - Estética "CUDA/Vercel Dark"
 */
export default function Login() {
  useMeta({
    title: 'Autenticación Segura',
    description: 'Acceso seguro al panel de control de GPMedical MediFlow. Gestión de activos clínicos y protocolos de salud.'
  });
  const { login } = useAuth()
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Se requieren credenciales de acceso')

    setLoading(true)
    try {
      await login(email, password)
      // AuthContext handles state, Navigate is safer than window.location.href
      navigate('/dashboard');
    } catch (error) {
      // Error already handled by AuthContext toast
    } finally {
      setLoading(false)
    }
  }

  const demoProfiles = [
    {
      id: 'super',
      label: 'SUPER_ADMIN',
      subtitle: 'GPMedical Platform',
      email: 'superadmin@gpmedical.mx',
      pass: 'admin123',
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      id: 'admin_mediwork',
      label: 'ADMIN_EMPRESA',
      subtitle: 'MediWork Ocupacional',
      email: 'admin@mediwork.mx',
      pass: 'admin123',
      icon: Building2,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      id: 'medico',
      label: 'MÉDICO',
      subtitle: 'Dr. Roberto Martínez',
      email: 'dr.martinez@mediwork.mx',
      pass: 'medico123',
      icon: Stethoscope,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      id: 'recepcion',
      label: 'RECEPCIÓN',
      subtitle: 'Patricia Torres',
      email: 'recepcion@mediwork.mx',
      pass: 'recepcion123',
      icon: UserCheck,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'demo',
      label: 'DEMO_USER',
      subtitle: 'Clínica Demo',
      email: 'demo@gpmedical.mx',
      pass: 'demo123',
      icon: HeartPulse,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
  ]

  const selectProfile = (p: typeof demoProfiles[0]) => {
    setEmail(p.email)
    setPassword(p.pass)
    toast.success(`🔐 ${p.label} cargado: ${p.subtitle}`, {
      style: {
        background: '#020617',
        color: '#fff',
        border: '1px solid #10b981'
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Background Architecture */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full" />
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Activity className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white italic tracking-tighter">
                  GP<span className="text-emerald-400">MEDICAL</span>
                </h1>
                <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Secure Authentication Node
                </p>
              </div>
            </div>

            <h2 className="text-5xl font-black text-white leading-tight tracking-tighter italic uppercase">
              Acceso al <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Centro de Control</span>
            </h2>
            <p className="text-slate-400 font-light text-lg max-w-md leading-relaxed">
              Inicialice su sesión para gestionar activos clínicos y protocolos de salud corporativa en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
              <Network className="w-6 h-6 text-emerald-400 mb-4" />
              <p className="text-2xl font-black text-white tracking-tighter italic">99.9%</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime Garantizado</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
              <Fingerprint className="w-6 h-6 text-cyan-400 mb-4" />
              <p className="text-2xl font-black text-white tracking-tighter italic">E2E</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cifrado de Extremo a Extremo</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?u=${i}`}
                  className="w-8 h-8 rounded-full border-2 border-[#020617] grayscale"
                  alt="user"
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
              +2,400 especialistas activos en la red
            </p>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-3xl opacity-50" />

          <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-8 lg:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden group">
            {/* Technical Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Secure_Protocol_v3.5</span>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Autenticación</h3>
                <p className="text-slate-400 text-sm font-light mt-2">Ingrese sus credenciales de acceso</p>
              </div>

              {/* Demo Profiles */}
              <div className="grid grid-cols-5 gap-2">
                {demoProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => selectProfile(profile)}
                    className={`p-2 rounded-xl ${profile.bg} ${profile.border} border transition-all hover:scale-105 group/btn flex flex-col items-center gap-1`}
                  >
                    <profile.icon className={`w-4 h-4 ${profile.color} group-hover/btn:animate-pulse`} />
                    <span className={`text-[7px] font-black uppercase tracking-tighter ${profile.color} leading-tight text-center`}>{profile.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Credentials</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email_Identifier</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-700"
                        placeholder="user@gpmedical.node"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security_Phrase</label>
                      <button type="button" className="text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">Recover_Access?</button>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white font-medium focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-700"
                        placeholder="••••••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-emerald-500 text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Initialize Protocol
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="pt-6 text-center">
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest leading-relaxed">
                  By accessing this node, you agree to the <br />
                  <span className="text-slate-400 cursor-pointer hover:text-emerald-400 transition-colors">Corporate Security Policies</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div >

      {/* Floating HUD Elements */}
      < div className="fixed bottom-10 left-10 hidden xl:block" >
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Integrity Verified</span>
        </div>
      </div >
    </div >
  )
}
