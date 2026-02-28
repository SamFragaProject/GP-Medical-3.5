/**
 * SmartOnboardingHub — Wizard Premium de Alta de Paciente
 * GP Medical Health ERP
 * 
 * FASE 1: Formulario clínico (12 secciones con tarjetas premium, iconos, confirmación)
 * FASE 2: Guardado → Confirmación visual → Notificación de éxito
 * FASE 3: Analizadores de archivos por sección (labs, audio, espiro, ECG, RX, opto)
 */
import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, AlertTriangle, Briefcase, HardHat, Shield, Stethoscope, Activity,
    FlaskConical, ClipboardCheck, FileCheck2, MessageSquareHeart, PenTool,
    CheckCircle2, ArrowRight, ArrowLeft, Save, Upload, Brain, Sparkles,
    FileText, HeartPulse, Ear, Wind, Eye, Zap, X, ChevronRight, Loader2
} from 'lucide-react'
import type { ClinicalHistoryFormData } from '@/types/clinicalHistoryForm'
import { getInitialClinicalHistoryFormData } from '@/types/clinicalHistoryForm'
import {
    getRisksForJobTitle, getJobDetails, getCommonAbnormalFindings,
    generateDiagnoses, generateConcept, generateRecommendations
} from '@/services/clinicalFormAIService'
import { Section1_GeneralData, Section2_WorkRisk, Section3_WorkHistory, Section4_AccidentsAndDiseases } from '@/components/clinical-form/Sections1to4'
import { Section5_Antecedents, Section6_PhysicalExploration, Section7_ComplementaryStudies, Section8_LabTests } from '@/components/clinical-form/Sections5to8'
import { Section9_Diagnosis, Section10_Concept, Section11_Recommendations, Section12_Signature } from '@/components/clinical-form/Sections9to12'
import SectionFileUpload from '@/components/expediente/SectionFileUpload'
import toast from 'react-hot-toast'

interface SmartOnboardingHubProps {
    onComplete: (formData: ClinicalHistoryFormData) => Promise<void>
    onCancel: () => void
    empresaId?: string
    initialData?: Partial<ClinicalHistoryFormData>
    savedPacienteId?: string | null
}

// Deep set utility
function deepSet(obj: any, path: string, value: any): any {
    const keys = path.split('.')
    const result = Array.isArray(obj) ? [...obj] : { ...obj }
    let current = result
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] }
        current = current[key]
    }
    current[keys[keys.length - 1]] = value
    return result
}

function deepMerge(target: any, source: any): any {
    const output = { ...target }
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                output[key] = deepMerge(target[key], source[key])
            } else { output[key] = source[key] }
        }
    }
    return output
}

// ══════════════════════════════════════════════
// SECTION CONFIG — Icons, colors, descriptions
// ══════════════════════════════════════════════
const SECTIONS = [
    { num: 1, title: 'Datos Generales', desc: 'Información personal del paciente', icon: User, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', ring: 'ring-blue-200', text: 'text-blue-700' },
    { num: 2, title: 'Riesgo Laboral', desc: 'Riesgos del puesto actual', icon: AlertTriangle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-700' },
    { num: 3, title: 'Historia Laboral', desc: 'Empleo, funciones y equipo', icon: Briefcase, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', ring: 'ring-indigo-200', text: 'text-indigo-700' },
    { num: 4, title: 'Accidentes', desc: 'Accidentes y enfermedades laborales', icon: HardHat, color: 'from-red-500 to-rose-500', bg: 'bg-red-50', ring: 'ring-red-200', text: 'text-red-700' },
    { num: 5, title: 'Antecedentes', desc: 'Heredofamiliares, patológicos, hábitos', icon: Shield, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700' },
    { num: 6, title: 'Exploración Física', desc: 'Signos vitales y examen por sistemas', icon: Stethoscope, color: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-50', ring: 'ring-violet-200', text: 'text-violet-700' },
    { num: 7, title: 'Estudios Complementarios', desc: 'Audiometría, espirometría, optometría, ECG', icon: Activity, color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50', ring: 'ring-sky-200', text: 'text-sky-700' },
    { num: 8, title: 'Laboratorio', desc: 'Glucosa, antidoping, rayos X', icon: FlaskConical, color: 'from-lime-500 to-green-500', bg: 'bg-lime-50', ring: 'ring-lime-200', text: 'text-lime-700' },
    { num: 9, title: 'Diagnóstico', desc: 'Lista de diagnósticos con IA', icon: ClipboardCheck, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', ring: 'ring-pink-200', text: 'text-pink-700' },
    { num: 10, title: 'Concepto', desc: 'Aptitud laboral y restricciones', icon: FileCheck2, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50', ring: 'ring-teal-200', text: 'text-teal-700' },
    { num: 11, title: 'Recomendaciones', desc: 'Sugerencias médicas para el paciente', icon: MessageSquareHeart, color: 'from-orange-500 to-yellow-500', bg: 'bg-orange-50', ring: 'ring-orange-200', text: 'text-orange-700' },
    { num: 12, title: 'Firma', desc: 'Firma del médico responsable', icon: PenTool, color: 'from-slate-500 to-gray-600', bg: 'bg-slate-50', ring: 'ring-slate-200', text: 'text-slate-700' },
]

// Analyzer sections for post-save file upload
const ANALYZERS = [
    { key: 'laboratorio', title: 'Laboratorios', desc: 'BH, QS, Perfil Lipídico, EGO', icon: FlaskConical, color: 'from-emerald-500 to-green-600' },
    { key: 'audiometria', title: 'Audiometría', desc: 'Audiometría tonal aérea y ósea', icon: Ear, color: 'from-blue-500 to-indigo-600' },
    { key: 'espirometria', title: 'Espirometría', desc: 'FVC, FEV1, curvas flujo-volumen', icon: Wind, color: 'from-cyan-500 to-teal-600' },
    { key: 'ecg', title: 'Electrocardiograma', desc: 'ECG 12 derivaciones', icon: HeartPulse, color: 'from-red-500 to-rose-600' },
    { key: 'radiografia', title: 'Rayos X', desc: 'Tórax PA, columna lumbar', icon: Zap, color: 'from-amber-500 to-orange-600' },
    { key: 'optometria', title: 'Optometría', desc: 'Agudeza visual, Ishihara, campimetría', icon: Eye, color: 'from-violet-500 to-purple-600' },
]

type WizardPhase = 'form' | 'saving' | 'saved' | 'analyzers'

const SmartOnboardingHub: React.FC<SmartOnboardingHubProps> = ({ onComplete, onCancel, empresaId, initialData, savedPacienteId: savedPacienteIdProp }) => {
    const [formData, setFormData] = useState<ClinicalHistoryFormData>(() => {
        const base = getInitialClinicalHistoryFormData()
        return initialData ? deepMerge(base, initialData) : base
    })
    const [currentSection, setCurrentSection] = useState(1)
    const [phase, setPhase] = useState<WizardPhase>('form')
    const savedPacienteId = savedPacienteIdProp || null
    const [error, setError] = useState<string | null>(null)
    const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())
    const [uploadedStudies, setUploadedStudies] = useState<Set<string>>(new Set())

    // AI loading
    const [isAnalyzingRisks, setIsAnalyzingRisks] = useState(false)
    const [isAnalyzingJob, setIsAnalyzingJob] = useState(false)
    const [isGeneratingFindings, setIsGeneratingFindings] = useState(false)
    const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false)
    const [isGeneratingConcept, setIsGeneratingConcept] = useState(false)
    const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

    // Auto-toggle gyneco
    useEffect(() => {
        if (formData.datosGenerales.sexo === 'F' && !formData.antecedentes.ginecoObstetricos.visible) handleChange('antecedentes.ginecoObstetricos.visible', true)
        else if (formData.datosGenerales.sexo === 'M' && formData.antecedentes.ginecoObstetricos.visible) handleChange('antecedentes.ginecoObstetricos.visible', false)
    }, [formData.datosGenerales.sexo])

    // Auto-calc BMI
    useEffect(() => {
        const peso = parseFloat(formData.exploracionFisica.signosVitales.peso)
        const tallaCm = parseFloat(formData.exploracionFisica.signosVitales.talla)
        if (peso > 0 && tallaCm > 0) {
            const imc = (peso / ((tallaCm / 100) ** 2)).toFixed(1)
            if (formData.exploracionFisica.signosVitales.imc !== imc) handleChange('exploracionFisica.signosVitales.imc', imc)
        }
    }, [formData.exploracionFisica.signosVitales.peso, formData.exploracionFisica.signosVitales.talla])

    useEffect(() => { if (empresaId && !formData.datosGenerales.nombreEmpresa) handleChange('datosGenerales.nombreEmpresa', empresaId) }, [empresaId])

    const handleChange = useCallback((path: string, value: any) => { setFormData(prev => deepSet(prev, path, value)) }, [])

    // Mark section as completed when navigating away
    const markComplete = (section: number) => { setCompletedSections(prev => new Set([...prev, section])) }

    // ── AI ──
    const handleAnalyzeRisks = useCallback(async () => {
        if (!formData.riesgoLaboral.puesto) return; setIsAnalyzingRisks(true)
        try { const r = await getRisksForJobTitle(formData.riesgoLaboral.puesto); setFormData(prev => deepSet(prev, 'riesgoLaboral.riesgos', deepMerge(prev.riesgoLaboral.riesgos, r))); toast.success('Riesgos analizados') } catch { toast.error('Error al analizar riesgos') } finally { setIsAnalyzingRisks(false) }
    }, [formData.riesgoLaboral.puesto])

    const handleAnalyzeJob = useCallback(async () => {
        if (!formData.historiaLaboral.puestoTrabajo) return; setIsAnalyzingJob(true)
        try { const d = await getJobDetails(formData.historiaLaboral.puestoTrabajo); setFormData(prev => { let n = deepSet(prev, 'historiaLaboral.descripcionFunciones', d.descripcionFunciones); return deepSet(n, 'historiaLaboral.maquinasEquiposHerramientas', d.maquinasEquiposHerramientas) }); toast.success('Puesto analizado') } catch { toast.error('Error al analizar puesto') } finally { setIsAnalyzingJob(false) }
    }, [formData.historiaLaboral.puestoTrabajo])

    const handleGetFindings = useCallback(async (s: string): Promise<string[]> => {
        setIsGeneratingFindings(true); try { return await getCommonAbnormalFindings(s) } catch { return [] } finally { setIsGeneratingFindings(false) }
    }, [])

    const handleGenerateDiagnosis = useCallback(async () => {
        setIsGeneratingDiagnosis(true); try { handleChange('diagnostico.lista', await generateDiagnoses(formData)); toast.success('Diagnósticos generados') } catch { toast.error('Error') } finally { setIsGeneratingDiagnosis(false) }
    }, [formData])

    const handleGenerateConcept = useCallback(async () => {
        setIsGeneratingConcept(true); try { const c = await generateConcept(formData); setFormData(prev => { let n = deepSet(prev, 'concepto.resumen', c.resumen); n = deepSet(n, 'concepto.aptitud', c.aptitud); return deepSet(n, 'concepto.limitacionesRestricciones', c.limitacionesRestricciones) }); toast.success('Concepto generado') } catch { toast.error('Error') } finally { setIsGeneratingConcept(false) }
    }, [formData])

    const handleGenerateRecs = useCallback(async () => {
        setIsGeneratingRecommendations(true); try { handleChange('recomendaciones', await generateRecommendations(formData)); toast.success('Recomendaciones generadas') } catch { toast.error('Error') } finally { setIsGeneratingRecommendations(false) }
    }, [formData])

    // ── SAVE ──
    const handleSave = async () => {
        setPhase('saving'); setError(null)
        try {
            await onComplete(formData)
            setPhase('saved')
            toast.success('✅ Paciente registrado exitosamente', { duration: 4000, icon: '🎉' })
        } catch (err: any) {
            setError(err.message || 'Error al guardar')
            setPhase('form')
            toast.error('Error al guardar el paciente')
        }
    }

    const goNext = () => { markComplete(currentSection); setCurrentSection(prev => Math.min(prev + 1, 12)) }
    const goPrev = () => { setCurrentSection(prev => Math.max(prev - 1, 1)) }

    // ── Section renderer ──
    const renderSection = () => {
        const p = { data: formData, handleChange }
        switch (currentSection) {
            case 1: return <Section1_GeneralData {...p} />
            case 2: return <Section2_WorkRisk {...p} onAnalyze={handleAnalyzeRisks} isAnalyzing={isAnalyzingRisks} />
            case 3: return <Section3_WorkHistory {...p} onAnalyze={handleAnalyzeJob} isAnalyzing={isAnalyzingJob} />
            case 4: return <Section4_AccidentsAndDiseases {...p} />
            case 5: return <Section5_Antecedents {...p} />
            case 6: return <Section6_PhysicalExploration {...p} onGetCommonAbnormalFindings={handleGetFindings} isGeneratingFindingSuggestions={isGeneratingFindings} />
            case 7: return <Section7_ComplementaryStudies {...p} />
            case 8: return <Section8_LabTests {...p} />
            case 9: return <Section9_Diagnosis {...p} onGenerate={handleGenerateDiagnosis} isGenerating={isGeneratingDiagnosis} />
            case 10: return <Section10_Concept {...p} onGenerate={handleGenerateConcept} isGenerating={isGeneratingConcept} />
            case 11: return <Section11_Recommendations {...p} onGenerate={handleGenerateRecs} isGenerating={isGeneratingRecommendations} />
            case 12: return <Section12_Signature />
            default: return null
        }
    }

    const sec = SECTIONS[currentSection - 1]
    const progress = (currentSection / 12) * 100
    const Icon = sec.icon
    const patientName = `${formData.datosGenerales.nombres || ''} ${formData.datosGenerales.apellidos || ''}`.trim()

    // ══════════════════════════
    //  PHASE: SAVING (spinner)
    // ══════════════════════════
    if (phase === 'saving') {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-ping opacity-20" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Guardando paciente...</h3>
                        <p className="text-sm text-slate-500 mt-1">{patientName || 'Procesando datos'}</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        {['Datos personales', 'Historia clínica', 'Exploración física'].map((step, i) => (
                            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.5 }}
                                className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {step}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        )
    }

    // ══════════════════════════════════════
    //  PHASE: SAVED → transition to analyzers
    // ══════════════════════════════════════
    if (phase === 'saved') {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20 }}
                    className="text-center space-y-6 max-w-lg mx-auto p-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">¡Paciente Registrado!</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            <span className="font-bold text-emerald-600">{patientName}</span> ha sido dado de alta exitosamente.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-5 border border-emerald-100 text-left space-y-2">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Resumen del registro</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {[
                                { l: 'Empresa', v: formData.datosGenerales.nombreEmpresa },
                                { l: 'Puesto', v: formData.riesgoLaboral.puesto },
                                { l: 'Sexo', v: formData.datosGenerales.sexo === 'M' ? 'Masculino' : formData.datosGenerales.sexo === 'F' ? 'Femenino' : '—' },
                                { l: 'Edad', v: formData.datosGenerales.edad || '—' },
                            ].map(r => (
                                <div key={r.l} className="bg-white rounded-xl px-3 py-2 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{r.l}</p>
                                    <p className="text-slate-800 font-bold truncate">{r.v || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                        <button onClick={() => setPhase('analyzers')}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:shadow-violet-500/30 transition-all text-sm uppercase tracking-wide">
                            <Upload className="w-5 h-5" /> Subir Estudios y Análisis <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={onCancel}
                            className="text-xs text-slate-400 hover:text-slate-600 font-bold underline transition-colors">
                            Omitir — Ir al perfil del paciente
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    // ══════════════════════════════════════
    //  PHASE: ANALYZERS (file upload per section)
    // ══════════════════════════════════════
    if (phase === 'analyzers') {
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Brain className="w-5 h-5" /> Analizador de Estudios
                            </h2>
                            <p className="text-violet-200 text-xs mt-0.5">Paciente: <span className="text-white font-bold">{patientName}</span> — Sube los archivos de cada estudio</p>
                        </div>
                        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Ir al perfil">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-violet-200">
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-emerald-300" /> Formulario</div>
                        <ChevronRight className="w-3 h-3" />
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-emerald-300" /> Guardado</div>
                        <ChevronRight className="w-3 h-3" />
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full border border-white/30"><Upload className="w-3 h-3" /> Archivos</div>
                    </div>
                </div>

                {/* Analyzer cards */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <p className="text-sm text-slate-500 mb-4">Sube los documentos de cada estudio. La IA extraerá automáticamente los datos y los guardará en el expediente.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ANALYZERS.map(a => {
                            const AIcon = a.icon
                            const done = uploadedStudies.has(a.key)
                            return (
                                <motion.div key={a.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl border-2 overflow-hidden transition-all ${done ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <div className={`flex items-center gap-3 p-4 border-b ${done ? 'border-emerald-200' : 'border-slate-100'}`}>
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <AIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-slate-800 text-sm">{a.title}</h3>
                                            <p className="text-[10px] text-slate-400">{a.desc}</p>
                                        </div>
                                        {done && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                    </div>
                                    <div className="p-4">
                                        <SectionFileUpload
                                            pacienteId={savedPacienteId || ''}
                                            tipoEstudio={a.key}
                                            pacienteNombre={patientName}
                                            enableExtraction={true}
                                            onDataSaved={() => {
                                                setUploadedStudies(prev => new Set([...prev, a.key]))
                                                toast.success(`${a.title} — datos guardados en expediente`, { icon: '📊', duration: 3000 })
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-bold text-emerald-600">{uploadedStudies.size}</span> de {ANALYZERS.length} estudios subidos
                    </div>
                    <button onClick={onCancel}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-wide">
                        <FileText className="w-4 h-4" /> Ir al Perfil del Paciente <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )
    }

    // ══════════════════════════════════════
    //  PHASE: FORM (12-section wizard)
    // ══════════════════════════════════════
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Premium Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
                <div className="px-6 pt-4 pb-3">
                    {/* Title row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sec.color} flex items-center justify-center shadow-lg`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-800 leading-tight">
                                    Sección {sec.num} — {sec.title}
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">{sec.desc}</p>
                            </div>
                        </div>
                        <button onClick={onCancel} className="p-2 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-50 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <motion.div animate={{ width: `${progress}%` }} transition={{ type: 'spring', damping: 30 }}
                            className={`h-full rounded-full bg-gradient-to-r ${sec.color}`} />
                    </div>

                    {/* Section pills — scrollable */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {SECTIONS.map(s => {
                            const SIcon = s.icon
                            const isActive = currentSection === s.num
                            const isDone = completedSections.has(s.num)
                            return (
                                <button key={s.num} onClick={() => { markComplete(currentSection); setCurrentSection(s.num) }}
                                    className={`flex-shrink-0 flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full transition-all font-black border ${isActive ? `bg-gradient-to-r ${s.color} text-white border-transparent shadow-md` :
                                        isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                            'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                        }`}>
                                    {isDone && !isActive ? <CheckCircle2 className="w-3 h-3" /> : <SIcon className="w-3 h-3" />}
                                    <span className="hidden sm:inline">{s.title}</span>
                                    <span className="sm:hidden">{s.num}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Breadcrumb trail */}
                <div className="px-6 pb-2 flex items-center gap-1.5 text-[10px] text-slate-300 font-bold">
                    <span className="text-emerald-500 flex items-center gap-1"><FileText className="w-3 h-3" /> Formulario</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Guardado</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Archivos</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">&times;</button>
                </motion.div>
            )}

            {/* Section content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <AnimatePresence mode="wait">
                    <motion.div key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {renderSection()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-6 py-3 flex items-center justify-between">
                <button onClick={goPrev} disabled={currentSection === 1}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                    <ArrowLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-slate-300 font-black">{currentSection} / 12</span>
                {currentSection < 12 ? (
                    <button onClick={goNext}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-black text-white rounded-xl shadow-lg transition-all bg-gradient-to-r ${sec.color} hover:shadow-xl`}>
                        Siguiente <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl transition-all uppercase tracking-wide">
                        <Save className="w-4 h-4" /> Guardar Paciente
                    </button>
                )}
            </div>
        </div>
    )
}

export default SmartOnboardingHub
