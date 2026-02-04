/**
 * Panel Super Admin "Modo Dios"
 * Control total del sistema SaaS con wizard estilo WordPress
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Crown, Building2, Users, Shield, BarChart3,
    Plus, Search, ChevronRight, Check, X,
    Stethoscope, Heart, ClipboardList, UserCog, User,
    Eye, Edit, Trash2, MoreVertical, Settings,
    ArrowLeft, ArrowRight, Loader2, Receipt,
    CreditCard, FileText, DollarSign, TrendingUp, Calendar, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
// Switch component - using custom implementation
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

import { ROLE_TEMPLATES, getAssignableRoles, clonePermissions, MODULOS_SISTEMA, ACCIONES, type PermisoModulo, type RolTemplate } from '@/config/RoleTemplates'
import { empresasService, usuariosService } from '@/services/dataService'
import { Layers } from 'lucide-react'
import { PluginMarketplace } from './PluginMarketplace'
import { SystemHealthWidget } from '@/components/admin/SystemHealthWidget'

// =============================================
// ICONOS HELPER
// =============================================
const iconMap: Record<string, React.ElementType> = {
    Crown, Building2, Stethoscope, Heart, ClipboardList, Users, User, UserCog, Shield
}

const getIcon = (iconName: string) => iconMap[iconName] || User

// Simple Switch Component
const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: () => void }) => (
    <button
        type="button"
        onClick={onCheckedChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`} />
    </button>
)

// =============================================
// TIPOS
// =============================================
interface EmpresaUI {
    id: string
    nombre: string
    rfc?: string
    plan?: string
    plan_type?: string
    status?: string
    activo?: boolean
    usuarios_count?: number
}

interface WizardEmpresaData {
    nombre: string
    razon_social: string
    rfc: string
    direccion: string
    telefono: string
    email: string
    plan_type: 'basico' | 'profesional' | 'enterprise'
    admin_nombre: string
    admin_email: string
    admin_password: string
}

interface WizardUsuarioData {
    empresa_id: string
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    password: string
    rol_id: string
    permisos: PermisoModulo[]
}

import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function SuperAdminGodMode() {
    const [activeTab, setActiveTab] = useState('empresas')
    const [empresas, setEmpresas] = useState<EmpresaUI[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Wizards
    const [showWizardEmpresa, setShowWizardEmpresa] = useState(false)
    const [showWizardUsuario, setShowWizardUsuario] = useState(false)
    const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaUI | null>(null)

    useEffect(() => {
        loadEmpresas()
    }, [])

    const loadEmpresas = async () => {
        setLoading(true)
        try {
            const data = await empresasService.getAll()
            setEmpresas(data || [])
        } catch (error) {
            console.error('Error loading empresas:', error)
            // Demo data fallback
            setEmpresas([
                { id: '1', nombre: 'Hospital Central', rfc: 'HCE123456789', plan_type: 'enterprise', status: 'active', usuarios_count: 25 },
                { id: '2', nombre: 'Clínica Norte', rfc: 'CNO987654321', plan_type: 'profesional', status: 'active', usuarios_count: 12 },
            ])
        } finally {
            setLoading(false)
        }
    }

    const filteredEmpresas = empresas.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 overflow-x-hidden font-sans">
            {/* Header unificado Premium */}
            <PremiumPageHeader
                title="Panel Super Admin"
                subtitle="Control total del ecosistema GPMedical SaaS de alta precisión"
                badge="SISTEMA ACTIVO"
                icon={Crown}
                gradient="from-emerald-950 via-slate-950 to-emerald-950"
            />

            <div className="max-w-7xl mx-auto px-6 mb-10">
                <SystemHealthWidget />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10 px-6 max-w-7xl mx-auto">
                <TabsList className="bg-slate-900/5 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-1.5 rounded-2xl shadow-sm w-full lg:w-max overflow-x-auto flex-nowrap scrollbar-hide">
                    <TabsTrigger value="empresas" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 transition-all font-bold">
                        <Building2 className="w-4 h-4 mr-2" />
                        Empresas
                    </TabsTrigger>
                    <TabsTrigger value="usuarios" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
                        <Users className="w-4 h-4 mr-2" />
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
                        <Shield className="w-4 h-4 mr-2" />
                        Roles
                    </TabsTrigger>
                    <TabsTrigger value="extensiones" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
                        <Layers className="w-4 h-4 mr-2" />
                        Extensiones
                    </TabsTrigger>
                    <TabsTrigger value="facturacion" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
                        <Receipt className="w-4 h-4 mr-2" />
                        Facturación
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all font-bold">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Empresas */}
                <TabsContent value="empresas" className="mt-6">
                    <Card className="glass-card rounded-4xl p-8 border-white/40 dark:border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-8 px-0">
                            <div>
                                <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Empresas</CardTitle>
                                <p className="text-slate-500 font-medium mt-1">Administra los clientes de tu ecosistema SaaS</p>
                            </div>
                            <Button
                                onClick={() => setShowWizardEmpresa(true)}
                                className="emerald-gradient text-white rounded-full px-8 py-6 font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-base border-0"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nueva Empresa
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input
                                    placeholder="Buscar empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-slate-200 focus:border-blue-400"
                                />
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredEmpresas.map((empresa) => (
                                        <EmpresaCard
                                            key={empresa.id}
                                            empresa={empresa}
                                            onCreateUser={() => {
                                                setSelectedEmpresa(empresa)
                                                setShowWizardUsuario(true)
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Usuarios */}
                <TabsContent value="usuarios">
                    <UsuariosTab empresas={empresas} />
                </TabsContent>

                {/* Tab: Roles */}
                <TabsContent value="roles">
                    <RolesTab />
                </TabsContent>

                {/* Tab: Extensiones */}
                <TabsContent value="extensiones">
                    <PluginMarketplace />
                </TabsContent>

                {/* Tab: Facturación */}
                <TabsContent value="facturacion">
                    <FacturacionTab empresas={empresas} />
                </TabsContent>

                {/* Tab: Analytics */}
                <TabsContent value="analytics">
                    <AnalyticsTab empresas={empresas} />
                </TabsContent>
            </Tabs>

            {/* Wizard: Nueva Empresa */}
            <WizardNuevaEmpresa
                open={showWizardEmpresa}
                onClose={() => setShowWizardEmpresa(false)}
                onSuccess={() => {
                    setShowWizardEmpresa(false)
                    loadEmpresas()
                }}
            />

            {/* Wizard: Nuevo Usuario */}
            <WizardNuevoUsuario
                open={showWizardUsuario}
                onClose={() => {
                    setShowWizardUsuario(false)
                    setSelectedEmpresa(null)
                }}
                empresa={selectedEmpresa}
                onSuccess={() => {
                    setShowWizardUsuario(false)
                    setSelectedEmpresa(null)
                    loadEmpresas()
                }}
            />
        </div>
    )
}

// =============================================
// EMPRESA CARD
// =============================================
function EmpresaCard({ empresa, onCreateUser }: { empresa: EmpresaUI; onCreateUser: () => void }) {
    const planColors: Record<string, string> = {
        basico: 'bg-slate-100 text-slate-700',
        profesional: 'bg-blue-100 text-blue-700',
        enterprise: 'bg-purple-100 text-purple-700'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group relative overflow-hidden"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl emerald-gradient flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{empresa.nombre}</h3>
                        <div className="flex gap-2 mt-1 items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{empresa.rfc}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-xs font-bold text-emerald-500">Activo</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="px-5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{empresa.plan_type}</span>
                    </div>
                    <div className="text-right border-l border-slate-100 dark:border-white/5 pl-6">
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{empresa.usuarios_count || 0}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Usuarios</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="rounded-2xl h-12 w-12 hover:bg-emerald-500/10 hover:text-emerald-500 border border-transparent hover:border-emerald-500/20" onClick={onCreateUser}>
                            <Plus className="w-6 h-6" />
                        </Button>
                        <Button variant="ghost" className="rounded-2xl h-12 w-12 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 ">
                            <MoreVertical className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// =============================================
// WIZARD: NUEVA EMPRESA (Con Admin)
// =============================================
function WizardNuevaEmpresa({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<WizardEmpresaData>({
        nombre: '', razon_social: '', rfc: '', direccion: '', telefono: '', email: '',
        plan_type: 'profesional',
        admin_nombre: '', admin_email: '', admin_password: ''
    })

    const totalSteps = 3

    const handleNext = () => step < totalSteps && setStep(step + 1)
    const handleBack = () => step > 1 && setStep(step - 1)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // 1. Crear empresa
            const empresa = await empresasService.create({
                nombre: data.nombre,
                razon_social: data.razon_social,
                rfc: data.rfc,
                direccion: data.direccion,
                telefono: data.telefono,
                email: data.email,
                plan: data.plan_type,
                activo: true
            })

            // 2. Crear admin de la empresa
            if (empresa?.id) {
                await usuariosService.create({
                    nombre: data.admin_nombre,
                    email: data.admin_email,
                    password: data.admin_password,
                    rol: 'admin_empresa',
                    empresa_id: empresa.id
                })
            }

            toast.success('¡Empresa y administrador creados exitosamente!')
            onSuccess()
            setStep(1)
            setData({ nombre: '', razon_social: '', rfc: '', direccion: '', telefono: '', email: '', plan_type: 'profesional', admin_nombre: '', admin_email: '', admin_password: '' })
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al crear la empresa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="w-6 h-6 text-blue-500" />
                        Nueva Empresa
                    </DialogTitle>
                </DialogHeader>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s === step ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                                s < step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {s < step ? <Check className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {step === 1 && (
                            <>
                                <h3 className="font-semibold text-slate-800">Información de la Empresa</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nombre comercial *</Label>
                                        <Input value={data.nombre} onChange={(e) => setData({ ...data, nombre: e.target.value })} placeholder="Mi Clínica" />
                                    </div>
                                    <div>
                                        <Label>RFC *</Label>
                                        <Input value={data.rfc} onChange={(e) => setData({ ...data, rfc: e.target.value })} placeholder="ABC123456XYZ" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Razón Social</Label>
                                        <Input value={data.razon_social} onChange={(e) => setData({ ...data, razon_social: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Teléfono</Label>
                                        <Input value={data.telefono} onChange={(e) => setData({ ...data, telefono: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h3 className="font-semibold text-slate-800">Plan de Suscripción</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['basico', 'profesional', 'enterprise'] as const).map((plan) => (
                                        <div
                                            key={plan}
                                            onClick={() => setData({ ...data, plan_type: plan })}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${data.plan_type === plan
                                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <h4 className="font-semibold capitalize text-slate-800">{plan}</h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {plan === 'basico' && '5 usuarios'}
                                                {plan === 'profesional' && '25 usuarios'}
                                                {plan === 'enterprise' && 'Ilimitado'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h3 className="font-semibold text-slate-800">Administrador de la Empresa</h3>
                                <p className="text-sm text-slate-500 mb-4">Este usuario tendrá control total de la empresa</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label>Nombre completo *</Label>
                                        <Input value={data.admin_nombre} onChange={(e) => setData({ ...data, admin_nombre: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Email *</Label>
                                        <Input type="email" value={data.admin_email} onChange={(e) => setData({ ...data, admin_email: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Contraseña *</Label>
                                        <Input type="password" value={data.admin_password} onChange={(e) => setData({ ...data, admin_password: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                    <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
                        {step === 1 ? 'Cancelar' : <><ArrowLeft className="w-4 h-4 mr-2" />Anterior</>}
                    </Button>
                    <Button
                        onClick={step === totalSteps ? handleSubmit : handleNext}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            step === totalSteps ? <><Check className="w-4 h-4 mr-2" />Crear Empresa</> :
                                <>Siguiente<ArrowRight className="w-4 h-4 ml-2" /></>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// =============================================
// WIZARD: NUEVO USUARIO (Con rol predefinido)
// =============================================
function WizardNuevoUsuario({ open, onClose, empresa, onSuccess }: {
    open: boolean; onClose: () => void; empresa: EmpresaUI | null; onSuccess: () => void
}) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<RolTemplate | null>(null)
    const [permisos, setPermisos] = useState<PermisoModulo[]>([])
    const [userData, setUserData] = useState({
        nombre: '', apellido_paterno: '', apellido_materno: '',
        email: '', password: ''
    })

    const roles = getAssignableRoles()
    const totalSteps = 3

    const handleSelectRole = (role: RolTemplate) => {
        setSelectedRole(role)
        setPermisos(clonePermissions(role.permisos))
        setStep(2)
    }

    const togglePermiso = (modulo: string, accion: keyof PermisoModulo) => {
        setPermisos(prev => prev.map(p =>
            p.modulo === modulo ? { ...p, [accion]: !p[accion] } : p
        ))
    }

    const handleSubmit = async () => {
        if (!empresa || !selectedRole) return
        setLoading(true)
        try {
            await usuariosService.create({
                ...userData,
                rol: selectedRole.id,
                empresa_id: empresa.id,
                permisos
            })
            toast.success('¡Usuario creado exitosamente!')
            onSuccess()
            resetWizard()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al crear el usuario')
        } finally {
            setLoading(false)
        }
    }

    const resetWizard = () => {
        setStep(1)
        setSelectedRole(null)
        setPermisos([])
        setUserData({ nombre: '', apellido_paterno: '', apellido_materno: '', email: '', password: '' })
    }

    return (
        <Dialog open={open} onOpenChange={() => { onClose(); resetWizard() }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Users className="w-6 h-6 text-emerald-500" />
                        Nuevo Usuario {empresa && <Badge variant="outline">{empresa.nombre}</Badge>}
                    </DialogTitle>
                </DialogHeader>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                    {['Tipo de Rol', 'Permisos', 'Datos Usuario'].map((label, i) => (
                        <React.Fragment key={i}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${i + 1 === step ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                                    i + 1 < step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {i + 1 < step ? <Check className="w-5 h-5" /> : i + 1}
                                </div>
                                <span className="text-xs mt-1 text-slate-500">{label}</span>
                            </div>
                            {i < 2 && <div className={`flex-1 h-1 rounded ${i + 1 < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Step 1: Seleccionar Rol */}
                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {roles.map((role) => {
                                    const Icon = getIcon(role.icono)
                                    return (
                                        <div
                                            key={role.id}
                                            onClick={() => handleSelectRole(role)}
                                            className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${role.gradiente} shadow-lg`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 group-hover:text-blue-600">{role.nombre}</h4>
                                                    <p className="text-sm text-slate-500">{role.descripcion}</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-500" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Step 2: Permisos */}
                        {step === 2 && selectedRole && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedRole.gradiente}`}>
                                        {React.createElement(getIcon(selectedRole.icono), { className: 'w-5 h-5 text-white' })}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{selectedRole.nombre}</p>
                                        <p className="text-sm text-slate-500">Permisos predefinidos (puedes ajustarlos)</p>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                                    {MODULOS_SISTEMA.map((modulo) => {
                                        const permiso = permisos.find(p => p.modulo === modulo.codigo)
                                        if (!permiso) return null
                                        return (
                                            <div key={modulo.codigo} className={`p-3 rounded-lg border ${permiso.ver ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={permiso.ver} onCheckedChange={() => togglePermiso(modulo.codigo, 'ver')} />
                                                        <span className={`font-medium ${permiso.ver ? 'text-slate-800' : 'text-slate-400'}`}>{modulo.nombre}</span>
                                                    </div>
                                                    {permiso.ver && (
                                                        <div className="flex gap-2">
                                                            {(['crear', 'editar', 'borrar'] as const).map((accion) => (
                                                                <button
                                                                    key={accion}
                                                                    onClick={() => togglePermiso(modulo.codigo, accion)}
                                                                    className={`px-2 py-1 text-xs rounded-md transition-all ${permiso[accion] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                                                        }`}
                                                                >
                                                                    {accion}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Datos Usuario */}
                        {step === 3 && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre *</Label>
                                    <Input value={userData.nombre} onChange={(e) => setUserData({ ...userData, nombre: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Apellido Paterno *</Label>
                                    <Input value={userData.apellido_paterno} onChange={(e) => setUserData({ ...userData, apellido_paterno: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Apellido Materno</Label>
                                    <Input value={userData.apellido_materno} onChange={(e) => setUserData({ ...userData, apellido_materno: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <Label>Contraseña *</Label>
                                    <Input type="password" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {step > 1 && (
                    <div className="flex justify-between pt-6 border-t">
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />Anterior
                        </Button>
                        <Button
                            onClick={step === totalSteps ? handleSubmit : () => setStep(step + 1)}
                            disabled={loading}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                step === totalSteps ? <><Check className="w-4 h-4 mr-2" />Crear Usuario</> :
                                    <>Siguiente<ArrowRight className="w-4 h-4 ml-2" /></>}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// =============================================
// TAB: USUARIOS
// =============================================
function UsuariosTab({ empresas }: { empresas: EmpresaUI[] }) {
    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Gestión de Usuarios por Empresa</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-500">Selecciona una empresa desde la pestaña "Empresas" para crear usuarios.</p>
            </CardContent>
        </Card>
    )
}

// =============================================
// TAB: ROLES
// =============================================
function RolesTab() {
    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Plantillas de Roles</CardTitle>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Rol Personalizado
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {ROLE_TEMPLATES.map((role) => {
                        const Icon = getIcon(role.icono)
                        const activos = role.permisos.filter(p => p.ver).length
                        return (
                            <div key={role.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${role.gradiente} shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{role.nombre}</h4>
                                        <p className="text-xs text-slate-500">Nivel {role.nivel_jerarquia}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{role.descripcion}</p>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{activos}/{MODULOS_SISTEMA.length} módulos</Badge>
                                    {!role.es_sistema && (
                                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

// =============================================
// TAB: ANALYTICS
// =============================================
function AnalyticsTab({ empresas }: { empresas: EmpresaUI[] }) {
    const totalUsuarios = empresas.reduce((sum, e) => sum + (e.usuarios_count || 0), 0)

    return (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Analytics del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        <p className="text-sm opacity-80">Empresas Activas</p>
                        <p className="text-3xl font-bold">{empresas.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        <p className="text-sm opacity-80">Total Usuarios</p>
                        <p className="text-3xl font-bold">{totalUsuarios}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <p className="text-sm opacity-80">Roles Activos</p>
                        <p className="text-3xl font-bold">{ROLE_TEMPLATES.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        <p className="text-sm opacity-80">Uptime</p>
                        <p className="text-3xl font-bold">99.9%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// =============================================
// TAB: FACTURACIÓN
// =============================================
function FacturacionTab({ empresas }: { empresas: EmpresaUI[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'pagada' | 'pendiente' | 'vencida'>('all')
    const [loading, setLoading] = useState(false)

    // Demo data para facturas del sistema
    const facturasDemo = [
        { id: 'FAC-001', empresa: 'Hospital Central', monto: 45000, status: 'pagada', fecha: '2026-01-20', vencimiento: '2026-02-20' },
        { id: 'FAC-002', empresa: 'Clínica Norte', monto: 28500, status: 'pendiente', fecha: '2026-01-15', vencimiento: '2026-02-15' },
        { id: 'FAC-003', empresa: 'Centro Médico Sur', monto: 62000, status: 'vencida', fecha: '2025-12-10', vencimiento: '2026-01-10' },
        { id: 'FAC-004', empresa: 'Hospital Regional', monto: 35750, status: 'pagada', fecha: '2026-01-18', vencimiento: '2026-02-18' },
        { id: 'FAC-005', empresa: 'Clínica Especializada', monto: 41200, status: 'pendiente', fecha: '2026-01-22', vencimiento: '2026-02-22' },
    ]

    const filteredFacturas = facturasDemo.filter(f => {
        const matchSearch = f.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchStatus = filterStatus === 'all' || f.status === filterStatus
        return matchSearch && matchStatus
    })

    const totalIngresos = facturasDemo.filter(f => f.status === 'pagada').reduce((sum, f) => sum + f.monto, 0)
    const totalPendiente = facturasDemo.filter(f => f.status === 'pendiente').reduce((sum, f) => sum + f.monto, 0)
    const totalVencido = facturasDemo.filter(f => f.status === 'vencida').reduce((sum, f) => sum + f.monto, 0)

    const statusColors: Record<string, string> = {
        pagada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
        vencida: 'bg-red-100 text-red-700 border-red-200'
    }

    const statusLabels: Record<string, string> = {
        pagada: 'Pagada',
        pendiente: 'Pendiente',
        vencida: 'Vencida'
    }

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-6 h-6 opacity-80" />
                        <span className="text-sm font-medium opacity-80">Ingresos Recaudados</span>
                    </div>
                    <p className="text-3xl font-black">${totalIngresos.toLocaleString()}</p>
                    <p className="text-xs mt-1 opacity-70">Este mes</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 opacity-80" />
                        <span className="text-sm font-medium opacity-80">Por Cobrar</span>
                    </div>
                    <p className="text-3xl font-black">${totalPendiente.toLocaleString()}</p>
                    <p className="text-xs mt-1 opacity-70">{facturasDemo.filter(f => f.status === 'pendiente').length} facturas pendientes</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/20"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-6 h-6 opacity-80" />
                        <span className="text-sm font-medium opacity-80">Vencido</span>
                    </div>
                    <p className="text-3xl font-black">${totalVencido.toLocaleString()}</p>
                    <p className="text-xs mt-1 opacity-70">{facturasDemo.filter(f => f.status === 'vencida').length} facturas vencidas</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 opacity-80" />
                        <span className="text-sm font-medium opacity-80">Empresas Activas</span>
                    </div>
                    <p className="text-3xl font-black">{empresas.length}</p>
                    <p className="text-xs mt-1 opacity-70">Con facturación activa</p>
                </motion.div>
            </div>

            {/* Lista de Facturas */}
            <Card className="glass-card rounded-4xl p-8 border-white/40 dark:border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-6 px-0">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Facturación del Sistema
                        </CardTitle>
                        <p className="text-slate-500 font-medium mt-1">Gestiona las suscripciones y cobros de todas las empresas</p>
                    </div>
                    <Button className="emerald-gradient text-white rounded-full px-6 py-5 font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Factura
                    </Button>
                </CardHeader>

                <CardContent className="px-0">
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <Input
                                placeholder="Buscar por empresa o folio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-xl border-slate-200 dark:border-white/10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'pagada', 'pendiente', 'vencida'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === status
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                >
                                    {status === 'all' ? 'Todas' : statusLabels[status]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabla de Facturas */}
                    <div className="space-y-3">
                        {filteredFacturas.map((factura, index) => (
                            <motion.div
                                key={factura.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{factura.empresa}</h4>
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${statusColors[factura.status]}`}>
                                                    {statusLabels[factura.status]}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs text-slate-500 font-medium">{factura.id}</span>
                                                <span className="text-xs text-slate-400">Emitida: {factura.fecha}</span>
                                                <span className="text-xs text-slate-400">Vence: {factura.vencimiento}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                                ${factura.monto.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">MXN</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-blue-50 hover:text-blue-600">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredFacturas.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No se encontraron facturas</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
