import React, { useState, useEffect } from 'react'
import {
    Armchair,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Camera,
    MapPin,
    Users,
    Clock,
    Info,
    Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { leySillaService, AreaLeySilla } from '@/services/leySillaService'
import toast from 'react-hot-toast'

export default function LeySilla() {
    const [areas, setAreas] = useState<AreaLeySilla[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Formulario
    const [formData, setFormData] = useState<Partial<AreaLeySilla>>({
        nombre_area: '',
        ubicacion_fisica: '',
        total_trabajadores: 10,
        trabajadores_de_pie: 10,
        asientos_disponibles: 5,
        tipo_asiento: 'ergonomico',
        estado_mobiliario: 'bueno',
        protocolo_descanso: '5 minutos cada 2 horas'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Demo data si falla la carga real
            const data = await leySillaService.getAll('emp-1')
            if (data && data.length > 0) {
                setAreas(data)
            } else {
                setAreas([
                    {
                        id: '1',
                        empresa_id: 'emp-1',
                        nombre_area: 'Línea de Ensamble A',
                        ubicacion_fisica: 'Nave 1',
                        total_trabajadores: 20,
                        trabajadores_de_pie: 20,
                        asientos_disponibles: 5,
                        cumple_ratio: true,
                        tipo_asiento: 'banco',
                        estado_mobiliario: 'regular',
                        protocolo_descanso: 'Rotación cada hora',
                        updated_at: new Date().toISOString()
                    },
                    {
                        id: '2',
                        empresa_id: 'emp-1',
                        nombre_area: 'Recepción',
                        ubicacion_fisica: 'Entrada Principal',
                        total_trabajadores: 2,
                        trabajadores_de_pie: 2,
                        asientos_disponibles: 0,
                        cumple_ratio: false,
                        tipo_asiento: 'ninguno',
                        estado_mobiliario: 'malo',
                        protocolo_descanso: 'Sin definir',
                        updated_at: new Date().toISOString()
                    }
                ])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            await leySillaService.create({
                ...formData as any,
                empresa_id: 'emp-1'
            })
            toast.success('Área registrada correctamente')
            setIsDialogOpen(false)
            loadData()
        } catch (error) {
            toast.error('Error al guardar área')
        }
    }

    const areasCumplen = areas.filter(a => a.cumple_ratio).length
    const porcentajeCumplimiento = areas.length > 0 ? Math.round((areasCumplen / areas.length) * 100) : 0

    return (
        <>
            <PremiumPageHeader
                title="Ley Silla (Reforma LFT)"
                subtitle="Derecho al descanso y asientos adecuados durante la jornada"
                icon={Armchair}
                badge="Cumplimiento Obligatorio"
                actions={
                    <div className="flex gap-2">
                        <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl shadow-xl shadow-emerald-500/20">
                            Protocolo Seguro
                        </Button>
                    </div>
                }
            />

            <div className="space-y-8 pb-12">

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PremiumMetricCard
                        title="Cumplimiento Global"
                        value={`${porcentajeCumplimiento}%`}
                        subtitle={`${areasCumplen} de ${areas.length} áreas cumplen`}
                        icon={CheckCircle2}
                        gradient={porcentajeCumplimiento >= 80 ? 'emerald' : 'amber'}
                    />
                    <PremiumMetricCard
                        title="Total Asientos"
                        value={areas.reduce((acc, curr) => acc + curr.asientos_disponibles, 0)}
                        subtitle="Inventario registrado"
                        icon={Armchair}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Personal de Pie"
                        value={areas.reduce((acc, curr) => acc + curr.trabajadores_de_pie, 0)}
                        subtitle="Requieren descanso periódico"
                        icon={Users}
                        gradient="purple"
                    />
                    <PremiumMetricCard
                        title="Áreas Críticas"
                        value={areas.length - areasCumplen}
                        subtitle="Sin asientos suficientes"
                        icon={AlertTriangle}
                        gradient="rose"
                    />
                </div>

                {/* Registro de Areas */}
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" />
                            Censo de Áreas y Asientos
                        </CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
                                    <Plus className="w-4 h-4 mr-2" /> Registrar Área
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <h2 className="text-xl font-bold mb-4">Registro de Área (Ley Silla)</h2>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre del Área</Label>
                                        <Input
                                            placeholder="Ej. Producción Línea 1"
                                            value={formData.nombre_area}
                                            onChange={e => setFormData({ ...formData, nombre_area: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Total Trabajadores</Label>
                                            <Input
                                                type="number"
                                                value={formData.total_trabajadores}
                                                onChange={e => setFormData({ ...formData, total_trabajadores: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Trabajan de Pie</Label>
                                            <Input
                                                type="number"
                                                value={formData.trabajadores_de_pie}
                                                onChange={e => setFormData({ ...formData, trabajadores_de_pie: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4 border p-4 rounded-xl bg-slate-50">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold">
                                            <Armchair className="w-4 h-4" /> Mobiliario Disponible
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Asientos Disponibles</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.asientos_disponibles}
                                                    onChange={e => setFormData({ ...formData, asientos_disponibles: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tipo de Asiento</Label>
                                                <Select
                                                    value={formData.tipo_asiento}
                                                    onValueChange={v => setFormData({ ...formData, tipo_asiento: v })}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ergonomico">Silla Ergonómica</SelectItem>
                                                        <SelectItem value="banco">Banco con Respaldo</SelectItem>
                                                        <SelectItem value="silla_fija">Silla Fija</SelectItem>
                                                        <SelectItem value="ninguno">Sin Asientos</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Protocolo de Descanso</Label>
                                            <Input
                                                placeholder="Ej. Pausas de 5 min cada hora"
                                                value={formData.protocolo_descanso}
                                                onChange={e => setFormData({ ...formData, protocolo_descanso: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleSave} className="bg-indigo-600 text-white">Guardar</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-slate-600">Área</th>
                                    <th className="text-left p-4 font-semibold text-slate-600">Personal de Pie</th>
                                    <th className="text-left p-4 font-semibold text-slate-600">Asientos</th>
                                    <th className="text-left p-4 font-semibold text-slate-600">Estado</th>
                                    <th className="text-right p-4 font-semibold text-slate-600">Evidencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {areas.map((area) => (
                                    <tr key={area.id} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{area.nombre_area}</p>
                                            <p className="text-xs text-slate-500">{area.ubicacion_fisica}</p>
                                        </td>
                                        <td className="p-4 text-slate-700">{area.trabajadores_de_pie}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{area.asientos_disponibles}</span>
                                                <span className="text-xs text-slate-500 capitalize">{area.tipo_asiento.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={area.cumple_ratio ? 'success' : 'destructive'}>
                                                {area.cumple_ratio ? 'Cumple' : 'Sin Cumplimiento'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                                                <Camera className="w-4 h-4 mr-1" />
                                                {area.foto_evidencia_url ? 'Ver Foto' : 'Subir'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
