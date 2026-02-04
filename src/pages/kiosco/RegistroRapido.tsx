import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { KioscoLayout } from '@/layouts/KioscoLayout'
import { UserPlus, Save, ArrowRight, User, Mail, Smartphone, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function RegistroRapido() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        curp: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        genero: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
    }

    const handleNext = () => {
        if (step === 1 && (!formData.nombre || !formData.apellido || !formData.curp)) {
            toast.error('Nombre y CURP son obligatorios')
            return
        }
        if (step < 2) setStep(step + 1)
        else navigate('/kiosco/firma', { state: { nombre: formData.nombre, apellido: formData.apellido } })
    }

    return (
        <KioscoLayout
            title="Registro de Paciente Nuevo"
            subtitle={`Paso ${step} de 2: ${step === 1 ? 'Datos Personales' : 'Contacto'}`}
            onBack={() => step > 1 ? setStep(step - 1) : navigate('/kiosco')}
            onHome={() => navigate('/kiosco')}
            icon={UserPlus}
        >
            <div className="max-w-4xl mx-auto">
                <div className="p-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm space-y-12">

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-2 gap-8"
                            >
                                <div className="col-span-1 space-y-4">
                                    <label className="text-xl font-bold text-white/40 flex items-center gap-2">
                                        <User className="w-5 h-5" /> Nombre(s)
                                    </label>
                                    <Input
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className="h-20 text-3xl bg-black/40 border-white/20 rounded-2xl px-6"
                                        placeholder="Ej. JUAN"
                                    />
                                </div>
                                <div className="col-span-1 space-y-4">
                                    <label className="text-xl font-bold text-white/40 flex items-center gap-2">
                                        <User className="w-5 h-5" /> Apellidos
                                    </label>
                                    <Input
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        className="h-20 text-3xl bg-black/40 border-white/20 rounded-2xl px-6"
                                        placeholder="Ej. PÉREZ"
                                    />
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <label className="text-xl font-bold text-white/40 flex items-center gap-2">
                                        <Fingerprint className="w-5 h-5" /> CURP
                                    </label>
                                    <Input
                                        name="curp"
                                        value={formData.curp}
                                        onChange={handleChange}
                                        className="h-20 text-3xl bg-black/40 border-white/20 rounded-2xl px-6 font-mono tracking-widest"
                                        placeholder="XXXX000000XXXXXX00"
                                        maxLength={18}
                                    />
                                </div>
                                <div className="col-span-1 space-y-4">
                                    <label className="text-xl font-bold text-white/40 flex items-center gap-2">
                                        <Calendar className="w-5 h-5" /> Fecha de Nacimiento
                                    </label>
                                    <Input
                                        name="fecha_nacimiento"
                                        type="date"
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
                                        className="h-20 text-3xl bg-black/40 border-white/20 rounded-2xl px-6"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-2 gap-8"
                            >
                                <div className="col-span-1 space-y-4">
                                    <label className="text-xl font-bold text-white/40 flex items-center gap-2">
                                        <Smartphone className="w-5 h-5" /> Teléfono Celular
                                    </label>
                                    <Input
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="h-20 text-3xl bg-black/40 border-white/20 rounded-2xl px-6"
                                        placeholder="55 0000 0000"
                                    />
                                </div>
                                <div className="col-span-1 space-y-4">
                                    <label className="text-xl font-bold text-white/40 flex items-center gap-2">
                                        <Mail className="w-5 h-5" /> Correo Electrónico
                                    </label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-20 text-3xl bg-black/40 border-white/20 rounded-2xl px-6"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                                <div className="col-span-2 p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <div className="flex items-center gap-4">
                                        <MapPin className="w-8 h-8" />
                                        <div>
                                            <p className="text-xl font-bold">Ubicación Actual</p>
                                            <p className="text-lg opacity-80">Tu dirección será solicitada por el médico durante la consulta.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={handleNext}
                        className="w-full h-24 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-3xl font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                        <span>{step === 1 ? 'Continuar' : 'Ir a Firma de Consentimiento'}</span>
                        <ArrowRight className="w-8 h-8" />
                    </Button>

                </div>
            </div>
        </KioscoLayout>
    )
}

import { Fingerprint } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
