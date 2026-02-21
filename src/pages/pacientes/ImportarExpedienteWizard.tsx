/**
 * ImportarExpedienteWizard — Importación Inteligente de Expedientes
 * 
 * Wizard de 4 pasos:
 *   1. 📤 Subir archivos (PDF, DOCX, PPTX, JPG)
 *   2. 🤖 Extracción con IA (OpenAI GPT-4o)
 *   3. ✅ Revisión y edición de datos
 *   4. 💾 Confirmación y creación del paciente
 */

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, FileText, Image, File, Trash2, ChevronRight, ChevronLeft,
    Loader2, CheckCircle, AlertTriangle, Brain, Sparkles, Shield,
    User, Building2, Heart, Phone, Stethoscope, Activity,
    Eye, Ear, Wind, FlaskConical, Bone, X, Download,
    FolderOpen, ArrowRight, Save, FileImage, Presentation,
    FileSpreadsheet, Check, AlertCircle, Zap, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import {
    documentExtractorService,
    type DatosExtraidos,
    type ExtractionResult
} from '@/services/documentExtractorService'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// ============================================
// TIPOS
// ============================================

interface Props {
    onComplete: (data: DatosExtraidos, existingPacienteId?: string) => void
    onCancel: () => void
    empresaId?: string
}

interface FileWithPreview {
    file: File
    preview?: string
    extension: string
    category: string       // Categoría detectada automáticamente
    status: 'pending' | 'processing' | 'done' | 'error'
    result?: ExtractionResult
}

// ============================================
// HELPERS
// ============================================

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.docx,.doc,.pptx,.ppt,.xlsx,.xls'

const EXTENSION_ICONS: Record<string, typeof FileText> = {
    pdf: FileText,
    jpg: FileImage, jpeg: FileImage, png: FileImage, webp: FileImage,
    docx: FileSpreadsheet, doc: FileSpreadsheet,
    pptx: Presentation, ppt: Presentation,
    xlsx: FileSpreadsheet, xls: FileSpreadsheet,
}

const EXT_COLORS: Record<string, string> = {
    pdf: 'bg-red-500',
    jpg: 'bg-blue-500', jpeg: 'bg-blue-500', png: 'bg-green-500', webp: 'bg-teal-500',
    docx: 'bg-indigo-500', doc: 'bg-indigo-500',
    pptx: 'bg-orange-500', ppt: 'bg-orange-500',
    xlsx: 'bg-emerald-500', xls: 'bg-emerald-500',
}

function detectCategory(name: string): string {
    const n = name.toLowerCase()
    if (n.includes('audiometr')) return 'Audiometría'
    if (n.includes('laboratorio') || n.includes('lab')) return 'Laboratorio'
    if (n.includes('radiograf') || n.includes('rayos') || n.includes('rx')) return 'Radiografía'
    if (n.includes('historia') || n.includes('clinica')) return 'Historia Clínica'
    if (n.includes('certificado') || n.includes('aptitud')) return 'Certificado'
    if (n.includes('interpretacion')) return 'Interpretación'
    if (n.includes('resumen')) return 'Resumen'
    if (n.includes('espirometr')) return 'Espirometría'
    if (/\d+\.\d+\.\d+/.test(n)) return 'Imagen DICOM'
    return 'Documento'
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}

const STEP_LABELS = [
    { label: 'Subir Archivos', icon: Upload },
    { label: 'Extracción IA', icon: Brain },
    { label: 'Revisar Datos', icon: CheckCircle },
    { label: 'Crear Paciente', icon: Save },
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ImportarExpedienteWizard({ onComplete, onCancel, empresaId }: Props) {
    const { user } = useAuth()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // State
    const [step, setStep] = useState(1)
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [extractedData, setExtractedData] = useState<DatosExtraidos | null>(null)
    const [editableData, setEditableData] = useState<Record<string, any>>({})
    const [processing, setProcessing] = useState(false)
    const [processingFile, setProcessingFile] = useState('')
    const [processingProgress, setProcessingProgress] = useState(0)
    const [dragOver, setDragOver] = useState(false)
    const [existingPacientes, setExistingPacientes] = useState<any[]>([])
    const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null)

    // ---- Step 1: File Upload ----

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles).map(file => {
            const ext = file.name.split('.').pop()?.toLowerCase() || ''
            const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
            return {
                file,
                preview,
                extension: ext,
                category: detectCategory(file.name),
                status: 'pending' as const
            }
        })
        setFiles(prev => [...prev, ...fileArray])
    }, [])

    const removeFile = useCallback((index: number) => {
        setFiles(prev => {
            const updated = [...prev]
            if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!)
            updated.splice(index, 1)
            return updated
        })
    }, [])

    // ---- Step 2: AI Extraction ----

    const startExtraction = async () => {
        setStep(2)
        setProcessing(true)

        const updatedFiles = [...files]
        const allFiles = files.map(f => f.file)

        // Procesar archivo por archivo para mostrar progreso
        for (let i = 0; i < updatedFiles.length; i++) {
            updatedFiles[i].status = 'processing'
            setFiles([...updatedFiles])
            setProcessingFile(updatedFiles[i].file.name)
            setProcessingProgress(Math.round(((i) / allFiles.length) * 100))

            try {
                const result = await documentExtractorService.extractFromFile(updatedFiles[i].file)
                updatedFiles[i].result = result
                updatedFiles[i].status = result.success ? 'done' : 'error'
            } catch (err: any) {
                updatedFiles[i].status = 'error'
                updatedFiles[i].result = {
                    success: false,
                    data: null,
                    error: err.message,
                    processingTimeMs: 0
                }
            }

            setFiles([...updatedFiles])
        }

        setProcessingProgress(100)

        // Fusionar todos los resultados
        const { mergedData } = await documentExtractorService.extractFromMultipleFiles(
            files.filter(f => f.status !== 'error').map(f => f.file)
        )

        // Si ya procesamos individualmente pero merger falla, usar los individuales
        const successResults = updatedFiles.filter(f => f.result?.success && f.result?.data)
        if (successResults.length > 0 && !mergedData.nombre) {
            // Fallback: usar el primer resultado exitoso como base
            const firstGood = successResults[0].result!.data!
            Object.assign(mergedData, firstGood)
        }

        setExtractedData(mergedData)
        setEditableData(flattenForEditing(mergedData))

        // 🚨 Verificar si el paciente existe
        await checkForExistingPatient(mergedData)

        setProcessing(false)
        setStep(3)
    }

    // ---- Check Existing Patient ----
    const checkForExistingPatient = async (data: DatosExtraidos) => {
        if (!empresaId) return

        try {
            let query = supabase.from('pacientes').select('id, nombre, apellido_paterno, apellido_materno, curp, nss, rfc, estatus').eq('empresa_id', empresaId)

            // Construir filtro OR para campos clave
            const orConditions: string[] = []
            if (data.curp) orConditions.push(`curp.eq."${data.curp}"`)
            if (data.rfc) orConditions.push(`rfc.eq."${data.rfc}"`)
            if (data.nss) orConditions.push(`nss.eq."${data.nss}"`)

            // Si hay nombre y apellido, buscar también por coincidencia de nombre completo
            if (data.nombre && data.apellido_paterno) {
                orConditions.push(`and(nombre.ilike."${data.nombre}",apellido_paterno.ilike."${data.apellido_paterno}")`)
            }

            if (orConditions.length > 0) {
                const { data: results, error } = await query.or(orConditions.join(','))

                if (!error && results && results.length > 0) {
                    setExistingPacientes(results)
                    setSelectedExistingId(results[0].id) // Auto select the first match
                    toast.success(`Se encontraron ${results.length} coincidencias en la base de datos`)
                }
            }
        } catch (err) {
            console.error("Error buscando pacientes existentes", err)
        }
    }

    // ---- Step 3: Review & Edit ----

    const updateField = (key: string, value: any) => {
        setEditableData(prev => ({ ...prev, [key]: value }))
    }

    // ---- Step 4: Confirm & Create ----

    const handleCreate = () => {
        if (!extractedData) return

        // Reconstruir datos con ediciones
        const finalData: DatosExtraidos = {
            ...extractedData,
            ...unflattenFromEditing(editableData)
        }

        onComplete(finalData)
        toast.success('🎉 Paciente creado a partir del expediente importado')
    }

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Step Indicator */}
            <div className="flex items-center justify-between px-4">
                {STEP_LABELS.map((s, i) => {
                    const isActive = step === i + 1
                    const isDone = step > i + 1
                    return (
                        <React.Fragment key={i}>
                            <div className={`flex items-center gap-2 ${isActive ? 'scale-105' : ''} transition-all`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                                    isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' :
                                        'bg-slate-100 text-slate-400'
                                    }`}>
                                    {isDone ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-bold hidden sm:inline ${isActive ? 'text-slate-800' : isDone ? 'text-emerald-600' : 'text-slate-400'
                                    }`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEP_LABELS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 rounded ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* ═══ STEP 1: Upload ═══ */}
                    {step === 1 && (
                        <Card className="border-2 border-dashed border-slate-200">
                            <CardContent
                                className={`p-8 transition-colors ${dragOver ? 'bg-blue-50 border-blue-300' : ''}`}
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                            >
                                {files.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-xl shadow-blue-200/50">
                                            <Upload className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 mb-2">
                                            Importar Expediente del Paciente
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-6 max-w-lg mx-auto">
                                            Sube los archivos del expediente (Historia Clínica, Laboratorios, Audiometría, Radiografías, etc.)
                                            y la IA extraerá automáticamente toda la información para crear el paciente.
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                                            {['PDF', 'DOCX', 'PPTX', 'JPG', 'PNG'].map(fmt => (
                                                <Badge key={fmt} variant="outline" className="text-sm px-3 py-1.5 bg-white">
                                                    {fmt}
                                                </Badge>
                                            ))}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPTED}
                                            multiple
                                            onChange={e => addFiles(e.target.files!)}
                                            className="hidden"
                                        />

                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl px-8 py-3 text-sm font-bold gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl"
                                        >
                                            <FolderOpen className="w-5 h-5" />
                                            Seleccionar Archivos
                                        </Button>

                                        <p className="text-[10px] text-slate-400 mt-4 flex items-center justify-center gap-1">
                                            <Brain className="w-3 h-3" />
                                            Powered by GPT-4o — Extracción inteligente con IA
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <FolderOpen className="w-5 h-5 text-blue-500" />
                                                {files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}
                                            </h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="rounded-xl text-xs gap-1"
                                            >
                                                <Upload className="w-3 h-3" /> Agregar más
                                            </Button>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPTED}
                                            multiple
                                            onChange={e => addFiles(e.target.files!)}
                                            className="hidden"
                                        />

                                        <div className="space-y-2">
                                            {files.map((f, idx) => {
                                                const Icon = EXTENSION_ICONS[f.extension] || File
                                                const color = EXT_COLORS[f.extension] || 'bg-slate-500'
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-200 transition-colors group"
                                                    >
                                                        {f.preview ? (
                                                            <img src={f.preview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
                                                                <Icon className="w-6 h-6 text-slate-600" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate">{f.file.name}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                                <span>{formatFileSize(f.file.size)}</span>
                                                                <span>•</span>
                                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{f.category}</Badge>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFile(idx)}
                                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* ═══ STEP 2: AI Extraction ═══ */}
                    {step === 2 && (
                        <Card>
                            <CardContent className="p-8">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                                        <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">
                                        Extrayendo datos con IA...
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        GPT-4o está analizando {files.length} archivo{files.length > 1 ? 's' : ''} para extraer toda la información médica
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="max-w-md mx-auto mb-8">
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                            animate={{ width: `${processingProgress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-slate-500 mt-2">
                                        {processingFile && `Procesando: ${processingFile}`}
                                    </p>
                                </div>

                                {/* File status list */}
                                <div className="space-y-2 max-w-lg mx-auto">
                                    {files.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                            {f.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
                                            {f.status === 'processing' && <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />}
                                            {f.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                            {f.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            <span className={`text-sm flex-1 truncate ${f.status === 'processing' ? 'font-bold text-purple-700' :
                                                f.status === 'done' ? 'text-emerald-700' :
                                                    f.status === 'error' ? 'text-red-600' :
                                                        'text-slate-500'
                                                }`}>
                                                {f.file.name}
                                            </span>
                                            {f.result?.processingTimeMs && (
                                                <span className="text-[10px] text-slate-400">
                                                    {(f.result.processingTimeMs / 1000).toFixed(1)}s
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ═══ STEP 3: Review ═══ */}
                    {step === 3 && extractedData && (
                        <div className="space-y-6">
                            {/* Confidence banner */}
                            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${extractedData._confianza >= 80 ? 'bg-emerald-50 border-emerald-200' :
                                extractedData._confianza >= 50 ? 'bg-amber-50 border-amber-200' :
                                    'bg-red-50 border-red-200'
                                }`}>
                                {extractedData._confianza >= 80 ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                )}
                                <div>
                                    <p className="text-sm font-bold">
                                        Confianza de extracción: {extractedData._confianza}%
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {extractedData._campos_encontrados?.length || 0} campos extraídos
                                        {extractedData._campos_faltantes?.length ? ` • ${extractedData._campos_faltantes.length} campos no encontrados` : ''}
                                    </p>
                                </div>
                                <Badge className={`ml-auto ${extractedData._confianza >= 80 ? 'bg-emerald-500' :
                                    extractedData._confianza >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                    } text-white`}>
                                    {extractedData._confianza}%
                                </Badge>
                            </div>

                            {/* Alertas de Duplicados / Actualización */}
                            {existingPacientes.length > 0 && (
                                <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-5 rounded-bl-full" />
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-indigo-900 mb-1">¡Paciente detectado en la base de datos!</h4>
                                            <p className="text-sm text-indigo-700 mb-3">
                                                Encontramos coincidencias (por CURP, RFC, NSS o Nombre exacto). Puedes actualizar su expediente
                                                o cancelar esta vinculación si es un homónimo.
                                            </p>
                                            <div className="space-y-2">
                                                {existingPacientes.map(p => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => setSelectedExistingId(selectedExistingId === p.id ? null : p.id)}
                                                        className={`cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all ${selectedExistingId === p.id
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                            : 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-400'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedExistingId === p.id ? 'border-white' : 'border-indigo-300'
                                                                }`}>
                                                                {selectedExistingId === p.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">
                                                                    {p.nombre} {p.apellido_paterno} {p.apellido_materno}
                                                                </p>
                                                                <div className={`flex gap-3 text-xs opacity-80`}>
                                                                    {p.curp && <span>CURP: {p.curp}</span>}
                                                                    {p.nss && <span>NSS: {p.nss}</span>}
                                                                    {p.estatus !== 'activo' && <Badge variant="outline" className={`ml-2 text-[9px] ${selectedExistingId === p.id ? 'border-white/50 text-white' : ''}`}>{p.estatus}</Badge>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Editable fields organized by section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Datos Personales */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" /> Datos Personales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <EditField label="Nombre(s)" field="nombre" value={editableData.nombre} onChange={updateField} />
                                        <EditField label="Apellido Paterno" field="apellido_paterno" value={editableData.apellido_paterno} onChange={updateField} />
                                        <EditField label="Apellido Materno" field="apellido_materno" value={editableData.apellido_materno} onChange={updateField} />
                                        <EditField label="Fecha Nacimiento" field="fecha_nacimiento" value={editableData.fecha_nacimiento} onChange={updateField} type="date" />
                                        <EditField label="Género" field="genero" value={editableData.genero} onChange={updateField} />
                                        <EditField label="CURP" field="curp" value={editableData.curp} onChange={updateField} />
                                        <EditField label="RFC" field="rfc" value={editableData.rfc} onChange={updateField} />
                                        <EditField label="NSS" field="nss" value={editableData.nss} onChange={updateField} />
                                        <EditField label="Estado Civil" field="estado_civil" value={editableData.estado_civil} onChange={updateField} />
                                        <EditField label="Tipo de Sangre" field="tipo_sangre" value={editableData.tipo_sangre} onChange={updateField} />
                                    </CardContent>
                                </Card>

                                {/* Datos Laborales */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-amber-500" /> Datos Laborales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <EditField label="No. Empleado" field="numero_empleado" value={editableData.numero_empleado} onChange={updateField} />
                                        <EditField label="Empresa" field="empresa_nombre" value={editableData.empresa_nombre} onChange={updateField} />
                                        <EditField label="Puesto" field="puesto" value={editableData.puesto} onChange={updateField} />
                                        <EditField label="Área" field="area" value={editableData.area} onChange={updateField} />
                                        <EditField label="Departamento" field="departamento" value={editableData.departamento} onChange={updateField} />
                                        <EditField label="Turno" field="turno" value={editableData.turno} onChange={updateField} />
                                        <EditField label="Fecha Ingreso" field="fecha_ingreso" value={editableData.fecha_ingreso} onChange={updateField} type="date" />
                                    </CardContent>
                                </Card>

                                {/* Contacto */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-500" /> Contacto
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <EditField label="Email" field="email" value={editableData.email} onChange={updateField} type="email" />
                                        <EditField label="Teléfono" field="telefono" value={editableData.telefono} onChange={updateField} />
                                        <EditField label="Contacto Emergencia" field="contacto_emergencia_nombre" value={editableData.contacto_emergencia_nombre} onChange={updateField} />
                                        <EditField label="Parentesco" field="contacto_emergencia_parentesco" value={editableData.contacto_emergencia_parentesco} onChange={updateField} />
                                        <EditField label="Tel. Emergencia" field="contacto_emergencia_telefono" value={editableData.contacto_emergencia_telefono} onChange={updateField} />
                                    </CardContent>
                                </Card>

                                {/* Datos Médicos */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4 text-rose-500" /> Datos Médicos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <EditField label="Alergias" field="alergias" value={editableData.alergias} onChange={updateField} multiline />
                                        <EditField label="Antecedentes Personales" field="antecedentes_personales" value={editableData.antecedentes_personales} onChange={updateField} multiline />
                                        <EditField label="Antecedentes Familiares" field="antecedentes_familiares" value={editableData.antecedentes_familiares} onChange={updateField} multiline />
                                        <EditField label="Padecimiento Actual" field="padecimiento_actual" value={editableData.padecimiento_actual} onChange={updateField} multiline />
                                    </CardContent>
                                </Card>

                                {/* Signos Vitales */}
                                {editableData.signos_vitales_peso_kg && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-red-500" /> Signos Vitales
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <EditField label="Peso (kg)" field="signos_vitales_peso_kg" value={editableData.signos_vitales_peso_kg} onChange={updateField} type="number" />
                                                <EditField label="Talla (cm)" field="signos_vitales_talla_cm" value={editableData.signos_vitales_talla_cm} onChange={updateField} type="number" />
                                                <EditField label="IMC" field="signos_vitales_imc" value={editableData.signos_vitales_imc} onChange={updateField} type="number" />
                                                <EditField label="PA Sistólica" field="signos_vitales_presion_sistolica" value={editableData.signos_vitales_presion_sistolica} onChange={updateField} type="number" />
                                                <EditField label="PA Diastólica" field="signos_vitales_presion_diastolica" value={editableData.signos_vitales_presion_diastolica} onChange={updateField} type="number" />
                                                <EditField label="FC" field="signos_vitales_frecuencia_cardiaca" value={editableData.signos_vitales_frecuencia_cardiaca} onChange={updateField} type="number" />
                                                <EditField label="SpO2" field="signos_vitales_saturacion_o2" value={editableData.signos_vitales_saturacion_o2} onChange={updateField} type="number" />
                                                <EditField label="Temp (°C)" field="signos_vitales_temperatura" value={editableData.signos_vitales_temperatura} onChange={updateField} type="number" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Dictamen */}
                                {editableData.dictamen_aptitud && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-indigo-500" /> Dictamen
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <EditField label="Aptitud" field="dictamen_aptitud" value={editableData.dictamen_aptitud} onChange={updateField} />
                                            <EditField label="Restricciones" field="restricciones" value={editableData.restricciones} onChange={updateField} multiline />
                                            <EditField label="Recomendaciones" field="recomendaciones" value={editableData.recomendaciones} onChange={updateField} multiline />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 4: Confirmation ═══ */}
                    {step === 4 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">
                                    {selectedExistingId ? '¿Actualizar paciente existente?' : '¿Crear paciente con estos datos?'}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                                    {selectedExistingId
                                        ? `Se actualizará el perfil existente de `
                                        : `Se creará el paciente `
                                    }
                                    <strong>{editableData.nombre} {editableData.apellido_paterno}</strong>
                                    {selectedExistingId ? ` e integraremos ` : ` con `}
                                    toda la información de laboratorios, diagnósticos y estudios extraída de {files.length} archivo{files.length > 1 ? 's' : ''}.
                                    Los archivos originales se guardarán cifrados en su expediente.
                                </p>

                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                        <Shield className="w-3 h-3" /> Cifrado AES-256
                                    </Badge>
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                        <Brain className="w-3 h-3" /> Extraído por IA
                                    </Badge>
                                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                                        <Activity className="w-3 h-3" /> Auditado
                                    </Badge>
                                </div>

                                <div className="flex justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(3)}
                                        className="rounded-xl gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Revisar de nuevo
                                    </Button>
                                    <Button
                                        onClick={handleCreate}
                                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl px-8 gap-2 shadow-lg shadow-emerald-500/30"
                                    >
                                        <Save className="w-4 h-4" /> {selectedExistingId ? 'Actualizar Paciente' : 'Crear Paciente'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                    variant="outline"
                    onClick={step === 1 ? onCancel : () => setStep(step - 1)}
                    className="rounded-xl gap-2"
                    disabled={processing}
                >
                    {step === 1 ? (
                        <><X className="w-4 h-4" /> Cancelar</>
                    ) : (
                        <><ChevronLeft className="w-4 h-4" /> Anterior</>
                    )}
                </Button>

                {step === 1 && files.length > 0 && (
                    <Button
                        onClick={startExtraction}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl px-6 gap-2 shadow-lg shadow-purple-500/30"
                    >
                        <Sparkles className="w-4 h-4" /> Extraer con IA
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                )}

                {step === 3 && (
                    <Button
                        onClick={() => setStep(4)}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl px-6 gap-2 shadow-lg shadow-emerald-500/30"
                    >
                        Confirmar datos <ArrowRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function EditField({ label, field, value, onChange, type = 'text', multiline = false }: {
    label: string
    field: string
    value: any
    onChange: (key: string, value: any) => void
    type?: string
    multiline?: boolean
}) {
    const hasValue = value !== undefined && value !== null && value !== ''

    return (
        <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 block">
                {label}
                {hasValue && <span className="ml-1 text-emerald-500">✓</span>}
            </label>
            {multiline ? (
                <textarea
                    value={value !== undefined && value !== null ? (Array.isArray(value) ? value.join('\n') : String(value)) : ''}
                    onChange={e => onChange(field, e.target.value)}
                    rows={2}
                    className={`w-full text-sm px-3 py-2 rounded-lg border transition-colors ${hasValue
                        ? 'border-emerald-200 bg-emerald-50/50 text-slate-800'
                        : 'border-slate-200 bg-white text-slate-400'
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none`}
                    placeholder={`No detectado`}
                />
            ) : (
                <Input
                    type={type}
                    value={value !== undefined && value !== null ? String(value) : ''}
                    onChange={e => onChange(field, e.target.value)}
                    className={`text-sm h-9 rounded-lg ${hasValue
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200'
                        }`}
                    placeholder="No detectado"
                />
            )}
        </div>
    )
}

// ============================================
// HELPERS para aplanar/desaplanar objetos anidados
// ============================================

function flattenForEditing(data: DatosExtraidos): Record<string, any> {
    const flat: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('_')) continue // Skip metadata

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Aplanar objetos anidados con prefijo
            for (const [subKey, subValue] of Object.entries(value)) {
                flat[`${key}_${subKey}`] = subValue
            }
        } else if (Array.isArray(value)) {
            flat[key] = value.join('\n')
        } else {
            flat[key] = value
        }
    }

    return flat
}

function unflattenFromEditing(flat: Record<string, any>): Partial<DatosExtraidos> {
    const result: any = {}
    const nested: Record<string, Record<string, any>> = {}

    for (const [key, value] of Object.entries(flat)) {
        // Detectar campos anidados (ej: signos_vitales_peso_kg)
        const nestedPrefixes = ['signos_vitales', 'exploracion_fisica', 'audiometria', 'espirometria', 'laboratorio', 'radiografia']
        let isNested = false

        for (const prefix of nestedPrefixes) {
            if (key.startsWith(prefix + '_')) {
                const subKey = key.substring(prefix.length + 1)
                if (!nested[prefix]) nested[prefix] = {}
                nested[prefix][subKey] = value
                isNested = true
                break
            }
        }

        if (!isNested) {
            // Reconvertir arrays separados por newlines
            if (typeof value === 'string' && (key === 'restricciones' || key === 'recomendaciones')) {
                result[key] = value.split('\n').filter((s: string) => s.trim())
            } else {
                result[key] = value
            }
        }
    }

    // Re-anidar
    for (const [prefix, obj] of Object.entries(nested)) {
        result[prefix] = obj
    }

    return result
}
