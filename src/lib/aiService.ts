/**
 * Servicio de IA unificado para GPMedical
 * Soporta OpenAI, Gemini y Ollama con fallback automático
 */

import { withRetry, AIServiceError } from './errorHandler';

type AIProvider = 'openai' | 'gemini' | 'ollama';

interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface AIResponse {
    content: string;
    provider: AIProvider;
    model: string;
    tokens?: { input: number; output: number };
}

interface AIConfig {
    provider: AIProvider;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
}

// Configuraciones por defecto
const defaultConfigs: Record<AIProvider, Partial<AIConfig>> = {
    openai: {
        model: 'gpt-4o',
        baseUrl: 'https://api.openai.com/v1',
        temperature: 0.7,
        maxTokens: 2000,
    },
    gemini: {
        model: 'gemini-1.5-flash',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        temperature: 0.7,
        maxTokens: 2000,
    },
    ollama: {
        model: 'llama3.2',
        baseUrl: 'http://localhost:11434',
        temperature: 0.7,
        maxTokens: 2000,
    },
};

class AIService {
    private config: AIConfig;
    private fallbackProviders: AIProvider[] = ['openai', 'gemini', 'ollama'];

    constructor(config: Partial<AIConfig> = {}) {
        const provider = config.provider || this.detectBestProvider();
        this.config = {
            ...defaultConfigs[provider],
            ...config,
            provider,
        } as AIConfig;
    }

    private detectBestProvider(): AIProvider {
        // Prioridad: OpenAI > Gemini > Ollama
        if (import.meta.env.VITE_OPENAI_API_KEY) return 'openai';
        if (import.meta.env.VITE_GEMINI_API_KEY) return 'gemini';
        return 'ollama'; // Fallback a local
    }

    async chat(messages: AIMessage[], options?: Partial<AIConfig>): Promise<AIResponse> {
        const config = { ...this.config, ...options };

        return withRetry(
            async () => {
                switch (config.provider) {
                    case 'openai':
                        return this.callOpenAI(messages, config);
                    case 'gemini':
                        return this.callGemini(messages, config);
                    case 'ollama':
                        return this.callOllama(messages, config);
                    default:
                        throw new AIServiceError('Proveedor no soportado', config.provider);
                }
            },
            {
                maxRetries: 2,
                onRetry: (attempt) => {
                    console.log(`🔄 Reintentando llamada a ${config.provider}...`);
                },
            }
        );
    }

    private async callOpenAI(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
        const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY;

        if (!apiKey) {
            throw new AIServiceError('API key de OpenAI no configurada', 'openai');
        }

        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new AIServiceError(`OpenAI error: ${response.status}`, 'openai');
        }

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            provider: 'openai',
            model: config.model!,
            tokens: {
                input: data.usage?.prompt_tokens || 0,
                output: data.usage?.completion_tokens || 0,
            },
        };
    }

    private async callGemini(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
        const apiKey = config.apiKey || import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            throw new AIServiceError('API key de Gemini no configurada', 'gemini');
        }

        // Convertir formato de mensajes a Gemini
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const response = await fetch(
            `${config.baseUrl}/models/${config.model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: config.temperature,
                        maxOutputTokens: config.maxTokens,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new AIServiceError(`Gemini error: ${response.status}`, 'gemini');
        }

        const data = await response.json();

        return {
            content: data.candidates[0].content.parts[0].text,
            provider: 'gemini',
            model: config.model!,
        };
    }

    private async callOllama(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
        const response = await fetch(`${config.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.model,
                messages,
                stream: false,
                options: {
                    temperature: config.temperature,
                    num_predict: config.maxTokens,
                },
            }),
        });

        if (!response.ok) {
            throw new AIServiceError(`Ollama error: ${response.status}`, 'ollama');
        }

        const data = await response.json();

        return {
            content: data.message.content,
            provider: 'ollama',
            model: config.model!,
        };
    }

    // Método de conveniencia para preguntas simples
    async ask(question: string, systemPrompt?: string): Promise<string> {
        const messages: AIMessage[] = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        messages.push({ role: 'user', content: question });

        const response = await this.chat(messages);
        return response.content;
    }

    // Análisis de texto médico
    async analyzeMedicalText(text: string): Promise<{
        summary: string;
        entities: string[];
        recommendations: string[];
    }> {
        const systemPrompt = `Eres un asistente médico especializado en medicina del trabajo.
Analiza el siguiente texto y proporciona:
1. Un resumen conciso
2. Entidades médicas detectadas (diagnósticos, medicamentos, procedimientos)
3. Recomendaciones si aplica

Responde en formato JSON.`;

        const response = await this.ask(text, systemPrompt);

        try {
            return JSON.parse(response);
        } catch {
            return {
                summary: response,
                entities: [],
                recommendations: [],
            };
        }
    }

    // Generar recomendaciones de salud ocupacional
    async generateHealthRecommendations(patientData: {
        age: number;
        occupation: string;
        riskFactors: string[];
        recentExams: string[];
    }): Promise<string[]> {
        const prompt = `Basándote en los siguientes datos del trabajador:
- Edad: ${patientData.age}
- Ocupación: ${patientData.occupation}
- Factores de riesgo: ${patientData.riskFactors.join(', ')}
- Exámenes recientes: ${patientData.recentExams.join(', ')}

Genera 5 recomendaciones de salud ocupacional específicas y prácticas.
Responde solo con un array JSON de strings.`;

        const response = await this.ask(prompt);

        try {
            return JSON.parse(response);
        } catch {
            return response.split('\n').filter(Boolean);
        }
    }
}

// Singleton exportado
export const aiService = new AIService();

// Hook para React
export function useAI(config?: Partial<AIConfig>) {
    const service = config ? new AIService(config) : aiService;

    return {
        chat: service.chat.bind(service),
        ask: service.ask.bind(service),
        analyzeMedicalText: service.analyzeMedicalText.bind(service),
        generateHealthRecommendations: service.generateHealthRecommendations.bind(service),
    };
}

export default AIService;
