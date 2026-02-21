import React, { useState, useEffect } from 'react'
import {
    Check,
    Microscope,
    TestTube,
    FileText,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
    Users,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { estudiosService, OrdenEstudio, EstudioCatalogo } from '@/services/estudiosService'
import { pacientesService, Paciente } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function EstudiosMedicos() {
    const { user } = useAuth()
    const empresaId = user?.empresa_id || ''
    const [ordenes, setOrdenes] = useState<OrdenEstudio[]>([])
    const [catalogo, setCatalogo] = useState<EstudioCatalogo[]>([])
    const [pacientes, setPacientes] = useState<Paciente[]>([])
    const [loading, setLoading] = useState(true)
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Formulario Nueva Orden
    const [selectedPacienteId, setSelectedPacienteId] = useState('')
    const [selectedEstudios, setSelectedEstudios] = useState<string[]>([])
    const [prioridad, setPrioridad] = useState<'normal' | 'urgente'>('normal')
    const [diagnostico, setDiagnostico] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // Cargar pacientes reales, catálogo y órdenes en paralelo
            const [pacientesData, catalogoData, ordenesData] = await Promise.allSettled([
                pacientesService.getAll(),
                estudiosService.getCatalogo(empresaId),
                estudiosService.getOrdenes(empresaId)
            ])

            if (pacientesData.status === 'fulfilled') setPacientes(pacientesData.value || [])
            if (catalogoData.status === 'fulfilled') setCatalogo(catalogoData.value || [])
            if (ordenesData.status === 'fulfilled') setOrdenes(ordenesData.value || [])

        } catch (error) {
            console.error('Error cargando datos de estudios:', error)
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrder = async () => {
        if (!selectedPacienteId) {
            toast.error('Selecciona un paciente')
            return
        }
        if (selectedEstudios.length === 0) {
            toast.error('Selecciona al menos un estudio')
            return
        }

        try {
            await estudiosService.crearOrden({
                paciente_id: selectedPacienteId,
                empresa_id: empresaId,
                medico_id: user?.id,
                prioridad,
                diagnostico_presuntivo: diagnostico,
                estado: 'pendiente'
            } as any, selectedEstudios)

            toast.success('Orden de estudio creada')
            setIsNewOrderOpen(false)
            loadData()
            // Reset form
            setSelectedPacienteId('')
            setSelectedEstudios([])
            setDiagnostico('')
            setPrioridad('normal')
        } catch (error) {
            console.error('Error creando orden:', error)
            toast.error('Error al solicitar estudios')
        }
    }

    const filteredOrdenes = ordenes.filter(o => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            o.paciente?.nombre?.toLowerCase().includes(q) ||
            o.paciente?.apellido_paterno?.toLowerCase().includes(q) ||
            o.id?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Gestión de Estudios Médicos"
                subtitle="Laboratorio, Gabinete y Pruebas Especiales de Alta Precisión"
                icon={Microscope}
                badge="EJE 3 - Salud Integral"
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumMetricCard
                    title="Órdenes Hoy"
                    value={ordenes.filter(o => new Date(o.fecha_solicitud).toDateString() === new Date().toDateString()).length}
                    subtitle="Solicitudes recibidas"
                    icon={FileText}
                    gradient="blue"
                />
                <PremiumMetricCard
                    title="Pendientes"
                    value={ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso').length}
                    subtitle="En espera de resultados"
                    icon={Clock}
                    gradient="amber"
                />
                <PremiumMetricCard
                    title="Urgencias"
                    value={ordenes.filter(o => o.prioridad === 'urgente' && o.estado !== 'completada').length}
                    subtitle="Atención prioritaria"
                    icon={AlertCircle}
                    gradient="rose"
                />
                <PremiumMetricCard
                    title="Resultados Listos"
                    value={ordenes.filter(o => o.estado === 'completada').length}
                    subtitle="Disponibles para consulta"
                    icon={CheckCircle2}
                    gradient="emerald"
                />
            </div>

            {/* Panel Principal */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por paciente..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                    </div>

                    <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
                                <Plus className="w-4 h-4 mr-2" /> Nueva Orden
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Solicitud de Estudios</h2>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Paciente</Label>
                                    {pacientes.length === 0 ? (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                                            <Users className="w-4 h-4" />
                                            <span>No hay pacientes registrados. Importa o agrega pacientes primero.</span>
                                        </div>
                                    ) : (
                                        <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar paciente..." /></SelectTrigger>
                                            <SelectContent>
                                                {pacientes.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.nombre} {p.apellido_paterno} {p.apellido_materno || ''} {p.numero_empleado ? `(${p.numero_empleado})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Prioridad</Label>
                                    <Select value={prioridad} onValueChange={(v: any) => setPrioridad(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="urgente">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Diagnóstico Presuntivo / Motivo</Label>
                                    <Input
                                        placeholder="Ej. Chequeo anual, Sospecha de infección..."
                                        value={diagnostico}
                                        onChange={e => setDiagnostico(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Selección de Estudios</Label>
                                    {catalogo.length === 0 ? (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-sm">
                                            <TestTube className="w-4 h-4" />
                                            <span>No hay estudios en el catálogo. Configura el catálogo de estudios.</span>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg p-4 h-48 overflow-y-auto space-y-2 bg-slate-50">
                                            {catalogo.map(estudio => (
                                                <div key={estudio.id} className="flex items-center gap-2 p-2 bg-white rounded border hover:border-indigo-200 cursor-pointer" onClick={() => {
                                                    if (selectedEstudios.includes(estudio.id)) {
                                                        setSelectedEstudios(prev => prev.filter(id => id !== estudio.id))
                                                    } else {
                                                        setSelectedEstudios(prev => [...prev, estudio.id])
                                                    }
                                                }}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedEstudios.includes(estudio.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                        {selectedEstudios.includes(estudio.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{estudio.nombre}</p>
                                                        <p className="text-xs text-slate-500 capitalize">{estudio.categoria.replace('_', ' ')}</p>
                                                    </div>
                                                    {estudio.precio_publico && (
                                                        <p className="text-sm font-bold text-slate-700">${estudio.precio_publico}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-right text-slate-500">
                                        {selectedEstudios.length} estudios seleccionados
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancelar</Button>
                                    <Button
                                        onClick={handleCreateOrder}
                                        className="bg-indigo-600 text-white"
                                        disabled={!selectedPacienteId || selectedEstudios.length === 0}
                                    >
                                        Generar Orden
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 mx-auto mb-3 text-indigo-500 animate-spin" />
                            <p className="text-slate-400">Cargando órdenes...</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-slate-600">Folio / Paciente</th>
                                        <th className="text-left p-4 font-semibold text-slate-600">Fecha</th>
                                        <th className="text-left p-4 font-semibold text-slate-600">Estudios</th>
                                        <th className="text-left p-4 font-semibold text-slate-600">Estado</th>
                                        <th className="text-right p-4 font-semibold text-slate-600">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredOrdenes.map(orden => (
                                        <tr key={orden.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <p className="font-mono text-xs text-indigo-600 font-bold mb-1">{orden.id.slice(0, 8)}</p>
                                                <p className="font-bold text-slate-900">{orden.paciente?.nombre} {orden.paciente?.apellido_paterno}</p>
                                                <p className="text-xs text-slate-500">{orden.diagnostico_presuntivo || 'Sin diagnóstico'}</p>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {new Date(orden.fecha_solicitud).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {orden.detalles?.map(d => (
                                                        <Badge key={d.id} variant="secondary" className="text-xs font-normal">
                                                            {d.estudio?.nombre || 'Estudio'}
                                                        </Badge>
                                                    ))}
                                                    {(!orden.detalles || orden.detalles.length === 0) && <span className="text-slate-400 text-sm">Sin detalles</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`
                                                    capitalize border-0
                                                    ${orden.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                                                        orden.prioridad === 'urgente' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-blue-100 text-blue-700'}
                                                `}>
                                                    {orden.prioridad === 'urgente' && orden.estado !== 'completada' ? 'Urgente' : orden.estado.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                                                        <Eye className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                    {orden.estado === 'completada' && (
                                                        <Button variant="outline" size="icon" className="text-indigo-600 border-indigo-100 bg-indigo-50">
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredOrdenes.length === 0 && (
                                <div className="p-12 text-center text-slate-400">
                                    <TestTube className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No hay órdenes de estudio registradas</p>
                                    <p className="text-xs mt-1">Crea una nueva orden para comenzar</p>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
