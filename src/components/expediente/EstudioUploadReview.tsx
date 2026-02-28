/**
 * EstudioUploadReview — Upload → IA Extract → REVIEW → Confirm → Save
 * 
 * Flow:
 *  1. User drops/selects file
 *  2. File uploads to Supabase Storage (auto-rename)
 *  3. documentExtractorService.extractFromFile() runs
 *  4. Extracted data is DISPLAYED in editable review table
 *  5. User reviews, edits if needed, clicks "Confirmar y Guardar"
 *  6. Data saves to estudios_clinicos + resultados_estudio
 *  7. Parent tab reloads
 */
import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, FileText, X, Loader2, CheckCircle2, Sparkles, Brain,
    AlertTriangle, Eye, Pencil, Save, RotateCcw, Trash2, ArrowRight,
    FlaskConical, Ear, Wind, HeartPulse, Zap, ChevronDown, ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { documentExtractorService, type DatosExtraidos } from '@/services/documentExtractorService'
import { crearEstudioConResultados, type TipoEstudio } from '@/services/estudiosService'

// ── Config per study type ──
const STUDY_CONFIG: Record<string, {
    title: string; icon: any; gradient: string; shadowColor: string
    dataKey: keyof DatosExtraidos; formatExtracted: (data: DatosExtraidos) => ReviewRow[]
}> = {
    laboratorio: {
        title: 'Laboratorio', icon: FlaskConical, gradient: 'from-emerald-500 to-green-600',
        shadowColor: 'shadow-emerald-500/20', dataKey: 'laboratorio',
        formatExtracted: (data) => {
            const rows: ReviewRow[] = []
            if (!data.laboratorio) return rows
            const lab = data.laboratorio as Record<string, any>
            for (const [key, val] of Object.entries(lab)) {
                if (val === null || val === undefined || val === 0 || val === '' || key === 'otros') continue
                rows.push({
                    param: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    value: String(val),
                    numericValue: typeof val === 'number' ? val : parseFloat(String(val)) || null,
                    unit: UNITS[key] || '',
                    category: getLabCat(key),
                    key,
                })
            }
            if (lab.otros && typeof lab.otros === 'object') {
                for (const [k, v] of Object.entries(lab.otros as Record<string, any>)) {
                    rows.push({ param: k, value: String(v), numericValue: null, unit: '', category: 'Otros', key: `otros.${k}` })
                }
            }
            return rows
        }
    },
    audiometria: {
        title: 'Audiometría', icon: Ear, gradient: 'from-blue-500 to-indigo-600',
        shadowColor: 'shadow-blue-500/20', dataKey: 'audiometria',
        formatExtracted: (data) => {
            const rows: ReviewRow[] = []
            if (!data.audiometria) return rows
            const a = data.audiometria
            if (a.oido_derecho) {
                for (const [freq, val] of Object.entries(a.oido_derecho)) {
                    rows.push({ param: `OD ${freq}Hz`, value: String(val), numericValue: val, unit: 'dB', category: 'Oído Derecho', key: `od_${freq}` })
                }
            }
            if (a.oido_izquierdo) {
                for (const [freq, val] of Object.entries(a.oido_izquierdo)) {
                    rows.push({ param: `OI ${freq}Hz`, value: String(val), numericValue: val, unit: 'dB', category: 'Oído Izquierdo', key: `oi_${freq}` })
                }
            }
            if (a.pta_derecho) rows.push({ param: 'PTA Derecho', value: String(a.pta_derecho), numericValue: a.pta_derecho, unit: 'dB', category: 'General', key: 'pta_d' })
            if (a.pta_izquierdo) rows.push({ param: 'PTA Izquierdo', value: String(a.pta_izquierdo), numericValue: a.pta_izquierdo, unit: 'dB', category: 'General', key: 'pta_i' })
            if (a.diagnostico) rows.push({ param: 'Diagnóstico', value: a.diagnostico, numericValue: null, unit: '', category: 'Diagnóstico', key: 'diag' })
            return rows
        }
    },
    espirometria: {
        title: 'Espirometría', icon: Wind, gradient: 'from-cyan-500 to-teal-600',
        shadowColor: 'shadow-cyan-500/20', dataKey: 'espirometria',
        formatExtracted: (data) => {
            const rows: ReviewRow[] = []
            if (!data.espirometria) return rows
            const sp = data.espirometria
            const params: [string, any, string, string][] = [
                ['FVC', sp.fvc, 'L', 'Volumen'], ['FEV1', sp.fev1, 'L', 'Volumen'],
                ['FEV1/FVC', sp.fev1_fvc, '%', 'Ratio'], ['PEF', sp.pef, 'L/s', 'Flujo'],
                ['FEF25-75', sp.fef2575, 'L/s', 'Flujo'],
                ['FVC Predicho', sp.fvc_predicho, 'L', 'Predicho'], ['FEV1 Predicho', sp.fev1_predicho, 'L', 'Predicho'],
                ['FVC %Pred', sp.fvc_porcentaje, '%', '%Predicho'], ['FEV1 %Pred', sp.fev1_porcentaje, '%', '%Predicho'],
            ]
            for (const [name, val, unit, cat] of params) {
                if (val) rows.push({ param: name, value: String(val), numericValue: typeof val === 'number' ? val : null, unit, category: cat, key: name.toLowerCase().replace(/[^a-z0-9]/g, '_') })
            }
            if (sp.diagnostico) rows.push({ param: 'Diagnóstico', value: sp.diagnostico, numericValue: null, unit: '', category: 'Diagnóstico', key: 'diag' })
            if (sp.patron) rows.push({ param: 'Patrón', value: sp.patron, numericValue: null, unit: '', category: 'Diagnóstico', key: 'patron' })
            return rows
        }
    },
    ecg: {
        title: 'Electrocardiograma', icon: HeartPulse, gradient: 'from-red-500 to-rose-600',
        shadowColor: 'shadow-red-500/20', dataKey: 'signos_vitales',
        formatExtracted: (data) => {
            const rows: ReviewRow[] = []
            if (data.signos_vitales?.frecuencia_cardiaca) rows.push({ param: 'Frecuencia Cardíaca', value: String(data.signos_vitales.frecuencia_cardiaca), numericValue: data.signos_vitales.frecuencia_cardiaca, unit: 'lpm', category: 'Cardíaco', key: 'fc' })
            if (data.signos_vitales?.presion_sistolica) rows.push({ param: 'Presión Sistólica', value: String(data.signos_vitales.presion_sistolica), numericValue: data.signos_vitales.presion_sistolica, unit: 'mmHg', category: 'Cardíaco', key: 'ps' })
            if (data.signos_vitales?.presion_diastolica) rows.push({ param: 'Presión Diastólica', value: String(data.signos_vitales.presion_diastolica), numericValue: data.signos_vitales.presion_diastolica, unit: 'mmHg', category: 'Cardíaco', key: 'pd' })
            return rows
        }
    },
    radiografia: {
        title: 'Rayos X', icon: Zap, gradient: 'from-amber-500 to-orange-600',
        shadowColor: 'shadow-amber-500/20', dataKey: 'radiografia',
        formatExtracted: (data) => {
            const rows: ReviewRow[] = []
            if (!data.radiografia) return rows
            const rx = data.radiografia
            if (rx.tipo) rows.push({ param: 'Tipo', value: rx.tipo, numericValue: null, unit: '', category: 'General', key: 'tipo' })
            if (rx.hallazgos) rows.push({ param: 'Hallazgos', value: rx.hallazgos, numericValue: null, unit: '', category: 'Interpretación', key: 'hallazgos' })
            if (rx.impresion_diagnostica) rows.push({ param: 'Impresión Diagnóstica', value: rx.impresion_diagnostica, numericValue: null, unit: '', category: 'Interpretación', key: 'imp_dx' })
            if (rx.clasificacion_oit) rows.push({ param: 'Clasificación OIT', value: rx.clasificacion_oit, numericValue: null, unit: '', category: 'Clasificación', key: 'oit' })
            return rows
        }
    },
    optometria: {
        title: 'Optometría', icon: Eye, gradient: 'from-violet-500 to-purple-600',
        shadowColor: 'shadow-violet-500/20', dataKey: 'exploracion_fisica',
        formatExtracted: (data) => {
            const rows: ReviewRow[] = []
            if (data.exploracion_fisica?.ojos) rows.push({ param: 'Evaluación Visual', value: data.exploracion_fisica.ojos, numericValue: null, unit: '', category: 'Visión', key: 'ojos' })
            return rows
        }
    },
}

interface ReviewRow {
    param: string; value: string; numericValue: number | null
    unit: string; category: string; key: string
    removed?: boolean
}

const UNITS: Record<string, string> = {
    hemoglobina: 'g/dL', hematocrito: '%', leucocitos: '/µL', eritrocitos: 'M/µL',
    plaquetas: '/µL', glucosa: 'mg/dL', urea: 'mg/dL', bun: 'mg/dL',
    creatinina: 'mg/dL', colesterol_total: 'mg/dL', trigliceridos: 'mg/dL',
    colesterol_hdl: 'mg/dL', colesterol_ldl: 'mg/dL', acido_urico: 'mg/dL',
    tgo_ast: 'U/L', tgp_alt: 'U/L', fosfatasa_alcalina: 'U/L', ggt: 'U/L',
    bilirrubina_total: 'mg/dL', bilirrubina_directa: 'mg/dL', bilirrubina_indirecta: 'mg/dL',
    proteinas_totales: 'g/dL', albumina: 'g/dL', globulina: 'g/dL',
    sodio: 'mEq/L', potasio: 'mEq/L', cloro: 'mEq/L', calcio: 'mg/dL',
    hierro: 'µg/dL', ferritina: 'ng/mL', tsh: 'µUI/mL',
    neutrofilos: '%', linfocitos: '%', monocitos: '%', eosinofilos: '%', basofilos: '%',
    vgm: 'fL', hgm: 'pg', cmhg: 'g/dL',
}

function getLabCat(key: string): string {
    const BIO = ['hemoglobina', 'hematocrito', 'leucocitos', 'eritrocitos', 'plaquetas', 'vgm', 'hgm', 'cmhg']
    const FORMULA = ['neutrofilos', 'linfocitos', 'monocitos', 'eosinofilos', 'basofilos', 'bandas']
    const QUIMICA = ['glucosa', 'urea', 'bun', 'creatinina', 'acido_urico']
    const LIPIDO = ['colesterol_total', 'colesterol_hdl', 'colesterol_ldl', 'trigliceridos']
    if (BIO.includes(key)) return 'Biometría Hemática'
    if (FORMULA.includes(key)) return 'Fórmula Blanca'
    if (QUIMICA.includes(key)) return 'Química Sanguínea'
    if (LIPIDO.includes(key)) return 'Perfil Lipídico'
    return 'Otros'
}

interface EstudioUploadReviewProps {
    pacienteId: string
    tipoEstudio: string
    pacienteNombre?: string
    onSaved?: () => void
    onCancel?: () => void
}

type Phase = 'idle' | 'uploading' | 'extracting' | 'review' | 'saving' | 'done' | 'error'

export default function EstudioUploadReview({
    pacienteId, tipoEstudio, pacienteNombre, onSaved, onCancel
}: EstudioUploadReviewProps) {
    const config = STUDY_CONFIG[tipoEstudio] || STUDY_CONFIG.laboratorio
    const Icon = config.icon

    const [phase, setPhase] = useState<Phase>('idle')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [rawData, setRawData] = useState<DatosExtraidos | null>(null)
    const [reviewRows, setReviewRows] = useState<ReviewRow[]>([])
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [confidence, setConfidence] = useState(0)
    const [extractionTime, setExtractionTime] = useState(0)
    const [showCategories, setShowCategories] = useState<Set<string>>(new Set())
    const fileRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
    const handleDragLeave = useCallback(() => setIsDragging(false), [])
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) selectFile(file)
    }, [])

    const selectFile = (file: File) => {
        if (file.size > 20 * 1024 * 1024) { toast.error('Máximo 20MB'); return }
        setSelectedFile(file)
        setPhase('idle')
        setErrorMsg('')
    }

    const reset = () => {
        setSelectedFile(null); setPhase('idle'); setErrorMsg(''); setFileUrl(null)
        setRawData(null); setReviewRows([]); setEditingIdx(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    // ── Build storage path ──
    const buildPath = (file: File) => {
        const ext = file.name.split('.').pop() || 'pdf'
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10)
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
        const cleanName = (pacienteNombre || pacienteId)
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 60)
        const fileName = `${cleanName}_${tipoEstudio}_${dateStr}_${timeStr}.${ext}`
        return { path: `estudios/${pacienteId}/${tipoEstudio}/${fileName}`, fileName }
    }

    // ══════════════════════════════
    //  UPLOAD + EXTRACT
    // ══════════════════════════════
    const handleUploadAndExtract = async () => {
        if (!selectedFile) return

        // 1. Upload
        setPhase('uploading'); setErrorMsg('')
        let uploadedUrl = ''
        try {
            const { path, fileName } = buildPath(selectedFile)
            const { error } = await supabase.storage.from('documentos-medicos').upload(path, selectedFile)
            if (error) throw error
            const { data: urlData } = supabase.storage.from('documentos-medicos').getPublicUrl(path)
            uploadedUrl = urlData.publicUrl
            setFileUrl(uploadedUrl)
            toast.success(`Archivo guardado: ${fileName}`, { icon: '📁', duration: 2000 })
        } catch (err: any) {
            setPhase('error'); setErrorMsg(`Error al subir: ${err.message || 'desconocido'}`)
            toast.error('Error al subir archivo')
            return
        }

        // 2. Extract with ~90s timeout
        setPhase('extracting')
        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: la extracción tardó más de 90 segundos')), 90000)
            )
            const extractPromise = documentExtractorService.extractFromFile(selectedFile)
            const result = await Promise.race([extractPromise, timeoutPromise])

            if (!result.success || !result.data) {
                throw new Error(result.error || 'No se pudieron extraer datos del archivo')
            }

            setRawData(result.data)
            setConfidence(result.data._confianza || 0)
            setExtractionTime(result.processingTimeMs)

            // Format for review
            const rows = config.formatExtracted(result.data)
            if (rows.length === 0) {
                throw new Error(`No se encontraron datos de ${config.title} en este archivo. Verifica que el documento contenga resultados de ${config.title}.`)
            }
            setReviewRows(rows)

            // Auto-expand all categories
            const cats = new Set(rows.map(r => r.category))
            setShowCategories(cats)

            setPhase('review')
            toast.success(`${rows.length} parámetros extraídos — revisa antes de guardar`, { icon: '🔍', duration: 4000 })

        } catch (err: any) {
            console.error('Extraction error:', err)
            setPhase('error')
            setErrorMsg(err.message || 'Error en la extracción')
            toast.error(`Extracción fallida: ${err.message}`)
        }
    }

    // ══════════════════════════════
    //  CONFIRM & SAVE
    // ══════════════════════════════
    const handleConfirmSave = async () => {
        const activeRows = reviewRows.filter(r => !r.removed)
        if (activeRows.length === 0) { toast.error('No hay datos para guardar'); return }

        setPhase('saving')
        try {
            const ts = tipoEstudio as TipoEstudio
            const resultados = activeRows.map(r => ({
                parametro_nombre: r.param,
                categoria: r.category,
                resultado: r.value,
                resultado_numerico: r.numericValue,
                unidad: r.unit || undefined,
            }))

            const estudioMeta: Record<string, any> = {
                archivo_origen: fileUrl || undefined,
                fecha_estudio: new Date().toISOString(),
            }
            // Add diagnosis/classification from raw data
            if (rawData) {
                if (tipoEstudio === 'audiometria' && rawData.audiometria?.diagnostico) {
                    estudioMeta.diagnostico = rawData.audiometria.diagnostico
                }
                if (tipoEstudio === 'espirometria') {
                    if (rawData.espirometria?.diagnostico) estudioMeta.diagnostico = rawData.espirometria.diagnostico
                    if (rawData.espirometria?.patron) estudioMeta.clasificacion = rawData.espirometria.patron
                    if (rawData.espirometria?.calidad) estudioMeta.calidad = rawData.espirometria.calidad
                }
                if (tipoEstudio === 'radiografia' && rawData.radiografia) {
                    estudioMeta.interpretacion = rawData.radiografia.impresion_diagnostica
                    estudioMeta.diagnostico = rawData.radiografia.impresion_diagnostica
                    estudioMeta.clasificacion = rawData.radiografia.tipo
                }
            }

            await crearEstudioConResultados(pacienteId, ts, estudioMeta, resultados)

            // Also update JSONB in pacientes table for backwards compat
            if (tipoEstudio === 'laboratorio' && rawData?.laboratorio) {
                const jsonb: Record<string, any> = {}
                for (const [k, v] of Object.entries(rawData.laboratorio)) {
                    if (v !== null && v !== undefined && v !== 0 && v !== '' && k !== 'otros') jsonb[k] = v
                }
                if (Object.keys(jsonb).length > 0) {
                    await supabase.from('pacientes').update({ laboratorio: jsonb }).eq('id', pacienteId)
                }
            }

            setPhase('done')
            toast.success(`✅ ${activeRows.length} resultados guardados en ${config.title}`, { icon: '🎉', duration: 4000 })
            onSaved?.()
        } catch (err: any) {
            console.error('Save error:', err)
            setPhase('error')
            setErrorMsg(err.message || 'Error al guardar')
            toast.error('Error al guardar los resultados')
        }
    }

    // ── Review helpers ──
    const toggleCategory = (cat: string) => {
        setShowCategories(prev => {
            const next = new Set(prev)
            next.has(cat) ? next.delete(cat) : next.add(cat)
            return next
        })
    }

    const updateRow = (idx: number, field: 'value' | 'param', newVal: string) => {
        setReviewRows(prev => prev.map((r, i) => {
            if (i !== idx) return r
            if (field === 'value') {
                const num = parseFloat(newVal)
                return { ...r, value: newVal, numericValue: isNaN(num) ? null : num }
            }
            return { ...r, [field]: newVal }
        }))
    }

    const toggleRemove = (idx: number) => {
        setReviewRows(prev => prev.map((r, i) => i === idx ? { ...r, removed: !r.removed } : r))
    }

    const categories = [...new Set(reviewRows.map(r => r.category))]

    // ══════════════════════════════
    //  RENDER: IDLE / FILE SELECTED
    // ══════════════════════════════
    if (phase === 'idle') {
        return (
            <div className="space-y-4">
                {/* Header card */}
                <div className={`rounded-2xl bg-gradient-to-r ${config.gradient} p-5 text-white shadow-xl ${config.shadowColor}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">{config.title}</h3>
                            <p className="text-sm opacity-80">Sube un archivo → IA extrae → Revisa → Confirma</p>
                        </div>
                    </div>
                </div>

                {/* Drop zone */}
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => !selectedFile && fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                        ${isDragging ? 'border-violet-400 bg-violet-50 scale-[1.02]' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}
                        ${selectedFile ? 'border-emerald-300 bg-emerald-50/30' : ''}`}>
                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) selectFile(f) }} className="hidden" />

                    {!selectedFile ? (
                        <div className="space-y-3">
                            <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                                <Upload className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">{isDragging ? 'Soltar archivo aquí' : 'Arrastra o selecciona archivo'}</p>
                            <p className="text-xs text-slate-400">PDF, JPG, PNG, DOCX — máximo 20MB</p>
                            <div className="flex items-center justify-center gap-1.5 text-xs text-violet-500 font-bold">
                                <Brain className="w-3.5 h-3.5" /> Extracción automática con IA (Gemini)
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-6 h-6 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-700 truncate max-w-[250px]">{selectedFile.name}</span>
                                <span className="text-xs text-slate-400 tabular-nums">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                                <button onClick={reset} className="p-1 hover:bg-red-50 rounded-lg"><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                            </div>
                            <button onClick={handleUploadAndExtract}
                                className={`mx-auto flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r ${config.gradient} text-white font-black text-sm rounded-xl shadow-xl ${config.shadowColor} hover:shadow-2xl transition-all uppercase tracking-wide`}>
                                <Sparkles className="w-4 h-4" /> Subir y Analizar con IA
                            </button>
                        </div>
                    )}
                </div>

                {onCancel && <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 font-bold underline">&larr; Cancelar</button>}
            </div>
        )
    }

    // ══════════════════════════════
    //  RENDER: UPLOADING / EXTRACTING
    // ══════════════════════════════
    if (phase === 'uploading' || phase === 'extracting') {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-5">
                <div className="relative w-20 h-20">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.gradient} animate-ping opacity-20`} />
                    <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-2xl`}>
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-black text-slate-800">
                        {phase === 'uploading' ? 'Subiendo archivo...' : 'Analizando con IA...'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {phase === 'uploading' ? 'Guardando en almacenamiento seguro' : 'Gemini está extrayendo datos del documento'}
                    </p>
                </div>
                <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div animate={{ width: phase === 'uploading' ? '40%' : '75%' }}
                        transition={{ duration: phase === 'extracting' ? 20 : 3 }}
                        className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`} />
                </div>
                <div className="flex items-center gap-3">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {phase === 'uploading' ? 'Conectado' : 'Archivo subido'}
                    </motion.div>
                    {phase === 'extracting' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="flex items-center gap-1.5 text-xs text-violet-600 font-bold bg-violet-50 px-3 py-1.5 rounded-full">
                            <Brain className="w-3.5 h-3.5" /> Procesando IA
                        </motion.div>
                    )}
                </div>
            </div>
        )
    }

    // ══════════════════════════════
    //  RENDER: ERROR
    // ══════════════════════════════
    if (phase === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Error en el procesamiento</h3>
                <p className="text-sm text-red-600 max-w-md text-center bg-red-50 p-3 rounded-xl border border-red-200">{errorMsg}</p>
                <div className="flex gap-3">
                    <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200">
                        <RotateCcw className="w-4 h-4" /> Intentar de nuevo
                    </button>
                    {fileUrl && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100">
                            <Eye className="w-4 h-4" /> Ver archivo subido
                        </a>
                    )}
                </div>
            </div>
        )
    }

    // ══════════════════════════════
    //  RENDER: DONE
    // ══════════════════════════════
    if (phase === 'done') {
        return (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl rotate-3`}>
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-800">¡Datos guardados!</h3>
                <p className="text-sm text-slate-500">
                    {reviewRows.filter(r => !r.removed).length} parámetros de {config.title} registrados en el expediente
                </p>
                <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600 font-bold underline">Subir otro archivo</button>
            </motion.div>
        )
    }

    // ══════════════════════════════
    //  RENDER: REVIEW
    // ══════════════════════════════
    const activeCount = reviewRows.filter(r => !r.removed).length
    return (
        <div className="space-y-4">
            {/* Review header */}
            <div className={`rounded-2xl bg-gradient-to-r ${config.gradient} p-4 text-white shadow-xl ${config.shadowColor}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black">Revisar Datos Extraídos</h3>
                            <p className="text-xs opacity-80">{selectedFile?.name} — {activeCount} parámetros</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">
                            Confianza: {confidence}%
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">
                            {(extractionTime / 1000).toFixed(1)}s
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction banner */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Pencil className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                    Revisa los datos extraídos. Puedes <b>editar valores</b> haciendo clic en ellos, o <b>eliminar</b> parámetros incorrectos. Al confirmar, se guardarán en el expediente del paciente.
                </p>
            </div>

            {/* Data by category */}
            <div className="space-y-3">
                {categories.map(cat => {
                    const catRows = reviewRows.filter(r => r.category === cat)
                    const isOpen = showCategories.has(cat)
                    const removedInCat = catRows.filter(r => r.removed).length
                    return (
                        <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <button onClick={() => toggleCategory(cat)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`} />
                                    <span className="text-sm font-black text-slate-800">{cat}</span>
                                    <span className="text-xs text-slate-400">({catRows.length - removedInCat} parámetros)</span>
                                </div>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-t border-slate-100">
                                                    <th className="text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Parámetro</th>
                                                    <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                                                    <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Unidad</th>
                                                    <th className="text-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {catRows.map((row, localIdx) => {
                                                    const globalIdx = reviewRows.indexOf(row)
                                                    const isEditing = editingIdx === globalIdx
                                                    return (
                                                        <tr key={row.key} className={`border-t border-slate-50 transition-all ${row.removed ? 'opacity-30 line-through bg-red-50/30' : 'hover:bg-slate-50/50'}`}>
                                                            <td className="px-4 py-2.5 font-bold text-slate-700">{row.param}</td>
                                                            <td className="px-3 py-2.5 text-center">
                                                                {isEditing ? (
                                                                    <input autoFocus value={row.value}
                                                                        onChange={e => updateRow(globalIdx, 'value', e.target.value)}
                                                                        onBlur={() => setEditingIdx(null)}
                                                                        onKeyDown={e => e.key === 'Enter' && setEditingIdx(null)}
                                                                        className="w-24 px-2 py-1 text-center border border-violet-300 rounded-lg text-sm font-bold bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                                                ) : (
                                                                    <button onClick={() => !row.removed && setEditingIdx(globalIdx)}
                                                                        className="font-bold text-slate-800 tabular-nums hover:bg-violet-50 px-2 py-0.5 rounded-md transition-colors">
                                                                        {row.value}
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-center text-xs text-slate-400">{row.unit}</td>
                                                            <td className="px-2 py-2.5 text-center">
                                                                <button onClick={() => toggleRemove(globalIdx)}
                                                                    className={`p-1 rounded-md transition-colors ${row.removed ? 'hover:bg-emerald-50 text-emerald-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-400'}`}>
                                                                    {row.removed ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>

            {/* View file link */}
            {fileUrl && (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-violet-500 font-bold hover:text-violet-700">
                    <Eye className="w-3.5 h-3.5" /> Ver archivo original
                </a>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                    <RotateCcw className="w-4 h-4" /> Descartar
                </button>
                <button onClick={handleConfirmSave} disabled={phase === 'saving'}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-black text-white rounded-xl shadow-xl transition-all uppercase tracking-wide bg-gradient-to-r ${config.gradient} ${config.shadowColor} hover:shadow-2xl disabled:opacity-50`}>
                    {phase === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirmar y Guardar ({activeCount} resultados)
                </button>
            </div>
        </div>
    )
}
