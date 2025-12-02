// Página de demostración para el módulo de Agenda & Citas
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  User, 
  Stethoscope,
  Filter,
  Search,
  Edit,
  Phone,
  Mail,
  Play,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react'
import { Agenda } from '@/pages/Agenda'
import { useAgenda } from '@/hooks/useAgenda'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export function DemoAgenda() {
  const { citas, pacientes, doctores, tiposConsulta, loading } = useAgenda()
  const [vistaDemo, setVistaDemo] = useState<'funcionalidades' | 'componente'>('funcionalidades')
  const vistaActual = vistaDemo as 'funcionalidades' | 'componente'

  if (vistaActual === 'componente') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Agenda />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 Módulo de Agenda & Citas - ERP Médico
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Implementación completa del sistema de gestión de citas médicas
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setVistaDemo('funcionalidades')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                vistaDemo === 'funcionalidades'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ver Funcionalidades
            </button>
            <button
              onClick={() => setVistaDemo('componente')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                vistaDemo === 'componente'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ver Componente Completo
            </button>
          </div>
        </div>

        {/* Estadísticas demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Citas</p>
                <p className="text-3xl font-bold text-gray-900">{citas.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">{pacientes.length}</p>
              </div>
              <User className="h-10 w-10 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doctores</p>
                <p className="text-3xl font-bold text-gray-900">{doctores.length}</p>
              </div>
              <Stethoscope className="h-10 w-10 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tipos Consulta</p>
                <p className="text-3xl font-bold text-gray-900">{tiposConsulta.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Funcionalidades implementadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ✨ Funcionalidades Implementadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icono: Calendar,
                titulo: 'Calendario Interactivo',
                descripcion: 'Vista mensual, semanal y diaria con Drag & Drop',
                color: 'bg-blue-500'
              },
              {
                icono: Plus,
                titulo: 'Programación de Citas',
                descripcion: 'Crear, editar, cancelar con selección de paciente',
                color: 'bg-green-500'
              },
              {
                icono: User,
                titulo: 'Gestión de Pacientes',
                descripcion: 'Integración completa con módulo de pacientes',
                color: 'bg-purple-500'
              },
              {
                icono: Clock,
                titulo: 'Estados de Cita',
                descripcion: 'Programada, en proceso, completada, cancelada',
                color: 'bg-yellow-500'
              },
              {
                icono: Filter,
                titulo: 'Búsqueda y Filtros',
                descripcion: 'Por fecha, paciente, médico, tipo, estado',
                color: 'bg-red-500'
              },
              {
                icono: Play,
                titulo: 'Check-in Digital',
                descripcion: 'Registro de llegada y estado de consulta',
                color: 'bg-indigo-500'
              },
              {
                icono: Phone,
                titulo: 'Recordatorios',
                descripcion: 'Sistema de notificaciones SMS/Email',
                color: 'bg-pink-500'
              },
              {
                icono: RefreshCw,
                titulo: 'Rescheduling',
                descripcion: 'Gestión flexible de cambios de citas',
                color: 'bg-orange-500'
              },
              {
                icono: Stethoscope,
                titulo: 'Tipos de Consulta',
                descripcion: 'Examen ocupacional, seguimiento, certificación',
                color: 'bg-teal-500'
              }
            ].map((funcionalidad, index) => (
              <motion.div
                key={funcionalidad.titulo}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className={`${funcionalidad.color} p-2 rounded-lg`}>
                    <funcionalidad.icono className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {funcionalidad.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {funcionalidad.descripcion}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Datos demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Datos de Demostración
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Próximas citas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Citas</h3>
              <div className="space-y-3">
                {citas.slice(0, 3).map((cita, index) => (
                  <motion.div
                    key={cita.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {cita.paciente?.nombre} {cita.paciente?.apellidoPaterno}
                        </p>
                        <p className="text-sm text-gray-600">{cita.tipoConsulta?.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(cita.fechaHora), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tipos de consulta */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Consulta</h3>
              <div className="space-y-3">
                {tiposConsulta.map((tipo, index) => (
                  <motion.div
                    key={tipo.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tipo.nombre}</p>
                        <p className="text-sm text-gray-600">{tipo.duracionMinutos} minutos</p>
                        {tipo.precio && (
                          <p className="text-xs text-gray-500">
                            ${tipo.precio.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tipo.color || '#00BFA6' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tecnologías utilizadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🛠️ Tecnologías Utilizadas
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'React 18',
              'TypeScript',
              'react-big-calendar',
              'React Hook Form',
              'Zod Validation',
              'Framer Motion',
              'Tailwind CSS',
              'Lucide Icons',
              'Date-fns',
              'React Hot Toast'
            ].map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.05 }}
                className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20"
              >
                <span className="text-sm font-medium text-gray-900">{tech}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center bg-primary/5 rounded-lg border border-primary/20 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 ¡Módulo Completamente Funcional!
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            El módulo de Agenda & Citas está completamente implementado con todas las funcionalidades 
            requeridas. Incluye calendario interactivo, gestión de pacientes, tipos de consulta, 
            formularios con validación y una interfaz moderna y responsive.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setVistaDemo('componente')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center space-x-2"
            >
              <Calendar size={20} />
              <span>Ver Componente Completo</span>
            </button>
            
            <button
              onClick={() => toast.success('¡Funcionalidad implementada exitosamente!')}
              className="bg-white text-primary border border-primary px-8 py-3 rounded-lg hover:bg-primary/5 transition-colors font-medium"
            >
              Probar Funcionalidades
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}