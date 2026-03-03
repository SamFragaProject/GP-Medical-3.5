/**
 * ============================================================
 * Servicio de Análisis de Documentos Médicos con Gemini AI
 * PROMPTS DE EXTRACCIÓN MÁXIMA — basados en formatos reales GP Medical
 * REGLA: NUNCA resumir. Extraer CADA dato como item individual.
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
            console.warn(`Intento ${i + 1} falló con modelo ${currentModel}:`, error?.message || error);

            // Si es quota, intentar con modelo lite
            if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
                if (currentModel === MODEL_NAME) {
                    console.log(`Fallback a ${FALLBACK_MODEL} por límite de cuota`);
                    currentModel = FALLBACK_MODEL;
                }
            }

            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

// ── Tipos ──
export interface LabResult {
    name: string;
    parametro: string;    // alias
    value: string | number | any;
    resultado: string;    // alias
    unit: string;
    unidad: string;       // alias
    range: string;
    rango: string;        // alias
    description: string;
    observacion: string;  // alias
    visualizationType: 'gauge' | 'bar_chart' | 'list' | 'radar' | 'line_chart' | 'simple' | 'table_row' | 'pie_chart';
    category: string;
    categoria: string;    // alias
    subCategory?: string;
}

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

// ── Schemas Gemini ──
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

// ── INSTRUCCIÓN GLOBAL para todos los prompts ──
const GLOBAL_INSTRUCTION = `
REGLAS ABSOLUTAS DE EXTRACCIÓN — SIN EXCEPCIONES:
1. PROHIBIDO resumir, comprimir, combinar o parafrasear. Reproduce cada dato VERBATIM.
2. Cada campo del documento = un item separado en el array results.
3. Si un dato no está claro, ESTIMARLO a partir del contexto visual (no omitir).
4. El campo "value" debe contener el valor EXACTO tal como aparece en el documento.
5. El campo "description" es una interpretación clínica breve, NO un resumen del documento.
6. Extrae TODOS los campos visibles, incluso los que parecen menos importantes.
7. Si el documento es una IMAGEN o tiene gráficas, analízalas visualmente con detalle.
`.trim();

// ── Prompts por tipo de estudio — basados en formatos reales GP Medical ──
const getSectionConfig = (sectionId: string) => {
    switch (sectionId) {

        // ─────────────────────────────────────────────
        // LABORATORIOS
        // ─────────────────────────────────────────────
        case 'laboratorio':
        case 'laboratories':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un sistema de digitalización de laboratorios clínicos de máxima precisión.
EXTRAE CADA PARÁMETRO POR SEPARADO como un item individual del array results.

Para CADA parámetro crea un objeto con:
- name: nombre exacto del parámetro (ej: "Hemoglobina", "Leucocitos", "Glucosa", "Triglicéridos")
- value: valor numérico exacto como string (ej: "14.5", "7200", "95.0")
- unit: unidad exacta (ej: "g/dL", "/mm³", "mg/dL", "U/L")
- range: rango de referencia completo tal como aparece (ej: "12.0 - 16.0", "4500 - 11000")
- description: estado clínico (ej: "Dentro del rango normal", "Elevado — requiere seguimiento")
- visualizationType: "bar_chart" para valores numéricos con rango, "simple" para textos
- category: nombre EXACTO del grupo del documento (ej: "Biometría Hemática", "Química Sanguínea", "Uroanálisis")
- subCategory: subcategoría si existe (ej: "Fórmula Roja", "Fórmula Blanca", "Serie Plaquetaria")

Extrae ABSOLUTAMENTE TODOS los parámetros visibles:
Biometría: Eritrocitos, Hemoglobina, Hematocrito, VCM, HCM, CMHC, RDW-CV, Plaquetas, VPM, 
Leucocitos, Neutrófilos%, Segmentados, Bandas, Eosinófilos%, Basófilos%, Monocitos%, Linfocitos%
Química: Glucosa, Urea, Creatinina, Ácido Úrico, Colesterol Total, HDL, LDL, Triglicéridos,
TGO, TGP, Fosfatasa Alcalina, Bilirrubinas (Total/Directa/Indirecta), Proteínas, Albúmina
Orina: Apariencia, Color, pH, Densidad, Proteínas, Glucosa, Cetonas, Sangre, Nitritos, Leucocitos
Y CUALQUIER OTRO PARÁMETRO que aparezca en el documento.`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Solo valores fuera de rango significativos." },
                    },
                },
            };

        // ─────────────────────────────────────────────
        // AUDIOMETRÍA
        // ─────────────────────────────────────────────
        case 'audiometria':
        case 'audiometry':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un audiólogo experto digitalizando un audiograma de GP Medical Health (equipo INVENTIS PICCOLO BASIC).
El documento contiene: gráficas de audiograma (dB vs Hz) + tabla de umbrales + diagnóstico.

FRECUENCIAS ESTÁNDAR del audiograma: 125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000 Hz
Eje Y: decibeles (dB HL). Valores MÁS BAJOS = MEJOR audición.
Rango normal: 0-25 dB. Pérdida leve: 26-40. Moderada: 41-55. Severa: 56-70. Profunda: >70.
Oído Derecho = línea/símbolos ROJOS. Oído Izquierdo = línea/símbolos AZULES.
La tabla "VA DCHA Umbral" al pie del audiograma izquierdo tiene los valores dB del OD.
La tabla "VA IZQ Umbral" al pie del audiograma derecho tiene los valores del OI.

EXTRAE OBLIGATORIAMENTE (cada item por separado):

OÍDO DERECHO — un item por frecuencia:
- name: "OD_125Hz", value: dB exacto, unit:"dB HL", range:"0-25", visualizationType:"line_chart", category:"Oído Derecho", subCategory:"Vía Aérea"
- name: "OD_250Hz", ... (mismo formato)
- name: "OD_500Hz", "OD_750Hz", "OD_1000Hz", "OD_1500Hz", "OD_2000Hz", "OD_3000Hz", "OD_4000Hz", "OD_6000Hz", "OD_8000Hz"
- description de cada uno: "Normal (<25dB)"/"Pérdida leve (26-40dB)"/"Pérdida moderada (41-55dB)"/"Pérdida severa (>55dB)"

OÍDO IZQUIERDO — mismo formato:
- name: "OI_125Hz", "OI_250Hz", ..., "OI_8000Hz"
- category: "Oído Izquierdo"

AUDIOGRAMA COMPLETO (item especial para gráfica):
- name: "AUDIOGRAMA_DATOS"
- value: JSON array: [{"frecuencia":125,"od":XX,"oi":XX},{"frecuencia":250,"od":XX,"oi":XX},{"frecuencia":500,"od":XX,"oi":XX},{"frecuencia":750,"od":XX,"oi":XX},{"frecuencia":1000,"od":XX,"oi":XX},{"frecuencia":1500,"od":XX,"oi":XX},{"frecuencia":2000,"od":XX,"oi":XX},{"frecuencia":3000,"od":XX,"oi":XX},{"frecuencia":4000,"od":XX,"oi":XX},{"frecuencia":6000,"od":XX,"oi":XX},{"frecuencia":8000,"od":XX,"oi":XX}]
- visualizationType: "line_chart"
- category: "Audiograma Completo"
- description: "Audiograma tonal vía aérea bilateral"

DIAGNÓSTICO:
- name:"DIAGNOSTICO_OD", value: diagnóstico oído derecho, description: clasificación, category:"Diagnóstico"
- name:"DIAGNOSTICO_OI", value: diagnóstico oído izquierdo, category:"Diagnóstico"
- name:"DIAGNOSTICO_GENERAL", value: diagnóstico bilateral completo (ej:"NORMOACUSIA BILATERAL"), category:"Diagnóstico"

DATOS DEL ESTUDIO:
- name:"EQUIPO", value: nombre dispositivo (ej:"INVENTIS PICCOLO BASIC"), unit: número de serie (SN), description: fecha calibración y transductor, category:"Datos del Estudio"
- name:"MEDICO_RESPONSABLE", value: nombre completo del médico firmante, category:"Datos del Estudio"
- name:"FECHA_ESTUDIO", value: fecha y hora del estudio, category:"Datos del Estudio"

Si hay recomendaciones de EPP auditivo, extráelas como items separados en category:"Recomendaciones".`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Diagnóstico audiológico completo y clasificación NOM-011." },
                    },
                },
            };

        // ─────────────────────────────────────────────
        // ESPIROMETRÍA
        // ─────────────────────────────────────────────
        case 'espirometria':
        case 'spirometry':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un neumólogo experto digitalizando un reporte de espirometría.
Extrae CADA PARÁMETRO CON TODAS SUS COLUMNAS como item separado.

EXTRAE OBLIGATORIAMENTE:

TABLA DE PARÁMETROS — un item por parámetro (todos los que existan: FVC, FEV1, FEV1/FVC, FEF25-75, PEF, FET, FEV6):
- name: nombre exacto (ej:"FVC", "FEV1", "FEV1/FVC", "FEF25-75", "PEF")
- value: JSON string con TODAS las columnas: {"pred":X,"lln":X,"mejor":X,"pct_pred":X,"z_score":X}
  Donde: pred=Predicho, lln=Límite Inferior Normal, mejor=Mejor resultado, pct_pred=%Predicho, z_score=Puntuación Z
- unit: unidad (L, L/s, %, s)
- description: interpretación ("Normal ≥80%","Reducido 60-79%","Severamente reducido <60%")
- visualizationType: "table_row"
- category: "Parámetros Espirométricos"

GRÁFICA FLUJO-VOLUMEN:
- name:"CURVA_FLUJO_VOLUMEN"
- value: JSON: {"medido":[{"x":0,"y":0},{"x":0.5,"y":5.2},{"x":1.0,"y":7.3},{"x":1.5,"y":6.8},...hasta FVC],"predicho":[{"x":0,"y":0},...]}
  (Genera ~12-15 puntos representativos basados en FVC, FEV1 y PEF si no puedes leer datos exactos)
- visualizationType: "line_chart"
- category: "Gráficas"
- description: "Curva Flujo-Volumen (Flujo en L/s vs Volumen en L)"

GRÁFICA VOLUMEN-TIEMPO:
- name:"CURVA_VOLUMEN_TIEMPO"
- value: JSON: {"medido":[{"x":0,"y":0},{"x":1,"y":FEV1},{"x":2,"y":FVC*0.95},{"x":3,"y":FVC},...]}
- visualizationType: "line_chart"
- category: "Gráficas"

CALIDAD Y RESULTADO:
- name:"CALIDAD_SESION", value: letra (A/B/C/D/E/F), description: "Excelente"/"Aceptable"/"Dudosa", category:"Control de Calidad"
- name:"INTERPRETACION_SISTEMA", value: texto EXACTO de interpretación automática, category:"Interpretación"
- name:"PATRON_VENTILATORIO", value: "Normal"/"Obstructivo Leve"/"Obstructivo Moderado"/"Obstructivo Severo"/"Restrictivo"/"Mixto", category:"Interpretación"

ANTROPOMETRÍA:
- name:"ALTURA", value: valor, unit:"cm", category:"Antropometría"
- name:"PESO", value: valor, unit:"kg", category:"Antropometría"
- name:"IMC", value: valor, unit:"kg/m²", range:"18.5-24.9", category:"Antropometría"
- name:"FUMADOR", value: "Sí"/"No"/"Ex-fumador", category:"Antropometría"
- name:"ETNIA", value: origen étnico, category:"Antropometría"

DATOS DEL ESTUDIO:
- name:"EQUIPO", value: nombre del espirómetro, category:"Datos del Estudio"
- name:"MEDICO_RESPONSABLE", value: nombre del médico, category:"Datos del Estudio"
- name:"FECHA_ESTUDIO", value: fecha, category:"Datos del Estudio"`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Patrón ventilatorio, severidad y función pulmonar global." },
                    },
                },
            };

        // ─────────────────────────────────────────────
        // RADIOGRAFÍA
        // ─────────────────────────────────────────────
        case 'radiografia':
        case 'xRays':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un radiólogo experto digitalizando un reporte de rayos X de GP Medical.
El documento puede ser: (A) imagen radiográfica directa, (B) reporte escrito de interpretación, o (C) ambos.
Si es imagen, analízala visualmente con detalle.

EXTRAE OBLIGATORIAMENTE:

DATOS BÁSICOS:
- name:"REGION_ESTUDIADA", value: región exacta (ej:"Tórax PA","Columna Lumbar AP-Lateral","Columna Cervical"), category:"Datos del Estudio"
- name:"FECHA_ESTUDIO", value: fecha del estudio, category:"Datos del Estudio"
- name:"RADIOLOGO", value: nombre del radiólogo firmante, category:"Datos del Estudio"
- name:"TIENE_IMAGEN_ADJUNTA", value: "true" si el documento ES o INCLUYE la imagen radiográfica, category:"Metadatos"

HALLAZGOS RADIOLÓGICOS — un item por estructura anatómica:
Si es TÓRAX evalúa y extrae por separado:
- name:"CAMPOS_PULMONARES", value: descripción EXACTA Y COMPLETA (ej:"Campos pulmonares de características normales, sin infiltrados, consolidaciones ni derrame"), category:"Hallazgos Radiológicos"
- name:"SILUETA_CARDIACA", value: descripción completa (ej:"Silueta cardiaca de tamaños normales"), category:"Hallazgos Radiológicos"
- name:"MEDIASTINO", value: descripción (ej:"Mediastino centrado, de amplitud normal"), category:"Hallazgos Radiológicos"
- name:"HILIOS_PULMONARES", value: descripción (ej:"Hilios pulmonares de posición y morfología normales"), category:"Hallazgos Radiológicos"
- name:"SENOS_COSTOFRÉNICOS", value: descripción (ej:"Libres y bien definidos"), category:"Hallazgos Radiológicos"
- name:"DIAFRAGMA", value: descripción, category:"Hallazgos Radiológicos"
- name:"PARRILLA_COSTAL", value: descripción, category:"Hallazgos Radiológicos"
- name:"TEJIDOS_BLANDOS", value: descripción, category:"Hallazgos Radiológicos"
- name:"TRAQUEA_BRONQUIOS", value: descripción, category:"Hallazgos Radiológicos"

Si es COLUMNA:
- name:"CUERPOS_VERTEBRALES", value: descripción exacta, category:"Hallazgos Radiológicos"
- name:"DISCOS_INTERVERTEBRALES", value: descripción, category:"Hallazgos Radiológicos"
- name:"ALINEACION_COLUMNA", value: descripción (ej:"Lordosis lumbar conservada"), category:"Hallazgos Radiológicos"
- name:"SIGNOS_DEGENERATIVOS", value: descripción de osteofitos, artropatía etc., category:"Hallazgos Radiológicos"
- name:"PARTES_BLANDAS_COLUMNA", value: descripción, category:"Hallazgos Radiológicos"

MEDIDAS E ÍNDICES:
- name:"INDICE_CARDIOTORÁCICO", value: valor si se menciona (ej:"0.45"), unit:"ratio", range:"<0.50", category:"Mediciones"
- name:"CLASIFICACION_ILO", value: clasificación ILO/OIT si existe, category:"Clasificaciones"

CONCLUSIÓN:
- name:"CONCLUSIÓN_RADIOLÓGICA", value: texto COMPLETO verbatim de la conclusión/diagnóstico tal como aparece, visualizationType:"list", category:"Conclusión"`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Hallazgos radiológicos e impresión diagnóstica completa." },
                    },
                },
            };

        // ─────────────────────────────────────────────
        // OPTOMETRÍA
        // ─────────────────────────────────────────────
        case 'optometria':
        case 'optometry':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un optometrista experto digitalizando un examen optométrico de GP Medical.
Extrae CADA prueba y CADA ojo como item completamente separado.

EXTRAE OBLIGATORIAMENTE:

AGUDEZA VISUAL LEJANA (Escala Snellen):
- name:"AV_LEJANA_OD_SC", value: AV sin corrección OD (ej:"20/20"), unit:"Snellen", range:"20/20", description: interpretación, visualizationType:"gauge", category:"Agudeza Visual Lejana"
- name:"AV_LEJANA_OI_SC", value: AV sin corrección OI, visualizationType:"gauge", category:"Agudeza Visual Lejana"
- name:"AV_LEJANA_OD_CC", value: AV con corrección OD (si existe, si no: null), category:"Agudeza Visual Lejana"
- name:"AV_LEJANA_OI_CC", value: AV con corrección OI, category:"Agudeza Visual Lejana"

AGUDEZA VISUAL CERCANA (Escala Jaeger):
- name:"AV_CERCANA_OD_SC", value: Jaeger OD (ej:"J1","J2","J3"), unit:"Jaeger", range:"J1-J2", category:"Agudeza Visual Cercana"
- name:"AV_CERCANA_OI_SC", value: Jaeger OI, category:"Agudeza Visual Cercana"
- name:"AV_CERCANA_OD_CC", value: con corrección si existe, category:"Agudeza Visual Cercana"
- name:"AV_CERCANA_OI_CC", value: con corrección si existe, category:"Agudeza Visual Cercana"

PERCEPCIÓN DE COLORES E ISHIHARA:
- name:"ISHIHARA_RESULTADO", value: "Normal"/"Alterado"/"Discromatopsia", description: texto completo, category:"Percepción de Colores"
- name:"ISHIHARA_LÁMINAS", value: láminas correctas de total (ej:"14/14"), unit:"láminas", range:"14/14", category:"Percepción de Colores"

CAMPIMETRÍA:
- name:"CAMPIMETRIA_OD", value: resultado textual (ej:"Normal por confrontación","Sin defectos campimétricos"), category:"Campimetría"
- name:"CAMPIMETRIA_OI", value: resultado textual OI, category:"Campimetría"
- name:"CAMPIMETRIA_METODO", value: método (ej:"Por confrontación","Computerizada"), category:"Campimetría"

REFRACCIÓN (si existe):
- name:"REFRACCION_OD_ESFERA", value: valor (ej:"-0.50"), unit:"D", category:"Refracción"
- name:"REFRACCION_OD_CILINDRO", value: valor, unit:"D", category:"Refracción"
- name:"REFRACCION_OD_EJE", value: valor, unit:"°", category:"Refracción"
- name:"REFRACCION_OD_AV_FINAL", value: AV resultante con refracción, category:"Refracción"
- name:"REFRACCION_OI_ESFERA", value: valor, unit:"D", category:"Refracción"
- name:"REFRACCION_OI_CILINDRO", value: valor, unit:"D", category:"Refracción"
- name:"REFRACCION_OI_EJE", value: valor, unit:"°", category:"Refracción"

PRESIÓN INTRAOCULAR (si existe):
- name:"PIO_OD", value: valor, unit:"mmHg", range:"10-21", category:"Presión Intraocular"
- name:"PIO_OI", value: valor, unit:"mmHg", range:"10-21", category:"Presión Intraocular"

ESTADO Y CONCLUSIÓN:
- name:"USA_LENTES", value: "Sí"/"No", description: tipo de lentes si aplica, category:"Estado Visual"
- name:"IMPRESION_OPTOMETRICA", value: TEXTO COMPLETO de la impresión optométrica, category:"Impresión"
- name:"CONCLUSION_GENERAL", value: TEXTO COMPLETO de la conclusión verbatim, visualizationType:"list", category:"Conclusión"
- name:"RECOMENDACIONES", value: recomendaciones completas, category:"Recomendaciones"
- name:"FECHA_ESTUDIO", value: fecha, category:"Datos del Estudio"
- name:"OPTOMETRISTA", value: nombre del evaluador, category:"Datos del Estudio"`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Estado visual completo y aptitud visual para el trabajo." },
                    },
                },
            };

        // ─────────────────────────────────────────────
        // ELECTROCARDIOGRAMA
        // ─────────────────────────────────────────────
        case 'ecg':
        case 'electrocardiogram':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un cardiólogo experto digitalizando un electrocardiograma de GP Medical (equipo BTL CardioPoint).
El documento puede ser: (A) el trazado ECG con tabla de mediciones, (B) reporte de interpretación narrativa, o (C) ambos.
Extrae CADA parámetro como item individual.

PARÁMETROS NUMÉRICOS DE LA TABLA DE MEDICIONES (si existe el trazado):
- name:"FC", value: frecuencia cardiaca en lpm, unit:"lpm", range:"60-100", description:"Normal"/"Bradicardia <60"/"Taquicardia >100", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"RR", value: intervalo RR en ms, unit:"ms", range:"600-1000", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"ONDA_P", value: duración P en ms, unit:"ms", range:"80-120", description:"Normal"/"Prolongada"/"Ausente", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"INTERVALO_PR", value: intervalo PR en ms, unit:"ms", range:"120-200", description:"Normal"/"Bloqueo 1° grado >200ms", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"COMPLEJO_QRS", value: duración QRS en ms, unit:"ms", range:"60-100", description:"Normal"/"Bloqueo rama >120ms", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"INTERVALO_QT", value: QT en ms, unit:"ms", range:"350-450", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"INTERVALO_QTC", value: QTc corregido por Bazett en ms, unit:"ms", range:"<440 H / <460 M", description:"Normal"/"Prolongado", visualizationType:"gauge", category:"Parámetros Numéricos"
- name:"SPO2", value: saturación O2 si se registró, unit:"%", range:"95-100", category:"Parámetros Numéricos"
- name:"PA", value: presión arterial si se registró (ej:"120/80"), unit:"mmHg", range:"<120/80", category:"Parámetros Numéricos"

EJES ELÉCTRICOS:
- name:"EJE_P", value: eje onda P en °, unit:"°", range:"0° a 75°", category:"Ejes Eléctricos"
- name:"EJE_QRS", value: eje QRS en °, unit:"°", range:"-30° a +90°", description:"Normal"/"Izquierdo"/"Derecho", category:"Ejes Eléctricos"
- name:"EJE_T", value: eje onda T en °, unit:"°", category:"Ejes Eléctricos"

INTERPRETACIÓN AUTOMÁTICA DEL EQUIPO:
- name:"RITMO_AUTOMATICO", value: texto exacto del sistema (ej:"Ritmo sinusal"), category:"Interpretación Automática"
- name:"RESULTADO_GLOBAL", value: texto exacto (ej:"ECG normal"), category:"Interpretación Automática"

INTERPRETACIÓN MÉDICA (del reporte narrativo si existe):
- name:"DESCRIPCION_RITMO", value: descripción completa del ritmo cardiaco, visualizationType:"list", category:"Interpretación Médica"
- name:"ANALISIS_MORFOLOGICO", value: descripción morfológica de ondas P, QRS, T y segmento ST-T, category:"Interpretación Médica"
- name:"SEGMENTO_ST", value: descripción del segmento ST (ej:"Sin alteraciones en el segmento ST"), category:"Interpretación Médica"
- name:"ONDA_T_DESC", value: descripción de onda T, category:"Interpretación Médica"
- name:"CONCLUSION_ECG", value: TEXTO COMPLETO de la conclusión/impresión clínica VERBATIM, visualizationType:"list", category:"Interpretación Médica"

METADATOS:
- name:"TIPO_ESTUDIO", value: tipo (ej:"ECG en reposo","ECG de esfuerzo"), category:"Datos del Estudio"
- name:"EQUIPO_ECG", value: nombre y versión del electrocardiógrafo (ej:"BTL CardioPoint 2.33.163.0"), description: número de serie, category:"Datos del Estudio"
- name:"FECHA_ESTUDIO", value: fecha y hora exactas del estudio, category:"Datos del Estudio"
- name:"MEDICO_RESPONSABLE", value: nombre del médico responsable, category:"Datos del Estudio"
- name:"TIENE_TRAZADO_IMAGEN", value: "true" si el documento incluye la imagen gráfica de las 12 derivaciones ECG, "false" si es solo reporte textual, category:"Metadatos"`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Ritmo, ejes eléctricos, morfología de ondas y diagnóstico cardiológico completo." },
                    },
                },
            };

        // ─────────────────────────────────────────────
        // DEFAULT
        // ─────────────────────────────────────────────
        default:
            return {
                prompt: `${GLOBAL_INSTRUCTION}
Extrae TODA la información médica visible en el documento. Cada dato es un item separado.`,
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
    if (n.includes('opto') || n.includes('vista') || n.includes('optome')) return 'optometria';
    return 'laboratorio';
}

// ── Función principal de análisis ──
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
                        mimeType: file.type || 'image/jpeg'
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const imageParts = await Promise.all(imageFiles.map(fileToPart));

    // Si hay texto extraído del PDF, lo incluimos. Si solo hay imágenes, le decimos que las analice.
    const textSection = text
        ? `TEXTO EXTRAÍDO DEL DOCUMENTO:\n${text}\n\n`
        : `(El documento es una imagen — analiza visualmente con máximo detalle)\n\n`;

    const fullPrompt = `${sectionPrompt}\n\n${textSection}INSTRUCCIÓN FINAL: Devuelve JSON con TODOS los datos extraídos. NO resumas. Cada campo del documento = un item en results[].`;

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
            // Rellenar aliases legacy para compatibilidad con todos los tabs
            res.parametro = res.name;
            res.resultado = typeof res.value === 'object' ? JSON.stringify(res.value) : String(res.value ?? '');
            res.unidad = res.unit ?? '';
            res.rango = res.range ?? '';
            res.observacion = res.description ?? '';
            res.categoria = res.category ?? '';

            // Si value es un string que parece JSON, parsearlo
            if (typeof res.value === 'string' && (res.value.startsWith('{') || res.value.startsWith('['))) {
                try { res.value = JSON.parse(res.value); } catch (e) { }
            }
            // Si resultado es string JSON, parsearlo también
            if (typeof res.resultado === 'string' && (res.resultado.startsWith('{') || res.resultado.startsWith('['))) {
                try { res.resultado = JSON.parse(res.resultado); } catch (e) { }
            }
            return res;
        });
    }

    return parsed;
}

export function isGeminiConfigured(): boolean {
    return !!API_KEY;
}
