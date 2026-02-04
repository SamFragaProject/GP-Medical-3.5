// Componente VacacionesPanel - Panel de solicitudes de vacaciones
import React from 'react'
import { VacationRequest as SolicitudVacaciones } from '@/types/rrhh'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Palmtree,
    Calendar,
    Check,
    X,
    Clock,
    CalendarDays
} from 'lucide-react'
import { motion } from 'framer-motion'

interface VacacionesPanelProps {
    solicitudes: SolicitudVacaciones[]
    onAprobar?: (id: string) => void
    onRechazar?: (id: string) => void
    loading?: boolean
    showActions?: boolean
}

const estadoConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    pendiente: { color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', label: 'Pendiente', icon: Clock },
    aprobada: { color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30', label: 'Aprobada', icon: Check },
    rechazada: { color: 'bg-red-500/20 text-red-600 border-red-500/30', label: 'Rechazada', icon: X },
    cancelada: { color: 'bg-gray-500/20 text-gray-600 border-gray-500/30', label: 'Cancelada', icon: X },
}

export function VacacionesPanel({ solicitudes, onAprobar, onRechazar, loading, showActions = true }: VacacionesPanelProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        )
    }

    if (solicitudes.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Palmtree className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay solicitudes de vacaciones</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {solicitudes.map((solicitud, index) => {
                const empleado = solicitud.empleado
                const config = estadoConfig[solicitud.estado]
                const StatusIcon = config.icon

                return (
                    <motion.div
                        key={solicitud.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="border-slate-200/60 hover:shadow-md transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={empleado?.foto_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {empleado?.nombre ? empleado.nombre[0] : 'E'}
                                            {empleado?.apellido ? empleado.apellido[0] : 'M'}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">
                                                    {empleado?.nombre} {empleado?.apellido}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    <span>
                                                        {new Date(solicitud.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                                        {' - '}
                                                        {new Date(solicitud.fecha_fin).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-primary font-medium">
                                                        ({solicitud.dias_tomados} días)
                                                    </span>
                                                </div>
                                                {solicitud.observaciones && (
                                                    <p className="text-xs text-slate-400 mt-1 truncate">{solicitud.observaciones}</p>
                                                )}
                                            </div>

                                            <Badge variant="outline" className={`${config?.color || 'bg-slate-100'} gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {config?.label || solicitud.estado}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        {showActions && solicitud.estado === 'pendiente' && (
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                    onClick={() => onAprobar?.(solicitud.id)}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Aprobar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                                    onClick={() => onRechazar?.(solicitud.id)}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Rechazar
                                                </Button>
                                            </div>
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
