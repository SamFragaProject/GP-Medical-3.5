/**
 * Tipos para el módulo de Cuentas por Cobrar (CxC)
 * GPMedical ERP Pro
 *
 * Gestión de aging, pagos parciales, y complementos de pago.
 */

// =====================================================
// ENUMS
// =====================================================

export type EstadoCxC =
    | 'vigente'
    | 'vencida'
    | 'pagada_parcial'
    | 'pagada'
    | 'cancelada'
    | 'incobrable';

export const ESTADOS_CXC_LABELS: Record<EstadoCxC, string> = {
    vigente: 'Vigente',
    vencida: 'Vencida',
    pagada_parcial: 'Pago Parcial',
    pagada: 'Pagada',
    cancelada: 'Cancelada',
    incobrable: 'Incobrable',
};

export type AgingBucket = '0-30' | '31-60' | '61-90' | '90+';

export const AGING_BUCKET_LABELS: Record<AgingBucket, string> = {
    '0-30': '0-30 días',
    '31-60': '31-60 días',
    '61-90': '61-90 días',
    '90+': '90+ días',
};

export const AGING_BUCKET_COLORS: Record<AgingBucket, string> = {
    '0-30': '#22c55e',   // green
    '31-60': '#eab308',  // yellow
    '61-90': '#f97316',  // orange
    '90+': '#ef4444',    // red
};

// =====================================================
// TIPOS PRINCIPALES
// =====================================================

export interface CuentaPorCobrar {
    id: string;
    empresa_id: string;
    factura_id?: string;
    folio_factura?: string;
    // Cliente
    cliente_nombre: string;
    cliente_rfc?: string;
    // Montos
    monto_original: number;
    monto_pagado: number;
    saldo_pendiente: number;
    moneda: 'MXN' | 'USD';
    // Estado
    estado: EstadoCxC;
    // Fechas
    fecha_emision: string;
    fecha_vencimiento: string;
    fecha_ultimo_pago?: string;
    // Aging
    dias_vencidos: number;
    aging_bucket: AgingBucket;
    // Relaciones
    pagos: PagoCxC[];
    // Notas
    notas?: string;
    // Auditoría
    created_at: string;
    updated_at: string;
    // Joined
    empresa?: { id: string; nombre: string };
}

export interface PagoCxC {
    id: string;
    cuenta_id: string;
    monto: number;
    fecha_pago: string;
    metodo_pago: MetodoPago;
    referencia?: string; // No. de transferencia, cheque, etc.
    comprobante_url?: string;
    // Complemento CFDI
    complemento_cfdi?: boolean;
    uuid_complemento?: string;
    // Notas
    notas?: string;
    registrado_por: string;
    created_at: string;
}

export type MetodoPago =
    | 'transferencia'
    | 'efectivo'
    | 'cheque'
    | 'tarjeta'
    | 'deposito'
    | 'otro';

export const METODOS_PAGO_LABELS: Record<MetodoPago, string> = {
    transferencia: 'Transferencia Bancaria',
    efectivo: 'Efectivo',
    cheque: 'Cheque',
    tarjeta: 'Tarjeta de Crédito/Débito',
    deposito: 'Depósito Bancario',
    otro: 'Otro',
};

// =====================================================
// MÉTRICAS Y RESUMEN AGING
// =====================================================

export interface AgingResumen {
    buckets: AgingBucketData[];
    total_cuentas: number;
    total_saldo: number;
    total_vencido: number;
    porcentaje_cobranza: number;
}

export interface AgingBucketData {
    bucket: AgingBucket;
    label: string;
    color: string;
    count: number;
    monto: number;
    porcentaje: number;
}

export interface ResumenCxCEmpresa {
    empresa_id: string;
    empresa_nombre: string;
    cuentas_vigentes: number;
    cuentas_vencidas: number;
    saldo_total: number;
    saldo_vencido: number;
    dias_promedio_pago: number;
}

// =====================================================
// DTOs
// =====================================================

export interface CrearCxCDTO {
    empresa_id: string;
    factura_id?: string;
    folio_factura?: string;
    cliente_nombre: string;
    cliente_rfc?: string;
    monto_original: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    moneda?: 'MXN' | 'USD';
    notas?: string;
}

export interface RegistrarPagoDTO {
    cuenta_id: string;
    monto: number;
    fecha_pago: string;
    metodo_pago: MetodoPago;
    referencia?: string;
    notas?: string;
    complemento_cfdi?: boolean;
}

// =====================================================
// FILTROS
// =====================================================

export interface FiltrosCxC {
    empresa_id?: string;
    estado?: EstadoCxC;
    aging_bucket?: AgingBucket;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
    solo_vencidas?: boolean;
}
