import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Users,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Building,
    CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NewCompanyDialog } from './NewCompanyDialog'
import { empresasService } from '@/services/dataService'
import toast from 'react-hot-toast'

interface Empresa {
    id: string
    nombre: string
    razon_social: string
    rfc: string
    direccion: string
    telefono: string
    email: string
    plan_type: 'basico' | 'profesional' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
    usuarios_count: number
    created_at: string
}

// Mock data (kept as fallback or initial type reference)
const EMPRESAS_DEMO: Empresa[] = [
    {
        id: '1',
        nombre: 'TechCorp México',
        razon_social: 'Tecnología Corporativa SA de CV',
        rfc: 'TCM123456ABC',
        direccion: 'Av. Reforma 123, CDMX',
        telefono: '55-1234-5678',
        email: 'contacto@techcorp.mx',
        plan_type: 'enterprise',
        status: 'active',
        usuarios_count: 45,
        created_at: '2024-01-15'
    }
]

const PLAN_COLORS = {
    basico: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    profesional: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    enterprise: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
}

const STATUS_COLORS = {
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
    suspended: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle }
}

export function EmpresasView() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
    const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false)

    const fetchEmpresas = async () => {
        setLoading(true)
        try {
            const data = await empresasService.getAll()

            const mappedData: Empresa[] = data.map((e: any) => ({
                id: e.id,
                nombre: e.nombre,
                razon_social: e.razon_social || '',
                rfc: e.rfc || '',
                direccion: e.direccion || '',
                telefono: e.telefono || '',
                email: e.email || '',
                plan_type: (e.plan as any) || 'basico',
                status: e.activa !== false ? 'active' : 'inactive', // Default to active if null/undefined, or strict checking
                usuarios_count: 0, // Placeholder
                created_at: e.created_at
            }))

            // If empty, use demo for now to show UI (optional, or just show empty)
            // But let's show real data or empty
            setEmpresas(mappedData)
        } catch (error) {
            console.error('Error fetching empresas:', error)
            // If error, maybe show demo data?
            // setEmpresas(EMPRESAS_DEMO)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmpresas()
    }, [])

    const filteredEmpresas = empresas.filter(empresa => {
        const matchesSearch =
            empresa.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.rfc.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = filterStatus === 'all' || empresa.status === filterStatus

        return matchesSearch && matchesStatus
    })

    const handleEdit = (empresa: Empresa) => {
        setSelectedEmpresa(empresa)
        setIsNewCompanyDialogOpen(true)
    }

    const handleToggleStatus = async (empresa: Empresa) => {
        const nuevoEstado = empresa.status !== 'active' // Si no es active, lo hacemos active. Si es active, lo hacemos inactive/suspended
        const confirmMessage = nuevoEstado
            ? `¿Reactivar la empresa ${empresa.nombre}?`
            : `¿Suspender la empresa ${empresa.nombre}? Sus usuarios perderán acceso.`

        if (!window.confirm(confirmMessage)) return

        try {
            await empresasService.toggleStatus(empresa.id, nuevoEstado)
            toast.success(nuevoEstado ? 'Empresa reactivada' : 'Empresa suspendida')
            fetchEmpresas()
        } catch (error) {
            toast.error('Error al cambiar estado')
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <NewCompanyDialog
                open={isNewCompanyDialogOpen}
                onOpenChange={(open) => {
                    setIsNewCompanyDialogOpen(open)
                    if (!open) setSelectedEmpresa(null) // Limpiar al cerrar
                }}
                onSuccess={() => {
                    fetchEmpresas()
                    setSelectedEmpresa(null)
                }}
                initialData={selectedEmpresa}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Empresas</h1>
                    <p className="text-gray-600 mt-1">Gestión de empresas clientes - {empresas.length} total</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedEmpresa(null)
                        setIsNewCompanyDialogOpen(true)
                    }}
                    className="bg-primary hover:bg-primary/90 text-gray-900 shadow-lg shadow-primary/25 rounded-xl px-6 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Empresa
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Empresas', value: empresas.length, icon: Building2, color: 'emerald' },
                    { label: 'Activas', value: empresas.filter(e => e.status === 'active').length, icon: CheckCircle, color: 'emerald' },
                    { label: 'Total Usuarios', value: empresas.reduce((sum, e) => sum + e.usuarios_count, 0), icon: Users, color: 'emerald' },
                    { label: 'Inactivas', value: empresas.filter(e => e.status !== 'active').length, icon: XCircle, color: 'amber' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filters */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre o RFC..."
                            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Button
                            variant={filterStatus === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus('all')}
                            className="rounded-lg text-xs"
                        >
                            Todas
                        </Button>
                        <Button
                            variant={filterStatus === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus('active')}
                            className="rounded-lg text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                            Activas
                        </Button>
                        <Button
                            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus('inactive')}
                            className="rounded-lg text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            Inactivas
                        </Button>
                        <Button
                            variant={filterStatus === 'suspended' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus('suspended')}
                            className="rounded-lg text-xs border-red-200 text-red-700 hover:bg-red-50"
                        >
                            Suspendidas
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredEmpresas.map((empresa, index) => {
                        const StatusIcon = STATUS_COLORS[empresa.status].icon
                        const planColor = PLAN_COLORS[empresa.plan_type]
                        const statusColor = STATUS_COLORS[empresa.status]

                        return (
                            <motion.div
                                key={empresa.id}
                                layoutId={`empresa-${empresa.id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="h-full border-none shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600">
                                                    <AvatarFallback className="bg-transparent text-white font-bold">
                                                        {empresa.nombre.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                                        {empresa.nombre}
                                                    </CardTitle>
                                                    <p className="text-xs text-gray-500 mt-0.5">{empresa.rfc}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(empresa)}>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {/* Plan and Status */}
                                        <div className="flex gap-2">
                                            <Badge className={`text-xs ${planColor.bg} ${planColor.text} border-${planColor.border} capitalize`}>
                                                {empresa.plan_type}
                                            </Badge>
                                            <Badge className={`text-xs ${statusColor.bg} ${statusColor.text} flex items-center gap-1`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {empresa.status === 'active' ? 'Activa' : empresa.status === 'inactive' ? 'Inactiva' : 'Suspendida'}
                                            </Badge>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-2 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{empresa.direccion || 'Sin dirección'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 flex-shrink-0" />
                                                <span>{empresa.telefono || 'Sin teléfono'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{empresa.email || 'Sin email'}</span>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Users className="w-3 h-3" />
                                                <span className="font-semibold">{empresa.usuarios_count}</span> usuarios
                                            </div>
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs hover:text-emerald-600"
                                                    onClick={() => handleEdit(empresa)}
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-7 px-2 text-xs ${empresa.status === 'active' ? 'hover:text-red-600' : 'hover:text-emerald-600'}`}
                                                    onClick={() => handleToggleStatus(empresa)}
                                                    title={empresa.status === 'active' ? 'Suspender' : 'Reactivar'}
                                                >
                                                    {empresa.status === 'active' ? (
                                                        <Trash2 className="w-3 h-3" />
                                                    ) : (
                                                        <CheckCircle className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {filteredEmpresas.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron empresas</h3>
                    <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                </div>
            )}
        </div>
    )
}
