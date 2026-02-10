/**
 * Tipos para el módulo de Campañas Masivas
 * GPMedical ERP Pro
 * 
 * Una campaña = un lote de evaluaciones médicas para una empresa.
 * Ejemplo: "Examen periódico 2026 - Empresa X" con 50 trabajadores.
 */

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export type TipoCampania =
    | 'preempleo'
    | 'periodico'
    | 'retorno'
    | 'egreso'
    | 'especial';

export type EstadoCampania =
    | 'borrador'
    | 'planificada'
    | 'en_proceso'
    | 'pausada'
    | 'completada'
    | 'cancelada';

export type EstadoTrabajadorCampania =
    | 'pendiente'
    | 'citado'
    | 'en_proceso'
    | 'evaluado'
    | 'dictaminado'
    | 'cerrado'
    | 'no_presentado';

export const TIPOS_CAMPANIA_LABELS: Record<TipoCampania, string> = {
    preempleo: 'Pre-empleo',
    periodico: 'Periódico',
    retorno: 'Retorno al trabajo',
    egreso: 'Egreso',
    especial: 'Especial',
};

export const ESTADOS_CAMPANIA_LABELS: Record<EstadoCampania, string> = {
    borrador: 'Borrador',
    planificada: 'Planificada',
    en_proceso: 'En Proceso',
    pausada: 'Pausada',
    completada: 'Completada',
    cancelada: 'Cancelada',
};

export const ESTADOS_TRABAJADOR_LABELS: Record<EstadoTrabajadorCampania, string> = {
    pendiente: 'Pendiente',
    citado: 'Citado',
    en_proceso: 'En Proceso',
    evaluado: 'Evaluado',
    dictaminado: 'Dictaminado',
    cerrado: 'Cerrado',
    no_presentado: 'No se presentó',
};

// =====================================================
// TIPOS PRINCIPALES
// =====================================================

export interface Campania {
    id: string;
    empresa_id: string;
    sede_id?: string;
    nombre: string;
    descripcion?: string;
    tipo: TipoCampania;
    estado: EstadoCampania;
    fecha_inicio: string;
    fecha_fin_estimada?: string;
    fecha_fin_real?: string;
    // Servicios incluidos
    servicios: ServicioCampania[];
    // Contacto de la empresa
    contacto_nombre?: string;
    contacto_email?: string;
    contacto_telefono?: string;
    // Métricas calculadas
    total_trabajadores: number;
    total_evaluados: number;
    total_aptos: number;
    total_restricciones: number;
    total_no_aptos: number;
    total_pendientes: number;
    // Financiero
    cotizacion_id?: string;
    precio_por_trabajador?: number;
    monto_total?: number;
    // Auditoría
    creado_por: string;
    created_at: string;
    updated_at: string;
    // Relaciones
    empresa?: { id: string; nombre: string; rfc?: string };
    sede?: { id: string; nombre: string };
}

export interface ServicioCampania {
    codigo: string;
    nombre: string;
    incluido: boolean;
    precio_unitario?: number;
}

export const SERVICIOS_DISPONIBLES: ServicioCampania[] = [
    { codigo: 'consulta_medica', nombre: 'Consulta Médica', incluido: true },
    { codigo: 'audiometria', nombre: 'Audiometría', incluido: false },
    { codigo: 'espirometria', nombre: 'Espirometría', incluido: false },
    { codigo: 'agudeza_visual', nombre: 'Agudeza Visual', incluido: false },
    { codigo: 'laboratorio', nombre: 'Laboratorio Clínico', incluido: false },
    { codigo: 'rayos_x', nombre: 'Rayos X', incluido: false },
    { codigo: 'ecg', nombre: 'Electrocardiograma', incluido: false },
    { codigo: 'ergonomia', nombre: 'Evaluación Ergonómica', incluido: false },
    { codigo: 'psicometria', nombre: 'Psicometría', incluido: false },
    { codigo: 'antidoping', nombre: 'Antidoping', incluido: false },
];

// =====================================================
// PADRÓN DE TRABAJADORES
// =====================================================

export interface TrabajadorPadron {
    id: string;
    campania_id: string;
    paciente_id?: string; // null si es nuevo, se crea al registrar
    // Datos del Excel
    numero_empleado?: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    curp?: string;
    nss?: string;
    fecha_nacimiento?: string;
    genero?: string;
    puesto?: string;
    area?: string;
    antiguedad_anios?: number;
    riesgo?: string;
    // Estado en la campaña
    estado: EstadoTrabajadorCampania;
    episodio_id?: string; // Referencia al episodio creado
    dictamen_id?: string; // Referencia al dictamen
    dictamen_resultado?: 'apto' | 'apto_restricciones' | 'no_apto_temporal' | 'no_apto_definitivo';
    // Fechas
    fecha_cita?: string;
    fecha_evaluacion?: string;
    fecha_dictamen?: string;
    // Notas
    observaciones?: string;
    created_at: string;
    updated_at: string;
}

// =====================================================
// DTOs
// =====================================================

export interface CrearCampaniaDTO {
    empresa_id: string;
    sede_id?: string;
    nombre: string;
    descripcion?: string;
    tipo: TipoCampania;
    fecha_inicio: string;
    fecha_fin_estimada?: string;
    servicios: ServicioCampania[];
    contacto_nombre?: string;
    contacto_email?: string;
    contacto_telefono?: string;
    precio_por_trabajador?: number;
}

export interface ActualizarCampaniaDTO {
    nombre?: string;
    descripcion?: string;
    estado?: EstadoCampania;
    fecha_inicio?: string;
    fecha_fin_estimada?: string;
    fecha_fin_real?: string;
    servicios?: ServicioCampania[];
    contacto_nombre?: string;
    contacto_email?: string;
    contacto_telefono?: string;
    precio_por_trabajador?: number;
}

export interface ImportarPadronDTO {
    campania_id: string;
    trabajadores: Omit<TrabajadorPadron, 'id' | 'campania_id' | 'estado' | 'created_at' | 'updated_at'>[];
}

// =====================================================
// MÉTRICAS Y FILTROS
// =====================================================

export interface MetricasCampania {
    total: number;
    pendientes: number;
    en_proceso: number;
    evaluados: number;
    dictaminados: number;
    cerrados: number;
    no_presentados: number;
    // Resultados
    aptos: number;
    aptos_restricciones: number;
    no_aptos_temporales: number;
    no_aptos_definitivos: number;
    sin_dictamen: number;
    // Porcentajes
    porcentaje_avance: number;
    porcentaje_aptos: number;
}

export interface FiltrosCampania {
    empresa_id?: string;
    tipo?: TipoCampania;
    estado?: EstadoCampania;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
}

export interface FiltrosTrabajadorPadron {
    estado?: EstadoTrabajadorCampania;
    dictamen_resultado?: string;
    search?: string;
    area?: string;
    puesto?: string;
}

// =====================================================
// COLUMNAS DE EXCEL PARA IMPORTACIÓN
// =====================================================

export interface ColumnaExcel {
    header: string;
    campo: keyof TrabajadorPadron | '';
    ejemplo?: string;
}

export const COLUMNAS_PADRON_REQUERIDAS: { campo: keyof TrabajadorPadron; nombre: string; obligatorio: boolean }[] = [
    { campo: 'nombre', nombre: 'Nombre', obligatorio: true },
    { campo: 'apellido_paterno', nombre: 'Apellido Paterno', obligatorio: true },
    { campo: 'apellido_materno', nombre: 'Apellido Materno', obligatorio: false },
    { campo: 'numero_empleado', nombre: 'No. Empleado', obligatorio: false },
    { campo: 'curp', nombre: 'CURP', obligatorio: false },
    { campo: 'nss', nombre: 'NSS', obligatorio: false },
    { campo: 'fecha_nacimiento', nombre: 'Fecha Nacimiento', obligatorio: false },
    { campo: 'genero', nombre: 'Género', obligatorio: false },
    { campo: 'puesto', nombre: 'Puesto', obligatorio: false },
    { campo: 'area', nombre: 'Área', obligatorio: false },
    { campo: 'antiguedad_anios', nombre: 'Antigüedad (años)', obligatorio: false },
    { campo: 'riesgo', nombre: 'Nivel de Riesgo', obligatorio: false },
];
