// Dashboard personalizado para Pacientes
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  FileText, 
  User, 
  Clock, 
  Heart, 
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Activity,
  TrendingUp,
  Bell,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'


interface Cita {
  id: string
  fecha: string
  hora: string
  medico: string
  especialidad: string
  motivo: string
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
}

interface Recomendacion {
  id: string
  tipo: 'medicamento' | 'dieta' | 'ejercicio' | 'seguimiento'
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
  fechaCreacion: string
}

interface HistorialExamen {
  id: string
  fecha: string
  tipo: string
  resultado: string
  medico: string
  status: 'pendiente' | 'completado'
}

export function DashboardPaciente() {
  const user = {
  id: 'demo-user',
  email: 'demo@mediflow.com',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'MediFlow Demo Corp' },
  sede: { nombre: 'Sede Principal' }
}
  const [showSolicitudCita, setShowSolicitudCita] = useState(false)

  // Datos simulados para el paciente
  const citasProximas: Cita[] = [
    {
      id: '1',
      fecha: '2025-11-05',
      hora: '10:00',
      medico: 'Dra. Luna Rivera',
      especialidad: 'Medicina del Trabajo',
      motivo: 'Revisión periódica anual',
      status: 'confirmada'
    }
  ]

  const recomendaciones: Recomendacion[] = [
    {
      id: '1',
      tipo: 'dieta',
      titulo: 'Alimentación Balanceada',
      descripcion: 'Incrementar consumo de frutas y verduras, reducir alimentos procesados.',
      prioridad: 'media',
      fechaCreacion: '2025-10-15'
    },
    {
      id: '2',
      tipo: 'ejercicio',
      titulo: 'Actividad Física Regular',
      descripcion: 'Realizar ejercicio cardiovascular 30 minutos, 3 veces por semana.',
      prioridad: 'alta',
      fechaCreacion: '2025-10-20'
    }
  ]

  const historialExamenes: HistorialExamen[] = [
    {
      id: '1',
      fecha: '2025-10-01',
      tipo: 'Examen General',
      resultado: 'Normal',
      medico: 'Dr. Roberto Silva',
      status: 'completado'
    },
    {
      id: '2',
      fecha: '2025-09-15',
      tipo: 'Análisis de Sangre',
      resultado: 'En revisión',
      medico: 'Dr. Miguel Ángel Torres',
      status: 'pendiente'
    }
  ]

  const SolicitarCitaModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Solicitar Nueva Cita</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad Médica
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>Seleccionar especialidad...</option>
              <option>Medicina del Trabajo</option>
              <option>Cardiología</option>
              <option>Medicina Interna</option>
              <option>Medicina de Laboratorio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médico Preferido
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>Sin preferencia</option>
              <option>Dra. Luna Rivera</option>
              <option>Dr. Roberto Silva</option>
              <option>Dr. Miguel Ángel Torres</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Preferida
              </label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Preferida
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>Sin preferencia</option>
                <option>09:00</option>
                <option>10:00</option>
                <option>11:00</option>
                <option>15:00</option>
                <option>16:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la Consulta
            </label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-md h-20"
              placeholder="Describa brevemente el motivo de su consulta..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowSolicitudCita(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1">
              Enviar Solicitud
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header del Paciente */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              ¡Hola, {user?.name}!
            </h1>
            <p className="text-emerald-100 mt-1">
              Bienvenido a tu centro de salud personal
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-full p-3">
              <Heart className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próxima Cita</p>
                <p className="text-2xl font-bold text-gray-900">
                  {citasProximas.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recomendaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recomendaciones.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Exámenes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historialExamenes.filter(e => e.status === 'pendiente').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado de Salud</p>
                <p className="text-2xl font-bold text-green-600">Bueno</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Mis Próximas Citas
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowSolicitudCita(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Solicitar Cita
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {citasProximas.map((cita) => (
                <div key={cita.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{cita.medico}</h4>
                      <p className="text-sm text-gray-600">{cita.especialidad}</p>
                    </div>
                    <Badge variant={cita.status === 'confirmada' ? 'default' : 'secondary'}>
                      {cita.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {cita.fecha}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {cita.hora}
                    </div>
                    <p className="text-gray-700">{cita.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones Médicas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Mis Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recomendaciones.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{rec.titulo}</h4>
                    <Badge variant={
                      rec.prioridad === 'alta' ? 'destructive' : 
                      rec.prioridad === 'media' ? 'default' : 'secondary'
                    }>
                      {rec.prioridad}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.descripcion}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Tipo: {rec.tipo}</span>
                    <span>{rec.fechaCreacion}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Exámenes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Mi Historial Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historialExamenes.map((examen) => (
              <div key={examen.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{examen.tipo}</h4>
                    <p className="text-sm text-gray-600">{examen.medico}</p>
                    <p className="text-sm text-gray-500">{examen.fecha}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={examen.status === 'completado' ? 'default' : 'secondary'}>
                      {examen.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">{examen.resultado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Solicitud de Cita */}
      {showSolicitudCita && <SolicitarCitaModal />}
    </div>
  )
}