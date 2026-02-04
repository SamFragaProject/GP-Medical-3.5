import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { KioscoLayout } from '@/layouts/KioscoLayout'
import { ShieldCheck, Eraser, CheckCircle2, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { receptionService } from '@/services/receptionService'
import { useAuth } from '@/contexts/AuthContext'

export default function FirmaConsento() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const location = useLocation()
    const patientData = location.state as { nombre: string; apellido: string } | null
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSigned, setHasSigned] = useState(false)

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#fff'
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
        setHasSigned(true)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSigned(false)
    }

    const handleFinish = async () => {
        try {
            // Simulamos el registro en la cola para nuevo paciente
            // En producción aquí se crearía primero el registro en 'pacientes'
            await receptionService.checkIn({
                empresa_id: user?.empresa_id || '00000000-0000-0000-0000-000000000000',
                tipo_registro: 'nuevo_paciente',
                prioridad: 'normal',
                estado: 'espera',
                motivo_visita: 'Nueva Afiliación / Primera Cita',
                metadata: {
                    source: 'kiosco_self_reg',
                    nombre_paciente: patientData ? `${patientData.nombre} ${patientData.apellido}` : 'Nuevo Paciente'
                }
            });
            toast.success('¡Registro completado! Por favor, espera a ser llamado en la sala.');
            navigate('/kiosco');
        } catch (error) {
            console.error('Check-in error:', error);
            toast.error('Error al finalizar registro. Por favor acude a recepción.');
        }
    }

    return (
        <KioscoLayout
            title="Consentimiento y Privacidad"
            subtitle="Lee y firma para finalizar tu registro"
            onBack={() => navigate('/kiosco/registro')}
            onHome={() => navigate('/kiosco')}
            icon={ShieldCheck}
        >
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Document Viewer */}
                <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm space-y-6 flex flex-col h-[600px]">
                    <div className="flex items-center gap-3 text-emerald-400 border-b border-white/10 pb-4">
                        <FileText className="w-8 h-8" />
                        <h3 className="text-2xl font-bold">Aviso de Privacidad</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-white/60 text-lg leading-relaxed space-y-4">
                        <p className="font-bold text-white">Última actualización: 26 de Enero, 2026</p>
                        <p>
                            GPMedical, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, informa que sus datos personales serán utilizados exclusivamente para la prestación de servicios médicos y de salud.
                        </p>
                        <p>
                            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstos en la normativa (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
                        </p>
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
                            <p className="text-sm font-medium">Al firmar, usted acepta que ha leído y comprendido los términos y condiciones de este aviso de privacidad.</p>
                        </div>
                    </div>
                </div>

                {/* Signature Area */}
                <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-sm space-y-6 flex flex-col h-[600px]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-2xl font-bold">Firma Digital</h3>
                        <Button
                            variant="ghost"
                            onClick={clearCanvas}
                            className="text-white/40 hover:text-rose-400 gap-2 font-bold uppercase tracking-wider text-xs"
                        >
                            <Eraser className="w-4 h-4" /> Limpiar
                        </Button>
                    </div>

                    <div className="flex-1 bg-black/40 rounded-[30px] border border-white/20 relative overflow-hidden touch-none">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={400}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-full cursor-crosshair"
                        />
                        {!hasSigned && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="text-2xl font-bold tracking-[0.5em] text-white rotate-[-10deg]">FIRME AQUÍ</span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleFinish}
                        disabled={!hasSigned}
                        className={`w-full h-24 rounded-3xl text-3xl font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${hasSigned ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                            }`}
                    >
                        <CheckCircle2 className="w-8 h-8" />
                        <span>Finalizar Registro</span>
                    </Button>
                </div>
            </div>
        </KioscoLayout>
    )
}
