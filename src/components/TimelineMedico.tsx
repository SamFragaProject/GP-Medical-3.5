// Componente Timeline para Historial Médico Laboral
import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Calendar,
  Stethoscope,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Heart
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface TimelineEvent {
  id: string
  fecha_evento: string
  tipo_evento: string
  descripcion: string
  diagnostico?: string
  aptitud_medica?: string
  medico?: string
  estado: 'completado' | 'pendiente' | 'cancelado'
  documentos?: number
  proximo_seguimiento?: string
}

interface TimelineMedicoProps {
  eventos: TimelineEvent[]
  maxEventos?: number
}

const getIconByType = (tipo: string) => {
  switch (tipo) {
    case 'examen_ingreso':
    case 'examen_periodico':
    case 'examen_egreso':
    case 'examen_especial':
      return <Stethoscope className="h-4 w-4" />
    case 'consulta':
      return <User className="h-4 w-4" />
    case 'certificacion':
      return <Shield className="h-4 w-4" />
    case 'incapacidad':
      return <Heart className="h-4 w-4" />
    case 'accidente':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getColorByType = (tipo: string, estado: string) => {
  if (estado === 'cancelado') return 'text-red-500'
  
  switch (tipo) {
    case 'examen_ingreso':
    case 'examen_periodico':
    case 'examen_egreso':
    case 'examen_especial':
      return 'text-blue-600'
    case 'consulta':
      return 'text-green-600'
    case 'certificacion':
      return 'text-purple-600'
    case 'incapacidad':
      return 'text-orange-600'
    case 'accidente':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'completado':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'pendiente':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'cancelado':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

export function TimelineMedico({ eventos, maxEventos = 10 }: TimelineMedicoProps) {
  const eventosOrdenados = eventos
    .sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime())
    .slice(0, maxEventos)

  return (
    <div className="space-y-4">
      {eventosOrdenados.map((evento, index) => (
        <motion.div
          key={evento.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Línea conectora */}
          {index < eventosOrdenados.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
          )}
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-4">
                {/* Icono principal */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full border-2 border-white shadow-md 
                  flex items-center justify-center
                  ${getColorByType(evento.tipo_evento, evento.estado).replace('text-', 'bg-').replace('600', '100')}
                `}>
                  <div className={getColorByType(evento.tipo_evento, evento.estado)}>
                    {getIconByType(evento.tipo_evento)}
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {evento.tipo_evento.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {getStatusIcon(evento.estado)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(evento.fecha_evento), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mt-1">
                    {evento.descripcion}
                  </h4>
                  
                  {evento.diagnostico && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Diagnóstico:</strong> {evento.diagnostico}
                    </p>
                  )}
                  
                  {evento.aptitud_medica && (
                    <div className="mt-2">
                      <Badge 
                        variant={evento.aptitud_medica === 'apto' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {evento.aptitud_medica === 'apto' ? 'APTO' : 'NO APTO'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    {evento.medico && (
                      <span className="text-xs text-gray-500">
                        Dr. {evento.medico}
                      </span>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {evento.documentos && evento.documentos > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {evento.documentos} doc{evento.documentos > 1 ? 's' : ''}
                        </Badge>
                      )}
                      
                      {evento.proximo_seguimiento && (
                        <Badge variant="outline" className="text-xs text-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Seguimiento: {format(new Date(evento.proximo_seguimiento), 'dd/MM', { locale: es })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {eventos.length > maxEventos && (
        <div className="text-center py-4">
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            Ver historial completo ({eventos.length - maxEventos} eventos más)
          </button>
        </div>
      )}
    </div>
  )
}
