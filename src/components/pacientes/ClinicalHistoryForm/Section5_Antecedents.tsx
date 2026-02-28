
import React from 'react';
import type { ClinicalHistoryFormData, HeredofamiliaresCondition, PathologicalCondition } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import Checkbox from '../form/Checkbox';
import SelectField from '../form/SelectField';
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
const SubSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-md font-semibold text-slate-900 mt-4 mb-2">
        {children}
    </h4>
);

const HeredofamiliarItem: React.FC<{ label: string; condition: HeredofamiliaresCondition; onChange: (value: HeredofamiliaresCondition) => void; }> = ({ label, condition, onChange }) => (
    <div className="grid grid-cols-12 gap-2 py-2 border-b items-center">
        <label className="col-span-12 sm:col-span-2 font-medium text-sm text-slate-900">{label}</label>
        <div className="col-span-6 sm:col-span-1">
            <RadioGroup name={`heredo_${label}_has`} options={['SI', 'NO']} selectedValue={condition.has} onChange={v => onChange({ ...condition, has: v as 'SI' | 'NO' })} hideLabel />
        </div>
        {condition.has === 'SI' && (
            <>
                <div className="col-span-12 sm:col-span-5 flex flex-wrap gap-x-3 gap-y-1 items-center">
                    {Object.keys(condition.parentescos).map(key => (
                        <Checkbox 
                            key={key}
                            label={key}
                            isChecked={condition.parentescos[key as keyof typeof condition.parentescos]}
                            onChange={v => onChange({ ...condition, parentescos: { ...condition.parentescos, [key]: v } })}
                        />
                    ))}
                </div>
                <div className="col-span-12 sm:col-span-4">
                     <FormField id={`heredo_esp_${label}`} value={condition.especifique} onChange={v => onChange({ ...condition, especifique: v })} placeholder="Especifique..." hideLabel />
                </div>
            </>
        )}
    </div>
);


const PathologicalItem: React.FC<{ label: string; condition: PathologicalCondition; onChange: (value: PathologicalCondition) => void; }> = ({ label, condition, onChange }) => (
    <tr className="border-b">
        <td className="py-2 pr-2 font-medium text-sm text-slate-900">{label}</td>
        <td className="py-2 px-2 text-center">
            <input type="radio" name={`path_${label}`} checked={condition.has === 'SI'} onChange={() => onChange({ ...condition, has: 'SI' })} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
        </td>
        <td className="py-2 px-2 text-center">
            <input type="radio" name={`path_${label}`} checked={condition.has === 'NO'} onChange={() => onChange({ ...condition, has: 'NO' })} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
        </td>
        <td className="py-2 pl-2">
             {condition.has === 'SI' && <FormField id={`path_esp_${label}`} value={condition.especifique} onChange={v => onChange({ ...condition, especifique: v })} placeholder="Especifique..." hideLabel />}
        </td>
    </tr>
);

const Section5_Antecedents: React.FC<Props> = ({ data, handleChange }) => {
    const { antecedentes } = data;
    return (
        <section className="space-y-4">
            <SectionTitle>5. ANTECEDENTES</SectionTitle>

            <SubSectionTitle>ANTECEDENTES HEREDOFAMILIARES</SubSectionTitle>
             <div className="p-4 border rounded-lg">
                 {Object.entries(antecedentes.heredofamiliares).map(([key, condition]) => (
                    <HeredofamiliarItem key={key} label={key} condition={condition} onChange={v => handleChange(`antecedentes.heredofamiliares.${key}`, v)} />
                ))}
            </div>
            
            <SubSectionTitle>ANTECEDENTES PERSONALES NO PATOLOGICOS</SubSectionTitle>
            <div className="p-4 border rounded-lg space-y-4">
                <RadioGroup label="VACUNACION/INMUNIZACION" name="vacunacion" options={['ESQUEMA COMPLETO', 'ESQUEMA INCOMPLETO', 'LO IGNORA']} selectedValue={antecedentes.personalesNoPatologicos.vacunacion} onChange={v => handleChange('antecedentes.personalesNoPatologicos.vacunacion', v)} />
                <div>
                     <RadioGroup label="TABAQUISMO" name="tabaquismo" options={['SI', 'NO']} selectedValue={antecedentes.personalesNoPatologicos.tabaquismo.has} onChange={v => handleChange('antecedentes.personalesNoPatologicos.tabaquismo.has', v)} />
                     {antecedentes.personalesNoPatologicos.tabaquismo.has === 'SI' && (
                        <div className="grid grid-cols-2 gap-4 mt-2 pl-4 border-l-2">
                            <SelectField label="Número de cigarros" id="tabaco_num" value={antecedentes.personalesNoPatologicos.tabaquismo.numeroCigarros} onChange={v => handleChange('antecedentes.personalesNoPatologicos.tabaquismo.numeroCigarros', v)} options={['1-5', '6-10', '11-15', '16-20', '>20']} />
                            <SelectField label="Frecuencia" id="tabaco_freq" value={antecedentes.personalesNoPatologicos.tabaquismo.frecuencia} onChange={v => handleChange('antecedentes.personalesNoPatologicos.tabaquismo.frecuencia', v)} options={['Diario', 'Semanal', 'Cada 15 días', 'Mensual']} />
                        </div>
                     )}
                </div>
                 <div>
                     <RadioGroup label="ALCOHOLISMO" name="alcoholismo" options={['SI', 'NO']} selectedValue={antecedentes.personalesNoPatologicos.alcoholismo.has} onChange={v => handleChange('antecedentes.personalesNoPatologicos.alcoholismo.has', v)} />
                      {antecedentes.personalesNoPatologicos.alcoholismo.has === 'SI' && (
                        <div className="mt-2 pl-4 border-l-2">
                            <SelectField label="Frecuencia" id="alcohol_freq" value={antecedentes.personalesNoPatologicos.alcoholismo.frecuencia} onChange={v => handleChange('antecedentes.personalesNoPatologicos.alcoholismo.frecuencia', v)} options={['Diario', 'Semanal', 'Cada 15 días', 'Mensual']} />
                        </div>
                     )}
                </div>
            </div>

             <SubSectionTitle>ANTECEDENTES PERSONALES-PATOLOGICOS</SubSectionTitle>
             <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-2 text-left text-sm font-semibold text-slate-900 w-1/3">Condición</th>
                            <th className="py-2 px-2 text-center text-sm font-semibold text-slate-900 w-1/12">SI</th>
                            <th className="py-2 px-2 text-center text-sm font-semibold text-slate-900 w-1/12">NO</th>
                            <th className="py-2 px-2 text-left text-sm font-semibold text-slate-900">Especifique</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(antecedentes.personalesPatologicos).map(([key, condition]) => (
                            <PathologicalItem key={key} label={key} condition={condition} onChange={v => handleChange(`antecedentes.personalesPatologicos.${key}`, v)} />
                        ))}
                    </tbody>
                </table>
            </div>

            {antecedentes.ginecoObstetricos.visible && (
                <div className="mt-4 p-4 rounded-lg border-2 border-pink-200 bg-pink-50">
                    <SubSectionTitle>ANTECEDENTES GINECO-OBSTETRICOS</SubSectionTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField label="Menarca" id="menarca" value={antecedentes.ginecoObstetricos.menarca} onChange={v => handleChange('antecedentes.ginecoObstetricos.menarca', v)} />
                        <FormField label="Ciclos" id="ciclos" value={antecedentes.ginecoObstetricos.ciclos} onChange={v => handleChange('antecedentes.ginecoObstetricos.ciclos', v)} />
                        <DateField label="FUM" id="fum" value={antecedentes.ginecoObstetricos.fum} onChange={v => handleChange('antecedentes.ginecoObstetricos.fum', v)} />
                        <FormField label="Método Anticonceptivo" id="anticonceptivo" value={antecedentes.ginecoObstetricos.metodoAnticonceptivo} onChange={v => handleChange('antecedentes.ginecoObstetricos.metodoAnticonceptivo', v)} />
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                         <div className="col-span-2">
                             <label className="block text-sm font-medium text-slate-800 mb-1">Paridad</label>
                             <div className="grid grid-cols-4 gap-2 p-2 border rounded-md bg-white">
                                <FormField label="G" id="paridad_g" value={antecedentes.ginecoObstetricos.paridad.g} onChange={v => handleChange('antecedentes.ginecoObstetricos.paridad.g', v)} />
                                <FormField label="P" id="paridad_p" value={antecedentes.ginecoObstetricos.paridad.p} onChange={v => handleChange('antecedentes.ginecoObstetricos.paridad.p', v)} />
                                <FormField label="A" id="paridad_a" value={antecedentes.ginecoObstetricos.paridad.a} onChange={v => handleChange('antecedentes.ginecoObstetricos.paridad.a', v)} />
                                <FormField label="C" id="paridad_c" value={antecedentes.ginecoObstetricos.paridad.c} onChange={v => handleChange('antecedentes.ginecoObstetricos.paridad.c', v)} />
                            </div>
                        </div>
                         <DateField label="FUP" id="fup" value={antecedentes.ginecoObstetricos.fup} onChange={v => handleChange('antecedentes.ginecoObstetricos.fup', v)} />
                         <DateField label="FUC" id="fuc" value={antecedentes.ginecoObstetricos.fuc} onChange={v => handleChange('antecedentes.ginecoObstetricos.fuc', v)} />
                         <DateField label="FUA" id="fua" value={antecedentes.ginecoObstetricos.fua} onChange={v => handleChange('antecedentes.ginecoObstetricos.fua', v)} />
                    </div>
                    <div className="mt-4">
                        <RadioGroup label="Papanicolaou" name="papanicolaou" options={['SI', 'NO']} selectedValue={antecedentes.ginecoObstetricos.papanicolaou.realizado} onChange={v => handleChange('antecedentes.ginecoObstetricos.papanicolaou.realizado', v)} />
                        {antecedentes.ginecoObstetricos.papanicolaou.realizado === 'SI' && (
                             <div className="grid grid-cols-2 gap-4 mt-2 pl-4 border-l-2">
                                <DateField label="Fecha" id="pap_fecha" value={antecedentes.ginecoObstetricos.papanicolaou.fecha} onChange={v => handleChange('antecedentes.ginecoObstetricos.papanicolaou.fecha', v)} />
                                <FormField label="Resultado" id="pap_res" value={antecedentes.ginecoObstetricos.papanicolaou.resultado} onChange={v => handleChange('antecedentes.ginecoObstetricos.papanicolaou.resultado', v)} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Section5_Antecedents;
