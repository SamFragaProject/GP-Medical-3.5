/**
 * documentExtractorService.ts — Compatibilidad con Motor Pro
 */
import { analyzeDocument, determineCategory, type StructuredMedicalData } from './geminiDocumentService'

export type DatosExtraidos = any;
export type ExtractionResult = {
    success: boolean;
    data: any;
    error?: string;
    processingTimeMs?: number;
};

export const documentExtractorService = {
    async extractFromFile(file: File): Promise<ExtractionResult> {
        const start = Date.now();
        try {
            const category = determineCategory(file.name);
            const rawData = await analyzeDocument(category as any, '', [file]);

            // Adapt to the legacy structure expected by Wizard & Markdown
            const adaptedData = adaptStructuredToFlat(rawData);

            return {
                success: true,
                data: adaptedData,
                processingTimeMs: Date.now() - start
            };
        } catch (err: any) {
            return {
                success: false,
                data: null,
                error: err.message,
                processingTimeMs: Date.now() - start
            };
        }
    },

    async extractFromMultipleFiles(files: File[]): Promise<{ mergedData: any }> {
        const results = await Promise.all(files.map(f => this.extractFromFile(f)));

        // Merge the already adapted flat results
        const merged: any = {
            _confianza: 95,
            _campos_encontrados: [],
            _campos_faltantes: []
        };

        results.forEach(r => {
            if (r.success && r.data) {
                // Merge patient scalars (take first available)
                ['nombre', 'apellido_paterno', 'apellido_materno', 'genero', 'fecha_nacimiento', 'edad', 'curp', 'nss', 'rfc', 'empresa_nombre', 'puesto'].forEach(key => {
                    if (r.data[key] && !merged[key]) merged[key] = r.data[key];
                });

                // Merge complex modules
                ['signos_vitales', 'audiometria', 'espirometria', 'laboratorio', 'radiografia', 'exploracion_fisica'].forEach(mod => {
                    if (r.data[mod]) {
                        merged[mod] = { ...(merged[mod] || {}), ...r.data[mod] };
                    }
                });

                // Arrays like results might still be useful
                if (r.data.results) {
                    merged.results = [...(merged.results || []), ...r.data.results];
                }

                if (r.data.alergias) merged.alergias = (merged.alergias ? merged.alergias + '\n' : '') + r.data.alergias;
                if (r.data.antecedentes_personales) merged.antecedentes_personales = (merged.antecedentes_personales ? merged.antecedentes_personales + '\n' : '') + r.data.antecedentes_personales;
                if (r.data.antecedentes_familiares) merged.antecedentes_familiares = (merged.antecedentes_familiares ? merged.antecedentes_familiares + '\n' : '') + r.data.antecedentes_familiares;
                if (r.data.dictamen_aptitud) merged.dictamen_aptitud = r.data.dictamen_aptitud;
            }
        });

        return { mergedData: merged };
    },

    async extractFilesFromZip(zipFile: File): Promise<File[]> {
        return []
    }
}

// ============================================
// ADAPTER: StructuredMedicalData -> Legacy Flat Data
// ============================================
function adaptStructuredToFlat(data: StructuredMedicalData): DatosExtraidos {
    const flat: Record<string, any> = {
        _confianza: 95,
        _campos_encontrados: [],
        _campos_faltantes: [],
        results: data.results || []
    };

    // 1. Patient Data
    if (data.patientData) {
        if (data.patientData.name) {
            const parts = data.patientData.name.trim().split(/\s+/);
            if (parts.length >= 3) {
                flat.nombre = parts.slice(0, parts.length - 2).join(' ');
                flat.apellido_paterno = parts[parts.length - 2];
                flat.apellido_materno = parts[parts.length - 1];
            } else if (parts.length === 2) {
                flat.nombre = parts[0];
                flat.apellido_paterno = parts[1];
            } else {
                flat.nombre = data.patientData.name;
            }
        }
        if (data.patientData.birthDate) flat.fecha_nacimiento = data.patientData.birthDate;
        if (data.patientData.age) flat.edad = data.patientData.age;
        if (data.patientData.gender) flat.genero = data.patientData.gender;
    }

    // Map helpers
    const getVal = (name: string) => {
        const r = data.results.find(r => r.name?.toUpperCase() === name.toUpperCase());
        return r && r.value != null ? r.value : undefined;
    };

    // 2. Personal/Laboral Fields
    const curp = getVal('CURP'); if (curp) flat.curp = curp;
    const nss = getVal('NSS'); if (nss) flat.nss = nss;
    const rfc = getVal('RFC'); if (rfc) flat.rfc = rfc;
    const empresa = getVal('EMPRESA'); if (empresa) flat.empresa_nombre = empresa;
    const puesto = getVal('PUESTO'); if (puesto) flat.puesto = puesto;

    // 3. Signos Vitales
    const svPeso = getVal('PESO') || getVal('PESO_KG');
    const svTalla = getVal('TALLA') || getVal('TALLA_CM');
    const svImc = getVal('IMC');
    const svTa = getVal('PRESION_ARTERIAL') || getVal('TENSION_ARTERIAL');
    const svFc = getVal('FRECUENCIA_CARDIACA');
    const svFr = getVal('FRECUENCIA_RESPIRATORIA');
    const svTemp = getVal('TEMPERATURA');
    const svSpo2 = getVal('SATURACION_O2') || getVal('SPO2');

    if (svPeso || svTalla || svTa || svFc) {
        flat.signos_vitales = {};
        if (svPeso) flat.signos_vitales.peso_kg = svPeso;
        if (svTalla) flat.signos_vitales.talla_cm = svTalla;
        if (svImc) flat.signos_vitales.imc = svImc;
        if (svFc) flat.signos_vitales.frecuencia_cardiaca = svFc;
        if (svFr) flat.signos_vitales.frecuencia_respiratoria = svFr;
        if (svTemp) flat.signos_vitales.temperatura = svTemp;
        if (svSpo2) flat.signos_vitales.saturacion_o2 = svSpo2;

        if (svTa && typeof svTa === 'string' && svTa.includes('/')) {
            const [sys, dia] = svTa.split('/');
            flat.signos_vitales.presion_sistolica = sys.trim();
            flat.signos_vitales.presion_diastolica = dia.trim();
        }
    }

    // 4. Audiometria
    const audResults = data.results.filter(r => r.category?.toLowerCase() === 'audiometría');
    if (audResults.length > 0) {
        flat.audiometria = { oido_derecho: {}, oido_izquierdo: {} };
        audResults.forEach(r => {
            if (r.name.startsWith('UMBRAL_OD_')) {
                const freq = r.name.replace('UMBRAL_OD_', '');
                flat.audiometria.oido_derecho[freq] = r.value;
            } else if (r.name.startsWith('UMBRAL_OI_')) {
                const freq = r.name.replace('UMBRAL_OI_', '');
                flat.audiometria.oido_izquierdo[freq] = r.value;
            } else if (r.name === 'PTA_OD') {
                flat.audiometria.pta_derecho = r.value;
            } else if (r.name === 'PTA_OI') {
                flat.audiometria.pta_izquierdo = r.value;
            }
        });
        if (data.summary) flat.audiometria.diagnostico = data.summary;
    }

    // 5. Espirometria
    const espResults = data.results.filter(r => r.category?.toLowerCase() === 'espirometría');
    if (espResults.length > 0) {
        flat.espirometria = {};
        const fvc = getVal('FVC') || getVal('FVC_L'); if (fvc) flat.espirometria.fvc = fvc;
        const fev1 = getVal('FEV1') || getVal('FEV1_L'); if (fev1) flat.espirometria.fev1 = fev1;
        const fev1_fvc = getVal('FEV1_FVC') || getVal('FEV1_FVC_PORC_PRED'); if (fev1_fvc) flat.espirometria.fev1_fvc = fev1_fvc;
        const patron = getVal('PATRON_ESPIROMETRICO') || data.summary;
        if (patron) flat.espirometria.patron = patron;
        if (data.summary) flat.espirometria.diagnostico = data.summary;
    }

    // 6. Laboratorio
    const labResults = data.results.filter(r => r.category?.toLowerCase() === 'laboratorio' || r.category?.toLowerCase() === 'biometría hemática' || r.category?.toLowerCase() === 'química sanguínea');
    if (labResults.length > 0) {
        flat.laboratorio = {};
        const hb = getVal('HEMOGLOBINA'); if (hb) flat.laboratorio.hemoglobina = hb;
        const hct = getVal('HEMATOCRITO'); if (hct) flat.laboratorio.hematocrito = hct;
        const glu = getVal('GLUCOSA'); if (glu) flat.laboratorio.glucosa = glu;
        const leu = getVal('LEUCOCITOS'); if (leu) flat.laboratorio.leucocitos = leu;
        const plt = getVal('PLAQUETAS'); if (plt) flat.laboratorio.plaquetas = plt;

        flat.laboratorio.otros = {};
        labResults.forEach(r => {
            if (!['HEMOGLOBINA', 'HEMATOCRITO', 'GLUCOSA', 'LEUCOCITOS', 'PLAQUETAS'].includes(r.name)) {
                flat.laboratorio.otros[r.name.replace(/_/g, ' ')] = `${r.value} ${r.unit || ''}`.trim();
            }
        });
    }

    // 7. Radiografia
    const rxResults = data.results.filter(r => r.category?.toLowerCase() === 'rayos x');
    if (rxResults.length > 0) {
        flat.radiografia = {};
        const hallazgos = getVal('HALLAZGOS') || data.summary; if (hallazgos) flat.radiografia.hallazgos = hallazgos;
        const oit = getVal('CLASIFICACION_OIT'); if (oit) flat.radiografia.clasificacion_oit = oit;
        if (data.summary) flat.radiografia.impresion_diagnostica = data.summary;
    }

    // 8. Clínica - Antecedentes / Exploración
    const appat = data.results.filter(r => r.category?.toLowerCase() === 'antecedentes patológicos');
    if (appat.length > 0) {
        flat.antecedentes_personales = appat.map(r => `${r.name}: ${r.value}${r.description ? ` (${r.description})` : ''}`).join('\n');
    }
    const ahf = data.results.filter(r => r.category?.toLowerCase() === 'ahf');
    if (ahf.length > 0) {
        flat.antecedentes_familiares = ahf.map(r => `${r.name}: ${r.value}${r.description ? ` (${r.description})` : ''}`).join('\n');
    }

    // Dictamen
    const aptitud = getVal('APTITUD_LABORAL');
    if (aptitud) {
        if (aptitud.toLowerCase().includes('no apto') || aptitud.toLowerCase().includes('no_apto')) {
            flat.dictamen_aptitud = 'no_apto';
        } else if (aptitud.toLowerCase().includes('restricci')) {
            flat.dictamen_aptitud = 'apto_con_restricciones';
        } else {
            flat.dictamen_aptitud = 'apto';
        }
    }

    return flat;
}

