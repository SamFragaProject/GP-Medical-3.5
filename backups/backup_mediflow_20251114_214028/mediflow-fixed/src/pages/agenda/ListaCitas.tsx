// Componente de lista de citas
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { Cita, EstadoCita } from '@/types/agenda'
import { useAgenda } from '@/hooks/useAgenda'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface ListaCitasProps {
  citas: Cita[]
  onCitaSeleccionada: (citaId: string) => void
  loading: boolean
}

const ESTADOS_CITA_CONFIG = {
  programada: { 
    label: 'Programada', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Calendar 
  },
  en_proceso: { 
    label: 'En Proceso', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Play 
  },
  completada: { 
    label: 'Completada', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle 
  },
  cancelada: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle 
  },
  no_show: { 
    label: 'No se presentó', 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: AlertCircle 
  }
}

export function ListaCitas({ citas, onCitaSeleccionada, loading }: ListaCitasProps) {
  const { checkInPaciente, completarCita, cancelarCita } = useAgenda()
  const [busqueda, setBusqueda] = useState('')
  const [ordenPor, setOrdenPor] = useState<'fecha' | 'paciente' | 'doctor' | 'estado'>('fecha')
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc')

  // Filtrar y ordenar citas
  const citasFiltradas = citas
    .filter(cita => {
      const textoBusqueda = busqueda.toLowerCase()
      return (
        cita.paciente?.nombre.toLowerCase().includes(textoBusqueda) ||
        cita.paciente?.apellidoPaterno.toLowerCase().includes(textoBusqueda) ||
        cita.paciente?.empresa?.toLowerCase().includes(textoBusqueda) ||
        cita.doctor?.nombre.toLowerCase().includes(textoBusqueda) ||
        cita.tipoConsulta?.nombre.toLowerCase().includes(textoBusqueda) ||
        cita.motivoConsulta?.toLowerCase().includes(textoBusqueda)
      )
    })
    .sort((a, b) => {
      let valorA: any, valorB: any
      
      switch (ordenPor) {
        case 'fecha':
          valorA = new Date(a.fechaHora)
          valorB = new Date(b.fechaHora)
          break
        case 'paciente':
          valorA = `${a.paciente?.nombre} ${a.paciente?.apellidoPaterno}`
          valorB = `${b.paciente?.nombre} ${b.paciente?.apellidoPaterno}`
          break
        case 'doctor':
          valorA = `${a.doctor?.nombre} ${a.doctor?.apellidoPaterno}`
          valorB = `${b.doctor?.nombre} ${b.doctor?.apellidoPaterno}`
          break
        case 'estado':
          valorA = a.estado
          valorB = b.estado
          break
        default:
          return 0
      }

      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1
      return 0
    })

  // Manejar ordenamiento
  const manejarOrdenamiento = (campo: 'fecha' | 'paciente' | 'doctor' | 'estado') => {
    if (ordenPor === campo) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenPor(campo)
      setOrdenDireccion('asc')
    }
  }

  // Manejar check-in
  const manejarCheckIn = async (citaId: string) => {
    const exito = await checkInPaciente(citaId)
    if (exito) {
      toast.success('Check-in realizado exitosamente')
    }
  }

  // Manejar completar cita
  const manejarCompletar = async (citaId: string) => {
    const exito = await completarCita(citaId)
    if (exito) {
      toast.success('Cita marcada como completada')
    }
  }

  // Manejar cancelar cita
  const manejarCancelar = async (citaId: string) => {
    const motivo = prompt('Motivo de cancelación:')
    if (motivo) {
      const exito = await cancelarCita(citaId, motivo)
      if (exito) {
        toast.success('Cita cancelada exitosamente')
      }
    }
  }

  // Obtener icono de ordenamiento
  const obtenerIconoOrden = (campo: string) => {
    if (ordenPor !== campo) return null
    return ordenDireccion === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    )
  }

  if (citasFiltradas.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {busqueda ? 'No se encontraron citas' : 'No hay citas programadas'}
        </h3>
        <p className="text-gray-600 mb-6">
          {busqueda 
            ? 'Intenta ajustar los filtros de búsqueda' 
            : 'Comienza creando tu primera cita médica'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y controles */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar citas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabla de citas */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => manejarOrdenamiento('fecha')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Fecha y Hora</span>
                    <span className="text-primary">{obtenerIconoOrden('fecha')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => manejarOrdenamiento('paciente')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Paciente</span>
                    <span className="text-primary">{obtenerIconoOrden('paciente')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => manejarOrdenamiento('doctor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Doctor</span>
                    <span className="text-primary">{obtenerIconoOrden('doctor')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Consulta
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => manejarOrdenamiento('estado')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    <span className="text-primary">{obtenerIconoOrden('estado')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {citasFiltradas.map((cita, index) => {
                  const configEstado = ESTADOS_CITA_CONFIG[cita.estado]
                  const IconoEstado = configEstado.icon
                  
                  return (
                    <motion.tr
                      key={cita.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onCitaSeleccionada(cita.id)}
                    >
                      {/* Fecha y Hora */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format(new Date(cita.fechaHora), 'dd MMM yyyy', { locale: es })}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(cita.fechaHora), 'HH:mm')} 
                                <span className="ml-1">({cita.duracionMinutos}min)</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Paciente */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {cita.paciente?.nombre} {cita.paciente?.apellidoPaterno}
                            </div>
                            <div className="text-sm text-gray-600">{cita.paciente?.empresa}</div>
                            {cita.paciente?.telefono && (
                              <div className="text-sm text-gray-500 flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{cita.paciente.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Dr./Dra. {cita.doctor?.nombre} {cita.doctor?.apellidoPaterno}
                          </div>
                          <div className="text-sm text-gray-600">{cita.doctor?.especialidad}</div>
                        </div>
                      </td>

                      {/* Tipo de Consulta */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cita.tipoConsulta?.nombre}
                          </div>
                          <div className="text-sm text-gray-600">{cita.motivoConsulta}</div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${configEstado.color}`}>
                          <IconoEstado className="h-3 w-3 mr-1" />
                          {configEstado.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          {cita.estado === 'programada' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  manejarCheckIn(cita.id)
                                }}
                                className="text-green-600 hover:text-green-800 transition-colors p-1"
                                title="Check-in"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  manejarCancelar(cita.id)
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {cita.estado === 'en_proceso' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                manejarCompletar(cita.id)
                              }}
                              className="text-green-600 hover:text-green-800 transition-colors p-1"
                              title="Marcar como completada"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onCitaSeleccionada(cita.id)
                            }}
                            className="text-primary hover:text-primary/80 transition-colors p-1"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}