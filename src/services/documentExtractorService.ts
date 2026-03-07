/**
 * documentExtractorService.ts — Compatibilidad con Motor Pro
 * Detecta espirometría y usa SpiroClone pipeline automáticamente.
 */
import { analyzeDocument, analyzeSpirometryDirect, determineCategory, type StructuredMedicalData } from './geminiDocumentService'

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

            // ══ ESPIROMETRÍA: Usar SpiroClone pipeline directamente ══
            if (category === 'espirometria') {
                const spiroData = await analyzeSpirometryDirect('', [file]);
                const adaptedData = adaptSpiroCloneToFlat(spiroData);
                return {
                    success: true,
                    data: { ...adaptedData, _spiroclone_raw: spiroData },
                    processingTimeMs: Date.now() - start
                };
            }

            // ══ OTROS ESTUDIOS: Pipeline genérico ══
            const rawData = await analyzeDocument(category as any, '', [file]);
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

        const merged: any = {
            _confianza: 95,
            _campos_encontrados: [],
            _campos_faltantes: []
        };

        results.forEach(r => {
            if (r.success && r.data) {
                ['nombre', 'apellido_paterno', 'apellido_materno', 'genero', 'fecha_nacimiento', 'edad', 'curp', 'nss', 'rfc', 'empresa_nombre', 'puesto'].forEach(key => {
                    if (r.data[key] && !merged[key]) merged[key] = r.data[key];
                });

                ['signos_vitales', 'audiometria', 'espirometria', 'laboratorio', 'radiografia', 'exploracion_fisica'].forEach(mod => {
                    if (r.data[mod]) {
                        merged[mod] = { ...(merged[mod] || {}), ...r.data[mod] };
                    }
                });

                if (r.data.results) {
                    merged.results = [...(merged.results || []), ...r.data.results];
                }
                if (r.data._spiroclone_raw) {
                    merged._spiroclone_raw = r.data._spiroclone_raw;
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

// ════════════════════════════════════════════════
// ADAPTER: SpiroClone Data -> Legacy Flat Data
// ════════════════════════════════════════════════
function adaptSpiroCloneToFlat(spiro: any): DatosExtraidos {
    const flat: Record<string, any> = {
        _confianza: 95,
        _campos_encontrados: [],
        _campos_faltantes: [],
    };

    // Parsear nombre
    if (spiro.patient?.name) {
        const parsed = parsePatientName(spiro.patient.name);
        flat.nombre = parsed.nombre;
        flat.apellido_paterno = parsed.apellido_paterno;
        flat.apellido_materno = parsed.apellido_materno;
    }

    // Datos demográficos
    if (spiro.patient?.dob) flat.fecha_nacimiento = spiro.patient.dob;
    if (spiro.patient?.age) flat.edad = spiro.patient.age;
    if (spiro.patient?.sex) flat.genero = spiro.patient.sex.toLowerCase() === 'masculino' ? 'masculino' : 'femenino';
    if (spiro.patient?.id) flat.numero_empleado = spiro.patient.id.replace('#', '');

    // Espirometría completa
    flat.espirometria = {};
    if (spiro.results?.length > 0) {
        const getParam = (name: string) => spiro.results.find((r: any) =>
            r.parameter?.toUpperCase().startsWith(name.toUpperCase())
        );
        const fvc = getParam('FVC');
        const fev1 = getParam('FEV1 ');
        const ratio = getParam('FEV1/FVC');

        if (fvc?.mejor) flat.espirometria.fvc = parseFloat(String(fvc.mejor).replace('*', '')) || fvc.mejor;
        if (fev1?.mejor) flat.espirometria.fev1 = parseFloat(String(fev1.mejor).replace('*', '')) || fev1.mejor;
        if (ratio?.mejor) flat.espirometria.fev1_fvc = parseFloat(String(ratio.mejor).replace('*', '')) || ratio.mejor;
        if (fvc?.percentPred) flat.espirometria.fvc_porcentaje = fvc.percentPred;
        if (fev1?.percentPred) flat.espirometria.fev1_porcentaje = fev1.percentPred;
    }

    if (spiro.session?.interpretation) flat.espirometria.patron = spiro.session.interpretation;
    if (spiro.doctor?.notes) flat.espirometria.diagnostico = spiro.doctor.notes;
    if (spiro.doctor?.name) flat.espirometria.medico = spiro.doctor.name;

    // Signos vitales
    if (spiro.patient?.height || spiro.patient?.weight) {
        flat.signos_vitales = {};
        if (spiro.patient.height) flat.signos_vitales.talla_cm = spiro.patient.height.replace(/[^\d.]/g, '');
        if (spiro.patient.weight) flat.signos_vitales.peso_kg = spiro.patient.weight.replace(/[^\d.]/g, '');
        if (spiro.patient.bmi) flat.signos_vitales.imc = spiro.patient.bmi;
    }

    return flat;
}

// ════════════════════════════════════════════════
// PARSEO INTELIGENTE DE NOMBRES MEXICANOS
// Soporta: "APELLIDO APELLIDO, NOMBRE(S)" y "NOMBRE APELLIDO APELLIDO"
// ════════════════════════════════════════════════
function parsePatientName(fullName: string): { nombre: string; apellido_paterno: string; apellido_materno: string } {
    const trimmed = fullName.trim();

    // Formato con coma: "URIBE LOPEZ, FEDERICO" → apellidos antes de coma, nombre después
    if (trimmed.includes(',')) {
        const [apellidoPart, nombrePart] = trimmed.split(',').map(s => s.trim());
        const apellidos = apellidoPart.split(/\s+/);
        return {
            nombre: nombrePart || '',
            apellido_paterno: apellidos[0] || '',
            apellido_materno: apellidos.slice(1).join(' ') || ''
        };
    }

    // Sin coma: "FEDERICO URIBE LOPEZ" → último materno, penúltimo paterno, resto nombre
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
        return {
            nombre: parts.slice(0, parts.length - 2).join(' '),
            apellido_paterno: parts[parts.length - 2],
            apellido_materno: parts[parts.length - 1]
        };
    } else if (parts.length === 2) {
        return { nombre: parts[0], apellido_paterno: parts[1], apellido_materno: '' };
    }
    return { nombre: trimmed, apellido_paterno: '', apellido_materno: '' };
}

// ============================================
// ADAPTER: StructuredMedicalData -> Legacy Flat Data (otros estudios)
// ============================================
function adaptStructuredToFlat(data: StructuredMedicalData): DatosExtraidos {
    const flat: Record<string, any> = {
        _confianza: 95,
        _campos_encontrados: [],
        _campos_faltantes: [],
        results: data.results || []
    };

    // 1. Patient Data — usando parser inteligente
    if (data.patientData?.name) {
        const parsed = parsePatientName(data.patientData.name);
        flat.nombre = parsed.nombre;
        flat.apellido_paterno = parsed.apellido_paterno;
        flat.apellido_materno = parsed.apellido_materno;
    }
    if (data.patientData?.birthDate) flat.fecha_nacimiento = data.patientData.birthDate;
    if (data.patientData?.age) flat.edad = data.patientData.age;
    if (data.patientData?.gender) flat.genero = data.patientData.gender;

    const getVal = (name: string) => {
        const r = data.results.find(r => r.name?.toUpperCase() === name.toUpperCase());
        return r && r.value != null ? r.value : undefined;
    };

    // 2. Personal/Laboral
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
            if (r.name.startsWith('UMBRAL_OD_')) { flat.audiometria.oido_derecho[r.name.replace('UMBRAL_OD_', '')] = r.value; }
            else if (r.name.startsWith('UMBRAL_OI_')) { flat.audiometria.oido_izquierdo[r.name.replace('UMBRAL_OI_', '')] = r.value; }
            else if (r.name === 'PTA_OD') { flat.audiometria.pta_derecho = r.value; }
            else if (r.name === 'PTA_OI') { flat.audiometria.pta_izquierdo = r.value; }
        });
        if (data.summary) flat.audiometria.diagnostico = data.summary;
    }

    // 5. Espirometria
    const espResults = data.results.filter(r => r.category?.toLowerCase() === 'espirometría');
    if (espResults.length > 0) {
        flat.espirometria = {};
        const fvc = getVal('FVC') || getVal('FVC_L'); if (fvc) flat.espirometria.fvc = fvc;
        const fev1 = getVal('FEV1') || getVal('FEV1_L'); if (fev1) flat.espirometria.fev1 = fev1;
        const fev1_fvc = getVal('FEV1_FVC'); if (fev1_fvc) flat.espirometria.fev1_fvc = fev1_fvc;
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

    // 8. Clínica
    const appat = data.results.filter(r => r.category?.toLowerCase() === 'antecedentes patológicos');
    if (appat.length > 0) {
        flat.antecedentes_personales = appat.map(r => `${r.name}: ${r.value}${r.description ? ` (${r.description})` : ''}`).join('\n');
    }
    const ahf = data.results.filter(r => r.category?.toLowerCase() === 'ahf');
    if (ahf.length > 0) {
        flat.antecedentes_familiares = ahf.map(r => `${r.name}: ${r.value}${r.description ? ` (${r.description})` : ''}`).join('\n');
    }

    const aptitud = getVal('APTITUD_LABORAL');
    if (aptitud) {
        if (aptitud.toLowerCase().includes('no apto') || aptitud.toLowerCase().includes('no_apto')) flat.dictamen_aptitud = 'no_apto';
        else if (aptitud.toLowerCase().includes('restricci')) flat.dictamen_aptitud = 'apto_con_restricciones';
        else flat.dictamen_aptitud = 'apto';
    }

    return flat;
}
