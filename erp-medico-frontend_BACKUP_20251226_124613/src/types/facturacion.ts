// Tipos TypeScript para el módulo de Facturación & Seguros CFDI 4.0
export interface Cliente {
  id: string
  rfc: string
  razonSocial: string
  email: string
  telefono?: string
  direccion: Direccion
  tipo: 'fisica' | 'moral'
  regimenFiscal: string
  usoCFDI: string
  pagosConfiguracion?: ConfiguracionPagos
  limiteCredito?: number
  diasCredito?: number
}

export interface Direccion {
  calle: string
  numero: string
  colonia: string
  ciudad: string
  estado: string
  cp: string
  pais: string
}

export interface ServicioMedico {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  precio: number
  impuestos: number
  categoria: string
  activo: boolean
}

export interface Factura {
  id: string
  folio: string
  fechaEmision: Date
  fechaVencimiento: Date
  cliente: Cliente
  servicios: ServicioFacturado[]
  subtotal: number
  impuestos: number
  total: number
  moneda: string
  tipoCambio?: number
  estado: 'borrador' | 'pendiente' | 'pagada' | 'vencida' | 'cancelada'
  metodoPago: string
  lugarExpedicion: string
  regimeFiscal: string
  usoCFDI: string
  cfdiUUID?: string
  xmlCFDI?: string
  pdfFactura?: string
  serie: string
  numero: number
  observaciones?: string
  created_at: Date
  updated_at: Date
}

export interface ServicioFacturado {
  id: string
  servicioId: string
  servicioNombre: string
  cantidad: number
  precioUnitario: number
  descuento: number
  impuesto: number
  total: number
}

export interface Pago {
  id: string
  facturaId: string
  monto: number
  fechaPago: Date
  metodoPago: string
  referencia?: string
  banco?: string
  cuenta?: string
  estado: 'pendiente' | 'completado' | 'fallido'
  comprobante?: string
  notas?: string
}

export interface NotaCredito {
  id: string
  folio: string
  fechaEmision: Date
  facturaId: string
  cliente: Cliente
  motivo: string
  servicios: ServicioFacturado[]
  subtotal: number
  impuestos: number
  total: number
  estado: 'borrador' | 'emitida' | 'aplicada'
  cfdiUUID?: string
  created_at: Date
}

export interface ConfiguracionPagos {
  diasVencimiento: number
  metodosPago: string[]
  aceptamosPagosParciales: boolean
  descuentoProntoPago?: number
  diasProntoPago?: number
  interesesMora?: number
  monedaDefault: string
}

export interface EmpresaConfiguracion {
  razonSocial: string
  rfc: string
  regimenFiscal: string
  direccion: Direccion
  telefono: string
  email: string
  logo?: string
  certificadoDigital?: string
  llavePrivada?: string
  regimen: string
  noCertificado: string
  lugarExpedicion: string
  usoCFDI: string
}

export interface Seguro {
  id: string
  nombre: string
  codigo: string
  tipo: 'IMSS' | 'ISSSTE' | 'ISSSTE' | 'INSABI' | 'PRIVADO' | 'OTRO'
  activo: boolean
  configuracion: ConfiguracionSeguro
}

export interface ConfiguracionSeguro {
  requierePreautorizacion: boolean
  diasPreautorizacion: number
  precioPorProcedimiento: { [key: string]: number }
  descuento: number
  copago: number
  cobertura: number
  limites: {
    anual?: number
    mensual?: number
    porProcedimiento?: number
  }
  codigosAutorizacion: string[]
}

export interface PlanPrecios {
  id: string
  nombre: string
  tipo: 'empresa' | 'individual' | 'seguro'
  descuento: number
  servicios: { servicioId: string; precio: number }[]
  activo: boolean
}

export interface ReporteFinanciero {
  periodo: {
    fechaInicio: Date
    fechaFin: Date
  }
  ingresosTotales: number
  ingresosCobrados: number
  ingresosPendientes: number
  gastosOperativos: number
  utilidadNeta: number
  facturasEmitidas: number
  facturasPagadas: number
  facturasVencidas: number
  clientesActivos: number
  ticketPromedio: number
  crecimientoVsPeriodoAnterior: number
}

export interface ConciliacionPagos {
  id: string
  fechaConciliacion: Date
  periodo: {
    fechaInicio: Date
    fechaFin: Date
  }
  movimientos: MovimientoConciliacion[]
  diferencias: number
  estado: 'pendiente' | 'conciliada' | 'revisada'
}

export interface MovimientoConciliacion {
  fecha: Date
  concepto: string
  monto: number
  referencia?: string
  tipo: 'ingreso' | 'egreso'
  estado: 'conciliado' | 'pendiente' | 'diferencia'
}

export interface EstadoCuenta {
  clienteId: string
  cliente: Cliente
  saldoActual: number
  limiteCredito: number
  facturas: Factura[]
  notasCredito: NotaCredito[]
  pagos: Pago[]
  movimientos: MovimientoEstadoCuenta[]
}

export interface MovimientoEstadoCuenta {
  fecha: Date
  concepto: string
  cargo: number
  abono: number
  saldo: number
}

export interface AlertaVencimiento {
  id: string
  facturaId: string
  diasRestantes: number
  nivelUrgencia: 'baja' | 'media' | 'alta' | 'critica'
  mensaje: string
  fechaLimite: Date
}

export interface PortalPagosConfiguracion {
  habilitado: boolean
  urlBase: string
  diasVencimiento: number
  metodosPago: string[]
  requiereAuth: boolean
  notificaciones: {
    emailCliente: boolean
    emailEmpresa: boolean
    sms: boolean
  }
}

export interface FacturacionRecurrente {
  id: string
  clienteId: string
  servicios: string[]
  frecuencia: 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'
  diaGeneracion: number
  fechaInicio: Date
  fechaFin?: Date
  activa: boolean
  proximaGeneracion: Date
  configuracion: {
    descuento: number
    observaciones: string
    diasVencimiento: number
  }
}