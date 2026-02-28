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

const Section7_ComplementaryStudies: React.FC<Props> = ({ data, handleChange }) => {
    const { estudiosComplementarios } = data;
    return (
        <section className="space-y-6">
            <SectionTitle>7. ESTUDIOS COMPLEMENTARIOS / PARACLÍNICOS</SectionTitle>

            <StudySection title="AUDIOMETRIA" realizado={estudiosComplementarios.audiometria.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.audiometria.realizada', v)}>
                <RadioGroup label="Resultado" name="audio_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.audiometria.resultado} onChange={v => handleChange('estudiosComplementarios.audiometria.resultado', v)} />
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 font-semibold text-slate-900">Frecuencia (Hz)</th>
                                {Object.keys(estudiosComplementarios.audiometria.reporte).map(freq => <th key={freq} className="border p-2 font-mono font-semibold text-slate-900">{freq}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border p-2 font-semibold text-left text-slate-900">DERECHO</td>
                                {Object.keys(estudiosComplementarios.audiometria.reporte).map((freq) => {
                                    const values = estudiosComplementarios.audiometria.reporte[freq as keyof typeof estudiosComplementarios.audiometria.reporte];
                                    return <td key={`${freq}-derecho`} className="border p-1"><FormField id={`audio_${freq}_derecho`} value={values.derecho} onChange={v => handleChange(`estudiosComplementarios.audiometria.reporte.${freq}.derecho`, v)} hideLabel /></td>
                                })}
                            </tr>
                            <tr>
                                <td className="border p-2 font-semibold text-left text-slate-900">IZQUIERDO</td>
                                 {Object.keys(estudiosComplementarios.audiometria.reporte).map((freq) => {
                                     const values = estudiosComplementarios.audiometria.reporte[freq as keyof typeof estudiosComplementarios.audiometria.reporte];
                                     return <td key={`${freq}-izquierdo`} className="border p-1"><FormField id={`audio_${freq}_izquierdo`} value={values.izquierdo} onChange={v => handleChange(`estudiosComplementarios.audiometria.reporte.${freq}.izquierdo`, v)} hideLabel /></td>
                                 })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </StudySection>
            
            <StudySection title="ESPIROMETRIA" realizado={estudiosComplementarios.espirometria.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.espirometria.realizada', v)}>
                <RadioGroup label="Resultado" name="espiro_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.espirometria.resultado} onChange={v => handleChange('estudiosComplementarios.espirometria.resultado', v)} />
                {/* FIX: Replaced single 'predicho' field with correct 'predicho_fvc' and 'predicho_fev1' fields. */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <FormField label="Predicho FVC" id="espiro_predicho_fvc" value={estudiosComplementarios.espirometria.predicho_fvc} onChange={v => handleChange('estudiosComplementarios.espirometria.predicho_fvc', v)} />
                     <FormField label="FVC" id="espiro_fvc" value={estudiosComplementarios.espirometria.fvc} onChange={v => handleChange('estudiosComplementarios.espirometria.fvc', v)} />
                     <FormField label="Predicho FEV1" id="espiro_predicho_fev1" value={estudiosComplementarios.espirometria.predicho_fev1} onChange={v => handleChange('estudiosComplementarios.espirometria.predicho_fev1', v)} />
                     <FormField label="FEV1" id="espiro_fev1" value={estudiosComplementarios.espirometria.fev1} onChange={v => handleChange('estudiosComplementarios.espirometria.fev1', v)} />
                </div>
                 <TextArea label="REPORTE" id="espiro_reporte" value={estudiosComplementarios.espirometria.reporte} onChange={v => handleChange('estudiosComplementarios.espirometria.reporte', v)} rows={2}/>
            </StudySection>
            
            <StudySection title="OPTOMETRIA" realizado={estudiosComplementarios.optometria.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.optometria.realizada', v)}>
                <RadioGroup label="Resultado" name="opto_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.optometria.resultado} onChange={v => handleChange('estudiosComplementarios.optometria.resultado', v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-semibold mb-1 text-slate-900">VISION LEJANA</h4>
                        <table className="w-full text-sm">
                            <thead><tr className="bg-gray-50"><th></th><th className="p-1 font-semibold text-slate-900">Sin Corrección</th><th className="p-1 font-semibold text-slate-900">Con Corrección</th></tr></thead>
                            <tbody>
                                <tr><td className="font-semibold p-1 text-slate-900">OD</td><td><FormField id="vl_od_sc" value={estudiosComplementarios.optometria.visionLejana.odSC} onChange={v => handleChange('estudiosComplementarios.optometria.visionLejana.odSC', v)} hideLabel/></td><td><FormField id="vl_od_cc" value={estudiosComplementarios.optometria.visionLejana.odCC} onChange={v => handleChange('estudiosComplementarios.optometria.visionLejana.odCC', v)} hideLabel/></td></tr>
                                <tr><td className="font-semibold p-1 text-slate-900">OI</td><td><FormField id="vl_oi_sc" value={estudiosComplementarios.optometria.visionLejana.oiSC} onChange={v => handleChange('estudiosComplementarios.optometria.visionLejana.oiSC', v)} hideLabel/></td><td><FormField id="vl_oi_cc" value={estudiosComplementarios.optometria.visionLejana.oiCC} onChange={v => handleChange('estudiosComplementarios.optometria.visionLejana.oiCC', v)} hideLabel/></td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-1 text-slate-900">VISION CERCANA</h4>
                         <table className="w-full text-sm">
                            <thead><tr className="bg-gray-50"><th></th><th className="p-1 font-semibold text-slate-900">Sin Corrección</th><th className="p-1 font-semibold text-slate-900">Con Corrección</th></tr></thead>
                            <tbody>
                                <tr><td className="font-semibold p-1 text-slate-900">OD</td><td><FormField id="vc_od_sc" value={estudiosComplementarios.optometria.visionCercana.odSC} onChange={v => handleChange('estudiosComplementarios.optometria.visionCercana.odSC', v)} hideLabel/></td><td><FormField id="vc_od_cc" value={estudiosComplementarios.optometria.visionCercana.odCC} onChange={v => handleChange('estudiosComplementarios.optometria.visionCercana.odCC', v)} hideLabel/></td></tr>
                                <tr><td className="font-semibold p-1 text-slate-900">OI</td><td><FormField id="vc_oi_sc" value={estudiosComplementarios.optometria.visionCercana.oiSC} onChange={v => handleChange('estudiosComplementarios.optometria.visionCercana.oiSC', v)} hideLabel/></td><td><FormField id="vc_oi_cc" value={estudiosComplementarios.optometria.visionCercana.oiCC} onChange={v => handleChange('estudiosComplementarios.optometria.visionCercana.oiCC', v)} hideLabel/></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <RadioGroup label="VISION CROMATICA" name="opto_croma" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.optometria.visionCromatica} onChange={v => handleChange('estudiosComplementarios.optometria.visionCromatica', v)} />
                <TextArea label="REPORTE" id="opto_reporte" value={estudiosComplementarios.optometria.reporte} onChange={v => handleChange('estudiosComplementarios.optometria.reporte', v)} rows={2}/>
            </StudySection>

            <StudySection title="ELECTROCARDIOGRAMA" realizado={estudiosComplementarios.electrocardiograma.realizada} onRealizadoChange={v => handleChange('estudiosComplementarios.electrocardiograma.realizada', v)}>
                 <RadioGroup label="Resultado" name="ekg_res" options={['Normal', 'Anormal']} selectedValue={estudiosComplementarios.electrocardiograma.resultado} onChange={v => handleChange('estudiosComplementarios.electrocardiograma.resultado', v)} />
                 <div className="grid grid-cols-2 gap-4">
                     <FormField label="RITMO" id="ekg_ritmo" value={estudiosComplementarios.electrocardiograma.ritmo} onChange={v => handleChange('estudiosComplementarios.electrocardiograma.ritmo', v)} />
                     <FormField label="Frecuencia Cardiaca" id="ekg_fc" value={estudiosComplementarios.electrocardiograma.frecuenciaCardiaca} onChange={v => handleChange('estudiosComplementarios.electrocardiograma.frecuenciaCardiaca', v)} />
                 </div>
            </StudySection>
        </section>
    );
};

export default Section7_ComplementaryStudies;
