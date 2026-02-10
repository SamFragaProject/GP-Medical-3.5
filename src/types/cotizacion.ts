/**
 * Tipos para el módulo de Cotizaciones
 * GPMedical ERP Pro
 *
 * Una cotización = propuesta comercial a una empresa para servicios médicos.
 * Puede convertirse en factura al ser aceptada.
 */

// =====================================================
// ENUMS
// =====================================================

export type EstadoCotizacion =
    | 'borrador'
    | 'enviada'
    | 'aceptada'
    | 'rechazada'
    | 'vencida'
    | 'convertida'; // convertida a factura

export const ESTADOS_COTIZACION_LABELS: Record<EstadoCotizacion, string> = {
    borrador: 'Borrador',
    enviada: 'Enviada',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    vencida: 'Vencida',
    convertida: 'Convertida a Factura',
};

export const ESTADOS_COTIZACION_COLORS: Record<EstadoCotizacion, { bg: string; text: string }> = {
    borrador: { bg: 'bg-gray-500/20', text: 'text-gray-300' },
    enviada: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
    aceptada: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
    rechazada: { bg: 'bg-red-500/20', text: 'text-red-300' },
    vencida: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
    convertida: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
};

// =====================================================
// TIPOS PRINCIPALES
// =====================================================

export interface Cotizacion {
    id: string;
    empresa_id: string;
    // Folio
    folio: string; // COT-2026-0001
    // Datos del cliente
    cliente_nombre: string;
    cliente_rfc?: string;
    cliente_email?: string;
    cliente_telefono?: string;
    contacto_nombre?: string;
    // Estado
    estado: EstadoCotizacion;
    // Fechas
    fecha_emision: string;
    fecha_vigencia: string; // típicamente 30 días
    fecha_aceptacion?: string;
    // Conceptos
    conceptos: ConceptoCotizacion[];
    // Totales
    subtotal: number;
    iva: number;
    total: number;
    moneda: 'MXN' | 'USD';
    // Notas
    notas?: string;
    terminos_condiciones?: string;
    // Relaciones
    campania_id?: string;
    factura_id?: string; // si fue convertida
    // Auditoría
    creado_por: string;
    created_at: string;
    updated_at: string;
    // Joined
    empresa?: { id: string; nombre: string; rfc?: string };
}

export interface ConceptoCotizacion {
    id?: string;
    descripcion: string;
    codigo_servicio?: string;
    cantidad: number;
    precio_unitario: number;
    descuento_porcentaje: number;
    importe: number; // (cantidad * precio_unitario) * (1 - descuento/100)
}

// =====================================================
// CATÁLOGO DE SERVICIOS PARA COTIZAR
// =====================================================

export interface ServicioCotizable {
    codigo: string;
    nombre: string;
    categoria: 'consulta' | 'laboratorio' | 'gabinete' | 'especial';
    precio_sugerido: number;
    unidad: string;
}

export const CATALOGO_SERVICIOS: ServicioCotizable[] = [
    // Consultas
    { codigo: 'SRV-001', nombre: 'Consulta médica ocupacional', categoria: 'consulta', precio_sugerido: 350, unidad: 'por trabajador' },
    { codigo: 'SRV-002', nombre: 'Examen médico de ingreso', categoria: 'consulta', precio_sugerido: 500, unidad: 'por trabajador' },
    { codigo: 'SRV-003', nombre: 'Examen médico periódico', categoria: 'consulta', precio_sugerido: 450, unidad: 'por trabajador' },
    { codigo: 'SRV-004', nombre: 'Examen médico de egreso', categoria: 'consulta', precio_sugerido: 300, unidad: 'por trabajador' },
    { codigo: 'SRV-005', nombre: 'Dictamen médico-laboral', categoria: 'consulta', precio_sugerido: 250, unidad: 'por dictamen' },
    // Laboratorio
    { codigo: 'LAB-001', nombre: 'Biometría hemática completa', categoria: 'laboratorio', precio_sugerido: 180, unidad: 'por estudio' },
    { codigo: 'LAB-002', nombre: 'Química sanguínea 6 elementos', categoria: 'laboratorio', precio_sugerido: 220, unidad: 'por estudio' },
    { codigo: 'LAB-003', nombre: 'Examen general de orina', categoria: 'laboratorio', precio_sugerido: 80, unidad: 'por estudio' },
    { codigo: 'LAB-004', nombre: 'Antidoping 5 sustancias', categoria: 'laboratorio', precio_sugerido: 350, unidad: 'por estudio' },
    { codigo: 'LAB-005', nombre: 'Perfil lipídico', categoria: 'laboratorio', precio_sugerido: 250, unidad: 'por estudio' },
    // Gabinete
    { codigo: 'GAB-001', nombre: 'Audiometría tonal', categoria: 'gabinete', precio_sugerido: 200, unidad: 'por estudio' },
    { codigo: 'GAB-002', nombre: 'Espirometría', categoria: 'gabinete', precio_sugerido: 250, unidad: 'por estudio' },
    { codigo: 'GAB-003', nombre: 'Agudeza visual (Snellen + Ishihara)', categoria: 'gabinete', precio_sugerido: 150, unidad: 'por estudio' },
    { codigo: 'GAB-004', nombre: 'Electrocardiograma', categoria: 'gabinete', precio_sugerido: 300, unidad: 'por estudio' },
    { codigo: 'GAB-005', nombre: 'Rayos X de tórax PA', categoria: 'gabinete', precio_sugerido: 350, unidad: 'por estudio' },
    // Especial
    { codigo: 'ESP-001', nombre: 'Evaluación ergonómica REBA', categoria: 'especial', precio_sugerido: 800, unidad: 'por puesto' },
    { codigo: 'ESP-002', nombre: 'Evaluación psicosocial NOM-035', categoria: 'especial', precio_sugerido: 150, unidad: 'por trabajador' },
    { codigo: 'ESP-003', nombre: 'Programa de conservación auditiva NOM-011', categoria: 'especial', precio_sugerido: 1200, unidad: 'por programa' },
];

// =====================================================
// DTOs
// =====================================================

export interface CrearCotizacionDTO {
    empresa_id: string;
    cliente_nombre: string;
    cliente_rfc?: string;
    cliente_email?: string;
    cliente_telefono?: string;
    contacto_nombre?: string;
    fecha_vigencia: string;
    conceptos: Omit<ConceptoCotizacion, 'id' | 'importe'>[];
    notas?: string;
    terminos_condiciones?: string;
    moneda?: 'MXN' | 'USD';
    campania_id?: string;
}

export interface ActualizarCotizacionDTO {
    estado?: EstadoCotizacion;
    conceptos?: Omit<ConceptoCotizacion, 'id' | 'importe'>[];
    notas?: string;
    terminos_condiciones?: string;
    fecha_vigencia?: string;
    contacto_nombre?: string;
    cliente_email?: string;
    cliente_telefono?: string;
}

// =====================================================
// FILTROS
// =====================================================

export interface FiltrosCotizacion {
    empresa_id?: string;
    estado?: EstadoCotizacion;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
}
