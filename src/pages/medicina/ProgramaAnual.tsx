import React, { useState, useEffect } from 'react'
import {
    CalendarRange,
    ClipboardCheck,
    TrendingUp,
    Users,
    Plus,
    Wand2,
    Calendar,
    ChevronRight,
    Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { programaSaludService, ProgramaAnual as IProgramaAnual, ActividadPrograma } from '@/services/programaSaludService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Progress } from '@/components/ui/progress'

export default function ProgramaAnual() {
    const { user } = useAuth()
    const [programa, setPrograma] = useState<IProgramaAnual | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [isNewActivityOpen, setIsNewActivityOpen] = useState(false)

    // Form Actividad
    const [newActNombre, setNewActNombre] = useState('')
    const [newActTipo, setNewActTipo] = useState('campana_salud')
    const [newActFecha, setNewActFecha] = useState('')

    useEffect(() => {
        loadData()
    }, [selectedYear])

    const loadData = async () => {
        try {
            const data = await programaSaludService.getProgramaActual('emp-1', selectedYear)
            setPrograma(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePrograma = async () => {
        try {
            const nuevo = await programaSaludService.createPrograma({
                empresa_id: 'emp-1',
                anio: selectedYear,
                nombre: `Programa de Salud ${selectedYear}`,
                estado: 'borrador',
                avance_general: 0
            })
            setPrograma(nuevo)
            toast.success(`Programa ${selectedYear} inicializado`)
        } catch (error) {
            toast.error('Error al crear programa')
        }
    }

    const handleGenerateIA = async () => {
        if (!programa) return
        try {
            toast.loading('Analizando riesgos y generando calendario...')
            await new Promise(r => setTimeout(r, 2000)) // Simular proceso IA
            await programaSaludService.generarPropuestaActividades(programa.id, 'emp-1')
            toast.dismiss()
            toast.success('Calendario generado exitosamente')
            loadData()
        } catch (error) {
            toast.dismiss()
            toast.error('Error generando actividades')
        }
    }

    const handleAddActivity = async () => {
        if (!programa) return
        try {
            await programaSaludService.addActividad({
                programa_id: programa.id,
                nombre: newActNombre,
                tipo: newActTipo as any,
                fecha_inicio: newActFecha,
                fecha_fin: newActFecha, // Simple MVP
                estado: 'programada',
                poblacion_objetivo: 'General'
            })
            toast.success('Actividad agendada')
            setIsNewActivityOpen(false)
            loadData()
        } catch (error) {
            toast.error('Error al agendar')
        }
    }

    // Calcular stats
    const totalActividades = programa?.actividades?.length || 0
    const actividadesRealizadas = programa?.actividades?.filter(a => a.estado === 'realizada').length || 0
    const avanceReal = totalActividades > 0 ? Math.round((actividadesRealizadas / totalActividades) * 100) : 0

    return (
        <div className="space-y-8 pb-12">
            <PremiumHeader
                title="Programa Anual de Salud"
                subtitle="Planeación estratégica y calendario de actividades (EJE 6)"
                gradient={true}
                badges={[
                    { text: `Ejercicio ${selectedYear}`, variant: "info", icon: <CalendarRange size={14} /> }
                ]}
            />

            {/* Selector de Año */}
            <div className="flex items-center gap-4 mb-4">
                <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                </Select>

                {!programa && (
                    <Button onClick={handleCreatePrograma} className="bg-indigo-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Inicializar Programa {selectedYear}
                    </Button>
                )}
            </div>

            {programa ? (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PremiumMetricCard
                            title="Avance General"
                            value={`${avanceReal}%`}
                            subtitle="Cumplimiento del programa"
                            icon={TrendingUp}
                            gradient={avanceReal > 80 ? "emerald" : "blue"}
                        />
                        <PremiumMetricCard
                            title="Actividades"
                            value={totalActividades}
                            subtitle="Eventos programados"
                            icon={Calendar}
                            gradient="purple"
                        />
                        <PremiumMetricCard
                            title="Población Meta"
                            value={programa.actividades?.reduce((acc, a) => acc + (a.meta_pacientes || 0), 0) || 0}
                            subtitle="Pacientes impactados"
                            icon={Users}
                            gradient="amber"
                        />
                        <PremiumMetricCard
                            title="Eficacia"
                            value="92%"
                            subtitle="Asistencia promedio" // Hardcoded MVP
                            icon={Target}
                            gradient="rose"
                        />
                    </div>

                    {/* Timeline de Actividades */}
                    <Card className="border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800">Cronograma de Salud {selectedYear}</CardTitle>
                                <CardDescription>Vista mensual de campañas y exámenes</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={handleGenerateIA}>
                                    <Wand2 className="w-4 h-4 mr-2" /> Auto-Generar con IA (Desde Riesgos)
                                </Button>
                                <Dialog open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-slate-900 text-white">
                                            <Plus className="w-4 h-4 mr-2" /> Agendar Actividad
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <h2 className="text-xl font-bold mb-4">Nueva Actividad</h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Nombre del Evento</Label>
                                                <Input value={newActNombre} onChange={e => setNewActNombre(e.target.value)} placeholder="Ej. Vacunación VPH" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tipo de Actividad</Label>
                                                <Select value={newActTipo} onValueChange={setNewActTipo}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="examen_medico">Exámenes Médicos</SelectItem>
                                                        <SelectItem value="campana_salud">Campaña de Salud</SelectItem>
                                                        <SelectItem value="capacitacion">Capacitación</SelectItem>
                                                        <SelectItem value="simulacro">Simulacro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fecha Inicio</Label>
                                                <Input type="date" value={newActFecha} onChange={e => setNewActFecha(e.target.value)} />
                                            </div>
                                            <Button className="w-full bg-indigo-600" onClick={handleAddActivity}>Guardar</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(!programa.actividades || programa.actividades.length === 0) ? (
                                <div className="p-12 text-center text-slate-500">
                                    <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg font-medium">No hay actividades programadas</p>
                                    <p className="text-sm">Usa el botón de "Auto-Generar con IA" para crear un plan basado en los riesgos de tu empresa.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {programa.actividades
                                        .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
                                        .map((actividad) => (
                                            <div key={actividad.id} className="p-5 flex items-center gap-6 hover:bg-slate-50 transition-colors group">
                                                {/* Date Box */}
                                                <div className="flex-shrink-0 w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-sm group-hover:border-indigo-200">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">
                                                        {new Date(actividad.fecha_inicio).toLocaleDateString('es-MX', { month: 'short' })}
                                                    </span>
                                                    <span className="text-2xl font-black text-slate-800">
                                                        {new Date(actividad.fecha_inicio).getDate()}
                                                    </span>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-slate-800 text-lg">{actividad.nombre}</h4>
                                                        <Badge variant={
                                                            actividad.tipo === 'campana_salud' ? 'default' :
                                                                actividad.tipo === 'examen_medico' ? 'outline' : 'secondary'
                                                        }>
                                                            {actividad.tipo.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                                        <Users className="w-3 h-3" /> Meta: {actividad.meta_pacientes || 'N/A'} pacientes
                                                        • {actividad.poblacion_objetivo}
                                                    </p>
                                                </div>

                                                {/* Status */}
                                                <div className="w-32 flex flex-col items-end gap-1">
                                                    <Badge className={`
                                                    capitalize 
                                                    ${actividad.estado === 'realizada' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                                            actividad.estado === 'en_curso' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                                                'bg-slate-100 text-slate-600 hover:bg-slate-100'}
                                                `}>
                                                        {actividad.estado.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                    <CalendarRange className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-600">No existe programa para {selectedYear}</h3>
                    <p className="text-center max-w-md mt-2 mb-6">Inicializa el programa anula para comenzar a planear las actividades de salud y seguridad de tu empresa.</p>
                    <Button onClick={handleCreatePrograma} className="bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                        <Plus className="mr-2 h-4 w-4" /> Crear Programa {selectedYear}
                    </Button>
                </div>
            )}
        </div>
    )
}
