/**
 * ============================================================
 * Servicio de Análisis de Documentos Médicos con Gemini AI
 * BASADO EN: erp-consolidador-de-reportes-médicos-ia (La que sí funciona)
 * ============================================================
 */
import { GoogleGenAI, Type, Part } from "@google/genai";
import { trackUsage } from './aiUsageTracker';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

// ── Model Config — gemini-2.0-flash es el modelo activo y válido ──
const MODEL_NAME = 'gemini-2.0-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-lite';

const generateContentWithRetry = async (params: any, retries = 3, delay = 2000): Promise<any> => {
    let currentModel = params.model || MODEL_NAME;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await ai.models.generateContent({
                ...params,
                model: currentModel,
            });
            return response;
        } catch (error: any) {
            console.warn(`[AI Attempt ${i + 1}] failed with model ${currentModel}:`, error);

            // If it's a quota error (429) try fallback
            if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
                if (currentModel === MODEL_NAME) {
                    console.log(`Falling back to ${FALLBACK_MODEL} due to quota`);
                    currentModel = FALLBACK_MODEL;
                }
            }

            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

// ── Tipos de datos — Motor Pro ──
export interface LabResult {
    name: string;
    parametro: string;   // Alias para compatibilidad
    value: string | any;
    resultado: string;   // Alias para compatibilidad
    unit: string;
    unidad: string;      // Alias para compatibilidad
    range: string;
    rango: string;       // Alias para compatibilidad
    description: string;
    observacion: string; // Alias para compatibilidad
    visualizationType: 'gauge' | 'bar_chart' | 'list' | 'radar' | 'line_chart' | 'simple' | 'table_row' | 'pie_chart';
    category: string;
    categoria: string;   // Alias para compatibilidad
    subCategory?: string;
}

// Alias para compatibilidad con AnalizadorDocumentos.tsx y otros
export type DatoClinico = LabResult;

export interface PatientData {
    name?: string;
    birthDate?: string;
    age?: string;
    gender?: string;
    reportDate?: string;
    folio?: string;
    curp?: string;
    nss?: string;
    rfc?: string;
}

export interface StructuredMedicalData {
    patientData?: PatientData;
    results: LabResult[];
    summary: string;
}

// ── Tipos legacy para compatibilidad con el resto del ERP ──
export interface FileItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'done' | 'error' | 'completed';
    category?: string;
    result?: StructuredMedicalData;
}

export interface ExtractedDocumentData extends StructuredMedicalData {
    _confianza: number;
    _campos_encontrados: string[];
    _campos_faltantes: string[];
}

// ── Esquemas de Gemini ──
const patientDataSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        birthDate: { type: Type.STRING },
        age: { type: Type.STRING },
        gender: { type: Type.STRING },
        reportDate: { type: Type.STRING },
        folio: { type: Type.STRING },
        curp: { type: Type.STRING },
        nss: { type: Type.STRING },
        rfc: { type: Type.STRING },
    },
};

const labResultsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            value: { type: Type.STRING },
            unit: { type: Type.STRING },
            range: { type: Type.STRING },
            description: { type: Type.STRING },
            visualizationType: { type: Type.STRING },
            category: { type: Type.STRING },
            subCategory: { type: Type.STRING },
        },
        required: ["name", "value", "unit", "range", "visualizationType", "category", "description"],
    },
};

// ── Configuración de Prompts por Sección (Copiados del Consolidador Pro - MÁXIMA PRECISIÓN) ──
const getSectionConfig = (sectionId: string) => {
    switch (sectionId) {
        case 'laboratorio':
        case 'laboratories':
            return {
                prompt: "**CRÍTICO Y OBLIGATORIO**: Eres un experto en análisis de laboratorios. Extrae todos los resultados manteniendo la jerarquía original del documento. Si los resultados están agrupados bajo un título (ej. 'Biometría Hemática', 'Química Sanguínea'), ese título DEBE ser la `category`. Si hay subtítulos (ej. 'Fórmula Roja'), esa DEBE ser la `subCategory`. Es VITAL que NO OMITAS `category` y `subCategory` para cada resultado. Son esenciales para la estructura del reporte. Además, proporciona una descripción concisa para cada métrica.",
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen de un párrafo de los hallazgos clave." },
                    },
                },
            };
        case 'audiometria':
        case 'audiometry':
            return {
                prompt: `**CRÍTICO Y OBLIGATORIO**: Extrae TODOS los datos de la audiometría con el máximo nivel de detalle posible. El documento puede contener texto seleccionable e imágenes rasterizadas (gráficas, tablas escaneadas). Analiza exhaustivamente TODO el contenido visual y textual.
                
                Debes extraer y estructurar la siguiente información como objetos en el array 'results':
                1. Gráfica Audiométrica (Vía Aérea): name: "Gráfica Audiométrica", value: [JSON array: [{"frecuencia": 125, "derecho": 10, "izquierdo": 15}, ...]], visualizationType: "line_chart", category: "Audiometría Tonal".
                2. Diagnóstico / Interpretación: Oído Derecho e Izquierdo por separado. category: "Interpretación".
                3. Otoscopia: Hallazgos de inspección. category: "Exploración Física".
                4. Recomendaciones: EPP auditivo, reevaluación. category: "Recomendaciones".
                5. Datos del Equipo: Audiómetro, calibración. category: "Datos del Estudio".`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico completo y detallado." },
                    },
                },
            };
        case 'espirometria':
        case 'spirometry':
            return {
                prompt: `**CRÍTICO Y OBLIGATORIO**: Extrae TODOS los datos de la espirometría. 
                1. Tabla de Parámetros (FVC, FEV1, etc.): name: Párámetro, value: [JSON object con Pred, LLN, Mejor, %Pred], visualizationType: "table_row", category: "Parámetros Espirométricos".
                2. Gráficas (Curva Flujo-Volumen): name: "Curva Flujo-Volumen", value: [JSON con arrays x, y, pred_x, pred_y], visualizationType: "line_chart", category: "Gráficas".
                3. Interpretación y Calidad: category: "Interpretación y Calidad".
                Analiza tanto texto como gráficas visuales.`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico completo y función pulmonar." },
                    },
                },
            };
        case 'radiografia':
        case 'xRays':
            return {
                prompt: `**CRÍTICO Y OBLIGATORIO**: Analiza exhaustivamente el reporte de Rayos X.
                1. Hallazgos Específicos: Camptos pulmonares, silueta cardiaca, etc. category: "Hallazgos Radiológicos", visualizationType: "list".
                2. Mediciones: ICT, etc. category: "Mediciones Radiológicas".
                3. Conclusión: Diagnóstico central. category: "Conclusión".`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Interpretación argumentada de los hallazgos." },
                    },
                },
            };
        case 'optometria':
        case 'optometry':
            return {
                prompt: `**SISTEMA DE DIGITALIZACIÓN MÉDICA DE ALTA PRECISIÓN - OPTOMETRÍA**
                1. Agudeza Visual Lejana/Cercana: Extrae valores OD/OI y la interpretación ÍNTEGRA. value: JSON con campos individuales e "Interpretación". category: "Agudeza Visual", visualizationType: "table_row".
                2. Ishihara y Campimetría: category: "Otras Evaluaciones".
                3. Conclusión General: Párrafo íntegro. category: "Conclusión".`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico detallado." },
                    },
                },
            };
        case 'ecg':
        case 'electrocardiogram':
            return {
                prompt: `**CRÍTICO Y OBLIGATORIO**: Eres un cardiólogo experto. Extrae TODOS los datos del ECG.
                1. Parámetros Numéricos: FC, PR, QRS, QT, QTc, Ejes. category: "Parámetros Numéricos".
                2. Interpretación Argumentada: Puntos clave simplificados y justificados. category: "Interpretación", visualizationType: "list".
                Extrae cada métrica individual del reporte.`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Análisis cardiológico estructural." },
                    },
                },
            };
        default:
            return {
                prompt: "Extrae toda la información médica relevante del documento con precisión quirúrgica.",
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING }
                    }
                }
            };
    }
};

// ── Helpers legacy ──
export function determineCategory(filename: string): string {
    const n = filename.toLowerCase();
    if (n.includes('audio')) return 'audiometria';
    if (n.includes('espiro')) return 'espirometria';
    if (n.includes('ecg') || n.includes('electro')) return 'ecg';
    if (n.includes('rx') || n.includes('radio')) return 'radiografia';
    if (n.includes('opto') || n.includes('vista')) return 'optometria';
    return 'laboratorio';
}

export async function analyzeDocument(sectionId: string, text: string, imageFiles: File[] = []): Promise<StructuredMedicalData> {
    const { prompt: sectionPrompt, schema } = getSectionConfig(sectionId);

    const fileToPart = async (file: File): Promise<Part> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64,
                        mimeType: file.type
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const imageParts = await Promise.all(imageFiles.map(fileToPart));

    const fullPrompt = `${sectionPrompt}\n\nTexto extraído:\n${text || '[Analizar imágenes adjuntas]'}\n\nDevuelve JSON estructurado.`;

    const response = await generateContentWithRetry({
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: fullPrompt }, ...imageParts] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const jsonText = response.text.trim();
    trackUsage(MODEL_NAME, jsonText.length / 4, jsonText.length / 4);

    const parsed = JSON.parse(jsonText);

    if (parsed.results) {
        parsed.results = parsed.results.map((res: any) => {
            // Rellenar alias legacy
            res.parametro = res.name;
            res.resultado = typeof res.value === 'object' ? JSON.stringify(res.value) : String(res.value);
            res.unidad = res.unit;
            res.rango = res.range;
            res.observacion = res.description;
            res.categoria = res.category;

            if (typeof res.value === 'string' && (res.value.startsWith('{') || res.value.startsWith('['))) {
                try { res.value = JSON.parse(res.value); } catch (e) { }
            }
            return res;
        });
    }

    return parsed;
}

export function isGeminiConfigured(): boolean {
    return !!API_KEY;
}
