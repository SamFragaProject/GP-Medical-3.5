/**
 * ImportarExpedienteWizard — Subir archivos por tipo de examen
 *
 * Flujo:
 *   1. ¿Paciente nuevo o existente? → Si existente, selecciona de lista
 *   2. Secciones de upload por examen (Espirometría, Labs, Audio, etc.)
 *      → Cada sección sube PDF → IA extrae → preview
 *   3. Guardar → crea paciente si nuevo + guarda estudios → perfil
 */
import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, ArrowLeft, ArrowRight, X, Save, Loader2,
    CheckCircle, AlertTriangle, UserPlus, Users, Search,
    Wind, TestTube, Ear, Heart, Eye, Radiation, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { analyzeSpirometryDirect } from '@/services/geminiDocumentService'
import { SpirometryReport } from '@/components/expediente/SpirometryReport'
import toast from 'react-hot-toast'

// ─── Types ───
interface Props {
    onComplete: (data: any, existingPacienteId?: string) => void
    onCancel: () => void
    empresaId?: string
}

interface StudyUpload {
    file: File | null
    extractedData: any | null
    status: 'idle' | 'uploading' | 'done' | 'error'
    progress: string
    error: string | null
}

// ─── Exam sections config ───
const EXAM_SECTIONS = [
    { key: 'espirometria', label: 'Espirometría', icon: Wind, color: 'cyan', tipo: 'espirometria' },
    { key: 'laboratorio', label: 'Laboratorio', icon: TestTube, color: 'indigo', tipo: 'laboratorio' },
    { key: 'audiometria', label: 'Audiometría', icon: Ear, color: 'amber', tipo: 'audiometria' },
    { key: 'ecg', label: 'Electrocardiograma', icon: Heart, color: 'rose', tipo: 'ecg' },
    { key: 'optometria', label: 'Optometría', icon: Eye, color: 'violet', tipo: 'optometria' },
    { key: 'radiologia', label: 'Radiología', icon: Radiation, color: 'orange', tipo: 'radiologia' },
] as const

type ExamKey = typeof EXAM_SECTIONS[number]['key']

// ─── Main component ───
export default function ImportarExpedienteWizard({ onComplete, onCancel, empresaId }: Props) {
    // Step: 1 = select patient, 2 = upload exams
    const [step, setStep] = useState<1 | 2>(1)

    // Patient selection
    const [patientMode, setPatientMode] = useState<'new' | 'existing' | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
    const [selectedPatientName, setSelectedPatientName] = useState('')
    const [patients, setPatients] = useState<any[]>([])
    const [loadingPatients, setLoadingPatients] = useState(false)

    // Studies
    const [studies, setStudies] = useState<Record<ExamKey, StudyUpload>>(() => {
        const initial: any = {}
        EXAM_SECTIONS.forEach(s => {
            initial[s.key] = { file: null, extractedData: null, status: 'idle', progress: '', error: null }
        })
        return initial
    })

    const [saving, setSaving] = useState(false)
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

    // ─── Load patients for existing search ───
    const searchPatients = async (query: string) => {
        if (query.length < 2) { setPatients([]); return }
        setLoadingPatients(true)
        try {
            let q = supabase.from('pacientes').select('id, nombre, apellido_paterno, apellido_materno, empresa_nombre, numero_empleado')
            if (empresaId) q = q.eq('empresa_id', empresaId)
            q = q.or(`nombre.ilike.%${query}%,apellido_paterno.ilike.%${query}%,numero_empleado.ilike.%${query}%`)
            q = q.limit(10)
            const { data } = await q
            setPatients(data || [])
        } catch { setPatients([]) }
        finally { setLoadingPatients(false) }
    }

    // ─── Handle file upload per exam ───
    const handleFileUpload = async (examKey: ExamKey, file: File) => {
        setStudies(prev => ({
            ...prev,
            [examKey]: { ...prev[examKey], file, status: 'uploading', progress: 'Analizando con IA...', error: null }
        }))

        try {
            if (examKey === 'espirometria') {
                const data = await analyzeSpirometryDirect('', [file])
                if (!data?.results?.length) throw new Error('No se pudieron extraer datos de espirometría')
                setStudies(prev => ({
                    ...prev,
                    [examKey]: { ...prev[examKey], extractedData: data, status: 'done', progress: `✅ ${data.results.length} parámetros extraídos` }
                }))
            } else {
                // Otros exámenes: por ahora solo marcar archivo seleccionado
                setStudies(prev => ({
                    ...prev,
                    [examKey]: { ...prev[examKey], extractedData: null, status: 'done', progress: '✅ Archivo listo para guardar' }
                }))
            }
        } catch (err: any) {
            setStudies(prev => ({
                ...prev,
                [examKey]: { ...prev[examKey], status: 'error', error: err.message || 'Error al procesar', progress: '' }
            }))
        }
    }

    // ─── Count completed uploads ───
    const completedCount = useMemo(() =>
        Object.values(studies).filter(s => s.status === 'done').length
        , [studies])

    const hasAnyStudy = completedCount > 0

    // ─── Save everything ───
    const handleSave = async () => {
        setSaving(true)
        try {
            let pacienteId = selectedPatientId

            // If new patient, extract name from spirometry data
            if (patientMode === 'new') {
                const spiroData = studies.espirometria.extractedData
                const patientInfo = spiroData?.patient || {}

                // Parse name from SpiroClone format (URIBE LOPEZ, FEDERICO → ap: Uribe, am: Lopez, nombre: Federico)
                const parsed = parsePatientName(patientInfo.name || '')

                // Extract additional patient data
                const heightStr = patientInfo.height?.replace(/[^\d.]/g, '') || null
                const weightStr = patientInfo.weight?.replace(/[^\d.]/g, '') || null

                const { data: newP, error: createErr } = await supabase
                    .from('pacientes')
                    .insert({
                        nombre: parsed.nombre || 'Sin Nombre',
                        apellido_paterno: parsed.apellido_paterno || '',
                        apellido_materno: parsed.apellido_materno || '',
                        fecha_nacimiento: patientInfo.dob ? convertDate(patientInfo.dob) : null,
                        genero: detectGender(patientInfo.sex),
                        empresa_id: empresaId || null,
                        estatus: 'activo',
                    })
                    .select('id')
                    .single()

                if (createErr || !newP) throw new Error('Error al crear paciente: ' + (createErr?.message || ''))
                pacienteId = newP.id
                toast.success(`Paciente ${parsed.nombre} ${parsed.apellido_paterno} creado`)
            }

            if (!pacienteId) throw new Error('No se seleccionó un paciente')

            // Save each completed study
            for (const section of EXAM_SECTIONS) {
                const study = studies[section.key]
                if (study.status !== 'done') continue

                if (section.key === 'espirometria' && study.extractedData) {
                    const { error: insertErr } = await supabase.from('estudios_clinicos').insert({
                        paciente_id: pacienteId,
                        tipo_estudio: 'espirometria',
                        fecha_estudio: new Date().toISOString().split('T')[0],
                        datos_extra: {
                            spiroclone_data: study.extractedData,
                            _source: 'SpiroClone Pipeline',
                            _extracted_at: new Date().toISOString(),
                        }
                    })
                    if (insertErr) throw new Error(`Error al guardar espirometría: ${insertErr.message}`)
                }
            }

            toast.success('Estudios guardados correctamente')
            onComplete({}, pacienteId || undefined)
        } catch (err: any) {
            console.error('[ImportWizard] Error:', err)
            toast.error(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    // ─── STEP 1: Select patient ───
    if (step === 1) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">Subir Archivos</h2>
                            <p className="text-sm text-slate-500">Sube reportes por tipo de examen</p>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={onCancel} className="rounded-xl">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Patient mode selection */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        onClick={() => setPatientMode('existing')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${patientMode === 'existing'
                                ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <Users className={`w-8 h-8 mb-3 ${patientMode === 'existing' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <p className="font-bold text-slate-800">Paciente Existente</p>
                        <p className="text-xs text-slate-500 mt-1">Seleccionar de la lista de la empresa</p>
                    </motion.button>

                    <motion.button
                        onClick={() => { setPatientMode('new'); setSelectedPatientId(null) }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${patientMode === 'new'
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <UserPlus className={`w-8 h-8 mb-3 ${patientMode === 'new' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <p className="font-bold text-slate-800">Paciente Nuevo</p>
                        <p className="text-xs text-slate-500 mt-1">Se creará con los datos del reporte</p>
                    </motion.button>
                </div>

                {/* Existing patient search */}
                <AnimatePresence>
                    {patientMode === 'existing' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nombre o #empleado..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); searchPatients(e.target.value) }}
                                    className="pl-10 h-12 rounded-xl"
                                />
                            </div>

                            {loadingPatients && (
                                <div className="flex items-center justify-center py-4 gap-2 text-slate-400">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando...
                                </div>
                            )}

                            {patients.length > 0 && (
                                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                                    {patients.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPatientId(p.id)
                                                setSelectedPatientName(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`.trim())
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-0 transition-colors ${selectedPatientId === p.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedPatientId === p.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {(p.nombre?.[0] || '').toUpperCase()}{(p.apellido_paterno?.[0] || '').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-slate-800 truncate">
                                                    {p.apellido_paterno} {p.apellido_materno || ''}, {p.nombre}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {p.empresa_nombre || ''} {p.numero_empleado ? `#${p.numero_empleado}` : ''}
                                                </p>
                                            </div>
                                            {selectedPatientId === p.id && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next button */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onCancel} className="rounded-xl px-6">Cancelar</Button>
                    <Button
                        onClick={() => setStep(2)}
                        disabled={!patientMode || (patientMode === 'existing' && !selectedPatientId)}
                        className="rounded-xl px-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold disabled:opacity-50"
                    >
                        Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        )
    }

    // ─── Color map ───
    const colorMap: Record<string, string> = {
        cyan: 'from-cyan-500 to-blue-600',
        indigo: 'from-indigo-500 to-blue-600',
        amber: 'from-amber-500 to-orange-600',
        rose: 'from-rose-500 to-pink-600',
        violet: 'from-violet-500 to-purple-600',
        orange: 'from-orange-500 to-red-600',
    }

    const spiroStudy = studies.espirometria
    const spiroRef = fileRefs

    // ─── STEP 2: Upload by exam type ───
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setStep(1)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Subir Estudios</h2>
                        <p className="text-sm text-slate-500">
                            {patientMode === 'existing'
                                ? <span>Paciente: <strong className="text-slate-700">{selectedPatientName}</strong></span>
                                : 'Paciente nuevo — se creará automáticamente con los datos extraídos'}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" onClick={onCancel} className="rounded-xl">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* ═══ ESPIROMETRÍA — Full width, primary section ═══ */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    {/* Section header */}
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Wind className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-black text-white text-sm">Espirometría</p>
                                <p className="text-[10px] text-white/70">Sube el PDF para extracción completa con IA</p>
                            </div>
                        </div>
                        {spiroStudy.status === 'done' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-emerald-300" />
                                <span className="text-xs font-bold text-white">{spiroStudy.progress}</span>
                            </div>
                        )}
                    </div>

                    {/* Upload content */}
                    <div className="p-6">
                        <input
                            ref={el => { fileRefs.current['espirometria'] = el }}
                            type="file"
                            accept=".pdf,application/pdf,image/*"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) handleFileUpload('espirometria', f)
                            }}
                        />

                        {spiroStudy.status === 'idle' && (
                            <button
                                onClick={() => fileRefs.current['espirometria']?.click()}
                                className="w-full py-12 border-2 border-dashed border-cyan-200 rounded-2xl hover:border-cyan-400 hover:bg-cyan-50/50 transition-all flex flex-col items-center gap-3 group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center transition-colors">
                                    <Upload className="w-8 h-8 text-cyan-400 group-hover:text-cyan-600 transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700">Click para subir PDF o imagen</p>
                                    <p className="text-xs text-slate-400 mt-1">La IA extraerá tabla de parámetros, gráficas, datos del paciente y diagnóstico</p>
                                </div>
                            </button>
                        )}

                        {spiroStudy.status === 'uploading' && (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200 animate-pulse">
                                        <Wind className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-cyan-800">{spiroStudy.progress}</p>
                                    <p className="text-xs text-slate-400 mt-1">Esto puede tomar 15-30 segundos...</p>
                                </div>
                            </div>
                        )}

                        {spiroStudy.status === 'done' && spiroStudy.extractedData && (
                            <div className="space-y-4">
                                {/* Patient info extracted */}
                                {spiroStudy.extractedData.patient && (
                                    <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="text-xs"><span className="font-bold text-slate-500">Paciente:</span> <span className="font-black text-slate-800">{spiroStudy.extractedData.patient.name}</span></div>
                                        {spiroStudy.extractedData.patient.age && <div className="text-xs"><span className="font-bold text-slate-500">Edad:</span> <span className="text-slate-700">{spiroStudy.extractedData.patient.age}</span></div>}
                                        {spiroStudy.extractedData.patient.sex && <div className="text-xs"><span className="font-bold text-slate-500">Sexo:</span> <span className="text-slate-700">{spiroStudy.extractedData.patient.sex}</span></div>}
                                        {spiroStudy.extractedData.patient.height && <div className="text-xs"><span className="font-bold text-slate-500">Talla:</span> <span className="text-slate-700">{spiroStudy.extractedData.patient.height}</span></div>}
                                        {spiroStudy.extractedData.patient.weight && <div className="text-xs"><span className="font-bold text-slate-500">Peso:</span> <span className="text-slate-700">{spiroStudy.extractedData.patient.weight}</span></div>}
                                        <button
                                            onClick={() => fileRefs.current['espirometria']?.click()}
                                            className="ml-auto text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors"
                                        >
                                            ↻ Cambiar archivo
                                        </button>
                                    </div>
                                )}

                                {/* SpirometryReport — FULL preview */}
                                <div className="overflow-x-auto bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="min-w-[800px]">
                                        <SpirometryReport data={spiroStudy.extractedData} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {spiroStudy.status === 'error' && (
                            <div className="flex items-start gap-4 p-5 bg-red-50 rounded-xl border border-red-200">
                                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-800">Error al procesar</p>
                                    <p className="text-xs text-red-600 mt-1">{spiroStudy.error}</p>
                                    <button
                                        onClick={() => fileRefs.current['espirometria']?.click()}
                                        className="text-xs font-bold text-red-700 mt-2 hover:underline"
                                    >
                                        Intentar de nuevo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ═══ Other exam types — compact pills ═══ */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Otros estudios (próximamente)</p>
                <div className="flex flex-wrap gap-2">
                    {EXAM_SECTIONS.filter(s => s.key !== 'espirometria').map(section => {
                        const Icon = section.icon
                        return (
                            <div key={section.key} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 opacity-50">
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colorMap[section.color]} flex items-center justify-center`}>
                                    <Icon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-slate-600">{section.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                    {completedCount > 0 ? `${completedCount} estudio${completedCount > 1 ? 's' : ''} listo${completedCount > 1 ? 's' : ''}` : 'Sube al menos un archivo para continuar'}
                </p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl px-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasAnyStudy || saving}
                        className="rounded-xl px-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Guardar y ver perfil</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Helper: convert DD/MM/YYYY to YYYY-MM-DD ───
function convertDate(dateStr: string): string | null {
    if (!dateStr) return null
    const parts = dateStr.split('/')
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    return dateStr
}

// ─── Helper: ROBUST name parsing for Mexican names ───
// Handles: "URIBE LOPEZ, FEDERICO" → ap: Uribe, am: Lopez, nombre: Federico
// Handles: "FEDERICO URIBE LOPEZ" → nombre: Federico, ap: Uribe, am: Lopez
function parsePatientName(fullName: string): { nombre: string; apellido_paterno: string; apellido_materno: string } {
    const trimmed = fullName.trim()
    if (!trimmed) return { nombre: '', apellido_paterno: '', apellido_materno: '' }

    // Format: "APELLIDO APELLIDO, NOMBRE(S)"
    if (trimmed.includes(',')) {
        const [apellidoPart, nombrePart] = trimmed.split(',').map(s => s.trim())
        const apellidos = apellidoPart.split(/\s+/)
        return {
            nombre: toTitleCase(nombrePart || ''),
            apellido_paterno: toTitleCase(apellidos[0] || ''),
            apellido_materno: toTitleCase(apellidos.slice(1).join(' ') || '')
        }
    }

    // Format: "NOMBRE APELLIDO APELLIDO"
    const words = trimmed.split(/\s+/)
    if (words.length >= 3) {
        // Last 2 words are apellidos, rest is nombre
        return {
            nombre: toTitleCase(words.slice(0, -2).join(' ')),
            apellido_paterno: toTitleCase(words[words.length - 2]),
            apellido_materno: toTitleCase(words[words.length - 1])
        }
    }
    if (words.length === 2) {
        return { nombre: toTitleCase(words[0]), apellido_paterno: toTitleCase(words[1]), apellido_materno: '' }
    }
    return { nombre: toTitleCase(words[0] || ''), apellido_paterno: '', apellido_materno: '' }
}

// ─── Helper: Title Case (FEDERICO → Federico, URIBE → Uribe) ───
function toTitleCase(str: string): string {
    if (!str) return ''
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Helper: detect gender from various formats ───
function detectGender(sex: string | undefined): string | null {
    if (!sex) return null
    const s = sex.toLowerCase().trim()
    if (s.includes('masc') || s === 'male' || s === 'm' || s === 'hombre') return 'masculino'
    if (s.includes('fem') || s === 'female' || s === 'f' || s === 'mujer') return 'femenino'
    return null
}
