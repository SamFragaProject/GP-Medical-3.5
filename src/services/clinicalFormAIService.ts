/**
 * ============================================================
 * Servicio IA para el Formulario de Historia Clínica
 * GP Medical Health ERP — Funciones de autocompletado con Gemini
 * ============================================================
 * Funciones conservadas del Consolidador:
 * - getRisksForJobTitle: Analiza puesto → riesgos laborales
 * - getJobDetails: Analiza puesto → descripción y maquinaria
 * - getCommonAbnormalFindings: Sugerencias de hallazgos
 * - generateDiagnoses: Genera diagnósticos desde el formulario
 * - generateConcept: Genera concepto de aptitud laboral
 * - generateRecommendations: Genera recomendaciones
 */

import { GoogleGenAI, Type } from '@google/genai';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistoryForm';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!aiInstance) {
        if (!API_KEY) {
            throw new Error('API Key de Gemini no configurada.');
        }
        aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    }
    return aiInstance;
}

async function generateContentWithRetry(params: any, retries = 3, delay = 2000): Promise<any> {
    const ai = getAI();
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            if (error?.status === 429 && i < retries - 1) {
                await new Promise(r => setTimeout(r, delay * (i + 1)));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}

/** Stringify form data for AI context */
function stringifyFormData(data: ClinicalHistoryFormData): string {
    return JSON.stringify({
        datosGenerales: data.datosGenerales,
        riesgoLaboral: data.riesgoLaboral,
        historiaLaboral: data.historiaLaboral,
        accidentesEnfermedades: data.accidentesEnfermedades,
        antecedentes: data.antecedentes,
        exploracionFisica: data.exploracionFisica,
        estudiosComplementarios: data.estudiosComplementarios,
        pruebasLaboratorio: data.pruebasLaboratorio,
        diagnostico: data.diagnostico,
        concepto: data.concepto,
        recomendaciones: data.recomendaciones,
    }, null, 2);
}

// ═══════════════════════════════════════════
// 1. ANALIZAR RIESGOS POR PUESTO
// ═══════════════════════════════════════════

export async function getRisksForJobTitle(jobTitle: string): Promise<ClinicalHistoryFormData['riesgoLaboral']['riesgos']> {
    const model = 'gemini-2.0-flash';
    const riskSchema = {
        type: Type.OBJECT,
        properties: {
            fisicos: { type: Type.OBJECT, properties: { ruidos: { type: Type.BOOLEAN }, vibraciones: { type: Type.BOOLEAN }, iluminacion: { type: Type.BOOLEAN }, radiaciones: { type: Type.BOOLEAN }, presiones: { type: Type.BOOLEAN }, temperaturas: { type: Type.BOOLEAN } } },
            quimicos: { type: Type.OBJECT, properties: { gases: { type: Type.BOOLEAN }, vapores: { type: Type.BOOLEAN }, humos: { type: Type.BOOLEAN }, particulas: { type: Type.BOOLEAN }, aerosoles: { type: Type.BOOLEAN }, polvos: { type: Type.BOOLEAN } } },
            ergonomicos: { type: Type.OBJECT, properties: { posturasInadecuadas: { type: Type.BOOLEAN }, cargasManuales: { type: Type.BOOLEAN }, sobreesfuerzoFisico: { type: Type.BOOLEAN }, actividadesRepetitivas: { type: Type.BOOLEAN }, visual: { type: Type.BOOLEAN } } },
            biologicos: { type: Type.OBJECT, properties: { bacterias: { type: Type.BOOLEAN }, virus: { type: Type.BOOLEAN }, hongos: { type: Type.BOOLEAN }, parasitos: { type: Type.BOOLEAN } } },
            psicosociales: { type: Type.OBJECT, properties: { trabajoMonotono: { type: Type.BOOLEAN }, trabajoDuroBajoPresion: { type: Type.BOOLEAN }, jornadaLaboralExtensa: { type: Type.BOOLEAN } } },
            electricos: { type: Type.OBJECT, properties: { bajaTension: { type: Type.BOOLEAN }, altaTension: { type: Type.BOOLEAN }, electricidadEstatica: { type: Type.BOOLEAN } } },
            mecanicos: { type: Type.OBJECT, properties: { mecanismosEnMovimiento: { type: Type.BOOLEAN }, proyeccionParticulas: { type: Type.BOOLEAN }, herramientasManuales: { type: Type.BOOLEAN } } },
            locativos: { type: Type.OBJECT, properties: { superficiales: { type: Type.BOOLEAN }, almacenamiento: { type: Type.BOOLEAN }, estructuras: { type: Type.BOOLEAN }, instalaciones: { type: Type.BOOLEAN }, espacioDeTrabajo: { type: Type.BOOLEAN }, alturas: { type: Type.BOOLEAN } } },
        }
    };
    const prompt = `Analiza el puesto de trabajo: "${jobTitle}". Identifica los riesgos laborales asociados. Devuelve un objeto JSON que marque como 'true' los riesgos aplicables según el esquema. Sé conservador; solo marca 'true' si el riesgo es común y directo para el puesto.`;

    const response = await generateContentWithRetry({
        model, contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: riskSchema }
    });
    return JSON.parse(response.text.trim());
}

// ═══════════════════════════════════════════
// 2. DETALLES DEL PUESTO
// ═══════════════════════════════════════════

export async function getJobDetails(jobTitle: string): Promise<{ descripcionFunciones: string; maquinasEquiposHerramientas: string }> {
    const model = 'gemini-2.0-flash';
    const detailsSchema = {
        type: Type.OBJECT,
        properties: {
            descripcionFunciones: { type: Type.STRING, description: "Descripción detallada de las funciones y responsabilidades típicas del puesto." },
            maquinasEquiposHerramientas: { type: Type.STRING, description: "Lista de máquinas, equipos y herramientas comúnmente utilizadas en este puesto." }
        },
        required: ['descripcionFunciones', 'maquinasEquiposHerramientas']
    };
    const prompt = `Describe el puesto de trabajo: "${jobTitle}". Proporciona una descripción de funciones y una lista de máquinas y herramientas comunes. Devuelve un objeto JSON según el esquema. Redacta en español con perfecta ortografía.`;

    const response = await generateContentWithRetry({
        model, contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: detailsSchema }
    });
    return JSON.parse(response.text.trim());
}

// ═══════════════════════════════════════════
// 3. SUGERENCIAS DE HALLAZGOS ANORMALES
// ═══════════════════════════════════════════

export async function getCommonAbnormalFindings(systemName: string): Promise<string[]> {
    const model = 'gemini-2.0-flash';
    const prompt = `Genera una lista de 5 a 7 hallazgos anormales comunes y concisos que un médico podría encontrar al examinar el sistema u órgano: "${systemName}".
Responde únicamente con un objeto JSON que contenga una clave "sugerencias" con un array de strings. Deben tener ortografía perfecta en español.
Ejemplo para "OJOS": {"sugerencias": ["Disminución de agudeza visual", "Pterigión", "Conjuntivitis", "Cataratas", "Fondo de ojo con alteraciones"]}

Sistema/Órgano: "${systemName}"`;

    const response = await generateContentWithRetry({
        model, contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { sugerencias: { type: Type.ARRAY, items: { type: Type.STRING } } }
            }
        }
    });
    const parsed = JSON.parse(response.text.trim());
    return parsed.sugerencias || [];
}

// ═══════════════════════════════════════════
// 4. GENERAR DIAGNÓSTICOS
// ═══════════════════════════════════════════

export async function generateDiagnoses(formData: ClinicalHistoryFormData): Promise<string> {
    const model = 'gemini-2.0-flash';
    const formText = stringifyFormData(formData);
    const prompt = `Basado en el siguiente formulario de historia clínica, genera una lista de diagnósticos.
Cada diagnóstico debe estar en una nueva línea, numerado. Deben tener una redacción clínica profesional y perfecta ortografía en español.
Ejemplo:
1. Hipertensión Arterial Sistémica
2. Diabetes Mellitus Tipo 2
3. Lumbalgia mecánica

Historia Clínica:
${formText}

Diagnósticos:`;

    const response = await generateContentWithRetry({ model, contents: prompt });
    return response.text.trim();
}

// ═══════════════════════════════════════════
// 5. GENERAR CONCEPTO DE APTITUD
// ═══════════════════════════════════════════

export async function generateConcept(formData: ClinicalHistoryFormData): Promise<{ resumen: string; aptitud: string; limitacionesRestricciones: string }> {
    const model = 'gemini-2.0-flash';
    const formText = stringifyFormData(formData);
    const conceptSchema = {
        type: Type.OBJECT,
        properties: {
            resumen: { type: Type.STRING, description: "Resumen del estado de salud del paciente basado en la historia clínica." },
            aptitud: { type: Type.STRING, description: "Juicio de aptitud laboral." },
            limitacionesRestricciones: { type: Type.STRING, description: "Descripción de las limitaciones o restricciones, si las hay." }
        },
        required: ['resumen', 'aptitud', 'limitacionesRestricciones']
    };
    const prompt = `Eres un médico de salud ocupacional. Basado en la historia clínica, genera el concepto de aptitud laboral.
- \`resumen\`: un breve resumen de los hallazgos.
- \`aptitud\`: determina si el paciente es 'Apto con restricciones', 'Apto sin restricciones' o 'No Apto'. Sé clínico y objetivo.
- \`limitacionesRestricciones\`: si es apto con restricciones, detalla cuáles son.
- La redacción debe ser profesional y con perfecta ortografía.

Historia Clínica:
${formText}`;

    const response = await generateContentWithRetry({
        model, contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: conceptSchema }
    });
    return JSON.parse(response.text.trim());
}

// ═══════════════════════════════════════════
// 6. GENERAR RECOMENDACIONES
// ═══════════════════════════════════════════

export async function generateRecommendations(formData: ClinicalHistoryFormData): Promise<string> {
    const model = 'gemini-2.0-flash';
    const formText = stringifyFormData(formData);
    const prompt = `Basado en la siguiente historia clínica, genera una lista de recomendaciones para el paciente.
Cada recomendación debe estar en una nueva línea, iniciando con un guion (-).
Las recomendaciones deben ser claras, concisas, orientadas a mejorar la salud y prevenir riesgos, y con perfecta ortografía.

Historia Clínica:
${formText}

Recomendaciones:`;

    const response = await generateContentWithRetry({ model, contents: prompt });
    return response.text.trim();
}
