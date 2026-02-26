/**
 * ============================================================
 * Servicio de Análisis de Documentos Médicos con Gemini AI
 * GPMedical ERP — Extracción EXHAUSTIVA de datos clínicos
 * ============================================================
 * Alineado con los document-schemas (12 archivos MD) del ERP.
 * Extrae ABSOLUTAMENTE TODOS los parámetros de cada tipo de
 * documento médico: laboratorios, radiografías, audiometrías,
 * espirometrías, ECG, optometrías, historia clínica, etc.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { trackUsage } from './aiUsageTracker';

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
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|dcm|dicom)$/.test(name)) return 'Imágenes Médicas';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return 'Documentos de Word';
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) return 'Presentaciones';
    if (type === 'text/csv' || name.endsWith('.csv') || name.endsWith('.xml') || name.endsWith('.txt')) return 'Archivos de Texto / Datos';
    return 'Otros Archivos';
}

// ── PROMPT MAESTRO ──
// Este prompt está alineado con los 12 MD de document-schemas

const EXTRACTION_PROMPT = `
Eres un **Analista Médico Senior** especializado en extracción de datos clínicos para un ERP de Medicina del Trabajo (GP Medical Health).

Tu misión: Analizar el documento médico proporcionado y extraer **ABSOLUTAMENTE TODOS** los datos en formato estructurado.

## 🔴 REGLAS CRÍTICAS DE EXTRACCIÓN:

### 1. EXTRACCIÓN EXHAUSTIVA — CERO OMISIONES
- Extrae **CADA parámetro individual** con su resultado exacto, unidad y rango de referencia.
- NO resumas múltiples parámetros en uno solo. Ejemplo INCORRECTO: "Biometría Hemática: Normal". Ejemplo CORRECTO: Hemoglobina=15.2 g/dL, Hematocrito=45.1%, Leucocitos=7500/µL, etc.
- Si un documento tiene 50 parámetros, devuelve 50 entradas individuales.

### 2. POR TIPO DE DOCUMENTO — PARÁMETROS ESPERADOS:

#### LABORATORIO (Química Sanguínea, BH, Perfil Lipídico, Hepático, EGO):
Extraer CADA valor individual:
- BH: Hemoglobina, Hematocrito, Eritrocitos, Leucocitos, Plaquetas, VCM, HCM, CMHC, VPM, RDW
- Fórmula Blanca: Neutrófilos, Linfocitos, Monocitos, Eosinófilos, Basófilos (% y absolutos)
- QS: Glucosa, Urea, BUN, Creatinina, Ácido Úrico
- Perfil Lipídico: Colesterol Total, HDL, LDL, VLDL, Triglicéridos
- Perfil Hepático: TGO/AST, TGP/ALT, Fosfatasa Alcalina, GGT, Bilirrubinas, LDH, Proteínas Totales, Albúmina, Globulina
- EGO: Color, Aspecto, pH, Densidad, Glucosa, Proteínas, Hemoglobina, Leucocitos, Eritrocitos, Bacterias, Cristales, Cilindros, Nitritos
- Electrolitos: Na, K, Cl, Ca, P, Mg, Fe, Ferritina
- Marcadores: TSH, T3, T4, PSA, HbA1c, VSG, PCR
- Coagulación: TP, TPT, INR

#### AUDIOMETRÍA:
Extraer valores de CADA frecuencia para CADA oído:
- Oído Derecho VA: 250Hz, 500Hz, 1000Hz, 2000Hz, 3000Hz, 4000Hz, 6000Hz, 8000Hz (en dB HL)
- Oído Izquierdo VA: 250Hz, 500Hz, 1000Hz, 2000Hz, 3000Hz, 4000Hz, 6000Hz, 8000Hz (en dB HL)
- Si hay vía ósea: también extraerla
- Extraer como datos_graficas para reconstruir el audiograma

#### ESPIROMETRÍA:
- FVC (litros y % predicho), FEV1 (litros y % predicho)
- FEV1/FVC ratio, FEF 25-75% (litros/s y %), PEF
- Datos demográficos: Edad, Talla, Peso, Sexo
- Clasificación: Normal/Obstructivo/Restrictivo/Mixto
- Calidad de prueba: A/B/C/D/F
- Si hay curva flujo-volumen: extraer puntos como datos_graficas

#### ELECTROCARDIOGRAMA:
- FC, Ritmo, Eje QRS, Eje P, Eje T
- Intervalos: PR, QRS, QT, QTc, RR
- Configuración: Velocidad (mm/s), Calibración (mm/mV)
- Segmento ST, Onda P, Complejo QRS, Onda T
- Diagnóstico e interpretación

#### RADIOGRAFÍA / IMAGEN MÉDICA:
- Datos del Paciente: Nombre, Sexo, Edad, ID Paciente
- Datos del Estudio: Tipo, Proyección, Región Anatómica, Hora
- Parámetros Técnicos: EI (Índice Exposición), ms (exposición), mAs (carga tubo), kVp
- Metadatos: Institución, ID Estudio, Equipo
- Hallazgos radiológicos detallados
- Clasificación OIT si aplica (para tórax ocupacional)

#### OPTOMETRÍA:
- Agudeza Visual Lejana OD/OI con y sin corrección (Snellen)
- Agudeza Visual Cercana OD/OI (Jaeger)
- Visión Cromática (Ishihara: placas correctas/total)
- Campimetría: Resultado
- Fondo de ojo, Presión intraocular OD/OI
- Uso de lentes, tipo, graduación

#### HISTORIA CLÍNICA:
- Signos Vitales: TA, FC, FR, SatO2, Temperatura
- Somatometría: Peso, Talla, IMC, Clasificación IMC, Perímetro abdominal
- Antecedentes: Patológicos, No Patológicos, Heredofamiliares, Ginecológicos
- Exploración Física: cada sistema/aparato revisado
- Dictamen de aptitud laboral si presente

### 3. METADATOS OBLIGATORIOS:
- **Nombre del paciente** (completo, corregir OCR)
- **Fecha** del estudio/documento
- **Tipo de documento** (específico: "Análisis de Laboratorio - BH y QS", no solo "Laboratorio")
- **Médico responsable** si aparece
- **Institución** si aparece

### 4. GRÁFICAS (datos_graficas):
Para audiogramas, curvas flujo-volumen, ECG strips: extraer los puntos de datos como coordenadas X,Y para poder reconstruirlas en el ERP.

### 5. OBSERVACIONES:
- Marcar si un resultado es "Alto", "Bajo", "Normal", "Crítico" basándose en el rango de referencia
- Si el documento incluye asteriscos (*) o marcas para valores fuera de rango, reportar esa observación
- Corregir errores de OCR (ej: "6eneral" → "General")

### 6. INTERPRETACIÓN GENERAL:
- Proporcionar un análisis clínico detallado de TODOS los hallazgos
- Incluir correlación clínico-radiológica/laboratorial cuando aplique
- Señalar hallazgos anormales y su significancia

Texto extraído del documento:
`;

// ── Análisis principal con Gemini ──
export async function analyzeDocument(text: string, imageFiles: File[] = []): Promise<StructuredMedicalData> {
    const ai = getAI();
    const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

    const prompt = EXTRACTION_PROMPT + (text ? text : '[Sin texto plano disponible — analizar las imágenes adjuntas usando visión computacional]');

    const contents = {
        parts: [{ text: prompt }, ...imageParts]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    paciente: { type: Type.STRING, description: "Nombre completo del paciente (corregir errores OCR)" },
                    fecha: { type: Type.STRING, description: "Fecha del documento o estudio (formato YYYY-MM-DD si posible)" },
                    tipo_documento: { type: Type.STRING, description: "Tipo específico: 'Biometría Hemática y Química Sanguínea', 'Radiografía de Tórax PA', 'Audiometría Tonal', etc." },
                    datos_estructurados: {
                        type: Type.ARRAY,
                        description: "Lista EXHAUSTIVA de TODOS los parámetros médicos individuales. Un parámetro por entrada. NO resumir.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                categoria: { type: Type.STRING, description: "Grupo: 'Biometría Hemática', 'Fórmula Blanca', 'Química Sanguínea', 'Parámetros Técnicos', 'Signos Vitales', etc." },
                                parametro: { type: Type.STRING, description: "Nombre exacto del parámetro: 'Hemoglobina', 'Leucocitos', 'Tiempo de exposición', 'FVC', etc." },
                                resultado: { type: Type.STRING, description: "Valor exacto del resultado. NO incluir unidades aquí." },
                                unidad: { type: Type.STRING, description: "Unidad de medida: g/dL, mg/dL, %, dB HL, L, L/s, ms, mAs, mmHg, lpm, etc." },
                                rango_referencia: { type: Type.STRING, description: "Rango normal si está disponible: '13.0 - 17.5', '70 - 100', etc." },
                                observacion: { type: Type.STRING, description: "Estado: 'Normal', 'Alto', 'Bajo', 'Crítico', 'Anormal', o nota adicional" }
                            },
                            required: ["parametro", "resultado"]
                        }
                    },
                    datos_graficas: {
                        type: Type.ARRAY,
                        description: "Datos numéricos para reconstruir gráficas: audiogramas (frecuencia vs dB), curvas flujo-volumen, ECG",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                titulo: { type: Type.STRING, description: "Título: 'Audiograma OD', 'Curva Flujo-Volumen', etc." },
                                eje_x_label: { type: Type.STRING, description: "Etiqueta eje X: 'Frecuencia (Hz)', 'Volumen (L)', etc." },
                                eje_y_label: { type: Type.STRING, description: "Etiqueta eje Y: 'dB HL', 'Flujo (L/s)', etc." },
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
                    interpretacion_general: {
                        type: Type.STRING,
                        description: "Interpretación clínica DETALLADA. Incluir: hallazgos principales, correlación clínica, valores anormales y su significancia, recomendaciones si aplica."
                    }
                },
                required: ["datos_estructurados", "interpretacion_general"]
            }
        }
    });

    if (response.text) {
        // Track token usage
        const usage = (response as any).usageMetadata;
        if (usage) {
            trackUsage('gemini-2.0-flash', usage.promptTokenCount || 0, usage.candidatesTokenCount || 0);
        } else {
            // Estimate tokens from text length
            const inputEst = Math.ceil((prompt.length + imageParts.length * 1000) / 4);
            const outputEst = Math.ceil(response.text.length / 4);
            trackUsage('gemini-2.0-flash', inputEst, outputEst);
        }
        return JSON.parse(response.text);
    }
    throw new Error('No se recibió respuesta del modelo de IA');
}

// ── Verificar si la API key está disponible ──
export function isGeminiConfigured(): boolean {
    return !!API_KEY;
}
