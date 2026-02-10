/**
 * Servicio de Inteligencia Artificial Predictiva (CUDA + Ollama)
 * Conecta el frontend con los motores de IA locales
 * 
 * Endpoints:
 *  - /predict/individual  → Riesgo individual por paciente
 *  - /predict/population  → Análisis poblacional por empresa
 *  - /predict/nom-compliance → Evaluación de cumplimiento normativo
 *  - /                    → Health check con info de GPU
 */

const AI_API_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

export interface PredictionRequest {
    id: string;
    edad: number;
    examenes_vencidos: number;
    incapacidades_recientes: number;
    nivel_riesgo_puesto: 'bajo' | 'medio' | 'alto' | 'critico';
    es_fumador?: boolean;
    hipertension?: boolean;
    peso?: number;
    estatura?: number;
    antiguedad_anos?: number;
    area_trabajo?: string;
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

export interface NomComplianceRequest {
    empresa_id: string;
    nom_codigo: string; // e.g., 'NOM-035', 'NOM-030', 'NOM-036'
    datos_empresa: {
        num_trabajadores: number;
        sector: string;
        areas: string[];
        tiene_comision_seguridad?: boolean;
        tiene_programa_seguridad?: boolean;
    };
}

export interface NomComplianceResult {
    nom_codigo: string;
    nivel_cumplimiento: number; // 0-100
    requisitos_faltantes: string[];
    requisitos_cumplidos: string[];
    acciones_correctivas: string[];
    fecha_limite_estimada?: string;
    processing_time_ms: number;
}

export interface AIHealthStatus {
    online: boolean;
    device: string;
    gpu_name?: string;
    vram_total?: number;
    vram_used?: number;
    model_loaded?: string;
    version?: string;
    uptime_seconds?: number;
    latency_ms: number;
}

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────

/** Fetch con timeout y retry automático */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = 2,
    timeoutMs = 15000
): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timer);

            if (response.ok) return response;

            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
                throw new Error(`Error del servicio: ${response.status}`);
            }

            // Retry on server errors (5xx)
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }

            throw new Error(`Servicio IA respondió con error: ${response.status}`);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                if (attempt < retries) continue;
                throw new Error('Timeout: El servicio IA no respondió a tiempo');
            }
            if (attempt >= retries) throw error;
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
    }
    throw new Error('Reintentos agotados');
}

// ─────────────────────────────────────────────
// SERVICIO PRINCIPAL
// ─────────────────────────────────────────────

export const aiPredictiveService = {
    /**
     * Predicción de riesgo individual con GPU local
     */
    async obtenerPrediccionIndividual(data: PredictionRequest): Promise<PredictionResult | null> {
        try {
            const response = await fetchWithRetry(`${AI_API_URL}/predict/individual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('[IA] Error en predicción individual:', error);
            return null;
        }
    },

    /**
     * Análisis poblacional a gran escala
     */
    async obtenerPrediccionPoblacional(data: PopulationRequest): Promise<PopulationResult | null> {
        try {
            const response = await fetchWithRetry(`${AI_API_URL}/predict/population`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }, 1, 30000); // Más timeout para análisis grandes
            return await response.json();
        } catch (error) {
            console.error('[IA] Error en predicción poblacional:', error);
            return null;
        }
    },

    /**
     * Evaluación de cumplimiento normativo (NOM-030, 035, 036, etc.)
     */
    async evaluarCumplimientoNOM(data: NomComplianceRequest): Promise<NomComplianceResult | null> {
        try {
            const response = await fetchWithRetry(`${AI_API_URL}/predict/nom-compliance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('[IA] Error en evaluación NOM:', error);
            return null;
        }
    },

    /**
     * Health check detallado con información de GPU y latencia
     */
    async obtenerEstadoDetallado(): Promise<AIHealthStatus> {
        const start = Date.now();
        try {
            const response = await fetchWithRetry(`${AI_API_URL}/`, {}, 0, 5000);
            const latency = Date.now() - start;
            const data = await response.json();
            return {
                online: true,
                device: data.device || 'unknown',
                gpu_name: data.gpu_name,
                vram_total: data.vram_total,
                vram_used: data.vram_used,
                model_loaded: data.model_loaded,
                version: data.version,
                uptime_seconds: data.uptime_seconds,
                latency_ms: latency
            };
        } catch {
            return {
                online: false,
                device: 'none',
                latency_ms: Date.now() - start
            };
        }
    },

    /**
     * Verificación simple (boolean)
     */
    async verificarEstado(): Promise<boolean> {
        try {
            const response = await fetch(`${AI_API_URL}/`, { signal: AbortSignal.timeout(3000) });
            return response.ok;
        } catch {
            return false;
        }
    }
};
