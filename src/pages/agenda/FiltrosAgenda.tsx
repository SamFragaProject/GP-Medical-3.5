// Componente de filtros para la agenda
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, 
  Calendar, 
  User, 
  Stethoscope, 
  X, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { FiltroCitas, EstadoCita, Paciente, Doctor, TipoConsulta } from '@/types/agenda'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface FiltrosAgendaProps {
  filtros: FiltroCitas
  onCambio: (filtros: FiltroCitas) => void
  doctores: Doctor[]
  tiposConsulta: TipoConsulta[]
  pacientes: Paciente[]
}

const ESTADOS_CITA: { value: EstadoCita; label: string; color: string }[] = [
  { value: 'programada', label: 'Programada', color: 'bg-blue-500' },
  { value: 'en_proceso', label: 'En Proceso', color: 'bg-yellow-500' },
  { value: 'completada', label: 'Completada', color: 'bg-green-500' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-500' },
  { value: 'no_show', label: 'No se presentó', color: 'bg-gray-500' }
]

export function FiltrosAgenda({ 
  filtros, 
  onCambio, 
  doctores, 
  tiposConsulta, 
  pacientes 
}: FiltrosAgendaProps) {
  const [filtrosLocales, setFiltrosLocales] = useState<FiltroCitas>(filtros)

  // Manejar cambio de fecha inicio
  const manejarFechaInicio = (fecha: string) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      fechaInicio: fecha ? new Date(fecha) : undefined
    }
    setFiltrosLocales(nuevosFiltros)
  }

  // Manejar cambio de fecha fin
  const manejarFechaFin = (fecha: string) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      fechaFin: fecha ? new Date(fecha) : undefined
    }
    setFiltrosLocales(nuevosFiltros)
  }

  // Manejar cambio de doctor
  const manejarDoctor = (doctorId: string) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      doctorId: doctorId || undefined
    }
    setFiltrosLocales(nuevosFiltros)
  }

  // Manejar cambio de paciente
  const manejarPaciente = (pacienteId: string) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      pacienteId: pacienteId || undefined
    }
    setFiltrosLocales(nuevosFiltros)
  }

  // Manejar cambio de tipo de consulta
  const manejarTipoConsulta = (tipoConsultaId: string) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      tipoConsultaId: tipoConsultaId || undefined
    }
    setFiltrosLocales(nuevosFiltros)
  }

  // Manejar cambio de estado
  const manejarEstado = (estado: EstadoCita) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      estado: filtrosLocales.estado === estado ? undefined : estado
    }
    setFiltrosLocales(nuevosFiltros)
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    onCambio(filtrosLocales)
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    const filtrosVacios = {}
    setFiltrosLocales(filtrosVacios)
    onCambio(filtrosVacios)
  }

  // Contar filtros activos
  const filtrosActivos = Object.keys(filtrosLocales).filter(
    key => filtrosLocales[key as keyof FiltroCitas] !== undefined
  ).length

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
            {filtrosActivos > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                {filtrosActivos} {filtrosActivos === 1 ? 'filtro' : 'filtros'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filtro por fechas */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Período de Búsqueda</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={filtrosLocales.fechaInicio ? format(filtrosLocales.fechaInicio, 'yyyy-MM-dd') : ''}
                onChange={(e) => manejarFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtrosLocales.fechaFin ? format(filtrosLocales.fechaFin, 'yyyy-MM-dd') : ''}
                onChange={(e) => manejarFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Filtro por doctor y paciente */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-4 w-4 text-primary" />
            <span>Personal Médico y Pacientes</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <select
                value={filtrosLocales.doctorId || ''}
                onChange={(e) => manejarDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">Todos los doctores</option>
                {doctores.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr./Dra. {doctor.nombre} {doctor.apellidoPaterno} - {doctor.especialidad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <select
                value={filtrosLocales.pacienteId || ''}
                onChange={(e) => manejarPaciente(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="">Todos los pacientes</option>
                {pacientes.map(paciente => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nombre} {paciente.apellidoPaterno} {paciente.apellidoMaterno} - {paciente.empresa}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filtro por tipo de consulta */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span>Tipo de Consulta</span>
          </h4>
          
          <div>
            <select
              value={filtrosLocales.tipoConsultaId || ''}
              onChange={(e) => manejarTipoConsulta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="">Todos los tipos</option>
              {tiposConsulta.filter(t => t.activo).map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre} ({tipo.duracionMinutos} min)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro por estado */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Estado de la Cita</span>
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {ESTADOS_CITA.map(estado => (
              <button
                key={estado.value}
                onClick={() => manejarEstado(estado.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  filtrosLocales.estado === estado.value
                    ? `${estado.color} text-white shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  filtrosLocales.estado === estado.value ? 'bg-white' : estado.color.replace('bg-', 'bg-')
                }`} />
                <span>{estado.label}</span>
                {filtrosLocales.estado === estado.value && (
                  <CheckCircle size={14} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {filtrosActivos > 0 ? (
              <span className="flex items-center space-x-1">
                <AlertCircle size={14} className="text-primary" />
                <span>{filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}</span>
              </span>
            ) : (
              'Sin filtros aplicados'
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Limpiar
            </button>
            
            <button
              onClick={aplicarFiltros}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
