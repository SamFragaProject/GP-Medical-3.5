/**
 * ============================================================
 * Servicio de Análisis de Documentos Médicos con Gemini AI
 * GPMedical ERP — Integrado con el sistema de AI existente
 * ============================================================
 * Usa la VITE_GOOGLE_API_KEY del ERP para analizar documentos
 * médicos subidos y extraer datos estructurados.
 */

import { GoogleGenAI, Type } from '@google/genai';

// Reutilizamos la API key del ERP
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!aiInstance) {
        if (!API_KEY) {
            throw new Error('VITE_GOOGLE_API_KEY no configurada. Ve a Configuración → IA para agregarla.');
        }
        aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    }
    return aiInstance;
}

// ── Tipos de datos estructurados ──

export interface DatoClinico {
    categoria?: string;
    parametro: string;
    resultado: string;
    unidad?: string;
    rango_referencia?: string;
    observacion?: string;
}

export interface DatoGrafica {
    titulo?: string;
    eje_x_label?: string;
    eje_y_label?: string;
    puntos?: { x: string; y: string }[];
}

export interface StructuredMedicalData {
    paciente?: string;
    fecha?: string;
    tipo_documento?: string;
    datos_estructurados: DatoClinico[];
    datos_graficas?: DatoGrafica[];
    interpretacion_general: string;
}

export interface ExtractedDocumentData {
    fileName: string;
    fileType: string;
    rawText?: string;
    structuredData?: StructuredMedicalData;
    error?: string;
}

export interface FileItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    category: string;
    result?: ExtractedDocumentData;
}

// ── Helpers ──

function fileToGenerativePart(file: File) {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('Error al leer archivo como base64'));
            }
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ── Determinar categoría del archivo ──
export function determineCategory(file: File): string {
    const name = file.name.toLowerCase();
    const type = file.type;
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'Documentos PDF';
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(name)) return 'Imágenes Médicas';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return 'Documentos de Word';
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) return 'Presentaciones';
    if (type === 'text/csv' || name.endsWith('.csv') || name.endsWith('.xml') || name.endsWith('.txt')) return 'Archivos de Texto / Datos';
    return 'Otros Archivos';
}

// ── Análisis principal con Gemini ──
export async function analyzeDocument(text: string, imageFiles: File[] = []): Promise<StructuredMedicalData> {
    const ai = getAI();
    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

    const prompt = `
    Eres un asistente médico experto en extracción de datos clínicos para un ERP de medicina del trabajo.
    Tu tarea es analizar el siguiente documento médico (que puede incluir texto extraído y/o imágenes) y extraer ABSOLUTAMENTE TODOS los datos en un formato estructurado.
    
    INSTRUCCIONES ESPECÍFICAS:
    - Para resultados de laboratorio, signos vitales y métricas, extrae cada parámetro individualmente con su resultado exacto, unidad y rango de referencia.
    - Si el documento contiene GRÁFICAS (espirometrías, audiometrías, electrocardiogramas), extrae los puntos de datos (coordenadas X e Y) para poder reconstruirlas en el ERP.
    - Para radiografías u otras imágenes médicas, incluye la interpretación detallada.
    - No omitas ningún dato. El ERP necesita TODOS los parámetros para vincularlos al expediente del paciente.
    - Si detectas el nombre del paciente, fecha o tipo de estudio, inclúyelos.
    
    Texto extraído del documento:
    ${text ? text : '[Sin texto plano, analizar imágenes adjuntas]'}
    `;

    const contents = {
        parts: [{ text: prompt }, ...imageParts]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    paciente: { type: Type.STRING, description: "Nombre del paciente si aparece" },
                    fecha: { type: Type.STRING, description: "Fecha del documento o de los análisis" },
                    tipo_documento: { type: Type.STRING, description: "Ej. Análisis de sangre, Radiografía, Espirometría, Nota clínica" },
                    datos_estructurados: {
                        type: Type.ARRAY,
                        description: "Lista exhaustiva de todos los parámetros médicos, resultados de laboratorio, signos vitales, etc.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                categoria: { type: Type.STRING, description: "Ej. Hematología, Química Sanguínea, Signos Vitales" },
                                parametro: { type: Type.STRING, description: "Nombre del dato (ej. Glucosa, Leucocitos)" },
                                resultado: { type: Type.STRING, description: "Valor exacto" },
                                unidad: { type: Type.STRING, description: "Unidad de medida" },
                                rango_referencia: { type: Type.STRING, description: "Rango normal si se indica" },
                                observacion: { type: Type.STRING, description: "Ej. Alto, Bajo, Anormal, o notas adicionales" }
                            },
                            required: ["parametro", "resultado"]
                        }
                    },
                    datos_graficas: {
                        type: Type.ARRAY,
                        description: "Datos numéricos extraídos de gráficas (audiometrías, espirometrías, ECGs).",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                titulo: { type: Type.STRING, description: "Título de la gráfica" },
                                eje_x_label: { type: Type.STRING, description: "Etiqueta del eje X" },
                                eje_y_label: { type: Type.STRING, description: "Etiqueta del eje Y" },
                                puntos: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            x: { type: Type.STRING },
                                            y: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    interpretacion_general: { type: Type.STRING, description: "Interpretación clínica, diagnóstico o resumen de hallazgos" }
                },
                required: ["datos_estructurados", "interpretacion_general"]
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error('No se recibió respuesta del modelo de IA');
}

// ── Verificar si la API key está disponible ──
export function isGeminiConfigured(): boolean {
    return !!API_KEY;
}
