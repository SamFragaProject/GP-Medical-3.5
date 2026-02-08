// =====================================================
// TIPOS: Motor de Flujos - Episodios de Atención
// GPMedical ERP Pro - Pipeline de Atención Médica
// =====================================================

// Estado del pipeline clínico
export type EstadoEpisodio =
  | 'registro'
  | 'triage'
  | 'evaluaciones'
  | 'laboratorio'
  | 'imagen'
  | 'audiometria'
  | 'espirometria'
  | 'dictamen'
  | 'cerrado';

// Tipo de evaluación ocupacional
export type TipoEvaluacion =
  | 'preempleo'
  | 'periodico'
  | 'retorno'
  | 'egreso'
  | 'reubicacion'
  | 'consulta';

// Tipos de bloqueos en el flujo
export type TipoBloqueo =
  | 'estudio_pendiente'
  | 'pago_requerido'
  | 'aprobacion_jefe'
  | 'documentacion_incompleta'
  | 'paciente_no_presente';

// Prioridades de atención
export type PrioridadAtencion = 'baja' | 'media' | 'alta' | 'urgente';

// Estado de paciente en cola
export type EstadoEnCola = 'esperando' | 'en_atencion' | 'pausado';

// =====================================================
// MÁQUINA DE ESTADOS - Transiciones permitidas
// =====================================================
export const TRANSICIONES_PERMITIDAS: Record<EstadoEpisodio, EstadoEpisodio[]> = {
  'registro': ['triage'],
  'triage': ['evaluaciones'],
  'evaluaciones': ['laboratorio', 'imagen', 'audiometria', 'espirometria', 'dictamen'],
  'laboratorio': ['dictamen', 'imagen', 'audiometria', 'espirometria'],
  'imagen': ['dictamen', 'laboratorio', 'audiometria', 'espirometria'],
  'audiometria': ['dictamen', 'laboratorio', 'imagen'],
  'espirometria': ['dictamen', 'laboratorio', 'imagen'],
  'dictamen': ['cerrado'],
  'cerrado': []
};

// Roles que pueden ejecutar cada transición
export const ROLES_POR_TRANSICION: Record<string, string[]> = {
  'registro->triage': ['recepcion', 'enfermera', 'super_admin'],
  'triage->evaluaciones': ['enfermera', 'medico', 'super_admin'],
  'evaluaciones->laboratorio': ['medico', 'super_admin'],
  'evaluaciones->imagen': ['medico', 'super_admin'],
  'evaluaciones->audiometria': ['medico', 'super_admin'],
  'evaluaciones->espirometria': ['medico', 'super_admin'],
  'evaluaciones->dictamen': ['medico', 'super_admin'],
  'laboratorio->dictamen': ['medico', 'super_admin'],
  'laboratorio->imagen': ['medico', 'super_admin'],
  'imagen->dictamen': ['medico', 'super_admin'],
  'imagen->laboratorio': ['medico', 'super_admin'],
  'audiometria->dictamen': ['medico', 'super_admin'],
  'espirometria->dictamen': ['medico', 'super_admin'],
  'dictamen->cerrado': ['medico', 'super_admin']
};

// SLA por tipo de evaluación (minutos)
export const SLA_POR_TIPO: Record<TipoEvaluacion, number> = {
  'preempleo': 90,
  'periodico': 60,
  'retorno': 45,
  'egreso': 60,
  'reubicacion': 45,
  'consulta': 30
};

// Colores por tipo de evaluación
export const COLORES_TIPO_EVALUACION: Record<TipoEvaluacion, { bg: string; text: string; border: string }> = {
  'preempleo': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'periodico': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'retorno': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'egreso': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'reubicacion': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'consulta': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
};

// Etiquetas por tipo
export const ETIQUETAS_TIPO_EVALUACION: Record<TipoEvaluacion, string> = {
  'preempleo': 'Preempleo',
  'periodico': 'Periódico',
  'retorno': 'Retorno',
  'egreso': 'Egreso',
  'reubicacion': 'Reubicación',
  'consulta': 'Consulta'
};

// =====================================================
// INTERFACES
// =====================================================

export interface TimelineEntry {
  id: string;
  estado: EstadoEpisodio;
  timestamp_inicio: string;
  timestamp_fin?: string;
  duracion_minutos?: number;
  usuario_id: string;
  usuario_nombre: string;
  rol: string;
  observaciones?: string;
}

export interface Checkpoint {
  area: string;
  check_in?: string;
  check_out?: string;
  atendido_por?: string;
}

export interface Bloqueo {
  id: string;
  tipo: TipoBloqueo;
  descripcion: string;
  resuelto: boolean;
  resuelto_por?: string;
  resuelto_en?: string;
  creado_en?: string;
}

export interface Asignacion {
  usuario_id: string;
  nombre: string;
  rol: string;
  asignado_en: string;
}

export interface NextBestAction {
  accion: string;
  descripcion: string;
  rol_responsable: string;
  prioridad: PrioridadAtencion;
  tiempo_estimado_minutos: number;
}

export interface EpisodioAtencion {
  id: string;
  empresa_id: string;
  sede_id: string;
  paciente_id: string;
  campana_id?: string;

  // Tipo de evaluación
  tipo: TipoEvaluacion;

  // Estado actual
  estado_actual: EstadoEpisodio;
  estados_completados: EstadoEpisodio[];

  // Timeline de transiciones
  timeline: TimelineEntry[];

  // SLA
  sla_minutos: number;
  sla_alerta_enviada: boolean;
  tiempo_total_minutos: number;

  // Asignaciones actuales
  asignado_a?: Asignacion;

  // Checkpoints físicos
  checkpoints: Checkpoint[];

  // Bloqueos
  bloqueos: Bloqueo[];

  // Next Best Action
  siguiente_accion?: NextBestAction;

  // Metadata
  created_at: string;
  updated_at: string;
  creado_por: string;

  // Relaciones
  paciente?: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    foto_url?: string;
    curp?: string;
    nss?: string;
  };

  empresa?: {
    id: string;
    nombre: string;
    logo_url?: string;
  };

  sede?: {
    id: string;
    nombre: string;
    direccion?: string;
  };
}

// =====================================================
// COLAS DE TRABAJO
// =====================================================

export type TipoCola =
  | 'recepcion'
  | 'triage'
  | 'consulta'
  | 'laboratorio'
  | 'imagen'
  | 'audiometria'
  | 'espirometria'
  | 'dictamen';

export interface PacienteEnCola {
  episodio_id: string;
  paciente: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    foto_url?: string;
    curp?: string;
  };
  prioridad: number; // 1-5
  tiempo_espera_minutos: number;
  estado: EstadoEnCola;
  asignado_a?: {
    usuario_id: string;
    nombre: string;
    avatar_url?: string;
  };
  tipo_evaluacion: TipoEvaluacion;
  empresa_nombre: string;
  estado_actual: EstadoEpisodio;
  sla_restante_minutos: number;
  alerta_sla: boolean;
}

export interface ColaTrabajo {
  sede_id: string;
  tipo: TipoCola;

  pacientes: PacienteEnCola[];

  estadisticas_hoy: {
    atendidos: number;
    en_espera: number;
    en_atencion: number;
    tiempo_promedio_espera: number;
    tiempo_promedio_atencion: number;
    alertas_sla: number;
  };
}

// =====================================================
// DTOs
// =====================================================

export interface CrearEpisodioDTO {
  paciente_id: string;
  empresa_id: string;
  sede_id: string;
  tipo: TipoEvaluacion;
  campana_id?: string;
  creado_por: string;
  prioridad?: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransicionEstadoDTO {
  usuario_id: string;
  usuario_nombre: string;
  rol: string;
  observaciones?: string;
}

export interface AgregarBloqueoDTO {
  tipo: TipoBloqueo;
  descripcion: string;
}

export interface ResolverBloqueoDTO {
  usuario_id: string;
}

// =====================================================
// FILTROS
// =====================================================

export interface FiltrosEpisodio {
  estado?: EstadoEpisodio;
  tipo?: TipoEvaluacion;
  fecha_desde?: string;
  fecha_hasta?: string;
  sede_id?: string;
  paciente_id?: string;
  medico_id?: string;
  prioridad?: number;
  sla_excedido?: boolean;
  con_bloqueos?: boolean;
}

// =====================================================
// STATS Y REPORTES
// =====================================================

export interface StatsPipeline {
  total_episodios_hoy: number;
  por_estado: Record<EstadoEpisodio, number>;
  tiempo_promedio_total: number;
  alertas_sla_activas: number;
  bloqueos_activos: number;
  eficiencia_pipeline: number; // Porcentaje
}

export interface AlertaSLA {
  episodio_id: string;
  paciente_nombre: string;
  estado_actual: EstadoEpisodio;
  tiempo_transcurrido: number;
  sla_minutos: number;
  tiempo_restante: number;
  prioridad: number;
}
