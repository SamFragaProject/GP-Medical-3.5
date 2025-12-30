/**
 * PatientFormModal - Form for creating/editing patients
 */
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, Calendar, Droplets, AlertCircle, Briefcase, CreditCard } from 'lucide-react'
import type { DemoPatient } from '@/data/mockDemoData'

interface PatientFormModalProps {
    open: boolean
    onClose: () => void
    onSave: (patient: Omit<DemoPatient, 'id' | 'empresaId'>) => void
    patient?: DemoPatient | null // If provided, we're editing
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' }
]

export function PatientFormModal({ open, onClose, onSave, patient }: PatientFormModalProps) {
    const isEditing = !!patient

    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        telefono: '',
        fechaNacimiento: '',
        genero: 'masculino' as 'masculino' | 'femenino' | 'otro',
        tipoSangre: '',
        alergias: '',
        numeroEmpleado: '',
        curp: '',
        nss: '',
        estatus: 'activo' as 'activo' | 'inactivo' | 'incapacitado' | 'suspendido'
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reset form when opening/closing or when patient changes
    useEffect(() => {
        if (open) {
            if (patient) {
                setFormData({
                    nombre: patient.nombre || '',
                    apellidoPaterno: patient.apellidoPaterno || '',
                    apellidoMaterno: patient.apellidoMaterno || '',
                    email: patient.email || '',
                    telefono: patient.telefono || '',
                    fechaNacimiento: patient.fechaNacimiento || '',
                    genero: patient.genero || 'masculino',
                    tipoSangre: patient.tipoSangre || '',
                    alergias: patient.alergias || '',
                    numeroEmpleado: patient.numeroEmpleado || '',
                    curp: patient.curp || '',
                    nss: patient.nss || '',
                    estatus: patient.estatus || 'activo'
                })
            } else {
                // Generate a new employee number for new patients
                const newEmpNum = `EMP-${String(Date.now()).slice(-4)}`
                setFormData({
                    nombre: '',
                    apellidoPaterno: '',
                    apellidoMaterno: '',
                    email: '',
                    telefono: '',
                    fechaNacimiento: '',
                    genero: 'masculino',
                    tipoSangre: '',
                    alergias: '',
                    numeroEmpleado: newEmpNum,
                    curp: '',
                    nss: '',
                    estatus: 'activo'
                })
            }
            setErrors({})
        }
    }, [open, patient])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido paterno es requerido'
        if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        onSave({
            nombre: formData.nombre.trim(),
            apellidoPaterno: formData.apellidoPaterno.trim(),
            apellidoMaterno: formData.apellidoMaterno.trim() || undefined,
            email: formData.email.trim() || undefined,
            telefono: formData.telefono.trim() || undefined,
            fechaNacimiento: formData.fechaNacimiento,
            genero: formData.genero,
            tipoSangre: formData.tipoSangre || undefined,
            alergias: formData.alergias.trim() || undefined,
            numeroEmpleado: formData.numeroEmpleado.trim(),
            curp: formData.curp.trim() || undefined,
            nss: formData.nss.trim() || undefined,
            estatus: formData.estatus
        })
        onClose()
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" /> Información Personal
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={e => handleChange('nombre', e.target.value)}
                                placeholder="Juan Carlos"
                                className={errors.nombre ? 'border-red-500' : ''}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                            <Input
                                id="apellidoPaterno"
                                value={formData.apellidoPaterno}
                                onChange={e => handleChange('apellidoPaterno', e.target.value)}
                                placeholder="García"
                                className={errors.apellidoPaterno ? 'border-red-500' : ''}
                            />
                            {errors.apellidoPaterno && <p className="text-red-500 text-xs mt-1">{errors.apellidoPaterno}</p>}
                        </div>

                        <div>
                            <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                            <Input
                                id="apellidoMaterno"
                                value={formData.apellidoMaterno}
                                onChange={e => handleChange('apellidoMaterno', e.target.value)}
                                placeholder="López"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="fechaNacimiento"
                                    type="date"
                                    value={formData.fechaNacimiento}
                                    onChange={e => handleChange('fechaNacimiento', e.target.value)}
                                    className={`pl-10 ${errors.fechaNacimiento ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>}
                        </div>

                        <div>
                            <Label htmlFor="genero">Género</Label>
                            <select
                                id="genero"
                                value={formData.genero}
                                onChange={e => handleChange('genero', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {GENDERS.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="tipoSangre">Tipo de Sangre</Label>
                            <div className="relative">
                                <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
                                <select
                                    id="tipoSangre"
                                    value={formData.tipoSangre}
                                    onChange={e => handleChange('tipoSangre', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Seleccionar...</option>
                                    {BLOOD_TYPES.map(bt => (
                                        <option key={bt} value={bt}>{bt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Contacto
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="telefono">Teléfono</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="telefono"
                                    value={formData.telefono}
                                    onChange={e => handleChange('telefono', e.target.value)}
                                    placeholder="55 1234 5678"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Work Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Información Laboral
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="numeroEmpleado">No. Empleado</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="numeroEmpleado"
                                    value={formData.numeroEmpleado}
                                    onChange={e => handleChange('numeroEmpleado', e.target.value)}
                                    placeholder="EMP-001"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="curp">CURP</Label>
                            <Input
                                id="curp"
                                value={formData.curp}
                                onChange={e => handleChange('curp', e.target.value.toUpperCase())}
                                placeholder="XXXX000000XXXXXX00"
                                maxLength={18}
                            />
                        </div>

                        <div>
                            <Label htmlFor="nss">NSS</Label>
                            <Input
                                id="nss"
                                value={formData.nss}
                                onChange={e => handleChange('nss', e.target.value)}
                                placeholder="12345678901"
                                maxLength={11}
                            />
                        </div>
                    </div>
                </div>

                {/* Medical Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Información Médica
                    </h3>

                    <div>
                        <Label htmlFor="alergias">Alergias Conocidas</Label>
                        <textarea
                            id="alergias"
                            value={formData.alergias}
                            onChange={e => handleChange('alergias', e.target.value)}
                            placeholder="Ninguna conocida, o listar las alergias separadas por comas..."
                            rows={2}
                            className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-gray-900">
                        {isEditing ? 'Guardar Cambios' : 'Crear Paciente'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
