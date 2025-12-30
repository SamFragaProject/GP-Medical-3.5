import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    Search,
    Plus,
    MoreVertical,
    Activity,
    Shield,
    Loader2,
    MapPin,
    Mail,
    Phone,
    Calendar
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { empresasService, Empresa } from '@/services/dataService'
import toast from 'react-hot-toast'

export function Empresas() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await empresasService.getAll()
            setEmpresas(data)
        } catch (error) {
            console.error('Error al cargar empresas:', error)
            toast.error('Error al cargar lista de empresas')
        } finally {
            setLoading(false)
        }
    }

    const filtered = empresas.filter(e =>
        e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.razon_social?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = () => {
        toast.success('Funcionalidad de crear habilitada próximamente')
    }

    return (
        <div className="min-h-screen space-y-6 bg-slate-50/50 p-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Empresas</h1>
                    <p className="text-gray-600 mt-1">Administración de clientes y tenants del SaaS</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 rounded-xl px-6"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Empresa
                </Button>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 font-medium">Total Empresas</p>
                                <h3 className="text-3xl font-bold mt-2">{empresas.length}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 font-medium">Activas</p>
                                <h3 className="text-3xl font-bold mt-2 text-gray-900">
                                    {empresas.filter(e => e.activo).length}
                                </h3>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <Activity className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 font-medium">Plan Enterprise</p>
                                <h3 className="text-3xl font-bold mt-2 text-gray-900">
                                    {empresas.filter(e => e.plan === 'enterprise').length}
                                </h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card className="border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre, razón social..."
                            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mr-2" />
                            <span>Cargando empresas...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No se encontraron empresas
                        </div>
                    ) : (
                        filtered.map((empresa) => (
                            <motion.div
                                key={empresa.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                                        {empresa.nombre.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{empresa.nombre}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> {empresa.email || 'Sin email'}
                                            <span className="text-gray-300">|</span>
                                            <MapPin className="w-3 h-3" /> {empresa.direccion || 'Sin dirección'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <Badge variant={empresa.plan === 'enterprise' ? 'default' : 'secondary'} className="capitalize">
                                        Plan {empresa.plan}
                                    </Badge>

                                    <div className={`flex items-center gap-2 text-sm ${empresa.activo ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        <div className={`w-2 h-2 rounded-full ${empresa.activo ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                        {empresa.activo ? 'Activo' : 'Inactivo'}
                                    </div>

                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    )
}
