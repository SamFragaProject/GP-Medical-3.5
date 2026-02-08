// Componente EmpleadoModal - Modal para crear/editar empleados
import React from 'react'
import { Employee } from '@/types/rrhh'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Save, X } from 'lucide-react'

interface EmpleadoModalProps {
    open: boolean
    onClose: () => void
    empleado?: Employee | null
    onSave: (data: Partial<Employee>) => void
    loading?: boolean
}

export function EmpleadoModal({
    open,
    onClose,
    empleado,
    onSave,
    loading
}: EmpleadoModalProps) {
    const [formData, setFormData] = React.useState<Partial<Employee>>({
        nombre: '',
        apellido: '',
        email_personal: '',
        telefono: '',
        fecha_ingreso: '',
        numero_empleado: '',
        departamento: '',
        puesto: '',
        tipo_contrato: 'indeterminado',
        estado: 'activo',
        salario_diario: 0,
    })

    React.useEffect(() => {
        if (empleado) {
            setFormData({
                ...empleado
            })
        } else {
            setFormData({
                nombre: '',
                apellido: '',
                email_personal: '',
                telefono: '',
                fecha_ingreso: new Date().toISOString().split('T')[0],
                departamento: '',
                puesto: '',
                tipo_contrato: 'indeterminado',
                estado: 'activo',
                salario_diario: 0,
            })
        }
    }, [empleado, open])

    const handleChange = (field: keyof Employee, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const iniciales = formData.nombre && formData.apellido
        ? `${formData.nombre[0]}${formData.apellido[0]}`
        : 'NN'

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </DialogTitle>
                    <DialogDescription>
                        {empleado ? 'Modifica los datos del empleado' : 'Ingresa los datos del nuevo empleado'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center mb-6">
                        <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-xl font-semibold">
                                {iniciales}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
                                Datos Personales
                            </h4>
                        </div>

                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Apellido *</Label>
                            <Input
                                value={formData.apellido}
                                onChange={(e) => handleChange('apellido', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email Personal</Label>
                            <Input
                                type="email"
                                value={formData.email_personal}
                                onChange={(e) => handleChange('email_personal', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                                value={formData.telefono}
                                onChange={(e) => handleChange('telefono', e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 mt-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
                                Datos Laborales
                            </h4>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de Ingreso *</Label>
                            <Input
                                type="date"
                                value={formData.fecha_ingreso}
                                onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Departamento</Label>
                            <Input
                                value={formData.departamento as any}
                                onChange={(e) => handleChange('departamento', e.target.value)}
                                placeholder="Ej. Ventas"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Puesto</Label>
                            <Input
                                value={formData.puesto as any}
                                onChange={(e) => handleChange('puesto', e.target.value)}
                                placeholder="Ej. Gerente"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Salario Diario</Label>
                            <Input
                                type="number"
                                value={formData.salario_diario as any}
                                onChange={(e) => handleChange('salario_diario', parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo Contrato</Label>
                            <Select
                                value={formData.tipo_contrato}
                                onValueChange={(value) => handleChange('tipo_contrato', value)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="indeterminado">Indeterminado</SelectItem>
                                    <SelectItem value="determinado">Determinado</SelectItem>
                                    <SelectItem value="prueba">Prueba</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                                value={formData.estado}
                                onValueChange={(value) => handleChange('estado', value)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activo">Activo</SelectItem>
                                    <SelectItem value="baja">Baja</SelectItem>
                                    <SelectItem value="permiso">Permiso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
