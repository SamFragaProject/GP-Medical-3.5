export type RegimenFiscal = '601' | '603' | '605' | '606' | '608' | '612' | '620' | '621' | '626';
export type UsoCFDI = 'G01' | 'G03' | 'D01' | 'D02' | 'I01' | 'P01' | 'S01' | 'CP01';
export type MetodoPago = 'PUE' | 'PPD';
export type FormaPago = '01' | '03' | '04' | '28' | '99';
export type TipoComprobante = 'I' | 'E' | 'P' | 'N' | 'T';
export type CFDIStatus = 'borrador' | 'timbrada' | 'cancelada';

// Catálogo de regímenes fiscales SAT
export const CATALOGO_REGIMEN: Record<RegimenFiscal, string> = {
  '601': 'General de Ley Personas Morales',
  '603': 'Personas Morales con Fines no Lucrativos',
  '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606': 'Arrendamiento',
  '608': 'Demás ingresos',
  '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
  '620': 'Sociedades Cooperativas de Producción',
  '621': 'Incorporación Fiscal',
  '626': 'Régimen Simplificado de Confianza',
};

// Catálogo de uso de CFDI SAT
export const CATALOGO_USO_CFDI: Record<UsoCFDI, string> = {
  'G01': 'Adquisición de mercancías',
  'G03': 'Gastos en general',
  'D01': 'Honorarios médicos, dentales y gastos hospitalarios',
  'D02': 'Gastos médicos por incapacidad o discapacidad',
  'I01': 'Construcciones',
  'P01': 'Por definir',
  'S01': 'Sin efectos fiscales',
  'CP01': 'Pagos',
};


export interface EmisorConfig {
  id: string;
  empresa_id: string;
  rfc: string;
  razon_social: string;
  regimen_fiscal: RegimenFiscal;
  lugar_expedicion: string; // CP
  certificado_numero?: string;
  archivo_cer_url?: string;
  archivo_key_url?: string;
  logo_base64?: string;
}

export interface Cliente {
  id: string;
  rfc: string;
  razonSocial: string;
  email: string;
  telefono?: string;
  direccion: {
    calle: string;
    numero: string;
    colonia: string;
    ciudad: string;
    estado: string;
    cp: string;
    pais: string;
  };
  tipo: 'fisica' | 'moral';
  regimenFiscal: RegimenFiscal;
  usoCFDI: UsoCFDI;
}

export interface ServicioMedico {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: number;
  impuestos: number;
  categoria: string;
  activo: boolean;
}

export interface Factura {
  id: string;
  folio: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  cliente: Cliente;
  servicios: Array<{
    id: string;
    servicioId: string;
    servicioNombre: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    impuesto: number;
    total: number;
  }>;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  metodoPago: MetodoPago;
  lugarExpedicion: string;
  regimeFiscal: RegimenFiscal;
  usoCFDI: UsoCFDI;
  serie: string;
  numero: number;
  cfdiUUID?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Pago {
  id: string;
  facturaId: string;
  monto: number;
  fechaPago: Date;
  metodoPago: string;
  estado: 'pendiente' | 'completado' | 'fallido';
}

export interface NotaCredito {
  id: string;
  facturaId: string;
  folio: string;
  fecha: Date;
  monto: number;
  motivo: string;
}

export interface Seguro {
  id: string;
  nombre: string;
  codigo: string;
  tipo: 'IMSS' | 'ISSSTE' | 'PRIVADO';
  activo: boolean;
  configuracion: {
    requierePreautorizacion: boolean;
    diasPreautorizacion: number;
    precioPorProcedimiento: Record<string, number>;
    descuento: number;
    copago: number;
    cobertura: number;
    limites: {
      anual: number;
      mensual: number;
    };
    codigosAutorizacion: string[];
  };
}

export interface AlertaVencimiento {
  id: string;
  facturaId: string;
  diasRestantes: number;
  nivelUrgencia: 'baja' | 'media' | 'alta' | 'critica';
  mensaje: string;
  fechaLimite: Date;
}

export interface ReporteFinanciero {
  periodo: { fechaInicio: Date; fechaFin: Date };
  ingresosTotales: number;
  ingresosCobrados: number;
  ingresosPendientes: number;
  gastosOperativos: number;
  utilidadNeta: number;
  facturasEmitidas: number;
  facturasPagadas: number;
  facturasVencidas: number;
  clientesActivos: number;
  ticketPromedio: number;
  crecimientoVsPeriodoAnterior: number;
}

export interface PlanPrecios {
  id: string;
  nombre: string;
  precio: number;
  frecuencia: 'mensual' | 'anual';
}

export interface EstadoCuenta {
  id: string;
  clienteId: string;
}

export interface FacturacionRecurrente {
  id: string;
}

export interface ConciliacionPagos {
  id: string;
}

export interface ConfiguracionSeguro {
  id: string;
}

// Keep existing names too for compatibility if needed
export type ClienteFiscal = Cliente;
export type CFDI = Factura;
export type ConceptoFactura = Factura['servicios'][0];
