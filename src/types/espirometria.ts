/**
 * Tipos para el módulo de Espirometría
 * GPMedical ERP Pro
 *
 * Pruebas de función pulmonar con cálculo de %predicho
 * basado en NHANES III (Hankinson, 1999).
 */

// =====================================================
// ENUMS
// =====================================================

export type ClasificacionEspirometria =
    | 'normal'
    | 'restriccion_leve'
    | 'restriccion_moderada'
    | 'restriccion_severa'
    | 'obstruccion_leve'
    | 'obstruccion_moderada'
    | 'obstruccion_severa'
    | 'patron_mixto';

export const CLASIFICACION_LABELS: Record<ClasificacionEspirometria, string> = {
    normal: 'Normal',
    restriccion_leve: 'Restricción Leve',
    restriccion_moderada: 'Restricción Moderada',
    restriccion_severa: 'Restricción Severa',
    obstruccion_leve: 'Obstrucción Leve',
    obstruccion_moderada: 'Obstrucción Moderada',
    obstruccion_severa: 'Obstrucción Severa',
    patron_mixto: 'Patrón Mixto',
};

export const CLASIFICACION_COLORS: Record<ClasificacionEspirometria, { bg: string; text: string }> = {
    normal: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
    restriccion_leve: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
    restriccion_moderada: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
    restriccion_severa: { bg: 'bg-red-500/20', text: 'text-red-300' },
    obstruccion_leve: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
    obstruccion_moderada: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
    obstruccion_severa: { bg: 'bg-red-500/20', text: 'text-red-300' },
    patron_mixto: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
};

export type Sexo = 'masculino' | 'femenino';

// =====================================================
// TIPOS PRINCIPALES
// =====================================================

export interface Espirometria {
    id: string;
    empresa_id: string;
    paciente_id: string;
    // Datos demográficos para cálculo
    edad: number;
    sexo: Sexo;
    talla_cm: number;
    peso_kg: number;
    // Valores medidos
    fvc: number;        // Capacidad Vital Forzada (L)
    fev1: number;       // Volumen Espiratorio Forzado en 1s (L)
    fev1_fvc: number;   // Relación FEV1/FVC (%)
    pef: number;        // Flujo Espiratorio Pico (L/s)
    fef_2575?: number;  // Flujo Espiratorio Forzado 25-75% (L/s)
    // Valores predichos (calculados)
    fvc_predicho: number;
    fev1_predicho: number;
    fev1_fvc_predicho: number;
    // Porcentajes del predicho
    fvc_porcentaje: number;
    fev1_porcentaje: number;
    // Clasificación
    clasificacion: ClasificacionEspirometria;
    // Calidad de la prueba
    calidad_prueba: 'A' | 'B' | 'C' | 'D' | 'F';
    numero_intentos: number;
    // Referencia
    criterio_referencia: 'NHANES_III' | 'GLI_2012';
    // Observaciones clínicas
    broncodilatador: boolean;
    respuesta_bd?: {
        fev1_post: number;
        fvc_post: number;
        mejoria_porcentaje: number;
        positiva: boolean;
    };
    observaciones?: string;
    interpretacion_medica?: string;
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
// CÁLCULO DE PREDICHOS (NHANES III)
// =====================================================

export interface ParametrosPredicho {
    edad: number;
    talla_cm: number;
    sexo: Sexo;
}

/**
 * Ecuaciones de predicción NHANES III (Hankinson, 1999)
 * Coefficients for Mexican-American population
 */
export function calcularPredichos(params: ParametrosPredicho): {
    fvc_predicho: number;
    fev1_predicho: number;
    fev1_fvc_predicho: number;
} {
    const { edad, talla_cm, sexo } = params;
    const tallaMt = talla_cm / 100;

    if (sexo === 'masculino') {
        // Mexican-American Male (NHANES III)
        const fvc = -0.1933 + 0.00064 * edad - 0.000269 * (edad * edad) + 0.00018642 * (tallaMt * tallaMt * 10000);
        const fev1 = -0.7453 - 0.04106 * edad + 0.004477 * (tallaMt * 100);
        return {
            fvc_predicho: Math.max(0.5, fvc),
            fev1_predicho: Math.max(0.5, fev1),
            fev1_fvc_predicho: 78 - (0.15 * edad), // simplified
        };
    } else {
        // Mexican-American Female (NHANES III)
        const fvc = -0.3560 + 0.01870 * edad - 0.000382 * (edad * edad) + 0.00014815 * (tallaMt * tallaMt * 10000);
        const fev1 = 0.4529 - 0.02633 * edad + 0.003132 * (tallaMt * 100);
        return {
            fvc_predicho: Math.max(0.5, fvc),
            fev1_predicho: Math.max(0.5, fev1),
            fev1_fvc_predicho: 80 - (0.13 * edad),
        };
    }
}

/**
 * Clasificar resultado de espirometría según ATS/ERS
 */
export function clasificarEspirometria(
    fvc_porcentaje: number,
    fev1_porcentaje: number,
    fev1_fvc: number,
): ClasificacionEspirometria {
    const relacionNormal = fev1_fvc >= 70;

    if (relacionNormal && fvc_porcentaje >= 80) return 'normal';

    // Obstrucción
    if (!relacionNormal) {
        if (fev1_porcentaje >= 70) return 'obstruccion_leve';
        if (fev1_porcentaje >= 60) return 'obstruccion_moderada';
        if (fev1_porcentaje < 60) return 'obstruccion_severa';
    }

    // Restricción (FEV1/FVC normal pero FVC baja)
    if (relacionNormal && fvc_porcentaje < 80) {
        if (fvc_porcentaje >= 65) return 'restriccion_leve';
        if (fvc_porcentaje >= 50) return 'restriccion_moderada';
        return 'restriccion_severa';
    }

    return 'patron_mixto';
}

// =====================================================
// DTOs
// =====================================================

export interface CrearEspirometriaDTO {
    empresa_id: string;
    paciente_id: string;
    edad: number;
    sexo: Sexo;
    talla_cm: number;
    peso_kg: number;
    fvc: number;
    fev1: number;
    pef: number;
    fef_2575?: number;
    numero_intentos: number;
    calidad_prueba: 'A' | 'B' | 'C' | 'D' | 'F';
    broncodilatador: boolean;
    respuesta_bd?: {
        fev1_post: number;
        fvc_post: number;
    };
    observaciones?: string;
    episodio_id?: string;
    campania_id?: string;
}

export interface FiltrosEspirometria {
    empresa_id?: string;
    paciente_id?: string;
    clasificacion?: ClasificacionEspirometria;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
}
