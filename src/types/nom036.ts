// =====================================================
// TIPOS: NOM-036 Ergonomía - GPMedical ERP Pro
// =====================================================

// =====================================================
// ENUMERADOS
// =====================================================

export type MetodoEvaluacionErgonomica = 'REBA' | 'RUEDA' | 'OWAS' | 'NIOSH' | 'OSHA' | 'MANUAL';
export type NivelRiesgoErgonomico = 'aceptable' | 'medio' | 'alto' | 'muy_alto';
export type NivelRiesgoREBA = 'negligible' | 'bajo' | 'medio' | 'alto' | 'muy_alto';
export type EstadoProgramaErgonomia = 'planificado' | 'activo' | 'en_proceso' | 'completado' | 'cerrado';
export type EstadoEvaluacionErgonomica = 'pendiente' | 'en_proceso' | 'completado' | 'con_seguimiento' | 'cerrado';
export type EstadoCapacitacionErgonomia = 'programada' | 'completada' | 'cancelada' | 'reprogramada';
export type PrioridadIntervencion = 'baja' | 'media' | 'alta' | 'urgente';
export type CategoriaFactorRiesgo = 'fisico' | 'cognitivo' | 'organizacional' | 'psicosocial';
export type EstadoMatrizRiesgo = 'identificado' | 'en_control' | 'controlado' | 'seguimiento';

// Tipos específicos NIOSH
export type NivelRiesgoNIOSH = 'aceptable' | 'mejora' | 'pronto' | 'ahora';
export type InterpretacionNIOSH = 'sin_riesgo' | 'con_riesgo' | 'excesivo';

// =====================================================
// INTERFAZ: Programa de Ergonomía
// =====================================================

export interface ProgramaErgonomia {
  id: string;
  empresa_id: string;
  sede_id?: string;

  // Identificación
  anio: number;
  nombre_programa?: string;
  descripcion?: string;

  // Fechas
  fecha_inicio: string;
  fecha_fin?: string;
  fecha_cierre?: string;

  // Cobertura
  total_puestos_evaluados: number;
  total_trabajadores_capacitados: number;
  total_riesgos_identificados: number;
  total_medidas_implementadas: number;

  // Estado
  estado: EstadoProgramaErgonomia;

  // Responsables
  responsable_medico_id?: string;
  responsable_medico_nombre?: string;
  responsable_empresa_id?: string;
  responsable_empresa_nombre?: string;

  // Documentos
  diagnostico_ergonomico_url?: string;
  programa_trabajo_url?: string;
  informe_anual_url?: string;

  // Relaciones
  evaluaciones?: EvaluacionErgonomica[];
  capacitaciones?: CapacitacionErgonomia[];

  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Evaluación Ergonómica
// =====================================================

export interface EvaluacionErgonomica {
  id: string;
  empresa_id: string;
  sede_id?: string;
  programa_id?: string;

  // Paciente/Trabajador
  paciente_id?: string;
  paciente?: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    puesto_trabajo?: string;
    area_trabajo?: string;
  };

  // Puesto
  puesto_trabajo: string;
  area_trabajo?: string;
  descripcion_tarea?: string;

  // Evaluación
  metodo_evaluacion: MetodoEvaluacionErgonomica;
  fecha_evaluacion: string;
  duracion_evaluacion_minutos?: number;

  // Resultado
  puntuacion_total?: number;
  nivel_riesgo?: NivelRiesgoErgonomico;
  color_riesgo?: string;

  // Factores
  factores_riesgo: string[];
  recomendaciones: string[];
  medidas_control: string[];

  // Datos específicos del método
  datos_raw: DatosEvaluacionErgonomica;

  // Interpretación
  interpretacion_resultado?: string;
  requiere_intervencion: boolean;
  prioridad_intervencion?: PrioridadIntervencion;

  // Seguimiento
  fecha_seguimiento?: string;
  resultado_seguimiento?: string;

  // Multimedia
  fotos_antes: FotoEvaluacion[];
  fotos_despues: FotoEvaluacion[];
  video_evaluacion_url?: string;

  // Evaluador
  evaluador_id?: string;
  evaluador_nombre?: string;

  // Estado
  estado: EstadoEvaluacionErgonomica;

  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FotoEvaluacion {
  url: string;
  descripcion?: string;
  fecha?: string;
}

// =====================================================
// TIPOS DE DATOS ESPECÍFICOS POR MÉTODO
// =====================================================

export type DatosEvaluacionErgonomica =
  | DatosREBA
  | DatosNIOSH
  | DatosOWAS
  | DatosGenericos;

export interface DatosREBA {
  // Grupo A: Cuello, Tronco, Piernas
  cuello: number; // 1-3
  cuello_extension?: boolean;
  tronco: number; // 1-5
  tronco_torsion?: boolean;
  tronco_lateral?: boolean;
  piernas: number; // 1-4
  piernas_alternas?: boolean;

  // Grupo B: Brazos, Antebrazos, Muñecas
  brazo: number; // 1-6
  brazo_hombro_elevado?: boolean;
  brazo_abduccion?: boolean;
  brazo_apoyo?: boolean;
  antebrazo: number; // 1-2
  muneca: number; // 1-3
  muneca_desviacion?: boolean;

  // Factores de corrección
  carga: number; // 0-3
  agarre: number; // 0-3
  actividad: number; // 0-3
}

export interface DatosNIOSH {
  peso_carga: number; // kg
  distancia_horizontal: number; // cm (distancia entre manos y punto medio tobillos)
  altura_origen: number; // cm (altura del objeto al inicio del levantamiento)
  recorrido_vertical: number; // cm (diferencia entre altura destino y origen)
  frecuencia: number; // levantamientos por minuto
  angulo_asimetria: number; // grados de rotación del tronco
  duracion_tarea: 'corta' | 'media' | 'larga'; // <1h, 1-8h, >8h
  agarre: 'bueno' | 'regular' | 'malo'; // 1.0, 0.95, 0.9
}

export interface DatosOWAS {
  espalda: number; // 1-4: 1=recta, 2=flexionada, 3=rotada/torcida, 4=flex_y_rot
  brazos: number; // 1-3: 1=abajo, 2=ambos_arriba, 3=uno_arriba
  piernas: number; // 1-7: 1=sentado, 2=parado_dos_pies, 3=una_pierna, etc
  carga: number; // 1-3: 1=<10kg, 2=10-20kg, 3=>20kg o sorpresa
}

export interface DatosGenericos {
  [key: string]: any;
}

// =====================================================
// INTERFAZ: Capacitación en Ergonomía
// =====================================================

export interface CapacitacionErgonomia {
  id: string;
  empresa_id: string;
  programa_id?: string;

  // Información
  tema: string;
  descripcion?: string;
  tipo_capacitacion?: 'induccion' | 'reentrenamiento' | 'especifica' | 'charla';

  // Fecha
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_horas?: number;

  // Lugar
  sede_id?: string;
  sede_nombre?: string;
  lugar?: string;

  // Instructor
  instructor_id?: string;
  instructor_nombre?: string;
  instructor_externo?: string;

  // Participantes
  numero_participantes: number;
  participantes_ids: string[];
  areas_participantes: string[];

  // Evaluación
  material_entregado: boolean;
  evaluacion_efectividad: boolean;
  calificacion_promedio?: number;

  // Documentos
  lista_asistencia_url?: string;
  material_capacitacion_url?: string;
  evidencia_fotografica: FotoEvaluacion[];

  // Estado
  estado: EstadoCapacitacionErgonomia;
  observaciones?: string;

  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Factor de Riesgo Ergonómico (Catálogo)
// =====================================================

export interface FactorRiesgoErgonomico {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaFactorRiesgo;
  subcategoria?: string;

  // Características
  sintomas_asociados: string[];
  enfermedades_asociadas: string[];
  medidas_preventivas: string[];

  // Evaluación
  metodo_evaluacion_recomendado?: MetodoEvaluacionErgonomica;
  umbral_riesgo_bajo?: number;
  umbral_riesgo_medio?: number;
  umbral_riesgo_alto?: number;

  // NOM-036
  requiere_atencion_nom036: boolean;
  prioridad_nom036: number;

  activo: boolean;
  created_at: string;
}

// =====================================================
// INTERFAZ: Resultado de Cálculo Ergonómico
// =====================================================

export interface ResultadoCalculoErgonomico {
  nivel_riesgo: NivelRiesgoErgonomico;
  color: string;
  accion_recomendada: string;
  puntuacion?: number;
  puntuacion_detalle?: Record<string, number>;
}

export interface ResultadoREBA extends ResultadoCalculoErgonomico {
  score_a: number;
  score_b: number;
  score_c: number;
  cuello: number;
  tronco: number;
  piernas: number;
  brazo: number;
  antebrazo: number;
  muneca: number;
  carga: number;
  agarre: number;
  actividad: number;
}

export interface ResultadoNIOSH extends ResultadoCalculoErgonomico {
  rwl: number; // Recommended Weight Limit
  li: number;  // Lifting Index
  peso_carga: number;
  distancia_horizontal: number;
  altura_origen: number;
  recorrido_vertical: number;
  frecuencia: number;
  angulo_asimetria: number;
  agarre: number;
}

export interface ResultadoOWAS extends ResultadoCalculoErgonomico {
  score: number;
  categoria_accion: string;
  espalda: number;
  brazos: number;
  piernas: number;
  carga: number;
}

// =====================================================
// INTERFAZ: Matriz de Riesgos por Área
// =====================================================

export interface MatrizRiesgoArea {
  area: string;
  puesto: string;
  numero_trabajadores: number;

  // Evaluaciones
  evaluaciones_reba?: ResultadoREBA[];
  evaluaciones_niosh?: ResultadoNIOSH[];
  evaluaciones_owas?: ResultadoOWAS[];

  // Agregado
  riesgo_promedio: NivelRiesgoErgonomico;
  riesgo_maximo: NivelRiesgoErgonomico;
  factores_identificados: string[];

  // Medidas
  medidas_implementadas: number;
  medidas_pendientes: number;
}

export interface MatrizRiesgoErgonomico {
  id: string;
  empresa_id: string;
  area: string;
  puesto: string;
  numero_trabajadores: number;
  riesgos: { tipo: string; descripcion: string; severidad: string }[];
  evaluacion_reba?: number;
  evaluacion_niosh?: number;
  nivel_riesgo: NivelRiesgoREBA;
  medidas_preventivas: string[];
  medidas_correctivas?: string[];
  estado: EstadoMatrizRiesgo;
  trabajadores?: { id: string; nombre: string; puesto: string }[];
  fecha_evaluacion: string;
  fecha_proxima_evaluacion?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Reporte NOM-036
// =====================================================

export interface ReporteNOM036 {
  anio: number;
  empresa_id: string;

  // Resumen programa
  programa_activo: boolean;
  fecha_inicio_programa?: string;

  // Evaluaciones
  total_evaluaciones: number;
  por_metodo: Record<MetodoEvaluacionErgonomica, number>;

  // Por nivel de riesgo
  por_nivel_riesgo: {
    aceptable: number;
    medio: number;
    alto: number;
    muy_alto: number;
  };

  // Factores más frecuentes
  factores_frecuentes: { factor: string; frecuencia: number }[];

  // Capacitaciones
  total_capacitaciones: number;
  trabajadores_capacitados: number;
  horas_capacitacion: number;

  // Intervenciones
  intervenciones_pendientes: number;
  intervenciones_completadas: number;

  // Indicadores
  porcentaje_avance: number;
  tendencia_vs_anio_anterior?: 'mejora' | 'estable' | 'deterioro';
}

// =====================================================
// DTOs PARA CREAR/ACTUALIZAR
// =====================================================

export interface CreateProgramaErgonomiaDTO {
  empresa_id: string;
  sede_id?: string;
  anio: number;
  nombre_programa?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  responsable_medico_id?: string;
  responsable_empresa_id?: string;
}

export interface UpdateProgramaErgonomiaDTO {
  nombre_programa?: string;
  descripcion?: string;
  fecha_fin?: string;
  fecha_cierre?: string;
  estado?: EstadoProgramaErgonomia;
  responsable_medico_id?: string;
  responsable_empresa_id?: string;
  diagnostico_ergonomico_url?: string;
  programa_trabajo_url?: string;
  informe_anual_url?: string;
}

export interface CreateEvaluacionErgonomicaDTO {
  empresa_id: string;
  sede_id?: string;
  programa_id?: string;
  paciente_id?: string;
  puesto_trabajo: string;
  area_trabajo?: string;
  descripcion_tarea?: string;
  metodo_evaluacion: MetodoEvaluacionErgonomica;
  fecha_evaluacion: string;
  duracion_evaluacion_minutos?: number;
  datos_raw: DatosEvaluacionErgonomica;
  factores_riesgo?: string[];
  recomendaciones?: string[];
  medidas_control?: string[];
  evaluador_id?: string;
  fotos_antes?: FotoEvaluacion[];
  video_evaluacion_url?: string;
}

export interface UpdateEvaluacionErgonomicaDTO {
  puesto_trabajo?: string;
  area_trabajo?: string;
  descripcion_tarea?: string;
  factores_riesgo?: string[];
  recomendaciones?: string[];
  medidas_control?: string[];
  interpretacion_resultado?: string;
  fecha_seguimiento?: string;
  resultado_seguimiento?: string;
  fotos_despues?: FotoEvaluacion[];
  estado?: EstadoEvaluacionErgonomica;
}

export interface CreateCapacitacionErgonomiaDTO {
  empresa_id: string;
  programa_id?: string;
  tema: string;
  descripcion?: string;
  tipo_capacitacion?: 'induccion' | 'reentrenamiento' | 'especifica' | 'charla';
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_horas?: number;
  sede_id?: string;
  lugar?: string;
  instructor_id?: string;
  instructor_externo?: string;
  participantes_ids?: string[];
  areas_participantes?: string[];
}

// =====================================================
// CONSTANTES
// =====================================================

export const METODO_EVALUACION_LABELS: Record<MetodoEvaluacionErgonomica, string> = {
  REBA: 'REBA (Rapid Entire Body Assessment)',
  RUEDA: 'RUEDA (Evaluación de Cargas)',
  OWAS: 'OWAS (Ovako Working Posture Analysis)',
  NIOSH: 'NIOSH Lifting Equation',
  OSHA: 'OSHA Checklist',
  MANUAL: 'Evaluación Manual'
};

export const NIVEL_RIESGO_LABELS: Record<NivelRiesgoErgonomico, string> = {
  aceptable: 'Aceptable',
  medio: 'Medio',
  alto: 'Alto',
  muy_alto: 'Muy Alto'
};

export const NIVEL_RIESGO_COLORS: Record<NivelRiesgoErgonomico, string> = {
  aceptable: 'bg-green-500',
  medio: 'bg-yellow-500',
  alto: 'bg-orange-500',
  muy_alto: 'bg-red-500'
};

export const NIVEL_RIESGO_ACCIONES: Record<NivelRiesgoErgonomico, string> = {
  aceptable: 'No se requiere acción',
  medio: 'Se requiere investigación y cambios próximamente',
  alto: 'Se requiere investigación y cambios pronto',
  muy_alto: 'Se requiere implementar cambios inmediatamente'
};

export const CATEGORIA_FACTOR_LABELS: Record<CategoriaFactorRiesgo, string> = {
  fisico: 'Físico',
  cognitivo: 'Cognitivo',
  organizacional: 'Organizacional',
  psicosocial: 'Psicosocial'
};

export const PRIORIDAD_LABELS: Record<PrioridadIntervencion, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente'
};

// Factores de riesgo comúnmente identificados
export const FACTORES_RIESGO_COMUNES = [
  'postura_forzada',
  'movimientos_repetitivos',
  'manejo_cargas',
  'iluminacion_inadecuada',
  'temperatura_extrema',
  'vibracion',
  'ritmo_excesivo',
  'pausas_insuficientes',
  'monotonia',
  'sobreesfuerzo',
  'posicion_prolongada',
  'contacto_presion',
  'espacio_insuficiente'
];

export const FACTORES_RIESGO_LABELS: Record<string, string> = {
  postura_forzada: 'Postura forzada',
  movimientos_repetitivos: 'Movimientos repetitivos',
  manejo_cargas: 'Manejo manual de cargas',
  iluminacion_inadecuada: 'Iluminación inadecuada',
  temperatura_extrema: 'Temperatura extrema',
  vibracion: 'Vibración',
  ritmo_excesivo: 'Ritmo de trabajo excesivo',
  pausas_insuficientes: 'Pausas insuficientes',
  monotonia: 'Monotonía del trabajo',
  sobreesfuerzo: 'Sobreesfuerzo',
  posicion_prolongada: 'Posición prolongada',
  contacto_presion: 'Contacto por presión',
  espacio_insuficiente: 'Espacio de trabajo insuficiente'
};

// =====================================================
// REBA TABLES & TEXTS
// =====================================================

export const NivelRiesgoREBATexto: Record<NivelRiesgoREBA, { texto: string; accion: string; color: string }> = {
  negligible: { texto: 'Insignificante', accion: 'No es necesaria acción', color: '#22c55e' },
  bajo: { texto: 'Bajo', accion: 'Puede ser necesaria acción', color: '#84cc16' },
  medio: { texto: 'Medio', accion: 'Es necesaria la acción', color: '#eab308' },
  alto: { texto: 'Alto', accion: 'Es necesaria la acción pronto', color: '#f97316' },
  muy_alto: { texto: 'Muy Alto', accion: 'Es necesaria la acción de inmediato', color: '#ef4444' }
};

export const TablaA_REBA: number[][] = [
  [1, 2, 3, 4], [2, 3, 4, 5], [2, 4, 5, 6], [3, 5, 6, 7], [4, 6, 7, 8],
  [1, 2, 3, 4], [3, 4, 5, 6], [4, 5, 6, 7], [5, 7, 8, 9], [6, 8, 9, 9],
  [3, 3, 4, 5], [4, 5, 6, 7], [5, 6, 7, 8], [6, 7, 8, 9], [7, 9, 9, 9]
];

export const TablaB_REBA: number[][] = [
  [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7], [7, 8, 9],
  [2, 2, 3], [3, 3, 4], [4, 4, 5], [5, 5, 6], [6, 6, 7], [7, 7, 8],
];

export const TablaC_REBA: number[][] = [
  [1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 7, 7],
  [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 7, 8],
  [2, 3, 3, 3, 4, 5, 6, 7, 7, 8, 8, 8],
  [3, 4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9],
  [4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9],
  [6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 10, 10],
  [7, 7, 7, 8, 9, 9, 9, 10, 10, 11, 11, 11],
  [8, 8, 8, 9, 10, 10, 10, 10, 11, 11, 11, 12],
  [9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12],
  [10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12],
  [11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12],
  [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]
];

export const NivelRiesgoNIOSHTexto: Record<NivelRiesgoNIOSH, { texto: string; descripcion: string; color: string }> = {
  aceptable: { texto: 'Aceptable', descripcion: 'El riesgo se considera mínimo o inexistente.', color: '#22c55e' },
  mejora: { texto: 'Requiere Mejora', descripcion: 'Algunas tareas pueden requerir rediseño.', color: '#84cc16' },
  pronto: { texto: 'Mejora Pronto', descripcion: 'Es necesario aplicar cambios estructurales en el corto plazo.', color: '#f97316' },
  ahora: { texto: 'Mejora Inmediata', descripcion: 'Riesgo excesivo. Implementar cambios de inmediato.', color: '#ef4444' }
};
