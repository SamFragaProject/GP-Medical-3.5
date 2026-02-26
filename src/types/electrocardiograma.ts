/**
 * Tipos para el módulo de Electrocardiograma (ECG)
 * GPMedical ERP Pro
 */

export type ClasificacionECG =
    | 'normal'
    | 'anormalidad_leve'
    | 'anormalidad_moderada'
    | 'anormalidad_severa'
    | 'isquemia'
    | 'arritmia'
    | 'bloqueo';

export const CLASIFICACION_ECG_LABELS: Record<ClasificacionECG, string> = {
    normal: 'Normal',
    anormalidad_leve: 'Anormalidad Leve',
    anormalidad_moderada: 'Anormalidad Moderada',
    anormalidad_severa: 'Anormalidad Severa',
    isquemia: 'Isquemia',
    arritmia: 'Arritmia',
    bloqueo: 'Bloqueo',
};

export const CLASIFICACION_ECG_COLORS: Record<ClasificacionECG, { bg: string; text: string }> = {
    normal: { bg: 'bg-emerald-500/20', text: 'text-emerald-700' },
    anormalidad_leve: { bg: 'bg-amber-500/20', text: 'text-amber-700' },
    anormalidad_moderada: { bg: 'bg-orange-500/20', text: 'text-orange-700' },
    anormalidad_severa: { bg: 'bg-red-500/20', text: 'text-red-700' },
    isquemia: { bg: 'bg-rose-500/20', text: 'text-rose-700' },
    arritmia: { bg: 'bg-purple-500/20', text: 'text-purple-700' },
    bloqueo: { bg: 'bg-blue-500/20', text: 'text-blue-700' },
};

export interface Electrocardiograma {
    id: string;
    empresa_id: string;
    paciente_id: string;

    // Parámetros medidos
    ritmo: string; // ej. "Sinusal"
    frecuencia_cardiaca: number; // lpm
    eje_qrs: number; // grados
    onda_p: string;
    intervalo_pr: number; // ms
    complejo_qrs: number; // ms
    intervalo_qt: number; // ms
    intervalo_qtc: number; // ms (corregido)
    segmento_st: string;
    onda_t: string;

    // Conclusiones
    clasificacion: ClasificacionECG;
    hallazgos: string;
    interpretacion_medica?: string;

    calidad_prueba: 'Excelente' | 'Buena' | 'Regular' | 'Mala';

    // Auditoría
    realizado_por: string;
    fecha_estudio: string;
    created_at: string;
    updated_at: string;

    // Joined
    paciente?: { id: string; nombre: string; apellido_paterno: string };
}

export interface CrearElectrocardiogramaDTO {
    empresa_id: string;
    paciente_id: string;
    ritmo: string;
    frecuencia_cardiaca: number;
    eje_qrs: number;
    onda_p: string;
    intervalo_pr: number;
    complejo_qrs: number;
    intervalo_qt: number;
    intervalo_qtc: number;
    segmento_st: string;
    onda_t: string;
    hallazgos: string;
    interpretacion_medica?: string;
    clasificacion: ClasificacionECG;
    calidad_prueba: 'Excelente' | 'Buena' | 'Regular' | 'Mala';
}

export interface FiltrosElectrocardiograma {
    empresa_id?: string;
    paciente_id?: string;
    clasificacion?: ClasificacionECG;
    search?: string;
}
