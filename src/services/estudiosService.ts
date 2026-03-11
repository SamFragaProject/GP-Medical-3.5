/**
 * estudiosService.ts — Servicio central para estudios clínicos
 * 
 * ARQUITECTURA UNIFICADA:
 * - estudios_clinicos: Un registro por cada examen (lab, audio, espiro, ECG, etc.)
 * - resultados_estudio: Un registro por cada parámetro medido  
 * - parametros_catalogo: Catálogo maestro de todos los parámetros conocidos
 * - graficas_estudio: Datos de puntos para gráficas (audiograma, flujo-volumen, etc.)
 */
import { supabase } from '@/lib/supabase'

// ─── Tipos ───
export type TipoEstudio =
    | 'laboratorio' | 'audiometria' | 'espirometria'
    | 'electrocardiograma' | 'ecg' | 'optometria' | 'radiografia'
    | 'historia_clinica' | 'aptitud_laboral' | 'odontograma'

export type Bandera = 'normal' | 'alto' | 'bajo' | 'critico' | 'anormal'

export interface ParametroCatalogo {
    id: string
    nombre: string
    nombre_display: string
    categoria: string
    tipo_estudio: TipoEstudio
    unidad: string
    rango_ref_min: number | null
    rango_ref_max: number | null
    rango_ref_texto: string | null
    es_numerico: boolean
    activo: boolean
    orden: number
}

export interface EstudioClinico {
    id: string
    paciente_id: string
    tipo_estudio: TipoEstudio
    fecha_estudio: string
    archivo_origen?: string
    medico_responsable?: string
    cedula_medico?: string
    equipo?: string
    institucion: string
    interpretacion?: string
    diagnostico?: string
    clasificacion?: string
    calidad?: string
    datos_extra?: Record<string, any>
    created_at: string
    updated_at: string
}

export interface ResultadoEstudio {
    id: string
    estudio_id: string
    paciente_id: string
    parametro_id?: string
    parametro_nombre: string
    categoria?: string
    resultado: string
    resultado_numerico?: number | null
    unidad?: string
    rango_ref_min?: number | null
    rango_ref_max?: number | null
    rango_ref_texto?: string | null
    bandera: Bandera
    observacion?: string
    nombre_display?: string
    orden?: number
}

export interface GraficaEstudio {
    id: string
    estudio_id: string
    titulo: string
    eje_x_label?: string
    eje_y_label?: string
    puntos: Array<{ x: string; y: string }>
    tipo_grafica: string
}

export interface EstudioCompleto {
    estudio: EstudioClinico
    resultados: ResultadoEstudio[]
    graficas: GraficaEstudio[]
}

// ─── Cálculo de bandera ───

export function calcularBandera(
    resultado: string,
    resultado_numerico: number | null | undefined,
    rango_min: number | null | undefined,
    rango_max: number | null | undefined,
    rango_texto: string | null | undefined
): Bandera {
    if (resultado_numerico == null) {
        if (!rango_texto) return 'normal'
        const res = resultado.toLowerCase().trim()
        const ref = rango_texto.toLowerCase().trim()
        if (res === ref) return 'normal'
        return 'anormal'
    }
    if (rango_min == null && rango_max == null) return 'normal'
    const val = resultado_numerico
    if (rango_min != null && rango_max != null) {
        if (val >= rango_min && val <= rango_max) return 'normal'
        const rango = rango_max - rango_min
        if (val < rango_min - rango * 0.5 || val > rango_max + rango * 0.5) return 'critico'
        return val < rango_min ? 'bajo' : 'alto'
    }
    if (rango_min != null && val < rango_min) return 'bajo'
    if (rango_max != null && val > rango_max) return 'alto'
    return 'normal'
}

export const BANDERA_STYLES: Record<Bandera, { bg: string; text: string; dot: string; label: string; border: string }> = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Normal', border: 'border-emerald-200' },
    alto: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Alto', border: 'border-amber-200' },
    bajo: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Bajo', border: 'border-blue-200' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Crítico', border: 'border-red-200' },
    anormal: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Anormal', border: 'border-orange-200' },
}

// ─── Catálogo ───

export async function getCatalogo(tipoEstudio?: TipoEstudio): Promise<ParametroCatalogo[]> {
    let query = supabase
        .from('parametros_catalogo')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
    if (tipoEstudio) query = query.eq('tipo_estudio', tipoEstudio)
    const { data, error } = await query
    if (error) { console.error('getCatalogo error:', error); return [] }
    return data || []
}

export async function agregarParametroCatalogo(param: {
    nombre: string
    nombre_display: string
    categoria: string
    tipo_estudio: TipoEstudio
    unidad?: string
    rango_ref_min?: number
    rango_ref_max?: number
    rango_ref_texto?: string
    es_numerico?: boolean
}): Promise<ParametroCatalogo | null> {
    const { data, error } = await supabase
        .from('parametros_catalogo')
        .upsert({ ...param, activo: true, orden: 999 }, { onConflict: 'nombre,tipo_estudio' })
        .select()
        .single()
    if (error) { console.error('agregarParam error:', error); return null }
    return data
}

// ─── Estudios ───

export async function getEstudios(pacienteId: string, tipoEstudio: TipoEstudio, limit = 5): Promise<EstudioClinico[]> {
    const { data, error } = await supabase
        .from('estudios_clinicos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('tipo_estudio', tipoEstudio)
        .order('fecha_estudio', { ascending: false })
        .limit(limit)
    if (error) { console.error('getEstudios error:', error); return [] }
    return data || []
}

export async function getEstudioCompleto(estudioId: string): Promise<EstudioCompleto | null> {
    const [estudioRes, resultadosRes, graficasRes] = await Promise.all([
        supabase.from('estudios_clinicos').select('*').eq('id', estudioId).single(),
        supabase.from('resultados_estudio').select('*').eq('estudio_id', estudioId).order('created_at'),
        supabase.from('graficas_estudio').select('*').eq('estudio_id', estudioId),
    ])
    if (estudioRes.error || !estudioRes.data) return null
    const catalogo = await getCatalogo(estudioRes.data.tipo_estudio as TipoEstudio)
    const catMap = new Map(catalogo.map(c => [c.nombre, c]))
    const resultados = (resultadosRes.data || []).map(r => {
        const cat = catMap.get(r.parametro_nombre)
        return { ...r, nombre_display: cat?.nombre_display || r.parametro_nombre, orden: cat?.orden || 999 }
    }).sort((a, b) => (a.orden || 0) - (b.orden || 0))
    return { estudio: estudioRes.data, resultados, graficas: graficasRes.data || [] }
}

export async function getUltimoEstudioCompleto(pacienteId: string, tipoEstudio: TipoEstudio): Promise<EstudioCompleto | null> {
    const estudios = await getEstudios(pacienteId, tipoEstudio, 1)
    if (estudios.length === 0) return null
    return getEstudioCompleto(estudios[0].id)
}

// ─── Crear estudio completo ───

export async function crearEstudioConResultados(
    pacienteId: string,
    tipoEstudio: TipoEstudio,
    estudioData: Partial<EstudioClinico>,
    resultados: Array<{
        parametro_nombre: string; categoria?: string; resultado: string
        resultado_numerico?: number | null; unidad?: string; observacion?: string
    }>
): Promise<EstudioClinico | null> {
    const { data: estudio, error: estErr } = await supabase
        .from('estudios_clinicos')
        .insert({
            paciente_id: pacienteId,
            tipo_estudio: tipoEstudio,
            fecha_estudio: estudioData.fecha_estudio || new Date().toISOString().split('T')[0],
            archivo_origen: estudioData.archivo_origen || null,
            medico_responsable: estudioData.medico_responsable || null,
            equipo: estudioData.equipo || null,
            interpretacion: estudioData.interpretacion || null,
            diagnostico: estudioData.diagnostico || null,
            clasificacion: estudioData.clasificacion || null,
            calidad: estudioData.calidad || null,
            datos_extra: estudioData.datos_extra || {},
        })
        .select().single()
    if (estErr || !estudio) { console.error('❌ crearEstudio INSERT error:', estErr?.message, estErr?.details, estErr?.hint); return null }

    const catalogo = await getCatalogo(tipoEstudio)
    const catMap = new Map(catalogo.map(c => [c.nombre, c]))
    const rows = resultados.map(r => {
        const cat = catMap.get(r.parametro_nombre)
        // Sanitize resultado_numerico — NaN crashes Postgres NUMERIC columns
        let numVal = r.resultado_numerico ?? null
        if (numVal !== null && !isFinite(numVal)) numVal = null
        return {
            estudio_id: estudio.id, paciente_id: pacienteId,
            parametro_id: cat?.id || null, parametro_nombre: r.parametro_nombre || 'UNKNOWN',
            categoria: r.categoria || cat?.categoria || '',
            resultado: r.resultado || '—', resultado_numerico: numVal,
            unidad: r.unidad || cat?.unidad || '',
            rango_ref_min: cat?.rango_ref_min ?? null, rango_ref_max: cat?.rango_ref_max ?? null,
            rango_ref_texto: cat?.rango_ref_texto ?? null,
            bandera: calcularBandera(r.resultado || '', numVal, cat?.rango_ref_min, cat?.rango_ref_max, cat?.rango_ref_texto),
            observacion: r.observacion || null,
        }
    })
    if (rows.length > 0) {
        const { error } = await supabase.from('resultados_estudio').insert(rows)
        if (error) console.error('❌ insert results error:', error.message, error.details, error.hint, 'Rows count:', rows.length)
    }
    return estudio
}

// ─── Resultado individual ───

export async function agregarResultadoAEstudio(
    estudioId: string, pacienteId: string, tipoEstudio: TipoEstudio,
    parametroNombre: string, resultado: string, unidad?: string, observacion?: string
): Promise<ResultadoEstudio | null> {
    const catalogo = await getCatalogo(tipoEstudio)
    const cat = catalogo.find(c => c.nombre === parametroNombre)
    const numerico = !isNaN(parseFloat(resultado)) ? parseFloat(resultado) : null
    const bandera = calcularBandera(resultado, numerico, cat?.rango_ref_min, cat?.rango_ref_max, cat?.rango_ref_texto)
    const { data, error } = await supabase.from('resultados_estudio').insert({
        estudio_id: estudioId, paciente_id: pacienteId,
        parametro_id: cat?.id || null, parametro_nombre: parametroNombre,
        categoria: cat?.categoria || '', resultado, resultado_numerico: numerico,
        unidad: unidad || cat?.unidad || '',
        rango_ref_min: cat?.rango_ref_min, rango_ref_max: cat?.rango_ref_max,
        rango_ref_texto: cat?.rango_ref_texto, bandera, observacion,
    }).select().single()
    if (error) { console.error('agregarResultado error:', error); return null }
    return data
}

export async function updateResultado(id: string, updates: { resultado?: string; resultado_numerico?: number | null; observacion?: string }) {
    const { error } = await supabase.from('resultados_estudio').update(updates).eq('id', id)
    return !error
}

// ─── Gráficas ───

export async function agregarGrafica(estudioId: string, grafica: { titulo: string; eje_x_label?: string; eje_y_label?: string; puntos: any[]; tipo_grafica?: string }) {
    const { data, error } = await supabase.from('graficas_estudio').insert({ estudio_id: estudioId, ...grafica, tipo_grafica: grafica.tipo_grafica || 'linea' }).select().single()
    if (error) { console.error('agregarGrafica error:', error); return null }
    return data
}

// ─── Antecedentes ───

export async function getAntecedentes(pacienteId: string, tipo: string) {
    const { data } = await supabase.from('antecedentes_paciente').select('*').eq('paciente_id', pacienteId).eq('tipo', tipo).order('campo')
    return data || []
}

export async function upsertAntecedente(pacienteId: string, tipo: string, campo: string, valor: string, valorBooleano?: boolean, quien?: string, obs?: string) {
    const { error } = await supabase.from('antecedentes_paciente').upsert({
        paciente_id: pacienteId, tipo, campo, valor, valor_booleano: valorBooleano, quien, observaciones: obs, updated_at: new Date().toISOString(),
    }, { onConflict: 'paciente_id,tipo,campo' })
    return !error
}

// ─── Exploraciones ───

export async function getExploraciones(pacienteId: string) {
    const { data } = await supabase.from('exploraciones_fisicas').select('*').eq('paciente_id', pacienteId).order('fecha_exploracion', { ascending: false }).limit(2)
    return data || []
}

// ─── Notas ───

export async function getNotas(pacienteId: string) {
    const { data } = await supabase.from('notas_medicas').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false })
    return data || []
}

// ─── Unidades ───

export const UNIDADES_DISPONIBLES = [
    '', 'mg/dL', 'g/dL', 'g/L', '%', 'L', 'L/s', 's',
    'dB HL', 'mmHg', 'lpm', 'rpm', '°C', 'kg', 'cm', 'm',
    'kg/m2', 'fL', 'pg', 'millones/uL', 'x10^3/mm3', 'fl',
    'por campo', 'E.U./dL', 'ms', '°', 'mm/sec', 'mm/mV', 'mAs',
    'Snellen', 'Jaeger', 'años',
]

// ─── Legacy compat types (for old code that imports from this module) ───
export interface EstudioCatalogo {
    id: string; nombre: string
    categoria: 'laboratorio' | 'rayos_x' | 'audiometria' | 'espirometria' | 'cardiologia' | 'tomografia' | 'otro'
    codigo_interno?: string; precio_publico?: number; instrucciones_paciente?: string
}

export interface OrdenEstudio {
    id: string; paciente_id: string; medico_id: string; fecha_solicitud: string
    prioridad: 'normal' | 'urgente'
    estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
    diagnostico_presuntivo?: string
    paciente?: { nombre: string; apellido_paterno: string; nss?: string }
    detalles?: DetalleOrden[]
}

export interface DetalleOrden {
    id: string; estudio_id: string; estado: string
    estudio?: EstudioCatalogo
}

export const estudiosService = {
    async getCatalogo(empresaId: string) {
        const { data } = await supabase.from('catalogo_estudios').select('*').or(`empresa_id.eq.${empresaId},empresa_id.is.null`).order('nombre')
        return data || []
    },
    async getOrdenes(empresaId: string) {
        const { data } = await supabase.from('ordenes_estudios').select('*,paciente:pacientes(nombre,apellido_paterno,nss),detalles:detalles_orden_estudios(*,estudio:catalogo_estudios(*))').eq('empresa_id', empresaId).order('fecha_solicitud', { ascending: false })
        return data || []
    },
    async crearOrden(orden: any, estudiosIds: string[]) {
        const { data: ord } = await supabase.from('ordenes_estudios').insert(orden).select().single()
        if (!ord) return null
        await supabase.from('detalles_orden_estudios').insert(estudiosIds.map(id => ({ orden_id: ord.id, estudio_id: id, estado: 'pendiente' })))
        return ord
    }
}

