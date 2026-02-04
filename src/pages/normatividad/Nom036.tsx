import React, { useState, useEffect } from 'react'
import {
    Activity,
    AlertTriangle,
    Archive,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Dumbbell,
    Plus,
    Search,
    Scale
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { nom036Service, EvaluacionNom036 } from '@/services/nom036Service'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Nom036() {
    const { user } = useAuth()
    const [evaluaciones, setEvaluaciones] = useState<EvaluacionNom036[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Formulario State
    const [formData, setFormData] = useState<Partial<EvaluacionNom036>>({
        puesto_trabajo: '',
        peso_carga_kg: 10,
        factores_riesgo: {
            genero_operador: 'masculino',
            postura_tronco: 'erguido',
            distancia_vertical: 'nudillos',
            distancia_horizontal: 'cerca',
            tipo_agarre: 'bueno'
        }
    })

    // Riesgo en tiempo real
    const [riesgoPreview, setRiesgoPreview] = useState<any>(null)

    useEffect(() => {
        // Calcular riesgo cada vez que cambia el form
        const analisis = nom036Service.calculateRisk(formData)
        setRiesgoPreview(analisis)
    }, [formData])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Simulamos carga si no hay empresa real o backend listo
            const data = await nom036Service.getByEmpresa('emp-1')
            setEvaluaciones(data || [])
        } catch (error) {
            console.error(error)
            // Mock data si falla
            setEvaluaciones([])
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            await nom036Service.create({
                ...formData,
                empresa_id: 'emp-1', // Demo ID
                estado: 'finalizado'
            })
            toast.success('Evaluación ergonómica guardada')
            setIsDialogOpen(false)
            loadData()
        } catch (error) {
            toast.error('Error al guardar')
        }
    }

    const updateFactor = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            factores_riesgo: {
                ...prev.factores_riesgo,
                [key]: value
            }
        }))
    }

    return (
        <>
            <PremiumPageHeader
                title="NOM-036-1-STPS-2018"
                subtitle="Factores de Riesgo Ergonómico - Manejo Manual de Cargas"
                icon={Scale}
                badge="Normativa Vigente"
                actions={
                    <div className="flex gap-2">
                        <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl shadow-xl shadow-emerald-500/20">
                            Ficha Técnica
                        </Button>
                    </div>
                }
            />

            <div className="space-y-8 pb-12">

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PremiumMetricCard
                        title="Puestos Evaluados"
                        value={evaluaciones.length}
                        subtitle="Total acumulado"
                        icon={ClipboardList}
                        gradient="blue"
                    />
                    <PremiumMetricCard
                        title="Riesgo Muy Alto"
                        value={evaluaciones.filter(e => e.nivel_riesgo_calculado === 'muy_alto').length}
                        subtitle="Requieren acción inmediata"
                        icon={AlertTriangle}
                        gradient="rose"
                    />
                    <PremiumMetricCard
                        title="Carga Promedio"
                        value={`${Math.round(evaluaciones.reduce((a, b) => a + (b.peso_carga_kg || 0), 0) / (evaluaciones.length || 1))} kg`}
                        subtitle="Promedio de levantamiento"
                        icon={Scale}
                        gradient="emerald"
                    />
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-indigo-500" />
                                Registro de Evaluaciones
                            </CardTitle>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
                                        <Plus className="w-4 h-4 mr-2" /> Nueva Evaluación
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold">Nueva Evaluación Ergonómica</h2>
                                            <p className="text-sm text-slate-500">Estimación de Riesgo Simple (NOM-036-1)</p>
                                        </div>

                                        {/* Formulario */}
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Puesto / Tarea</Label>
                                                    <Input
                                                        placeholder="Ej. Estibador, Almacenista"
                                                        value={formData.puesto_trabajo}
                                                        onChange={e => setFormData({ ...formData, puesto_trabajo: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Género del Operador</Label>
                                                    <Select
                                                        value={formData.factores_riesgo?.genero_operador}
                                                        onValueChange={v => updateFactor('genero_operador', v)}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="masculino">Masculino</SelectItem>
                                                            <SelectItem value="femenino">Femenino</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-4 border p-4 rounded-xl bg-slate-50">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label className="font-bold">Peso de la Carga (kg)</Label>
                                                        <span className="text-sm font-mono bg-white px-2 rounded border">{formData.peso_carga_kg} kg</span>
                                                    </div>
                                                    <Slider
                                                        value={[formData.peso_carga_kg || 0]}
                                                        max={50}
                                                        step={0.5}
                                                        onValueChange={v => setFormData({ ...formData, peso_carga_kg: v[0] })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Postura del Tronco</Label>
                                                    <Select value={formData.factores_riesgo?.postura_tronco} onValueChange={v => updateFactor('postura_tronco', v)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="erguido">Erguido (Sin riesgo)</SelectItem>
                                                            <SelectItem value="flexionado">Flexionado (Leve)</SelectItem>
                                                            <SelectItem value="torsion">Con Torsión (Grave)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Distancia Vertical</Label>
                                                    <Select value={formData.factores_riesgo?.distancia_vertical} onValueChange={v => updateFactor('distancia_vertical', v)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="nudillos">A nivel de nudillos (Ideal)</SelectItem>
                                                            <SelectItem value="hombros">Por encima de hombros</SelectItem>
                                                            <SelectItem value="suelo">Desde el suelo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Distancia Horizontal</Label>
                                                    <Select value={formData.factores_riesgo?.distancia_horizontal} onValueChange={v => updateFactor('distancia_horizontal', v)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cerca">Cerca del cuerpo</SelectItem>
                                                            <SelectItem value="lejos">Lejos del cuerpo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Tipo de Agarre</Label>
                                                    <Select value={formData.factores_riesgo?.tipo_agarre} onValueChange={v => updateFactor('tipo_agarre', v)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="bueno">Bueno (Asas)</SelectItem>
                                                            <SelectItem value="regular">Regular</SelectItem>
                                                            <SelectItem value="malo">Malo (Difícil sostener)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview del Resultado en Vivo */}
                                        {riesgoPreview && (
                                            <div className={`p-4 rounded-xl border-l-4 ${riesgoPreview.color.replace('bg-', 'border-')} bg-slate-50 flex items-start gap-4 transition-colors duration-300`}>
                                                <Activity className={`w-6 h-6 mt-1 ${riesgoPreview.color.replace('bg-', 'text-')}`} />
                                                <div>
                                                    <h3 className="font-bold flex items-center gap-2">
                                                        Nivel de Riesgo: <span className="uppercase">{riesgoPreview.nivel.replace('_', ' ')}</span>
                                                        <Badge className={riesgoPreview.color}>Score: {riesgoPreview.score}</Badge>
                                                    </h3>
                                                    <p className="text-sm text-slate-600 mt-1">{riesgoPreview.recomendacion}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-4 border-t">
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                            <Button onClick={handleSave} className="bg-indigo-600 text-white">
                                                Guardar Evaluación
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            {evaluaciones.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-slate-600">Puesto</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Fecha</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Carga (kg)</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Nivel Riesgo</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Recomendación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {evaluaciones.map((eva) => {
                                            const color =
                                                eva.nivel_riesgo_calculado === 'muy_alto' ? 'bg-red-500' :
                                                    eva.nivel_riesgo_calculado === 'alto' ? 'bg-orange-500' :
                                                        eva.nivel_riesgo_calculado === 'medio' ? 'bg-yellow-500' : 'bg-emerald-500';

                                            return (
                                                <tr key={eva.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold text-slate-800">{eva.puesto_trabajo}</td>
                                                    <td className="p-4 text-sm text-slate-500">
                                                        {new Date(eva.fecha_evaluacion).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-mono">{eva.peso_carga_kg} kg</td>
                                                    <td className="p-4">
                                                        <Badge className={`${color} text-white border-0 uppercase`}>
                                                            {eva.nivel_riesgo_calculado?.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                                                        {eva.medidas_preventivas_sugeridas}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay evaluaciones registradas</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
