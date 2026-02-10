// Hook personalizado para la gestión de Agenda & Citas
import { useState, useEffect, useCallback } from 'react'
import {
  Cita,
  Paciente,
  Doctor,
  TipoConsulta,
  FiltroCitas,
  FormularioCita,
  EstadoCita,
  CalendarioEvent
} from '@/types/agenda'
import toast from 'react-hot-toast'
import { citasService, pacientesService, usuariosService } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'

// Demo constants removed in favor of real services


export function useAgenda() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [pacientesData, doctoresData] = await Promise.all([
        pacientesService.getAll(),
        usuariosService.getAll() // Esto devuelve perfiles, necesitamos filtrar por rol médico si es posible
      ])

      setPacientes(pacientesData.map(p => ({
        id: p.id,
        nombre: p.nombre,
        apellidoPaterno: p.apellido_paterno,
        apellidoMaterno: p.apellido_materno || '',
        email: p.email || '',
        telefono: p.telefono || '',
        empresa: p.empresa_nombre || '',
        puesto: p.puesto || '',
        numEmpleado: p.numero_empleado || '',
        fechaNacimiento: p.fecha_nacimiento ? new Date(p.fecha_nacimiento) : new Date(),
        genero: (p.genero || 'M') as 'M' | 'F',
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.created_at)
      })))

      setDoctores(doctoresData.filter((u: any) => u.rol === 'medico' || u.rol === 'medico_trabajo').map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        apellidoPaterno: u.apellido_paterno,
        apellidoMaterno: u.apellido_materno || '',
        email: u.email,
        telefono: u.telefono || '',
        especialidad: u.especialidad || 'Medicina General',
        cedulaProfesional: u.cedula_profesional || '',
        disponible: true,
        createdAt: new Date(u.created_at),
        updatedAt: new Date(u.created_at)
      })))

      await obtenerCitas()
    } catch (err) {
      console.error('Error loading initial agenda data:', err)
      toast.error('Error al cargar datos de la agenda')
    } finally {
      setLoading(false)
    }
  }

  // Obtener citas filtradas
  const obtenerCitas = useCallback(async (filtros?: FiltroCitas) => {
    setLoading(true)
    try {
      // Usar servicio real de Supabase
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const data = await citasService.getByDateRange(today, nextMonth)

      console.log('✅ Citas cargadas desde Supabase:', data.length)

      // Si no hay citas, devolver array vacío
      if (data.length === 0) {
        setCitas([])
        setLoading(false)
        return []
      }

      // Mapear datos del servicio al formato interno
      const citasMapeadas = data.map(c => ({
        id: c.id,
        pacienteId: c.paciente_id,
        doctorId: c.medico_id || '',
        tipoConsultaId: '1', // Default
        fechaHora: new Date(`${c.fecha}T${c.hora_inicio}`),
        duracionMinutos: 30,
        estado: (c.estado === 'confirmada' ? 'en_proceso' : c.estado) as EstadoCita,
        motivoConsulta: c.notas || '',
        notas: c.notas || '',
        recordatorioEnviado: false,
        creadaPor: 'system',
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.created_at),
        // Relaciones
        paciente: c.paciente ? {
          id: c.paciente.id,
          nombre: c.paciente.nombre,
          apellidoPaterno: c.paciente.apellido_paterno,
          apellidoMaterno: c.paciente.apellido_materno || '',
          email: (c.paciente as any).email || '',
          telefono: (c.paciente as any).telefono || '',
          empresa: (c.paciente as any).empresa_nombre || '',
          puesto: (c.paciente as any).puesto || '',
          numEmpleado: (c.paciente as any).numero_empleado || '',
          fechaNacimiento: (c.paciente as any).fecha_nacimiento ? new Date((c.paciente as any).fecha_nacimiento) : new Date(),
          genero: ((c.paciente as any).genero || 'M') as 'M' | 'F',
          createdAt: new Date((c.paciente as any).created_at || Date.now()),
          updatedAt: new Date((c.paciente as any).created_at || Date.now())
        } : undefined,
        doctor: doctores.find(d => d.id === c.medico_id),
        tipoConsulta: {
          id: '1',
          nombre: c.tipo || 'Consulta',
          duracionMinutos: 30,
          color: '#10b981',
          activo: true
        }
      })) as Cita[]

      let citasFiltradas = citasMapeadas

      if (filtros) {
        if (filtros.fechaInicio) {
          citasFiltradas = citasFiltradas.filter(cita =>
            cita.fechaHora >= filtros.fechaInicio!
          )
        }
        if (filtros.fechaFin) {
          citasFiltradas = citasFiltradas.filter(cita =>
            cita.fechaHora <= filtros.fechaFin!
          )
        }
        if (filtros.doctorId) {
          citasFiltradas = citasFiltradas.filter(cita =>
            cita.doctorId === filtros.doctorId
          )
        }
        if (filtros.pacienteId) {
          citasFiltradas = citasFiltradas.filter(cita =>
            cita.pacienteId === filtros.pacienteId
          )
        }
        if (filtros.estado) {
          citasFiltradas = citasFiltradas.filter(cita =>
            cita.estado === filtros.estado
          )
        }
      }

      setCitas(citasFiltradas)
      return citasFiltradas
    } catch (err) {
      setCitas([])
      return []
    } finally {
      setLoading(false)
    }
  }, [pacientes, doctores, tiposConsulta])

  // Crear nueva cita
  const crearCita = useCallback(async (formulario: FormularioCita) => {
    setLoading(true)
    try {
      // Crear cita en Supabase
      await citasService.create({
        empresa_id: user?.empresa_id || '',
        paciente_id: formulario.pacienteId,
        fecha: formulario.fechaHora.toISOString().split('T')[0],
        hora_inicio: formulario.fechaHora.toTimeString().slice(0, 5),
        tipo: 'consulta_general',
        estado: 'programada',
        notas: formulario.motivoConsulta
      })
      toast.success('Cita programada exitosamente')
      obtenerCitas() // Recargar
      return null // El servicio devuelve la cita pero aquí recargamos todo
    } catch (err) {
      setError('Error al crear cita')
      console.error(err)
      toast.error('Error al programar la cita')
      return null
    } finally {
      setLoading(false)
    }
  }, [obtenerCitas])

  // Actualizar cita
  const actualizarCita = useCallback(async (citaId: string, datos: Partial<Cita>) => {
    setLoading(true)
    try {
      await citasService.updateStatus(citaId, datos.estado || 'actualizada')
      toast.success('Cita actualizada exitosamente')
      obtenerCitas()
      return true
    } catch (err) {
      setError('Error al actualizar cita')
      console.error(err)
      toast.error('Error al actualizar la cita')
      return false
    } finally {
      setLoading(false)
    }
  }, [obtenerCitas])

  // Cancelar cita
  const cancelarCita = useCallback(async (citaId: string, motivo?: string) => {
    setLoading(true)
    try {
      await citasService.cancel(citaId)
      toast.success('Cita cancelada exitosamente')
      obtenerCitas()
      return true
    } catch (err) {
      setError('Error al cancelar cita')
      console.error(err)
      toast.error('Error al cancelar la cita')
      return false
    } finally {
      setLoading(false)
    }
  }, [obtenerCitas])

  // Check-in de paciente
  const checkInPaciente = useCallback(async (citaId: string) => {
    // Implementación similar usando updateCita
    return actualizarCita(citaId, { estado: 'confirmada' } as any)
  }, [actualizarCita])

  // Marcar como completada
  const completarCita = useCallback(async (citaId: string) => {
    return actualizarCita(citaId, { estado: 'completada' } as any)
  }, [actualizarCita])

  // Obtener citas para el calendario
  const obtenerEventosCalendario = useCallback((filtros?: FiltroCitas): CalendarioEvent[] => {
    const citasParaFiltrar = filtros ?
      citas.filter(cita => {
        if (filtros.fechaInicio && cita.fechaHora < filtros.fechaInicio) return false
        if (filtros.fechaFin && cita.fechaHora > filtros.fechaFin) return false
        if (filtros.doctorId && cita.doctorId !== filtros.doctorId) return false
        if (filtros.pacienteId && cita.pacienteId !== filtros.pacienteId) return false
        if (filtros.estado && cita.estado !== filtros.estado) return false
        return true
      }) : citas

    return citasParaFiltrar.map(cita => ({
      id: cita.id,
      title: `${cita.paciente?.nombre} ${cita.paciente?.apellidoPaterno} - ${cita.tipoConsulta?.nombre}`,
      start: new Date(cita.fechaHora),
      end: new Date(cita.fechaHora.getTime() + cita.duracionMinutos * 60000),
      resource: cita,
      bgColor: cita.tipoConsulta?.color || '#00BFA6',
      borderColor: cita.tipoConsulta?.color || '#00BFA6',
      textColor: '#FFFFFF'
    }))
  }, [citas])

  // Buscar pacientes
  const buscarPacientes = useCallback((termino: string): Paciente[] => {
    if (!termino.trim()) return pacientes

    const terminoLower = termino.toLowerCase()
    return pacientes.filter(paciente =>
      paciente.nombre.toLowerCase().includes(terminoLower) ||
      paciente.apellidoPaterno.toLowerCase().includes(terminoLower) ||
      paciente.apellidoMaterno.toLowerCase().includes(terminoLower) ||
      paciente.email?.toLowerCase().includes(terminoLower) ||
      paciente.empresa?.toLowerCase().includes(terminoLower) ||
      paciente.numEmpleado?.toLowerCase().includes(terminoLower)
    )
  }, [pacientes])

  // Refresh completo de la agenda
  const refreshAgenda = useCallback(() => {
    loadInitialData()
  }, [])

  // Estadísticas de citas para dashboard
  const estadisticas = {
    total: citas.length,
    programadas: citas.filter(c => c.estado === 'programada').length,
    enProceso: citas.filter(c => c.estado === 'en_proceso').length,
    completadas: citas.filter(c => c.estado === 'completada').length,
    canceladas: citas.filter(c => c.estado === 'cancelada').length,
    noShow: citas.filter(c => c.estado === 'no_show').length,
    hoy: citas.filter(c => {
      const today = new Date();
      return c.fechaHora.toDateString() === today.toDateString();
    }).length
  }

  return {
    // Estado
    citas,
    pacientes,
    doctores,
    tiposConsulta,
    loading,
    error,
    estadisticas,

    // Funciones principales
    obtenerCitas,
    crearCita,
    actualizarCita,
    cancelarCita,
    checkInPaciente,
    completarCita,
    refreshAgenda,

    // Utilidades
    obtenerEventosCalendario,
    buscarPacientes,

    // Setters para actualizaciones
    setCitas,
    setPacientes,
    setDoctores,
    setTiposConsulta
  }
}
