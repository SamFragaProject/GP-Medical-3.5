/**
 * EstudioUploadReview.tsx — Motor de Extracción Pro (Consolidador Edition)
 * Usa los prompts especializados de geminiDocumentService.ts.
 */
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    UploadCloud, FileText, CheckCircle, AlertCircle, Loader2,
    Database, Brain, Sparkles, Eye, Save, Trash2, Edit3,
    Activity, BarChart3, LineChart as LucideLineChart, ChevronDown, ChevronUp
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
    analyzeDocument, analyzeSpirometryDirect, analyzeAudiometryDirect, type StructuredMedicalData, type LabResult
} from '@/services/geminiDocumentService'
import { crearEstudioConResultados, type TipoEstudio } from '@/services/estudiosService'
import AudiometryReviewClone from '@/components/expediente/AudiometryReviewClone'

type Phase = 'idle' | 'uploading' | 'extracting' | 'review' | 'saving' | 'done' | 'error'

interface Props {
    pacienteId: string
    tipoEstudio: TipoEstudio
    pacienteNombre?: string
    onSaved?: () => void
}

const STUDY_CONFIG: Record<string, { title: string, icon: any, gradient: string, shadow: string, category: string, sectionId: string }> = {
    laboratorio: { title: 'Laboratorio Clínico', icon: Database, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200', category: 'Laboratorio', sectionId: 'laboratorio' },
    audiometria: { title: 'Audiometría Tonal', icon: Activity, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200', category: 'Audiometría', sectionId: 'audiometria' },
    espirometria: { title: 'Espirometría Pro', icon: Activity, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200', category: 'Espirometría', sectionId: 'espirometria' },
    ecg: { title: 'Electrocardiograma (ECG)', icon: LucideLineChart, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200', category: 'ECG', sectionId: 'ecg' },
    radiografia: { title: 'Radiografía / RX', icon: FileText, gradient: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-300', category: 'Rayos X', sectionId: 'radiografia' },
    optometria: { title: 'Optometría / Visión', icon: Eye, gradient: 'from-cyan-500 to-sky-600', shadow: 'shadow-cyan-200', category: 'Optometría', sectionId: 'optometria' },
    historia_clinica: { title: 'Historia Clínica Ocupacional', icon: BarChart3, gradient: 'from-emerald-600 to-teal-700', shadow: 'shadow-emerald-300', category: 'Historia Clínica', sectionId: 'historia_clinica' },
}

export default function EstudioUploadReview({ pacienteId, tipoEstudio, pacienteNombre, onSaved }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [extractedData, setExtractedData] = useState<StructuredMedicalData | null>(null)
    const [spirocloneData, setSpirocloneData] = useState<any>(null) // SpiroClone direct data
    const [audiocloneData, setAudiocloneData] = useState<any>(null) // AudioClone direct data
    const [editingIdx, setEditingIdx] = useState<number | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ 'General': true, 'Audiometría Tonal': true, 'Biometría Hemática': true, 'Interpretación': true })

    const config = STUDY_CONFIG[tipoEstudio] || STUDY_CONFIG.laboratorio
    const fileInputRef = useRef<HTMLInputElement>(null)

    const prepareFilesForAnalysis = async (file: File) => {
        let rawText = ''
        let images: File[] = []
        if (file.type === 'application/pdf') {
            const pdfjsLib = await import('pdfjs-dist')
            // @ts-ignore
            pdfjsLib.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default
            const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise
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
                    await page.render({ canvasContext: ctx, viewport: vp, canvas: canvas } as any).promise
                    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.8))
                    if (blob) images.push(new File([blob], `page_${i}.jpg`, { type: 'image/jpeg' }))
                }
            }
        } else if (file.type.startsWith('image/')) { images = [file] }
        return { rawText, images }
    }

    const startProcess = async (file: File) => {
        setPhase('uploading'); setProgress(10); setErrorMsg('')
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${pacienteNombre || pacienteId}_${tipoEstudio}_${Date.now()}.${fileExt}`.replace(/\s/g, '_')
            const { error: uploadError } = await supabase.storage.from('documentos-medicos').upload(fileName, file)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('documentos-medicos').getPublicUrl(fileName)
            setFileUrl(publicUrl); setProgress(30); setPhase('extracting')

            const { rawText, images } = await prepareFilesForAnalysis(file)
            setProgress(50)

            // ── ESPIROMETRÍA: usar motor SpiroClone directo ──
            if (tipoEstudio === 'espirometria') {
                const spiroData = await analyzeSpirometryDirect(rawText, images)
                setSpirocloneData(spiroData)
                // Crear un extractedData mínimo para la UI de review
                setExtractedData({
                    patientData: { name: spiroData.patient?.name || 'Paciente' },
                    results: (spiroData.results || []).map((r: any) => ({
                        name: r.parameter, value: r.mejor || '', unit: '', range: '',
                        description: `Pred: ${r.pred} | LLN: ${r.lln} | %Pred: ${r.percentPred} | Z: ${r.zScore}`,
                        visualizationType: 'simple' as any, category: 'Parámetros Espirométricos',
                        parametro: r.parameter, resultado: r.mejor || '', unidad: '', rango: '',
                        observacion: '', categoria: 'Parámetros Espirométricos'
                    })),
                    summary: spiroData.session?.interpretation || spiroData.doctor?.notes || 'Espirometría procesada'
                })
                setProgress(100); setPhase('review')
                toast.success('SpiroClone: Extracción completa con gráficas')
                return
            }

            // ── AUDIOMETRÍA: usar motor AudioClone directo ──
            if (tipoEstudio === 'audiometria') {
                const audioData = await analyzeAudiometryDirect(rawText, images)
                setAudiocloneData(audioData)
                // Construir resultados para la UI de review
                const allResults: any[] = []
                // Umbrales OD
                ;(audioData.thresholds?.right || []).forEach((t: any) => {
                    if (t.value !== null && t.value !== undefined) {
                        allResults.push({
                            name: `OD ${t.frequency} Hz`, value: `${t.value} dB`, unit: 'dB HL', range: '≤25 normal',
                            description: '', visualizationType: 'simple' as any, category: 'Oído Derecho',
                            parametro: `OD_${t.frequency}Hz`, resultado: String(t.value), unidad: 'dB HL', rango: '≤25',
                            observacion: '', categoria: 'Oído Derecho'
                        })
                    }
                })
                // Umbrales OI
                ;(audioData.thresholds?.left || []).forEach((t: any) => {
                    if (t.value !== null && t.value !== undefined) {
                        allResults.push({
                            name: `OI ${t.frequency} Hz`, value: `${t.value} dB`, unit: 'dB HL', range: '≤25 normal',
                            description: '', visualizationType: 'simple' as any, category: 'Oído Izquierdo',
                            parametro: `OI_${t.frequency}Hz`, resultado: String(t.value), unidad: 'dB HL', rango: '≤25',
                            observacion: '', categoria: 'Oído Izquierdo'
                        })
                    }
                })
                // Audiograma completo (JSON blob para reconstrucción)
                const audiogramData = [
                    ...(audioData.thresholds?.right || []).filter((t: any) => t.value !== null).map((t: any) => ({ frecuencia: t.frequency, od: t.value })),
                ]
                ;(audioData.thresholds?.left || []).forEach((t: any) => {
                    if (t.value === null) return
                    const existing = audiogramData.find(a => a.frecuencia === t.frequency)
                    if (existing) existing.oi = t.value
                    else audiogramData.push({ frecuencia: t.frequency, oi: t.value })
                })
                allResults.push({
                    name: 'AUDIOGRAMA_DATOS', value: JSON.stringify(audiogramData), unit: '', range: '',
                    description: 'Datos del audiograma completo', visualizationType: 'simple' as any,
                    category: 'Audiograma', parametro: 'AUDIOGRAMA_DATOS', resultado: JSON.stringify(audiogramData),
                    unidad: '', rango: '', observacion: '', categoria: 'Audiograma'
                })
                // Diagnósticos
                if (audioData.diagnosis?.rightEar) {
                    allResults.push({ name: 'DIAGNOSTICO_OD', value: audioData.diagnosis.rightEar, unit: '', range: '', description: '', visualizationType: 'simple' as any, category: 'Diagnóstico', parametro: 'DIAGNOSTICO_OD', resultado: audioData.diagnosis.rightEar, unidad: '', rango: '', observacion: '', categoria: 'Diagnóstico' })
                }
                if (audioData.diagnosis?.leftEar) {
                    allResults.push({ name: 'DIAGNOSTICO_OI', value: audioData.diagnosis.leftEar, unit: '', range: '', description: '', visualizationType: 'simple' as any, category: 'Diagnóstico', parametro: 'DIAGNOSTICO_OI', resultado: audioData.diagnosis.leftEar, unidad: '', rango: '', observacion: '', categoria: 'Diagnóstico' })
                }
                if (audioData.diagnosis?.general) {
                    allResults.push({ name: 'DIAGNOSTICO_GENERAL', value: audioData.diagnosis.general, unit: '', range: '', description: '', visualizationType: 'simple' as any, category: 'Diagnóstico', parametro: 'DIAGNOSTICO_GENERAL', resultado: audioData.diagnosis.general, unidad: '', rango: '', observacion: '', categoria: 'Diagnóstico' })
                }
                // Datos del estudio
                if (audioData.testDetails?.doctor) {
                    allResults.push({ name: 'MEDICO_RESPONSABLE', value: audioData.testDetails.doctor, unit: '', range: '', description: '', visualizationType: 'simple' as any, category: 'Datos del Estudio', parametro: 'MEDICO_RESPONSABLE', resultado: audioData.testDetails.doctor, unidad: '', rango: '', observacion: '', categoria: 'Datos del Estudio' })
                }
                if (audioData.equipment?.device) {
                    allResults.push({ name: 'EQUIPO', value: audioData.equipment.device, unit: '', range: '', description: `SN: ${audioData.equipment?.serialNumber || '-'} | Cal: ${audioData.equipment?.calibrationDate || '-'}`, visualizationType: 'simple' as any, category: 'Datos del Estudio', parametro: 'EQUIPO', resultado: audioData.equipment.device, unidad: '', rango: '', observacion: '', categoria: 'Datos del Estudio' })
                }

                setExtractedData({
                    patientData: { name: audioData.patient?.name || 'Paciente', age: audioData.patient?.age, gender: audioData.patient?.sex },
                    results: allResults,
                    summary: `Audiometría Tonal — OD: ${audioData.diagnosis?.rightEar || 'Sin dx'} | OI: ${audioData.diagnosis?.leftEar || 'Sin dx'}. Doctor: ${audioData.testDetails?.doctor || '-'}. Equipo: ${audioData.equipment?.device || '-'}.`
                })
                setProgress(100); setPhase('review')
                toast.success(`AudioClone: ${allResults.length} parámetros extraídos con precisión`)
                return
            }

            const analysis = await analyzeDocument(config.sectionId, rawText, images)
            setExtractedData(analysis); setProgress(100); setPhase('review')
            toast.success('Extracción de alta precisión completada')
        } catch (err: any) {
            console.error(err); setErrorMsg(err.message); setPhase('error')
        }
    }

    // ── CONFIRMAR Y GUARDAR (MÁXIMA PRECISIÓN) ──
    const confirmAndSave = async () => {
        if (!pacienteId || !extractedData) return
        setPhase('saving')

        try {
            // ═══════════════════════════════════════════════
            // ESPIROMETRÍA: Guardar datos de SpiroClone directo
            // ═══════════════════════════════════════════════
            if (tipoEstudio === 'espirometria' && spirocloneData) {
                const minimalResults = (spirocloneData.results || []).map((r: any) => ({
                    parametro_nombre: r.parameter || '',
                    categoria: 'Parámetros Espirométricos',
                    resultado: r.mejor || '',
                    resultado_numerico: parseFloat(String(r.mejor).replace('*', '')) || null,
                    unidad: r.parameter?.match(/\[(.+?)\]/)?.[1] || '',
                    observacion: `Pred:${r.pred} LLN:${r.lln} %Pred:${r.percentPred} Z:${r.zScore}`
                }))

                const estudio = await crearEstudioConResultados(
                    pacienteId,
                    tipoEstudio,
                    {
                        fecha_estudio: spirocloneData.testDetails?.date?.slice(0, 10) || new Date().toISOString().split('T')[0],
                        archivo_origen: fileUrl,
                        institucion: 'GP Medical Health - SpiroClone Pro',
                        interpretacion: spirocloneData.session?.interpretation || spirocloneData.doctor?.notes || '',
                        medico_responsable: spirocloneData.doctor?.name || 'Motor SpiroClone IA',
                        datos_extra: {
                            spiroclone_data: spirocloneData,
                            _ai_config: 'SpiroClone Direct Pipeline'
                        }
                    },
                    minimalResults
                )
                if (!estudio) throw new Error('No se pudo crear el registro del estudio')
                setPhase('done')
                toast.success('Espirometría integrada con SpiroClone')
                if (onSaved) onSaved()
                return
            }

            // ═══════════════════════════════════════════════
            // AUDIOMETRÍA: Guardar datos de AudioClone directo
            // ═══════════════════════════════════════════════
            if (tipoEstudio === 'audiometria' && audiocloneData) {
                const audioResults: any[] = []
                // Umbrales por frecuencia - formato que AudiometriaTab puede leer
                ;(audiocloneData.thresholds?.right || []).forEach((t: any) => {
                    if (t.value !== null && t.value !== undefined) {
                        audioResults.push({
                            parametro_nombre: `OD_${t.frequency}Hz`,
                            categoria: 'Oído Derecho',
                            resultado: String(t.value),
                            resultado_numerico: Number(t.value),
                            unidad: 'dB HL',
                            observacion: ''
                        })
                    }
                })
                ;(audiocloneData.thresholds?.left || []).forEach((t: any) => {
                    if (t.value !== null && t.value !== undefined) {
                        audioResults.push({
                            parametro_nombre: `OI_${t.frequency}Hz`,
                            categoria: 'Oído Izquierdo',
                            resultado: String(t.value),
                            resultado_numerico: Number(t.value),
                            unidad: 'dB HL',
                            observacion: ''
                        })
                    }
                })
                // AUDIOGRAMA_DATOS blob para renderizado de gráfica
                const audioBlobData = [
                    ...(audiocloneData.thresholds?.right || []).filter((t: any) => t.value !== null).map((t: any) => ({ frecuencia: t.frequency, od: t.value })),
                ]
                ;(audiocloneData.thresholds?.left || []).forEach((t: any) => {
                    if (t.value === null) return
                    const existing = audioBlobData.find(a => a.frecuencia === t.frequency)
                    if (existing) (existing as any).oi = t.value
                    else audioBlobData.push({ frecuencia: t.frequency, oi: t.value } as any)
                })
                audioResults.push({
                    parametro_nombre: 'AUDIOGRAMA_DATOS',
                    categoria: 'Audiograma',
                    resultado: JSON.stringify(audioBlobData),
                    resultado_numerico: null,
                    unidad: '',
                    observacion: 'Datos del audiograma completo (JSON)'
                })
                // Diagnósticos
                if (audiocloneData.diagnosis?.rightEar) {
                    audioResults.push({ parametro_nombre: 'DIAGNOSTICO_OD', categoria: 'Diagnóstico', resultado: audiocloneData.diagnosis.rightEar, resultado_numerico: null, unidad: '', observacion: '' })
                }
                if (audiocloneData.diagnosis?.leftEar) {
                    audioResults.push({ parametro_nombre: 'DIAGNOSTICO_OI', categoria: 'Diagnóstico', resultado: audiocloneData.diagnosis.leftEar, resultado_numerico: null, unidad: '', observacion: '' })
                }
                if (audiocloneData.diagnosis?.general) {
                    audioResults.push({ parametro_nombre: 'DIAGNOSTICO_GENERAL', categoria: 'Diagnóstico', resultado: audiocloneData.diagnosis.general, resultado_numerico: null, unidad: '', observacion: '' })
                }
                // Equipo y médico
                if (audiocloneData.testDetails?.doctor) {
                    audioResults.push({ parametro_nombre: 'MEDICO_RESPONSABLE', categoria: 'Datos del Estudio', resultado: audiocloneData.testDetails.doctor, resultado_numerico: null, unidad: '', observacion: '' })
                }
                if (audiocloneData.equipment?.device) {
                    audioResults.push({ parametro_nombre: 'EQUIPO', categoria: 'Datos del Estudio', resultado: audiocloneData.equipment.device, resultado_numerico: null, unidad: '', observacion: `SN: ${audiocloneData.equipment?.serialNumber || '-'} | Cal: ${audiocloneData.equipment?.calibrationDate || '-'}` })
                }

                // Extraer fecha
                let fechaEstudio = new Date().toISOString().split('T')[0]
                if (audiocloneData.testDetails?.audiometryDate) {
                    const parts = audiocloneData.testDetails.audiometryDate.match(/(\d{2})\/(\d{2})\/(\d{4})/)
                    if (parts) fechaEstudio = `${parts[3]}-${parts[2]}-${parts[1]}`
                }

                const diagText = [audiocloneData.diagnosis?.rightEar, audiocloneData.diagnosis?.leftEar, audiocloneData.diagnosis?.general].filter(Boolean).join(' | ')

                const estudio = await crearEstudioConResultados(
                    pacienteId,
                    tipoEstudio,
                    {
                        fecha_estudio: fechaEstudio,
                        archivo_origen: fileUrl,
                        institucion: 'GP Medical Health - AudioClone Pro',
                        interpretacion: diagText || 'Audiometría procesada por AudioClone IA',
                        medico_responsable: audiocloneData.testDetails?.doctor || 'Motor AudioClone IA',
                        equipo: audiocloneData.equipment?.device || '',
                        diagnostico: diagText,
                        datos_extra: {
                            audioclone_data: audiocloneData,
                            _ai_config: 'AudioClone Direct Pipeline'
                        }
                    },
                    audioResults
                )
                if (!estudio) throw new Error('No se pudo crear el registro del estudio')
                setPhase('done')
                toast.success('Audiometría integrada con AudioClone')
                if (onSaved) onSaved()
                return
            }

            // ═══════════════════════════════════════════════
            // OTROS ESTUDIOS: Pipeline genérico normal
            // ═══════════════════════════════════════════════
            // 1. Preparar resultados estándar (strings, números, o JSON serializado)
            // Los registros con visualizationType 'line_chart' se guardarán en la tabla de gráficas por separado
            const resultsToSave = extractedData.results
                .filter(r => r.visualizationType !== 'line_chart')
                .map(r => ({
                    parametro_nombre: r.name,
                    categoria: r.category || 'General',
                    resultado: typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value),
                    resultado_numerico: typeof r.value === 'number' ? r.value : parseFloat(String(r.value)) || null,
                    unidad: r.unit || '',
                    observacion: r.description || ''
                }))

            // 2. Extraer gráficas (Audiogramas, Curvas Espirometría, etc.)
            const graphsToSave = extractedData.results
                .filter(r => r.visualizationType === 'line_chart' && typeof r.value === 'object')
                .map(r => ({
                    titulo: r.name,
                    puntos: Array.isArray(r.value) ? r.value : [],
                    tipo_grafica: 'linea',
                    eje_x_label: r.name === 'Gráfica Audiométrica' ? 'Frecuencia (Hz)' : 'Volumen (L)',
                    eje_y_label: r.name === 'Gráfica Audiométrica' ? 'Nivel (dB)' : 'Flujo (L/s)',
                }))

            // 3. Crear el estudio base y sus resultados
            const estudio = await crearEstudioConResultados(
                pacienteId,
                tipoEstudio,
                {
                    fecha_estudio: extractedData.patientData?.reportDate || new Date().toISOString().split('T')[0],
                    archivo_origen: fileUrl,
                    institucion: 'GP Medical Health - Motor IA Pro',
                    interpretacion: extractedData.summary,
                    medico_responsable: 'Inteligencia Artificial Pro v3',
                    datos_extra: {
                        patientData: extractedData.patientData,
                        _ai_config: "Google Gemini Flash 2.0"
                    }
                },
                resultsToSave
            )

            if (!estudio) throw new Error('No se pudo crear el registro maestro del estudio')

            // 4. Guardar gráficas si las hay
            const { agregarGrafica, upsertAntecedente } = await import('@/services/estudiosService')
            if (graphsToSave.length > 0) {
                for (const g of graphsToSave) {
                    await agregarGrafica(estudio.id, g)
                }
            }

            // 5. Si es historia_clinica → mapear campos extraídos a tablas de antecedentes
            if (tipoEstudio === 'historia_clinica' && extractedData.results) {
                const getVal = (name: string) => {
                    const r = extractedData.results.find(r =>
                        r.name?.toUpperCase() === name.toUpperCase() ||
                        r.parametro?.toUpperCase() === name.toUpperCase()
                    )
                    return r ? (typeof r.value === 'string' ? r.value : String(r.value ?? '')) : ''
                }

                // APNP
                const apnpMap: Record<string, string> = {
                    tabaquismo: 'TABACO', alcoholismo: 'ALCOHOL', drogadiccion: 'DROGAS',
                    ejercicio: 'EJERCICIO', alimentacion: 'ALIMENTACION', cafe: 'CAFE', horas_sueno: 'HORAS_SUENO'
                }
                for (const [campo, key] of Object.entries(apnpMap)) {
                    const val = getVal(key)
                    if (val) {
                        const esSi = val.toLowerCase().startsWith('sí') || val.toLowerCase().startsWith('si')
                        await upsertAntecedente(pacienteId, 'APNP', campo, val, esSi)
                    }
                }

                // AHF
                const ahfMap: Record<string, string> = {
                    diabetes: 'AHF_DIABETES', hipertension: 'AHF_HIPERTENSION',
                    cancer: 'AHF_CANCER', cardiopatias: 'AHF_CARDIOPATIAS',
                    enf_mentales: 'AHF_ENF_MENTALES', otras: 'AHF_OTRAS'
                }
                for (const [campo, key] of Object.entries(ahfMap)) {
                    const r = extractedData.results.find(r => r.name?.toUpperCase() === key)
                    if (r) {
                        const esSi = String(r.value ?? '').toLowerCase().startsWith('sí') || String(r.value ?? '').toLowerCase().startsWith('si')
                        await upsertAntecedente(pacienteId, 'AHF', campo, String(r.value ?? ''), esSi, r.description || '')
                    }
                }

                // Patológicos
                const appMap: Record<string, string> = {
                    diabetes: 'DIABETES', hipertension: 'HIPERTENSION',
                    enf_cardiovascular: 'ENFERMEDADES_CARDIOVASCULARES',
                    enf_respiratoria: 'ENFERMEDADES_RESPIRATORIAS',
                    enf_renal: 'ENFERMEDADES_RENALES',
                    cirugias: 'CIRUGIAS_PREVIAS',
                    hospitalizaciones: 'HOSPITALIZACIONES',
                    alergias: 'ALERGIAS',
                    traumatismos: 'TRAUMATISMOS',
                }
                for (const [campo, key] of Object.entries(appMap)) {
                    const r = extractedData.results.find(r => r.name?.toUpperCase() === key)
                    if (r) {
                        const esSi = String(r.value ?? '').toLowerCase().startsWith('sí') || String(r.value ?? '').toLowerCase().startsWith('si')
                        await upsertAntecedente(pacienteId, 'APP', campo, String(r.value ?? ''), esSi, undefined, r.description || '')
                    }
                }
            }

            setPhase('done')
            toast.success('Expediente actualizado con precisión clinical')
            if (onSaved) onSaved()

        } catch (err: any) {
            console.error('Save error:', err)
            setErrorMsg(err.message)
            setPhase('error')
            toast.error('Error al integrar datos: ' + err.message)
        }
    }

    const toggleCategory = (cat: string) => setExpandedCategories(p => ({ ...p, [cat]: !p[cat] }))

    // ── Render: REVIEW (Paso 3) ──
    if (phase === 'review' && extractedData) {
        // Agrupar resultados por categoría
        const categories = Array.from(new Set(extractedData.results.map(r => r.category || 'General')))

        // ═══ AUDIOMETRÍA: Layout dedicado estilo clon GP Medical ═══
        if (tipoEstudio === 'audiometria' && audiocloneData) {
            return (
                <div className="space-y-5">
                    {/* Banner de confirmación */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-5 shadow-lg"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Edit3 className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-amber-900">Vista previa — AudioClone Digital</h3>
                                    <p className="text-xs text-amber-700">
                                        Réplica digital completa del reporte. <strong>{extractedData.results.length} parámetros</strong> extraídos. Verifica y confirma.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPhase('idle')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Descartar
                                </button>
                                <a href={fileUrl} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                                >
                                    <Eye className="w-4 h-4" /> Original
                                </a>
                                <button
                                    onClick={confirmAndSave}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-200/50 transition-all"
                                >
                                    <Save className="w-4 h-4" /> Confirmar y Guardar
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Clon visual a ancho completo */}
                    <div className="overflow-x-auto bg-slate-50/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="min-w-[800px]">
                            <AudiometryReviewClone data={audiocloneData} />
                        </div>
                    </div>
                </div>
            )
        }

        // ═══ OTROS ESTUDIOS: Layout genérico con acordeón ═══
        return (
            <div className="space-y-6">
                <Card className="overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white">
                    <div className={`p-10 bg-gradient-to-br ${config.gradient} text-white relative`}>
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Brain className="w-40 h-40 rotate-12" /></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-lg border border-white/20">
                                    <config.icon className="w-12 h-12" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">{config.title}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-white/20 text-white border-0 font-black px-3 py-1 text-[10px] uppercase">Paciente: {extractedData.patientData?.name || 'No detectado'}</Badge>
                                        <Badge className="bg-white/20 text-white border-0 font-black px-3 py-1 text-[10px] uppercase">Edad: {extractedData.patientData?.age || '-'}</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/20 text-center min-w-[120px]">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Confianza Médica</p>
                                <div className="flex items-center gap-1 justify-center">
                                    <Sparkles className="w-4 h-4 text-emerald-300" />
                                    <p className="text-2xl font-black tracking-tighter text-white">Pro v3</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* ALERT */}
                        <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[2rem] flex items-start gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md shadow-amber-100 flex items-center justify-center flex-shrink-0 animate-pulse"><Edit3 className="w-6 h-6 text-amber-500" /></div>
                            <div>
                                <h4 className="text-lg font-black text-amber-800 tracking-tight">Consolidador de Reportes Médicos IA</h4>
                                <p className="text-sm text-amber-600/80 leading-relaxed font-medium">Extraímos <strong>{extractedData.results.length} parámetros</strong> con precisión clínica. Por favor verifica los valores y gráficas antes de integrarlos al expediente oficial.</p>
                            </div>
                        </div>

                        {/* LISTADO DE CATEGORÍAS TIPO ACORDEÓN */}
                        <div className="space-y-4">
                            {categories.map(cat => (
                                <div key={cat} className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button onClick={() => toggleCategory(cat)} className="w-full px-8 py-5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                                            <span className="font-black text-slate-800 uppercase tracking-widest text-xs">{cat}</span>
                                            <Badge variant="secondary" className="bg-slate-200/50 text-slate-500 font-bold border-0 text-[9px]">{extractedData.results.filter(r => r.category === cat).length} items</Badge>
                                        </div>
                                        {expandedCategories[cat] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    {expandedCategories[cat] && (
                                        <div className="px-8 pb-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <table className="w-full text-sm">
                                                <thead className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50">
                                                    <tr>
                                                        <th className="py-4 text-left">Parámetro</th>
                                                        <th className="py-4 text-center">Valor / Resultado</th>
                                                        <th className="py-4 text-left">Unidad</th>
                                                        <th className="py-4 text-left">Rango</th>
                                                        <th className="py-4 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {extractedData.results.filter(r => r.category === cat).map((res, ri) => (
                                                        <tr key={ri} className="group hover:bg-slate-50/30">
                                                            <td className="py-4 font-bold text-slate-700">{res.name}</td>
                                                            <td className="py-4 text-center">
                                                                {typeof res.value === 'object' ? (
                                                                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold px-3 py-1">DATOS COMPLEJOS (GRÁFICA)</Badge>
                                                                ) : (
                                                                    <span className="text-xl font-black text-emerald-600 tracking-tighter">{res.value}</span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 text-slate-400 font-medium">{res.unit || '-'}</td>
                                                            <td className="py-4 text-slate-400 text-xs">{res.range || '-'}</td>
                                                            <td className="py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* SUMMARY */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Interpretación Clínica Integral</h4>
                            <div className="p-8 bg-slate-50/80 border border-slate-100 rounded-[2.5rem] relative group">
                                <LucideLineChart className="absolute top-4 right-4 w-6 h-6 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap italic">"{extractedData.summary}"</p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                            <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[10px] font-black text-indigo-500 uppercase hover:text-indigo-700 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform"><Eye className="w-5 h-5" /></div>
                                Ver Documento Original
                            </a>
                            <div className="flex gap-4">
                                <button onClick={() => setPhase('idle')} className="px-8 py-4 rounded-3xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Descartar</button>
                                <button onClick={confirmAndSave} className={`px-12 py-5 rounded-[1.5rem] bg-gradient-to-r ${config.gradient} text-white text-[11px] font-black uppercase tracking-widest shadow-2xl ${config.shadow} flex items-center gap-4 hover:scale-105 transition-all active:scale-95`}>
                                    <Save className="w-5 h-5" /> Integrar al Expediente ({extractedData.results.length} Resultados)
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    // ── Render: LOADING / IDLE (Simplificados para no repetir) ──
    if (phase === 'idle') {
        return (
            <div className={`p-10 border-4 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center gap-6 cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-50 animate-pulse' : 'border-slate-100 hover:border-emerald-400 hover:bg-emerald-50/20'}`}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setSelectedFile(f); startProcess(f); } }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); startProcess(f); } }} accept=".pdf,.png,.jpg,.jpeg" />
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-2xl ${config.shadow}`}><UploadCloud className="w-12 h-12 text-white" /></div>
                <div className="text-center">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">Cargar {config.category}</h4>
                    <p className="text-slate-400 font-medium mt-1">Sube el reporte para análisis con IA de alta precisión</p>
                </div>
                <div className="flex gap-2">
                    {['PDF Vision', 'Extracción Gráfica', 'OCR v3'].map(t => <Badge key={t} className="bg-slate-100 text-slate-400 border-0 font-bold px-3 py-1 text-[10px] uppercase">{t}</Badge>)}
                </div>
            </div>
        )
    }

    if (phase === 'uploading' || phase === 'extracting') {
        return (
            <Card className="border-0 shadow-2xl p-16 bg-white rounded-[3rem] text-center space-y-10 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-2 bg-slate-100"><motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: progress + '%' }} /></div>
                <div className="relative w-32 h-32 mx-auto">
                    <Loader2 className="w-full h-full text-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center"><Brain className="w-12 h-12 text-emerald-400 animate-pulse" /></div>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Procesando con Motor IA Pro</h3>
                    <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto">Estamos convirtiendo el PDF en imágenes y analizando parámetros específicos para <strong>{config.title}</strong>...</p>
                </div>
            </Card>
        )
    }

    if (phase === 'saving') {
        return (
            <Card className="border-0 shadow-2xl p-16 bg-white rounded-[3rem] text-center space-y-10 relative overflow-hidden">
                <div className="w-32 h-32 mx-auto">
                    <Loader2 className="w-full h-full text-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center"><Database className="w-12 h-12 text-blue-400 animate-pulse" /></div>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Integrando al Expediente</h3>
                    <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto">Estamos guardando los resultados y configurando las gráficas técnicas...</p>
                </div>
            </Card>
        )
    }

    if (phase === 'error') {
        return (
            <Card className="border-0 shadow-2xl p-16 bg-red-50 rounded-[3rem] text-center space-y-8 border-2 border-red-200">
                <div className="w-24 h-24 bg-red-100 rounded-[2.5rem] flex items-center justify-center mx-auto"><AlertCircle className="w-12 h-12 text-red-500" /></div>
                <div>
                    <h3 className="text-3xl font-black text-red-900 tracking-tighter">Error de Análisis</h3>
                    <p className="text-red-600 font-medium mt-2 max-w-md mx-auto">{errorMsg || 'Ocurrió un error inesperado al procesar el documento.'}</p>
                </div>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setPhase('idle')} className="px-10 py-4 bg-white text-red-600 border-2 border-red-200 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all">Cancelar</button>
                    <button onClick={() => selectedFile && startProcess(selectedFile)} className="px-10 py-4 bg-red-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-200 transition-all">Reintentar</button>
                </div>
            </Card>
        )
    }

    if (phase === 'done') {
        return (
            <Card className="border-0 shadow-2xl p-16 bg-white rounded-[4rem] text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-28 h-28 bg-emerald-500 rounded-[2.5rem] shadow-2xl shadow-emerald-200 flex items-center justify-center mx-auto scale-110">
                    <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <div>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">¡Éxito!</h3>
                    <p className="text-slate-400 text-lg font-medium mt-2">Los resultados han sido integrados correctamente al expediente.</p>
                </div>
                <button
                    onClick={() => { setPhase('idle'); setExtractedData(null); }}
                    className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                >
                    Siguiente Estudio
                </button>
            </Card>
        )
    }

    return (
        <div className="p-4 text-center text-slate-400 text-xs">
            Motor IA Pro en espera de comandos... (Estado: {phase})
        </div>
    )
}
