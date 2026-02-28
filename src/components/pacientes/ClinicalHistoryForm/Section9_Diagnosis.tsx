

import React from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import TextArea from '../form/TextArea';
import { BrainCircuitIcon } from '../IconComponents';

interface Props {
    data: ClinicalHistoryFormData;
    handleChange: (path: string, value: any) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-700 bg-slate-100 p-2 rounded-md border-l-4 border-slate-500">
        {children}
    </h3>
);

const Section9_Diagnosis: React.FC<Props> = ({ data, handleChange, onGenerate, isGenerating }) => {
    const { diagnostico } = data;
    return (
        <section className="space-y-4">
            <SectionTitle>9. DIAGNÓSTICO</SectionTitle>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="diagnostico_lista" className="block text-sm font-medium text-slate-800">
                        Listar los diagnósticos
                    </label>
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-lg hover:bg-blue-200 transition-colors shadow-sm text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait no-print"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span>Generando...</span>
                            </>
                        ) : (
                            <>
                                <BrainCircuitIcon className="w-4 h-4" />
                                <span>Generar con IA</span>
                            </>
                        )}
                    </button>
                </div>
                <TextArea 
                    label="Listar los diagnósticos"
                    hideLabel={true}
                    id="diagnostico_lista"
                    value={diagnostico.lista}
                    onChange={v => handleChange('diagnostico.lista', v)}
                    rows={5}
                />
            </div>
            <div>
                 <RadioGroup
                    label="Sospecha de enfermedad Profesional"
                    name="sospecha_enf"
                    options={['SI', 'NO']}
                    selectedValue={diagnostico.sospechaEnfermedadProfesional}
                    onChange={v => handleChange('diagnostico.sospechaEnfermedadProfesional', v)}
                />
                {diagnostico.sospechaEnfermedadProfesional === 'SI' && (
                    <div className="mt-2 pl-4 border-l-2">
                        <FormField 
                            label="¿Cuál?" 
                            id="sospecha_cual" 
                            value={diagnostico.cual} 
                            onChange={v => handleChange('diagnostico.cual', v)} 
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default Section9_Diagnosis;
