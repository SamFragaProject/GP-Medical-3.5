// Componente principal del módulo de Agenda & Citas
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  Filter, 
  Download, 
  Search,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  RefreshCw
} from 'lucide-react'
import { CalendarioPrincipal } from './agenda/CalendarioPrincipal'
import { FormularioCita } from './agenda/FormularioCita'
import { FiltrosAgenda } from './agenda/FiltrosAgenda'
import { ListaCitas } from './agenda/ListaCitas'
import { Modal } from '@/components/ui/modal'
import { useAgenda } from '@/hooks/useAgenda'
import { FiltroCitas, EstadoCita } from '@/types/agenda'
import toast from 'react-hot-toast'

export function Agenda() {
  const {
    citas,
    pacientes,
    doctores,
    tiposConsulta,
    loading,
    obtenerEventosCalendario,
    obtenerCitas
  } = useAgenda()

  const [vistaActual, setVistaActual] = useState<'calendario' | 'lista'>('calendario')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<string | null>(null)
  const [filtrosActivos, setFiltrosActivos] = useState<FiltroCitas>({})
  const [fechaActual, setFechaActual] = useState(new Date())

  // Estadísticas rápidas
  const citasHoy = citas.filter(cita => {
    const hoy = new Date()
    const fechaCita = new Date(cita.fechaHora)
    return (
      fechaCita.getDate() === hoy.getDate() &&
      fechaCita.getMonth() === hoy.getMonth() &&
      fechaCita.getFullYear() === hoy.getFullYear()
    )
  }).length

  const citasProgramadas = citas.filter(cita => cita.estado === 'programada').length
  const citasCompletadas = citas.filter(cita => cita.estado === 'completada').length
  const citasCanceladas = citas.filter(cita => cita.estado === 'cancelada').length

  // Manejar cambios en filtros
  const manejarCambioFiltros = (nuevosFiltros: FiltroCitas) => {
    setFiltrosActivos(nuevosFiltros)
    obtenerCitas(nuevosFiltros)
  }

  // Manejar cita seleccionada
  const manejarCitaSeleccionada = (citaId: string | null) => {
    setCitaSeleccionada(citaId)
    if (citaId) {
      setMostrarFormulario(true)
    }
  }

  // Manejar nueva cita
  const manejarNuevaCita = (fecha?: Date) => {
    setCitaSeleccionada(null)
    setFechaActual(fecha || new Date())
    setMostrarFormulario(true)
  }

  // Estadísticas por estado
  const estadisticas = [
    {
      titulo: 'Citas de Hoy',
      valor: citasHoy,
      icono: Clock,
      color: 'bg-blue-500',
      descripcion: 'Programadas para hoy'
    },
    {
      titulo: 'Programadas',
      valor: citasProgramadas,
      icono: Calendar,
      color: 'bg-primary',
      descripcion: 'Próximas citas'
    },
    {
      titulo: 'Completadas',
      valor: citasCompletadas,
      icono: CheckCircle,
      color: 'bg-green-500',
      descripcion: 'Citas finalizadas'
    },
    {
      titulo: 'Canceladas',
      valor: citasCanceladas,
      icono: XCircle,
      color: 'bg-red-500',
      descripcion: 'Citas canceladas'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda & Citas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las citas médicas y el calendario de consultas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
              mostrarFiltros 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            <span>Filtros</span>
          </button>
          
          <button
            onClick={() => manejarNuevaCita()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus size={16} />
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((stat, index) => (
          <motion.div
            key={stat.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.valor}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.descripcion}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icono className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controles de vista */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVistaActual('calendario')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === 'calendario'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Calendario
              </button>
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === 'lista'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Lista
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Actualizar"
            >
              <RefreshCw size={16} />
            </button>
            
            <button
              onClick={() => toast.success('Exportando citas...')}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Exportar"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FiltrosAgenda
              filtros={filtrosActivos}
              onCambio={manejarCambioFiltros}
              doctores={doctores}
              tiposConsulta={tiposConsulta}
              pacientes={pacientes}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <AnimatePresence mode="wait">
          {vistaActual === 'calendario' ? (
            <motion.div
              key="calendario"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarioPrincipal
                eventos={obtenerEventosCalendario(filtrosActivos)}
                onCitaSeleccionada={manejarCitaSeleccionada}
                onNuevaCita={manejarNuevaCita}
                loading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="lista"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ListaCitas
                citas={citas}
                onCitaSeleccionada={manejarCitaSeleccionada}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de formulario de cita */}
      <Modal
        open={mostrarFormulario}
        onClose={() => setMostrarFormulario(false)}
        title={citaSeleccionada ? "Editar Cita" : "Nueva Cita"}
        size="xl"
      >
        <FormularioCita
          citaId={citaSeleccionada}
          fechaInicial={fechaActual}
          onGuardar={() => {
            setMostrarFormulario(false)
            setCitaSeleccionada(null)
          }}
          onCancelar={() => {
            setMostrarFormulario(false)
            setCitaSeleccionada(null)
          }}
        />
      </Modal>
    </div>
  )
}