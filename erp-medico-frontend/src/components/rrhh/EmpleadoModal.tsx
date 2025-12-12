// Componente EmpleadoModal - Modal para crear/editar empleados
import React from 'react'
import { Empleado, Departamento, Puesto, TipoContrato, EstadoEmpleado } from '@/types/rrhh'
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
    empleado?: Empleado | null
    departamentos: Departamento[]
    puestos: Puesto[]
    onSave: (data: Partial<Empleado>) => void
    loading?: boolean
}

const tiposContrato: { value: TipoContrato; label: string }[] = [
    { value: 'tiempo_completo', label: 'Tiempo Completo' },
    { value: 'medio_tiempo', label: 'Medio Tiempo' },
    { value: 'temporal', label: 'Temporal' },
    { value: 'honorarios', label: 'Honorarios' },
    { value: 'practicante', label: 'Practicante' },
]

const estadosEmpleado: { value: EstadoEmpleado; label: string }[] = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'vacaciones', label: 'Vacaciones' },
    { value: 'incapacidad', label: 'Incapacidad' },
    { value: 'baja', label: 'Baja' },
]

export function EmpleadoModal({
    open,
    onClose,
    empleado,
    departamentos,
    puestos,
    onSave,
    loading
}: EmpleadoModalProps) {
    const [formData, setFormData] = React.useState<Partial<Empleado>>({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        numero_empleado: '',
        departamento_id: '',
        puesto_id: '',
        fecha_ingreso: '',
        tipo_contrato: 'tiempo_completo',
        estado: 'activo',
        salario_mensual: 0,
        dias_vacaciones_disponibles: 0,
    })

    React.useEffect(() => {
        if (empleado) {
            setFormData({
                nombre: empleado.nombre,
                apellido_paterno: empleado.apellido_paterno,
                apellido_materno: empleado.apellido_materno || '',
                email: empleado.email,
                telefono: empleado.telefono || '',
                fecha_nacimiento: empleado.fecha_nacimiento,
                numero_empleado: empleado.numero_empleado,
                departamento_id: empleado.departamento_id,
                puesto_id: empleado.puesto_id,
                fecha_ingreso: empleado.fecha_ingreso,
                tipo_contrato: empleado.tipo_contrato,
                estado: empleado.estado,
                salario_mensual: empleado.salario_mensual || 0,
                dias_vacaciones_disponibles: empleado.dias_vacaciones_disponibles,
            })
        } else {
            setFormData({
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                email: '',
                telefono: '',
                fecha_nacimiento: '',
                numero_empleado: `EMP-${Date.now().toString().slice(-6)}`,
                departamento_id: '',
                puesto_id: '',
                fecha_ingreso: new Date().toISOString().split('T')[0],
                tipo_contrato: 'tiempo_completo',
                estado: 'activo',
                salario_mensual: 0,
                dias_vacaciones_disponibles: 10,
            })
        }
    }, [empleado, open])

    const handleChange = (field: keyof Empleado, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const puestosFiltrados = formData.departamento_id
        ? puestos.filter(p => p.departamento_id === formData.departamento_id)
        : puestos

    const iniciales = formData.nombre && formData.apellido_paterno
        ? `${formData.nombre[0]}${formData.apellido_paterno[0]}`
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
                    {/* Avatar preview */}
                    <div className="flex justify-center mb-6">
                        <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                            <AvatarImage src={empleado?.foto_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-xl font-semibold">
                                {iniciales}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Datos personales */}
                        <div className="col-span-2">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
                                Datos Personales
                            </h4>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                placeholder="Nombre"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                            <Input
                                id="apellido_paterno"
                                value={formData.apellido_paterno}
                                onChange={(e) => handleChange('apellido_paterno', e.target.value)}
                                placeholder="Apellido Paterno"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellido_materno">Apellido Materno</Label>
                            <Input
                                id="apellido_materno"
                                value={formData.apellido_materno}
                                onChange={(e) => handleChange('apellido_materno', e.target.value)}
                                placeholder="Apellido Materno"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                            <Input
                                id="fecha_nacimiento"
                                type="date"
                                value={formData.fecha_nacimiento}
                                onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="correo@empresa.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                                id="telefono"
                                value={formData.telefono}
                                onChange={(e) => handleChange('telefono', e.target.value)}
                                placeholder="555-0000"
                            />
                        </div>

                        {/* Datos laborales */}
                        <div className="col-span-2 mt-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
                                Datos Laborales
                            </h4>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numero_empleado">Número de Empleado</Label>
                            <Input
                                id="numero_empleado"
                                value={formData.numero_empleado}
                                onChange={(e) => handleChange('numero_empleado', e.target.value)}
                                placeholder="EMP-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
                            <Input
                                id="fecha_ingreso"
                                type="date"
                                value={formData.fecha_ingreso}
                                onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Departamento *</Label>
                            <Select
                                value={formData.departamento_id}
                                onValueChange={(value) => handleChange('departamento_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar departamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departamentos.map(dep => (
                                        <SelectItem key={dep.id} value={dep.id}>{dep.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Puesto *</Label>
                            <Select
                                value={formData.puesto_id}
                                onValueChange={(value) => handleChange('puesto_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar puesto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {puestosFiltrados.map(puesto => (
                                        <SelectItem key={puesto.id} value={puesto.id}>{puesto.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Contrato</Label>
                            <Select
                                value={formData.tipo_contrato}
                                onValueChange={(value) => handleChange('tipo_contrato', value as TipoContrato)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposContrato.map(tipo => (
                                        <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                                value={formData.estado}
                                onValueChange={(value) => handleChange('estado', value as EstadoEmpleado)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {estadosEmpleado.map(estado => (
                                        <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salario">Salario Mensual</Label>
                            <Input
                                id="salario"
                                type="number"
                                value={formData.salario_mensual}
                                onChange={(e) => handleChange('salario_mensual', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vacaciones">Días de Vacaciones</Label>
                            <Input
                                id="vacaciones"
                                type="number"
                                value={formData.dias_vacaciones_disponibles}
                                onChange={(e) => handleChange('dias_vacaciones_disponibles', parseInt(e.target.value) || 0)}
                                placeholder="10"
                            />
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
