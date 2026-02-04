import React, { useState, useEffect } from 'react'
import {
    Pill,
    Plus,
    Printer,
    Trash2,
    FileText,
    Search,
    Stethoscope,
    Receipt
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
import { prescripcionService, RecetaMedica as IRecetaMedica, DetalleReceta } from '@/services/prescripcionService'
import { inventoryService } from '@/services/inventoryService'
import { InventarioItem } from '@/types/inventory'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RecetaMedica() {
    const { user } = useAuth()
    const [recetas, setRecetas] = useState<IRecetaMedica[]>([])
    const [isNewRecetaOpen, setIsNewRecetaOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    // Form Receta
    const [selectedPacienteId, setSelectedPacienteId] = useState('')
    const [diagnostico, setDiagnostico] = useState('')
    const [alergias, setAlergias] = useState('')
    const [peso, setPeso] = useState('')
    const [talla, setTalla] = useState('')

    // Medicamentos (Array dinámico)
    const [medicamentos, setMedicamentos] = useState<Partial<DetalleReceta>[]>([])

    // Inventory Search
    const [searchMedTerm, setSearchMedTerm] = useState('')
    const [medSuggestions, setMedSuggestions] = useState<InventarioItem[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventarioItem | null>(null)

    const [newMed, setNewMed] = useState<Partial<DetalleReceta>>({
        nombre_medicamento: '',
        dosis: '',
        frecuencia: '',
        duracion: '',
        cantidad: 1
    })

    // Search effect
    useEffect(() => {
        const searchInventory = async () => {
            if (searchMedTerm.length > 2 && user?.empresa_id) {
                try {
                    const results = await inventoryService.getInventario(user.empresa_id, searchMedTerm, 'disponible')
                    setMedSuggestions(results)
                    setShowSuggestions(true)
                } catch (err) {
                    console.error(err)
                }
            } else {
                setMedSuggestions([])
                setShowSuggestions(false)
            }
        }
        const timeoutId = setTimeout(searchInventory, 300)
        return () => clearTimeout(timeoutId)
    }, [searchMedTerm, user?.empresa_id])

    const selectInventoryItem = (item: InventarioItem) => {
        setNewMed({
            ...newMed,
            nombre_medicamento: item.nombre_comercial + (item.presentacion ? ` - ${item.presentacion}` : ''),
            inventario_id: item.id
        })
        setSelectedInventoryItem(item)
        setSearchMedTerm('')
        setShowSuggestions(false)
    }

    useEffect(() => {
        // Cargar historial
        // loadRecetas() 
    }, [])

    const handleAddMedicamento = () => {
        if (!newMed.nombre_medicamento || !newMed.dosis) {
            toast.error('Nombre y Dosis son obligatorios')
            return
        }
        setMedicamentos([...medicamentos, { ...newMed }])
        setNewMed({ nombre_medicamento: '', dosis: '', frecuencia: '', duracion: '', cantidad: 1 })
    }

    const removeMedicamento = (index: number) => {
        const newMeds = [...medicamentos]
        newMeds.splice(index, 1)
        setMedicamentos(newMeds)
    }

    const handleSaveReceta = async () => {
        try {
            await prescripcionService.createReceta({
                paciente_id: selectedPacienteId || 'p-demo',
                empresa_id: user?.empresa_id || 'emp-demo',
                medico_id: user?.id,
                diagnostico_principal: diagnostico,
                alergias_conocidas: alergias,
                peso_kg: parseFloat(peso),
                talla_cm: parseFloat(talla),
                estado: 'activa'
            } as any, medicamentos as any)

            toast.success('Receta generada correctamente')
            setIsNewRecetaOpen(false)
            setMedicamentos([])
            setDiagnostico('')
        } catch (error) {
            toast.error('Error al guardar receta')
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="Recetario Electrónico"
                subtitle="Emisión de Recetas Médicas Inteligentes con Validez Legal (EJE 10)"
                icon={Pill}
                badge="Firma Digital Habilitada"
            />

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div>
                            <CardTitle>Historial de Recetas</CardTitle>
                            <CardDescription>Gestión de prescripciones emitidas</CardDescription>
                        </div>
                        <Dialog open={isNewRecetaOpen} onOpenChange={setIsNewRecetaOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
                                    <Plus className="w-4 h-4 mr-2" /> Nueva Receta
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Stethoscope className="w-6 h-6 text-indigo-600" />
                                        <h2 className="text-xl font-bold">Nueva Receta Médica</h2>
                                    </div>

                                    {/* Cabecera del Paciente */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="col-span-2 space-y-2">
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
                                            <Label>Peso (kg)</Label>
                                            <Input type="number" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ej. 70" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Talla (cm)</Label>
                                            <Input type="number" value={talla} onChange={e => setTalla(e.target.value)} placeholder="Ej. 175" />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Diagnóstico Principal</Label>
                                            <Input value={diagnostico} onChange={e => setDiagnostico(e.target.value)} placeholder="Ej. Infección Respiratoria Aguda" />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Alergias</Label>
                                            <Input value={alergias} onChange={e => setAlergias(e.target.value)} placeholder="Ej. Penicilina (Negado)" className="text-rose-600" />
                                        </div>
                                    </div>

                                    {/* Agregar Medicamentos */}
                                    <div className="border rounded-xl overflow-hidden">
                                        <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex items-center justify-between">
                                            <h3 className="font-bold text-indigo-700 flex items-center gap-2">
                                                <Pill className="w-4 h-4" /> Medicamentos
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-4 bg-white">
                                            <div className="grid grid-cols-12 gap-2 items-end">
                                                <div className="col-span-4 space-y-1">
                                                    <Label className="text-xs">Nombre / Sal</Label>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Buscar o escribir..."
                                                            value={newMed.nombre_medicamento || searchMedTerm}
                                                            onChange={e => {
                                                                setNewMed({ ...newMed, nombre_medicamento: e.target.value })
                                                                setSearchMedTerm(e.target.value)
                                                                if (selectedInventoryItem && e.target.value !== selectedInventoryItem.nombre_comercial) {
                                                                    setSelectedInventoryItem(null) // Reset if user changes name
                                                                }
                                                            }}
                                                            onFocus={() => {
                                                                if (searchMedTerm.length > 2) setShowSuggestions(true)
                                                            }}
                                                        />
                                                        {showSuggestions && medSuggestions.length > 0 && (
                                                            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                                                {medSuggestions.map(item => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="p-2 hover:bg-slate-50 cursor-pointer text-sm"
                                                                        onClick={() => selectInventoryItem(item)}
                                                                    >
                                                                        <div className="font-bold">{item.nombre_comercial}</div>
                                                                        <div className="text-xs text-slate-500">
                                                                            {item.nombre_generico} - Stock: {item.stock_actual}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Label className="text-xs">Dosis</Label>
                                                    <Input
                                                        placeholder="Ej. 1 tab"
                                                        value={newMed.dosis}
                                                        onChange={e => setNewMed({ ...newMed, dosis: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Label className="text-xs">Frecuencia</Label>
                                                    <Input
                                                        placeholder="Ej. 8 hrs"
                                                        value={newMed.frecuencia}
                                                        onChange={e => setNewMed({ ...newMed, frecuencia: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Label className="text-xs">Duración</Label>
                                                    <Input
                                                        placeholder="Ej. 5 días"
                                                        value={newMed.duracion}
                                                        onChange={e => setNewMed({ ...newMed, duracion: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Button size="sm" className="w-full bg-slate-800 text-white" onClick={handleAddMedicamento}>
                                                        <Plus className="w-4 h-4" /> Agregar
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Lista de Meds Agregados */}
                                            {medicamentos.length > 0 && (
                                                <div className="mt-4 border rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-50 text-slate-500">
                                                            <tr>
                                                                <th className="p-2 text-left">Medicamento</th>
                                                                <th className="p-2 text-left">Indicación</th>
                                                                <th className="p-2 text-right">Acción</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {medicamentos.map((med, idx) => (
                                                                <tr key={idx} className="bg-white">
                                                                    <td className="p-2 font-medium">{med.nombre_medicamento}</td>
                                                                    <td className="p-2 text-slate-600">
                                                                        Tomar {med.dosis} cada {med.frecuencia} por {med.duracion}
                                                                    </td>
                                                                    <td className="p-2 text-right">
                                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-500" onClick={() => removeMedicamento(idx)}>
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <div className="text-xs text-slate-400">
                                            * Al guardar se generará folio y firma digital.
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => window.location.href = '/facturacion'}>
                                                <Receipt className="w-4 h-4 mr-2" /> Facturar
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsNewRecetaOpen(false)}>Cancelar</Button>
                                            <Button className="bg-indigo-600 text-white" onClick={handleSaveReceta} disabled={medicamentos.length === 0}>
                                                <Printer className="w-4 h-4 mr-2" /> Emitir Receta
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="p-12 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No hay recetas recientes</p>
                            <p className="text-sm">Las recetas emitidas aparecerán aquí para reimpresión.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
