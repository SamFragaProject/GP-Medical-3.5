/**
 * SmartOnboardingHub — Formulario Unificado de Historia Clínica
 * GP Medical Health ERP
 * 
 * Flujo: 12 secciones → Guardar → Crear paciente → Redirect al perfil
 * Funciones IA conservadas: Análisis de puesto, sugerencias hallazgos, diagnóstico/concepto/recomendaciones
 * Eliminados: Botones demo, repopulate con IA
 */
import React, { useState, useCallback, useEffect } from 'react'
import type { ClinicalHistoryFormData } from '@/types/clinicalHistoryForm'
import { getInitialClinicalHistoryFormData } from '@/types/clinicalHistoryForm'
import {
    getRisksForJobTitle, getJobDetails, getCommonAbnormalFindings,
    generateDiagnoses, generateConcept, generateRecommendations
} from '@/services/clinicalFormAIService'
import { Section1_GeneralData, Section2_WorkRisk, Section3_WorkHistory, Section4_AccidentsAndDiseases } from '@/components/clinical-form/Sections1to4'
import { Section5_Antecedents, Section6_PhysicalExploration, Section7_ComplementaryStudies, Section8_LabTests } from '@/components/clinical-form/Sections5to8'
import { Section9_Diagnosis, Section10_Concept, Section11_Recommendations, Section12_Signature } from '@/components/clinical-form/Sections9to12'

interface SmartOnboardingHubProps {
    onComplete: (formData: ClinicalHistoryFormData) => Promise<void>
    onCancel: () => void
    empresaId?: string
    initialData?: Partial<ClinicalHistoryFormData>
}

// ── Deep set utility ──
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

// ── Deep merge ──
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

const SECTION_LABELS = [
    { num: 1, title: 'Datos Generales', icon: '👤' },
    { num: 2, title: 'Riesgo Laboral', icon: '⚠️' },
    { num: 3, title: 'Historia Laboral', icon: '🏢' },
    { num: 4, title: 'Accidentes', icon: '🩹' },
    { num: 5, title: 'Antecedentes', icon: '🧬' },
    { num: 6, title: 'Exploración Física', icon: '🩺' },
    { num: 7, title: 'Estudios Complementarios', icon: '📊' },
    { num: 8, title: 'Laboratorio', icon: '🧪' },
    { num: 9, title: 'Diagnóstico', icon: '📋' },
    { num: 10, title: 'Concepto', icon: '✅' },
    { num: 11, title: 'Recomendaciones', icon: '💡' },
    { num: 12, title: 'Firma', icon: '✍️' },
]

const SmartOnboardingHub: React.FC<SmartOnboardingHubProps> = ({ onComplete, onCancel, empresaId, initialData }) => {
    const [formData, setFormData] = useState<ClinicalHistoryFormData>(() => {
        const base = getInitialClinicalHistoryFormData()
        return initialData ? deepMerge(base, initialData) : base
    })
    const [currentSection, setCurrentSection] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // AI loading states
    const [isAnalyzingRisks, setIsAnalyzingRisks] = useState(false)
    const [isAnalyzingJob, setIsAnalyzingJob] = useState(false)
    const [isGeneratingFindings, setIsGeneratingFindings] = useState(false)
    const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false)
    const [isGeneratingConcept, setIsGeneratingConcept] = useState(false)
    const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

    // Auto-toggle gyneco-obstetric section
    useEffect(() => {
        if (formData.datosGenerales.sexo === 'F' && !formData.antecedentes.ginecoObstetricos.visible) {
            handleChange('antecedentes.ginecoObstetricos.visible', true)
        } else if (formData.datosGenerales.sexo === 'M' && formData.antecedentes.ginecoObstetricos.visible) {
            handleChange('antecedentes.ginecoObstetricos.visible', false)
        }
    }, [formData.datosGenerales.sexo])

    // Auto-calculate BMI
    useEffect(() => {
        const peso = parseFloat(formData.exploracionFisica.signosVitales.peso)
        const tallaCm = parseFloat(formData.exploracionFisica.signosVitales.talla)
        if (peso > 0 && tallaCm > 0) {
            const tallaM = tallaCm / 100
            const imc = (peso / (tallaM * tallaM)).toFixed(1)
            if (formData.exploracionFisica.signosVitales.imc !== imc) {
                handleChange('exploracionFisica.signosVitales.imc', imc)
            }
        }
    }, [formData.exploracionFisica.signosVitales.peso, formData.exploracionFisica.signosVitales.talla])

    // Set empresa from prop
    useEffect(() => {
        if (empresaId && !formData.datosGenerales.nombreEmpresa) {
            handleChange('datosGenerales.nombreEmpresa', empresaId)
        }
    }, [empresaId])

    const handleChange = useCallback((path: string, value: any) => {
        setFormData(prev => deepSet(prev, path, value))
    }, [])

    // ── AI Handlers ──
    const handleAnalyzeRisks = useCallback(async () => {
        if (!formData.riesgoLaboral.puesto) return
        setIsAnalyzingRisks(true)
        try {
            const risks = await getRisksForJobTitle(formData.riesgoLaboral.puesto)
            setFormData(prev => deepSet(prev, 'riesgoLaboral.riesgos', deepMerge(prev.riesgoLaboral.riesgos, risks)))
        } catch (err) { setError('Error al analizar riesgos del puesto.') }
        finally { setIsAnalyzingRisks(false) }
    }, [formData.riesgoLaboral.puesto])

    const handleAnalyzeJob = useCallback(async () => {
        if (!formData.historiaLaboral.puestoTrabajo) return
        setIsAnalyzingJob(true)
        try {
            const details = await getJobDetails(formData.historiaLaboral.puestoTrabajo)
            setFormData(prev => {
                let next = deepSet(prev, 'historiaLaboral.descripcionFunciones', details.descripcionFunciones)
                next = deepSet(next, 'historiaLaboral.maquinasEquiposHerramientas', details.maquinasEquiposHerramientas)
                return next
            })
        } catch (err) { setError('Error al analizar el puesto.') }
        finally { setIsAnalyzingJob(false) }
    }, [formData.historiaLaboral.puestoTrabajo])

    const handleGetFindings = useCallback(async (systemName: string): Promise<string[]> => {
        setIsGeneratingFindings(true)
        try { return await getCommonAbnormalFindings(systemName) }
        catch { return [] }
        finally { setIsGeneratingFindings(false) }
    }, [])

    const handleGenerateDiagnosis = useCallback(async () => {
        setIsGeneratingDiagnosis(true)
        try {
            const diagnoses = await generateDiagnoses(formData)
            handleChange('diagnostico.lista', diagnoses)
        } catch (err) { setError('Error al generar diagnósticos.') }
        finally { setIsGeneratingDiagnosis(false) }
    }, [formData])

    const handleGenerateConcept = useCallback(async () => {
        setIsGeneratingConcept(true)
        try {
            const concept = await generateConcept(formData)
            setFormData(prev => {
                let next = deepSet(prev, 'concepto.resumen', concept.resumen)
                next = deepSet(next, 'concepto.aptitud', concept.aptitud)
                next = deepSet(next, 'concepto.limitacionesRestricciones', concept.limitacionesRestricciones)
                return next
            })
        } catch (err) { setError('Error al generar concepto.') }
        finally { setIsGeneratingConcept(false) }
    }, [formData])

    const handleGenerateRecommendations = useCallback(async () => {
        setIsGeneratingRecommendations(true)
        try {
            const recs = await generateRecommendations(formData)
            handleChange('recomendaciones', recs)
        } catch (err) { setError('Error al generar recomendaciones.') }
        finally { setIsGeneratingRecommendations(false) }
    }, [formData])

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)
        try { await onComplete(formData) }
        catch (err: any) { setError(err.message || 'Error al guardar.') }
        finally { setIsSaving(false) }
    }

    const goNext = () => setCurrentSection(prev => Math.min(prev + 1, 12))
    const goPrev = () => setCurrentSection(prev => Math.max(prev - 1, 1))

    // ── Render Section ──
    const renderCurrentSection = () => {
        const props = { data: formData, handleChange }
        switch (currentSection) {
            case 1: return <Section1_GeneralData {...props} />
            case 2: return <Section2_WorkRisk {...props} onAnalyze={handleAnalyzeRisks} isAnalyzing={isAnalyzingRisks} />
            case 3: return <Section3_WorkHistory {...props} onAnalyze={handleAnalyzeJob} isAnalyzing={isAnalyzingJob} />
            case 4: return <Section4_AccidentsAndDiseases {...props} />
            case 5: return <Section5_Antecedents {...props} />
            case 6: return <Section6_PhysicalExploration {...props} onGetCommonAbnormalFindings={handleGetFindings} isGeneratingFindingSuggestions={isGeneratingFindings} />
            case 7: return <Section7_ComplementaryStudies {...props} />
            case 8: return <Section8_LabTests {...props} />
            case 9: return <Section9_Diagnosis {...props} onGenerate={handleGenerateDiagnosis} isGenerating={isGeneratingDiagnosis} />
            case 10: return <Section10_Concept {...props} onGenerate={handleGenerateConcept} isGenerating={isGeneratingConcept} />
            case 11: return <Section11_Recommendations {...props} onGenerate={handleGenerateRecommendations} isGenerating={isGeneratingRecommendations} />
            case 12: return <Section12_Signature />
            default: return null
        }
    }

    const currentLabel = SECTION_LABELS[currentSection - 1]
    const progress = (currentSection / 12) * 100

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="px-6 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Historia Clínica Ocupacional</h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                <span className="text-emerald-600 font-bold">{currentLabel.icon} Sección {currentLabel.num}</span> — {currentLabel.title}
                            </p>
                        </div>
                        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors" title="Cerrar">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    {/* Section pills */}
                    <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-thin">
                        {SECTION_LABELS.map(s => (
                            <button key={s.num} onClick={() => setCurrentSection(s.num)}
                                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all font-medium ${currentSection === s.num
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}>
                                {s.num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">&times;</button>
                </div>
            )}

            {/* Section content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                {renderCurrentSection()}
            </div>

            {/* Footer nav */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                <button onClick={goPrev} disabled={currentSection === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Anterior
                </button>
                <span className="text-xs text-slate-400 font-medium">{currentSection} de 12</span>
                {currentSection < 12 ? (
                    <button onClick={goNext}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md transition-colors">
                        Siguiente <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                ) : (
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg disabled:opacity-50 transition-all">
                        {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : <>💾 Guardar Paciente</>}
                    </button>
                )}
            </div>
        </div>
    )
}

export default SmartOnboardingHub
