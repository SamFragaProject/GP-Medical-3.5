/**
 * Secciones 9-12 del Formulario de Historia Clínica
 * S9: Diagnóstico | S10: Concepto | S11: Recomendaciones | S12: Firma
 */
import React from 'react'
import type { ClinicalHistoryFormData } from '@/types/clinicalHistoryForm'
import { FormField, RadioGroup, SelectField, TextArea, SectionTitle, AIButton } from './FormPrimitives'

interface SectionProps { data: ClinicalHistoryFormData; handleChange: (path: string, value: any) => void; }

// ═══════════════════════════════════════════
// SECTION 9: DIAGNÓSTICO
// ═══════════════════════════════════════════
interface Section9Props extends SectionProps { onGenerate: () => void; isGenerating: boolean; }
export const Section9_Diagnosis: React.FC<Section9Props> = ({ data, handleChange, onGenerate, isGenerating }) => {
    const { diagnostico } = data
    return (
        <section className="space-y-4">
            <SectionTitle>9. DIAGNÓSTICO</SectionTitle>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Lista de diagnósticos</label>
                <AIButton onClick={onGenerate} isLoading={isGenerating} label="Generar con IA" />
            </div>
            <TextArea label="" id="diagnostico_lista" value={diagnostico.lista} onChange={v => handleChange('diagnostico.lista', v)} rows={6} hideLabel placeholder="1. Diagnóstico primario&#10;2. Diagnóstico secundario&#10;..." />
            <div className="p-4 border border-slate-200 rounded-xl space-y-3">
                <RadioGroup label="¿Sospecha de enfermedad profesional?" name="sospechaEnf" options={['SI', 'NO']} selectedValue={diagnostico.sospechaEnfermedadProfesional} onChange={v => handleChange('diagnostico.sospechaEnfermedadProfesional', v)} />
                {diagnostico.sospechaEnfermedadProfesional === 'SI' && (
                    <FormField label="¿Cuál?" id="diagnostico_cual" value={diagnostico.cual} onChange={v => handleChange('diagnostico.cual', v)} />
                )}
            </div>
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 10: CONCEPTO
// ═══════════════════════════════════════════
interface Section10Props extends SectionProps { onGenerate: () => void; isGenerating: boolean; }
export const Section10_Concept: React.FC<Section10Props> = ({ data, handleChange, onGenerate, isGenerating }) => {
    const { concepto } = data
    return (
        <section className="space-y-4">
            <SectionTitle>10. CONCEPTO</SectionTitle>
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Concepto médico</label>
                <AIButton onClick={onGenerate} isLoading={isGenerating} label="Generar con IA" />
            </div>
            <TextArea label="Resumen" id="concepto_resumen" value={concepto.resumen} onChange={v => handleChange('concepto.resumen', v)} rows={3} />
            <FormField label="Puesto de trabajo evaluado" id="concepto_puesto" value={concepto.puestoDe} onChange={v => handleChange('concepto.puestoDe', v)} />
            <SelectField label="Juicio de aptitud" id="concepto_aptitud" value={concepto.aptitud} onChange={v => handleChange('concepto.aptitud', v)} options={['Apto sin restricciones', 'Apto con restricciones', 'No Apto']} />
            {concepto.aptitud === 'Apto con restricciones' && (
                <TextArea label="Limitaciones / Restricciones" id="concepto_limitaciones" value={concepto.limitacionesRestricciones} onChange={v => handleChange('concepto.limitacionesRestricciones', v)} rows={3} />
            )}
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 11: RECOMENDACIONES
// ═══════════════════════════════════════════
interface Section11Props extends SectionProps { onGenerate: () => void; isGenerating: boolean; }
export const Section11_Recommendations: React.FC<Section11Props> = ({ data, handleChange, onGenerate, isGenerating }) => (
    <section className="space-y-4">
        <SectionTitle>11. RECOMENDACIONES</SectionTitle>
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Recomendaciones médicas</label>
            <AIButton onClick={onGenerate} isLoading={isGenerating} label="Generar con IA" />
        </div>
        <TextArea label="" id="recomendaciones" value={data.recomendaciones} onChange={v => handleChange('recomendaciones', v)} rows={8} hideLabel placeholder="- Recomendación 1&#10;- Recomendación 2&#10;..." />
    </section>
)

// ═══════════════════════════════════════════
// SECTION 12: FIRMA (auto-llenado con médico logueado)
// ═══════════════════════════════════════════
interface Section12Props { doctorName?: string; doctorSpecialty?: string; doctorLicense?: string; }
export const Section12_Signature: React.FC<Section12Props> = ({ doctorName, doctorSpecialty, doctorLicense }) => (
    <section className="space-y-4">
        <SectionTitle>12. FIRMA DEL MÉDICO</SectionTitle>
        <div className="flex flex-col items-center text-center p-8 border border-dashed border-slate-300 rounded-xl bg-gradient-to-b from-slate-50 to-white">
            <div className="w-32 h-16 border-b-2 border-slate-400 mb-2" />
            <p className="font-bold text-slate-800 text-sm">{doctorName || 'Dr. [Nombre del médico]'}</p>
            <p className="text-xs text-slate-500">{doctorSpecialty || 'Medicina del Trabajo y Salud Ocupacional'}</p>
            {doctorLicense && <p className="text-xs text-slate-400 mt-1">{doctorLicense}</p>}
        </div>
    </section>
)
