import React from 'react'
import { motion } from 'framer-motion'
import { KioscoLayout } from '@/layouts/KioscoLayout'
import { Fingerprint, UserPlus, QrCode, ArrowRight, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function KioscoHome() {
    const navigate = useNavigate()

    const options = [
        {
            id: 'checkin',
            title: 'Ya tengo una Cita',
            description: 'Ingresa con tu CURP, Teléfono o Código QR enviado a tu celular.',
            icon: Fingerprint,
            color: 'from-emerald-600 to-teal-700',
            action: () => navigate('/kiosco/identificacion')
        },
        {
            id: 'new',
            title: 'Soy un Paciente Nuevo',
            description: 'Regístrate por primera vez para recibir atención médica hoy.',
            icon: UserPlus,
            color: 'from-blue-600 to-indigo-700',
            action: () => navigate('/kiosco/registro')
        }
    ]

    return (
        <KioscoLayout
            title="Bienvenido a GPMedical"
            subtitle="Por favor, selecciona una opción para continuar"
            showBackButton={false}
        >
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12">
                {/* Animated Icon Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {options.map((option, idx) => (
                        <motion.button
                            key={option.id}
                            onClick={option.action}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative overflow-hidden group p-10 rounded-[40px] border border-white/10 bg-white/5 text-left transition-all hover:bg-white/[0.08] flex flex-col h-[400px] justify-between shadow-2xl`}
                        >
                            {/* Decorative Gradient Background */}
                            <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-20 blur-[60px] transition-opacity duration-700`} />

                            <div className="relative z-10">
                                <div className={`w-24 h-24 rounded-[30px] bg-gradient-to-br ${option.color} flex items-center justify-center mb-8 shadow-xl shadow-black/40`}>
                                    <option.icon className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold mb-4 tracking-tight">{option.title}</h2>
                                <p className="text-xl text-white/50 leading-relaxed font-medium">
                                    {option.description}
                                </p>
                            </div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                                        <QrCode className="w-5 h-5 text-white/40" />
                                        <span className="text-sm font-bold tracking-widest uppercase text-white/40">Soporte QR</span>
                                    </div>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                                    <ArrowRight className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Support Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-8 px-8 py-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 text-emerald-400">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-bold text-lg">Privacidad Garantizada</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <p className="text-white/40 font-medium">
                        Si necesitas ayuda, pide asistencia al personal en recepción.
                    </p>
                </motion.div>
            </div>
        </KioscoLayout>
    )
}
