// =====================================================
// TIPOS: NOM-011 Conservación Auditiva - GPMedical ERP Pro
// =====================================================

// =====================================================
// ENUMERADOS
// =====================================================

export type TipoEstudioAudiometria = 'ingreso' | 'periodico' | 'cambio_area' | 'baja' | 'especial' | 'reevaluacion';
export type ResultadoAudiometria = 'normal' | 'observacion' | 'dano_reversible' | 'dano_irreversible' | 'no_concluyente';
export type SemaforoNom011 = 'verde' | 'amarillo' | 'rojo';
export type CategoriaRiesgoNom011 = 'I' | 'II' | 'III' | 'IV';
export type EstadoProgramaAuditivo = 'planificado' | 'activo' | 'en_proceso' | 'completado' | 'cerrado';
export type TipoProteccionAuditiva = 'tapones_oidos' | 'orejeras' | 'tapones_personalizados' | 'combinacion';
export type ZonaRuido = 'no_danina' | 'observacion' | 'dañina' | 'muy_danina';

// =====================================================
// INTERFAZ: Programa de Conservación Auditiva
// =====================================================

export interface ProgramaConservacionAuditiva {
  id: string;
  empresa_id: string;
  sede_id?: string;

  // Identificación
  anio: number;
  folio?: string;
  nombre_programa?: string;
  descripcion?: string;

  // Fechas
  fecha_inicio: string; // ISO date
  fecha_fin?: string;
  fecha_cierre_programa?: string;

  // Cobertura
  total_trabajadores_expuestos: number;
  trabajadores_evaluados: number;
  trabajadores_con_dano: number;

  // Estado
  estado: EstadoProgramaAuditivo;

  // Responsables
  responsable_medico_id?: string;
  responsable_medico_nombre?: string;
  responsable_empresa_id?: string;
  responsable_empresa_nombre?: string;

  // Documentos
  dictamen_tecnico_url?: string;
  informe_anual_url?: string;
  acta_cierre_url?: string;

  // Métricas
  porcentaje_cobertura?: number;
  porcentaje_epp_conforme?: number;
  promedio_nivel_exposicion_db?: number;

  // Relaciones
  estudios?: EstudioAudiometria[];
  areas_evaluadas?: AreaExposicionRuido[];
  epp_entregado?: EppAuditivoEntregado[];

  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Estudio de Audiometría
// =====================================================

export interface EstudioAudiometria {
  id: string;
  empresa_id: string;
  sede_id?: string;
  programa_id?: string;

  // Paciente
  paciente_id: string;
  paciente?: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    fecha_nacimiento?: string;
    sexo?: string;
    puesto_trabajo?: string;
    area_trabajo?: string;
  };

  expediente_id?: string;
  puesto_trabajo?: string;
  area_trabajo?: string;

  // Tipo de estudio
  tipo_estudio: TipoEstudioAudiometria;
  motivo_reevaluacion?: string;

  // Fechas
  fecha_estudio: string;
  hora_estudio?: string;
  tiempo_exposicion_ruido_horas?: number;

  // Resultado
  resultado?: ResultadoAudiometria;
  semaforo?: SemaforoNom011;

  // Oído Derecho - Umbrales en dB
  od_250hz?: number;
  od_500hz?: number;
  od_1000hz?: number;
  od_1500hz?: number;
  od_2000hz?: number;
  od_3000hz?: number;
  od_4000hz?: number;
  od_6000hz?: number;
  od_8000hz?: number;

  // Oído Izquierdo - Umbrales en dB
  oi_250hz?: number;
  oi_500hz?: number;
  oi_1000hz?: number;
  oi_1500hz?: number;
  oi_2000hz?: number;
  oi_3000hz?: number;
  oi_4000hz?: number;
  oi_6000hz?: number;
  oi_8000hz?: number;

  // Promedios NOM-011
  od_promedio_500_1000_2000?: number;
  oi_promedio_500_1000_2000?: number;
  od_promedio_3000_4000_6000?: number;
  oi_promedio_3000_4000_6000?: number;

  // Índices
  indice_michel_od?: number;
  indice_michel_oi?: number;
  indice_michel_promedio?: number;

  // Comparativa línea base
  tiene_linea_base: boolean;
  variacion_od_4000hz?: number;
  variacion_oi_4000hz?: number;
  variacion_significativa: boolean;

  // Categorización
  categoria_riesgo?: CategoriaRiesgoNom011;

  // Exposición
  nivel_exposicion_db?: number;
  tiempo_exposicion_diario_horas?: number;
  excede_limite_nom: boolean;

  // Interpretación
  interpretacion_tecnica?: string;
  retardo_auditivo_od: boolean;
  retardo_auditivo_oi: boolean;

  // Recomendaciones
  requiere_reevaluacion: boolean;
  tiempo_reevaluacion_meses?: number;
  requiere_proteccion: boolean;
  observaciones?: string;

  // Referencia estudio anterior
  estudio_anterior_id?: string;
  estudio_anterior?: EstudioAudiometria;

  // Equipo
  equipo_audiometro?: string;
  numero_serie?: string;
  ultima_calibracion?: string;
  proxima_calibracion?: string;

  // Personal
  tecnico_realiza_id?: string;
  tecnico_nombre?: string;
  medico_interpreta_id?: string;
  medico_nombre?: string;
  cedula_profesional?: string;

  // Estado
  estado: 'pendiente' | 'en_proceso' | 'completo' | 'invalidado';

  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: EPP Auditivo Entregado
// =====================================================

export interface EppAuditivoEntregado {
  id: string;
  empresa_id: string;
  paciente_id: string;
  programa_id?: string;

  // Paciente
  paciente?: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
  };

  // Tipo de protección
  tipo_proteccion: TipoProteccionAuditiva;
  marca?: string;
  modelo?: string;
  nrr_db?: number; // Nivel de Reducción de Ruido

  // Entrega
  fecha_entrega: string;
  cantidad: number;
  talla?: string;
  color?: string;

  // Instrucción
  instruccion_dada: boolean;
  fecha_instruccion?: string;
  entendimiento_verificado: boolean;

  // Reposición
  es_reposicion: boolean;
  motivo_reposicion?: string;
  epp_anterior_id?: string;

  // Control
  fecha_verificacion_uso?: string;
  conforme_uso?: boolean;
  observaciones_uso?: string;

  // Responsable
  responsable_entrega_id?: string;
  responsable_entrega_nombre?: string;

  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFAZ: Área de Exposición al Ruido
// =====================================================

export interface AreaExposicionRuido {
  id: string;
  empresa_id: string;
  sede_id?: string;
  programa_id?: string;

  nombre_area: string;
  descripcion?: string;

  // Mediciones
  nivel_ruido_db?: number;
  fecha_medicion?: string;
  tipo_medicion?: 'dosimetria' | 'integrador' | 'sonometro';
  cumple_nom011?: boolean;

  // Clasificación
  zona_ruido?: ZonaRuido;
  requiere_epp: boolean;

  // Trabajadores
  numero_trabajadores: number;
  puestos_afectados: string[];

  // Medidas
  medidas_ingenieria: string[];
  medidas_administrativas: string[];

  // Documentos
  foto_url?: string;
  plano_ubicacion?: string;

  created_at: string;
  updated_at: string;
}

// =====================================================
// DTOs PARA CREAR/ACTUALIZAR
// =====================================================

export interface CreateProgramaAuditivoDTO {
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

export interface UpdateProgramaAuditivoDTO {
  nombre_programa?: string;
  descripcion?: string;
  fecha_fin?: string;
  fecha_cierre_programa?: string;
  estado?: EstadoProgramaAuditivo;
  responsable_medico_id?: string;
  responsable_empresa_id?: string;
  dictamen_tecnico_url?: string;
  informe_anual_url?: string;
  acta_cierre_url?: string;
}

export interface CreateAudiometriaDTO {
  empresa_id: string;
  sede_id?: string;
  programa_id?: string;
  paciente_id: string;
  expediente_id?: string;
  puesto_trabajo?: string;
  area_trabajo?: string;
  tipo_estudio: TipoEstudioAudiometria;
  motivo_reevaluacion?: string;
  fecha_estudio: string;
  hora_estudio?: string;
  tiempo_exposicion_ruido_horas?: number;

  // Umbrales OD
  od_250hz?: number;
  od_500hz: number;
  od_1000hz: number;
  od_1500hz?: number;
  od_2000hz: number;
  od_3000hz?: number;
  od_4000hz: number;
  od_6000hz?: number;
  od_8000hz?: number;

  // Umbrales OI
  oi_250hz?: number;
  oi_500hz: number;
  oi_1000hz: number;
  oi_1500hz?: number;
  oi_2000hz: number;
  oi_3000hz?: number;
  oi_4000hz: number;
  oi_6000hz?: number;
  oi_8000hz?: number;

  // Exposición
  nivel_exposicion_db?: number;
  tiempo_exposicion_diario_horas?: number;

  // Equipo
  equipo_audiometro?: string;
  numero_serie?: string;
  ultima_calibracion?: string;
  proxima_calibracion?: string;

  // Personal
  tecnico_realiza_id?: string;
  medico_interpreta_id?: string;
  cedula_profesional?: string;

  // Observaciones
  observaciones?: string;
  estudio_anterior_id?: string;
}

export interface UpdateAudiometriaDTO {
  puesto_trabajo?: string;
  area_trabajo?: string;
  tipo_estudio?: TipoEstudioAudiometria;
  observaciones?: string;
  estado?: 'pendiente' | 'en_proceso' | 'completo' | 'invalidado';
}

export interface CreateEppAuditivoDTO {
  empresa_id: string;
  paciente_id: string;
  programa_id?: string;
  tipo_proteccion: TipoProteccionAuditiva;
  marca?: string;
  modelo?: string;
  nrr_db?: number;
  fecha_entrega: string;
  cantidad?: number;
  talla?: string;
  color?: string;
  instruccion_dada?: boolean;
  fecha_instruccion?: string;
  entendimiento_verificado?: boolean;
  es_reposicion?: boolean;
  motivo_reposicion?: string;
  epp_anterior_id?: string;
  responsable_entrega_id?: string;
}

// =====================================================
// INTERFAZ: Reporte Anual NOM-011
// =====================================================

export interface ReporteAnualNom011 {
  anio: number;
  empresa_id: string;

  // Resumen
  total_trabajadores_expuestos: number;
  total_evaluados: number;
  porcentaje_cobertura: number;

  // Por categoría
  por_categoria: {
    I: number;
    II: number;
    III: number;
    IV: number;
  };

  // Por semáforo
  por_semaforo: {
    verde: number;
    amarillo: number;
    rojo: number;
  };

  // EPP
  total_epp_entregado: number;
  porcentaje_uso_conforme: number;

  // Áreas
  areas_evaluadas: number;
  areas_requieren_intervencion: number;

  // Comparativa año anterior
  comparativa_anterior?: {
    nuevos_casos_dano: number;
    tendencia: 'mejora' | 'estable' | 'deterioro';
  };
}

// =====================================================
// CONSTANTES
// =====================================================

// =====================================================
// INTERFACE: Resumen Programa NOM-011 (Para Dashboard)
// =====================================================

export interface ResumenProgramaNOM011 {
  anio: number;
  trabajadores_expuestos: number;
  trabajadores_estudiados: number;
  porcentaje_avance: number;
  semaforos: {
    verde: number;
    amarillo: number;
    rojo: number;
  };
  epp: {
    entregado: number;
    capacitado: number;
  };
  capacitaciones: {
    programadas: number;
    realizadas: number;
  };
  estudios_por_mes: { mes: string; cantidad: number }[];
}

// =====================================================
// INTERFACE: Trabajador Expuesto (Para Seguimiento)
// =====================================================

export interface TrabajadorExpuesto {
  id: string;
  paciente_id: string;
  empresa_id: string;
  programa_id?: string;
  puesto?: string;
  area?: string;
  nivel_exposicion_db?: number;
  tiempo_exposicion_horas?: number;
  epp_entregado: boolean;
  fecha_entrega_epp?: string;
  tipo_epp?: string;
  audiometria_base_completada: boolean;
  fecha_audiometria_base?: string;
  audiometria_anual_completada: boolean;
  fecha_audiometria_anual?: string;
  semaforo_actual: SemaforoNom011;
  paciente?: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
  };
  created_at: string;
  updated_at: string;
}

export const TIPO_ESTUDIO_AUDIOMETRIA_LABELS: Record<TipoEstudioAudiometria, string> = {
  ingreso: 'Audiometría de Ingreso',
  periodico: 'Audiometría Periódica',
  cambio_area: 'Por Cambio de Área',
  baja: 'Audiometría de Egreso',
  especial: 'Evaluación Especial',
  reevaluacion: 'Reevaluación'
};

export const RESULTADO_AUDIOMETRIA_LABELS: Record<ResultadoAudiometria, string> = {
  normal: 'Normal',
  observacion: 'Observación',
  dano_reversible: 'Daño Reversible',
  dano_irreversible: 'Daño Irreversible',
  no_concluyente: 'No Concluyente'
};

export const SEMAFORO_COLORS: Record<SemaforoNom011, string> = {
  verde: 'bg-green-500',
  amarillo: 'bg-yellow-500',
  rojo: 'bg-red-500'
};

export const SEMAFORO_LABELS: Record<SemaforoNom011, string> = {
  verde: 'Sin alteración',
  amarillo: 'Observación',
  rojo: 'Daño auditivo'
};

export const CATEGORIA_RIESGO_LABELS: Record<CategoriaRiesgoNom011, string> = {
  I: 'Audición Normal',
  II: 'Observación',
  III: 'Daño Auditivo',
  IV: 'Daño Significativo'
};

export const TIPO_PROTECCION_LABELS: Record<TipoProteccionAuditiva, string> = {
  tapones_oidos: 'Tapones de Oídos (Desechables)',
  orejeras: 'Orejeras',
  tapones_personalizados: 'Tapones Personalizados',
  combinacion: 'Combinación (Tapones + Orejeras)'
};

export const ZONA_RUIDO_LABELS: Record<ZonaRuido, string> = {
  no_danina: 'No Dañina (<80 dB)',
  observacion: 'Observación (80-85 dB)',
  dañina: 'Dañina (>85 dB)',
  muy_danina: 'Muy Dañina (>95 dB)'
};

// Frecuencias estándar para audiometría
export const FRECUENCIAS_AUDIOMETRIA = [
  { value: 250, label: '250 Hz', required: false },
  { value: 500, label: '500 Hz', required: true },
  { value: 1000, label: '1000 Hz', required: true },
  { value: 1500, label: '1500 Hz', required: false },
  { value: 2000, label: '2000 Hz', required: true },
  { value: 3000, label: '3000 Hz', required: false },
  { value: 4000, label: '4000 Hz', required: true },
  { value: 6000, label: '6000 Hz', required: false },
  { value: 8000, label: '8000 Hz', required: false }
];
