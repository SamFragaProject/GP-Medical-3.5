// Tipos para el módulo de Exámenes Ocupacionales
export interface Examen {
  id: string
  empleado: string
  empresa: string
  puesto: string
  tipoExamen: string
  fechaProgramacion: string
  fechaRealizacion?: string
  estado: 'programado' | 'en_proceso' | 'completado' | 'vencido' | 'cancelado'
  resultado?: 'apto' | 'apto_con_restricciones' | 'no_apto' | 'pendiente'
  laboratorios?: string[]
  proximoVencimiento?: string
  prioridad: 'alta' | 'media' | 'baja'
  observaciones?: string
  protocolo?: string
  medicoAsignado?: string
  costo?: number
  motivo?: string
}

export interface Protocolo {
  id: string
  nombre: string
  tipoPuesto: string
  descripcion: string
  examenesIncluidos: string[]
  periodicidad: string
  requisitosPrecios?: string[]
  normativas?: string[]
  duracionEstimada?: number
  activo: boolean
  fechaCreacion?: string
  creadoPor?: string
}

export interface Resultado {
  id: string
  examenId: string
  empleado: string
  tipoExamen: string
  laboratorios: {
    nombre: string
    valor: string
    valorNormal: string
    unidad: string
    estado: 'normal' | 'fuera_rango' | 'critico'
  }[]
  observaciones: string
  diagnostico: string
  aptoParaTrabajar: boolean
  restricciones: string[]
  fechaCaptura: string
  capturadoPor: string
  validado: boolean
  validadoPor?: string
  fechaValidacion?: string
}

export interface Certificado {
  id: string
  empleado: string
  empresa: string
  puesto: string
  tipoExamen: string
  fechaExamen: string
  resultado: 'apto' | 'apto_con_restricciones' | 'no_apto'
  restricciones?: string[]
  fechaVencimiento: string
  generadoPor: string
  numeroCertificado: string
  observaciones: string
  estado: 'vigente' | 'vencido' | 'proximamente_vencer'
}
