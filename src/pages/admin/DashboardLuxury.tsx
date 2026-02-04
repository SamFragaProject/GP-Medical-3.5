/**
 * Dashboard Super Admin - Luxury "God Mode"
 * 
 * Interfaz de alto nivel estilo sci-fi / cyberpunk médico.
 * Fondo oscuro profundo, glassmorphism, visualización de datos en tiempo real.
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell, Settings, Search, LayoutGrid, Users,
    Activity, Calendar, ChevronRight, Zap, Shield,
    Menu, User, Thermometer
} from 'lucide-react'
import { AnatomyViewer } from '@/components/medical/AnatomyViewer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

// =============================================
// COMPONENTES AUXILIARES (WIDGETS)
// =============================================

const StatCard = ({ label, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-colors">
                <Icon className="w-5 h-5 text-cyan-400" />
            </div>
            {trend && (
                <span className={`text-xs font-mono px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        {subtext && <p className="text-[10px] text-gray-500 mt-2">{subtext}</p>}
    </div>
)

const PatientList = () => (
    <div className="space-y-3">
        {[
            { name: 'Ruben George', status: 'En Observación', img: 'https://i.pravatar.cc/150?u=12', time: '10:42 AM' },
            { name: 'Sarah Miller', status: 'Estable', img: 'https://i.pravatar.cc/150?u=23', time: '09:15 AM' },
            { name: 'Mike Ross', status: 'Crítico', img: 'https://i.pravatar.cc/150?u=34', time: '08:30 AM' },
        ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={p.img} />
                        <AvatarFallback>P{i}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-gray-200">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.time}</p>
                    </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${p.status === 'Crítico' ? 'bg-red-500 shadow-red-500/50 shadow-lg' : p.status === 'En Observación' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </div>
        ))}
    </div>
)

// =============================================
// MAIN DASHBOARD
// =============================================

export default function DashboardLuxury() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-200 font-sans overflow-hidden">

            {/* Background ambient lighting */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000"></div>
            </div>

            {/* Top Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                GPMedical <span className="text-cyan-500">EX</span>
                            </h1>
                        </div>
                    </div>

                    {/* Admin Quick Links */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                        {[
                            { label: 'Dashboard', href: '/admin/luxury-dashboard', active: true },
                            { label: 'Empresas', href: '/admin/empresas' },
                            { label: 'Usuarios', href: '/admin/usuarios' },
                            { label: 'Roles', href: '/admin/roles' },
                            { label: 'Configuración', href: '/configuracion' },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${item.active
                                    ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Extra Admin Links */}
                    <div className="hidden lg:flex items-center gap-2 text-xs">
                        <a href="/pacientes" className="px-3 py-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Pacientes
                        </a>
                        <a href="/agenda" className="px-3 py-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Agenda
                        </a>
                        <a href="/reportes" className="px-3 py-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all flex items-center gap-1">
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Reportes
                        </a>
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]"></span>
                        </button>
                        <a href="/configuracion" className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </a>
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-medium text-white">{user?.nombre || 'Super Admin'}</p>
                            <p className="text-xs text-cyan-500">Super Admin • God Mode</p>
                        </div>
                        <Avatar className="h-10 w-10 ring-2 ring-cyan-500/30 ring-offset-2 ring-offset-[#050505]">
                            <AvatarImage src={user?.avatar_url} />
                            <AvatarFallback className="bg-cyan-900 text-cyan-200">SA</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </nav>

            {/* Main Content Grid */}
            <main className="relative z-10 p-8 grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">

                {/* Left Column: Quick Stats & Patients */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Patient Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-lg font-semibold text-white">Paciente Activo</h2>
                            <button className="text-gray-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16 border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                <AvatarImage src="https://i.pravatar.cc/150?u=12" />
                                <AvatarFallback>RG</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-bold text-white">Ruben George</h3>
                                <p className="text-sm text-gray-400">36 años • Masculino</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-gray-500 mb-1">Altura</p>
                                <p className="text-sm font-mono text-cyan-400">182 cm</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-gray-500 mb-1">Peso</p>
                                <p className="text-sm font-mono text-cyan-400">82 kg</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-gray-500 mb-1">Sangre</p>
                                <p className="text-sm font-mono text-cyan-400">O+</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-gray-500 mb-1">Alergias</p>
                                <p className="text-sm font-mono text-red-400">Ninguna</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Appointments List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                    >
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 mt-2">Próximos Pacientes</h3>
                        <PatientList />
                    </motion.div>
                </div>

                {/* Center Column: Anatomy Viewer */}
                <div className="col-span-12 lg:col-span-6 flex flex-col h-full relative">
                    {/* Floating Tabs */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-1 flex gap-1">
                        {['Body Scan', 'Nervous', 'Skeletal', 'Organs'].map((mode, i) => (
                            <button
                                key={mode}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${i === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <AnatomyViewer />
                </div>

                {/* Right Column: Analytics & Details */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full text-white">
                    {/* Detailed Analysis */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Análisis en Tiempo Real</h2>
                            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/10">LIVE</Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Actividad Neuronal</span>
                                    <span className="text-emerald-400">Estable</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "92%" }}
                                        transition={{ duration: 2, delay: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Saturación Oxígeno</span>
                                    <span className="text-cyan-400">98%</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-cyan-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "98%" }}
                                        transition={{ duration: 2, delay: 0.7 }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Presión Arterial</span>
                                    <span className="text-amber-400">125/82</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-amber-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "75%" }}
                                        transition={{ duration: 2, delay: 0.9 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Grid de Métricas */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <StatCard icon={Users} label="Total Citas" value="1,284" trend={12} />
                        <StatCard icon={Thermometer} label="Críticos" value="3" trend={-5} />
                        <StatCard icon={Activity} label="Eficiencia" value="94%" trend={2} />
                        <StatCard icon={Zap} label="Tiempo Prom." value="15m" subtext="por consulta" />
                    </motion.div>

                    {/* System Log */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-gray-500 overflow-hidden"
                    >
                        <p className="text-cyan-500 mb-2">[SYSTEM LOG]</p>
                        <div className="space-y-1">
                            <p>&gt; Initializing core systems...</p>
                            <p>&gt; Loading patient database... [OK]</p>
                            <p>&gt; Connecting neural interface... [OK]</p>
                            <p>&gt; <span className="text-emerald-500">System Ready.</span></p>
                            <p className="animate-pulse">&gt; Awaiting input_</p>
                        </div>
                    </motion.div>
                </div>

            </main>
        </div>
    )
}
