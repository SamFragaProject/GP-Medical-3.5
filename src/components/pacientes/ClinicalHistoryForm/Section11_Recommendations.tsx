
import React from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
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

const Section11_Recommendations: React.FC<Props> = ({ data, handleChange, onGenerate, isGenerating }) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-2">
                <SectionTitle>11. RECOMENDACIONES</SectionTitle>
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
                label="Recomendaciones"
                id="recomendaciones"
                value={data.recomendaciones}
                onChange={v => handleChange('recomendaciones', v)}
                rows={6}
                placeholder="Escriba aquí las recomendaciones..."
                hideLabel={true}
            />
        </section>
    );
};

export default Section11_Recommendations;
