
import React from 'react';
import type { ClinicalHistoryFormData } from '@/types/clinicalHistory';
import FormField from '../form/FormField';
import RadioGroup from '../form/RadioGroup';
import DateField from '../form/DateField';
import Checkbox from '../form/Checkbox';
import SelectField from '../form/SelectField';
import { BrainCircuitIcon } from '../IconComponents';

interface Props {
    data: ClinicalHistoryFormData;
    handleChange: (path: string, value: any) => void;
    onRepopulate: () => void;
    isUpdating: boolean;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-700 bg-slate-100 p-2 rounded-md border-l-4 border-slate-500">
        {children}
    </h3>
);

const mexicanStates = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 
    'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 
    'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 
    'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const Section1_GeneralData: React.FC<Props> = ({ data, handleChange, onRepopulate, isUpdating }) => {
    const { datosGenerales } = data;

    return (
        <section className="space-y-4">
             <div className="flex justify-between items-center">
                <SectionTitle>1. Datos generales</SectionTitle>
                 <button
                    type="button"
                    onClick={onRepopulate}
                    disabled={isUpdating}
                    className="flex items-center justify-center gap-2 bg-blue-100 text-blue-800 font-semibold py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-wait no-print"
                    >
                    {isUpdating ? (
                        <>
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Actualizando...</span>
                        </>
                    ) : (
                        <>
                        <BrainCircuitIcon className="w-5 h-5" />
                        <span>Repoblar datos con IA</span>
                        </>
                    )}
                    </button>
            </div>
            
            <div className="p-4 border rounded-md">
                <label className="block text-sm font-medium text-slate-800 mb-2">Tipo de evaluación médica ocupacional</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {Object.keys(datosGenerales.tipoEvaluacion).map(key => (
                        <Checkbox 
                            key={key}
                            label={key}
                            isChecked={datosGenerales.tipoEvaluacion[key as keyof typeof datosGenerales.tipoEvaluacion]}
                            onChange={v => handleChange(`datosGenerales.tipoEvaluacion.${key}`, v)}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField 
                    label="Lugar" 
                    id="lugar" 
                    value={datosGenerales.lugar} 
                    onChange={v => handleChange('datosGenerales.lugar', v)} 
                    options={mexicanStates}
                />
                <DateField 
                    label="Fecha"
                    id="fechaEvaluacion"
                    value={datosGenerales.fechaEvaluacion}
                    onChange={v => handleChange('datosGenerales.fechaEvaluacion', v)}
                />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Apellidos" id="apellidos" value={datosGenerales.apellidos} onChange={v => handleChange('datosGenerales.apellidos', v)} />
                <FormField label="Nombre(s)" id="nombres" value={datosGenerales.nombres} onChange={v => handleChange('datosGenerales.nombres', v)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre de la empresa" id="nombreEmpresa" value={datosGenerales.nombreEmpresa} onChange={v => handleChange('datosGenerales.nombreEmpresa', v)} />
                <FormField label="Giro/Actividad de la empresa" id="giroEmpresa" value={datosGenerales.giroActividadEmpresa} onChange={v => handleChange('datosGenerales.giroActividadEmpresa', v)} />
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <FormField label="Edad" id="edad" value={datosGenerales.edad} onChange={v => handleChange('datosGenerales.edad', v)} />
                <DateField label="Fecha de nacimiento" id="fechaNacimiento" value={datosGenerales.fechaNacimiento} onChange={v => handleChange('datosGenerales.fechaNacimiento', v)} />
                <SelectField 
                    label="Lugar de nacimiento" 
                    id="lugarNacimiento" 
                    value={datosGenerales.lugarNacimiento} 
                    onChange={v => handleChange('datosGenerales.lugarNacimiento', v)} 
                    options={mexicanStates}
                />
                <FormField label="Teléfono" id="telefono" type="tel" value={datosGenerales.telefono} onChange={v => handleChange('datosGenerales.telefono', v)} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RadioGroup label="Sexo" name="sexo" options={['M', 'F']} selectedValue={datosGenerales.sexo} onChange={v => handleChange('datosGenerales.sexo', v)} />
                
                <div className="p-2 border rounded-md">
                    <label className="block text-sm font-medium text-slate-800 mb-1">Estado civil</label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                       {Object.keys(datosGenerales.estadoCivil).map(key => (
                            <Checkbox 
                                key={key}
                                label={key}
                                isChecked={datosGenerales.estadoCivil[key as keyof typeof datosGenerales.estadoCivil]}
                                onChange={v => handleChange(`datosGenerales.estadoCivil.${key}`, v)}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-2 border rounded-md">
                    <label className="block text-sm font-medium text-slate-800 mb-1">Nivel de educación</label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.keys(datosGenerales.nivelEducacion).map(key => (
                            <Checkbox 
                                key={key}
                                label={key.replace('tecnicoBachillerato', 'Técnico/Bach.')}
                                isChecked={datosGenerales.nivelEducacion[key as keyof typeof datosGenerales.nivelEducacion]}
                                onChange={v => handleChange(`datosGenerales.nivelEducacion.${key}`, v)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Section1_GeneralData;
