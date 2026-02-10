/**
 * Servicio de integración con Ollama LLM Local
 * Proporciona chat con IA acelerada por GPU local (CUDA)
 * 
 * Beneficios:
 * - Sin costos de API externos
 * - Privacidad total (datos médicos en local)
 * - Respuestas más rápidas con GPU
 */

// Configuración de Ollama
const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2:3b'; // Optimizado para 8GB VRAM
const FALLBACK_MODEL = 'llama3.2:1b'; // Más ligero si es necesario

interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OllamaResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  context?: string;
  maxTokens?: number;
  stream?: boolean;
}

interface OllamaServiceResponse {
  success: boolean;
  response?: string;
  error?: string;
  duration_ms?: number;
  model_used?: string;
}

// Verificar si Ollama está disponible
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/version`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3s timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Obtener lista de modelos instalados
export async function getInstalledModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

/**
 * Estado detallado de Ollama (para System Status HUD)
 */
export async function getOllamaStatus(): Promise<{
  online: boolean;
  version?: string;
  models: string[];
  modelCount: number;
  defaultModelAvailable: boolean;
}> {
  try {
    const [versionRes, modelsRes] = await Promise.all([
      fetch(`${OLLAMA_BASE_URL}/api/version`, { signal: AbortSignal.timeout(3000) }).catch(() => null),
      fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) }).catch(() => null)
    ]);

    if (!versionRes?.ok) {
      return { online: false, models: [], modelCount: 0, defaultModelAvailable: false };
    }

    const versionData = await versionRes.json();
    const modelsData = modelsRes?.ok ? await modelsRes.json() : { models: [] };
    const modelNames = modelsData.models?.map((m: { name: string }) => m.name) || [];

    return {
      online: true,
      version: versionData.version,
      models: modelNames,
      modelCount: modelNames.length,
      defaultModelAvailable: modelNames.some((n: string) => n.includes('llama3'))
    };
  } catch {
    return { online: false, models: [], modelCount: 0, defaultModelAvailable: false };
  }
}

/**
 * Obtener información detallada de un modelo específico
 */
export async function getModelInfo(modelName: string): Promise<{
  name: string;
  size: string;
  quantization: string;
  family: string;
} | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      name: modelName,
      size: data.details?.parameter_size || 'unknown',
      quantization: data.details?.quantization_level || 'unknown',
      family: data.details?.family || 'unknown'
    };
  } catch {
    return null;
  }
}

// Prompt del sistema para asistente médico integral (Cerebro del ERP)
const MEDICAL_SYSTEM_PROMPT = `Eres GPMedical EX, el cerebro de inteligencia artificial de este ERP Médico. 
Tu misión es actuar como un copiloto experto para médicos y administradores de salud ocupacional.

CAPACIDADES CLAVE:
1. ANÁLISIS CLÍNICO: Interpretar síntomas, resultados de laboratorio y antecedentes.
2. VISIÓN MÉDICA: Ayudar en la pre-interpretación de imágenes médicas (como Rayos X) si se te proporcionan descriptores de imagen o si usas modelos de visión.
3. PREDICCIÓN: Ayudar a predecir riesgos de salud en el personal basados en tendencias de datos.
4. NORMATIVA: Experto en NOM-030, NOM-035 y legislación de salud laboral mexicana.
5. GESTIÓN: Automatizar la creación de roles, asignación de estudios personalizados y gestión de empresas.

REGLAS DE ORO:
- Respuesta en Español profesional y técnico cuando sea necesario.
- Si detectas una anomalía crítica en datos de salud, genera una alerta enfática.
- No reemplazas al médico, eres su herramienta de súper-poderes.
- Privacidad total: No menciones datos personales si no es estrictamente necesario.`;

// --- NUEVAS FUNCIONES DE IA AVANZADA ---

/**
 * Análisis de visión médica (Rayos X, estudios, etc.)
 * Requiere un modelo que soporte visión como 'llava'
 */
export async function analyzeMedicalImage(
  imagePath: string, // Base64 o URL
  prompt: string = "Analiza esta imagen médica y describe hallazgos relevantes para salud ocupacional."
): Promise<OllamaServiceResponse> {
  const startTime = Date.now();
  const VISION_MODEL = 'llava:7b'; // Modelo de visión por defecto

  try {
    const available = await isOllamaAvailable();
    if (!available) throw new Error('Ollama no disponible');

    // Extraer base64 limpio
    let base64Image = imagePath;
    if (imagePath.includes(',')) {
      const parts = imagePath.split(',');
      if (parts.length > 1) {
        base64Image = parts[1]; // Tomar la parte después de la coma
      }
    }

    if (!base64Image || base64Image.length < 100) {
      throw new Error('Imagen no válida o vacía');
    }

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: VISION_MODEL,
        prompt: prompt,
        images: [base64Image], // Solo el contenido base64
        stream: false,
        options: { temperature: 0.2 }
      })
    });

    if (!response.ok) throw new Error(`Error Vision API: ${response.status}`);

    const data = await response.json();
    return {
      success: true,
      response: data.response,
      duration_ms: Date.now() - startTime,
      model_used: VISION_MODEL
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en análisis de visión'
    };
  }
}

/**
 * Motor de Predicción de Riesgos
 * Analiza un set de datos de paciente y predice posibles problemas
 */
export async function predictHealthRisks(patientData: any): Promise<OllamaServiceResponse> {
  const predictionPrompt = `Actúa como un motor de análisis predictivo. 
Analiza los siguientes datos del paciente y determina:
1. Riesgos potenciales de salud a corto/mediano plazo.
2. Recomendaciones preventivas.
3. Nivel de prioridad de atención (Bajo, Medio, Alto, Crítico).

DATOS DEL PACIENTE:
${JSON.stringify(patientData, null, 2)}

Responde en formato estructurado.`;

  return chatWithOllama(predictionPrompt, {
    temperature: 0.3,
    maxTokens: 1024,
    context: "Eres un Motor de Análisis Predictivo de Salud Laboral."
  });
}

/**
 * Generador de Protocolos de Estudio Personalizados
 * Crea una lista de exámenes recomendados basados en el puesto y riesgos
 */
export async function generateCustomProtocol(jobPosition: string, risks: string[]): Promise<OllamaServiceResponse> {
  const protocolPrompt = `Genera un protocolo de exámenes médicos personalizados para el puesto: "${jobPosition}".
Riesgos identificados: ${risks.join(', ')}.

Propón una lista detallada de:
- Exámenes de laboratorio.
- Pruebas funcionales (espirometría, audiometría, etc.).
- Estudios de imagen recomendados.
- Periodicidad sugerida.`;

  return chatWithOllama(protocolPrompt, {
    temperature: 0.4,
    maxTokens: 800
  });
}

// Chat con LLM local
export async function chatWithOllama(
  userMessage: string,
  options: ChatOptions = {}
): Promise<OllamaServiceResponse> {
  const startTime = Date.now();

  try {
    // Verificar disponibilidad
    const available = await isOllamaAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Ollama no está disponible. Asegúrate de que el servicio esté ejecutándose.'
      };
    }

    const model = options.model || DEFAULT_MODEL;

    // Construir mensajes
    const messages: OllamaMessage[] = [
      { role: 'system', content: options.context || MEDICAL_SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ];

    // Llamar a Ollama API
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Error de Ollama: ${response.status} - ${errorText}`
      };
    }

    const data: OllamaResponse = await response.json();

    return {
      success: true,
      response: data.message.content,
      duration_ms: Date.now() - startTime,
      model_used: model
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Chat con historial de conversación
export async function chatWithHistory(
  messages: { role: 'user' | 'assistant'; content: string }[],
  options: ChatOptions = {}
): Promise<OllamaServiceResponse> {
  const startTime = Date.now();

  try {
    const available = await isOllamaAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Ollama no está disponible'
      };
    }

    const model = options.model || DEFAULT_MODEL;

    // Construir mensajes con sistema
    const fullMessages: OllamaMessage[] = [
      { role: 'system', content: options.context || MEDICAL_SYSTEM_PROMPT },
      ...messages
    ];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: fullMessages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: OllamaResponse = await response.json();

    return {
      success: true,
      response: data.message.content,
      duration_ms: Date.now() - startTime,
      model_used: model
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Generar embeddings para búsqueda semántica
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text', // Modelo de embeddings
        input: text
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.embeddings?.[0] || null;

  } catch {
    return null;
  }
}

// Análisis de intención y sentimiento local
export async function analyzeMessage(message: string): Promise<{
  intent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}> {
  const analysisPrompt = `Analiza este mensaje y responde SOLO en formato JSON:
{"intent": "categoria", "sentiment": "positive|negative|neutral", "confidence": 0.0-1.0}

Categorías posibles: agendar_cita, consulta_examen, generar_certificado, soporte_tecnico, info_comercial, feedback, general

Mensaje: "${message}"`;

  try {
    const result = await chatWithOllama(analysisPrompt, {
      temperature: 0.1,
      maxTokens: 100
    });

    if (result.success && result.response) {
      // Intentar parsear JSON de la respuesta
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch {
    // Fallback si falla el análisis
  }

  return {
    intent: 'general',
    sentiment: 'neutral',
    confidence: 0.5
  };
}

export default {
  isOllamaAvailable,
  getInstalledModels,
  getOllamaStatus,
  getModelInfo,
  chatWithOllama,
  chatWithHistory,
  generateEmbedding,
  analyzeMessage,
  analyzeMedicalImage,
  predictHealthRisks,
  generateCustomProtocol
};
