import React from 'react';
import { PatientData } from '../../../types/extractor';
import { Trash2 } from 'lucide-react';

interface PatientTableProps {
    data: PatientData[];
    onDelete: (id: string) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ data, onDelete }) => {
    if (data.length === 0) return null;

    // STRICT ORDER: 27 items with CORRECT ORTHOGRAPHY (Accents and Capitalization)
    const headers: { key: keyof PatientData; label: string; width: string }[] = [
        // 1-11
        { key: 'nombreCompleto', label: 'Nombre Completo', width: 'min-w-[220px]' },
        { key: 'fechaNacimiento', label: 'Fec. Nacimiento', width: 'min-w-[130px]' },
        { key: 'edad', label: 'Edad', width: 'min-w-[80px]' },
        { key: 'genero', label: 'Género', width: 'min-w-[100px]' },
        { key: 'peso', label: 'Peso (kg)', width: 'min-w-[100px]' },
        { key: 'talla', label: 'Talla (m)', width: 'min-w-[100px]' },
        { key: 'imc', label: 'IMC', width: 'min-w-[80px]' },
        { key: 'clasificacionIMC', label: 'Clasificación IMC', width: 'min-w-[150px]' },
        { key: 'porcentajeGrasaVisceral', label: '% Grasa Visceral', width: 'min-w-[130px]' },
        { key: 'porcentajeGrasaCorporal', label: '% Grasa Corporal', width: 'min-w-[130px]' },
        { key: 'porcentajeMusculo', label: '% Músculo', width: 'min-w-[120px]' },

        // 12-16
        { key: 'ta_mmHg', label: 'TA (mmHg)', width: 'min-w-[110px]' },
        { key: 'fc_lpm', label: 'FC (lpm)', width: 'min-w-[100px]' },
        { key: 'fr_rpm', label: 'FR (rpm)', width: 'min-w-[100px]' },
        { key: 'satO2', label: 'SatO2 (%)', width: 'min-w-[100px]' },
        { key: 'temp_C', label: 'Temp (°C)', width: 'min-w-[100px]' },

        // 17-27
        { key: 'biometriaHematica', label: 'Biometría Hemática', width: 'min-w-[250px]' },
        { key: 'quimicaSanguinea6', label: 'Química Sanguínea (6 Elem)', width: 'min-w-[250px]' },
        { key: 'tasaFiltracionGlomerular', label: 'Filtración Glomerular', width: 'min-w-[220px]' },
        { key: 'creatininaOrina', label: 'Creatinina en Orina', width: 'min-w-[150px]' },
        { key: 'microalbuminuriaOrina', label: 'Microalbuminuria en Orina', width: 'min-w-[180px]' },
        { key: 'examenGeneralOrina', label: 'Examen General de Orina', width: 'min-w-[200px]' },
        { key: 'relacionAlbuminaCreatinina', label: 'Relación Albúmina/Creatinina', width: 'min-w-[200px]' },
        { key: 'perfilHepatico', label: 'Perfil Hepático', width: 'min-w-[200px]' },
        { key: 'electrolitosSericos', label: 'Electrolitos Séricos', width: 'min-w-[200px]' },
        { key: 'audiometria', label: 'Audiometría', width: 'min-w-[200px]' },
        { key: 'relacionCreatinina', label: 'Relación Creatinina', width: 'min-w-[150px]' },
    ];

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            <div className="overflow-auto flex-1 relative">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-30 shadow-sm">
                        <tr>
                            <th scope="col" className="px-4 py-3 bg-gray-50 sticky left-0 z-30 border-r border-gray-200 w-12 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                #
                            </th>
                            <th scope="col" className="px-2 py-3 bg-gray-50 sticky left-12 z-30 border-r border-gray-200 w-[40px] text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <Trash2 className="w-4 h-4 mx-auto text-gray-400" />
                            </th>
                            {headers.map((header) => (
                                <th key={header.key} scope="col" className={`px-4 py-3 whitespace-nowrap ${header.width} border-b border-gray-200`}>
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((patient, index) => (
                            <tr key={patient.id} className="bg-white hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white hover:bg-slate-50 border-r border-gray-100 z-20 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    {data.length - index}
                                </td>
                                <td className="px-2 py-3 sticky left-12 bg-white hover:bg-slate-50 border-r border-gray-100 z-20 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <button
                                        onClick={() => onDelete(patient.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 group"
                                        title="Eliminar registro"
                                    >
                                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                </td>
                                {headers.map((header) => (
                                    <td key={`${patient.id}-${header.key}`} className="px-4 py-3 truncate max-w-[300px] text-gray-600">
                                        <div className="truncate" title={patient[header.key] || ''}>
                                            {patient[header.key] || <span className="text-gray-300 text-xs">-</span>}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center flex-shrink-0">
                <span className="font-medium">Total: {data.length} pacientes</span>
                <span className="text-gray-400">Desplázate → para ver todas las columnas</span>
            </div>
        </div>
    );
};
