
import React from 'react';
import type { ClinicalHistoryFormData, AccidentEntry } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import Checkbox from '../form/Checkbox';
import RepeatableFieldGroup from '../form/RepeatableFieldGroup';
import DateField from '../form/DateField';

interface Props {
    data: ClinicalHistoryFormData;
    handleChange: (path: string, value: any) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-700 bg-slate-100 p-2 rounded-md border-l-4 border-slate-500">
        {children}
    </h3>
);

const Section4_AccidentsAndDiseases: React.FC<Props> = ({ data, handleChange }) => {
    const { accidentesEnfermedades } = data;

    const handleAccidentChange = (index: number, field: keyof AccidentEntry, value: any) => {
        const updatedAccidents = [...accidentesEnfermedades.accidentes];
        updatedAccidents[index] = { ...updatedAccidents[index], [field]: value };
        handleChange('accidentesEnfermedades.accidentes', updatedAccidents);
    };

    const addAccident = () => {
        const newAccident: AccidentEntry = { fecha: '', nombre_empresa: '', tipo_accidente: '', parte_cuerpo_afectada: '', dias_ausencia_laboral: '', secuelas: '' };
        handleChange('accidentesEnfermedades.accidentes', [...accidentesEnfermedades.accidentes, newAccident]);
    };
    
    const removeAccident = (index: number) => {
        const updatedAccidents = accidentesEnfermedades.accidentes.filter((_, i) => i !== index);
        handleChange('accidentesEnfermedades.accidentes', updatedAccidents);
    };

    return (
        <section className="space-y-6">
            <SectionTitle>4. Accidentes y enfermedades laborales</SectionTitle>
            
            <div>
                <RadioGroup 
                    label="¿Ha sufrido accidentes en su vida laboral?" 
                    name="haSufridoAccidentes" 
                    options={['SI', 'NO']} 
                    selectedValue={accidentesEnfermedades.haSufridoAccidentes} 
                    onChange={v => handleChange('accidentesEnfermedades.haSufridoAccidentes', v)}
                />
                 {accidentesEnfermedades.haSufridoAccidentes === 'SI' && (
                    <div className="mt-2 pl-4 border-l-4 border-blue-300">
                        <RepeatableFieldGroup
                            title="Accidente"
                            items={accidentesEnfermedades.accidentes}
                            onAddItem={addAccident}
                            onRemoveItem={removeAccident}
                        >
                            {(item: AccidentEntry, index) => (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <DateField label="Fecha" id={`acc_fecha_${index}`} value={item.fecha} onChange={v => handleAccidentChange(index, 'fecha', v)} />
                                    <FormField label="Nombre de la empresa" id={`acc_empresa_${index}`} value={item.nombre_empresa} onChange={v => handleAccidentChange(index, 'nombre_empresa', v)} />
                                    <FormField label="Tipo de accidente" id={`acc_tipo_${index}`} value={item.tipo_accidente} onChange={v => handleAccidentChange(index, 'tipo_accidente', v)} />
                                    <FormField label="Parte del cuerpo afectada" id={`acc_parte_${index}`} value={item.parte_cuerpo_afectada} onChange={v => handleAccidentChange(index, 'parte_cuerpo_afectada', v)} />
                                    <FormField label="Días de ausencia laboral" id={`acc_dias_${index}`} value={item.dias_ausencia_laboral} onChange={v => handleAccidentChange(index, 'dias_ausencia_laboral', v)} />
                                    <FormField label="Secuelas" id={`acc_secuelas_${index}`} value={item.secuelas} onChange={v => handleAccidentChange(index, 'secuelas', v)} />
                                </div>
                            )}
                        </RepeatableFieldGroup>
                    </div>
                )}
            </div>

            <div className="p-4 border rounded-md">
                <label className="block text-sm font-medium text-slate-800 mb-2">Equipo de protección personal utilizado en el trabajo actual</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                     {Object.keys(accidentesEnfermedades.epp).map(key => (
                        <Checkbox 
                            key={key}
                            label={key}
                            isChecked={accidentesEnfermedades.epp[key as keyof typeof accidentesEnfermedades.epp]}
                            onChange={v => handleChange(`accidentesEnfermedades.epp.${key}`, v)}
                        />
                    ))}
                </div>
            </div>

            <div>
                 <RadioGroup 
                    label="¿Ha sido diagnosticado con alguna enfermedad provocada por su trabajo?" 
                    name="diagnosticadoEnfermedad" 
                    options={['SI', 'NO']} 
                    selectedValue={accidentesEnfermedades.diagnosticadoEnfermedadTrabajo} 
                    onChange={v => handleChange('accidentesEnfermedades.diagnosticadoEnfermedadTrabajo', v)}
                />
                 {accidentesEnfermedades.diagnosticadoEnfermedadTrabajo === 'SI' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pl-4 border-l-4 border-blue-300">
                        <FormField label="Diagnóstico" id="enf_diag" value={accidentesEnfermedades.diagnostico} onChange={v => handleChange('accidentesEnfermedades.diagnostico', v)} />
                        <DateField label="Fecha del diagnóstico" id="enf_fecha" value={accidentesEnfermedades.fechaDiagnostico} onChange={v => handleChange('accidentesEnfermedades.fechaDiagnostico', v)} />
                    </div>
                 )}
            </div>
        </section>
    );
};

export default Section4_AccidentsAndDiseases;
