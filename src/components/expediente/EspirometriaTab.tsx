// @ts-nocheck
/**
 * EspirometriaTab — Digitalización fiel de espirometría + Análisis Clínico
 *
 * Flujo:
 *   1. Subir PDF → Gemini extrae JSON completo
 *   2. Preview con botones Confirmar / Cancelar
 *   3. Si confirma → guarda en Supabase
 *   4. Sección de Análisis Clínico con KPIs, clasificación GOLD, gráficos
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wind, Upload, Loader2, CheckCircle, AlertTriangle, RefreshCw,
    Save, X, Activity, TrendingUp, Heart, Shield, BarChart3,
    Brain, FileCheck, Zap, Target, Table2, History, Trash2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { SpirometryReport } from './SpirometryReport'
import { analyzeSpirometryDirect } from '@/services/geminiDocumentService'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'
import { EMPRESA_PRINCIPAL_ID } from '@/config/empresa'
import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ReferenceLine, ScatterChart, Scatter, ZAxis
} from 'recharts'

// ─── Hook: cargar espirometría desde Supabase ───
const useSpirometry = (pacienteId: string) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['espirometria', 'spirometry'])
                .order('fecha_estudio', { ascending: false })
                .limit(1)

            if (estudios?.[0]?.datos_extra?.spiroclone_data) {
                setData(estudios[0].datos_extra.spiroclone_data)
            } else {
                setData(null)
            }
        } catch (err) {
            console.error('[Espirometría] Error cargando:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { if (pacienteId) load() }, [pacienteId])

    return { data, loading, reload: load }
}

// ─── Hook: upload + extracción IA (con preview antes de guardar) ───
const useSpirometryUpload = (pacienteId: string, empresaId: string, userId: string | undefined, userName: string | undefined, userRol: string | undefined, onComplete: () => void) => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null) // Guardar archivo original
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError(null)
        setPreviewData(null)
        setOriginalFile(file)
        setProgress('Analizando documento con IA...')

        try {
            const spiroData = await analyzeSpirometryDirect('', [file])

            if (!spiroData?.results?.length) {
                throw new Error('La IA no pudo extraer los parámetros espirométricos del documento.')
            }

            setProgress(`✅ ${spiroData.results.length} parámetros extraídos. Revisa y confirma.`)
            setPreviewData(spiroData)
        } catch (err: any) {
            console.error('[SpiroUpload] Error:', err)
            setError(err.message || 'Error al procesar el documento')
            setOriginalFile(null)
        } finally {
            setUploading(false)
        }
    }

    // Confirmar y guardar en BD + archivo
    const confirmSave = async () => {
        if (!previewData) return
        setSaving(true)
        try {
            // 1. Guardar datos extraídos en estudios_clinicos
            const { error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'espirometria',
                fecha_estudio: new Date().toISOString().split('T')[0],
                datos_extra: {
                    spiroclone_data: previewData,
                    _source: 'SpiroClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            })
            if (dbErr) throw dbErr

            // 2. Guardar archivo original en Storage (renombrado)
            if (originalFile) {
                try {
                    let eid = empresaId
                    if (!eid) {
                        const { data: pac } = await supabase.from('pacientes').select('empresa_id').eq('id', pacienteId).single()
                        eid = pac?.empresa_id || ''
                    }
                    if (!eid) eid = EMPRESA_PRINCIPAL_ID
                    if (eid) {
                        const patientName = previewData.patient?.name || 'Paciente'
                        const fecha = new Date().toISOString().split('T')[0]
                        const ext = originalFile.name.split('.').pop() || 'pdf'
                        const renamedFile = new File(
                            [originalFile],
                            `Espirometria_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                            { type: originalFile.type }
                        )
                        await secureStorageService.upload(renamedFile, {
                            pacienteId,
                            empresaId: eid,
                            categoria: 'espirometria',
                            subcategoria: 'reporte_original',
                            descripcion: `Espirometría de ${patientName} — ${fecha}`,
                            userId,
                            userNombre: userName,
                            userRol: userRol,
                        })
                        console.log('📎 Archivo espirometría guardado en Storage')
                    }
                } catch (storageErr) {
                    console.warn('⚠️ No se pudo guardar el archivo original:', storageErr)
                }
            }

            setPreviewData(null)
            setOriginalFile(null)
            onComplete()
        } catch (err: any) {
            setError(err.message || 'Error al guardar en base de datos')
        } finally {
            setSaving(false)
        }
    }

    const cancelPreview = () => {
        setPreviewData(null)
        setOriginalFile(null)
        setProgress('')
        setError(null)
    }

    const triggerUpload = () => fileInputRef.current?.click()

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
        if (e.target) e.target.value = ''
    }

    return { uploading, saving, progress, error, previewData, fileInputRef, triggerUpload, onFileSelected, confirmSave, cancelPreview }
}

// ──────────────────────────────────
// ANALYTICS HELPERS
// ──────────────────────────────────

const parseNum = (v: string | undefined | null): number | null => {
    if (!v) return null
    const cleaned = v.replace(/[^0-9.\-]/g, '')
    const n = parseFloat(cleaned)
    return isNaN(n) ? null : n
}

const getParamValue = (results: any[], paramName: string, field: string): number | null => {
    const row = results.find((r: any) =>
        r.parameter?.toLowerCase().includes(paramName.toLowerCase())
    )
    if (!row) return null
    return parseNum(row[field])
}

// GOLD classification
const classifyGOLD = (fev1Pct: number | null, fev1fvc: number | null, lln: number | null): { stage: string; color: string; bg: string; border: string; desc: string } => {
    if (fev1fvc === null || fev1Pct === null) return { stage: 'Sin datos', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', desc: 'No hay suficientes datos para clasificar' }

    // If FEV1/FVC is above LLN (or above 0.70 as fallback), no obstruction
    const threshold = lln !== null ? lln : 0.70
    if (fev1fvc >= threshold) return { stage: 'Normal', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Sin obstrucción al flujo aéreo' }

    if (fev1Pct >= 80) return { stage: 'GOLD I — Leve', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Obstrucción leve' }
    if (fev1Pct >= 50) return { stage: 'GOLD II — Moderada', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Obstrucción moderada' }
    if (fev1Pct >= 30) return { stage: 'GOLD III — Grave', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Obstrucción grave' }
    return { stage: 'GOLD IV — Muy grave', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', desc: 'Obstrucción muy grave' }
}

// Pattern classification: Normal, Obstructivo, Restrictivo, Mixto
const classifyPattern = (fvcPct: number | null, fev1Pct: number | null, fev1fvc: number | null): { pattern: string; icon: string; color: string } => {
    if (fvcPct === null || fev1Pct === null || fev1fvc === null) return { pattern: 'Indeterminado', icon: '❓', color: 'text-slate-500' }

    const isLowFVC = fvcPct < 80
    const isLowRatio = fev1fvc < 0.70

    if (!isLowFVC && !isLowRatio) return { pattern: 'Normal', icon: '✅', color: 'text-emerald-600' }
    if (!isLowFVC && isLowRatio) return { pattern: 'Obstructivo', icon: '🔴', color: 'text-red-600' }
    if (isLowFVC && !isLowRatio) return { pattern: 'Restrictivo', icon: '🟡', color: 'text-amber-600' }
    return { pattern: 'Mixto', icon: '🟠', color: 'text-orange-600' }
}

// BMI classification
const classifyBMI = (bmi: number | null): { label: string; color: string; icon: string } => {
    if (bmi === null) return { label: 'N/A', color: 'text-slate-400', icon: '—' }
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-500', icon: '⬇️' }
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500', icon: '✅' }
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-500', icon: '⚠️' }
    if (bmi < 35) return { label: 'Obesidad I', color: 'text-orange-500', icon: '🔶' }
    return { label: 'Obesidad II+', color: 'text-red-500', icon: '🔴' }
}

// ──────────────────────────────────
// ANALYTICS SECTION COMPONENT
// ──────────────────────────────────
function SpirometryAnalytics({ data }: { data: any }) {
    const analytics = useMemo(() => {
        if (!data?.results?.length) return null

        const results = data.results
        const fvcPct = getParamValue(results, 'FVC', 'percentPred')
        const fev1Pct = getParamValue(results, 'FEV1', 'percentPred')
        const fev1FvcBest = getParamValue(results, 'FEV1/FVC', 'mejor') ?? getParamValue(results, 'FEV1%FVC', 'mejor')
        const fev1FvcLln = getParamValue(results, 'FEV1/FVC', 'lln') ?? getParamValue(results, 'FEV1%FVC', 'lln')
        const pefPct = getParamValue(results, 'PEF', 'percentPred')
        const fef2575Pct = getParamValue(results, 'FEF25-75', 'percentPred')
        const bmi = parseNum(data.patient?.bmi)

        // Normalize ratio (could be 0-1 or 0-100)
        let ratio = fev1FvcBest
        if (ratio !== null && ratio > 1) ratio = ratio / 100

        const gold = classifyGOLD(fev1Pct, ratio, fev1FvcLln ? (fev1FvcLln > 1 ? fev1FvcLln / 100 : fev1FvcLln) : null)
        const pattern = classifyPattern(fvcPct, fev1Pct, ratio)
        const bmiClass = classifyBMI(bmi)

        // Bar chart data
        const barData = [
            { name: 'FVC', pct: fvcPct ?? 0, fill: (fvcPct ?? 0) >= 80 ? '#10b981' : '#f59e0b' },
            { name: 'FEV1', pct: fev1Pct ?? 0, fill: (fev1Pct ?? 0) >= 80 ? '#10b981' : '#f59e0b' },
            { name: 'PEF', pct: pefPct ?? 0, fill: (pefPct ?? 0) >= 80 ? '#10b981' : '#f59e0b' },
            { name: 'FEF25-75', pct: fef2575Pct ?? 0, fill: (fef2575Pct ?? 0) >= 60 ? '#10b981' : '#f59e0b' },
        ]

        // Radar chart data
        const radarData = [
            { param: 'FVC', value: fvcPct ?? 0, fullMark: 150 },
            { param: 'FEV1', value: fev1Pct ?? 0, fullMark: 150 },
            { param: 'PEF', value: pefPct ?? 0, fullMark: 150 },
            { param: 'FEF25-75', value: fef2575Pct ?? 0, fullMark: 150 },
            { param: 'FEV1/FVC', value: ratio !== null ? ratio * 100 : 0, fullMark: 150 },
        ]

        // Z-Score scatter data
        const zScoreData = results.map((r: any) => {
            const zVal = parseNum(r.zScore)
            const shortName = (r.parameter || '').split(' ')[0].replace('[', '').replace(']', '')
            return {
                name: shortName,
                z: zVal ?? 0,
                fill: zVal !== null && zVal >= -1.64 ? '#10b981' : '#ef4444',
            }
        }).filter((d: any) => d.name && d.z !== 0)

        // Variability between trials (ATS criterion: best 2 FVC within 150ml, best 2 FEV1 within 150ml)
        const fvcRow = results.find((r: any) => r.parameter?.includes('FVC') && !r.parameter?.includes('FEV1'))
        const fev1Row = results.find((r: any) => r.parameter?.includes('FEV1') && !r.parameter?.includes('FVC'))
        const getTrialValues = (row: any) => {
            if (!row) return []
            return [parseNum(row.mejor), parseNum(row.prueba2), parseNum(row.prueba5), parseNum(row.prueba6)].filter(v => v !== null) as number[]
        }
        const fvcTrials = getTrialValues(fvcRow)
        const fev1Trials = getTrialValues(fev1Row)
        const calcVariability = (trials: number[]) => {
            if (trials.length < 2) return null
            const sorted = [...trials].sort((a, b) => b - a)
            return Math.round((sorted[0] - sorted[1]) * 1000) // ml
        }
        const fvcVariability = calcVariability(fvcTrials)
        const fev1Variability = calcVariability(fev1Trials)

        // ATS Quality Grade
        const getATSGrade = (fvcVar: number | null, fev1Var: number | null): { grade: string; color: string; desc: string } => {
            if (fvcVar === null || fev1Var === null) return { grade: '—', color: 'text-slate-400', desc: 'Datos insuficientes' }
            if (fvcVar <= 150 && fev1Var <= 150) return { grade: 'A', color: 'text-emerald-600', desc: 'Excelente reproducibilidad' }
            if (fvcVar <= 200 && fev1Var <= 200) return { grade: 'B', color: 'text-blue-600', desc: 'Buena reproducibilidad' }
            if (fvcVar <= 250 && fev1Var <= 250) return { grade: 'C', color: 'text-amber-600', desc: 'Aceptable' }
            return { grade: 'D', color: 'text-red-600', desc: 'Reproducibilidad deficiente' }
        }
        const atsGrade = getATSGrade(fvcVariability, fev1Variability)

        // Small airways
        const fef2575ZScore = getParamValue(results, 'FEF25-75', 'zScore')
        const smallAirways = {
            affected: fef2575Pct !== null && fef2575Pct < 65,
            pct: fef2575Pct,
            zScore: fef2575ZScore,
        }

        return {
            fvcPct, fev1Pct, pefPct, fef2575Pct, ratio, bmi,
            gold, pattern, bmiClass, barData, radarData,
            zScoreData, fvcVariability, fev1Variability, atsGrade, smallAirways,
            results,
        }
    }, [data])

    if (!analytics) return null

    const { gold, pattern, bmiClass, barData, radarData, fvcPct, fev1Pct, ratio,
        zScoreData, fvcVariability, fev1Variability, atsGrade, smallAirways, results } = analytics

    return (
        <div className="space-y-6">
            {/* Section header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Análisis Clínico</h3>
                    <p className="text-xs text-slate-400 font-medium">Interpretación automática de los datos extraídos</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* FEV1/FVC Ratio */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">FEV1/FVC</p>
                    <p className="text-3xl font-black text-slate-800">
                        {ratio !== null ? (ratio * 100).toFixed(0) : '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">%</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${ratio !== null && ratio >= 0.70 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {ratio !== null && ratio >= 0.70 ? '✅ Normal' : '⚠️ Disminuido'}
                    </p>
                </div>

                {/* FEV1 %Pred */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">FEV1 %Pred</p>
                    <p className="text-3xl font-black text-slate-800">
                        {fev1Pct !== null ? fev1Pct.toFixed(0) : '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">%</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${(fev1Pct ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {(fev1Pct ?? 0) >= 80 ? '✅ Normal' : '⚠️ Bajo'}
                    </p>
                </div>

                {/* FVC %Pred */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">FVC %Pred</p>
                    <p className="text-3xl font-black text-slate-800">
                        {fvcPct !== null ? fvcPct.toFixed(0) : '—'}
                        <span className="text-sm font-bold text-slate-400 ml-1">%</span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${(fvcPct ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {(fvcPct ?? 0) >= 80 ? '✅ Normal' : '⚠️ Bajo'}
                    </p>
                </div>

                {/* Calidad sesión */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Calidad Sesión</p>
                    <p className="text-lg font-black text-slate-800 truncate">{data.session?.quality || '—'}</p>
                    <p className="text-xs font-bold mt-1 text-cyan-600">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        {data.session?.interpretation || 'N/A'}
                    </p>
                </div>
            </div>

            {/* Classification Cards: GOLD + Pattern + Risk Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GOLD Classification */}
                <div className={`rounded-2xl border p-5 ${gold.bg} ${gold.border}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Clasificación GOLD</p>
                    </div>
                    <p className={`text-xl font-black ${gold.color}`}>{gold.stage}</p>
                    <p className="text-xs text-slate-500 mt-1">{gold.desc}</p>
                </div>

                {/* Pattern */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Patrón Ventilatorio</p>
                    </div>
                    <p className={`text-xl font-black ${pattern.color}`}>
                        {pattern.icon} {pattern.pattern}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Basado en FVC, FEV1 y FEV1/FVC
                    </p>
                </div>

                {/* Risk factors */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Factores de Riesgo</p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">IMC</span>
                            <span className={`font-bold ${bmiClass.color}`}>{bmiClass.icon} {data.patient?.bmi || '—'} ({bmiClass.label})</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Fumador</span>
                            <span className={`font-bold ${data.patient?.smoker?.toLowerCase().includes('no') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {data.patient?.smoker || '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Asma</span>
                            <span className="font-bold text-slate-700">{data.patient?.asthma || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">EPOC</span>
                            <span className="font-bold text-slate-700">{data.patient?.copd || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart: % Predicho */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-violet-500" />
                        Porcentaje del Predicho
                    </h4>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 140]} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                                <ReferenceLine x={80} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'LLN 80%', position: 'top', fontSize: 10 }} />
                                <Bar dataKey="pct" radius={[0, 8, 8, 0]} barSize={24}>
                                    {barData.map((entry, idx) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-cyan-500" />
                        Perfil Ventilatorio (Radar)
                    </h4>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={70} data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="param" tick={{ fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fontSize: 9 }} />
                                <Radar name="Paciente" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                                <Radar name="Normal (100%)" dataKey="fullMark" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Z-Score Scatter ── */}
            {zScoreData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-500" />
                        Puntuaciones Z por Parámetro
                    </h4>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={zScoreData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" domain={[-5, 3]} tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                                <Tooltip formatter={(v: any) => `Z: ${v}`} contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                                <ReferenceLine x={-1.64} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'LLN (-1.64)', position: 'top', fontSize: 9 }} />
                                <ReferenceLine x={0} stroke="#64748b" strokeWidth={1} />
                                <Bar dataKey="z" radius={[0, 6, 6, 0]} barSize={18}>
                                    {zScoreData.map((entry: any, idx: number) => (
                                        <Cell key={idx} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Valores por debajo de -1.64 (LLN) se consideran fuera del rango normal</p>
                </div>
            )}

            {/* ── Variabilidad + Calidad ATS/ERS + Vía Aérea Pequeña ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Calidad ATS/ERS */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <FileCheck className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Calidad ATS/ERS</p>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className={`text-5xl font-black ${atsGrade.color}`}>{atsGrade.grade}</span>
                        <span className="text-xs text-slate-500 pb-2">{atsGrade.desc}</span>
                    </div>
                </div>

                {/* Variabilidad entre pruebas */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Variabilidad</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">FVC (2 mejores)</span>
                            <span className={`text-sm font-black ${fvcVariability !== null && fvcVariability <= 150 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {fvcVariability !== null ? `${fvcVariability} ml` : '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">FEV1 (2 mejores)</span>
                            <span className={`text-sm font-black ${fev1Variability !== null && fev1Variability <= 150 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {fev1Variability !== null ? `${fev1Variability} ml` : '—'}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Criterio ATS: ≤150 ml entre las 2 mejores</p>
                    </div>
                </div>

                {/* Vía aérea pequeña */}
                <div className={`rounded-2xl border p-5 shadow-sm ${smallAirways.affected ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Wind className="w-5 h-5 text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Vía Aérea Pequeña</p>
                    </div>
                    <p className={`text-lg font-black ${smallAirways.affected ? 'text-amber-700' : 'text-emerald-600'}`}>
                        {smallAirways.affected ? '⚠️ Posible afectación' : '✅ Sin afectación'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        FEF25-75: {smallAirways.pct !== null ? `${smallAirways.pct.toFixed(0)}% pred` : '—'}
                        {smallAirways.zScore !== null && ` (Z: ${smallAirways.zScore.toFixed(2)})`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Indicador temprano de enfermedad obstructiva</p>
                </div>
            </div>

            {/* ── Tabla detallada de parámetros ── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
                <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-slate-500" />
                    Tabla Detallada de Parámetros
                </h4>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-left py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Parámetro</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Predicho</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">LLN</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-blue-600">Mejor</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-blue-600">%Pred</th>
                            <th className="text-right py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Z-Score</th>
                            <th className="text-center py-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row: any, idx: number) => {
                            const pct = parseNum(row.percentPred)
                            const z = parseNum(row.zScore)
                            const isLow = (pct !== null && pct < 80) || (z !== null && z < -1.64)
                            return (
                                <tr key={idx} className={`border-b border-slate-100 ${isLow ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="py-2 px-2 font-semibold text-slate-700">{row.parameter}</td>
                                    <td className="py-2 px-2 text-right text-slate-500">{row.pred || '—'}</td>
                                    <td className="py-2 px-2 text-right text-slate-500">{row.lln || '—'}</td>
                                    <td className="py-2 px-2 text-right font-bold text-blue-700">{row.mejor || '—'}</td>
                                    <td className={`py-2 px-2 text-right font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>{row.percentPred || '—'}</td>
                                    <td className={`py-2 px-2 text-right font-medium ${z !== null && z < -1.64 ? 'text-red-600' : 'text-slate-600'}`}>{row.zScore || '—'}</td>
                                    <td className="py-2 px-2 text-center">
                                        {isLow ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">⚠️ Bajo</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✅ Normal</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* AI Interpretation */}
            {data.doctor?.notes && (
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-indigo-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Notas del Médico</p>
                    </div>
                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">{data.doctor.notes}</p>
                </div>
            )}
        </div>
    )
}

// ─── Componente principal ───
export default function EspirometriaTab({ pacienteId }: { pacienteId: string }) {
    const { user } = useAuth()
    const { data, loading, reload } = useSpirometry(pacienteId)
    const [activeView, setActiveView] = useState<'espirografia' | 'analisis'>('espirografia')
    const upload = useSpirometryUpload(
        pacienteId,
        user?.empresa_id || '',
        user?.id,
        user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : undefined,
        user?.rol,
        reload
    )

    // ── Loading ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Wind className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando espirometría...</p>
        </div>
    )

    // ── Preview mode (extraído pero no guardado) ──
    if (upload.previewData) return (
        <div className="space-y-5">
            {/* Confirmation banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-5 shadow-lg"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-amber-900">Vista previa — Sin guardar</h3>
                            <p className="text-xs text-amber-700">{upload.progress}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={upload.cancelPreview}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={upload.confirmSave}
                            disabled={upload.saving}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-lg shadow-emerald-200/50 transition-all disabled:opacity-50"
                        >
                            {upload.saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Confirmar y Guardar</>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {upload.error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{upload.error}</p>
                </div>
            )}

            {/* Preview of SpirometryReport */}
            <div className="overflow-x-auto bg-slate-50/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                <div className="min-w-[800px]">
                    <SpirometryReport data={upload.previewData} />
                </div>
            </div>
        </div>
    )

    // ── Sin datos → Subir PDF ──
    if (!data) return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wind className="w-8 h-8 text-cyan-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">Sin registros de espirometría</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
                    Sube el PDF del reporte de espirometría y la IA extraerá automáticamente
                    todos los datos, tablas y gráficas para crear la réplica digital.
                </p>

                {/* Upload */}
                <input
                    ref={upload.fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf,image/*"
                    onChange={upload.onFileSelected}
                    className="hidden"
                />

                {upload.uploading ? (
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                            <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                            <p className="text-sm font-medium text-cyan-800">{upload.progress}</p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={upload.triggerUpload}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <Upload className="w-5 h-5" />
                        Subir Reporte de Espirometría
                    </button>
                )}

                {upload.error && (
                    <div className="mt-6 max-w-sm mx-auto flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{upload.error}</p>
                    </div>
                )}

                <p className="text-[10px] text-slate-400 mt-6">
                    Powered by Gemini Pro — Extracción completa con gráficas, tablas y diagnóstico
                </p>
            </CardContent>
        </Card>
    )

    const handleDelete = async () => {
        if (!pacienteId) return
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta espirometría?')) return

        try {
            // Obtener el estudio más reciente
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('id')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['espirometria', 'spirometry'])
                .order('fecha_estudio', { ascending: false })
                .limit(1)

            const studyId = estudios?.[0]?.id
            if (!studyId) {
                alert('No se encontró el estudio para eliminar.')
                return
            }

            await supabase.from('resultados_estudio').delete().eq('estudio_id', studyId)
            await supabase.from('estudios_clinicos').delete().eq('id', studyId)
            alert('Estudio eliminado con éxito')
            reload()
        } catch (err: any) {
            console.error('Error eliminando espirometría:', err)
            alert('No se pudo eliminar: ' + err.message)
        }
    }

    // ── Con datos → SpirometryReport + Analytics ──
    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                            <Wind className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Espirometría</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {data.doctor?.name || 'GP Medical Health'} — {data.testDetails?.date || ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Eliminar estudio"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        {/* Resultado */}
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Interpretación</p>
                            <p className="text-sm font-bold text-emerald-700">
                                {data.session?.interpretation || 'N/A'}
                            </p>
                        </div>

                        {/* Re-upload */}
                        <input
                            ref={upload.fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf,image/*"
                            onChange={upload.onFileSelected}
                            className="hidden"
                        />
                        <button
                            onClick={upload.triggerUpload}
                            disabled={upload.uploading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-cyan-700 border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {upload.uploading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                            ) : (
                                <><RefreshCw className="w-3.5 h-3.5" /> Actualizar Espirometría</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notas del doctor */}
                {data.doctor?.notes && (
                    <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-emerald-700">{data.doctor.notes}</p>
                    </div>
                )}

                {upload.uploading && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                        <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                        <p className="text-sm font-medium text-cyan-700">{upload.progress}</p>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SELECTION TABS                                            */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
                <button
                    onClick={() => setActiveView('espirografia')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'espirografia'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    <Wind className="w-4 h-4" />
                    Espirografía Extraída
                </button>
                <button
                    onClick={() => setActiveView('analisis')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'analisis'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                >
                    <Activity className="w-4 h-4" />
                    Análisis Clínico
                </button>
            </div>

            {/* SECTIONS */}
            {activeView === 'espirografia' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-xs text-slate-400 font-medium mb-3 ml-1">Réplica digital completa del reporte original de espirometría</p>
                    <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-slate-100/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="w-full min-w-[800px]">
                            <SpirometryReport data={data} />
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'analisis' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SpirometryAnalytics data={data} />
                </div>
            )}

            {/* Documentos adjuntos */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="espirometria"
                titulo="Reporte Original"
                collapsedByDefault={false}
            />
        </div>
    )
}
