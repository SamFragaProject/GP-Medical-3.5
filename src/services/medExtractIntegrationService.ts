/**
 * ============================================================
 * MedExtract Pro — Integration Service
 * Conecta los datos extraídos del wizard con Supabase
 * ============================================================
 *
 * Pipeline:
 * 1. Recibe datos extraídos + selección del usuario
 * 2. Normaliza con medicalNormalizer
 * 3. Agrupa por tipo de estudio
 * 4. Crea estudios_clinicos + resultados_estudio + graficas_estudio
 * 5. Auto-crea parámetros en parametros_catalogo si no existen
 */

import {
    normalizeExtractedData,
    groupByTipoEstudio,
    type RawExtractedParam,
    type NormalizedParam,
    type NormalizationReport,
} from '@/data/medicalNormalizer';
import {
    crearEstudioConResultados,
    agregarGrafica,
    agregarParametroCatalogo,
    getCatalogo,
    type TipoEstudio,
} from '@/services/estudiosService';

// ── Tipos de entrada ──

export interface ExtractedResult {
    fileName: string;
    fileType: string;
    structuredData?: {
        paciente?: string;
        fecha?: string;
        tipo_documento?: string;
        datos_estructurados: RawExtractedParam[];
        datos_graficas?: Array<{
            titulo?: string;
            eje_x_label?: string;
            eje_y_label?: string;
            puntos?: Array<{ x: string; y: string }>;
            x?: string;
            y?: string;
        }>;
        interpretacion_general?: string;
    };
}

export interface IntegrationRequest {
    pacienteId: string;
    results: ExtractedResult[];
    selectedParams: Set<string>;    // Keys like "0-Hemoglobina"
    allParams: RawExtractedParam[]; // Flat list of all params
}

export interface IntegrationResult {
    success: boolean;
    estudiosCreados: number;
    parametrosIntegrados: number;
    graficasCreadas: number;
    parametrosCatalogoCreados: number;
    normalizationReport: NormalizationReport;
    errores: string[];
    detalles: Array<{
        tipoEstudio: string;
        estudioId: string;
        parametros: number;
        graficas: number;
        archivo: string;
    }>;
}

// ══════════════════════════════════════════════════════════
// INTEGRACIÓN PRINCIPAL
// ══════════════════════════════════════════════════════════

export async function integrarDatosExtraidos(req: IntegrationRequest): Promise<IntegrationResult> {
    const errores: string[] = [];
    let estudiosCreados = 0;
    let parametrosIntegrados = 0;
    let graficasCreadas = 0;
    let parametrosCatalogoCreados = 0;
    const detalles: IntegrationResult['detalles'] = [];

    // 1. Filter only selected params
    const selectedRawParams = req.allParams.filter((p, i) =>
        req.selectedParams.has(`${i}-${p.parametro}`)
    );

    if (selectedRawParams.length === 0) {
        return {
            success: false,
            estudiosCreados: 0,
            parametrosIntegrados: 0,
            graficasCreadas: 0,
            parametrosCatalogoCreados: 0,
            normalizationReport: {
                params: [], total_input: 0, total_output: 0,
                synonyms_resolved: 0, units_fixed: 0, ocr_alerts: 0,
                type_detected: 'unknown',
            },
            errores: ['No se seleccionaron parámetros para integrar'],
            detalles: [],
        };
    }

    // 2. Normalize all selected params
    const report = normalizeExtractedData(selectedRawParams);
    console.log('[MedExtract Integration] Normalización:', {
        input: report.total_input,
        output: report.total_output,
        synonyms: report.synonyms_resolved,
        units: report.units_fixed,
        ocr: report.ocr_alerts,
    });

    // 3. Auto-create missing catalog params
    const catalogoExistente = await getCatalogo();
    const catalogoSet = new Set(catalogoExistente.map(c => `${c.nombre}|${c.tipo_estudio}`));

    for (const p of report.params) {
        const key = `${p.parametro_nombre}|${p.tipo_estudio}`;
        if (!catalogoSet.has(key)) {
            try {
                const created = await agregarParametroCatalogo({
                    nombre: p.parametro_nombre,
                    nombre_display: p.parametro_nombre,
                    categoria: p.categoria,
                    tipo_estudio: p.tipo_estudio as TipoEstudio,
                    unidad: p.unidad,
                    rango_ref_min: p.rango_ref_min ?? undefined,
                    rango_ref_max: p.rango_ref_max ?? undefined,
                    rango_ref_texto: p.rango_ref_texto ?? undefined,
                    es_numerico: p.resultado_numerico !== null,
                });
                if (created) {
                    catalogoSet.add(key);
                    parametrosCatalogoCreados++;
                }
            } catch (e) {
                // If it already exists (race condition), that's okay
                console.warn(`[MedExtract] Catálogo ya existe: ${p.parametro_nombre}`);
            }
        }
    }

    // 4. Group by tipo_estudio
    const groups = groupByTipoEstudio(report.params);

    // 5. For each group, create estudio_clinico + resultados
    for (const [tipoEstudio, params] of Object.entries(groups)) {
        // Find the best source file for this study type
        const sourceResult = findBestSourceResult(req.results, tipoEstudio);
        const structured = sourceResult?.structuredData;

        try {
            const estudio = await crearEstudioConResultados(
                req.pacienteId,
                tipoEstudio as TipoEstudio,
                {
                    fecha_estudio: structured?.fecha || new Date().toISOString().split('T')[0],
                    archivo_origen: sourceResult?.fileName || 'MedExtract Pro',
                    interpretacion: structured?.interpretacion_general,
                    diagnostico: structured?.tipo_documento,
                    datos_extra: {
                        normalization: {
                            synonyms_resolved: params.filter(p => p.parametro_original !== p.parametro_nombre).length,
                            ocr_alerts: params.filter(p => p.alerta_ocr).length,
                        },
                    },
                },
                params.map(p => ({
                    parametro_nombre: p.parametro_nombre,
                    categoria: p.categoria,
                    resultado: p.resultado,
                    resultado_numerico: p.resultado_numerico,
                    unidad: p.unidad,
                    observacion: p.observacion,
                })),
            );

            if (estudio) {
                estudiosCreados++;
                parametrosIntegrados += params.length;

                // 6. Add gráficas for this study
                let graficasForStudy = 0;
                if (structured?.datos_graficas?.length) {
                    for (const g of structured.datos_graficas) {
                        if (!g.puntos?.length) continue;
                        try {
                            await agregarGrafica(estudio.id, {
                                titulo: g.titulo || 'Gráfica',
                                eje_x_label: g.eje_x_label,
                                eje_y_label: g.eje_y_label,
                                puntos: g.puntos,
                                tipo_grafica: detectGraficaTipo(tipoEstudio, g.titulo),
                            });
                            graficasCreadas++;
                            graficasForStudy++;
                        } catch (e) {
                            errores.push(`Error agregando gráfica "${g.titulo}": ${e}`);
                        }
                    }
                }

                detalles.push({
                    tipoEstudio,
                    estudioId: estudio.id,
                    parametros: params.length,
                    graficas: graficasForStudy,
                    archivo: sourceResult?.fileName || 'desconocido',
                });
            } else {
                errores.push(`Error creando estudio tipo "${tipoEstudio}"`);
            }
        } catch (e) {
            errores.push(`Error procesando grupo "${tipoEstudio}": ${e}`);
        }
    }

    return {
        success: errores.length === 0,
        estudiosCreados,
        parametrosIntegrados,
        graficasCreadas,
        parametrosCatalogoCreados,
        normalizationReport: report,
        errores,
        detalles,
    };
}

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

/** Find the best source result for a given study type */
function findBestSourceResult(results: ExtractedResult[], tipoEstudio: string): ExtractedResult | undefined {
    const typeKeywords: Record<string, string[]> = {
        laboratorio: ['laboratorio', 'lab', 'biometr', 'quimica', 'ego', 'orina', 'hemograma'],
        audiometria: ['audio', 'audiometr'],
        espirometria: ['espiro', 'espirometr'],
        ecg: ['ecg', 'electrocard', 'ekg'],
        radiografia: ['radio', 'rx', 'rayos', 'radiograf', 'tórax', 'columna'],
        optometria: ['opto', 'optomet', 'visual', 'agudeza'],
        historia_clinica: ['historia', 'clinic', 'explorac', 'signos'],
        aptitud: ['aptitud', 'apto', 'certificado'],
    };

    const keywords = typeKeywords[tipoEstudio] || [];

    // Try to find a result whose tipo_documento matches
    return results.find(r => {
        const tipo = (r.structuredData?.tipo_documento || '').toLowerCase();
        const fileName = r.fileName.toLowerCase();
        return keywords.some(kw => tipo.includes(kw) || fileName.includes(kw));
    }) || results[0]; // Fallback to first result
}

/** Detect the graph type based on study type */
function detectGraficaTipo(tipoEstudio: string, titulo?: string): string {
    const t = (titulo || '').toLowerCase();
    if (tipoEstudio === 'audiometria' || t.includes('audiograma') || t.includes('umbral')) return 'audiograma';
    if (t.includes('flujo-volumen') || t.includes('flow-volume')) return 'flujo_volumen';
    if (t.includes('volumen-tiempo') || t.includes('volume-time')) return 'volumen_tiempo';
    if (tipoEstudio === 'ecg' || t.includes('rr') || t.includes('beat')) return 'ecg_rr';
    return 'linea';
}
