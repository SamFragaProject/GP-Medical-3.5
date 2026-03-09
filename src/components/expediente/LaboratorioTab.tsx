// @ts-nocheck
/**
 * LaboratorioTab — Extracción directa con IA (LabClone) + Análisis Clínico Interactivo
 *
 * Flujo idéntico a Espirometría:
 *   1. Subir PDF → Gemini extrae JSON completo con exams/results
 *   2. Preview con botones Confirmar / Cancelar
 *   3. Si confirma → guarda en estudios_clinicos + archivo en Storage
 *   4. Vista 1: Reporte extraído (réplica digital)
 *   5. Vista 2: Análisis IA (gráficos interactivos, semáforos, barras, radar, etc.)
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FlaskConical, Upload, Loader2, CheckCircle, AlertTriangle, RefreshCw,
    Save, X, Activity, TrendingUp, TrendingDown, Minus, Brain, Shield,
    BarChart3, Zap, Target, FileCheck, Table2, Eye, Beaker
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { analyzeLabDirect } from '@/services/geminiDocumentService'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'
import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ReferenceLine, PieChart, Pie
} from 'recharts'

// ─── Hook: cargar laboratorio desde Supabase (datos extraídos por LabClone) ───
const useLaboratorio = (pacienteId: string) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['laboratorio_directo', 'laboratorio'])
                .order('fecha_estudio', { ascending: false })
                .limit(1)

            if (estudios?.[0]?.datos_extra?.labclone_data) {
                setData(estudios[0].datos_extra.labclone_data)
            } else {
                setData(null)
            }
        } catch (err) {
            console.error('[Laboratorio] Error cargando:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { if (pacienteId) load() }, [pacienteId])
    return { data, loading, reload: load }
}

// ─── Hook: upload + IA extraction (con preview) ───
const useLabUpload = (
    pacienteId: string, empresaId: string,
    userId: string | undefined, userName: string | undefined, userRol: string | undefined,
    onComplete: () => void
) => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError(null)
        setPreviewData(null)
        setOriginalFile(file)
        setProgress('Analizando documento con IA...')

        try {
            const labData = await analyzeLabDirect('', [file])
            const totalParams = labData.exams?.reduce((acc: number, e: any) => acc + (e.results?.length || 0), 0) || 0

            if (totalParams === 0) {
                throw new Error('La IA no pudo extraer parámetros de laboratorio del documento.')
            }

            setProgress(`✅ ${totalParams} parámetros de ${labData.exams?.length || 0} exámenes extraídos. Revisa y confirma.`)
            setPreviewData(labData)
        } catch (err: any) {
            console.error('[LabUpload] Error:', err)
            setError(err.message || 'Error al procesar el documento')
            setOriginalFile(null)
        } finally {
            setUploading(false)
        }
    }

    const confirmSave = async () => {
        if (!previewData) return
        setSaving(true)
        try {
            const { error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'laboratorio_directo',
                fecha_estudio: new Date().toISOString().split('T')[0],
                datos_extra: {
                    labclone_data: previewData,
                    _source: 'LabClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            })
            if (dbErr) throw dbErr

            if (originalFile && empresaId) {
                try {
                    const patientName = previewData.patientInfo?.name || 'Paciente'
                    const fecha = new Date().toISOString().split('T')[0]
                    const ext = originalFile.name.split('.').pop() || 'pdf'
                    const renamedFile = new File(
                        [originalFile],
                        `Laboratorio_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                        { type: originalFile.type }
                    )
                    await secureStorageService.upload(renamedFile, {
                        pacienteId,
                        empresaId,
                        categoria: 'laboratorio',
                        subcategoria: 'reporte_original',
                        descripcion: `Laboratorios de ${patientName} — ${fecha}`,
                        userId,
                        userNombre: userName,
                        userRol: userRol,
                    })
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

// ──────────────────────────────────────────
// LAB REPORT COMPONENT (réplica del PDF)
// ──────────────────────────────────────────
function LabReport({ data }: { data: any }) {
    if (!data) return null
    return (
        <div className="bg-white text-slate-800 w-full rounded-2xl overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">
                            {data.patientInfo?.laboratoryName || 'REPORTE DE LABORATORIO'}
                        </h1>
                        <p className="text-emerald-300 text-xs mt-1 font-medium uppercase tracking-widest">Resultados de Análisis Clínicos</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/50 text-[9px] uppercase tracking-widest">Folio</p>
                        <p className="text-lg font-black text-white">{data.patientInfo?.folio || '—'}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
                {/* Patient Card */}
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200 p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Datos del Paciente</p>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{data.patientInfo?.name || '—'}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Edad', value: data.patientInfo?.age },
                            { label: 'Sexo', value: data.patientInfo?.gender },
                            { label: 'F. Nacimiento', value: data.patientInfo?.dob },
                            { label: 'Fecha Registro', value: data.patientInfo?.registrationDate },
                            { label: 'Médico', value: data.patientInfo?.doctor },
                            { label: 'Impresión', value: data.patientInfo?.printDate },
                        ].filter(f => f.value).map((f, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{f.label}</p>
                                <p className="text-xs font-bold text-slate-800">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exams */}
                {data.exams?.map((exam: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 rounded-xl">
                            <h3 className="text-sm font-black text-white">{exam.examName}</h3>
                            <div className="flex gap-4 mt-1">
                                {exam.method && <p className="text-[10px] text-emerald-200">Método: {exam.method}</p>}
                                {exam.sampleType && <p className="text-[10px] text-emerald-200">Muestra: {exam.sampleType}</p>}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="grid grid-cols-12 gap-0 bg-slate-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <span className="col-span-4">Parámetro</span>
                                <span className="col-span-2 text-center">Resultado</span>
                                <span className="col-span-2 text-center">Unidad</span>
                                <span className="col-span-2 text-center">Absolutos</span>
                                <span className="col-span-2 text-right">Referencia</span>
                            </div>
                            {exam.results?.map((r: any, ri: number) => {
                                const showGroup = ri === 0 || r.groupName !== exam.results[ri - 1]?.groupName
                                return (
                                    <div key={ri}>
                                        {showGroup && r.groupName && (
                                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                                                <p className="text-xs font-black text-slate-700">{r.groupName}</p>
                                            </div>
                                        )}
                                        <div className={`grid grid-cols-12 gap-0 px-4 py-2 text-xs border-t border-slate-50 items-center ${r.isAbnormal ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                                            <span className="col-span-4 font-medium text-slate-700">{r.parameter}</span>
                                            <span className={`col-span-2 text-center font-black tabular-nums ${r.isAbnormal ? 'text-red-600' : 'text-slate-900'}`}>
                                                {r.value}
                                            </span>
                                            <span className="col-span-2 text-center text-slate-400 text-[10px]">{r.unit}</span>
                                            <span className="col-span-2 text-center text-slate-500 text-[10px]">{r.absolutes || ''}</span>
                                            <span className="col-span-2 text-right text-slate-400 text-[10px]">{r.referenceValue}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {/* Signatures */}
                {data.signatures?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                        {data.signatures.map((sig: any, i: number) => (
                            <div key={i} className="text-center px-8">
                                <div className="w-48 border-b border-slate-300 mb-2 mx-auto" />
                                <p className="text-[10px] tracking-[0.3em] text-slate-400 mb-1">A T E N T A M E N T E</p>
                                <p className="text-xs font-bold text-slate-700">{sig.name}</p>
                                {sig.title && <p className="text-[10px] text-slate-500">{sig.title}</p>}
                                {sig.id && <p className="text-[10px] text-slate-500">{sig.id}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ──────────────────────────────────────────
// LAB ANALYTICS COMPONENT
// ──────────────────────────────────────────
function LabAnalytics({ data }: { data: any }) {
    if (!data) return null

    const allResults = useMemo(() => {
        return data.exams?.flatMap((e: any) =>
            (e.results || []).map((r: any) => ({ ...r, examName: e.examName }))
        ) || []
    }, [data])

    const totalParams = allResults.length
    const abnormalCount = allResults.filter((r: any) => r.isAbnormal).length
    const normalCount = totalParams - abnormalCount

    // Parse numeric results for charts
    const numericResults = useMemo(() => {
        return allResults.filter((r: any) => {
            const val = parseFloat(String(r.value || '').replace(/[<>,]/g, ''))
            if (isNaN(val)) return false
            // Parse reference range
            const refStr = String(r.referenceValue || '')
            const parts = refStr.replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
            return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])
        }).map((r: any) => {
            const val = parseFloat(String(r.value || '').replace(/[<>,]/g, ''))
            const refStr = String(r.referenceValue || '')
            const parts = refStr.replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
            const min = parts[0], max = parts[1]
            const pct = ((val - min) / (max - min)) * 100
            return { ...r, numValue: val, refMin: min, refMax: max, pctInRange: pct }
        })
    }, [allResults])

    // Group by exam for radar/distribution
    const examGroups = useMemo(() => {
        const groups: Record<string, { total: number; abnormal: number }> = {}
        allResults.forEach((r: any) => {
            const name = r.examName || 'Otros'
            if (!groups[name]) groups[name] = { total: 0, abnormal: 0 }
            groups[name].total++
            if (r.isAbnormal) groups[name].abnormal++
        })
        return Object.entries(groups).map(([name, { total, abnormal }]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '…' : name,
            fullName: name,
            total, abnormal, normal: total - abnormal,
            pctNormal: Math.round(((total - abnormal) / total) * 100)
        }))
    }, [allResults])

    // Abnormal results for detail
    const abnormalResults = allResults.filter((r: any) => r.isAbnormal)

    // Bar chart data for numeric results
    const barData = numericResults.slice(0, 20).map((r: any) => ({
        name: (r.parameter || '').length > 12 ? (r.parameter || '').slice(0, 12) + '…' : r.parameter,
        value: r.numValue,
        min: r.refMin,
        max: r.refMax,
        isAbnormal: r.isAbnormal,
    }))

    // Pie chart data
    const pieData = [
        { name: 'Normal', value: normalCount, fill: '#10b981' },
        { name: 'Alterado', value: abnormalCount, fill: '#f59e0b' },
    ]

    const COLORS_BAR = barData.map((d: any) => d.isAbnormal ? '#ef4444' : '#10b981')

    return (
        <div className="space-y-5">
            {/* KPI Header */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-black text-base">Análisis Clínico de Laboratorio</p>
                        <p className="text-emerald-200 text-xs">{data.patientInfo?.name} — {data.patientInfo?.registrationDate || ''}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Exámenes', count: data.exams?.length || 0, color: 'bg-white/10 text-white' },
                        { label: 'Parámetros', count: totalParams, color: 'bg-cyan-500/20 text-cyan-200' },
                        { label: 'Normales', count: normalCount, color: 'bg-emerald-500/20 text-emerald-200' },
                        { label: 'Alterados', count: abnormalCount, color: 'bg-amber-500/20 text-amber-200' },
                    ].map(({ label, count, color }) => (
                        <div key={label} className={`p-3 rounded-xl ${color} text-center`}>
                            <p className="text-3xl font-black">{count}</p>
                            <p className="text-xs font-bold opacity-80">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Distribution Overview: Pie + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Distribución Global</p>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                    paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}>
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-600 font-medium">Normal ({normalCount})</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-slate-600 font-medium">Alterado ({abnormalCount})</span></div>
                    </div>
                </div>

                {/* Radar by Exam Group */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">% Normal por Examen</p>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <RadarChart data={examGroups}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="% Normal" dataKey="pctNormal" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Tooltip formatter={(v: number) => `${v}%`} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bar Chart — Values vs Reference */}
            {barData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Valores vs Rango de Referencia</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer>
                            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.[0]) return null
                                    const d = payload[0].payload
                                    return (
                                        <div className="bg-white p-3 rounded-xl shadow-lg border text-xs">
                                            <p className="font-bold text-slate-800">{d.name}</p>
                                            <p>Valor: <span className="font-black">{d.value}</span></p>
                                            <p className="text-slate-400">Ref: {d.min} – {d.max}</p>
                                        </div>
                                    )
                                }} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                                    {barData.map((_, i) => <Cell key={i} fill={COLORS_BAR[i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Animated Value Bars for ALL numeric results */}
            {numericResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Posición dentro del Rango</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {numericResults.slice(0, 30).map((r: any, i: number) => {
                            const rangeExtMin = r.refMin * 0.7
                            const rangeExtMax = r.refMax * 1.3
                            const totalRange = rangeExtMax - rangeExtMin
                            const minPct = ((r.refMin - rangeExtMin) / totalRange) * 100
                            const maxPct = ((r.refMax - rangeExtMin) / totalRange) * 100
                            const valPct = Math.max(2, Math.min(98, ((r.numValue - rangeExtMin) / totalRange) * 100))
                            const isHigh = r.numValue > r.refMax
                            const isLow = r.numValue < r.refMin
                            const isNorm = !isHigh && !isLow

                            return (
                                <div key={i} className={`p-3 rounded-xl border ${isNorm ? 'border-slate-100 bg-white' : isHigh ? 'border-red-100 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[60%]">{r.parameter}</span>
                                        <div className="text-right">
                                            <span className={`text-sm font-black tabular-nums ${isNorm ? 'text-emerald-700' : isHigh ? 'text-red-700' : 'text-blue-700'}`}>{r.numValue}</span>
                                            <span className="text-[9px] text-slate-400 ml-1">{r.unit}</span>
                                        </div>
                                    </div>
                                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="absolute top-0 h-full bg-emerald-100 rounded-full"
                                            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                                        <motion.div className={`absolute top-0.5 bottom-0.5 w-2 rounded-full shadow-sm ${isNorm ? 'bg-emerald-500' : isHigh ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ left: `calc(${valPct}% - 4px)` }}
                                            initial={{ left: `calc(${minPct}% - 4px)`, opacity: 0 }}
                                            animate={{ left: `calc(${valPct}% - 4px)`, opacity: 1 }}
                                            transition={{ delay: i * 0.03, duration: 0.7, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium">
                                        <span>{r.refMin}</span>
                                        <span className={`font-bold ${isNorm ? 'text-emerald-600' : isHigh ? 'text-red-600' : 'text-blue-600'}`}>
                                            {isNorm ? '✓ Normal' : isHigh ? '↑ Elevado' : '↓ Bajo'}
                                        </span>
                                        <span>{r.refMax}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Abnormal Detail */}
            {abnormalResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-amber-700">Parámetros Fuera de Rango — Detalle</p>
                    </div>
                    <div className="space-y-2">
                        {abnormalResults.map((r: any, i: number) => (
                            <motion.div key={i}
                                initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-amber-50 border-amber-200">
                                <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{r.parameter}</p>
                                    <p className="text-[10px] text-slate-400">{r.examName}</p>
                                </div>
                                <span className="text-sm font-black tabular-nums text-amber-700">{r.value} {r.unit}</span>
                                {r.referenceValue && <span className="text-[10px] text-slate-400 hidden sm:block">Ref: {r.referenceValue}</span>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Per-Exam Summary */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Interpretación por Examen</p>
                </div>
                <div className="space-y-2">
                    {examGroups.map((g, i) => (
                        <div key={i} className={`p-3 bg-white rounded-xl border ${g.abnormal > 0 ? 'border-amber-100' : 'border-emerald-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Beaker className="w-4 h-4 text-emerald-500" />
                                    <p className="text-xs font-black text-slate-700">{g.fullName}</p>
                                </div>
                                {g.abnormal > 0
                                    ? <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] font-black">{g.abnormal} alterado{g.abnormal > 1 ? 's' : ''}</Badge>
                                    : <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] font-black">✓ Normal</Badge>}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 pl-6">
                                {g.abnormal === 0
                                    ? `${g.total} parámetros dentro de rangos de referencia.`
                                    : `${g.abnormal} de ${g.total} parámetros fuera de rango. Requiere correlación clínica.`}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Global conclusion */}
                <div className={`mt-4 p-4 rounded-xl border ${abnormalCount === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`font-black text-xs uppercase tracking-widest mb-2 ${abnormalCount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Conclusión Global</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {abnormalCount === 0
                            ? `Panel de ${totalParams} parámetros dentro de límites normales. Sin alteraciones clínicamente significativas.`
                            : `Se identificaron ${abnormalCount} parámetros fuera de rango en un panel de ${totalParams} determinaciones de ${data.exams?.length || 0} exámenes. Se recomienda correlación clínica y seguimiento.`}
                    </p>
                </div>
            </div>

            {/* Occupational Health */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Relevancia para Salud Ocupacional</p>
                </div>
                <div className={`p-4 rounded-xl ${abnormalCount === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {abnormalCount === 0
                            ? 'Perfil hematológico y bioquímico dentro de parámetros normales. Sin restricción laboral de origen metabólico o hematológico.'
                            : 'Parámetros laboratoriales alterados. Se recomienda seguimiento médico y ajuste del programa de vigilancia epidemiológica según resultados.'}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────
export default function LaboratorioTab({ pacienteId }: { pacienteId: string }) {
    const { user } = useAuth()
    const { data, loading, reload } = useLaboratorio(pacienteId)
    const [activeView, setActiveView] = useState<'reporte' | 'analisis'>('reporte')
    const upload = useLabUpload(
        pacienteId,
        user?.empresa_id || '',
        user?.id,
        user?.nombre || user?.email,
        user?.rol,
        reload
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Cargando resultados de laboratorio...</p>
        </div>
    )

    // Preview mode (after extraction, before save)
    if (upload.previewData) return (
        <div className="space-y-5">
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-emerald-800">Vista Previa — Revisa y Confirma</h3>
                            <p className="text-xs text-emerald-600">{upload.progress}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={upload.cancelPreview}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 border border-red-200 text-red-700 bg-red-50 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                            <X className="w-4 h-4" /> Cancelar
                        </button>
                        <button onClick={upload.confirmSave} disabled={upload.saving}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50">
                            {upload.saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                : <><Save className="w-4 h-4" /> Confirmar y Guardar</>}
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-slate-100/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                <div className="w-full min-w-[800px]">
                    <LabReport data={upload.previewData} />
                </div>
            </div>
        </div>
    )

    // No data → empty upload state
    if (!data) return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">Sin resultados de laboratorio</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
                    Sube el PDF del reporte de laboratorio y la IA extraerá automáticamente
                    todos los exámenes, parámetros, valores y rangos de referencia.
                </p>

                <input ref={upload.fileInputRef} type="file" accept=".pdf,application/pdf,image/*"
                    onChange={upload.onFileSelected} className="hidden" />

                {upload.uploading ? (
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                            <p className="text-sm font-medium text-emerald-800">{upload.progress}</p>
                        </div>
                    </div>
                ) : (
                    <button onClick={upload.triggerUpload}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:scale-[1.02] transition-all">
                        <Upload className="w-5 h-5" />
                        Subir Reporte de Laboratorio
                    </button>
                )}

                {upload.error && (
                    <div className="mt-6 max-w-sm mx-auto flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{upload.error}</p>
                    </div>
                )}

                <p className="text-[10px] text-slate-400 mt-6">
                    Powered by Gemini Pro — Extracción completa multiexamen, con detección de anormales
                </p>
            </CardContent>
        </Card>
    )

    // ── Data loaded → Report + Analytics with toggle ──
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Laboratorio</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {data.patientInfo?.laboratoryName || 'GP Medical Health'} — {data.patientInfo?.registrationDate || ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Exámenes</p>
                            <p className="text-sm font-bold text-emerald-700">{data.exams?.length || 0}</p>
                        </div>
                        <input ref={upload.fileInputRef} type="file" accept=".pdf,application/pdf,image/*"
                            onChange={upload.onFileSelected} className="hidden" />
                        <button onClick={upload.triggerUpload} disabled={upload.uploading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50">
                            {upload.uploading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                                : <><RefreshCw className="w-3.5 h-3.5" /> Actualizar Laboratorio</>}
                        </button>
                    </div>
                </div>

                {upload.uploading && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <p className="text-sm font-medium text-emerald-700">{upload.progress}</p>
                    </div>
                )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
                <button onClick={() => setActiveView('reporte')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'reporte' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                    <FlaskConical className="w-4 h-4" />
                    Reporte Extraído
                </button>
                <button onClick={() => setActiveView('analisis')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'analisis' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                    <Activity className="w-4 h-4" />
                    Análisis Clínico
                </button>
            </div>

            {/* Sections */}
            {activeView === 'reporte' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-xs text-slate-400 font-medium mb-3 ml-1">Réplica digital completa del reporte original de laboratorio</p>
                    <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-slate-100/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="w-full min-w-[800px]">
                            <LabReport data={data} />
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'analisis' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <LabAnalytics data={data} />
                </div>
            )}

            {/* Attached Documents */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="laboratorio"
                titulo="Reporte Original"
                collapsedByDefault={false}
            />
        </div>
    )
}
