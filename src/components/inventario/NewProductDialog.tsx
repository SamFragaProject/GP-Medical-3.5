import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Pill, Stethoscope, Syringe, Save, X, AlertCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { inventarioService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface NewProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

const categorias = [
    { id: 'medicamento', label: 'Medicamento', icon: Pill, color: 'bg-blue-100 text-blue-600' },
    { id: 'insumo', label: 'Insumo Médico', icon: Syringe, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'equipo', label: 'Equipo', icon: Stethoscope, color: 'bg-purple-100 text-purple-600' },
]

const formasFarmaceuticas = [
    'Tableta', 'Cápsula', 'Solución', 'Suspensión', 'Jarabe', 'Crema',
    'Gel', 'Ungüento', 'Inyectable', 'Supositorio', 'Parche', 'Otro'
]

const unidadesMedida = [
    'pza', 'caja', 'frasco', 'ampolleta', 'ml', 'mg', 'gr', 'kg', 'rollo', 'paquete'
]

export function NewProductDialog({ open, onOpenChange, onSuccess }: NewProductDialogProps) {
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        nombre_generico: '',
        descripcion: '',
        categoria: 'medicamento',
        subcategoria: '',
        forma_farmaceutica: 'Tableta',
        unidad_medida: 'pza',
        stock_actual: 0,
        stock_minimo: 10,
        stock_maximo: 500,
        precio_compra: 0,
        precio_venta: 0,
        lote: '',
        fecha_caducidad: '',
        ubicacion_almacen: '',
        requiere_receta: false,
        controlado: false
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const generateCode = () => {
        const prefix = formData.categoria === 'medicamento' ? 'MED' :
            formData.categoria === 'insumo' ? 'INS' : 'EQP'
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        handleChange('codigo', `${prefix}-${random}`)
    }

    const handleSave = async () => {
        if (!formData.codigo || !formData.nombre) {
            toast.error('Código y nombre son obligatorios')
            return
        }

        setSaving(true)
        try {
            await inventarioService.upsertProducto({
                ...formData,
                empresa_id: user?.empresa_id,
                estado: 'activo',
                activo: true
            })
            toast.success('Producto registrado correctamente')
            onOpenChange(false)
            onSuccess?.()
            // Reset form
            setFormData({
                codigo: '',
                nombre: '',
                nombre_generico: '',
                descripcion: '',
                categoria: 'medicamento',
                subcategoria: '',
                forma_farmaceutica: 'Tableta',
                unidad_medida: 'pza',
                stock_actual: 0,
                stock_minimo: 10,
                stock_maximo: 500,
                precio_compra: 0,
                precio_venta: 0,
                lote: '',
                fecha_caducidad: '',
                ubicacion_almacen: '',
                requiere_receta: false,
                controlado: false
            })
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error('Error al guardar el producto')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center text-white">
                            <Package className="w-5 h-5" />
                        </div>
                        Nuevo Producto
                    </DialogTitle>
                    <DialogDescription>
                        Registrar un nuevo medicamento, insumo o equipo en el inventario.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Selector de Categoría */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoría del Producto</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {categorias.map(cat => (
                                <motion.button
                                    key={cat.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChange('categoria', cat.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.categoria === cat.id
                                            ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-500/10'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center`}>
                                        <cat.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-sm font-bold ${formData.categoria === cat.id ? 'text-cyan-700' : 'text-slate-600'}`}>
                                        {cat.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Datos Básicos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Código *</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.codigo}
                                    onChange={(e) => handleChange('codigo', e.target.value)}
                                    placeholder="MED-0001"
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" onClick={generateCode} className="shrink-0">
                                    Auto
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre Comercial *</Label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                placeholder="Paracetamol 500mg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre Genérico</Label>
                            <Input
                                value={formData.nombre_generico}
                                onChange={(e) => handleChange('nombre_generico', e.target.value)}
                                placeholder="Paracetamol"
                            />
                        </div>
                        {formData.categoria === 'medicamento' && (
                            <div className="space-y-2">
                                <Label>Forma Farmacéutica</Label>
                                <Select value={formData.forma_farmaceutica} onValueChange={(v) => handleChange('forma_farmaceutica', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formasFarmaceuticas.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Stock y Precios */}
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Niveles de Stock y Precios</h4>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Stock Inicial</Label>
                                <Input
                                    type="number"
                                    value={formData.stock_actual}
                                    onChange={(e) => handleChange('stock_actual', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Mínimo</Label>
                                <Input
                                    type="number"
                                    value={formData.stock_minimo}
                                    onChange={(e) => handleChange('stock_minimo', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Precio Compra</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio_compra}
                                    onChange={(e) => handleChange('precio_compra', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Precio Venta</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio_venta}
                                    onChange={(e) => handleChange('precio_venta', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Unidad de Medida</Label>
                                <Select value={formData.unidad_medida} onValueChange={(v) => handleChange('unidad_medida', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unidadesMedida.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Lote</Label>
                                <Input
                                    value={formData.lote}
                                    onChange={(e) => handleChange('lote', e.target.value)}
                                    placeholder="LOT-2025-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Caducidad</Label>
                                <Input
                                    type="date"
                                    value={formData.fecha_caducidad}
                                    onChange={(e) => handleChange('fecha_caducidad', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ubicación en Almacén</Label>
                            <Input
                                value={formData.ubicacion_almacen}
                                onChange={(e) => handleChange('ubicacion_almacen', e.target.value)}
                                placeholder="Estante A, Nivel 2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción / Notas</Label>
                            <Input
                                value={formData.descripcion}
                                onChange={(e) => handleChange('descripcion', e.target.value)}
                                placeholder="Notas adicionales..."
                            />
                        </div>
                    </div>

                    {/* Controles especiales */}
                    {formData.categoria === 'medicamento' && (
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.requiere_receta}
                                    onChange={(e) => handleChange('requiere_receta', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300"
                                />
                                <span className="text-sm font-medium text-slate-700">Requiere Receta Médica</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.controlado}
                                    onChange={(e) => handleChange('controlado', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300"
                                />
                                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                    Medicamento Controlado
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                    >
                        {saving ? 'Guardando...' : 'Guardar Producto'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
