/**
 * LaboratorioTab — Resultados de laboratorio con semáforo, comparación y parámetros dinámicos
 * 
 * Lee de: estudios_clinicos + resultados_estudio (nuevas tablas unificadas)
 * Fallback: pacientes.laboratorio JSONB → laboratorios (seed)
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    FlaskConical, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
    Minus, AlertTriangle, CheckCircle, Clock, BarChart3, Plus,
    Loader2, Inbox, Edit3, X, Check, Link2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import SectionFileUpload from '@/components/expediente/SectionFileUpload'
import {
    type TipoEstudio, type Bandera, type ResultadoEstudio, type EstudioCompleto,
    getUltimoEstudioCompleto, getEstudios, getEstudioCompleto,
    calcularBandera, BANDERA_STYLES, getCatalogo, crearEstudioConResultados,
} from '@/services/estudiosService'
import AgregarParametroModal from './AgregarParametroModal'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'

// ================== RANGOS LEGACY ==================
const RANGOS_REF: Record<string, { min: number; max: number; unidad: string; label: string; grupo: string }> = {
    hemoglobina: { min: 13, max: 17.5, unidad: 'g/dL', label: 'Hemoglobina', grupo: 'Biometría Hemática' },
    hematocrito: { min: 38, max: 52, unidad: '%', label: 'Hematocrito', grupo: 'Biometría Hemática' },
    leucocitos: { min: 4500, max: 11000, unidad: '/µL', label: 'Leucocitos', grupo: 'Biometría Hemática' },
    eritrocitos: { min: 4.2, max: 5.8, unidad: 'M/µL', label: 'Eritrocitos', grupo: 'Biometría Hemática' },
    plaquetas: { min: 150000, max: 400000, unidad: '/µL', label: 'Plaquetas', grupo: 'Biometría Hemática' },
    vcm: { min: 80, max: 100, unidad: 'fL', label: 'VCM', grupo: 'Biometría Hemática' },
    hcm: { min: 27, max: 33, unidad: 'pg', label: 'HCM', grupo: 'Biometría Hemática' },
    cmhc: { min: 32, max: 36, unidad: 'g/dL', label: 'CMHC', grupo: 'Biometría Hemática' },
    neutrofilos_totales: { min: 40, max: 70, unidad: '%', label: 'Neutrófilos', grupo: 'Fórmula Blanca' },
    linfocitos: { min: 20, max: 45, unidad: '%', label: 'Linfocitos', grupo: 'Fórmula Blanca' },
    monocitos: { min: 2, max: 10, unidad: '%', label: 'Monocitos', grupo: 'Fórmula Blanca' },
    eosinofilos: { min: 0, max: 5, unidad: '%', label: 'Eosinófilos', grupo: 'Fórmula Blanca' },
    basofilos: { min: 0, max: 2, unidad: '%', label: 'Basófilos', grupo: 'Fórmula Blanca' },
    vpm: { min: 7, max: 12, unidad: 'fL', label: 'VPM', grupo: 'Biometría Hemática' },
    rdw_cv: { min: 11.5, max: 14.5, unidad: '%', label: 'RDW-CV', grupo: 'Biometría Hemática' },
    glucosa: { min: 70, max: 100, unidad: 'mg/dL', label: 'Glucosa', grupo: 'Química Sanguínea' },
    urea: { min: 15, max: 45, unidad: 'mg/dL', label: 'Urea', grupo: 'Química Sanguínea' },
    bun: { min: 7, max: 20, unidad: 'mg/dL', label: 'BUN', grupo: 'Química Sanguínea' },
    creatinina: { min: 0.7, max: 1.3, unidad: 'mg/dL', label: 'Creatinina', grupo: 'Química Sanguínea' },
    colesterol_total: { min: 0, max: 200, unidad: 'mg/dL', label: 'Colesterol Total', grupo: 'Perfil Lipídico' },
    trigliceridos: { min: 0, max: 150, unidad: 'mg/dL', label: 'Triglicéridos', grupo: 'Perfil Lipídico' },
}

function convertJsonbToGrupos(lab: Record<string, any>): any[] {
    const gruposMap: Record<string, any[]> = {}
    for (const [key, value] of Object.entries(lab)) {
        if (value === null || value === undefined || value === 0 || value === '') continue
        const ref = RANGOS_REF[key]
        if (ref) {
            const numVal = typeof value === 'number' ? value : parseFloat(String(value))
            if (isNaN(numVal)) continue
            const bandera = numVal < ref.min ? 'bajo' : numVal > ref.max ? 'alto' : 'normal'
            if (!gruposMap[ref.grupo]) gruposMap[ref.grupo] = []
            gruposMap[ref.grupo].push({ parametro: ref.label, resultado: String(numVal), unidad: ref.unidad, bandera, valor_referencia: `${ref.min} - ${ref.max}` })
        } else if (typeof value === 'string' && value.length > 0) {
            if (!gruposMap['Otros']) gruposMap['Otros'] = []
            gruposMap['Otros'].push({ parametro: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), resultado: value, unidad: '', bandera: 'normal' })
        }
    }
    return Object.entries(gruposMap).map(([grupo, resultados]) => ({ grupo, resultados }))
}

// ================== RESULT ROW ==================
function ResultRow({ r, prevValue, onEdit }: { r: any; prevValue?: string | null; onEdit?: () => void }) {
    const bandera = r.bandera || 'normal'
    const flag = BANDERA_STYLES[bandera as Bandera] || BANDERA_STYLES.normal
    const resultStr = String(r.resultado ?? '')
    const currNum = parseFloat(resultStr.replace(/,/g, '') || '0')
    const prevNum = prevValue ? parseFloat(String(prevValue).replace(/,/g, '')) : NaN

    let trend: 'up' | 'down' | 'same' | null = null
    if (!isNaN(currNum) && !isNaN(prevNum)) {
        trend = currNum > prevNum ? 'up' : currNum < prevNum ? 'down' : 'same'
    }

    const isLongText = resultStr.length > 40

    if (isLongText) {
        return (
            <div className="py-2.5 px-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${flag.dot} flex-shrink-0`} />
                    <span className="text-sm font-semibold text-slate-700 flex-1">{r.nombre_display || r.parametro || r.parametro_nombre}</span>
                    {onEdit && <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3 text-slate-400 hover:text-teal-500" /></button>}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-4 break-words whitespace-pre-wrap">{resultStr}</p>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 py-2.5 px-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
            <div className={`w-2 h-2 rounded-full ${flag.dot} flex-shrink-0`} />
            <span className="text-sm font-semibold text-slate-700 flex-1 min-w-0">{r.nombre_display || r.parametro || r.parametro_nombre}</span>
            <span className={`text-sm font-black tabular-nums ${bandera !== 'normal' ? flag.text : 'text-slate-900'}`}>{resultStr}</span>
            {(r.unidad) && <span className="text-[10px] text-slate-400 font-medium w-14 text-left">{r.unidad}</span>}
            <span className="text-[10px] text-slate-400 font-mono w-24 text-right hidden sm:block">
                {r.valor_referencia || (r.rango_ref_min != null && r.rango_ref_max != null ? `${r.rango_ref_min} - ${r.rango_ref_max}` : r.rango_ref_texto || '')}
            </span>
            {trend && (
                <div className="w-5 flex-shrink-0">
                    {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-amber-500" />}
                    {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
                    {trend === 'same' && <Minus className="w-3.5 h-3.5 text-slate-300" />}
                </div>
            )}
            {bandera !== 'normal' && (
                <Badge className={`${flag.bg} ${flag.text} border-0 text-[9px] font-black px-1.5 py-0.5`}>{flag.label}</Badge>
            )}
            {onEdit && <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3 text-slate-400 hover:text-teal-500" /></button>}
        </div>
    )
}

// ================== GROUP CARD ==================
function GrupoCard({ grupo, resultados, prevLab, onEdit }: { grupo: string; resultados: any[]; prevLab?: any; onEdit?: (r: any) => void }) {
    const [expanded, setExpanded] = useState(true)
    const abnormalCount = resultados.filter(r => (r.bandera || 'normal') !== 'normal').length
    const total = resultados.length

    return (
        <Card className="border-slate-100 shadow-sm overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${abnormalCount > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                        <FlaskConical className={`w-4 h-4 ${abnormalCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-800">{grupo}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{total} parámetros</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {abnormalCount > 0 ? (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-black">
                            <AlertTriangle className="w-3 h-3 mr-1" />{abnormalCount} fuera de rango
                        </Badge>
                    ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-black">
                            <CheckCircle className="w-3 h-3 mr-1" />Todo normal
                        </Badge>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>
            {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 border-y border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span className="w-2" /><span className="flex-1">Parámetro</span>
                        <span className="w-16">Resultado</span><span className="w-14 hidden sm:block">Unidad</span>
                        <span className="w-24 text-right hidden sm:block">Ref.</span><span className="w-5" />
                    </div>
                    {resultados.map((r, i) => (
                        <ResultRow key={r.id || i} r={r} onEdit={onEdit ? () => onEdit(r) : undefined} />
                    ))}
                </motion.div>
            )}
        </Card>
    )
}

// ================== ALERTA RESUMEN ==================
function AlertasResumen({ resultados }: { resultados: any[] }) {
    const criticos = resultados.filter(r => r.bandera === 'critico')
    const altos = resultados.filter(r => r.bandera === 'alto')
    const bajos = resultados.filter(r => r.bandera === 'bajo')
    const anormales = resultados.filter(r => r.bandera === 'anormal')

    if (criticos.length === 0 && altos.length === 0 && bajos.length === 0 && anormales.length === 0) return null

    return (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-100 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-800">Alertas Clínicas</span>
            </div>
            {criticos.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs px-3 py-1.5 bg-red-100/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold text-red-800">{r.nombre_display || r.parametro || r.parametro_nombre}</span>
                    <span className="text-red-600 font-black">{r.resultado} {r.unidad}</span>
                    <span className="text-red-400 ml-auto">CRÍTICO</span>
                </div>
            ))}
            {[...altos, ...bajos, ...anormales].map((r, i) => (
                <div key={`w${i}`} className="flex items-center gap-2 text-xs px-3 py-1.5 bg-amber-100/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${BANDERA_STYLES[r.bandera as Bandera]?.dot || 'bg-amber-500'}`} />
                    <span className="font-semibold text-amber-800">{r.nombre_display || r.parametro || r.parametro_nombre}</span>
                    <span className="text-amber-700 font-bold">{r.resultado} {r.unidad}</span>
                    <span className="text-amber-400 ml-auto">{BANDERA_STYLES[r.bandera as Bandera]?.label}</span>
                </div>
            ))}
        </div>
    )
}

// ================== MAIN COMPONENT ==================
export default function LaboratorioTab({ pacienteId }: { pacienteId: string }) {
    const [loading, setLoading] = useState(true)
    const [estudioCompleto, setEstudioCompleto] = useState<EstudioCompleto | null>(null)
    const [legacyLab, setLegacyLab] = useState<any>(null)
    const [prevLab, setPrevLab] = useState<any>(null)
    const [usandoNuevaArquitectura, setUsandoNuevaArquitectura] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        if (pacienteId) loadData()
    }, [pacienteId])

    const loadData = async () => {
        try {
            setLoading(true)

            // FUENTE 1: Nuevas tablas unificadas (estudios_clinicos + resultados_estudio)
            const completo = await getUltimoEstudioCompleto(pacienteId, 'laboratorio')
            if (completo && completo.resultados.length > 0) {
                setEstudioCompleto(completo)
                setUsandoNuevaArquitectura(true)
                // Load previous for comparison
                const estudios = await getEstudios(pacienteId, 'laboratorio', 2)
                if (estudios.length > 1) {
                    const prev = await getEstudioCompleto(estudios[1].id)
                    if (prev) setPrevLab(prev)
                }
                return
            }

            // FUENTE 2: pacientes.laboratorio JSONB
            const { data: paciente } = await supabase
                .from('pacientes')
                .select('laboratorio')
                .eq('id', pacienteId)
                .single()

            if (paciente?.laboratorio && typeof paciente.laboratorio === 'object') {
                const labData = paciente.laboratorio as Record<string, any>
                const validKeys = Object.keys(labData).filter(k => labData[k] !== null && labData[k] !== undefined && labData[k] !== '' && labData[k] !== 0)
                if (validKeys.length > 3) {
                    const grupos = convertJsonbToGrupos(labData)
                    if (grupos.length > 0) {
                        setLegacyLab({ grupos, fecha: new Date().toISOString(), laboratorio_nombre: 'Datos del expediente' })
                        return
                    }
                }
            }

            // FUENTE 3: laboratorios (seed)
            const { data: labRecords } = await supabase
                .from('laboratorios')
                .select('*')
                .eq('paciente_id', pacienteId)
                .order('fecha_resultados', { ascending: false })
                .limit(2)

            if (labRecords && labRecords.length > 0) {
                const record = labRecords[0]
                let grupos: any[] = []
                try { grupos = typeof record.resultados === 'string' ? JSON.parse(record.resultados) : (Array.isArray(record.resultados) ? record.resultados : []) } catch { }
                setLegacyLab({ ...record, grupos, fecha: record.fecha_resultados, interpretacion: record.interpretacion_medica })
                return
            }

            // Demo fallback
            if (pacienteId?.startsWith('demo')) {
                const d = getExpedienteDemoCompleto()
                setLegacyLab(d.laboratorio)
                setPrevLab(d.laboratorioPrevio)
            }
        } catch (err) {
            console.error('Error loading lab:', err)
        } finally {
            setLoading(false)
        }
    }

    // Group new-architecture results by category
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

    const allResults = usandoNuevaArquitectura
        ? (estudioCompleto?.resultados || [])
        : (legacyLab?.grupos?.flatMap((g: any) => g.resultados || []) || [])

    const totalParams = allResults.length
    const abnormalTotal = allResults.filter((r: any) => (r.bandera || 'normal') !== 'normal').length

    const lab = usandoNuevaArquitectura ? estudioCompleto?.estudio : legacyLab
    const grupos = usandoNuevaArquitectura ? groupedResults : (legacyLab?.grupos || [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Cargando resultados de laboratorio...</p>
            </div>
        )
    }

    if (!lab && !legacyLab) {
        return (
            <Card className="border-0 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">Sin resultados de laboratorio</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-4">
                    Este paciente aún no cuenta con resultados de laboratorio registrados.
                </p>
                <div className="max-w-sm mx-auto">
                    <SectionFileUpload pacienteId={pacienteId} tipoEstudio="laboratorio" onFileUploaded={() => loadData()} />
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Resultados de Laboratorio</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {usandoNuevaArquitectura ? (estudioCompleto?.estudio.institucion || 'GP Medical Health') : (legacyLab?.laboratorio_nombre || 'Laboratorio')}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <SectionFileUpload pacienteId={pacienteId} tipoEstudio="laboratorio" compact onFileUploaded={() => loadData()} />
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">
                                {lab?.fecha_estudio || lab?.fecha ? new Date(lab.fecha_estudio || lab.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Actual'}
                            </p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parámetros</p>
                            <p className="text-sm font-bold text-slate-700">{totalParams}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border text-center ${abnormalTotal > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alertas</p>
                            <p className={`text-sm font-bold ${abnormalTotal > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{abnormalTotal}</p>
                        </div>
                        {/* ADD PARAMETER BUTTON */}
                        {usandoNuevaArquitectura && estudioCompleto && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-200 flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Agregar
                            </button>
                        )}
                    </div>
                </div>

                {/* Clinical alerts summary */}
                <AlertasResumen resultados={allResults} />
            </div>

            {/* Lab results by group */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {grupos.map((g: any, i: number) => (
                    <GrupoCard
                        key={i}
                        grupo={g.grupo}
                        resultados={g.resultados || []}
                        prevLab={prevLab}
                    />
                ))}
            </div>

            {/* Interpretation */}
            {(estudioCompleto?.estudio.interpretacion || legacyLab?.interpretacion) && (
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                    <h4 className="text-sm font-bold text-blue-800 mb-2">📋 Interpretación</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        {estudioCompleto?.estudio.interpretacion || legacyLab?.interpretacion}
                    </p>
                </div>
            )}

            {/* Previous note */}
            {prevLab && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-[11px] text-slate-500 font-medium">
                        Se conservan estudios previos para análisis de tendencias.
                    </p>
                </div>
            )}

            {/* Add Parameter Modal */}
            {usandoNuevaArquitectura && estudioCompleto && (
                <AgregarParametroModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdded={loadData}
                    estudioId={estudioCompleto.estudio.id}
                    pacienteId={pacienteId}
                    tipoEstudio="laboratorio"
                />
            )}

            {/* Documentos adjuntos de laboratorio */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="laboratorio"
                titulo="Documentos de Laboratorio"
            />
        </div>
    )
}
