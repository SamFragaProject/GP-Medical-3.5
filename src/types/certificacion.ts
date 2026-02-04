// Tipos para el módulo de Certificaciones Médicas

export interface Paciente {
  id: string
  nombre: string
  apellidos: string
  fechaNacimiento: string
  curp: string
  rfc: string
  puestoTrabajo: string
  empresa: Empresa
  foto?: string
  createdAt: string
  updatedAt: string
}

export interface Empresa {
  id: string
  nombre: string
  razonSocial: string
  rfc: string
  logo?: string
  templateCertificado?: string
  configuracion?: ConfiguracionEmpresa
}

export interface ConfiguracionEmpresa {
  camposRequeridos: string[]
  vigenciaPorDefecto: number // en días
  alertaRenovacion: number // días antes del vencimiento
  formatoCertificado: 'oficial' | 'personalizado'
  camposPersonalizados: CampoPersonalizado[]
}

export interface CampoPersonalizado {
  nombre: string
  tipo: 'texto' | 'fecha' | 'numero' | 'select'
  requerido: boolean
  opciones?: string[]
}

export interface Medico {
  id: string
  nombre: string
  apellidos: string
  cedulaProfesional: string
  especialidad: string
  certificacionFirmas: string
  huellaDigital?: string
  FirmaDigital?: {
    activo: boolean
    fechaVencimiento: string
  }
}

export interface TipoCertificado {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  template: string
  vigenciaDias: number
  camposRequeridos: string[]
  generadoAutomaticamente: boolean
  requiereFirma: boolean
}

export interface ExamenOcupacional {
  id: string
  pacienteId: string
  tipoExamen: string
  fechaExamen: string
  resultados: ResultadoExamen[]
  medicoResponsable: Medico
  laboratorio?: string
  observaciones?: string
  archivos: ArchivoAdjunto[]
}

export interface ResultadoExamen {
  id: string
  nombreExamen: string
  valor: string | number
  unidad: string
  valorReferencia: string
  estado: 'normal' | 'alterado' | 'critico'
  fechaResultado: string
}

export interface ArchivoAdjunto {
  id: string
  nombre: string
  tipo: 'imagen' | 'pdf' | 'laboratorio' | 'otro'
  url: string
  fechaSubida: string
}

export interface Certificacion {
  id: string
  numeroCertificado: string
  pacienteId: string
  empresaId: string
  tipoCertificadoId: string
  examenOcupacionalId?: string
  
  // Datos del certificado
  fechaEmision: string
  fechaVencimiento: string
  estado: 'vigente' | 'vencido' | 'suspendido' | 'anulado'
  
  // Resultados médicos
  aptoParaTrabajo: boolean
  restricciones?: string[]
  recomendaciones?: string[]
  observacionesMedicas?: string
  
  // Firma digital
  medicoFirma: Medico
  fechaFirmaDigital?: string
  hashBlockchain?: string
  firmaDigitalHash?: string
  
  // Datos adicionales
  camposPersonalizados: Record<string, any>
  
  // Historial
  creadoPor: string
  modificadoPor?: string
  historialEstados: HistorialEstado[]
  
  // Portal empresa
  visibleEmpresa: boolean
  fechaNotificacionEmpresa?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface HistorialEstado {
  id: string
  estado: 'vigente' | 'vencido' | 'suspendido' | 'anulado'
  fechaCambio: string
  motivo?: string
  usuarioCambio: string
}

export interface PlantillaCertificado {
  id: string
  nombre: string
  empresaId: string
  tipoCertificadoId: string
  htmlTemplate: string
  cssStyles?: string
  variables: string[]
  esDefecto: boolean
  fechaCreacion: string
}

export interface AlertaCertificacion {
  id: string
  certificacionId: string
  tipo: 'vencimiento' | 'anulacion' | 'suspension' | 'renovacion'
  fechaAlerta: string
  mensaje: string
  enviada: boolean
  empresaNotificada: boolean
  destinatarios: string[]
}

export interface PortalEmpresa {
  empresaId: string
  tokenAcceso: string
  fechaExpiracion: string
  permisos: string[]
  ultimoAcceso?: string
  totalCertificados: number
  certificadosVigentes: number
  certificadosVencidos: number
}

export interface GeneracionMasiva {
  id: string
  empresaId: string
  tipoCertificadoId: string
  filtrosPacientes: {
    puestosTrabajo?: string[]
    examenesCompletos?: boolean
    vigenciaVencida?: boolean
  }
  totalGenerados: number
  fechaGeneracion: string
  estado: 'procesando' | 'completado' | 'error'
  certificadosGenerados: string[]
}

export interface ValidacionBlockchain {
  hashCertificado: string
  hashTransaccion: string
  fechaRegistro: string
  blockchain: 'ethereum' | 'polygon' | 'bsc'
  verificacion: boolean
}

export interface Notificacion {
  id: string
  destinatario: string
  tipo: 'email' | 'sms' | 'push'
  mensaje: string
  fechaEnvio: string
  estado: 'pendiente' | 'enviada' | 'entregada' | 'fallida'
  certificacionId?: string
}

// Enums para mejor tipado
export enum EstadoCertificacion {
  VIGENTE = 'vigente',
  VENCIDO = 'vencido',
  SUSPENDIDO = 'suspendido',
  ANULADO = 'anulado'
}

export enum TipoAlerta {
  VENCIMIENTO = 'vencimiento',
  ANULACION = 'anulacion',
  SUSPENSION = 'suspension',
  RENOVACION = 'renovacion'
}

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  ENTREGADA = 'entregada',
  FALLIDA = 'fallida'
}
