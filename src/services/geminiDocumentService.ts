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
        // Mantenemos obligatorios solo los esenciales para no romper extracciones complejas (espirometría)
        required: ["name", "value", "category"],
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

DATOS DEL PACIENTE (campo patientData) — OBLIGATORIO EN TODOS LOS DOCUMENTOS:
- name: Nombre COMPLETO tal como aparece. En documentos mexicanos el formato habitual es "APELLIDO APELLIDO, NOMBRE(S)" con coma separando apellidos de nombre(s). Transcríbelo EXACTAMENTE como aparece.
- birthDate: Fecha de nacimiento (dd/mm/yyyy)
- age: Edad en años
- gender: Masculino/Femenino
- folio: ID, folio o número de empleado si aparece
- curp: CURP si aparece
- nss: NSS si aparece
- rfc: RFC si aparece

ALERTAS CLÍNICAS — Para CADA resultado fuera de rango:
- Si es CRÍTICO (riesgo vital): description debe incluir "⚠️ CRÍTICO"
- Si es ANORMAL: description debe incluir "↑ Alto" o "↓ Bajo"  
- Si es NORMAL: description debe incluir "✓ Normal"
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

Eres un patólogo clínico experto (NOM-007-SSA3, ISO 15189) digitalizando resultados de laboratorio de GP Medical.
EXTRAE CADA PARÁMETRO POR SEPARADO como un item individual del array results.

Para CADA parámetro crea un objeto con:
- name: nombre exacto del parámetro (ej: "Hemoglobina", "Leucocitos", "Glucosa")
- value: valor numérico exacto como string (ej: "14.5", "7200", "95.0")
- unit: unidad exacta (ej: "g/dL", "/mm³", "mg/dL", "U/L")
- range: rango de referencia completo tal como aparece (ej: "12.0 - 16.0")
- description: "✓ Normal" / "↑ Alto" / "↓ Bajo" / "⚠️ CRÍTICO" según el valor vs rango
- visualizationType: "bar_chart" para valores numéricos con rango, "simple" para textos
- category: nombre EXACTO del grupo del documento (ej: "Biometría Hemática", "Química Sanguínea", "Examen General de Orina")
- subCategory: subcategoría (ej: "Fórmula Roja", "Fórmula Blanca", "Serie Plaquetaria", "Perfil Hepático", "Perfil Lipídico")

VALORES CRÍTICOS (description = "⚠️ CRÍTICO — requiere atención inmediata"):
  Glucosa < 50 o > 400 mg/dL | Hemoglobina < 7.0 g/dL | Plaquetas < 50,000
  Leucocitos < 2,000 o > 30,000 | Potasio < 3.0 o > 6.0 mEq/L

BIOMETRÍA HEMÁTICA — extrae TODOS:
Fórmula Roja: Eritrocitos (H:4.5-5.5/M:4.0-5.0 M/µL), Hemoglobina (H:13.5-17.5/M:12.0-16.0 g/dL), Hematocrito (H:40-54/M:36-48%), VCM (80-100 fL), HCM (27-33 pg), CMHC (32-36 g/dL), RDW-CV (11.5-14.5%)
Fórmula Blanca: Leucocitos (4500-11000/µL), Neutrófilos% (40-70%), Segmentados, Bandas, Eosinófilos% (1-4%), Basófilos% (0-1%), Monocitos% (2-8%), Linfocitos% (20-44%)
Serie Plaquetaria: Plaquetas (150000-400000/µL), VPM (6.5-12.0 fL)

QUÍMICA SANGUÍNEA — extrae TODOS:
Glucosa (70-100 mg/dL), Urea (15-45), BUN (7-20), Creatinina (H:0.7-1.3/M:0.6-1.1), Ácido Úrico (H:3.5-7.2/M:2.6-6.0), Colesterol Total (<200), HDL (>40), LDL (<130), Triglicéridos (<150), TGO/AST (10-40 U/L), TGP/ALT (7-56 U/L), Fosf. Alcalina (44-147), GGT (H:8-61/M:5-36), Bilirrubina Total (0.1-1.2), Proteínas Totales (6.0-8.3), Albúmina (3.5-5.0)

EXAMEN GENERAL DE ORINA — extrae TODOS:
pH (5.0-8.0), Densidad (1.005-1.030), Color, Apariencia, Proteínas (Neg), Glucosa (Neg), Cetonas (Neg), Sangre (Neg), Nitritos (Neg), Leucocitos (Neg), Bilirrubina (Neg), Urobilinógeno, Sedimento (Eritrocitos, Leucocitos, Células epiteliales, Bacterias, Cilindros)

Y CUALQUIER OTRO PARÁMETRO que aparezca en el documento (Electrolitos, Hormonas, Serología, etc.)`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Solo valores fuera de rango significativos y alertas críticas." },
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

Eres un audiólogo experto (NOM-011-STPS-2001, AMHA, AAO-HNS) digitalizando un audiograma de GP Medical Health (equipo INVENTIS PICCOLO BASIC).
El documento contiene: gráficas de audiograma (dB vs Hz) + tabla de umbrales + diagnóstico.

CLASIFICACIÓN HIPOACUSIA (OMS/NOM-011):
  0-25 dB HL → Normal | 26-40 → Pérdida leve | 41-55 → Moderada | 56-70 → Severa | 71-90 → Profunda | >90 → Anacusia
PTA (Promedio Tonal Puro) = (500Hz + 1000Hz + 2000Hz) / 3. PTA normal ≤ 25 dB.
TRAUMA ACÚSTICO = escotoma (caída) en 4000-6000 Hz con recuperación parcial en 8000 Hz.

FRECUENCIAS ESTÁNDAR del audiograma: 125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000 Hz
Eje Y: decibeles (dB HL). Valores MÁS BAJOS = MEJOR audición.
Oído Derecho = línea/símbolos ROJOS (códigos: O, △). Oído Izquierdo = línea/símbolos AZULES (códigos: X, □).
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

Eres un neumólogo experto digitalizando un reporte de espirometría de GP Medical Health.
El documento puede ser del equipo EasyOne Connect u otro espirómetro clínico.

**DATOS DEL PACIENTE** (campo patientData):
- name: Nombre COMPLETO tal como aparece (formato habitual: "APELLIDO APELLIDO, NOMBRE(S)" con coma)
- birthDate: Fecha de nacimiento (dd/mm/yyyy)
- age: Edad en años
- gender: Masculino/Femenino
- folio: ID o número de empleado si aparece (ej: #0571)

EXTRAE OBLIGATORIAMENTE cada dato como item separado en results[]:

TABLA DE PARÁMETROS — un item por parámetro (FVC, FEV1, FEV1/FVC, FEF25-75, PEF, FET, FEV6):
- name: nombre exacto (ej:"FVC", "FEV1", "FEV1/FVC", "FEF25-75", "PEF", "FET")
- value: JSON string con TODAS las columnas incluyendo pruebas individuales:
  {"pred":X,"lln":X,"mejor":X,"pruebas":[valor_prueba1, valor_prueba2, valor_prueba3],"pct_pred":X,"z_score":X,"fuera_rango":true/false}
  Donde: pred=Predicho, lln=Límite Inferior Normal, mejor=Mejor resultado, 
  pruebas=array con los valores de CADA prueba/intento individual en orden,
  pct_pred=%Predicho, z_score=Puntuación Z, fuera_rango=true si tiene asterisco (*)
- unit: unidad (L, L/s, %, s)
- description: interpretación ("Normal ≥80%","Limítrofe 70-79%","Reducido <70%")
- visualizationType: "table_row"
- category: "Parámetros Espirométricos"

GRÁFICA Z-SCORE (barras horizontales):
- name:"ZSCORE_BARRAS"
- value: JSON: {"FVC":-1.78,"FEV1":-1.55,"FEF25-75":-0.45,"PEF":0.71,"FEV1_FVC":0.23}
- category: "Gráficas"
- description: "Barras de puntuación Z por parámetro"

GRÁFICA FLUJO-VOLUMEN:
- name:"CURVA_FLUJO_VOLUMEN"
- value: JSON arreglos {"medido":[{"x":vol,"y":flujo},...],"predicho":[{"x":vol,"y":flujo},...],"prueba2":[],"prueba5":[],"prueba6":[]}
  (Genera 15-20 puntos representativos basados en FVC, FEV1 y PEF leyendo cuidadosamente los ejes).
- visualizationType: "line_chart"
- category: "Gráficas"
- description: "Curva Flujo-Volumen (Flujo en L/s vs Volumen en L)"

GRÁFICA VOLUMEN-TIEMPO:
- name:"CURVA_VOLUMEN_TIEMPO"
- value: JSON arreglos {"medido":[{"x":tiempo,"y":volumen},...],"predicho":[],"prueba2":[],"prueba5":[],"prueba6":[]}
  (Genera 15-20 puntos extrayendo fielmente el trazado de la gráfica Volumen-Tiempo).
- visualizationType: "line_chart"
- category: "Gráficas"

CONTROL DE CALIDAD:
- name:"CALIDAD_SESION", value: letra (A/B/C/D/E/F), description: criterio completo (ej:"C (FEV1 Var=0.14L 4.4%; FVC Var=0.19L 4.7%)"), category:"Control de Calidad"
- name:"VARIABILIDAD_FEV1", value: texto (ej:"0.14L (4.4%)"), category:"Control de Calidad"  
- name:"VARIABILIDAD_FVC", value: texto (ej:"0.19L (4.7%)"), category:"Control de Calidad"

CONFIGURACIÓN DEL ESTUDIO:
- name:"TIPO_PRUEBA", value: tipo de prueba (ej:"FVC (sólo esp)"), category:"Configuración del Estudio"
- name:"CRITERIO_INTERPRETACION", value: criterio usado (ej:"GOLD(2008)/Hardie"), category:"Configuración del Estudio"
- name:"ECUACION_PREDICHO", value: ecuación de referencia (ej:"Hankinson (NHANES III), 1999"), category:"Configuración del Estudio"
- name:"SELECCION_VALORES", value: selección (ej:"BTPS (INSP/ESP)"), category:"Configuración del Estudio"
- name:"MEJOR_VALOR_RATIO", value: ratio (ej:"1.12/1.02"), category:"Configuración del Estudio"

INTERPRETACIÓN:
- name:"INTERPRETACION_SISTEMA", value: texto EXACTO de interpretación automática, category:"Interpretación"
- name:"PATRON_VENTILATORIO", value: "NORMAL"/"OBSTRUCTIVO LEVE"/"OBSTRUCTIVO MODERADO"/"OBSTRUCTIVO SEVERO"/"RESTRICTIVO"/"MIXTO", category:"Interpretación"

ANTROPOMETRÍA:
- name:"ALTURA", value: valor, unit:"cm", category:"Antropometría"
- name:"PESO", value: valor, unit:"kg", category:"Antropometría"
- name:"IMC", value: valor, unit:"kg/m²", range:"18.5-24.9", category:"Antropometría"
- name:"FUMADOR", value: "Sí"/"No"/"Ex-fumador", category:"Antropometría"
- name:"ASMA", value: "Sí"/"No", category:"Antropometría"
- name:"EPOC", value: "Sí"/"No", category:"Antropometría"
- name:"ETNIA", value: origen étnico, category:"Antropometría"

DATOS DEL ESTUDIO:
- name:"EQUIPO", value: nombre completo del espirómetro con versión y SN, category:"Datos del Estudio"
- name:"MEDICO_RESPONSABLE", value: nombre del médico firmante, category:"Datos del Estudio"
- name:"FECHA_ESTUDIO", value: fecha y hora del estudio, category:"Datos del Estudio"`,
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

Eres un radiólogo experto (NOM-229-SSA1-2002) digitalizando un reporte de rayos X de GP Medical.
El documento puede ser: (A) imagen radiográfica directa, (B) reporte escrito de interpretación, o (C) ambos.
Si es imagen, analízala visualmente con detalle ESTRUCTURA POR ESTRUCTURA.

CRITERIOS RADIOLÓGICOS:
ICT (Índice Cardiotorácico): Normal <0.50 | Cardiomegalia leve 0.50-0.55 | Moderada 0.55-0.60 | Severa >0.60
ILO: Profusión 0/0→3/+ | Forma: p/q/r (redondas) s/t/u (irregulares) | Grandes: A(<5cm) B C
COLUMNA: Kellgren-Lawrence (0-IV para artropatía degenerativa). Evaluar lordosis/cifosis conservada, osteofitos, pinzamiento discal.

EXTRAE OBLIGATORIAMENTE:

DATOS BÁSICOS:
- name:"REGION_ESTUDIADA", value: región exacta (ej:"Tórax PA","Columna Lumbar AP-Lateral","Columna Cervical"), category:"Datos del Estudio"
- name:"FECHA_ESTUDIO", value: fecha del estudio, category:"Datos del Estudio"
- name:"RADIOLOGO", value: nombre del radiólogo firmante, category:"Datos del Estudio"
- name:"TIENE_IMAGEN_ADJUNTA", value: "true" si el documento ES o INCLUYE la imagen radiográfica, category:"Metadatos"

HALLAZGOS RADIOLÓGICOS — un item por estructura anatómica (evalúa SISTEMÁTICAMENTE):
Si es TÓRAX evalúa y extrae por separado:
- name:"CAMPOS_PULMONARES", value: descripción EXACTA Y COMPLETA (infiltrados, consolidaciones, nódulos, masas, fibrosis, atelectasias), description: "✓ Normal" o hallazgo específico, category:"Hallazgos Radiológicos"
- name:"SILUETA_CARDIACA", value: descripción completa (tamaño, forma, posición), category:"Hallazgos Radiológicos"
- name:"MEDIASTINO", value: descripción (centrado, amplitud, masas), category:"Hallazgos Radiológicos"
- name:"HILIOS_PULMONARES", value: descripción (posición, morfología, ganglios), category:"Hallazgos Radiológicos"
- name:"SENOS_COSTOFRÉNICOS", value: descripción (libres o derrame), category:"Hallazgos Radiológicos"
- name:"DIAFRAGMA", value: descripción (altura, contorno, hernias), category:"Hallazgos Radiológicos"
- name:"PARRILLA_COSTAL", value: descripción (fracturas, lesiones óseas), category:"Hallazgos Radiológicos"
- name:"TEJIDOS_BLANDOS", value: descripción (enfisema, calcificaciones), category:"Hallazgos Radiológicos"
- name:"TRAQUEA_BRONQUIOS", value: descripción (centrada, calibre), category:"Hallazgos Radiológicos"

Si es COLUMNA:
- name:"CUERPOS_VERTEBRALES", value: descripción (altura, densidad, osteofitos), category:"Hallazgos Radiológicos"
- name:"DISCOS_INTERVERTEBRALES", value: descripción (conservados o reducidos, protrusión), category:"Hallazgos Radiológicos"
- name:"ALINEACION_COLUMNA", value: descripción (ej:"Lordosis lumbar conservada"), category:"Hallazgos Radiológicos"
- name:"SIGNOS_DEGENERATIVOS", value: descripción de osteofitos, artropatía, Kellgren-Lawrence, category:"Hallazgos Radiológicos"
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

Eres un optometrista experto (NOM-007-SSA3-2011) digitalizando un examen optométrico de GP Medical.
Extrae CADA prueba y CADA ojo como item completamente separado.

CLASIFICACIÓN AGUDEZA VISUAL (Snellen):
  20/20 Normal | 20/25 Casi normal | 20/30-20/40 Leve | 20/50-20/70 Significativa | 20/100+ Severa | 20/200 Ceguera legal
ISHIHARA: 14/14 Normal | 11-13/14 Sospecha | <11/14 Discromatopsia confirmada (Protanopia/Deuteranopia/Tritanopia)
JAEGER: J1 Normal (=20/20) | J2 Casi normal | J3-J5 Presbicia leve-moderada | J7+ Presbicia significativa
APTITUD VISUAL LABORAL:
  APTO: AV ≥20/30, Ishihara 14/14, campos normales
  APTO CON RESTRICCIONES: AV 20/40-20/70 con lentes → no alturas, no conducción nocturna
  NO APTO: AV <20/70 con corrección, discromatopsia severa

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

CRITERIOS DE INTERPRETACIÓN CARDIOLÓGICA:
RITMOS: Sinusal normal (cada QRS precedido por P, FC 60-100) | Bradicardia sinusal (<60) | Taquicardia sinusal (>100) | FA (ausencia P, RR irregular)
BLOQUEOS: BAV 1° (PR >200ms constante) | BAV 2° Mobitz I (PR alargamiento progresivo) | BAV 2° Mobitz II (PR fijo, P no conducidas) | BAV 3° (disociación AV)
BLOQUEO RAMA: BRDHH (QRS >120ms, rSR' en V1-V2) | BRIHH (QRS >120ms, R ancha V5-V6)
SEGMENTO ST: Elevación >1mm en 2+ derivaciones contiguas = isquemia aguda | Depresión >0.5mm = isquemia subendocárdica
EJES: Normal -30° a +90° | Izquierdo <-30° (HVI, BRIHH) | Derecho >+90° (HVD, BRDHH)

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
        // HISTORIA CLÍNICA
        // ─────────────────────────────────────────────
        case 'historia_clinica':
        case 'historia':
        case 'formulario':
            return {
                prompt: `${GLOBAL_INSTRUCTION}

Eres un médico del trabajo experto (NOM-030-STPS-2009, NOM-035-STPS-2018, Ley Federal del Trabajo Art. 132-134) digitalizando un formulario de Historia Clínica / Examen Médico Ocupacional de GP Medical Health.
El documento es un formulario médico con múltiples secciones y campos. Extráelos TODOS, campo por campo.

TIPOS DE EXAMEN: INGRESO (pre-empleo) | PERIÓDICO (vigilancia) | EGRESO (fin relación) | ESPECIAL (post-incapacidad, cambio puesto)
APTITUD LABORAL:
  APTO — Sin limitaciones para el puesto
  APTO CON RESTRICCIONES — Puede trabajar con adecuaciones (no alturas, no cargas >Xkg, EPP específico)
  APTO CON SEGUIMIENTO — Requiere vigilancia médica periódica
  NO APTO TEMPORAL — Incapacidad temporal, puede reintegrarse
  NO APTO DEFINITIVO — Limitación permanente para el puesto
RIESGOS: Físicos (ruido, vibración, radiaciones, temperaturas) | Químicos (solventes, polvos, humos, gases) | Biológicos (microorganismos, sangre) | Ergonómicos (posturas, cargas, repetitivos) | Psicosociales (estrés, turnos, violencia)

EXTRAE OBLIGATORIAMENTE CADA SECCIÓN Y CAMPO:

DATOS PERSONALES / IDENTIFICACIÓN (un item por campo):
- name:"NOMBRE_COMPLETO", value: nombre del trabajador, category:"Datos Personales"
- name:"FECHA_NACIMIENTO", value: fecha de nacimiento, category:"Datos Personales"
- name:"EDAD", value: edad en años, unit:"años", category:"Datos Personales"
- name:"SEXO", value: "Masculino"/"Femenino", category:"Datos Personales"
- name:"CURP", value: CURP del paciente, category:"Datos Personales"
- name:"NSS", value: Número de Seguridad Social, category:"Datos Personales"
- name:"RFC", value: RFC, category:"Datos Personales"
- name:"ESCOLARIDAD", value: nivel educativo, category:"Datos Personales"
- name:"ESTADO_CIVIL", value: estado civil, category:"Datos Personales"
- name:"DOMICILIO", value: dirección completa, category:"Datos Personales"
- name:"TELEFONO", value: número de teléfono, category:"Datos Personales"
- name:"CONTACTO_EMERGENCIA", value: nombre y teléfono del contacto, category:"Datos Personales"
- name:"EMPRESA", value: nombre de la empresa empleadora, category:"Datos Personales"
- name:"PUESTO", value: puesto de trabajo, category:"Datos Personales"
- name:"ANTIGUEDAD", value: años de antigüedad, category:"Datos Personales"
- name:"TIPO_EXAMEN", value: tipo de examen (ingreso/periódico/egreso/especial), category:"Datos Personales"
- name:"FECHA_EXAMEN", value: fecha del examen, category:"Datos Personales"

SIGNOS VITALES Y SOMATOMETRÍA (un item por signo):
- name:"PESO", value: valor, unit:"kg", category:"Signos Vitales"
- name:"TALLA", value: valor, unit:"cm", category:"Signos Vitales"
- name:"IMC", value: valor, unit:"kg/m²", range:"18.5-24.9", description:"Normal/Sobrepeso/Obesidad", category:"Signos Vitales"
- name:"TENSION_ARTERIAL", value: sistólica/diastólica (ej:"120/80"), unit:"mmHg", range:"<120/80", category:"Signos Vitales"
- name:"FRECUENCIA_CARDIACA", value: valor, unit:"lpm", range:"60-100", category:"Signos Vitales"
- name:"FRECUENCIA_RESPIRATORIA", value: valor, unit:"rpm", range:"12-20", category:"Signos Vitales"
- name:"TEMPERATURA", value: valor, unit:"°C", range:"36.5-37.5", category:"Signos Vitales"
- name:"SPO2", value: valor, unit:"%", range:"95-100", category:"Signos Vitales"
- name:"GLUCOSA_CAPILAR", value: valor si existe, unit:"mg/dL", range:"70-100", category:"Signos Vitales"
- name:"CINTURA", value: valor, unit:"cm", category:"Signos Vitales"
- name:"CADERA", value: valor, unit:"cm", category:"Signos Vitales"

ANTECEDENTES PERSONALES PATOLÓGICOS (APPat):
- name:"DIABETES", value: "Sí"/"No", description: tipo y tratamiento si existe, unit: años desde diagnóstico, category:"Antecedentes Patológicos"
- name:"HIPERTENSION", value: "Sí"/"No", description: tratamiento actual, category:"Antecedentes Patológicos"
- name:"ENFERMEDADES_CARDIOVASCULARES", value: "Sí"/"No", description: descripción, category:"Antecedentes Patológicos"
- name:"ENFERMEDADES_RESPIRATORIAS", value: "Sí"/"No", description: descripción detallada, category:"Antecedentes Patológicos"
- name:"ENFERMEDADES_RENALES", value: "Sí"/"No", description: descripción, category:"Antecedentes Patológicos"
- name:"CIRUGIAS_PREVIAS", value: "Sí"/"No", description: tipo y año, category:"Antecedentes Patológicos"
- name:"HOSPITALIZACIONES", value: "Sí"/"No", description: motivo y año, category:"Antecedentes Patológicos"
- name:"ALERGIAS", value: alergenos y tipo de reacción, category:"Antecedentes Patológicos"
- name:"MEDICAMENTOS_ACTUALES", value: lista completa de medicamentos con dosis, category:"Antecedentes Patológicos"
- name:"TRAUMATISMOS", value: "Sí"/"No", description: descripción y secuelas, category:"Antecedentes Patológicos"
- name:"ENFERMEDADES_MUSCULOESQUELETICAS", value: hernias, lumbalgias, cervicalgias etc., category:"Antecedentes Patológicos"
- name:"DISCAPACIDADES", value: descripción de limitaciones físicas, category:"Antecedentes Patológicos"

ANTECEDENTES PERSONALES NO PATOLÓGICOS (APNP) — un item por hábito:
- name:"TABACO", value: "Sí"/"No"/"Ex-fumador", description: cantidad cigarros/día y años, category:"APNP"
- name:"ALCOHOL", value: "Sí"/"No", description: tipo, frecuencia y cantidad, category:"APNP"
- name:"DROGAS", value: "Sí"/"No", description: tipo y frecuencia, category:"APNP"
- name:"EJERCICIO", value: "Sí"/"No"/"Sedentario", description: tipo y frecuencia por semana, category:"APNP"
- name:"ALIMENTACION", value: descripción del tipo de alimentación, category:"APNP"
- name:"CAFE", value: "Sí"/"No", description: tazas por día, category:"APNP"
- name:"HORAS_SUENO", value: horas promedio, unit:"h/día", category:"APNP"

ANTECEDENTES HEREDOFAMILIARES (AHF):
- name:"AHF_DIABETES", value: "Sí"/"No", description: parentesco, category:"AHF"
- name:"AHF_HIPERTENSION", value: "Sí"/"No", description: parentesco, category:"AHF"
- name:"AHF_CANCER", value: "Sí"/"No", description: parentesco y tipo, category:"AHF"
- name:"AHF_CARDIOPATIAS", value: "Sí"/"No", description: parentesco, category:"AHF"
- name:"AHF_ENF_MENTALES", value: "Sí"/"No", description: parentesco, category:"AHF"
- name:"AHF_OTRAS", value: otras enfermedades familiares relevantes, category:"AHF"

HISTORIA LABORAL Y RIESGOS OCUPACIONALES:
- name:"PUESTO_ACTUAL", value: nombre del puesto, category:"Historia Laboral"
- name:"ANTIGUEDAD_ACTUAL", value: años en puesto actual, unit:"años", category:"Historia Laboral"
- name:"DESCRIPCION_ACTIVIDADES", value: descripción detallada de actividades laborales, category:"Historia Laboral"
- name:"RIESGOS_FISICOS", value: ruido/vibración/calor/frío/radiaciones/etc., category:"Historia Laboral"
- name:"RIESGOS_QUIMICOS", value: solventes/polvos/humos/gases/etc., category:"Historia Laboral"
- name:"RIESGOS_BIOLOGICOS", value: microorganismos/sangre/etc., category:"Historia Laboral"
- name:"RIESGOS_ERGONOMICOS", value: posturas/esfuerzo físico/movimientos repetitivos/etc., category:"Historia Laboral"
- name:"RIESGOS_PSICOSOCIALES", value: estrés/turnos nocturnos/jornadas prolongadas, category:"Historia Laboral"
- name:"EPP_UTILIZADO", value: lista de equipo de protección personal usado, category:"Historia Laboral"
- name:"ACCIDENTES_TRABAJO", value: descripción de accidentes previos en el trabajo, category:"Historia Laboral"

EXPLORACIÓN FÍSICA (si está en el formulario):
- name:"EF_ASPECTO_GENERAL", value: descripción del aspecto general, category:"Exploración Física"
- name:"EF_PIEL", value: descripción de tegumentos, category:"Exploración Física"
- name:"EF_CABEZA_CUELLO", value: hallazgos, category:"Exploración Física"
- name:"EF_OJOS", value: hallazgos oculares, category:"Exploración Física"
- name:"EF_OIDOS", value: hallazgos auditivos, category:"Exploración Física"
- name:"EF_NARIZ", value: hallazgos nasales, category:"Exploración Física"
- name:"EF_BOCA_GARGANTA", value: hallazgos, category:"Exploración Física"
- name:"EF_TORAX", value: hallazgos cardiorrespiratorios, category:"Exploración Física"
- name:"EF_ABDOMEN", value: hallazgos abdominales, category:"Exploración Física"
- name:"EF_COLUMNA", value: hallazgos de columna vertebral, category:"Exploración Física"
- name:"EF_EXTREMIDADES_SUP", value: hallazgos extremidades superiores, category:"Exploración Física"
- name:"EF_EXTREMIDADES_INF", value: hallazgos extremidades inferiores, category:"Exploración Física"
- name:"EF_NEUROLOGICO", value: evaluación neurológica, category:"Exploración Física"
- name:"EF_HALLAZGOS_RELEVANTES", value: hallazgos clínicos relevantes que requieren atención, category:"Exploración Física"

DIAGNÓSTICO Y CONCLUSIÓN:
- name:"DIAGNOSTICOS", value: lista completa de diagnósticos CIE-10 numerados, visualizationType:"list", category:"Diagnóstico"
- name:"APTITUD_LABORAL", value: "APTO"/"APTO CON RESTRICCIONES"/"NO APTO"/"PENDIENTE", description: condiciones específicas de la aptitud, category:"Diagnóstico"
- name:"RESTRICCIONES_LABORALES", value: restricciones específicas si existen, category:"Diagnóstico"
- name:"PLAN_SEGUIMIENTO", value: plan de seguimiento médico, category:"Diagnóstico"
- name:"RECOMENDACIONES_MEDICAS", value: recomendaciones completas, category:"Diagnóstico"
- name:"MEDICO_EXAMINADOR", value: nombre y cédula del médico, category:"Diagnóstico"
- name:"PROXIMO_EXAMEN", value: fecha recomendada para próximo examen, category:"Diagnóstico"`,
                schema: {
                    type: Type.OBJECT,
                    properties: {
                        patientData: patientDataSchema,
                        results: labResultsSchema,
                        summary: { type: Type.STRING, description: "Resumen de datos personales, antecedentes relevantes, signos vitales y diagnóstico." },
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
    if (n.includes('rx') || n.includes('radio') || n.includes('rayos')) return 'radiografia';
    if (n.includes('opto') || n.includes('vista') || n.includes('optome') || n.includes('vision')) return 'optometria';
    if (n.includes('historia') || n.includes('hc') || n.includes('clinica') || n.includes('formulario') || n.includes('examen_medico')) return 'historia_clinica';
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

    const fullPrompt = `${sectionPrompt}\n\n${textSection}INSTRUCCIÓN FINAL: Devuelve JSON con TODOS los datos extraídos. NO resumas. Cada campo del documento = un item en results[]. IMPORTANTE: Mantén el JSON conciso — para las curvas usa máximo 10-12 puntos representativos.`;

    const response = await generateContentWithRetry({
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: fullPrompt }, ...imageParts] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            maxOutputTokens: 65536,
        }
    });

    const jsonText = response.text.trim();
    trackUsage(MODEL_NAME, jsonText.length / 4, jsonText.length / 4);

    // Resilient JSON parser — intenta reparar JSON truncado
    const parseResilientJSON = (text: string): any => {
        // Intento 1: parse directo
        try { return JSON.parse(text); } catch { }
        // Intento 2: cerrar brackets/braces abiertos
        let repaired = text;
        // Contar brackets abiertos vs cerrados
        let openBraces = 0, openBrackets = 0;
        let inString = false, escaped = false;
        for (const ch of repaired) {
            if (escaped) { escaped = false; continue; }
            if (ch === '\\') { escaped = true; continue; }
            if (ch === '"') { inString = !inString; continue; }
            if (inString) continue;
            if (ch === '{') openBraces++;
            if (ch === '}') openBraces--;
            if (ch === '[') openBrackets++;
            if (ch === ']') openBrackets--;
        }
        // Si estamos dentro de un string, cerrarlo
        if (inString) repaired += '"';
        // Cerrar brackets/braces faltantes
        // Primero eliminar trailing comma o string parcial antes de cerrar
        repaired = repaired.replace(/,\s*$/, '');
        for (let i = 0; i < openBrackets; i++) repaired += ']';
        for (let i = 0; i < openBraces; i++) repaired += '}';
        try { return JSON.parse(repaired); } catch { }
        // Intento 3: truncar hasta el último item válido en results
        const lastValidClose = repaired.lastIndexOf('}]');
        if (lastValidClose > 0) {
            const truncated = repaired.substring(0, lastValidClose + 2) + '}';
            try { return JSON.parse(truncated); } catch { }
        }
        // Si todo falla, lanzar error original
        return JSON.parse(text);
    };

    const parsed = parseResilientJSON(jsonText);

    // FIX: Garantizar que la estructura base no sea undefined para evitar crashes en UI
    if (!parsed.results || !Array.isArray(parsed.results)) {
        parsed.results = [];
    }

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

    return parsed;
}

// ══════════════════════════════════════════════════════════════════
// SpiroClone — Motor de extracción directo para Espirometría
// Usa el schema propio de SpiroClone que ya funciona perfectamente.
// SIN pasar por el pipeline genérico de labResultsSchema.
// ══════════════════════════════════════════════════════════════════

const spirocloneSchema = {
    type: Type.OBJECT,
    properties: {
        patient: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Nombre completo del paciente" },
                id: { type: Type.STRING, description: "ID del paciente (ej. #0571)" },
                age: { type: Type.STRING, description: "Edad del paciente" },
                dob: { type: Type.STRING, description: "Fecha de nacimiento (ej. 23/07/1986)" },
                sex: { type: Type.STRING, description: "Sexo (ej. Masculino)" },
                height: { type: Type.STRING, description: "Altura (ej. 172 cm)" },
                weight: { type: Type.STRING, description: "Peso (ej. 82 kg)" },
                origin: { type: Type.STRING, description: "Origen étnico (ej. Hispano)" },
                smoker: { type: Type.STRING, description: "Fumador (ej. No)" },
                asthma: { type: Type.STRING, description: "Asma (ej. No)" },
                copd: { type: Type.STRING, description: "EPOC (ej. No)" },
                bmi: { type: Type.STRING, description: "IMC (ej. 27.7)" },
            }
        },
        testDetails: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING, description: "Fecha del test (ej. 28/11/2025 10:06:55 a. m.)" },
                interpretation: { type: Type.STRING, description: "Interpretación (ej. GOLD(2008)/Hardie)" },
                predicted: { type: Type.STRING, description: "Predicho (ej. Hankinson (NHANES III), 1999 * 1.00)" },
                selection: { type: Type.STRING, description: "Selección del valor (ej. BTPS (INSP/ESP))" },
                bestValue: { type: Type.STRING, description: "Mejor valor (ej. 1.12/1.02)" },
                fev1PredPercent: { type: Type.STRING, description: "Su FEV1 / Predicho (ej. 83 %)" },
            }
        },
        results: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    parameter: { type: Type.STRING, description: "Parámetro (ej. FVC [L])" },
                    pred: { type: Type.STRING, description: "Valor Pred" },
                    lln: { type: Type.STRING, description: "Valor LLN" },
                    mejor: { type: Type.STRING, description: "Valor Mejor (puede tener asterisco)" },
                    prueba2: { type: Type.STRING, description: "Valor Prueba 2" },
                    prueba6: { type: Type.STRING, description: "Valor Prueba 6" },
                    prueba5: { type: Type.STRING, description: "Valor Prueba 5" },
                    percentPred: { type: Type.STRING, description: "Valor %Pred" },
                    zScore: { type: Type.STRING, description: "Puntuación Z" },
                }
            }
        },
        session: {
            type: Type.OBJECT,
            properties: {
                quality: { type: Type.STRING, description: "Calidad de la sesión (ej. Previo C (FEV1 Var=...))" },
                interpretation: { type: Type.STRING, description: "Interpretación del sistema (ej. Previo Espirometría Normal)" },
            }
        },
        doctor: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Nombre del doctor (ej. DR. JOSE CARLOS GUIDO PANCARDO)" },
                date: { type: Type.STRING, description: "Fecha junto al nombre del doctor (ej. 30/11/2025)" },
                notes: { type: Type.STRING, description: "Notas o diagnóstico (ej. PATRON RESPIRATORIO NORMAL.)" },
            }
        },
        graphs: {
            type: Type.OBJECT,
            description: "ES OBLIGATORIO extraer los puntos de datos de las dos gráficas. Extrae unos 20-25 puntos precisos por gráfica leyendo los ejes X e Y cuidadosamente para recrear la forma exacta de las curvas.",
            properties: {
                flowVolume: {
                    type: Type.ARRAY,
                    description: "Puntos para Flujo-Volumen (X: Volumen 0 a 8, Y: Flujo 0 a 14). Extrae puntos a lo largo de las curvas. Usa null si una curva no tiene valor en ese X.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            volume: { type: Type.NUMBER, description: "Volumen en el eje X (L)" },
                            flowPred: { type: Type.NUMBER, description: "Flujo Predicho (línea punteada con rombos)" },
                            flowMejor: { type: Type.NUMBER, description: "Flujo Mejor Prueba (línea sólida azul)" },
                            flowPrueba2: { type: Type.NUMBER, description: "Flujo Prueba 2 (línea sólida gris)" },
                            flowPrueba5: { type: Type.NUMBER, description: "Flujo Prueba 5 (línea punteada gris)" },
                            flowPrueba6: { type: Type.NUMBER, description: "Flujo Prueba 6 (línea discontinua gris)" },
                        }
                    }
                },
                volumeTime: {
                    type: Type.ARRAY,
                    description: "Puntos para Volumen-Tiempo (X: Tiempo -1 a 8, Y: Volumen 0 a 8). Extrae puntos a lo largo de las curvas. Usa null si una curva no tiene valor en ese X.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            time: { type: Type.NUMBER, description: "Tiempo en el eje X (s)" },
                            volumePred: { type: Type.NUMBER, description: "Volumen Predicho (línea punteada con rombos)" },
                            volumeMejor: { type: Type.NUMBER, description: "Volumen Mejor Prueba (línea sólida azul)" },
                            volumePrueba2: { type: Type.NUMBER, description: "Volumen Prueba 2 (línea sólida gris)" },
                            volumePrueba5: { type: Type.NUMBER, description: "Volumen Prueba 5 (línea punteada gris)" },
                            volumePrueba6: { type: Type.NUMBER, description: "Volumen Prueba 6 (línea discontinua gris)" },
                        }
                    }
                }
            }
        }
    }
};

const SPIROCLONE_PROMPT = `ERES UN EXPERTO EN EXTRACCIÓN DE DATOS MÉDICOS. Extrae todos los datos de este reporte de espirometría. Asegúrate de capturar los datos del paciente, los detalles de la prueba, la tabla de resultados completa (incluyendo asteriscos), la información de la sesión y los datos del doctor. Además, ES CRÍTICO Y OBLIGATORIO que extraigas los puntos (x,y) de las gráficas Flujo-Volumen y Volumen-Tiempo leyendo los ejes visualmente. Extrae unos 20-25 puntos representativos por gráfica que sigan fielmente las curvas (inicio, pico máximo, descenso, fin). Si una línea no existe en un punto, omite ese valor. Devuelve la información estructurada en formato JSON.`;

export async function analyzeSpirometryDirect(_text: string, imageFiles: File[] = []): Promise<any> {
    // ═══════════════════════════════════════════════════════
    // RÉPLICA EXACTA de SpiroClone — mismo prompt, misma estructura.
    // Prueba modelos en cascada hasta que uno funcione.
    // SIN responseSchema: el schema forzado silencia campos que el modelo
    // no puede extraer. Pedimos JSON libre y parseamos manualmente.
    // ═══════════════════════════════════════════════════════
    const MODELS_TO_TRY = [
        'gemini-3.1-pro-preview',   // Mejor: SpiroClone usa este
        'gemini-2.5-pro',           // Alternativa pro
        'gemini-2.0-pro',           // Fallback
        'gemini-2.0-flash',         // Último recurso
    ];

    const toBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                resolve({
                    data: dataUrl.split(',')[1],
                    mimeType: file.type || 'image/jpeg'
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const imageData = await Promise.all(imageFiles.map(toBase64));

    // Prompt EXACTO de SpiroClone — sin schema, pedimos JSON directamente
    const promptText = `ERES UN EXPERTO EN EXTRACCIÓN DE DATOS MÉDICOS. Extrae todos los datos de este reporte de espirometría.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "patient": { "name": "", "id": "", "age": "", "dob": "", "sex": "", "height": "", "weight": "", "origin": "", "smoker": "", "asthma": "", "copd": "", "bmi": "" },
  "testDetails": { "date": "", "interpretation": "", "predicted": "", "selection": "", "bestValue": "", "fev1PredPercent": "" },
  "results": [
    { "parameter": "FVC [L]", "pred": "", "lln": "", "mejor": "", "prueba2": "", "prueba5": "", "prueba6": "", "percentPred": "", "zScore": "" }
  ],
  "session": { "quality": "", "interpretation": "" },
  "doctor": { "name": "", "date": "", "notes": "" },
  "graphs": {
    "flowVolume": [{ "volume": 0, "flowPred": 0, "flowMejor": 0, "flowPrueba2": 0, "flowPrueba5": 0, "flowPrueba6": 0 }],
    "volumeTime": [{ "time": 0, "volumePred": 0, "volumeMejor": 0, "volumePrueba2": 0, "volumePrueba5": 0, "volumePrueba6": 0 }]
  }
}

INSTRUCCIONES CRÍTICAS:
- Extrae TODOS los parámetros de la tabla (FVC, FEV1, FEV1/FVC, PEF, FEF25-75, etc.)
- El campo "mejor" puede tener asterisco (e.g. "3.89*")
- Extrae 20-25 puntos de cada gráfica leyendo los ejes X e Y visualmente
- Si un valor no existe, usa null o cadena vacía
- NO uses el formato \`\`\`json\`\`\`, devuelve SOLO el JSON`;

    let lastError: any = null;

    for (const model of MODELS_TO_TRY) {
        try {
            console.log(`[SpiroClone] Probando modelo: ${model}...`);

            const contents: any[] = [
                ...imageData.map(img => ({ inlineData: img })),
                promptText
            ];

            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                    // SIN responseSchema — evita que Gemini descarte campos
                }
            });

            const jsonStr = response.text?.trim();
            if (!jsonStr) {
                console.warn(`[SpiroClone] ${model}: respuesta vacía, intentando siguiente...`);
                continue;
            }

            // Limpiar posibles backticks del modelo
            const cleaned = jsonStr.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const data = JSON.parse(cleaned);

            // Validar que tiene datos útiles (al menos results)
            if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
                console.warn(`[SpiroClone] ${model}: results vacío, intentando siguiente...`);
                continue;
            }

            trackUsage(model, jsonStr.length / 4, jsonStr.length / 4);
            console.log('[SpiroClone] ✅ Extracción exitosa:', {
                model,
                patient: data.patient?.name,
                resultsCount: data.results?.length,
                hasSession: !!data.session?.interpretation,
                hasDoctor: !!data.doctor?.name,
                hasGraphsFV: data.graphs?.flowVolume?.length || 0,
                hasGraphsVT: data.graphs?.volumeTime?.length || 0,
            });

            return data;

        } catch (err: any) {
            console.warn(`[SpiroClone] ${model} falló:`, err.message || err);
            lastError = err;
            // Si es error 403/404 (modelo no disponible), intentar siguiente
            // Si es error de red, también intentar
            continue;
        }
    }

    throw new Error(`SpiroClone: Ningún modelo pudo extraer la espirometría. Último error: ${lastError?.message || 'desconocido'}`);
}

// ══════════════════════════════════════════════════════════════════
// LabClone — Motor de extracción directa para Laboratorios
// Replica la lógica de lab-extract-pro (standalone Vite app)
// ══════════════════════════════════════════════════════════════════

const LAB_PROMPT = `Eres un sistema de extracción de datos médicos de alta precisión.
Tu objetivo es leer el PDF adjunto (que contiene resultados de laboratorio de múltiples páginas) y extraer ABSOLUTAMENTE TODOS los datos en formato JSON.

INSTRUCCIONES CRÍTICAS:
1. EXTRAE TODAS LAS PÁGINAS: El documento tiene varias páginas (ej. Biometría, Química, Orina, Antidoping). Debes procesar y extraer los exámenes de TODAS las páginas. No te detengas en la primera.
2. DATOS DEL PACIENTE: Extrae Nombre, Edad, Fecha de Nacimiento, Sexo, Médico, Fecha de registro y Folio. No dejes ninguno vacío si está en el documento.
3. EXÁMENES Y RESULTADOS: Para cada examen, extrae TODAS las filas de resultados. No omitas ningún parámetro, valor, unidad ni valor de referencia.
4. SECCIONES (groupName): Si un examen tiene subtítulos (ej. "Fórmula Roja", "Examen Macroscópico"), pon ese subtítulo en el campo 'groupName' de los resultados que le pertenecen.
5. FIRMAS: Extrae el nombre y cédula/título de la persona que firma al final.
6. VALORES ANORMALES: Marca isAbnormal como true si el valor está fuera de los rangos de referencia.

Devuelve ÚNICAMENTE un JSON válido con esta estructura (sin markdown, sin texto adicional):
{
  "patientInfo": {
    "laboratoryName": "", "name": "", "age": "", "dob": "", "gender": "",
    "doctor": "", "registrationDate": "", "folio": "", "printDate": ""
  },
  "exams": [
    {
      "examName": "", "method": "", "sampleType": "",
      "results": [
        { "groupName": "", "parameter": "", "value": "", "unit": "", "referenceValue": "", "absolutes": "", "isAbnormal": false }
      ]
    }
  ],
  "signatures": [
    { "name": "", "title": "", "id": "" }
  ]
}`;

export async function analyzeLabDirect(_text: string, imageFiles: File[] = []): Promise<any> {
    const MODELS_TO_TRY = [
        'gemini-3.1-pro-preview',
        'gemini-2.5-pro',
        'gemini-2.0-pro',
        'gemini-2.0-flash',
    ];

    const toBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                resolve({
                    data: dataUrl.split(',')[1],
                    mimeType: file.type || 'application/pdf'
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const imageData = await Promise.all(imageFiles.map(toBase64));

    let lastError: any = null;

    for (const model of MODELS_TO_TRY) {
        try {
            console.log(`[LabClone] Probando modelo: ${model}...`);

            const contents: any[] = [
                ...imageData.map(img => ({ inlineData: img })),
                LAB_PROMPT
            ];

            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0,
                }
            });

            const jsonStr = response.text?.trim();
            if (!jsonStr) {
                console.warn(`[LabClone] ${model}: respuesta vacía, intentando siguiente...`);
                continue;
            }

            const cleaned = jsonStr.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const data = JSON.parse(cleaned);

            if (!data.exams || !Array.isArray(data.exams) || data.exams.length === 0) {
                console.warn(`[LabClone] ${model}: exams vacío, intentando siguiente...`);
                continue;
            }

            trackUsage(model, jsonStr.length / 4, jsonStr.length / 4);
            const totalParams = data.exams.reduce((acc: number, e: any) => acc + (e.results?.length || 0), 0);
            console.log('[LabClone] ✅ Extracción exitosa:', {
                model,
                patient: data.patientInfo?.name,
                examsCount: data.exams?.length,
                totalParams,
            });

            return data;

        } catch (err: any) {
            console.warn(`[LabClone] ${model} falló:`, err.message || err);
            lastError = err;
            continue;
        }
    }

    throw new Error(`LabClone: Ningún modelo pudo extraer los laboratorios. Último error: ${lastError?.message || 'desconocido'}`);
}

export function isGeminiConfigured(): boolean {
    return !!API_KEY;
}
