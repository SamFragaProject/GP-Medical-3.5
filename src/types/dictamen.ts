// =====================================================
// TIPOS: Dictámenes Médico-Laborales - GPMedical ERP Pro
// =====================================================

// Tipos enumerados
export type TipoEvaluacionDictamen = 'ingreso' | 'periodico' | 'retorno' | 'egreso' | 'reubicacion';
export type ResultadoDictamen = 'apto' | 'apto_restricciones' | 'no_apto_temporal' | 'no_apto';
export type EstadoDictamen = 'borrador' | 'pendiente' | 'completado' | 'anulado' | 'vencido';
export type TipoCambioVersion = 'correccion' | 'actualizacion' | 'revision' | 'anulacion';
export type TipoRestriccion = 'fisica' | 'quimica' | 'biologica' | 'psicosocial' | 'ambiental';
export type SeveridadBloqueo = 'baja' | 'media' | 'alta' | 'critica';

// =====================================================
// INTERFAZ: Restricción Médica del Catálogo
// =====================================================

export interface RestriccionMedicaCatalogo {
  id: string;
  codigo: string;
  descripcion: string;
  descripcion_corta: string;
  tipo_restriccion: TipoRestriccion;
  puestos_aplicables: string[];
  riesgos_relacionados: string[];
  duracion_default_dias?: number;
  requiere_revision: boolean;
  prioridad: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Dictamen Médico Principal
// =====================================================

export interface DictamenMedico {
  id: string;
  folio: string;
  
  // Relaciones
  empresa_id: string;
  sede_id?: string;
  paciente_id: string;
  expediente_id?: string;
  
  // Información del paciente (denormalizado para el dictamen)
  paciente?: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    edad?: number;
    sexo?: string;
    puesto_trabajo?: string;
    area_trabajo?: string;
  };
  
  // Tipo y contexto
  tipo_evaluacion: TipoEvaluacionDictamen;
  motivo_evaluacion?: string;
  
  // Resultado
  resultado: ResultadoDictamen;
  resultado_detalle?: string;
  
  // Restricciones
  restricciones: RestriccionDictamen[];
  restricciones_otras?: string;
  
  // Recomendaciones
  recomendaciones_medicas: string[];
  recomendaciones_epp: string[];
  recomendaciones_adicionales?: string;
  
  // Vigencia
  vigencia_inicio: string; // ISO date
  vigencia_fin?: string; // ISO date
  duracion_dias?: number;
  
  // Médico responsable
  medico_responsable_id?: string;
  medico_nombre?: string;
  cedula_profesional?: string;
  especialidad_medico?: string;
  firma_digital_url?: string;
  
  // Validación
  estudios_requeridos_completos: boolean;
  estudios_faltantes: string[];
  bloqueos_pendientes: BloqueoPendiente[];
  
  // Control de versiones
  estado: EstadoDictamen;
  version: number;
  es_version_final: boolean;
  
  // Motivo de no aptitud
  motivo_no_apto?: string;
  cie10_no_apto?: string;
  
  // Auditoría
  created_by?: string;
  updated_by?: string;
  cerrado_por?: string;
  fecha_cierre?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Restricción en Dictamen
// =====================================================

export interface RestriccionDictamen {
  codigo: string;
  descripcion: string;
  tipo: TipoRestriccion;
  vigencia_inicio?: string;
  vigencia_fin?: string;
  observaciones?: string;
}

// =====================================================
// INTERFAZ: Bloqueo Pendiente
// =====================================================

export interface BloqueoPendiente {
  tipo: string;
  mensaje: string;
  severidad: SeveridadBloqueo;
}

// =====================================================
// INTERFAZ: Versión de Dictamen (Auditoría)
// =====================================================

export interface VersionDictamen {
  id: string;
  dictamen_id: string;
  version: number;
  datos_json: DictamenMedico;
  cambios_realizados: CambiosVersion;
  tipo_cambio: TipoCambioVersion;
  motivo_cambio?: string;
  usuario_id?: string;
  usuario_nombre?: string;
  created_at: string;
}

export interface CambiosVersion {
  estado_anterior?: EstadoDictamen;
  estado_nuevo?: EstadoDictamen;
  resultado_anterior?: ResultadoDictamen;
  resultado_nuevo?: ResultadoDictamen;
  restricciones_anterior?: RestriccionDictamen[];
  restricciones_nuevo?: RestriccionDictamen[];
  [key: string]: any;
}

// =====================================================
// INTERFAZ: Estudio Requerido para Dictamen
// =====================================================

export interface DictamenEstudioRequerido {
  id: string;
  dictamen_id: string;
  tipo_estudio: TipoEstudioRequerido;
  subtipo?: string;
  descripcion?: string;
  obligatorio: boolean;
  completado: boolean;
  estudio_id?: string;
  resultado_semaforo?: 'verde' | 'amarillo' | 'rojo';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export type TipoEstudioRequerido = 
  | 'audiometria' 
  | 'espirometria' 
  | 'laboratorio' 
  | 'rx' 
  | 'vision' 
  | 'ecg' 
  | 'otros';

// =====================================================
// DTOs PARA CREAR/ACTUALIZAR
// =====================================================

export interface CreateDictamenDTO {
  empresa_id: string;
  sede_id?: string;
  paciente_id: string;
  expediente_id?: string;
  tipo_evaluacion: TipoEvaluacionDictamen;
  motivo_evaluacion?: string;
  resultado: ResultadoDictamen;
  resultado_detalle?: string;
  restricciones?: RestriccionDictamen[];
  restricciones_otras?: string;
  recomendaciones_medicas?: string[];
  recomendaciones_epp?: string[];
  recomendaciones_adicionales?: string;
  vigencia_inicio: string;
  vigencia_fin?: string;
  medico_responsable_id?: string;
  medico_nombre?: string;
  cedula_profesional?: string;
  especialidad_medico?: string;
}

export interface UpdateDictamenDTO {
  resultado?: ResultadoDictamen;
  resultado_detalle?: string;
  restricciones?: RestriccionDictamen[];
  restricciones_otras?: string;
  recomendaciones_medicas?: string[];
  recomendaciones_epp?: string[];
  recomendaciones_adicionales?: string;
  vigencia_inicio?: string;
  vigencia_fin?: string;
  medico_responsable_id?: string;
  medico_nombre?: string;
  cedula_profesional?: string;
  especialidad_medico?: string;
  firma_digital_url?: string;
  estado?: EstadoDictamen;
  motivo_no_apto?: string;
  cie10_no_apto?: string;
}

// =====================================================
// INTERFAZ: Validación de Dictamen
// =====================================================

export interface ValidacionDictamen {
  valido: boolean;
  estudios_faltantes: number;
  bloqueos: BloqueoPendiente[];
  puede_forzar: boolean;
  error?: string;
}

// =====================================================
// INTERFAZ: Resumen de Dictámenes (para dashboards)
// =====================================================

export interface ResumenDictamenes {
  total: number;
  por_tipo: Record<TipoEvaluacionDictamen, number>;
  por_resultado: Record<ResultadoDictamen, number>;
  por_estado: Record<EstadoDictamen, number>;
  vencidos_30_dias: number;
  proximos_vencer: number;
}

// =====================================================
// CONSTANTES
// =====================================================

export const TIPO_EVALUACION_LABELS: Record<TipoEvaluacionDictamen, string> = {
  ingreso: 'Pre-empleo / Ingreso',
  periodico: 'Examen Periódico',
  retorno: 'Retorno a Trabajo',
  egreso: 'Egreso / Término',
  reubicacion: 'Reubicación Laboral'
};

export const RESULTADO_LABELS: Record<ResultadoDictamen, string> = {
  apto: 'APTO',
  apto_restricciones: 'APTO CON RESTRICCIONES',
  no_apto_temporal: 'NO APTO TEMPORALMENTE',
  no_apto: 'NO APTO'
};

export const RESULTADO_COLORS: Record<ResultadoDictamen, string> = {
  apto: 'bg-green-500',
  apto_restricciones: 'bg-yellow-500',
  no_apto_temporal: 'bg-orange-500',
  no_apto: 'bg-red-500'
};

export const ESTADO_LABELS: Record<EstadoDictamen, string> = {
  borrador: 'Borrador',
  pendiente: 'Pendiente',
  completado: 'Completado',
  anulado: 'Anulado',
  vencido: 'Vencido'
};

export const TIPO_RESTRICCION_LABELS: Record<TipoRestriccion, string> = {
  fisica: 'Física',
  quimica: 'Química',
  biologica: 'Biológica',
  psicosocial: 'Psicosocial',
  ambiental: 'Ambiental'
};
