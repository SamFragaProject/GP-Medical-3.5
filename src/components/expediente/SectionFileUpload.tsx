/**
 * SectionFileUpload — Upload + AI Extraction + Save per Section
 *
 * Flow: Upload → Supabase Storage (auto-rename) → Extract with documentExtractorService
 *       → Save results via estudiosService → Reload parent tab
 *
 * Features:
 * - Drag & drop + click to select
 * - Auto-rename: {apellido}_{nombre}_{tipo}_{fecha}.{ext}
 * - AI extraction with progress feedback
 * - Results saved to estudios_clinicos + resultados_estudio
 * - Compact mode (inline button) or full mode (drop zone)
 */
import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, Sparkles, Brain, AlertTriangle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { documentExtractorService, type DatosExtraidos } from '@/services/documentExtractorService'
import { crearEstudioConResultados, type TipoEstudio } from '@/services/estudiosService'

// ── Map tipoEstudio key to the subsection in DatosExtraidos
const SECTION_FIELD_MAP: Record<string, keyof DatosExtraidos> = {
    laboratorio: 'laboratorio',
    audiometria: 'audiometria',
    espirometria: 'espirometria',
    ecg: 'exploracion_fisica', // ECG data comes in exploration or signos vitales
    radiografia: 'radiografia',
    optometria: 'exploracion_fisica',
}

// ── RANGOS_REF for lab flag calculation on extracted data
const RANGOS_REF: Record<string, { min: number; max: number; unidad: string; label: string }> = {
    hemoglobina: { min: 13, max: 17.5, unidad: 'g/dL', label: 'Hemoglobina' },
    hematocrito: { min: 38, max: 52, unidad: '%', label: 'Hematocrito' },
    leucocitos: { min: 4500, max: 11000, unidad: '/µL', label: 'Leucocitos' },
    eritrocitos: { min: 4.2, max: 5.8, unidad: 'M/µL', label: 'Eritrocitos' },
    plaquetas: { min: 150000, max: 400000, unidad: '/µL', label: 'Plaquetas' },
    glucosa: { min: 70, max: 100, unidad: 'mg/dL', label: 'Glucosa' },
    urea: { min: 15, max: 45, unidad: 'mg/dL', label: 'Urea' },
    bun: { min: 7, max: 20, unidad: 'mg/dL', label: 'BUN' },
    creatinina: { min: 0.7, max: 1.3, unidad: 'mg/dL', label: 'Creatinina' },
    colesterol_total: { min: 0, max: 200, unidad: 'mg/dL', label: 'Colesterol Total' },
    trigliceridos: { min: 0, max: 150, unidad: 'mg/dL', label: 'Triglicéridos' },
}

interface SectionFileUploadProps {
    pacienteId: string
    tipoEstudio: string
    pacienteNombre?: string
    onFileUploaded?: (url: string, fileName: string) => void
    onExtractComplete?: (data: any) => void
    onDataSaved?: () => void
    compact?: boolean
    accept?: string
    enableExtraction?: boolean
}

type UploadState = 'idle' | 'selected' | 'uploading' | 'extracting' | 'saving' | 'done' | 'error'

export default function SectionFileUpload({
    pacienteId, tipoEstudio, pacienteNombre, onFileUploaded, onExtractComplete, onDataSaved,
    compact = false, accept = '.pdf,.jpg,.jpeg,.png,.webp,.docx', enableExtraction = true,
}: SectionFileUploadProps) {
    const [state, setState] = useState<UploadState>('idle')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [statusMsg, setStatusMsg] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [savedUrl, setSavedUrl] = useState<string | null>(null)
    const [extractedCount, setExtractedCount] = useState(0)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
    const handleDragLeave = useCallback(() => setIsDragging(false), [])
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) selectFile(file)
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) selectFile(file)
    }

    const selectFile = (file: File) => {
        if (file.size > 20 * 1024 * 1024) { toast.error('Máximo 20MB'); return }
        setSelectedFile(file)
        setState('selected')
    }

    const reset = () => {
        setSelectedFile(null)
        setState('idle')
        setStatusMsg('')
        setSavedUrl(null)
        setExtractedCount(0)
        if (fileRef.current) fileRef.current.value = ''
    }

    // ── Build auto-named path
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

    // ── UPLOAD ONLY (no extraction)
    const uploadOnly = async () => {
        if (!selectedFile) return
        setState('uploading')
        setStatusMsg('Subiendo archivo...')
        try {
            const { path, fileName } = buildPath(selectedFile)
            const { error } = await supabase.storage.from('documentos-medicos').upload(path, selectedFile)
            if (error) throw error
            const { data: urlData } = supabase.storage.from('documentos-medicos').getPublicUrl(path)
            setSavedUrl(urlData.publicUrl)
            onFileUploaded?.(urlData.publicUrl, fileName)
            toast.success('Archivo guardado')
            setState('done')
            setStatusMsg(`Guardado como: ${fileName}`)
            onDataSaved?.()
        } catch (err: any) {
            console.error('Upload error:', err)
            setState('error')
            setStatusMsg(err.message || 'Error al subir')
            toast.error('Error al subir archivo')
        }
    }

    // ── UPLOAD + EXTRACT + SAVE
    const uploadAndExtract = async () => {
        if (!selectedFile) return

        // 1. Upload
        setState('uploading')
        setStatusMsg('Subiendo archivo...')
        let fileUrl = ''
        try {
            const { path, fileName } = buildPath(selectedFile)
            const { error } = await supabase.storage.from('documentos-medicos').upload(path, selectedFile)
            if (error) throw error
            const { data: urlData } = supabase.storage.from('documentos-medicos').getPublicUrl(path)
            fileUrl = urlData.publicUrl
            setSavedUrl(fileUrl)
            onFileUploaded?.(fileUrl, fileName)
        } catch (err: any) {
            setState('error')
            setStatusMsg('Error al subir: ' + (err.message || ''))
            return
        }

        // 2. Extract
        setState('extracting')
        setStatusMsg('Analizando documento con IA...')
        try {
            const result = await documentExtractorService.extractFromFile(selectedFile)
            if (!result.success || !result.data) {
                throw new Error(result.error || 'No se pudieron extraer datos')
            }

            onExtractComplete?.(result.data)

            // 3. Save to DB
            setState('saving')
            setStatusMsg('Guardando resultados...')

            const saved = await saveExtractedData(result.data, fileUrl)
            setExtractedCount(saved)

            setState('done')
            setStatusMsg(`✅ ${saved} parámetros guardados`)
            toast.success(`Extracción completa: ${saved} datos guardados`)
            onDataSaved?.()

        } catch (err: any) {
            console.error('Extraction/Save error:', err)
            setState('done') // Still mark as done since file was uploaded
            setStatusMsg(`Archivo guardado. Extracción: ${err.message}`)
            toast.error(`Archivo guardado, pero la extracción falló: ${err.message}`)
            onDataSaved?.()
        }
    }

    // ── SAVE extracted data to estudios_clinicos + resultados_estudio
    const saveExtractedData = async (data: DatosExtraidos, archivoUrl: string): Promise<number> => {
        const ts = tipoEstudio as TipoEstudio
        let count = 0

        // ── LABORATORIO
        if ((ts === 'laboratorio' || !tipoEstudio) && data.laboratorio) {
            const lab = data.laboratorio
            const resultados: Array<{ parametro_nombre: string; categoria?: string; resultado: string; resultado_numerico?: number | null; unidad?: string }> = []

            for (const [key, val] of Object.entries(lab)) {
                if (val === null || val === undefined || val === 0 || val === '' || key === 'otros') continue
                const numVal = typeof val === 'number' ? val : parseFloat(String(val))
                const ref = RANGOS_REF[key]
                resultados.push({
                    parametro_nombre: ref?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    categoria: getLabCategory(key),
                    resultado: String(val),
                    resultado_numerico: isNaN(numVal) ? null : numVal,
                    unidad: ref?.unidad || '',
                })
            }
            // Handle 'otros' field
            if (lab.otros && typeof lab.otros === 'object') {
                for (const [k, v] of Object.entries(lab.otros)) {
                    resultados.push({
                        parametro_nombre: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                        categoria: 'Otros',
                        resultado: String(v),
                    })
                }
            }

            if (resultados.length > 0) {
                await crearEstudioConResultados(pacienteId, 'laboratorio', {
                    archivo_origen: archivoUrl,
                    fecha_estudio: new Date().toISOString(),
                }, resultados)
                count += resultados.length
            }

            // Also update pacientes.laboratorio JSONB for backwards compatibility
            const jsonbData: Record<string, any> = {}
            for (const [key, val] of Object.entries(lab)) {
                if (val !== null && val !== undefined && val !== 0 && val !== '' && key !== 'otros') {
                    jsonbData[key] = val
                }
            }
            if (Object.keys(jsonbData).length > 0) {
                await supabase.from('pacientes').update({ laboratorio: jsonbData }).eq('id', pacienteId)
            }
        }

        // ── AUDIOMETRÍA
        if ((ts === 'audiometria' || !tipoEstudio) && data.audiometria) {
            const audio = data.audiometria
            const resultados: Array<{ parametro_nombre: string; categoria?: string; resultado: string; resultado_numerico?: number | null; unidad?: string }> = []

            if (audio.oido_derecho) {
                for (const [freq, val] of Object.entries(audio.oido_derecho)) {
                    resultados.push({ parametro_nombre: `OD ${freq}Hz`, categoria: 'Oído Derecho', resultado: String(val), resultado_numerico: val, unidad: 'dB' })
                }
            }
            if (audio.oido_izquierdo) {
                for (const [freq, val] of Object.entries(audio.oido_izquierdo)) {
                    resultados.push({ parametro_nombre: `OI ${freq}Hz`, categoria: 'Oído Izquierdo', resultado: String(val), resultado_numerico: val, unidad: 'dB' })
                }
            }
            if (audio.pta_derecho) resultados.push({ parametro_nombre: 'PTA Derecho', categoria: 'General', resultado: String(audio.pta_derecho), resultado_numerico: audio.pta_derecho, unidad: 'dB' })
            if (audio.pta_izquierdo) resultados.push({ parametro_nombre: 'PTA Izquierdo', categoria: 'General', resultado: String(audio.pta_izquierdo), resultado_numerico: audio.pta_izquierdo, unidad: 'dB' })

            if (resultados.length > 0) {
                await crearEstudioConResultados(pacienteId, 'audiometria', {
                    archivo_origen: archivoUrl,
                    fecha_estudio: new Date().toISOString(),
                    clasificacion: audio.diagnostico || undefined,
                    diagnostico: audio.diagnostico || undefined,
                }, resultados)
                count += resultados.length
            }
        }

        // ── ESPIROMETRÍA
        if ((ts === 'espirometria' || !tipoEstudio) && data.espirometria) {
            const sp = data.espirometria
            const resultados: Array<{ parametro_nombre: string; categoria?: string; resultado: string; resultado_numerico?: number | null; unidad?: string }> = []

            if (sp.fvc) resultados.push({ parametro_nombre: 'FVC', categoria: 'Volumen', resultado: String(sp.fvc), resultado_numerico: sp.fvc, unidad: 'L' })
            if (sp.fev1) resultados.push({ parametro_nombre: 'FEV1', categoria: 'Volumen', resultado: String(sp.fev1), resultado_numerico: sp.fev1, unidad: 'L' })
            if (sp.fev1_fvc) resultados.push({ parametro_nombre: 'FEV1/FVC', categoria: 'Ratio', resultado: String(sp.fev1_fvc), resultado_numerico: sp.fev1_fvc, unidad: '%' })
            if (sp.pef) resultados.push({ parametro_nombre: 'PEF', categoria: 'Flujo', resultado: String(sp.pef), resultado_numerico: sp.pef, unidad: 'L/s' })
            if (sp.fef2575) resultados.push({ parametro_nombre: 'FEF25-75', categoria: 'Flujo', resultado: String(sp.fef2575), resultado_numerico: sp.fef2575, unidad: 'L/s' })
            if (sp.fvc_predicho) resultados.push({ parametro_nombre: 'FVC Predicho', categoria: 'Predicho', resultado: String(sp.fvc_predicho), resultado_numerico: sp.fvc_predicho, unidad: 'L' })
            if (sp.fev1_predicho) resultados.push({ parametro_nombre: 'FEV1 Predicho', categoria: 'Predicho', resultado: String(sp.fev1_predicho), resultado_numerico: sp.fev1_predicho, unidad: 'L' })
            if (sp.fvc_porcentaje) resultados.push({ parametro_nombre: 'FVC %Pred', categoria: '%Predicho', resultado: String(sp.fvc_porcentaje), resultado_numerico: sp.fvc_porcentaje, unidad: '%' })
            if (sp.fev1_porcentaje) resultados.push({ parametro_nombre: 'FEV1 %Pred', categoria: '%Predicho', resultado: String(sp.fev1_porcentaje), resultado_numerico: sp.fev1_porcentaje, unidad: '%' })

            if (resultados.length > 0) {
                await crearEstudioConResultados(pacienteId, 'espirometria', {
                    archivo_origen: archivoUrl,
                    fecha_estudio: new Date().toISOString(),
                    clasificacion: sp.patron || sp.diagnostico || undefined,
                    diagnostico: sp.diagnostico || undefined,
                    calidad: sp.calidad || undefined,
                }, resultados)
                count += resultados.length
            }
        }

        // ── RADIOGRAFÍA
        if ((ts === 'radiografia' || !tipoEstudio) && data.radiografia) {
            const rx = data.radiografia
            const resultados: Array<{ parametro_nombre: string; categoria?: string; resultado: string }> = []

            if (rx.hallazgos) resultados.push({ parametro_nombre: 'Hallazgos', categoria: 'Interpretación', resultado: rx.hallazgos })
            if (rx.impresion_diagnostica) resultados.push({ parametro_nombre: 'Impresión Diagnóstica', categoria: 'Interpretación', resultado: rx.impresion_diagnostica })
            if (rx.clasificacion_oit) resultados.push({ parametro_nombre: 'Clasificación OIT', categoria: 'Clasificación', resultado: rx.clasificacion_oit })

            await crearEstudioConResultados(pacienteId, 'radiografia', {
                archivo_origen: archivoUrl,
                fecha_estudio: new Date().toISOString(),
                clasificacion: rx.tipo || 'Radiografía',
                diagnostico: rx.impresion_diagnostica || undefined,
                datos_extra: { clasificacion_oit: rx.clasificacion_oit, imagen_url: archivoUrl },
            }, resultados)
            count += Math.max(resultados.length, 1)
        }

        // ── ECG (from signos_vitales if available)
        if (ts === 'ecg' && data.signos_vitales) {
            const sv = data.signos_vitales
            const resultados: Array<{ parametro_nombre: string; resultado: string; resultado_numerico?: number | null; unidad?: string }> = []
            if (sv.frecuencia_cardiaca) resultados.push({ parametro_nombre: 'Frecuencia Cardíaca', resultado: String(sv.frecuencia_cardiaca), resultado_numerico: sv.frecuencia_cardiaca, unidad: 'lpm' })
            if (sv.presion_sistolica) resultados.push({ parametro_nombre: 'Presión Sistólica', resultado: String(sv.presion_sistolica), resultado_numerico: sv.presion_sistolica, unidad: 'mmHg' })

            if (resultados.length > 0) {
                await crearEstudioConResultados(pacienteId, 'electrocardiograma' as TipoEstudio, {
                    archivo_origen: archivoUrl,
                    fecha_estudio: new Date().toISOString(),
                }, resultados)
                count += resultados.length
            }
        }

        return count
    }

    // ── Lab category helper
    function getLabCategory(key: string): string {
        const BIO = ['hemoglobina', 'hematocrito', 'leucocitos', 'eritrocitos', 'plaquetas', 'vgm', 'hgm', 'cmhg', 'vpm', 'rdw_cv']
        const FORMULA = ['neutrofilos', 'linfocitos', 'monocitos', 'eosinofilos', 'basofilos', 'bandas']
        const QUIMICA = ['glucosa', 'urea', 'bun', 'creatinina', 'acido_urico']
        const LIPIDO = ['colesterol_total', 'colesterol_hdl', 'colesterol_ldl', 'trigliceridos']
        const ORINA = ['examen_orina', 'examen_orina_densidad', 'examen_orina_ph', 'examen_orina_proteinas', 'examen_orina_glucosa', 'examen_orina_hemoglobina', 'examen_orina_leucocitos', 'examen_orina_nitritos', 'examen_orina_bacterias', 'examen_orina_cristales', 'examen_orina_cilindros', 'examen_orina_eritrocitos']
        if (BIO.includes(key)) return 'Biometría Hemática'
        if (FORMULA.includes(key)) return 'Fórmula Blanca'
        if (QUIMICA.includes(key)) return 'Química Sanguínea'
        if (LIPIDO.includes(key)) return 'Perfil Lipídico'
        if (ORINA.includes(key)) return 'Examen Orina'
        return 'Otros'
    }

    // ═══ COMPACT MODE ═══
    if (compact) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <input ref={fileRef} type="file" accept={accept} onChange={handleFileInput} className="hidden" />
                {state === 'idle' && (
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}
                        className="rounded-xl text-xs font-bold gap-1.5 border-dashed">
                        <Upload className="w-3 h-3" /> Subir Archivo
                    </Button>
                )}
                {state === 'selected' && selectedFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-700 font-semibold truncate max-w-[120px]">{selectedFile.name}</span>
                        <button onClick={reset}><X className="w-3 h-3 text-blue-400" /></button>
                        <Button size="sm" onClick={uploadOnly} className="h-6 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700">
                            Guardar
                        </Button>
                        {enableExtraction && (
                            <Button size="sm" onClick={uploadAndExtract} className="h-6 text-[10px] px-2 gap-1 bg-violet-600 hover:bg-violet-700">
                                <Sparkles className="w-3 h-3" /> Extraer IA
                            </Button>
                        )}
                    </div>
                )}
                {(state === 'uploading' || state === 'extracting' || state === 'saving') && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-200">
                        <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                        <span className="text-xs text-violet-700 font-semibold">{statusMsg}</span>
                    </div>
                )}
                {state === 'done' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-700 font-semibold">{statusMsg}</span>
                        <button onClick={reset} className="text-[10px] text-emerald-500 underline font-bold">Otro</button>
                    </div>
                )}
                {state === 'error' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-700 font-semibold">{statusMsg}</span>
                        <button onClick={reset} className="text-[10px] text-red-500 underline font-bold">Reintentar</button>
                    </div>
                )}
            </div>
        )
    }

    // ═══ FULL MODE (drop zone) ═══
    return (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer
                ${isDragging ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}
                ${state === 'selected' ? 'border-emerald-300 bg-emerald-50/50' : ''}
                ${state === 'done' ? 'border-emerald-400 bg-emerald-50/30' : ''}
                ${state === 'error' ? 'border-red-300 bg-red-50/30' : ''}`}
            onClick={() => state === 'idle' && fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept={accept} onChange={handleFileInput} className="hidden" />

            {state === 'idle' && (
                <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-md">
                        <Upload className={`w-5 h-5 text-white`} />
                    </div>
                    <p className="text-xs font-bold text-slate-600">{isDragging ? 'Soltar archivo aquí' : 'Arrastra o selecciona archivo'}</p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG, DOCX — máx. 20MB</p>
                    {enableExtraction && (
                        <p className="text-[10px] text-violet-500 font-semibold flex items-center justify-center gap-1">
                            <Brain className="w-3 h-3" /> Con extracción automática por IA
                        </p>
                    )}
                </div>
            )}

            {state === 'selected' && selectedFile && (
                <div className="space-y-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{selectedFile.name}</span>
                        <button onClick={reset}><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                    </div>
                    <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    <div className="flex items-center justify-center gap-2">
                        <Button size="sm" onClick={uploadOnly}
                            className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Solo Guardar
                        </Button>
                        {enableExtraction && (
                            <Button size="sm" onClick={uploadAndExtract}
                                className="rounded-xl text-xs font-bold gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md">
                                <Sparkles className="w-3 h-3" /> Guardar + Extraer IA
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {(state === 'uploading' || state === 'extracting' || state === 'saving') && (
                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
                    <p className="text-sm font-bold text-violet-700">{statusMsg}</p>
                    <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000
                            ${state === 'uploading' ? 'w-1/3' : state === 'extracting' ? 'w-2/3' : 'w-full'}`} />
                    </div>
                </div>
            )}

            {state === 'done' && (
                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-emerald-700">{statusMsg}</p>
                    {extractedCount > 0 && (
                        <p className="text-[10px] text-emerald-500 font-semibold">{extractedCount} parámetros extraídos y guardados</p>
                    )}
                    {savedUrl && (
                        <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-500 underline flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3" /> Ver archivo
                        </a>
                    )}
                    <button onClick={reset} className="text-[10px] text-slate-400 underline hover:text-slate-600 font-bold">Subir otro archivo</button>
                </div>
            )}

            {state === 'error' && (
                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                    <p className="text-sm font-bold text-red-600">{statusMsg}</p>
                    <button onClick={reset} className="text-[10px] text-red-500 underline font-bold">Reintentar</button>
                </div>
            )}
        </div>
    )
}
