/**
 * 💰 TIPOS DE FACTURACIÓN V2
 */

export type TipoComprobante = 'I' | 'E' | 'T' | 'N' | 'P';
// I = Ingreso, E = Egreso, T = Traslado, N = Nómina, P = Pago

export type UsoCFDI = 
  | 'G01' // Adquisición de mercancías
  | 'G02' // Devoluciones, descuentos o bonificaciones
  | 'G03' // Gastos en general
  | 'I01' // Construcciones
  | 'I02' // Mobiliario y equipo de oficina
  | 'I03' // Equipo de transporte
  | 'I04' // Equipo de cómputo
  | 'I08' // Otra maquinaria y equipo
  | 'D01' // Honorarios médicos
  | 'D02' // Gastos médicos por incapacidad
  | 'S01' // Sin efectos fiscales
  | 'CP01'; // Pagos

export type MetodoPago = 'PUE' | 'PPD';
// PUE = Pago en una sola exhibición
// PPD = Pago en parcialidades o diferido

export type FormaPago = 
  | '01' // Efectivo
  | '02' // Cheque nominativo
  | '03' // Transferencia electrónica
  | '04' // Tarjeta de crédito
  | '28' // Tarjeta de débito
  | '99'; // Por definir

export type EstadoFactura = 
  | 'borrador'
  | 'timbrada'
  | 'cancelada'
  | 'enviada'
  | 'pagada';

export interface Factura {
  id: string;
  empresaId: string;
  
  // CFDI
  uuid?: string; // Folio fiscal del SAT
  serie?: string;
  folio?: string;
  
  // Emisor
  emisorRFC: string;
  emisorNombre: string;
  emisorRegimenFiscal: string;
  
  // Receptor (cliente)
  receptorId: string;
  receptorRFC: string;
  receptorNombre: string;
  receptorUsoCFDI: UsoCFDI;
  
  // Datos de la factura
  tipoComprobante: TipoComprobante;
  fechaEmision: string;
  fechaCertificacion?: string;
  
  // Totales
  subtotal: number;
  descuento: number;
  impuestosTrasladados: number;
  impuestosRetenidos: number;
  total: number;
  
  // Moneda
  moneda: string;
  tipoCambio: number;
  
  // Pago
  metodoPago: MetodoPago;
  formaPago: FormaPago;
  condicionesPago?: string;
  
  // Conceptos
  conceptos: ConceptoFactura[];
  
  // Estado
  estado: EstadoFactura;
  
  // Cancelación
  motivoCancelacion?: string;
  fechaCancelacion?: string;
  
  // Archivos
  xmlUrl?: string;
  pdfUrl?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ConceptoFactura {
  id: string;
  facturaId: string;
  
  // Producto/Servicio
  claveProdServ: string; // Catálogo del SAT
  claveUnidad: string; // Catálogo del SAT
  unidad: string;
  descripcion: string;
  
  // Cantidad y precio
  cantidad: number;
  valorUnitario: number;
  importe: number;
  descuento: number;
  
  // Impuestos
  impuestos: ImpuestoConcepto[];
}

export interface ImpuestoConcepto {
  tipo: 'Traslado' | 'Retencion';
  impuesto: '002' | '003'; // 002 = IVA, 003 = IEPS
  tipoFactor: 'Tasa' | 'Cuota' | 'Exento';
  tasaOCuota: number;
  importe: number;
}

export interface ClienteFiscal {
  id: string;
  empresaId: string;
  
  rfc: string;
  nombre: string;
  regimenFiscal: string;
  
  // Dirección fiscal
  codigoPostal: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  pais: string;
  
  // Contacto
  email: string;
  telefono?: string;
  
  // Uso CFDI por defecto
  usoCFDIPredeterminado: UsoCFDI;
  
  activo: boolean;
  createdAt: string;
}

export interface CreateFacturaInput {
  receptorId: string;
  tipoComprobante: TipoComprobante;
  metodoPago: MetodoPago;
  formaPago: FormaPago;
  condicionesPago?: string;
  conceptos: Omit<ConceptoFactura, 'id' | 'facturaId' | 'importe'>[];
}

export interface FacturaFilters {
  estado?: EstadoFactura;
  receptorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  serie?: string;
  folio?: string;
}

export interface FacturaStats {
  totalFacturas: number;
  totalTimbradas: number;
  totalCanceladas: number;
  montoTotal: number;
  montoPendiente: number;
  facturasPorMes: { mes: string; total: number; monto: number }[];
}

// Catálogos SAT simplificados
export const REGIMEN_FISCAL = [
  { clave: '601', descripcion: 'General de Ley Personas Morales' },
  { clave: '603', descripcion: 'Personas Morales con Fines no Lucrativos' },
  { clave: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { clave: '606', descripcion: 'Arrendamiento' },
  { clave: '608', descripcion: 'Demás ingresos' },
  { clave: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { clave: '626', descripcion: 'Régimen Simplificado de Confianza' },
];

export const USO_CFDI_OPTIONS = [
  { clave: 'G01', descripcion: 'Adquisición de mercancías' },
  { clave: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones' },
  { clave: 'G03', descripcion: 'Gastos en general' },
  { clave: 'I01', descripcion: 'Construcciones' },
  { clave: 'I04', descripcion: 'Equipo de cómputo' },
  { clave: 'D01', descripcion: 'Honorarios médicos' },
  { clave: 'D02', descripcion: 'Gastos médicos por incapacidad' },
  { clave: 'S01', descripcion: 'Sin efectos fiscales' },
];
