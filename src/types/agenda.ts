// Tipos para el módulo de Agenda & Citas

export interface Paciente {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email?: string
  telefono?: string
  empresa?: string
  puesto?: string
  fechaNacimiento?: Date
  genero?: 'M' | 'F'
  numEmpleado?: string
  createdAt: Date
  updatedAt: Date
}

export interface Doctor {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  telefono?: string
  especialidad: string
  cedulaProfesional?: string
  disponible: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TipoConsulta {
  id: string
  nombre: string
  descripcion?: string
  duracionMinutos: number
  color: string
  precio?: number
  activo: boolean
}

export type EstadoCita = 'programada' | 'en_proceso' | 'completada' | 'cancelada' | 'no_show'

export interface Cita {
  id: string
  pacienteId: string
  doctorId: string
  tipoConsultaId: string
  fechaHora: Date
  duracionMinutos: number
  estado: EstadoCita
  notas?: string
  motivoConsulta?: string
  cancelacionMotivo?: string
  recordatorioEnviado: boolean
  checkinTiempo?: Date
  completadaTiempo?: Date
  creadaPor: string
  updatedAt: Date
  createdAt: Date
  
  // Relaciones
  paciente?: Paciente
  doctor?: Doctor
  tipoConsulta?: TipoConsulta
}

export interface DisponibilidadMedica {
  id: string
  doctorId: string
  diaSemana: number // 0-6 (Domingo-Sábado)
  horaInicio: string // HH:mm
  horaFin: string // HH:mm
  activo: boolean
  excepciones?: string[] // Fechas específicas no disponibles
}

export interface ConfiguracionCitas {
  id: string
  empresaId: string
  diasAnticipacionMaxima: number
  diasAnticipacionMinima: number
  recordatorioMinutosAnticipacion: number
  permitirCancelaciones: boolean
  permitirReschedulacion: boolean
  duracionDefaultMinutos: number
  horarioInicio: string
  horarioFin: string
  diasLaborales: number[]
}

export interface FiltroCitas {
  fechaInicio?: Date
  fechaFin?: Date
  doctorId?: string
  pacienteId?: string
  tipoConsultaId?: string
  estado?: EstadoCita
  empresaId?: string
}

export interface RecordatorioCita {
  id: string
  citaId: string
  tipo: 'sms' | 'email'
  enviado: boolean
  fechaEnvio?: Date
  fechaProgramada: Date
}

export interface EstadisticasCitas {
  totalCitas: number
  citasHoy: number
  citasCompletadas: number
  citasCanceladas: number
  citasNoShow: number
  ocupacionPromedio: number
  duracionPromedioConsultas: number
}

// Eventos del calendario
export interface CalendarioEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Cita
  bgColor?: string
  borderColor?: string
  textColor?: string
}

// Tipo compatible con react-big-calendar
export interface RBCEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
  bgColor?: string
  borderColor?: string
  textColor?: string
}

// Formularios
export interface FormularioCita {
  pacienteId: string
  doctorId: string
  tipoConsultaId: string
  fechaHora: Date
  duracionMinutos: number
  notas?: string
  motivoConsulta?: string
  recurrente?: {
    activo: boolean
    frecuencia?: 'semanal' | 'mensual' | 'anual'
    intervalo?: number
    fechaFin?: Date
  }
}

export interface FormularioPaciente {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email?: string
  telefono?: string
  empresa?: string
  puesto?: string
  fechaNacimiento?: Date
  genero?: 'M' | 'F'
  numEmpleado?: string
}
