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

// Datos demo/mock para desarrollo
const PACIENTES_DEMO: Paciente[] = [
  {
    id: '1',
    nombre: 'Juan Carlos',
    apellidoPaterno: 'García',
    apellidoMaterno: 'López',
    email: 'juan.garcia@empresa.com',
    telefono: '+52 555 123 4567',
    empresa: 'Empresa ABC',
    puesto: 'Operador de Maquinaria',
    numEmpleado: 'EMP001',
    fechaNacimiento: new Date('1985-03-15'),
    genero: 'M',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'María Elena',
    apellidoPaterno: 'Rodríguez',
    apellidoMaterno: 'Sánchez',
    email: 'maria.rodriguez@empresa.com',
    telefono: '+52 555 234 5678',
    empresa: 'Empresa ABC',
    puesto: 'Administradora',
    numEmpleado: 'EMP002',
    fechaNacimiento: new Date('1990-07-22'),
    genero: 'F',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    nombre: 'Pedro Antonio',
    apellidoPaterno: 'Martínez',
    apellidoMaterno: 'Hernández',
    email: 'pedro.martinez@empresa.com',
    telefono: '+52 555 345 6789',
    empresa: 'Empresa DEF',
    puesto: 'Soldador',
    numEmpleado: 'EMP003',
    fechaNacimiento: new Date('1982-11-08'),
    genero: 'M',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

const DOCTORES_DEMO: Doctor[] = [
  {
    id: '1',
    nombre: 'Dr. Roberto',
    apellidoPaterno: 'Vargas',
    apellidoMaterno: 'Morales',
    email: 'dr.vargas@GPMedical.com',
    telefono: '+52 555 111 2222',
    especialidad: 'Medicina del Trabajo',
    cedulaProfesional: '1234567',
    disponible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'Dra. Carmen',
    apellidoPaterno: 'López',
    apellidoMaterno: 'Silva',
    email: 'dra.lopez@GPMedical.com',
    telefono: '+52 555 222 3333',
    especialidad: 'Medicina del Trabajo',
    cedulaProfesional: '2345678',
    disponible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

const TIPOS_CONSULTA_DEMO: TipoConsulta[] = [
  {
    id: '1',
    nombre: 'Examen Ocupacional',
    descripcion: 'Evaluación médica completa para ingreso laboral',
    duracionMinutos: 60,
    color: '#00BFA6',
    precio: 1500,
    activo: true
  },
  {
    id: '2',
    nombre: 'Consulta de Seguimiento',
    descripcion: 'Consulta de control post-examen',
    duracionMinutos: 30,
    color: '#4F46E5',
    precio: 800,
    activo: true
  },
  {
    id: '3',
    nombre: 'Certificación Médica',
    descripcion: 'Emisión de certificaciones de aptitud',
    duracionMinutos: 15,
    color: '#F59E0B',
    precio: 300,
    activo: true
  },
  {
    id: '4',
    nombre: 'Evaluación Anual',
    descripcion: 'Revisión médica anual programada',
    duracionMinutos: 45,
    color: '#EF4444',
    precio: 1200,
    activo: true
  }
]

const CITAS_DEMO: Cita[] = [
  {
    id: '1',
    pacienteId: '1',
    doctorId: '1',
    tipoConsultaId: '1',
    fechaHora: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 horas desde ahora
    duracionMinutos: 60,
    estado: 'programada',
    motivoConsulta: 'Examen de ingreso laboral',
    notas: 'Paciente nuevo en la empresa',
    recordatorioEnviado: false,
    creadaPor: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    paciente: PACIENTES_DEMO[0],
    doctor: DOCTORES_DEMO[0],
    tipoConsulta: TIPOS_CONSULTA_DEMO[0]
  },
  {
    id: '2',
    pacienteId: '2',
    doctorId: '1',
    tipoConsultaId: '2',
    fechaHora: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 horas desde ahora
    duracionMinutos: 30,
    estado: 'programada',
    motivoConsulta: 'Seguimiento post-examen',
    notas: 'Revisar resultados de laboratorio',
    recordatorioEnviado: true,
    creadaPor: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    paciente: PACIENTES_DEMO[1],
    doctor: DOCTORES_DEMO[0],
    tipoConsulta: TIPOS_CONSULTA_DEMO[1]
  },
  {
    id: '3',
    pacienteId: '3',
    doctorId: '2',
    tipoConsultaId: '3',
    fechaHora: new Date(Date.now() + 1000 * 60 * 60 * 24), // Mañana
    duracionMinutos: 15,
    estado: 'programada',
    motivoConsulta: 'Certificación de aptitud',
    notas: 'Emitir certificado',
    recordatorioEnviado: false,
    creadaPor: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    paciente: PACIENTES_DEMO[2],
    doctor: DOCTORES_DEMO[1],
    tipoConsulta: TIPOS_CONSULTA_DEMO[2]
  }
]

export function useAgenda() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [doctores, setDoctores] = useState<Doctor[]>([])
  const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>(TIPOS_CONSULTA_DEMO)
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

      console.log('✅ Citas cargadas desde Supabase:', data.length)

      // Eliminar el uso de CITAS_DEMO como fallback
      if (data.length === 0) {
        setCitas([])
        setLoading(false)
        return []
      }

      // Mapear datos del servicio al formato interno
      const citasMapeadas = data.map(c => ({
        id: c.id,
        pacienteId: c.paciente_id,
        doctorId: c.medico_id || '1',
        tipoConsultaId: '1',
        fechaHora: new Date(`${c.fecha}T${c.hora_inicio}`),
        duracionMinutos: 30,
        estado: c.estado as EstadoCita,
        motivoConsulta: c.notas || '',
        notas: c.notas || '',
        recordatorioEnviado: false,
        creadaPor: '1',
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.created_at),
        // Relaciones
        paciente: c.paciente ? {
          id: c.paciente.id,
          nombre: c.paciente.nombre,
          apellidoPaterno: c.paciente.apellido_paterno,
          apellidoMaterno: c.paciente.apellido_materno || '',
          email: '',
          telefono: '',
          empresa: '',
          puesto: '',
          numEmpleado: '',
          fechaNacimiento: new Date(),
          genero: 'M',
          createdAt: new Date(),
          updatedAt: new Date()
        } : { id: c.paciente_id, nombre: 'Paciente', apellidoPaterno: 'Desconocido' } as any,
        doctor: doctores.find(d => d.id === c.medico_id) || { id: '1', nombre: 'Dr.', apellidoPaterno: 'No asignado' } as any,
        tipoConsulta: TIPOS_CONSULTA_DEMO.find(t => t.nombre.toLowerCase().includes(c.tipo?.toLowerCase() || '')) || TIPOS_CONSULTA_DEMO[0]
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
      console.warn('⚠️ Error al obtener citas (Usando datos demo):', err)
      // Usar CITAS_DEMO como fallback
      setCitas(CITAS_DEMO)
      return CITAS_DEMO
    } finally {
      setLoading(false)
    }
  }, [pacientes, doctores, tiposConsulta])

  // Crear nueva cita
  const crearCita = useCallback(async (formulario: FormularioCita) => {
    setLoading(true)
    try {
      const nuevaCitaData = {
        paciente_id: formulario.pacienteId,
        medico_id: formulario.doctorId,
        fechaHora: formulario.fechaHora.toISOString(),
        duracion: formulario.duracionMinutos || 30,
        tipo: 'consulta_general', // Default
        estado: 'programada' as const,
        motivo: formulario.motivoConsulta,
        notas: formulario.notas,
        empresa_id: user?.empresa_id || ''
      }
      // Usar servicio real de Supabase
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

  return {
    // Estado
    citas,
    pacientes,
    doctores,
    tiposConsulta,
    loading,
    error,

    // Funciones principales
    obtenerCitas,
    crearCita,
    actualizarCita,
    cancelarCita,
    checkInPaciente,
    completarCita,

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
