// Formulario para crear y editar citas médicas
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  Phone, 
  Mail,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Users,
  Repeat
} from 'lucide-react'
import { FormularioCita as FormularioCitaData, Paciente, Doctor, TipoConsulta, Cita } from '@/types/agenda'
import { useAgenda } from '@/hooks/useAgenda'
import toast from 'react-hot-toast'

// Función helper para formatear fechas para inputs
const formatearFechaParaInput = (fecha?: Date): string => {
  if (!fecha) return ''
  return fecha.toISOString().slice(0, 16)
}

const formatearFechaSoloParaInput = (fecha?: Date): string => {
  if (!fecha) return ''
  return fecha.toISOString().slice(0, 10)
}

// Schema de validación
const citaSchema = z.object({
  pacienteId: z.string().min(1, 'Selecciona un paciente'),
  doctorId: z.string().min(1, 'Selecciona un doctor'),
  tipoConsultaId: z.string().min(1, 'Selecciona el tipo de consulta'),
  fechaHora: z.string().min(1, 'Selecciona fecha y hora'),
  duracionMinutos: z.number().min(15, 'Duración mínima 15 minutos').max(480, 'Duración máxima 8 horas'),
  motivoConsulta: z.string().min(5, 'Motivo debe tener al menos 5 caracteres'),
  notas: z.string().optional(),
  recurrente: z.object({
    activo: z.boolean(),
    frecuencia: z.enum(['semanal', 'mensual', 'anual']).optional(),
    intervalo: z.number().min(1).max(12).optional(),
    fechaFin: z.string().optional()
  }).optional()
})

type FormData = z.infer<typeof citaSchema>

interface FormularioCitaProps {
  citaId?: string | null
  fechaInicial?: Date
  onGuardar?: () => void
  onCancelar: () => void
}

export function FormularioCita({ citaId, fechaInicial, onGuardar, onCancelar }: FormularioCitaProps) {
  const { 
    citas, 
    pacientes, 
    doctores, 
    tiposConsulta, 
    crearCita, 
    actualizarCita, 
    loading 
  } = useAgenda()
  
  const [mostrarNuevoPaciente, setMostrarNuevoPaciente] = useState(false)
  const [recurrenteActivo, setRecurrenteActivo] = useState(false)

  // Cita actual si es edición
  const citaActual = citaId ? citas.find(c => c.id === citaId) : null

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      pacienteId: citaActual?.pacienteId || '',
      doctorId: citaActual?.doctorId || '',
      tipoConsultaId: citaActual?.tipoConsultaId || '',
      fechaHora: formatearFechaParaInput(citaActual?.fechaHora) || formatearFechaParaInput(fechaInicial) || formatearFechaParaInput(new Date()),
      duracionMinutos: citaActual?.duracionMinutos || 30,
      motivoConsulta: citaActual?.motivoConsulta || '',
      notas: citaActual?.notas || '',
      recurrente: {
        activo: false,
        frecuencia: 'mensual',
        intervalo: 1,
        fechaFin: formatearFechaSoloParaInput(undefined)
      }
    }
  })

  // Observar cambios
  const pacienteSeleccionado = watch('pacienteId')
  const tipoConsultaSeleccionado = watch('tipoConsultaId')
  const doctorSeleccionado = watch('doctorId')

  // Cargar duración automática según tipo de consulta
  useEffect(() => {
    if (tipoConsultaSeleccionado) {
      const tipoConsulta = tiposConsulta.find(t => t.id === tipoConsultaSeleccionado)
      if (tipoConsulta && !citaActual) {
        setValue('duracionMinutos', tipoConsulta.duracionMinutos)
      }
    }
  }, [tipoConsultaSeleccionado, tiposConsulta, setValue, citaActual])

  // Manejar envío del formulario
  const onSubmit = async (data: FormData) => {
    try {
      const citaData = {
        pacienteId: data.pacienteId,
        doctorId: data.doctorId,
        tipoConsultaId: data.tipoConsultaId,
        fechaHora: new Date(data.fechaHora),
        duracionMinutos: data.duracionMinutos,
        motivoConsulta: data.motivoConsulta,
        notas: data.notas
      }

      if (citaActual) {
        // Actualizar cita existente
        const exito = await actualizarCita(citaActual.id, citaData)
        
        if (exito) {
          onGuardar()
        }
      } else {
        // Crear nueva cita
        const nuevaCita = await crearCita(citaData)
        if (nuevaCita) {
          onGuardar()
        }
      }
    } catch (error) {
      console.error('Error al guardar cita:', error)
    }
  }

  // Paciente y doctor info
  const pacienteInfo = pacienteSeleccionado ? pacientes.find(p => p.id === pacienteSeleccionado) : null
  const doctorInfo = doctorSeleccionado ? doctores.find(d => d.id === doctorSeleccionado) : null
  const tipoConsultaInfo = tipoConsultaSeleccionado ? tiposConsulta.find(t => t.id === tipoConsultaSeleccionado) : null

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del paciente */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Información del Paciente</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                {...register('pacienteId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar paciente</option>
                {pacientes.map(paciente => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nombre} {paciente.apellidoPaterno} {paciente.apellidoMaterno} - {paciente.empresa}
                  </option>
                ))}
              </select>
              {errors.pacienteId && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.pacienteId.message}</span>
                </p>
              )}
            </div>

            {pacienteInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-lg p-4"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Email:</span>
                    <p className="text-gray-600">{pacienteInfo.email || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Teléfono:</span>
                    <p className="text-gray-600">{pacienteInfo.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Empresa:</span>
                    <p className="text-gray-600">{pacienteInfo.empresa || 'No especificada'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Puesto:</span>
                    <p className="text-gray-600">{pacienteInfo.puesto || 'No especificado'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Información de la consulta */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span>Información de la Consulta</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor *
              </label>
              <select
                {...register('doctorId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar doctor</option>
                {doctores.filter(d => d.disponible).map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr./Dra. {doctor.nombre} {doctor.apellidoPaterno} - {doctor.especialidad}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.doctorId.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Consulta *
              </label>
              <select
                {...register('tipoConsultaId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
                {tiposConsulta.filter(t => t.activo).map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre} ({tipo.duracionMinutos} min)
                  </option>
                ))}
              </select>
              {errors.tipoConsultaId && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.tipoConsultaId.message}</span>
                </p>
              )}
            </div>
          </div>

          {tipoConsultaInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{tipoConsultaInfo.nombre}</h4>
                  <p className="text-sm text-gray-600">{tipoConsultaInfo.descripcion}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {tipoConsultaInfo.duracionMinutos} minutos
                  </p>
                  {tipoConsultaInfo.precio && (
                    <p className="text-sm text-gray-600">
                      ${tipoConsultaInfo.precio.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Fecha y hora */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Fecha y Hora</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                {...register('fechaHora')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.fechaHora && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.fechaHora.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos) *
              </label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                {...register('duracionMinutos', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.duracionMinutos && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.duracionMinutos.message}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la consulta */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Detalles de la Consulta</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de Consulta *
              </label>
              <textarea
                rows={3}
                {...register('motivoConsulta')}
                placeholder="Describe el motivo de la consulta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.motivoConsulta && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle size={14} />
                  <span>{errors.motivoConsulta.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                rows={2}
                {...register('notas')}
                placeholder="Notas adicionales para el médico..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Opciones recurrentes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-primary" />
              <span>Cita Recurrente</span>
            </h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recurrenteActivo}
                onChange={(e) => setRecurrenteActivo(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Activar recurrencia</span>
            </label>
          </div>

          {recurrenteActivo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frecuencia
                  </label>
                  <select
                    {...register('recurrente.frecuencia')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    {...register('recurrente.intervalo', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin (Opcional)
                  </label>
                  <input
                    type="date"
                    {...register('recurrente.fechaFin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X size={16} />
            <span>Cancelar</span>
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span>{citaActual ? 'Actualizar Cita' : 'Programar Cita'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
