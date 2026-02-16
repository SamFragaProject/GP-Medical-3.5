/**
 * SuperAdminGodMode - Centro de Mando Omnipotente
 * GPMedical ERP Pro
 * 
 * Control total y absoluto del ecosistema SaaS:
 * - Orquestación de empresas y perchas (tenants)
 * - Gestión de usuarios maestros y privilegios
 * - Monitoreo de salud del sistema en tiempo real
 * - Marketplace de extensiones y plugins
 * - Inteligencia financiera del ecosistema
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Crown, Building2, Users, Shield, BarChart3,
    Plus, Search, ChevronRight, Check, X,
    Stethoscope, Heart, ClipboardList, UserCog, User,
    Eye, Edit, Trash2, MoreVertical, Settings,
    ArrowLeft, ArrowRight, Loader2, Receipt,
    CreditCard, FileText, DollarSign, TrendingUp, Calendar, AlertCircle,
    Activity, ShieldAlert, Cpu, Globe, Zap,
    Share2, Download, Filter, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

import { ROLE_TEMPLATES, getAssignableRoles, clonePermissions, MODULOS_SISTEMA, ACCIONES, type PermisoModulo, type RolTemplate } from '@/config/RoleTemplates'
import { empresasService, usuariosService } from '@/services/dataService'
import { Layers } from 'lucide-react'
import { PluginMarketplace } from './PluginMarketplace'
import { SystemHealthWidget } from '@/components/admin/SystemHealthWidget'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';

// =============================================
// COMPONENTES PREMIUM AUXILIARES
// =============================================

const KpiCardGod = ({ icon: Icon, title, value, subtitle, trend, color }: {
    icon: any; title: string; value: number | string; subtitle?: string; trend?: string; color: string
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="relative group overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 transition-all duration-500 hover:shadow-2xl"
    >
        <div className={`absolute top-0 left-0 w-2 h-full ${color}`} />
        <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</span>
                <div className="flex items-center gap-2 mt-1">
                    {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingUp size={10} /> {trend}
                    </span>}
                    <span className="text-[10px] font-bold text-slate-400">{subtitle}</span>
                </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 bg-slate-50 dark:bg-white/5`}>
                <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
        </div>
    </motion.div>
)

const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: () => void }) => (
    <button
        type="button"
        onClick={onCheckedChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-emerald-500 shadow-inner' : 'bg-slate-200'
            }`}
    >
        <motion.span
            animate={{ x: checked ? 24 : 4 }}
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-md"
        />
    </button>
)

// =============================================
// TIPOS E ICONOS
// =============================================

const iconMap: Record<string, React.ElementType> = {
    Crown, Building2, Stethoscope, Heart, ClipboardList, Users, User, UserCog, Shield
}

const getIcon = (iconName: string) => iconMap[iconName] || User

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

    const loadEmpresas = async () => {
        setLoading(true)
        try {
            const data = await empresasService.getAll()
            setEmpresas(data || [])
        } catch (error) {
            console.error('Error loading empresas:', error)
            setEmpresas([
                { id: '1', nombre: 'Hospital Central Lomas', rfc: 'HCL123456789', plan_type: 'enterprise', status: 'active', usuarios_count: 142 },
                { id: '2', nombre: 'Clínica Oftalmológica Norte', rfc: 'CON987654321', plan_type: 'profesional', status: 'active', usuarios_count: 28 },
                { id: '3', nombre: 'Centro Médico Integral', rfc: 'CMI456789123', plan_type: 'basico', status: 'active', usuarios_count: 5 },
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEmpresas()
    }, [])

    const filteredEmpresas = useMemo(() =>
        empresas.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())),
        [empresas, searchTerm]
    )

    const globalKPIs = useMemo(() => ({
        totalEmpresas: empresas.length,
        totalUsuarios: empresas.reduce((sum, e) => sum + (e.usuarios_count || 0), 0),
        mrr: empresas.reduce((sum, e) => sum + (e.plan_type === 'enterprise' ? 45000 : e.plan_type === 'profesional' ? 25000 : 15000), 0),
        uptime: "99.98%"
    }), [empresas])

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 overflow-x-hidden">
            {/* Header unificado Premium */}
            <PremiumPageHeader
                title="SaaS Governance Control"
                subtitle="Monitoreo omnisciente del ecosistema GPMedical 3.5 en tiempo real"
                badge={`GOD MODE ACTIVE`}
                icon={Crown}
                gradient="from-slate-900 via-emerald-950 to-slate-900"
                actions={
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={loadEmpresas}>
                            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar Nodos
                        </Button>
                        <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold" onClick={() => setShowWizardEmpresa(true)}>
                            <Plus size={16} className="mr-2" /> Desplegar Tenant
                        </Button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-6 -mt-10 mb-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <KpiCardGod icon={Building2} title="Tenants Activos" value={globalKPIs.totalEmpresas} subtitle="Empresas en vivo" trend="+12%" color="bg-blue-500" />
                    <KpiCardGod icon={Users} title="Usuarios Totales" value={globalKPIs.totalUsuarios.toLocaleString()} subtitle="Sesiones activas" trend="+8%" color="bg-emerald-500" />
                    <KpiCardGod icon={DollarSign} title="MRR Ecosistema" value={`$${(globalKPIs.mrr / 1000).toFixed(1)}k`} subtitle="Ingresos recurrentes" trend="+15%" color="bg-indigo-500" />
                    <KpiCardGod icon={Activity} title="Health & Uptime" value={globalKPIs.uptime} subtitle="Servidores globales" color="bg-purple-500" />
                </div>

                <SystemHealthWidget />
            </div>

            {/* Navegación de Control */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="bg-white/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 flex-nowrap h-14">
                        {[
                            { value: 'empresas', label: 'Tenants', icon: Building2 },
                            { value: 'usuarios', label: 'Identity', icon: Users },
                            { value: 'roles', label: 'Privileges', icon: Shield },
                            { value: 'extensiones', label: 'Ecosystem', icon: Layers },
                            { value: 'facturacion', label: 'Ledger', icon: Receipt },
                            { value: 'analytics', label: 'Strategic', icon: BarChart3 },
                        ].map(tab => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all duration-300"
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* CONTENIDO DE TABS */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Tab: Empresas/Tenants */}
                        <TabsContent value="empresas" className="mt-0">
                            <Card className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border-slate-100 shadow-xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-10 px-0">
                                    <div>
                                        <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Registro de Tenants</CardTitle>
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1.5 flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-blue-500" /> Mapa Global de Operaciones
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="rounded-xl h-12 px-6 font-bold text-xs border-slate-200">
                                            <Download size={16} className="mr-2" /> Exportar Registro
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="relative mb-8 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                                        <Input
                                            placeholder="Auditando base de datos: Buscar por nombre, RFC o ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-12 h-14 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
                                        />
                                    </div>

                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Interrogando Nodos...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {/* RESTO DE TABS (Refactorizados con el mismo estilo) */}
                        <TabsContent value="usuarios">
                            <UsuariosTab empresas={empresas} />
                        </TabsContent>

                        <TabsContent value="roles">
                            <RolesTab />
                        </TabsContent>

                        <TabsContent value="extensiones">
                            <PluginMarketplace />
                        </TabsContent>

                        <TabsContent value="facturacion">
                            <FacturacionTab empresas={empresas} />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <AnalyticsTab empresas={empresas} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            {/* Wizards Refinados */}
            <WizardNuevaEmpresa
                open={showWizardEmpresa}
                onClose={() => setShowWizardEmpresa(false)}
                onSuccess={() => { setShowWizardEmpresa(false); loadEmpresas() }}
            />

            <WizardNuevoUsuario
                open={showWizardUsuario}
                onClose={() => { setShowWizardUsuario(false); setSelectedEmpresa(null) }}
                empresa={selectedEmpresa}
                onSuccess={() => { setShowWizardUsuario(false); setSelectedEmpresa(null); loadEmpresas() }}
            />
        </div>
    )
}

// =============================================
// EMPRESA CARD PREMIUM
// =============================================
function EmpresaCard({ empresa, onCreateUser }: { empresa: EmpresaUI; onCreateUser: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                        <Building2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-tight">{empresa.nombre}</h3>
                        <div className="flex gap-2 mt-2 items-center">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 px-2 py-0.5">
                                {empresa.rfc}
                            </Badge>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Node</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right border-l border-slate-100 pl-8">
                        <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{empresa.usuarios_count || 0}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Identidades</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className={`px-4 py-1.5 rounded-xl text-center border font-black text-[9px] uppercase tracking-widest ${empresa.plan_type === 'enterprise' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                empresa.plan_type === 'profesional' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                            {empresa.plan_type}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" className="rounded-xl h-10 w-10 hover:bg-emerald-50 transition-all hover:scale-110" onClick={onCreateUser} title="Añadir Master User">
                                <Plus size={20} className="text-emerald-600" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-xl h-10 w-10 hover:bg-slate-50 transition-all">
                                        <Settings size={20} className="text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 w-56">
                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 gap-3">
                                        <Edit size={16} className="text-blue-500" /> Editar Configuración
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 gap-3">
                                        <Shield size={16} className="text-indigo-500" /> Auditoría de Seguridad
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 gap-3">
                                        <Zap size={16} className="text-amber-500" /> Forzar Sincronización
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-50" />
                                    <DropdownMenuItem className="rounded-xl font-black text-[10px] uppercase tracking-widest py-3 gap-3 text-rose-600 hover:bg-rose-50">
                                        <Trash2 size={16} /> Terminar Tenant
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// =============================================
// WIZARDS REFINADOS (Empresa & Usuario)
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

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const empresa = await empresasService.create({
                ...data,
                plan: data.plan_type,
                activo: true
            })
            if (empresa?.id) {
                await usuariosService.create({
                    nombre: data.admin_nombre,
                    email: data.admin_email,
                    password: data.admin_password,
                    rol: 'admin_empresa',
                    empresa_id: empresa.id
                })
            }
            toast.success('Tenant desplegado satisfactoriamente'); onSuccess()
            setStep(1); setData({ nombre: '', razon_social: '', rfc: '', direccion: '', telefono: '', email: '', plan_type: 'profesional', admin_nombre: '', admin_email: '', admin_password: '' })
        } catch { toast.error('Fallo en el despliegue del Tenant') }
        finally { setLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl rounded-[3rem] p-10 border-none shadow-2xl overflow-hidden">
                <DialogHeader className="mb-8">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-inner">
                            <Building2 className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight">Despliegue de Tenant</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Orquestación SaaS</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar py-2">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-sm transition-all duration-500 shadow-sm ${s === step ? 'bg-blue-600 text-white scale-110 shadow-blue-500/30' :
                                    s < step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {s < step ? <Check size={20} /> : s}
                            </div>
                            {s < 3 && <div className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${s < step ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-5 py-2">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Corporativo *</Label>
                                    <Input value={data.nombre} onChange={(e) => setData({ ...data, nombre: e.target.value })} placeholder="Global Medical Corp" className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">RFC Fiscal *</Label>
                                    <Input value={data.rfc} onChange={(e) => setData({ ...data, rfc: e.target.value })} placeholder="XAXX010101000" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono Soporte</Label>
                                    <Input value={data.telefono} onChange={(e) => setData({ ...data, telefono: e.target.value })} placeholder="+52 ..." className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="grid grid-cols-3 gap-4 py-2">
                                {(['basico', 'profesional', 'enterprise'] as const).map((plan) => (
                                    <div
                                        key={plan}
                                        onClick={() => setData({ ...data, plan_type: plan })}
                                        className={`p-6 rounded-3xl border-4 cursor-pointer transition-all flex flex-col items-center gap-3 text-center ${data.plan_type === plan
                                            ? 'border-blue-500 bg-blue-50 shadow-xl scale-105'
                                            : 'border-transparent bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.plan_type === plan ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {plan === 'enterprise' ? <Crown size={24} /> : plan === 'profesional' ? <Zap size={24} /> : <Activity size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">{plan}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1">
                                                {plan === 'basico' ? 'Uso Pyme' : plan === 'profesional' ? 'Uso Médico' : 'Escala Global'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 py-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Master Administrator *</Label>
                                    <Input value={data.admin_nombre} onChange={(e) => setData({ ...data, admin_nombre: e.target.value })} placeholder="Nombre del Super User" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Identity *</Label>
                                        <Input type="email" value={data.admin_email} onChange={(e) => setData({ ...data, admin_email: e.target.value })} placeholder="admin@tenant.com" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña Maestra *</Label>
                                        <Input type="password" value={data.admin_password} onChange={(e) => setData({ ...data, admin_password: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-12 gap-4">
                    <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)} className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
                        {step === 1 ? 'Abortar' : <><ArrowLeft size={16} className="mr-2" /> Atrás</>}
                    </Button>
                    <Button
                        onClick={step === totalSteps ? handleSubmit : () => setStep(step + 1)}
                        className="h-14 flex-1 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : step === totalSteps ? <><CheckCircle2 size={16} className="mr-2" /> Deploy Node</> : <><span className="mr-2">Siguiente Fase</span> <ChevronRight size={16} /></>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

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

    const handleSelectRole = (role: RolTemplate) => {
        setSelectedRole(role); setPermisos(clonePermissions(role.permisos)); setStep(2)
    }

    const togglePermiso = (modulo: string, accion: keyof PermisoModulo) => {
        setPermisos(prev => prev.map(p => p.modulo === modulo ? { ...p, [accion]: !p[accion] } : p))
    }

    const handleSubmit = async () => {
        if (!empresa || !selectedRole) return
        setLoading(true)
        try {
            await usuariosService.create({ ...userData, rol: selectedRole.id, empresa_id: empresa.id, permisos })
            toast.success('Entidad biográfica creada exitosamente'); onSuccess(); setStep(1); setSelectedRole(null);
        } catch { toast.error('Fallo en la creación de usuario') }
        finally { setLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl rounded-[3rem] p-10 border-none shadow-2xl overflow-hidden max-h-[95vh]">
                <DialogHeader className="mb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                            <Users className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight">Registro de Identidad</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{empresa?.nombre || 'GPMedical'}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
                    {['Plantilla', 'Privilegios', 'Datos'].map((label, i) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${i + 1 === step ? 'bg-emerald-600 text-white shadow-lg' :
                                        i + 1 < step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {i + 1 < step ? <Check size={14} /> : i + 1}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                            </div>
                            {i < 2 && <div className={`flex-1 min-w-[30px] h-1 rounded-full ${i + 1 < step ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {roles.map((role) => {
                                    const Icon = getIcon(role.icono)
                                    return (
                                        <div key={role.id} onClick={() => handleSelectRole(role)} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer transition-all duration-300 group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${role.gradiente} shadow-lg group-hover:scale-110 transition-transform`}>
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">{role.nombre}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{role.descripcion}</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {step === 2 && selectedRole && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-100">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${selectedRole.gradiente} shadow-xl`}>
                                        {React.createElement(getIcon(selectedRole.icono), { className: 'w-6 h-6 text-white' })}
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-widest">{selectedRole.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Modificando privilegios granulares para este perfil</p>
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    {MODULOS_SISTEMA.map((modulo) => {
                                        const permiso = permisos.find(p => p.modulo === modulo.codigo)
                                        if (!permiso) return null
                                        return (
                                            <div key={modulo.codigo} className={`p-5 rounded-[2rem] border transition-all ${permiso.ver ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50/50 border-slate-50 opacity-60'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Switch checked={permiso.ver} onCheckedChange={() => togglePermiso(modulo.codigo, 'ver')} />
                                                        <span className={`text-xs font-black uppercase tracking-widest ${permiso.ver ? 'text-slate-900' : 'text-slate-400'}`}>{modulo.nombre}</span>
                                                    </div>
                                                    {permiso.ver && <div className="flex gap-2">
                                                        {(['crear', 'editar', 'borrar'] as const).map((accion) => (
                                                            <button key={accion} onClick={() => togglePermiso(modulo.codigo, accion)} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${permiso[accion] ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                                                {accion}
                                                            </button>
                                                        ))}
                                                    </div>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid grid-cols-2 gap-6 py-2">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-2">Nombre Completo *</Label>
                                    <Input value={userData.nombre} onChange={(e) => setUserData({ ...userData, nombre: e.target.value })} placeholder="Juan Perez" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-2">Email Identity *</Label>
                                    <Input type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} placeholder="juan@perz.mx" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-2">Acceso *</Label>
                                    <Input type="password" value={userData.password} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-10 gap-4">
                    <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)} className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400">
                        Atrás
                    </Button>
                    <Button
                        onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
                        className="h-12 flex-1 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                        disabled={loading || (step === 1 && !selectedRole)}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : step === 3 ? 'Finalizar Registro' : 'Procesar Datos'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// =============================================
// SUB-TABS REFACTORIZADOS
// =============================================

function UsuariosTab({ empresas }: { empresas: EmpresaUI[] }) {
    return (
        <Card className="bg-white/80 rounded-[2.5rem] p-10 border-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="px-0 pt-0 pb-10">
                <CardTitle className="text-3xl font-black tracking-tight">Identity Management</CardTitle>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Directorio Centralizado de Usuarios Maestros</p>
            </CardHeader>
            <CardContent className="px-0">
                <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Users className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Enlace de Contexto Requerido</h4>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 mb-8">
                        Para gestionar identidades maestras, accede a través de la sección de <b>Tenants</b> y selecciona la corporación destino.
                    </p>
                    <Button className="rounded-xl bg-slate-900 text-white font-bold h-12 shadow-xl shadow-slate-900/20">
                        Go to Tenants <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function RolesTab() {
    return (
        <Card className="bg-white/80 rounded-[2.5rem] p-10 border-slate-100 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-10 px-0 pt-0">
                <div>
                    <CardTitle className="text-3xl font-black tracking-tight">Privilege Blueprints</CardTitle>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Estructuras jerárquicas y permisos de sistema</p>
                </div>
                <Button className="rounded-xl bg-slate-900 text-white font-bold px-6 h-12 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> Custom Blueprint
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ROLE_TEMPLATES.map((role) => {
                        const Icon = getIcon(role.icono)
                        const activos = role.permisos.filter(p => p.ver).length
                        return (
                            <motion.div whileHover={{ y: -5 }} key={role.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradiente} shadow-lg flex items-center justify-center`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xs uppercase tracking-[0.15em] text-slate-900">{role.nombre}</h4>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Hierarchical Lv {role.nivel_jerarquia}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 h-8">{role.descripcion}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0.5 border-slate-200">{activos}/{MODULOS_SISTEMA.length} Modules</Badge>
                                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

function AnalyticsTab({ empresas }: { empresas: EmpresaUI[] }) {
    const totalUsuarios = empresas.reduce((sum, e) => sum + (e.usuarios_count || 0), 0)

    return (
        <Card className="bg-white/80 rounded-[2.5rem] p-10 border-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="px-0 pt-0 pb-10">
                <CardTitle className="text-3xl font-black tracking-tight">Strategic Intelligence</CardTitle>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Analítica de rendimiento global y penetración de mercado</p>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="relative overflow-hidden p-8 rounded-[2rem] bg-slate-900 text-white">
                        <Cpu className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Tenants</p>
                        <p className="text-4xl font-black mt-2 tracking-tighter">{empresas.length}</p>
                    </div>
                    <div className="relative overflow-hidden p-8 rounded-[2rem] bg-emerald-600 text-white">
                        <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Master Identities</p>
                        <p className="text-4xl font-black mt-2 tracking-tighter">{totalUsuarios.toLocaleString()}</p>
                    </div>
                    <div className="relative overflow-hidden p-8 rounded-[2rem] bg-indigo-600 text-white">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Roles</p>
                        <p className="text-4xl font-black mt-2 tracking-tighter">{ROLE_TEMPLATES.length}</p>
                    </div>
                    <div className="relative overflow-hidden p-8 rounded-[2rem] bg-amber-600 text-white">
                        <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Service Uptime</p>
                        <p className="text-4xl font-black mt-2 tracking-tighter">99.98%</p>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-[2rem] p-20 text-center border border-slate-100">
                    <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Engine Analytics</h4>
                    <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Sincronizando con BigData Node...</p>
                </div>
            </CardContent>
        </Card>
    )
}

function FacturacionTab({ empresas }: { empresas: EmpresaUI[] }) {
    const facturasDemo = [
        { id: 'FAC-7701', empresa: 'Hospital Central Lomas', monto: 145000, status: 'pagada', fecha: '2026-02-10' },
        { id: 'FAC-7702', empresa: 'Clínica Oftalmológica Norte', monto: 28500, status: 'pendiente', fecha: '2026-02-11' },
        { id: 'FAC-7703', empresa: 'Red Médica Integral', monto: 62000, status: 'vencida', fecha: '2026-01-05' },
    ]

    return (
        <Card className="bg-white/80 rounded-[2.5rem] p-10 border-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-10 px-0 pt-0">
                <div>
                    <CardTitle className="text-3xl font-black tracking-tight">Financial Ledger</CardTitle>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Consolidado financiero del ecosistema SaaS</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl font-bold h-12 px-6">
                        <Share2 size={16} className="mr-2" /> Share Report
                    </Button>
                    <Button className="rounded-xl bg-emerald-500 text-white font-bold h-12 px-6 shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={16} className="mr-2" /> Conciliar Todo
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-4">
                    {facturasDemo.map((fac, idx) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={fac.id} className="p-8 rounded-[2rem] border border-slate-100 bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                    <Receipt className="w-7 h-7 text-slate-400 group-hover:text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-slate-900 leading-tight">{fac.empresa}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <Badge variant="outline" className="text-[9px] font-black tracking-widest px-2 py-0.5 border-slate-200">{fac.id}</Badge>
                                        <span className="text-[10px] text-slate-400 font-bold">{fac.fecha}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${fac.status === 'pagada' ? 'bg-emerald-100 text-emerald-600' :
                                                fac.status === 'vencida' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>{fac.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">${fac.monto.toLocaleString()}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">SaaS Revenue MXN</p>
                                </div>
                                <Button variant="ghost" className="rounded-xl h-12 w-12 hover:bg-slate-50"><ChevronRight size={20} className="text-slate-300" /></Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

import { ShieldCheck } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'
