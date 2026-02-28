

import React, { useState, useEffect, useMemo } from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import { BrainCircuitIcon } from '../IconComponents';

interface Props {
    data: ClinicalHistoryFormData;
    handleChange: (path: string, value: any) => void;
    onRepopulate: () => void;
    isProcessing: boolean;
    onGetCommonAbnormalFindings: (systemName: string) => Promise<string[]>;
    isGeneratingFindingSuggestions: boolean;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-700 bg-slate-100 p-2 rounded-md border-l-4 border-slate-500">
        {children}
    </h3>
);


interface FindingSuggestionsProps {
    systemKey: string;
    isGenerating: boolean;
    suggestions: string[];
    customFindingValue: string;
    onAddSuggestion: (finding: string) => void;
    onCustomFindingChange: (value: string) => void;
    onAddCustomFinding: () => void;
}

const FindingSuggestions: React.FC<FindingSuggestionsProps> = ({
    systemKey,
    isGenerating,
    suggestions,
    customFindingValue,
    onAddSuggestion,
    onCustomFindingChange,
    onAddCustomFinding,
}) => {
    return (
        <div className="p-3 bg-blue-50 border-t-2 border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-2">Sugerencias de Hallazgos para {systemKey}:</p>
            {isGenerating ? (
                <div className="flex items-center gap-2 text-sm text-blue-700">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Buscando sugerencias...
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => onAddSuggestion(s)}
                                className="px-2 py-1 bg-white border border-blue-400 text-blue-800 text-xs rounded-full hover:bg-blue-100 transition-colors"
                            >
                                + {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                        <input
                            type="text"
                            value={customFindingValue}
                            onChange={(e) => onCustomFindingChange(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddCustomFinding(); } }}
                            placeholder="Otro..."
                            className="flex-grow p-1 border border-gray-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={onAddCustomFinding}
                            className="px-2 py-1 bg-slate-600 text-white text-xs font-semibold rounded-md hover:bg-slate-700"
                        >
                            Añadir
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


const Section6_PhysicalExploration: React.FC<Props> = ({ data, handleChange, onRepopulate, isProcessing, onGetCommonAbnormalFindings, isGeneratingFindingSuggestions }) => {
    const { exploracionFisica } = data;
    const [activeSuggestionsSystem, setActiveSuggestionsSystem] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [customFindings, setCustomFindings] = useState<Record<string, string>>({});
    
    const handleStatusChange = (systemKey: string, newStatus: 'NORMAL' | 'ANORMAL' | '') => {
        handleChange(`exploracionFisica.examenSistemas.${systemKey}.status`, newStatus);
        if (newStatus === 'ANORMAL') {
            setActiveSuggestionsSystem(systemKey);
        } else if (activeSuggestionsSystem === systemKey) {
            setActiveSuggestionsSystem(null);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        if (activeSuggestionsSystem) {
            setSuggestions([]); // Clear old suggestions before fetching new ones
            onGetCommonAbnormalFindings(activeSuggestionsSystem).then(setSuggestions);
        }
    }, [activeSuggestionsSystem, onGetCommonAbnormalFindings]);
    
    const addFindingToComment = (systemKey: string, finding: string) => {
        const currentComment = exploracionFisica.examenSistemas[systemKey].comentarios || '';
        // Add a period and space if there's already content.
        const separator = currentComment.trim() ? '. ' : '';
        const newComment = `${currentComment}${separator}${finding}`;
        handleChange(`exploracionFisica.examenSistemas.${systemKey}.comentarios`, newComment);
    };
    
    const handleCustomFindingChange = (systemKey: string, value: string) => {
        setCustomFindings(prev => ({
            ...prev,
            [systemKey]: value,
        }));
    };
    
    const handleAddCustomFinding = (systemKey: string) => {
        const findingToAdd = customFindings[systemKey] || '';
        if(findingToAdd.trim()) {
            addFindingToComment(systemKey, findingToAdd.trim());
            handleCustomFindingChange(systemKey, ''); // Clear the input for that specific system
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <SectionTitle>6. EXPLORACIÓN FÍSICA</SectionTitle>
                <button
                    type="button"
                    onClick={onRepopulate}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 bg-blue-100 text-blue-800 font-semibold py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait no-print"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Procesando...</span>
                        </>
                    ) : (
                        <>
                            <BrainCircuitIcon className="w-5 h-5" />
                            <span>Repoblar Signos con IA</span>
                        </>
                    )}
                </button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                <FormField label="TA" id="ta" value={exploracionFisica.signosVitales.ta} onChange={v => handleChange('exploracionFisica.signosVitales.ta', v)} placeholder="mmHg"/>
                <FormField label="FC" id="fc" value={exploracionFisica.signosVitales.fc} onChange={v => handleChange('exploracionFisica.signosVitales.fc', v)} placeholder="lpm"/>
                <FormField label="FR" id="fr" value={exploracionFisica.signosVitales.fr} onChange={v => handleChange('exploracionFisica.signosVitales.fr', v)} placeholder="rpm"/>
                <FormField label="PESO" id="peso" value={exploracionFisica.signosVitales.peso} onChange={v => handleChange('exploracionFisica.signosVitales.peso', v)} placeholder="kg"/>
                <FormField label="TALLA" id="talla" value={exploracionFisica.signosVitales.talla} onChange={v => handleChange('exploracionFisica.signosVitales.talla', v)} placeholder="cm"/>
                <FormField label="IMC" id="imc" value={exploracionFisica.signosVitales.imc} onChange={()=>{}} inputClassName="bg-gray-100" />
                <FormField label="TEMP" id="temperatura" value={exploracionFisica.signosVitales.temperatura} onChange={v => handleChange('exploracionFisica.signosVitales.temperatura', v)} placeholder="°C"/>
                <FormField label="SAT. DE 02" id="satO2" value={exploracionFisica.signosVitales.satO2} onChange={v => handleChange('exploracionFisica.signosVitales.satO2', v)} placeholder="%"/>
                <FormField label="MANO DOMINANTE" id="manoDominante" value={exploracionFisica.signosVitales.manoDominante} onChange={v => handleChange('exploracionFisica.signosVitales.manoDominante', v)} />
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-2 text-left text-sm font-semibold text-slate-900 w-1/4">SISTEMA/ORGANO</th>
                            <th className="py-2 px-2 text-center text-sm font-semibold text-slate-900 w-1/4">ESTADO</th>
                            <th className="py-2 px-2 text-left text-sm font-semibold text-slate-900 w-1/2">COMENTARIOS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(exploracionFisica.examenSistemas).map((key) => {
                            const value = exploracionFisica.examenSistemas[key as keyof typeof exploracionFisica.examenSistemas];
                            return (
                                <React.Fragment key={key}>
                                    <tr className="border-b">
                                        <td className="py-1 pr-2 font-medium text-sm capitalize text-slate-900">{key.replace(/_/g, ' ')}</td>
                                        <td className="py-1 px-2">
                                            <RadioGroup
                                                name={`sistema_${key}`}
                                                options={['NORMAL', 'ANORMAL']}
                                                selectedValue={value.status}
                                                onChange={v => handleStatusChange(key, v as any)}
                                                hideLabel
                                            />
                                        </td>
                                        <td className="py-1 pl-2">
                                             <FormField 
                                                id={`comentarios_${key}`}
                                                value={value.comentarios}
                                                onChange={v => handleChange(`exploracionFisica.examenSistemas.${key}.comentarios`, v)}
                                                placeholder="Comentarios..."
                                                hideLabel
                                             />
                                        </td>
                                    </tr>
                                    {activeSuggestionsSystem === key && (
                                        <tr>
                                            <td colSpan={3}>
                                                <FindingSuggestions
                                                    systemKey={key}
                                                    isGenerating={isGeneratingFindingSuggestions}
                                                    suggestions={suggestions}
                                                    customFindingValue={customFindings[key] || ''}
                                                    onAddSuggestion={(finding) => addFindingToComment(key, finding)}
                                                    onCustomFindingChange={(value) => handleCustomFindingChange(key, value)}
                                                    onAddCustomFinding={() => handleAddCustomFinding(key)}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Section6_PhysicalExploration;
