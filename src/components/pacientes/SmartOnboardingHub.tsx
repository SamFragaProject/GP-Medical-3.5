import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileText, ArrowLeft, Save, UploadCloud, BrainCircuit, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

import { ClinicalHistoryFormData, getInitialClinicalHistoryFormData, MedicalReport } from '@/types/clinicalHistory';
import { analyzeMedicalDocument, populateClinicalHistoryForm } from '@/services/smartExtractionService';

import Section1_GeneralData from './ClinicalHistoryForm/Section1_GeneralData';
import Section2_WorkRisk from './ClinicalHistoryForm/Section2_WorkRisk';
import Section3_WorkHistory from './ClinicalHistoryForm/Section3_WorkHistory';
import Section4_AccidentsAndDiseases from './ClinicalHistoryForm/Section4_AccidentsAndDiseases';
import Section5_Antecedents from './ClinicalHistoryForm/Section5_Antecedents';
import Section6_PhysicalExploration from './ClinicalHistoryForm/Section6_PhysicalExploration';
import Section7_ComplementaryStudies from './ClinicalHistoryForm/Section7_ComplementaryStudies';
import Section8_LabTests from './ClinicalHistoryForm/Section8_LabTests';
import Section9_Diagnosis from './ClinicalHistoryForm/Section9_Diagnosis';
import Section10_Concept from './ClinicalHistoryForm/Section10_Concept';
import Section11_Recommendations from './ClinicalHistoryForm/Section11_Recommendations';
import Section12_Signature from './ClinicalHistoryForm/Section12_Signature';
import {
    getRisksForJobTitle, getJobDetails, generateDiagnoses,
    generateConcept, generateRecommendations, extractAndGenerateVitalSigns
} from '@/services/smartExtractionService';

interface SmartOnboardingHubProps {
    onComplete: (data: { paciente: any, formData: ClinicalHistoryFormData, report: MedicalReport | null, files: File[] }) => Promise<void>;
    onCancel: () => void;
    empresaId?: string;
}

export default function SmartOnboardingHub({ onComplete, onCancel, empresaId }: SmartOnboardingHubProps) {
    const [step, setStep] = useState<'method-select' | 'upload' | 'form'>('method-select');
    const [formData, setFormData] = useState<ClinicalHistoryFormData>(getInitialClinicalHistoryFormData());
    const [medicalReport, setMedicalReport] = useState<MedicalReport>({ patientData: {}, vitalSigns: {}, sections: {} });
    const [files, setFiles] = useState<File[]>([]);

    // UI States
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');

    // --- MÉTODOS DE EXTRACCIÓN Y NAVEGACIÓN ---

    const handleMethodSelect = (method: 'smart' | 'manual') => {
        if (method === 'smart') {
            setStep('upload');
        } else {
            setStep('form');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        setIsAnalyzing(true);
        setLoadingStage('Analizando documentos con Gemini 2.0...');

        try {
            // Asumimos categoria "laboratories" por defecto para extracción general en onboarding
            const extractionResult = await analyzeMedicalDocument(selectedFiles, 'laboratories');

            const newReport = {
                patientData: extractionResult.patientData || {},
                vitalSigns: extractionResult.vitalSigns || {},
                sections: extractionResult.results ? { laboratories: { name: 'Laboratorios', results: extractionResult.results, summary: extractionResult.summary } } : {}
            };

            setMedicalReport(newReport as MedicalReport);

            setLoadingStage('Estructurando historia clínica con OpenAI...');
            const prefilledRaw = await populateClinicalHistoryForm(newReport as MedicalReport);

            // Merge smart logic
            const mergedForm = { ...getInitialClinicalHistoryFormData(), ...prefilledRaw };
            if (empresaId) mergedForm.datosGenerales.nombreEmpresa = empresaId; // o lookup

            setFormData(mergedForm as ClinicalHistoryFormData);
            setStep('form');
            toast.success('¡Extracción exitosa! Revisa los datos pre-llenados.');

        } catch (error) {
            console.error(error);
            toast.error('Error al analizar documentos. Usa el ingreso manual.');
            setStep('form'); // Falla silenciosa y pasa al manual
        } finally {
            setIsAnalyzing(false);
            setLoadingStage('');
        }
    };

    // --- MANEJO DEL FORMULARIO INTERACTIVO ---

    const handleChange = (path: string, value: any) => {
        setFormData(prevData => {
            const keys = path.split('.');
            const newData = JSON.parse(JSON.stringify(prevData));
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = current[keys[i]] || {};
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    // --- ACCIONES DE IA EN EL FORMULARIO (Autocompletar) ---

    const handleAnalyzeWorkRisk = async () => {
        if (!formData.riesgoLaboral.puesto) return toast.error('Escribe el puesto primero');
        const loadToast = toast.loading('Analizando riesgos del puesto...');
        try {
            const riesgos = await getRisksForJobTitle(formData.riesgoLaboral.puesto);
            setFormData(prev => ({ ...prev, riesgoLaboral: { ...prev.riesgoLaboral, riesgos } }));
            toast.success('Riesgos laborales actualizados', { id: loadToast });
        } catch (error) {
            toast.error('Error analizando puesto', { id: loadToast });
        }
    };

    const handleAnalyzeWorkHistory = async () => {
        if (!formData.historiaLaboral.puestoTrabajo) return toast.error('Escribe el puesto previo');
        const loadToast = toast.loading('Analizando puesto histórico...');
        try {
            const details = await getJobDetails(formData.historiaLaboral.puestoTrabajo);
            setFormData(prev => ({ ...prev, historiaLaboral: { ...prev.historiaLaboral, ...details } }));
            toast.success('Detalles del puesto completados', { id: loadToast });
        } catch (error) {
            toast.error('Error analizando puesto histórico', { id: loadToast });
        }
    };

    const handleGenerateDiagnoses = async () => {
        const loadToast = toast.loading('Generando diagnósticos...');
        try {
            const lista = await generateDiagnoses(medicalReport);
            setFormData(prev => ({ ...prev, diagnostico: { ...prev.diagnostico, lista } }));
            toast.success('Diagnósticos sugeridos', { id: loadToast });
        } catch (e) {
            toast.error('Error', { id: loadToast });
        }
    };

    const handleGenerateConcept = async () => {
        const loadToast = toast.loading('Generando concepto...');
        try {
            const conceptData = await generateConcept(medicalReport);
            const validAptitud = ["Apto con restricciones", "Apto sin restricciones", "No Apto"].includes(conceptData.aptitud)
                ? (conceptData.aptitud as any)
                : "";
            setFormData(prev => ({ ...prev, concepto: { ...prev.concepto, ...conceptData, aptitud: validAptitud } }));
            toast.success('Concepto sugerido', { id: loadToast });
        } catch (e) {
            toast.error('Error', { id: loadToast });
        }
    };

    const handleGenerateRecommendations = async () => {
        const loadToast = toast.loading('Generando recomendaciones...');
        try {
            const recs = await generateRecommendations(medicalReport);
            setFormData(prev => ({ ...prev, recomendaciones: recs }));
            toast.success('Recomendaciones generadas', { id: loadToast });
        } catch (e) {
            toast.error('Error', { id: loadToast });
        }
    };

    // --- GUARDADO FINAL ---

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Mapeo básico a la tabla "pacientes"
            const nombresArr = formData.datosGenerales.nombres.split(' ');
            const apellidosArr = formData.datosGenerales.apellidos.split(' ');

            let genero = 'otro';
            if (formData.datosGenerales.sexo === 'M') genero = 'masculino';
            if (formData.datosGenerales.sexo === 'F') genero = 'femenino';

            const pacienteMappedToDb = {
                nombre: nombresArr.join(' ') || 'Paciente',
                apellido_paterno: apellidosArr[0] || 'Desconocido',
                apellido_materno: apellidosArr.slice(1).join(' ') || '',
                genero,
                fecha_nacimiento: formData.datosGenerales.fechaNacimiento || null,
                puesto: formData.riesgoLaboral.puesto,
                empresa_id: empresaId || null,
                tipo_sangre: '',
                estatus: 'activo'
            };

            await onComplete({
                paciente: pacienteMappedToDb,
                formData,
                report: Object.keys(medicalReport.sections).length > 0 ? medicalReport : null,
                files
            });

        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDERIZADO CONDICIONAL ---

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-120px)] p-6 rounded-2xl relative">
            <Button variant="ghost" className="mb-4 text-slate-500" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar y Volver
            </Button>

            <AnimatePresence mode="wait">
                {step === 'method-select' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="max-w-4xl mx-auto mt-20"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">
                                Ingreso <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Multimodal</span>
                            </h2>
                            <p className="text-slate-500 text-lg">¿Cómo quieres capturar los datos de la historia clínica?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div
                                onClick={() => handleMethodSelect('smart')}
                                className="group relative bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Bot className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">Smart Start</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Sube laboratorios, PDFs médicos o recetas. La Inteligencia Artificial extraerá y pre-llenará la historia clínica automáticamente.
                                </p>
                            </div>

                            <div
                                onClick={() => handleMethodSelect('manual')}
                                className="group relative bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">Ingreso Manual</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Captura directa de la entrevista clínica con asistente IA inteligente para autocompletar riesgos laborales y proponer diagnósticos.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'upload' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto mt-20 text-center"
                    >
                        {!isAnalyzing ? (
                            <div className="bg-white p-12 rounded-3xl shadow-sm border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors relative cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <UploadCloud className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Arrastra los documentos médicos aquí</h3>
                                <p className="text-slate-500 text-sm">PDF, JPEG o PNG hasta 50MB</p>
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                                <Activity className="w-16 h-16 text-blue-500 animate-pulse mb-6" />
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{loadingStage}</h3>
                                <p className="text-slate-500 text-sm">Este proceso puede tomar unos segundos. Extraemos datos paramétricos usando razonamiento multimodelo.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 'form' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Historia Clínica Ocupacional</h2>
                                <p className="text-slate-500">Por favor revisa y completa los campos.</p>
                            </div>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold" disabled={isSaving} onClick={handleSave}>
                                {isSaving ? <Activity className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Guardar Expediente
                            </Button>
                        </div>

                        {/* Interactive Form Components Ported from AI Consolidator */}
                        <div className="space-y-12">
                            <Section1_GeneralData data={formData} handleChange={handleChange} onRepopulate={() => { }} isUpdating={false} />

                            {/* Dividers for better reading */}
                            <hr className="border-slate-100" />
                            <Section2_WorkRisk data={formData} handleChange={handleChange} onAnalyze={handleAnalyzeWorkRisk} isAnalyzing={false} />

                            <hr className="border-slate-100" />
                            <Section3_WorkHistory data={formData} handleChange={handleChange} onAnalyze={handleAnalyzeWorkHistory} isAnalyzing={false} />

                            <hr className="border-slate-100" />
                            <Section4_AccidentsAndDiseases data={formData} handleChange={handleChange} />

                            <hr className="border-slate-100" />
                            <Section5_Antecedents data={formData} handleChange={handleChange} />

                            <hr className="border-slate-100" />
                            <Section6_PhysicalExploration
                                data={formData}
                                handleChange={handleChange}
                                onRepopulate={async () => { }}
                                isProcessing={false}
                                onGetCommonAbnormalFindings={async () => []}
                                isGeneratingFindingSuggestions={false}
                            />

                            <hr className="border-slate-100" />
                            {/* <Section7_ComplementaryStudies data={formData} handleChange={handleChange} /> */}
                            {/* <Section8_LabTests data={formData} handleChange={handleChange} /> */}

                            <hr className="border-slate-100" />
                            <Section9_Diagnosis data={formData} handleChange={handleChange} onGenerate={handleGenerateDiagnoses} isGenerating={false} />

                            <hr className="border-slate-100" />
                            <Section10_Concept data={formData} handleChange={handleChange} onGenerate={handleGenerateConcept} isGenerating={false} />

                            <hr className="border-slate-100" />
                            <Section11_Recommendations data={formData} handleChange={handleChange} onGenerate={handleGenerateRecommendations} isGenerating={false} />
                        </div>

                        <div className="mt-12 flex justify-end">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto font-bold" disabled={isSaving} onClick={handleSave}>
                                {isSaving ? <Activity className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Finalizar y Guardar Expediente
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
