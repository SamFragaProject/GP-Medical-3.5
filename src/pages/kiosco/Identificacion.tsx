import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KioscoLayout } from '@/layouts/KioscoLayout'
import { Fingerprint, Search, Smartphone, User, CheckCircle2, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { receptionService } from '@/services/receptionService'
import { useAuth } from '@/contexts/AuthContext'

type Method = 'curp' | 'phone' | 'qr'

export default function Identificacion() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [method, setMethod] = useState<Method>('curp')
    const [value, setValue] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [foundPaciente, setFoundPaciente] = useState<any>(null)

    const handleSearch = async () => {
        if (!value) return
        setIsSearching(true)

        // Simulación de búsqueda de paciente
        setTimeout(() => {
            // Demo: si el valor es 'demo', encontramos a alguien
            if (value.toLowerCase().includes('demo') || value.length > 5) {
                setFoundPaciente({
                    id: 'p-123',
                    nombre: 'Juan Carlos Pérez González',
                    curp: 'PEGO850101HDFRGR01',
                    ultima_cita: 'Hoy, 10:30 AM'
                })
            } else {
                toast.error('No encontramos registros con esos datos. Por favor, revisa o regístrate como nuevo.')
            }
            setIsSearching(false)
        }, 1500)
    }

    const handleConfirm = async () => {
        try {
            await receptionService.checkIn({
                paciente_id: foundPaciente.id,
                empresa_id: user?.empresa_id || '00000000-0000-0000-0000-000000000000',
                tipo_registro: 'cita_previa',
                prioridad: 'normal',
                estado: 'espera',
                motivo_visita: 'Cita programada (Kiosco)',
                metadata: {
                    source: 'kiosco_id',
                    nombre_paciente: foundPaciente.nombre
                }
            });
            toast.success('¡Check-in completado! Por favor, toma asiento.');
            navigate('/kiosco');
        } catch (error) {
            console.error('Check-in error:', error);
            toast.error('Error al realizar check-in. Por favor acude a recepción.');
        }
    }

    return (
        <KioscoLayout
            title="Identificación"
            subtitle="Busca tus datos para realizar el Check-in"
            onBack={() => navigate('/kiosco')}
            onHome={() => navigate('/kiosco')}
            icon={Fingerprint}
        >
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Method Selector */}
                <div className="grid grid-cols-3 gap-6">
                    {(['curp', 'phone', 'qr'] as Method[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMethod(m); setFoundPaciente(null); setValue(''); }}
                            className={`p-8 rounded-[30px] border transition-all flex flex-col items-center gap-4 ${method === m
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20'
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            {m === 'curp' && <User className="w-10 h-10" />}
                            {m === 'phone' && <Smartphone className="w-10 h-10" />}
                            {m === 'qr' && <QrCode className="w-10 h-10" />}
                            <span className="text-xl font-bold tracking-tight uppercase">
                                {m === 'curp' ? 'CURP' : m === 'phone' ? 'Teléfono' : 'Código QR'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <AnimatePresence mode="wait">
                    {!foundPaciente ? (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm space-y-8"
                        >
                            <div className="space-y-4">
                                <label className="text-2xl font-bold text-white/50 block">
                                    {method === 'curp' ? 'Ingresa tu CURP' : method === 'phone' ? 'Ingresa tu Número Celular' : 'Escanea tu código QR'}
                                </label>
                                <div className="relative">
                                    <Input
                                        className="h-24 text-4xl bg-black/40 border-white/20 rounded-3xl px-8 focus:border-emerald-500/50 transition-all font-mono tracking-widest"
                                        placeholder={method === 'curp' ? 'XXXX000000XXXXXX00' : '55 0000 0000'}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value.toUpperCase())}
                                        autoFocus
                                    />
                                    {method === 'qr' && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/5 rounded-2xl">
                                            <QrCode className="w-10 h-10 text-white/20 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || !value}
                                className="w-full h-24 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-3xl font-bold shadow-2xl shadow-emerald-900/20 transition-all active:scale-95"
                            >
                                {isSearching ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Buscando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <Search className="w-8 h-8" />
                                        <span>Confirmar Identidad</span>
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-12 rounded-[40px] bg-emerald-500 text-white shadow-2xl space-y-8"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-5xl font-bold mb-2">¡Hola, {foundPaciente.nombre.split(' ')[0]}!</h3>
                                    <p className="text-2xl text-white/80 font-medium">Hemos encontrado tu registro.</p>
                                </div>
                                <CheckCircle2 className="w-20 h-20 text-white/40" />
                            </div>

                            <div className="bg-black/10 rounded-3xl p-8 space-y-4">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-white/60 text-xl font-medium">CURP</span>
                                    <span className="text-2xl font-bold font-mono tracking-wider">{foundPaciente.curp}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-white/60 text-xl font-medium">Próxima Cita</span>
                                    <span className="text-2xl font-bold">{foundPaciente.ultima_cita}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setFoundPaciente(null)}
                                    variant="ghost"
                                    className="h-20 flex-1 rounded-2xl bg-white/10 hover:bg-white/20 text-xl font-bold"
                                >
                                    Corregir Datos
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    className="h-20 flex-1 rounded-2xl bg-white text-emerald-600 hover:bg-slate-100 text-xl font-bold shadow-xl"
                                >
                                    Confirmar Check-in
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </KioscoLayout>
    )
}
