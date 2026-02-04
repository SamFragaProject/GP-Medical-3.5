/**
 * 📅 TIPOS DE AGENDA V2
 */

export type TipoCita = 
  | 'consulta_general'
  | 'consulta_especialidad'
  | 'examen_ocupacional'
  | 'seguimiento'
  | 'emergencia'
  | 'vacunacion'
  | 'otro';

export type EstadoCita = 
  | 'pendiente'
  | 'confirmada'
  | 'en_progreso'
  | 'completada'
  | 'cancelada'
  | 'no_asistio';

export interface Cita {
  id: string;
  empresaId: string;
  
  // Paciente
  pacienteId: string;
  paciente?: {
    id: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefono?: string;
    email?: string;
  };
  
  // Médico
  medicoId: string;
  medico?: {
    id: string;
    nombre: string;
    apellidoPaterno: string;
    especialidad?: string;
  };
  
  // Fecha y hora
  fechaInicio: string;
  fechaFin: string;
  duracion: number; // minutos
  
  // Detalles
  tipo: TipoCita;
  estado: EstadoCita;
  motivo?: string;
  notas?: string;
  
  // Ubicación
  consultorio?: string;
  sedeId?: string;
  
  // Recordatorios
  recordatorioEnviado: boolean;
  recordatorioFecha?: string;
  
  // Cancelación
  canceladoPor?: string;
  motivoCancelacion?: string;
  fechaCancelacion?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateCitaInput {
  pacienteId: string;
  medicoId: string;
  fechaInicio: string;
  duracion: number;
  tipo: TipoCita;
  motivo?: string;
  notas?: string;
  consultorio?: string;
}

export interface UpdateCitaInput extends Partial<CreateCitaInput> {
  estado?: EstadoCita;
}

export interface AgendaFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  medicoId?: string;
  pacienteId?: string;
  estado?: EstadoCita;
  tipo?: TipoCita;
}

export interface Disponibilidad {
  medicoId: string;
  fecha: string;
  horasOcupadas: string[];
  horasDisponibles: string[];
}

export interface AgendaStats {
  totalHoy: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
  proximaCita?: Cita;
}

export const TIPO_CITA_OPTIONS = [
  { value: 'consulta_general', label: 'Consulta General' },
  { value: 'consulta_especialidad', label: 'Consulta Especialidad' },
  { value: 'examen_ocupacional', label: 'Examen Ocupacional' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'emergencia', label: 'Emergencia' },
  { value: 'vacunacion', label: 'Vacunación' },
  { value: 'otro', label: 'Otro' },
];

export const ESTADO_CITA_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmada: 'bg-blue-100 text-blue-800 border-blue-200',
  en_progreso: 'bg-purple-100 text-purple-800 border-purple-200',
  completada: 'bg-green-100 text-green-800 border-green-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
  no_asistio: 'bg-gray-100 text-gray-800 border-gray-200',
};
