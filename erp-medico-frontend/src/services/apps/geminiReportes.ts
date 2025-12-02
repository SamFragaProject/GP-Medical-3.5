import { GoogleGenAI, Type } from "@google/genai";
import { Patient } from "../../data/reportes/patients";

// Utility to convert a File to a Base64 string
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve(''); // Should not happen with readAsDataURL
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

/**
 * Normalizes a string by converting to lowercase, removing accents, and trimming whitespace.
 * @param str The string to normalize.
 * @returns The normalized string.
 */
export const normalizeString = (str: string): string => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize("NFD") // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
};


export const extractPatientNameFromPdf = async (ai: GoogleGenAI, file: File): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: {
            parts: [
                { text: "Analiza el documento PDF adjunto y extrae únicamente el nombre completo del paciente. Responde solo con el nombre y apellidos, sin ninguna palabra adicional." },
                await fileToGenerativePart(file),
            ]
        },
    });
    return response.text ? response.text.trim() : "";
};


export const generateAllAiContent = async (ai: GoogleGenAI, patientData: Patient, labFile: File, audioFile: File | null) => {
    const parts: any[] = [
        {
            text: `Act as an expert occupational health physician. Analyze the provided patient data and attached lab/audiometry reports to generate a complete medical report summary in a structured JSON format.

        Patient Information Reference:
        - Name: ${patientData.fullName}
        - Known DOB: ${patientData.dob || "NOT PROVIDED (Extract from PDF)"}
        - Known Position: ${patientData.employmentInfo.position}
        - Medical History Notes: ${JSON.stringify(patientData.medicalHistory)}
        - Current Vitals Record: ${JSON.stringify(patientData.vitals)}

        Instructions:
        1.  **CRITICAL: Patient Demographics & Vitals Extraction**: 
            - **DOB PRIORITY**: You MUST extract the Date of Birth (Fecha de Nacimiento) **EXCLUSIVELY from the LAB REPORT (the first attached file)** if it exists. 
            - **IGNORE** the Date of Birth in the Audiometry report if it differs from the Lab report. Only use Audiometry DOB if Lab Report DOB is completely missing.
            - Format MUST be **DD/MM/AAAA** (e.g., 25/04/1985).
            - Extract Gender, Civil Status, Education Level, Weight, Height, BP (TA), Heart Rate (FC), Respiratory Rate (FR), Temperature, and Saturation from the documents.
            - **IMPORTANT**: If Civil Status (Estado Civil) or Education Level (Nivel Educativo) are NOT explicitly found in the documents, return an empty string ("") for them. DO NOT guess or put "No reportado".
            - If the document contains more recent or complete vital signs than the "Current Vitals Record" provided above, use the data from the document.
        
        2.  **Lab Analysis**: 
            - Analyze the primary lab report (PDF). 
            - Extract key results for hematology (biometria, quimica, perfil hepatico, EGO) and renal profile (electrolitos, microalbuminuria, creatinina, ACR, TFG). 
            - Provide a concise summary for each. If an exam isn't present, state 'No se reporta'.
        
        3.  **Audiometry Analysis**: 
            - If an audiometry report is attached, analyze it and provide a very short summary (e.g., 'Normoacusia bilateral'). 
            - If not, use the existing data or state 'No se reporta'.
        
        4.  **Job Analysis**: 
            - Generate a brief description (max 25 words) of key occupational risks for the position: "${patientData.employmentInfo.position}".
        
        5.  **Physical Exam Summary**: 
            - Write an extremely brief physical exam summary (max 25 words) incorporating the extracted vitals.
        
        6.  **Diagnoses**: 
            - List all relevant diagnoses, including CIE-10 codes and the basis for each (e.g., 'IMC 31.25', 'Audiometría', 'Glucosa 110 mg/dL').
        
        7.  **Professional Disease Suspicion**: 
            - Provide a concise conclusion regarding suspicion of professional disease.
        
        8.  **Aptitude Certificate**: 
            - Determine the aptitude concept (e.g., 'APTO', 'APTO CON RESTRICCIONES') and provide a list of very concise recommendations.

        Respond ONLY with the JSON object adhering to the specified schema.` },
        await fileToGenerativePart(labFile),
    ];

    if (audioFile) {
        parts.push(await fileToGenerativePart(audioFile));
    }

    const schema = {
        type: Type.OBJECT,
        properties: {
            patientDetails: {
                type: Type.OBJECT,
                description: "Datos demográficos y signos vitales extraídos del documento.",
                properties: {
                    dob: { type: Type.STRING, description: "Fecha de nacimiento (DD/MM/AAAA)." },
                    gender: { type: Type.STRING, description: "Género (Masculino/Femenino)." },
                    civilStatus: { type: Type.STRING, description: "Estado Civil (ej. Casado, Soltero). Dejar vacío si no se encuentra." },
                    education: { type: Type.STRING, description: "Nivel de Estudios (ej. Secundaria, Bachillerato). Dejar vacío si no se encuentra." },
                    height: { type: Type.STRING, description: "Talla (ej. 1.75 m)." },
                    weight: { type: Type.STRING, description: "Peso (ej. 80 kg)." },
                    ta: { type: Type.STRING, description: "Tensión Arterial (ej. 120/80)." },
                    fc: { type: Type.STRING, description: "Frecuencia Cardiaca (ej. 80 lpm)." },
                    fr: { type: Type.STRING, description: "Frecuencia Respiratoria (ej. 18 rpm)." },
                    temp: { type: Type.STRING, description: "Temperatura (ej. 36.5)." },
                    satO2: { type: Type.STRING, description: "Saturación Oxígeno (ej. 98%)." },
                },
            },
            labResults: {
                type: Type.OBJECT,
                properties: {
                    hematology: {
                        type: Type.OBJECT,
                        properties: {
                            biometria: { type: Type.STRING, description: 'Resumen de Biometría Hemática.' },
                            quimica: { type: Type.STRING, description: 'Resumen de Química Sanguínea.' },
                            perfilHepatico: { type: Type.STRING, description: 'Resumen de Perfil Hepático.' },
                            ego: { type: Type.STRING, description: 'Resumen de Examen General de Orina.' }
                        },
                        required: ['biometria', 'quimica', 'perfilHepatico', 'ego'],
                    },
                    renal: {
                        type: Type.OBJECT,
                        properties: {
                            electrolitos: { type: Type.STRING, description: 'Resumen de electrolitos séricos.' },
                            microalbuminuria: { type: Type.STRING, description: 'Resultado de microalbuminuria.' },
                            creatininaOrina: { type: Type.STRING, description: 'Resultado de creatinina en orina.' },
                            acr: { type: Type.STRING, description: 'Resultado de relación Albumina/Creatinina (ACR).' },
                            tfg: { type: Type.STRING, description: 'Resultado de Tasa de Filtración Glomerular (TFG).' }
                        },
                        required: ['electrolitos', 'microalbuminuria', 'creatininaOrina', 'acr', 'tfg'],
                    }
                },
                required: ['hematology', 'renal'],
            },
            audioSummary: { type: Type.STRING, description: 'Resumen del reporte de audiometría.' },
            jobAnalysis: { type: Type.STRING, description: 'Descripción de riesgos laborales del puesto.' },
            physicalExamSummary: { type: Type.STRING, description: 'Resumen de la exploración física.' },
            diagnoses: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        diagnosis: { type: Type.STRING, description: "Diagnóstico con código CIE-10." },
                        basis: { type: Type.STRING, description: "Base del diagnóstico." },
                    },
                    required: ['diagnosis', 'basis'],
                },
            },
            professionalDiseaseSuspicion: { type: Type.STRING, description: "Conclusión sobre sospecha de enfermedad profesional." },
            aptitude: {
                type: Type.OBJECT,
                properties: {
                    aptitudeConcept: { type: Type.STRING, description: "Concepto de aptitud en mayúsculas." },
                    recommendations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                area: { type: Type.STRING, description: "Área de la recomendación." },
                                recommendation: { type: Type.STRING, description: "Recomendación concisa." },
                            },
                            required: ['area', 'recommendation'],
                        },
                    },
                },
                required: ['aptitudeConcept', 'recommendations'],
            },
        },
        required: ['patientDetails', 'labResults', 'audioSummary', 'jobAnalysis', 'physicalExamSummary', 'diagnoses', 'professionalDiseaseSuspicion', 'aptitude'],
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });
    return JSON.parse(response.text || "{}");
};
