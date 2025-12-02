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
    email: 'dr.vargas@mediflow.com',
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
    email: 'dra.lopez@mediflow.com',
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
    fechaHora: new Date(2024, 10, 1, 9, 0), // 1 Nov 2024, 9:00 AM
    duracionMinutos: 60,
    estado: 'programada',
    motivoConsulta: 'Examen de ingreso laboral',
    notas: 'Paciente nuevo en la empresa',
    recordatorioEnviado: false,
    creadaPor: '1',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
    paciente: PACIENTES_DEMO[0],
    doctor: DOCTORES_DEMO[0],
    tipoConsulta: TIPOS_CONSULTA_DEMO[0]
  },
  {
    id: '2',
    pacienteId: '2',
    doctorId: '1',
    tipoConsultaId: '2',
    fechaHora: new Date(2024, 10, 1, 10, 30), // 1 Nov 2024, 10:30 AM
    duracionMinutos: 30,
    estado: 'programada',
    motivoConsulta: 'Seguimiento post-examen',
    notas: 'Revisar resultados de laboratorio',
    recordatorioEnviado: true,
    creadaPor: '1',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
    paciente: PACIENTES_DEMO[1],
    doctor: DOCTORES_DEMO[0],
    tipoConsulta: TIPOS_CONSULTA_DEMO[1]
  },
  {
    id: '3',
    pacienteId: '3',
    doctorId: '2',
    tipoConsultaId: '3',
    fechaHora: new Date(2024, 10, 1, 14, 0), // 1 Nov 2024, 2:00 PM
    duracionMinutos: 15,
    estado: 'programada',
    motivoConsulta: 'Certificación de aptitud',
    notas: 'Emitir certificado',
    recordatorioEnviado: false,
    creadaPor: '1',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
    paciente: PACIENTES_DEMO[2],
    doctor: DOCTORES_DEMO[1],
    tipoConsulta: TIPOS_CONSULTA_DEMO[2]
  }
]

export function useAgenda() {
  const [citas, setCitas] = useState<Cita[]>(CITAS_DEMO)
  const [pacientes, setPacientes] = useState<Paciente[]>(PACIENTES_DEMO)
  const [doctores, setDoctores] = useState<Doctor[]>(DOCTORES_DEMO)
  const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>(TIPOS_CONSULTA_DEMO)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener citas filtradas
  const obtenerCitas = useCallback(async (filtros?: FiltroCitas) => {
    setLoading(true)
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let citasFiltradas = [...citas]
      
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
      setError('Error al obtener citas')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [citas])

  // Crear nueva cita
  const crearCita = useCallback(async (formulario: FormularioCita) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const nuevaCita: Cita = {
        id: (citas.length + 1).toString(),
        pacienteId: formulario.pacienteId,
        doctorId: formulario.doctorId,
        tipoConsultaId: formulario.tipoConsultaId,
        fechaHora: formulario.fechaHora,
        duracionMinutos: formulario.duracionMinutos || 
          tiposConsulta.find(t => t.id === formulario.tipoConsultaId)?.duracionMinutos || 30,
        estado: 'programada',
        motivoConsulta: formulario.motivoConsulta,
        notas: formulario.notas,
        recordatorioEnviado: false,
        creadaPor: '1', // Usuario actual
        createdAt: new Date(),
        updatedAt: new Date(),
        paciente: pacientes.find(p => p.id === formulario.pacienteId),
        doctor: doctores.find(d => d.id === formulario.doctorId),
        tipoConsulta: tiposConsulta.find(t => t.id === formulario.tipoConsultaId)
      }

      setCitas(prev => [...prev, nuevaCita])
      toast.success('Cita programada exitosamente')
      return nuevaCita
    } catch (err) {
      setError('Error al crear cita')
      console.error(err)
      toast.error('Error al programar la cita')
      return null
    } finally {
      setLoading(false)
    }
  }, [citas, pacientes, doctores, tiposConsulta])

  // Actualizar cita
  const actualizarCita = useCallback(async (citaId: string, datos: Partial<Cita>) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setCitas(prev => prev.map(cita => 
        cita.id === citaId 
          ? { ...cita, ...datos, updatedAt: new Date() }
          : cita
      ))
      
      toast.success('Cita actualizada exitosamente')
      return true
    } catch (err) {
      setError('Error al actualizar cita')
      console.error(err)
      toast.error('Error al actualizar la cita')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Cancelar cita
  const cancelarCita = useCallback(async (citaId: string, motivo?: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCitas(prev => prev.map(cita => 
        cita.id === citaId 
          ? { 
              ...cita, 
              estado: 'cancelada' as EstadoCita,
              cancelacionMotivo: motivo,
              updatedAt: new Date()
            }
          : cita
      ))
      
      toast.success('Cita cancelada exitosamente')
      return true
    } catch (err) {
      setError('Error al cancelar cita')
      console.error(err)
      toast.error('Error al cancelar la cita')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Check-in de paciente
  const checkInPaciente = useCallback(async (citaId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCitas(prev => prev.map(cita => 
        cita.id === citaId 
          ? { 
              ...cita, 
              estado: 'en_proceso' as EstadoCita,
              checkinTiempo: new Date(),
              updatedAt: new Date()
            }
          : cita
      ))
      
      toast.success('Check-in realizado exitosamente')
      return true
    } catch (err) {
      setError('Error en check-in')
      console.error(err)
      toast.error('Error al realizar check-in')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar como completada
  const completarCita = useCallback(async (citaId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCitas(prev => prev.map(cita => 
        cita.id === citaId 
          ? { 
              ...cita, 
              estado: 'completada' as EstadoCita,
              completadaTiempo: new Date(),
              updatedAt: new Date()
            }
          : cita
      ))
      
      toast.success('Cita marcada como completada')
      return true
    } catch (err) {
      setError('Error al completar cita')
      console.error(err)
      toast.error('Error al completar la cita')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

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