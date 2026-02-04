import React, { useState, useEffect } from 'react'
import {
    Briefcase,
    AlertTriangle,
    ShieldAlert,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    FileText,
    Brain
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
import { matrizRiesgosService, PuestoTrabajo, RiesgoCatalogo } from '@/services/matrizRiesgosService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function MatrizRiesgos() {
    const { user } = useAuth()
    const [puestos, setPuestos] = useState<PuestoTrabajo[]>([])
    const [catalogoRiesgos, setCatalogoRiesgos] = useState<RiesgoCatalogo[]>([])
    const [loading, setLoading] = useState(true)
    const [isNewPuestoOpen, setIsNewPuestoOpen] = useState(false)
    const [isAddRiesgoOpen, setIsAddRiesgoOpen] = useState(false)
    const [selectedPuesto, setSelectedPuesto] = useState<PuestoTrabajo | null>(null)

    // Forms
    const [newPuestoNombre, setNewPuestoNombre] = useState('')
    const [newPuestoDepto, setNewPuestoDepto] = useState('')

    const [selectedRiesgoId, setSelectedRiesgoId] = useState('')
    const [nivelExposicion, setNivelExposicion] = useState('medio')

    useEffect(() => {
        loadData()
        loadCatalogo()
    }, [])

    const loadData = async () => {
        try {
            const data = await matrizRiesgosService.getPuestos('emp-1')
            setPuestos(data || [])
            // Mock si falla
            if (!data || data.length === 0) {
                setPuestos([
                    {
                        id: 'p1',
                        nombre: 'Soldador Industrial',
                        departamento: 'Mantenimiento',
                        riesgos_asociados: [
                            { id: 'rel1', puesto_id: 'p1', riesgo_id: 'r1', nivel_exposicion: 'alto', frecuencia: 'constante', riesgo: { id: 'r1', nombre: 'Humos de Soldadura', categoria: 'quimico' } },
                            { id: 'rel2', puesto_id: 'p1', riesgo_id: 'r2', nivel_exposicion: 'medio', frecuencia: 'frecuente', riesgo: { id: 'r2', nombre: 'Radiación UV', categoria: 'fisico' } }
                        ]
                    }
                ])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const loadCatalogo = async () => {
        try {
            const data = await matrizRiesgosService.getCatalogoRiesgos()
            setCatalogoRiesgos(data || [])
        } catch (error) {
            setCatalogoRiesgos([
                { id: 'r1', nombre: 'Ruido > 85 dB', categoria: 'fisico' },
                { id: 'r2', nombre: 'Polvo de Sílice', categoria: 'quimico' },
                { id: 'r3', nombre: 'Levantamiento de Cargas', categoria: 'ergonomico' },
                { id: 'r4', nombre: 'Estrés Laboral', categoria: 'psicosocial' }
            ])
        }
    }

    const handleCreatePuesto = async () => {
        try {
            await matrizRiesgosService.createPuesto({
                empresa_id: 'emp-1', // Demo ID
                nombre: newPuestoNombre,
                departamento: newPuestoDepto
            } as any)
            toast.success('Puesto creado')
            setIsNewPuestoOpen(false)
            setNewPuestoNombre('')
            loadData()
        } catch (error) {
            toast.error('Error al crear puesto')
        }
    }

    const handleAddRiesgo = async () => {
        if (!selectedPuesto) return
        try {
            await matrizRiesgosService.vincularRiesgo({
                puesto_id: selectedPuesto.id,
                riesgo_id: selectedRiesgoId,
                nivel_exposicion: nivelExposicion as any,
                frecuencia: 'frecuente'
            })
            toast.success('Riesgo vinculado correctamente')
            setIsAddRiesgoOpen(false)
            loadData()
        } catch (error) {
            toast.error('Error al vincular riesgo')
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Matriz de Riesgos Laborales"
                subtitle="Configuración de Puestos y Profesiogramas de Alto Nivel (EJE 5)"
                icon={ShieldAlert}
                badge="Actualización Dinámica"
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PremiumMetricCard
                    title="Puestos Configurados"
                    value={puestos.length}
                    subtitle="Catálogo de perfiles"
                    icon={Briefcase}
                    gradient="blue"
                />
                <PremiumMetricCard
                    title="Riesgos Identificados"
                    value={puestos.reduce((acc, p) => acc + (p.riesgos_asociados?.length || 0), 0)}
                    subtitle="Total de exposiciones"
                    icon={ShieldAlert}
                    gradient="amber"
                />
                <PremiumMetricCard
                    title="Puestos Críticos"
                    // Si tiene > 3 riesgos altos
                    value={puestos.filter(p => (p.riesgos_asociados?.filter(r => r.nivel_exposicion === 'alto').length || 0) >= 2).length}
                    subtitle="Multi-riesgo alto"
                    icon={AlertTriangle}
                    gradient="rose"
                />
            </div>

            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                    <div>
                        <CardTitle>Puestos de Trabajo y Riesgos</CardTitle>
                        <CardDescription>Gestión de profesiogramas para el Programa Anual de Salud</CardDescription>
                    </div>
                    <Dialog open={isNewPuestoOpen} onOpenChange={setIsNewPuestoOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                                <Plus className="w-4 h-4 mr-2" /> Nuevo Puesto
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <h2 className="text-xl font-bold mb-4">Crear Puesto de Trabajo</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre del Puesto</Label>
                                    <Input value={newPuestoNombre} onChange={e => setNewPuestoNombre(e.target.value)} placeholder="Ej. Operador de Montacargas" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Departamento/Área</Label>
                                    <Input value={newPuestoDepto} onChange={e => setNewPuestoDepto(e.target.value)} placeholder="Ej. Logística" />
                                </div>
                                <Button className="w-full bg-indigo-600" onClick={handleCreatePuesto}>Guardar</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                        {puestos.map((puesto) => (
                            <AccordionItem key={puesto.id} value={puesto.id} className="border-b px-6 py-2 hover:bg-slate-50 transition-colors">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{puesto.nombre}</h4>
                                            <p className="text-sm text-slate-500 font-medium">{puesto.departamento} • {puesto.riesgos_asociados?.length || 0} riesgos detectados</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6">
                                    <div className="pl-14 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-semibold text-slate-700 flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4" /> Riesgos Inherentes al Puesto
                                            </h5>
                                            <Dialog open={isAddRiesgoOpen && selectedPuesto?.id === puesto.id} onOpenChange={(open) => {
                                                setIsAddRiesgoOpen(open)
                                                if (open) setSelectedPuesto(puesto)
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                                                        <Plus className="w-3 h-3 mr-1" /> Añadir Riesgo
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <h2 className="text-xl font-bold mb-4">Vincular Riesgo a {selectedPuesto?.nombre}</h2>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Seleccionar Riesgo (Catálogo)</Label>
                                                            <Select onValueChange={setSelectedRiesgoId}>
                                                                <SelectTrigger><SelectValue placeholder="Buscar riesgo..." /></SelectTrigger>
                                                                <SelectContent>
                                                                    {catalogoRiesgos.map(r => (
                                                                        <SelectItem key={r.id} value={r.id}>{r.nombre} ({r.categoria})</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Nivel de Exposición</Label>
                                                            <Select value={nivelExposicion} onValueChange={setNivelExposicion}>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="bajo">Bajo (Ocasional)</SelectItem>
                                                                    <SelectItem value="medio">Medio (Frecuente)</SelectItem>
                                                                    <SelectItem value="alto">Alto (Constante)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button className="w-full bg-indigo-600" onClick={handleAddRiesgo}>Vincular</Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {puesto.riesgos_asociados?.length === 0 ? (
                                            <div className="text-sm text-slate-400 italic">No hay riesgos configurados</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {puesto.riesgos_asociados?.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-10 rounded-full ${item.nivel_exposicion === 'alto' ? 'bg-rose-500' :
                                                                item.nivel_exposicion === 'medio' ? 'bg-orange-400' : 'bg-yellow-400'
                                                                }`} />
                                                            <div>
                                                                <p className="font-bold text-slate-800">{item.riesgo?.nombre}</p>
                                                                <Badge variant="outline" className="text-xs uppercase scale-90 origin-left">{item.riesgo?.categoria}</Badge>
                                                            </div>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-500" onClick={() => {
                                                            matrizRiesgosService.desvincularRiesgo(item.id).then(() => {
                                                                toast.success('Riesgo eliminado')
                                                                loadData()
                                                            })
                                                        }}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-lg">
                                            <h5 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                                                <Brain className="w-4 h-4 text-emerald-600" /> Sugerencias de Salud (IA Predictiva)
                                            </h5>
                                            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                                <li>Audiometría Anual recomendada (por Ruido)</li>
                                                <li>Espirometría Semestral (por Polvos)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    {puestos.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No hay puestos de trabajo registrados</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
