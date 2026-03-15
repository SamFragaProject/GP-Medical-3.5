/**
 * RayosXUploadReview.tsx — Motor Dedicado de Subida + Análisis de Rayos X
 * 
 * Flujo:
 *  1. Usuario abre panel → ve dos zonas: Imágenes RX (JPG/BMP) + Interpretación PDF
 *  2. Sube archivos sin análisis automático
 *  3. Al clicar "Analizar" → Gemini procesa todo junto
 *  4. Preview de resultados: Interpretación IA de imágenes + Extracción verbatim del PDF
 *  5. Confirmar → Guarda todo (datos + archivos en Storage)
 * 
 * /midu — Código limpio, performant, zero-bloat
 */
import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    UploadCloud, Image as ImageIcon, FileText, Trash2, X, CheckCircle, Loader2,
    Sparkles, Brain, AlertCircle, Save, Bone, Eye, Download
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { analyzeDocument, type StructuredMedicalData } from '@/services/geminiDocumentService'
import { crearEstudioConResultados, type TipoEstudio } from '@/services/estudiosService'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'
import { EMPRESA_PRINCIPAL_ID } from '@/config/empresa'

// ── Types ──
type Phase = 'idle' | 'collecting' | 'analyzing' | 'preview' | 'saving' | 'done' | 'error'

interface RxFile {
    file: File
    previewUrl: string
    type: 'image' | 'pdf'
}

interface Props {
    pacienteId: string
    pacienteNombre?: string
    isCompact?: boolean
    onSaved?: () => void
}

// ── Helpers ──
const isImageFile = (f: File) =>
    f.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|tiff?|bmp)$/i.test(f.name)
const isPdfFile = (f: File) =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
const isBmpFile = (f: File) =>
    f.type === 'image/bmp' || f.name.toLowerCase().endsWith('.bmp')

const convertBmpToJpg = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const canvas = document.createElement('canvas')
            let w = img.width, h = img.height
            const MAX = 4096
            if (w > MAX || h > MAX) {
                const ratio = Math.min(MAX / w, MAX / h)
                w = Math.round(w * ratio); h = Math.round(h * ratio)
            }
            canvas.width = w; canvas.height = h
            const ctx = canvas.getContext('2d')
            if (!ctx) { URL.revokeObjectURL(url); reject(new Error('No canvas')); return }
            ctx.drawImage(img, 0, 0, w, h)
            URL.revokeObjectURL(url)
            canvas.toBlob(blob => {
                if (!blob) { reject(new Error('Conversion failed')); return }
                resolve(new File([blob], file.name.replace(/\.bmp$/i, '.jpg'), { type: 'image/jpeg' }))
            }, 'image/jpeg', 0.85)
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('BMP load failed')) }
        img.src = url
    })

const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`

export default function RayosXUploadReview({ pacienteId, pacienteNombre, isCompact, onSaved }: Props) {
    const { user } = useAuth()
    const [phase, setPhase] = useState<Phase>('idle')
    const [rxFiles, setRxFiles] = useState<RxFile[]>([])
    const [pdfFiles, setPdfFiles] = useState<RxFile[]>([])
    const [isDraggingRx, setIsDraggingRx] = useState(false)
    const [isDraggingPdf, setIsDraggingPdf] = useState(false)
    const [extractedData, setExtractedData] = useState<StructuredMedicalData | null>(null)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')

    const rxInputRef = useRef<HTMLInputElement>(null)
    const pdfInputRef = useRef<HTMLInputElement>(null)

    const hasFiles = rxFiles.length > 0 || pdfFiles.length > 0

    // ── Add files ──
    const addRxFiles = useCallback((files: File[]) => {
        const valid = files.filter(f => isImageFile(f))
        if (!valid.length) { toast.error('Solo se aceptan imágenes (JPG, BMP, PNG)'); return }
        setRxFiles(prev => [...prev, ...valid.map(f => ({ file: f, previewUrl: URL.createObjectURL(f), type: 'image' as const }))])
        if (phase === 'idle') setPhase('collecting')
    }, [phase])

    const addPdfFiles = useCallback((files: File[]) => {
        const valid = files.filter(f => isPdfFile(f))
        if (!valid.length) { toast.error('Solo se aceptan archivos PDF'); return }
        setPdfFiles(prev => [...prev, ...valid.map(f => ({ file: f, previewUrl: URL.createObjectURL(f), type: 'pdf' as const }))])
        if (phase === 'idle') setPhase('collecting')
    }, [phase])

    // ── Remove ──
    const removeRxFile = (idx: number) => {
        URL.revokeObjectURL(rxFiles[idx].previewUrl)
        setRxFiles(prev => prev.filter((_, i) => i !== idx))
    }
    const removePdfFile = (idx: number) => {
        URL.revokeObjectURL(pdfFiles[idx].previewUrl)
        setPdfFiles(prev => prev.filter((_, i) => i !== idx))
    }

    // ── Drop handlers ──
    const handleDrop = (e: React.DragEvent, zone: 'rx' | 'pdf') => {
        e.preventDefault()
        zone === 'rx' ? setIsDraggingRx(false) : setIsDraggingPdf(false)
        const files = Array.from(e.dataTransfer.files)
        zone === 'rx' ? addRxFiles(files) : addPdfFiles(files)
    }

    // ── Analyze ──
    const startAnalysis = async () => {
        if (!hasFiles) return
        setPhase('analyzing'); setProgress(10); setError('')

        try {
            // Prepare all images for Gemini
            const allImages: File[] = []
            let rawText = ''

            // Process RX images (convert BMP → JPG for Gemini)
            setProgress(20)
            for (const rxf of rxFiles) {
                if (isBmpFile(rxf.file)) {
                    const jpg = await convertBmpToJpg(rxf.file)
                    allImages.push(jpg)
                } else {
                    allImages.push(rxf.file)
                }
            }

            // Process PDF → extract text + page images
            setProgress(40)
            for (const pdff of pdfFiles) {
                const pdfjsLib = await import('pdfjs-dist')
                // @ts-ignore
                pdfjsLib.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default
                const pdf = await pdfjsLib.getDocument(await pdff.file.arrayBuffer()).promise
                const pages = Math.min(pdf.numPages, 10)
                for (let i = 1; i <= pages; i++) {
                    const page = await pdf.getPage(i)
                    try {
                        rawText += (await page.getTextContent()).items.map(it => ('str' in it ? it.str : '')).join(' ') + '\n'
                    } catch { }
                    const vp = page.getViewport({ scale: 2.0 })
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        canvas.height = vp.height; canvas.width = vp.width
                        await page.render({ canvasContext: ctx, viewport: vp, canvas } as any).promise
                        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.8))
                        if (blob) allImages.push(new File([blob], `pdf_page_${i}.jpg`, { type: 'image/jpeg' }))
                    }
                }
            }

            // Send everything to Gemini in ONE call
            setProgress(60)
            const analysis = await analyzeDocument('radiografia', rawText, allImages)
            setExtractedData(analysis)
            setProgress(100)
            setPhase('preview')
            toast.success(`Análisis completado — ${analysis.results.length} datos extraídos`)
        } catch (err: any) {
            console.error('RX Analysis error:', err)
            setError(err.message || 'Error en análisis')
            setPhase('error')
        }
    }

    // ── Save ──
    const confirmAndSave = async () => {
        if (!extractedData) return
        setPhase('saving')

        try {
            const getVal = (name: string, ...aliases: string[]) => {
                for (const n of [name, ...aliases]) {
                    const r = extractedData.results.find(r =>
                        r.name?.toUpperCase() === n.toUpperCase() ||
                        r.parametro?.toUpperCase() === n.toUpperCase()
                    )
                    if (r && r.value != null && String(r.value).trim()) return String(r.value)
                }
                return ''
            }

            // Consolidate hallazgos
            const hallazgosCats = ['Hallazgos Radiológicos', 'Hallazgos', 'Reporte']
            const hallazgosItems = extractedData.results.filter(r =>
                hallazgosCats.some(c => (r.category || '').toLowerCase().includes(c.toLowerCase())) &&
                r.value != null && String(r.value).trim()
            )
            const hallazgosText = hallazgosItems.length > 0
                ? hallazgosItems.map(r => `${r.name}: ${r.value}`).join('\n')
                : getVal('HALLAZGOS', 'DESCRIPCION')

            const regionVal = getVal('REGION_ESTUDIADA', 'REGION_ANATOMICA', 'REGION')
            const conclusionVal = getVal('CONCLUSIÓN_RADIOLÓGICA', 'CONCLUSION_RADIOLOGICA', 'IMPRESION_DIAGNOSTICA', 'CONCLUSION')
            const iloVal = getVal('CLASIFICACION_ILO', 'ILO', 'CLASIFICACION_OIT')
            const radiologo = getVal('RADIOLOGO', 'MEDICO_RESPONSABLE')

            // Determine result
            const allText = `${hallazgosText} ${conclusionVal} ${extractedData.summary}`.toLowerCase()
            const isNormal = allText.includes('normal') || allText.includes('sin alteracion') || allText.includes('sin hallazgo') || iloVal === '0/0'
            const resultado = isNormal ? 'Normal' : 'Anormal'

            // Parse region/proyeccion
            const regionParts = regionVal.match(/(.+?)\s+(PA|AP|Lateral|LAT|Oblicua)$/i)
            const region = regionParts ? regionParts[1] : regionVal || 'Tórax'
            const proyeccion = regionParts ? regionParts[2] : getVal('TIPO_PROYECCION', 'PROYECCION') || 'PA y lateral'

            // Build results with exact param names for RayosXTab
            const rxResults: any[] = [
                { parametro_nombre: 'REGION_ANATOMICA', categoria: 'Datos del Estudio', resultado: region, resultado_numerico: null, unidad: '', observacion: '' },
                { parametro_nombre: 'TIPO_PROYECCION', categoria: 'Datos del Estudio', resultado: proyeccion, resultado_numerico: null, unidad: '', observacion: '' },
                { parametro_nombre: 'TIPO_ESTUDIO', categoria: 'Datos del Estudio', resultado: 'Radiografía', resultado_numerico: null, unidad: '', observacion: '' },
                { parametro_nombre: 'RESULTADO', categoria: 'Diagnóstico', resultado: resultado, resultado_numerico: null, unidad: '', observacion: '' },
                { parametro_nombre: 'MEDICO_RESPONSABLE', categoria: 'Datos del Estudio', resultado: radiologo || 'Motor IA Pro v3', resultado_numerico: null, unidad: '', observacion: '' },
            ]

            if (hallazgosText) rxResults.push({ parametro_nombre: 'HALLAZGOS', categoria: 'Reporte Radiológico', resultado: hallazgosText, resultado_numerico: null, unidad: '', observacion: '' })
            if (conclusionVal) rxResults.push({ parametro_nombre: 'IMPRESION_DIAGNOSTICA', categoria: 'Diagnóstico', resultado: conclusionVal, resultado_numerico: null, unidad: '', observacion: '' })
            if (iloVal) rxResults.push({ parametro_nombre: 'CLASIFICACION_ILO', categoria: 'Clasificaciones', resultado: iloVal, resultado_numerico: null, unidad: '', observacion: '' })

            const profusion = getVal('PROFUSION_OPACIDADES', 'PROFUSION')
            if (profusion) rxResults.push({ parametro_nombre: 'PROFUSION_OPACIDADES', categoria: 'Clasificaciones', resultado: profusion, resultado_numerico: null, unidad: '', observacion: '' })

            const recomendacion = getVal('RECOMENDACION', 'RECOMENDACIONES')
            if (recomendacion) rxResults.push({ parametro_nombre: 'RECOMENDACION', categoria: 'Diagnóstico', resultado: recomendacion, resultado_numerico: null, unidad: '', observacion: '' })

            const ict = getVal('INDICE_CARDIOTORÁCICO', 'INDICE_CARDIOTORACICO', 'ICT')
            if (ict) rxResults.push({ parametro_nombre: 'INDICE_CARDIOTORACICO', categoria: 'Mediciones', resultado: ict, resultado_numerico: parseFloat(ict) || null, unidad: 'ratio', observacion: '' })

            // Save per-structure hallazgos individually for RayosXTab analysis
            hallazgosItems.forEach(r => {
                rxResults.push({
                    parametro_nombre: r.name || 'HALLAZGO',
                    categoria: 'Hallazgos Radiológicos',
                    resultado: String(r.value),
                    resultado_numerico: null,
                    unidad: '',
                    observacion: r.description || ''
                })
            })

            // Create study
            const estudio = await crearEstudioConResultados(
                pacienteId,
                'radiografia' as TipoEstudio,
                {
                    fecha_estudio: extractedData.patientData?.reportDate || new Date().toISOString().split('T')[0],
                    institucion: 'GP Medical Health - RX Engine Pro',
                    interpretacion: conclusionVal || extractedData.summary || '',
                    diagnostico: resultado,
                    medico_responsable: radiologo || 'Motor IA Pro v3',
                    datos_extra: {
                        patientData: extractedData.patientData,
                        hallazgos: hallazgosText,
                        region_anatomica: region,
                        clasificacion_oit: iloVal,
                        _ai_config: 'Gemini Flash 2.0 — RX Dedicated Pipeline'
                    }
                },
                rxResults
            )

            // Save files to secure storage
            let eid = user?.empresa_id || ''
            if (!eid) {
                const { data: pac } = await supabase.from('pacientes').select('empresa_id').eq('id', pacienteId).single()
                eid = pac?.empresa_id || ''
            }
            if (!eid) eid = EMPRESA_PRINCIPAL_ID

            const patientName = extractedData.patientData?.name || pacienteNombre || 'Paciente'
            const fecha = new Date().toISOString().split('T')[0]
            const allOrigFiles = [...rxFiles, ...pdfFiles]

            for (let fi = 0; fi < allOrigFiles.length; fi++) {
                let f = allOrigFiles[fi].file
                const isImg = allOrigFiles[fi].type === 'image'
                // Convert BMP → JPG before storing
                if (isBmpFile(f)) f = await convertBmpToJpg(f)
                const ext = f.name.split('.').pop() || (isImg ? 'jpg' : 'pdf')
                const tag = isImg ? 'RX' : 'Interpretacion'
                const suffix = allOrigFiles.length > 1 ? `_${fi + 1}` : ''
                const renamedFile = new File(
                    [f],
                    `${tag}${suffix}_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                    { type: f.type }
                )
                try {
                    await secureStorageService.upload(renamedFile, {
                        pacienteId,
                        empresaId: eid,
                        categoria: 'radiografia',
                        subcategoria: isImg ? 'imagen' : 'interpretacion',
                        descripcion: `${tag} de ${patientName} — ${region} ${proyeccion} — ${fecha}`,
                        userId: user?.id,
                        userNombre: user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}`.trim() : undefined,
                        userRol: user?.rol,
                    })
                } catch (storageErr) {
                    console.warn('⚠️ No se pudo guardar archivo:', storageErr)
                }
            }

            // Cleanup
            rxFiles.forEach(f => URL.revokeObjectURL(f.previewUrl))
            pdfFiles.forEach(f => URL.revokeObjectURL(f.previewUrl))

            setPhase('done')
            toast.success(`Radiografía integrada — ${rxResults.length} parámetros + ${allOrigFiles.length} archivos guardados`)
            if (onSaved) onSaved()
        } catch (err: any) {
            console.error('RX Save error:', err)
            setError(err.message || 'Error al guardar')
            setPhase('error')
        }
    }

    // ── Reset ──
    const reset = () => {
        rxFiles.forEach(f => URL.revokeObjectURL(f.previewUrl))
        pdfFiles.forEach(f => URL.revokeObjectURL(f.previewUrl))
        setRxFiles([]); setPdfFiles([])
        setExtractedData(null); setError('')
        setPhase('idle'); setProgress(0)
    }

    // ── Compact mode (button only) ──
    if (isCompact && phase === 'idle') {
        return (
            <button onClick={() => setPhase('collecting')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl text-xs font-bold hover:from-slate-600 hover:to-slate-800 transition-all shadow-sm">
                <UploadCloud className="w-3.5 h-3.5" />
                Actualizar Rayos X
                <Badge className="bg-teal-500/20 text-teal-300 border-0 text-[9px] px-1.5">Pro</Badge>
            </button>
        )
    }

    // ── Done state ──
    if (phase === 'done') {
        return (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">Estudio Integrado</h3>
                <p className="text-sm text-slate-500 mb-4">Datos, archivos e interpretación guardados correctamente</p>
                <button onClick={reset} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cerrar</button>
            </motion.div>
        )
    }

    // ── Error state ──
    if (phase === 'error') {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-red-700">{error}</p>
                <button onClick={reset} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition">Reintentar</button>
            </div>
        )
    }

    // ── Analyzing loader ──
    if (phase === 'analyzing') {
        return (
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-center text-white">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-teal-400" />
                </motion.div>
                <h3 className="text-base font-black mb-2">Analizando Radiografías</h3>
                <p className="text-sm text-slate-400 mb-4">
                    {rxFiles.length > 0 && `${rxFiles.length} imagen(es) RX`}
                    {rxFiles.length > 0 && pdfFiles.length > 0 && ' + '}
                    {pdfFiles.length > 0 && `${pdfFiles.length} PDF interpretación`}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                    <motion.div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                        animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
            </div>
        )
    }

    // ── Saving loader ──
    if (phase === 'saving') {
        return (
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl text-center border border-emerald-200">
                <Loader2 className="w-8 h-8 text-emerald-600 mx-auto mb-3 animate-spin" />
                <p className="text-sm font-bold text-slate-700">Guardando estudio y archivos...</p>
            </div>
        )
    }

    // ── Preview (after analysis) ──
    if (phase === 'preview' && extractedData) {
        const hallazgosItems = extractedData.results.filter(r =>
            (r.category || '').toLowerCase().includes('hallazgos') || (r.category || '').toLowerCase().includes('reporte')
        )
        const metaItems = extractedData.results.filter(r =>
            (r.category || '').toLowerCase().includes('datos del estudio') ||
            (r.category || '').toLowerCase().includes('metadatos')
        )
        const conclusionItems = extractedData.results.filter(r =>
            (r.category || '').toLowerCase().includes('conclusi') ||
            (r.category || '').toLowerCase().includes('diagnóst') ||
            (r.category || '').toLowerCase().includes('clasificacion')
        )

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-base">Resultados del Análisis</h3>
                                <p className="text-xs text-slate-400">{extractedData.results.length} datos extraídos — Revisar antes de guardar</p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs font-bold px-3">{rxFiles.length} img + {pdfFiles.length} pdf</Badge>
                    </div>
                    {extractedData.patientData?.name && (
                        <p className="text-sm text-slate-300">Paciente: <strong>{extractedData.patientData.name}</strong></p>
                    )}
                </div>

                {/* Summary */}
                {extractedData.summary && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Resumen</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{extractedData.summary}</p>
                    </div>
                )}

                {/* Hallazgos por estructura */}
                {hallazgosItems.length > 0 && (
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Hallazgos — {hallazgosItems.length} estructuras evaluadas
                            </p>
                        </div>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {hallazgosItems.map((r, i) => {
                                    const isOk = (r.description || '').includes('Normal') || (String(r.value)).toLowerCase().includes('normal')
                                    return (
                                        <div key={i} className={`p-3 rounded-xl border ${isOk ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                                            <div className="flex items-start gap-2">
                                                {isOk ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-700">{r.name?.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{String(r.value)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Conclusión / Diagnóstico */}
                {conclusionItems.length > 0 && (
                    <Card className="border-slate-100 shadow-sm">
                        <CardContent className="p-4 space-y-2">
                            {conclusionItems.map((r, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{r.name?.replace(/_/g, ' ')}</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{String(r.value)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Metadata */}
                {metaItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {metaItems.map((r, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[9px] font-black uppercase text-slate-400">{r.name?.replace(/_/g, ' ')}</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{String(r.value)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button onClick={confirmAndSave}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-200">
                        <Save className="w-4 h-4" />
                        Confirmar y Guardar
                    </button>
                    <button onClick={reset}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition">
                        Cancelar
                    </button>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════
    // COLLECTING — Main upload interface (two zones)
    // ═══════════════════════════════════════════
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Bone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800">Subir Estudios Radiológicos</h3>
                        <p className="text-[10px] text-slate-400">Agrega las imágenes y la interpretación del médico</p>
                    </div>
                </div>
                {hasFiles && (
                    <button onClick={reset} className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ── ZONA 1: IMÁGENES RX ── */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Radiografías</p>
                        <Badge className="bg-blue-50 text-blue-600 border-0 text-[9px]">JPG / BMP / PNG</Badge>
                    </div>

                    <div
                        onDragOver={e => { e.preventDefault(); setIsDraggingRx(true) }}
                        onDragLeave={() => setIsDraggingRx(false)}
                        onDrop={e => handleDrop(e, 'rx')}
                        onClick={() => rxInputRef.current?.click()}
                        className={`relative p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[120px] flex flex-col items-center justify-center gap-2
                            ${isDraggingRx ? 'border-blue-400 bg-blue-50' : rxFiles.length > 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/50'}`}
                    >
                        <input ref={rxInputRef} type="file" multiple
                            accept="image/jpeg,image/jpg,image/png,image/bmp,image/webp,.jpg,.jpeg,.png,.bmp,.webp"
                            className="hidden"
                            onChange={e => { addRxFiles(Array.from(e.target.files || [])); e.target.value = '' }}
                        />
                        {rxFiles.length === 0 ? (
                            <>
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                                <p className="text-xs text-slate-500 font-medium text-center">Arrastra imágenes RX aquí o haz clic</p>
                            </>
                        ) : (
                            <div className="w-full space-y-1.5">
                                {rxFiles.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-100">
                                        <img src={f.previewUrl} alt="" className="w-10 h-10 object-cover rounded-md" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-slate-700 truncate">{f.file.name}</p>
                                            <p className="text-[9px] text-slate-400">{formatBytes(f.file.size)}</p>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); removeRxFile(i) }}
                                            className="p-1 hover:bg-red-50 rounded transition"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                    </div>
                                ))}
                                <p className="text-[10px] text-blue-500 font-medium text-center pt-1">+ Agregar más</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── ZONA 2: PDF INTERPRETACIÓN ── */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Interpretación Médica</p>
                        <Badge className="bg-amber-50 text-amber-600 border-0 text-[9px]">PDF</Badge>
                    </div>

                    <div
                        onDragOver={e => { e.preventDefault(); setIsDraggingPdf(true) }}
                        onDragLeave={() => setIsDraggingPdf(false)}
                        onDrop={e => handleDrop(e, 'pdf')}
                        onClick={() => pdfInputRef.current?.click()}
                        className={`relative p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[120px] flex flex-col items-center justify-center gap-2
                            ${isDraggingPdf ? 'border-amber-400 bg-amber-50' : pdfFiles.length > 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/50'}`}
                    >
                        <input ref={pdfInputRef} type="file" multiple accept="application/pdf,.pdf" className="hidden"
                            onChange={e => { addPdfFiles(Array.from(e.target.files || [])); e.target.value = '' }}
                        />
                        {pdfFiles.length === 0 ? (
                            <>
                                <FileText className="w-8 h-8 text-slate-300" />
                                <p className="text-xs text-slate-500 font-medium text-center">Arrastra PDF de interpretación o haz clic</p>
                            </>
                        ) : (
                            <div className="w-full space-y-1.5">
                                {pdfFiles.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-100">
                                        <div className="w-10 h-10 bg-amber-50 rounded-md flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-slate-700 truncate">{f.file.name}</p>
                                            <p className="text-[9px] text-slate-400">{formatBytes(f.file.size)}</p>
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); removePdfFile(i) }}
                                            className="p-1 hover:bg-red-50 rounded transition"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                    </div>
                                ))}
                                <p className="text-[10px] text-amber-500 font-medium text-center pt-1">+ Agregar más</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── ACTION: ANALIZAR ── */}
            {hasFiles && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                    <button onClick={startAnalysis}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-bold text-sm hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg shadow-slate-200">
                        <Brain className="w-4 h-4" />
                        Analizar {rxFiles.length > 0 ? `${rxFiles.length} Imagen${rxFiles.length > 1 ? 'es' : ''}` : ''}
                        {rxFiles.length > 0 && pdfFiles.length > 0 ? ' + ' : ''}
                        {pdfFiles.length > 0 ? `${pdfFiles.length} PDF` : ''}
                    </button>
                    <button onClick={reset}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition">
                        Cancelar
                    </button>
                </motion.div>
            )}
        </div>
    )
}
