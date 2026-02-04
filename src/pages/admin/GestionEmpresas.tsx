import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Plus,
    Search,
    MapPin,
    Globe,
    Shield,
    MoreVertical,
    Users,
    Activity,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    Edit,
    ExternalLink
} from 'lucide-react'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dataService } from '@/services/dataService'
import { NewCompanyDialog } from '@/components/admin/NewCompanyDialog'
import toast from 'react-hot-toast'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

export default function GestionEmpresas() {
    const [empresas, setEmpresas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null)

    useEffect(() => {
        cargarEmpresas()
    }, [])

    const cargarEmpresas = async () => {
        setLoading(true)
        try {
            const data = await dataService.empresas.getAll()
            setEmpresas(data)
        } catch (error) {
            toast.error('Error al cargar empresas')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (emp: any) => {
        setSelectedEmpresa(emp)
        setIsDialogOpen(true)
    }

    const handleToggleStatus = async (emp: any) => {
        try {
            await dataService.empresas.toggleStatus(emp.id, !emp.activo)
            toast.success(emp.activo ? 'Empresa suspendida' : 'Empresa activada')
            cargarEmpresas()
        } catch (error) {
            toast.error('Error al cambiar el estado')
        }
    }

    const filteredEmpresas = empresas.filter(emp =>
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (emp.rfc && emp.rfc.toLowerCase().includes(busqueda.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            <PremiumHeader
                title="Gestión de Empresas (Tenants)"
                subtitle="Administra los socios corporativos y sus configuraciones SaaS."
                badges={[{ text: 'Multi-Tenancy', variant: 'info', icon: <Shield size={12} /> }]}
            >
                <PremiumButton
                    variant="primary"
                    gradient
                    icon={<Plus size={16} />}
                    onClick={() => {
                        setSelectedEmpresa(null)
                        setIsDialogOpen(true)
                    }}
                >
                    Nueva Empresa
                </PremiumButton>
            </PremiumHeader>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <Search className="text-slate-400 w-5 h-5 ml-2" />
                <input
                    type="text"
                    placeholder="Buscar empresa por nombre, RFC o código..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando Universos de Datos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEmpresas.map((emp) => (
                        <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card className="rounded-[2rem] border-none shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
                                <div className={`h-2 ${emp.activo ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'}`} />
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-16 h-16 rounded-2xl ${emp.activo ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
                                            <Building2 size={32} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={emp.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                                                {emp.activo ? 'Activa' : 'Suspendida'}
                                            </Badge>
                                            <Badge variant="outline" className="border-blue-200 text-blue-600 uppercase font-black text-[9px]">
                                                Plan {emp.plan || 'Trial'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-8">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{emp.nombre}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                            <Globe size={14} className="text-slate-400" />
                                            {emp.rfc || 'Sin RFC'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                <Users size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Colaboradores</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">--</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                                <Activity size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Estado</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Sincronizado</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                                        >
                                            Configurar
                                        </button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 border-slate-100 shadow-2xl">
                                                <DropdownMenuItem onClick={() => handleEdit(emp)} className="rounded-xl gap-3 font-bold text-xs py-2.5">
                                                    <Edit size={14} className="text-blue-600" /> Editar Datos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5">
                                                    <Users size={14} className="text-slate-600" /> Ver Usuarios
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(emp)}
                                                    className={`rounded-xl gap-3 font-bold text-xs py-2.5 ${emp.activo ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                >
                                                    {emp.activo ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                                    {emp.activo ? 'Suspender Empresa' : 'Activar Empresa'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <NewCompanyDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={cargarEmpresas}
                initialData={selectedEmpresa}
            />
        </div>
    )
}
