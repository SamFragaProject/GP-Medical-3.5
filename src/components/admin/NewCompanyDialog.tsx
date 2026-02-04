import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    CheckCircle,
    ShieldCheck,
    Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { empresasService } from '@/services/dataService'

interface NewCompanyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    initialData?: any // Tipo laxo para evitar conflictos de importación o Partial<Empresa>
}

export function NewCompanyDialog({ open, onOpenChange, onSuccess, initialData }: NewCompanyDialogProps) {
    const [loading, setLoading] = useState(false)
    const [createAdmin, setCreateAdmin] = useState(true)

    // Datos de la empresa
    const [empresaData, setEmpresaData] = useState({
        nombre: '',
        razon_social: '',
        rfc: '',
        direccion: '',
        telefono: '',
        email: '',
        plan: 'basico' as 'basico' | 'profesional' | 'enterprise'
    })

    // Datos del administrador inicial
    const [adminData, setAdminData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: ''
    })

    // Effect to load initial data for editing
    useEffect(() => {
        if (open) {
            if (initialData) {
                setEmpresaData({
                    nombre: initialData.nombre || '',
                    razon_social: initialData.razon_social || '',
                    rfc: initialData.rfc || '',
                    direccion: initialData.direccion || '',
                    telefono: initialData.telefono || '',
                    email: initialData.email || '',
                    plan: (initialData.plan_type || initialData.plan || 'basico') as any
                })
                setCreateAdmin(false) // No crear admin al editar
            } else {
                // Reset for new creation
                setEmpresaData({
                    nombre: '',
                    razon_social: '',
                    rfc: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    plan: 'basico'
                })
                setCreateAdmin(true)
                setAdminData({
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: ''
                })
            }
        }
    }, [open, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (initialData) {
                // MODO EDICIÓN
                await empresasService.update(initialData.id, {
                    ...empresaData
                })
                toast.success('Empresa actualizada correctamente')
            } else {
                // MODO CREACIÓN
                // 1. Crear Empresa
                const nuevaEmpresa = await empresasService.create({
                    ...empresaData,
                    activo: true
                })
                console.log('✅ Empresa creada:', nuevaEmpresa)

                // 2. Crear Admin (si está marcado)
                if (createAdmin && adminData.email) {
                    const { usuariosService } = await import('@/services/dataService');
                    await usuariosService.create({
                        nombre: adminData.nombre,
                        apellido_paterno: adminData.apellido,
                        apellido_materno: '',
                        email: adminData.email,
                        password: adminData.password,
                        telefono: '',
                        empresa_id: nuevaEmpresa.id,
                        rol: 'admin_empresa',
                        permisos: {
                            pacientes: ['ver', 'crear', 'editar', 'borrar'],
                            agenda: ['ver', 'crear', 'editar', 'borrar'],
                            examenes: ['ver', 'crear', 'editar', 'borrar'],
                            facturacion: ['ver', 'crear', 'editar']
                        }
                    })
                    console.log('👤 Admin creado para empresa:', nuevaEmpresa.id)
                }
                toast.success(`Empresa ${empresaData.nombre} registrada correctamente`)
            }

            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error(initialData ? 'Error al actualizar empresa' : 'Error al registrar empresa')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="w-5 h-5 text-primary" />
                        {initialData ? 'Editar Empresa' : 'Registrar Nueva Empresa Cliente'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Datos de la Empresa */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Información Corporativa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Comercial *</Label>
                                    <Input
                                        id="nombre"
                                        value={empresaData.nombre}
                                        onChange={(e) => setEmpresaData({ ...empresaData, nombre: e.target.value })}
                                        placeholder="Ej. TechCorp"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rfc">RFC</Label>
                                    <Input
                                        id="rfc"
                                        value={empresaData.rfc}
                                        onChange={(e) => setEmpresaData({ ...empresaData, rfc: e.target.value })}
                                        placeholder="XAXX010101000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="razon_social">Razón Social</Label>
                                <Input
                                    id="razon_social"
                                    value={empresaData.razon_social}
                                    onChange={(e) => setEmpresaData({ ...empresaData, razon_social: e.target.value })}
                                    placeholder="Ej. Tecnología Corporativa S.A. de C.V."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="empresa_email">Email Contacto</Label>
                                    <Input
                                        id="empresa_email"
                                        type="email"
                                        value={empresaData.email}
                                        onChange={(e) => setEmpresaData({ ...empresaData, email: e.target.value })}
                                        placeholder="contacto@techcorp.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plan">Plan de Suscripción</Label>
                                    <Select
                                        value={empresaData.plan}
                                        onValueChange={(v: any) => setEmpresaData({ ...empresaData, plan: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basico">Básico (Pequeña)</SelectItem>
                                            <SelectItem value="profesional">Profesional (Mediana)</SelectItem>
                                            <SelectItem value="enterprise">Enterprise (Grande)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Inicial - Solo en Creación */}
                    {!initialData && (
                        <Card className={`border-slate-200 transition-all ${createAdmin ? 'bg-white' : 'bg-slate-50 opacity-70'}`}>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Administrador de la Empresa
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="create_admin"
                                        checked={createAdmin}
                                        onCheckedChange={(c) => setCreateAdmin(c === true)}
                                    />
                                    <label
                                        htmlFor="create_admin"
                                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Crear usuario Admin
                                    </label>
                                </div>
                            </CardHeader>

                            {createAdmin && (
                                <CardContent className="space-y-4 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin_nombre">Nombre</Label>
                                            <Input
                                                id="admin_nombre"
                                                value={adminData.nombre}
                                                onChange={(e) => setAdminData({ ...adminData, nombre: e.target.value })}
                                                placeholder="Nombre del Admin"
                                                required={createAdmin}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="admin_apellido">Apellido</Label>
                                            <Input
                                                id="admin_apellido"
                                                value={adminData.apellido}
                                                onChange={(e) => setAdminData({ ...adminData, apellido: e.target.value })}
                                                placeholder="Apellido"
                                                required={createAdmin}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin_email">Email Corporativo</Label>
                                            <Input
                                                id="admin_email"
                                                type="email"
                                                value={adminData.email}
                                                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                                                placeholder="admin@techcorp.com"
                                                required={createAdmin}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="admin_password">Contraseña Temporal</Label>
                                            <Input
                                                id="admin_password"
                                                type="password"
                                                value={adminData.password}
                                                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                                placeholder="••••••••"
                                                required={createAdmin}
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Credenciales iniciales para el administrador de la empresa.
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Procesando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {initialData ? <Save className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    {initialData ? 'Guardar Cambios' : 'Registrar Empresa'}
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
