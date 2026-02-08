/**
 * Wizard de Creación de Empresa
 * GPMedical ERP Pro
 * 
 * Wizard de 4 pasos para crear una nueva empresa cliente:
 * 1. Datos de la empresa
 * 2. Plan y facturación
 * 3. Configuración de roles
 * 4. Crear primer usuario admin
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Shield,
    Users,
    Stethoscope,
    HeartPulse,
    PhoneCall,
    ClipboardList,
    Check,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Sparkles,
    Crown,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { empresaService, CrearEmpresaDTO } from '@/services/tenantService'
import toast from 'react-hot-toast'

// =====================================================
// TIPOS Y CONSTANTES
// =====================================================

interface WizardCrearEmpresaProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

interface FormData {
    // Paso 1: Datos empresa
    nombre: string
    rfc: string
    razon_social: string
    direccion: string
    telefono: string
    email: string
    // Paso 2: Plan
    plan: 'trial' | 'basico' | 'profesional' | 'enterprise'
    // Paso 3: Roles
    roles_habilitados: string[]
    // Paso 4: Admin
    admin_nombre: string
    admin_email: string
    admin_password: string
    admin_password_confirm: string
}

const PLANES = [
    {
        id: 'trial',
        nombre: 'Trial',
        precio: 'Gratis',
        periodo: '30 días',
        color: 'from-slate-500 to-slate-600',
        features: ['5 usuarios', '100 pacientes', 'Soporte básico']
    },
    {
        id: 'basico',
        nombre: 'Básico',
        precio: '$1,499',
        periodo: '/mes',
        color: 'from-blue-500 to-indigo-600',
        features: ['10 usuarios', '500 pacientes', 'Facturación CFDI', 'Soporte email']
    },
    {
        id: 'profesional',
        nombre: 'Profesional',
        precio: '$2,999',
        periodo: '/mes',
        color: 'from-emerald-500 to-teal-600',
        popular: true,
        features: ['25 usuarios', 'Pacientes ilimitados', 'NOM-035', 'Soporte prioritario']
    },
    {
        id: 'enterprise',
        nombre: 'Enterprise',
        precio: 'Cotizar',
        periodo: '',
        color: 'from-purple-500 to-violet-600',
        features: ['Usuarios ilimitados', 'API personalizada', 'SLA 99.9%', 'Soporte dedicado']
    }
]

const ROLES_DISPONIBLES = [
    {
        id: 'medico',
        nombre: 'Médico',
        descripcion: 'Atención clínica, diagnóstico y prescripción',
        icono: Stethoscope,
        color: 'emerald',
        recomendado: true
    },
    {
        id: 'enfermera',
        nombre: 'Enfermería',
        descripcion: 'Signos vitales, apoyo en estudios',
        icono: HeartPulse,
        color: 'pink',
        recomendado: true
    },
    {
        id: 'recepcion',
        nombre: 'Recepción',
        descripcion: 'Citas, atención al público, cobros',
        icono: PhoneCall,
        color: 'cyan',
        recomendado: true
    },
    {
        id: 'asistente',
        nombre: 'Asistente',
        descripcion: 'Apoyo administrativo general',
        icono: ClipboardList,
        color: 'violet',
        recomendado: false
    }
]

const PASOS = [
    { id: 1, nombre: 'Empresa', icono: Building2 },
    { id: 2, nombre: 'Plan', icono: CreditCard },
    { id: 3, nombre: 'Roles', icono: Users },
    { id: 4, nombre: 'Admin', icono: Crown }
]

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function WizardCrearEmpresa({ open, onOpenChange, onSuccess }: WizardCrearEmpresaProps) {
    const [paso, setPaso] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errores, setErrores] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        rfc: '',
        razon_social: '',
        direccion: '',
        telefono: '',
        email: '',
        plan: 'trial',
        roles_habilitados: ['medico', 'enfermera', 'recepcion'],
        admin_nombre: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirm: ''
    })

    // Validar paso actual
    const validarPaso = (): boolean => {
        const nuevosErrores: Record<string, string> = {}

        if (paso === 1) {
            if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido'
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                nuevosErrores.email = 'Email inválido'
            }
        }

        if (paso === 4) {
            if (!formData.admin_nombre.trim()) nuevosErrores.admin_nombre = 'El nombre es requerido'
            if (!formData.admin_email.trim()) {
                nuevosErrores.admin_email = 'El email es requerido'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
                nuevosErrores.admin_email = 'Email inválido'
            }
            if (!formData.admin_password) {
                nuevosErrores.admin_password = 'La contraseña es requerida'
            } else if (formData.admin_password.length < 8) {
                nuevosErrores.admin_password = 'Mínimo 8 caracteres'
            }
            if (formData.admin_password !== formData.admin_password_confirm) {
                nuevosErrores.admin_password_confirm = 'Las contraseñas no coinciden'
            }
        }

        setErrores(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    // Siguiente paso
    const siguiente = () => {
        if (validarPaso()) {
            setPaso(p => Math.min(p + 1, 4))
        }
    }

    // Paso anterior
    const anterior = () => {
        setPaso(p => Math.max(p - 1, 1))
    }

    // Toggle rol
    const toggleRol = (rolId: string) => {
        setFormData(prev => ({
            ...prev,
            roles_habilitados: prev.roles_habilitados.includes(rolId)
                ? prev.roles_habilitados.filter(r => r !== rolId)
                : [...prev.roles_habilitados, rolId]
        }))
    }

    // Crear empresa
    const crearEmpresa = async () => {
        if (!validarPaso()) return

        setLoading(true)
        try {
            const dto: CrearEmpresaDTO = {
                nombre: formData.nombre,
                rfc: formData.rfc || undefined,
                razon_social: formData.razon_social || undefined,
                direccion: formData.direccion || undefined,
                telefono: formData.telefono || undefined,
                email: formData.email || undefined,
                plan: formData.plan,
                admin_email: formData.admin_email,
                admin_nombre: formData.admin_nombre,
                admin_password: formData.admin_password,
                roles_habilitados: formData.roles_habilitados
            }

            const result = await empresaService.crear(dto)

            if (result.success) {
                toast.success('¡Empresa creada exitosamente!')
                onSuccess()
                onOpenChange(false)
                // Reset form
                setPaso(1)
                setFormData({
                    nombre: '',
                    rfc: '',
                    razon_social: '',
                    direccion: '',
                    telefono: '',
                    email: '',
                    plan: 'trial',
                    roles_habilitados: ['medico', 'enfermera', 'recepcion'],
                    admin_nombre: '',
                    admin_email: '',
                    admin_password: '',
                    admin_password_confirm: ''
                })
            } else {
                toast.error(result.error || 'Error al crear la empresa')
            }
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 gap-0 bg-white rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
                {/* Header con pasos */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Nueva Empresa</h2>
                                <p className="text-slate-400 text-sm font-medium">Configura un nuevo cliente en el sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Indicador de pasos */}
                    <div className="flex items-center justify-between">
                        {PASOS.map((p, index) => (
                            <React.Fragment key={p.id}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${paso > p.id
                                                ? 'bg-emerald-500 text-white'
                                                : paso === p.id
                                                    ? 'bg-white text-slate-900 shadow-lg'
                                                    : 'bg-white/10 text-slate-500'
                                            }`}
                                    >
                                        {paso > p.id ? (
                                            <Check className="w-5 h-5 stroke-[3]" />
                                        ) : (
                                            <p.icono className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${paso >= p.id ? 'text-white' : 'text-slate-500'
                                        }`}>
                                        {p.nombre}
                                    </span>
                                </div>
                                {index < PASOS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${paso > p.id ? 'bg-emerald-500' : 'bg-white/10'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Contenido del paso */}
                <div className="p-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {/* PASO 1: Datos de la empresa */}
                        {paso === 1 && (
                            <motion.div
                                key="paso1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Nombre de la Empresa *
                                        </Label>
                                        <Input
                                            value={formData.nombre}
                                            onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                            placeholder="Ej: Clínica del Valle"
                                            className={`h-14 rounded-xl border-2 text-lg font-medium ${errores.nombre ? 'border-rose-300 bg-rose-50' : 'border-slate-100'
                                                }`}
                                        />
                                        {errores.nombre && (
                                            <span className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errores.nombre}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            RFC
                                        </Label>
                                        <Input
                                            value={formData.rfc}
                                            onChange={e => setFormData(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                                            placeholder="XAXX010101000"
                                            maxLength={13}
                                            className="h-14 rounded-xl border-2 border-slate-100 text-lg font-medium uppercase"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Razón Social
                                        </Label>
                                        <Input
                                            value={formData.razon_social}
                                            onChange={e => setFormData(prev => ({ ...prev, razon_social: e.target.value }))}
                                            placeholder="Nombre fiscal completo"
                                            className="h-14 rounded-xl border-2 border-slate-100 text-lg font-medium"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Teléfono
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                value={formData.telefono}
                                                onChange={e => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                                                placeholder="55 1234 5678"
                                                className="h-14 rounded-xl border-2 border-slate-100 text-lg font-medium pl-12"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Email de Contacto
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="contacto@empresa.com"
                                                className={`h-14 rounded-xl border-2 text-lg font-medium pl-12 ${errores.email ? 'border-rose-300 bg-rose-50' : 'border-slate-100'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Dirección
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <Input
                                                value={formData.direccion}
                                                onChange={e => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                                                placeholder="Calle, número, colonia, ciudad, CP"
                                                className="h-14 rounded-xl border-2 border-slate-100 text-lg font-medium pl-12"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* PASO 2: Plan */}
                        {paso === 2 && (
                            <motion.div
                                key="paso2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Selecciona el Plan</h3>
                                    <p className="text-slate-500 font-medium">Elige el plan que mejor se adapte a las necesidades del cliente</p>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {PLANES.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
                                            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${formData.plan === plan.id
                                                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none shadow-lg">
                                                        <Sparkles className="w-3 h-3 mr-1" /> Popular
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>

                                            <h4 className="text-lg font-black text-slate-900 mb-1">{plan.nombre}</h4>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-2xl font-black text-slate-900">{plan.precio}</span>
                                                <span className="text-sm text-slate-500 font-medium">{plan.periodo}</span>
                                            </div>

                                            <ul className="space-y-2">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            {formData.plan === plan.id && (
                                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* PASO 3: Roles */}
                        {paso === 3 && (
                            <motion.div
                                key="paso3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Configura los Roles</h3>
                                    <p className="text-slate-500 font-medium">
                                        Selecciona qué tipos de usuarios podrá crear el administrador de la empresa
                                    </p>
                                </div>

                                {/* Admin siempre incluido */}
                                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Crown className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-black text-slate-900">Administrador</h4>
                                                <Badge className="bg-blue-500 text-white border-none text-[10px]">SIEMPRE INCLUIDO</Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">Control total de la empresa, usuarios y configuración</p>
                                        </div>
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>

                                {/* Roles opcionales */}
                                <div className="grid grid-cols-2 gap-4">
                                    {ROLES_DISPONIBLES.map(rol => {
                                        const isSelected = formData.roles_habilitados.includes(rol.id)
                                        const IconComponent = rol.icono

                                        return (
                                            <button
                                                key={rol.id}
                                                onClick={() => toggleRol(rol.id)}
                                                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${isSelected
                                                        ? `border-${rol.color}-300 bg-${rol.color}-50`
                                                        : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected
                                                            ? `bg-${rol.color}-500 text-white`
                                                            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                        }`}>
                                                        <IconComponent className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900">{rol.nombre}</h4>
                                                            {rol.recomendado && (
                                                                <Badge variant="outline" className="text-[9px] border-emerald-200 text-emerald-600">
                                                                    Recomendado
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-500 mt-1">{rol.descripcion}</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? `border-${rol.color}-500 bg-${rol.color}-500`
                                                            : 'border-slate-200'
                                                        }`}>
                                                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <p className="text-center text-sm text-slate-400 font-medium mt-6">
                                    El administrador podrá crear roles personalizados adicionales después
                                </p>
                            </motion.div>
                        )}

                        {/* PASO 4: Admin */}
                        {paso === 4 && (
                            <motion.div
                                key="paso4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Crear Usuario Administrador</h3>
                                    <p className="text-slate-500 font-medium">
                                        Este será el primer usuario con acceso total a la empresa
                                    </p>
                                </div>

                                <div className="max-w-md mx-auto space-y-6">
                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Nombre Completo *
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                value={formData.admin_nombre}
                                                onChange={e => setFormData(prev => ({ ...prev, admin_nombre: e.target.value }))}
                                                placeholder="Dr. Juan Pérez López"
                                                className={`h-14 rounded-xl border-2 text-lg font-medium pl-12 ${errores.admin_nombre ? 'border-rose-300 bg-rose-50' : 'border-slate-100'
                                                    }`}
                                            />
                                        </div>
                                        {errores.admin_nombre && (
                                            <span className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errores.admin_nombre}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Email del Administrador *
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                type="email"
                                                value={formData.admin_email}
                                                onChange={e => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                                                placeholder="admin@empresa.com"
                                                className={`h-14 rounded-xl border-2 text-lg font-medium pl-12 ${errores.admin_email ? 'border-rose-300 bg-rose-50' : 'border-slate-100'
                                                    }`}
                                            />
                                        </div>
                                        {errores.admin_email && (
                                            <span className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errores.admin_email}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Contraseña *
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.admin_password}
                                                onChange={e => setFormData(prev => ({ ...prev, admin_password: e.target.value }))}
                                                placeholder="Mínimo 8 caracteres"
                                                className={`h-14 rounded-xl border-2 text-lg font-medium pl-12 pr-12 ${errores.admin_password ? 'border-rose-300 bg-rose-50' : 'border-slate-100'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errores.admin_password && (
                                            <span className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errores.admin_password}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                            Confirmar Contraseña *
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.admin_password_confirm}
                                                onChange={e => setFormData(prev => ({ ...prev, admin_password_confirm: e.target.value }))}
                                                placeholder="Repetir contraseña"
                                                className={`h-14 rounded-xl border-2 text-lg font-medium pl-12 ${errores.admin_password_confirm ? 'border-rose-300 bg-rose-50' : 'border-slate-100'
                                                    }`}
                                            />
                                        </div>
                                        {errores.admin_password_confirm && (
                                            <span className="text-rose-500 text-xs font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {errores.admin_password_confirm}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Resumen */}
                                <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
                                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Resumen</h4>
                                    <div className="grid grid-cols-3 gap-6 text-center">
                                        <div>
                                            <p className="text-2xl font-black text-slate-900">{formData.nombre || 'Nueva Empresa'}</p>
                                            <p className="text-sm text-slate-500">Empresa</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-blue-600">{PLANES.find(p => p.id === formData.plan)?.nombre}</p>
                                            <p className="text-sm text-slate-500">Plan</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-emerald-600">{formData.roles_habilitados.length + 1}</p>
                                            <p className="text-sm text-slate-500">Roles disponibles</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer con botones */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={paso === 1 ? () => onOpenChange(false) : anterior}
                        disabled={loading}
                        className="text-slate-500 hover:text-slate-900"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        {paso === 1 ? 'Cancelar' : 'Anterior'}
                    </Button>

                    {paso < 4 ? (
                        <Button
                            onClick={siguiente}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                        >
                            Siguiente
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={crearEmpresa}
                            disabled={loading}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Crear Empresa
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default WizardCrearEmpresa
