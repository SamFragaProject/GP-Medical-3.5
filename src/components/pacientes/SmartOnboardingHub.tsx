/**
 * SmartOnboardingHub — Flujo unificado de alta de pacientes
 *
 * Dos caminos:
 * 1. Smart Start: Upload de documentos por SECCIÓN médica (Labs, Audio, Espiro, ECG, RX, Opto)
 *    → Gemini 2.0 extrae → Modal de confirmación → Se consolida en MedicalReport → Se pre-llena la historia clínica
 * 2. Manual: Se llena el formulario clínico directamente con IA para autocompletar riesgos
 *
 * Al guardar:
 *  - Crea/actualiza paciente en tabla `pacientes`
 *  - Sube archivos a Supabase Storage con naming: {apellido}_{nombre}_{tipo}_{fecha}.{ext}
 *  - Guarda datos extraídos en `documentos_expediente` JSONB
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, FileText, ArrowLeft, Save, UploadCloud, Activity,
    CheckCircle, XCircle, AlertTriangle, FileUp, Eye, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

import {
    ClinicalHistoryFormData, getInitialClinicalHistoryFormData,
    MedicalReport, MedicalSectionId, MEDICAL_SECTIONS, PatientData, VitalSigns
} from '@/types/clinicalHistory';
import {
    analyzeMedicalDocument, populateClinicalHistoryForm,
    getRisksForJobTitle, getJobDetails, generateDiagnoses,
    generateConcept, generateRecommendations
} from '@/services/smartExtractionService';

import Section1_GeneralData from './ClinicalHistoryForm/Section1_GeneralData';
import Section2_WorkRisk from './ClinicalHistoryForm/Section2_WorkRisk';
import Section3_WorkHistory from './ClinicalHistoryForm/Section3_WorkHistory';
import Section4_AccidentsAndDiseases from './ClinicalHistoryForm/Section4_AccidentsAndDiseases';
import Section5_Antecedents from './ClinicalHistoryForm/Section5_Antecedents';
import Section6_PhysicalExploration from './ClinicalHistoryForm/Section6_PhysicalExploration';
import Section9_Diagnosis from './ClinicalHistoryForm/Section9_Diagnosis';
import Section10_Concept from './ClinicalHistoryForm/Section10_Concept';
import Section11_Recommendations from './ClinicalHistoryForm/Section11_Recommendations';

// =============================================
// TIPOS
// =============================================

type UploadStatus = 'pending' | 'processing' | 'complete' | 'error';
type SectionUploadState = { status: UploadStatus; fileName?: string };

interface PendingUploadData {
    sectionId: MedicalSectionId;
    patientData: Partial<PatientData>;
    vitalSigns: Partial<VitalSigns>;
    results: any[];
    summary: string;
    fileNames: string;
    files: File[];
}

interface SmartOnboardingHubProps {
    onComplete: (data: {
        paciente: any;
        formData: ClinicalHistoryFormData;
        report: MedicalReport | null;
        files: File[];
        sectionFiles: Record<string, File[]>;
    }) => Promise<void>;
    onCancel: () => void;
    empresaId?: string;
}

// =============================================
// DEEP MERGE UTIL
// =============================================

const deepMerge = (target: any, source: any): any => {
    const output = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const tv = target[key];
            const sv = source[key];
            if (typeof sv === 'object' && sv !== null && !Array.isArray(sv) && typeof tv === 'object' && tv !== null && !Array.isArray(tv)) {
                output[key] = deepMerge(tv, sv);
            } else {
                output[key] = sv;
            }
        }
    }
    return output;
};

// =============================================
// SECTION CARDS CONFIG
// =============================================

const SECTION_CARDS: { id: MedicalSectionId; label: string; icon: string; color: string }[] = [
    { id: 'laboratories', label: 'Laboratorios', icon: '🧪', color: 'from-emerald-500 to-teal-600' },
    { id: 'audiometry', label: 'Audiometría', icon: '👂', color: 'from-blue-500 to-indigo-600' },
    { id: 'spirometry', label: 'Espirometría', icon: '🫁', color: 'from-cyan-500 to-blue-600' },
    { id: 'xRays', label: 'Rayos X', icon: '☢️', color: 'from-amber-500 to-orange-600' },
    { id: 'optometry', label: 'Optometría', icon: '👁️', color: 'from-violet-500 to-purple-600' },
    { id: 'electrocardiogram', label: 'ECG', icon: '❤️', color: 'from-rose-500 to-red-600' },
];

// =============================================
// MAIN COMPONENT
// =============================================

export default function SmartOnboardingHub({ onComplete, onCancel, empresaId }: SmartOnboardingHubProps) {
    // Flow step
    const [step, setStep] = useState<'method-select' | 'upload' | 'form'>('method-select');

    // Clinical form data
    const [formData, setFormData] = useState<ClinicalHistoryFormData>(getInitialClinicalHistoryFormData());

    // Medical report (consolidated from all uploads)
    const [medicalReport, setMedicalReport] = useState<MedicalReport>({ patientData: {}, vitalSigns: {}, sections: {} });

    // Files per section
    const [sectionFiles, setSectionFiles] = useState<Record<string, File[]>>({});

    // Upload status per section
    const initialStatus = (Object.keys(MEDICAL_SECTIONS) as MedicalSectionId[]).reduce((acc, key) => {
        acc[key] = { status: 'pending' };
        return acc;
    }, {} as Record<MedicalSectionId, SectionUploadState>);
    const [uploadStatus, setUploadStatus] = useState<Record<MedicalSectionId, SectionUploadState>>(initialStatus);

    // Pending upload for confirmation modal
    const [pendingUpload, setPendingUpload] = useState<PendingUploadData | null>(null);

    // UI states
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // =============================================
    // METHOD SELECT
    // =============================================

    const handleMethodSelect = (method: 'smart' | 'manual') => {
        if (method === 'smart') {
            setStep('upload');
        } else {
            setStep('form');
        }
    };

    // =============================================
    // FILE UPLOAD PER SECTION (like the new app)
    // =============================================

    const handleSectionFileUpload = useCallback(async (files: File[], sectionId: MedicalSectionId) => {
        setIsProcessing(true);
        const fileNames = files.map(f => f.name).join(', ');
        setUploadStatus(prev => ({ ...prev, [sectionId]: { status: 'processing', fileName: fileNames } }));

        try {
            const { patientData, vitalSigns, results, summary } = await analyzeMedicalDocument(files, sectionId);

            // Show confirmation modal with extracted data
            setPendingUpload({
                sectionId,
                patientData: patientData || {},
                vitalSigns: vitalSigns || {},
                results: results || [],
                summary: summary || '',
                fileNames,
                files
            });
        } catch (err) {
            console.error(err);
            toast.error(`Error al analizar ${MEDICAL_SECTIONS[sectionId]}. Intenta de nuevo.`);
            setUploadStatus(prev => ({ ...prev, [sectionId]: { status: 'error', fileName: fileNames } }));
            setIsProcessing(false);
        }
    }, []);

    // =============================================
    // CONFIRMATION MODAL HANDLERS
    // =============================================

    const handleConfirmUpload = useCallback(async () => {
        if (!pendingUpload) return;

        const { sectionId, patientData, vitalSigns, results, summary, files } = pendingUpload;

        // Merge into medical report
        setMedicalReport(prev => {
            const mergedPatientData = { ...prev.patientData, ...patientData };
            const mergedVitalSigns = { ...prev.vitalSigns, ...vitalSigns };
            const updatedSections = { ...prev.sections };

            if (results && results.length > 0) {
                updatedSections[sectionId] = {
                    name: MEDICAL_SECTIONS[sectionId],
                    results,
                    summary
                };
            }

            return { patientData: mergedPatientData, vitalSigns: mergedVitalSigns, sections: updatedSections };
        });

        // Store files
        setSectionFiles(prev => ({ ...prev, [sectionId]: [...(prev[sectionId] || []), ...files] }));

        // Mark complete
        setUploadStatus(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], status: 'complete' } }));
        setPendingUpload(null);
        setIsProcessing(false);
        toast.success(`${MEDICAL_SECTIONS[sectionId]} analizado correctamente`);
    }, [pendingUpload]);

    const handleCancelUpload = useCallback(() => {
        if (!pendingUpload) return;
        setUploadStatus(prev => ({ ...prev, [pendingUpload.sectionId]: { ...prev[pendingUpload.sectionId], status: 'pending' } }));
        setPendingUpload(null);
        setIsProcessing(false);
    }, [pendingUpload]);

    // =============================================
    // PROCEED TO FORM (populate from uploads)
    // =============================================

    const hasUploadedSections = Object.values(uploadStatus).some(s => s.status === 'complete');

    const handleProceedToForm = async () => {
        if (hasUploadedSections) {
            setIsProcessing(true);
            toast.loading('Pre-llenando historia clínica con IA...', { id: 'prefill' });
            try {
                const rawFormData = await populateClinicalHistoryForm(medicalReport);
                const merged = deepMerge(getInitialClinicalHistoryFormData(), rawFormData);
                if (empresaId) merged.datosGenerales.nombreEmpresa = empresaId;
                setFormData(merged as ClinicalHistoryFormData);
                toast.success('Historia clínica pre-llenada exitosamente', { id: 'prefill' });
            } catch (err) {
                console.error(err);
                toast.error('No se pudo pre-llenar. Puedes llenarla manualmente.', { id: 'prefill' });
            } finally {
                setIsProcessing(false);
            }
        }
        setStep('form');
    };

    // =============================================
    // FORM CHANGE HANDLER
    // =============================================

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

    // =============================================
    // AI FORM ACTIONS
    // =============================================

    const handleAnalyzeWorkRisk = async () => {
        if (!formData.riesgoLaboral.puesto) return toast.error('Escribe el puesto primero');
        const loadToast = toast.loading('Analizando riesgos del puesto...');
        try {
            const riesgos = await getRisksForJobTitle(formData.riesgoLaboral.puesto);
            setFormData(prev => ({ ...prev, riesgoLaboral: { ...prev.riesgoLaboral, riesgos } }));
            toast.success('Riesgos laborales actualizados', { id: loadToast });
        } catch { toast.error('Error analizando puesto', { id: loadToast }); }
    };

    const handleAnalyzeWorkHistory = async () => {
        if (!formData.historiaLaboral.puestoTrabajo) return toast.error('Escribe el puesto previo');
        const loadToast = toast.loading('Analizando puesto histórico...');
        try {
            const details = await getJobDetails(formData.historiaLaboral.puestoTrabajo);
            setFormData(prev => ({ ...prev, historiaLaboral: { ...prev.historiaLaboral, ...details } }));
            toast.success('Detalles del puesto completados', { id: loadToast });
        } catch { toast.error('Error analizando puesto histórico', { id: loadToast }); }
    };

    const handleGenerateDiagnoses = async () => {
        const loadToast = toast.loading('Generando diagnósticos...');
        try {
            const lista = await generateDiagnoses(medicalReport);
            setFormData(prev => ({ ...prev, diagnostico: { ...prev.diagnostico, lista } }));
            toast.success('Diagnósticos sugeridos', { id: loadToast });
        } catch { toast.error('Error', { id: loadToast }); }
    };

    const handleGenerateConcept = async () => {
        const loadToast = toast.loading('Generando concepto...');
        try {
            const conceptData = await generateConcept(medicalReport);
            const validAptitud = ["Apto con restricciones", "Apto sin restricciones", "No Apto"].includes(conceptData.aptitud)
                ? (conceptData.aptitud as any) : "";
            setFormData(prev => ({ ...prev, concepto: { ...prev.concepto, ...conceptData, aptitud: validAptitud } }));
            toast.success('Concepto sugerido', { id: loadToast });
        } catch { toast.error('Error', { id: loadToast }); }
    };

    const handleGenerateRecommendations = async () => {
        const loadToast = toast.loading('Generando recomendaciones...');
        try {
            const recs = await generateRecommendations(medicalReport);
            setFormData(prev => ({ ...prev, recomendaciones: recs }));
            toast.success('Recomendaciones generadas', { id: loadToast });
        } catch { toast.error('Error', { id: loadToast }); }
    };

    // =============================================
    // SAVE
    // =============================================

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const nombresArr = formData.datosGenerales.nombres.split(' ');
            const apellidosArr = formData.datosGenerales.apellidos.split(' ');

            let genero = 'otro';
            if (formData.datosGenerales.sexo === 'M') genero = 'masculino';
            if (formData.datosGenerales.sexo === 'F') genero = 'femenino';

            const allFiles = Object.values(sectionFiles).flat();

            await onComplete({
                paciente: {
                    nombre: nombresArr.join(' ') || 'Paciente',
                    apellido_paterno: apellidosArr[0] || 'Desconocido',
                    apellido_materno: apellidosArr.slice(1).join(' ') || '',
                    genero,
                    fecha_nacimiento: formData.datosGenerales.fechaNacimiento || null,
                    puesto: formData.riesgoLaboral.puesto,
                    empresa_id: empresaId || null,
                    tipo_sangre: '',
                    estatus: 'activo'
                },
                formData,
                report: Object.keys(medicalReport.sections).length > 0 ? medicalReport : null,
                files: allFiles,
                sectionFiles
            });
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    // =============================================
    // RENDER
    // =============================================

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-120px)] p-6 rounded-2xl relative">
            <Button variant="ghost" className="mb-4 text-slate-500" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar y Volver
            </Button>

            {/* === CONFIRMATION MODAL === */}
            {pendingUpload && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    Confirmar Extracción: {MEDICAL_SECTIONS[pendingUpload.sectionId]}
                                </h3>
                                <p className="text-sm text-slate-500">Archivo: {pendingUpload.fileNames}</p>
                            </div>
                        </div>

                        {/* Patient data preview */}
                        {pendingUpload.patientData && Object.keys(pendingUpload.patientData).length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-bold text-sm text-slate-600 mb-2">Datos del Paciente Detectados</h4>
                                <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                                    {Object.entries(pendingUpload.patientData).map(([k, v]) => v ? (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-slate-500 capitalize">{k}</span>
                                            <span className="font-medium text-slate-800">{String(v)}</span>
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {pendingUpload.summary && (
                            <div className="mb-4">
                                <h4 className="font-bold text-sm text-slate-600 mb-2">Resumen Clínico</h4>
                                <p className="text-sm text-slate-700 bg-blue-50 rounded-xl p-4 leading-relaxed">{pendingUpload.summary}</p>
                            </div>
                        )}

                        {/* Results count */}
                        <div className="mb-6">
                            <Badge variant="secondary" className="text-xs">
                                {pendingUpload.results?.length || 0} resultados extraídos
                            </Badge>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={handleCancelUpload}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Omitir
                            </Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                onClick={handleConfirmUpload}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Confirmar y Agregar
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* === STEP 1: METHOD SELECT === */}
                {step === 'method-select' && (
                    <motion.div
                        key="method-select"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="max-w-4xl mx-auto mt-16"
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
                                    Sube documentos médicos por categoría (Labs, Audio, Espiro, ECG, RX, Opto). La IA extraerá los datos y pre-llenará la historia clínica.
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
                                    Captura directa de la entrevista clínica con asistente IA para autocompletar riesgos laborales y proponer diagnósticos.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* === STEP 2: UPLOAD BY SECTION (like the new app) === */}
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                                Subida de Documentos por Sección
                            </h2>
                            <p className="text-slate-500">
                                Sube archivos para cada tipo de estudio. Cada uno se analizará con IA y podrás confirmar los datos antes de agregar al expediente.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {SECTION_CARDS.map(section => {
                                const status = uploadStatus[section.id];
                                const isComplete = status.status === 'complete';
                                const isProcessingThis = status.status === 'processing';
                                const isError = status.status === 'error';

                                return (
                                    <Card
                                        key={section.id}
                                        className={`relative overflow-hidden transition-all border-2 ${isComplete ? 'border-emerald-300 bg-emerald-50/50' :
                                                isError ? 'border-red-300 bg-red-50/50' :
                                                    isProcessingThis ? 'border-blue-300 bg-blue-50/50 animate-pulse' :
                                                        'border-slate-200 hover:border-slate-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${section.color}`} />
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-xl">{section.icon}</span>
                                                    {section.label}
                                                </span>
                                                {isComplete && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                                {isProcessingThis && <Activity className="w-5 h-5 text-blue-500 animate-spin" />}
                                                {isError && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isComplete ? (
                                                <div className="text-xs text-emerald-700">
                                                    <p className="font-medium">✓ {status.fileName}</p>
                                                    <button
                                                        onClick={() => {
                                                            setUploadStatus(prev => ({ ...prev, [section.id]: { status: 'pending' } }));
                                                            setSectionFiles(prev => { const n = { ...prev }; delete n[section.id]; return n; });
                                                            setMedicalReport(prev => {
                                                                const s = { ...prev.sections };
                                                                delete s[section.id];
                                                                return { ...prev, sections: s };
                                                            });
                                                        }}
                                                        className="text-red-500 text-[10px] mt-1 underline hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3 h-3 inline mr-1" />Quitar
                                                    </button>
                                                </div>
                                            ) : isProcessingThis ? (
                                                <p className="text-xs text-blue-600">Analizando con Gemini 2.0...</p>
                                            ) : (
                                                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                                                    <FileUp className="w-4 h-4" />
                                                    <span>Subir archivo</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept=".pdf,image/*"
                                                        className="hidden"
                                                        disabled={isProcessing}
                                                        onChange={(e) => {
                                                            if (e.target.files?.length) {
                                                                handleSectionFileUpload(Array.from(e.target.files), section.id);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Action bar */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
                            <div className="text-sm text-slate-500">
                                {Object.values(uploadStatus).filter(s => s.status === 'complete').length} de {SECTION_CARDS.length} secciones cargadas
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setStep('method-select')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                                    onClick={handleProceedToForm}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                    {hasUploadedSections ? 'Continuar al Formulario' : 'Ir al Formulario Manual'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* === STEP 3: CLINICAL FORM === */}
                {step === 'form' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-center mb-8 border-b pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Historia Clínica Ocupacional</h2>
                                <p className="text-slate-500">
                                    {hasUploadedSections
                                        ? 'Los datos fueron pre-llenados por IA. Revisa y completa los campos faltantes.'
                                        : 'Por favor, llena los campos del formulario.'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setStep(hasUploadedSections ? 'upload' : 'method-select')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                                </Button>
                                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold" disabled={isSaving} onClick={handleSave}>
                                    {isSaving ? <Activity className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                    Guardar Expediente
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <Section1_GeneralData data={formData} handleChange={handleChange} onRepopulate={() => { }} isUpdating={false} />
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
