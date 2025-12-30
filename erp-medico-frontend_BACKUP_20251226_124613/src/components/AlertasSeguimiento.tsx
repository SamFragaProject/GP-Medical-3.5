// Componente para Alertas de Seguimiento Médico
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Filter,
  Settings,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { AlertaSeguimiento, AlertasSeguimientoProps } from '@/types/alertas'

const getAlertIcon = (tipo: string) => {
  switch (tipo) {
    case 'examen_vencido':
    case 'certificado_vencido':
      return <AlertTriangle className="h-5 w-5" />
    case 'proximo_examen':
      return <Calendar className="h-5 w-5" />
    case 'seguimiento_requerido':
      return <Stethoscope className="h-5 w-5" />
    case 'incapacidad_activa':
      return <User className="h-5 w-5" />
    case 'medicamento_vencido':
      return <FileText className="h-5 w-5" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

const getAlertColor = (tipo: string, prioridad: string) => {
  if (prioridad === 'alta') return 'text-red-600'
  if (prioridad === 'media') return 'text-yellow-600'
  
  switch (tipo) {
    case 'examen_vencido':
    case 'certificado_vencido':
      return 'text-red-600'
    case 'proximo_examen':
      return 'text-blue-600'
    case 'seguimiento_requerido':
      return 'text-purple-600'
    case 'incapacidad_activa':
      return 'text-orange-600'
    case 'medicamento_vencido':
      return 'text-pink-600'
    default:
      return 'text-gray-600'
  }
}

const getPriorityBadge = (prioridad: string) => {
  switch (prioridad) {
    case 'alta':
      return <Badge variant="destructive">Alta</Badge>
    case 'media':
      return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
    case 'baja':
      return <Badge variant="secondary">Baja</Badge>
    default:
      return <Badge variant="outline">{prioridad}</Badge>
  }
}

const getUrgencyText = (diasRestantes: number) => {
  if (diasRestantes < 0) {
    return `Vencido hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) !== 1 ? 's' : ''}`
  } else if (diasRestantes === 0) {
    return 'Vence hoy'
  } else if (diasRestantes === 1) {
    return 'Vence mañana'
  } else if (diasRestantes <= 7) {
    return `Vence en ${diasRestantes} días`
  } else {
    return `Vence en ${Math.ceil(diasRestantes / 7)} semana${Math.ceil(diasRestantes / 7) !== 1 ? 's' : ''}`
  }
}

export function AlertasSeguimiento({ 
  alertas, 
  onResolve, 
  onPostpone, 
  onView 
}: AlertasSeguimientoProps) {
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<string>('activas')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  // Calcular días restantes para cada alerta
  const alertasCalculadas = alertas.map(alerta => {
    let diasRestantes: number | undefined
    if (alerta.fecha_vencimiento) {
      diasRestantes = differenceInDays(new Date(alerta.fecha_vencimiento), new Date())
    }
    return { ...alerta, dias_restantes: diasRestantes }
  })

  // Filtrar alertas
  const alertasFiltradas = alertasCalculadas.filter(alerta => {
    const matchesPrioridad = filtroPrioridad === 'todas' || alerta.prioridad === filtroPrioridad
    const matchesEstado = filtroEstado === 'todas' || alerta.estado === filtroEstado
    const matchesTipo = filtroTipo === 'todos' || alerta.tipo_alerta === filtroTipo

    return matchesPrioridad && matchesEstado && matchesTipo
  })

  // Ordenar por prioridad y fecha
  const alertasOrdenadas = alertasFiltradas.sort((a, b) => {
    // Primero por prioridad
    const prioridadOrden = { alta: 3, media: 2, baja: 1 }
    const prioridadA = prioridadOrden[a.prioridad as keyof typeof prioridadOrden] || 0
    const prioridadB = prioridadOrden[b.prioridad as keyof typeof prioridadOrden] || 0
    
    if (prioridadA !== prioridadB) {
      return prioridadB - prioridadA
    }
    
    // Luego por días restantes (más urgentes primero)
    const diasA = a.dias_restantes ?? 999
    const diasB = b.dias_restantes ?? 999
    
    return diasA - diasB
  })

  const alertasActivas = alertasFiltradas.filter(a => a.estado === 'activa').length
  const alertasAltas = alertasFiltradas.filter(a => a.prioridad === 'alta' && a.estado === 'activa').length
  const alertasVencidas = alertasFiltradas.filter(a => 
    a.dias_restantes !== undefined && a.dias_restantes < 0 && a.estado === 'activa'
  ).length

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{alertasActivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prioridad Alta</p>
                <p className="text-2xl font-bold text-gray-900">{alertasAltas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">{alertasVencidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertasFiltradas.filter(a => 
                    a.dias_restantes !== undefined && a.dias_restantes <= 7 && a.dias_restantes >= 0
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activas">Activas</SelectItem>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="resuelta">Resueltas</SelectItem>
                <SelectItem value="postponed">Pospuestas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="examen_vencido">Exámenes vencidos</SelectItem>
                <SelectItem value="proximo_examen">Próximos exámenes</SelectItem>
                <SelectItem value="seguimiento_requerido">Seguimiento requerido</SelectItem>
                <SelectItem value="certificado_vencido">Certificados vencidos</SelectItem>
                <SelectItem value="incapacidad_activa">Incapacidades activas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de alertas */}
      <div className="space-y-4">
        <AnimatePresence>
          {alertasOrdenadas.map((alerta, index) => (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`
                hover:shadow-md transition-shadow
                ${alerta.prioridad === 'alta' ? 'border-red-200 bg-red-50/50' : ''}
                ${alerta.dias_restantes !== undefined && alerta.dias_restantes < 0 ? 'border-red-300' : ''}
              `}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`
                        p-2 rounded-lg 
                        ${alerta.prioridad === 'alta' ? 'bg-red-100' : 
                          alerta.prioridad === 'media' ? 'bg-yellow-100' : 'bg-gray-100'}
                      `}>
                        <div className={getAlertColor(alerta.tipo_alerta, alerta.prioridad)}>
                          {getAlertIcon(alerta.tipo_alerta)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {alerta.titulo}
                          </h4>
                          {getPriorityBadge(alerta.prioridad)}
                          <Badge variant="outline" className="text-xs">
                            {alerta.tipo_alerta.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {alerta.descripcion}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {alerta.paciente_nombre} ({alerta.numero_empleado})
                          </span>
                          
                          {alerta.dias_restantes !== undefined && (
                            <span className={`
                              flex items-center
                              ${alerta.dias_restantes < 0 ? 'text-red-600 font-medium' : 
                                alerta.dias_restantes <= 7 ? 'text-orange-600' : 'text-gray-500'}
                            `}>
                              <Clock className="h-4 w-4 mr-1" />
                              {getUrgencyText(alerta.dias_restantes)}
                            </span>
                          )}
                          
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {alerta.fecha_programada ? 
                              format(new Date(alerta.fecha_programada), 'dd/MM/yyyy', { locale: es }) :
                              alerta.fecha_vencimiento ? 
                              format(new Date(alerta.fecha_vencimiento), 'dd/MM/yyyy', { locale: es }) :
                              'Sin fecha'
                            }
                          </span>
                        </div>
                        
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Acción requerida:</strong> {alerta.accion_requerida}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {alerta.estado === 'activa' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView?.(alerta)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPostpone?.(alerta.id, format(addDays(new Date(), 7), 'yyyy-MM-dd'))}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => onResolve?.(alerta.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {alerta.estado !== 'activa' && (
                        <Badge variant="secondary">
                          {alerta.estado === 'resuelta' ? 'Resuelta' : 'Pospuesta'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alertasOrdenadas.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay alertas de seguimiento
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filtroEstado === 'activas' 
                    ? 'Todas las alertas están actualizadas' 
                    : 'No se encontraron alertas con los filtros aplicados'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}