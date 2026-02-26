/**
 * ============================================================
 * Medical Normalizer — Pipeline de estandarización clínica
 * GPMedical ERP — Normaliza datos extraídos por IA
 * ============================================================
 *
 * Este módulo se sienta entre Gemini AI y la base de datos.
 * Estandariza sinónimos, unidades, detecta errores OCR,
 * y clasifica automáticamente cada resultado.
 */

// ── Tipos ──

export interface RawExtractedParam {
    categoria?: string;
    parametro: string;
    resultado: string;
    unidad?: string;
    rango_referencia?: string;
    observacion?: string;
}

export interface NormalizedParam {
    parametro_nombre: string;        // Nombre canónico (estandarizado)
    parametro_original: string;      // Lo que vino de la IA (para comparación)
    categoria: string;
    resultado: string;
    resultado_numerico: number | null;
    unidad: string;
    rango_ref_min: number | null;
    rango_ref_max: number | null;
    rango_ref_texto: string | null;
    observacion: string;
    tipo_estudio: string;
    confianza: 'alta' | 'media' | 'baja' | 'sospechosa';
    alerta_ocr?: string;            // Si se detecta un posible error OCR
}

export interface NormalizationReport {
    params: NormalizedParam[];
    total_input: number;
    total_output: number;
    synonyms_resolved: number;
    units_fixed: number;
    ocr_alerts: number;
    type_detected: string;
}

// ══════════════════════════════════════════════════════════
// 1. CATÁLOGO DE SINÓNIMOS MÉDICOS
// ══════════════════════════════════════════════════════════
// key = nombre canónico, values = variantes que un médico/IA podría escribir

const SYNONYMS: Record<string, string[]> = {
    // ── Biometría Hemática ──
    'Eritrocitos': ['GR', 'RBC', 'Glóbulos Rojos', 'Eritrocitarios', 'Red Blood Cells', 'G.R.', 'Hematies', 'Hematíes'],
    'Hemoglobina': ['Hb', 'HGB', 'Hb.', 'Hemoglob.', 'Hemoglob', 'HB'],
    'Hematocrito': ['Hto', 'HCT', 'Hto.', 'Hcto', 'Hcto.'],
    'VCM': ['MCV', 'Vol. Corp. Medio', 'Volumen Corpuscular Medio', 'Vol Corp Medio'],
    'HCM': ['MCH', 'Hb. Corp. Media', 'Concentración Media de Hb', 'Concentración Media de Hb (HCM)'],
    'CMHC': ['MCHC', 'Conc. Media Hb Corp.', 'C.H.C.M.', 'CHCM', 'Concentración Media de Hb Corpuscular (CMHC)', 'Concentración Media de Hb Corpuscular'],
    'Leucocitos': ['WBC', 'GB', 'Glóbulos Blancos', 'Leucos', 'Leucocitos totales'],
    'Plaquetas': ['PLT', 'Trombocitos', 'Plaq.', 'Plaq', 'Recuento Plaquetario'],
    'VPM': ['MPV', 'Vol. Plaquetario Medio', 'Volumen Plaquetario Medio', 'Volumen Plaquetario Medio (VPM)'],
    'RDW-CV': ['RDW', 'ADE', 'Ancho Distribución Eritrocitaria', 'RDW-CV'],
    'Neutrófilos': ['Neutrófilos totales', 'Neut', 'Neutro', 'PMN', 'Neutrófilos segmentados'],
    'Neutrófilos en banda': ['Bandas', 'Cayados', 'Neutrófilos en banda', 'Banda'],
    'Linfocitos': ['Linf', 'Linfo', 'Lymph'],
    'Monocitos': ['Mono', 'Mon'],
    'Eosinófilos': ['Eos', 'Eosin'],
    'Basófilos': ['Baso', 'Bas'],

    // ── Química Sanguínea ──
    'Glucosa': ['Glucemia', 'Gluc', 'Blood Sugar', 'Glu', 'Glucosa en suero', 'Glucosa sérica'],
    'Urea': ['Urea sérica'],
    'BUN': ['Nitrógeno Ureico', 'Nitrógeno ureico sérico', 'Nitrógeno ureico sérico ( BUN )', 'N. Ureico'],
    'Creatinina': ['Creat', 'CREA', 'Creat.', 'Creatinina sérica'],
    'Ácido Úrico': ['Ac. Úrico', 'Ácido úrico', 'AU'],

    // ── Perfil Lipídico ──
    'Colesterol Total': ['Col. Total', 'CT', 'Colesterol', 'Col Total'],
    'HDL': ['Colesterol HDL', 'HDL-C', 'Col. HDL', 'C-HDL'],
    'LDL': ['Colesterol LDL', 'LDL-C', 'Col. LDL', 'C-LDL'],
    'VLDL': ['Colesterol VLDL', 'VLDL-C', 'Col. VLDL'],
    'Triglicéridos': ['TG', 'Trigl', 'Triglic', 'Trigliceridos'],

    // ── Perfil Hepático ──
    'TGO/AST': ['AST', 'TGO', 'GOT', 'Aspartato Aminotransferasa', 'SGOT'],
    'TGP/ALT': ['ALT', 'TGP', 'GPT', 'Alanina Aminotransferasa', 'SGPT'],
    'Fosfatasa Alcalina': ['FA', 'ALP', 'Fosf. Alcalina'],
    'GGT': ['Gamma-GT', 'γ-GT', 'GGT', 'Gamma Glutamil Transferasa'],
    'Bilirrubina Total': ['BT', 'Bili Total', 'Bilirrubinas'],
    'Bilirrubina Directa': ['BD', 'Bili Directa'],
    'Bilirrubina Indirecta': ['BI', 'Bili Indirecta'],
    'LDH': ['Lactato Deshidrogenasa', 'Deshidrogenasa Láctica'],
    'Proteínas Totales': ['PT', 'Prot. Totales'],
    'Albúmina': ['Alb', 'Album.'],
    'Globulina': ['Glob'],

    // ── EGO (Examen General de Orina) ──
    'Color (Orina)': ['Color'],
    'Aspecto (Orina)': ['Aspecto'],
    'Densidad (Orina)': ['Densidad', 'Gravedad Específica'],
    'pH (Orina)': ['pH'],
    'Glucosa (Orina)': [],
    'Proteínas (Orina)': ['Proteínas'],
    'Sangre (Orina)': ['Sangre', 'Hemoglobina (Orina)'],
    'Cuerpos Cetónicos': ['Cetonas', 'Acetona'],
    'Bilirrubina (Orina)': [],
    'Urobilinógeno': [],
    'Nitritos': [],
    'Esterasa Leucocitaria': ['Esterasa L.'],
    'Células Epiteliales': ['Cel. Epiteliales'],
    'Leucocitos (Orina)': [],
    'Bacterias': [],
    'Eritrocitos (Orina)': [],
    'Cristales': ['Cristales CaOx dihidratado', 'Cristales de oxalato de calcio'],
    'Uratos amorfos': ['Uratos'],
    'Cilindros': [],
    'Piocitos': [],
    'Filamentos de Mucina': ['Mucina'],
    'Levaduras': [],

    // ── Espirometría ──
    'FVC': ['CVF', 'Capacidad Vital Forzada', 'FVC (L)'],
    'FEV1': ['VEF1', 'FEV 1', 'Vol. Esp. Forzado 1s', 'FEV₁', 'FEV1 (L)'],
    'FEV1/FVC': ['Índice de Tiffeneau', 'Relación FEV1/FVC', 'VEF1/CVF', 'Tiffeneau', 'FEV1/FVC ratio'],
    'FEF25-75': ['FEF 25-75', 'MMEF', 'FEF25-75%', 'Flujo Mesoespiratorio', 'Flujo Meso-espiratorio', 'FEF 25-75%'],
    'PEF': ['FEM', 'Flujo Espiratorio Pico', 'Peak Flow', 'Flujo Pico'],
    'FET': ['Tiempo Espiratorio Forzado', 'Forced Expiratory Time'],

    // ── ECG ──
    'Frecuencia Cardiaca': ['FC', 'Heart Rate', 'Freq. Card.', 'Frecuencia cardiaca (FC)'],
    'Intervalo RR': ['RR', 'R-R'],
    'Duración P': ['Onda P', 'P wave'],
    'Intervalo PR': ['PQ', 'PQ(PR)', 'PR', 'Intervalo PQ (PR)'],
    'Duración QRS': ['QRS', 'Complejo QRS'],
    'Intervalo QT': ['QT'],
    'QTc': ['QTc(Baz)', 'QTc Bazett', 'QT corregido', 'QTc (Bazett)'],
    'Eje P': ['Eje de P'],
    'Eje QRS': ['Eje de QRS'],
    'Eje T': ['Eje de T'],

    // ── Radiografía ──
    'Índice de Exposición': ['EI', 'Exposure Index', 'I.E.', 'Índice de exposición (EI)'],
    'Tiempo de exposición': ['ms', 'Tiempo de exposición (ms)'],
    'Carga del tubo': ['mAs', 'Milliamperios-segundo', 'Carga de exposición (mAs)', 'Carga del tubo (mAs)'],

    // ── Signos Vitales / Historia Clínica ──
    'Tensión Arterial': ['TA', 'PA', 'Presión Arterial', 'Blood Pressure'],
    'Frecuencia Respiratoria': ['FR', 'Resp Rate'],
    'Saturación O2': ['SpO2', 'SatO2', 'Saturación de O2', 'Sat O2'],
    'Temperatura': ['Temp', 'T°', 'T °C'],
    'Peso': ['Peso corporal', 'Weight'],
    'Talla': ['Estatura', 'Height', 'Talla corporal'],
    'IMC': ['BMI', 'Índice de Masa Corporal', 'Body Mass Index'],
};

// Build reverse lookup: variant → canonical name
const _synonymLookup = new Map<string, string>();
for (const [canonical, variants] of Object.entries(SYNONYMS)) {
    _synonymLookup.set(canonical.toLowerCase(), canonical);
    for (const v of variants) {
        _synonymLookup.set(v.toLowerCase(), canonical);
    }
}

// ══════════════════════════════════════════════════════════
// 2. ESTANDARIZACIÓN DE UNIDADES
// ══════════════════════════════════════════════════════════

const UNIT_NORMALIZATION: Record<string, string> = {
    'gr/dL': 'g/dL', 'gr/dl': 'g/dL', 'g/dl': 'g/dL', 'gm/dl': 'g/dL', 'gm/dL': 'g/dL',
    'mg/dl': 'mg/dL', 'MG/DL': 'mg/dL', 'Mg/dL': 'mg/dL',
    'mill/uL': 'millones/µL', 'millones/ul': 'millones/µL', 'M/uL': 'millones/µL', 'millones/uL': 'millones/µL',
    'x10^3/mm3': '×10³/mm³', 'x 10^3/mm3': '×10³/mm³', '10^3/mm3': '×10³/mm³', 'x10³/mm³': '×10³/mm³',
    'fl': 'fL', 'FL': 'fL', 'femtolitros': 'fL',
    'pg': 'pg', 'PG': 'pg', 'picogramos': 'pg',
    'lpm': 'lpm', 'bpm': 'lpm', 'lat/min': 'lpm', 'latidos/min': 'lpm',
    'rpm': 'rpm', 'resp/min': 'rpm',
    'º': '°', 'grados': '°', 'deg': '°',
    'dB': 'dB HL', 'dbHL': 'dB HL', 'dBHL': 'dB HL', 'db HL': 'dB HL', 'db': 'dB HL',
    'L/s': 'L/s', 'l/s': 'L/s', 'Lt/seg': 'L/s', 'lt/s': 'L/s',
    'L': 'L', 'l': 'L', 'Lt': 'L', 'litros': 'L', 'lts': 'L',
    's': 's', 'seg': 's', 'segundos': 's', 'sec': 's',
    'kg/m2': 'kg/m²', 'kg/m²': 'kg/m²',
    'kgs': 'kg', 'Kg': 'kg', 'KG': 'kg', 'kilos': 'kg', 'kilogramos': 'kg',
    'mts': 'm', 'cms': 'cm', 'cm': 'cm',
    'mm/sec': 'mm/s', 'mm/seg': 'mm/s',
    'mm/mV': 'mm/mV',
    'N/A': '', 'n/a': '', '-': '',
    'mmHg': 'mmHg', 'MMHG': 'mmHg',
    'E.U./dL': 'E.U./dL',
    'por campo': '/campo',
};

// ══════════════════════════════════════════════════════════
// 3. LÍMITES FISIOLÓGICOS (Detección OCR)
// ══════════════════════════════════════════════════════════
// Si un valor cae fuera de estos rangos "humanamente posibles", es probablemente un error

const PHYSIOLOGICAL_LIMITS: Record<string, { min: number; max: number; unit: string }> = {
    'Hemoglobina': { min: 3, max: 25, unit: 'g/dL' },
    'Hematocrito': { min: 10, max: 70, unit: '%' },
    'Eritrocitos': { min: 1, max: 8, unit: 'millones/µL' },
    'Leucocitos': { min: 1, max: 50, unit: '×10³/mm³' },
    'Plaquetas': { min: 10, max: 1000, unit: '×10³/mm³' },
    'VCM': { min: 50, max: 150, unit: 'fL' },
    'HCM': { min: 15, max: 50, unit: 'pg' },
    'CMHC': { min: 20, max: 50, unit: 'g/dL' },
    'Glucosa': { min: 20, max: 800, unit: 'mg/dL' },
    'Creatinina': { min: 0.1, max: 30, unit: 'mg/dL' },
    'Urea': { min: 5, max: 300, unit: 'mg/dL' },
    'BUN': { min: 2, max: 150, unit: 'mg/dL' },
    'Colesterol Total': { min: 50, max: 500, unit: 'mg/dL' },
    'Triglicéridos': { min: 20, max: 2000, unit: 'mg/dL' },
    'Frecuencia Cardiaca': { min: 20, max: 300, unit: 'lpm' },
    'Frecuencia Respiratoria': { min: 5, max: 60, unit: 'rpm' },
    'Saturación O2': { min: 50, max: 100, unit: '%' },
    'Temperatura': { min: 30, max: 45, unit: '°C' },
    'Peso': { min: 20, max: 300, unit: 'kg' },
    'Talla': { min: 0.5, max: 2.5, unit: 'm' },
    'IMC': { min: 10, max: 80, unit: 'kg/m²' },
    'FVC': { min: 0.3, max: 10, unit: 'L' },
    'FEV1': { min: 0.2, max: 8, unit: 'L' },
    'FEV1/FVC': { min: 0.2, max: 1.1, unit: '' },
    'PEF': { min: 1, max: 20, unit: 'L/s' },
};

// ══════════════════════════════════════════════════════════
// 4. TIPO DE ESTUDIO POR CATEGORÍA/PARÁMETRO
// ══════════════════════════════════════════════════════════

const TIPO_ESTUDIO_MAP: Record<string, string> = {
    'Biometría Hemática': 'laboratorio',
    'Fórmula Blanca': 'laboratorio',
    'Química Sanguínea': 'laboratorio',
    'Perfil Lipídico': 'laboratorio',
    'Perfil Hepático': 'laboratorio',
    'Examen General de Orina': 'laboratorio',
    'EGO': 'laboratorio',
    'Electrolitos': 'laboratorio',
    'Coagulación': 'laboratorio',
    'Marcadores': 'laboratorio',
    'Audiometría': 'audiometria',
    'Espirometría': 'espirometria',
    'ECG': 'ecg',
    'Electrocardiograma': 'ecg',
    'Radiografía': 'radiografia',
    'Rayos X': 'radiografia',
    'Optometría': 'optometria',
    'Signos Vitales': 'historia_clinica',
    'Historia Clínica': 'historia_clinica',
    'Aptitud': 'aptitud',
};

// Map parámetro → tipo_estudio (for those that don't have a category)
const PARAM_TIPO_MAP: Record<string, string> = {
    'FVC': 'espirometria', 'FEV1': 'espirometria', 'FEV1/FVC': 'espirometria',
    'FEF25-75': 'espirometria', 'PEF': 'espirometria', 'FET': 'espirometria',
    'Frecuencia Cardiaca': 'ecg', 'Intervalo RR': 'ecg', 'Duración P': 'ecg',
    'Intervalo PR': 'ecg', 'Duración QRS': 'ecg', 'Intervalo QT': 'ecg',
    'QTc': 'ecg', 'Eje P': 'ecg', 'Eje QRS': 'ecg', 'Eje T': 'ecg',
    'Índice de Exposición': 'radiografia', 'Carga del tubo': 'radiografia',
    'Tensión Arterial': 'historia_clinica', 'Peso': 'historia_clinica',
    'Talla': 'historia_clinica', 'IMC': 'historia_clinica',
};

// ══════════════════════════════════════════════════════════
// 5. FUNCIONES DE NORMALIZACIÓN
// ══════════════════════════════════════════════════════════

/** Resolve a parameter name to its canonical form */
export function resolveParameterName(rawName: string): { canonical: string; wasResolved: boolean } {
    const trimmed = rawName.trim();
    const lookup = _synonymLookup.get(trimmed.toLowerCase());
    if (lookup) return { canonical: lookup, wasResolved: lookup.toLowerCase() !== trimmed.toLowerCase() };

    // Try partial match: strip common prefixes/suffixes
    const simplified = trimmed
        .replace(/\s*\(.*?\)\s*/g, '')  // Remove parenthetical
        .replace(/\s+/g, ' ')           // Normalize spaces
        .trim();
    const lookupSimplified = _synonymLookup.get(simplified.toLowerCase());
    if (lookupSimplified) return { canonical: lookupSimplified, wasResolved: true };

    // No match found — keep original
    return { canonical: trimmed, wasResolved: false };
}

/** Normalize a unit string */
export function normalizeUnit(rawUnit: string): string {
    if (!rawUnit) return '';
    const trimmed = rawUnit.trim();
    return UNIT_NORMALIZATION[trimmed] ?? trimmed;
}

/** Parse a numeric result from text */
export function parseNumericResult(resultado: string): number | null {
    if (!resultado) return null;
    const cleaned = resultado.toString().trim()
        .replace(/[*]/g, '')          // Remove asterisks
        .replace(/,/g, '.')           // Comma → dot
        .replace(/\s+/g, '')          // Remove spaces
        .replace(/[<>≤≥]/g, '')       // Remove comparison operators
        .replace(/^[^\d.-]+/, '')     // Remove leading non-numeric
        .replace(/[^\d.-]+$/, '');    // Remove trailing non-numeric

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/** Parse reference range text into min/max */
export function parseRangeText(rangoText: string | undefined): { min: number | null; max: number | null; texto: string | null } {
    if (!rangoText || rangoText === '-') return { min: null, max: null, texto: null };
    const trimmed = rangoText.trim();

    // Pattern: "70 - 100" or "70.0 - 100.0"
    const rangeMatch = trimmed.match(/^([\d.]+)\s*[-–—]\s*([\d.]+)$/);
    if (rangeMatch) {
        return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]), texto: null };
    }

    // Pattern: ">4.15" or "≥3.44"
    const gtMatch = trimmed.match(/^[>≥]\s*([\d.]+)$/);
    if (gtMatch) return { min: parseFloat(gtMatch[1]), max: null, texto: null };

    // Pattern: "<200" or "≤150"
    const ltMatch = trimmed.match(/^[<≤]\s*([\d.]+)$/);
    if (ltMatch) return { min: null, max: parseFloat(ltMatch[1]), texto: null };

    // Pattern: "0 - 25" with units
    const rangeUnitsMatch = trimmed.match(/^([\d.]+)\s*[-–—]\s*([\d.]+)\s+/);
    if (rangeUnitsMatch) {
        return { min: parseFloat(rangeUnitsMatch[1]), max: parseFloat(rangeUnitsMatch[2]), texto: null };
    }

    // Text-based reference (Negativo, Ausentes, etc.)
    return { min: null, max: null, texto: trimmed };
}

/** Check if a value is physiologically plausible */
export function checkPhysiologicalLimits(canonical: string, value: number): string | null {
    const limits = PHYSIOLOGICAL_LIMITS[canonical];
    if (!limits) return null;
    if (value < limits.min || value > limits.max) {
        return `⚠️ Valor ${value} fuera de rango fisiológico humano (${limits.min}-${limits.max} ${limits.unit}). Posible error OCR.`;
    }
    return null;
}

/** Determine tipo_estudio from category and parameter name */
export function detectTipoEstudio(categoria: string | undefined, parametro: string): string {
    if (categoria) {
        const tipo = TIPO_ESTUDIO_MAP[categoria];
        if (tipo) return tipo;
    }
    const tipo = PARAM_TIPO_MAP[parametro];
    if (tipo) return tipo;

    // Audiometry pattern detection
    if (/umbral|oído|oido|va\s|hz/i.test(parametro)) return 'audiometria';
    if (/radiograf|rx|tórax|torax|columna|lateral|ap\b|pa\b|proyecc/i.test(parametro)) return 'radiografia';

    return 'laboratorio'; // default
}

// ══════════════════════════════════════════════════════════
// 6. PIPELINE PRINCIPAL
// ══════════════════════════════════════════════════════════

/**
 * Normaliza un array de datos extraídos por IA.
 * Esta es la función principal del módulo.
 */
export function normalizeExtractedData(
    rawParams: RawExtractedParam[],
    documentType?: string
): NormalizationReport {
    let synonyms_resolved = 0;
    let units_fixed = 0;
    let ocr_alerts = 0;

    const params: NormalizedParam[] = rawParams.map(raw => {
        // 1. Normalizar nombre del parámetro
        const { canonical, wasResolved } = resolveParameterName(raw.parametro);
        if (wasResolved) synonyms_resolved++;

        // 2. Normalizar unidad
        const rawUnit = raw.unidad || '';
        const normalizedUnit = normalizeUnit(rawUnit);
        if (normalizedUnit !== rawUnit && rawUnit !== '') units_fixed++;

        // 3. Parsear resultado numérico
        const resultado_numerico = parseNumericResult(raw.resultado);

        // 4. Parsear rango de referencia
        const range = parseRangeText(raw.rango_referencia);

        // 5. Verificar límites fisiológicos
        let alerta_ocr: string | undefined;
        let confianza: 'alta' | 'media' | 'baja' | 'sospechosa' = 'alta';

        if (resultado_numerico !== null) {
            alerta_ocr = checkPhysiologicalLimits(canonical, resultado_numerico) || undefined;
            if (alerta_ocr) {
                confianza = 'sospechosa';
                ocr_alerts++;
            }
        }

        // 6. Detectar tipo de estudio
        const tipo_estudio = detectTipoEstudio(raw.categoria, canonical);

        // 7. Determinar categoría
        let categoria = raw.categoria || '';
        if (!categoria) {
            // Infer from tipo_estudio
            for (const [cat, tipo] of Object.entries(TIPO_ESTUDIO_MAP)) {
                if (tipo === tipo_estudio) { categoria = cat; break; }
            }
        }

        // 8. Build observation
        let observacion = raw.observacion || '';
        if (alerta_ocr && !observacion.includes('OCR')) {
            observacion = observacion ? `${observacion} | ${alerta_ocr}` : alerta_ocr;
        }

        return {
            parametro_nombre: canonical,
            parametro_original: raw.parametro,
            categoria,
            resultado: raw.resultado,
            resultado_numerico,
            unidad: normalizedUnit,
            rango_ref_min: range.min,
            rango_ref_max: range.max,
            rango_ref_texto: range.texto,
            observacion,
            tipo_estudio,
            confianza,
            alerta_ocr,
        };
    });

    // Detect overall document type
    const typeCounts: Record<string, number> = {};
    for (const p of params) {
        typeCounts[p.tipo_estudio] = (typeCounts[p.tipo_estudio] || 0) + 1;
    }
    const type_detected = documentType || Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'laboratorio';

    return {
        params,
        total_input: rawParams.length,
        total_output: params.length,
        synonyms_resolved,
        units_fixed,
        ocr_alerts,
        type_detected,
    };
}

/**
 * Groups normalized params by tipo_estudio for multi-document integration
 */
export function groupByTipoEstudio(params: NormalizedParam[]): Record<string, NormalizedParam[]> {
    const groups: Record<string, NormalizedParam[]> = {};
    for (const p of params) {
        if (!groups[p.tipo_estudio]) groups[p.tipo_estudio] = [];
        groups[p.tipo_estudio].push(p);
    }
    return groups;
}
