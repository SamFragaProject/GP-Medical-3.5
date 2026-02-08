// Componente EmpleadoCard - Tarjeta de empleado
import React from 'react'
import { Employee as Empleado } from '@/types/rrhh'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    MoreHorizontal,
    Mail,
    Phone,
    Building2,
    Calendar,
    Edit,
    Eye
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EmpleadoCardProps {
    empleado: Empleado
    onView?: (empleado: Empleado) => void
    onEdit?: (empleado: Empleado) => void
}

const estadoColors: Record<string, string> = {
    activo: 'bg-green-500/20 text-green-600 border-green-500/30',
    inactivo: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
    vacaciones: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    incapacidad: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
    baja: 'bg-red-500/20 text-red-600 border-red-500/30',
}

const estadoLabels: Record<string, string> = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    vacaciones: 'Vacaciones',
    incapacidad: 'Incapacidad',
    baja: 'Baja',
}

export function EmpleadoCard({ empleado, onView, onEdit }: EmpleadoCardProps) {
    const iniciales = `${empleado.nombre[0]}${empleado.apellido[0]}`

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200/60 hover:border-primary/30 overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-semibold">
                            {iniciales}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-slate-800 truncate">
                                    {empleado.nombre} {empleado.apellido}
                                </h3>
                                <p className="text-sm text-slate-500 truncate">
                                    {typeof empleado.puesto === 'string'
                                        ? empleado.puesto
                                        : empleado.puesto?.nombre || 'Sin puesto'}
                                </p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onView?.(empleado)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit?.(empleado)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className={estadoColors[empleado.estado]}>
                                {estadoLabels[empleado.estado] || empleado.estado}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Detalles */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary/60" />
                        <span className="truncate">
                            {typeof empleado.departamento === 'string'
                                ? empleado.departamento
                                : empleado.departamento?.nombre || 'Sin departamento'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        <span>{empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' }) : 'Sin fecha'}</span>
                    </div>
                    {empleado.email_personal && (
                        <div className="flex items-center gap-1.5 col-span-2">
                            <Mail className="h-3.5 w-3.5 text-primary/60" />
                            <span className="truncate">{empleado.email_personal}</span>
                        </div>
                    )}
                    {empleado.telefono && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-primary/60" />
                            <span>{empleado.telefono}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
