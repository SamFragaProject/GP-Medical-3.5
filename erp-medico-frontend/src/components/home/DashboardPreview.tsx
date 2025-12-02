import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Users,
    Calendar,
    Bell,
    Search,
    Menu,
    MoreVertical,
    TrendingUp,
    Heart,
    Shield
} from 'lucide-react';

export function DashboardPreview() {
    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
                        Una interfaz diseñada para
                        <span className="block text-blue-600">profesionales de la salud</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Potente, intuitiva y hermosa. Todo lo que necesitas a un clic de distancia.
                    </p>
                </motion.div>

                {/* Browser Window Container */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative max-w-6xl mx-auto"
                    style={{ perspective: '1000px' }}
                >
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                        {/* Window Header */}
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 bg-white h-8 rounded-md border border-slate-200 flex items-center px-3 text-xs text-slate-400">
                                app.mediflow.mx/dashboard
                            </div>
                        </div>

                        {/* App Interface Mockup */}
                        <div className="flex h-[600px] bg-slate-50">
                            {/* Sidebar Mockup */}
                            <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-lg">MediFlow</span>
                                </div>
                                <div className="space-y-2">
                                    {['Dashboard', 'Pacientes', 'Agenda', 'Exámenes', 'Reportes'].map((item, i) => (
                                        <div key={item} className={`p-3 rounded-xl flex items-center gap-3 ${i === 0 ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-slate-600'}`} />
                                            <span className={i === 0 ? 'font-medium' : 'text-slate-400'}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content Mockup */}
                            <div className="flex-1 p-8 overflow-hidden">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">Dashboard General</h3>
                                        <p className="text-slate-500">Bienvenido de nuevo, Dr. Ramírez</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-2 bg-white border border-slate-200 rounded-full">
                                            <Search className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="p-2 bg-white border border-slate-200 rounded-full relative">
                                            <Bell className="w-5 h-5 text-slate-400" />
                                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    {[
                                        { label: 'Pacientes Hoy', value: '24', icon: Users, color: 'bg-blue-500' },
                                        { label: 'Citas Pendientes', value: '8', icon: Calendar, color: 'bg-purple-500' },
                                        { label: 'Eficiencia', value: '94%', icon: Activity, color: 'bg-green-500' },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + i * 0.1 }}
                                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 ${stat.color} bg-opacity-10 rounded-xl`}>
                                                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                                </div>
                                                <MoreVertical className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                            <div className="text-sm text-slate-500">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Content Area with Charts */}
                                <div className="grid grid-cols-3 gap-6 h-full">
                                    <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-bold text-slate-900">Actividad Semanal</h4>
                                            <div className="text-sm text-slate-400">Últimos 7 días</div>
                                        </div>
                                        <div className="flex items-end justify-between h-48 gap-4">
                                            {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${h}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                    className="w-full bg-blue-500/10 rounded-t-lg relative group"
                                                >
                                                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600" style={{ height: '100%' }} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                        <h4 className="font-bold text-slate-900 mb-6">Próximas Citas</h4>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                                    <div>
                                                        <div className="font-medium text-sm text-slate-900">Paciente #{i + 10}</div>
                                                        <div className="text-xs text-slate-500">10:00 AM - Consulta</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements for 3D effect */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -right-12 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden lg:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">100% Seguro</div>
                                <div className="text-xs text-slate-500">Datos encriptados</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                        className="absolute -left-12 bottom-40 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden lg:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">+45%</div>
                                <div className="text-xs text-slate-500">Productividad</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
