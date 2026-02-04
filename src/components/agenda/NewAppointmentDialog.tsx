import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    FileText,
    Plus,
    Activity,
    CheckCircle2
} from 'lucide-react'
import { citasService } from '@/services/dataService'
import toast from 'react-hot-toast'

interface NewAppointmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    defaultDate?: Date
}

export function NewAppointmentDialog({ open, onOpenChange, onSuccess, defaultDate }: NewAppointmentDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        paciente_id: '1',
        fecha: defaultDate ? defaultDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        hora_inicio: '09:00',
        tipo: 'consulta',
        notas: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await citasService.create({
                ...formData,
                empresa_id: 'mock-empresa-1',
                estado: 'programada'
            })
            toast.success('Cita programada correctamente')
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error('Error al agendar cita')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
                {/* Header Premium */}
                <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Nueva Cita Médica</DialogTitle>
                            <p className="text-blue-100 text-xs opacity-90">Programación de consulta para paciente.</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    {/* Paciente */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Paciente</Label>
                        <Select defaultValue="1" onValueChange={(v) => setFormData({ ...formData, paciente_id: v })}>
                            <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <SelectValue placeholder="Seleccionar Paciente" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="1">Juan Pérez</SelectItem>
                                <SelectItem value="2">María González</SelectItem>
                                <SelectItem value="new">TestPlayer Automated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    className="rounded-xl pl-10 border-slate-200 bg-slate-50/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hora inicio</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="time"
                                    value={formData.hora_inicio}
                                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                    className="rounded-xl pl-10 border-slate-200 bg-slate-50/50"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tipo de Cita */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo de Servicio</Label>
                        <Select defaultValue="consulta" onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                            <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-slate-400" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="consulta">Consulta General</SelectItem>
                                <SelectItem value="examen">Examen Médico</SelectItem>
                                <SelectItem value="urgencia">Urgencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notas de la Cita</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                className="w-full min-h-[100px] rounded-xl pl-10 pt-2.5 border-slate-200 bg-slate-50/50 text-sm focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Indique el motivo o síntomas..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-12 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Activity className="animate-spin w-4 h-4" />
                                    <span>PROGRAMANDO...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>AGENDAR CITA MÉDICA</span>
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
