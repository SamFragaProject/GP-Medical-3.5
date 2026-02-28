
import React from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import Checkbox from '../form/Checkbox';
import { BrainCircuitIcon } from '../IconComponents';

interface Props {
    data: ClinicalHistoryFormData;
    handleChange: (path: string, value: any) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-700 bg-slate-100 p-2 rounded-md border-l-4 border-slate-500">
        {children}
    </h3>
);

const RiskCategory: React.FC<{ title: string; risks: Record<string, boolean>; categoryPath: string; handleChange: Props['handleChange'] }> = ({ title, risks, categoryPath, handleChange }) => (
    <div>
        <h4 className="font-semibold text-slate-900 bg-gray-100 p-1.5 rounded-t-md border-b">{title}</h4>
        <div className="p-2 space-y-1 border border-t-0 rounded-b-md">
             {Object.keys(risks).map(riskKey => (
                <Checkbox
                    key={riskKey}
                    label={riskKey}
                    isChecked={risks[riskKey]}
                    onChange={v => handleChange(`${categoryPath}.${riskKey}`, v)}
                />
            ))}
        </div>
    </div>
);

const Section2_WorkRisk: React.FC<Props> = ({ data, handleChange, onAnalyze, isAnalyzing }) => {
    const { riesgoLaboral } = data;
    return (
        <section className="space-y-4">
            <SectionTitle>2. Riesgo laboral (Empleo más reciente)</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField label="Nombre de la empresa" id="riesgo_empresa" value={riesgoLaboral.nombreEmpresa} onChange={v => handleChange('riesgoLaboral.nombreEmpresa', v)} />
                <div className="grid grid-cols-3 gap-2 items-end">
                    <FormField label="Puesto" id="riesgo_puesto" value={riesgoLaboral.puesto} onChange={v => handleChange('riesgoLaboral.puesto', v)} className="col-span-2" />
                    <button
                        type="button"
                        onClick={onAnalyze}
                        disabled={isAnalyzing || !riesgoLaboral.puesto}
                        title="Analizar puesto con IA para autocompletar riesgos"
                        className="flex items-center justify-center gap-2 bg-blue-100 text-blue-800 font-semibold py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait h-10"
                    >
                         {isAnalyzing ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <BrainCircuitIcon className="w-5 h-5" />
                        )}
                        <span>Analizar</span>
                    </button>
                </div>
                <FormField label="Tiempo de exposición" id="riesgo_tiempo" value={riesgoLaboral.tiempoExposicion} onChange={v => handleChange('riesgoLaboral.tiempoExposicion', v)} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 mt-4">
                <RiskCategory title="FÍSICOS" risks={riesgoLaboral.riesgos.fisicos} categoryPath="riesgoLaboral.riesgos.fisicos" handleChange={handleChange} />
                <RiskCategory title="QUÍMICOS" risks={riesgoLaboral.riesgos.quimicos} categoryPath="riesgoLaboral.riesgos.quimicos" handleChange={handleChange} />
                <RiskCategory title="ERGONÓMICOS" risks={riesgoLaboral.riesgos.ergonomicos} categoryPath="riesgoLaboral.riesgos.ergonomicos" handleChange={handleChange} />
                <RiskCategory title="BIOLÓGICOS" risks={riesgoLaboral.riesgos.biologicos} categoryPath="riesgoLaboral.riesgos.biologicos" handleChange={handleChange} />
                <RiskCategory title="PSICOSOCIALES" risks={riesgoLaboral.riesgos.psicosociales} categoryPath="riesgoLaboral.riesgos.psicosociales" handleChange={handleChange} />
                <RiskCategory title="ELÉCTRICOS" risks={riesgoLaboral.riesgos.electricos} categoryPath="riesgoLaboral.riesgos.electricos" handleChange={handleChange} />
                <RiskCategory title="MECÁNICOS" risks={riesgoLaboral.riesgos.mecanicos} categoryPath="riesgoLaboral.riesgos.mecanicos" handleChange={handleChange} />
                <RiskCategory title="LOCATIVOS" risks={riesgoLaboral.riesgos.locativos} categoryPath="riesgoLaboral.riesgos.locativos" handleChange={handleChange} />
            </div>
        </section>
    );
};

export default Section2_WorkRisk;
