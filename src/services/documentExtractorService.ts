/**
 * DocumentExtractorService — Extracción Inteligente de Datos de Expedientes
 * 
 * Pipeline de procesamiento:
 *   1. Recibe archivo (PDF, DOCX, PPTX, JPG)
 *   2. Extrae texto según formato
 *   3. Envía a OpenAI GPT-4o para estructurar datos
 *   4. Retorna objeto JSON con campos del paciente mapeados al schema del ERP
 * 
 * Formatos soportados:
 *   📝 DOCX → mammoth.js → texto plano → OpenAI
 *   📄 PDF  → pdfjs-dist → texto por páginas → OpenAI
 *   🖼️ JPG/PNG → Base64 → OpenAI Vision (GPT-4o)
 *   📊 PPTX → JSZip → extrae texto de slides → OpenAI
 */

import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker para PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

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
    diagnostico?: string
    patron?: string
}

export interface LaboratorioExtraido {
    hemoglobina?: number
    hematocrito?: number
    leucocitos?: number
    plaquetas?: number
    glucosa?: number
    colesterol_total?: number
    trigliceridos?: number
    creatinina?: number
    acido_urico?: number
    examen_orina?: string
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
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const textParts: string[] = []
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
        textParts.push(`--- Página ${pageNum} ---\n${pageText}`)
    }

    return textParts.join('\n\n')
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

const EXTRACTION_SYSTEM_PROMPT = `Eres un asistente especializado en medicina ocupacional / medicina del trabajo en México.
Tu tarea es extraer TODOS los datos de un expediente médico de un trabajador a partir del texto proporcionado.

DEBES retornar un objeto JSON VÁLIDO con la siguiente estructura. Incluye SOLO los campos que puedas extraer con confianza del texto. No inventes datos.

{
    "nombre": "string — nombre(s) del paciente",
    "apellido_paterno": "string",
    "apellido_materno": "string",
    "fecha_nacimiento": "YYYY-MM-DD",
    "genero": "masculino | femenino",
    "curp": "string — 18 caracteres",
    "rfc": "string — 13 caracteres",
    "nss": "string — NSS del IMSS",
    "estado_civil": "soltero | casado | divorciado | viudo | union_libre",
    "tipo_sangre": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-",
    "email": "string",
    "telefono": "string",
    
    "numero_empleado": "string",
    "empresa_nombre": "string — nombre de la empresa donde trabaja",
    "puesto": "string — puesto/cargo del trabajador",
    "area": "string",
    "departamento": "string",
    "turno": "matutino | vespertino | nocturno | mixto",
    "fecha_ingreso": "YYYY-MM-DD — fecha de ingreso a la empresa",
    
    "alergias": "string — lista de alergias",
    "antecedentes_personales": "string — antecedentes personales no patológicos y patológicos",
    "antecedentes_familiares": "string — antecedentes heredofamiliares",
    "padecimiento_actual": "string — padecimiento o motivo de consulta actual",
    
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
        "oido_derecho": {"500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0},
        "oido_izquierdo": {"500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0},
        "diagnostico": "string", "pta_derecho": 0, "pta_izquierdo": 0
    },
    
    "espirometria": {
        "fvc": 0.0, "fev1": 0.0, "fev1_fvc": 0.0,
        "diagnostico": "string", "patron": "normal | obstructivo | restrictivo | mixto"
    },
    
    "laboratorio": {
        "hemoglobina": 0, "hematocrito": 0, "leucocitos": 0, "plaquetas": 0,
        "glucosa": 0, "colesterol_total": 0, "trigliceridos": 0,
        "creatinina": 0, "acido_urico": 0, "examen_orina": "string",
        "otros": {"nombre_estudio": "valor"}
    },
    
    "radiografia": {
        "tipo": "torax | columna_lumbar | columna_cervical | otro",
        "hallazgos": "string",
        "impresion_diagnostica": "string",
        "clasificacion_oit": "string — si aplica clasificación OIT para neumoconiosis"
    },
    
    "contacto_emergencia_nombre": "string",
    "contacto_emergencia_parentesco": "string",
    "contacto_emergencia_telefono": "string",
    
    "dictamen_aptitud": "apto | apto_con_restricciones | no_apto",
    "restricciones": ["string — lista de restricciones"],
    "recomendaciones": ["string — lista de recomendaciones"],
    
    "_confianza": 85,
    "_campos_encontrados": ["nombre", "curp", "..."],
    "_campos_faltantes": ["email", "telefono", "..."]
}

REGLAS:
1. SOLO incluye campos que puedas extraer del texto. No inventes datos.
2. Si un campo no está en el texto, NO lo incluyas en el JSON.
3. Fechas SIEMPRE en formato YYYY-MM-DD.
4. _confianza es un número del 0 al 100 indicando tu nivel de confianza general.
5. _campos_encontrados y _campos_faltantes son arrays de strings con los nombres de los campos.
6. Si el texto es de un estudio específico (audiometría, laboratorio, etc.), llena SOLO esa sección.
7. Responde SOLO con el JSON, sin texto adicional, sin bloques de código markdown.`

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export const documentExtractorService = {

    /**
     * Extrae datos de un archivo y retorna un objeto estructurado
     */
    async extractFromFile(file: File): Promise<ExtractionResult> {
        const startTime = Date.now()
        const extension = file.name.split('.').pop()?.toLowerCase() || ''

        try {
            let extractedText = ''
            let useVision = false
            let base64Image = ''

            // 1. Extraer texto según formato
            switch (extension) {
                case 'docx':
                case 'doc':
                    extractedText = await extractTextFromDocx(file)
                    break

                case 'pdf':
                    extractedText = await extractTextFromPdf(file)
                    // Si el PDF tiene muy poco texto, probablemente sea escaneado → usa Vision
                    if (extractedText.trim().length < 50) {
                        useVision = true
                        // Convertir primera página a imagen (fallback)
                        console.log('📄 PDF con poco texto, intentando Vision API...')
                    }
                    break

                case 'pptx':
                case 'ppt':
                    extractedText = await extractTextFromPptx(file)
                    // Si no se pudo extraer texto, usar Vision
                    if (extractedText.includes('No se pudo extraer') || extractedText.trim().length < 50) {
                        useVision = true
                    }
                    break

                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'webp':
                case 'gif':
                    useVision = true
                    break

                default:
                    return {
                        success: false,
                        data: null,
                        error: `Formato no soportado: .${extension}`,
                        processingTimeMs: Date.now() - startTime
                    }
            }

            // 2. Si necesitamos Vision, obtener base64
            if (useVision) {
                base64Image = await imageToBase64(file)
            }

            // 3. Enviar a OpenAI para estructurar
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY
            if (!apiKey) {
                return {
                    success: false,
                    data: null,
                    error: 'API key de OpenAI no configurada (VITE_OPENAI_API_KEY)',
                    processingTimeMs: Date.now() - startTime
                }
            }

            const data = await this.callOpenAI(
                apiKey,
                extractedText,
                useVision ? base64Image : undefined,
                file.name,
                extension
            )

            return {
                success: true,
                data,
                processingTimeMs: Date.now() - startTime
            }

        } catch (error: any) {
            console.error('Error en extracción:', error)
            return {
                success: false,
                data: null,
                error: error.message || 'Error desconocido en la extracción',
                processingTimeMs: Date.now() - startTime
            }
        }
    },

    /**
     * Procesa MÚLTIPLES archivos y fusiona los datos extraídos
     */
    async extractFromMultipleFiles(files: File[]): Promise<{
        mergedData: DatosExtraidos
        individualResults: Array<{ file: string; result: ExtractionResult }>
        totalTimeMs: number
    }> {
        const startTime = Date.now()
        const results: Array<{ file: string; result: ExtractionResult }> = []

        // Procesar cada archivo
        for (const file of files) {
            const result = await this.extractFromFile(file)
            results.push({ file: file.name, result })
        }

        // Fusionar todos los resultados exitosos
        const mergedData: DatosExtraidos = {
            _confianza: 0,
            _campos_encontrados: [],
            _campos_faltantes: [],
            _archivo_origen: files.map(f => f.name).join(', '),
            _formato_origen: 'multiple'
        }

        let totalConfianza = 0
        let successCount = 0

        for (const { result } of results) {
            if (result.success && result.data) {
                successCount++
                totalConfianza += result.data._confianza || 0

                // Fusionar campos (los valores no-nulos sobrescriben)
                const data = result.data
                for (const [key, value] of Object.entries(data)) {
                    if (key.startsWith('_')) continue // Skip metadata
                    if (value !== null && value !== undefined && value !== '') {
                        (mergedData as any)[key] = value
                    }
                }

                // Acumular campos encontrados
                if (data._campos_encontrados) {
                    mergedData._campos_encontrados = [
                        ...new Set([...mergedData._campos_encontrados, ...data._campos_encontrados])
                    ]
                }
            }
        }

        mergedData._confianza = successCount > 0 ? Math.round(totalConfianza / successCount) : 0

        return {
            mergedData,
            individualResults: results,
            totalTimeMs: Date.now() - startTime
        }
    },

    /**
     * Llama a la API de OpenAI para estructurar los datos extraídos
     */
    async callOpenAI(
        apiKey: string,
        text: string,
        base64Image: string | undefined,
        fileName: string,
        extension: string
    ): Promise<DatosExtraidos> {

        const messages: any[] = [
            { role: 'system', content: EXTRACTION_SYSTEM_PROMPT }
        ]

        if (base64Image) {
            // Usar Vision API para imágenes
            messages.push({
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Extrae todos los datos médicos y personales de esta imagen del archivo "${fileName}" (formato: ${extension}). ${text ? `\n\nTexto adicional extraído:\n${text}` : ''}`
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: base64Image,
                            detail: 'high'
                        }
                    }
                ]
            })
        } else {
            // Solo texto
            messages.push({
                role: 'user',
                content: `Extrae todos los datos médicos y personales del siguiente texto del archivo "${fileName}" (formato: ${extension}):\n\n${text}`
            })
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages,
                max_tokens: 4000,
                temperature: 0.1, // Baja temperatura para mayor precisión
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`OpenAI API error: ${response.status} — ${errorData.error?.message || 'Error desconocido'}`)
        }

        const result = await response.json()
        const content = result.choices[0]?.message?.content

        if (!content) throw new Error('OpenAI no retornó contenido')

        // Parsear JSON
        const parsed = JSON.parse(content) as DatosExtraidos
        parsed._archivo_origen = fileName
        parsed._formato_origen = extension

        return parsed
    }
}
