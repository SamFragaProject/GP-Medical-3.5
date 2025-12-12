// Componente IncidenciasPanel - Panel de incidencias laborales
import React from 'react'
import { Incidencia } from '@/types/rrhh'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    AlertTriangle,
    Clock,
    CalendarX2,
    Stethoscope,
    Ban,
    FileText,
    Check,
    X
} from 'lucide-react'
import { motion } from 'framer-motion'

interface IncidenciasPanelProps {
    incidencias: Incidencia[]
    loading?: boolean
}

const tipoConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    falta: { color: 'bg-red-500/20 text-red-600 border-red-500/30', label: 'Falta', icon: CalendarX2 },
    retardo: { color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', label: 'Retardo', icon: Clock },
    permiso: { color: 'bg-blue-500/20 text-blue-600 border-blue-500/30', label: 'Permiso', icon: FileText },
    incapacidad: { color: 'bg-orange-500/20 text-orange-600 border-orange-500/30', label: 'Incapacidad', icon: Stethoscope },
    suspension: { color: 'bg-purple-500/20 text-purple-600 border-purple-500/30', label: 'Suspensión', icon: Ban },
}

const estadoIcons: Record<string, React.ElementType> = {
    pendiente: Clock,
    aprobada: Check,
    rechazada: X,
}

export function IncidenciasPanel({ incidencias, loading }: IncidenciasPanelProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        )
    }

    if (incidencias.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay incidencias registradas</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {incidencias.map((incidencia, index) => {
                const empleado = incidencia.empleado
                const config = tipoConfig[incidencia.tipo]
                const TipoIcon = config.icon
                const EstadoIcon = estadoIcons[incidencia.estado] || Clock

                return (
                    <motion.div
                        key={incidencia.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="border-slate-200/60 hover:shadow-md transition-all overflow-hidden">
                            <div className={`h-1 bg-gradient-to-r ${incidencia.tipo === 'falta' ? 'from-red-500 to-red-400' :
                                    incidencia.tipo === 'retardo' ? 'from-amber-500 to-amber-400' :
                                        incidencia.tipo === 'incapacidad' ? 'from-orange-500 to-orange-400' :
                                            'from-blue-500 to-blue-400'
                                }`} />
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={empleado?.foto_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {empleado?.nombre[0]}{empleado?.apellido_paterno[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-medium text-sm text-slate-800">
                                                    {empleado?.nombre} {empleado?.apellido_paterno}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(incidencia.fecha_inicio).toLocaleDateString('es-MX', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                    {incidencia.fecha_fin && incidencia.fecha_fin !== incidencia.fecha_inicio && (
                                                        <>
                                                            {' - '}
                                                            {new Date(incidencia.fecha_fin).toLocaleDateString('es-MX', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </>
                                                    )}
                                                    {incidencia.dias_afectados > 0 && (
                                                        <span className="ml-1 text-slate-400">
                                                            ({incidencia.dias_afectados} día{incidencia.dias_afectados > 1 ? 's' : ''})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`${config.color} gap-1 text-xs`}>
                                                    <TipoIcon className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {incidencia.motivo && (
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                                {incidencia.motivo}
                                            </p>
                                        )}
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
