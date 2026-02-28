/**
 * ============================================================
 * Servicio de Análisis de Documentos Médicos con Gemini AI
 * BASADO EN: erp-consolidador-de-reportes-médicos-ia (La que sí funciona)
 * ============================================================
 */
import { GoogleGenAI, Type, Part } from "@google/genai";
import { trackUsage } from './aiUsageTracker';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

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

// ── Configuración de Prompts por Sección (Copiados del Consolidador Pro) ──
const getSectionConfig = (sectionId: string) => {
    switch (sectionId) {
        case 'laboratorio':
            return {
                prompt: "**EXPERTO EN LABORATORIOS**: Extrae todos los resultados manteniendo jerarquía. Categoria = Título (ej. Biometría), Subcategory = Subtítulo.",
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
            };
        case 'audiometria':
            return {
                prompt: `**AUDIOMETRÍA PRO**: Extrae: 
                1. Gráfica Audiométrica (Via Aérea) como JSON [{"frecuencia": 125, "derecho": 10, "izquierdo": 15}, ...] en 'value'.
                2. Diagnóstico OD/OI.
                3. Otoscopia.
                4. Recomendaciones.
                Usa visualizationType: 'line_chart' para la gráfica.`,
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
            };
        case 'espirometria':
            return {
                prompt: `**ESPIROMETRÍA PRO**: Extrae Parámetros (FVC, etc) y Curvas como JSON {x:[], y:[]}.`,
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
            };
        case 'ecg':
            return {
                prompt: `**ECG PRO**: Métricas: FC, PR, QRS, QT, QTc, Ejes. Interpretación simplificada.`,
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
            };
        case 'radiografia':
            return {
                prompt: `**RADIOGRAFÍA PRO**: Hallazgos por región, ICT, Conclusión.`,
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
            };
        case 'optometria':
            return {
                prompt: `**OPTOMETRÍA PRO**: AV Snellen/Jaeger, Ishihara, Campimetría.`,
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
            };
        default:
            return {
                prompt: "Extrae toda la información médica relevante del documento.",
                schema: { type: Type.OBJECT, properties: { patientData: patientDataSchema, results: labResultsSchema, summary: { type: Type.STRING } } }
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
        const buffer = await file.arrayBuffer();
        return {
            inlineData: {
                data: btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')),
                mimeType: file.type
            }
        };
    };

    const imageParts = await Promise.all(imageFiles.map(fileToPart));

    const fullPrompt = `${sectionPrompt}\n\nTexto extraído:\n${text || '[Analizar imágenes adjuntas]'}\n\nDevuelve JSON estructurado.`;

    const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }, ...imageParts] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const jsonText = result.text.trim();
    trackUsage('gemini-1.5-flash', jsonText.length / 4, jsonText.length / 4);

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
