/**
 * 💰 FACTURACIÓN V2 - Exportaciones
 */

export { facturacionService } from './services/facturacionService';

export type {
  Factura,
  ClienteFiscal,
  ConceptoFactura,
  CreateFacturaInput,
  FacturaFilters,
  FacturaStats,
  TipoComprobante,
  UsoCFDI,
  EstadoFactura,
} from './types/facturacion.types';

export { REGIMEN_FISCAL, USO_CFDI_OPTIONS } from './types/facturacion.types';
