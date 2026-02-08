/**
 * Resumen de Empresas Demo
 * GPMedical ERP Pro
 * 
 * Componente que muestra un resumen visual de las empresas
 * con sus estadísticas principales.
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    Users,
    MapPin,
    Crown,
    Activity,
    ChevronRight,
    Sparkles,
    TrendingUp
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    EMPRESAS_MOCK,
    SEDES_MOCK,
    PACIENTES_MOCK,
    USUARIOS_MOCK
} from '@/data/mockData'

interface EmpresaStats {
    id: string
    nombre: string
    plan: string
    activo: boolean
    sedes: number
    usuarios: number
    pacientes: number
}

function getEmpresaStats(): EmpresaStats[] {
    return EMPRESAS_MOCK.map(emp => ({
        id: emp.id,
        nombre: emp.nombre,
        plan: emp.plan,
        activo: emp.activo,
        sedes: SEDES_MOCK.filter(s => s.empresa_id === emp.id).length,
        usuarios: USUARIOS_MOCK.filter(u => u.empresa_id === emp.id).length,
        pacientes: PACIENTES_MOCK.filter(p => p.empresa_id === emp.id).length
    }))
}

const planConfig: Record<string, { color: string, icon: React.ReactNode, label: string }> = {
    trial: {
        color: 'from-slate-400 to-slate-500',
        icon: <Sparkles className="w-4 h-4" />,
        label: 'Trial'
    },
    basico: {
        color: 'from-blue-400 to-blue-500',
        icon: <Activity className="w-4 h-4" />,
        label: 'Básico'
    },
    profesional: {
        color: 'from-violet-500 to-purple-500',
        icon: <TrendingUp className="w-4 h-4" />,
        label: 'Profesional'
    },
    enterprise: {
        color: 'from-amber-500 to-orange-500',
        icon: <Crown className="w-4 h-4" />,
        label: 'Enterprise'
    }
}

interface ResumenEmpresasDemoProps {
    onVerEmpresa?: (empresaId: string) => void
}

export function ResumenEmpresasDemo({ onVerEmpresa }: ResumenEmpresasDemoProps) {
    const empresas = getEmpresaStats()
    const totalPacientes = PACIENTES_MOCK.length
    const totalUsuarios = USUARIOS_MOCK.length
    const totalSedes = SEDES_MOCK.length

    return (
        <div className="space-y-6">
            {/* Header con totales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 border-none text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Empresas</p>
                                    <p className="text-3xl font-black">{empresas.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 border-none text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Usuarios</p>
                                    <p className="text-3xl font-black">{totalUsuarios}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-violet-500 to-purple-500 border-none text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-violet-100 text-sm font-medium">Sedes</p>
                                    <p className="text-3xl font-black">{totalSedes}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-rose-500 to-pink-500 border-none text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-rose-100 text-sm font-medium">Pacientes</p>
                                    <p className="text-3xl font-black">{totalPacientes}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Lista de empresas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {empresas.map((empresa, index) => {
                    const plan = planConfig[empresa.plan] || planConfig.basico

                    return (
                        <motion.div
                            key={empresa.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1) }}
                        >
                            <Card className="group hover:shadow-xl transition-all duration-300 border-slate-100 overflow-hidden">
                                {/* Header con gradiente del plan */}
                                <div className={`bg-gradient-to-r ${plan.color} p-4 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{empresa.nombre}</h3>
                                                <div className="flex items-center gap-1 text-sm opacity-90">
                                                    {plan.icon}
                                                    <span>{plan.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`${empresa.activo ? 'bg-white/20 text-white border-white/30' : 'bg-red-500/20 text-white border-red-300/30'}`}
                                        >
                                            {empresa.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4">
                                    {/* Estadísticas */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                                            <MapPin className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                                            <p className="text-xl font-bold text-slate-900">{empresa.sedes}</p>
                                            <p className="text-xs text-slate-500">Sedes</p>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                                            <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                            <p className="text-xl font-bold text-slate-900">{empresa.usuarios}</p>
                                            <p className="text-xs text-slate-500">Usuarios</p>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                                            <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                            <p className="text-xl font-bold text-slate-900">{empresa.pacientes}</p>
                                            <p className="text-xs text-slate-500">Pacientes</p>
                                        </div>
                                    </div>

                                    {/* Botón ver más */}
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between group-hover:bg-slate-100"
                                        onClick={() => onVerEmpresa?.(empresa.id)}
                                    >
                                        Ver detalles
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export default ResumenEmpresasDemo
