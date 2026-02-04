/**
 * Servicio de Inteligencia Artificial Predictiva (CUDA)
 * Conecta el frontend con el servicio local de Python
 */

const AI_API_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export interface PredictionRequest {
    id: string;
    edad: number;
    examenes_vencidos: number;
    incapacidades_recientes: number;
    nivel_riesgo_puesto: 'bajo' | 'medio' | 'alto' | 'critico';
    es_fumador?: boolean;
    hipertension?: boolean;
}

export interface PredictionResult {
    paciente_id: string;
    score_riesgo: number;
    probabilidad_lesion: number;
    nivel_riesgo: string;
    recomendaciones: string[];
    model_info: string;
    processing_time_ms: number;
}

export interface PopulationRequest {
    enterprise_id: string;
    patients: PredictionRequest[];
}

export interface AreaInsight {
    area: string;
    score_promedio: number;
    cantidad_pacientes: number;
    tendencia: string;
    alertas_criticas: number;
    recomendacion_ia: string;
}

export interface PopulationResult {
    enterprise_id: string;
    total_patients: number;
    average_risk_score: number;
    insights_por_area: AreaInsight[];
    global_insights: string[];
    processing_time_ms: number;
}

export const aiPredictiveService = {
    /**
     * Obtiene la predicción de riesgo para un paciente usando la GPU local
     */
    async obtenerPrediccionIndividual(data: PredictionRequest): Promise<PredictionResult | null> {
        try {
            const response = await fetch(`${AI_API_URL}/predict/individual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Servicio de IA local no disponible');

            return await response.json();
        } catch (error) {
            console.error('Error en IA Predictiva Individual:', error);
            return null;
        }
    },

    /**
     * Obtiene un análisis a gran escala de toda la población de una empresa
     */
    async obtenerPrediccionPoblacional(data: PopulationRequest): Promise<PopulationResult | null> {
        try {
            const response = await fetch(`${AI_API_URL}/predict/population`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Servicio de IA local no disponible');

            return await response.json();
        } catch (error) {
            console.error('Error en IA Predictiva Poblacional:', error);
            return null;
        }
    },

    /**
     * Verifica si el servicio de IA local está activo
     */
    async verificarEstado(): Promise<boolean> {
        try {
            const response = await fetch(`${AI_API_URL}/`);
            return response.ok;
        } catch {
            return false;
        }
    }
};
