/**
 * UserFormModal - Form for creating/editing users
 */
import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, Shield, Building2 } from 'lucide-react'
import { ROLE_LABELS } from '@/types/auth'
import type { UserRole } from '@/types/auth'

interface UserData {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno?: string
    email: string
    telefono?: string
    hierarchy: string
    cedulaProfesional?: string
    especialidad?: string
}

interface UserFormModalProps {
    open: boolean
    onClose: () => void
    onSave: (user: UserData) => void
    user?: any | null // If provided, we're editing
}

const ROLES: { value: string; label: string }[] = [
    { value: 'super_admin', label: ROLE_LABELS.super_admin },
    { value: 'admin_empresa', label: ROLE_LABELS.admin_empresa },
    { value: 'medico', label: ROLE_LABELS.medico },
    { value: 'paciente', label: ROLE_LABELS.paciente },
]

const EXTENDED_ROLES = [
    ...ROLES,
    { value: 'medico_trabajo', label: 'Médico del Trabajo' },
    { value: 'medico_especialista', label: 'Médico Especialista' },
    { value: 'enfermera', label: 'Enfermera' },
    { value: 'recepcion', label: 'Recepción' },
]

export function UserFormModal({ open, onClose, onSave, user }: UserFormModalProps) {
    const isEditing = !!user

    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        telefono: '',
        hierarchy: 'medico',
        cedulaProfesional: '',
        especialidad: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reset form when opening/closing or when user changes
    useEffect(() => {
        if (open) {
            if (user) {
                setFormData({
                    nombre: user.nombre || '',
                    apellidoPaterno: user.apellidoPaterno || user.apellido_paterno || '',
                    apellidoMaterno: user.apellidoMaterno || user.apellido_materno || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    hierarchy: user.hierarchy || user.rol || 'medico',
                    cedulaProfesional: user.cedulaProfesional || '',
                    especialidad: user.especialidad || ''
                })
            } else {
                setFormData({
                    nombre: '',
                    apellidoPaterno: '',
                    apellidoMaterno: '',
                    email: '',
                    telefono: '',
                    hierarchy: 'medico',
                    cedulaProfesional: '',
                    especialidad: ''
                })
            }
            setErrors({})
        }
    }, [open, user])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido es requerido'
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
            email: formData.email.trim(),
            telefono: formData.telefono.trim() || undefined,
            hierarchy: formData.hierarchy,
            cedulaProfesional: formData.cedulaProfesional.trim() || undefined,
            especialidad: formData.especialidad.trim() || undefined
        })
        onClose()
    }

    const isMedicalRole = ['medico', 'medico_trabajo', 'medico_especialista', 'enfermera'].includes(formData.hierarchy)

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                                placeholder="María"
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
                                placeholder="González"
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
                                placeholder="Pérez"
                            />
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
                            <Label htmlFor="email">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    placeholder="correo@mediflow.com"
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

                {/* Role Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Rol y Permisos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hierarchy">Rol del Usuario *</Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    id="hierarchy"
                                    value={formData.hierarchy}
                                    onChange={e => handleChange('hierarchy', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {EXTENDED_ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Credentials (only for medical roles) */}
                {isMedicalRole && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Credenciales Médicas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cedulaProfesional">Cédula Profesional</Label>
                                <Input
                                    id="cedulaProfesional"
                                    value={formData.cedulaProfesional}
                                    onChange={e => handleChange('cedulaProfesional', e.target.value)}
                                    placeholder="CED-12345678"
                                />
                            </div>

                            <div>
                                <Label htmlFor="especialidad">Especialidad</Label>
                                <Input
                                    id="especialidad"
                                    value={formData.especialidad}
                                    onChange={e => handleChange('especialidad', e.target.value)}
                                    placeholder="Medicina del Trabajo"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-gray-900">
                        {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
