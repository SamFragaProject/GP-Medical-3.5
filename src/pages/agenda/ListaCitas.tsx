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
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: Calendar
  },
  en_proceso: {
    label: 'En Proceso',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: Play
  },
  completada: {
    label: 'Completada',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    icon: XCircle
  },
  no_show: {
    label: 'No se presentó',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
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
      <div className="flex items-center justify-center h-64 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <RefreshCw className="h-12 w-12 animate-spin text-emerald-500 opacity-20" />
            <RefreshCw className="h-12 w-12 animate-spin-slow text-emerald-600 absolute inset-0" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Actualizando Citas...</p>
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
      <div className="flex items-center justify-between space-x-4 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Filtrar por paciente, doctor o empresa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
              {citasFiltradas.length} Resultado{citasFiltradas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de citas */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => manejarOrdenamiento('fecha')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Fecha y Hora</span>
                    <span className="text-emerald-500">{obtenerIconoOrden('fecha')}</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => manejarOrdenamiento('paciente')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Paciente</span>
                    <span className="text-emerald-500">{obtenerIconoOrden('paciente')}</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => manejarOrdenamiento('doctor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Doctor</span>
                    <span className="text-emerald-500">{obtenerIconoOrden('doctor')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Servicio
                </th>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => manejarOrdenamiento('estado')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Estado</span>
                    <span className="text-emerald-500">{obtenerIconoOrden('estado')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
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
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <User className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-tight">
                              {cita.paciente?.nombre} {cita.paciente?.apellidoPaterno}
                            </div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-tight">{cita.paciente?.empresa}</div>
                            {cita.paciente?.telefono && (
                              <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
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
