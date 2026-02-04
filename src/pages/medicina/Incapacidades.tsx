import React, { useState, useEffect } from 'react'
import {
    FileBarChart2,
    Plus,
    Printer,
    User,
    Calendar,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { prescripcionService, Incapacidad } from '@/services/prescripcionService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Incapacidades() {
    const { user } = useAuth()
    const [incapacidades, setIncapacidades] = useState<Incapacidad[]>([])
    const [isNewOpen, setIsNewOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    // Form
    const [selectedPacienteId, setSelectedPacienteId] = useState('')
    const [tipo, setTipo] = useState('enfermedad_general')
    const [dias, setDias] = useState(1)
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
    const [diagnostico, setDiagnostico] = useState('')
    const [motivo, setMotivo] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await prescripcionService.getIncapacidades('emp-1')
            setIncapacidades(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            await prescripcionService.createIncapacidad({
                paciente_id: selectedPacienteId || 'p-demo',
                empresa_id: 'emp-1',
                medico_id: user?.id,
                tipo_incapacidad: tipo as any,
                dias_autorizados: dias,
                fecha_inicio: fechaInicio,
                diagnostico_cie10: diagnostico,
                descripcion_motivo: motivo,
                estado: 'emitida'
            } as any)

            toast.success('Incapacidad generada')
            setIsNewOpen(false)
            loadData()
        } catch (error) {
            toast.error('Error al generar incapacidad')
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Gestión de Incapacidades"
                subtitle="Registro y control de días de incapacidad médica con monitoreo en tiempo real (EJE 10)"
                icon={FileBarChart2}
                badge="Cumplimiento Normativo"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PremiumMetricCard
                    title="Total Incapacidades"
                    value={incapacidades.length}
                    subtitle="Acumulado anual"
                    icon={FileBarChart2}
                    gradient="blue"
                />
                <PremiumMetricCard
                    title="Días Totales"
                    value={incapacidades.reduce((acc, i) => acc + i.dias_autorizados, 0)}
                    subtitle="Días perdidos por salud"
                    icon={Calendar}
                    gradient="amber"
                />
                <PremiumMetricCard
                    title="Riesgos de Trabajo"
                    value={incapacidades.filter(i => i.tipo_incapacidad === 'riesgo_trabajo').length}
                    subtitle="ST-7 generados"
                    icon={AlertTriangle}
                    gradient="rose"
                />
            </div>

            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div>
                        <CardTitle>Historial de Incapacidades</CardTitle>
                        <CardDescription>Registro oficial emitido</CardDescription>
                    </div>
                    <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30">
                                <Plus className="w-4 h-4 mr-2" /> Nueva Incapacidad
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <h2 className="text-xl font-bold mb-4">Emitir Incapacidad</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Paciente</Label>
                                    <Select onValueChange={setSelectedPacienteId}>
                                        <SelectTrigger><SelectValue placeholder="Buscar paciente..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="p-demo">Juan Pérez (Demo)</SelectItem>
                                            <SelectItem value="p-demo-2">María González (Demo)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Incapacidad</Label>
                                    <Select value={tipo} onValueChange={setTipo}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="enfermedad_general">Enfermedad General</SelectItem>
                                            <SelectItem value="riesgo_trabajo">Riesgo de Trabajo</SelectItem>
                                            <SelectItem value="maternidad">Maternidad</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fecha Inicio</Label>
                                        <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Días Autorizados</Label>
                                        <Input type="number" min="1" value={dias} onChange={e => setDias(parseInt(e.target.value))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Diagnóstico (CIE-10)</Label>
                                    <Input value={diagnostico} onChange={e => setDiagnostico(e.target.value)} placeholder="Ej. J00 Rinitis Aguda" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Motivo / Descripción</Label>
                                    <Textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Detalles clínicos relevantes..." />
                                </div>
                                <Button className="w-full bg-rose-600" onClick={handleSave}>Generar Documento</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-600 text-sm">
                            <tr>
                                <th className="p-3 text-left">Paciente</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-left">Inicio</th>
                                <th className="p-3 text-center">Días</th>
                                <th className="p-3 text-left">Diagnóstico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {incapacidades.map(inc => (
                                <tr key={inc.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">
                                        {/* @ts-ignore */}
                                        {inc.paciente?.nombre} {inc.paciente?.apellido_paterno}
                                    </td>
                                    <td className="p-3 capitalize text-slate-600">{inc.tipo_incapacidad.replace('_', ' ')}</td>
                                    <td className="p-3 text-slate-600">{new Date(inc.fecha_inicio).toLocaleDateString()}</td>
                                    <td className="p-3 text-center font-bold text-slate-800">{inc.dias_autorizados}</td>
                                    <td className="p-3 text-slate-500">{inc.diagnostico_cie10}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {incapacidades.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <FileBarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No hay incapacidades registradas</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
