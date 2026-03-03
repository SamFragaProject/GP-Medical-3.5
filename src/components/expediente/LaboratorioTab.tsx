/**
 * LaboratorioTab — Scanner fiel + Análisis IA sin límite
 * Sección 1: Tabla agrupada igual al formato (biometría, química, lípidos, orina)
 * Sección 2: Barras animadas por valor vs rango, semáforos, alertas clínicas expandidas
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FlaskConical, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
    Minus, AlertTriangle, CheckCircle, Clock, Plus, Brain,
    Loader2, Inbox, Edit3, Shield, Zap, BarChart3
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import EstudioUploadReview from '@/components/expediente/EstudioUploadReview'
import {
    type Bandera, type ResultadoEstudio, type EstudioCompleto,
    getUltimoEstudioCompleto, getEstudios, getEstudioCompleto,
    BANDERA_STYLES,
} from '@/services/estudiosService'
import AgregarParametroModal from './AgregarParametroModal'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'

// ── Colores por grupo ──
const GRUPO_COLORS: Record<string, { gradient: string; headerBg: string; headerBorder: string; dot: string }> = {
    'Biometría Hemática': { gradient: 'from-emerald-500 to-teal-600', headerBg: 'bg-emerald-50', headerBorder: 'border-emerald-200', dot: 'bg-emerald-500' },
    'Fórmula Roja': { gradient: 'from-red-500 to-rose-600', headerBg: 'bg-rose-50', headerBorder: 'border-rose-200', dot: 'bg-rose-500' },
    'Fórmula Blanca': { gradient: 'from-blue-500 to-indigo-600', headerBg: 'bg-blue-50', headerBorder: 'border-blue-200', dot: 'bg-blue-500' },
    'Serie Plaquetaria': { gradient: 'from-violet-500 to-purple-600', headerBg: 'bg-violet-50', headerBorder: 'border-violet-200', dot: 'bg-violet-500' },
    'Química Sanguínea': { gradient: 'from-amber-500 to-orange-600', headerBg: 'bg-amber-50', headerBorder: 'border-amber-200', dot: 'bg-amber-500' },
    'Perfil Lipídico': { gradient: 'from-rose-500 to-pink-600', headerBg: 'bg-rose-50', headerBorder: 'border-rose-200', dot: 'bg-rose-500' },
    'Función Hepática': { gradient: 'from-yellow-500 to-amber-600', headerBg: 'bg-yellow-50', headerBorder: 'border-yellow-200', dot: 'bg-yellow-500' },
    'Función Renal': { gradient: 'from-cyan-500 to-sky-600', headerBg: 'bg-cyan-50', headerBorder: 'border-cyan-200', dot: 'bg-cyan-500' },
    'Examen General de Orina': { gradient: 'from-violet-500 to-purple-600', headerBg: 'bg-violet-50', headerBorder: 'border-violet-200', dot: 'bg-violet-500' },
    'Uroanálisis': { gradient: 'from-violet-500 to-purple-600', headerBg: 'bg-violet-50', headerBorder: 'border-violet-200', dot: 'bg-violet-500' },
}
const DEFAULT_GC = { gradient: 'from-slate-500 to-slate-600', headerBg: 'bg-slate-50', headerBorder: 'border-slate-200', dot: 'bg-slate-400' }

const RANGOS_REF: Record<string, { min: number; max: number; unit: string; label: string; group: string }> = {
    hemoglobina: { min: 13, max: 17.5, unit: 'g/dL', label: 'Hemoglobina', group: 'Biometría Hemática' },
    hematocrito: { min: 38, max: 52, unit: '%', label: 'Hematocrito', group: 'Biometría Hemática' },
    leucocitos: { min: 4500, max: 11000, unit: '/µL', label: 'Leucocitos', group: 'Biometría Hemática' },
    eritrocitos: { min: 4.2, max: 5.8, unit: 'M/µL', label: 'Eritrocitos', group: 'Biometría Hemática' },
    plaquetas: { min: 150000, max: 400000, unit: '/µL', label: 'Plaquetas', group: 'Biometría Hemática' },
    glucosa: { min: 70, max: 100, unit: 'mg/dL', label: 'Glucosa', group: 'Química Sanguínea' },
    creatinina: { min: 0.7, max: 1.3, unit: 'mg/dL', label: 'Creatinina', group: 'Química Sanguínea' },
    colesterol_total: { min: 0, max: 200, unit: 'mg/dL', label: 'Colesterol Total', group: 'Perfil Lipídico' },
    trigliceridos: { min: 0, max: 150, unit: 'mg/dL', label: 'Triglicéridos', group: 'Perfil Lipídico' },
}

// ─────────────────────────────────────────────
// Parsea resultados legacy (JSONB) → grupos
// ─────────────────────────────────────────────
function convertJsonbToGrupos(lab: Record<string, any>): any[] {
    const map: Record<string, any[]> = {}
    for (const [key, value] of Object.entries(lab)) {
        if (value === null || value === undefined || value === '' || value === 0) continue
        const ref = RANGOS_REF[key]
        if (ref) {
            const n = parseFloat(String(value))
            if (isNaN(n)) continue
            const bandera = n < ref.min ? 'bajo' : n > ref.max ? 'alto' : 'normal'
            if (!map[ref.group]) map[ref.group] = []
            map[ref.group].push({ parametro: ref.label, resultado: String(n), unidad: ref.unit, bandera, valor_referencia: `${ref.min} - ${ref.max}`, rango_ref_min: ref.min, rango_ref_max: ref.max })
        } else if (typeof value === 'string' && value.length > 0) {
            const g = key.toLowerCase().includes('orina') ? 'Examen General de Orina' : 'Otros'
            if (!map[g]) map[g] = []
            map[g].push({ parametro: key.replace(/_/g, ' '), resultado: value, unidad: '', bandera: 'normal' })
        }
    }
    return Object.entries(map).map(([grupo, resultados]) => ({ grupo, resultados }))
}

// ─────────────────────────────────────────────
// COMPONENTE: Fila sensor de resultado (tabla)
// ─────────────────────────────────────────────
function ResultRow({ r, prevValue }: { r: any; prevValue?: string | null }) {
    const bandera = r.bandera || 'normal'
    const flag = BANDERA_STYLES[bandera as Bandera] || BANDERA_STYLES.normal
    const resultStr = String(r.resultado ?? r.resultado_numerico ?? '')
    const currNum = parseFloat(resultStr.replace(/,/g, '') || '0')
    const prevNum = prevValue ? parseFloat(String(prevValue).replace(/,/g, '')) : NaN
    let trend: 'up' | 'down' | 'same' | null = null
    if (!isNaN(currNum) && !isNaN(prevNum)) trend = currNum > prevNum ? 'up' : currNum < prevNum ? 'down' : 'same'
    const nombre = r.nombre_display || r.parametro || r.parametro_nombre || ''
    const isText = resultStr.length > 40
    if (isText) return (
        <div className="py-2.5 px-3 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${flag.dot} flex-shrink-0`} />
                <span className="text-sm font-semibold text-slate-700">{nombre}</span>
            </div>
            <p className="text-sm text-slate-600 pl-4 leading-relaxed whitespace-pre-wrap">{resultStr}</p>
        </div>
    )
    return (
        <div className="flex items-center gap-2 py-2.5 px-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${bandera !== 'normal' ? flag.dot : 'bg-slate-200'}`} />
            <span className="text-sm font-semibold text-slate-700 flex-1 min-w-0">{nombre}</span>
            <span className={`text-sm font-black tabular-nums ${bandera !== 'normal' ? flag.text : 'text-slate-900'}`}>{resultStr}</span>
            {r.unidad && <span className="text-[10px] text-slate-400 font-medium w-14 text-left">{r.unidad}</span>}
            <span className="text-[10px] text-slate-400 font-mono w-24 text-right hidden sm:block">
                {r.valor_referencia || (r.rango_ref_min != null && r.rango_ref_max != null ? `${r.rango_ref_min} – ${r.rango_ref_max}` : '')}
            </span>
            {trend && <div className="w-4 flex-shrink-0">
                {trend === 'up' && <TrendingUp className="w-3 h-3 text-amber-500" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-500" />}
                {trend === 'same' && <Minus className="w-3 h-3 text-slate-300" />}
            </div>}
            {bandera !== 'normal' && <Badge className={`${flag.bg} ${flag.text} border-0 text-[9px] font-black px-1.5`}>{flag.label}</Badge>}
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Tarjeta de grupo (escáner)
// ─────────────────────────────────────────────
function GrupoCard({ grupo, resultados, prevLab }: { grupo: string; resultados: any[]; prevLab?: any }) {
    const [expanded, setExpanded] = useState(true)
    const gc = GRUPO_COLORS[grupo] || DEFAULT_GC
    const anormal = resultados.filter(r => (r.bandera || 'normal') !== 'normal').length
    return (
        <Card className="border-0 shadow-md overflow-hidden rounded-xl">
            <button onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center justify-between px-5 py-4 ${gc.headerBg} border-b ${gc.headerBorder} hover:brightness-95 transition-all`}>
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gc.gradient} flex items-center justify-center shadow-md`}>
                        <FlaskConical className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800">{grupo}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{resultados.length} parámetros</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {anormal > 0
                        ? <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-black"><AlertTriangle className="w-3 h-3 mr-1" />{anormal} alterado{anormal > 1 ? 's' : ''}</Badge>
                        : <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-black"><CheckCircle className="w-3 h-3 mr-1" />Normal</Badge>}
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className={`flex items-center gap-2 py-1.5 px-3 ${gc.headerBg} border-b ${gc.headerBorder} text-[9px] font-black uppercase tracking-widest text-slate-400`}>
                            <span className="w-2" /><span className="flex-1">Parámetro</span>
                            <span className="w-20">Resultado</span><span className="w-14 hidden sm:block">Unidad</span>
                            <span className="w-24 text-right hidden sm:block">Referencia</span><span className="w-4" />
                        </div>
                        {resultados.map((r, i) => <ResultRow key={r.id || i} r={r} />)}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Barra animada de valor vs rango (análisis IA)
// ─────────────────────────────────────────────
function ValueBar({ nombre, valor, min, max, unit, bandera, delay = 0 }: {
    nombre: string; valor: number; min: number; max: number; unit: string; bandera: string; delay?: number
}) {
    const isNorm = bandera === 'normal'
    const isHigh = bandera === 'alto' || bandera === 'critico'
    // Posición del valor dentro del rango extendido (0.5x min a 1.5x max)
    const rangeExtMin = min * 0.7
    const rangeExtMax = max * 1.3
    const totalRange = rangeExtMax - rangeExtMin
    const minPct = ((min - rangeExtMin) / totalRange) * 100
    const maxPct = ((max - rangeExtMin) / totalRange) * 100
    const valPct = Math.max(2, Math.min(98, ((valor - rangeExtMin) / totalRange) * 100))

    const barColor = isHigh ? 'bg-red-500' : bandera === 'bajo' ? 'bg-blue-500' : 'bg-emerald-500'

    return (
        <div className={`p-3 rounded-xl border ${isNorm ? 'border-slate-100 bg-white' : isHigh ? 'border-red-100 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-700">{nombre}</span>
                <div className="text-right">
                    <span className={`text-sm font-black tabular-nums ${isNorm ? 'text-emerald-700' : isHigh ? 'text-red-700' : 'text-blue-700'}`}>{valor}</span>
                    <span className="text-[9px] text-slate-400 ml-1">{unit}</span>
                </div>
            </div>
            <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden">
                {/* Zona normal verde */}
                <div className="absolute top-0 h-full bg-emerald-100 rounded-full"
                    style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                {/* Marcador del valor */}
                <motion.div className={`absolute top-1 bottom-1 w-2.5 rounded-full ${barColor} shadow-sm`}
                    style={{ left: `calc(${valPct}% - 5px)` }}
                    initial={{ left: `calc(${minPct}% - 5px)`, opacity: 0 }}
                    animate={{ left: `calc(${valPct}% - 5px)`, opacity: 1 }}
                    transition={{ delay, duration: 0.7, ease: 'easeOut' }}
                />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium">
                <span>Ref: {min}</span>
                <span className={`font-bold ${isNorm ? 'text-emerald-600' : isHigh ? 'text-red-600' : 'text-blue-600'}`}>
                    {isNorm ? '✓ Normal' : isHigh ? '↑ Elevado' : '↓ Bajo'}
                </span>
                <span>{max}</span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE: Resumen de alertas
// ─────────────────────────────────────────────
function AlertasResumen({ resultados }: { resultados: any[] }) {
    const criticos = resultados.filter(r => r.bandera === 'critico')
    const altos = resultados.filter(r => r.bandera === 'alto')
    const bajos = resultados.filter(r => r.bandera === 'bajo')
    const anormales = resultados.filter(r => r.bandera === 'anormal')
    if (!criticos.length && !altos.length && !bajos.length && !anormales.length) return null
    return (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-100 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-800">Alertas Clínicas — {criticos.length + altos.length + bajos.length + anormales.length} parámetros alterados</span>
            </div>
            {criticos.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 bg-red-100/60 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold text-red-800">{r.nombre_display || r.parametro || r.parametro_nombre}</span>
                    <span className="text-red-600 font-black">{String(r.resultado ?? r.resultado_numerico ?? '')} {r.unidad}</span>
                    <span className="text-red-400 ml-auto font-black">CRÍTICO</span>
                </div>
            ))}
            {[...altos, ...bajos, ...anormales].map((r, i) => (
                <div key={`w${i}`} className="flex items-center gap-2 text-xs px-3 py-1.5 bg-amber-100/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${BANDERA_STYLES[r.bandera as Bandera]?.dot || 'bg-amber-500'}`} />
                    <span className="font-semibold text-amber-800">{r.nombre_display || r.parametro || r.parametro_nombre}</span>
                    <span className="text-amber-700 font-bold">{String(r.resultado ?? r.resultado_numerico ?? '')} {r.unidad}</span>
                    <span className="text-amber-400 ml-auto">{BANDERA_STYLES[r.bandera as Bandera]?.label}</span>
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function LaboratorioTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [estudioCompleto, setEstudioCompleto] = useState<EstudioCompleto | null>(null)
    const [legacyLab, setLegacyLab] = useState<any>(null)
    const [prevLab, setPrevLab] = useState<any>(null)
    const [usandoNuevaArq, setUsandoNuevaArq] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)
            const completo = await getUltimoEstudioCompleto(pacienteId, 'laboratorio')
            if (completo && completo.resultados.length > 0) {
                setEstudioCompleto(completo)
                setUsandoNuevaArq(true)
                const estudios = await getEstudios(pacienteId, 'laboratorio', 2)
                if (estudios.length > 1) {
                    const prev = await getEstudioCompleto(estudios[1].id)
                    if (prev) setPrevLab(prev)
                }
                return
            }
            const { data: pac } = await supabase.from('pacientes').select('laboratorio').eq('id', pacienteId).single()
            if (pac?.laboratorio && typeof pac.laboratorio === 'object') {
                const grupos = convertJsonbToGrupos(pac.laboratorio as Record<string, any>)
                if (grupos.length > 0) { setLegacyLab({ grupos, fecha: new Date().toISOString() }); return }
            }
            const { data: labRecords } = await supabase.from('laboratorios').select('*').eq('paciente_id', pacienteId).order('fecha_resultados', { ascending: false }).limit(2)
            if (labRecords && labRecords.length > 0) {
                const record = labRecords[0]
                let grupos: any[] = []
                try { grupos = typeof record.resultados === 'string' ? JSON.parse(record.resultados) : (Array.isArray(record.resultados) ? record.resultados : []) } catch { }
                setLegacyLab({ ...record, grupos, fecha: record.fecha_resultados })
                return
            }
            if (pacienteId?.startsWith('demo')) {
                const d = getExpedienteDemoCompleto()
                setLegacyLab(d.laboratorio)
                setPrevLab(d.laboratorioPrevio)
            }
        } catch (err) { console.error('Lab err:', err) }
        finally { setLoading(false) }
    }

    const groupedResults = useMemo(() => {
        if (!estudioCompleto) return []
        const map: Record<string, ResultadoEstudio[]> = {}
        for (const r of estudioCompleto.resultados) {
            const cat = r.categoria || 'General'
            if (!map[cat]) map[cat] = []
            map[cat].push(r)
        }
        return Object.entries(map).map(([grupo, resultados]) => ({ grupo, resultados }))
    }, [estudioCompleto])

    const allResults: any[] = usandoNuevaArq
        ? (estudioCompleto?.resultados || [])
        : (legacyLab?.grupos?.flatMap((g: any) => g.resultados || []) || [])

    const grupos = usandoNuevaArq
        ? (groupedResults.length > 0 ? groupedResults : [{ grupo: 'Resultados', resultados: estudioCompleto?.resultados || [] }])
        : (legacyLab?.grupos || [])

    const lab = usandoNuevaArq ? estudioCompleto?.estudio : legacyLab
    const totalParams = allResults.length
    const abnormalTotal = allResults.filter((r: any) => (r.bandera || 'normal') !== 'normal').length

    // Parámetros con rango numérico para barras animadas
    const numericResults = allResults.filter((r: any) => {
        const val = parseFloat(String(r.resultado ?? r.resultado_numerico ?? ''))
        const hasRange = (r.rango_ref_min != null && r.rango_ref_max != null) || r.valor_referencia
        return !isNaN(val) && hasRange
    })

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Cargando resultados de laboratorio...</p>
        </div>
    )

    if (!lab && !legacyLab) return (
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-slate-800 font-bold">Sin resultados de laboratorio</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-6">
                Sube el PDF de los laboratorios y el sistema extraerá todos los parámetros automáticamente.
            </p>
            <div className="max-w-lg mx-auto">
                <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="laboratorio" onSaved={loadData} />
            </div>
        </Card>
    )

    return (
        <div className="space-y-5">

            {/* ── HEADER ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Resultados de Laboratorio</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {usandoNuevaArq ? (estudioCompleto?.estudio.institucion || 'GP Medical Health') : (legacyLab?.laboratorio_nombre || 'Laboratorio')}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <EstudioUploadReview pacienteId={pacienteId} tipoEstudio="laboratorio" onSaved={loadData} />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {lab?.fecha_estudio || lab?.fecha
                                    ? new Date(lab.fecha_estudio || lab.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Parámetros</p>
                            <p className="text-sm font-bold text-slate-700">{totalParams}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border ${abnormalTotal > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alertas</p>
                            <p className={`text-sm font-bold ${abnormalTotal > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{abnormalTotal}</p>
                        </div>
                        {usandoNuevaArq && estudioCompleto && (
                            <button onClick={() => setShowAddModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-200 flex items-center gap-1.5">
                                <Plus className="w-4 h-4" /> Agregar
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-4"><AlertasResumen resultados={allResults} /></div>
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ══ SECCIÓN 1: ESCÁNER ══ */}
                {activeSection === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {grupos.map((g: any, i: number) => (
                                <GrupoCard key={i} grupo={g.grupo} resultados={g.resultados || []} prevLab={prevLab} />
                            ))}
                        </div>
                        {(estudioCompleto?.estudio.interpretacion || legacyLab?.interpretacion) && (
                            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                                <h4 className="text-sm font-bold text-blue-800 mb-2">📋 Interpretación del Laboratorio</h4>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    {estudioCompleto?.estudio.interpretacion || legacyLab?.interpretacion}
                                </p>
                            </div>
                        )}
                        <DocumentosAdjuntos pacienteId={pacienteId} categoria="laboratorio" titulo="Archivo Original (PDF)" collapsedByDefault={false} />
                    </motion.div>
                )}

                {/* ══ SECCIÓN 2: ANÁLISIS IA ══ */}
                {activeSection === 'analisis' && (
                    <motion.div key="analisis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                        {/* Header IA */}
                        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-sm">Análisis Clínico de Laboratorio</p>
                                    <p className="text-emerald-200 text-xs">{totalParams} parámetros analizados — {abnormalTotal} fuera de rango</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {[
                                    { label: 'Normales', count: totalParams - abnormalTotal, color: 'bg-emerald-500/20 text-emerald-200' },
                                    { label: 'Alterados', count: abnormalTotal, color: 'bg-amber-500/20 text-amber-200' },
                                    { label: 'Críticos', count: allResults.filter((r: any) => r.bandera === 'critico').length, color: 'bg-red-500/20 text-red-200' },
                                ].map(({ label, count, color }) => (
                                    <div key={label} className={`p-3 rounded-xl ${color} text-center`}>
                                        <p className="text-2xl font-black">{count}</p>
                                        <p className="text-xs font-bold opacity-80">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumen de alertas */}
                        {abnormalTotal > 0 && (
                            <Card className="border-amber-100 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Parámetros Alterados — Detalle</p>
                                    </div>
                                    <div className="space-y-2">
                                        {allResults
                                            .filter((r: any) => (r.bandera || 'normal') !== 'normal')
                                            .map((r: any, i: number) => {
                                                const flag = BANDERA_STYLES[r.bandera as Bandera] || BANDERA_STYLES.normal
                                                const val = String(r.resultado ?? r.resultado_numerico ?? '')
                                                const ref = r.valor_referencia || (r.rango_ref_min != null ? `${r.rango_ref_min} – ${r.rango_ref_max}` : '')
                                                return (
                                                    <motion.div key={i}
                                                        initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${flag.bg} ${flag.border || 'border-amber-200'}`}>
                                                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${flag.dot}`} />
                                                        <span className="text-sm font-semibold text-slate-700 flex-1">
                                                            {r.nombre_display || r.parametro || r.parametro_nombre}
                                                        </span>
                                                        <span className={`text-sm font-black tabular-nums ${flag.text}`}>{val} {r.unidad}</span>
                                                        {ref && <span className="text-[10px] text-slate-400 hidden sm:block">Ref: {ref}</span>}
                                                        <Badge className={`${flag.bg} ${flag.text} border-0 text-[9px] font-black`}>{flag.label}</Badge>
                                                    </motion.div>
                                                )
                                            })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Barras animadas por valor — parámetros numéricos */}
                        {numericResults.length > 0 && (
                            <Card className="border-slate-100 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart3 className="w-4 h-4 text-slate-500" />
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Posición vs Rango de Referencia</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {numericResults.slice(0, 24).map((r: any, i: number) => {
                                            const val = parseFloat(String(r.resultado ?? r.resultado_numerico ?? '0'))
                                            let min = r.rango_ref_min ?? 0, max = r.rango_ref_max ?? 100
                                            if ((!min && !max) && r.valor_referencia) {
                                                const parts = String(r.valor_referencia).replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
                                                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) { min = parts[0]; max = parts[1] }
                                            }
                                            return (
                                                <ValueBar key={r.id || i}
                                                    nombre={r.nombre_display || r.parametro || r.parametro_nombre || ''}
                                                    valor={val} min={min} max={max}
                                                    unit={r.unidad || ''} bandera={r.bandera || 'normal'}
                                                    delay={i * 0.03} />
                                            )
                                        })}
                                    </div>
                                    <div className="flex gap-4 mt-4 justify-center">
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-500 font-medium">Normal</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-[10px] text-slate-500 font-medium">Elevado</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[10px] text-slate-500 font-medium">Bajo</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-8 h-2 bg-emerald-100 rounded" /><span className="text-[10px] text-slate-500 font-medium">Zona normal</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Interpretación clínica expandida */}
                        <Card className="border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-4 h-4 text-emerald-600" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Interpretación Clínica Completa</p>
                                </div>
                                <div className="space-y-3">
                                    {/* Por grupo: resumen */}
                                    {grupos.slice(0, 6).map((g: any, i: number) => {
                                        const groupAnormal = (g.resultados || []).filter((r: any) => (r.bandera || 'normal') !== 'normal').length
                                        const gc = GRUPO_COLORS[g.grupo] || DEFAULT_GC
                                        return (
                                            <div key={i} className={`p-3 bg-white rounded-xl border ${groupAnormal > 0 ? 'border-amber-100' : 'border-emerald-100'}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${gc.dot}`} />
                                                        <p className="text-xs font-black text-slate-700">{g.grupo}</p>
                                                    </div>
                                                    {groupAnormal > 0
                                                        ? <span className="text-[9px] font-black text-amber-600">{groupAnormal} alterado{groupAnormal > 1 ? 's' : ''}</span>
                                                        : <span className="text-[9px] font-black text-emerald-600">✓ Normal</span>}
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed pl-4">
                                                    {groupAnormal === 0
                                                        ? `${g.grupo}: todos los parámetros dentro de rangos de referencia.`
                                                        : `${g.grupo}: ${groupAnormal} de ${(g.resultados || []).length} parámetros fuera de rango. Requiere seguimiento clínico.`}
                                                </p>
                                            </div>
                                        )
                                    })}

                                    {/* Interpretación global */}
                                    <div className={`p-4 rounded-xl border ${abnormalTotal === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className={`font-black text-xs uppercase tracking-widest mb-2 ${abnormalTotal === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Conclusión Global</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {estudioCompleto?.estudio.interpretacion || legacyLab?.interpretacion ||
                                                (abnormalTotal === 0
                                                    ? `Laboratorio de ${totalParams} parámetros dentro de límites normales. Sin alteraciones clínicamente significativas.`
                                                    : `Se identificaron ${abnormalTotal} parámetros fuera de rango en un panel de ${totalParams} determinaciones. Se recomienda correlación clínica y seguimiento según criterio médico.`)}
                                        </p>
                                    </div>

                                    {prevLab && (
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-xs font-black text-blue-700 mb-1">Comparación con Estudio Previo</p>
                                            <p className="text-xs text-slate-600">Se conserva el estudio previo para análisis de tendencias. Los parámetros con cambios significativos se marcan con flechas de tendencia en la vista escáner.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Aptitud laboral */}
                        <Card className="border-slate-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide">Relevancia para Salud Ocupacional</p>
                                </div>
                                <div className={`p-3 rounded-xl ${abnormalTotal === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {abnormalTotal === 0
                                            ? 'Perfil hematológico y bioquímico dentro de parámetros normales. Sin restricción laboral de origen metabólico o hematológico.'
                                            : 'Parámetros laboratoriales alterados. Se recomienda seguimiento médico y ajuste del programa de vigilancia epidemiológica según resultados.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal agregar */}
            {usandoNuevaArq && estudioCompleto && (
                <AgregarParametroModal open={showAddModal} onClose={() => setShowAddModal(false)}
                    onAdded={loadData} estudioId={estudioCompleto.estudio.id}
                    pacienteId={pacienteId} tipoEstudio="laboratorio" />
            )}
        </div>
    )
}
