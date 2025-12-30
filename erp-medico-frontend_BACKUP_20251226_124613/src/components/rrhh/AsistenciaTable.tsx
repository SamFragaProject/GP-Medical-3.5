// Componente AsistenciaTable - Tabla de registros de asistencia
import React from 'react'
import { RegistroAsistencia } from '@/types/rrhh'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Clock, LogIn, LogOut, AlertCircle, Home, MapPin } from 'lucide-react'

interface AsistenciaTableProps {
    registros: RegistroAsistencia[]
    loading?: boolean
}

const tipoIcons: Record<string, React.ElementType> = {
    normal: MapPin,
    home_office: Home,
    campo: MapPin,
}

const tipoLabels: Record<string, string> = {
    normal: 'Presencial',
    home_office: 'Home Office',
    campo: 'Campo',
}

export function AsistenciaTable({ registros, loading }: AsistenciaTableProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        )
    }

    if (registros.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay registros de asistencia</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-slate-200/60 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50">
                        <TableHead className="font-semibold">Empleado</TableHead>
                        <TableHead className="font-semibold">Fecha</TableHead>
                        <TableHead className="font-semibold">Entrada</TableHead>
                        <TableHead className="font-semibold">Salida</TableHead>
                        <TableHead className="font-semibold">Horas</TableHead>
                        <TableHead className="font-semibold">Tipo</TableHead>
                        <TableHead className="font-semibold">Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {registros.map((registro) => {
                        const empleado = registro.empleado
                        const TipoIcon = tipoIcons[registro.tipo] || MapPin
                        const tieneRetardo = registro.retardo_minutos && registro.retardo_minutos > 0

                        return (
                            <TableRow key={registro.id} className="hover:bg-slate-50/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={empleado?.foto_url} />
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                {empleado?.nombre[0]}{empleado?.apellido_paterno[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-slate-800">
                                                {empleado?.nombre} {empleado?.apellido_paterno}
                                            </p>
                                            <p className="text-xs text-slate-500">{empleado?.numero_empleado}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {new Date(registro.fecha).toLocaleDateString('es-MX', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <LogIn className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="font-medium">{registro.hora_entrada || '--:--'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <LogOut className="h-3.5 w-3.5 text-red-500" />
                                        <span className="font-medium">{registro.hora_salida || '--:--'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {registro.horas_trabajadas ? (
                                        <span className="font-medium">{registro.horas_trabajadas}h</span>
                                    ) : (
                                        <span className="text-slate-400">En curso</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="gap-1">
                                        <TipoIcon className="h-3 w-3" />
                                        {tipoLabels[registro.tipo]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {tieneRetardo ? (
                                        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            +{registro.retardo_minutos} min
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                                            A tiempo
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
