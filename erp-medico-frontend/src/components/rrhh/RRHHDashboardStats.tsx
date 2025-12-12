// Componente RRHHDashboardStats - KPIs del módulo RRHH
import React from 'react'
import { RRHHStats } from '@/types/rrhh'
import { Card, CardContent } from '@/components/ui/card'
import {
    Users,
    UserCheck,
    Palmtree,
    Stethoscope,
    Clock,
    CalendarOff,
    FileQuestion,
    Cake,
    Award
} from 'lucide-react'
import { motion } from 'framer-motion'

interface RRHHDashboardStatsProps {
    stats: RRHHStats
    loading?: boolean
}

const statCards = [
    {
        key: 'total_empleados',
        label: 'Total Empleados',
        icon: Users,
        color: 'from-blue-500 to-blue-600',
        bgGlow: 'bg-blue-500/20'
    },
    {
        key: 'empleados_activos',
        label: 'Activos Hoy',
        icon: UserCheck,
        color: 'from-emerald-500 to-emerald-600',
        bgGlow: 'bg-emerald-500/20'
    },
    {
        key: 'empleados_vacaciones',
        label: 'En Vacaciones',
        icon: Palmtree,
        color: 'from-cyan-500 to-cyan-600',
        bgGlow: 'bg-cyan-500/20'
    },
    {
        key: 'empleados_incapacidad',
        label: 'Incapacidad',
        icon: Stethoscope,
        color: 'from-orange-500 to-orange-600',
        bgGlow: 'bg-orange-500/20'
    },
    {
        key: 'asistencia_hoy',
        label: 'Ficharon Hoy',
        icon: Clock,
        color: 'from-violet-500 to-violet-600',
        bgGlow: 'bg-violet-500/20'
    },
    {
        key: 'ausencias_hoy',
        label: 'Ausencias Hoy',
        icon: CalendarOff,
        color: 'from-red-500 to-red-600',
        bgGlow: 'bg-red-500/20'
    },
    {
        key: 'solicitudes_pendientes',
        label: 'Solicitudes Pendientes',
        icon: FileQuestion,
        color: 'from-amber-500 to-amber-600',
        bgGlow: 'bg-amber-500/20'
    },
    {
        key: 'cumpleanos_mes',
        label: 'Cumpleaños del Mes',
        icon: Cake,
        color: 'from-pink-500 to-pink-600',
        bgGlow: 'bg-pink-500/20'
    },
] as const

export function RRHHDashboardStats({ stats, loading }: RRHHDashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card, index) => {
                const Icon = card.icon
                const value = stats[card.key as keyof RRHHStats]

                return (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="relative overflow-hidden border-slate-200/60 hover:shadow-lg transition-all duration-300 group">
                            {/* Glow effect */}
                            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full ${card.bgGlow} blur-2xl opacity-50 group-hover:opacity-70 transition-opacity`} />

                            <CardContent className="p-4 relative">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">
                                            {loading ? (
                                                <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded" />
                                            ) : (
                                                value
                                            )}
                                        </p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
