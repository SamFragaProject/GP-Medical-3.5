import { dataService } from './dataService';

export interface PredictiveAnalysis {
    paciente_id: string;
    score_riesgo: number;
    probabilidad_lesion: number;
    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
    recomendaciones: string[];
    model_info: string;
    processing_time_ms: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// URL base del servicio Python local
// En un entorno dockerizado sería 'http://predictive-service:8000'
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

class AIService {
    private isOnline: boolean = false;

    constructor() {
        this.checkConnection();
    }

    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${AI_SERVICE_URL}/`);
            const data = await response.json();
            this.isOnline = data.status === 'online';
            return this.isOnline;
        } catch (error) {
            this.isOnline = false;
            return false;
        }
    }

    // Análisis predictivo de riesgo para un paciente
    async getRiskAnalysis(pacienteId: string): Promise<PredictiveAnalysis | null> {
        try {
            // 1. Obtener datos reales del paciente desde Supabase
            const paciente = await dataService.pacientes.getById(pacienteId);

            // 2. Extraer o calcular métricas para el modelo
            // Nota: En un caso real, esto vendría de tablas de historial médico
            const modelInput = {
                id: paciente.id,
                edad: this.calcularEdad(paciente.fecha_nacimiento),
                examenes_vencidos: Math.floor(Math.random() * 3), // Simulado por ahora si no hay datos
                incapacidades_recientes: 0,
                nivel_riesgo_puesto: 'medio', // Idealmente vendría de relacion con 'puestos_trabajo'
                es_fumador: false,
                hipertension: false
            };

            // 3. Llamar al servicio Python
            const response = await fetch(`${AI_SERVICE_URL}/predict/individual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modelInput),
            });

            if (!response.ok) throw new Error('Error en servicio de predicción');

            const data = await response.json();
            return data as PredictiveAnalysis;

        } catch (error) {
            console.error('❌ Error getting AI prediction:', error);
            return null;
        }
    }

    // Chat con Asistente Médico (Ollama)
    // Nota: Si el endpoint /chat no existe en main.py, esto fallará hasta que se implemente en Python
    async sendMessageToChat(history: ChatMessage[]): Promise<string> {
        // Si no hay endpoint real, usamos una respuesta simulada por seguridad
        // hasta que se integre Ollama en el backend
        try {
            const response = await fetch(`${AI_SERVICE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch (e) {
            console.warn("Chat endpoint not reachable, using fallback mockup");
        }

        // Fallback Mockup
        return "El servidor de IA para chat (Ollama) no está respondiendo en este momento. Por favor verifica que 'main.py' tenga el endpoint /chat configurado.";
    }

    // Análisis clínico para sugerir dictamen y restricciones
    async analyzeClinicalNote(soap: { s: string, o: string, a: string, p: string }) {
        try {
            const response = await fetch(`${AI_SERVICE_URL}/predict/clinical-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(soap),
            });

            if (!response.ok) throw new Error('Error en análisis clínico IA');

            return await response.json();
        } catch (error) {
            console.error('❌ Error analyzing clinical note:', error);
            return null;
        }
    }

    private calcularEdad(fechaNacimiento?: string): number {
        if (!fechaNacimiento) return 30; // Edad default
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }
}

export const aiService = new AIService();
export default aiService;
