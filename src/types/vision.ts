/**
 * Tipos para el módulo de Estudios Visuales
 * GPMedical ERP Pro
 *
 * Agudeza visual (Snellen), prueba de colores (Ishihara),
 * campimetría y estereopsis.
 */

// =====================================================
// ENUMS
// =====================================================

export type ClasificacionVisual =
    | 'normal'
    | 'deficiencia_leve'
    | 'deficiencia_moderada'
    | 'deficiencia_severa'
    | 'ceguera_legal';

export const CLASIFICACION_VISUAL_LABELS: Record<ClasificacionVisual, string> = {
    normal: 'Visión Normal',
    deficiencia_leve: 'Deficiencia Leve',
    deficiencia_moderada: 'Deficiencia Moderada',
    deficiencia_severa: 'Deficiencia Severa',
    ceguera_legal: 'Ceguera Legal',
};

export const CLASIFICACION_VISUAL_COLORS: Record<ClasificacionVisual, { bg: string; text: string }> = {
    normal: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
    deficiencia_leve: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
    deficiencia_moderada: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
    deficiencia_severa: { bg: 'bg-red-500/20', text: 'text-red-300' },
    ceguera_legal: { bg: 'bg-red-700/20', text: 'text-red-200' },
};

// Valores Snellen estándar
export const SNELLEN_OPTIONS = [
    '20/10', '20/15', '20/20', '20/25', '20/30', '20/40',
    '20/50', '20/60', '20/70', '20/80', '20/100', '20/200',
    '20/400', 'CF', 'MM', 'PL', 'NPL'
] as const;

export type SnellenValue = typeof SNELLEN_OPTIONS[number];

// =====================================================
// TIPOS PRINCIPALES
// =====================================================

export interface EstudioVisual {
    id: string;
    empresa_id: string;
    paciente_id: string;
    // Agudeza Visual - Ojo Derecho
    od_sin_correccion: SnellenValue;
    od_con_correccion?: SnellenValue;
    od_estenopeico?: SnellenValue;
    // Agudeza Visual - Ojo Izquierdo
    oi_sin_correccion: SnellenValue;
    oi_con_correccion?: SnellenValue;
    oi_estenopeico?: SnellenValue;
    // Agudeza Visual - Ambos
    ao_sin_correccion?: SnellenValue;
    ao_con_correccion?: SnellenValue;
    // Ishihara (test de colores)
    ishihara_placas_total: number;       // típico: 14 o 38
    ishihara_placas_correctas: number;
    ishihara_resultado: 'normal' | 'daltonismo_rojo_verde' | 'daltonismo_azul_amarillo' | 'acromatopsia';
    // Campimetría (opcional)
    campimetria_realizada: boolean;
    campimetria_od?: string;  // Descripción de campos
    campimetria_oi?: string;
    campimetria_hallazgos?: string;
    // Estereopsis (opcional)
    estereopsis_segundos_arco?: number;
    estereopsis_normal?: boolean;
    // Uso de lentes
    usa_lentes: boolean;
    tipo_lentes?: 'armazon' | 'contacto' | 'ambos';
    graduacion_od?: string;
    graduacion_oi?: string;
    // Clasificación
    clasificacion: ClasificacionVisual;
    apto_para_puesto: boolean;
    restricciones?: string[];
    // Observaciones
    observaciones?: string;
    recomendaciones?: string;
    referencia_oftalmologo: boolean;
    // Relaciones
    episodio_id?: string;
    campania_id?: string;
    // Auditoría
    realizado_por: string;
    fecha_estudio: string;
    created_at: string;
    updated_at: string;
    // Joined
    paciente?: { id: string; nombre: string; apellido_paterno: string };
}

// =====================================================
// HELPERS
// =====================================================

const SNELLEN_MAP: Record<string, number> = {
    '20/10': 2.0, '20/15': 1.33, '20/20': 1.0, '20/25': 0.8,
    '20/30': 0.67, '20/40': 0.5, '20/50': 0.4, '20/60': 0.33,
    '20/70': 0.29, '20/80': 0.25, '20/100': 0.2, '20/200': 0.1,
    '20/400': 0.05, 'CF': 0.02, 'MM': 0.01, 'PL': 0.005, 'NPL': 0,
};

/**
 * Clasificar resultado visual según agudeza Snellen
 */
export function clasificarVision(
    mejor_ojo_sin_correccion: SnellenValue,
    mejor_ojo_con_correccion?: SnellenValue,
): ClasificacionVisual {
    const valor = SNELLEN_MAP[mejor_ojo_con_correccion || mejor_ojo_sin_correccion] ?? 0;

    if (valor >= 0.8) return 'normal';             // >= 20/25
    if (valor >= 0.5) return 'deficiencia_leve';    // 20/40
    if (valor >= 0.25) return 'deficiencia_moderada'; // >= 20/80
    if (valor >= 0.1) return 'deficiencia_severa';   // >= 20/200
    return 'ceguera_legal';                          // < 20/200
}

// =====================================================
// DTOs
// =====================================================

export interface CrearEstudioVisualDTO {
    empresa_id: string;
    paciente_id: string;
    od_sin_correccion: SnellenValue;
    od_con_correccion?: SnellenValue;
    oi_sin_correccion: SnellenValue;
    oi_con_correccion?: SnellenValue;
    ishihara_placas_total: number;
    ishihara_placas_correctas: number;
    usa_lentes: boolean;
    tipo_lentes?: 'armazon' | 'contacto' | 'ambos';
    campimetria_realizada: boolean;
    estereopsis_segundos_arco?: number;
    observaciones?: string;
    referencia_oftalmologo: boolean;
    episodio_id?: string;
    campania_id?: string;
}

export interface FiltrosVision {
    empresa_id?: string;
    paciente_id?: string;
    clasificacion?: ClasificacionVisual;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
}
