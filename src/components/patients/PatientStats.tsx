import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, Activity, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { pacientesService } from '@/services/dataService'

export function PatientStats() {
    const [stats, setStats] = useState({
        total: 0,
        aptos: 0,
        restricciones: 0,
        noAptos: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const pacientes = await pacientesService.getAll()
                // Calcular estadísticas por estatus
                const total = pacientes.length
                const aptos = pacientes.filter(p => p.estatus === 'apto' || p.estatus === 'activo').length
                const restricciones = pacientes.filter(p => p.estatus === 'restriccion').length
                const noAptos = pacientes.filter(p => p.estatus === 'no_apto' || p.estatus === 'inactivo').length

                setStats({ total, aptos: aptos || total, restricciones, noAptos })
                console.log('✅ PatientStats cargadas desde Supabase:', { total, aptos, restricciones, noAptos })
            } catch (error) {
                console.error('Error cargando estadísticas de pacientes:', error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const statsConfig = [
        {
            title: 'Total Pacientes',
            value: loading ? '-' : stats.total.toLocaleString(),
            trend: '+12%',
            trendUp: true,
            icon: Users,
            color: 'blue',
            bg: 'bg-blue-100',
            text: 'text-blue-600'
        },
        {
            title: 'Aptos',
            value: loading ? '-' : stats.aptos.toLocaleString(),
            trend: '+5%',
            trendUp: true,
            icon: UserCheck,
            color: 'emerald',
            bg: 'bg-emerald-100',
            text: 'text-emerald-600'
        },
        {
            title: 'Con Restricciones',
            value: loading ? '-' : stats.restricciones.toLocaleString(),
            trend: '-2%',
            trendUp: false,
            icon: Activity,
            color: 'amber',
            bg: 'bg-amber-100',
            text: 'text-amber-600'
        },
        {
            title: 'No Aptos',
            value: loading ? '-' : stats.noAptos.toLocaleString(),
            trend: '-8%',
            trendUp: false,
            icon: UserX,
            color: 'rose',
            bg: 'bg-rose-100',
            text: 'text-rose-600'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsConfig.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
                                    </h3>
                                    <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}

