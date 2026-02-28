
import React from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import TextArea from '../form/TextArea';
import DateField from '../form/DateField';
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

const Section3_WorkHistory: React.FC<Props> = ({ data, handleChange, onAnalyze, isAnalyzing }) => {
    const { historiaLaboral } = data;

    return (
        <section className="space-y-4">
            <SectionTitle>3. Historia laboral</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <FormField label="Nombre de la empresa" id="historia_empresa" value={historiaLaboral.nombreEmpresa} onChange={v => handleChange('historiaLaboral.nombreEmpresa', v)} className="md:col-span-2"/>
                <div className="md:col-span-2 grid grid-cols-3 gap-2 items-end">
                    <FormField label="Puesto de trabajo" id="historia_puesto" value={historiaLaboral.puestoTrabajo} onChange={v => handleChange('historiaLaboral.puestoTrabajo', v)} className="col-span-2" />
                     <button
                        type="button"
                        onClick={onAnalyze}
                        disabled={isAnalyzing || !historiaLaboral.puestoTrabajo}
                        title="Analizar puesto con IA para autocompletar descripciones"
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
                <DateField 
                    label="Fecha de inicio laboral" 
                    id="historia_fecha_inicio" 
                    value={historiaLaboral.fechaInicioLaboral} 
                    onChange={v => handleChange('historiaLaboral.fechaInicioLaboral', v)}
                    className="md:col-span-2"
                />
                <RadioGroup label="Turno" name="turno" options={['Diurno', 'Nocturno', 'Mixto']} selectedValue={historiaLaboral.turno} onChange={v => handleChange('historiaLaboral.turno', v)} className="md:col-span-2" />
            </div>
            <TextArea 
                label="Descripción de las funciones laborales" 
                id="historia_descripcion" 
                value={historiaLaboral.descripcionFunciones} 
                onChange={v => handleChange('historiaLaboral.descripcionFunciones', v)} 
                rows={4}
            />
            <TextArea 
                label="Máquinas, equipos y herramientas utilizadas" 
                id="historia_maquinas" 
                value={historiaLaboral.maquinasEquiposHerramientas} 
                onChange={v => handleChange('historiaLaboral.maquinasEquiposHerramientas', v)} 
                rows={4}
            />
        </section>
    );
};

export default Section3_WorkHistory;
