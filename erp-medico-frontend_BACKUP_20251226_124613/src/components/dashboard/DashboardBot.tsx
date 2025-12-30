// Dashboard personalizado para Bot - Asistente de Ayuda
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Phone,
  Calendar,
  Activity,
  ThumbsUp,
  Star,
  Zap,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'


interface TicketSoporte {
  id: string
  tema: string
  categoria: 'sistema' | 'medico' | 'procedimiento'
  estado: 'activo' | 'resuelto' | 'pendiente'
  prioridad: 'alta' | 'media' | 'baja'
  tiempoRespuesta: string
  satisfaccion: number
}

interface FAQ {
  id: string
  pregunta: string
  categoria: string
  popularidad: number
  ultimaBusqueda: string
  visitas: number
}

interface Tutorial {
  id: string
  titulo: string
  categoria: string
  duracion: string
  dificultad: 'basico' | 'intermedio' | 'avanzado'
  completados: number
}

export function DashboardBot() {
  const user = {
    id: 'demo-user',
    email: 'demo@mediflow.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'MediFlow Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')

  // Datos simulados para el bot
  const ticketsActivos: TicketSoporte[] = [
    {
      id: '1',
      tema: 'Configuración de usuarios',
      categoria: 'sistema',
      estado: 'activo',
      prioridad: 'media',
      tiempoRespuesta: '2 min',
      satisfaccion: 4.5
    },
    {
      id: '2',
      tema: 'Consulta médica especializada',
      categoria: 'medico',
      estado: 'pendiente',
      prioridad: 'alta',
      tiempoRespuesta: '5 min',
      satisfaccion: 4.8
    },
    {
      id: '3',
      tema: 'Proceso de facturación',
      categoria: 'procedimiento',
      estado: 'activo',
      prioridad: 'baja',
      tiempoRespuesta: '1 min',
      satisfaccion: 4.2
    }
  ]

  const faqPopulares: FAQ[] = [
    {
      id: '1',
      pregunta: '¿Cómo crear un nuevo usuario en el sistema?',
      categoria: 'Sistema',
      popularidad: 95,
      ultimaBusqueda: 'Hace 2 min',
      visitas: 1247
    },
    {
      id: '2',
      pregunta: '¿Qué especialistas están disponibles?',
      categoria: 'Médico',
      popularidad: 88,
      ultimaBusqueda: 'Hace 5 min',
      visitas: 856
    },
    {
      id: '3',
      pregunta: '¿Cómo programar una cita médica?',
      categoria: 'Procedimiento',
      popularidad: 92,
      ultimaBusqueda: 'Hace 1 min',
      visitas: 1023
    },
    {
      id: '4',
      pregunta: '¿Qué tipos de exámenes están disponibles?',
      categoria: 'Médico',
      popularidad: 79,
      ultimaBusqueda: 'Hace 8 min',
      visitas: 634
    }
  ]

  const tutoriales: Tutorial[] = [
    {
      id: '1',
      titulo: 'Configuración inicial del sistema',
      categoria: 'Sistema',
      duracion: '5 min',
      dificultad: 'basico',
      completados: 234
    },
    {
      id: '2',
      titulo: 'Consulta médica especializada',
      categoria: 'Médico',
      duracion: '8 min',
      dificultad: 'intermedio',
      completados: 156
    },
    {
      id: '3',
      titulo: 'Proceso de facturación médica',
      categoria: 'Procedimiento',
      duracion: '12 min',
      dificultad: 'avanzado',
      completados: 89
    }
  ]

  const estadisticasUso = {
    consultasHoy: 247,
    tasaResolucion: 94.2,
    tiempoPromedioRespuesta: '2.3 min',
    satisfaccionPromedio: 4.6
  }

  return (
    <div className="space-y-6">
      {/* Header del Bot */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              ¡Hola, {user?.name}!
            </h1>
            <p className="text-blue-100 mt-1">
              Panel de control del asistente inteligente
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-full p-3">
              <HelpCircle className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consultas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticasUso.consultasHoy}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Resolución</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticasUso.tasaResolucion}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticasUso.tiempoPromedioRespuesta}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticasUso.satisfaccionPromedio}/5
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador y filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Centro de Ayuda Interactivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar en base de conocimiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="todos">Todos los temas</option>
              <option value="sistema">Sistema</option>
              <option value="medico">Médico Especialista</option>
              <option value="procedimiento">Procedimientos</option>
            </select>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Respuesta Rápida
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets de Soporte Activos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Tickets de Soporte Activos
            </CardTitle>
            <Badge variant="outline">
              {ticketsActivos.length} activos
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketsActivos.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{ticket.tema}</h4>
                      <p className="text-sm text-gray-600">
                        Categoría: {ticket.categoria}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        ticket.prioridad === 'alta' ? 'destructive' : 
                        ticket.prioridad === 'media' ? 'default' : 'secondary'
                      }>
                        {ticket.prioridad}
                      </Badge>
                      <Badge variant={
                        ticket.estado === 'activo' ? 'default' : 
                        ticket.estado === 'pendiente' ? 'secondary' : 'outline'
                      }>
                        {ticket.estado}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Tiempo respuesta: {ticket.tiempoRespuesta}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{ticket.satisfaccion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Populares */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Preguntas Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqPopulares.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{faq.pregunta}</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {faq.popularidad}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Categoría: {faq.categoria}</span>
                    <span>{faq.visitas} visitas</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutoriales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Tutoriales Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tutoriales.map((tutorial) => (
              <div key={tutorial.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{tutorial.titulo}</h4>
                  <Badge variant={
                    tutorial.dificultad === 'basico' ? 'default' :
                    tutorial.dificultad === 'intermedio' ? 'secondary' : 'destructive'
                  }>
                    {tutorial.dificultad}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Categoría: {tutorial.categoria}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span>Duración: {tutorial.duracion}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{tutorial.completados}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat de Soporte Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Chat de Soporte en Vivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 h-64 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              <div className="bg-white rounded p-2 text-sm">
                <p className="font-medium">Usuario:</p>
                <p>¿Cómo puedo ver mis pacientes asignados?</p>
              </div>
              <div className="bg-blue-100 rounded p-2 text-sm">
                <p className="font-medium">MediBot:</p>
                <p>Para ver tus pacientes asignados, ve a la sección "Pacientes" en el menú principal. Los pacientes aparecerán filtrados automáticamente por tu especialidad.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Escribe tu pregunta..." className="flex-1" />
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}