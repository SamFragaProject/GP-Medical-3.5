import React from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import TextArea from '../form/TextArea';

interface Props {
    data: ClinicalHistoryFormData;
    handleChange: (path: string, value: any) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-700 bg-slate-100 p-2 rounded-md border-l-4 border-slate-500">
        {children}
    </h3>
);

const StudySection: React.FC<{ title: string; children: React.ReactNode; realizado: 'SI' | 'NO' | ''; onRealizadoChange: (val: any) => void; }> = ({ title, children, realizado, onRealizadoChange }) => (
    <div className="p-4 border rounded-lg">
        <RadioGroup label={title} name={title.toLowerCase().replace(/\s/g, '_')} options={['SI', 'NO']} selectedValue={realizado} onChange={onRealizadoChange} />
        {realizado === 'SI' && (
            <div className="mt-4 pt-4 border-t space-y-4">
                {children}
            </div>
        )}
    </div>
);

const Section8_LabTests: React.FC<Props> = ({ data, handleChange }) => {
    const { pruebasLaboratorio } = data;
    return (
        <section className="space-y-6">
            <SectionTitle>8. PRUEBAS DE LABORATORIO / ANÁLISIS CLÍNICOS</SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="GLUCOSA" id="glucosa" value={pruebasLaboratorio.glucosa} onChange={v => handleChange('pruebasLaboratorio.glucosa', v)} />
                <FormField label="ANTIDOPING" id="antidoping" value={pruebasLaboratorio.antidoping} onChange={v => handleChange('pruebasLaboratorio.antidoping', v)} />
            </div>

            <StudySection title="RADIOGRAFIA DE TORAX" realizado={pruebasLaboratorio.radiografiaTorax.realizada} onRealizadoChange={v => handleChange('pruebasLaboratorio.radiografiaTorax.realizada', v)}>
                <RadioGroup label="Resultado" name="rx_torax_res" options={['Normal', 'Anormal']} selectedValue={pruebasLaboratorio.radiografiaTorax.resultado} onChange={v => handleChange('pruebasLaboratorio.radiografiaTorax.resultado', v)} />
                <TextArea label="REPORTE" id="rx_torax_rep" value={pruebasLaboratorio.radiografiaTorax.reporte} onChange={v => handleChange('pruebasLaboratorio.radiografiaTorax.reporte', v)} rows={3} />
            </StudySection>
            
            <StudySection title="RADIOGRAFIA DE COLUMNA LUMBAR" realizado={pruebasLaboratorio.radiografiaColumnaLumbar.realizada} onRealizadoChange={v => handleChange('pruebasLaboratorio.radiografiaColumnaLumbar.realizada', v)}>
                <RadioGroup label="Resultado" name="rx_col_res" options={['Normal', 'Anormal']} selectedValue={pruebasLaboratorio.radiografiaColumnaLumbar.resultado} onChange={v => handleChange('pruebasLaboratorio.radiografiaColumnaLumbar.resultado', v)} />
                <TextArea label="REPORTE" id="rx_col_rep" value={pruebasLaboratorio.radiografiaColumnaLumbar.reporte} onChange={v => handleChange('pruebasLaboratorio.radiografiaColumnaLumbar.reporte', v)} rows={3} />
            </StudySection>
            
            <StudySection title="OTROS" realizado={pruebasLaboratorio.otros.realizado} onRealizadoChange={v => handleChange('pruebasLaboratorio.otros.realizado', v)}>
                <TextArea label="REPORTE" id="otros_rep" value={pruebasLaboratorio.otros.reporte} onChange={v => handleChange('pruebasLaboratorio.otros.reporte', v)} rows={3} />
            </StudySection>
        </section>
    );
};

export default Section8_LabTests;
