// =====================================================
// TIPOS: Expediente Clínico Electrónico - GPMedical ERP Pro
// =====================================================

export interface ExpedienteClinico {
  id: string;
  paciente_id: string;
  empresa_id: string;
  sede_id?: string;
  
  fecha_apertura: string;
  fecha_cierre?: string;
  estado: 'activo' | 'cerrado' | 'archivado';
  
  // Campos clínicos resumen
  alergias?: string;
  tipo_sangre?: string;
  
  // Relaciones
  paciente?: PacienteInfo;
  empresa?: EmpresaInfo;
  
  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PacienteInfo {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  sexo?: 'masculino' | 'femenino';
  email?: string;
  telefono?: string;
}

export interface EmpresaInfo {
  id: string;
  nombre: string;
  rfc?: string;
}

// =====================================================
// ANTECEDENTES PERSONALES NO PATOLÓGICOS (APNP)
// =====================================================

export interface APNP {
  id: string;
  expediente_id: string;
  
  // Hábitos
  tabaco: boolean;
  tabaco_cantidad?: string;
  tabaco_tiempo?: string;
  tabaco_frecuencia?: string;
  
  alcohol: boolean;
  alcohol_frecuencia?: string;
  alcohol_cantidad?: string;
  
  drogas: boolean;
  drogas_tipo?: string;
  drogas_frecuencia?: string;
  
  // Medicamentos
  medicamentos_habitual?: string;
  
  // Estilo de vida
  ejercicio_frecuencia?: string;
  ejercicio_tipo?: string;
  
  sueno_horas?: number;
  sueno_calidad?: string;
  
  alimentacion_tipo?: string;
  
  // Otros
  cafe: boolean;
  cafe_tazas_diarias?: number;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// ANTECEDENTES HEREDOFAMILIARES (AHF)
// =====================================================

export interface AHF {
  id: string;
  expediente_id: string;
  
  // Diabetes
  diabetes: boolean;
  diabetes_quien?: string;
  
  // Hipertensión
  hipertension: boolean;
  hipertension_quien?: string;
  
  // Cáncer
  cancer: boolean;
  cancer_tipo?: string;
  cancer_quien?: string;
  
  // Cardiopatías
  cardiopatias: boolean;
  cardiopatias_quien?: string;
  
  // Enfermedades mentales/neurológicas
  enfermedades_mentales: boolean;
  enfermedades_mentales_quien?: string;
  
  // Enfermedades respiratorias
  enfermedades_respiratorias: boolean;
  enfermedades_respiratorias_quien?: string;
  
  // Otros
  otros?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// HISTORIA OCUPACIONAL
// =====================================================

export interface HistoriaOcupacional {
  id: string;
  expediente_id: string;
  
  // Datos del empleo
  empresa_anterior?: string;
  puesto?: string;
  antiguedad?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  
  // Riesgos
  riesgos_fisicos?: string;
  riesgos_quimicos?: string;
  riesgos_biologicos?: string;
  riesgos_ergonomicos?: string;
  riesgos_psicosociales?: string;
  riesgos_electricos: boolean;
  riesgos_mecanicos: boolean;
  
  // Exposiciones
  exposiciones?: string;
  
  // EPP
  epp_utilizado?: string;
  epp_adecuado?: boolean;
  
  // Incidentes
  accidentes_laborales?: string;
  enfermedades_laborales?: string;
  incapacidades?: string;
  
  // Motivo de separación
  motivo_separacion?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// EXPLORACIÓN FÍSICA
// =====================================================

export interface ExploracionFisica {
  id: string;
  expediente_id: string;
  consulta_id?: string;
  
  fecha_exploracion: string;
  
  // Signos Vitales
  fc?: number;
  fr?: number;
  ta_sistolica?: number;
  ta_diastolica?: number;
  temperatura?: number;
  spo2?: number;
  glucosa?: number;
  
  // Antropometría
  peso_kg?: number;
  talla_cm?: number;
  imc?: number;
  cintura_cm?: number;
  cadera_cm?: number;
  icc?: number;
  
  // Exploración sistemática
  aspecto_general?: string;
  estado_general?: string;
  
  // Cabeza
  piel?: string;
  cabeza?: string;
  ojos?: string;
  oidos?: string;
  nariz?: string;
  boca?: string;
  cuello?: string;
  
  // Tórax
  torax?: string;
  pulmones?: string;
  corazon?: string;
  
  // Abdomen
  abdomen?: string;
  
  // Extremidades
  extremidades_superiores?: string;
  extremidades_inferiores?: string;
  
  // Neurológico
  neurologico?: string;
  reflejos?: string;
  coordinacion?: string;
  marcha?: string;
  
  // Mental
  estado_mental?: string;
  orientacion?: string;
  lenguaje?: string;
  memoria?: string;
  
  // Otros sistemas
  genitourinario?: string;
  osteomuscular_detalle?: string;
  
  // Hallazgos
  hallazgos_relevantes?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// CONSENTIMIENTOS INFORMADOS
// =====================================================

export interface ConsentimientoInformado {
  id: string;
  expediente_id: string;
  paciente_id: string;
  
  tipo: 'prestacion_servicios' | 'manejo_datos' | 'menores' | 'imagenes' | 'procedimientos';
  titulo?: string;
  contenido?: string;
  version: string;
  
  // Firma
  firmado: boolean;
  fecha_firma?: string;
  firma_digital_url?: string;
  firma_digital_data?: string;
  
  // Firmante
  firmante_nombre?: string;
  firmante_parentesco?: string;
  firmante_telefono?: string;
  
  // Testigo
  testigo_nombre?: string;
  testigo_firma_url?: string;
  
  // Médico
  medico_id?: string;
  medico?: {
    nombre: string;
    cedula: string;
  };
  
  // Metadata legal
  ip_firma?: string;
  user_agent?: string;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// CATÁLOGO CIE-10
// =====================================================

export interface CatalogoCIE {
  id: string;
  codigo: string;
  descripcion: string;
  capitulo?: string;
  grupo?: string;
  categoria?: string;
  
  es_favorito: boolean;
  frecuencia_uso: number;
  
  es_preempleo: boolean;
  es_periodico: boolean;
  es_retorno: boolean;
  es_egreso: boolean;
  
  activo: boolean;
}

// =====================================================
// CONSULTAS MÉDICAS
// =====================================================

export type TipoConsulta = 'general' | 'ocupacional';
export type SubtipoConsultaOcupacional = 'ingreso' | 'periodico' | 'retorno' | 'egreso' | 'reubicacion';
export type EstadoConsulta = 'en_proceso' | 'completada' | 'cancelada';
export type PronosticoConsulta = 'bueno' | 'reservado' | 'grave';

export interface Consulta {
  id: string;
  expediente_id: string;
  paciente_id: string;
  medico_id: string;
  
  tipo: TipoConsulta;
  subtipo?: SubtipoConsultaOcupacional;
  
  // Motivo y antecedentes
  motivo_consulta?: string;
  padecimiento_actual?: string;
  
  // SOAP
  subjetivo?: string;
  objetivo?: string;
  analisis?: string;
  plan_tratamiento?: string;
  
  // Diagnósticos
  diagnostico_principal?: string;
  diagnostico_principal_desc?: string;
  diagnosticos_secundarios?: DiagnosticoSecundario[];
  
  // Pronóstico
  pronostico?: PronosticoConsulta;
  
  // Observaciones
  observaciones?: string;
  recomendaciones?: string;
  
  // Estado
  estado: EstadoConsulta;
  
  // Fechas
  fecha_consulta: string;
  proxima_cita?: string;
  
  // Relaciones
  medico?: {
    nombre: string;
    especialidad?: string;
  };
  
  created_at: string;
  updated_at: string;
}

export interface DiagnosticoSecundario {
  codigo: string;
  descripcion: string;
}

// =====================================================
// RECETAS ELECTRÓNICAS
// =====================================================

export type EstadoReceta = 'activa' | 'surtida_parcial' | 'surtida_total' | 'cancelada' | 'vencida';

export interface Receta {
  id: string;
  consulta_id: string;
  paciente_id: string;
  medico_id: string;
  
  folio: string;
  
  // Información clínica
  diagnostico?: string;
  diagnostico_desc?: string;
  indicaciones_generales?: string;
  
  // Estado
  estado: EstadoReceta;
  
  // Vigencia
  fecha_receta: string;
  fecha_vigencia: string;
  
  // Surtido
  surtida_en?: string;
  surtida_por?: string;
  fecha_surtido?: string;
  
  // Relaciones
  medicamentos: RecetaMedicamento[];
  
  created_at: string;
  updated_at: string;
}

export interface RecetaMedicamento {
  id: string;
  receta_id: string;
  
  medicamento_nombre: string;
  principio_activo?: string;
  presentacion?: string;
  
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  via_administracion?: string;
  
  cantidad_solicitada: number;
  cantidad_surtida: number;
  unidad?: string;
  
  indicaciones?: string;
  surtido: boolean;
}

// =====================================================
// ESTUDIOS PARACLÍNICOS
// =====================================================

export type TipoEstudio = 'audiometria' | 'espirometria' | 'ecg' | 'rx' | 'laboratorio' | 'vision' | 'otros';
export type EstadoEstudio = 'pendiente' | 'completo' | 'anormal' | 'critico' | 'cancelado';
export type SemaforoEstudio = 'verde' | 'amarillo' | 'rojo';

export interface EstudioParaclinico {
  id: string;
  expediente_id: string;
  consulta_id?: string;
  paciente_id: string;
  
  tipo: TipoEstudio;
  subtipo?: string;
  
  // Solicitud
  medico_solicita_id?: string;
  fecha_solicitud: string;
  urgente: boolean;
  
  // Resultados
  resultado?: string;
  interpretacion?: string;
  observaciones?: string;
  valores_json?: Record<string, any>;
  
  // Archivo
  archivo_url?: string;
  archivo_tipo?: 'pdf' | 'dicom' | 'imagen' | 'audio';
  archivo_nombre?: string;
  
  // Interpretación médica
  medico_interpreta_id?: string;
  fecha_interpretacion?: string;
  
  // Estado
  estado: EstadoEstudio;
  semaforo?: SemaforoEstudio;
  
  // Datos específicos según tipo
  audiometria?: Audiometria;
  espirometria?: Espirometria;
  laboratorio?: Laboratorio;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// AUDIOMETRÍA
// =====================================================

export interface Audiometria {
  id: string;
  estudio_id: string;
  
  // Oído Derecho (dB)
  od_500hz?: number;
  od_1000hz?: number;
  od_2000hz?: number;
  od_3000hz?: number;
  od_4000hz?: number;
  od_6000hz?: number;
  od_8000hz?: number;
  
  // Oído Izquierdo (dB)
  oi_500hz?: number;
  oi_1000hz?: number;
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
  
  // Semáforo NOM-011
  semaforo_od?: SemaforoEstudio;
  semaforo_oi?: SemaforoEstudio;
  semaforo_general?: SemaforoEstudio;
  
  interpretacion_nom011?: string;
  retardo_auditivo_od: boolean;
  retardo_auditivo_oi: boolean;
  
  requiere_reevaluacion: boolean;
  tiempo_reevaluacion_meses?: number;
}

// =====================================================
// ESPIROMETRÍA
// =====================================================

export type InterpretacionEspirometria = 'normal' | 'restrictivo' | 'obstructivo' | 'mixto' | 'no_concluyente';
export type SeveridadEspirometria = 'leve' | 'moderado' | 'severo' | 'muy_severo';

export interface Espirometria {
  id: string;
  estudio_id: string;
  
  // Datos del paciente para cálculo
  edad_anios?: number;
  sexo?: string;
  altura_cm?: number;
  peso_kg?: number;
  
  // FVC
  fvc_litros?: number;
  fvc_predicho?: number;
  fvc_porcentaje?: number;
  
  // FEV1
  fev1_litros?: number;
  fev1_predicho?: number;
  fev1_porcentaje?: number;
  
  // FEV1/FVC
  fev1_fvc?: number;
  fev1_fvc_predicho?: number;
  fev1_fvc_porcentaje?: number;
  
  // PEF
  pef?: number;
  pef_predicho?: number;
  pef_porcentaje?: number;
  
  // FEF25-75
  fef2575?: number;
  fef2575_predicho?: number;
  fef2575_porcentaje?: number;
  
  // Interpretación
  interpretacion?: InterpretacionEspirometria;
  severidad?: SeveridadEspirometria;
  
  // Calidad
  calidad_maniobra?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'U';
  reproduibilidad?: boolean;
  
  // Broncodilatador
  prebroncodilatador?: boolean;
  postbroncodilatador?: boolean;
  variabilidad_post_bd?: number;
}

// =====================================================
// LABORATORIO
// =====================================================

export interface Laboratorio {
  id: string;
  estudio_id: string;
  grupo: string;
  metodo?: string;
  muestra?: string;
  resultados: LaboratorioResultado[];
}

export interface LaboratorioResultado {
  id: string;
  laboratorio_id: string;
  
  parametro: string;
  resultado: string;
  unidad?: string;
  valor_referencia?: string;
  valor_referencia_min?: number;
  valor_referencia_max?: number;
  
  bandera: 'normal' | 'alto' | 'bajo' | 'critico' | 'no_determinado';
  observaciones?: string;
}

// =====================================================
// DTOs PARA CREAR/ACTUALIZAR
// =====================================================

export interface CreateExpedienteDTO {
  paciente_id: string;
  empresa_id: string;
  sede_id?: string;
  alergias?: string;
  tipo_sangre?: string;
}

export interface UpdateExpedienteDTO {
  estado?: 'activo' | 'cerrado' | 'archivado';
  fecha_cierre?: string;
  alergias?: string;
  tipo_sangre?: string;
}

export interface CreateConsultaDTO {
  expediente_id: string;
  paciente_id: string;
  tipo: TipoConsulta;
  subtipo?: SubtipoConsultaOcupacional;
  motivo_consulta?: string;
  padecimiento_actual?: string;
  subjetivo?: string;
  analisis?: string;
  plan_tratamiento?: string;
  diagnostico_principal?: string;
  diagnosticos_secundarios?: DiagnosticoSecundario[];
  observaciones?: string;
  recomendaciones?: string;
  proxima_cita?: string;
}

export interface CreateRecetaDTO {
  consulta_id: string;
  paciente_id: string;
  diagnostico?: string;
  indicaciones_generales?: string;
  medicamentos: CreateRecetaMedicamentoDTO[];
}

export interface CreateRecetaMedicamentoDTO {
  medicamento_nombre: string;
  principio_activo?: string;
  presentacion?: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  via_administracion?: string;
  cantidad_solicitada: number;
  unidad?: string;
  indicaciones?: string;
}
