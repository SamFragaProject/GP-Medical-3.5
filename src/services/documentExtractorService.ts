/**
 * Document Extractor Service
 * Motor principal: Gemini 2.0 Flash (gratis) con fallback a OpenAI GPT-4o
 * Estrategia: texto + imágenes de todas las páginas → IA multimodal
 */

import { GoogleGenAI } from '@google/genai'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker para PDF.js — usar import con ?url para que Vite lo bundle correctamente
try {
    // @ts-ignore - Vite URL import
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href
} catch {
    // Fallback: CDN con versión exacta
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
    console.warn('⚠️ PDF.js worker: usando CDN como fallback')
}

// ============================================
// TIPOS
// ============================================

/** Datos extraídos del paciente, mapeados al schema del ERP */
export interface DatosExtraidos {
    // Datos personales
    nombre?: string
    apellido_paterno?: string
    apellido_materno?: string
    fecha_nacimiento?: string       // YYYY-MM-DD
    genero?: string                 // masculino/femenino
    curp?: string
    rfc?: string
    nss?: string
    estado_civil?: string
    tipo_sangre?: string
    email?: string
    telefono?: string

    // Datos laborales
    numero_empleado?: string
    empresa_nombre?: string
    puesto?: string
    area?: string
    departamento?: string
    turno?: string
    fecha_ingreso?: string          // YYYY-MM-DD

    // Datos médicos
    alergias?: string
    antecedentes_personales?: string
    antecedentes_familiares?: string
    padecimiento_actual?: string
    exploracion_fisica?: ExploracionFisicaExtraida
    signos_vitales?: SignosVitalesExtraidos

    // Resultados de estudios
    audiometria?: AudiometriaExtraida
    espirometria?: EspirometriaExtraida
    laboratorio?: LaboratorioExtraido
    radiografia?: RadiografiaExtraida

    // Contacto de emergencia
    contacto_emergencia_nombre?: string
    contacto_emergencia_parentesco?: string
    contacto_emergencia_telefono?: string

    // Dictamen
    dictamen_aptitud?: string       // apto/apto_con_restricciones/no_apto
    restricciones?: string[]
    recomendaciones?: string[]

    // Metadata de la extracción
    _confianza: number              // 0-100, confianza de la extracción
    _campos_encontrados: string[]
    _campos_faltantes: string[]
    _texto_original?: string
    _archivo_origen: string
    _formato_origen: string
}

export interface SignosVitalesExtraidos {
    peso_kg?: number
    talla_cm?: number
    imc?: number
    presion_sistolica?: number
    presion_diastolica?: number
    frecuencia_cardiaca?: number
    frecuencia_respiratoria?: number
    temperatura?: number
    saturacion_o2?: number
}

export interface ExploracionFisicaExtraida {
    cabeza?: string
    ojos?: string
    oidos?: string
    nariz?: string
    boca?: string
    cuello?: string
    torax?: string
    abdomen?: string
    extremidades?: string
    piel?: string
    neurologico?: string
    columna?: string
}

export interface AudiometriaExtraida {
    oido_derecho?: Record<string, number>    // freq -> dB
    oido_izquierdo?: Record<string, number>
    diagnostico?: string
    pta_derecho?: number
    pta_izquierdo?: number
}

export interface EspirometriaExtraida {
    fvc?: number
    fev1?: number
    fev1_fvc?: number
    pef?: number
    fef2575?: number
    fvc_predicho?: number
    fev1_predicho?: number
    fvc_porcentaje?: number
    fev1_porcentaje?: number
    diagnostico?: string
    patron?: string
    calidad?: string
}

export interface LaboratorioExtraido {
    // Biometría hemática
    hemoglobina?: number
    hematocrito?: number
    leucocitos?: number
    eritrocitos?: number
    plaquetas?: number
    vgm?: number
    hgm?: number
    cmhg?: number
    neutrofilos?: number
    linfocitos?: number
    monocitos?: number
    eosinofilos?: number
    basofilos?: number
    bandas?: number
    // Química sanguínea
    glucosa?: number
    urea?: number
    bun?: number
    creatinina?: number
    acido_urico?: number
    colesterol_total?: number
    colesterol_hdl?: number
    colesterol_ldl?: number
    trigliceridos?: number
    // Hepático
    bilirrubina_total?: number
    bilirrubina_directa?: number
    bilirrubina_indirecta?: number
    tgo_ast?: number
    tgp_alt?: number
    fosfatasa_alcalina?: number
    ggt?: number
    proteinas_totales?: number
    albumina?: number
    globulina?: number
    relacion_ag?: number
    ldh?: number
    cpk?: number
    // Electrolitos
    sodio?: number
    potasio?: number
    cloro?: number
    calcio?: number
    fosforo?: number
    magnesio?: number
    hierro?: number
    ferritina?: number
    // Tiroides
    tsh?: number
    t3?: number
    t4?: number
    t4_libre?: number
    // Otros
    psa?: number
    hemoglobina_glucosilada?: number
    vsg?: number
    pcr?: number
    factor_reumatoide?: number
    // Serología
    vdrl?: string
    vih?: string
    hepatitis_b?: string
    hepatitis_c?: string
    grupo_sanguineo?: string
    rh?: string
    // Coagulación
    tp?: number
    tpt?: number
    inr?: number
    // EGO
    examen_orina?: string
    examen_orina_densidad?: number
    examen_orina_ph?: number
    examen_orina_proteinas?: string
    examen_orina_glucosa?: string
    examen_orina_hemoglobina?: string
    examen_orina_leucocitos?: string
    examen_orina_nitritos?: string
    examen_orina_bacterias?: string
    examen_orina_cristales?: string
    examen_orina_cilindros?: string
    examen_orina_eritrocitos?: string
    // Otros
    coprologico?: string
    otros?: Record<string, string>
}

export interface RadiografiaExtraida {
    tipo?: string
    hallazgos?: string
    impresion_diagnostica?: string
    clasificacion_oit?: string
}

export interface ExtractionResult {
    success: boolean
    data: DatosExtraidos | null
    error?: string
    processingTimeMs: number
}

// ============================================
// EXTRACTORES DE TEXTO POR FORMATO
// ============================================

/**
 * Extrae texto de un archivo DOCX usando mammoth.js
 */
async function extractTextFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
}

/**
 * Extrae texto de un PDF usando pdf.js
 */
async function extractTextFromPdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        console.log(`📄 PDF abierto: ${pdf.numPages} páginas`)

        const textParts: string[] = []
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
            textParts.push(`--- Página ${pageNum} ---\n${pageText}`)
        }

        const fullText = textParts.join('\n\n')
        console.log(`📄 PDF texto extraído: ${fullText.length} caracteres`)
        return fullText
    } catch (err: any) {
        console.error('❌ Error extrayendo texto del PDF:', err)
        throw new Error(`No se pudo leer el PDF: ${err.message || 'Error desconocido'}. Verifica que el archivo no esté dañado o protegido.`)
    }
}

/**
 * Renderiza TODAS las páginas de un PDF a base64 images para Vision API
 * Retorna un array de imágenes base64 (una por página)
 */
async function renderPdfPagesToBase64(file: File): Promise<string[]> {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const totalPages = Math.min(pdf.numPages, 10) // Máximo 10 páginas para no exceder tokens
        const images: string[] = []

        console.log(`📄 Renderizando ${totalPages} de ${pdf.numPages} páginas del PDF...`)

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum)

            // Renderizar a canvas con buena resolución
            const scale = 1.5
            const viewport = page.getViewport({ scale })
            const canvas = document.createElement('canvas')
            canvas.width = viewport.width
            canvas.height = viewport.height
            const ctx = canvas.getContext('2d')!

            await page.render({ canvasContext: ctx, viewport, canvas } as any).promise

            // Convertir canvas a base64 JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.80)
            images.push(dataUrl)

            // Cleanup canvas
            canvas.width = 0
            canvas.height = 0
        }

        const totalKB = images.reduce((sum, img) => sum + img.length, 0) / 1024
        console.log(`📄 PDF renderizado: ${images.length} páginas, ${Math.round(totalKB)}KB total`)
        return images
    } catch (err: any) {
        console.error('❌ Error renderizando PDF a imágenes:', err)
        throw new Error(`No se pudo convertir el PDF a imágenes: ${err.message}`)
    }
}

/**
 * Convierte una imagen a base64 para enviar a OpenAI Vision
 */
async function imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            // Extraer solo la parte base64 (sin el prefijo data:...)
            resolve(result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/**
 * Extrae texto de un PPTX descomprimiendo el ZIP y leyendo los XML de las slides
 */
async function extractTextFromPptx(file: File): Promise<string> {
    // PPTX es un ZIP con XMLs dentro. Usamos JSZip si está disponible,
    // sino hacemos fallback a enviar descripción básica
    try {
        // Intentar importar JSZip dinámicamente
        const JSZip = (await import('jszip')).default
        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)

        const textParts: string[] = []
        const slideFiles = Object.keys(zip.files)
            .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
            .sort()

        for (const slideName of slideFiles) {
            const slideXml = await zip.files[slideName].async('text')
            // Extraer texto de los tags XML <a:t>
            const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g) || []
            const slideText = textMatches
                .map(match => match.replace(/<\/?a:t>/g, ''))
                .join(' ')

            if (slideText.trim()) {
                const slideNum = slideName.match(/slide(\d+)/)?.[1] || '?'
                textParts.push(`--- Slide ${slideNum} ---\n${slideText}`)
            }
        }

        return textParts.join('\n\n') || 'No se pudo extraer texto del PPTX'
    } catch {
        // Fallback: si no hay JSZip, retornamos metadata básica
        return `[Archivo PPTX: ${file.name}, tamaño: ${(file.size / 1024).toFixed(1)}KB — No se pudo extraer texto, usando Vision API]`
    }
}

// ============================================
// PROMPT DE EXTRACCIÓN PARA OPENAI
// ============================================

const EXTRACTION_SYSTEM_PROMPT = `Eres un asistente experto en medicina ocupacional mexicana (NOM-030-STPS, NOM-035). 
Tu trabajo es EXTRAER ABSOLUTAMENTE TODOS los datos visibles de un expediente médico de un trabajador.

REGLA #1: EXTRAE TODO. Si ves un dato, extráelo. NO omitas valores por falta de confianza.
REGLA #2: Si un valor aparece en una tabla, gráfica, imagen, encabezado o pie de página, EXTRÁELO.
REGLA #3: Para valores numéricos de laboratorio, busca en CUALQUIER formato:
   - Tablas con columnas (Parámetro | Resultado | Unidad | Referencia)
   - Texto libre: "Hemoglobina: 15.2 g/dL"
   - Abreviaciones: Hb, Hto, WBC, PLT, Glu, Col, TG, Cr, AU
   - Listas con guiones o bullets
   - Valores entre paréntesis o después de dos puntos

REGLA #4: Si hay MÚLTIPLES páginas, revisa CADA una. Los labs suelen estar en páginas intermedias.
REGLA #5: Usa null para campos que DEFINITIVAMENTE no existen en el documento. NO uses null para campos que simplemente no encontraste — revisa de nuevo.

Retorna un JSON con esta estructura exacta. Para campos numéricos de laboratorio, extrae SOLO el número (sin unidades).

{
    "nombre": "string",
    "apellido_paterno": "string",
    "apellido_materno": "string",
    "fecha_nacimiento": "YYYY-MM-DD",
    "genero": "masculino | femenino",
    "curp": "string 18 chars",
    "rfc": "string 13 chars",
    "nss": "string NSS del IMSS",
    "estado_civil": "soltero | casado | divorciado | viudo | union_libre",
    "tipo_sangre": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
    "email": "string",
    "telefono": "string",
    
    "numero_empleado": "string",
    "empresa_nombre": "string nombre de la empresa",
    "puesto": "string cargo del trabajador",
    "area": "string",
    "departamento": "string",
    "turno": "matutino | vespertino | nocturno | mixto",
    "fecha_ingreso": "YYYY-MM-DD",
    
    "alergias": "string lista de alergias",
    "antecedentes_personales": "string antecedentes patológicos y no patológicos",
    "antecedentes_familiares": "string heredofamiliares",
    "padecimiento_actual": "string motivo de consulta",
    
    "exploracion_fisica": {
        "cabeza": "string", "ojos": "string", "oidos": "string",
        "nariz": "string", "boca": "string", "cuello": "string",
        "torax": "string", "abdomen": "string", "extremidades": "string",
        "piel": "string", "neurologico": "string", "columna": "string"
    },
    
    "signos_vitales": {
        "peso_kg": 0.0, "talla_cm": 0.0, "imc": 0.0,
        "presion_sistolica": 0, "presion_diastolica": 0,
        "frecuencia_cardiaca": 0, "frecuencia_respiratoria": 0,
        "temperatura": 0.0, "saturacion_o2": 0
    },
    
    "audiometria": {
        "oido_derecho": {"250": 0, "500": 0, "1000": 0, "2000": 0, "3000": 0, "4000": 0, "6000": 0, "8000": 0},
        "oido_izquierdo": {"250": 0, "500": 0, "1000": 0, "2000": 0, "3000": 0, "4000": 0, "6000": 0, "8000": 0},
        "diagnostico": "string", "pta_derecho": 0, "pta_izquierdo": 0
    },
    
    "espirometria": {
        "fvc": 0.0, "fev1": 0.0, "fev1_fvc": 0.0,
        "pef": 0.0, "fef2575": 0.0,
        "fvc_predicho": 0.0, "fev1_predicho": 0.0,
        "fvc_porcentaje": 0.0, "fev1_porcentaje": 0.0,
        "diagnostico": "string", "patron": "normal | obstructivo | restrictivo | mixto",
        "calidad": "string"
    },
    
    "laboratorio": {
        "hemoglobina": 0.0,
        "hematocrito": 0.0,
        "leucocitos": 0,
        "eritrocitos": 0.0,
        "plaquetas": 0,
        "vgm": 0.0,
        "hgm": 0.0,
        "cmhg": 0.0,
        "neutrofilos": 0.0,
        "linfocitos": 0.0,
        "monocitos": 0.0,
        "eosinofilos": 0.0,
        "basofilos": 0.0,
        "bandas": 0.0,
        "glucosa": 0,
        "urea": 0.0,
        "bun": 0.0,
        "creatinina": 0.0,
        "acido_urico": 0.0,
        "colesterol_total": 0,
        "colesterol_hdl": 0,
        "colesterol_ldl": 0,
        "trigliceridos": 0,
        "bilirrubina_total": 0.0,
        "bilirrubina_directa": 0.0,
        "bilirrubina_indirecta": 0.0,
        "tgo_ast": 0,
        "tgp_alt": 0,
        "fosfatasa_alcalina": 0,
        "ggt": 0,
        "proteinas_totales": 0.0,
        "albumina": 0.0,
        "globulina": 0.0,
        "relacion_ag": 0.0,
        "ldh": 0,
        "cpk": 0,
        "sodio": 0.0,
        "potasio": 0.0,
        "cloro": 0.0,
        "calcio": 0.0,
        "fosforo": 0.0,
        "magnesio": 0.0,
        "hierro": 0,
        "ferritina": 0.0,
        "tsh": 0.0,
        "t3": 0.0,
        "t4": 0.0,
        "t4_libre": 0.0,
        "psa": 0.0,
        "hemoglobina_glucosilada": 0.0,
        "vsg": 0,
        "pcr": 0.0,
        "factor_reumatoide": 0.0,
        "vdrl": "string",
        "vih": "string",
        "hepatitis_b": "string",
        "hepatitis_c": "string",
        "grupo_sanguineo": "string",
        "rh": "string",
        "tp": 0.0,
        "tpt": 0.0,
        "inr": 0.0,
        "examen_orina": "string descripción completa del EGO",
        "examen_orina_densidad": 0.0,
        "examen_orina_ph": 0.0,
        "examen_orina_proteinas": "string",
        "examen_orina_glucosa": "string",
        "examen_orina_hemoglobina": "string",
        "examen_orina_leucocitos": "string",
        "examen_orina_nitritos": "string",
        "examen_orina_bacterias": "string",
        "examen_orina_cristales": "string",
        "examen_orina_cilindros": "string",
        "examen_orina_eritrocitos": "string",
        "coprologico": "string",
        "otros": {"nombre_del_estudio": "valor con unidad"}
    },
    
    "radiografia": {
        "tipo": "torax | columna_lumbar | columna_cervical | otro",
        "hallazgos": "string",
        "impresion_diagnostica": "string",
        "clasificacion_oit": "string si aplica"
    },
    
    "contacto_emergencia_nombre": "string",
    "contacto_emergencia_parentesco": "string",
    "contacto_emergencia_telefono": "string",
    
    "dictamen_aptitud": "apto | apto_con_restricciones | no_apto",
    "restricciones": ["string"],
    "recomendaciones": ["string"],
    
    "_confianza": 85,
    "_confianza_por_seccion": {
        "datos_personales": 90,
        "datos_laborales": 80,
        "signos_vitales": 95,
        "laboratorio": 70,
        "audiometria": 0,
        "espirometria": 0,
        "radiografia": 0
    },
    "_campos_encontrados": ["nombre", "glucosa", "..."],
    "_campos_faltantes": ["email", "..."],
    "_notas_extraccion": "string — notas sobre dificultades, campos ambiguos, etc."
}

ALIASES DE LABORATORIO QUE DEBES RECONOCER:
- Hb/HGB = hemoglobina
- Hto/HCT = hematocrito  
- WBC/Leucos = leucocitos
- RBC/Eritros = eritrocitos
- PLT/Plaq = plaquetas
- VGM/MCV = volumen globular medio
- HGM/MCH = hemoglobina globular media
- CMHG/MCHC = concentración media de hemoglobina globular
- Glu/Glc = glucosa
- BUN = nitrógeno ureico
- Cr/Crea = creatinina
- AU = ácido úrico
- Col/CT = colesterol total
- TG/Trig = triglicéridos
- HDL = colesterol HDL
- LDL = colesterol LDL
- BT = bilirrubina total
- BD = bilirrubina directa
- BI = bilirrubina indirecta
- TGO/AST = transaminasa glutámico oxalacética
- TGP/ALT = transaminasa glutámico pirúvica
- FA/ALP = fosfatasa alcalina
- GGT = gamma glutamil transferasa
- PT = proteínas totales
- Alb = albúmina
- Glob = globulina
- Na = sodio, K = potasio, Cl = cloro, Ca = calcio
- TSH = tirotropina, T3, T4, T4L = T4 libre
- HbA1c = hemoglobina glucosilada
- VSG/ESR = velocidad de sedimentación
- PCR/CRP = proteína C reactiva
- FR = factor reumatoide
- EGO = examen general de orina
- TP = tiempo de protrombina
- TPT = tiempo parcial de tromboplastina

REGLAS FINALES:
1. Fechas SIEMPRE en YYYY-MM-DD.
2. Incluye _confianza_por_seccion para que el usuario sepa qué secciones son confiables.
3. En _notas_extraccion, describe brevemente cualquier dificultad o ambigüedad.
4. Si ves valores en una tabla de laboratorio, EXTRAE TODOS los renglones, incluso si no están en el schema anterior — ponlos en "otros".
5. Responde SOLO con JSON válido.

***REGLA CRÍTICA PARA LABORATORIO***
- SIEMPRE usa los campos definidos arriba (hemoglobina, hematocrito, leucocitos, eritrocitos, plaquetas, vgm, hgm, cmhg, neutrofilos, linfocitos, monocitos, eosinofilos, basofilos, bandas, glucosa, urea, creatinina, acido_urico, colesterol_total, trigliceridos, etc.)
- El campo "otros" es EXCLUSIVAMENTE para estudios que NO tienen campo propio definido arriba.
- Los valores de laboratorio DEBEN ser NUMÉRICOS puros sin unidades. Ejemplo correcto: 16.4. Ejemplo INCORRECTO: "16.4 g/dL" o "16.4 gr/dL".
- "Neutrófilos totales" = neutrofilos. "Linfocitos" = linfocitos. "Eosinófilos" = eosinofilos. "Basófilos" = basofilos. "Monocitos" = monocitos.
- Si un valor como glucosa aparece en la tabla de laboratorio, PONLO EN laboratorio.glucosa, NO en laboratorio.otros.`

// ============================================
// POST-PROCESAMIENTO: Normalizar datos de laboratorio
// ============================================

/** Mapa de alias comunes → campo canónico del schema */
const LAB_ALIAS_MAP: Record<string, string> = {
    // Biometría hemática
    'hemoglobina': 'hemoglobina', 'hb': 'hemoglobina', 'hgb': 'hemoglobina',
    'hematocrito': 'hematocrito', 'hto': 'hematocrito', 'hct': 'hematocrito',
    'leucocitos': 'leucocitos', 'leucocitos totales': 'leucocitos', 'wbc': 'leucocitos',
    'eritrocitos': 'eritrocitos', 'rbc': 'eritrocitos',
    'plaquetas': 'plaquetas', 'plt': 'plaquetas',
    'vgm': 'vgm', 'vcm': 'vgm', 'volumen corpuscular medio': 'vgm', 'mcv': 'vgm',
    'hgm': 'hgm', 'hcm': 'hgm', 'hemoglobina corpuscular media': 'hgm', 'mch': 'hgm',
    'cmhg': 'cmhg', 'cmhc': 'cmhg', 'concentracion media de hb corpuscular': 'cmhg', 'mchc': 'cmhg', 'concentracion media de hemoglobina': 'cmhg',
    // Diferencial
    'neutrofilos': 'neutrofilos', 'neutrófilos': 'neutrofilos', 'neutrofilos totales': 'neutrofilos', 'neutrófilos totales': 'neutrofilos',
    'neutrofilos segmentados': 'neutrofilos', 'neutrófilos segmentados': 'neutrofilos',
    'linfocitos': 'linfocitos', 'linfo': 'linfocitos',
    'monocitos': 'monocitos', 'mono': 'monocitos',
    'eosinofilos': 'eosinofilos', 'eosinófilos': 'eosinofilos', 'eos': 'eosinofilos',
    'basofilos': 'basofilos', 'basófilos': 'basofilos', 'baso': 'basofilos',
    'bandas': 'bandas', 'neutrofilos en banda': 'bandas', 'neutrófilos en banda': 'bandas',
    // Química
    'glucosa': 'glucosa', 'glu': 'glucosa', 'glc': 'glucosa',
    'urea': 'urea',
    'bun': 'bun', 'nitrogeno ureico': 'bun',
    'creatinina': 'creatinina', 'cr': 'creatinina', 'crea': 'creatinina',
    'acido urico': 'acido_urico', 'ácido úrico': 'acido_urico', 'au': 'acido_urico',
    'colesterol total': 'colesterol_total', 'col': 'colesterol_total', 'ct': 'colesterol_total',
    'colesterol hdl': 'colesterol_hdl', 'hdl': 'colesterol_hdl',
    'colesterol ldl': 'colesterol_ldl', 'ldl': 'colesterol_ldl',
    'trigliceridos': 'trigliceridos', 'triglicéridos': 'trigliceridos', 'tg': 'trigliceridos', 'trig': 'trigliceridos',
    // Hepático
    'tgo': 'tgo_ast', 'ast': 'tgo_ast', 'tgo/ast': 'tgo_ast', 'tgo ast': 'tgo_ast',
    'tgp': 'tgp_alt', 'alt': 'tgp_alt', 'tgp/alt': 'tgp_alt', 'tgp alt': 'tgp_alt',
    'fosfatasa alcalina': 'fosfatasa_alcalina', 'fa': 'fosfatasa_alcalina', 'alp': 'fosfatasa_alcalina',
    'ggt': 'ggt', 'gamma glutamil': 'ggt',
    'bilirrubina total': 'bilirrubina_total', 'bt': 'bilirrubina_total',
    'bilirrubina directa': 'bilirrubina_directa', 'bd': 'bilirrubina_directa',
    'bilirrubina indirecta': 'bilirrubina_indirecta', 'bi': 'bilirrubina_indirecta',
    'proteinas totales': 'proteinas_totales', 'proteínas totales': 'proteinas_totales',
    'albumina': 'albumina', 'albúmina': 'albumina',
    'globulina': 'globulina',
    'ldh': 'ldh', 'deshidrogenasa lactica': 'ldh',
    'cpk': 'cpk',
    // Electrolitos
    'sodio': 'sodio', 'na': 'sodio',
    'potasio': 'potasio', 'k': 'potasio',
    'cloro': 'cloro', 'cl': 'cloro',
    'calcio': 'calcio', 'ca': 'calcio',
    'fosforo': 'fosforo', 'fósforo': 'fosforo',
    'magnesio': 'magnesio', 'mg': 'magnesio',
    'hierro': 'hierro', 'fe': 'hierro',
    'ferritina': 'ferritina',
    // Tiroides
    'tsh': 'tsh', 't3': 't3', 't4': 't4', 't4 libre': 't4_libre',
    // Otros labs
    'psa': 'psa', 'hemoglobina glucosilada': 'hemoglobina_glucosilada', 'hba1c': 'hemoglobina_glucosilada',
    'vsg': 'vsg', 'pcr': 'pcr', 'factor reumatoide': 'factor_reumatoide',
    // Coagulación
    'tp': 'tp', 'tiempo de protrombina': 'tp',
    'tpt': 'tpt', 'tiempo parcial de tromboplastina': 'tpt',
    'inr': 'inr',
    // Extra comunes
    'rdw': 'rdw_cv', 'rdw-cv': 'rdw_cv', 'rdw cv': 'rdw_cv',
    'vpm': 'vpm', 'volumen plaquetario medio': 'vpm', 'mpv': 'vpm',
}

/** Extrae solo el número de un string como "51.0 %" o "16.4 g/dL" */
function extractNumber(val: any): number | null {
    if (typeof val === 'number') return val
    if (typeof val !== 'string') return null
    const match = val.match(/([\d]+\.?[\d]*)/)
    return match ? parseFloat(match[1]) : null
}

/**
 * Post-procesa los datos de laboratorio:
 * 1. Re-mapea valores de "otros" a sus campos propios si existen
 * 2. Convierte valores con unidades a solo números
 * 3. Normaliza nombres de campos
 */
function normalizeLabData(data: DatosExtraidos): DatosExtraidos {
    if (!data.laboratorio) return data

    const lab = { ...data.laboratorio }
    const otros = lab.otros ? { ...lab.otros } : {}
    let movedCount = 0

    // 1. Re-mapear campos de "otros" a campos propios
    if (lab.otros && typeof lab.otros === 'object') {
        for (const [rawKey, rawValue] of Object.entries(lab.otros)) {
            const normalizedKey = rawKey.toLowerCase()
                .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
                .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u')
                .replace(/[%°]/g, '').replace(/\s+/g, ' ').trim()

            // Buscar en el mapa de alias
            const canonicalField = LAB_ALIAS_MAP[normalizedKey]
            if (canonicalField) {
                const numVal = extractNumber(rawValue)
                if (numVal !== null && (!(lab as any)[canonicalField] || (lab as any)[canonicalField] === 0)) {
                    (lab as any)[canonicalField] = numVal
                    delete otros[rawKey]
                    movedCount++
                    console.log(`  📋 Lab remap: "${rawKey}" → ${canonicalField} = ${numVal}`)
                }
            }
        }
    }

    // 2. Limpiar valores con unidades en todos los campos numéricos del lab
    const numericFields = [
        'hemoglobina', 'hematocrito', 'leucocitos', 'eritrocitos', 'plaquetas',
        'vgm', 'hgm', 'cmhg', 'neutrofilos', 'linfocitos', 'monocitos',
        'eosinofilos', 'basofilos', 'bandas', 'glucosa', 'urea', 'bun',
        'creatinina', 'acido_urico', 'colesterol_total', 'colesterol_hdl',
        'colesterol_ldl', 'trigliceridos', 'bilirrubina_total', 'bilirrubina_directa',
        'bilirrubina_indirecta', 'tgo_ast', 'tgp_alt', 'fosfatasa_alcalina', 'ggt',
        'proteinas_totales', 'albumina', 'globulina', 'ldh', 'cpk',
        'sodio', 'potasio', 'cloro', 'calcio', 'fosforo', 'magnesio', 'hierro', 'ferritina',
        'tsh', 't3', 't4', 't4_libre', 'psa', 'hemoglobina_glucosilada', 'vsg', 'pcr',
        'factor_reumatoide', 'tp', 'tpt', 'inr', 'vpm', 'rdw_cv'
    ]
    for (const field of numericFields) {
        const val = (lab as any)[field]
        if (val !== undefined && val !== null && typeof val === 'string') {
            const num = extractNumber(val)
            if (num !== null) (lab as any)[field] = num
        }
    }

    // 3. Actualizar otros (remover los que ya se mapearon)
    lab.otros = Object.keys(otros).length > 0 ? otros : undefined

    if (movedCount > 0) {
        console.log(`✅ normalizeLabData: ${movedCount} valores movidos de "otros" a campos propios`)
    }

    data.laboratorio = lab
    return data
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export const documentExtractorService = {

    /**
     * Extrae archivos individuales de un ZIP y retorna un array de File objects
     */
    async extractFilesFromZip(zipFile: File): Promise<File[]> {
        const JSZip = (await import('jszip')).default
        const arrayBuffer = await zipFile.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)

        const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'webp', 'gif']
        const extractedFiles: File[] = []

        for (const [path, zipEntry] of Object.entries(zip.files)) {
            // Ignorar directorios, archivos ocultos, y archivos temporales
            if (zipEntry.dir) continue
            const fileName = path.split('/').pop() || ''
            if (fileName.startsWith('.') || fileName.startsWith('~$') || fileName.startsWith('__MACOSX')) continue

            const ext = fileName.split('.').pop()?.toLowerCase() || ''
            if (!SUPPORTED_EXTENSIONS.includes(ext)) continue

            try {
                const blob = await zipEntry.async('blob')
                const mimeTypes: Record<string, string> = {
                    pdf: 'application/pdf',
                    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    doc: 'application/msword',
                    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    ppt: 'application/vnd.ms-powerpoint',
                    jpg: 'image/jpeg', jpeg: 'image/jpeg',
                    png: 'image/png', webp: 'image/webp', gif: 'image/gif',
                }
                const file = new File([blob], fileName, { type: mimeTypes[ext] || 'application/octet-stream' })
                extractedFiles.push(file)
                console.log(`📦 ZIP → Extraído: ${fileName} (${(file.size / 1024).toFixed(1)} KB)`)
            } catch (e) {
                console.warn(`⚠️ No se pudo extraer ${fileName} del ZIP:`, e)
            }
        }

        console.log(`📦 ZIP procesado: ${extractedFiles.length} archivos válidos de ${Object.keys(zip.files).length} totales`)
        return extractedFiles
    },

    /**
     * Extrae datos de un archivo y retorna un objeto estructurado
     */
    async extractFromFile(file: File): Promise<ExtractionResult> {
        const startTime = Date.now()
        const extension = file.name.split('.').pop()?.toLowerCase() || ''

        try {
            let extractedText = ''
            let base64Images: string[] = []

            // 1. Extraer texto + renderizar imágenes según formato
            switch (extension) {
                case 'docx':
                case 'doc':
                    extractedText = await extractTextFromDocx(file)
                    break

                case 'pdf':
                    try {
                        extractedText = await extractTextFromPdf(file)
                    } catch (pdfErr: any) {
                        console.warn('⚠️ PDF text extraction failed:', pdfErr.message)
                    }
                    try {
                        base64Images = await renderPdfPagesToBase64(file)
                        console.log(`📄 PDF: ${extractedText.length} chars texto + ${base64Images.length} páginas renderizadas`)
                    } catch (renderErr: any) {
                        console.warn('⚠️ No se pudo renderizar PDF como imágenes:', renderErr.message)
                        if (extractedText.trim().length < 50) {
                            return { success: false, data: null, error: 'No se pudo leer el PDF', processingTimeMs: Date.now() - startTime }
                        }
                    }
                    break

                case 'pptx':
                case 'ppt':
                    extractedText = await extractTextFromPptx(file)
                    break

                case 'jpg': case 'jpeg': case 'png': case 'webp': case 'gif': {
                    const img = await imageToBase64(file)
                    base64Images = [img]
                    break
                }

                case 'zip':
                    return { success: false, data: null, error: 'ZIP → usar extractFilesFromZip() primero', processingTimeMs: Date.now() - startTime }

                default:
                    return { success: false, data: null, error: `Formato no soportado: .${extension}`, processingTimeMs: Date.now() - startTime }
            }

            // 2. Enviar a Gemini (principal) o OpenAI (fallback)
            const data = await this.callAI(extractedText, base64Images, file, extension)

            return { success: true, data, processingTimeMs: Date.now() - startTime }

        } catch (error: any) {
            console.error('Error en extracción:', error)
            return { success: false, data: null, error: error.message || 'Error desconocido', processingTimeMs: Date.now() - startTime }
        }
    },

    /**
     * Procesa MÚLTIPLES archivos y fusiona los datos extraídos
     * DEEP MERGE: los objetos anidados (laboratorio, signos_vitales, etc.) 
     * se fusionan campo por campo, NO se sobrescriben completos.
     */
    async extractFromMultipleFiles(files: File[]): Promise<{
        mergedData: DatosExtraidos
        individualResults: Array<{ file: string; result: ExtractionResult }>
        totalTimeMs: number
    }> {
        const startTime = Date.now()
        const results: Array<{ file: string; result: ExtractionResult }> = []

        // ===== ESTRATEGIA PRINCIPAL: Enviar TODOS los archivos en UN solo request a Gemini =====
        // Gemini 2.0 Flash acepta hasta 3600 imágenes y 1M tokens en un solo request.
        // Al ver TODO junto, cruza información entre documentos (ej: nombre del lab + datos del lab).
        try {
            console.log(`🚀 Intentando extracción UNIFICADA con Gemini para ${files.length} archivos...`)
            const geminiResult = await this.extractAllFilesWithGemini(files)
            if (geminiResult) {
                geminiResult._archivo_origen = files.map(f => f.name).join(', ')
                geminiResult._formato_origen = 'gemini-unified'

                // Generar resultados individuales de referencia
                for (const file of files) {
                    results.push({ file: file.name, result: { success: true, data: geminiResult, processingTimeMs: Date.now() - startTime } })
                }

                const labFields = geminiResult.laboratorio ? Object.entries(geminiResult.laboratorio).filter(([_, v]) => v !== null && v !== undefined && v !== 0 && v !== '').length : 0
                console.log(`✅ Extracción unificada Gemini: ${Object.keys(geminiResult).filter(k => !k.startsWith('_')).length} campos, ${labFields} de laboratorio`)

                return {
                    mergedData: geminiResult,
                    individualResults: results,
                    totalTimeMs: Date.now() - startTime
                }
            }
        } catch (err: any) {
            console.warn('⚠️ Extracción unificada Gemini falló, cayendo a modo individual:', err.message)
        }

        // ===== FALLBACK: Procesar archivo por archivo con deep merge =====
        console.log('📋 Modo fallback: procesando archivo por archivo...')
        for (const file of files) {
            const result = await this.extractFromFile(file)
            results.push({ file: file.name, result })
            console.log(`📊 ${file.name}: ${result.success ? 'OK' : 'FAIL'} — ${result.data ? Object.keys(result.data).filter(k => !k.startsWith('_')).length + ' campos' : result.error
                }`)
        }

        // Deep merge fallback
        const mergedData: DatosExtraidos = {
            _confianza: 0, _campos_encontrados: [], _campos_faltantes: [],
            _archivo_origen: files.map(f => f.name).join(', '), _formato_origen: 'individual-merge'
        }
        let totalConfianza = 0, successCount = 0
        const NESTED_KEYS = ['laboratorio', 'signos_vitales', 'exploracion_fisica', 'audiometria', 'espirometria', 'radiografia']

        for (const { file, result } of results) {
            if (result.success && result.data) {
                successCount++
                totalConfianza += result.data._confianza || 0
                for (const [key, value] of Object.entries(result.data)) {
                    if (key.startsWith('_') || value === null || value === undefined || value === '') continue
                    if (NESTED_KEYS.includes(key) && typeof value === 'object' && !Array.isArray(value)) {
                        const existing = (mergedData as any)[key] || {}
                        for (const [subKey, subVal] of Object.entries(value as Record<string, any>)) {
                            if (subVal === null || subVal === undefined || subVal === '' || subVal === 0) continue
                            const existingVal = existing[subKey]
                            if (!existingVal || existingVal === 0) existing[subKey] = subVal
                            else if (typeof subVal === 'object' && typeof existingVal === 'object') existing[subKey] = { ...existingVal, ...subVal }
                        }
                        (mergedData as any)[key] = existing
                    } else if (!(key in mergedData) || !(mergedData as any)[key]) {
                        (mergedData as any)[key] = value
                    }
                }
                if (result.data._campos_encontrados) {
                    mergedData._campos_encontrados = [...new Set([...mergedData._campos_encontrados, ...result.data._campos_encontrados])]
                }
            }
        }
        mergedData._confianza = successCount > 0 ? Math.round(totalConfianza / successCount) : 0

        return { mergedData, individualResults: results, totalTimeMs: Date.now() - startTime }
    },

    /**
     * EXTRACCIÓN UNIFICADA: Envía TODOS los archivos a Gemini en UN solo request.
     * Gemini ve el expediente completo y cruza datos entre documentos.
     */
    async extractAllFilesWithGemini(files: File[]): Promise<DatosExtraidos | null> {
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY
        if (!googleApiKey) {
            console.warn('⚠️ VITE_GOOGLE_API_KEY no configurada — no se puede usar Gemini')
            return null
        }

        const ai = new GoogleGenAI({ apiKey: googleApiKey })
        const parts: any[] = []
        let supplementaryText = ''

        // Preparar cada archivo como parte del request
        for (const file of files) {
            const ext = file.name.split('.').pop()?.toLowerCase() || ''
            console.log(`📎 Preparando ${file.name} (${ext}, ${(file.size / 1024).toFixed(0)} KB)...`)

            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                // Imágenes: enviar directamente como inline data
                const base64 = await this.fileToBase64(file)
                parts.push({ inlineData: { data: base64, mimeType: file.type || `image/${ext}` } })

            } else if (ext === 'pdf') {
                // PDFs: renderizar TODAS las páginas como imágenes + extraer texto
                try {
                    const textContent = await extractTextFromPdf(file)
                    if (textContent.trim().length > 50) {
                        supplementaryText += `\n\n=== TEXTO DE ${file.name} ===\n${textContent}`
                    }
                } catch (e) { /* ignore text extraction failures */ }
                try {
                    const pageImages = await renderPdfPagesToBase64(file)
                    for (const img of pageImages) {
                        // Las imágenes vienen como data:image/png;base64,xxx — extraer la parte base64
                        const base64Data = img.includes(',') ? img.split(',')[1] : img
                        parts.push({ inlineData: { data: base64Data, mimeType: 'image/png' } })
                    }
                    console.log(`  📄 ${file.name}: ${pageImages.length} páginas renderizadas`)
                } catch (e: any) {
                    console.warn(`  ⚠️ No se pudo renderizar ${file.name}:`, e.message)
                    // Fallback: enviar el PDF como data cruda
                    const base64 = await this.fileToBase64(file)
                    parts.push({ inlineData: { data: base64, mimeType: 'application/pdf' } })
                }

            } else if (['docx', 'doc'].includes(ext)) {
                // DOCX: extraer texto (mammoth)
                try {
                    const text = await extractTextFromDocx(file)
                    supplementaryText += `\n\n=== TEXTO DE ${file.name} ===\n${text}`
                } catch (e) { /* ignore */ }
                // También enviar archivo crudo para que Gemini vea imágenes embebidas
                const base64 = await this.fileToBase64(file)
                parts.push({ inlineData: { data: base64, mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } })

            } else if (['pptx', 'ppt'].includes(ext)) {
                // PPTX: extraer texto + enviar crudo
                try {
                    const text = await extractTextFromPptx(file)
                    supplementaryText += `\n\n=== TEXTO DE ${file.name} ===\n${text}`
                } catch (e) { /* ignore */ }
                const base64 = await this.fileToBase64(file)
                parts.push({ inlineData: { data: base64, mimeType: file.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation' } })
            }
        }

        // Agregar texto suplementario y el prompt
        const userPrompt = `Analiza TODOS estos ${files.length} documentos que pertenecen a UN SOLO PACIENTE.
Archivos: ${files.map(f => f.name).join(', ')}

Revisa CADA página, CADA imagen, CADA tabla. Cruza datos entre documentos.
Por ejemplo: el nombre puede estar en la historia clínica y los labs en otro PDF.
${supplementaryText ? `\n\nTEXTO EXTRAÍDO COMO RESPALDO:\n${supplementaryText}` : ''}

Responde ÚNICAMENTE con JSON válido.`

        parts.push({ text: EXTRACTION_SYSTEM_PROMPT + '\n\n' + userPrompt })

        console.log(`🧠 Enviando ${parts.length} partes a Gemini 2.0 Flash...`)

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: { parts },
            config: {
                temperature: 0.1,
                responseMimeType: 'application/json'
            }
        })

        const responseText = response.text
        if (!responseText) throw new Error('Gemini no retornó contenido')

        let parsed = JSON.parse(responseText) as DatosExtraidos
        parsed = normalizeLabData(parsed)
        const labFields = parsed.laboratorio ? Object.entries(parsed.laboratorio).filter(([k, v]) => v !== null && v !== undefined && v !== 0 && v !== '' && k !== 'otros').length : 0
        console.log(`✅ Gemini extrajo: ${Object.keys(parsed).filter(k => !k.startsWith('_')).length} campos, ${labFields} de laboratorio`)
        return parsed
    },

    /**
     * Convierte File a base64 string (sin el prefijo data:...)
     */
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                resolve(result.split(',')[1])
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    },

    /**
     * Llama a la IA para extraer datos de UN archivo.
     * Primero intenta Gemini (gratis). Si falla, usa OpenAI como fallback.
     */
    async callAI(
        text: string,
        base64Images: string[],
        file: File,
        extension: string
    ): Promise<DatosExtraidos> {
        // Intentar Gemini primero
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY
        if (googleApiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey: googleApiKey })
                const parts: any[] = []

                // Agregar imágenes
                for (const img of base64Images) {
                    const base64Data = img.includes(',') ? img.split(',')[1] : img
                    parts.push({ inlineData: { data: base64Data, mimeType: 'image/png' } })
                }

                // Si no hay imágenes, enviar el archivo crudo
                if (base64Images.length === 0 && ['docx', 'pptx', 'ppt', 'doc'].includes(extension)) {
                    const base64 = await this.fileToBase64(file)
                    parts.push({ inlineData: { data: base64, mimeType: file.type } })
                }

                const prompt = `Extrae TODOS los datos del archivo "${file.name}" (${extension}). Revisa cada página/slide/sección.\n${text ? `\nTexto extraído:\n${text}` : ''}\n\nResponde SOLO con JSON válido.`
                parts.push({ text: EXTRACTION_SYSTEM_PROMPT + '\n\n' + prompt })

                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: { parts },
                    config: { temperature: 0.1, responseMimeType: 'application/json' }
                })

                const responseText = response.text
                if (responseText) {
                    let parsed = JSON.parse(responseText) as DatosExtraidos
                    parsed = normalizeLabData(parsed)
                    parsed._archivo_origen = file.name
                    parsed._formato_origen = extension
                    return parsed
                }
            } catch (geminiErr: any) {
                console.warn('⚠️ Gemini falló, intentando OpenAI:', geminiErr.message)
            }
        }

        // Fallback: OpenAI
        const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
        if (!openaiKey) throw new Error('Sin API key de Gemini ni OpenAI configurada')

        const messages: any[] = [{ role: 'system', content: EXTRACTION_SYSTEM_PROMPT }]
        if (base64Images.length > 0) {
            const content: any[] = [{ type: 'text', text: `Extrae datos de "${file.name}". ${text ? `\nTexto:\n${text}` : ''}` }]
            for (const img of base64Images) {
                content.push({ type: 'image_url', image_url: { url: img, detail: 'high' } })
            }
            messages.push({ role: 'user', content })
        } else {
            messages.push({ role: 'user', content: `Extrae datos de "${file.name}":\n\n${text}` })
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
            body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 4000, temperature: 0.1, response_format: { type: 'json_object' } })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`OpenAI error: ${response.status} — ${errorData.error?.message || 'Error'}`)
        }

        const result = await response.json()
        const content = result.choices[0]?.message?.content
        if (!content) throw new Error('OpenAI no retornó contenido')

        let parsed = JSON.parse(content) as DatosExtraidos
        parsed = normalizeLabData(parsed)
        parsed._archivo_origen = file.name
        parsed._formato_origen = extension
        return parsed
    }
}
