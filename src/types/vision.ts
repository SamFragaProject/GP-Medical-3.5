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

// Escala de Jaeger (visión cercana)
export const JAEGER_OPTIONS = [
    'J1', 'J1+', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7',
    'J8', 'J9', 'J10', 'J11', 'J12', 'J13', 'J14',
    'J15', 'J16', 'J17', 'J18', 'J19', 'J20', 'J20+'
] as const;

export type JaegerValue = typeof JAEGER_OPTIONS[number];

/**
 * Escala de Jaeger completa con equivalencias clínicas.
 * Distancia de lectura estándar: 35 cm (14 pulgadas).
 */
export interface JaegerEntry {
    jaeger: JaegerValue;
    snellenNear: string;        // Equivalente Snellen cercano
    snellenFar: string;         // Equivalente Snellen lejano  
    pointSize: number;          // Tamaño en puntos tipográficos
    mEquivalent: string;        // Equivalente métrico (M)
    logMAR: number;             // LogMAR value
    description: string;        // Descripción clínica
    category: 'normal' | 'leve' | 'moderada' | 'severa' | 'profunda';
}

export const JAEGER_SCALE: JaegerEntry[] = [
    { jaeger: 'J1', snellenNear: '20/20', snellenFar: '20/20', pointSize: 3, mEquivalent: '0.37 M', logMAR: 0.0, description: 'Visión cercana excelente. Lee texto fino sin dificultad.', category: 'normal' },
    { jaeger: 'J1+', snellenNear: '20/25', snellenFar: '20/25', pointSize: 4, mEquivalent: '0.50 M', logMAR: 0.1, description: 'Visión cercana muy buena. Lectura cómoda de periódico.', category: 'normal' },
    { jaeger: 'J2', snellenNear: '20/30', snellenFar: '20/30', pointSize: 5, mEquivalent: '0.62 M', logMAR: 0.18, description: 'Visión cercana buena. Lee revistas y libros sin problema.', category: 'normal' },
    { jaeger: 'J3', snellenNear: '20/40', snellenFar: '20/40', pointSize: 6, mEquivalent: '0.75 M', logMAR: 0.30, description: 'Leve reducción. Puede requerir mejor iluminación para letra chica.', category: 'leve' },
    { jaeger: 'J4', snellenNear: '20/40', snellenFar: '20/40', pointSize: 7, mEquivalent: '0.87 M', logMAR: 0.30, description: 'Deficiencia leve. Lectura posible pero con fatiga en periodos largos.', category: 'leve' },
    { jaeger: 'J5', snellenNear: '20/50', snellenFar: '20/50', pointSize: 8, mEquivalent: '1.00 M', logMAR: 0.40, description: 'Necesita texto mediano. Considerar corrección óptica.', category: 'leve' },
    { jaeger: 'J6', snellenNear: '20/50', snellenFar: '20/50', pointSize: 9, mEquivalent: '1.12 M', logMAR: 0.40, description: 'Solo lee texto mediano-grande. Se recomienda evaluación.', category: 'leve' },
    { jaeger: 'J7', snellenNear: '20/60', snellenFar: '20/60', pointSize: 10, mEquivalent: '1.25 M', logMAR: 0.48, description: 'Deficiencia moderada. Dificultad con texto estándar.', category: 'moderada' },
    { jaeger: 'J8', snellenNear: '20/70', snellenFar: '20/70', pointSize: 11, mEquivalent: '1.37 M', logMAR: 0.54, description: 'Requiere texto grande. Limitación en actividades de lectura.', category: 'moderada' },
    { jaeger: 'J9', snellenNear: '20/70', snellenFar: '20/70', pointSize: 12, mEquivalent: '1.50 M', logMAR: 0.54, description: 'Solo lee letra 12pt o mayor. Referir a oftalmología.', category: 'moderada' },
    { jaeger: 'J10', snellenNear: '20/80', snellenFar: '20/80', pointSize: 13, mEquivalent: '1.62 M', logMAR: 0.60, description: 'Deficiencia significativa. Dificultad laboral con lectura.', category: 'moderada' },
    { jaeger: 'J11', snellenNear: '20/100', snellenFar: '20/100', pointSize: 14, mEquivalent: '1.75 M', logMAR: 0.70, description: 'Solo lee texto grande. Precisa corrección urgente.', category: 'severa' },
    { jaeger: 'J12', snellenNear: '20/100', snellenFar: '20/100', pointSize: 16, mEquivalent: '2.00 M', logMAR: 0.70, description: 'Severa limitación. Texto menor a 16pt es ilegible.', category: 'severa' },
    { jaeger: 'J13', snellenNear: '20/130', snellenFar: '20/130', pointSize: 18, mEquivalent: '2.25 M', logMAR: 0.82, description: 'Limitación severa de lectura. Requiere ayudas ópticas.', category: 'severa' },
    { jaeger: 'J14', snellenNear: '20/160', snellenFar: '20/160', pointSize: 21, mEquivalent: '2.62 M', logMAR: 0.90, description: 'Casi no lee. Solo titulares grandes.', category: 'severa' },
    { jaeger: 'J15', snellenNear: '20/200', snellenFar: '20/200', pointSize: 24, mEquivalent: '3.00 M', logMAR: 1.00, description: 'Ceguera legal cercana. No lee texto estándar.', category: 'profunda' },
    { jaeger: 'J16', snellenNear: '20/250', snellenFar: '20/250', pointSize: 28, mEquivalent: '3.50 M', logMAR: 1.10, description: 'Deficiencia profunda. Solo identifica texto muy grande.', category: 'profunda' },
    { jaeger: 'J17', snellenNear: '20/300', snellenFar: '20/300', pointSize: 32, mEquivalent: '4.00 M', logMAR: 1.18, description: 'Incapaz de lectura funcional. Derivar urgente.', category: 'profunda' },
    { jaeger: 'J18', snellenNear: '20/350', snellenFar: '20/350', pointSize: 36, mEquivalent: '4.50 M', logMAR: 1.24, description: 'Solo percibe letras gigantes.', category: 'profunda' },
    { jaeger: 'J19', snellenNear: '20/400', snellenFar: '20/400', pointSize: 40, mEquivalent: '5.00 M', logMAR: 1.30, description: 'Percepción mínima de texto.', category: 'profunda' },
    { jaeger: 'J20', snellenNear: '20/500', snellenFar: '20/500', pointSize: 48, mEquivalent: '6.00 M', logMAR: 1.40, description: 'No lee. Solo detecta formas grandes.', category: 'profunda' },
    { jaeger: 'J20+', snellenNear: '20/800', snellenFar: '20/800', pointSize: 60, mEquivalent: '8.00 M', logMAR: 1.60, description: 'Sin capacidad funcional de lectura.', category: 'profunda' },
];

export const JAEGER_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    leve: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    moderada: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    severa: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    profunda: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
};

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
    // Visión Cercana (Jaeger)
    od_jaeger?: JaegerValue;
    oi_jaeger?: JaegerValue;
    ao_jaeger?: JaegerValue;
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
    od_jaeger?: JaegerValue;
    oi_jaeger?: JaegerValue;
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
