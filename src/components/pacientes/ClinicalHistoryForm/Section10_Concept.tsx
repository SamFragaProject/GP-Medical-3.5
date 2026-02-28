

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

const Section10_Concept: React.FC<Props> = ({ data, handleChange, onGenerate, isGenerating }) => {
    const { concepto } = data;
    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <SectionTitle>10. CONCEPTO</SectionTitle>
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
                label="CONCEPTO SOBRE LA BASE DE LA DECLARACIÓN DE SALUD PERSONAL, EXAMEN Y EVALUACIÓN"
                id="concepto_resumen"
                value={concepto.resumen}
                onChange={v => handleChange('concepto.resumen', v)}
                rows={3}
            />
            <FormField 
                label="Para el puesto de:"
                id="concepto_puesto"
                value={concepto.puestoDe}
                onChange={v => handleChange('concepto.puestoDe', v)}
            />
            <RadioGroup
                label="Juicio de Aptitud"
                name="aptitud"
                options={['Apto con restricciones', 'Apto sin restricciones', 'No Apto']}
                selectedValue={concepto.aptitud}
                onChange={v => handleChange('concepto.aptitud', v)}
            />
             <TextArea 
                label="Limitaciones/Restricciones"
                id="concepto_limitaciones"
                value={concepto.limitacionesRestricciones}
                onChange={v => handleChange('concepto.limitacionesRestricciones', v)}
                rows={3}
            />
        </section>
    );
};

export default Section10_Concept;
