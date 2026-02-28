/**
 * Secciones 1-4 del Formulario de Historia Clínica
 * S1: Datos Generales | S2: Riesgo Laboral | S3: Historia Laboral | S4: Accidentes
 */
import React from 'react'
import type { ClinicalHistoryFormData, AccidentEntry } from '@/types/clinicalHistoryForm'
import { FormField, RadioGroup, Checkbox, SelectField, DateField, TextArea, RepeatableFieldGroup, SectionTitle, AIButton } from './FormPrimitives'

const MEXICAN_STATES = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

interface SectionProps { data: ClinicalHistoryFormData; handleChange: (path: string, value: any) => void; }

// ═══════════════════════════════════════════
// SECTION 1: DATOS GENERALES
// ═══════════════════════════════════════════
export const Section1_GeneralData: React.FC<SectionProps> = ({ data, handleChange }) => {
    const { datosGenerales } = data
    return (
        <section className="space-y-4">
            <SectionTitle>1. Datos generales</SectionTitle>
            <div className="p-4 border border-slate-200 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de evaluación médica ocupacional</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {Object.keys(datosGenerales.tipoEvaluacion).map(key => (
                        <Checkbox key={key} label={key} isChecked={datosGenerales.tipoEvaluacion[key as keyof typeof datosGenerales.tipoEvaluacion]}
                            onChange={v => handleChange(`datosGenerales.tipoEvaluacion.${key}`, v)} />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Lugar" id="lugar" value={datosGenerales.lugar} onChange={v => handleChange('datosGenerales.lugar', v)} options={MEXICAN_STATES} />
                <DateField label="Fecha" id="fechaEvaluacion" value={datosGenerales.fechaEvaluacion} onChange={v => handleChange('datosGenerales.fechaEvaluacion', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Apellidos" id="apellidos" value={datosGenerales.apellidos} onChange={v => handleChange('datosGenerales.apellidos', v)} />
                <FormField label="Nombre(s)" id="nombres" value={datosGenerales.nombres} onChange={v => handleChange('datosGenerales.nombres', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre de la empresa" id="nombreEmpresa" value={datosGenerales.nombreEmpresa} onChange={v => handleChange('datosGenerales.nombreEmpresa', v)} />
                <FormField label="Giro/Actividad de la empresa" id="giroEmpresa" value={datosGenerales.giroActividadEmpresa} onChange={v => handleChange('datosGenerales.giroActividadEmpresa', v)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <FormField label="Edad" id="edad" value={datosGenerales.edad} onChange={v => handleChange('datosGenerales.edad', v)} />
                <DateField label="Fecha de nacimiento" id="fechaNacimiento" value={datosGenerales.fechaNacimiento} onChange={v => handleChange('datosGenerales.fechaNacimiento', v)} />
                <SelectField label="Lugar de nacimiento" id="lugarNacimiento" value={datosGenerales.lugarNacimiento} onChange={v => handleChange('datosGenerales.lugarNacimiento', v)} options={MEXICAN_STATES} />
                <FormField label="Teléfono" id="telefono" type="tel" value={datosGenerales.telefono} onChange={v => handleChange('datosGenerales.telefono', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RadioGroup label="Sexo" name="sexo" options={['M', 'F']} selectedValue={datosGenerales.sexo} onChange={v => handleChange('datosGenerales.sexo', v)} />
                <div className="p-3 border border-slate-200 rounded-xl">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado civil</label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.keys(datosGenerales.estadoCivil).map(key => (
                            <Checkbox key={key} label={key} isChecked={datosGenerales.estadoCivil[key as keyof typeof datosGenerales.estadoCivil]}
                                onChange={v => handleChange(`datosGenerales.estadoCivil.${key}`, v)} />
                        ))}
                    </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de educación</label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.keys(datosGenerales.nivelEducacion).map(key => (
                            <Checkbox key={key} label={key.replace('tecnicoBachillerato', 'Técnico/Bach.')}
                                isChecked={datosGenerales.nivelEducacion[key as keyof typeof datosGenerales.nivelEducacion]}
                                onChange={v => handleChange(`datosGenerales.nivelEducacion.${key}`, v)} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 2: RIESGO LABORAL
// ═══════════════════════════════════════════
const RiskCategory: React.FC<{ title: string; risks: Record<string, boolean>; categoryPath: string; handleChange: SectionProps['handleChange'] }> = ({ title, risks, categoryPath, handleChange }) => (
    <div>
        <h4 className="font-semibold text-slate-800 text-xs bg-slate-100 p-1.5 rounded-t-lg border-b border-slate-200">{title}</h4>
        <div className="p-2 space-y-1 border border-t-0 border-slate-200 rounded-b-lg">
            {Object.keys(risks).map(riskKey => (
                <Checkbox key={riskKey} label={riskKey} isChecked={risks[riskKey]} onChange={v => handleChange(`${categoryPath}.${riskKey}`, v)} />
            ))}
        </div>
    </div>
)

interface Section2Props extends SectionProps { onAnalyze: () => void; isAnalyzing: boolean; }
export const Section2_WorkRisk: React.FC<Section2Props> = ({ data, handleChange, onAnalyze, isAnalyzing }) => {
    const { riesgoLaboral } = data
    return (
        <section className="space-y-4">
            <SectionTitle>2. Riesgo laboral (Empleo más reciente)</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField label="Nombre de la empresa" id="riesgo_empresa" value={riesgoLaboral.nombreEmpresa} onChange={v => handleChange('riesgoLaboral.nombreEmpresa', v)} />
                <div className="grid grid-cols-3 gap-2 items-end">
                    <FormField label="Puesto" id="riesgo_puesto" value={riesgoLaboral.puesto} onChange={v => handleChange('riesgoLaboral.puesto', v)} className="col-span-2" />
                    <AIButton onClick={onAnalyze} isLoading={isAnalyzing} label="Analizar" disabled={!riesgoLaboral.puesto} />
                </div>
                <FormField label="Tiempo de exposición" id="riesgo_tiempo" value={riesgoLaboral.tiempoExposicion} onChange={v => handleChange('riesgoLaboral.tiempoExposicion', v)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4 mt-4">
                {(['fisicos', 'quimicos', 'ergonomicos', 'biologicos', 'psicosociales', 'electricos', 'mecanicos', 'locativos'] as const).map(cat => (
                    <RiskCategory key={cat} title={cat.toUpperCase()} risks={riesgoLaboral.riesgos[cat]} categoryPath={`riesgoLaboral.riesgos.${cat}`} handleChange={handleChange} />
                ))}
            </div>
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 3: HISTORIA LABORAL
// ═══════════════════════════════════════════
interface Section3Props extends SectionProps { onAnalyze: () => void; isAnalyzing: boolean; }
export const Section3_WorkHistory: React.FC<Section3Props> = ({ data, handleChange, onAnalyze, isAnalyzing }) => {
    const { historiaLaboral } = data
    return (
        <section className="space-y-4">
            <SectionTitle>3. Historia laboral</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <FormField label="Nombre de la empresa" id="historia_empresa" value={historiaLaboral.nombreEmpresa} onChange={v => handleChange('historiaLaboral.nombreEmpresa', v)} className="md:col-span-2" />
                <div className="md:col-span-2 grid grid-cols-3 gap-2 items-end">
                    <FormField label="Puesto de trabajo" id="historia_puesto" value={historiaLaboral.puestoTrabajo} onChange={v => handleChange('historiaLaboral.puestoTrabajo', v)} className="col-span-2" />
                    <AIButton onClick={onAnalyze} isLoading={isAnalyzing} label="Analizar" disabled={!historiaLaboral.puestoTrabajo} />
                </div>
                <DateField label="Fecha de inicio laboral" id="historia_fecha_inicio" value={historiaLaboral.fechaInicioLaboral} onChange={v => handleChange('historiaLaboral.fechaInicioLaboral', v)} className="md:col-span-2" />
                <RadioGroup label="Turno" name="turno" options={['Diurno', 'Nocturno', 'Mixto']} selectedValue={historiaLaboral.turno} onChange={v => handleChange('historiaLaboral.turno', v)} className="md:col-span-2" />
            </div>
            <TextArea label="Descripción de las funciones laborales" id="historia_descripcion" value={historiaLaboral.descripcionFunciones} onChange={v => handleChange('historiaLaboral.descripcionFunciones', v)} rows={4} />
            <TextArea label="Máquinas, equipos y herramientas utilizadas" id="historia_maquinas" value={historiaLaboral.maquinasEquiposHerramientas} onChange={v => handleChange('historiaLaboral.maquinasEquiposHerramientas', v)} rows={4} />
        </section>
    )
}

// ═══════════════════════════════════════════
// SECTION 4: ACCIDENTES Y ENFERMEDADES
// ═══════════════════════════════════════════
export const Section4_AccidentsAndDiseases: React.FC<SectionProps> = ({ data, handleChange }) => {
    const { accidentesEnfermedades } = data
    const handleAccidentChange = (index: number, field: keyof AccidentEntry, value: any) => {
        const updated = [...accidentesEnfermedades.accidentes]; updated[index] = { ...updated[index], [field]: value };
        handleChange('accidentesEnfermedades.accidentes', updated);
    }
    const addAccident = () => handleChange('accidentesEnfermedades.accidentes', [...accidentesEnfermedades.accidentes, { fecha: '', nombre_empresa: '', tipo_accidente: '', parte_cuerpo_afectada: '', dias_ausencia_laboral: '', secuelas: '' }])
    const removeAccident = (i: number) => handleChange('accidentesEnfermedades.accidentes', accidentesEnfermedades.accidentes.filter((_, idx) => idx !== i))

    return (
        <section className="space-y-6">
            <SectionTitle>4. Accidentes y enfermedades laborales</SectionTitle>
            <RadioGroup label="¿Ha sufrido accidentes en su vida laboral?" name="haSufridoAccidentes" options={['SI', 'NO']} selectedValue={accidentesEnfermedades.haSufridoAccidentes} onChange={v => handleChange('accidentesEnfermedades.haSufridoAccidentes', v)} />
            {accidentesEnfermedades.haSufridoAccidentes === 'SI' && (
                <div className="pl-4 border-l-4 border-emerald-300">
                    <RepeatableFieldGroup title="Accidente" items={accidentesEnfermedades.accidentes} onAddItem={addAccident} onRemoveItem={removeAccident}>
                        {(item: AccidentEntry, index) => (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <DateField label="Fecha" id={`acc_fecha_${index}`} value={item.fecha} onChange={v => handleAccidentChange(index, 'fecha', v)} />
                                <FormField label="Empresa" id={`acc_empresa_${index}`} value={item.nombre_empresa} onChange={v => handleAccidentChange(index, 'nombre_empresa', v)} />
                                <FormField label="Tipo de accidente" id={`acc_tipo_${index}`} value={item.tipo_accidente} onChange={v => handleAccidentChange(index, 'tipo_accidente', v)} />
                                <FormField label="Parte del cuerpo" id={`acc_parte_${index}`} value={item.parte_cuerpo_afectada} onChange={v => handleAccidentChange(index, 'parte_cuerpo_afectada', v)} />
                                <FormField label="Días de ausencia" id={`acc_dias_${index}`} value={item.dias_ausencia_laboral} onChange={v => handleAccidentChange(index, 'dias_ausencia_laboral', v)} />
                                <FormField label="Secuelas" id={`acc_secuelas_${index}`} value={item.secuelas} onChange={v => handleAccidentChange(index, 'secuelas', v)} />
                            </div>
                        )}
                    </RepeatableFieldGroup>
                </div>
            )}
            <div className="p-4 border border-slate-200 rounded-xl">
                <label className="block text-sm font-medium text-slate-700 mb-2">Equipo de protección personal (EPP)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.keys(accidentesEnfermedades.epp).map(key => (
                        <Checkbox key={key} label={key} isChecked={accidentesEnfermedades.epp[key as keyof typeof accidentesEnfermedades.epp]} onChange={v => handleChange(`accidentesEnfermedades.epp.${key}`, v)} />
                    ))}
                </div>
            </div>
            <RadioGroup label="¿Ha sido diagnosticado con enfermedad laboral?" name="diagnosticadoEnfermedad" options={['SI', 'NO']} selectedValue={accidentesEnfermedades.diagnosticadoEnfermedadTrabajo} onChange={v => handleChange('accidentesEnfermedades.diagnosticadoEnfermedadTrabajo', v)} />
            {accidentesEnfermedades.diagnosticadoEnfermedadTrabajo === 'SI' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-4 border-emerald-300">
                    <FormField label="Diagnóstico" id="enf_diag" value={accidentesEnfermedades.diagnostico} onChange={v => handleChange('accidentesEnfermedades.diagnostico', v)} />
                    <DateField label="Fecha del diagnóstico" id="enf_fecha" value={accidentesEnfermedades.fechaDiagnostico} onChange={v => handleChange('accidentesEnfermedades.fechaDiagnostico', v)} />
                </div>
            )}
        </section>
    )
}
