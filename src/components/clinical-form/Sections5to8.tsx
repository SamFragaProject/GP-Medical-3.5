/**
 * Secciones 5-8 del Formulario de Historia Clínica
 * S5: Antecedentes | S6: Exploración Física | S7: Estudios Complementarios | S8: Labs
 */
import React, { useState, useEffect, useCallback } from 'react'
import type { ClinicalHistoryFormData, HeredofamiliaresCondition, PathologicalCondition } from '@/types/clinicalHistoryForm'
import { FormField, RadioGroup, Checkbox, SelectField, DateField, TextArea, SectionTitle, AIButton } from './FormPrimitives'

interface SectionProps { data: ClinicalHistoryFormData; handleChange: (path: string, value: any) => void; }

// ═══════════════════════════════════════════
// SECTION 5: ANTECEDENTES
// ═══════════════════════════════════════════
const HeredofamiliarItem: React.FC<{ label: string; condition: HeredofamiliaresCondition; onChange: (v: HeredofamiliaresCondition) => void }> = ({ label, condition, onChange }) => (
    <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100 items-center">
        <label className="col-span-12 sm:col-span-2 font-medium text-sm text-slate-800">{label}</label>
        <div className="col-span-6 sm:col-span-1">
            <RadioGroup name={`heredo_${label}_has`} options={['SI', 'NO']} selectedValue={condition.has} onChange={v => onChange({ ...condition, has: v as 'SI' | 'NO' })} hideLabel />
        </div>
        {condition.has === 'SI' && (<>
            <div className="col-span-12 sm:col-span-5 flex flex-wrap gap-x-3 gap-y-1 items-center">
                {Object.keys(condition.parentescos).map(key => (
                    <Checkbox key={key} label={key} isChecked={condition.parentescos[key as keyof typeof condition.parentescos]}
                        onChange={v => onChange({ ...condition, parentescos: { ...condition.parentescos, [key]: v } })} />
                ))}
            </div>
            <div className="col-span-12 sm:col-span-4">
                <FormField id={`heredo_esp_${label}`} value={condition.especifique} onChange={v => onChange({ ...condition, especifique: v })} placeholder="Especifique..." hideLabel />
            </div>
        </>)}
    </div>
)

const PathologicalItem: React.FC<{ label: string; condition: PathologicalCondition; onChange: (v: PathologicalCondition) => void }> = ({ label, condition, onChange }) => (
    <tr className="border-b border-slate-100">
        <td className="py-2 pr-2 font-medium text-sm text-slate-800">{label}</td>
        <td className="py-2 px-2 text-center"><input type="radio" name={`path_${label}`} checked={condition.has === 'SI'} onChange={() => onChange({ ...condition, has: 'SI' })} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500" /></td>
        <td className="py-2 px-2 text-center"><input type="radio" name={`path_${label}`} checked={condition.has === 'NO'} onChange={() => onChange({ ...condition, has: 'NO' })} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500" /></td>
        <td className="py-2 pl-2">{condition.has === 'SI' && <FormField id={`path_esp_${label}`} value={condition.especifique} onChange={v => onChange({ ...condition, especifique: v })} placeholder="Especifique..." hideLabel />}</td>
    </tr>
)

export const Section5_Antecedents: React.FC<SectionProps> = ({ data, handleChange }) => {
    const { antecedentes } = data
    return (
        <section className="space-y-4">
            <SectionTitle>5. ANTECEDENTES</SectionTitle>
            <h4 className="text-sm font-bold text-slate-700 mt-4 mb-2">ANTECEDENTES HEREDOFAMILIARES</h4>
            <div className="p-4 border border-slate-200 rounded-xl">
                {Object.entries(antecedentes.heredofamiliares).map(([key, condition]) => (
                    <HeredofamiliarItem key={key} label={key} condition={condition} onChange={v => handleChange(`antecedentes.heredofamiliares.${key}`, v)} />
                ))}
            </div>
            <h4 className="text-sm font-bold text-slate-700 mt-4 mb-2">ANTECEDENTES PERSONALES NO PATOLÓGICOS</h4>
            <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                <RadioGroup label="VACUNACIÓN/INMUNIZACIÓN" name="vacunacion" options={['ESQUEMA COMPLETO', 'ESQUEMA INCOMPLETO', 'LO IGNORA']} selectedValue={antecedentes.personalesNoPatologicos.vacunacion} onChange={v => handleChange('antecedentes.personalesNoPatologicos.vacunacion', v)} />
                <div>
                    <RadioGroup label="TABAQUISMO" name="tabaquismo" options={['SI', 'NO']} selectedValue={antecedentes.personalesNoPatologicos.tabaquismo.has} onChange={v => handleChange('antecedentes.personalesNoPatologicos.tabaquismo.has', v)} />
                    {antecedentes.personalesNoPatologicos.tabaquismo.has === 'SI' && (
                        <div className="grid grid-cols-2 gap-4 mt-2 pl-4 border-l-2 border-emerald-200">
                            <SelectField label="Número de cigarros" id="tabaco_num" value={antecedentes.personalesNoPatologicos.tabaquismo.numeroCigarros} onChange={v => handleChange('antecedentes.personalesNoPatologicos.tabaquismo.numeroCigarros', v)} options={['1-5', '6-10', '11-15', '16-20', '>20']} />
                            <SelectField label="Frecuencia" id="tabaco_freq" value={antecedentes.personalesNoPatologicos.tabaquismo.frecuencia} onChange={v => handleChange('antecedentes.personalesNoPatologicos.tabaquismo.frecuencia', v)} options={['Diario', 'Semanal', 'Cada 15 días', 'Mensual']} />
                        </div>
                    )}
                </div>
                <div>
                    <RadioGroup label="ALCOHOLISMO" name="alcoholismo" options={['SI', 'NO']} selectedValue={antecedentes.personalesNoPatologicos.alcoholismo.has} onChange={v => handleChange('antecedentes.personalesNoPatologicos.alcoholismo.has', v)} />
                    {antecedentes.personalesNoPatologicos.alcoholismo.has === 'SI' && (
                        <div className="mt-2 pl-4 border-l-2 border-emerald-200">
                            <SelectField label="Frecuencia" id="alcohol_freq" value={antecedentes.personalesNoPatologicos.alcoholismo.frecuencia} onChange={v => handleChange('antecedentes.personalesNoPatologicos.alcoholismo.frecuencia', v)} options={['Diario', 'Semanal', 'Cada 15 días', 'Mensual']} />
                        </div>
                    )}
                </div>
            </div>
            <h4 className="text-sm font-bold text-slate-700 mt-4 mb-2">ANTECEDENTES PERSONALES PATOLÓGICOS</h4>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead><tr className="bg-slate-50"><th className="py-2 px-2 text-left text-xs font-bold text-slate-600 w-1/3">Condición</th><th className="py-2 px-2 text-center text-xs font-bold text-slate-600 w-1/12">SI</th><th className="py-2 px-2 text-center text-xs font-bold text-slate-600 w-1/12">NO</th><th className="py-2 px-2 text-left text-xs font-bold text-slate-600">Especifique</th></tr></thead>
                    <tbody>{Object.entries(antecedentes.personalesPatologicos).map(([key, condition]) => (
                        <PathologicalItem key={key} label={key} condition={condition} onChange={v => handleChange(`antecedentes.personalesPatologicos.${key}`, v)} />
                    ))}</tbody>
                </table>
            </div>
            {antecedentes.ginecoObstetricos.visible && (
                <div className="mt-4 p-4 rounded-xl border-2 border-pink-200 bg-pink-50/50">
                    <h4 className="text-sm font-bold text-pink-700 mb-3">ANTECEDENTES GINECO-OBSTÉTRICOS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField label="Menarca" id="menarca" value={antecedentes.ginecoObstetricos.menarca} onChange={v => handleChange('antecedentes.ginecoObstetricos.menarca', v)} />
                        <FormField label="Ciclos" id="ciclos" value={antecedentes.ginecoObstetricos.ciclos} onChange={v => handleChange('antecedentes.ginecoObstetricos.ciclos', v)} />
                        <DateField label="FUM" id="fum" value={antecedentes.ginecoObstetricos.fum} onChange={v => handleChange('antecedentes.ginecoObstetricos.fum', v)} />
                        <FormField label="Método Anticonceptivo" id="anticonceptivo" value={antecedentes.ginecoObstetricos.metodoAnticonceptivo} onChange={v => handleChange('antecedentes.ginecoObstetricos.metodoAnticonceptivo', v)} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Paridad</label>
                            <div className="grid grid-cols-4 gap-2 p-2 border border-pink-200 rounded-xl bg-white">
                                {(['g', 'p', 'a', 'c'] as const).map(k => <FormField key={k} label={k.toUpperCase()} id={`paridad_${k}`} value={antecedentes.ginecoObstetricos.paridad[k]} onChange={v => handleChange(`antecedentes.ginecoObstetricos.paridad.${k}`, v)} />)}
                            </div>
                        </div>
                        <DateField label="FUP" id="fup" value={antecedentes.ginecoObstetricos.fup} onChange={v => handleChange('antecedentes.ginecoObstetricos.fup', v)} />
                        <DateField label="FUC" id="fuc" value={antecedentes.ginecoObstetricos.fuc} onChange={v => handleChange('antecedentes.ginecoObstetricos.fuc', v)} />
                    </div>
                    <div className="mt-4">
                        <RadioGroup label="Papanicolaou" name="papanicolaou" options={['SI', 'NO']} selectedValue={antecedentes.ginecoObstetricos.papanicolaou.realizado} onChange={v => handleChange('antecedentes.ginecoObstetricos.papanicolaou.realizado', v)} />
                        {antecedentes.ginecoObstetricos.papanicolaou.realizado === 'SI' && (
                            <div className="grid grid-cols-2 gap-4 mt-2 pl-4 border-l-2 border-pink-200">
                                <DateField label="Fecha" id="pap_fecha" value={antecedentes.ginecoObstetricos.papanicolaou.fecha} onChange={v => handleChange('antecedentes.ginecoObstetricos.papanicolaou.fecha', v)} />
                                <FormField label="Resultado" id="pap_res" value={antecedentes.ginecoObstetricos.papanicolaou.resultado} onChange={v => handleChange('antecedentes.ginecoObstetricos.papanicolaou.resultado', v)} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 6: EXPLORACIÓN FÍSICA (con sugerencias IA)
// ═══════════════════════════════════════════
interface Section6Props extends SectionProps { onGetCommonAbnormalFindings: (systemName: string) => Promise<string[]>; isGeneratingFindingSuggestions: boolean; }

export const Section6_PhysicalExploration: React.FC<Section6Props> = ({ data, handleChange, onGetCommonAbnormalFindings, isGeneratingFindingSuggestions }) => {
    const { exploracionFisica } = data
    const [activeSugSystem, setActiveSugSystem] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [customFindings, setCustomFindings] = useState<Record<string, string>>({})

    const handleStatusChange = (key: string, status: 'NORMAL' | 'ANORMAL' | '') => {
        handleChange(`exploracionFisica.examenSistemas.${key}.status`, status)
        if (status === 'ANORMAL') { setActiveSugSystem(key) }
        else if (activeSugSystem === key) { setActiveSugSystem(null); setSuggestions([]) }
    }

    useEffect(() => {
        if (activeSugSystem) {
            setSuggestions([])
            onGetCommonAbnormalFindings(activeSugSystem).then(setSuggestions).catch(() => { })
        }
    }, [activeSugSystem])

    const addFinding = (key: string, finding: string) => {
        const curr = exploracionFisica.examenSistemas[key].comentarios || ''
        handleChange(`exploracionFisica.examenSistemas.${key}.comentarios`, curr.trim() ? `${curr}. ${finding}` : finding)
    }

    return (
        <section className="space-y-4">
            <SectionTitle>6. EXPLORACIÓN FÍSICA</SectionTitle>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {[{ l: 'TA', k: 'ta', p: 'mmHg' }, { l: 'FC', k: 'fc', p: 'lpm' }, { l: 'FR', k: 'fr', p: 'rpm' }, { l: 'PESO', k: 'peso', p: 'kg' }, { l: 'TALLA', k: 'talla', p: 'cm' }, { l: 'IMC', k: 'imc', p: '' }, { l: 'TEMP', k: 'temperatura', p: '°C' }, { l: 'SAT O₂', k: 'satO2', p: '%' }, { l: 'MANO DOM.', k: 'manoDominante', p: '' }].map(f => (
                    <FormField key={f.k} label={f.l} id={f.k} value={(exploracionFisica.signosVitales as any)[f.k]} onChange={v => handleChange(`exploracionFisica.signosVitales.${f.k}`, v)} placeholder={f.p}
                        inputClassName={f.k === 'imc' ? 'bg-slate-50' : ''} />
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead><tr className="bg-slate-50"><th className="py-2 px-2 text-left text-xs font-bold text-slate-600 w-1/4">SISTEMA/ÓRGANO</th><th className="py-2 px-2 text-center text-xs font-bold text-slate-600 w-1/4">ESTADO</th><th className="py-2 px-2 text-left text-xs font-bold text-slate-600 w-1/2">COMENTARIOS</th></tr></thead>
                    <tbody>
                        {Object.keys(exploracionFisica.examenSistemas).map(key => {
                            const val = exploracionFisica.examenSistemas[key]
                            return (
                                <React.Fragment key={key}>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-1 pr-2 font-medium text-sm capitalize text-slate-800">{key.replace(/_/g, ' ').toLowerCase()}</td>
                                        <td className="py-1 px-2"><RadioGroup name={`sistema_${key}`} options={['NORMAL', 'ANORMAL']} selectedValue={val.status} onChange={v => handleStatusChange(key, v as any)} hideLabel /></td>
                                        <td className="py-1 pl-2"><FormField id={`com_${key}`} value={val.comentarios} onChange={v => handleChange(`exploracionFisica.examenSistemas.${key}.comentarios`, v)} placeholder="Comentarios..." hideLabel /></td>
                                    </tr>
                                    {activeSugSystem === key && (
                                        <tr><td colSpan={3}>
                                            <div className="p-3 bg-blue-50/50 border-t-2 border-blue-200">
                                                <p className="text-xs font-bold text-blue-700 mb-2">Sugerencias de hallazgos:</p>
                                                {isGeneratingFindingSuggestions ? <div className="flex items-center gap-2 text-sm text-blue-600"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Buscando...</div> : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {suggestions.map(s => <button key={s} type="button" onClick={() => addFinding(key, s)} className="px-2 py-1 bg-white border border-blue-300 text-blue-700 text-xs rounded-full hover:bg-blue-50 transition-colors">+ {s}</button>)}
                                                    </div>
                                                )}
                                            </div>
                                        </td></tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 7: ESTUDIOS COMPLEMENTARIOS
// ═══════════════════════════════════════════
const StudySection: React.FC<{ title: string; children: React.ReactNode; realizado: string; onRealizadoChange: (v: any) => void }> = ({ title, children, realizado, onRealizadoChange }) => (
    <div className="p-4 border border-slate-200 rounded-xl">
        <RadioGroup label={title} name={title.toLowerCase().replace(/\s/g, '_')} options={['SI', 'NO']} selectedValue={realizado} onChange={onRealizadoChange} />
        {realizado === 'SI' && <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">{children}</div>}
    </div>
)

export const Section7_ComplementaryStudies: React.FC<SectionProps> = ({ data, handleChange }) => {
    const { estudiosComplementarios } = data
    return (
        <section className="space-y-6">
            <SectionTitle>7. ESTUDIOS COMPLEMENTARIOS / PARACLÍNICOS</SectionTitle>
            <StudySection title="AUDIOMETRÍA" realizado={estudiosComplementarios.audiometria.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.audiometria.realizada', v)}>
                <RadioGroup label="Resultado" name="audio_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.audiometria.resultado} onChange={v => handleChange('estudiosComplementarios.audiometria.resultado', v)} />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm">
                        <thead><tr className="bg-slate-50"><th className="border border-slate-200 p-2 font-bold text-slate-700">Hz</th>{Object.keys(estudiosComplementarios.audiometria.reporte).map(f => <th key={f} className="border border-slate-200 p-2 font-mono font-bold text-slate-700">{f}</th>)}</tr></thead>
                        <tbody>
                            {['derecho', 'izquierdo'].map(ear => (
                                <tr key={ear}><td className="border border-slate-200 p-2 font-bold text-left text-slate-700">{ear === 'derecho' ? 'DERECHO' : 'IZQUIERDO'}</td>
                                    {Object.keys(estudiosComplementarios.audiometria.reporte).map(freq => {
                                        const v = estudiosComplementarios.audiometria.reporte[freq]
                                        return <td key={`${freq}-${ear}`} className="border border-slate-200 p-1"><FormField id={`audio_${freq}_${ear}`} value={(v as any)[ear]} onChange={val => handleChange(`estudiosComplementarios.audiometria.reporte.${freq}.${ear}`, val)} hideLabel /></td>
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </StudySection>
            <StudySection title="ESPIROMETRÍA" realizado={estudiosComplementarios.espirometria.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.espirometria.realizada', v)}>
                <RadioGroup label="Resultado" name="espiro_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.espirometria.resultado} onChange={v => handleChange('estudiosComplementarios.espirometria.resultado', v)} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField label="Predicho FVC" id="espiro_pred_fvc" value={estudiosComplementarios.espirometria.predicho_fvc} onChange={v => handleChange('estudiosComplementarios.espirometria.predicho_fvc', v)} />
                    <FormField label="FVC" id="espiro_fvc" value={estudiosComplementarios.espirometria.fvc} onChange={v => handleChange('estudiosComplementarios.espirometria.fvc', v)} />
                    <FormField label="Predicho FEV1" id="espiro_pred_fev1" value={estudiosComplementarios.espirometria.predicho_fev1} onChange={v => handleChange('estudiosComplementarios.espirometria.predicho_fev1', v)} />
                    <FormField label="FEV1" id="espiro_fev1" value={estudiosComplementarios.espirometria.fev1} onChange={v => handleChange('estudiosComplementarios.espirometria.fev1', v)} />
                </div>
                <TextArea label="REPORTE" id="espiro_reporte" value={estudiosComplementarios.espirometria.reporte} onChange={v => handleChange('estudiosComplementarios.espirometria.reporte', v)} rows={2} />
            </StudySection>
            <StudySection title="OPTOMETRÍA" realizado={estudiosComplementarios.optometria.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.optometria.realizada', v)}>
                <RadioGroup label="Resultado" name="opto_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.optometria.resultado} onChange={v => handleChange('estudiosComplementarios.optometria.resultado', v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['visionLejana', 'visionCercana'].map(vt => (
                        <div key={vt}>
                            <h4 className="text-xs font-bold text-slate-700 mb-1">{vt === 'visionLejana' ? 'VISIÓN LEJANA' : 'VISIÓN CERCANA'}</h4>
                            <table className="w-full text-sm"><thead><tr className="bg-slate-50"><th></th><th className="p-1 text-xs font-bold text-slate-600">Sin Corrección</th><th className="p-1 text-xs font-bold text-slate-600">Con Corrección</th></tr></thead>
                                <tbody>{['od', 'oi'].map(eye => (
                                    <tr key={eye}><td className="font-bold p-1 text-xs text-slate-700">{eye.toUpperCase()}</td>
                                        <td><FormField id={`${vt}_${eye}_sc`} value={(estudiosComplementarios.optometria as any)[vt][`${eye}SC`]} onChange={v => handleChange(`estudiosComplementarios.optometria.${vt}.${eye}SC`, v)} hideLabel /></td>
                                        <td><FormField id={`${vt}_${eye}_cc`} value={(estudiosComplementarios.optometria as any)[vt][`${eye}CC`]} onChange={v => handleChange(`estudiosComplementarios.optometria.${vt}.${eye}CC`, v)} hideLabel /></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ))}
                </div>
                <RadioGroup label="VISIÓN CROMÁTICA" name="opto_croma" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.optometria.visionCromatica} onChange={v => handleChange('estudiosComplementarios.optometria.visionCromatica', v)} />
                <TextArea label="REPORTE" id="opto_reporte" value={estudiosComplementarios.optometria.reporte} onChange={v => handleChange('estudiosComplementarios.optometria.reporte', v)} rows={2} />
            </StudySection>
            <StudySection title="ELECTROCARDIOGRAMA" realizado={estudiosComplementarios.electrocardiograma.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.electrocardiograma.realizada', v)}>
                <RadioGroup label="Resultado" name="ekg_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.electrocardiograma.resultado} onChange={v => handleChange('estudiosComplementarios.electrocardiograma.resultado', v)} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="RITMO" id="ekg_ritmo" value={estudiosComplementarios.electrocardiograma.ritmo} onChange={v => handleChange('estudiosComplementarios.electrocardiograma.ritmo', v)} />
                    <FormField label="Frecuencia Cardiaca" id="ekg_fc" value={estudiosComplementarios.electrocardiograma.frecuenciaCardiaca} onChange={v => handleChange('estudiosComplementarios.electrocardiograma.frecuenciaCardiaca', v)} />
                </div>
            </StudySection>
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 8: PRUEBAS DE LABORATORIO
// ═══════════════════════════════════════════
export const Section8_LabTests: React.FC<SectionProps> = ({ data, handleChange }) => {
    const { pruebasLaboratorio } = data
    return (
        <section className="space-y-6">
            <SectionTitle>8. PRUEBAS DE LABORATORIO / ANÁLISIS CLÍNICOS</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="GLUCOSA" id="glucosa" value={pruebasLaboratorio.glucosa} onChange={v => handleChange('pruebasLaboratorio.glucosa', v)} />
                <FormField label="ANTIDOPING" id="antidoping" value={pruebasLaboratorio.antidoping} onChange={v => handleChange('pruebasLaboratorio.antidoping', v)} />
            </div>
            <StudySection title="RADIOGRAFÍA DE TÓRAX" realizado={pruebasLaboratorio.radiografiaTorax.realizada} onRealizadoChange={v => handleChange('pruebasLaboratorio.radiografiaTorax.realizada', v)}>
                <RadioGroup label="Resultado" name="rx_torax_res" options={['Normal', 'Anormal']} selectedValue={pruebasLaboratorio.radiografiaTorax.resultado} onChange={v => handleChange('pruebasLaboratorio.radiografiaTorax.resultado', v)} />
                <TextArea label="REPORTE" id="rx_torax_rep" value={pruebasLaboratorio.radiografiaTorax.reporte} onChange={v => handleChange('pruebasLaboratorio.radiografiaTorax.reporte', v)} rows={3} />
            </StudySection>
            <StudySection title="RADIOGRAFÍA DE COLUMNA LUMBAR" realizado={pruebasLaboratorio.radiografiaColumnaLumbar.realizada} onRealizadoChange={v => handleChange('pruebasLaboratorio.radiografiaColumnaLumbar.realizada', v)}>
                <RadioGroup label="Resultado" name="rx_col_res" options={['Normal', 'Anormal']} selectedValue={pruebasLaboratorio.radiografiaColumnaLumbar.resultado} onChange={v => handleChange('pruebasLaboratorio.radiografiaColumnaLumbar.resultado', v)} />
                <TextArea label="REPORTE" id="rx_col_rep" value={pruebasLaboratorio.radiografiaColumnaLumbar.reporte} onChange={v => handleChange('pruebasLaboratorio.radiografiaColumnaLumbar.reporte', v)} rows={3} />
            </StudySection>
            <StudySection title="OTROS" realizado={pruebasLaboratorio.otros.realizado} onRealizadoChange={v => handleChange('pruebasLaboratorio.otros.realizado', v)}>
                <TextArea label="REPORTE" id="otros_rep" value={pruebasLaboratorio.otros.reporte} onChange={v => handleChange('pruebasLaboratorio.otros.reporte', v)} rows={3} />
            </StudySection>
        </section>
    )
}
