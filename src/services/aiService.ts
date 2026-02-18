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

// =============================================
// OPENAI: Job Position Analysis (Occupational Risks)
// =============================================
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

export interface OccupationalRisks {
    fisicos: { ruidos: boolean; vibraciones: boolean; iluminacion: boolean; radiaciones: boolean; presiones: boolean; temperaturas: boolean }
    quimicos: { gases: boolean; vapores: boolean; humos: boolean; particulas: boolean; aerosoles: boolean; polvos: boolean }
    ergonomicos: { posturasInadecuadas: boolean; cargasManuales: boolean; sobreesfuerzoFisico: boolean; actividadesRepetitivas: boolean; visual: boolean }
    biologicos: { bacterias: boolean; virus: boolean; hongos: boolean; parasitos: boolean }
    psicosociales: { trabajoMonotono: boolean; trabajoDuroBajoPresion: boolean; jornadaLaboralExtensa: boolean }
    electricos: { bajaTension: boolean; altaTension: boolean; electricidadEstatica: boolean }
    mecanicos: { mecanismosEnMovimiento: boolean; proyeccionParticulas: boolean; herramientasManuales: boolean }
    locativos: { superficiales: boolean; almacenamiento: boolean; estructuras: boolean; instalaciones: boolean; espacioDeTrabajo: boolean; alturas: boolean }
}

export interface JobDetails {
    descripcionFunciones: string
    maquinasEquiposHerramientas: string
    eppRecomendado: string[]
}

export interface AIJobAnalysis {
    riesgos: OccupationalRisks
    detalles: JobDetails
}

export const EMPTY_RISKS: OccupationalRisks = {
    fisicos: { ruidos: false, vibraciones: false, iluminacion: false, radiaciones: false, presiones: false, temperaturas: false },
    quimicos: { gases: false, vapores: false, humos: false, particulas: false, aerosoles: false, polvos: false },
    ergonomicos: { posturasInadecuadas: false, cargasManuales: false, sobreesfuerzoFisico: false, actividadesRepetitivas: false, visual: false },
    biologicos: { bacterias: false, virus: false, hongos: false, parasitos: false },
    psicosociales: { trabajoMonotono: false, trabajoDuroBajoPresion: false, jornadaLaboralExtensa: false },
    electricos: { bajaTension: false, altaTension: false, electricidadEstatica: false },
    mecanicos: { mecanismosEnMovimiento: false, proyeccionParticulas: false, herramientasManuales: false },
    locativos: { superficiales: false, almacenamiento: false, estructuras: false, instalaciones: false, espacioDeTrabajo: false, alturas: false },
}

export const RISK_CATEGORIES: Record<string, { label: string; emoji: string; items: Record<string, string> }> = {
    fisicos: { label: 'Físicos', emoji: '🔊', items: { ruidos: 'Ruidos', vibraciones: 'Vibraciones', iluminacion: 'Iluminación', radiaciones: 'Radiaciones', presiones: 'Presiones', temperaturas: 'Temperaturas' } },
    quimicos: { label: 'Químicos', emoji: '⚗️', items: { gases: 'Gases', vapores: 'Vapores', humos: 'Humos', particulas: 'Partículas', aerosoles: 'Aerosoles', polvos: 'Polvos' } },
    ergonomicos: { label: 'Ergonómicos', emoji: '🦴', items: { posturasInadecuadas: 'Posturas Inadecuadas', cargasManuales: 'Cargas Manuales', sobreesfuerzoFisico: 'Sobreesfuerzo Físico', actividadesRepetitivas: 'Actividades Repetitivas', visual: 'Visual' } },
    biologicos: { label: 'Biológicos', emoji: '🦠', items: { bacterias: 'Bacterias', virus: 'Virus', hongos: 'Hongos', parasitos: 'Parásitos' } },
    psicosociales: { label: 'Psicosociales', emoji: '🧠', items: { trabajoMonotono: 'Trabajo Monótono', trabajoDuroBajoPresion: 'Trabajo Bajo Presión', jornadaLaboralExtensa: 'Jornada Extensa' } },
    electricos: { label: 'Eléctricos', emoji: '⚡', items: { bajaTension: 'Baja Tensión', altaTension: 'Alta Tensión', electricidadEstatica: 'Electricidad Estática' } },
    mecanicos: { label: 'Mecánicos', emoji: '⚙️', items: { mecanismosEnMovimiento: 'Mecanismos en Movimiento', proyeccionParticulas: 'Proyección de Partículas', herramientasManuales: 'Herramientas Manuales' } },
    locativos: { label: 'Locativos', emoji: '🏗️', items: { superficiales: 'Superficiales', almacenamiento: 'Almacenamiento', estructuras: 'Estructuras', instalaciones: 'Instalaciones', espacioDeTrabajo: 'Espacio de Trabajo', alturas: 'Alturas' } },
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!OPENAI_API_KEY) throw new Error('No se encontró VITE_OPENAI_API_KEY en .env')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        }),
    })
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Error OpenAI: ${response.status}`)
    }
    const data = await response.json()
    return data.choices[0]?.message?.content || '{}'
}

export async function analyzeJobPosition(puesto: string): Promise<AIJobAnalysis> {
    const systemPrompt = `Eres un experto en Salud Ocupacional y Medicina del Trabajo en México.
Analiza un puesto de trabajo y determina:
1. Los riesgos laborales a los que está expuesto el trabajador (solo marca true si el riesgo es DIRECTO y COMÚN para ese puesto)
2. Una descripción de sus funciones
3. Máquinas, equipos y herramientas que usa
4. EPP recomendado

Responde SOLO en JSON con esta estructura:
{
  "riesgos": {
    "fisicos": { "ruidos": bool, "vibraciones": bool, "iluminacion": bool, "radiaciones": bool, "presiones": bool, "temperaturas": bool },
    "quimicos": { "gases": bool, "vapores": bool, "humos": bool, "particulas": bool, "aerosoles": bool, "polvos": bool },
    "ergonomicos": { "posturasInadecuadas": bool, "cargasManuales": bool, "sobreesfuerzoFisico": bool, "actividadesRepetitivas": bool, "visual": bool },
    "biologicos": { "bacterias": bool, "virus": bool, "hongos": bool, "parasitos": bool },
    "psicosociales": { "trabajoMonotono": bool, "trabajoDuroBajoPresion": bool, "jornadaLaboralExtensa": bool },
    "electricos": { "bajaTension": bool, "altaTension": bool, "electricidadEstatica": bool },
    "mecanicos": { "mecanismosEnMovimiento": bool, "proyeccionParticulas": bool, "herramientasManuales": bool },
    "locativos": { "superficiales": bool, "almacenamiento": bool, "estructuras": bool, "instalaciones": bool, "espacioDeTrabajo": bool, "alturas": bool }
  },
  "detalles": {
    "descripcionFunciones": "texto",
    "maquinasEquiposHerramientas": "texto",
    "eppRecomendado": ["casco", "lentes", ...]
  }
}`
    const raw = await callOpenAI(systemPrompt, `Analiza el puesto de trabajo: "${puesto}"`)
    const parsed = JSON.parse(raw) as AIJobAnalysis
    return {
        riesgos: { ...EMPTY_RISKS, ...parsed.riesgos },
        detalles: {
            descripcionFunciones: parsed.detalles?.descripcionFunciones || '',
            maquinasEquiposHerramientas: parsed.detalles?.maquinasEquiposHerramientas || '',
            eppRecomendado: parsed.detalles?.eppRecomendado || [],
        },
    }
}
