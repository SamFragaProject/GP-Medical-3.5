/**
 * EstudiosVisualesTab (Optometría) — OptoClone Pipeline + Análisis IA
 * ⚡ /midu — Upload flow unificado con AudiometriaTab/EspirometriaTab
 */
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye, CheckCircle, AlertTriangle, Shield, Brain, Zap, Target, Trash2,
    ArrowRight, Glasses, Loader2, Inbox, Upload, Save, X, Clock,
    ChevronDown, ChevronUp, Activity, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getExpedienteDemoCompleto } from '@/data/demoPacienteCompleto'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import { analyzeOptometryDirect } from '@/services/geminiDocumentService'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'
import { EMPRESA_PRINCIPAL_ID } from '@/config/empresa'
import { toast } from 'sonner'

// ── Tabla Snellen ──
const SNELLEN_SCORE: Record<string, number> = {
    '20/10': 100, '20/15': 100, '20/20': 100, '20/25': 92, '20/30': 85,
    '20/40': 75, '20/50': 60, '20/70': 45, '20/100': 30, '20/200': 15,
}
const SNELLEN_LABEL: Record<string, { label: string; color: string; border: string; bg: string }> = {
    '20/10': { label: 'Superior', color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' },
    '20/15': { label: 'Superior', color: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' },
    '20/20': { label: 'Normal', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
    '20/25': { label: 'Casi Normal', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
    '20/30': { label: 'Leve', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
    '20/40': { label: 'Moderada', color: 'text-orange-600', border: 'border-orange-200', bg: 'bg-orange-50' },
    '20/50': { label: 'Deficiente', color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50' },
    '20/70': { label: 'Baja visión', color: 'text-red-700', border: 'border-red-200', bg: 'bg-red-50' },
    '20/100': { label: 'Severa', color: 'text-red-800', border: 'border-red-300', bg: 'bg-red-100' },
    '20/200': { label: 'Ceguera legal', color: 'text-red-900', border: 'border-red-400', bg: 'bg-red-200' },
}
const snellenInfo = (v: string) => SNELLEN_LABEL[v] || { label: v || '—', color: 'text-slate-600', border: 'border-slate-200', bg: 'bg-slate-50' }
const snellenScore = (v: string) => SNELLEN_SCORE[v] || 50

// Jaeger score
const JAEGER_SCORE: Record<string, number> = { 'J1': 100, 'J2': 90, 'J3': 80, 'J5': 60, 'J7': 40, 'J10': 20 }
const jaegerLabel = (v: string) => {
    if (!v || v === '-') return { label: '—', color: 'text-slate-400' }
    const s = JAEGER_SCORE[v.toUpperCase()] || 50
    if (s >= 90) return { label: 'Normal', color: 'text-emerald-600' }
    if (s >= 70) return { label: 'Casi normal', color: 'text-amber-600' }
    return { label: 'Reducida', color: 'text-red-600' }
}

// ── AVGauge semicircle ──
function AVGauge({ label, value, color }: { label: string; value: string; color: 'blue' | 'emerald' }) {
    const info = snellenInfo(value)
    const score = snellenScore(value)
    const r = 44, circ = Math.PI * r
    const strokeColor = color === 'blue' ? '#3b82f6' : '#10b981'
    const warn = score < 80
    return (
        <div className={`p-4 rounded-2xl border text-center ${warn ? 'bg-amber-50 border-amber-200' : (color === 'blue' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200')}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            <div className="relative mx-auto" style={{ width: 110, height: 64 }}>
                <svg viewBox="0 0 110 64" className="w-full h-full">
                    <path d="M 11 55 A 44 44 0 0 1 99 55" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                    <motion.path d="M 11 55 A 44 44 0 0 1 99 55" fill="none"
                        stroke={warn ? '#f59e0b' : strokeColor} strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ * (1 - score / 100) }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-x-0 bottom-0 text-center">
                    <p className={`text-xl font-black ${warn ? 'text-amber-700' : (color === 'blue' ? 'text-blue-700' : 'text-emerald-700')}`}>{value || '—'}</p>
                </div>
            </div>
            <p className={`text-xs font-bold mt-1 ${info.color}`}>{info.label}</p>
        </div>
    )
}

// ── AVChart optotype table ──
function AVChart({ av_sc, av_cc, side, color }: { av_sc: string; av_cc?: string; side: 'OD' | 'OI'; color: 'blue' | 'emerald' }) {
    const rows = ['20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/25', '20/20', '20/15', '20/10']
    const dotColor = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
    const textColor = color === 'blue' ? 'text-blue-700' : 'text-emerald-700'
    return (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <p className={`text-xs font-black uppercase tracking-widest ${textColor}`}>{side}</p>
            </div>
            <div className="space-y-1">
                {rows.map((row, i) => {
                    const fontSize = `${Math.max(6, 13 - i * 0.8)}px`
                    const isSC = row === av_sc, isCC = row === (av_cc || '')
                    return (
                        <div key={row} className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${isSC ? (color === 'blue' ? 'bg-blue-50 border border-blue-200' : 'bg-emerald-50 border border-emerald-200') : isCC ? 'bg-amber-50 border border-amber-200' : ''}`}>
                            <span className="text-[9px] font-mono text-slate-400 w-14">{row}</span>
                            <div className="flex-1 flex justify-center"><span className="font-black text-slate-700 tracking-widest select-none" style={{ fontSize }}>{'EZHDPCF HK'.charAt(i % 10)} {'LCNA'.charAt((i + 3) % 4)}</span></div>
                            {isSC && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${color === 'blue' ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'}`}>SC</span>}
                            {isCC && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-700">CC</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── OptoClone Review (replica del formato GP Medical) ──
function OptometryReviewClone({ data }: { data: any }) {
    const r = data.results || {}
    const p = data.patient || {}
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white p-5 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">EXAMEN OPTOMETRICO</h2>
                    {data.folio && <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">Folio: {data.folio}</span>}
                </div>
                <div className="text-right text-sm font-bold opacity-90">GP Medical Health</div>
            </div>
            {/* Patient info */}
            <div className="border-b border-slate-200">
                {[['NOMBRE', p.name], ['EDAD', p.age], ['EMPRESA', p.company], ['PUESTO', p.jobTitle], ['MÉTODO', data.methods?.visualAcuity]].map(([k, v]) => (
                    <div key={k as string} className="flex border-b border-slate-100 last:border-0">
                        <div className="w-44 bg-slate-50 px-4 py-2 font-bold text-slate-500 text-xs uppercase">{k}:</div>
                        <div className="flex-1 px-4 py-2 font-bold text-slate-800">{(v as string) || '—'}</div>
                    </div>
                ))}
            </div>
            {/* Results grid */}
            <div className="p-5 space-y-6">
                {/* Far Vision */}
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">— Visión Lejana —</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Natural</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Corregida</p>
                        <p className="text-xs font-bold text-slate-600">OJO DERECHO</p>
                        <p className="text-lg font-black text-slate-800 bg-slate-50 rounded-lg py-1">{r.farVision?.natural?.rightEye || '—'}</p>
                        <p className="text-lg font-black text-slate-500 bg-slate-50 rounded-lg py-1">{r.farVision?.corrected?.rightEye || '—'}</p>
                        <p className="text-xs font-bold text-slate-600">OJO IZQUIERDO</p>
                        <p className="text-lg font-black text-slate-800 bg-slate-50 rounded-lg py-1">{r.farVision?.natural?.leftEye || '—'}</p>
                        <p className="text-lg font-black text-slate-500 bg-slate-50 rounded-lg py-1">{r.farVision?.corrected?.leftEye || '—'}</p>
                    </div>
                </div>
                {/* Near Vision */}
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">— Visión Cercana —</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Natural</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Corregida</p>
                        <p className="text-xs font-bold text-slate-600">OJO DERECHO</p>
                        <p className="text-lg font-black text-slate-800 bg-slate-50 rounded-lg py-1">{r.nearVision?.natural?.rightEye || '—'}</p>
                        <p className="text-lg font-black text-slate-500 bg-slate-50 rounded-lg py-1">{r.nearVision?.corrected?.rightEye || '—'}</p>
                        <p className="text-xs font-bold text-slate-600">OJO IZQUIERDO</p>
                        <p className="text-lg font-black text-slate-800 bg-slate-50 rounded-lg py-1">{r.nearVision?.natural?.leftEye || '—'}</p>
                        <p className="text-lg font-black text-slate-500 bg-slate-50 rounded-lg py-1">{r.nearVision?.corrected?.leftEye || '—'}</p>
                    </div>
                </div>
                {/* Color Perception */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 uppercase w-48">Percepción de Colores:</span>
                    <span className="font-black text-slate-800">{r.colorPerception || '—'}</span>
                </div>
                {data.methods?.colorPerception && (
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 uppercase w-48">Método Utilizado:</span>
                        <span className="font-black text-slate-800">{data.methods.colorPerception}</span>
                    </div>
                )}
                {/* Diagnosis */}
                {data.diagnosis?.length > 0 && (
                    <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                        <p className="text-xs font-black text-cyan-700 uppercase tracking-widest mb-2">Diagnóstico</p>
                        <ol className="list-decimal list-inside space-y-1">
                            {data.diagnosis.map((d: string, i: number) => <li key={i} className="text-sm font-bold text-slate-700">{d}</li>)}
                        </ol>
                    </div>
                )}
            </div>
            {/* Doctor */}
            {data.doctor?.name && (
                <div className="border-t border-slate-200 p-4 text-right">
                    <p className="text-sm font-bold text-slate-700">{data.doctor.name}</p>
                    <p className="text-xs text-slate-500">{data.doctor.specialty}</p>
                </div>
            )}
        </div>
    )
}

// ── Hook: OptoClone upload + extraction ──
const useOptometryUpload = (pacienteId: string, empresaId: string, userId: string | undefined, userName: string | undefined, userRol: string | undefined, onComplete: () => void) => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        setUploading(true); setError(null); setPreviewData(null); setOriginalFile(file)
        setProgress('Analizando optometría con OptoClone IA...')
        try {
            const optoData = await analyzeOptometryDirect('', [file])
            if (!optoData?.results) throw new Error('La IA no pudo extraer los datos optométricos.')
            setProgress('✅ Optometría extraída. Revisa y confirma.')
            setPreviewData(optoData)
        } catch (err: any) {
            setError(err.message || 'Error al procesar'); setOriginalFile(null)
        } finally { setUploading(false) }
    }

    const confirmSave = async () => {
        if (!previewData) return
        setSaving(true)
        try {
            // 1. Guardar datos extraídos en estudios_clinicos
            console.log('[OptoClone] 📝 Guardando datos en estudios_clinicos...')
            const { error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'optometria',
                fecha_estudio: new Date().toISOString().split('T')[0],
                datos_extra: {
                    optoclone_data: previewData,
                    _source: 'OptoClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            })
            if (dbErr) {
                console.error('[OptoClone] ❌ Error BD:', dbErr)
                throw dbErr
            }
            console.log('[OptoClone] ✅ Datos guardados en BD')

            // 2. Guardar archivo original en Storage (renombrado)
            if (originalFile) {
                console.log('[OptoClone] 📎 Intentando guardar archivo original...')
                try {
                    let eid = empresaId
                    if (!eid) {
                        console.log('[OptoClone] 🔍 empresaId vacío, buscando en paciente...')
                        const { data: pac } = await supabase.from('pacientes').select('empresa_id').eq('id', pacienteId).single()
                        eid = pac?.empresa_id || ''
                        console.log('[OptoClone] 🔍 empresa_id del paciente:', eid)
                    }
                    if (!eid) {
                        eid = EMPRESA_PRINCIPAL_ID
                        console.log('[OptoClone] 🔍 Usando EMPRESA_PRINCIPAL_ID:', eid)
                    }

                    const patientName = previewData.patient?.name || 'Paciente'
                    const fecha = new Date().toISOString().split('T')[0]
                    const ext = originalFile.name.split('.').pop() || 'pdf'
                    const renamedFile = new File(
                        [originalFile],
                        `Optometria_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                        { type: originalFile.type }
                    )

                    console.log('[OptoClone] 📤 Subiendo archivo:', renamedFile.name, 'empresaId:', eid)
                    await secureStorageService.upload(renamedFile, {
                        pacienteId,
                        empresaId: eid,
                        categoria: 'optometria',
                        subcategoria: 'reporte_original',
                        descripcion: `Optometría de ${patientName} — ${fecha}`,
                        userId,
                        userNombre: userName,
                        userRol: userRol,
                    })
                    console.log('[OptoClone] ✅ Archivo guardado en Storage')
                    toast.success('📎 Archivo original guardado correctamente')
                    window.alert('✅ ARCHIVO GUARDADO — Refresca para ver en Documentos Adjuntos')
                } catch (storageErr) {
                    console.error('[OptoClone] ⚠️ Error guardando archivo:', storageErr)
                    toast.error('No se pudo guardar el archivo original')
                    window.alert('❌ ERROR guardando archivo: ' + (storageErr as any)?.message)
                    // No bloquear si falla el storage — los datos ya se guardaron
                }
            } else {
                console.warn('[OptoClone] ⚠️ No hay originalFile, no se puede guardar archivo')
                window.alert('⚠️ DEBUG: originalFile es null — el archivo se perdió')
            }

            setPreviewData(null)
            setOriginalFile(null)
            onComplete()
        } catch (err: any) {
            console.error('[OptoClone] ❌ Error general:', err)
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

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function EstudiosVisualesTab({ pacienteId }: { pacienteId: string }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [prev, setPrev] = useState<any>(null)
    const [activeSection, setActiveSection] = useState<'scanner' | 'analisis'>('scanner')
    const [deleting, setDeleting] = useState(false)

    const loadData = async () => {
        try {
            setLoading(true)
            // Source 1: datos_extra.optoclone_data
            const { data: estudios } = await supabase.from('estudios_clinicos').select('*')
                .eq('paciente_id', pacienteId).in('tipo_estudio', ['optometria', 'visual', 'vision'])
                .order('fecha_estudio', { ascending: false }).limit(2)

            if (estudios && estudios.length > 0) {
                for (let idx = 0; idx < estudios.length; idx++) {
                    const est = estudios[idx]
                    const clone = est.datos_extra?.optoclone_data
                    if (clone?.results) {
                        const r = clone.results
                        const built = {
                            id: est.id, fecha: est.fecha_estudio,
                            av_od_sc: r.farVision?.natural?.rightEye || '', av_oi_sc: r.farVision?.natural?.leftEye || '',
                            av_od_cc: r.farVision?.corrected?.rightEye || '', av_oi_cc: r.farVision?.corrected?.leftEye || '',
                            near_od_sc: r.nearVision?.natural?.rightEye || '', near_oi_sc: r.nearVision?.natural?.leftEye || '',
                            near_od_cc: r.nearVision?.corrected?.rightEye || '', near_oi_cc: r.nearVision?.corrected?.leftEye || '',
                            color_perception: r.colorPerception || '',
                            ref_od_esfera: r.refraction?.rightEye?.sphere, ref_od_cilindro: r.refraction?.rightEye?.cylinder, ref_od_eje: r.refraction?.rightEye?.axis,
                            ref_oi_esfera: r.refraction?.leftEye?.sphere, ref_oi_cilindro: r.refraction?.leftEye?.cylinder, ref_oi_eje: r.refraction?.leftEye?.axis,
                            tension_od: r.intraocularPressure?.rightEye || '', tension_oi: r.intraocularPressure?.leftEye || '',
                            campimetry_od: r.campimetry?.rightEye || '', campimetry_oi: r.campimetry?.leftEye || '',
                            diagnostico: (clone.diagnosis || []).join('. '),
                            diagnosis_array: clone.diagnosis || [],
                            medico: clone.doctor?.name || est.medico_responsable || '',
                            methods: clone.methods || {},
                            rawClone: clone,
                        }
                        if (idx === 0) setData(built); else setPrev(built)
                        continue
                    }
                    // Legacy: resultados_estudio
                    const { data: res } = await supabase.from('resultados_estudio').select('*').eq('estudio_id', est.id)
                    if (res && res.length > 0) {
                        const get = (n: string) => { const r = res.find((x: any) => x.parametro_nombre === n); return r?.resultado ?? r?.resultado_numerico ?? null }
                        const built = {
                            id: est.id, fecha: est.fecha_estudio,
                            av_od_sc: get('AV_OD_SC') || get('AV_OD') || '', av_oi_sc: get('AV_OI_SC') || get('AV_OI') || '',
                            av_od_cc: get('AV_OD_CC') || '', av_oi_cc: get('AV_OI_CC') || '',
                            near_od_sc: '', near_oi_sc: '', near_od_cc: '', near_oi_cc: '',
                            color_perception: get('ISHIHARA_RESULTADO') || get('COLOR_VISION') || '',
                            diagnostico: get('DIAGNOSTICO_OPTOMETRICO') || est.diagnostico || '',
                            diagnosis_array: [], medico: get('MEDICO_RESPONSABLE') || est.medico_responsable || '',
                            tension_od: get('TENSION_OD') || get('PIO_OD') || '', tension_oi: get('TENSION_OI') || get('PIO_OI') || '',
                            ref_od_esfera: get('REF_OD_ESFERA'), ref_oi_esfera: get('REF_OI_ESFERA'),
                            methods: {}, rawClone: null,
                        }
                        if (idx === 0) setData(built); else setPrev(built)
                    }
                }
                setLoading(false); return
            }
            // Demo
            if (pacienteId?.startsWith('demo')) {
                const demo = getExpedienteDemoCompleto()
                setData((demo as any).optometria || (demo as any).visual)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { if (pacienteId) loadData() }, [pacienteId])
    const reload = () => { setData(null); setPrev(null); loadData() }
    const upload = useOptometryUpload(pacienteId, user?.empresa_id || '', user?.id, user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : undefined, user?.rol, reload)

    const deleteEstudio = async () => {
        if (!data?.id || data.id === 'legacy') return
        if (!confirm('¿Eliminar este examen de optometría? Esta acción no se puede deshacer.')) return
        setDeleting(true)
        try {
            await supabase.from('resultados_estudio').delete().eq('estudio_id', data.id)
            await supabase.from('estudios_clinicos').delete().eq('id', data.id)
            setData(null); setPrev(null); reload()
        } catch (e) { console.error('Error eliminando:', e) }
        finally { setDeleting(false) }
    }

    // Loading
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Eye className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando optometría...</p>
        </div>
    )

    // Preview mode
    if (upload.previewData) return (
        <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Eye className="w-5 h-5 text-amber-600" /></div>
                        <div><p className="font-black text-sm text-amber-800">OptoClone extrajo los datos</p><p className="text-xs text-amber-600">Revisa y confirma para guardar</p></div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={upload.cancelPreview} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Cancelar</button>
                        <button onClick={upload.confirmSave} disabled={upload.saving}
                            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-200">
                            {upload.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {upload.saving ? 'Guardando...' : 'Confirmar y Guardar'}
                        </button>
                    </div>
                </div>
            </motion.div>
            <div className="bg-gradient-to-br from-cyan-50/50 to-sky-50/30 rounded-2xl border border-cyan-200/50 p-5">
                <OptometryReviewClone data={upload.previewData} />
            </div>
        </div>
    )

    // No data
    if (!data) return (
        <Card className="border-0 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Eye className="w-8 h-8 text-cyan-300" /></div>
            <h3 className="text-slate-800 font-bold">Sin resultados de optometría</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-6">Sube el PDF o imagen del examen optométrico para extracción automática.</p>
            <div className="max-w-sm mx-auto">
                <input ref={upload.fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={upload.onFileSelected} />
                <button onClick={upload.triggerUpload} disabled={upload.uploading}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-cyan-300 hover:border-cyan-400 hover:bg-cyan-50 transition-all flex flex-col items-center gap-2 group">
                    {upload.uploading ? <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" /> : <Upload className="w-6 h-6 text-cyan-400 group-hover:text-cyan-600" />}
                    <span className="text-xs font-bold text-slate-500">{upload.uploading ? upload.progress : 'Subir Examen Optométrico'}</span>
                </button>
                {upload.error && <p className="text-xs text-red-500 mt-2">{upload.error}</p>}
            </div>
        </Card>
    )

    // ── Computed values ──
    const avOdScore = snellenScore(data.av_od_sc)
    const avOiScore = snellenScore(data.av_oi_sc)
    const avOdOk = !data.av_od_sc || avOdScore >= 80
    const avOiOk = !data.av_oi_sc || avOiScore >= 80
    const colorOk = !data.color_perception || data.color_perception.toUpperCase().includes('NORMAL')
    const pioOd = data.tension_od ? Number(data.tension_od) : null
    const pioOi = data.tension_oi ? Number(data.tension_oi) : null
    const pioAlta = (pioOd !== null && pioOd > 21) || (pioOi !== null && pioOi > 21)
    const allOk = avOdOk && avOiOk && colorOk && !pioAlta
    const asymmetry = Math.abs(avOdScore - avOiScore)

    const alertas: string[] = []
    if (!avOdOk) alertas.push(`AV OD ${data.av_od_sc} — ${snellenInfo(data.av_od_sc).label}`)
    if (!avOiOk) alertas.push(`AV OI ${data.av_oi_sc} — ${snellenInfo(data.av_oi_sc).label}`)
    if (!colorOk) alertas.push(`Percepción de colores alterada: ${data.color_perception}`)
    if (pioAlta) alertas.push('Presión intraocular elevada — riesgo de glaucoma')
    if (asymmetry > 20) alertas.push(`Asimetría visual significativa (${asymmetry}pts entre ojos)`)

    // Risk score
    const riskScore = (() => {
        let s = 0
        if (!avOdOk) s += 20; if (!avOiOk) s += 20
        if (!colorOk) s += 15; if (pioAlta) s += 25
        if (asymmetry > 20) s += 10
        if (avOdScore < 60 || avOiScore < 60) s += 10
        return Math.min(s, 100)
    })()
    const riskLabel = riskScore <= 20 ? 'Bajo' : riskScore <= 50 ? 'Moderado' : riskScore <= 75 ? 'Alto' : 'Crítico'
    const riskColors = riskScore <= 20 ? { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200' }
        : riskScore <= 50 ? { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200' }
            : riskScore <= 75 ? { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200' }
                : { bg: 'bg-red-500', light: 'bg-red-50', border: 'border-red-200' }

    return (
        <div className="space-y-5">
            {/* HEADER */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Optometría</h3>
                            <p className="text-xs text-slate-400 font-medium">{data.medico || 'GP Medical Health'}{data.fecha ? ` — ${new Date(data.fecha).toLocaleDateString('es-MX')}` : ''}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <input ref={upload.fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={upload.onFileSelected} />
                        <button onClick={upload.triggerUpload} disabled={upload.uploading}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
                            {upload.uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Nuevo Estudio
                        </button>
                        {data?.id && data.id !== 'legacy' && (
                            <button onClick={deleteEstudio} disabled={deleting}
                                className="px-3 py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors">
                                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Eliminar
                            </button>
                        )}
                        <div className={`px-4 py-2 rounded-xl border ${allOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</p>
                            <div className="flex items-center gap-1.5">
                                {allOk ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <p className={`text-sm font-bold ${allOk ? 'text-emerald-700' : 'text-amber-700'}`}>{allOk ? 'Normal' : 'Con Hallazgos'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {data.diagnostico && (
                    <div className={`mt-4 p-3 rounded-xl ${allOk ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                        <p className={`text-sm font-medium ${allOk ? 'text-emerald-700' : 'text-amber-700'}`}>{data.diagnostico}</p>
                    </div>
                )}
                {alertas.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {alertas.map((a, i) => (
                            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                                className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-medium text-amber-700">{a}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* TABS */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {(['scanner', 'analisis'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSection(s)}
                        className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSection === s ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {s === 'scanner' ? '📋 Vista Escáner' : '🧠 Análisis IA'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* SCANNER */}
                {activeSection === 'scanner' && (
                    <motion.div key="sc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        {/* OptoClone preview */}
                        {data.rawClone && (
                            <div className="bg-gradient-to-br from-cyan-50/50 to-sky-50/30 rounded-2xl border border-cyan-200/50 p-5">
                                <OptometryReviewClone data={data.rawClone} />
                            </div>
                        )}
                        {/* Optotype charts (no clone data) */}
                        {!data.rawClone && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AVChart av_sc={data.av_od_sc} av_cc={data.av_od_cc} side="OD" color="blue" />
                                    <AVChart av_sc={data.av_oi_sc} av_cc={data.av_oi_cc} side="OI" color="emerald" />
                                </div>
                                {(data.ref_od_esfera || data.ref_oi_esfera) && (
                                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Refracción</p></div>
                                        <div className="p-5 overflow-x-auto">
                                            <table className="w-full text-sm"><thead><tr className="border-b border-slate-100">
                                                <th className="text-left py-2 text-[10px] font-black uppercase text-slate-400">Ojo</th>
                                                <th className="py-2 text-center text-[10px] font-black uppercase text-slate-400">Esfera</th>
                                                <th className="py-2 text-center text-[10px] font-black uppercase text-slate-400">Cilindro</th>
                                                <th className="py-2 text-center text-[10px] font-black uppercase text-slate-400">Eje</th>
                                            </tr></thead><tbody>
                                                    {[{ l: 'OD', e: data.ref_od_esfera, c: data.ref_od_cilindro, a: data.ref_od_eje, clr: 'text-blue-700' },
                                                    { l: 'OI', e: data.ref_oi_esfera, c: data.ref_oi_cilindro, a: data.ref_oi_eje, clr: 'text-emerald-700' }].map(r => (
                                                        <tr key={r.l} className="border-b border-slate-50 last:border-0">
                                                            <td className={`py-3 font-black text-xs ${r.clr}`}>{r.l}</td>
                                                            <td className="py-3 text-center font-bold text-slate-700">{r.e || '—'}</td>
                                                            <td className="py-3 text-center font-bold text-slate-700">{r.c || '—'}</td>
                                                            <td className="py-3 text-center font-bold text-slate-700">{r.a ? `${r.a}°` : '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody></table>
                                        </div>
                                    </Card>
                                )}
                            </>
                        )}

                    </motion.div>
                )}

                {/* ANALYSIS */}
                {activeSection === 'analisis' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-cyan-900 via-sky-900 to-blue-900 rounded-2xl p-5 text-white relative overflow-hidden">
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Brain className="w-5 h-5" /></div>
                                    <div>
                                        <p className="font-black text-sm">Análisis Oftalmológico IA Avanzado</p>
                                        <p className="text-cyan-200 text-xs">8 módulos clínicos — NOM-007-SSA3 · Snellen · Jaeger · Ishihara</p>
                                    </div>
                                </div>
                                <p className="text-sm text-cyan-100 leading-relaxed">{data.diagnostico || `AV OD: ${data.av_od_sc || '—'} • OI: ${data.av_oi_sc || '—'}. ${allOk ? 'Visión dentro de límites normales.' : 'Hallazgos visuales detectados.'}`}</p>
                            </div>
                        </div>

                        {/* 1. Risk */}
                        <Card className={`${riskColors.light} ${riskColors.border} border shadow-sm`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2"><Target className="w-4 h-4 text-slate-600" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nivel de Riesgo Visual</p></div>
                                    <Badge className={`${riskColors.bg} text-white text-xs font-black px-3 py-1`}>{riskLabel} — {riskScore}%</Badge>
                                </div>
                                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} className={`h-full rounded-full ${riskColors.bg}`} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Gauges AV */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Agudeza Visual — Sin Corrección</p>
                            <div className="grid grid-cols-2 gap-4">
                                <AVGauge label="OD — Ojo Derecho" value={data.av_od_sc || ''} color="blue" />
                                <AVGauge label="OI — Ojo Izquierdo" value={data.av_oi_sc || ''} color="emerald" />
                            </div>
                        </div>
                        {(data.av_od_cc && data.av_od_cc !== '-') || (data.av_oi_cc && data.av_oi_cc !== '-') ? (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Agudeza Visual — Con Corrección</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {data.av_od_cc && data.av_od_cc !== '-' && <AVGauge label="OD — Con corrección" value={data.av_od_cc} color="blue" />}
                                    {data.av_oi_cc && data.av_oi_cc !== '-' && <AVGauge label="OI — Con corrección" value={data.av_oi_cc} color="emerald" />}
                                </div>
                            </div>
                        ) : null}

                        {/* 3. KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Card className={`shadow-sm ${colorOk ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                <CardContent className="p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ishihara</p>
                                    <p className={`text-sm font-black mt-1 ${colorOk ? 'text-emerald-600' : 'text-red-600'}`}>{colorOk ? '✅ Normal' : '⚠️ Alterado'}</p>
                                    <p className="text-[9px] text-slate-500 mt-1">{data.color_perception || 'Sin dato'}</p>
                                </CardContent>
                            </Card>
                            <Card className={`shadow-sm ${pioAlta ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                                <CardContent className="p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">PIO</p>
                                    <p className={`text-sm font-black mt-1 ${pioAlta ? 'text-red-600' : 'text-slate-700'}`}>
                                        {pioOd !== null ? `${pioOd}` : '—'} / {pioOi !== null ? `${pioOi}` : '—'} <span className="text-[10px] text-slate-400">mmHg</span>
                                    </p>
                                    <p className="text-[9px] text-slate-500 mt-1">{pioAlta ? 'Riesgo glaucoma' : pioOd ? 'Rango normal' : 'No medida'}</p>
                                </CardContent>
                            </Card>
                            <Card className={`shadow-sm ${asymmetry > 20 ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                                <CardContent className="p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Simetría</p>
                                    <p className={`text-sm font-black mt-1 ${asymmetry <= 10 ? 'text-emerald-600' : asymmetry <= 20 ? 'text-amber-600' : 'text-red-600'}`}>Δ {asymmetry} pts</p>
                                    <p className="text-[9px] text-slate-500 mt-1">{asymmetry <= 10 ? 'Simétrica' : asymmetry <= 20 ? 'Leve' : 'Significativa'}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-slate-200">
                                <CardContent className="p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visión Cercana</p>
                                    <p className="text-sm font-black mt-1 text-slate-700">
                                        {data.near_od_sc || '—'} / {data.near_oi_sc || '—'}
                                    </p>
                                    <p className={`text-[9px] mt-1 ${jaegerLabel(data.near_od_sc).color}`}>{jaegerLabel(data.near_od_sc || data.near_oi_sc).label}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 4. Snellen Comparison Bar Chart */}
                        <Card className="border-slate-100 shadow-sm overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-cyan-600" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comparativa AV — Escala Snellen</p></div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <svg viewBox="0 0 460 200" className="w-full h-auto">
                                        {/* Background and grid */}
                                        {[0, 25, 50, 75, 100].map(v => (
                                            <g key={v}>
                                                <line x1="80" y1={170 - v * 1.5} x2="440" y2={170 - v * 1.5} stroke="#e2e8f0" strokeWidth="0.5" />
                                                <text x="75" y={174 - v * 1.5} textAnchor="end" fontSize="8" fill="#94a3b8">{v}%</text>
                                            </g>
                                        ))}
                                        {/* Bars */}
                                        {(() => {
                                            const bars = [
                                                { label: 'OD SC', score: avOdScore, color: '#3b82f6' },
                                                { label: 'OI SC', score: avOiScore, color: '#10b981' },
                                                ...(data.av_od_cc && data.av_od_cc !== '-' ? [{ label: 'OD CC', score: snellenScore(data.av_od_cc), color: '#60a5fa' }] : []),
                                                ...(data.av_oi_cc && data.av_oi_cc !== '-' ? [{ label: 'OI CC', score: snellenScore(data.av_oi_cc), color: '#34d399' }] : []),
                                            ]
                                            const barW = Math.min(60, 320 / bars.length - 10)
                                            const gap = (360 - barW * bars.length) / (bars.length + 1)
                                            return bars.map((b, i) => {
                                                const x = 80 + gap + i * (barW + gap)
                                                const h = b.score * 1.5
                                                return (
                                                    <g key={i}>
                                                        <motion.rect x={x} y={170 - h} width={barW} height={h} rx="4" fill={b.color}
                                                            initial={{ height: 0, y: 170 }} animate={{ height: h, y: 170 - h }}
                                                            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }} />
                                                        <text x={x + barW / 2} y={185} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">{b.label}</text>
                                                        <motion.text x={x + barW / 2} y={165 - h} textAnchor="middle" fontSize="10" fontWeight="800" fill={b.color}
                                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.15 }}>
                                                            {b.score}%
                                                        </motion.text>
                                                    </g>
                                                )
                                            })
                                        })()}
                                        {/* 80% threshold line */}
                                        <line x1="80" y1={170 - 80 * 1.5} x2="440" y2={170 - 80 * 1.5} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
                                        <text x="442" y={174 - 80 * 1.5} fontSize="7" fill="#f59e0b" fontWeight="700">Mín. aceptable</text>
                                    </svg>
                                </div>
                                {/* Snellen scale reference */}
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {['20/20', '20/25', '20/30', '20/40', '20/50', '20/70', '20/100', '20/200'].map(v => {
                                        const info = snellenInfo(v)
                                        const isOD = v === data.av_od_sc, isOI = v === data.av_oi_sc
                                        return (
                                            <div key={v} className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${isOD ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-400' : isOI ? 'bg-emerald-100 border-emerald-300 ring-2 ring-emerald-400' : `${info.bg} ${info.border}`}`}>
                                                <span className={isOD ? 'text-blue-700' : isOI ? 'text-emerald-700' : info.color}>{v}</span>
                                                <span className="text-slate-400 ml-1">{info.label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 5. Occupational Risk Matrix */}
                        <Card className="border-slate-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-cyan-600" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Matriz de Riesgo por Actividad</p></div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { act: 'Conducción', icon: '🚗', min: 85, risk: avOdScore >= 85 && avOiScore >= 85 && colorOk },
                                        { act: 'Trabajo en Alturas', icon: '🏗️', min: 80, risk: avOdScore >= 80 && avOiScore >= 80 },
                                        { act: 'Operación Maquinaria', icon: '⚙️', min: 75, risk: avOdScore >= 75 && avOiScore >= 75 },
                                        { act: 'Manejo de Químicos', icon: '🧪', min: 70, risk: colorOk },
                                        { act: 'Trabajo de Oficina', icon: '💻', min: 60, risk: avOdScore >= 60 && avOiScore >= 60 },
                                        { act: 'Electricidad', icon: '⚡', min: 80, risk: avOdScore >= 80 && avOiScore >= 80 && colorOk },
                                    ].map(({ act, icon, risk }) => (
                                        <div key={act} className={`p-3 rounded-xl border text-center ${risk ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                            <p className="text-lg mb-1">{icon}</p>
                                            <p className="text-[10px] font-bold text-slate-600">{act}</p>
                                            <p className={`text-[9px] font-black mt-1 ${risk ? 'text-emerald-600' : 'text-red-600'}`}>{risk ? '✅ APTO' : '⚠️ RESTRINGIDO'}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 6. Interpretation */}
                        <Card className="border-cyan-100 shadow-sm bg-gradient-to-br from-cyan-50 to-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-cyan-600" /><p className="text-sm font-black text-slate-800 uppercase">Interpretación Oftalmológica</p></div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                        <p className="font-black text-cyan-700 text-xs uppercase mb-1">Agudeza Visual Binocular</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            OD: <strong>{data.av_od_sc || '—'}</strong> ({snellenInfo(data.av_od_sc).label}) — OI: <strong>{data.av_oi_sc || '—'}</strong> ({snellenInfo(data.av_oi_sc).label}).
                                            {avOdOk && avOiOk ? ' Agudeza visual bilateral dentro de límites normales.' : ' Se detecta déficit visual que puede afectar desempeño laboral.'}
                                        </p>
                                    </div>
                                    {data.near_od_sc && data.near_od_sc !== '-' && (
                                        <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                            <p className="font-black text-cyan-700 text-xs uppercase mb-1">Visión Cercana (Jaeger)</p>
                                            <p className="text-sm text-slate-700">OD: <strong>{data.near_od_sc}</strong> — OI: <strong>{data.near_oi_sc || '—'}</strong>. {jaegerLabel(data.near_od_sc).label}.</p>
                                        </div>
                                    )}
                                    {(pioOd !== null || pioOi !== null) && (
                                        <div className={`p-3 rounded-xl border ${pioAlta ? 'bg-amber-50 border-amber-200' : 'bg-white border-cyan-100'}`}>
                                            <p className="font-black text-xs uppercase mb-1 text-cyan-700">Presión Intraocular</p>
                                            <p className="text-sm text-slate-700">OD: {pioOd ?? '—'} mmHg — OI: {pioOi ?? '—'} mmHg (Ref: ≤21). {pioAlta ? 'PIO elevada — descartar glaucoma.' : 'PIO normal.'}</p>
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-xl border ${allOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <p className="font-black text-xs uppercase mb-1 text-slate-600">Aptitud Laboral Visual (NOM-007)</p>
                                        <p className="text-sm text-slate-700">
                                            {allOk ? 'APTO — Sin restricción laboral de origen visual. AV ≥20/30 bilateral, Ishihara normal.'
                                                : avOdScore < 45 || avOiScore < 45
                                                    ? 'NO APTO — AV inferior a 20/70. Restricción para trabajos en altura, conducción y manejo de maquinaria.'
                                                    : 'APTO CON RESTRICCIONES — Se recomienda corrección óptica. Restricciones: no alturas sin lentes, no conducción nocturna.'}
                                        </p>
                                    </div>
                                    {/* Correction benefit */}
                                    {(data.av_od_cc && data.av_od_cc !== '-') || (data.av_oi_cc && data.av_oi_cc !== '-') ? (
                                        <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                            <p className="font-black text-cyan-700 text-xs uppercase mb-1">Beneficio de Corrección Óptica</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {(() => {
                                                    const ccOdScore = data.av_od_cc ? snellenScore(data.av_od_cc) : avOdScore
                                                    const ccOiScore = data.av_oi_cc ? snellenScore(data.av_oi_cc) : avOiScore
                                                    const benefitOD = ccOdScore - avOdScore
                                                    const benefitOI = ccOiScore - avOiScore
                                                    const maxBenefit = Math.max(benefitOD, benefitOI)
                                                    if (maxBenefit <= 0) return 'Sin mejoría significativa con corrección óptica. La AV natural es cercana a la corregida.'
                                                    return `Mejoría con corrección: OD +${benefitOD} pts (${data.av_od_sc}→${data.av_od_cc || 'N/A'}), OI +${benefitOI} pts (${data.av_oi_sc}→${data.av_oi_cc || 'N/A'}). ${maxBenefit >= 20 ? 'Beneficio significativo — uso obligatorio de lentes.' : 'Beneficio moderado — lentes recomendados para labores de precisión.'}`
                                                })()}
                                            </p>
                                        </div>
                                    ) : null}
                                    {/* Binocular dominance */}
                                    {asymmetry > 0 && (
                                        <div className="p-3 bg-white rounded-xl border border-cyan-100">
                                            <p className="font-black text-cyan-700 text-xs uppercase mb-1">Análisis de Dominancia Ocular</p>
                                            <p className="text-sm text-slate-700">
                                                {avOdScore > avOiScore
                                                    ? `Predominio del ojo derecho (OD ${data.av_od_sc} vs OI ${data.av_oi_sc}). Diferencia: ${asymmetry} puntos.`
                                                    : avOiScore > avOdScore
                                                        ? `Predominio del ojo izquierdo (OI ${data.av_oi_sc} vs OD ${data.av_od_sc}). Diferencia: ${asymmetry} puntos.`
                                                        : 'Visión simétrica bilateral — sin dominancia patológica.'
                                                }
                                                {asymmetry > 20 ? ' Asimetría clínicamente significativa — evaluar ambliopía o patología unilateral.' : asymmetry > 10 ? ' Asimetría leve. Monitorear evolución.' : ''}
                                            </p>
                                        </div>
                                    )}
                                    {alertas.length > 0 && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                            <p className="font-black text-amber-700 text-xs uppercase mb-2">Hallazgos</p>
                                            <ul className="space-y-1">{alertas.map((a, i) => <li key={i} className="flex items-start gap-2"><Zap className="w-3 h-3 text-amber-500 mt-0.5" /><span className="text-xs text-amber-700">{a}</span></li>)}</ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 7. Recommendations */}
                        <Card className="border-emerald-100 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-emerald-500" /><p className="text-sm font-black text-slate-800 uppercase">Recomendaciones Clínicas</p></div>
                                <ul className="space-y-2">
                                    {[
                                        !avOdOk || !avOiOk ? 'Valoración por oftalmólogo para prescripción de corrección óptica' : 'Control visual anual preventivo (NOM-007-SSA3)',
                                        (!avOdOk || !avOiOk) && 'Uso obligatorio de corrección óptica en puesto de trabajo',
                                        pioAlta && 'URGENTE: Evaluación por glaucomatólogo — PIO elevada detectada. Solicitar paquimetría y campimetría',
                                        !colorOk && 'Restricción laboral: no asignar tareas que requieran discriminación cromática (cables eléctricos, señalización, CQ)',
                                        asymmetry > 20 && 'Evaluación por oftalmólogo — descartar ambliopía, lesión retiniana o neuropatía óptica unilateral',
                                        data.near_od_sc && (JAEGER_SCORE[data.near_od_sc?.toUpperCase()] || 100) < 80 && 'Evaluación de presbicia — considerar lentes progresivos o bifocales para trabajo de precisión',
                                        avOdScore < 60 || avOiScore < 60 ? 'Restricción: no conducción vehicular sin corrección óptica vigente' : null,
                                        (data.av_od_cc && snellenScore(data.av_od_cc) > avOdScore + 15) && 'Prescripción óptica actualizada requerida — beneficio demostrado con corrección',
                                        'Registrar en expediente ocupacional conforme NOM-030-STPS-2009',
                                        'Programar siguiente evaluación optométrica en 12 meses (o 6 meses si hay hallazgos)',
                                    ].filter(Boolean).map((r, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>{r as string}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Documentos adjuntos — SIEMPRE visible, fuera de condicionales */}
            <DocumentosAdjuntos pacienteId={pacienteId} categoria="optometria" titulo="Archivo Original Optometría" collapsedByDefault={false} />
        </div>
    )
}

