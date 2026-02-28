

import { GoogleGenAI, Type, Part } from "@google/genai";
import type { LabResult, PatientData, VitalSigns, MedicalSectionId, MedicalReport, ClinicalHistoryFormData, AptitudeCertificateData, CertificateConfig } from '@/types/clinicalHistory';

export const readFileAsBase64 = (file: File): Promise<{ mimeType: string; base64Data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const [prefix, base64Data] = result.split(',');
            const mimeType = prefix.match(/:(.*?);/)?.[1] || file.type;
            resolve({ mimeType, base64Data });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// FIX: Corrected import to use GoogleGenAI from @google/genai.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateContentWithRetry = async (params: any, retries = 3, delay = 2000): Promise<any> => {
    let currentModel = params.model;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await ai.models.generateContent({
                ...params,
                model: currentModel,
            });
            return response;
        } catch (error: any) {
            console.warn(`Attempt ${i + 1} failed with model ${currentModel}:`, error);

            // If it's a quota error (429) and we are using pro, try falling back to flash
            if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
                if (currentModel === 'gemini-3.1-pro-preview') {
                    console.log('Falling back to gemini-3-flash-preview due to quota limits');
                    currentModel = 'gemini-3-flash-preview';
                }
            }

            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

// Helper function to stringify the report for the prompt
const stringifyMedicalReport = (report: MedicalReport): string => {
    let reportString = "Resumen de Expediente Médico:\n\n";

    if (report.patientData && Object.keys(report.patientData).length > 0) {
        reportString += "Datos del Paciente:\n";
        Object.entries(report.patientData).forEach(([key, value]) => {
            if (value) reportString += `- ${key}: ${value}\n`;
        });
        reportString += "\n";
    }

    if (report.vitalSigns && Object.keys(report.vitalSigns).length > 0) {
        reportString += "Signos Vitales:\n";
        Object.entries(report.vitalSigns).forEach(([key, value]) => {
            if (value) reportString += `- ${key}: ${value}\n`;
        });
        reportString += "\n";
    }

    if (report.sections && Object.keys(report.sections).length > 0) {
        reportString += "Resultados de Estudios:\n";
        Object.values(report.sections).forEach((section: any) => {
            if (section) {
                reportString += `\n--- Sección: ${section.name} ---\n`;
                if (section.summary) {
                    reportString += `Resumen: ${section.summary}\n`;
                }
                if (section.results) {
                    section.results.forEach((result: any) => {
                        let valueStr = result.value;
                        if (Array.isArray(valueStr)) {
                            valueStr = valueStr.map((v: any) => typeof v === 'object' && v !== null && 'name' in v && 'value' in v ? `${v.name}: ${v.value}` : v).join(', ');
                        }
                        reportString += `- ${result.category ? `[${result.category}]` : ''} ${result.name}: ${valueStr} ${result.unit} (Rango: ${result.range})\n`;
                    });
                }
            }
        });
    }
    return reportString;
};


const patientDataSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nombre completo del paciente" },
        birthDate: { type: Type.STRING, description: "Fecha de nacimiento del paciente" },
        age: { type: Type.STRING, description: "Edad del paciente" },
        gender: { type: Type.STRING, description: "Género del paciente" },
        reportDate: { type: Type.STRING, description: "Fecha del informe" },
        folio: { type: Type.STRING, description: "Número de folio o identificador del reporte" },
    },
};

const labResultsSchema = {
    type: Type.ARRAY,
    description: "Lista de todos los resultados de laboratorio",
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Nombre del análisis" },
            // FIX: Replaced invalid Type.ANY with Type.STRING and updated description for handling complex values.
            value: { type: Type.STRING, description: "Valor medido. Si es un array o un objeto complejo (ej. curvas de espirometría), debe ser una cadena JSON." },
            unit: { type: Type.STRING, description: "Unidad de medida (ej. mg/dL, %)" },
            range: { type: Type.STRING, description: "Rango de referencia normal" },
            description: { type: Type.STRING, description: "Descripción breve de la métrica." },
            visualizationType: { type: Type.STRING, description: "Sugerencia de visualización: 'gauge', 'bar_chart', 'list', 'radar', 'line_chart', o 'simple'." },
            category: { type: Type.STRING, description: "Categoría principal del resultado." },
            subCategory: { type: Type.STRING, description: "Subcategoría del resultado." },
        },
        required: ["name", "value", "unit", "range", "visualizationType", "category", "description"],
    },
};

const vitalSignsSchema = {
    type: Type.OBJECT,
    description: "Somatometría y signos vitales del paciente.",
    properties: {
        weight: { type: Type.STRING, description: "Peso (ej. '75 kg')" },
        height: { type: Type.STRING, description: "Talla/altura (ej. '180 cm')" },
        bmi: { type: Type.STRING, description: "Índice de Masa Corporal (IMC)" },
        bodyFat: { type: Type.STRING, description: "Grasa corporal (ej. '18%')" },
        visceralFat: { type: Type.STRING, description: "Grasa visceral (ej. '9')" },
        skeletalMuscle: { type: Type.STRING, description: "Músculo esquelético (ej. '35 kg')" },
        temperature: { type: Type.STRING, description: "Temperatura (ej. '36.5 °C')" },
        oxygenSaturation: { type: Type.STRING, description: "Saturación de oxígeno (ej. '98%')" },
        heartRate: { type: Type.STRING, description: "Frecuencia cardíaca (ej. '75 bpm')" },
        respiratoryRate: { type: Type.STRING, description: "Frecuencia respiratoria (ej. '16 rpm')" },
        bloodPressure: { type: Type.STRING, description: "Presión arterial (ej. '120/80 mmHg')" },
    },
};


const getSectionConfig = (sectionId: MedicalSectionId) => {
    switch (sectionId) {
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
                responseKeys: ['patientData', 'results', 'summary']
            };
        case 'audiometry':
            return {
                prompt: `
                **CRÍTICO Y OBLIGATORIO**: Extrae TODOS los datos de la audiometría con el máximo nivel de detalle posible para su integración en un ERP.
                El documento puede contener texto seleccionable e imágenes rasterizadas (gráficas, tablas escaneadas). Analiza exhaustivamente TODO el contenido visual y textual.
                
                Debes extraer y estructurar la siguiente información como objetos 'LabResult':
                
                1. **Gráfica Audiométrica (Vía Aérea)**:
                   - name: "Gráfica Audiométrica"
                   - value: Una cadena JSON VÁLIDA que represente un array de objetos: \`[{"frecuencia": 125, "derecho": 10, "izquierdo": 15}, {"frecuencia": 250, "derecho": 10, "izquierdo": 20}, ...]\`. Extrae los valores exactos en dB para cada frecuencia (Hz) en ambos oídos.
                   - visualizationType: "line_chart"
                   - category: "Audiometría Tonal"
                
                2. **Diagnóstico / Interpretación**:
                   - Crea resultados separados para "Diagnóstico Oído Derecho" y "Diagnóstico Oído Izquierdo" (ej. Audición normal, Hipoacusia conductiva, Hipoacusia neurosensorial, Trauma acústico).
                   - category: "Interpretación"
                   - visualizationType: "simple"
                
                3. **Otoscopia**:
                   - Extrae los hallazgos de la inspección del conducto auditivo externo y membrana timpánica para ambos oídos.
                   - category: "Exploración Física"
                   - visualizationType: "list"
                
                4. **Recomendaciones y Conducta**:
                   - Extrae cualquier recomendación médica, uso de equipo de protección personal (EPP auditivo), o necesidad de reevaluación.
                   - category: "Recomendaciones"
                   - visualizationType: "list"
                
                5. **Datos del Equipo y Estudio**:
                   - Extrae marca/modelo del audiómetro, fecha de última calibración, y nombre del examinador/audiólogo.
                   - category: "Datos del Estudio"
                   - visualizationType: "list"
                
                6. **Otros Datos**:
                   - Antecedentes de exposición a ruido, uso previo de EPP, síntomas referidos (tinnitus, vértigo).
                   - category: "Antecedentes"
                   - visualizationType: "list"
                
                Es VITAL que no omitas ningún dato presente en el documento. Si un dato no existe, simplemente no crees el 'LabResult' correspondiente.
                Asegúrate de extraer también todos los datos del paciente (nombre, edad, empresa, puesto, fecha) en el objeto 'patientData'.
                `,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico completo y detallado de la capacidad auditiva, diagnósticos y recomendaciones." },
                    },
                },
                responseKeys: ['patientData', 'results', 'summary']
            };
        case 'spirometry':
            return {
                prompt: `
                **CRÍTICO Y OBLIGATORIO**: Extrae TODOS los datos de la espirometría con el máximo nivel de detalle posible para su integración en un ERP.
                El documento puede contener texto seleccionable e imágenes rasterizadas (gráficas, tablas escaneadas). Analiza exhaustivamente TODO el contenido visual y textual.
                
                Debes extraer y estructurar la siguiente información como objetos 'LabResult':
                
                1. **Tabla de Parámetros (FVC, FEV1, FEV1/FVC, FEF25-75, PEF, FET, etc.)**:
                   - Extrae cada fila de la tabla principal de resultados.
                   - name: Nombre del parámetro (ej. "FVC [L]", "FEV1 [L]").
                   - value: Una cadena JSON VÁLIDA representando un objeto con todas las columnas disponibles para ese parámetro (ej. \`{"Pred": 3.27, "LLN": 2.65, "Mejor": 2.65, "%Pred": 81, "Puntuación Z": -1.64}\`). Extrae todas las pruebas si están disponibles.
                   - visualizationType: "table_row"
                   - category: "Parámetros Espirométricos"
                
                2. **Gráficas (Curva Flujo-Volumen y Volumen-Tiempo)**:
                   - Si existen, extrae los puntos para reconstruirlas.
                   - name: "Curva Flujo-Volumen" o "Curva Volumen-Tiempo"
                   - value: Una cadena JSON VÁLIDA representando un objeto: \`{ "x": [array de valores X], "y": [array de valores Y], "pred_x": [array X predicho], "pred_y": [array Y predicho] }\`.
                   - visualizationType: "line_chart"
                   - category: "Gráficas"
                   
                3. **Gráfica de Puntuación Z (Z-score)**:
                   - Si existe una gráfica de puntuación Z, extrae los valores Z para cada parámetro.
                   - name: "Puntuación Z"
                   - value: Una cadena JSON VÁLIDA representando un array de objetos: \`[{"parametro": "FVC", "z_score": -1.64}, {"parametro": "FEV1", "z_score": -1.55}, ...]\`.
                   - visualizationType: "bar_chart"
                   - category: "Gráficas"
                
                4. **Interpretación y Calidad**:
                   - Extrae la "Interpretación del sistema", "Calidad de la sesión", "Atención/Avisos", "Su FEV1 / Predicho".
                   - category: "Interpretación y Calidad"
                   - visualizationType: "simple"
                
                5. **Datos del Estudio y Paciente Adicionales**:
                   - Extrae Fecha del test, Interpretación (ej. GOLD/Hardie), Predicho (ej. Hankinson), Selección del valor, Mejor valor.
                   - Extrae datos adicionales del paciente mostrados en el reporte (Fumador, Asma, EPOC, Origen étnico, ID).
                   - category: "Datos del Estudio"
                   - visualizationType: "simple"
                
                Es VITAL que no omitas ningún dato presente en el documento. Si un dato no existe, simplemente no crees el 'LabResult' correspondiente.
                Asegúrate de extraer también todos los datos principales del paciente (nombre, edad, peso, altura, IMC) en el objeto 'patientData'.
                `,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico completo y detallado de la función pulmonar, calidad de la prueba e interpretación." },
                    },
                },
                responseKeys: ['patientData', 'results', 'summary']
            };
        case 'xRays':
            return {
                prompt: `
                **CRÍTICO Y OBLIGATORIO**: Analiza exhaustivamente TODOS los documentos de Rayos X proporcionados.
                Extrae los hallazgos, diagnósticos, conclusiones y cualquier otra información clínica relevante con el máximo nivel de detalle y precisión.
                NO inventes datos. Si hay discrepancias o información faltante, limítate a lo que está explícitamente en los documentos.
                
                Debes extraer y estructurar la siguiente información como objetos 'LabResult':
                
                1. **Hallazgos Específicos por Región/Sistema**:
                   - Extrae descripciones detalladas de los hallazgos en campos pulmonares, silueta cardiaca, mediastino, senos costofrénicos/cardiofrénicos, estructuras óseas, etc.
                   - name: Región o sistema evaluado (ej. "Campos Pulmonares", "Silueta Cardiaca").
                   - value: Un arreglo de cadenas de texto (array of strings) con la descripción detallada del hallazgo.
                   - visualizationType: "list"
                   - category: "Hallazgos Radiológicos"
                
                2. **Mediciones y Parámetros Numéricos**:
                   - Si existen mediciones como el Índice Cardiotorácico (ICT), extráelos.
                   - name: Nombre del parámetro (ej. "Índice Cardiotorácico").
                   - value: Valor numérico o texto corto.
                   - visualizationType: "simple"
                   - category: "Mediciones Radiológicas"
                
                3. **Diagnóstico o Conclusión Principal**:
                   - Extrae la conclusión final o diagnóstico radiológico.
                   - name: "Conclusión Radiológica" o "Diagnóstico"
                   - value: Texto de la conclusión.
                   - visualizationType: "simple"
                   - category: "Conclusión"
                
                4. **Datos del Estudio**:
                   - Extrae el tipo de estudio (ej. "Radiografía PA de Tórax"), técnica, calidad de la imagen, fecha del estudio.
                   - name: "Tipo de Estudio", "Técnica", etc.
                   - value: Descripción correspondiente.
                   - visualizationType: "simple"
                   - category: "Datos del Estudio"
                
                Asegúrate de extraer también todos los datos principales del paciente (nombre, edad, sexo, etc.) en el objeto 'patientData'.
                `,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Interpretación argumentada y resumen clínico detallado de los hallazgos radiológicos." },
                    },
                },
                responseKeys: ['patientData', 'results', 'summary']
            };
        case 'optometry':
            return {
                prompt: `
                **SISTEMA DE DIGITALIZACIÓN MÉDICA DE ALTA PRECISIÓN**
                **OBJETIVO**: Convertir el reporte de optometría en un objeto JSON estructurado sin perder ni una sola palabra de las interpretaciones clínicas.
                
                **INSTRUCCIONES DE EXTRACCIÓN (ESTRICTAS)**:
                1. **Folio**: Busca el número de folio (ej. "001") en la parte superior y asígnalo a \`patientData.folio\`.
                2. **Nombres**: Extrae el nombre del paciente y edad exactamente como aparecen.
                
                **ESTRUCTURA DE RESULTADOS (DEBE USAR ESTOS NOMBRES EXACTOS)**:
                
                1. **Agudeza Visual Lejana**:
                   - Extrae valores de la sección "1. AGUDEZA VISUAL LEJANA (ESCALA DE SNELLEN)".
                   - Campos: "Sin Lentes OD", "Sin Lentes OI", "Con Lentes OD", "Con Lentes OI".
                   - **Interpretación**: Copia el párrafo COMPLETO que empieza después de los valores. NO RESUMAS.
                   - value: JSON \`{"Sin Lentes OD": "...", "Sin Lentes OI": "...", "Con Lentes OD": "...", "Con Lentes OI": "...", "Interpretación": "..."}\`
                   - visualizationType: "table_row", category: "Agudeza Visual"

                2. **Agudeza Visual Cercana**:
                   - Extrae valores de la sección "2. AGUDEZA VISUAL CERCANA (ESCALA DE JAEGER)".
                   - Campos: "Sin Lentes OD", "Sin Lentes OI", "Con Lentes OD", "Con Lentes OI".
                   - **Interpretación**: Copia el párrafo COMPLETO. NO RESUMAS.
                   - value: JSON \`{"Sin Lentes OD": "...", "Sin Lentes OI": "...", "Con Lentes OD": "...", "Con Lentes OI": "...", "Interpretación": "..."}\`
                   - visualizationType: "table_row", category: "Agudeza Visual"

                3. **Percepción de Colores**:
                   - Extrae de la sección "3. EVALUACIÓN DE PERCEPCIÓN DE COLORES (PRUEBA DE ISHIHARA)".
                   - **Resultado**: El texto inmediatamente debajo del título (ej. "VISIÓN CROMÁTICA NORMAL.").
                   - **Interpretación**: El párrafo completo de interpretación.
                   - value: JSON \`{"Resultado": "...", "Interpretación": "..."}\`
                   - visualizationType: "simple", category: "Otras Evaluaciones"

                4. **Campimetría**:
                   - Extrae de la sección "4. CAMPIMETRÍA DE CONFRONTACIÓN".
                   - **Resultado**: El texto inmediatamente debajo del título.
                   - **Exploración**: El párrafo completo de interpretación/exploración.
                   - value: JSON \`{"Resultado": "...", "Exploración": "..."}\`
                   - visualizationType: "simple", category: "Otras Evaluaciones"

                5. **Conclusión General**:
                   - Extrae de la sección "5. CONCLUSIÓN GENERAL".
                   - **value**: Copia el párrafo íntegro. NO RESUMAS.
                   - visualizationType: "simple", category: "Conclusión"

                6. **Refracción / Graduación** (Si existe):
                   - Extrae Esfera, Cilindro, Eje, Adición, DP.
                   - visualizationType: "table_row", category: "Refracción"

                7. **Presión Intraocular** (Si existe):
                   - Extrae valores OD/OI en mmHg.
                   - visualizationType: "gauge", category: "Salud Ocular"

                **REGLA CRÍTICA**: Si el texto es largo, DEBES extraerlo todo. La integridad médica es prioridad sobre la brevedad.
                `,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico detallado de la evaluación optométrica." },
                    },
                },
                responseKeys: ['patientData', 'results', 'summary']
            };
        case 'electrocardiogram':
            return {
                prompt: `
                **CRÍTICO Y OBLIGATORIO**: Eres un cardiólogo experto. Extrae TODOS los datos del reporte de Electrocardiograma (ECG) con precisión absoluta.
                El documento puede contener texto y gráficas.
                
                Tu objetivo es extraer la MAYOR CANTIDAD DE DATOS POSIBLES de forma exhaustiva, preparándolo para un expediente clínico detallado.
                
                1. **Parámetros Numéricos (Métricas)**:
                   Busca y extrae todos los valores numéricos. Para CADA UNO, crea un objeto en el array 'results' con category="Parámetros Numéricos".
                   Ejemplos obligatorios (si están presentes):
                   - Frecuencia Cardiaca (unit: "lpm", range: "60-100", visualizationType: "gauge")
                   - Intervalo PR o PQ (unit: "ms", range: "120-200", visualizationType: "bar_chart")
                   - Duración QRS (unit: "ms", range: "80-120", visualizationType: "bar_chart")
                   - Intervalo QT (unit: "ms", range: "360-440", visualizationType: "bar_chart")
                   - Intervalo QTc (unit: "ms", range: "360-440", visualizationType: "bar_chart")
                   - Eje P (unit: "°", range: "0-90", visualizationType: "bar_chart")
                   - Eje QRS (unit: "°", range: "-30-90", visualizationType: "bar_chart")
                   - Eje T (unit: "°", range: "-15-105", visualizationType: "bar_chart")
                   - Onda P (unit: "ms", range: "<120", visualizationType: "bar_chart")
                   - Intervalo RR (unit: "ms", range: "600-1000", visualizationType: "bar_chart")
                   Asegúrate de que 'value' sea solo el número (ej. "75", no "75 lpm").
                
                2. **Interpretación Simplificada y Argumentada**:
                   NO copies el texto del reporte tal cual. Simplifica los hallazgos médicos y ARGUMENTA la interpretación basándote en los parámetros numéricos extraídos.
                   Ejemplo de lo que DEBES hacer:
                   En lugar de copiar: "Complejo QRS estrecho (94 ms), morfología normal."
                   Escribe: "QRS estrecho (94ms), descartando bloqueos de rama."
                   En lugar de copiar: "QTc de 456 ms -> límite alto, sin sobrepasar el umbral patológico en varones."
                   Escribe: "QTc en límite alto (456ms), sin prolongación patológica."
                   
                   Crea un objeto en 'results' con:
                   - name: "Interpretación Detallada"
                   - value: Un array de strings con los puntos clave simplificados y justificados.
                   - visualizationType: "list"
                   - category: "Interpretación"
                
                3. **Conclusión Clínica**:
                   NO copies el texto tal cual. Redacta una conclusión clínica directa, clara y resumida en una sola frase si es posible.
                   Ejemplo: "ECG normal con ritmo sinusal y QTc en límite alto, sin evidencia de isquemia o arritmia."
                   Crea un objeto en 'results' con:
                   - name: "Conclusión Clínica"
                   - value: El texto de la conclusión simplificada.
                   - visualizationType: "simple"
                   - category: "Conclusión"
                
                **REGLA CRÍTICA**: Extrae los datos del paciente (Nombre, Fecha de nacimiento, Edad, Sexo, Fecha del estudio, Folio si existe) en el objeto patientData.
                `,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen clínico del ECG." },
                    },
                },
                responseKeys: ['patientData', 'results', 'summary']
            };
        default:
    }
};

interface AnalysisResult {
    patientData?: Partial<PatientData>;
    vitalSigns?: Partial<VitalSigns>;
    results?: LabResult[];
    summary?: string;
}

export const analyzeMedicalDocument = async (
    files: File | File[],
    sectionId: MedicalSectionId
): Promise<AnalysisResult> => {
    const fileArray = Array.isArray(files) ? files : [files];
    const fileDataPromises = fileArray.map(file => readFileAsBase64(file));
    const fileDatas = await Promise.all(fileDataPromises);

    // Use gemini-3-flash-preview for faster analysis of both PDFs and images
    const modelName = 'gemini-3-flash-preview';

    const { prompt: sectionPrompt, schema, responseKeys } = getSectionConfig(sectionId);

    const fullPrompt = `
    Eres un analista de datos médicos experto. Analiza los siguientes documentos.
    Tu tarea es extraer la información del paciente y los datos médicos específicos de esta sección.
    
    **Instrucciones Específicas:**
    ${sectionPrompt}

    **Instrucción Adicional de Calidad (INNEGOCIABLE)**: Es CRÍTICO que toda la información generada (resúmenes, descripciones, etc.) tenga una ortografía y gramática perfectas en español. El resultado debe ser de nivel profesional y no debe contener ningún error, ni siquiera acentos faltantes.
    
    Devuelve la salida completa como un único objeto JSON válido que se adhiera al esquema proporcionado. No incluyas ningún formato markdown ni texto adicional.
    Si un campo no está presente en los documentos, omítelo del JSON.
    `;

    const contents: Part[] = [
        ...fileDatas.map(fileData => ({ inlineData: { mimeType: fileData.mimeType, data: fileData.base64Data } })),
        { text: fullPrompt },
    ];

    try {
        const response = await generateContentWithRetry({
            model: modelName,
            contents: { parts: contents },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        // Attempt to parse stringified JSON values
        if (parsedJson.results && Array.isArray(parsedJson.results)) {
            parsedJson.results = parsedJson.results.map((res: LabResult) => {
                if (typeof res.value === 'string') {
                    try {
                        const innerParsed = JSON.parse(res.value);
                        res.value = innerParsed;
                    } catch (e) {
                        // Not a JSON string, leave as is
                    }
                }
                return res;
            });
        }


        const result: AnalysisResult = {};
        if (responseKeys.includes('patientData') && parsedJson.patientData) result.patientData = parsedJson.patientData;
        if (responseKeys.includes('vitalSigns') && parsedJson.vitalSigns) result.vitalSigns = parsedJson.vitalSigns;
        if (responseKeys.includes('results') && parsedJson.results) result.results = parsedJson.results;
        if (responseKeys.includes('summary') && parsedJson.summary) result.summary = parsedJson.summary;

        return result;

    } catch (error) {
        console.error(`Error al analizar (${sectionId}):`, error);
        throw new Error(`No se pudo analizar el documento con la API de Gemini.`);
    }
};

export const populateClinicalHistoryForm = async (report: MedicalReport): Promise<Partial<ClinicalHistoryFormData>> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);
    const prompt = `
        Eres un asistente médico experto. Tu tarea es pre-llenar un formulario de historia clínica en formato JSON a partir de un expediente médico.
        Analiza el expediente y llena tantos campos como sea posible. Infiere datos cuando sea lógico (ej. sexo a partir del nombre, edad a partir de fecha de nacimiento).
        No inventes información que no esté presente o no se pueda inferir. Deja los campos vacíos si no hay datos.
        
        **Instrucciones Específicas de Mapeo:**
        - Mapea los resultados de laboratorio y estudios a las secciones correspondientes del formulario (audiometría, espirometría, etc.).
        - Para espirometría, busca los resultados llamados 'Curva Flujo-Volumen' y 'Curva Volumen-Tiempo'. Si existen, decodifica su valor (que es una cadena JSON) y asigna los datos a los campos \`flowVolumeCurve\` y \`volumeTimeCurve\` en \`estudiosComplementarios.espirometria\`.
        - Para los antecedentes y examen físico, marca 'SI'/'NO' o 'NORMAL'/'ANORMAL' y agrega comentarios cuando el expediente lo mencione explícitamente.

        **Expediente del Paciente:**
        ${reportText}

        **Instrucción Final:**
        Devuelve SOLAMENTE el objeto JSON con la data del formulario. No incluyas markdown, explicaciones, ni nada más. El JSON debe ser válido.
        La estructura del JSON debe seguir el formato de la interfaz 'ClinicalHistoryFormData' de la aplicación. Presta atención a las propiedades anidadas como 'datosGenerales', 'riesgoLaboral', 'antecedentes', 'exploracionFisica', etc.
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        let jsonString = response.text.trim();
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        }
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error al poblar historia clínica:', error);
        throw new Error('No se pudo poblar el formulario de historia clínica.');
    }
};

export const generateAptitudeCertificate = async (
    report: MedicalReport,
    clinicalHistoryData: ClinicalHistoryFormData,
    config: CertificateConfig
): Promise<AptitudeCertificateData> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);
    const historyText = JSON.stringify({
        datosGenerales: clinicalHistoryData.datosGenerales,
        diagnostico: clinicalHistoryData.diagnostico,
        concepto: clinicalHistoryData.concepto,
        recomendaciones: clinicalHistoryData.recomendaciones,
    }, null, 2);

    const certificateSchema = {
        type: Type.OBJECT,
        properties: {
            workerName: { type: Type.STRING },
            fitnessStatus: { type: Type.STRING, enum: ['APTO', 'APTO CON RESTRICCIONES', 'NO APTO'] },
            position: { type: Type.STRING },
            company: { type: Type.STRING },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            validityPeriod: { type: Type.STRING, enum: ['3 MESES', '6 MESES', '1 AÑO', 'OTRO'] },
            nextEvaluationDate: {
                type: Type.OBJECT,
                properties: { day: { type: Type.STRING }, month: { type: Type.STRING }, year: { type: Type.STRING }, },
                required: ['day', 'month', 'year']
            },
            examLocationAndDate: { type: Type.STRING },
            doctorName: { type: Type.STRING },
            doctorSpecialty: { type: Type.STRING },
            doctorLicense: { type: Type.STRING },
            studySummaries: {
                type: Type.ARRAY,
                description: "Un array de objetos, donde cada objeto contiene el nombre de una sección de estudio y su resumen.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        section: { type: Type.STRING, description: "Nombre de la sección del estudio (ej. 'Laboratorios')" },
                        summary: { type: Type.STRING, description: "Resumen de una línea de los hallazgos en esa sección." }
                    },
                    required: ["section", "summary"]
                }
            }
        },
        required: [
            "workerName", "fitnessStatus", "position", "company", "observations", "validityPeriod",
            "nextEvaluationDate", "examLocationAndDate", "doctorName", "doctorSpecialty", "doctorLicense", "studySummaries"
        ]
    };

    const prompt = `
        Eres un médico de salud ocupacional. Tu tarea es generar un Certificado de Aptitud Laboral en formato JSON basado en la información proporcionada.

        **Información del Paciente y Estudios:**
        ${reportText}

        **Historia Clínica Relevante:**
        ${historyText}

        **Configuración del Certificado:**
        - Estado de Aptitud deseado: ${config.fitnessStatus || 'Determinar según análisis'}
        - Periodo de Validez deseado: ${config.validityPeriod || '1 AÑO'}
        - Instrucciones Adicionales del Usuario: ${config.extraInstructions || 'Ninguna'}

        **Instrucciones de Llenado:**
        1.  **workerName, position, company**: Extráelos de los datos generales y la historia laboral.
        2.  **fitnessStatus**: Usa el estado de aptitud del concepto de la historia clínica. Si el usuario proporcionó un estado, dale prioridad.
        3.  **observations**: Deben ser las limitaciones/restricciones del concepto de la historia clínica, más cualquier otra observación relevante. Conviértelas en un array de strings.
        4.  **validityPeriod**: Usa el periodo solicitado. Por defecto, '1 AÑO'.
        5.  **nextEvaluationDate**: Calcula la fecha de la próxima evaluación basándote en la fecha del reporte actual y el periodo de validez. Formatea como day, month, year.
        6.  **examLocationAndDate**: Usa el lugar y fecha de la evaluación de los datos generales. Formato: "Lugar, DD de Mes de AAAA".
        7.  **Datos del Médico**: Usa la siguiente información FIJA:
            - doctorName: "Dr. José Carlos Guido Pancardo"
            - doctorSpecialty: "Medicina del Trabajo y Salud Ocupacional"
            - doctorLicense: "Ced. Prof.: 9766342 / Ced. Esp.: 521002603 / Ced. Mtria.: 12266124"
        8.  **studySummaries**: Crea un **array de objetos**. Cada objeto debe tener dos propiedades: \`section\` (el nombre de la sección del estudio, ej. "Laboratorios") y \`summary\` (el resumen de una línea de esa sección, extraído del \`reportText\`).
        9.  **Instrucciones Adicionales**: Si el usuario dio instrucciones, aplícalas para modificar el resultado final (ej. cambiar el estado de aptitud, agregar una observación).
        10. **Calidad de Redacción**: Asegúrate de que toda la redacción sea profesional, con perfecta ortografía y gramática en español, incluyendo acentos.

        Genera el objeto JSON final sin ningún texto o formato adicional.
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: certificateSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error('Error al generar certificado:', error);
        throw new Error('No se pudo generar el certificado de aptitud.');
    }
};

export const extractAndGenerateVitalSigns = async (report: MedicalReport): Promise<Partial<VitalSigns>> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);

    const prompt = `
        Analiza el siguiente expediente médico. Tu tarea es completar la somatometría y los signos vitales del paciente.
        1.  **Extrae** todos los valores de signos vitales que encuentres explícitamente en el expediente.
        2.  Si algunos valores no están presentes, **infiere** valores realistas y coherentes basados en el perfil general del paciente (edad, género, diagnósticos, etc.). Por ejemplo, un paciente con sobrepeso y dislipidemia debería tener un IMC y grasa corporal correspondientes.
        3.  **Calcula el IMC** (Índice de Masa Corporal) usando la fórmula: peso (kg) / (talla (m))^2. Asegúrate de que este cálculo sea preciso si extraes o infieres peso y talla.
        4.  Devuelve un único objeto JSON que se adhiera al esquema proporcionado. No incluyas markdown ni texto adicional.

        Expediente:
        ${reportText}
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: vitalSignsSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error('Error al extraer signos vitales:', error);
        throw new Error('No se pudieron extraer los signos vitales con la IA.');
    }
};

export const getRisksForJobTitle = async (jobTitle: string): Promise<ClinicalHistoryFormData['riesgoLaboral']['riesgos']> => {
    const model = 'gemini-3-flash-preview';
    const riskSchema = {
        type: Type.OBJECT,
        properties: {
            fisicos: { type: Type.OBJECT, properties: { ruidos: { type: Type.BOOLEAN }, vibraciones: { type: Type.BOOLEAN }, iluminacion: { type: Type.BOOLEAN }, radiaciones: { type: Type.BOOLEAN }, presiones: { type: Type.BOOLEAN }, temperaturas: { type: Type.BOOLEAN }, } },
            quimicos: { type: Type.OBJECT, properties: { gases: { type: Type.BOOLEAN }, vapores: { type: Type.BOOLEAN }, humos: { type: Type.BOOLEAN }, particulas: { type: Type.BOOLEAN }, aerosoles: { type: Type.BOOLEAN }, polvos: { type: Type.BOOLEAN }, } },
            ergonomicos: { type: Type.OBJECT, properties: { posturasInadecuadas: { type: Type.BOOLEAN }, cargasManuales: { type: Type.BOOLEAN }, sobreesfuerzoFisico: { type: Type.BOOLEAN }, actividadesRepetitivas: { type: Type.BOOLEAN }, visual: { type: Type.BOOLEAN }, } },
            biologicos: { type: Type.OBJECT, properties: { bacterias: { type: Type.BOOLEAN }, virus: { type: Type.BOOLEAN }, hongos: { type: Type.BOOLEAN }, parasitos: { type: Type.BOOLEAN }, } },
            psicosociales: { type: Type.OBJECT, properties: { trabajoMonotono: { type: Type.BOOLEAN }, trabajoDuroBajoPresion: { type: Type.BOOLEAN }, jornadaLaboralExtensa: { type: Type.BOOLEAN }, } },
            electricos: { type: Type.OBJECT, properties: { bajaTension: { type: Type.BOOLEAN }, altaTension: { type: Type.BOOLEAN }, electricidadEstatica: { type: Type.BOOLEAN }, } },
            mecanicos: { type: Type.OBJECT, properties: { mecanismosEnMovimiento: { type: Type.BOOLEAN }, proyeccionParticulas: { type: Type.BOOLEAN }, herramientasManuales: { type: Type.BOOLEAN }, } },
            locativos: { type: Type.OBJECT, properties: { superficiales: { type: Type.BOOLEAN }, almacenamiento: { type: Type.BOOLEAN }, estructuras: { type: Type.BOOLEAN }, instalaciones: { type: Type.BOOLEAN }, espacioDeTrabajo: { type: Type.BOOLEAN }, alturas: { type: Type.BOOLEAN }, } },
        }
    };
    const prompt = `
        Analiza el puesto de trabajo: "${jobTitle}".
        Identifica los riesgos laborales asociados. Devuelve un objeto JSON que marque como 'true' los riesgos aplicables según el esquema.
        Sé conservador; solo marca 'true' si el riesgo es común y directo para el puesto.
    `;
    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: riskSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`Error al analizar riesgos para ${jobTitle}:`, error);
        throw new Error('No se pudieron analizar los riesgos del puesto.');
    }
};

export const getJobDetails = async (jobTitle: string): Promise<{ descripcionFunciones: string, maquinasEquiposHerramientas: string }> => {
    const model = 'gemini-3-flash-preview';
    const detailsSchema = {
        type: Type.OBJECT,
        properties: {
            descripcionFunciones: { type: Type.STRING, description: "Descripción detallada de las funciones y responsabilidades típicas del puesto." },
            maquinasEquiposHerramientas: { type: Type.STRING, description: "Lista de máquinas, equipos y herramientas comúnmente utilizadas en este puesto." }
        },
        required: ['descripcionFunciones', 'maquinasEquiposHerramientas']
    };
    const prompt = `
        Describe el puesto de trabajo: "${jobTitle}".
        Proporciona una descripción de funciones y una lista de máquinas y herramientas comunes.
        Devuelve un objeto JSON según el esquema.
    `;
    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: detailsSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`Error al obtener detalles para ${jobTitle}:`, error);
        throw new Error('No se pudieron obtener los detalles del puesto.');
    }
};

export const generateDiagnoses = async (report: MedicalReport): Promise<string> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);

    const prompt = `
        Basado en el siguiente expediente médico, genera una lista de diagnósticos.
        Cada diagnóstico debe estar en una nueva línea, numerado. Deben tener una redacción clínica profesional y perfecta ortografía en español.
        Ejemplo:
        1. Hipertensión Arterial Sistémica
        2. Diabetes Mellitus Tipo 2
        3. Lumbalgia mecánica

        Expediente:
        ${reportText}

        Diagnósticos:
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error al generar diagnósticos:', error);
        throw new Error('No se pudo generar la lista de diagnósticos.');
    }
};

export const generateConcept = async (report: MedicalReport): Promise<{ resumen: string, aptitud: string, limitacionesRestricciones: string }> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);
    const conceptSchema = {
        type: Type.OBJECT,
        properties: {
            resumen: { type: Type.STRING, description: "Resumen del estado de salud del paciente basado en el expediente." },
            aptitud: { type: Type.STRING, enum: ['Apto con restricciones', 'Apto sin restricciones', 'No Apto'], description: "Juicio de aptitud laboral." },
            limitacionesRestricciones: { type: Type.STRING, description: "Descripción de las limitaciones o restricciones, si las hay. Si no hay, dejar vacío. Cada una en una nueva línea con un guión." }
        },
        required: ['resumen', 'aptitud', 'limitacionesRestricciones']
    };
    const prompt = `
        Eres un médico de salud ocupacional. Basado en el expediente médico, genera el concepto de aptitud laboral.
        - \`resumen\`: un breve resumen de los hallazgos.
        - \`aptitud\`: determina si el paciente es 'Apto con restricciones', 'Apto sin restricciones' o 'No Apto'. Sé clínico y objetivo.
        - \`limitacionesRestricciones\`: si es apto con restricciones, detalla cuáles son.
        - **Calidad**: La redacción debe ser profesional y con perfecta ortografía.

        Expediente:
        ${reportText}
    `;
    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: conceptSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error('Error al generar concepto:', error);
        throw new Error('No se pudo generar el concepto de aptitud.');
    }
};

export const generateRecommendations = async (report: MedicalReport): Promise<string> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);

    const prompt = `
        Basado en el siguiente expediente médico, genera una lista de recomendaciones para el paciente.
        Cada recomendación debe estar en una nueva línea, iniciando con un guion (-).
        Las recomendaciones deben ser claras, concisas, orientadas a mejorar la salud y prevenir riesgos, y con perfecta ortografía.

        Expediente:
        ${reportText}

        Recomendaciones:
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error al generar recomendaciones:', error);
        throw new Error('No se pudo generar la lista de recomendaciones.');
    }
};

export const generateAbnormalFindings = async (report: MedicalReport, abnormalSystems: string[]): Promise<Record<string, string>> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);
    const prompt = `
        Basado en el expediente médico, describe los hallazgos anormales específicos para los siguientes sistemas: ${abnormalSystems.join(', ')}.
        Proporciona descripciones concisas, clínicas y con perfecta ortografía en español.
        Devuelve un objeto JSON donde cada clave es el nombre del sistema y el valor es la descripción del hallazgo.
        Ejemplo: { "COLUMNA VERTEBRAL": "Dolor a la palpación en región lumbar paravertebral, arcos de movilidad conservados." }

        Expediente:
        ${reportText}
    `;
    const properties: Record<string, { type: Type; description: string }> = {};
    abnormalSystems.forEach(system => {
        properties[system] = { type: Type.STRING, description: `Descripción de hallazgos en ${system}` };
    });
    const schema = { type: Type.OBJECT, properties };

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error('Error al generar hallazgos anormales:', error);
        throw new Error('No se pudieron generar los hallazgos anormales.');
    }
};

export const getCommonAbnormalFindings = async (systemName: string): Promise<string[]> => {
    const model = 'gemini-3-flash-preview';

    const prompt = `
        Genera una lista de 5 a 7 hallazgos anormales comunes y concisos que un médico podría encontrar al examinar el sistema u órgano: "${systemName}".
        Responde únicamente con un objeto JSON que contenga una clave "sugerencias" con un array de strings. Deben tener ortografía perfecta en español.
        Ejemplo para "OJOS": {"sugerencias": ["Disminución de agudeza visual", "Pterigión", "Conjuntivitis", "Cataratas", "Fondo de ojo con alteraciones"]}

        Sistema/Órgano: "${systemName}"
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sugerencias: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text.trim());
        return parsed.sugerencias || [];
    } catch (error) {
        console.error(`Error al obtener sugerencias para ${systemName}:`, error);
        throw new Error('No se pudieron obtener las sugerencias de hallazgos.');
    }
};

export const generateConsolidatedSummary = async (report: MedicalReport): Promise<string> => {
    const model = 'gemini-3.1-pro-preview';
    const reportText = stringifyMedicalReport(report);

    const prompt = `
        Eres un médico experto en salud ocupacional. Analiza el siguiente expediente médico consolidado y genera un resumen conciso y profesional en un solo párrafo.
        El resumen debe destacar los hallazgos más relevantes, tanto normales como anormales, y cualquier condición preexistente o factor de riesgo importante.
        Debe estar redactado en español, con perfecta gramática y ortografía.

        Expediente:
        ${reportText}

        Resumen Consolidado:
    `;

    try {
        const response = await generateContentWithRetry({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error al generar resumen consolidado:', error);
        throw new Error('No se pudo generar el resumen consolidado.');
    }
};