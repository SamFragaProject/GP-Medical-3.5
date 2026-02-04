import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    MapPin,
    Building2,
    Mail,
    Phone,
    User,
    Save,
    CheckCircle,
    Hash
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sedesService, usuariosService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface NewSedeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    initialData?: any
}

export function NewSedeDialog({ open, onOpenChange, onSuccess, initialData }: NewSedeDialogProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [medicos, setMedicos] = useState<any[]>([])

    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        email: '',
        telefono: '',
        coordinador_medico: '',
        es_sede_principal: false,
        activa: true
    })

    useEffect(() => {
        if (open) {
            cargarMedicos()
            if (initialData) {
                setFormData({
                    nombre: initialData.nombre || '',
                    codigo: initialData.codigo || '',
                    direccion: initialData.direccion || '',
                    ciudad: initialData.ciudad || '',
                    estado: initialData.estado || '',
                    codigo_postal: initialData.codigo_postal || '',
                    email: initialData.email || '',
                    telefono: initialData.telefono || '',
                    coordinador_medico: initialData.coordinador_medico || '',
                    es_sede_principal: initialData.es_sede_principal || false,
                    activa: initialData.activa ?? true
                })
            } else {
                setFormData({
                    nombre: '',
                    codigo: '',
                    direccion: '',
                    ciudad: '',
                    estado: '',
                    codigo_postal: '',
                    email: '',
                    telefono: '',
                    coordinador_medico: '',
                    es_sede_principal: false,
                    activa: true
                })
            }
        }
    }, [open, initialData])

    const cargarMedicos = async () => {
        try {
            // Buscamos usuarios con rol médico o admin para ser coordinadores
            const data = await usuariosService.getAll(user?.empresa_id)
            const medicosFiltrados = data.filter((u: any) =>
                u.rol.toLowerCase().includes('medico') ||
                u.rol.toLowerCase().includes('admin')
            )
            setMedicos(medicosFiltrados)
        } catch (error) {
            console.error('Error cargando coordinadores:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.empresa_id) return

        setLoading(true)
        try {
            if (initialData) {
                await sedesService.update(initialData.id, formData)
                toast.success('Sede actualizada correctamente')
            } else {
                await sedesService.create({
                    ...formData,
                    empresa_id: user.empresa_id
                })
                toast.success('Sede registrada correctamente')
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error('Error al guardar la sede')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        {initialData ? 'Editar Sede' : 'Nueva Sede / Sucursal'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <Card className="border-slate-100 bg-slate-50/50 rounded-3xl overflow-hidden border-none shadow-inner">
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nombre de la Sede *</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Ej. Clínica Norte"
                                            className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Código Identificador</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={formData.codigo}
                                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                            placeholder="Ej. SUC-001"
                                            className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Dirección Completa</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <textarea
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        placeholder="Calle, número, colonia..."
                                        className="w-full min-h-[80px] pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Ciudad</Label>
                                    <Input
                                        value={formData.ciudad}
                                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                        placeholder="Ciudad"
                                        className="h-11 rounded-xl border-slate-200 bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Estado</Label>
                                    <Input
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        placeholder="Estado"
                                        className="h-11 rounded-xl border-slate-200 bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">CP</Label>
                                    <Input
                                        value={formData.codigo_postal}
                                        onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                                        placeholder="00000"
                                        className="h-11 rounded-xl border-slate-200 bg-white"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email de Contacto</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="sede@empresa.com"
                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Teléfono</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="55-0000-0000"
                                    className="pl-10 h-11 rounded-xl border-slate-200 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Coordinador Médico Responsable</Label>
                        <Select
                            value={formData.coordinador_medico}
                            onValueChange={(val) => setFormData({ ...formData, coordinador_medico: val })}
                        >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                                <SelectValue placeholder="Seleccionar coordinador..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                                {medicos.map((medico) => (
                                    <SelectItem key={medico.id} value={medico.id} className="rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                {medico.nombre[0]}
                                            </div>
                                            {medico.nombre} {medico.apellido_paterno}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="es_principal"
                                checked={formData.es_sede_principal}
                                onCheckedChange={(checked) => setFormData({ ...formData, es_sede_principal: checked === true })}
                                className="rounded-md border-indigo-300 data-[state=checked]:bg-indigo-600"
                            />
                            <Label htmlFor="es_principal" className="text-sm font-bold text-indigo-900 cursor-pointer">
                                Establecer como Sede Principal
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="activa"
                                checked={formData.activa}
                                onCheckedChange={(checked) => setFormData({ ...formData, activa: checked === true })}
                                className="rounded-md border-emerald-300 data-[state=checked]:bg-emerald-600"
                            />
                            <Label htmlFor="activa" className="text-sm font-bold text-emerald-900 cursor-pointer">
                                Activa
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl font-bold text-slate-400"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] px-8 h-12 rounded-xl transition-all shadow-xl shadow-indigo-900/10"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {initialData ? <Save className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    {initialData ? 'Guardar Cambios' : 'Registrar Sede'}
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", props.className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
