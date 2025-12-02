import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PatientData } from "../../types/extractor";

const patientSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        // 1-11: Datos Personales y Antropometría
        nombreCompleto: { type: Type.STRING, description: "Nombre completo del paciente. Formato Título." },
        fechaNacimiento: { type: Type.STRING, description: "Fecha de nacimiento (DD/MM/AAAA)." },
        edad: { type: Type.STRING, description: "Edad en años." },
        genero: { type: Type.STRING, description: "Género." },
        peso: { type: Type.STRING, description: "Peso en kg." },
        talla: { type: Type.STRING, description: "Talla en metros." },
        imc: { type: Type.STRING, description: "Índice de Masa Corporal." },
        clasificacionIMC: { type: Type.STRING, description: "Clasificación IMC." },
        porcentajeGrasaVisceral: { type: Type.STRING, description: "Porcentaje de Grasa Visceral. SI NO EXISTE EN EL TEXTO: CALCULARLO basándose en IMC y medidas." },
        porcentajeGrasaCorporal: { type: Type.STRING, description: "Porcentaje de Grasa Corporal. SI NO EXISTE EN EL TEXTO: CALCULARLO usando fórmula de Deurenberg." },
        porcentajeMusculo: { type: Type.STRING, description: "Porcentaje de Músculo. SI NO EXISTE EN EL TEXTO: CALCULARLO por diferencia aproximada." },

        // 12-16: Signos Vitales
        ta_mmHg: { type: Type.STRING, description: "Tensión Arterial." },
        fc_lpm: { type: Type.STRING, description: "Frecuencia Cardiaca." },
        fr_rpm: { type: Type.STRING, description: "Frecuencia Respiratoria." },
        satO2: { type: Type.STRING, description: "Saturación de Oxígeno." },
        temp_C: { type: Type.STRING, description: "Temperatura Corporal. Buscar explícitamente en tabla de 'Somatometría' o 'Examen Físico' bajo 'Temp' o 'Temperatura'." },

        // 17-27: Laboratorios y Estudios Específicos
        biometriaHematica: { type: Type.STRING, description: "Resumen breve de hallazgos en Biometría Hemática (Ej: 'Anemia leve', 'Leucocitosis', o 'Dentro de límites')." },
        quimicaSanguinea6: { type: Type.STRING, description: "Resumen breve de Química Sanguínea (Ej: 'Glucosa alta', 'Colesterol elevado')." },
        tasaFiltracionGlomerular: { type: Type.STRING, description: "Tasa de Filtración Glomerular (eGFR)." },
        creatininaOrina: { type: Type.STRING, description: "Creatinina en orina." },
        microalbuminuriaOrina: { type: Type.STRING, description: "Microalbuminuria en orina." },
        examenGeneralOrina: { type: Type.STRING, description: "Hallazgos en Examen General de Orina." },
        relacionAlbuminaCreatinina: { type: Type.STRING, description: "Relación Albúmina/Creatinina (RAC)." },
        perfilHepatico: { type: Type.STRING, description: "Resumen Perfil Hepático." },
        electrolitosSericos: { type: Type.STRING, description: "Resumen Electrolitos." },
        audiometria: { type: Type.STRING, description: "Interpretación clínica de la Audiometría (Ej: 'Hipoacusia neurosensorial leve')." },
        relacionCreatinina: { type: Type.STRING, description: "Valor de la Relación Creatinina. SI NO EXISTE: Extraer valor de CREATININA SÉRICA." },
    },
    required: ["nombreCompleto"],
};

export const analyzeMedicalDocuments = async (
    files: File[]
): Promise<PatientData> => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key no encontrada. Verifique su configuración.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Convert files to inlineData parts
    const parts = await Promise.all(
        files.map(async (file) => {
            const base64Data = await fileToGenerativePart(file);
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            };
        })
    );

    const prompt = `
    Eres un **Analista Médico Senior** especializado en extracción de datos clínicos complejos.
    Tu misión es analizar estos documentos (Historia Clínica, Laboratorios, Audiometría) que pertenecen a **UN SOLO PACIENTE** y estructurar sus datos.

    *** PROTOCOLO DE EXTRACCIÓN AVANZADO ***

    1. **ANÁLISIS DE TABLAS DE LABORATORIO (CRÍTICO):**
       - Los reportes de laboratorio suelen tener columnas confusas.
       - **IGNORA** las columnas de "Rango de Referencia", "Límites", "Unidades" o "Anteriores".
       - **EXTRAE** únicamente el valor de la columna "RESULTADO" o "VALOR".
       - Si un valor tiene un asterisco (*) o está en negrita indicando fuera de rango, ese es el que importa.

    2. **SIGNOS VITALES (TEMPERATURA - PRIORIDAD ALTA):**
       - Localiza la sección titulada **"EXAMEN FÍSICO Y SOMATOMETRÍA"** o similar.
       - Busca la fila etiquetada como **"Temp (°C)"**, "Temp", o "Temperatura".
       - Suele estar ubicada cerca de "TA (mmHg)", "FC (lpm)" o "Peso".
       - Extrae el valor numérico exacto (ejemplo: "36.7").

    3. **COMPOSICIÓN CORPORAL (CÁLCULOS DE RESPALDO):**
       - Primero busca explícitamente: % Grasa Corporal, % Grasa Visceral, % Músculo.
       - **SI NO ESTÁN PRESENTES:** NO pongas "ND". **CALCÚLALOS** obligatoriamente usando fórmulas estimadas basadas en el IMC, Edad y Género extraídos.
       - Tu objetivo es llenar estos campos con el dato real o una estimación matemática sólida.

    4. **REGLA DE ORO - CREATININA:**
       - Campo 'relacionCreatinina': Busca "Relación Albúmina/Creatinina".
       - **FALLBACK OBLIGATORIO:** Si NO existe ninguna relación calculada, **EXTRAE EL VALOR DE LA CREATININA SÉRICA** (de la Química Sanguínea) y úsalo.

    5. **ORTOGRAFÍA Y LIMPIEZA:**
       - Corrige errores de escaneo (OCR). Ejemplo: "Examen 6eneral" -> "Examen General".
       - Usa mayúsculas y acentos correctamente.

    Devuelve el resultado exclusivamente en formato JSON.
  `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: {
                parts: [...parts, { text: prompt }],
            },
            config: {
                temperature: 0.1, // Low temperature for higher precision
                responseMimeType: "application/json",
                responseSchema: patientSchema,
            },
        });

        const responseText = response.text;

        if (!responseText) {
            throw new Error("La respuesta del modelo está vacía.");
        }

        const data = JSON.parse(responseText);

        return {
            ...data,
            id: crypto.randomUUID()
        };

    } catch (error) {
        console.error("Error analizando documentos:", error);
        throw error;
    }
};

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(",")[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
